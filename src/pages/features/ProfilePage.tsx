import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Users, Heart, FlaskConical, ScanLine, Pill, Ambulance, Building2, ShieldCheck, Loader, Eye, EyeOff, Upload, Bell, Lock, AlertCircle, Check, Mail } from 'lucide-react';
import {
  getProfessionalVerificationStatus,
  getVerificationStatusLabel,
} from '@/lib/verificationStatus';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1 } });

const roleIcons: Record<string, React.ReactNode> = {
  patient: <Users className="w-5 h-5" />,
  doctor: <Heart className="w-5 h-5" />,
  hospital: <Building2 className="w-5 h-5" />,
  laboratory: <FlaskConical className="w-5 h-5" />,
  imaging: <ScanLine className="w-5 h-5" />,
  pharmacy: <Pill className="w-5 h-5" />,
  ambulance: <Ambulance className="w-5 h-5" />,
  physiotherapist: <Heart className="w-5 h-5" />,
  admin: <ShieldCheck className="w-5 h-5" />,
  super_admin: <ShieldCheck className="w-5 h-5" />,
};

const roleLabels: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  hospital: 'Hospital',
  laboratory: 'Laboratory',
  imaging: 'Imaging Center',
  pharmacy: 'Pharmacy',
  ambulance: 'Ambulance',
  physiotherapist: 'Physiotherapist',
  admin: 'Administrator',
  super_admin: 'Super Admin',
};

const profileTabs = [
  { id: 'basic', label: 'Basic', icon: <Users className="w-4 h-4" /> },
  { id: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'privacy', label: 'Privacy', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'account', label: 'Account', icon: <Heart className="w-4 h-4" /> },
] as const;

