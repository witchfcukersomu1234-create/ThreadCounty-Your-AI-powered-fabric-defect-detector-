import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, Search, Scan } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { uploadFabricImage } from './services/storageService';
import { saveScan } from './services/scanService';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { addToast } = useToast();

  const validateAndSetFile = (nextFile) => {
    if (!nextFile) return;

    if (!nextFile.type?.startsWith('image/')) {
      addToast('Please upload a valid image file.', 'error');
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      addToast('Image size must be 10MB or less.', 'error');
      return;
    }

    setFile(nextFile);
  };

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    if (!user || !token) {
      addToast('Your session has expired. Please log in again.', 'error');
      return;
    }

    setIsScanning(true);
    setUploadProgress(0);
    let progressInterval;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60000);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      progressInterval = window.setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            window.clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const uploadedImage = await uploadFabricImage(file, user.id);

      const response = await fetch(`${API_BASE_URL}/api/analyze/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        signal: controller.signal,
      });

      window.clearInterval(progressInterval);
      window.clearTimeout(timeoutId);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.detail || 'Analysis failed. Please try again.');
      }

      const result = await response.json();
      
      setIsScanning(false);
      setUploadProgress(0);
      
      if (result.status === 'success') {
        const detections = Array.isArray(result.detections) ? result.detections : [];
        const totalDefects = detections.length;
        const confidence = totalDefects > 0 ? (detections[0]?.confidence ?? 1) : 1;
        const processingTime = result.processing_time ?? result.inference_time ?? 0;
        const aiSummary = typeof result.ai_summary === 'string' ? result.ai_summary.trim() : '';

        if (!aiSummary) {
          throw new Error('Analysis completed without an AI summary.');
        }

        const scanPayload = {
          user_id: user.id,
          image_url: uploadedImage.image_url,
          detections,
          total_defects: totalDefects,
          processing_time: processingTime,
          confidence,
          ai_summary: aiSummary,
        };

        const savedScan = await saveScan(scanPayload);

        setScanResult({
          id: savedScan.id,
          material: 'Unknown',
          density: 'N/A',
          defect_prob: totalDefects > 0 ? 'High' : 'Low',
          micron_count: 'N/A',
          confidence: `${Math.round(confidence * 100)}%`,
          gemini_summary: aiSummary,
          image_url: uploadedImage.image_url,
          detections,
        });

        addToast(
          totalDefects > 0
            ? `Analysis complete: ${totalDefects} defect(s) detected`
            : (result.message || 'No visible defects detected'),
          'success'
        );
        navigate('/history');
      } else {
        throw new Error(result.message || 'Analysis failed');
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      setIsScanning(false);
      setUploadProgress(0);
      window.clearInterval(progressInterval);
      window.clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        addToast('Analysis timed out. Please try again.', 'error');
        return;
      }
      addToast(error.message || 'Analysis failed. Please try again.', 'error');
    }
  };

  const downloadReport = async () => {
    if (!scanResult) return;
    try {
      const res = await fetch(`/api/reports/${scanResult.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert("PDF Generation triggered successfully.");
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-gutter py-12">
      <div className="max-w-3xl w-full">
        <h1 className="font-headline-lg text-headline-lg mb-4 text-center">AI Fabric Analysis</h1>
        <p className="text-on-surface-variant text-center mb-10">Upload a macro or high-resolution image of your fabric to instantly categorize material and detect structural defects.</p>

        {!file && !isScanning && !scanResult && (
          <div 
            className={`glass-panel border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center transition-all ${dragActive ? 'border-tertiary bg-tertiary/10' : 'border-steel-border hover:border-primary/50 hover:bg-white/5'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleChange} />
            <UploadCloud size={64} className="text-on-surface-variant mb-6" />
            <div className="font-headline-lg-mobile text-xl mb-2">Drag and drop your fabric image</div>
            <div className="text-on-surface-variant mb-8 text-sm">PNG, JPG, WEBP up to 10MB</div>
            <label htmlFor="file-upload" className="cursor-pointer bg-surface-container px-8 py-3 rounded-full border border-steel-border font-label-sm font-semibold hover:bg-white/10 transition-colors">
              Browse Files
            </label>
          </div>
        )}

        {file && !isScanning && !scanResult && (
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center">
            <CheckCircle size={48} className="text-tertiary mb-4" />
            <div className="font-headline-lg-mobile text-xl mb-2">{file.name}</div>
            <div className="text-on-surface-variant mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            
            <div className="flex space-x-4">
              <button onClick={() => setFile(null)} className="px-6 py-2 rounded-full border border-steel-border font-label-sm hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={handleScan} className="bg-primary-container text-on-primary-container px-8 py-2 rounded-full font-label-sm font-semibold hover:opacity-90 flex items-center space-x-2">
                <Search size={18} />
                <span>Initiate AI Scan</span>
              </button>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="relative w-full h-[500px] rounded-[32px] overflow-hidden glass-panel border border-steel-border shadow-2xl shadow-ambient-glow group">
            <div className="absolute inset-0 bg-cover bg-center w-full h-full opacity-60" style={{ backgroundImage: `url(${previewUrl})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/80 z-10"></div>
            <div className="absolute top-0 left-0 w-full h-1 scanner-line z-20"></div>

            <div className="absolute inset-0 z-30 p-8 flex flex-col justify-between items-center pointer-events-none">
              <div className="bg-surface-container/80 backdrop-blur-md px-4 py-2 rounded-lg border border-steel-border flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="font-label-sm text-label-sm text-on-surface">Neural Engine Scanning...</span>
              </div>
              
              <div className="relative w-64 h-64 border-2 border-tertiary/50 bg-tertiary/5 rounded-xl flex items-center justify-center animate-pulse">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-tertiary"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-tertiary"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-tertiary"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-tertiary"></div>
                <Scan className="text-tertiary opacity-50 text-4xl" size={48} />
              </div>
              
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-label-sm text-tertiary">Uploading</span>
                  <span className="font-label-sm text-tertiary">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div 
                    className="bg-tertiary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="glass-panel p-8 rounded-3xl border-tertiary/30 border">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-steel-border">
                <img src={scanResult.image_url} className="w-full h-full object-cover" alt="Uploaded Fabric" />
              </div>
              <div>
                <h2 className="font-headline-lg-mobile text-2xl text-tertiary mb-1">Analysis Complete</h2>
                <div className="font-label-sm text-on-surface-variant">Confidence Score: {scanResult.confidence}</div>
              </div>
            </div>
            
            {scanResult.gemini_summary && (
              <div className="mb-8 bg-surface-container p-4 rounded-xl border border-steel-border">
                <h3 className="font-label-sm mb-2 text-primary">AI Insights</h3>
                <p className="text-sm text-on-surface-variant">{scanResult.gemini_summary}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-surface-container/50 p-4 rounded-xl border border-steel-border">
                <div className="font-label-sm text-on-surface-variant mb-1">MATERIAL</div>
                <div className="font-body-md font-semibold text-[#D84D8A]">{scanResult.material}</div>
              </div>
              <div className="bg-surface-container/50 p-4 rounded-xl border border-steel-border">
                <div className="font-label-sm text-on-surface-variant mb-1">DENSITY</div>
                <div className="font-body-md font-semibold">{scanResult.density}</div>
              </div>
              <div className="bg-surface-container/50 p-4 rounded-xl border border-steel-border">
                <div className="font-label-sm text-on-surface-variant mb-1">DEFECT PROB.</div>
                <div className="font-body-md font-semibold text-tertiary">{scanResult.defect_prob}</div>
              </div>
              <div className="bg-surface-container/50 p-4 rounded-xl border border-steel-border">
                <div className="font-label-sm text-on-surface-variant mb-1">MICRON COUNT</div>
                <div className="font-body-md font-semibold">{scanResult.micron_count}</div>
              </div>
            </div>

            <div className="flex space-x-4 flex-wrap gap-y-4">
              <button onClick={() => { setFile(null); setScanResult(null); }} className="px-6 py-2 rounded-full border border-steel-border font-label-sm hover:bg-white/10 transition-colors">Scan Another</button>
              <button onClick={() => navigate('/history')} className="bg-primary/20 text-primary border border-primary/50 px-6 py-2 rounded-full font-label-sm font-semibold hover:bg-primary/30 transition-colors">
                View History
              </button>
              <button onClick={downloadReport} className="bg-secondary/20 text-secondary border border-secondary/50 px-6 py-2 rounded-full font-label-sm font-semibold hover:bg-secondary/30 transition-colors">
                Download PDF Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
