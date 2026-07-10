import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';

const DemoGallery = ({ screenshots = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!screenshots || screenshots.length === 0) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {screenshots.map((media, idx) => {
          const isVideo = media.url?.match(/\.(mp4|webm)$/i);
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-secondary/30 aspect-video hover:border-accent/40 transition-all"
              onClick={() => setSelectedImage(media)}
            >
              {isVideo ? (
                <>
                  <video src={media.url} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop playsInline />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                     <div className="p-3 rounded-full bg-accent/20 backdrop-blur-md text-accent">
                        <Play size={24} fill="currentColor" />
                     </div>
                  </div>
                </>
              ) : (
                <img src={media.url} alt={media.alt || media.caption || 'Demo screen'} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" loading="lazy" />
              )}
              {media.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-medium text-white">{media.caption}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm cursor-zoom-out"
          >
            <button className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-accent transition-colors z-10">
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl max-h-[90vh] w-full flex flex-col items-center cursor-default"
            >
              {selectedImage.url?.match(/\.(mp4|webm)$/i) ? (
                 <video src={selectedImage.url} autoPlay controls className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border border-white/10" />
              ) : (
                <img src={selectedImage.url} alt={selectedImage.alt} className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10" />
              )}
              {selectedImage.caption && (
                <p className="mt-4 text-text-muted text-center text-sm">{selectedImage.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DemoGallery;
