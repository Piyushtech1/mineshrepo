import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ExperienceItem } from '../../server/db/schema';
import { Plus, Edit2, Trash2, Check, Briefcase } from 'lucide-react';

export const ExperienceView: React.FC = () => {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);
  const [formData, setFormData] = useState<Partial<ExperienceItem>>({
    jobTitle: '',
    company: '',
    location: '',
    employmentType: 'Full-time',
    startDate: '',
    endDate: 'Present',
    isCurrent: false,
    description: '',
    responsibilities: [],
    achievements: [],
  });

  const [respInput, setRespInput] = useState('');
  const [achInput, setAchInput] = useState('');

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await api.getExperience();
      setItems(res.experience);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      jobTitle: '',
      company: '',
      location: 'Berlin / Remote',
      employmentType: 'Director',
      startDate: '2024',
      endDate: 'Present',
      isCurrent: true,
      description: '',
      responsibilities: [],
      achievements: [],
    });
    setRespInput('');
    setAchInput('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ExperienceItem) => {
    setEditingItem(item);
    setFormData(item);
    setRespInput((item.responsibilities || []).join('\n'));
    setAchInput((item.achievements || []).join('\n'));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      responsibilities: respInput.split('\n').map(s => s.trim()).filter(Boolean),
      achievements: achInput.split('\n').map(s => s.trim()).filter(Boolean),
    };

    try {
      if (editingItem) {
        await api.updateExperience(editingItem.id, payload);
        showNotice('Experience entry updated.');
      } else {
        await api.createExperience(payload);
        showNotice('Experience entry added.');
      }
      setModalOpen(false);
      await loadItems();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this experience entry?')) return;
    try {
      await api.deleteExperience(id);
      showNotice('Entry deleted.');
      await loadItems();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Manage Experience Timeline
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Professional roles, studios, responsibilities, and key achievements
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow"
        >
          <Plus className="h-4 w-4" />
          <span>Add Position</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">Loading experience...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-zinc-700"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-xl font-bold text-white">
                    {item.jobTitle}
                  </span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-amber-400">
                    {item.company}
                  </span>
                  <span className="text-xs font-mono-meta text-zinc-400">
                    ({item.startDate} — {item.isCurrent ? 'Present' : item.endDate})
                  </span>
                </div>
                <p className="text-xs text-zinc-300 max-w-2xl">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="rounded p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs flex items-center gap-1"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded p-2 text-rose-400 hover:bg-rose-500/10 text-xs flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0e0f12] p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-heading text-lg font-bold text-white">
              {editingItem ? 'Edit Experience Entry' : 'Add Experience Entry'}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-mono-meta text-zinc-400">Job Title *</label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle || ''}
                  onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono-meta text-zinc-400">Company *</label>
                <input
                  type="text"
                  required
                  value={formData.company || ''}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono-meta text-zinc-400">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono-meta text-zinc-400">Start Year</label>
                <input
                  type="text"
                  value={formData.startDate || ''}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono-meta text-zinc-400">End Year (or Present)</label>
                <input
                  type="text"
                  value={formData.endDate || ''}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Role Summary</label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Responsibilities (one per line)</label>
              <textarea
                rows={3}
                value={respInput}
                onChange={e => setRespInput(e.target.value)}
                placeholder="Direct branding teams...&#10;Supervise print runs..."
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Key Achievements (one per line)</label>
              <textarea
                rows={2}
                value={achInput}
                onChange={e => setAchInput(e.target.value)}
                placeholder="European Design Award Gold 2024..."
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400"
              >
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
