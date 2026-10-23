import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../services/api';
import { MediaAsset } from '../../server/db/schema';
import {
  Upload,
  Search,
  Filter,
  Copy,
  Check,
  Trash2,
  Eye,
  AlertTriangle,
  HardDrive,
  FileVideo,
  FileImage,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';

export const MediaLibraryView: React.FC = () => {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Asset Preview & Edit Modal
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [altInput, setAltInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');

  // Safe Deletion Conflict state
  const [conflictAsset, setConflictAsset] = useState<{
    asset: MediaAsset;
    usedIn: { projects: string[]; profile: boolean; resume: boolean; customPages: string[] };
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await api.getMedia({
        type: typeFilter === 'all' ? undefined : typeFilter,
        search: search.trim() || undefined,
      });
      setMedia(res.media);
    } catch (err) {
      console.error('Failed to load media assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [typeFilter, search]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const res = await api.uploadMedia(Array.from(files));
      showNotice(`Successfully uploaded ${res.assets.length} file(s).`);
      await loadMedia();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenPreview = (asset: MediaAsset) => {
    setSelectedAsset(asset);
    setAltInput(asset.alt || '');
    setCaptionInput(asset.caption || '');
  };

  const handleSaveMetadata = async () => {
    if (!selectedAsset) return;
    try {
      await api.updateMedia(selectedAsset.id, {
        alt: altInput,
        caption: captionInput,
      });
      showNotice('Asset metadata saved.');
      setSelectedAsset(null);
      await loadMedia();
    } catch (err: any) {
      alert(err.message || 'Failed to update metadata');
    }
  };

  const handleDelete = async (asset: MediaAsset, force = false) => {
    try {
      // Check usage first
      const usageRes = await api.checkMediaUsage(asset.id);
      if (usageRes.usage.isUsed && !force) {
        setConflictAsset({ asset, usedIn: usageRes.usage.usedIn });
        return;
      }

      await api.deleteMedia(asset.id, force);
      showNotice('Asset deleted.');
      setConflictAsset(null);
      if (selectedAsset?.id === asset.id) setSelectedAsset(null);
      await loadMedia();
    } catch (err: any) {
      alert(err.message || 'Failed to delete asset');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Media Asset Library
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Centralized creative storage with Cloudflare R2 and local filesystem support
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/mp4,video/webm,application/pdf"
            onChange={e => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            <span>{isUploading ? 'Uploading Assets...' : 'Upload Media Files'}</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        className="rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors hover:border-amber-500/50 hover:bg-zinc-900/60 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/80 text-amber-400">
          <Upload className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-heading text-sm font-bold text-white">
            Drag and drop images, videos, or PDFs here
          </span>
          <span className="text-xs font-mono-meta text-zinc-400">
            Supports JPEG, PNG, WebP, GIF, SVG, MP4, WebM (up to 100MB per file)
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['all', 'image', 'video', 'document'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setTypeFilter(tab)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                typeFilter === tab
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? `All (${media.length})` : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets by name or alt..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">
          Loading media library...
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-16 text-center text-xs font-mono-meta text-zinc-400">
          No media assets found. Upload your first artwork or photograph.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map(asset => (
            <div
              key={asset.id}
              className="group relative rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden flex flex-col justify-between"
            >
              {/* Media Thumbnail */}
              <div
                onClick={() => handleOpenPreview(asset)}
                className="relative aspect-square w-full cursor-pointer overflow-hidden bg-zinc-950"
              >
                {asset.type === 'image' ? (
                  <img
                    src={asset.url}
                    alt={asset.alt || asset.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : asset.type === 'video' ? (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-zinc-950 text-zinc-400">
                    <FileVideo className="h-10 w-10 text-amber-400" />
                    <span className="text-[10px] font-mono-meta">Video File</span>
                  </div>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-zinc-950 text-zinc-400">
                    <FileText className="h-10 w-10 text-sky-400" />
                    <span className="text-[10px] font-mono-meta">PDF Document</span>
                  </div>
                )}

                {/* Storage pill */}
                <div className="absolute top-2 left-2">
                  <span className="rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-mono-meta text-zinc-300 border border-white/10 uppercase">
                    {asset.storage}
                  </span>
                </div>

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleCopyUrl(asset.url, asset.id);
                    }}
                    className="p-2 rounded bg-zinc-800 text-white hover:bg-zinc-700"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenPreview(asset);
                    }}
                    className="p-2 rounded bg-zinc-800 text-white hover:bg-zinc-700"
                    title="Preview & Edit Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(asset);
                    }}
                    className="p-2 rounded bg-rose-600/80 text-white hover:bg-rose-600"
                    title="Delete Asset"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Label & size */}
              <div className="p-2.5 flex flex-col gap-0.5 bg-zinc-900">
                <span className="text-xs font-medium text-white truncate" title={asset.originalName || asset.name}>
                  {asset.originalName || asset.name}
                </span>
                <div className="flex items-center justify-between text-[10px] font-mono-meta text-zinc-400">
                  <span>{formatBytes(asset.size)}</span>
                  <span>{asset.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asset Preview & Edit Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#0e0f12] p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-heading text-lg font-bold text-white truncate max-w-md">
                {selectedAsset.originalName || selectedAsset.name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Media display */}
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center max-h-72">
              {selectedAsset.type === 'image' ? (
                <img src={selectedAsset.url} alt={selectedAsset.alt} className="max-h-72 object-contain" />
              ) : selectedAsset.type === 'video' ? (
                <video src={selectedAsset.url} controls className="max-h-72 w-full" />
              ) : (
                <div className="p-8 text-center text-xs font-mono-meta text-zinc-400">
                  PDF Document: <a href={selectedAsset.url} target="_blank" rel="noreferrer" className="text-amber-400 underline">Open in new tab</a>
                </div>
              )}
            </div>

            {/* Metadata fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-meta text-zinc-400 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div>Size: <span className="text-white">{formatBytes(selectedAsset.size)}</span></div>
              <div>MIME: <span className="text-white">{selectedAsset.mimeType}</span></div>
              <div>Storage: <span className="text-white uppercase">{selectedAsset.storage}</span></div>
              <div>Uploaded: <span className="text-white">{new Date(selectedAsset.createdAt).toLocaleDateString()}</span></div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <span>URL:</span>
                <span className="text-white truncate flex-1">{selectedAsset.url}</span>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(selectedAsset.url, selectedAsset.id)}
                  className="rounded bg-zinc-800 px-2 py-1 text-zinc-200 hover:text-white text-[11px]"
                >
                  {copiedId === selectedAsset.id ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono-meta text-zinc-400">Alt Text (Accessibility & SEO)</label>
                <input
                  type="text"
                  value={altInput}
                  onChange={e => setAltInput(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
                  placeholder="Descriptive text of the visual..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono-meta text-zinc-400">Default Caption</label>
                <input
                  type="text"
                  value={captionInput}
                  onChange={e => setCaptionInput(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
                  placeholder="Optional caption..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
              <button
                type="button"
                onClick={() => handleDelete(selectedAsset)}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Asset</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAsset(null)}
                  className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMetadata}
                  className="rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 shadow"
                >
                  Save Metadata
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safe Asset Deletion Warning Modal */}
      {conflictAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#0e0f12] p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="font-heading text-lg font-bold text-white">
                Asset Is Currently In Use!
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This media file is referenced by active portfolio content. Deleting it may result in broken images or missing videos:
            </p>

            <ul className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-amber-300 flex flex-col gap-1 max-h-36 overflow-y-auto font-mono-meta">
              {conflictAsset.usedIn.projects.map(p => (
                <li key={p}>• Project: {p}</li>
              ))}
              {conflictAsset.usedIn.profile && <li>• Designer Profile / Avatar</li>}
              {conflictAsset.usedIn.resume && <li>• Resume Download Asset</li>}
              {conflictAsset.usedIn.customPages.map(cp => (
                <li key={cp}>• Custom Page: {cp}</li>
              ))}
            </ul>

            <div className="mt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConflictAsset(null)}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Keep Asset Safe
              </button>
              <button
                type="button"
                onClick={() => handleDelete(conflictAsset.asset, true)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-md"
              >
                Force Delete Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
