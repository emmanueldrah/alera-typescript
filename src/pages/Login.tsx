import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
    if (!email.trim() || !password.trim()) { setError('All fields are required'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials');
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
            Welcome back to<br />ALERA Healthcare
          </h1>
          <p className="text-sidebar-foreground/70 text-lg max-w-md">
            Your all-in-one healthcare management platform. Sign in to access your dashboard.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-display font-bold text-card-foreground mb-1">Sign in</h2>
          <p className="text-muted-foreground mb-6">Enter your credentials to access your dashboard</p>

          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
            </div>

            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50">
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
