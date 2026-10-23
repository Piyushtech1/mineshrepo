import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AboutPageData } from '../../server/db/schema';
import { Save, Check, Plus, Trash2 } from 'lucide-react';

export const AboutPageView: React.FC = () => {
  const [about, setAbout] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await api.getAbout();
        setAbout(res.about);
      } catch (err) {
        console.error('Failed to load about data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!about) return;
    setIsSaving(true);
    try {
      await api.updateAbout(about);
      setNotice('About page updated successfully.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save about data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddParagraph = () => {
    if (!about) return;
    setAbout({
      ...about,
      bioParagraphs: [...about.bioParagraphs, 'New paragraph content...'],
    });
  };

  const handleUpdateParagraph = (index: number, text: string) => {
    if (!about) return;
    const updated = [...about.bioParagraphs];
    updated[index] = text;
    setAbout({ ...about, bioParagraphs: updated });
  };

  const handleRemoveParagraph = (index: number) => {
    if (!about) return;
    setAbout({
      ...about,
      bioParagraphs: about.bioParagraphs.filter((_, i) => i !== index),
    });
  };

  const handleAddAchievement = () => {
    if (!about) return;
    setAbout({
      ...about,
      achievements: [
        ...about.achievements,
        {
          id: `ach_${Date.now()}`,
          year: new Date().getFullYear().toString(),
          title: 'Award or Selection Title',
          organization: 'Institution Name',
        },
      ],
    });
  };

  const handleUpdateAchievement = (index: number, field: string, val: string) => {
    if (!about) return;
    const updated = [...about.achievements];
    updated[index] = { ...updated[index], [field]: val };
    setAbout({ ...about, achievements: updated });
  };

  const handleRemoveAchievement = (index: number) => {
    if (!about) return;
    setAbout({
      ...about,
      achievements: about.achievements.filter((_, i) => i !== index),
    });
  };

  if (loading || !about) {
    return <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">Loading about page...</div>;
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            About Page Content
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Creative philosophy, full biography paragraphs, and award selections
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold text-white border-b border-zinc-800 pb-2">
          1. Page Header & Photo
        </h2>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono-meta text-zinc-400">Main Heading</label>
          <input
            type="text"
            required
            value={about.heading}
            onChange={e => setAbout({ ...about, heading: e.target.value })}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono-meta text-zinc-400">Subheading / Introduction</label>
          <textarea
            rows={2}
            value={about.subheading}
            onChange={e => setAbout({ ...about, subheading: e.target.value })}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono-meta text-zinc-400">Portrait Image URL</label>
          <input
            type="text"
            value={about.profilePhoto}
            onChange={e => setAbout({ ...about, profilePhoto: e.target.value })}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white font-mono"
          />
        </div>
      </div>

      {/* Biography Paragraphs */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h2 className="font-heading text-lg font-bold text-white">
            2. Long-Form Biography Paragraphs
          </h2>
          <button
            type="button"
            onClick={handleAddParagraph}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Paragraph</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {about.bioParagraphs.map((para, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="font-mono-meta text-xs text-zinc-400 pt-2 w-6">0{i + 1}</span>
              <textarea
                rows={3}
                value={para}
                onChange={e => handleUpdateParagraph(i, e.target.value)}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveParagraph(i)}
                className="p-2 text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Philosophy & Story */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold text-white border-b border-zinc-800 pb-2">
          3. Philosophy & Personal Roots
        </h2>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono-meta text-zinc-400">Creative Philosophy Quote</label>
          <textarea
            rows={2}
            value={about.creativePhilosophy}
            onChange={e => setAbout({ ...about, creativePhilosophy: e.target.value })}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono-meta text-zinc-400">Personal Background & Story</label>
          <textarea
            rows={3}
            value={about.personalStory}
            onChange={e => setAbout({ ...about, personalStory: e.target.value })}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Awards & Achievements */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h2 className="font-heading text-lg font-bold text-white">
            4. Awards & Honors
          </h2>
          <button
            type="button"
            onClick={handleAddAchievement}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Honor</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {about.achievements.map((ach, idx) => (
            <div key={ach.id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <input
                type="text"
                value={ach.year}
                onChange={e => handleUpdateAchievement(idx, 'year', e.target.value)}
                placeholder="Year"
                className="sm:col-span-2 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-white"
              />
              <input
                type="text"
                value={ach.title}
                onChange={e => handleUpdateAchievement(idx, 'title', e.target.value)}
                placeholder="Title / Honor"
                className="sm:col-span-5 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-white"
              />
              <input
                type="text"
                value={ach.organization}
                onChange={e => handleUpdateAchievement(idx, 'organization', e.target.value)}
                placeholder="Organization"
                className="sm:col-span-4 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => handleRemoveAchievement(idx)}
                className="sm:col-span-1 p-1 text-rose-400 hover:text-rose-300 text-center"
              >
                <Trash2 className="h-4 w-4 mx-auto" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
