import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { motion } from 'framer-motion';
import {
  Activity,
  Ambulance,
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  FlaskConical,
  Heart,
  HeartPulse,
  Pill,
  ScanLine,
  ShieldCheck,
  User,
} from 'lucide-react';
import { handleApiError } from '@/lib/errorHandler';
import { GoogleAuthSection } from '@/components/auth/GoogleAuthSection';
import { frontendEnv } from '@/config/env';
import type { GoogleSignupData } from '@/contexts/auth-context';

type SignupRole =
  | 'patient'
  | 'doctor'
  | 'hospital'
  | 'laboratory'
  | 'imaging'
  | 'pharmacy'
  | 'ambulance'
  | 'physiotherapist';

const roles: { value: SignupRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'patient', label: 'Patient', icon: <User className="w-4 h-4" />, desc: 'Access medical records, consult timelines, and billing receipts.' },
  { value: 'doctor', label: 'Doctor', icon: <Heart className="w-4 h-4" />, desc: 'Evaluate patients, issue e-prescriptions, and order labs.' },
  { value: 'physiotherapist', label: 'Physiotherapist', icon: <Activity className="w-4 h-4" />, desc: 'Formulate rehabilitation schedules and track mobility plans.' },
  { value: 'hospital', label: 'Hospital', icon: <Building2 className="w-4 h-4" />, desc: 'Coordinate emergency intake queues and specialized referrals.' },
  { value: 'laboratory', label: 'Laboratory', icon: <FlaskConical className="w-4 h-4" />, desc: 'Manage diagnostic assays and distribute results.' },
  { value: 'imaging', label: 'Imaging Center', icon: <ScanLine className="w-4 h-4" />, desc: 'Register radiologic scheduling and upload findings.' },
  { value: 'pharmacy', label: 'Pharmacy', icon: <Pill className="w-4 h-4" />, desc: 'Review e-prescriptions and sync stock inventory.' },
  { value: 'ambulance', label: 'Ambulance', icon: <Ambulance className="w-4 h-4" />, desc: 'Coordinate ambulance dispatch queues and real-time telemetry.' },
];

const providerRoles = new Set<SignupRole>([
  'doctor',
  'hospital',
  'laboratory',
  'imaging',
  'pharmacy',
  'ambulance',
  'physiotherapist',
]);

