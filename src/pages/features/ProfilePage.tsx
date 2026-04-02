import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Users, Heart, FlaskConical, ScanLine, Pill, Ambulance, Building2, ShieldCheck, Loader, Eye, EyeOff, Upload, Bell, Lock, AlertCircle, Check } from 'lucide-react';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1 } });

const roleIcons: Record<string, React.ReactNode> = {
  patient: <Users className="w-5 h-5" />,
  doctor: <Heart className="w-5 h-5" />,
  hospital: <Building2 className="w-5 h-5" />,
  laboratory: <FlaskConical className="w-5 h-5" />,
  imaging: <ScanLine className="w-5 h-5" />,
  pharmacy: <Pill className="w-5 h-5" />,
  ambulance: <Ambulance className="w-5 h-5" />,
  admin: <ShieldCheck className="w-5 h-5" />,
};

const roleLabels: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  hospital: 'Hospital',
  laboratory: 'Laboratory',
  imaging: 'Imaging Center',
  pharmacy: 'Pharmacy',
  ambulance: 'Ambulance',
  admin: 'Administrator',
};

const ProfilePage = () => {
  const { user, updateProfile, updateBasicInfo, changePassword, updateNotificationPreferences, updatePrivacySettings, deleteAccount, clearCache } = useAuth();
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

  // Delete Account State
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClearCache, setConfirmClearCache] = useState(false);

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
    setIsLoading(true);
    try {
      await updateProfile({ phone, address, city, state, zipCode, bio });
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
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to delete account', 'error');
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
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account information and preferences</p>
      </div>

      {/* Profile Header */}
      <motion.div {...card(0)} className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-border p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground flex-shrink-0 overflow-hidden">
            {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : roleIcons[user.role] && <div className="text-4xl">{roleIcons[user.role]}</div>}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">{user.name}</h2>
            <p className="text-muted-foreground mb-4">{user.email}</p>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                {roleIcons[user.role]}
                {roleLabels[user.role]}
              </div>
              {user.createdAt && <p className="text-xs text-muted-foreground">Member since {new Date(user.createdAt).toLocaleDateString()}</p>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-card rounded-xl p-1 border border-border">
        {(['basic', 'contact', 'security', 'notifications', 'privacy', 'account'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Messages */}
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg flex items-start gap-3"><AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /><span className="text-sm">{error}</span></motion.div>}
      {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-success/10 border border-success text-success p-4 rounded-lg flex items-start gap-3"><Check className="w-5 h-5 mt-0.5 flex-shrink-0" /><span className="text-sm">{success}</span></motion.div>}

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
              <p className="text-xs text-muted-foreground mt-1">At least 6 characters</p>
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
              {user.createdAt && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Member Since</p>
                  <p className="text-foreground mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              )}
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
