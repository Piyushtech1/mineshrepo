import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { TestimonialItem } from '../../server/db/schema';
import { Plus, Edit2, Trash2, Check, Quote } from 'lucide-react';

export const TestimonialsView: React.FC = () => {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);
  const [formData, setFormData] = useState<Partial<TestimonialItem>>({
    clientName: '',
    clientRole: '',
    company: '',
    quote: '',
    projectTitle: '',
    avatarUrl: '',
    active: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminTestimonials();
      setItems(res.testimonials);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ clientName: '', clientRole: '', company: '', quote: '', active: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingItem(item);
    setFormData(item);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateTestimonial(editingItem.id, formData);
        showNotice('Endorsement updated.');
      } else {
        await api.createTestimonial(formData);
        showNotice('Endorsement created.');
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await api.deleteTestimonial(id);
      showNotice('Testimonial deleted.');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Client Testimonials & Endorsements
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Quotes from founders, curators, and creative directors displayed across the portfolio
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow"
        >
          <Plus className="h-4 w-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">Loading endorsements...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(item => (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-3">
                <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/80">
                  <div className="flex flex-col">
                    <span className="font-heading text-sm font-bold text-white">
                      {item.clientName}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {item.clientRole}, {item.company}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-800/80 pt-3">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="rounded p-1.5 text-zinc-400 hover:text-white text-xs flex items-center gap-1"
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
              {editingItem ? 'Edit Endorsement' : 'Add Testimonial'}
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Client / Collaborator Name *</label>
              <input
                type="text"
                required
                value={formData.clientName || ''}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono-meta text-zinc-400">Title / Role</label>
                <input
                  type="text"
                  value={formData.clientRole || ''}
                  onChange={e => setFormData({ ...formData, clientRole: e.target.value })}
                  className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono-meta text-zinc-400">Company</label>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Testimonial Quote *</label>
              <textarea
                rows={4}
                required
                value={formData.quote || ''}
                onChange={e => setFormData({ ...formData, quote: e.target.value })}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-amber-500 px-4 py-1.5 text-xs font-bold text-zinc-950"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
