import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { api } from '../../services/api';
import { Project, ServiceItem, TestimonialItem } from '../../server/db/schema';
import { ArrowUpRight, ArrowRight, Sparkles, Award, Layers, ShieldCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { profile, settings } = usePortfolio();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [projRes, srvRes, testRes] = await Promise.all([
          api.getProjects({ featured: true }),
          api.getServices(),
          api.getTestimonials(),
        ]);
        setFeaturedProjects(projRes.projects);
        setServices(srvRes.services);
        setTestimonials(testRes.testimonials);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const designerName = profile?.name || 'Elena Rostova';
  const designerTitle = profile?.title || 'Independent Graphic Designer & Creative Director';
  const tagline =
    profile?.tagline ||
    'Crafting memorable visual identities, tactile editorial systems, and bespoke digital experiences.';

  return (
    <div className="flex flex-col gap-24 lg:gap-36 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 lg:pt-28 px-6 lg:px-12 mx-auto max-w-7xl w-full">
        <div className="flex flex-col gap-8 lg:gap-12">
          {/* Top meta badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-mono-meta text-xs uppercase tracking-widest text-zinc-400">
                {designerTitle}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono-meta text-zinc-400">
              <span>{profile?.location || 'Berlin / Zurich / Remote'}</span>
              <span className="text-zinc-700">•</span>
              <span>{profile?.yearsOfExperience || '12+ Years'} Practice</span>
            </div>
          </div>

          {/* Headline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05]">
                Sculpting <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">identity</span> through rigorous form.
              </h1>
              <p className="max-w-2xl text-lg sm:text-xl text-zinc-400 font-normal leading-relaxed">
                {tagline}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end justify-end">
              <Link
                to="/work"
                className="group inline-flex items-center justify-center gap-3 rounded-lg bg-white px-7 py-4 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-95 shadow-xl hover:shadow-2xl"
              >
                <span>View Selected Work</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-7 py-4 text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-all hover:bg-zinc-800"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Hero Banner Image */}
          {profile?.heroImage && (
            <div className="relative mt-6 aspect-[21/9] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
              <img
                src={profile.heroImage}
                alt="Studio Visual Overview"
                className="h-full w-full object-cover object-center transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0e] via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono-meta text-zinc-300">
                <span>Selected Identity & Art Direction Cases</span>
                <span className="hidden sm:inline">2024 — 2026</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. FEATURED PROJECTS (BEHANCE-INSPIRED SHOWCASE) */}
      <section className="px-6 lg:px-12 mx-auto max-w-7xl w-full">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-2 text-amber-500 text-xs font-mono-meta uppercase tracking-widest mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Featured Portfolio</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Selected Work & Case Studies
              </h2>
            </div>
            <Link
              to="/work"
              className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <span>Explore All Projects ({featuredProjects.length})</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {featuredProjects.map((project, index) => (
              <article
                key={project.id}
                className={`group flex flex-col gap-4 ${
                  index % 3 === 0 ? 'md:col-span-2' : ''
                }`}
              >
                <Link
                  to={`/projects/${project.slug}`}
                  className="media-card-container relative overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-900 focus:outline-none aspect-[16/10]"
                >
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="media-card-zoom h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                  {/* Category Pill */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="rounded-full bg-black/70 backdrop-blur-md px-3.5 py-1 text-xs font-medium text-white border border-white/10">
                      {project.categoryName}
                    </span>
                    {project.featured && (
                      <span className="rounded-full bg-amber-500/90 text-zinc-950 px-2.5 py-0.5 text-[11px] font-bold">
                        FEATURED
                      </span>
                    )}
                  </div>

                  {/* Year pill */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="rounded-full bg-black/70 backdrop-blur-md px-3 py-1 font-mono-meta text-xs text-zinc-300 border border-white/10">
                      {project.year}
                    </span>
                  </div>

                  {/* Hover overlay teaser */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 lg:p-8">
                    <p className="text-sm text-zinc-200 line-clamp-2 max-w-xl">
                      {project.summary}
                    </p>
                  </div>
                </Link>

                {/* Metadata */}
                <div className="flex items-start justify-between gap-4 pt-1">
                  <div className="flex flex-col gap-1">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors"
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all group-hover:border-zinc-700 group-hover:bg-white group-hover:text-zinc-950"
                    aria-label={`View ${project.title} case study`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs font-mono-meta text-zinc-400">
                    {project.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="rounded bg-zinc-900 px-2.5 py-1 border border-zinc-800/80">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DISCIPLINES & SERVICES OVERVIEW */}
      <section className="px-6 lg:px-12 mx-auto max-w-7xl w-full">
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-[#111215] to-[#0c0d0e] p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 flex flex-col gap-6">
              <span className="font-mono-meta text-xs uppercase tracking-widest text-amber-500">
                Core Disciplines
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Holistic design for ambitious brands.
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                From conceptual logotype architecture and tactile luxury print production to kinetic typography and digital design systems, every deliverable is crafted with uncompromising craft.
              </p>
              <div className="pt-4">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-amber-400 transition-colors"
                >
                  <span>Explore All Services & Deliverables</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {services.map((service, idx) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-meta text-xs text-zinc-400">
                      0{idx + 1}
                    </span>
                    <Layers className="h-4 w-4 text-amber-500" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white">
                    {service.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {service.description}
                  </p>
                  {service.deliverables && service.deliverables.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1.5 border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-400">
                      {service.deliverables.slice(0, 3).map((d, dIdx) => (
                        <li key={dIdx} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-amber-500" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. DESIGNER BIOGRAPHY TEASER */}
      <section className="px-6 lg:px-12 mx-auto max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              <img
                src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=85'}
                alt={designerName}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono-meta text-zinc-300">
                <span>{designerName}</span>
                <span>Creative Director</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <span className="font-mono-meta text-xs uppercase tracking-widest text-amber-500">
              The Designer
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              A decade of visual distillation and tactile craftsmanship.
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed">
              {profile?.bio}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-zinc-800">
              <div>
                <span className="block font-heading text-3xl font-bold text-white">12+</span>
                <span className="text-xs font-mono-meta text-zinc-400 uppercase tracking-wider">Years Experience</span>
              </div>
              <div>
                <span className="block font-heading text-3xl font-bold text-white">40+</span>
                <span className="text-xs font-mono-meta text-zinc-400 uppercase tracking-wider">Brand Systems</span>
              </div>
              <div>
                <span className="block font-heading text-3xl font-bold text-white">8</span>
                <span className="text-xs font-mono-meta text-zinc-400 uppercase tracking-wider">Design Awards</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                <span>Read Full Biography & Philosophy</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/experience"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-6 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <span>View Career Timeline</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CLIENT TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="px-6 lg:px-12 mx-auto max-w-7xl w-full">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <span className="font-mono-meta text-xs uppercase tracking-widest text-amber-500">
                Endorsements
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
                What collaborators say.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map(t => (
                <div
                  key={t.id}
                  className="flex flex-col justify-between gap-6 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-8"
                >
                  <p className="text-sm leading-relaxed text-zinc-300 italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/60">
                    {t.avatarUrl ? (
                      <img
                        src={t.avatarUrl}
                        alt={t.clientName}
                        className="h-10 w-10 rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-white">
                        {t.clientName.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-heading text-sm font-bold text-white">
                        {t.clientName}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {t.clientRole}, {t.company}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. CALL TO ACTION */}
      <section className="px-6 lg:px-12 mx-auto max-w-7xl w-full">
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 p-10 sm:p-16 lg:p-20 text-center flex flex-col items-center gap-6">
          <span className="font-mono-meta text-xs uppercase tracking-widest text-amber-400">
            Have a project in mind?
          </span>
          <h2 className="font-heading text-4xl sm:text-6xl font-extrabold text-white max-w-2xl">
            Let's create something iconic together.
          </h2>
          <p className="max-w-xl text-base text-zinc-400">
            Currently accepting commissions for brand identities, luxury packaging, publication monographs, and art direction for upcoming quarters.
          </p>
          <div className="pt-4 flex flex-wrap gap-4 justify-center">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 rounded-lg bg-white px-8 py-4 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl"
            >
              <span>Initiate Project Inquiry</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href={`mailto:${profile?.email || 'studio@elenarostova.design'}`}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-8 py-4 text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
            >
              <span>{profile?.email || 'studio@elenarostova.design'}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
