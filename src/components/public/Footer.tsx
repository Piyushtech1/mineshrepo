import React from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { ArrowUpRight, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { profile, settings, navigation, socialLinks, isAdminAuthenticated } = usePortfolio();

  const brandName = settings?.siteTitle || profile?.name || 'Elena Rostova';
  const footerText =
    settings?.footerText ||
    'Independent graphic design and art direction practice specializing in brand identity systems, luxury packaging, and kinetic editorial publications.';
  const copyright =
    settings?.copyrightNotice || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;

  return (
    <footer className="border-t border-zinc-800/80 bg-[#08090a] pt-16 pb-12 text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 pb-16 border-b border-zinc-800/60">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Link to="/" className="inline-block">
              <span className="font-heading text-2xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors">
                {brandName}
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">
              {footerText}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono-meta text-zinc-400">
                {profile?.location || 'Berlin / Zurich / Remote'}
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="font-heading text-xs font-semibold uppercase tracking-widest text-zinc-200">
              Navigation
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              {navigation.map(item => (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Social */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h4 className="font-heading text-xs font-semibold uppercase tracking-widest text-zinc-200">
              Inquiries & Representation
            </h4>
            <p className="text-sm text-zinc-400">
              For new projects, exhibitions, monograph design, or lecture requests:
            </p>
            <a
              href={`mailto:${profile?.email || 'studio@elenarostova.design'}`}
              className="group inline-flex items-center gap-2 font-mono-meta text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>{profile?.email || 'studio@elenarostova.design'}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            {/* Social links */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              {socialLinks.map(s => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-all hover:bg-zinc-800"
                >
                  {s.platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-meta text-zinc-400">
          <div>{copyright}</div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
            >
              <Lock className="h-3 w-3" />
              <span>{isAdminAuthenticated ? 'Admin Portal' : 'Admin Login'}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
