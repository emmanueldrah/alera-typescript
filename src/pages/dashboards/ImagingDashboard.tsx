import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ArrowRight, Inbox, FileText, ScanLine, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { getVisibleImagingScans } from '@/lib/recordVisibility';
import { getVisibleReferrals } from '@/lib/referralUtils';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const statusStyles: Record<string, string> = {
  requested: 'bg-warning/10 text-warning',
  'in-progress': 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const ImagingDashboard = () => {
  const { user } = useAuth();
  const { imagingScans, referrals } = useAppData();

  const visibleScans = getVisibleImagingScans(imagingScans, user);
  const visibleReferrals = getVisibleReferrals(referrals, user);
  const newRequests = visibleScans.filter((s) => s.status === 'requested');
  const inProgress = visibleScans.filter((s) => s.status === 'in-progress');
  const completed = visibleScans.filter((s) => s.status === 'completed');
  const pendingReferrals = visibleReferrals.filter((r) => r.status === 'pending');
  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = completed.filter((s) => s.completedDate === todayStr || s.requestedDate === todayStr);

  const recentScans = [...visibleScans].sort((a, b) => (b.requestedDate ?? '').localeCompare(a.requestedDate ?? '')).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Imaging Center Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome, {user?.name} — {newRequests.length} scan{newRequests.length !== 1 ? 's' : ''} awaiting processing</p>
        </div>
        <Link to="/dashboard/scan-requests" className="hidden sm:flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/15 transition">
          Scan Queue <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: AlertCircle, label: 'New Requests', value: newRequests.length, color: 'text-warning', bg: 'bg-warning/10', ring: 'ring-warning/20' },
          { icon: Clock, label: 'In Progress', value: inProgress.length, color: 'text-info', bg: 'bg-info/10', ring: 'ring-info/20' },
          { icon: FileText, label: 'Pending Referrals', value: pendingReferrals.length, color: 'text-accent', bg: 'bg-accent/10', ring: 'ring-accent/20' },
          { icon: TrendingUp, label: 'Completed', value: completed.length, color: 'text-success', bg: 'bg-success/10', ring: 'ring-success/20' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border hover:shadow-sm transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} ring-1 ${s.ring} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-display font-bold text-card-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* New scan requests */}
        <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-display font-semibold text-card-foreground">Scan Queue</h2>
            </div>
            <Link to="/dashboard/scan-requests" className="text-sm text-primary hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {newRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <ScanLine className="w-9 h-9 mb-2 opacity-40" />
              <p className="text-sm font-medium">No pending scans</p>
              <p className="text-xs mt-1">New imaging requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {newRequests.slice(0, 4).map((scan) => (
                <div key={scan.id} className="flex items-start justify-between rounded-xl border border-border/50 bg-secondary/40 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-card-foreground truncate">{scan.scanType}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{scan.patientName}</div>
                  </div>
                  <span className="ml-2 flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full bg-warning/10 text-warning">Pending</span>
                </div>
              ))}
              {newRequests.length > 4 && (
                <Link to="/dashboard/scan-requests" className="block text-center text-xs text-primary hover:underline pt-1">
                  +{newRequests.length - 4} more
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Recent scans */}
        <motion.div {...card(5)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-display font-semibold text-card-foreground">All Scan Requests</h2>
            </div>
            <Link to="/dashboard/scan-requests" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recentScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Inbox className="w-9 h-9 mb-2 opacity-40" />
              <p className="text-sm font-medium">No scan requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/40 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-card-foreground truncate">{scan.scanType}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{scan.patientName}</div>
                  </div>
                  <span className={`ml-2 flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full ${statusStyles[scan.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {scan.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Today's summary strip */}
      <motion.div {...card(6)} className="rounded-2xl border border-border bg-gradient-to-r from-primary/5 to-info/5 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-card-foreground">Today's output</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedToday.length} scan{completedToday.length !== 1 ? 's' : ''} completed today · {inProgress.length} in progress
            </p>
          </div>
          <Link to="/dashboard/imaging-referrals" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
            Review imaging referrals <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ImagingDashboard;
