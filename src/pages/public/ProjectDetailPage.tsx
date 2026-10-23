import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, ProjectDetailResponse } from '../../services/api';
import { ContentBlock } from '../../server/db/schema';
import { ArrowLeft, ArrowRight, Share2, Check, Sparkles, Layers, Award } from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<ProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.getProjectBySlug(slug);
        setData(res);
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-32 text-center text-sm font-mono-meta text-zinc-400">
        Loading case study...
      </div>
    );
  }

  if (!data || !data.project) {
    return (
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-32 text-center flex flex-col items-center gap-6">
        <h2 className="font-heading text-3xl font-bold text-white">Project Not Found</h2>
        <p className="text-zinc-400 text-sm max-w-md">
          The requested case study could not be found or has not yet been published.
        </p>
        <Link
          to="/work"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to All Works</span>
        </Link>
      </div>
    );
  }

  const { project, prevProject, nextProject, related } = data;

  return (
    <article className="mx-auto max-w-7xl px-6 lg:px-12 py-12 md:py-20 flex flex-col gap-16 lg:gap-24">
      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6 text-xs font-mono-meta">
        <Link
          to="/work"
          className="group inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Selected Work</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
          <span>{copied ? 'Link Copied!' : 'Share Case Study'}</span>
        </button>
      </div>

      {/* Case Study Header */}
      <header className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-mono-meta font-semibold text-amber-400 uppercase tracking-wider">
            {project.categoryName}
          </span>
          <span className="text-zinc-700">•</span>
          <span className="font-mono-meta text-xs text-zinc-400">
            {project.year}
          </span>
          {project.client && (
            <>
              <span className="text-zinc-700">•</span>
              <span className="font-mono-meta text-xs text-zinc-400">
                Client: {project.client}
              </span>
            </>
          )}
        </div>

        <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] max-w-5xl">
          {project.title}
        </h1>

        <p className="text-lg sm:text-2xl text-zinc-300 font-normal leading-relaxed max-w-4xl">
          {project.summary}
        </p>

        {/* Project Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs font-mono-meta text-zinc-400 pt-2">
            {project.tags.map(tag => (
              <span key={tag} className="rounded-md bg-zinc-900 px-3 py-1 border border-zinc-800">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Hero Cover Image */}
      {project.coverImage && (
        <div className="relative aspect-[16/10] sm:aspect-[21/10] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-cover object-center"
          />
        </div>
      )}

      {/* Narrative Sections: Objectives, Concept, Process, Results */}
      {(project.objectives || project.concept || project.process || project.challengesSolutions || project.results) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 border-y border-zinc-800/80 py-16">
          {project.objectives && (
            <div className="flex flex-col gap-3">
              <span className="font-mono-meta text-xs text-amber-500 uppercase tracking-wider font-semibold">
                01. The Objective
              </span>
              <h3 className="font-heading text-xl font-bold text-white">
                Brief & Ambition
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {project.objectives}
              </p>
            </div>
          )}

          {project.concept && (
            <div className="flex flex-col gap-3">
              <span className="font-mono-meta text-xs text-amber-500 uppercase tracking-wider font-semibold">
                02. Creative Concept
              </span>
              <h3 className="font-heading text-xl font-bold text-white">
                Typographic & Visual Anchor
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {project.concept}
              </p>
            </div>
          )}

          {project.process && (
            <div className="flex flex-col gap-3">
              <span className="font-mono-meta text-xs text-amber-500 uppercase tracking-wider font-semibold">
                03. Production Craft
              </span>
              <h3 className="font-heading text-xl font-bold text-white">
                Materials & Substrates
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {project.process}
              </p>
            </div>
          )}

          {(project.challengesSolutions || project.results) && (
            <div className="flex flex-col gap-3">
              <span className="font-mono-meta text-xs text-amber-500 uppercase tracking-wider font-semibold">
                04. Impact & Recognition
              </span>
              <h3 className="font-heading text-xl font-bold text-white">
                Outcome & Accolades
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {project.results || project.challengesSolutions}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Dynamic Editorial Content Blocks */}
      {project.blocks && project.blocks.length > 0 && (
        <section className="flex flex-col gap-16 lg:gap-20">
          {project.blocks.map(block => (
            <RenderContentBlock key={block.id} block={block} />
          ))}
        </section>
      )}

      {/* Prev / Next Project Navigation */}
      <nav className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-zinc-800 pt-16">
        {prevProject ? (
          <Link
            to={`/projects/${prevProject.slug}`}
            className="group flex flex-col gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
          >
            <span className="font-mono-meta text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Previous Project</span>
            </span>
            <span className="font-heading text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
              {prevProject.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextProject && (
          <Link
            to={`/projects/${nextProject.slug}`}
            className="group flex flex-col gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 text-right sm:items-end hover:border-zinc-700 hover:bg-zinc-900 transition-all"
          >
            <span className="font-mono-meta text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 justify-end">
              <span>Next Project</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="font-heading text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
              {nextProject.title}
            </span>
          </Link>
        )}
      </nav>

      {/* Related Projects in same category */}
      {related && related.length > 0 && (
        <section className="flex flex-col gap-8 border-t border-zinc-800/80 pt-16">
          <h3 className="font-heading text-2xl font-bold text-white">
            Related Case Studies
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map(rel => (
              <Link
                key={rel.id}
                to={`/projects/${rel.slug}`}
                className="group flex flex-col gap-3 rounded-lg overflow-hidden"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                  <img
                    src={rel.coverImage}
                    alt={rel.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono-meta text-[11px] text-amber-500">
                    {rel.categoryName} • {rel.year}
                  </span>
                  <span className="font-heading text-base font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {rel.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

// Component helper for rendering modular content blocks
const RenderContentBlock: React.FC<{ block: ContentBlock }> = ({ block }) => {
  switch (block.type) {
    case 'heading':
      return (
        <div className="flex flex-col gap-3 max-w-4xl">
          {block.title && (
            <h2 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-white">
              {block.title}
            </h2>
          )}
          {block.content && (
            <p className="text-base text-zinc-400 leading-relaxed">
              {block.content}
            </p>
          )}
        </div>
      );

    case 'text':
      return (
        <div className="max-w-3xl text-base sm:text-lg leading-relaxed text-zinc-300 font-normal">
          <p>{block.content}</p>
        </div>
      );

    case 'image':
      return (
        <figure className="flex flex-col gap-3 w-full">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <img
              src={block.url}
              alt={block.caption || 'Project illustration'}
              className="w-full object-cover max-h-[85vh]"
              loading="lazy"
            />
          </div>
          {block.caption && (
            <figcaption className="text-xs font-mono-meta text-zinc-400 text-center sm:text-left">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'gallery':
      const gridClass =
        block.layout === 'grid-3'
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2';

      return (
        <div className="flex flex-col gap-4 w-full">
          <div className={`grid ${gridClass} gap-6`}>
            {block.images?.map((img, i) => (
              <figure key={i} className="flex flex-col gap-2">
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 aspect-[4/3]">
                  <img
                    src={img.url}
                    alt={img.alt || img.caption || 'Gallery detail'}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                {img.caption && (
                  <figcaption className="text-[11px] font-mono-meta text-zinc-400">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
          {block.caption && (
            <p className="text-xs font-mono-meta text-zinc-400 text-center">
              {block.caption}
            </p>
          )}
        </div>
      );

    case 'video':
      return (
        <figure className="flex flex-col gap-3 w-full">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 aspect-video">
            <video
              src={block.url}
              controls
              autoPlay={block.autoplay}
              muted={block.muted !== false}
              loop={block.loop}
              className="h-full w-full object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="text-xs font-mono-meta text-zinc-400">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'quote':
      return (
        <blockquote className="my-6 rounded-2xl border-l-4 border-amber-500 bg-zinc-900/60 p-8 sm:p-10 flex flex-col gap-4">
          <p className="font-heading text-xl sm:text-2xl font-medium text-white italic leading-relaxed">
            "{block.content}"
          </p>
          {block.caption && (
            <cite className="not-italic text-xs font-mono-meta text-amber-400 uppercase tracking-widest font-semibold">
              — {block.caption}
            </cite>
          )}
        </blockquote>
      );

    case 'spacing':
      return <div className="h-12 lg:h-20" />;

    default:
      return null;
  }
};
