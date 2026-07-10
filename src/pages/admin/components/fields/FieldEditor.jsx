import React from 'react';
import { useCmsDoc, CMS_DOCS, saveCmsDoc, uploadCmsAsset } from '../../../../lib/cms';
import RepeatableTextEditor from './RepeatableTextEditor';
import RepeatableObjectEditor from './RepeatableObjectEditor';
import { requestImageCrop } from '../CropModalRoot';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { 
  FileText, 
  ImageIcon, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Link2, 
  Network,
  Smartphone,
  Globe,
  Database,
  Cpu,
  Server,
  Shield,
  HardDrive,
  Boxes,
  Monitor,
  Cloud,
  Terminal,
  Activity,
  Lock,
  MessageSquare,
  GitBranch,
  Wifi,
  Layers,
  GripVertical,
  Github,
  Download,
  Loader2,
  Search as SearchIcon
} from 'lucide-react';

const SeoPreviewField = ({ draft }) => {
  const title = draft.seoTitle || draft.title || draft.name || 'Page Title';
  const description = draft.seoDescription || draft.shortDescription || draft.description || 'Page description will appear here in search engine results.';
  const url = 'https://yourportfolio.com/' + (draft.slug || 'page-url');

  const titleLen = title.length;
  const descLen = description.length;
  const titleColor = titleLen > 60 ? 'text-amber-500' : 'text-emerald-500';
  const descColor = descLen > 160 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="space-y-3 p-5 rounded-2xl border border-white/10 bg-black/20 shadow-inner mt-2">
      <div className="flex items-center gap-2 text-text-muted mb-3">
        <SearchIcon size={16} />
        <h4 className="text-sm font-semibold tracking-wide">Google Search Preview</h4>
      </div>
      
      {/* Google-like snippet preview */}
      <div className="bg-white p-4 rounded-lg font-sans max-w-[600px]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
            W
          </div>
          <div>
            <div className="text-[14px] text-[#202124] leading-tight">Your Portfolio</div>
            <div className="text-[12px] text-[#4d5156] leading-tight truncate max-w-[500px]">{url}</div>
          </div>
        </div>
        <div className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer leading-tight mb-1 truncate">
          {title}
        </div>
        <div className="text-[14px] text-[#4d5156] leading-[1.58] line-clamp-2">
          {description}
        </div>
      </div>

      <div className="flex gap-6 mt-4 text-xs font-mono">
        <div>
          <span className="text-text-muted">Title Length: </span>
          <span className={`${titleColor} font-bold`}>{titleLen}/60</span>
          {titleLen > 60 && <span className="text-amber-500 ml-2">May truncate</span>}
        </div>
        <div>
          <span className="text-text-muted">Description: </span>
          <span className={`${descColor} font-bold`}>{descLen}/160</span>
          {descLen > 160 && <span className="text-amber-500 ml-2">May truncate</span>}
        </div>
      </div>
    </div>
  );
};

