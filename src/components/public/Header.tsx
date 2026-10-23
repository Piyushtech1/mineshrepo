import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { Menu, X, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, settings, navigation, isAdminAuthenticated } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const brandName = settings?.siteTitle || profile?.name || 'AURA';
  const brandTagline = settings?.siteTagline || 'Graphic Design & Creative Direction';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#0c0d0e]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Brand / Logo */}
        <Link to="/" className="group flex items-center gap-3.5 focus:outline-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/60 text-white font-extrabold tracking-tighter shadow-inner transition-transform group-hover:scale-105">
            <span className="font-heading text-xl">A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold tracking-tight text-white transition-colors group-hover:text-amber-400">
              {brandName}
            </span>
            <span className="text-[11px] font-mono-meta tracking-wider text-zinc-400 uppercase">
              {brandTagline.split('&')[0]}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navigation.map(item => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`relative px-3.5 py-1.5 text-sm font-medium transition-all rounded-md ${
                  isActive
                    ? 'text-white bg-zinc-800/70 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 bg-amber-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA and Admin status */}
        <div className="hidden lg:flex items-center gap-4">
          {profile?.availableForWork && (
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for Q3/Q4</span>
            </div>
          )}

          <Link
            to="/contact"
            className="group flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-semibold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-95 shadow-sm"
          >
            <span>Let's Talk</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          {isAdminAuthenticated && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
              title="Go to Admin Dashboard"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white md:hidden"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-20 bottom-0 z-50 bg-[#0c0d0e]/95 backdrop-blur-xl md:hidden overflow-y-auto px-6 py-8 border-b border-zinc-800">
          <div className="flex flex-col gap-3">
            {navigation.map(item => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-4 py-3.5 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <Sparkles className="h-4 w-4 text-amber-400" />}
                </Link>
              );
            })}

            <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-col gap-3">
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-zinc-950"
              >
                <span>Initiate Commission</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              {isAdminAuthenticated && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-medium text-amber-300"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Open Admin Dashboard</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
