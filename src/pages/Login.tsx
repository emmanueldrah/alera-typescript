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
import { GoogleAuthSection } from '@/components/auth/GoogleAuthSection';
import { frontendEnv } from '@/config/env';

const credibilityPoints = [
  'Role-based coordinate control for patients, doctors, labs, imaging, and dispatches.',
  'Live operational updates across diagnostic referrals and treatment workflows.',
  'Secured credentials recovery with automated confirmation registers.',
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const googleAuthAvailable = Boolean(frontendEnv.googleClientId);

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

  const handleGoogleSignIn = async (credential: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle(credential);
      if (result?.needsRegistration) {
        navigate('/signup', {
          state: {
            isGoogleSignup: true,
            googleData: {
              ...result.googleData,
              credential,
            },
          },
        });
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(handleApiError(err, 'Google sign in'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[1fr_1fr] lg:px-8 lg:items-center">

        {/* Crisp Monochromatic Editorial Intro */}
        <section className="flex flex-col justify-between h-full py-6">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded border border-slate-300 bg-white">
                  <HeartPulse className="h-5 w-5 text-slate-950" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-slate-950">ALERA</p>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Healthcare OS</p>
                </div>
              </Link>
              <Link
                to="/"
                className="inline-flex w-fit items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Home
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-14 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 rounded border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-mono font-bold uppercase text-slate-700">
                <ShieldCheck className="h-4 w-4" />
                Secure Administrative Onboarding
              </div>
              <h1 className="mt-6 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
                Access the unified healthcare operations terminal.
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-slate-600">
                From patient intake records to laboratory order tracking and dispatch telemetry, Alera brings the whole medical infrastructure under a secure, single-pane command interface.
              </p>
              <div className="mt-6 rounded border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
                Clinical accounts are strictly verified by system admins. Personal healthcare profiles should be registered as separate patient nodes.
              </div>
            </motion.div>
          </div>

          <div className="mt-12 space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Clinical Roles', value: '10+', icon: ShieldCheck },
                { label: 'System Latency', value: '<15ms', icon: Workflow },
                { label: 'Ecosystem Core', value: '1 Hub', icon: Stethoscope },
              ].map((item) => (
                <div key={item.label} className="rounded border border-slate-200 bg-white p-4">
                  <item.icon className="h-4 w-4 text-slate-700" />
                  <div className="mt-4 text-xl font-bold text-slate-950">{item.value}</div>
                  <div className="mt-1 text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Gateway Capabilities</p>
              <div className="mt-4 space-y-3">
                {credibilityPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-xs text-slate-600">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-950 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Crisp Monochromatic Form */}
        <section className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg rounded border border-slate-300 bg-white p-8"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Identity gateway</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Authenticate Node</h2>
              </div>
              <div className="hidden rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-right sm:block">
                <p className="text-[8px] font-mono uppercase tracking-wider text-slate-400">Security mode</p>
                <p className="text-xs font-mono font-bold text-slate-900">RSA-GCM-256</p>
              </div>
            </div>

            {error ? (
              <div
                id="login-error"
                className="mt-6 rounded border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive"
              >
                {error}
              </div>
            ) : null}

            <div className="mt-6">
              <GoogleAuthSection
                mode="signin"
                disabled={loading}
                isAvailable={googleAuthAvailable}
                onSuccess={handleGoogleSignIn}
                onError={() => setError('Google sign in failed. Please try again.')}
              />
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-describedby={error ? 'login-error' : undefined}
                  aria-invalid={!!error}
                  className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-slate-500 hover:underline font-mono">
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
                    className="h-10 w-full rounded border border-slate-300 bg-white px-3 pr-10 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-describedby={error ? 'login-error' : undefined}
                className="flex h-10 w-full items-center justify-center gap-2 rounded bg-slate-950 text-xs font-mono font-bold uppercase tracking-wider text-white transition hover:bg-slate-900 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight className="h-3.5 w-3.5" /></>}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <span className="text-xs text-slate-500">Unregistered Node? </span>
              <Link to="/signup" className="text-xs font-bold text-slate-950 hover:underline">
                Establish Credentials
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Login;
