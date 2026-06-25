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

export default function ImageCropperModal({ imageFile, onCropComplete, onCancel, aspect = 16 / 9 }) {
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect));
    } else {
      // Default to 90% size if no aspect ratio is enforced
      setCrop({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
      });
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
      const pixelRatio = window.devicePixelRatio;

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

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          setBusy(false);
          return;
        }
        onCropComplete(blob);
      }, imageFile.type || 'image/jpeg');
    } catch (err) {
      console.error(err);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm">
      <div className="bg-secondary/95 border border-white/10 shadow-2xl rounded-3xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-text font-bold text-lg leading-tight">Crop Image</h3>
              <p className="text-text-muted text-xs mt-0.5">Adjust the framing before upload</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 text-text-muted hover:text-text hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgb(var(--color-accent-rgb)/0.05),transparent)]">
          {!!imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-h-[60vh] object-contain rounded-lg shadow-lg"
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                className="max-h-[60vh] object-contain"
              />
            </ReactCrop>
          )}
        </div>

        <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-primary/30">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-text text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={!completedCrop || busy}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-primary text-sm font-bold shadow-[0_4px_20px_rgb(var(--color-accent-rgb)/0.25)] hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:pointer-events-none"
          >
            {busy ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <Check size={16} />
                Apply Crop & Upload
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
