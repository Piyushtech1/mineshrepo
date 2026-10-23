import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { usePortfolio } from '../../context/PortfolioContext';
import { Profile } from '../../server/db/schema';
import { Save, Check, User, AlertCircle } from 'lucide-react';

export const ProfileBioView: React.FC = () => {
  const { refreshPublicData } = usePortfolio();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getProfile();
        setProfile(res.profile);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    try {
      await api.updateProfile(profile);
      await refreshPublicData();
      setNotice('Profile updated successfully.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !profile) {
    return <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">Loading profile data...</div>;
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Profile & Biography
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Designer name, professional title, avatars, and contact channels
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Designer Full Name *</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Professional Title *</label>
            <input
              type="text"
              required
              value={profile.title}
              onChange={e => setProfile({ ...profile, title: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-xs font-mono-meta text-zinc-400">Hero Tagline *</label>
            <input
              type="text"
              required
              value={profile.tagline}
              onChange={e => setProfile({ ...profile, tagline: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-xs font-mono-meta text-zinc-400">Homepage Summary / Bio *</label>
            <textarea
              rows={4}
              required
              value={profile.bio}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Profile Photo URL</label>
            <input
              type="text"
              value={profile.avatarUrl}
              onChange={e => setProfile({ ...profile, avatarUrl: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white font-mono"
            />
            {profile.avatarUrl && (
              <img src={profile.avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover border border-zinc-700 mt-1" />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Hero Landscape Image URL</label>
            <input
              type="text"
              value={profile.heroImage}
              onChange={e => setProfile({ ...profile, heroImage: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white font-mono"
            />
            {profile.heroImage && (
              <img src={profile.heroImage} alt="Hero" className="h-16 w-32 rounded object-cover border border-zinc-700 mt-1" />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Studio Location</label>
            <input
              type="text"
              value={profile.location}
              onChange={e => setProfile({ ...profile, location: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Public Contact Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Years of Experience</label>
            <input
              type="text"
              value={profile.yearsOfExperience}
              onChange={e => setProfile({ ...profile, yearsOfExperience: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">Availability Notice</label>
            <input
              type="text"
              value={profile.availabilityNotice}
              onChange={e => setProfile({ ...profile, availabilityNotice: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
          <input
            id="available-check"
            type="checkbox"
            checked={profile.availableForWork}
            onChange={e => setProfile({ ...profile, availableForWork: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500"
          />
          <label htmlFor="available-check" className="text-xs font-medium text-zinc-200 cursor-pointer">
            Mark studio as currently available for new client commissions (displays green status badge)
          </label>
        </div>
      </div>
    </form>
  );
};
