import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, ImageIcon } from 'lucide-react';

// Helper to center crop the image
const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
};

export default function ImageCropperModal({ imageFile, onCropComplete, onCancel, aspect = null }) {
  const [currentAspect, setCurrentAspect] = useState(aspect);
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCurrentAspect(aspect);
  }, [aspect]);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    if (currentAspect) {
      setCrop(centerAspectCrop(width, height, currentAspect));
    } else {
      setCrop({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
      });
    }
  };

  const handleAspectChange = (newAspect) => {
    setCurrentAspect(newAspect);
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    if (newAspect) {
      const nextCrop = centerAspectCrop(width, height, newAspect);
      setCrop(nextCrop);
      setCompletedCrop(nextCrop);
    } else {
      const nextCrop = {
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
      };
      setCrop(nextCrop);
      setCompletedCrop(nextCrop);
    }
  };

  const handleComplete = async () => {
    if (!completedCrop || !imgRef.current) return;
    
    setBusy(true);
    
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext('2d');
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;

      ctx.save();
      ctx.translate(-cropX, -cropY);
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight
      );

      ctx.restore();

      const outputType = imageFile?.type?.includes('png') ? 'image/png' : imageFile?.type?.includes('webp') ? 'image/webp' : 'image/jpeg';

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          setBusy(false);
          return;
        }
        onCropComplete(blob);
      }, outputType, 0.95);
    } catch (err) {
      console.error(err);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-slate-100 font-bold text-base leading-tight">Image Cropper & Optimizer</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Select an aspect ratio or upload the original image unmodified.
              </p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aspect Ratio Toolbar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-slate-950/30 overflow-x-auto">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-2 shrink-0">Ratio:</span>
          {[
            { label: 'Square (1:1)', val: 1 },
            { label: 'Landscape (16:9)', val: 16 / 9 },
            { label: 'Standard (4:3)', val: 4 / 3 },
            { label: 'Free Crop', val: null },
          ].map((opt) => {
            const isSelected = (opt.val === null && currentAspect === null) || (opt.val !== null && Math.abs((currentAspect || 0) - opt.val) < 0.05);
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleAspectChange(opt.val)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-950/60 min-h-[300px]">
          {!!imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={currentAspect || undefined}
              className="max-h-[55vh] object-contain rounded-xl shadow-2xl"
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imgSrc}
                onLoad={onImageLoad}
                className="max-h-[55vh] object-contain rounded-lg"
              />
            </ReactCrop>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60">
          <button
            type="button"
            onClick={() => onCropComplete(imageFile)}
            disabled={busy}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-bold transition-all"
            title="Upload original image without cropping"
          >
            Upload Original (Skip Crop)
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={!completedCrop || busy}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/25 hover:bg-sky-400 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {busy ? (
                <span className="animate-pulse">Processing…</span>
              ) : (
                <>
                  <Check size={14} />
                  Apply Crop & Upload
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

