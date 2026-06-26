import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Calendar, ChevronDown, ChevronUp, Loader2, Maximize2, ExternalLink } from 'lucide-react';

const NasaApod = () => {
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
    setLoading(true);
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`)
      .then((res) => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then((data) => {
        setApodData(data);
        setError(false);
      })
      .catch((err) => {
        console.error('Failed to fetch NASA APOD:', err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5 font-mono animate-pulse flex flex-col justify-center items-center h-[180px]">
        <Loader2 className="animate-spin text-accent mb-2" size={24} />
        <span className="text-[10px] text-text-muted uppercase tracking-widest">Connecting to NASA telemetry...</span>
      </div>
    );
  }

  if (error || !apodData) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 font-mono text-center flex flex-col justify-center items-center h-[180px]">
        <span className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">NASA Uplink Failure</span>
        <span className="text-[10px] text-text-muted">Could not retrieve deep space imagery. Using backup feeds.</span>
        <div className="mt-3 w-full h-[70px] rounded-lg overflow-hidden border border-white/5 relative">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop" 
            alt="Backup nebula feed"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <span className="absolute bottom-1 left-2 text-[8px] text-accent/80 font-bold">Nebula Telemetry (Local Cache)</span>
        </div>
      </div>
    );
  }

  const isVideo = apodData.media_type === 'video';

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-secondary/20 p-4 font-mono flex flex-col justify-between gap-3 backdrop-blur-sm">
        {/* Header HUD */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/75 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
            </span>
            <span className="tracking-widest uppercase text-accent font-bold text-[9px]">
              NASA Deep Space Feed
            </span>
          </div>
          <span className="text-[9px] text-text-muted flex items-center gap-1">
            <Calendar size={10} />
            {apodData.date}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex gap-3 items-start">
          {/* Thumbnail Image/Video Frame */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-primary/80 group">
            {isVideo ? (
              <div className="w-full h-full flex flex-col justify-center items-center bg-black/60 text-center p-1">
                <span className="text-[8px] text-accent font-bold uppercase tracking-wider">Video Feed</span>
                <a 
                  href={apodData.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-1.5 p-1 rounded-full bg-accent/20 text-accent hover:bg-accent hover:text-primary transition-colors"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            ) : (
              <>
                <img 
                  src={apodData.url} 
                  alt={apodData.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => setShowLightbox(true)}
                />
                <button
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  className="absolute bottom-1 right-1 p-1 rounded bg-black/60 text-text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Expand image"
                >
                  <Maximize2 size={10} />
                </button>
              </>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-grow flex flex-col justify-between h-20 sm:h-24">
            <div>
              <h4 className="text-xs font-bold text-text truncate leading-snug" title={apodData.title}>
                {apodData.title}
              </h4>
              {apodData.copyright && (
                <p className="text-[8px] sm:text-[9px] text-text-muted mt-0.5 truncate">
                  © {apodData.copyright.replace(/\n/g, ' ')}
                </p>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-accent hover:underline self-start mt-2"
            >
              <Info size={11} />
              {showExplanation ? 'Hide Details' : 'Read Explanation'}
              {showExplanation ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          </div>
        </div>

        {/* Collapsible Explanation Area */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-white/5 pt-2"
            >
              <p className="text-[9px] sm:text-[10px] text-text-muted leading-relaxed max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                {apodData.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showLightbox && !isVideo && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLightbox(false)}
              className="absolute inset-0 bg-primary/95 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 bg-secondary shadow-2xl z-10 flex flex-col"
            >
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <a
                  href={apodData.hdurl || apodData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-black/60 p-2 text-text-muted hover:text-accent hover:bg-black/80 transition-colors"
                  title="View full resolution"
                >
                  <ExternalLink size={18} />
                </a>
                <button
                  type="button"
                  onClick={() => setShowLightbox(false)}
                  className="rounded-full bg-black/60 p-2 text-text-muted hover:text-accent hover:bg-black/80 transition-colors"
                  title="Close lightbox"
                >
                  <Maximize2 size={18} className="rotate-45" />
                </button>
              </div>

              <div className="overflow-auto max-h-[70vh] flex items-center justify-center p-2 bg-black/40">
                <img
                  src={apodData.hdurl || apodData.url}
                  alt={apodData.title}
                  className="max-w-full max-h-[65vh] object-contain rounded-lg"
                />
              </div>
              
              <div className="p-4 bg-secondary font-mono border-t border-white/5">
                <span className="text-[8px] text-accent uppercase tracking-widest font-bold">NASA APOD HD Feed</span>
                <h3 className="text-sm font-bold text-text mt-0.5">{apodData.title}</h3>
                {apodData.copyright && (
                  <p className="text-[9px] text-text-muted mt-0.5">© {apodData.copyright}</p>
                )}
              </div>
            </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default NasaApod;
