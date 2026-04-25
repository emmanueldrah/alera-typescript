import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Workflow,
} from 'lucide-react';
import { handleApiError } from '@/lib/errorHandler';

const credibilityPoints = [
  'Role-based access for patients, doctors, labs, imaging, and emergency teams',
  'Live operational updates across referrals, appointments, and clinical workflows',
  'Secure account recovery with email verification and controlled access',
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(handleApiError(err, 'sign in'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(145deg,_#0f172a_0%,_#123049_42%,_#f4fbfa_42%,_#f8fbff_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-10">
        <section className="flex flex-col justify-between rounded-[2rem] border border-white/15 bg-slate-950/70 p-8 text-white shadow-2xl shadow-slate-950/30 backdrop-blur xl:p-10">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <HeartPulse className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight">ALERA</p>
                  <p className="text-xs text-slate-300">Unified healthcare operations</p>
                </div>
              </Link>
              <Link
                to="/"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="mt-14 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-100">
                <ShieldCheck className="h-4 w-4" />
                Secure access for every verified care role
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl">
                Sign in to the operational side of care delivery.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                From patient follow-up to lab coordination and imaging handoff, Alera keeps the whole care network moving inside one connected workspace.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                If you are a doctor or another provider and also want to use Alera as a patient, create a separate patient account for your personal care.
              </div>
            </motion.div>
          </div>

          <div className="mt-12 space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Verified roles', value: '10+', icon: ShieldCheck },
                { label: 'Realtime workflows', value: '24/7', icon: Workflow },
                { label: 'Clinical coordination', value: 'One hub', icon: Stethoscope },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <item.icon className="h-4 w-4 text-emerald-300" />
                  <div className="mt-4 text-2xl font-semibold">{item.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">What you unlock after sign-in</p>
              <div className="mt-4 space-y-3">
                {credibilityPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-lg rounded-[2rem] border border-white/60 bg-white/88 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur xl:p-10"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Welcome back</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sign in</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Enter your credentials to continue to your dashboard.
                </p>
              </div>
              <div className="hidden rounded-2xl bg-slate-950 px-4 py-3 text-right text-white sm:block">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Account</p>
                <p className="mt-1 text-sm font-medium">Protected entry</p>
              </div>
            </div>

            {error ? (
              <div
                id="login-error"
                className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-describedby={error ? 'login-error' : undefined}
                  aria-invalid={!!error}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-slate-800">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    aria-describedby={error ? 'login-error' : undefined}
                    aria-invalid={!!error}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-describedby={error ? 'login-error' : undefined}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <div className="mt-8 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
              New to Alera?{' '}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Create one
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Work account for treating patients. Separate patient account for receiving your own care.
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Login;