const Signup = () => {
  const location = useLocation();
  const locationState = location.state as { isGoogleSignup?: boolean; googleData?: GoogleSignupData } | null;
  const isGoogleSignupMode = locationState?.isGoogleSignup || false;
  const googleData = locationState?.googleData;

  const [name, setName] = useState(googleData ? `${googleData.first_name} ${googleData.last_name}` : '');
  const [email, setEmail] = useState(googleData?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleSignup, setIsGoogleSignup] = useState(isGoogleSignupMode);
  const [googleCredential, setGoogleCredential] = useState(googleData?.credential || '');

  const { signup, loginWithGoogle, registerWithGoogle } = useAuth();
  const navigate = useNavigate();
  const googleAuthAvailable = Boolean(frontendEnv.googleClientId);

  const isProviderRole = selectedRole ? providerRoles.has(selectedRole) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }
    if (!isGoogleSignup && !password.trim()) {
      setError('Password is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isGoogleSignup) {
      if (password.trim().length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        return;
      }
    }

    if (phone.trim() && !/^\+?[\d\s\-()]{10,}$/.test(phone.trim())) {
      setError('Please enter a valid phone number');
      return;
    }

    if (isProviderRole && (!licenseNumber.trim() || !licenseState.trim())) {
      setError('License number and license state are required for professional accounts');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isGoogleSignup) {
        await registerWithGoogle(
          googleCredential,
          selectedRole,
          selectedRole === 'patient' ? undefined : licenseNumber.trim(),
          selectedRole === 'patient' ? undefined : licenseState.trim(),
          selectedRole === 'patient' ? undefined : specialty.trim() || undefined,
          phone.trim() || undefined,
          address.trim() || undefined,
          city.trim() || undefined,
          state.trim() || undefined,
          zipCode.trim() || undefined,
        );
      } else {
        await signup(
          name,
          email,
          password,
          selectedRole,
          selectedRole === 'patient' ? undefined : licenseNumber.trim(),
          selectedRole === 'patient' ? undefined : licenseState.trim(),
          selectedRole === 'patient' ? undefined : specialty.trim() || undefined,
          phone.trim() || undefined,
          address.trim() || undefined,
          city.trim() || undefined,
          state.trim() || undefined,
          zipCode.trim() || undefined,
        );
      }
      navigate('/dashboard');
    } catch (signupError) {
      setError(handleApiError(signupError));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignupStart = async (credential: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle(credential);
      if (result?.needsRegistration) {
        setIsGoogleSignup(true);
        setGoogleCredential(credential);
        setName(`${result.googleData.first_name} ${result.googleData.last_name}`);
        setEmail(result.googleData.email);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(handleApiError(err, 'Google sign up'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:items-center">

        {/* Monochromatic Left Panel Overview */}
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
                Ecosystem Node Registration
              </div>
              <h1 className="mt-6 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
                Establish your cryptographic node credentials.
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-slate-600">
                Patients, clinicians, hospitals, and emergency fleets coordinate inside a single ledger. Choose your node role to allocate the correct operational layout.
              </p>
              <div className="mt-6 rounded border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
                Clinical nodes require professional registration. Patient profiles must be registered separately using a personal email ledger.
              </div>
            </motion.div>
          </div>

          <div className="mt-12 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded border border-slate-200 bg-white p-5">
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Node status: immediate</p>
                <p className="mt-2 text-xs font-bold text-slate-900 uppercase font-mono">Patient Directory Nodes</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Patient registrations are authenticated instantly. Profiles map to consultant schedules, prescription histories, and diagnostic reports.
                </p>
              </div>
              <div className="rounded border border-slate-200 bg-white p-5">
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Node status: pending review</p>
                <p className="mt-2 text-xs font-bold text-slate-900 uppercase font-mono">Professional Care Nodes</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Practitioner roles enter a pending state en route to direct credential and license auditing by a platform administrator.
                </p>
              </div>
            </div>

            <div className="rounded border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Deployable Node Interfaces</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 font-mono">
                {roles.map((r) => (
                  <div key={r.value} className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5">
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Minimalist Signup Form */}
        <section className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full rounded border border-slate-300 bg-white p-6 sm:p-8"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Registry Gateway</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Create Node Profile</h2>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500 font-mono">
                Verification logs active
              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                {error}
              </div>
            ) : null}

            {!isGoogleSignup && (
              <div className="mt-6">
                <GoogleAuthSection
                  mode="signup"
                  disabled={loading}
                  isAvailable={googleAuthAvailable}
                  onSuccess={handleGoogleSignupStart}
                  onError={() => setError('Google sign up failed. Please try again.')}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Select Node Role</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {roles.map((role) => (
                    <button
                      type="button"
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`rounded border p-3.5 text-left transition-all text-xs ${
                        selectedRole === role.value
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-950'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`rounded border p-1.5 ${selectedRole === role.value ? 'bg-slate-950 text-white border-slate-950' : 'bg-slate-50 text-slate-600 border-slate-300'}`}>
                          {role.icon}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{role.label}</div>
                          <div className="mt-0.5 text-[10px] text-slate-500 leading-normal">{role.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedRole && selectedRole !== 'patient' ? (
                <div className="rounded border border-slate-300 bg-slate-50 px-4 py-3.5 text-xs text-slate-600 font-mono leading-relaxed">
                  NOTE: Professional accounts are designated as PENDING en route to administrative license audits.
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    disabled={isGoogleSignup}
                    className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono disabled:opacity-70 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    disabled={isGoogleSignup}
                    className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono disabled:opacity-70 disabled:bg-slate-100"
                  />
                </div>
                {!isGoogleSignup && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Cryptographic Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 w-full rounded border border-slate-300 bg-white pl-3 pr-10 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono"
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
                )}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                    Phone Number <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                    Street Address <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ecosystem location address"
                    className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                    City <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                    State <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                    ZIP Code <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="00000"
                    className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono"
                  />
                </div>
              </div>

              {selectedRole && selectedRole !== 'patient' ? (
                <div className="rounded border border-slate-300 bg-slate-50 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <p className="text-xs font-bold text-slate-950 uppercase font-mono">License details</p>
                      <p className="mt-1 text-[10px] text-slate-500 leading-normal">Required for clinical identity review.</p>
                    </div>
                    <div className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-mono font-bold uppercase text-slate-500">
                      Verify node
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">License Number</label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="License or registration number"
                        className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">License State</label>
                      <input
                        type="text"
                        value={licenseState}
                        onChange={(e) => setLicenseState(e.target.value)}
                        placeholder="State or jurisdiction"
                        className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Specialty</label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="Optional specialty or department"
                        className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex h-10 w-full items-center justify-center gap-2 rounded bg-slate-950 text-xs font-mono font-bold uppercase tracking-wider text-white transition hover:bg-slate-900 disabled:opacity-50"
              >
                {loading ? (isGoogleSignup ? 'Registering Node Credentials...' : 'Initializing Node...') : <><span>{isGoogleSignup ? 'Complete Node Registration' : 'Establish Node Profile'}</span><ArrowRight className="h-3.5 w-3.5" /></>}
              </button>
              <p className="mt-4 text-[10px] font-mono text-slate-500 leading-normal text-center uppercase tracking-wider">
                We will dispatch an authorization email following sign-up to verify your access credentials.
              </p>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <span className="text-xs text-slate-500">Registered Node? </span>
              <Link to="/login" className="text-xs font-bold text-slate-950 hover:underline">
                Authenticate gateway
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Signup;
