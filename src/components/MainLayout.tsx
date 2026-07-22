import { Link, Outlet, useLocation } from 'react-router-dom';
import { HeartPulse, Menu, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

type LinkItem = {
  label: string;
  href: string;
};

const navLinks: LinkItem[] = [
  { label: 'Platform Index', href: '/features' },
  { label: 'Operational Pipeline', href: '/how-it-works' },
  { label: 'Network Stakeholders', href: '/who-we-serve' },
  { label: 'Clinical Efficacy', href: '/why-alera' },
  { label: 'Security & Trust', href: '/trust' },
];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">

      {/* Structured Architectural Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-slate-50 text-slate-900">
              <HeartPulse className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-slate-950">Alera</p>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Health OS</p>
            </div>
          </Link>

          {/* Precise Tabular Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                    isActive ? 'text-slate-950 border-b border-slate-950 pb-0.5' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden rounded border border-transparent px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-950 sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="rounded bg-slate-950 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-white hover:bg-slate-900 transition-colors">
              <Link to="/signup">Initialize Node</Link>
            </Button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="ml-1 rounded border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden" aria-label="Toggle menu">
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Minimalist Mobile Dropdown List */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-6 pb-6 pt-3 lg:hidden">
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider ${
                    location.pathname === item.href ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50">Sign in</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Editorial Minimalist Footer Directory */}
      <footer className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-slate-50 text-slate-950">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold tracking-widest uppercase text-slate-950">Alera Operating Layer</p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                A highly structured clinical networking core built to unite patients, specialists, dispatches, and providers under a zero-trust compliance model.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-4">Platform Nodes</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Operational Pipeline', href: '/how-it-works' },
                  { label: 'Platform Index', href: '/features' },
                  { label: 'Network Stakeholders', href: '/who-we-serve' },
                  { label: 'Efficacy metrics', href: '/why-alera' },
                ].map((l) => (
                  <Link key={l.label} to={l.href} className="block text-xs text-slate-600 hover:text-slate-950 transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-4">Legal & Security</p>
              <div className="space-y-2.5">
                <Link to="/privacy-policy" className="block text-xs text-slate-600 hover:text-slate-950 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="block text-xs text-slate-600 hover:text-slate-950 transition-colors">Terms of Service</Link>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-4">Verification & Authority</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Designed for optimal data latency, medical precision, and regulatory compliance.
              </p>
              <div className="inline-flex items-center gap-2 rounded border border-slate-300 bg-slate-50 px-2.5 py-1 text-[9px] font-mono font-bold uppercase text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-800" />
                <span>NIST COMPLIANT INTERFACE</span>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <p>© 2026 Alera Healthcare Systems Inc. All rights reserved.</p>
            <p>HIPAA COMPLIANT · AES-256 DIGITAL ENCRYPTION</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
