/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import ImageCropperModal from '../../../components/ImageCropperModal';

let resolveCropPromise = null;
let rejectCropPromise = null;

export const requestImageCrop = (file, aspect = null) => {
  return new Promise((resolve, reject) => {
    resolveCropPromise = resolve;
    rejectCropPromise = reject;
    const event = new CustomEvent('show-crop-modal', { detail: { file, aspect } });
    window.dispatchEvent(event);
  });
};

const CropModalRoot = () => {
  const [cropFile, setCropFile] = useState(null);
  const [cropAspect, setCropAspect] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setCropFile(e.detail.file);
      setCropAspect(e.detail.aspect);
    };
    window.addEventListener('show-crop-modal', handler);
    return () => window.removeEventListener('show-crop-modal', handler);
  }, []);

  if (!cropFile) return null;

  return (
    <ImageCropperModal
      imageFile={cropFile}
      aspect={cropAspect}
      onCropComplete={(blob) => {
        setCropFile(null);
        if (resolveCropPromise) resolveCropPromise(blob);
      }}
      onCancel={() => {
        setCropFile(null);
        if (rejectCropPromise) rejectCropPromise(new Error('Cancelled'));
      }}
    />
  );
};

export default CropModalRoot;
