import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ResumeData } from '../../server/db/schema';
import { Save, Check, FileDown, ExternalLink } from 'lucide-react';

export const ResumeView: React.FC = () => {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.getResume();
        setResume(res.resume);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return;
    setIsSaving(true);
    try {
      await api.updateResume(resume);
      setNotice('Resume settings updated.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !resume) {
    return <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">Loading resume...</div>;
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Resume / CV Management
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Configure the downloadable portfolio resume and visibility
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono-meta text-zinc-400">Document Title</label>
          <input
            type="text"
            required
            value={resume.title}
            onChange={e => setResume({ ...resume, title: e.target.value })}
            className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono-meta text-zinc-400">PDF File URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={resume.fileUrl}
              onChange={e => setResume({ ...resume, fileUrl: e.target.value })}
              className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white font-mono"
            />
            {resume.fileUrl && (
              <a
                href={resume.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 hover:text-white flex items-center gap-1"
              >
                <span>View</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono-meta text-zinc-400">Filename for Download</label>
            <input
              type="text"
              value={resume.fileName}
              onChange={e => setResume({ ...resume, fileName: e.target.value })}
              className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono-meta text-zinc-400">Version String</label>
            <input
              type="text"
              value={resume.version}
              onChange={e => setResume({ ...resume, version: e.target.value })}
              className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono-meta text-zinc-400">Download Button Text</label>
          <input
            type="text"
            value={resume.downloadButtonText}
            onChange={e => setResume({ ...resume, downloadButtonText: e.target.value })}
            className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
          />
        </div>

        <div className="pt-3 border-t border-zinc-800 flex items-center gap-3">
          <input
            id="visible-check"
            type="checkbox"
            checked={resume.isVisible}
            onChange={e => setResume({ ...resume, isVisible: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500"
          />
          <label htmlFor="visible-check" className="text-xs font-medium text-zinc-200 cursor-pointer">
            Enable resume viewing and downloading on the public website
          </label>
        </div>
      </div>
    </form>
  );
};
