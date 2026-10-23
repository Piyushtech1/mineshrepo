import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ProjectCategory } from '../../server/db/schema';
import { Plus, Edit2, Trash2, Check, AlertCircle, Tags } from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<Array<ProjectCategory & { projectCount: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Edit / Add Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ProjectCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      setCategories(res.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingCat(null);
    setCatName('');
    setCatDesc('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: ProjectCategory) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await api.updateCategory(editingCat.id, { name: catName, description: catDesc });
        showNotice(`Category "${catName}" updated.`);
      } else {
        await api.createCategory({ name: catName, description: catDesc });
        showNotice(`Category "${catName}" created.`);
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      showNotice(`Category deleted.`);
      await loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Project Categories
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Define creative taxonomy for the portfolio gallery and filters
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">
          Loading categories...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono-meta text-[11px] text-amber-500 font-bold uppercase">
                    /{cat.slug}
                  </span>
                  <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-mono-meta text-zinc-300">
                    {cat.projectCount} Projects
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold text-white">
                  {cat.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="rounded p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0e0f12] p-6 shadow-2xl flex flex-col gap-5"
          >
            <div className="flex items-center gap-2 text-amber-500">
              <Tags className="h-5 w-5" />
              <h3 className="font-heading text-lg font-bold text-white">
                {editingCat ? 'Edit Category' : 'Create Category'}
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono-meta text-zinc-400">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={catName}
                onChange={e => setCatName(e.target.value)}
                placeholder="e.g. Spatial & 3D Artwork"
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono-meta text-zinc-400">
                Description
              </label>
              <textarea
                rows={3}
                value={catDesc}
                onChange={e => setCatDesc(e.target.value)}
                placeholder="Brief summary of projects in this category..."
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 shadow"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
