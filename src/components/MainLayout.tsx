import { Link, Outlet } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LinkItem = {
  label: string;
  href: string;
};

const navLinks: LinkItem[] = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Features', href: '/features' },
  { label: 'Trust', href: '/trust' },
];

const MainLayout = () => {
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
              <p className="text-xs text-slate-500">Telemedicine platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <Link key={item.label} to={item.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" className="hidden rounded-full px-4 text-slate-600 hover:bg-slate-100 hover:text-slate-950 sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="rounded-full bg-slate-950 px-5 text-white shadow-lg shadow-slate-950/10 transition-transform hover:-translate-y-0.5 hover:bg-slate-900">
              <Link to="/signup">Start Consultation</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#0ea5e9,_#14b8a6)] text-white">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-950">Alera</p>
              <p className="text-xs text-slate-500">Telemedicine platform</p>
            </div>
          </div>
          <p>© 2026 Alera. Secure telemedicine for modern care.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
