import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Project, ProjectCategory, ContentBlock, ContentBlockType } from '../../server/db/schema';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Video,
  Type,
  Heading,
  Quote,
  LayoutGrid,
  Check,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const ProjectEditorView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');

  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    slug: '',
    client: '',
    year: new Date().getFullYear().toString(),
    categorySlug: 'brand-identity',
    categoryName: 'Brand Identity',
    tags: ['Brand Identity'],
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
    featured: false,
    published: true,
    order: 1,
    summary: '',
    objectives: '',
    concept: '',
    process: '',
    challengesSolutions: '',
    results: '',
    seoTitle: '',
    seoDescription: '',
    blocks: [],
  });

  const [tagsInput, setTagsInput] = useState('Brand Identity');

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.getCategories();
        setCategories(catRes.categories);

        if (isEditing && id) {
          const projRes = await api.getAdminProjects();
          const found = projRes.projects.find(p => p.id === id);
          if (found) {
            setFormData(found);
            setTagsInput(found.tags.join(', '));
          }
        }
      } catch (err: any) {
        setErrorToast(err.message || 'Failed to initialize project editor');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEditing]);

  const handleCategoryChange = (slug: string) => {
    const cat = categories.find(c => c.slug === slug);
    setFormData(prev => ({
      ...prev,
      categorySlug: slug,
      categoryName: cat ? cat.name : slug,
    }));
  };

  const handleAddBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: `block_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      type,
      title: type === 'heading' ? 'New Section Heading' : undefined,
      content:
        type === 'text'
          ? 'Enter detailed case study prose here...'
          : type === 'quote'
          ? 'An inspirational quote from the creative director or client.'
          : undefined,
      caption: type === 'quote' ? 'Client or Director' : undefined,
      url:
        type === 'image'
          ? 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
          : type === 'video'
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          : undefined,
      layout: type === 'gallery' ? 'grid-2' : 'full',
      images:
        type === 'gallery'
          ? [
              { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', caption: 'Detail 01' },
              { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80', caption: 'Detail 02' },
            ]
          : undefined,
    };

    setFormData(prev => ({
      ...prev,
      blocks: [...(prev.blocks || []), newBlock],
    }));
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    setFormData(prev => ({
      ...prev,
      blocks: (prev.blocks || []).map(b => (b.id === blockId ? { ...b, ...updates } : b)),
    }));
  };

  const handleRemoveBlock = (blockId: string) => {
    setFormData(prev => ({
      ...prev,
      blocks: (prev.blocks || []).filter(b => b.id !== blockId),
    }));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = [...(formData.blocks || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return;

    const [moved] = blocks.splice(index, 1);
    blocks.splice(target, 0, moved);
    setFormData(prev => ({ ...prev, blocks }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessToast(null);
    setErrorToast(null);

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      tags: tagsArray,
    };

    try {
      if (isEditing && id) {
        await api.updateProject(id, payload);
        setSuccessToast('Project case study updated successfully!');
      } else {
        const res = await api.createProject(payload);
        setSuccessToast('Project created successfully!');
        navigate(`/admin/projects/${res.project.id}/edit`, { replace: true });
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Failed to save project.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">
        Loading project editor...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10 pb-20">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6 sticky top-16 bg-[#0a0b0d]/95 backdrop-blur-md z-20 py-2">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/projects"
            className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-white">
              {isEditing ? `Edit: ${formData.title}` : 'Create New Project'}
            </h1>
            <span className="text-[11px] font-mono-meta text-zinc-400">
              {isEditing ? `ID: ${id}` : 'Draft will be generated with responsive case study blocks'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing && formData.slug && (
            <Link
              to={`/projects/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </Link>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Case Study'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successToast && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* 1. Core Metadata Grid */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-6">
        <h2 className="font-heading text-lg font-bold text-white border-b border-zinc-800 pb-3">
          1. General Information & Categorization
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Title */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              placeholder="e.g. Lumina Architectural Lighting Identity"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              URL Slug (leave blank to auto-generate)
            </label>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none font-mono text-xs"
              placeholder="e.g. lumina-identity"
            />
          </div>

          {/* Client */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              Client / Commissioning Organization
            </label>
            <input
              type="text"
              value={formData.client || ''}
              onChange={e => setFormData({ ...formData, client: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              placeholder="e.g. Lumina Atelier Zurich"
            />
          </div>

          {/* Year */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              Year
            </label>
            <input
              type="text"
              value={formData.year || ''}
              onChange={e => setFormData({ ...formData, year: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              placeholder="2026"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              Category
            </label>
            <select
              value={formData.categorySlug || 'brand-identity'}
              onChange={e => handleCategoryChange(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              placeholder="Brand Identity, Swiss Typography, Stationery, Guidelines"
            />
          </div>

          {/* Cover Image URL */}
          <div className="flex flex-col gap-2 md:col-span-3">
            <label className="text-xs font-mono-meta text-zinc-400">
              Cover Image URL *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                required
                value={formData.coverImage || ''}
                onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none font-mono text-xs"
                placeholder="https://..."
              />
              <Link
                to="/admin/media"
                target="_blank"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 shrink-0"
              >
                Media Library
              </Link>
            </div>
            {formData.coverImage && (
              <div className="mt-2 h-28 w-44 rounded-lg overflow-hidden border border-zinc-800">
                <img src={formData.coverImage} alt="Cover preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 pt-4 border-t border-zinc-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-200">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={e => setFormData({ ...formData, published: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
            />
            <span>Published on website</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-200">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={e => setFormData({ ...formData, featured: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
            />
            <span>Feature on Homepage carousel</span>
          </label>
        </div>
      </div>

      {/* 2. Narrative Case Study Brief */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-6">
        <h2 className="font-heading text-lg font-bold text-white border-b border-zinc-800 pb-3">
          2. Executive Summary & Structured Case Study Brief
        </h2>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono-meta text-zinc-400">
            Project Summary * (Teaser displayed on cards and case study hero)
          </label>
          <textarea
            rows={3}
            required
            value={formData.summary || ''}
            onChange={e => setFormData({ ...formData, summary: e.target.value })}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            placeholder="A short, compelling summary of the design problem and execution..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              01. Project Objectives
            </label>
            <textarea
              rows={3}
              value={formData.objectives || ''}
              onChange={e => setFormData({ ...formData, objectives: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              placeholder="What were the core commercial and artistic ambitions?"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              02. Creative Concept
            </label>
            <textarea
              rows={3}
              value={formData.concept || ''}
              onChange={e => setFormData({ ...formData, concept: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              placeholder="The visual metaphor, typographic grid, or conceptual anchor..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              03. Design Process & Materials
            </label>
            <textarea
              rows={3}
              value={formData.process || ''}
              onChange={e => setFormData({ ...formData, process: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              placeholder="Paper choices, foil stamping, 3D explorations, typography engineering..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              04. Results & Accolades
            </label>
            <textarea
              rows={3}
              value={formData.results || ''}
              onChange={e => setFormData({ ...formData, results: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              placeholder="Awards won, client impact, press features..."
            />
          </div>
        </div>
      </div>

      {/* 3. Modular Content Blocks Builder */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-white">
              3. Modular Content Blocks (Behance-Style Builder)
            </h2>
            <p className="text-xs font-mono-meta text-zinc-400">
              Add headings, full-width images, 2-column & 3-column galleries, videos, and pull quotes.
            </p>
          </div>

          {/* Add block dropdown / buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleAddBlock('heading')}
              className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              <Heading className="h-3.5 w-3.5" />
              <span>+ Heading</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('text')}
              className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              <Type className="h-3.5 w-3.5" />
              <span>+ Text</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('image')}
              className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>+ Image</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('gallery')}
              className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>+ Gallery</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('video')}
              className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              <Video className="h-3.5 w-3.5" />
              <span>+ Video</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('quote')}
              className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              <Quote className="h-3.5 w-3.5" />
              <span>+ Quote</span>
            </button>
          </div>
        </div>

        {/* Render blocks list */}
        {(!formData.blocks || formData.blocks.length === 0) ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-xs font-mono-meta text-zinc-400">
            No content blocks added yet. Use the buttons above to build your visual story.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {formData.blocks.map((block, index) => (
              <div
                key={block.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-3"
              >
                {/* Block header & controls */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                  <span className="font-mono-meta text-xs font-bold text-amber-400 uppercase flex items-center gap-2">
                    <span>Block #{index + 1}:</span>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-white">{block.type}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveBlock(index, 'up')}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === formData.blocks!.length - 1}
                      onClick={() => handleMoveBlock(index, 'down')}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlock(block.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 ml-2"
                      title="Delete Block"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Block Inputs according to type */}
                {block.type === 'heading' && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={block.title || ''}
                      onChange={e => handleUpdateBlock(block.id, { title: e.target.value })}
                      placeholder="Heading text..."
                      className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white font-bold"
                    />
                    <textarea
                      rows={2}
                      value={block.content || ''}
                      onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                      placeholder="Optional subheading or introduction..."
                      className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300"
                    />
                  </div>
                )}

                {block.type === 'text' && (
                  <textarea
                    rows={4}
                    value={block.content || ''}
                    onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                    placeholder="Case study body paragraph..."
                    className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                  />
                )}

                {block.type === 'image' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={block.url || ''}
                        onChange={e => handleUpdateBlock(block.id, { url: e.target.value })}
                        placeholder="Image URL..."
                        className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <input
                      type="text"
                      value={block.caption || ''}
                      onChange={e => handleUpdateBlock(block.id, { caption: e.target.value })}
                      placeholder="Optional caption..."
                      className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
                    />
                    {block.url && (
                      <div className="h-24 w-36 overflow-hidden rounded border border-zinc-800">
                        <img src={block.url} alt="preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {block.type === 'video' && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={block.url || ''}
                      onChange={e => handleUpdateBlock(block.id, { url: e.target.value })}
                      placeholder="Direct video URL (.mp4 / .webm)..."
                      className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white font-mono"
                    />
                    <input
                      type="text"
                      value={block.caption || ''}
                      onChange={e => handleUpdateBlock(block.id, { caption: e.target.value })}
                      placeholder="Video caption..."
                      className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
                    />
                  </div>
                )}

                {block.type === 'quote' && (
                  <div className="flex flex-col gap-2">
                    <textarea
                      rows={2}
                      value={block.content || ''}
                      onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                      placeholder="Quote content..."
                      className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
                    />
                    <input
                      type="text"
                      value={block.caption || ''}
                      onChange={e => handleUpdateBlock(block.id, { caption: e.target.value })}
                      placeholder="Attribution / speaker..."
                      className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
                    />
                  </div>
                )}

                {block.type === 'gallery' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono-meta text-zinc-400">Layout:</span>
                      <select
                        value={block.layout || 'grid-2'}
                        onChange={e => handleUpdateBlock(block.id, { layout: e.target.value as any })}
                        className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-white"
                      >
                        <option value="grid-2">2 Columns</option>
                        <option value="grid-3">3 Columns</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      {block.images?.map((img, imgIdx) => (
                        <div key={imgIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={img.url}
                            onChange={e => {
                              const newImages = [...(block.images || [])];
                              newImages[imgIdx] = { ...newImages[imgIdx], url: e.target.value };
                              handleUpdateBlock(block.id, { images: newImages });
                            }}
                            placeholder="Image URL..."
                            className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            value={img.caption || ''}
                            onChange={e => {
                              const newImages = [...(block.images || [])];
                              newImages[imgIdx] = { ...newImages[imgIdx], caption: e.target.value };
                              handleUpdateBlock(block.id, { images: newImages });
                            }}
                            placeholder="Caption..."
                            className="w-36 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = (block.images || []).filter((_, i) => i !== imgIdx);
                              handleUpdateBlock(block.id, { images: newImages });
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [
                            ...(block.images || []),
                            { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', caption: '' },
                          ];
                          handleUpdateBlock(block.id, { images: newImages });
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 self-start"
                      >
                        + Add image to gallery
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. SEO Metadata */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col gap-6">
        <h2 className="font-heading text-lg font-bold text-white border-b border-zinc-800 pb-3">
          4. SEO & Social Meta Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              SEO Title (defaults to Project Title)
            </label>
            <input
              type="text"
              value={formData.seoTitle || ''}
              onChange={e => setFormData({ ...formData, seoTitle: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              placeholder="e.g. Lumina Architectural Lighting Case Study | Elena Rostova"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-meta text-zinc-400">
              SEO Meta Description
            </label>
            <input
              type="text"
              value={formData.seoDescription || ''}
              onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              placeholder="Case study and branding guidelines for Lumina atelier..."
            />
          </div>
        </div>
      </div>
    </form>
  );
};
