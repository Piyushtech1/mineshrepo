import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { api } from '../../services/api';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAdminUser, refreshPublicData } = usePortfolio();

  const [email, setEmail] = useState('admin@auradesign.studio');
  const [password, setPassword] = useState('StudioAdmin2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.login({ email, password });
      setAdminUser(res.admin);
      await refreshPublicData();
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070809] px-6 py-12">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Logo and title */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
            Admin Studio Portal
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Authorized single-administrator control panel
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-md flex flex-col gap-6">
          {error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-email" className="text-xs font-mono-meta text-zinc-400">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  placeholder="admin@auradesign.studio"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="admin-password" className="text-xs font-mono-meta text-zinc-400">
                Master Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-10 pr-10 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Quick credentials hint for easy verification */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-[11px] font-mono-meta text-zinc-400 flex flex-col gap-1">
              <span className="text-zinc-300 font-semibold">Pre-configured Admin Credentials:</span>
              <span>Email: <code className="text-amber-400">admin@auradesign.studio</code></span>
              <span>Pass: <code className="text-amber-400">StudioAdmin2026!</code></span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-xs font-bold text-zinc-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Session...' : 'Authenticate & Enter'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="text-xs font-mono-meta text-zinc-400 hover:text-white transition-colors"
          >
            ← Return to Public Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
};
