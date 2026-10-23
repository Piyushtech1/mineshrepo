import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { SkillItem, ServiceItem } from '../../server/db/schema';
import { Sparkles, Layers, ArrowRight, ArrowUpRight, Check } from 'lucide-react';

export const SkillsServicesPage: React.FC = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Discipline' | 'Software' | 'Methodology'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skRes, srvRes] = await Promise.all([
          api.getSkills(),
          api.getServices(),
        ]);
        setSkills(skRes.skills);
        setServices(srvRes.services);
      } catch (err) {
        console.error('Failed to load skills and services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSkills = activeCategory === 'All'
    ? skills
    : skills.filter(s => s.category === activeCategory);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-12 md:py-20 flex flex-col gap-24">
      {/* 1. SERVICES SECTION */}
      <section className="flex flex-col gap-12">
        <div className="flex flex-col gap-4 border-b border-zinc-800 pb-10">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-mono-meta uppercase tracking-widest">
            <Layers className="h-3.5 w-3.5" />
            <span>Studio Offerings</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white">
            Services & Deliverables
          </h1>
          <p className="max-w-2xl text-base text-zinc-400">
            Tailored creative engagements for architecture ateliers, luxury brands, publishers, and cultural foundations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((srv, index) => (
            <div
              key={srv.id}
              className="flex flex-col justify-between gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono-meta text-xs text-amber-500 font-bold">
                    [ SERVICE 0{index + 1} ]
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  {srv.title}
                </h2>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {srv.description}
                </p>

                {srv.deliverables && srv.deliverables.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-zinc-800">
                    <span className="font-mono-meta text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                      Standard Deliverables:
                    </span>
                    <ul className="grid grid-cols-1 gap-2 text-xs text-zinc-300">
                      {srv.deliverables.map((d, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                <span className="text-xs font-mono-meta text-zinc-400">
                  Custom scope available
                </span>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-amber-400 transition-colors"
                >
                  <span>Inquire for Project</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. SKILLS & TECHNICAL MASTERY */}
      <section className="flex flex-col gap-10 border-t border-zinc-800 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-mono-meta uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Competency Matrix</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Skills, Software & Methodologies
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {(['All', 'Discipline', 'Software', 'Methodology'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-white text-zinc-950 font-bold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Skill Bars & Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map(skill => (
            <div
              key={skill.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-base font-bold text-white">
                  {skill.name}
                </span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono-meta text-zinc-400 uppercase">
                  {skill.category}
                </span>
              </div>

              {/* Proficiency Bar */}
              <div className="flex flex-col gap-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] font-mono-meta text-zinc-400">
                  <span>Proficiency</span>
                  <span className="text-amber-400 font-bold">{skill.proficiency}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
