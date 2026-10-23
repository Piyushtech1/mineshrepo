import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Project } from '../../server/db/schema';
import {
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  ExternalLink,
  Edit,
  ArrowUp,
  ArrowDown,
  Check,
  AlertTriangle,
  Eye,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminProjects();
      setProjects(res.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleTogglePublish = async (project: Project) => {
    try {
      await api.updateProject(project.id, { published: !project.published });
      showNotice(`Project "${project.title}" ${!project.published ? 'published' : 'unpublished'}.`);
      await loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to update publish state');
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    try {
      await api.updateProject(project.id, { featured: !project.featured });
      showNotice(`Project featured status updated.`);
      await loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle featured status');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateProject(id);
      showNotice('Project duplicated as draft.');
      await loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate project');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProject(id);
      setDeleteModalId(null);
      showNotice('Project deleted.');
      await loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newOrder = [...projects];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const orderedIds = newOrder.map(p => p.id);
    try {
      await api.reorderProjects(orderedIds);
      setProjects(newOrder);
      showNotice('Project order updated.');
    } catch (err: any) {
      alert(err.message || 'Failed to reorder projects');
    }
  };

  const filteredProjects = projects.filter(p => {
    if (statusFilter === 'published' && !p.published) return false;
    if (statusFilter === 'draft' && p.published) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Manage Projects
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Publish, edit, duplicate, and arrange case studies displayed on the public portfolio
          </p>
        </div>

        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow"
        >
          <Plus className="h-4 w-4" />
          <span>New Case Study</span>
        </Link>
      </div>

      {actionNotice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['all', 'published', 'draft'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab} ({tab === 'all' ? projects.length : projects.filter(p => (tab === 'published' ? p.published : !p.published)).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Projects Table */}
      {loading ? (
        <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">
          Loading projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-16 text-center text-xs font-mono-meta text-zinc-400">
          No projects found matching the criteria.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 font-mono-meta text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 w-12 text-center">Order</th>
                <th className="p-4">Project</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredProjects.map((project, index) => (
                <tr key={project.id} className="hover:bg-zinc-900/60 transition-colors">
                  {/* Order controls */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === filteredProjects.length - 1}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Thumbnail & Title */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="h-12 w-16 rounded object-cover border border-zinc-800 shrink-0"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-heading font-bold text-white text-sm">
                          {project.title}
                        </span>
                        <span className="font-mono-meta text-[11px] text-zinc-400">
                          /{project.slug} • {project.year}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4 font-mono-meta text-zinc-300">
                    {project.categoryName}
                  </td>

                  {/* Published Toggle */}
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(project)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase font-mono-meta border transition-colors ${
                        project.published
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {project.published ? 'Published' : 'Draft'}
                    </button>
                  </td>

                  {/* Featured Toggle */}
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(project)}
                      className={`rounded px-2.5 py-1 text-[10px] font-bold font-mono-meta uppercase transition-colors inline-flex items-center gap-1 ${
                        project.featured
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
                      }`}
                    >
                      <span>★</span>
                      <span>{project.featured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>

                  {/* Action buttons */}
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        to={`/projects/${project.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Preview Public Page"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <Link
                        to={`/admin/projects/${project.id}/edit`}
                        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(project.id)}
                        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Duplicate Project"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteModalId(project.id)}
                        className="p-1.5 rounded text-rose-400 hover:bg-rose-500/10"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0e0f12] p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-heading text-lg font-bold text-white">
                Confirm Project Deletion
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete this project? This action will remove the case study and all associated content blocks from the public website.
            </p>
            <div className="mt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalId(null)}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteModalId)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-md"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
