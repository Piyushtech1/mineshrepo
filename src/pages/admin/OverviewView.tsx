import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, OverviewStatsResponse } from '../../services/api';
import {
  FolderKanban,
  FileCheck,
  FileClock,
  Image as ImageIcon,
  HardDrive,
  Mail,
  Plus,
  Upload,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const [data, setData] = useState<OverviewStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.getAdminOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">
        Loading dashboard metrics...
      </div>
    );
  }

  const { stats, recentProjects, recentMessages } = data;
  const storageMB = (stats.mediaStorageBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="flex flex-col gap-10">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Real-time portfolio metrics, content health, and client inquiries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Project</span>
          </Link>
          <Link
            to="/admin/media"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Media</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Published Projects */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono-meta uppercase">Published Works</span>
            <FileCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="font-heading text-3xl font-extrabold text-white">
            {stats.publishedProjects}
          </span>
          <span className="text-[11px] text-zinc-400">
            Visible on public website
          </span>
        </div>

        {/* Draft Projects */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono-meta uppercase">Unpublished Drafts</span>
            <FileClock className="h-4 w-4 text-amber-400" />
          </div>
          <span className="font-heading text-3xl font-extrabold text-white">
            {stats.draftProjects}
          </span>
          <span className="text-[11px] text-zinc-400">
            In progress / case studies
          </span>
        </div>

        {/* Media Assets & Storage */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono-meta uppercase">Media Assets</span>
            <ImageIcon className="h-4 w-4 text-sky-400" />
          </div>
          <span className="font-heading text-3xl font-extrabold text-white">
            {stats.totalMedia}
          </span>
          <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono-meta">
            <HardDrive className="h-3 w-3" />
            <span>{storageMB} MB stored</span>
          </span>
        </div>

        {/* Contact Messages */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono-meta uppercase">Inquiries</span>
            <Mail className="h-4 w-4 text-violet-400" />
          </div>
          <span className="font-heading text-3xl font-extrabold text-white">
            {stats.totalMessages}
          </span>
          <span className="text-[11px] text-amber-400 font-semibold font-mono-meta">
            {stats.unreadMessages} unread messages
          </span>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-5 flex flex-wrap items-center justify-between gap-4">
        <span className="font-heading text-sm font-bold text-white">
          Quick Management Actions:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            to="/admin/profile"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300 hover:text-white hover:border-zinc-700"
          >
            Edit Profile & Bio
          </Link>
          <Link
            to="/admin/categories"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300 hover:text-white hover:border-zinc-700"
          >
            Manage Categories
          </Link>
          <Link
            to="/admin/appearance"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300 hover:text-white hover:border-zinc-700"
          >
            Customize Appearance
          </Link>
          <Link
            to="/admin/contact"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300 hover:text-white hover:border-zinc-700"
          >
            Open Messages Inbox
          </Link>
        </div>
      </div>

      {/* Two-Column: Recent Projects & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="font-heading text-lg font-bold text-white">
              Recent Projects
            </h2>
            <Link
              to="/admin/projects"
              className="text-xs font-mono-meta text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentProjects.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.coverImage}
                    alt={p.title}
                    className="h-12 w-16 rounded object-cover border border-zinc-800 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-heading text-sm font-semibold text-white truncate">
                      {p.title}
                    </span>
                    <span className="text-xs font-mono-meta text-zinc-400">
                      {p.categoryName} • {p.year}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase font-mono-meta ${
                      p.published
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {p.published ? 'Live' : 'Draft'}
                  </span>
                  <Link
                    to={`/admin/projects/${p.id}/edit`}
                    className="rounded bg-zinc-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-700"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="font-heading text-lg font-bold text-white">
              Recent Inquiries
            </h2>
            <Link
              to="/admin/contact"
              className="text-xs font-mono-meta text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Inbox ({stats.unreadMessages})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentMessages.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono-meta text-zinc-400 rounded-lg border border-dashed border-zinc-800">
                No inquiries received yet.
              </div>
            ) : (
              recentMessages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col gap-1.5 rounded-lg border p-4 transition-colors ${
                    !m.read
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-zinc-800/80 bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading font-bold text-white">
                      {m.name}
                    </span>
                    <span className="text-[10px] font-mono-meta text-zinc-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-zinc-300 line-clamp-1">
                    {m.subject}
                  </span>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {m.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
