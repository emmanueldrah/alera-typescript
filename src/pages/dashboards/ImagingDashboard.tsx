import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ArrowRight, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { getVisibleImagingScans } from '@/lib/recordVisibility';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const ImagingDashboard = () => {
  const { user } = useAuth();
  const { imagingScans } = useAppData();
  const visibleScans = getVisibleImagingScans(imagingScans, user);
  const newRequests = visibleScans.filter((scan) => scan.status === 'requested');
  const inProgress = visibleScans.filter((scan) => scan.status === 'in-progress');
  const completed = visibleScans.filter((scan) => scan.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Imaging Center Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <AlertCircle className="w-5 h-5" />, label: 'New Requests', value: newRequests.length, color: 'text-warning', bg: 'bg-warning/10' },
          { icon: <Clock className="w-5 h-5" />, label: 'In Progress', value: inProgress.length, color: 'text-info', bg: 'bg-info/10' },
          { icon: <CheckCircle className="w-5 h-5" />, label: 'Completed', value: completed.length, color: 'text-success', bg: 'bg-success/10' },
        ].map((s, i) => (
          <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-display font-bold text-card-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div {...card(3)} className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-card-foreground">All Scan Requests</h2>
          <Link to="/dashboard/scan-requests" className="text-sm text-primary hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
        </div>
          {visibleScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No scan requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleScans.slice(0, 3).map((scan) => (
                <div key={scan.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <div className="text-sm font-medium text-card-foreground">{scan.scanType}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{scan.patientName} • {scan.status}</div>
                </div>
              ))}
            </div>
          )}
      </motion.div>
    </div>
  );
};

export default ImagingDashboard;
