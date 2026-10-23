import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { usePortfolio } from '../../context/PortfolioContext';
import { SiteSettings } from '../../server/db/schema';
import { Save, Check, Palette, Sparkles } from 'lucide-react';

export const AppearanceView: React.FC = () => {
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
      setNotice('Website appearance settings updated.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">Loading appearance...</div>;
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Website Appearance & Styling
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Brand palette colors, typography fonts, gallery column density, and hero layouts
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Apply Appearance'}</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Palette & Theme */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-5">
        <h2 className="font-heading text-lg font-bold text-white border-b border-zinc-800 pb-2">
          1. Color Scheme & Accent Tokens
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Primary Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.accentColor}
                onChange={e => setSettings({ ...settings, accentColor: e.target.value })}
                className="h-10 w-14 rounded border border-zinc-700 bg-zinc-900 cursor-pointer"
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={e => setSettings({ ...settings, accentColor: e.target.value })}
                className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Background Tone</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                className="h-10 w-14 rounded border border-zinc-700 bg-zinc-900 cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Default Theme Mode</label>
            <select
              value={settings.themeMode}
              onChange={e => setSettings({ ...settings, themeMode: e.target.value as any })}
              className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
            >
              <option value="dark">Dark Modernist</option>
              <option value="light">Light Editorial</option>
              <option value="system">Follow System</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Hero Section Aesthetic</label>
            <select
              value={settings.heroLayout}
              onChange={e => setSettings({ ...settings, heroLayout: e.target.value as any })}
              className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
            >
              <option value="editorial">Editorial Asymmetric (Recommended)</option>
              <option value="split">Split Two-Column</option>
              <option value="centered">Monolithic Center</option>
              <option value="minimal">Minimal Typographic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Typography & Layout Density */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-5">
        <h2 className="font-heading text-lg font-bold text-white border-b border-zinc-800 pb-2">
          2. Typography & Grid Structure
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Display / Heading Font</label>
            <select
              value={settings.fontHeading}
              onChange={e => setSettings({ ...settings, fontHeading: e.target.value })}
              className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
            >
              <option value="Syne">Syne (Geometric Sculptural)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Clean Modern)</option>
              <option value="Inter">Inter (Swiss Neutral)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Body Typography</label>
            <select
              value={settings.fontBody}
              onChange={e => setSettings({ ...settings, fontBody: e.target.value })}
              className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Editorial)</option>
              <option value="Inter">Inter</option>
              <option value="system-ui">System Default Sans</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Gallery Grid Columns (Desktop)</label>
            <select
              value={settings.gridColumns}
              onChange={e => setSettings({ ...settings, gridColumns: Number(e.target.value) })}
              className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
            >
              <option value={2}>2 Columns (Large Behance Previews)</option>
              <option value={3}>3 Columns (Gallery Density)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Featured Projects Count</label>
            <input
              type="number"
              min="1"
              max="12"
              value={settings.featuredProjectsCount}
              onChange={e => setSettings({ ...settings, featuredProjectsCount: Number(e.target.value) })}
              className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
