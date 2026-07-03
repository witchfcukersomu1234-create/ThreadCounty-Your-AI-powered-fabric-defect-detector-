import React, { useEffect, useState } from 'react';
import { History, Activity, Trash2, Download } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { deleteScan, getScanHistory } from './services/historyService';
import { generateInspectionPDF } from './utils/pdfGenerator';

export default function HistoryPage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  const formatDate = (value) => {
    if (!value) return 'Unknown';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
  };

  useEffect(() => {
    async function fetchHistory() {
      if (!user?.id) {
        setUploads([]);
        setLoading(false);
        return;
      }

      try {
        const data = await getScanHistory(user.id);
        setUploads(data);
      } catch (err) {
        console.error(err);
        addToast(err.message || 'Failed to load scan history', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [addToast, user?.id]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scan?")) return;
    try {
      await deleteScan(id, user.id);
      setUploads((currentUploads) => currentUploads.filter((upload) => upload.id !== id));
      addToast('Scan deleted successfully', 'success');
    } catch(err) {
      console.error(err);
      addToast(err.message || 'Failed to delete scan', 'error');
    }
  };

  const formatConfidence = (value) => {
    if (typeof value !== 'number') return '0%';
    return `${Math.round(value * 100)}%`;
  };

  const handleDownload = async (item) => {
    try {
      await generateInspectionPDF(item);
    } catch(err) {
      console.error(err);
      addToast('Failed to generate PDF report', 'error');
    }
  };

  return (
    <div className="flex-1 px-gutter py-12 max-w-container-max mx-auto w-full">
      <div className="flex items-center space-x-4 mb-10">
        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
          <History className="text-primary" />
        </div>
        <div>
          <h1 className="font-headline-lg text-3xl">Scan History</h1>
          <p className="text-on-surface-variant font-label-sm">Your past fabric analysis results</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Activity className="animate-spin text-tertiary" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {uploads.length === 0 && (
            <div className="col-span-full text-center text-on-surface-variant py-12">
              No scans found.
            </div>
          )}
          {uploads.map((item) => {
            return (
              <div key={item.id} className="glass-panel rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                <div className="h-48 relative overflow-hidden border-b border-steel-border">
                  <img
                    src={item.image_url}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    alt="Fabric"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '/favicon.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDownload(item)} className="bg-surface-container/80 p-2 rounded-full hover:bg-secondary/20 text-secondary transition-colors" title="Download PDF">
                      <Download size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="bg-surface-container/80 p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-headline-lg-mobile text-xl text-on-surface">Fabric Scan</div>
                      <div className="font-label-sm text-on-surface-variant mt-1 text-xs truncate max-w-[150px]">ID: {item.id}</div>
                    </div>
                    <div className="bg-surface-container px-3 py-1 rounded-full border border-steel-border">
                      <span className="font-label-sm text-tertiary">{formatConfidence(item.confidence)} Conf</span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-auto text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Total defects:</span>
                      <span className="font-semibold text-on-surface">{item.total_defects ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Processing time:</span>
                      <span className="font-semibold text-[#D84D8A]">{item.processing_time ?? 0}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Date:</span>
                      <span className="font-semibold text-on-surface">{formatDate(item.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">AI Summary:</span>
                      <p className="font-semibold text-on-surface mt-1">{item.ai_summary || 'No summary available'}</p>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">Detections:</span>
                      <div className="font-semibold text-on-surface mt-1">
                        {Array.isArray(item.detections) && item.detections.length > 0 ? (
                          item.detections.map((detection, index) => (
                            <div key={`${item.id}-detection-${index}`}>
                              {detection.class || 'Unknown'} ({formatConfidence(detection.confidence ?? 0)})
                            </div>
                          ))
                        ) : (
                          <div>No defects detected.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
