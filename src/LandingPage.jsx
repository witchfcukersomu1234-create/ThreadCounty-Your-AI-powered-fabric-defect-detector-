import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, PlayCircle, Gauge, Shield, Scan, FlaskConical, Palette, Layers, Leaf } from 'lucide-react';

export default function LandingPage() {
  const canvasRef = useRef(null);
  const introRef = useRef(null);
  const content1Ref = useRef(null);
  const content2Ref = useRef(null);
  const scrollContainerRef = useRef(null);
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const introOverlay = introRef.current;
    const content1 = content1Ref.current;
    const content2 = content2Ref.current;
    const scrollContainer = scrollContainerRef.current;

    const frameCount = 270;
    const currentFrame = (index) =>
      `/ezgif-46d80a0a687df8f2-jpg/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

    const images = [];
    let stateFrame = 1;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    function drawImageCover(img) {
      if (!img.complete) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    images[0].onload = () => {
      drawImageCover(images[0]);
    };

    const handleResize = () => {
      if (images[stateFrame - 1]) drawImageCover(images[stateFrame - 1]);
    };
    window.addEventListener('resize', handleResize);

    const handleScroll = () => {
      if (!scrollContainer) return;
      const containerRect = scrollContainer.getBoundingClientRect();

      let scrollDistance = -containerRect.top;
      let maxScroll = containerRect.height - window.innerHeight;

      if (scrollDistance < 0) scrollDistance = 0;
      if (scrollDistance > maxScroll) scrollDistance = maxScroll;

      let scrollFraction = 0;
      if (maxScroll > 0) {
        scrollFraction = scrollDistance / maxScroll;
      }

      const frameIndex = Math.min(
        frameCount - 1,
        Math.max(0, Math.floor(scrollFraction * frameCount))
      );

      if (stateFrame !== frameIndex + 1) {
        stateFrame = frameIndex + 1;
        setFrame(stateFrame);
        requestAnimationFrame(() => {
          if (images[frameIndex] && images[frameIndex].complete) {
            drawImageCover(images[frameIndex]);
          }
        });
      }

      const percentage = scrollFraction * 100;

      if (introOverlay) {
        if (percentage > 5) {
          introOverlay.style.opacity = '0';
          introOverlay.style.pointerEvents = 'none';
        } else {
          introOverlay.style.opacity = '1';
          introOverlay.style.pointerEvents = 'auto';
        }
      }

      if (content1) {
        if (percentage > 25 && percentage < 55) {
          content1.style.opacity = '1';
        } else {
          content1.style.opacity = '0';
        }
      }

      if (content2) {
        if (percentage > 65 && percentage < 95) {
          content2.style.opacity = '1';
        } else {
          content2.style.opacity = '0';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-xl border-b border-steel-border bg-frosted-glass shadow-2xl shadow-ambient-glow">
        <div className="flex justify-between items-center h-20 px-gutter max-w-container-max mx-auto">
          <Link to="/" className="font-headline-lg text-headline-lg font-bold tracking-tighter text-on-surface" aria-label="ThreadCounty Home">
            THREADCOUNTY
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-primary border-b-2 border-primary font-bold pb-1 font-label-sm text-label-sm">Home</Link>
            <Link to="/pricing" className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-sm text-label-sm">Pricing</Link>
            <Link to="/contact" className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-sm text-label-sm">Contact</Link>
            <Link to="/upload" className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-sm text-label-sm">Analyze</Link>
            <Link to="/history" className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-sm text-label-sm">History</Link>
            <Link to="/admin" className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-sm text-label-sm">Admin</Link>
          </div>
          <div className="flex items-center space-x-4">
            <button aria-label="Change Language" className="hover:bg-white/5 hover:backdrop-blur-2xl transition-all duration-300 p-2 rounded-full scale-95 active:scale-90 text-primary">
              <Globe size={24} />
            </button>
            <Link to="/upload" className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-sm text-label-sm font-semibold hover:opacity-90 transition-opacity text-center">
              Start Scan
            </Link>
          </div>
        </div>
      </nav>

      <main className="pb-32">
        {/* Hero Section (Scrolling Animation) */}
        <section className="scroll-container" ref={scrollContainerRef}>
          <div className="sticky-container">
            <canvas id="textile-canvas" ref={canvasRef}></canvas>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background z-10 pointer-events-none"></div>

            <div className="intro-overlay px-gutter" ref={introRef}>
              <div className="inline-flex items-center space-x-2 bg-surface-container/50 border border-steel-border rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_10px_#00dce5]"></span>
                <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest">ThreadCounty AI Platform</span>
              </div>
              <h1 className="font-display-lg text-display-lg mb-6 max-w-4xl mx-auto leading-tight text-center">
                Engineered Precision.<br />
                <span className="text-gradient">Artificial Intelligence.</span>
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto mb-10 text-xl leading-relaxed text-center">
                Scroll to explore the world's most advanced fabric intelligence platform. Real-time neural analysis meets ultra-high-speed industrial weaving.
              </p>
              <div className="flex items-center justify-center space-x-6">
                <Link to="/upload" className="bg-gradient-to-r from-primary-container to-primary text-on-primary px-8 py-4 rounded-2xl font-label-sm text-label-sm font-bold tracking-wide shadow-lg shadow-ambient-glow hover:opacity-90 transition-all border-t border-white/20">
                  Explore Platform
                </Link>
                <button aria-label="Watch Demo" className="glass-panel text-on-surface px-8 py-4 rounded-2xl font-label-sm text-label-sm font-bold tracking-wide hover:bg-white/5 transition-all flex items-center space-x-2">
                  <PlayCircle size={20} />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

            <div className="content-overlay" id="content1" ref={content1Ref}>
              <h2 className="font-headline-lg text-headline-lg mb-4 text-primary">Exquisite Craftsmanship</h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-lg">Every thread tells a story of quality and dedication.</p>
            </div>
            <div className="content-overlay" id="content2" ref={content2Ref}>
              <h2 className="font-headline-lg text-headline-lg mb-4 text-tertiary">Unparalleled Comfort</h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-lg">Experience the touch of luxury in every inch.</p>
            </div>
          </div>
        </section>

        {/* Neural Fabric Analysis Section */}
        <section className="max-w-container-max mx-auto px-gutter py-24 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="font-headline-lg text-headline-lg">Neural Fabric Analysis</h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-lg">
                Our proprietary computer vision models scan every millimeter of fabric in real-time, instantly identifying defects, material composition, and thread density with superhuman accuracy.
              </p>
              <div className="space-y-4">
                <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border border-steel-border">
                    <Gauge className="text-tertiary" />
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">DETECTION SPEED</div>
                    <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">0.4 Milliseconds</div>
                  </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border border-steel-border">
                    <Shield className="text-primary" />
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">PRECISION ACCURACY</div>
                    <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">99.98%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Scanning Visualization */}
            <div className="relative w-full h-[600px] rounded-[32px] overflow-hidden glass-panel border border-steel-border shadow-2xl shadow-ambient-glow group">
              <div
                className="absolute inset-0 bg-cover bg-center w-full h-full opacity-60"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQwPy5zWpP9olm3EYjrCshHiHBGKSwNIKvHxnVoyhzPtaCQ3Aj5dpYpNKJsO6xWfRoO6NgqNPawuxiZKA_0D1c8_Ha-sbbI3Bu0suSIOYH3jXsJqO13Jf_SZ21p4Cd6JyH8yaqUHJa7NHdC-VmgO_wj-f4bFlVlAw5VzLPa1EEE0HpCSir9Lgb3B96wegYae_48j7T9bJKWdyMb1Y172uBdS6ubw0MtMHRlU3f1yzlkgLVKfh472F7KfomNamAPYav6Y5NBLU8vbU')"
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/80 z-10"></div>
              <div className="absolute top-0 left-0 w-full h-1 scanner-line z-20"></div>

              <div className="absolute inset-0 z-30 p-8 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-center">
                  <div className="bg-surface-container/80 backdrop-blur-md px-4 py-2 rounded-lg border border-steel-border flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                    <span className="font-label-sm text-label-sm text-on-surface">Live Feed Active</span>
                  </div>
                  <div className="font-label-sm text-label-sm text-tertiary">FRAME: 49201.X</div>
                </div>

                <div className="relative w-64 h-64 mx-auto border-2 border-tertiary/50 bg-tertiary/5 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:border-tertiary group-hover:bg-tertiary/10">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-tertiary"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-tertiary"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-tertiary"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-tertiary"></div>
                  <Scan className="text-tertiary opacity-50 text-4xl" size={48} />
                </div>

                <div className="bg-surface-container-highest/90 backdrop-blur-xl p-6 rounded-2xl border border-steel-border grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">MATERIAL</div>
                    <div className="font-body-md text-body-md text-on-surface font-semibold text-[#D84D8A]">Tech Silk Blend</div>
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">DENSITY</div>
                    <div className="font-body-md text-body-md text-on-surface font-semibold">400 TC</div>
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">DEFECT PROB.</div>
                    <div className="font-body-md text-body-md text-tertiary font-semibold">0.02%</div>
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">MICRON COUNT</div>
                    <div className="font-body-md text-body-md text-on-surface font-semibold">14.5 µm</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 glass-panel p-6 rounded-2xl border border-steel-border flex flex-wrap gap-6 items-center justify-between">
            <div className="flex items-center space-x-3">
              <FlaskConical className="text-[#D84D8A]" />
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">TENSILE STRENGTH (ISO 13934)</div>
                <div className="font-body-md text-on-surface font-semibold">850 N/5cm</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Palette className="text-tertiary" />
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">COLOR FASTNESS</div>
                <div className="font-body-md text-on-surface font-semibold">Grade 4-5 (ISO 105)</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Layers className="text-primary" />
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">YARN STRUCTURE</div>
                <div className="font-body-md text-on-surface font-semibold">Multifilament Core</div>
              </div>
            </div>
          </div>
        </section>

        {/* Fabric Type Detection Grid */}
        <section className="max-w-container-max mx-auto px-gutter py-24 bg-surface-container-lowest/50 backdrop-blur-md rounded-3xl mb-24">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg mb-4">Autonomous Categorization</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Instantaneous classification of complex material blends utilizing deeply trained neural networks.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 'TX-902A', name: 'Synthetic Tech', conf: '98.5%', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6W6OHSI65AhO2O5QjDlzMxPsIiwgOBYbuUvceh78jzjFKewENdJrDOKxReXZnkPoPjyXIbxOoCXGWsLN0sMbSMVwnty2RfZsCIr9O1F66b31ezneQ4_V0EKWQkZGSz_RFNKpZ6CAcME4D73Z4qBrQ4XYLoFczcGWNONDvWMQJ2kP9I8pgjTLMiYICo_rMljeFAOKy6zAWTaR6o1PBqnBda-9hPPi1_kDZkJaJ2Lo_-fZKYUf7GMDGEAugc3PXgMGZpXE4rAxlK3w', color: 'from-tertiary/50 to-tertiary', text: 'text-tertiary' },
              { id: 'CT-400X', name: 'Premium Cotton', conf: '96.2%', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-pWeeXybR5MfXb8MW4fMKYjMwgNK7EvzmaugcCgT65ZoEjbsD-rDmQ_IwmAknDX8EVjUjfCxoAfNDnOixk9G-Gm09HoqpKYt1DWOQ7u6AZfg2AVfTNNQ2RN0L3FxfjlHeNBBTsGi4S-MMMEN7rCmJA68EyHE0ttx0VBaKYD694BRWlXQ1GaV0RhNbZ5we670qYW1kXyfU8XpawEYQm2wsXLfwE6D-qbN5dLVLQshihjJsftvPAPjyVa-VNzBIDfFo1omWDRUW-kU', color: 'from-primary/50 to-primary', text: 'text-primary' },
              { id: 'IT-101B', name: 'Industrial Twill', conf: '99.1%', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg0xHb9zGUQT6XxFTww1o54PkksduIRcJB6HDEGMiVS3hYJYBNdfjScIwyIO_SFWXwl14Xi6_hVturRmmUwpoktJzlSKRh6ljvT7SsUnCOYbeU1ZPCZY__ZjRC40JaqOA_-FkJMsU-Me7ZNTVh0cn7N8WE1_p30ypQmV67rLcgXsANjMgOKRYCJB9ghyd0Fk1MbYvvXYP9qnTeMDoLRBqEJs34yDZwiXRKf68ggjkI4egywfmRvg0WvrwkGjCWqCviWvgHdNFrHTU', color: 'from-tertiary/50 to-tertiary', text: 'text-tertiary' },
              { id: 'EB-304C', name: 'Eco-Blends', conf: '97.4%', icon: Leaf, color: 'from-[#D84D8A]/50 to-[#D84D8A]', text: 'text-[#D84D8A]' },
            ].map((item, i) => (
              <div key={i} className="glass-panel rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="h-48 relative overflow-hidden">
                  {item.img ? (
                    <img src={item.img} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <item.icon className="text-4xl text-on-surface-variant" size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{item.name}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">ID: {item.id}</div>
                    </div>
                    <div className="bg-surface-container px-3 py-1 rounded-full border border-steel-border">
                      <span className={`font-label-sm text-label-sm ${item.text}`}>{item.conf} Conf</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div className={`bg-gradient-to-r ${item.color} h-full rounded-full`} style={{ width: item.conf }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The ThreadCounty Process Section */}
        <section className="max-w-container-max mx-auto px-gutter py-24">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg mb-4">The ThreadCounty Process</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">From raw material to intelligent textile, engineered at every step.</p>
          </div>
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-steel-border -translate-y-1/2 hidden md:block"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: 1, title: 'Sourcing', desc: 'Ethical procurement of premium raw fibers.', color: 'text-[#D84D8A]', border: 'border-[#D84D8A]/50', bg: 'bg-[#D84D8A]/20' },
                { step: 2, title: 'Spinning', desc: 'Precision yarn creation with exact specifications.', color: 'text-tertiary', border: 'border-tertiary/50', bg: 'bg-tertiary/20' },
                { step: 3, title: 'Weaving', desc: 'High-speed air-jet looms driven by AI.', color: 'text-primary', border: 'border-primary/50', bg: 'bg-primary/20' },
                { step: 4, title: 'Finishing', desc: 'Advanced dyeing & quality treatments.', color: 'text-secondary', border: 'border-secondary/50', bg: 'bg-secondary/20' },
              ].map((item, i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl text-center bg-surface/80">
                  <div className={`w-12 h-12 rounded-full ${item.bg} border ${item.border} flex items-center justify-center mx-auto mb-4 ${item.color} font-headline-lg-mobile font-bold`}>{item.step}</div>
                  <h3 className="font-headline-lg-mobile text-xl text-on-surface mb-2">{item.title}</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full rounded-t-xl border-t border-steel-border shadow-[0_-10px_30px_rgba(0,0,0,0.5)] mt-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-stack-lg px-gutter py-stack-lg max-w-container-max mx-auto">
          <div className="col-span-1 md:col-span-2">
            <div className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-surface mb-4">THREADCOUNTY</div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-6">Pioneering the intersection of artificial intelligence and industrial fabric manufacturing.</p>
            <div className="font-label-sm text-label-sm text-on-surface-variant">© 2024 THREADCOUNTY. ENGINEERED PRECISION.</div>
          </div>
          <div className="flex flex-col space-y-4">
            <Link to="#" className="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-colors opacity-80 hover:opacity-100">Privacy Policy</Link>
            <Link to="#" className="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-colors opacity-80 hover:opacity-100">Terms of Service</Link>
            <Link to="#" className="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-colors opacity-80 hover:opacity-100">Sustainability Report</Link>
          </div>
          <div className="flex flex-col space-y-4">
            <Link to="#" className="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-colors opacity-80 hover:opacity-100">Technical Specs</Link>
            <Link to="#" className="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-colors opacity-80 hover:opacity-100">Global Logistics</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
