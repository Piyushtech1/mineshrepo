import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Project, ProjectCategory } from '../../server/db/schema';
import { Search, ArrowUpRight, Filter, Grid, LayoutGrid, Sparkles } from 'lucide-react';

export const WorkPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Array<ProjectCategory & { projectCount: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [layoutMode, setLayoutMode] = useState<'editorial' | 'compact'>('editorial');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, catRes] = await Promise.all([
          api.getProjects({
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            search: searchQuery.trim() || undefined,
          }),
          api.getCategories(),
        ]);
        setProjects(projRes.projects);
        setCategories(catRes.categories);
      } catch (err) {
        console.error('Failed to load portfolio projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-12 md:py-20 flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-10">
        <div className="flex items-center gap-2 text-amber-500 text-xs font-mono-meta uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Index of Works (2022 — 2026)</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white">
          Portfolio & Case Studies
        </h1>
        <p className="max-w-2xl text-base text-zinc-400">
          A curated presentation of visual identity systems, bespoke editorial monographs, structural luxury packaging, and kinetic motion experiments.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-white text-zinc-950 font-semibold shadow-md'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            All Works
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? 'bg-white text-zinc-950 font-semibold shadow-md'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] ${selectedCategory === cat.slug ? 'text-zinc-600' : 'text-zinc-400'}`}>
                ({cat.projectCount})
              </span>
            </button>
          ))}
        </div>

        {/* Search & Layout toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by project or tag..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
            <button
              type="button"
              onClick={() => setLayoutMode('editorial')}
              className={`p-1.5 rounded ${
                layoutMode === 'editorial' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Editorial 2-Column Layout"
              aria-label="Editorial layout"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('compact')}
              className={`p-1.5 rounded ${
                layoutMode === 'compact' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="3-Column Gallery Layout"
              aria-label="3-Column grid layout"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {loading ? (
        <div className="py-24 text-center text-sm font-mono-meta text-zinc-400">
          Loading case studies...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center flex flex-col items-center gap-4">
          <Filter className="h-8 w-8 text-zinc-400" />
          <h3 className="font-heading text-lg font-bold text-white">No projects found</h3>
          <p className="text-sm text-zinc-400 max-w-sm">
            No projects matched your selected filter or search term. Try resetting the category or search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={`grid gap-8 lg:gap-12 ${
            layoutMode === 'compact'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {projects.map(project => (
            <article key={project.id} className="group flex flex-col gap-4">
              <Link
                to={`/projects/${project.slug}`}
                className="media-card-container relative overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-900 focus:outline-none aspect-[16/11]"
              >
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="media-card-zoom h-full w-full object-cover object-center"
                  loading="lazy"
                />

                {/* Overlays */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="rounded-full bg-black/75 backdrop-blur-md px-3 py-1 text-xs font-medium text-white border border-white/10">
                    {project.categoryName}
                  </span>
                  {project.featured && (
                    <span className="rounded-full bg-amber-500/90 text-zinc-950 px-2 py-0.5 text-[10px] font-bold">
                      FEATURED
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4 z-10">
                  <span className="rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 font-mono-meta text-xs text-zinc-300 border border-white/10">
                    {project.year}
                  </span>
                </div>

                {/* Hover summary teaser */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-xs sm:text-sm text-zinc-200 line-clamp-3">
                    {project.summary}
                  </p>
                </div>
              </Link>

              {/* Title & Metadata */}
              <div className="flex items-start justify-between gap-4 pt-1">
                <div className="flex flex-col gap-1">
                  <Link
                    to={`/projects/${project.slug}`}
                    className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors"
                  >
                    {project.title}
                  </Link>
                  {project.client && (
                    <span className="text-xs font-mono-meta text-zinc-400">
                      Client: {project.client}
                    </span>
                  )}
                </div>

                <Link
                  to={`/projects/${project.slug}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all group-hover:border-zinc-700 group-hover:bg-white group-hover:text-zinc-950"
                  aria-label={`View ${project.title}`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono-meta text-zinc-400">
                  {project.tags.map(tag => (
                    <span key={tag} className="rounded bg-zinc-900/90 px-2 py-0.5 border border-zinc-800/80">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
