import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AboutPageData } from '../../server/db/schema';
import { Award, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [data, setData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await api.getAbout();
        setData(res.about);
      } catch (err) {
        console.error('Failed to load about page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-32 text-center text-sm font-mono-meta text-zinc-400">
        Loading biography...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-12 md:py-20 flex flex-col gap-20">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-10">
        <div className="flex items-center gap-2 text-amber-500 text-xs font-mono-meta uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Biography & Ethos</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl">
          {data.heading}
        </h1>
        <p className="max-w-2xl text-lg text-zinc-400 leading-relaxed">
          {data.subheading}
        </p>
      </div>

      {/* Main split: Portrait & Biography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-5 sticky top-28">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
            <img
              src={data.profilePhoto}
              alt="Elena Rostova studio portrait"
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="mt-4 flex flex-col gap-1 text-xs font-mono-meta text-zinc-400">
            <span className="font-semibold text-zinc-300">Studio Berlin / Zurich</span>
            <span>Independent Art Director & Graphic Designer</span>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="flex flex-col gap-6 text-base sm:text-lg leading-relaxed text-zinc-300 font-normal">
            {data.bioParagraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Philosophy Callout */}
          {data.creativePhilosophy && (
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 flex flex-col gap-3">
              <span className="font-mono-meta text-xs uppercase tracking-widest text-amber-500 font-semibold">
                Creative Philosophy
              </span>
              <p className="font-heading text-xl sm:text-2xl text-white font-medium italic leading-relaxed">
                "{data.creativePhilosophy}"
              </p>
            </div>
          )}

          {/* Personal story */}
          {data.personalStory && (
            <div className="flex flex-col gap-3 border-t border-zinc-800 pt-8">
              <span className="font-mono-meta text-xs uppercase tracking-widest text-zinc-400">
                Roots & Background
              </span>
              <p className="text-sm sm:text-base leading-relaxed text-zinc-300">
                {data.personalStory}
              </p>
            </div>
          )}

          {/* Specializations list */}
          {data.specializations && data.specializations.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-zinc-800 pt-8">
              <span className="font-mono-meta text-xs uppercase tracking-widest text-amber-500">
                Areas of Specialization
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.specializations.map((spec, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recognition & Awards */}
      {data.achievements && data.achievements.length > 0 && (
        <div className="flex flex-col gap-8 border-t border-zinc-800 pt-16">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-mono-meta uppercase tracking-widest">
            <Award className="h-4 w-4" />
            <span>Honors & Recognitions</span>
          </div>
          <h2 className="font-heading text-3xl font-bold text-white">
            Awards & Exhibitions
          </h2>

          <div className="divide-y divide-zinc-800/80 border-y border-zinc-800">
            {data.achievements.map(ach => (
              <div
                key={ach.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 py-6 items-center"
              >
                <div className="sm:col-span-2 font-mono-meta text-sm font-bold text-amber-500">
                  {ach.year}
                </div>
                <div className="sm:col-span-6 font-heading text-lg font-semibold text-white">
                  {ach.title}
                </div>
                <div className="sm:col-span-4 text-xs font-mono-meta text-zinc-400 sm:text-right">
                  {ach.organization}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career link CTA */}
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-10">
        <div>
          <h3 className="font-heading text-xl font-bold text-white">
            Looking for detailed career history and client records?
          </h3>
          <p className="text-sm text-zinc-400">
            Explore positions at Pentagram alumni network, Studio Forma, and independent director work.
          </p>
        </div>
        <Link
          to="/experience"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
        >
          <span>View Experience Timeline</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