const GithubImportField = ({ onChangeDraft, draft }) => {
  const [repoUrl, setRepoUrl] = React.useState('');
  const [isFetching, setIsFetching] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleImport = async () => {
    if (!repoUrl || typeof onChangeDraft !== 'function') return;
    setIsFetching(true);
    setErrorMsg('');
    try {
      let owner, repo;
      const cleanUrl = repoUrl.trim().replace(/\/$/, '');
      if (cleanUrl.includes('github.com')) {
        const parts = cleanUrl.split('github.com/')[1].split('/');
        owner = parts[0];
        repo = parts[1];
      } else if (cleanUrl.includes('/')) {
        const parts = cleanUrl.split('/');
        owner = parts[0];
        repo = parts[1];
      } else {
        throw new Error('Invalid format. Use owner/repo or a full GitHub URL.');
      }

      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!res.ok) throw new Error('Repository not found or API rate limit exceeded.');
      const data = await res.json();

      if (data.name) onChangeDraft('title', data.name);
      if (data.description) {
        onChangeDraft('shortDescription', data.description);
        onChangeDraft('description', data.description);
      }
      if (data.html_url) onChangeDraft('github', data.html_url);
      if (data.homepage) onChangeDraft('external', data.homepage);
      
      const newTech = [];
      if (data.language) newTech.push(data.language);
      if (data.topics && Array.isArray(data.topics)) newTech.push(...data.topics);
      
      if (newTech.length > 0) {
         const existingTech = Array.isArray(draft.tech) ? draft.tech : [];
         const mergedTech = [...new Set([...existingTech, ...newTech])];
         onChangeDraft('tech', mergedTech);
      }
      
      setRepoUrl('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-3 p-6 rounded-2xl border border-accent/20 bg-accent/5 shadow-inner mb-4">
      <div className="flex items-center gap-2 text-accent mb-1">
        <Github size={20} />
        <h4 className="text-sm font-bold tracking-wide">GitHub Repository Auto-Import</h4>
      </div>
      <p className="text-xs text-text-muted leading-relaxed">
        Paste a public GitHub repository URL (or <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded font-mono">owner/repo</code>) to automatically fetch and fill the project details below.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="e.g. facebook/react"
          className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-sm text-white placeholder:text-text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all shadow-inner"
          onKeyDown={(e) => e.key === 'Enter' && handleImport()}
        />
        <button
          onClick={handleImport}
          disabled={isFetching || !repoUrl.trim()}
          className="px-6 py-3 rounded-xl bg-accent text-slate-950 text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-accent/20"
        >
          {isFetching ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isFetching ? 'Fetching data...' : 'Fetch & Auto-fill'}
        </button>
      </div>
      {errorMsg && (
        <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          <span className="font-bold">Error:</span> {errorMsg}
        </p>
      )}
    </div>
  );
};

const FieldEditor = ({ field, value, onChange, onUpload, section, docId, draft, onChangeDraft }) => {
  const [selectedFileIdx, setSelectedFileIdx] = React.useState(0);
  const fieldId = `admin-field-${field.key}`;

  // Local suggestions for tech list fields (avoid referencing AdminPage scope)
  const { data: _projectsDoc } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  const { data: _siteDoc } = useCmsDoc(CMS_DOCS.site, {});
  const _techSuggestions = React.useMemo(() => {
    const fromProjects = Array.isArray(_projectsDoc?.items)
      ? _projectsDoc.items.flatMap((p) => (Array.isArray(p.tech) ? p.tech : []))
      : [];
    const fromSite = Array.isArray(_siteDoc?.techTags) ? _siteDoc.techTags : [];
    return [...new Set([...fromSite.filter(Boolean), ...fromProjects.filter(Boolean)])].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [_projectsDoc, _siteDoc]);

  const addGlobalTechTagLocal = async (tag) => {
    if (!tag || !tag.trim()) return;
    const normalized = String(tag).trim();
    const existing = Array.isArray(_siteDoc?.techTags) ? _siteDoc.techTags : [];
    if (existing.includes(normalized)) return;
    try {
      await saveCmsDoc(CMS_DOCS.site, { techTags: [...existing, normalized] });
    } catch (err) {
      console.error('Failed to save global tech tag', err);
    }
  };

  if (field.type === 'github-import') {
    return <GithubImportField onChangeDraft={onChangeDraft} draft={draft} />;
  }

  if (field.type === 'checkbox') {
    return (
      <label
        htmlFor={fieldId}
        className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-primary/30 px-4 py-3.5 transition-colors hover:border-accent/25"
      >
        <input
          id={fieldId}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-secondary/50 text-accent focus:ring-accent"
        />
        <span className="text-sm font-medium text-text">{field.label}</span>
      </label>
    );
  }

  if (field.type === 'list') {
    return (
      <RepeatableTextEditor
        label={field.label}
        helper={field.helper || 'Add one item per row.'}
        placeholder={field.placeholder || 'Enter an item'}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        suggestions={field.key === 'tech' ? _techSuggestions : undefined}
        onAddSuggestion={field.key === 'tech' ? addGlobalTechTagLocal : undefined}
      />
    );
  }

  
  if (field.type === 'block-editor') {
    const blocks = Array.isArray(value) ? value : [];

    const addBlock = (type) => {
      onChange([...blocks, { id: Date.now().toString(), type, enabled: true, data: {} }]);
    };

    const moveBlock = (fromIdx, toIdx) => {
      const newBlocks = [...blocks];
      const [moved] = newBlocks.splice(fromIdx, 1);
      newBlocks.splice(toIdx, 0, moved);
      onChange(newBlocks);
    };

    const toggleBlock = (idx) => {
      const newBlocks = [...blocks];
      newBlocks[idx].enabled = !newBlocks[idx].enabled;
      onChange(newBlocks);
    };

    const removeBlock = (idx) => {
      const newBlocks = [...blocks];
      newBlocks.splice(idx, 1);
      onChange(newBlocks);
    };

    return (
      <div className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
          {field.label}
        </label>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Gutenberg-style modular block editor. Add blocks and drag to reorder.
        </p>
        
        <div className="space-y-3">
          {blocks.map((block, idx) => (
            <div 
              key={block.id} 
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', idx.toString());
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                if (!isNaN(fromIdx) && fromIdx !== idx) moveBlock(fromIdx, idx);
              }}
              className={`flex flex-col p-4 rounded-xl border border-white/10 bg-slate-900/50 cursor-move transition-all hover:border-accent/40 ${block.enabled ? 'opacity-100' : 'opacity-50 grayscale'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <GripVertical size={14} className="text-text-muted" />
                  <span className="text-xs font-bold text-white font-mono">{idx + 1}. {block.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => toggleBlock(idx)} className="text-xs text-text-muted hover:text-white">
                    {block.enabled ? 'Hide' : 'Show'}
                  </button>
                  <button type="button" onClick={() => removeBlock(idx)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="pl-7 text-[10px] font-mono text-text-muted">
                 [Block Content Editor Placeholder]
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 flex-wrap pt-2">
          {['project/hero', 'project/problem-statement'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-white hover:bg-white/5"
            >
              + Add {type.split('/')[1]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === 'visual-gallery-picker') {
    const layouts = [
      {
        id: 'grid',
        title: 'Standard Grid',
        desc: 'Uniform landscape grid (Default)',
        preview: (
          <div className="grid grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-slate-500/50 aspect-video rounded-[2px]" />)}
          </div>
        )
      },
      {
        id: 'masonry',
        title: 'Modern Masonry',
        desc: 'Perfect for mixed aspect ratios',
        preview: (
          <div className="columns-3 gap-1 space-y-1">
            <div className="bg-slate-500/50 aspect-video rounded-[2px]" />
            <div className="bg-slate-500/50 aspect-square rounded-[2px]" />
            <div className="bg-slate-500/50 aspect-[9/16] rounded-[2px]" />
            <div className="bg-slate-500/50 aspect-[4/3] rounded-[2px]" />
            <div className="bg-slate-500/50 aspect-video rounded-[2px]" />
          </div>
        )
      },
      {
        id: 'magazine',
        title: 'Magazine Bento',
        desc: 'Cinematic hero shot + thumbnails',
        preview: (
          <div className="grid grid-cols-3 gap-1">
            <div className="col-span-3 bg-slate-500/50 aspect-[21/9] rounded-[2px]" />
            <div className="bg-slate-500/50 aspect-video rounded-[2px]" />
            <div className="bg-slate-500/50 aspect-video rounded-[2px]" />
            <div className="bg-slate-500/50 aspect-video rounded-[2px]" />
          </div>
        )
      }
    ];

    return (
      <div className="space-y-4 mb-6">
        <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
          {field.label}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {layouts.map(l => {
            const isSelected = value === l.id || (!value && l.id === 'grid');
            return (
              <button
                key={l.id}
                onClick={() => onChange(l.id)}
                className={`p-4 rounded-2xl border text-left flex flex-col gap-3 transition-all ${
                  isSelected 
                    ? 'border-accent bg-accent/5 ring-1 ring-accent/50 shadow-[0_0_15px_rgba(45,212,191,0.15)]' 
                    : 'border-white/10 bg-slate-900/50 hover:border-white/30'
                }`}
              >
                <div className="h-24 w-full bg-slate-950 rounded-lg p-3 border border-white/5 flex items-center justify-center overflow-hidden">
                   <div className="w-full">{l.preview}</div>
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isSelected ? 'text-accent' : 'text-white'}`}>{l.title}</h4>
                  <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{l.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    );
  }

  if (field.type === 'layout-builder') {
    const layout = Array.isArray(value) && value.length > 0 ? value : [
      { id: 'Hero', enabled: true },
      { id: 'ProblemStatement', enabled: true },
      { id: 'ProductOverview', enabled: true },
      { id: 'KeyFeatures', enabled: true },
      { id: 'InteractiveDemo', enabled: true },
      { id: 'UserJourney', enabled: true },
      { id: 'ArchitectureOverview', enabled: true },
      { id: 'EngineeringDecisions', enabled: true },
      { id: 'TechnicalChallenges', enabled: true },
      { id: 'SecurityPerformance', enabled: true },
      { id: 'ScalabilityStrategy', enabled: true },
      { id: 'DevelopmentTimeline', enabled: true },
      { id: 'MetricsStatistics', enabled: true },
      { id: 'LessonsLearned', enabled: true },
      { id: 'FutureRoadmap', enabled: true },
      { id: 'CTA', enabled: true }
    ];

    const moveItem = (fromIdx, toIdx) => {
      const newLayout = [...layout];
      const [moved] = newLayout.splice(fromIdx, 1);
      newLayout.splice(toIdx, 0, moved);
      onChange(newLayout);
    };

    const toggleItem = (idx) => {
      const newLayout = [...layout];
      newLayout[idx].enabled = !newLayout[idx].enabled;
      onChange(newLayout);
    };

    return (
      <div className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
          {field.label}
        </label>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Drag and drop to reorder sections. Toggle the switch to show or hide a section from the live project page.
        </p>
        <div className="space-y-2">
          {layout.map((item, idx) => (
            <div 
              key={item.id} 
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', idx.toString());
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                if (!isNaN(fromIdx) && fromIdx !== idx) moveItem(fromIdx, idx);
              }}
              className={`flex items-center justify-between p-3 rounded-xl border border-white/10 bg-slate-900/50 cursor-move transition-all hover:bg-slate-800/50 ${item.enabled ? 'opacity-100 border-white/20' : 'opacity-50 grayscale'}`}
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <GripVertical size={14} className="text-text-muted" />
                <span className="text-xs font-bold text-white font-mono">{idx + 1}. {item.id}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(idx);
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${item.enabled ? 'bg-accent' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-slate-950 transition duration-200 ease-in-out ${item.enabled ? 'translate-x-1.5' : '-translate-x-1.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === 'object-list') {
    const needsNestedUpload = field.fields?.some((f) => f.type === 'image' || f.type === 'file');
    const uploadForObjectList =
      needsNestedUpload && section && docId
        ? async (_nestedKey, accept = 'image/*,.gif,.mp4,.webm,.pdf,.doc,.docx,.ppt,.pptx') =>
            new Promise((resolve) => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = accept;
              input.onchange = async () => {
                let file = input.files?.[0];
                if (!file) {
                  resolve(null);
                  return;
                }
                if (file.type.startsWith('image/') && file.type !== 'image/gif') {
                  try {
                    file = await requestImageCrop(file, null); // Free aspect ratio for general objects
                  } catch {
                    resolve(null);
                    return;
                  }
                }
                try {
                  const url = await uploadCmsAsset(file, `${section.uploadFolder || 'uploads'}/${docId}`);
                  resolve(url);
                } catch (error) {
                  console.error('Upload failed:', error);
                  resolve(null);
                }
              };
              input.click();
            })
        : null;

  if (field.type === 'seo-preview') {
    return <SeoPreviewField draft={draft} />;
  }

    if (field.key === 'architectureConnectionsJson') {
      // Connections are fully edited inside the Interactive Topology Builder of architectureNodesJson
      return null;
    }

    if (field.key === 'architectureNodesJson' && draft && onChangeDraft) {
      const nodes = Array.isArray(value) ? value : [];
      const connections = Array.isArray(draft.architectureConnectionsJson) ? draft.architectureConnectionsJson : [];

      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              {field.label} — Interactive Topology Builder
            </span>
            <p className="text-[11px] text-text-muted">
              Drag nodes to customize coordinates. Use the connection editor below to link data nodes, and click Add Node to create new ones on the fly.
            </p>
            <VisualTopologyCanvas 
              nodes={nodes} 
              connections={connections} 
              onChangeNodes={onChange}
              onChangeConnections={(newConns) => onChangeDraft('architectureConnectionsJson', newConns)}
            />
          </div>
        </div>
      );
    }
    if (field.key === 'folderStructureJson') {
      const files = Array.isArray(value) ? value : [];

      const addFileNode = (parentFolder = '') => {
        const base = parentFolder ? `${parentFolder}/` : '';
        const nextFiles = [...files, { path: `${base}new_file_${Date.now().toString().slice(-3)}.js`, code: '// Code here...' }];
        onChange(nextFiles);
        setSelectedFileIdx(nextFiles.length - 1);
      };

      const addFolderNode = (parentFolder = '') => {
        const base = parentFolder ? `${parentFolder}/` : '';
        const folderName = `folder_${Date.now().toString().slice(-3)}`;
        const nextFiles = [...files, { path: `${base}${folderName}/placeholder.txt`, code: '' }];
        onChange(nextFiles);
        setSelectedFileIdx(nextFiles.length - 1);
      };

      const deleteFileOrFolder = (targetPath, type) => {
        let nextFiles;
        if (type === 'file') {
          nextFiles = files.filter(f => f.path !== targetPath);
        } else {
          // Folder: remove recursively
          const folderPrefix = targetPath + '/';
          nextFiles = files.filter(f => f.path !== targetPath && !f.path.startsWith(folderPrefix));
        }
        onChange(nextFiles);
        setSelectedFileIdx(nextFiles.length > 0 ? 0 : 0);
      };

      const renameFileOrFolder = (oldPath, newName, type) => {
        let nextFiles;
        if (type === 'file') {
          const parts = oldPath.split('/');
          parts[parts.length - 1] = newName;
          const newPath = parts.join('/');
          nextFiles = files.map(f => f.path === oldPath ? { ...f, path: newPath } : f);
        } else {
          // Folder: rename prefix
          const parts = oldPath.split('/');
          parts[parts.length - 1] = newName;
          const newPath = parts.join('/');
          const oldPrefix = oldPath + '/';
          const newPrefix = newPath + '/';
          
          nextFiles = files.map(f => {
            if (f.path === oldPath) {
              return { ...f, path: newPath };
            }
            if (f.path.startsWith(oldPrefix)) {
              return { ...f, path: f.path.replace(oldPrefix, newPrefix) };
            }
            return f;
          });
        }
        onChange(nextFiles);
      };

      const updateFileField = (index, key, val) => {
        const nextFiles = [...files];
        nextFiles[index] = {
          ...nextFiles[index],
          [key]: val
        };
        onChange(nextFiles);
      };

      const selectedFile = files[selectedFileIdx] || files[0] || null;

      // Recursive tree model construction
      const buildNestedTree = (filesList) => {
        const rootNode = { name: 'project-root', type: 'dir', path: '', children: [] };
        
        filesList.forEach((file, index) => {
          const parts = (file.path || '').split('/').filter(Boolean);
          let current = rootNode;
          
          parts.forEach((part, partIdx) => {
            const isLast = partIdx === parts.length - 1;
            const currentPath = parts.slice(0, partIdx + 1).join('/');
            
            let child = current.children.find(c => c.name === part);
            if (!child) {
              child = {
                name: part,
                type: isLast ? 'file' : 'dir',
                path: currentPath,
                fileIndex: isLast ? index : undefined,
                children: []
              };
              current.children.push(child);
            }
            current = child;
          });
        });

        // Sort: directories first, then files alphabetically
        const sortTree = (node) => {
          if (node.children) {
            node.children.sort((a, b) => {
              if (a.type !== b.type) {
                return a.type === 'dir' ? -1 : 1;
              }
              return a.name.localeCompare(b.name);
            });
            node.children.forEach(sortTree);
          }
        };
        sortTree(rootNode);
        
        return rootNode;
      };

      const treeData = buildNestedTree(files);

      return (
        <div className="space-y-4 rounded-xl border border-white/10 bg-primary/20 p-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                {field.label} — Interactive Workspace Tree Builder
              </span>
              <p className="text-[10px] text-text-muted mt-1">
                Manage directory structure and mock files. Hover over folders to add files/subfolders, rename, or delete recursively.
              </p>
            </div>
            <button
              type="button"
              onClick={() => addFileNode('')}
              className="px-3 py-1.5 bg-accent/20 border border-accent/30 text-accent rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-accent/35 transition-colors"
            >
              <Plus size={10} /> ADD ROOT FILE
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 font-mono text-xs items-stretch min-h-[340px]">
            {/* Left explorer list */}
            <div className="p-3 rounded-xl border border-white/5 bg-slate-950/40 flex flex-col justify-between max-h-[380px] min-h-[340px]">
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <span className="text-[9px] font-bold text-accent uppercase tracking-wider block">Workspace Directory Tree</span>
                
                <div className="overflow-y-auto flex-1 [scrollbar-width:thin] pr-1">
                  {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-text-muted space-y-2">
                      <span className="text-[10px]">No workspace files defined yet.</span>
                      <button
                        type="button"
                        onClick={() => addFileNode('')}
                        className="px-2 py-1 bg-accent/20 border border-accent/30 text-accent rounded text-[9px]"
                      >
                        Create Root File
                      </button>
                    </div>
                  ) : (
                    <FolderTreeNode
                      node={treeData}
                      onAddFile={addFileNode}
                      onAddFolder={addFolderNode}
                      onRename={renameFileOrFolder}
                      onDelete={deleteFileOrFolder}
                      onSelectFile={setSelectedFileIdx}
                      selectedFileIdx={selectedFileIdx}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right mock code file editor area */}
            <div className="md:col-span-2 p-3.5 rounded-xl border border-white/5 bg-slate-950/60 flex flex-col justify-between min-h-[340px]">
              {selectedFile ? (
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="col-span-2">
                      <label className="text-[9px] text-text-muted">FILE PATH (Relative, e.g. src/components/Workspace.jsx)</label>
                      <input
                        type="text"
                        value={selectedFile.path || ''}
                        onChange={(e) => updateFileField(selectedFileIdx, 'path', e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 px-2 text-white font-mono text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
                    <label className="text-[9px] text-text-muted shrink-0">MOCK FILE CODE / CONTENT</label>
                    <textarea
                      value={selectedFile.code || ''}
                      onChange={(e) => updateFileField(selectedFileIdx, 'code', e.target.value)}
                      className="w-full flex-1 bg-slate-900 border border-white/10 rounded-lg p-2.5 text-emerald-300 font-mono text-[10px] resize-none outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                      placeholder="// Write code here..."
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-xl bg-slate-950/20 text-center text-text-muted">
                  <span className="text-[10px] uppercase font-bold tracking-wider mb-1">No File Selected</span>
                  <span className="text-[9px] leading-relaxed">Select or add a file inside the directory tree on the left to write its source code preview.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <RepeatableObjectEditor
        label={field.label}
        helper={field.helper || 'Add one card per entry.'}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        createItem={field.createItem || (() => ({}))}
        fields={field.fields || []}
        onUpload={uploadForObjectList}
      />
    );
  }

  const commonClass =
    'w-full rounded-xl border border-white/10 bg-primary/40 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent/40';

  if (field.type === 'color') {
    return (
      <div className="space-y-2">
        <label htmlFor={fieldId} className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
          {field.label}
        </label>
        <div className="flex gap-3 items-center">
          <input
            id={fieldId}
            type="color"
            value={value || '#38bdf8'}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 p-1 bg-primary/40 rounded-xl border border-white/10 cursor-pointer shrink-0"
          />
          <input
            type="text"
            value={value || '#38bdf8'}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#38bdf8"
            className={commonClass}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {field.label}
      </label>
      {field.type === 'select' ? (
        <select
          id={fieldId}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={commonClass}
        >
          <option value="" disabled className="bg-secondary text-text">
            Select {field.label.toLowerCase()}
          </option>
          {(field.options || []).map((option) => (
            <option key={option} value={option} className="bg-secondary text-text">
              {option}
            </option>
          ))}
        </select>
      ) : field.type === 'markdown' ? (
        <div className="prose-editor-wrapper bg-primary/40 rounded-xl overflow-hidden border border-white/10 [&_.editor-toolbar]:border-none [&_.editor-toolbar]:bg-secondary/50 [&_.editor-toolbar>button]:text-text [&_.editor-toolbar>button.active]:bg-accent/20 [&_.CodeMirror]:border-none [&_.CodeMirror]:bg-transparent [&_.CodeMirror]:text-text">
          <SimpleMdeReact
            id={fieldId}
            value={value || ''}
            onChange={(val) => onChange(val)}
            options={{
              spellChecker: false,
              status: false,
              minHeight: '200px',
            }}
          />
        </div>
      ) : field.type === 'textarea' || field.type === 'json' ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.type === 'json' ? 8 : 4}
          className={`${commonClass} font-mono text-sm`}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              id={fieldId}
              type={field.type === 'number' ? 'number' : field.type === 'datetime-local' || field.type === 'date' ? field.type : 'text'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={commonClass}
              list={field.suggestions ? `${fieldId}-suggestions` : undefined}
            />
            {field.suggestions && (
              <datalist id={`${fieldId}-suggestions`}>
                {field.suggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            )}
            {(field.type === 'image' || field.type === 'file' || field.type === 'pdf') && onUpload && (
              <button
                type="button"
                onClick={onUpload}
                className="shrink-0 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 text-accent"
                aria-label={`Upload ${field.label}`}
              >
                {field.type === 'pdf' ? <FileText size={16} /> : field.type === 'file' ? <FileText size={16} /> : <ImageIcon size={16} />}
              </button>
            )}
          </div>
          {field.type === 'image' && value && (
            <div className="mt-1 w-full max-w-sm rounded-lg overflow-hidden border border-white/10 bg-black/20">
              <img src={value} alt="Preview" className="w-full h-auto max-h-48 object-contain" />
            </div>
          )}
          {field.type === 'pdf' && value && (
            <div className="mt-2 w-full rounded-xl overflow-hidden border border-accent/20 bg-black/30">
              <div className="flex items-center justify-between px-4 py-2 bg-accent/10 border-b border-accent/15">
                <span className="text-xs font-mono text-accent uppercase tracking-widest">PDF Preview</span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Open in new tab
                </a>
              </div>
              <iframe
                src={value}
                title="Certificate PDF Preview"
                className="w-full"
                style={{ height: '480px', border: 'none' }}
              />
            </div>
          )}
        </div>
      )}
      {field.type === 'csv' && <p className="text-xs text-text-muted">Separate values with commas.</p>}
      {field.type === 'json' && <p className="text-xs text-text-muted">Must be valid JSON.</p>}
    </div>
  );
};


// ================= SUB-COMPONENT: VISUAL TOPOLOGY CANVAS EDITOR =================
const VisualTopologyCanvas = ({ nodes, connections, onChangeNodes, onChangeConnections }) => {
  const canvasRef = React.useRef(null);
  const [draggingIdx, setDraggingIdx] = React.useState(null);
  const [selectedNodeIdx, setSelectedNodeIdx] = React.useState(0);
  
  // Connection creator states
  const [connFrom, setConnFrom] = React.useState('');
  const [connTo, setConnTo] = React.useState('');
  const [connColor, setConnColor] = React.useState('#38bdf8');
  const [showOnlySelectedConnections, setShowOnlySelectedConnections] = React.useState(true);

  const selectedNode = nodes[selectedNodeIdx] || nodes[0] || null;

  const getIconComponent = (iconName) => {
    const map = {
      Smartphone: Smartphone,
      Globe: Globe,
      Database: Database,
      Shield: Shield,
      Cpu: Cpu,
      Server: Server,
      HardDrive: HardDrive,
      Boxes: Boxes,
      Monitor: Monitor,
      Cloud: Cloud,
      Terminal: Terminal,
      Activity: Activity,
      Lock: Lock,
      MessageSquare: MessageSquare,
      GitBranch: GitBranch,
      Wifi: Wifi,
      Layers: Layers
    };
    return map[iconName] || Cpu;
  };

  React.useEffect(() => {
    if (selectedNode) {
      setConnFrom(selectedNode.id);
    }
  }, [selectedNodeIdx, selectedNode]);

  React.useEffect(() => {
    if (draggingIdx === null) return;

    const handleGlobalMove = (e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const newX = Math.max(0, Math.min(100, Math.round((clientX / rect.width) * 100)));
      const newY = Math.max(0, Math.min(100, Math.round((clientY / rect.height) * 100)));

      const newNodes = [...nodes];
      newNodes[draggingIdx] = {
        ...newNodes[draggingIdx],
        x: newX,
        y: newY
      };
      onChangeNodes(newNodes);
    };

    const handleGlobalUp = () => {
      setDraggingIdx(null);
    };

    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('pointerup', handleGlobalUp);
    };
  }, [draggingIdx, nodes, onChangeNodes]);

  const handlePointerDown = (e, idx) => {
    e.preventDefault();
    setSelectedNodeIdx(idx);
    setDraggingIdx(idx);
  };

  const updateSelectedNodeField = (key, val) => {
    const newNodes = [...nodes];
    const oldNode = newNodes[selectedNodeIdx];
    if (!oldNode) return;
    
    if (key === 'id' && oldNode.id !== val) {
      const oldId = oldNode.id;
      const newConns = connections.map(conn => {
        const next = { ...conn };
        if (next.from === oldId) next.from = val;
        if (next.to === oldId) next.to = val;
        return next;
      });
      onChangeConnections(newConns);
    }

    newNodes[selectedNodeIdx] = {
      ...oldNode,
      [key]: val
    };
    onChangeNodes(newNodes);
  };

  const addNodeOnCanvas = () => {
    const defaultId = `node_${Date.now().toString().slice(-4)}`;
    const newNode = {
      id: defaultId,
      label: 'New Node',
      desc: 'System component details.',
      icon: 'Cpu',
      x: 50,
      y: 50,
      color: '#38bdf8'
    };
    const nextNodes = [...nodes, newNode];
    onChangeNodes(nextNodes);
    setSelectedNodeIdx(nextNodes.length - 1);
  };

  const addConnectionOnCanvas = () => {
    if (!connFrom || !connTo || connFrom === connTo) return;
    const exists = connections.some(c => c.from === connFrom && c.to === connTo);
    if (exists) return;

    const newConnection = {
      from: connFrom,
      to: connTo,
      color: connColor
    };
    onChangeConnections([...connections, newConnection]);
    setConnTo('');
  };

  const deleteConnection = (index) => {
    const updated = connections.filter((_, idx) => idx !== index);
    onChangeConnections(updated);
  };



  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-primary/20 p-4">
      
      {/* Visual Canvas Grid */}
      <div 
        ref={canvasRef}
        className="relative w-full h-[320px] rounded-lg border border-white/10 bg-black/40 cursor-crosshair overflow-hidden select-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px'
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {connections.map((conn, idx) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const cx1 = fromNode.x + dx * 0.4;
            const cy1 = fromNode.y;
            const cx2 = fromNode.x + dx * 0.6;
            const cy2 = toNode.y;
            const pathD = `M ${fromNode.x} ${fromNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toNode.x} ${toNode.y}`;

            return (
              <path 
                key={idx} 
                d={pathD} 
                stroke={conn.color || '#38bdf8'} 
                strokeWidth="1.2" 
                fill="none" 
                opacity="0.75"
              />
            );
          })}
        </svg>

        {/* Nodes (Icon components matching dashboard presentation) */}
        {nodes.map((node, idx) => {
          const NodeIcon = getIconComponent(node.icon);
          const isSelected = selectedNodeIdx === idx;
          return (
            <div
              key={idx}
              onPointerDown={(e) => handlePointerDown(e, idx)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-move z-10 flex flex-col items-center select-none group"
              style={{ 
                left: `${node.x}%`, 
                top: `${node.y}%`
              }}
            >
              {/* Icon Container Card */}
              <div 
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-300 relative bg-slate-900 shadow-lg ${
                  isSelected 
                    ? 'scale-110 z-20 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    : 'hover:scale-105'
                }`}
                style={{ 
                  borderColor: isSelected 
                    ? (node.color || '#38bdf8') 
                    : (node.color || 'rgba(255,255,255,0.15)'),
                  boxShadow: isSelected 
                    ? `0 0 20px ${(node.color || '#38bdf8')}66` 
                    : `0 0 10px ${(node.color || '#38bdf8')}11`
                }}
              >
                <NodeIcon 
                  size={18} 
                  style={{ 
                    color: isSelected 
                      ? (node.color || '#38bdf8') 
                      : (node.color ? `${node.color}cc` : 'rgba(255,255,255,0.6)') 
                  }} 
                />
                
                {/* Active node signal ring */}
                {isSelected && (
                  <span className="absolute inset-0 rounded-2xl animate-ping border opacity-45" style={{ borderColor: node.color || '#38bdf8' }} />
                )}
              </div>
              
              {/* Text label underneath */}
              <span 
                className={`mt-1.5 whitespace-nowrap font-mono text-[9px] font-bold px-1.5 py-0.5 rounded transition-all duration-300 ${
                  isSelected 
                    ? 'text-white bg-accent/25 border border-accent/20 shadow-[0_0_10px_rgba(56,189,248,0.15)]' 
                    : 'text-text-muted bg-black/40 border border-white/5 group-hover:text-text'
                }`}
              >
                {node.label || node.id || 'Node'}
              </span>
            </div>
          );
        })}
        
        {/* Helper layout controls */}
        <div className="absolute top-2 right-2 flex gap-2 z-20">
          <button
            type="button"
            onClick={addNodeOnCanvas}
            className="px-2.5 py-1.5 bg-accent/20 border border-accent/30 text-accent rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-accent/35 transition-colors"
          >
            <Plus size={10} /> ADD NODE
          </button>
        </div>
      </div>

      {/* GUI Connections & Details Side-by-Side (Equal height) */}
      <div className="grid md:grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs font-mono items-stretch">
        
        {/* Selected Node Details Form */}
        {selectedNode ? (
          <div className="space-y-3 p-3.5 rounded-xl border border-accent/25 bg-accent/5 relative flex flex-col justify-between min-h-[320px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <div className="flex items-center gap-1.5 text-accent font-bold uppercase text-[9px] tracking-wider">
                  <span className="w-2 h-2 rounded-full animate-ping shrink-0" style={{ backgroundColor: selectedNode.color || '#38bdf8' }} />
                  Customize Node: {selectedNode.id || 'new'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updatedNodes = nodes.filter((_, idx) => idx !== selectedNodeIdx);
                    const nodeToDel = nodes[selectedNodeIdx];
                    if (nodeToDel) {
                      const cleanedConns = connections.filter(c => c.from !== nodeToDel.id && c.to !== nodeToDel.id);
                      onChangeConnections(cleanedConns);
                    }
                    onChangeNodes(updatedNodes);
                    setSelectedNodeIdx(updatedNodes.length > 0 ? 0 : null);
                  }}
                  className="text-red-400 hover:text-white px-2 py-0.5 rounded border border-red-500/25 bg-red-500/10 text-[9px] font-bold"
                >
                  DELETE NODE
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="text-[9px] text-text-muted">NODE ID</label>
                  <input
                    type="text"
                    value={selectedNode.id || ''}
                    onChange={(e) => updateSelectedNodeField('id', e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 px-2 text-white font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-text-muted">DISPLAY LABEL</label>
                  <input
                    type="text"
                    value={selectedNode.label || ''}
                    onChange={(e) => updateSelectedNodeField('label', e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 px-2 text-white text-[10px]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] text-text-muted">DESCRIPTION (TOOLTIP DETAILS)</label>
                  <textarea
                    value={selectedNode.desc || ''}
                    onChange={(e) => updateSelectedNodeField('desc', e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 text-white text-[10px] resize-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-text-muted">LUCIDE ICON</label>
                  <select
                    value={selectedNode.icon || 'Cpu'}
                    onChange={(e) => updateSelectedNodeField('icon', e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 px-2 text-white text-[10px] outline-none"
                  >
                    {['Smartphone', 'Globe', 'Database', 'Cpu', 'Server', 'Shield', 'HardDrive', 'Boxes', 'Monitor', 'Cloud', 'Terminal', 'Activity', 'Lock', 'MessageSquare', 'GitBranch', 'Wifi', 'Layers'].map(opt => (
                      <option key={opt} value={opt} className="bg-secondary text-text">{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-text-muted">ACCENT COLOR</label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="color"
                      value={selectedNode.color || '#38bdf8'}
                      onChange={(e) => updateSelectedNodeField('color', e.target.value)}
                      className="w-6 h-6 bg-slate-900 border border-white/10 cursor-pointer rounded"
                    />
                    <input
                      type="text"
                      value={selectedNode.color || '#38bdf8'}
                      onChange={(e) => updateSelectedNodeField('color', e.target.value)}
                      placeholder="#38bdf8"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-0.5 text-white text-[9px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-text-muted">GRID X (%)</label>
                  <input
                    type="number"
                    value={selectedNode.x ?? 50}
                    onChange={(e) => updateSelectedNodeField('x', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 px-2 text-white text-[10px]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-text-muted">GRID Y (%)</label>
                  <input
                    type="number"
                    value={selectedNode.y ?? 50}
                    onChange={(e) => updateSelectedNodeField('y', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 px-2 text-white text-[10px]"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-xl bg-slate-950/20 text-center text-text-muted min-h-[320px]">
            <span className="text-[10px] uppercase font-bold tracking-wider mb-1">No Node Selected</span>
            <span className="text-[9px] leading-relaxed">Click any node on the blueprint grid above to configure its labels, icons, and coordinates.</span>
          </div>
        )}

        {/* Right Column: Connection Linker & Existing List (Unified card matching left height) */}
        <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 flex flex-col justify-between min-h-[320px] space-y-3">
          {/* Create Visual Connection */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-accent font-bold uppercase text-[9px] tracking-wider">
              <Link2 size={11} /> Create Data Pipeline Connection
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-text-muted">FROM NODE</label>
                <select
                  value={connFrom}
                  onChange={(e) => setConnFrom(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 text-[11px] text-white"
                >
                  <option value="">Select...</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.label || n.id}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] text-text-muted">TO NODE</label>
                <select
                  value={connTo}
                  onChange={(e) => setConnTo(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 text-[11px] text-white"
                >
                  <option value="">Select...</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.label || n.id}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <label className="text-[9px] text-text-muted">COLOR</label>
                <input
                  type="color"
                  value={connColor}
                  onChange={(e) => setConnColor(e.target.value)}
                  className="w-8 h-6 bg-slate-900 border border-white/10 cursor-pointer rounded"
                />
              </div>
              <button
                type="button"
                onClick={addConnectionOnCanvas}
                disabled={!connFrom || !connTo || connFrom === connTo}
                className="px-3 py-1 bg-accent text-primary font-bold rounded-lg text-[10px] hover:scale-103 transition-transform disabled:opacity-50"
              >
                CONNECT NODES
              </button>
            </div>
          </div>

          <div className="border-t border-white/5 my-0.5 shrink-0" />

          {/* Existing Connections List */}
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-1 gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-accent font-bold uppercase text-[9px] tracking-wider">
                <Network size={11} /> Existing Pipeline Pipes
              </div>
              {selectedNode && (
                <label className="flex items-center gap-1 text-[8px] font-mono text-text-muted cursor-pointer hover:text-text">
                  <input
                    type="checkbox"
                    checked={showOnlySelectedConnections}
                    onChange={(e) => setShowOnlySelectedConnections(e.target.checked)}
                    className="h-3 w-3 rounded bg-slate-900 border-white/10 text-accent focus:ring-accent"
                  />
                  <span>Show only select node pipes</span>
                </label>
              )}
            </div>

            <div className="overflow-y-auto max-h-[120px] flex-1 space-y-1.5 text-[10px] [scrollbar-width:thin] pr-1">
              {(() => {
                const filtered = connections.map((conn, idx) => ({ ...conn, originalIdx: idx })).filter(conn => {
                  if (showOnlySelectedConnections && selectedNode) {
                    return conn.from === selectedNode.id || conn.to === selectedNode.id;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return <span className="text-[10px] text-text-muted">No matching connections linked.</span>;
                }

                return filtered.map((conn) => (
                  <div key={conn.originalIdx} className="flex flex-wrap items-center gap-1.5 p-2 rounded bg-slate-900/60 border border-white/[0.04]">
                    <select
                      value={conn.from}
                      onChange={(e) => {
                        const updated = [...connections];
                        updated[conn.originalIdx] = { ...updated[conn.originalIdx], from: e.target.value };
                        onChangeConnections(updated);
                      }}
                      className="bg-slate-950 border border-white/10 rounded px-1 py-0.5 text-[9px] text-white max-w-[80px] truncate"
                    >
                      {nodes.map(n => <option key={n.id} value={n.id}>{n.label || n.id}</option>)}
                    </select>
                    <span className="text-[9px] text-text-muted">→</span>
                    <select
                      value={conn.to}
                      onChange={(e) => {
                        const updated = [...connections];
                        updated[conn.originalIdx] = { ...updated[conn.originalIdx], to: e.target.value };
                        onChangeConnections(updated);
                      }}
                      className="bg-slate-950 border border-white/10 rounded px-1 py-0.5 text-[9px] text-white max-w-[80px] truncate"
                    >
                      {nodes.map(n => <option key={n.id} value={n.id}>{n.label || n.id}</option>)}
                    </select>
                    <input
                      type="color"
                      value={conn.color || '#38bdf8'}
                      onChange={(e) => {
                        const updated = [...connections];
                        updated[conn.originalIdx] = { ...updated[conn.originalIdx], color: e.target.value };
                        onChangeConnections(updated);
                      }}
                      className="w-4 h-4 bg-transparent border-none cursor-pointer p-0 shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => deleteConnection(conn.originalIdx)}
                      className="text-red-400 hover:text-white p-0.5 ml-auto rounded transition-colors shrink-0"
                      aria-label="Delete connection"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ================= SUB-COMPONENT: RECURSIVE FOLDER TREE ITEM =================
const FolderTreeNode = ({ node, onAddFile, onAddFolder, onRename, onDelete, onSelectFile, selectedFileIdx }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState(node.name);

  React.useEffect(() => {
    setRenameValue(node.name);
  }, [node.name]);

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      onRename(node.path, renameValue.trim(), node.type);
    }
    setIsEditing(false);
  };

  const isFile = node.type === 'file';

  return (
    <div className="pl-3 border-l border-white/5 space-y-1 mt-1">
      <div className={`flex items-center justify-between group py-1 px-1.5 rounded hover:bg-white/[0.02] transition-colors ${
        isFile && selectedFileIdx === node.fileIndex ? 'bg-accent/15 text-accent' : ''
      }`}>
        <div 
          className="flex items-center gap-1.5 min-w-0 cursor-pointer flex-1" 
          onClick={() => {
            if (isFile) {
              onSelectFile(node.fileIndex);
            } else {
              setIsOpen(!isOpen);
            }
          }}
        >
          <span className="text-[10px] text-text-muted shrink-0 select-none">
            {isFile ? '📄' : isOpen ? '📂' : '📁'}
          </span>
          {isEditing ? (
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="bg-slate-900 border border-accent/40 rounded px-1 text-[10px] text-white outline-none w-28 py-0.5"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`text-[10px] font-mono truncate select-none ${
              isFile 
                ? selectedFileIdx === node.fileIndex 
                  ? 'text-accent font-bold' 
                  : 'text-white/80' 
                : 'text-text-muted'
            }`}>
              {node.name}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {!isFile && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAddFile(node.path); }}
                title="Add File"
                className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded text-[8px] font-bold"
              >
                📄+
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAddFolder(node.path); }}
                title="Add Folder"
                className="text-amber-400 hover:text-amber-300 p-0.5 rounded text-[8px] font-bold"
              >
                📁+
              </button>
            </>
          )}
          {node.path !== '' && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                title="Rename"
                className="text-sky-400 hover:text-sky-300 p-0.5 text-[8px]"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(node.path, node.type); }}
                title="Delete"
                className="text-red-400 hover:text-red-300 p-0.5 text-[8px]"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {!isFile && isOpen && node.children && node.children.length > 0 && (
        <div className="space-y-0.5">
          {node.children.map((child, idx) => (
            <FolderTreeNode
              key={idx}
              node={child}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
              onRename={onRename}
              onDelete={onDelete}
              onSelectFile={onSelectFile}
              selectedFileIdx={selectedFileIdx}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FieldEditor;

