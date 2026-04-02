import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { UserRole } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/useAuth';
import { motion } from 'framer-motion';
import { Heart, User, Building2, FlaskConical, ScanLine, Pill, Ambulance, ArrowRight, Eye, EyeOff } from 'lucide-react';

type SignupRole = Exclude<UserRole, 'admin'>;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) { setError('Please select a role'); return; }
    if (!name.trim() || !email.trim() || !password.trim()) { setError('All fields are required'); return; }
    setLoading(true);
    setError('');
    try {
      await signup(name, email, password, selectedRole);
      navigate('/dashboard');
    } catch {
      setError('Signup failed. Please try again.');
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
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password"
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50">
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
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
