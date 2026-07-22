import { Link, Outlet, useLocation } from 'react-router-dom';
import { HeartPulse, Menu, X, ShieldAlert, Wifi } from 'lucide-react';
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

const providerLinks = [
  { label: 'Doctors & Clinicians', href: '/who-we-serve' },
  { label: 'Hospitals', href: '/who-we-serve' },
  { label: 'Pharmacies', href: '/who-we-serve' },
  { label: 'Laboratories', href: '/who-we-serve' },
  { label: 'Imaging Centers', href: '/who-we-serve' },
  { label: 'Ambulance Services', href: '/who-we-serve' },
];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#050709] text-slate-100 flex flex-col font-sans">

      {/* Premium Cinematic Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-950/30 text-teal-400 shadow-lg shadow-teal-500/10 group-hover:border-teal-500/40 transition-all">
              <HeartPulse className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">Alera</p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                <p className="text-[10px] font-mono text-slate-400 tracking-wider">Care OS 2026</p>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`relative text-xs font-semibold uppercase tracking-wider transition-colors hover:text-teal-400 ${
                    isActive ? 'text-teal-400' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 to-cyan-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" className="hidden rounded-xl px-4 text-xs uppercase tracking-wider font-semibold text-slate-400 hover:bg-white/5 hover:text-white sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="rounded-xl border border-teal-500/20 bg-teal-950/40 px-5 text-xs uppercase tracking-wider font-bold text-teal-400 shadow-lg shadow-teal-500/5 hover:bg-teal-500 hover:text-slate-950 transition-all">
              <Link to="/signup">Launch Console</Link>
            </Button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="ml-1 rounded-xl p-2 text-slate-400 hover:bg-white/5 lg:hidden" aria-label="Toggle menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileOpen && (
          <div className="border-t border-white/5 bg-slate-950/95 px-4 pb-6 pt-3 lg:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-white/5 ${
                    location.pathname === item.href ? 'bg-teal-500/10 text-teal-400' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)} className="mt-1 rounded-xl px-4 py-3 text-xs uppercase tracking-wider font-semibold text-slate-400 hover:bg-white/5">Sign in</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern Sci-Fi Footer */}
      <footer className="border-t border-white/5 bg-slate-950/90 py-12">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-950/30 text-teal-400">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-white tracking-wide">Alera</p>
                  <p className="text-[10px] text-slate-500 font-mono">Unified Health OS</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-400">
                A highly secure, zero-trust healthcare cockpit coordinating patients, providers, pharmacies, and labs with absolute clarity.
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-400">Platform</p>
              <div className="space-y-2">
                {[
                  { label: 'Platform Overview', href: '/features' },
                  { label: 'How It Works', href: '/how-it-works' },
                  { label: 'Who We Serve', href: '/who-we-serve' },
                  { label: 'Trust & Security', href: '/trust' },
                ].map((l) => (
                  <Link key={l.label} to={l.href} className="block text-xs text-slate-400 transition-colors hover:text-white">{l.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-400">Node Classes</p>
              <div className="space-y-2">
                {providerLinks.map((item) => (
                  <Link key={item.label} to={item.href} className="block text-xs text-slate-400 transition-colors hover:text-white">{item.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-400">Identity & Legal</p>
              <div className="mb-6 space-y-2">
                <Link to="/privacy-policy" className="block text-xs text-slate-400 transition-colors hover:text-white">Privacy Policy</Link>
                <Link to="/terms" className="block text-xs text-slate-400 transition-colors hover:text-white">Terms of Service</Link>
              </div>

              {/* Online Network Signal */}
              <div className="inline-flex items-center gap-2 rounded-lg border border-teal-500/15 bg-teal-950/30 px-3 py-1.5 text-[10px] font-mono text-teal-400">
                <Wifi className="h-3.5 w-3.5 animate-pulse" />
                <span>SECURE CANNODE OPERATIONAL</span>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/5 pt-8 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
            <p>© 2026 Alera Healthcare Systems Inc. Cinematic Clinical Precision.</p>
            <p className="font-mono text-[10px] uppercase tracking-wider">HIPAA SECURE · NIST COMPLIANT · AES-256 E2EE</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
