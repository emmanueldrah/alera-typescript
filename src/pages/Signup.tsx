import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { motion } from 'framer-motion';
import { Heart, User, Building2, FlaskConical, ScanLine, Pill, Ambulance, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { handleApiError } from '@/lib/errorHandler';

type SignupRole = 'patient' | 'doctor' | 'hospital' | 'laboratory' | 'imaging' | 'pharmacy' | 'ambulance';

const roles: { value: SignupRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'patient', label: 'Patient', icon: <User className="w-5 h-5" />, desc: 'Book appointments & view records' },
  { value: 'doctor', label: 'Doctor', icon: <Heart className="w-5 h-5" />, desc: 'Manage patients & consultations' },
  { value: 'hospital', label: 'Hospital', icon: <Building2 className="w-5 h-5" />, desc: 'Manage patients & referrals' },
  { value: 'laboratory', label: 'Laboratory', icon: <FlaskConical className="w-5 h-5" />, desc: 'Process tests & upload results' },
  { value: 'imaging', label: 'Imaging Center', icon: <ScanLine className="w-5 h-5" />, desc: 'Process scans & upload results' },
  { value: 'pharmacy', label: 'Pharmacy', icon: <Pill className="w-5 h-5" />, desc: 'Dispense medications & manage stock' },
  { value: 'ambulance', label: 'Ambulance', icon: <Ambulance className="w-5 h-5" />, desc: 'Handle emergency dispatch' },
];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) { setError('Please select a role'); return; }
    if (!name.trim() || !email.trim() || !password.trim()) { setError('All fields are required'); return; }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError('Please enter a valid email address'); return; }
    
    // Password validation
    if (password.trim().length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }
    
    // Phone validation (optional but if provided, must be valid)
    if (phone.trim() && !/^\+?[\d\s\-()]{10,}$/.test(phone.trim())) {
      setError('Please enter a valid phone number');
      return;
    }
    
    // Professional account validations
    if (selectedRole !== 'patient' && (!licenseNumber.trim() || !licenseState.trim())) {
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
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Heart className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-display font-bold text-primary-foreground">ALERA</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            Join the future of<br />healthcare management
          </h1>
          <p className="text-sidebar-foreground/70 text-lg max-w-md">
            Connect patients, doctors, hospitals, labs, pharmacies, and emergency services — all on one platform.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-lg bg-card rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-display font-bold text-card-foreground mb-1">Create your account</h2>
          <p className="text-muted-foreground mb-6">Select your role and fill in your details</p>

          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-2 block">Select Role</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <button type="button" key={role.value} onClick={() => setSelectedRole(role.value)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all text-sm ${
                      selectedRole === role.value
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/30 text-card-foreground'
                    }`}>
                    <span className={selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'}>{role.icon}</span>
                    <div>
                      <div className="font-medium leading-tight">{role.label}</div>
                      <div className="text-[11px] text-muted-foreground leading-tight">{role.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedRole && selectedRole !== 'patient' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning"
              >
                Professional accounts stay pending until an administrator verifies the license details you provide here.
              </motion.div>
            )}

            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name"
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
            </div>

            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
            </div>

            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Phone Number <span className="text-muted-foreground">(optional)</span></label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567"
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-card-foreground mb-1.5 block">Address <span className="text-muted-foreground">(optional)</span></label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address"
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1.5 block">City <span className="text-muted-foreground">(optional)</span></label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City"
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1.5 block">State <span className="text-muted-foreground">(optional)</span></label>
                <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State"
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1.5 block">ZIP Code <span className="text-muted-foreground">(optional)</span></label>
                <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="12345"
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
              </div>
            </div>

            {selectedRole && selectedRole !== 'patient' && (
              <div className="space-y-4 rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="text-sm font-semibold text-card-foreground">License details</div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1.5 block">License Number</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    placeholder="License or registration number"
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1.5 block">License State</label>
                  <input
                    type="text"
                    value={licenseState}
                    onChange={e => setLicenseState(e.target.value)}
                    placeholder="State or jurisdiction"
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1.5 block">Specialty</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    placeholder="Optional specialty or department"
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50">
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              We will send a verification email after sign-up so you can confirm your account and recover access later.
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
