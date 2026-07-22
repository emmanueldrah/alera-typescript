import { Link, Outlet, useLocation } from 'react-router-dom';
import { HeartPulse, Menu, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

type LinkItem = {
  label: string;
  href: string;
};

const navLinks: LinkItem[] = [
  { label: 'Platform', href: '/features' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Who We Serve', href: '/who-we-serve' },
  { label: 'Why Alera?', href: '/why-alera' },
  { label: 'Trust & Security', href: '/trust' },
];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">

      {/* Handcrafted Professional Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-900">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wider uppercase text-slate-900">Alera</p>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Health OS</p>
            </div>
          </Link>

          {/* Clean Navigation Link Map */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-[11px] font-mono font-bold uppercase tracking-widest transition-colors hover:text-slate-900 ${
                    isActive ? 'text-slate-900 border-b-2 border-slate-900 pb-1' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden rounded border border-transparent px-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="rounded bg-slate-900 px-5 text-xs font-mono font-bold uppercase tracking-widest text-white hover:bg-slate-800 transition-colors">
              <Link to="/signup">Launch Gateway</Link>
            </Button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="ml-1 rounded p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Toggle menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-6 pb-6 pt-3 lg:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded px-4 py-3 text-xs font-mono font-bold uppercase tracking-widest hover:bg-slate-50 ${
                    location.pathname === item.href ? 'bg-slate-50 text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)} className="mt-1 rounded px-4 py-3 text-xs font-mono font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50">Sign in</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Structured Minimalist Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-900">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold tracking-wider uppercase text-slate-900">Alera Infrastructure</p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                Timeless healthcare infrastructure connecting medical nodes securely on a zero-trust framework.
              </p>
            </div>

            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3">Operating Network</p>
              <div className="space-y-2">
                {[
                  { label: 'System Overview', href: '/features' },
                  { label: 'System Integration', href: '/how-it-works' },
                  { label: 'Ecosystem Audience', href: '/who-we-serve' },
                  { label: 'Verification & Trust', href: '/trust' },
                ].map((l) => (
                  <Link key={l.label} to={l.href} className="block text-xs text-slate-500 hover:text-slate-900 transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3">Security & Trust</p>
              <div className="space-y-2">
                <Link to="/privacy-policy" className="block text-xs text-slate-500 hover:text-slate-900 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="block text-xs text-slate-500 hover:text-slate-900 transition-colors">Terms of Service</Link>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3">System Identity</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Designed for clinical speed, trust, and absolute compliance.
              </p>
              <div className="inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>NIST CERTIFIED GATEWAY</span>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            <p>© 2026 Alera Healthcare Systems Inc. All rights reserved.</p>
            <p>HIPAA SECURE · AES-256 ENCRYPTION</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
