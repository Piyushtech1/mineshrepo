import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { EducationItem } from '../../server/db/schema';
import { Plus, Edit2, Trash2, Check, GraduationCap } from 'lucide-react';

export const EducationView: React.FC = () => {
  const [items, setItems] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);
  const [formData, setFormData] = useState<Partial<EducationItem>>({
    institution: '',
    qualification: '',
    course: '',
    startDate: '',
    endDate: '',
    description: '',
    certificateUrl: '',
  });

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await api.getEducation();
      setItems(res.education);
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
      institution: '',
      qualification: 'Master of Arts (MA)',
      course: '',
      startDate: '2022',
      endDate: '2024',
      description: '',
      certificateUrl: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: EducationItem) => {
    setEditingItem(item);
    setFormData(item);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateEducation(editingItem.id, formData);
        showNotice('Education record updated.');
      } else {
        await api.createEducation(formData);
        showNotice('Education record created.');
      }
      setModalOpen(false);
      await loadItems();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this education entry?')) return;
    try {
      await api.deleteEducation(id);
      showNotice('Record deleted.');
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
            Manage Education & Diplomas
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Academic degrees, institutions, and certificates
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow"
        >
          <Plus className="h-4 w-4" />
          <span>Add Academic Record</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">Loading education...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(item => (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <span className="font-mono-meta text-xs font-bold text-amber-400 uppercase">
                  {item.qualification}
                </span>
                <h3 className="font-heading text-xl font-bold text-white">
                  {item.institution}
                </h3>
                <span className="text-xs font-semibold text-zinc-300">
                  {item.course} ({item.startDate} — {item.endDate})
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="rounded p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10 text-xs flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0e0f12] p-6 shadow-2xl flex flex-col gap-4"
          >
            <h3 className="font-heading text-lg font-bold text-white">
              {editingItem ? 'Edit Education Record' : 'Add Academic Record'}
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Institution *</label>
              <input
                type="text"
                required
                value={formData.institution || ''}
                onChange={e => setFormData({ ...formData, institution: e.target.value })}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                placeholder="Royal College of Art"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Degree / Qualification *</label>
              <input
                type="text"
                required
                value={formData.qualification || ''}
                onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                placeholder="Master of Arts (MA)"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Course / Specialization</label>
              <input
                type="text"
                value={formData.course || ''}
                onChange={e => setFormData({ ...formData, course: e.target.value })}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                placeholder="Visual Communication"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                <label className="text-xs font-mono-meta text-zinc-400">End Year</label>
                <input
                  type="text"
                  value={formData.endDate || ''}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Description</label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
