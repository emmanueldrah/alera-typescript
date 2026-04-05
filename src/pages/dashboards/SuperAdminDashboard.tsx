import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  ShieldCheck,
  Activity,
  Building2,
  FlaskConical,
  ScanLine,
  Pill,
  Ambulance,
  AlertCircle,
  BarChart3,
  RefreshCcw,
  Download,
  CheckCircle2,
  FileText,
  Clock,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { api } from '@/lib/apiService';
import { handleApiError } from '@/lib/errorHandler';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

interface DashboardStats {
  timestamp: string;
  users: {
    total: number;
    by_role: Record<string, number>;
  };
  appointments: {
    total: number;
    today: number;
  };
  prescriptions: {
    active: number;
  };
  lab_tests: {
    pending: number;
  };
  imaging: {
    pending: number;
  };
  emergencies: {
    active: number;
  };
}

type ActivityEvent = {
  type?: 'appointment' | 'prescription' | string;
  time?: string | number;
  description?: string;
};

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [emergencies, setEmergencies] = useState<unknown[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [statsData, activityData, emergencyData] = await Promise.all([
        api.admin.getDashboardStats(),
        api.admin.getEcosystemActivity(10),
        api.admin.getActiveEmergencyDispatch(),
      ]);
      setStats(statsData);
      setActivity(activityData as ActivityEvent[]);
      setEmergencies(emergencyData);
      setLoadError('');
    } catch (error) {
      console.error('Failed to fetch super admin stats:', error);
      setLoadError(handleApiError(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(true), 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const generateReport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (stats) {
      const reportData = JSON.stringify(stats, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ALERA_SuperAdmin_Report_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
    setIsExporting(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const userCounts = stats?.users.by_role || {};
  const totalAdmins = (userCounts.admin || 0) + (userCounts.super_admin || 0);
  const verifiedProviders =
    (userCounts.provider || 0) +
    (userCounts.pharmacist || 0) +
    (userCounts.hospital || 0) +
    (userCounts.laboratory || 0) +
    (userCounts.imaging || 0) +
    (userCounts.ambulance || 0);

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>Could not load live metrics: {loadError}</span>
          <button
            type="button"
            onClick={() => void fetchStats()}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-destructive/15 hover:bg-destructive/25 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            Super Admin Command Center
            {isRefreshing && <RefreshCcw className="w-4 h-4 text-primary animate-spin" />}
          </h1>
          <p className="text-muted-foreground mt-1">
            Full system oversight for {user?.name}
            {stats?.timestamp ? ` • Last sync: ${new Date(stats.timestamp).toLocaleTimeString()}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors text-sm font-medium"
          >
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={generateReport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors text-sm font-medium shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : exportSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Generating...' : exportSuccess ? 'Report Ready' : 'Export Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Users className="w-5 h-5" />, label: 'Total Ecosystem', value: stats?.users.total ?? '—', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: <ShieldCheck className="w-5 h-5" />, label: 'Active Admins', value: totalAdmins, color: 'text-success', bg: 'bg-success/10' },
          { icon: <FlaskConical className="w-5 h-5" />, label: 'Pending Labs/Imaging', value: stats ? (stats.lab_tests.pending || 0) + (stats.imaging.pending || 0) : '—', color: 'text-warning', bg: 'bg-warning/10' },
          { icon: <Ambulance className="w-5 h-5" />, label: 'Active Criticals', value: stats?.emergencies.active ?? '—', color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map((s, i) => (
          <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-3xl font-display font-bold text-card-foreground line-clamp-1">{s.value}</div>
            <div className="text-sm text-muted-foreground font-medium mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-display font-semibold text-card-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Global Control Metrics
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              View and act on the ecosystem from a single command center. Super Admin privileges include system audit, admin creation, and global analytics access.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border p-4 bg-secondary/10">
              <div className="text-xs uppercase text-muted-foreground font-semibold">Verified Providers</div>
              <div className="text-2xl font-bold text-card-foreground mt-2">{verifiedProviders}</div>
            </div>
            <div className="rounded-2xl border border-border p-4 bg-secondary/10">
              <div className="text-xs uppercase text-muted-foreground font-semibold">Admin Accounts</div>
              <div className="text-2xl font-bold text-card-foreground mt-2">{totalAdmins}</div>
            </div>
            <div className="rounded-2xl border border-border p-4 bg-secondary/10">
              <div className="text-xs uppercase text-muted-foreground font-semibold">Live Dispatches</div>
              <div className="text-2xl font-bold text-card-foreground mt-2">{emergencies.length}</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div {...card(5)} className="lg:col-span-1 bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold text-card-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-success" />
              Super Admin Actions
            </h2>
          </div>
          <div className="space-y-3 flex-grow">
            <Link to="/dashboard/users" className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors border border-border/50 group">
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="w-4 h-4" />
                </div>
                Manage Users
              </div>
              <Activity className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            </Link>
            <Link to="/dashboard/admin/create" className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors border border-border/50 group">
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                Create Admin
              </div>
              <Activity className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
            </Link>
            <Link to="/dashboard/audit" className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors border border-border/50 group">
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                  <FileText className="w-4 h-4" />
                </div>
                Audit Logs
              </div>
              <Activity className="w-4 h-4 text-muted-foreground group-hover:text-warning" />
            </Link>
            <Link to="/dashboard/admin-billing" className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors border border-border/50 group">
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
                  <FileText className="w-4 h-4" />
                </div>
                Admin Billing
              </div>
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-info" />
            </Link>
          </div>
        </motion.div>

        <motion.div {...card(6)} className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold text-card-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-info" />
              Real-time System Traffic
            </h2>
            <div className="text-[10px] bg-secondary px-2 py-1 rounded text-muted-foreground font-bold tracking-tighter uppercase">Live Feed</div>
          </div>

          <div className="space-y-4">
            {activity.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="text-sm text-balance text-muted-foreground mb-2">Live feed of critical actions across the network.</div>
                {activity.map((event, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors border border-transparent hover:border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                      {event.type === 'appointment' ? <Activity className="w-4 h-4 text-info" /> :
                        event.type === 'prescription' ? <Pill className="w-4 h-4 text-primary" /> :
                        <FlaskConical className="w-4 h-4 text-warning" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-card-foreground capitalize">
                          {event.type?.replace('_', ' ') || 'Update'}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {new Date(event.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium line-clamp-1">{event.description || 'System event recorded'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !stats ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center px-4">
                <FileText className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm font-medium">Loading ecosystem activity...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center px-4">
                <FileText className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm font-medium">No recent activity found.</p>
                <p className="text-xs mt-1">Critical system events, admin changes, and dispatch updates will appear here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div {...card(7)} className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-display font-semibold text-card-foreground mb-6 flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Ecosystem Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-4 h-4" />, label: 'Patients', value: userCounts.patient || 0 },
            { icon: <Heart className="w-4 h-4" />, label: 'Doctors', value: userCounts.provider || 0 },
            { icon: <Building2 className="w-4 h-4" />, label: 'Hospitals', value: userCounts.hospital || 0 },
            { icon: <FlaskConical className="w-4 h-4" />, label: 'Labs', value: userCounts.laboratory || 0 },
            { icon: <ScanLine className="w-4 h-4" />, label: 'Imaging', value: userCounts.imaging || 0 },
            { icon: <Pill className="w-4 h-4" />, label: 'Pharmacies', value: userCounts.pharmacy || 0 },
            { icon: <Ambulance className="w-4 h-4" />, label: 'Ambulance Units', value: userCounts.ambulance || 0 },
            { icon: <ShieldCheck className="w-4 h-4" />, label: 'Admins', value: totalAdmins },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors group">
              <span className="text-primary group-hover:scale-110 transition-transform">{item.icon}</span>
              <div>
                <div className="text-xl font-bold text-card-foreground leading-none">{item.value}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SuperAdminDashboard;
