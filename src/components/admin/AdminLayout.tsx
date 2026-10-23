import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  LayoutDashboard,
  FolderKanban,
  Tags,
  Image as ImageIcon,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Layers,
  Quote,
  FileDown,
  Mail,
  Navigation,
  FileCode,
  Palette,
  Search,
  KeyRound,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

const ADMIN_NAV = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Manage Projects', path: '/admin/projects', icon: FolderKanban },
  { label: 'Project Categories', path: '/admin/categories', icon: Tags },
  { label: 'Media Library', path: '/admin/media', icon: ImageIcon },
  { label: 'Profile & Bio', path: '/admin/profile', icon: User },
  { label: 'About Page', path: '/admin/about', icon: FileText },
  { label: 'Experience', path: '/admin/experience', icon: Briefcase },
  { label: 'Education', path: '/admin/education', icon: GraduationCap },
  { label: 'Skills', path: '/admin/skills', icon: Sparkles },
  { label: 'Services', path: '/admin/services', icon: Layers },
  { label: 'Testimonials', path: '/admin/testimonials', icon: Quote },
  { label: 'Resume', path: '/admin/resume', icon: FileDown },
  { label: 'Contact Messages', path: '/admin/contact', icon: Mail },
  { label: 'Navigation Menu', path: '/admin/navigation', icon: Navigation },
  { label: 'Custom Pages', path: '/admin/pages', icon: FileCode },
  { label: 'Website Appearance', path: '/admin/appearance', icon: Palette },
  { label: 'SEO Settings', path: '/admin/seo', icon: Search },
  { label: 'Account & Security', path: '/admin/security', icon: KeyRound },
];

export const AdminLayout: React.FC = () => {
  const { admin, logout } = usePortfolio();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#070809] text-zinc-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col border-r border-zinc-800/80 bg-[#0a0b0d] sticky top-0 h-screen">
        {/* Brand header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-zinc-950 font-extrabold shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-sm font-bold text-white tracking-tight">
                Studio Admin
              </span>
              <span className="text-[10px] font-mono-meta text-amber-500 font-semibold uppercase">
                Single Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          {ADMIN_NAV.map(item => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-zinc-800/80 flex flex-col gap-3 bg-zinc-950/40">
          <div className="flex items-center justify-between text-xs">
            <div className="flex flex-col">
              <span className="text-zinc-300 font-semibold truncate max-w-[140px]">
                {admin?.name || 'Admin'}
              </span>
              <span className="text-[10px] font-mono-meta text-zinc-400 truncate max-w-[140px]">
                {admin?.email}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-zinc-400 hover:text-rose-400 transition-colors rounded hover:bg-zinc-800"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800/80 bg-[#0a0b0d]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-lg border border-zinc-800 text-zinc-300 hover:text-white"
            >
              {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="font-heading text-sm font-bold text-white">
              Admin Portal
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono-meta text-zinc-400">
            <span>Portfolio Engine:</span>
            <span className="text-emerald-400 font-semibold">Live & Synchronized</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <span>View Public Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 top-16 z-50 bg-[#0a0b0d]/95 backdrop-blur-xl md:hidden overflow-y-auto p-4 border-b border-zinc-800 flex flex-col gap-1">
            {ADMIN_NAV.map(item => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* View Outlet */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
