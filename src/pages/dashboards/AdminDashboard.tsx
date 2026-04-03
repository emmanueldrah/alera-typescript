import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldCheck, Activity, Building2, FlaskConical, Pill, Ambulance, Heart, BarChart3, AlertCircle, ScanLine, Inbox, RefreshCcw, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { api } from '@/lib/apiService';

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

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await api.admin.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(true), 30000); // 30s real-time polling
    return () => clearInterval(interval);
  }, [fetchStats]);

  const generateReport = async () => {
    setIsExporting(true);
    // Simulate report generation
    await new Promise(r => setTimeout(r, 1500));
    
    if (stats) {
      const reportData = JSON.stringify(stats, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ALERA_Health_Report_${new Date().toISOString().split('T')[0]}.json`;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            Admin Real-time Dashboard
            {isRefreshing && <RefreshCcw className="w-4 h-4 text-primary animate-spin" />}
          </h1>
          <p className="text-muted-foreground mt-1">Live metrics for {user?.name} • Last sync: {new Date(stats?.timestamp || '').toLocaleTimeString()}</p>
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
          { icon: <Users className="w-5 h-5" />, label: 'Total Ecosystem', value: stats?.users.total || 0, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: <Activity className="w-5 h-5" />, label: 'Today\'s Activity', value: stats?.appointments.today || 0, color: 'text-info', bg: 'bg-info/10' },
          { icon: <AlertCircle className="w-5 h-5" />, label: 'Pending Labs/Imaging', value: (stats?.lab_tests.pending || 0) + (stats?.imaging.pending || 0), color: 'text-warning', bg: 'bg-warning/10' },
          { icon: <Ambulance className="w-5 h-5" />, label: 'Active Criticals', value: stats?.emergencies.active || 0, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map((s, i) => (
          <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-3xl font-display font-bold text-card-foreground line-clamp-1">{s.value}</div>
            <div className="text-sm text-muted-foreground font-medium mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-display font-semibold text-card-foreground mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Stakeholder Network
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-4 h-4" />, label: 'Patients', value: userCounts.patient || 0 },
            { icon: <Heart className="w-4 h-4" />, label: 'Doctors', value: userCounts.provider || 0 },
            { icon: <Building2 className="w-4 h-4" />, label: 'Hospitals', value: userCounts.hospital || 0 },
            { icon: <FlaskConical className="w-4 h-4" />, label: 'Labs', value: userCounts.laboratory || 0 },
            { icon: <ScanLine className="w-4 h-4" />, label: 'Imaging', value: userCounts.imaging || 0 },
            { icon: <Pill className="w-4 h-4" />, label: 'Pharmacies', value: userCounts.pharmacist || 0 },
            { icon: <Ambulance className="w-4 h-4" />, label: 'Ambulance Units', value: userCounts.ambulance || 0 },
            { icon: <ShieldCheck className="w-4 h-4" />, label: 'Admins', value: userCounts.admin || 0 },
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

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div {...card(5)} className="lg:col-span-1 bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold text-card-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-success" />
              Quick Actions
            </h2>
          </div>
          <div className="space-y-3 flex-grow">
            <Link to="/dashboard/users" className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors border border-border/50 group">
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="w-4 h-4" />
                </div>
                Verify Users
              </div>
              <Activity className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            </Link>
            <button onClick={generateReport} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors border border-border/50 group text-left">
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
                  <FileText className="w-4 h-4" />
                </div>
                Analytics Report
              </div>
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-info" />
            </button>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">System Status</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                All services operational
              </div>
            </div>
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
            {stats && stats.appointments.total > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="text-sm text-balance text-muted-foreground mb-2">Monitor system-wide health events as they happen.</div>
                {[
                  { label: 'Patient Appointment', detail: `${stats.appointments.today} scheduled for today`, icon: <Activity className="w-4 h-4" color="var(--info)" /> },
                  { label: 'Clinical Prescriptions', detail: `${stats.prescriptions.active} active medications in network`, icon: <Pill className="w-4 h-4" color="var(--primary)" /> },
                  { label: 'Laboratory Processing', detail: `${stats.lab_tests.pending} tests awaiting fulfillment`, icon: <FlaskConical className="w-4 h-4" color="var(--warning)" /> },
                  { label: 'Imaging Diagnostic Flow', detail: `${stats.imaging.pending} scans currently in queue`, icon: <ScanLine className="w-4 h-4" color="var(--success)" /> },
                ].map((feed, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors border border-transparent hover:border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                      {feed.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-card-foreground">{feed.label}</div>
                      <div className="text-xs text-muted-foreground font-medium">{feed.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <RefreshCcw className="w-8 h-8 animate-spin-slow opacity-20" />
                </div>
                <p className="text-sm font-medium tracking-wide">Syncing real-time event stream...</p>
                <div className="mt-4 flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
