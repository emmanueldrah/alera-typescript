import { motion } from 'framer-motion';
import { FlaskConical, Clock, CheckCircle, ArrowRight, AlertCircle, Inbox, TestTube, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const statusStyles: Record<string, string> = {
  requested: 'bg-warning/10 text-warning',
  'in-progress': 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const LaboratoryDashboard = () => {
  const { user } = useAuth();
  const { labTests } = useAppData();

  const newRequests = labTests.filter((t) => t.status === 'requested');
  const inProgress = labTests.filter((t) => t.status === 'in-progress');
  const completed = labTests.filter((t) => t.status === 'completed');
  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = completed.filter((t) => t.date === todayStr);
  const recentTests = [...labTests].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Laboratory Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome, {user?.name} — {newRequests.length} test{newRequests.length !== 1 ? 's' : ''} awaiting processing</p>
        </div>
        <Link to="/dashboard/test-requests" className="hidden sm:flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/15 transition">
          Process Queue <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: AlertCircle, label: 'New Requests', value: newRequests.length, color: 'text-warning', bg: 'bg-warning/10', ring: 'ring-warning/20' },
          { icon: Clock, label: 'In Progress', value: inProgress.length, color: 'text-info', bg: 'bg-info/10', ring: 'ring-info/20' },
          { icon: CheckCircle, label: 'Completed', value: completed.length, color: 'text-success', bg: 'bg-success/10', ring: 'ring-success/20' },
          { icon: TrendingUp, label: "Today's Output", value: completedToday.length, color: 'text-primary', bg: 'bg-primary/10', ring: 'ring-primary/20' },
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
        {/* Pending queue */}
        <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-display font-semibold text-card-foreground">Pending Tests</h2>
            </div>
            <Link to="/dashboard/test-requests" className="text-sm text-primary hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {newRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <TestTube className="w-9 h-9 mb-2 opacity-40" />
              <p className="text-sm font-medium">All caught up</p>
              <p className="text-xs mt-1">No pending test requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {newRequests.slice(0, 4).map((test) => (
                <div key={test.id} className="flex items-start justify-between rounded-xl border border-border/50 bg-secondary/40 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-card-foreground truncate">{test.testName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{test.patientName} · requested {test.date}</div>
                  </div>
                  <span className={`ml-2 flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full ${statusStyles['requested']}`}>Pending</span>
                </div>
              ))}
              {newRequests.length > 4 && (
                <Link to="/dashboard/test-requests" className="block text-center text-xs text-primary hover:underline pt-1">
                  +{newRequests.length - 4} more in queue
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Recent completed */}
        <motion.div {...card(5)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-success/10 text-success flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-display font-semibold text-card-foreground">Recent Results</h2>
            </div>
            <Link to="/dashboard/results" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recentTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Inbox className="w-9 h-9 mb-2 opacity-40" />
              <p className="text-sm font-medium">No tests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/40 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-card-foreground truncate">{test.testName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{test.patientName}</div>
                  </div>
                  <span className={`ml-2 flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full ${statusStyles[test.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {test.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LaboratoryDashboard;
