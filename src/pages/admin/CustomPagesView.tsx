import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { CustomPage } from '../../server/db/schema';
import { Plus, Edit2, Trash2, Check, FileCode, ExternalLink, Eye } from 'lucide-react';

export const CustomPagesView: React.FC = () => {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [formData, setFormData] = useState<Partial<CustomPage>>({
    title: '',
    slug: '',
    seoTitle: '',
    seoDescription: '',
    featuredImage: '',
    visible: true,
    inNavigation: false,
    blocks: [],
  });
  const [contentInput, setContentInput] = useState('');

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminPages();
      setPages(res.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      seoTitle: '',
      seoDescription: '',
      visible: true,
      inNavigation: true,
    });
    setContentInput('');
    setModalOpen(true);
  };

  const handleOpenEdit = (page: CustomPage) => {
    setEditingPage(page);
    setFormData(page);
    setContentInput((page.blocks || []).map(b => b.content || '').join('\n\n'));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const blocks = contentInput
      .split('\n\n')
      .map(t => t.trim())
      .filter(Boolean)
      .map(text => ({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        type: 'text' as const,
        content: text,
      }));

    const payload = {
      ...formData,
      blocks,
    };

    try {
      if (editingPage) {
        await api.updatePage(editingPage.id, payload);
        showNotice('Custom page updated.');
      } else {
        await api.createPage(payload);
        showNotice('Custom page published.');
      }
      setModalOpen(false);
      await loadPages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this custom page?')) return;
    try {
      await api.deletePage(id);
      showNotice('Page deleted.');
      await loadPages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Custom Pages Engine
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Publish supplementary public pages (e.g. commission process, terms, manifesto) with dynamic URLs
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Page</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">Loading custom pages...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pages.map(page => (
            <div
              key={page.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono-meta text-xs text-amber-500 font-bold">
                    /pages/{page.slug}
                  </span>
                  <span className={`text-[10px] font-mono-meta px-2 py-0.5 rounded ${page.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {page.visible ? 'Published' : 'Hidden'}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold text-white">
                  {page.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {page.seoDescription || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4">
                <a
                  href={`/pages/${page.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview Page</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(page)}
                    className="rounded p-1.5 text-zinc-400 hover:text-white text-xs flex items-center gap-1"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(page.id)}
                    className="rounded p-1.5 text-rose-400 hover:bg-rose-500/10 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0e0f12] p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-heading text-lg font-bold text-white">
              {editingPage ? 'Edit Custom Page' : 'Create Custom Page'}
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Page Title *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                placeholder="Studio Commission Process"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">URL Slug</label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white font-mono"
                placeholder="commission-process"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Page Content Paragraphs (separate by empty line)</label>
              <textarea
                rows={6}
                value={contentInput}
                onChange={e => setContentInput(e.target.value)}
                placeholder="First paragraph...&#10;&#10;Second paragraph..."
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.visible}
                  onChange={e => setFormData({ ...formData, visible: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500"
                />
                <span>Visible to Public</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inNavigation}
                  onChange={e => setFormData({ ...formData, inNavigation: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500"
                />
                <span>Show in Header Navigation</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded border border-zinc-800 px-4 py-2 text-xs text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400"
              >
                Save Page
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
