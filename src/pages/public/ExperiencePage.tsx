import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ExperienceItem } from '../../server/db/schema';
import { Briefcase, Calendar, MapPin, CheckCircle, Sparkles } from 'lucide-react';

export const ExperiencePage: React.FC = () => {
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExp = async () => {
      try {
        const res = await api.getExperience();
        setExperience(res.experience);
      } catch (err) {
        console.error('Failed to load experience:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExp();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-12 md:py-20 flex flex-col gap-16">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-10">
        <div className="flex items-center gap-2 text-amber-500 text-xs font-mono-meta uppercase tracking-widest">
          <Briefcase className="h-3.5 w-3.5" />
          <span>Professional History</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white">
          Experience & Directorship
        </h1>
        <p className="max-w-2xl text-base text-zinc-400">
          A track record spanning over a decade of creative leadership, typographic systems engineering, and brand building across Europe and international markets.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-sm font-mono-meta text-zinc-400">
          Loading timeline...
        </div>
      ) : (
        <div className="relative flex flex-col gap-12 before:absolute before:inset-0 before:left-3 md:before:left-4 before:h-full before:w-0.5 before:bg-zinc-800">
          {experience.map(item => (
            <div key={item.id} className="relative flex items-start gap-6 md:gap-10 pl-8 md:pl-12">
              {/* Dot */}
              <div className="absolute left-1.5 md:left-2.5 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-zinc-950 bg-amber-500 shadow-md ring-4 ring-[#0c0d0e]" />

              {/* Card */}
              <div className="flex-1 rounded-xl border border-zinc-800/90 bg-zinc-900/50 p-6 md:p-8 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-white">
                      {item.jobTitle}
                    </h2>
                    <span className="font-heading text-lg font-medium text-amber-400">
                      {item.company}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono-meta text-zinc-400">
                    <span className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                      <Calendar className="h-3 w-3" />
                      <span>{item.startDate} — {item.isCurrent ? 'Present' : item.endDate}</span>
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-zinc-800/60 px-3 py-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </span>
                    <span className="rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1">
                      {item.employmentType}
                    </span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-zinc-300">
                  {item.description}
                </p>

                {/* Responsibilities */}
                {item.responsibilities && item.responsibilities.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="font-mono-meta text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                      Key Responsibilities
                    </span>
                    <ul className="flex flex-col gap-1.5 text-xs text-zinc-400">
                      {item.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Achievements */}
                {item.achievements && item.achievements.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/60">
                    <span className="font-mono-meta text-xs uppercase tracking-wider text-amber-500 font-semibold">
                      Selected Milestones
                    </span>
                    <ul className="flex flex-col gap-1.5 text-xs text-zinc-300">
                      {item.achievements.map((ach, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
