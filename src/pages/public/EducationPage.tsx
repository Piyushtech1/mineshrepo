import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { EducationItem } from '../../server/db/schema';
import { GraduationCap, Calendar, Award, ExternalLink } from 'lucide-react';

export const EducationPage: React.FC = () => {
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEdu = async () => {
      try {
        const res = await api.getEducation();
        setEducation(res.education);
      } catch (err) {
        console.error('Failed to load education:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEdu();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-12 md:py-20 flex flex-col gap-16">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-10">
        <div className="flex items-center gap-2 text-amber-500 text-xs font-mono-meta uppercase tracking-widest">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Academic Foundation</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white">
          Education & Training
        </h1>
        <p className="max-w-2xl text-base text-zinc-400">
          Rooted in Swiss modernist typography and experimental visual communication at Europe’s foremost design institutions.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-sm font-mono-meta text-zinc-400">
          Loading education history...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {education.map(item => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 font-mono-meta text-xs text-zinc-400">
                    <Calendar className="h-3 w-3" />
                    <span>{item.startDate} — {item.endDate}</span>
                  </span>
                  <span className="font-mono-meta text-xs font-bold text-amber-400 uppercase">
                    {item.qualification}
                  </span>
                </div>

                <h2 className="font-heading text-2xl font-bold text-white">
                  {item.institution}
                </h2>
                <span className="text-sm font-semibold text-zinc-300">
                  {item.course}
                </span>

                <p className="text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </div>

              {item.certificateUrl && (
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono-meta text-zinc-400">
                    Degree Credential
                  </span>
                  <a
                    href={item.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span>View Certificate</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
