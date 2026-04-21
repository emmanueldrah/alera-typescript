import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { motion } from 'framer-motion';
import {
  Activity,
  Ambulance,
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
  { value: 'patient', label: 'Patient', icon: <User className="w-5 h-5" />, desc: 'Book care, track results, and stay connected' },
  { value: 'doctor', label: 'Doctor', icon: <Heart className="w-5 h-5" />, desc: 'Manage consultations, referrals, and follow-up' },
  { value: 'physiotherapist', label: 'Physiotherapist', icon: <Activity className="w-5 h-5" />, desc: 'Run rehabilitation plans, track mobility goals, and coordinate recovery' },
  { value: 'hospital', label: 'Hospital', icon: <Building2 className="w-5 h-5" />, desc: 'Oversee teams, referrals, and emergency intake' },
  { value: 'laboratory', label: 'Laboratory', icon: <FlaskConical className="w-5 h-5" />, desc: 'Process test queues and publish results' },
  { value: 'imaging', label: 'Imaging Center', icon: <ScanLine className="w-5 h-5" />, desc: 'Coordinate scans and report delivery' },
  { value: 'pharmacy', label: 'Pharmacy', icon: <Pill className="w-5 h-5" />, desc: 'Dispense medication and manage stock flow' },
  { value: 'ambulance', label: 'Ambulance', icon: <Ambulance className="w-5 h-5" />, desc: 'Handle dispatch and live emergency operations' },
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
  const { signup } = useAuth();
  const navigate = useNavigate();

  const isProviderRole = selectedRole ? providerRoles.has(selectedRole) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.trim().length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
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
      navigate('/dashboard');
    } catch (signupError) {
      setError(handleApiError(signupError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(180deg,_#eef8ff_0%,_#f8fbff_42%,_#ffffff_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[0.98fr_1.02fr] lg:px-8 lg:py-10">
        <section className="flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20 xl:p-10">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <HeartPulse className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">ALERA</p>
                <p className="text-xs text-slate-300">Unified healthcare operations</p>
              </div>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="mt-14 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-1.5 text-sm font-medium text-sky-100">
                <ShieldCheck className="h-4 w-4" />
                Verified provider onboarding built in
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
                Create the account that matches your role in care.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">
                Patients, clinicians, labs, imaging teams, pharmacies, hospitals, and emergency services all join the same network, with role-specific access from day one.
              </p>
            </motion.div>
          </div>

          <div className="mt-12 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Access model</p>
                <p className="mt-3 text-lg font-semibold">Patients move fast.</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Patient accounts go straight into the platform so they can book appointments, track results, and receive reminders.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Verification model</p>
                <p className="mt-3 text-lg font-semibold">Provider roles get reviewed.</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Professional roles remain pending until license details are reviewed by an administrator.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold">Who can join from here</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300">
                {roles.map((role) => (
                  <div key={role.value} className="rounded-xl bg-white/5 px-3 py-2">
                    {role.label}
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
            className="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/80 xl:p-8"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Account creation</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Create your account</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Select your role and fill in your details.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                We send a verification email after sign-up.
              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-slate-800">Select Role</label>
                <div className="grid gap-3 md:grid-cols-2">
                  {roles.map((role) => (
                    <button
                      type="button"
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        selectedRole === role.value
                          ? 'border-primary bg-primary/[0.06] shadow-sm ring-1 ring-primary/15'
                          : 'border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-xl p-2 ${selectedRole === role.value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {role.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{role.label}</div>
                          <div className="mt-1 text-xs leading-5 text-slate-500">{role.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedRole && selectedRole !== 'patient' ? (
                <div className="rounded-2xl border border-warning/30 bg-warning/5 px-4 py-4 text-sm text-warning">
                  Professional accounts stay pending until an administrator verifies the license details you provide here.
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-800">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-12 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Phone Number <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Address <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    City <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    State <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    ZIP Code <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="12345"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {selectedRole && selectedRole !== 'patient' ? (
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-950">License details</p>
                      <p className="mt-1 text-sm text-slate-500">Required for professional review and approval.</p>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Provider
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-800">License Number</label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="License or registration number"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-800">License State</label>
                      <input
                        type="text"
                        value={licenseState}
                        onChange={(e) => setLicenseState(e.target.value)}
                        placeholder="State or jurisdiction"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-800">Specialty</label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="Optional specialty or department"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
              </button>

              <p className="text-center text-xs leading-6 text-slate-500">
                We will send a verification email after sign-up so you can confirm your account and recover access later.
              </p>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Signup;
