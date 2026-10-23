import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CustomPage, ContentBlock } from '../../server/db/schema';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const CustomPageRoute: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.getPage(slug);
        setPage(res.page);
      } catch (err) {
        console.error('Failed to load custom page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-32 text-center text-sm font-mono-meta text-zinc-400">
        Loading page...
      </div>
    );
  }

  if (!page) {
    return (
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-32 text-center flex flex-col items-center gap-6">
        <h2 className="font-heading text-3xl font-bold text-white">Page Not Found</h2>
        <p className="text-zinc-400 text-sm max-w-md">
          This custom page does not exist or has been made private.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-5xl px-6 lg:px-12 py-12 md:py-20 flex flex-col gap-12">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-10">
        <div className="flex items-center gap-2 text-amber-500 text-xs font-mono-meta uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Studio Document</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white">
          {page.title}
        </h1>
        {page.seoDescription && (
          <p className="max-w-2xl text-base text-zinc-400">
            {page.seoDescription}
          </p>
        )}
      </header>

      {/* Featured image if set */}
      {page.featuredImage && (
        <div className="aspect-[21/10] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
          <img
            src={page.featuredImage}
            alt={page.title}
            className="h-full w-full object-cover object-center"
          />
        </div>
      )}

      {/* Blocks */}
      <div className="flex flex-col gap-8">
        {page.blocks.map(block => (
          <div key={block.id} className="flex flex-col gap-3">
            {block.type === 'heading' && (
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-4">
                {block.title}
              </h2>
            )}
            {block.content && (
              <p className="text-base sm:text-lg leading-relaxed text-zinc-300 font-normal">
                {block.content}
              </p>
            )}
            {block.type === 'image' && block.url && (
              <figure className="my-4 overflow-hidden rounded-xl border border-zinc-800">
                <img src={block.url} alt={block.caption || ''} className="w-full object-cover" />
                {block.caption && (
                  <figcaption className="p-3 text-xs font-mono-meta text-zinc-400 bg-zinc-900">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        ))}
      </div>
    </article>
  );
};