const ProfilePage = () => {
  const { user, updateProfile, updateBasicInfo, changePassword, updateNotificationPreferences, updatePrivacySettings, deleteAccount, linkAccount, resendEmailVerification, clearCache } = useAuth();
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'security' | 'notifications' | 'privacy' | 'account'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Basic Info State
  const profile = user?.profile;
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');

  // Contact Info State
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [state, setState] = useState(profile?.state || '');
  const [zipCode, setZipCode] = useState(profile?.zipCode || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [postdicomApiUrl, setPostdicomApiUrl] = useState(user?.postdicomApiUrl || '');

  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification State
  const [notifEmail, setNotifEmail] = useState(profile?.notificationEmail ?? true);
  const [notifSms, setNotifSms] = useState(profile?.notificationSms ?? false);

  // Privacy State
  const [publicProfile, setPublicProfile] = useState(profile?.privacyPublicProfile ?? false);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName || '');
    setLastName(profile.lastName || '');
    setAvatar(profile.avatar || '');
    setPhone(profile.phone || '');
    setAddress(profile.address || '');
    setCity(profile.city || '');
    setState(profile.state || '');
    setZipCode(profile.zipCode || '');
    setBio(profile.bio || '');
    setNotifEmail(profile.notificationEmail ?? true);
    setNotifSms(profile.notificationSms ?? false);
    setPublicProfile(profile.privacyPublicProfile ?? false);
    setPostdicomApiUrl(user?.postdicomApiUrl || '');
  }, [profile, user]);

  // Delete Account State
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClearCache, setConfirmClearCache] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [currentPasswordForLink, setCurrentPasswordForLink] = useState('');
  const [linkedEmail, setLinkedEmail] = useState('');
  const [linkedPassword, setLinkedPassword] = useState('');
  const professionalVerificationStatus = user
    ? getProfessionalVerificationStatus(user.isVerified, user.isActive ?? true)
    : 'pending';
  const isEmailUnverified = Boolean(user && user.role !== 'admin' && user.emailVerified === false);

  if (!user) return null;

  const showMessage = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSaveBasicInfo = async () => {
    setError('');
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    setIsLoading(true);
    try {
      await updateBasicInfo(firstName.trim(), lastName.trim());
      await updateProfile({ avatar });
      showMessage('Basic information updated successfully', 'success');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to update', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContact = async () => {
    setError('');
    
    // Phone validation if provided
    if (phone.trim() && !/^\+?[\d\s\-()]{10,}$/.test(phone.trim())) {
      setError('Please enter a valid phone number');
      return;
    }
    
    // ZIP code validation if provided
    if (zipCode.trim() && !/^\d{5}(-\d{4})?$/.test(zipCode.trim())) {
      setError('Please enter a valid ZIP code (e.g., 12345 or 12345-6789)');
      return;
    }
    
    setIsLoading(true);
    try {
      await updateProfile({ phone, address, city, state, zipCode, bio, postdicomApiUrl });
      showMessage('Contact information updated successfully', 'success');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to update', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) { 
      setError('New password must contain at least one uppercase letter, one lowercase letter, and one number'); 
      return; 
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('Password changed successfully', 'success');
      setTimeout(() => {
        clearCache();
        window.location.href = '/login';
      }, 800);
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = () => {
    clearCache();
    window.location.href = '/';
  };

  const handleSaveNotifications = async () => {
    setError('');
    setIsLoading(true);
    try {
      await updateNotificationPreferences(notifEmail, notifSms);
      showMessage('Notification preferences updated', 'success');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to update', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setError('');
    setIsLoading(true);
    try {
      await updatePrivacySettings(publicProfile);
      showMessage('Privacy settings updated', 'success');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to update', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setSendingVerification(true);
    try {
      await resendEmailVerification();
      showMessage('Verification email sent', 'success');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to resend verification email', 'error');
    } finally {
      setSendingVerification(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    if (!deletePassword) {
      setError('Password is required');
      return;
    }
    setIsLoading(true);
    try {
      await deleteAccount(deletePassword);
      showMessage('Account deleted successfully', 'success');
      setTimeout(() => {
        clearCache();
        window.location.href = '/login';
      }, 800);
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to delete account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    setError('');
    if (!currentPasswordForLink || !linkedEmail.trim() || !linkedPassword) {
      setError('Enter your password and the other account credentials to link accounts');
      return;
    }

    setIsLoading(true);
    try {
      await linkAccount(currentPasswordForLink, linkedEmail.trim(), linkedPassword);
      setCurrentPasswordForLink('');
      setLinkedEmail('');
      setLinkedPassword('');
      showMessage('Accounts linked successfully', 'success');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to link accounts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl space-y-6">
      <motion.div
        {...card(0)}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(145deg,_#ffffff_0%,_#f8fbff_55%,_#f3faf6_100%)] p-8 shadow-sm"
      >
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-sky-700">
              <ShieldCheck className="h-4 w-4" />
              Account and verification workspace
            </div>
            <h1 className="mt-5 text-3xl font-display font-bold tracking-tight text-foreground">Profile Settings</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Manage your identity, verification status, contact details, security controls, and account preferences from one place.
            </p>

            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.5rem] bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/15">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-4xl">{roleIcons[user.role]}</div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                    {roleIcons[user.role]}
                    {roleLabels[user.role]}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                      professionalVerificationStatus === 'verified'
                        ? 'bg-success/10 text-success'
                        : professionalVerificationStatus === 'pending'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {getVerificationStatusLabel(professionalVerificationStatus)}
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${isEmailUnverified ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                    <Mail className="w-4 h-4" />
                    {isEmailUnverified ? 'Email verification pending' : 'Email verified'}
                  </div>
                  {user.createdAt ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status board</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Verification state</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {getVerificationStatusLabel(professionalVerificationStatus)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Recovery readiness</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {isEmailUnverified
                    ? 'Verify your email to strengthen account recovery and platform alert delivery.'
                    : 'Your email is verified and ready for secure recovery flows.'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current focus</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Use the tabs below to update identity, security, notifications, privacy, or account-level settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="rounded-[1.5rem] border border-border bg-card p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {profileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-950 text-white shadow'
                  : 'text-foreground/70 hover:bg-slate-100 hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-destructive"
        >
          <AlertCircle className="mt-0.5 w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </motion.div>
      ) : null}
      {success ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 rounded-2xl border border-success/20 bg-success/10 p-4 text-success"
        >
          <Check className="mt-0.5 w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </motion.div>
      ) : null}

      {/* Basic Information Tab */}
      {activeTab === 'basic' && (
        <motion.div {...card(1)} className="bg-card rounded-2xl border border-border p-8 space-y-6">
          <h3 className="text-lg font-display font-semibold text-foreground">Basic Information</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                    {avatar ? <img src={avatar} alt="Preview" className="w-full h-full object-cover" /> : roleIcons[user.role]}
                  </div>
                  <label className="relative cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input text-foreground hover:bg-secondary transition">
                      <Upload className="w-4 h-4" /> Upload Photo
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full h-10 px-4 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full h-10 px-4 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <input type="email" value={user.email} disabled className="w-full h-10 px-4 rounded-lg border border-input bg-secondary text-muted-foreground opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <Button onClick={handleSaveBasicInfo} disabled={isLoading} className="gap-2">
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </motion.div>
      )}

      {/* Contact Information Tab */}
      {activeTab === 'contact' && (
        <motion.div {...card(1)} className="bg-card rounded-2xl border border-border p-8 space-y-6">
          <h3 className="text-lg font-display font-semibold text-foreground">Contact Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full h-10 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            {user.role === 'imaging' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">PostDICOM Endpoint</label>
                <input
                  type="url"
                  value={postdicomApiUrl}
                  onChange={e => setPostdicomApiUrl(e.target.value)}
                  placeholder="https://your-postdicom-instance.com/api/upload"
                  className="w-full h-10 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the PostDICOM upload URL for imaging center transfers. Imaging uploads are sent directly to PostDICOM only, and no local files are stored for imaging center results.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" className="w-full h-10 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="w-full h-10 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">State/Province</label>
                <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State" className="w-full h-10 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Zip Code</label>
                <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="12345" className="w-full h-10 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            <Button onClick={handleSaveContact} disabled={isLoading} className="gap-2">
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div {...card(1)} className="bg-card rounded-2xl border border-border p-8 space-y-6">
          <h3 className="text-lg font-display font-semibold text-foreground">Security Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
              <div className="relative">
                <input type={showOldPassword ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full h-10 px-4 pr-10 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="••••••••" />
                <button onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
              <div className="relative">
                <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full h-10 px-4 pr-10 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="••••••••" />
                <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">At least 8 characters with uppercase, lowercase, and a number</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full h-10 px-4 pr-10 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="••••••••" />
                <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button onClick={handleChangePassword} disabled={isLoading} className="gap-2">
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              Change Password
            </Button>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div {...card(1)} className="bg-card rounded-2xl border border-border p-8 space-y-6">
          <h3 className="text-lg font-display font-semibold text-foreground">Notification Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates and alerts via email</p>
                </div>
              </div>
              <button onClick={() => setNotifEmail(!notifEmail)} className={`relative w-12 h-7 rounded-full transition-all ${notifEmail ? 'bg-primary' : 'bg-secondary'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${notifEmail ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive important alerts via text message</p>
                </div>
              </div>
              <button onClick={() => setNotifSms(!notifSms)} className={`relative w-12 h-7 rounded-full transition-all ${notifSms ? 'bg-primary' : 'bg-secondary'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${notifSms ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <Button onClick={handleSaveNotifications} disabled={isLoading} className="gap-2">
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </motion.div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <motion.div {...card(1)} className="bg-card rounded-2xl border border-border p-8 space-y-6">
          <h3 className="text-lg font-display font-semibold text-foreground">Privacy Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Public Profile</p>
                  <p className="text-sm text-muted-foreground">Allow other users to view your profile</p>
                </div>
              </div>
              <button onClick={() => setPublicProfile(!publicProfile)} className={`relative w-12 h-7 rounded-full transition-all ${publicProfile ? 'bg-primary' : 'bg-secondary'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${publicProfile ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="p-4 rounded-lg bg-info/10 border border-info text-info text-sm">
              <p className="font-medium">Profile Privacy</p>
              <p className="mt-1">When your profile is public, other users can see your name and role. When private, your profile information is hidden.</p>
            </div>

            <Button onClick={handleSavePrivacy} disabled={isLoading} className="gap-2">
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </motion.div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <motion.div {...card(1)} className="bg-card rounded-2xl border border-border p-8 space-y-6">
          <h3 className="text-lg font-display font-semibold text-foreground">Account Settings</h3>
          
          <div className="space-y-4">
            {/* Account Info */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">User ID</p>
                <p className="text-foreground font-mono text-sm mt-1 break-all">{user.id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Account Type</p>
                <p className="text-foreground mt-1">{roleLabels[user.role]}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Professional Verification</p>
                <div data-testid="professional-verification-status" className="mt-1 flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${professionalVerificationStatus === 'verified' ? 'text-success' : professionalVerificationStatus === 'pending' ? 'text-warning' : 'text-destructive'}`} />
                  <p className={`text-sm ${professionalVerificationStatus === 'verified' ? 'text-success' : professionalVerificationStatus === 'pending' ? 'text-warning' : 'text-destructive'}`}>
                    {getVerificationStatusLabel(professionalVerificationStatus)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Email Verification</p>
                <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className={`w-4 h-4 ${isEmailUnverified ? 'text-warning' : 'text-success'}`} />
                    <p className={`text-sm ${isEmailUnverified ? 'text-warning' : 'text-success'}`}>
                      {isEmailUnverified ? 'Pending verification' : 'Verified'}
                    </p>
                  </div>
                  {isEmailUnverified && (
                    <Button onClick={handleResendVerification} disabled={isLoading || sendingVerification} variant="outline" className="gap-2 w-fit">
                      {sendingVerification && <Loader className="w-4 h-4 animate-spin" />}
                      Resend email
                    </Button>
                  )}
                </div>
              </div>
              {user.createdAt && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Member Since</p>
                  <p className="text-foreground mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Linked Account</p>
                <p className="text-foreground mt-1">{user.hasLinkedAccount ? 'Connected' : 'Not linked yet'}</p>
              </div>
            </div>

            <div className="border border-sky-100 bg-sky-50 rounded-xl p-4 text-sm text-slate-700">
              If you use Alera for work and also want care for yourself, keep a separate patient account. This keeps your work role and your personal care clearly separate.
            </div>

            <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-4">
              <div>
                <p className="font-medium text-foreground">Linked accounts</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Link a separate account that belongs to you, like a patient account for your own care.
                </p>
              </div>

              {user.linkedAccounts && user.linkedAccounts.length > 0 ? (
                <div className="space-y-3">
                  {user.linkedAccounts.map((account) => (
                    <div key={account.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                          {roleIcons[account.role] || <Users className="w-4 h-4" />}
                          {roleLabels[account.role] || account.role}
                        </div>
                        <span className="text-sm text-muted-foreground">{account.maskedEmail || 'Linked account'}</span>
                      </div>
                      {account.createdAt ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Linked on {new Date(account.createdAt).toLocaleDateString()}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-card/70 p-4 text-sm text-muted-foreground">
                  No linked account yet.
                </div>
              )}

              {!user.hasLinkedAccount ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">Your current account password</label>
                    <input
                      type="password"
                      value={currentPasswordForLink}
                      onChange={e => setCurrentPasswordForLink(e.target.value)}
                      className="w-full h-10 px-4 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Other account email</label>
                    <input
                      type="email"
                      value={linkedEmail}
                      onChange={e => setLinkedEmail(e.target.value)}
                      className="w-full h-10 px-4 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="patient@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Other account password</label>
                    <input
                      type="password"
                      value={linkedPassword}
                      onChange={e => setLinkedPassword(e.target.value)}
                      className="w-full h-10 px-4 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Enter the other account password"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button onClick={handleLinkAccount} disabled={isLoading} className="gap-2">
                      {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                      Link My Separate Account
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Clear Cache Section */}
            <div className="border-t border-border pt-6">
              <h4 className="text-sm font-semibold text-foreground mb-4">App Data</h4>
              <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-4">
                <div>
                  <p className="font-medium text-foreground mb-2">Clear Cache</p>
                  <p className="text-sm text-muted-foreground mb-4">Clear all stored app data including users and preferences. You will be logged out and the app will reset to defaults.</p>
                </div>
                {!confirmClearCache ? (
                  <Button onClick={() => setConfirmClearCache(true)} variant="outline">
                    Clear All Cache
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
                      This clears only ALERA app data from this browser and signs you out immediately.
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => setConfirmClearCache(false)} variant="outline" disabled={isLoading}>
                        Cancel
                      </Button>
                      <Button onClick={handleClearCache} variant="destructive" disabled={isLoading}>
                        Confirm Clear Cache
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="border-t border-border pt-6">
              <h4 className="text-sm font-semibold text-destructive mb-4">Danger Zone</h4>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive space-y-4">
                <div>
                  <p className="font-medium text-foreground mb-2">Delete Account</p>
                  <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                </div>

                {!confirmDelete ? (
                  <Button onClick={() => setConfirmDelete(true)} variant="destructive">
                    Delete Account
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showDeletePassword ? 'text' : 'password'}
                          value={deletePassword}
                          onChange={e => setDeletePassword(e.target.value)}
                          className="w-full h-10 px-4 pr-10 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/30"
                          placeholder="••••••••"
                        />
                        <button
                          onClick={() => setShowDeletePassword(!showDeletePassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => { setConfirmDelete(false); setDeletePassword(''); }} variant="outline" disabled={isLoading}>
                        Cancel
                      </Button>
                      <Button onClick={handleDeleteAccount} disabled={isLoading} variant="destructive" className="gap-2">
                        {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                        Permanently Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
