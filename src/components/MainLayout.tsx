import { Link, Outlet } from 'react-router-dom';
import { HeartPulse, Menu, X } from 'lucide-react';
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
  { label: 'Trust & Security', href: '/trust' },
];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12)_0,_rgba(255,255,255,0)_28%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_28%,_#effaf7_100%)] text-slate-900 flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#0ea5e9,_#14b8a6)] text-white shadow-lg shadow-sky-500/20">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-950">Alera</p>
              <p className="text-xs text-slate-500">Healthcare Ecosystem</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" className="hidden rounded-full px-4 text-slate-600 hover:bg-slate-100 hover:text-slate-950 sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="rounded-full bg-slate-950 px-5 text-white shadow-lg shadow-slate-950/10 transition-transform hover:-translate-y-0.5 hover:bg-slate-900">
              <Link to="/signup">Get Started</Link>
            </Button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="ml-1 rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white/95 px-4 pb-4 pt-3 lg:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Sign in
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#0ea5e9,_#14b8a6)] text-white">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">Alera</p>
                  <p className="text-xs text-slate-500">Healthcare Ecosystem</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500 leading-6">
                Connecting patients, doctors, labs, pharmacies, imaging centers, hospitals, and ambulance services on one secure platform.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-950 mb-3">Platform</p>
              <div className="space-y-2">
                {[
                  { label: 'Platform Overview', href: '/features' },
                  { label: 'How It Works', href: '/how-it-works' },
                  { label: 'Who We Serve', href: '/who-we-serve' },
                  { label: 'Trust & Security', href: '/trust' },
                ].map((l) => (
                  <Link key={l.label} to={l.href} className="block text-sm text-slate-500 hover:text-slate-950 transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-950 mb-3">For Providers</p>
              <div className="space-y-2">
                {['Doctors & Clinicians', 'Hospitals', 'Pharmacies', 'Laboratories', 'Imaging Centers', 'Ambulance Services'].map((item) => (
                  <p key={item} className="text-sm text-slate-500">{item}</p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-950 mb-3">Account</p>
              <div className="space-y-2">
                <Link to="/login" className="block text-sm text-slate-500 hover:text-slate-950 transition-colors">Sign In</Link>
                <Link to="/signup" className="block text-sm text-slate-500 hover:text-slate-950 transition-colors">Create Account</Link>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">© 2026 Alera. A unified healthcare ecosystem for modern care delivery.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
