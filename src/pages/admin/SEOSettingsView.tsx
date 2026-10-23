import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { usePortfolio } from '../../context/PortfolioContext';
import { SiteSettings } from '../../server/db/schema';
import { Save, Check, Globe } from 'lucide-react';

export const SEOSettingsView: React.FC = () => {
  const { refreshPublicData } = usePortfolio();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getAdminSettings();
        setSettings(res.settings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await api.updateSettings(settings);
      await refreshPublicData();
      setNotice('SEO & Meta settings updated.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">Loading SEO settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            SEO & Search Visibility
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            OpenGraph social cards, search engine index titles, and footer legal text
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save SEO'}</span>
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
          <label className="text-xs font-mono-meta text-zinc-400">Global Website Title *</label>
          <input
            type="text"
            required
            value={settings.siteTitle}
            onChange={e => setSettings({ ...settings, siteTitle: e.target.value })}
            className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono-meta text-zinc-400">Website Tagline</label>
          <input
            type="text"
            value={settings.siteTagline}
            onChange={e => setSettings({ ...settings, siteTagline: e.target.value })}
            className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono-meta text-zinc-400">Footer Tagline & Studio Intro</label>
          <textarea
            rows={3}
            value={settings.footerText}
            onChange={e => setSettings({ ...settings, footerText: e.target.value })}
            className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono-meta text-zinc-400">Copyright Line</label>
          <input
            type="text"
            value={settings.copyrightNotice}
            onChange={e => setSettings({ ...settings, copyrightNotice: e.target.value })}
            className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
          />
        </div>
      </div>
    </form>
  );
};
