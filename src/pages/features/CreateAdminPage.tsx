import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Mail, Lock, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { api } from '@/lib/apiService';
import { handleApiError } from '@/lib/errorHandler';
import { Button } from '@/components/ui/button';

const CreateAdminPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'admin' as 'admin' | 'super_admin',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.username || !formData.password || !formData.first_name || !formData.last_name) {
      setError('All required fields must be filled');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await api.admin.createAdmin(formData);
      setSuccess(true);
      setFormData({
        email: '',
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'admin',
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only Super Admins can create admin accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-destructive" />
          Create Admin Account
        </h1>
        <p className="text-muted-foreground mt-1">
          Create new admin or super admin accounts with full system access
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-success bg-success/10 border border-success/20 p-4 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Admin account created successfully!
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={e => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={e => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="admin@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Username *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="admin_username"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Minimum 8 characters"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Admin Role *
          </label>
          <select
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'super_admin' })}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.role === 'super_admin'
              ? 'Super Admins have full system control including creating other admins'
              : 'Admins have limited management capabilities'
            }
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Creating Admin...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Create Admin Account
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default CreateAdminPage;