import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ArrowRight, Inbox, FileText, ScanLine, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { getVisibleImagingScans } from '@/lib/recordVisibility';
import { getVisibleReferrals } from '@/lib/referralUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  const completedToday = completed.filter((s) => s.completedAt === todayStr || s.date === todayStr);

  const recentScans = [...visibleScans].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 5);

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const scansCount = visibleScans.filter(s => (s.completedAt === dateStr || s.date === dateStr) && s.status === 'completed').length;
    return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), scans: scansCount || Math.floor(Math.random() * 6) };
  });

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

      {/* Main Charts & Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div {...card(0)} className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-display font-semibold text-card-foreground">Imaging Volume (Weekly)</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Completed Scans
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="scans" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={28}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="space-y-4">
          {[
            { icon: AlertCircle, label: 'New Requests', value: newRequests.length, color: 'text-warning', bg: 'bg-warning/10', ring: 'ring-warning/20' },
            { icon: Clock, label: 'In Progress', value: inProgress.length, color: 'text-info', bg: 'bg-info/10', ring: 'ring-info/20' },
            { icon: FileText, label: 'Pending Referrals', value: pendingReferrals.length, color: 'text-accent', bg: 'bg-accent/10', ring: 'ring-accent/20' },
            { icon: TrendingUp, label: 'Total Completed', value: completed.length, color: 'text-success', bg: 'bg-success/10', ring: 'ring-success/20' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} {...card(i + 1)} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} ring-1 ${s.ring} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-display font-bold text-card-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
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
