import React, { useEffect, useState } from 'react';
import { ImageIcon, Trash2, Copy, Loader2, UploadCloud, FileText as FileIcon, Eye, ExternalLink } from 'lucide-react';
import { listCmsAssets, deleteCmsAsset, uploadCmsAsset } from '../lib/cms';

const MediaLibrary = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const items = await listCmsAssets();
      setAssets(items);
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadCmsAsset(file);
      await fetchAssets();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fullPath) => {
    if (!window.confirm('Are you sure you want to delete this image? This might break links on the live site.')) return;
    
    try {
      await deleteCmsAsset(fullPath);
      setAssets(assets.filter(a => a.fullPath !== fullPath));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    // Optionally add a toast here
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Media Library</h2>
          <p className="text-sm text-text-muted">Manage images and assets uploaded to your portfolio.</p>
        </div>
        
        <label className="flex items-center gap-2 px-4 py-2 bg-accent text-primary font-bold rounded-lg cursor-pointer hover:bg-accent/90 transition-colors">
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-white/5 rounded-2xl bg-secondary/20">
          <ImageIcon size={48} className="mb-4 text-white/10" />
          <h3 className="text-xl font-bold text-text mb-2">No media yet</h3>
          <p className="text-text-muted">Upload images to use them in your projects and blog posts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => {
            const isPdf = asset.name.toLowerCase().endsWith('.pdf');
            const isDoc = /\.(docx|doc|xls|xlsx|ppt|pptx|txt|csv)$/i.test(asset.name);

            return (
              <div 
                key={asset.fullPath} 
                onClick={() => window.open(asset.url, '_blank')}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-secondary/30 aspect-square flex flex-col items-center justify-center p-4 cursor-pointer hover:border-accent/40 transition-colors"
              >
                {isPdf || isDoc ? (
                  // Document card preview
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 rounded-lg p-3 text-center border border-white/5">
                    <FileIcon size={40} className="text-accent mb-2" />
                    <p className="text-[10px] font-mono text-text-muted break-all line-clamp-3">{asset.name}</p>
                  </div>
                ) : (
                  // Full view Image block using object-contain to avoid crops
                  <div className="w-full h-full relative bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center rounded-lg overflow-hidden">
                    <img src={asset.url} alt={asset.name} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                
                <div 
                  className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm p-4"
                  onClick={(e) => e.stopPropagation()} // Prevent double open when copying/deleting
                >
                  <p className="text-[10px] font-mono text-text text-center break-all line-clamp-2 w-full">{asset.name}</p>
                  <div className="flex gap-2">
                    <a 
                      href={asset.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 bg-accent/25 text-accent rounded-lg hover:bg-accent/40 transition-colors"
                      title="View / Open File"
                    >
                      <Eye size={16} />
                    </a>
                    <button 
                      onClick={() => copyToClipboard(asset.url)}
                      className="p-2 bg-white/10 text-text rounded-lg hover:bg-white/20 transition-colors"
                      title="Copy URL"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(asset.fullPath)}
                      className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
