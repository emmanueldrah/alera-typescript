import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Bell, 
  Save, 
  AlertTriangle, 
  Megaphone, 
  Info,
  Clock,
  RefreshCw,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { adminApi, SystemSettings } from '@/lib/apiService';
import { useAuth } from '@/contexts/useAuth';
import { useSystem } from '@/contexts/useSystem';
import { toast } from 'sonner';

const SystemManagement: React.FC = () => {
  const { user } = useAuth();
  const { refreshSettings } = useSystem();
  
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Notification Broadcast State
  const [broadcast, setBroadcast] = useState({
    title: '',
    message: '',
    type: 'alert'
  });
  const [isNotifying, setIsNotifying] = useState(false);

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const data = await adminApi.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<SystemSettings>) => {
    setIsSaving(true);
    try {
      await adminApi.updateSystemSettings(updates);
      await fetchCurrentSettings();
      await refreshSettings();
      toast.success('System settings updated successfully');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update system settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcast.title || !broadcast.message) {
      toast.error('Please fill in both title and message');
      return;
    }

    setIsNotifying(true);
    try {
      await adminApi.notifyAllUsers({
        title: broadcast.title,
        message: broadcast.message,
        notification_type: broadcast.type
      });
      toast.success('Notification broadcasted to all users');
      setBroadcast({ title: '', message: '', type: 'alert' });
    } catch (error) {
      console.error('Broadcast failed:', error);
      toast.error('Failed to broadcast notification');
    } finally {
      setIsNotifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-blue-600" />
            System Control Center
          </h1>
          <p className="text-slate-500 mt-2">Manage maintenance mode and global communications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Maintenance Mode Toggle */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Maintenance Mode
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="space-y-1">
                <p className="font-bold text-amber-900">System Visibility</p>
                <p className="text-sm text-amber-700">Toggle public access to the platform.</p>
              </div>
              <button
                onClick={() => handleUpdateSettings({ is_maintenance_mode: !settings?.is_maintenance_mode })}
                disabled={isSaving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  settings?.is_maintenance_mode ? 'bg-amber-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.is_maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Maintenance Message</label>
              <textarea
                value={settings?.maintenance_message || ''}
                onChange={(e) => setSettings(s => s ? { ...s, maintenance_message: e.target.value } : null)}
                placeholder="Message shown to users during maintenance..."
                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleUpdateSettings({ maintenance_message: settings?.maintenance_message })}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-sm font-medium"
                >
                  <Save className="h-4 w-4" />
                  Save Message
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Global Notification Banner */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-blue-600" />
              Live System Banner
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="space-y-1">
                <p className="font-bold text-blue-900">Banner Visibility</p>
                <p className="text-sm text-blue-700">Show a persistent banner to all users.</p>
              </div>
              <button
                onClick={() => handleUpdateSettings({ notification_banner_active: !settings?.notification_banner_active })}
                disabled={isSaving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings?.notification_banner_active ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.notification_banner_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Banner Message</label>
                <input
                  type="text"
                  value={settings?.notification_banner_message || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, notification_banner_message: e.target.value } : null)}
                  placeholder="e.g. Scheduled maintenance this Sunday at 2 AM EST."
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Banner Type</label>
                <div className="flex gap-2">
                  {['info', 'warning', 'success'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSettings(s => s ? { ...s, notification_banner_type: type } : null)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                        settings?.notification_banner_type === type
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleUpdateSettings({ 
                    notification_banner_message: settings?.notification_banner_message,
                    notification_banner_type: settings?.notification_banner_type 
                  })}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-sm font-medium"
                >
                  <Save className="h-4 w-4" />
                  Apply Banner
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Global Broadcast */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600" />
            Global Notification Broadcast
          </h2>
          <p className="text-sm text-slate-500 mt-1">Send a one-time push notification to every active user's feed.</p>
        </div>
        <form onSubmit={handleBroadcast} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Subject / Title</label>
                <input
                  type="text"
                  value={broadcast.title}
                  onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                  placeholder="e.g. Upcoming System Upgrade"
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Notification Type</label>
                <select
                  value={broadcast.type}
                  onChange={(e) => setBroadcast({ ...broadcast, type: e.target.value })}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm bg-white"
                >
                  <option value="alert">Alert (Emergency/High Priority)</option>
                  <option value="info">Info (Standard Announcement)</option>
                  <option value="update">Update (Feature News)</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Message Content</label>
              <textarea
                value={broadcast.message}
                onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                placeholder="Type your message to all users here..."
                className="w-full h-full min-h-[160px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isNotifying}
              className="flex items-center gap-3 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold active:scale-95 disabled:opacity-50"
            >
              {isNotifying ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {isNotifying ? 'Broadcasting...' : 'Blast Notification to All Users'}
            </button>
          </div>
        </form>
      </section>

      {/* Preview Section */}
      <section className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Eye className="h-24 w-24" />
        </div>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Real-time Preview
        </h3>
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Active Banner</p>
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              settings?.notification_banner_type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
              settings?.notification_banner_type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
              'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              <Info className="h-5 w-5" />
              <p className="text-sm font-medium">
                {settings?.notification_banner_message || 'No active banner message.'}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Broadcast Draft</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="font-bold text-white mb-1">{broadcast.title || 'Untitled Notification'}</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {broadcast.message || 'No content drafted...'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SystemManagement;
