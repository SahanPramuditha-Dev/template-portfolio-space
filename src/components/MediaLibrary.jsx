import React, { useEffect, useState } from 'react';
import { ImageIcon, Trash2, Copy, Loader2, UploadCloud, FileText as FileIcon, Eye } from 'lucide-react';
import { listCmsAssets, deleteCmsAsset, uploadCmsAsset } from '../lib/cms';

const MediaLibrary = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState('');

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

  const visibleAssets = assets.filter((asset) => asset.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-5 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">Media Library</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage images, certificates, and assets uploaded to your portfolio storage.</p>
        </div>
        
        <label className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer hover:bg-sky-400 transition-all shadow-[0_4px_16px_rgba(56,189,248,0.25)] shrink-0">
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
          {uploading ? 'Uploading…' : 'Upload New Media'}
          <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search files…"
          className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-sky-400"
        />
        <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider text-slate-500">{visibleAssets.length} assets</span>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 size={32} className="animate-spin text-sky-400" />
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
          <ImageIcon size={44} className="mb-3 text-slate-600" />
          <h3 className="text-base font-bold text-slate-200 mb-1">No media uploaded yet</h3>
          <p className="text-xs text-slate-400">Upload images or documents to attach them to your projects and site content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-7">
          {visibleAssets.map((asset) => {
            const isPdf = asset.name.toLowerCase().endsWith('.pdf');
            const isDoc = /\.(docx|doc|xls|xlsx|ppt|pptx|txt|csv)$/i.test(asset.name);

            return (
              <div 
                key={asset.fullPath} 
                onClick={() => window.open(asset.url, '_blank')}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/70 aspect-square flex flex-col items-center justify-center p-2.5 cursor-pointer hover:border-sky-500/50 transition-all shadow-sm"
              >
                {isPdf || isDoc ? (
                  // Document card preview
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/80">
                    <FileIcon size={36} className="text-sky-400 mb-2" />
                    <p className="text-[10px] font-mono text-slate-300 break-all line-clamp-2">{asset.name}</p>
                  </div>
                ) : (
                  // Full view Image block using object-contain to avoid crops
                  <div className="w-full h-full relative bg-slate-900/50 flex items-center justify-center rounded-xl overflow-hidden p-1">
                    <img src={asset.url} alt={asset.name} className="max-w-full max-h-full object-contain rounded-lg" />
                  </div>
                )}
                
                <div 
                  className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 backdrop-blur-md p-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[10px] font-mono text-slate-200 font-semibold text-center break-all line-clamp-2 w-full">
                    {asset.name}
                  </p>
                  <div className="flex gap-2">
                    <a 
                      href={asset.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 bg-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-slate-950 rounded-xl transition-all border border-sky-500/30"
                      title="View / Open File"
                    >
                      <Eye size={13} />
                    </a>
                    <button 
                      onClick={() => copyToClipboard(asset.url)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700"
                      title="Copy URL"
                    >
                      <Copy size={13} />
                    </button>
                    <button 
                      onClick={() => handleDelete(asset.fullPath)}
                      className="p-2 bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white rounded-xl transition-all border border-red-500/30"
                      title="Delete Asset"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {visibleAssets.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center text-sm text-slate-500">No files match that search.</div>
          )}
        </div>
      )}
    </div>
  );

};

export default MediaLibrary;
