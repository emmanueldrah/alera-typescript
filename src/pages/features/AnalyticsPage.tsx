import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Activity, TrendingUp, Heart, FlaskConical, ScanLine } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { api } from '@/lib/apiService';
import { handleApiError } from '@/lib/errorHandler';
import { normalizeUserRole } from '@/lib/roleUtils';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

interface PlatformStats {
  users: { total: number; by_role: Record<string, number> };
  appointments: { total: number; today: number };
  prescriptions: { active: number };
  lab_tests: { pending: number };
  imaging: { pending: number };
}

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { appointments, prescriptions, labTests, imagingScans } = useAppData();
  const effectiveRole = normalizeUserRole(user?.role) ?? user?.role;

  const scopedAppointments = useMemo(() => {
    if (effectiveRole === 'doctor') return appointments.filter((appointment) => appointment.doctorId === user?.id);
    if (effectiveRole === 'patient') return appointments.filter((appointment) => appointment.patientId === user?.id);
    return appointments;
  }, [appointments, user?.id, effectiveRole]);
  const scopedPrescriptions = useMemo(() => {
    if (effectiveRole === 'doctor') return prescriptions.filter((prescription) => prescription.doctorId === user?.id);
    if (effectiveRole === 'patient') return prescriptions.filter((prescription) => prescription.patientId === user?.id);
    return prescriptions;
  }, [prescriptions, user?.id, effectiveRole]);
  const scopedLabTests = useMemo(() => {
    if (effectiveRole === 'doctor') return labTests.filter((test) => test.doctorId === user?.id);
    if (effectiveRole === 'patient') return labTests.filter((test) => test.patientId === user?.id);
    return labTests;
  }, [labTests, user?.id, effectiveRole]);
  const scopedImagingScans = useMemo(() => {
    if (effectiveRole === 'doctor') return imagingScans.filter((scan) => scan.doctorId === user?.id);
    if (effectiveRole === 'patient') return imagingScans.filter((scan) => scan.patientId === user?.id);
    return imagingScans;
  }, [imagingScans, user?.id, effectiveRole]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

    return {
      totalAppointments: scopedAppointments.length,
      appointmentsTodayCount: scopedAppointments.filter(a => a.date === today).length,
      appointmentsThisWeek: scopedAppointments.filter(a => new Date(a.date) >= thisWeekStart).length,
      appointmentsScheduled: scopedAppointments.filter(a => a.status === 'scheduled').length,
      appointmentsCompleted: scopedAppointments.filter(a => a.status === 'completed').length,
      totalPrescriptions: scopedPrescriptions.length,
      prescriptionsActive: scopedPrescriptions.filter(p => p.status === 'active').length,
      prescriptionsDispensed: scopedPrescriptions.filter(p => p.status === 'dispensed').length,
      totalLabTests: scopedLabTests.length,
      labTestsCompleted: scopedLabTests.filter(t => t.status === 'completed').length,
      labTestsPending: scopedLabTests.filter(t => t.status === 'requested' || t.status === 'in-progress').length,
      totalImagingScans: scopedImagingScans.length,
      imagingScansCompleted: scopedImagingScans.filter(s => s.status === 'completed').length,
      imagingScansPending: scopedImagingScans.filter(s => s.status === 'requested' || s.status === 'in-progress').length,
    };
  }, [scopedAppointments, scopedPrescriptions, scopedLabTests, scopedImagingScans]);

  const isAdmin = effectiveRole === 'admin' || user?.role === 'super_admin';
  const isDoctor = effectiveRole === 'doctor';

  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [platformError, setPlatformError] = useState('');
  const [platformLoading, setPlatformLoading] = useState(false);

  const loadPlatform = useCallback(async () => {
    if (!isAdmin) return;
    setPlatformLoading(true);
    setPlatformError('');
    try {
      const data = await api.admin.getDashboardStats();
      setPlatformStats({
        users: data.users,
        appointments: data.appointments,
        prescriptions: data.prescriptions,
        lab_tests: data.lab_tests,
        imaging: data.imaging,
      });
    } catch (e) {
      setPlatformError(handleApiError(e));
      setPlatformStats(null);
    } finally {
      setPlatformLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadPlatform();
  }, [loadPlatform]);

  if (!isAdmin && !isDoctor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Health Analytics</h1>
          <p className="text-muted-foreground mt-1">Overview of your medical records (saved in your session)</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Heart className="w-5 h-5" />, label: 'Appointments', value: stats.totalAppointments, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: <FlaskConical className="w-5 h-5" />, label: 'Lab Tests', value: stats.totalLabTests, color: 'text-success', bg: 'bg-success/10' },
            { icon: <ScanLine className="w-5 h-5" />, label: 'Imaging Scans', value: stats.totalImagingScans, color: 'text-accent', bg: 'bg-accent/10' },
            { icon: <Activity className="w-5 h-5" />, label: 'Prescriptions', value: stats.totalPrescriptions, color: 'text-info', bg: 'bg-info/10' },
          ].map((s, i) => (
            <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
              <div className="text-2xl font-display font-bold text-card-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-display font-semibold text-card-foreground mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="text-sm text-muted-foreground">Appointments Today</span>
              <span className="text-lg font-semibold text-foreground">{stats.appointmentsTodayCount}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="text-sm text-muted-foreground">Active Prescriptions</span>
              <span className="text-lg font-semibold text-foreground">{stats.prescriptionsActive}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="text-sm text-muted-foreground">Pending Lab Results</span>
              <span className="text-lg font-semibold text-foreground">{stats.labTestsPending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Imaging</span>
              <span className="text-lg font-semibold text-foreground">{stats.imagingScansPending}</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const byRole = platformStats?.users.by_role ?? {};
  const adminKpis = isAdmin
    ? [
        {
          icon: <Users className="w-5 h-5" />,
          label: 'Registered users',
          value: platformLoading ? '…' : (platformStats?.users.total ?? '—'),
          change: platformError ? platformError : `Providers: ${byRole.provider ?? 0} · Patients: ${byRole.patient ?? 0}`,
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          icon: <Calendar className="w-5 h-5" />,
          label: 'Appointments (DB)',
          value: platformLoading ? '…' : (platformStats?.appointments.total ?? '—'),
          change: platformStats ? `${platformStats.appointments.today} today` : '',
          color: 'text-info',
          bg: 'bg-info/10',
        },
        {
          icon: <Activity className="w-5 h-5" />,
          label: 'Pending labs / imaging',
          value: platformLoading
            ? '…'
            : platformStats
              ? platformStats.lab_tests.pending + platformStats.imaging.pending
              : '—',
          change: platformStats
            ? `Labs ${platformStats.lab_tests.pending} · Imaging ${platformStats.imaging.pending}`
            : '',
          color: 'text-success',
          bg: 'bg-success/10',
        },
        {
          icon: <TrendingUp className="w-5 h-5" />,
          label: 'Active prescriptions (DB)',
          value: platformLoading ? '…' : (platformStats?.prescriptions.active ?? '—'),
          change: 'From database',
          color: 'text-accent',
          bg: 'bg-accent/10',
        },
      ]
    : [
        {
          icon: <Calendar className="w-5 h-5" />,
          label: 'Appointments',
          value: stats.totalAppointments,
          change: `${stats.appointmentsThisWeek} this week`,
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          icon: <Activity className="w-5 h-5" />,
          label: 'Lab tests',
          value: stats.totalLabTests,
          change: `${stats.labTestsCompleted} completed`,
          color: 'text-info',
          bg: 'bg-info/10',
        },
        {
          icon: <ScanLine className="w-5 h-5" />,
          label: 'Imaging',
          value: stats.totalImagingScans,
          change: `${stats.imagingScansPending} pending`,
          color: 'text-success',
          bg: 'bg-success/10',
        },
        {
          icon: <Heart className="w-5 h-5" />,
          label: 'Prescriptions',
          value: stats.totalPrescriptions,
          change: `${stats.prescriptionsActive} active`,
          color: 'text-accent',
          bg: 'bg-accent/10',
        },
      ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">System Analytics</h1>
          <p className="text-muted-foreground mt-1">{isAdmin ? 'Platform metrics from the API' : 'Your practice data in this session'}</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => void loadPlatform()}
            className="text-sm px-3 py-2 rounded-xl border border-border bg-secondary/50 hover:bg-secondary"
          >
            {platformLoading ? 'Refreshing…' : 'Refresh platform stats'}
          </button>
        )}
      </div>

      {isAdmin && platformError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-4">{platformError}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {adminKpis.map((s, i) => (
          <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-display font-bold text-card-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
            {s.change && <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.change}</div>}
          </motion.div>
        ))}
      </div>

      <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-display font-semibold text-card-foreground mb-6">Activity Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Appointments</h3>
            {[
              { label: 'Scheduled', value: stats.appointmentsScheduled, color: 'bg-primary' },
              { label: 'Completed', value: stats.appointmentsCompleted, color: 'bg-success' },
              { label: 'This Week', value: stats.appointmentsThisWeek, color: 'bg-info' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / Math.max(stats.appointmentsScheduled, 1)) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Test Results</h3>
            {[
              { label: 'Lab Tests', value: stats.labTestsCompleted, max: stats.totalLabTests, color: 'bg-success' },
              { label: 'Imaging Scans', value: stats.imagingScansCompleted, max: stats.totalImagingScans, color: 'bg-accent' },
              { label: 'Prescriptions', value: stats.prescriptionsDispensed, max: stats.totalPrescriptions, color: 'bg-warning' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}/{item.max}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / Math.max(item.max, 1)) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div {...card(5)} className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Service Status</h3>
          <div className="space-y-3">
            {[
              { name: 'API', status: platformError ? 'degraded' : 'operational' },
              { name: 'Admin metrics', status: isAdmin && platformStats ? 'loaded' : isAdmin ? 'not loaded' : 'n/a' },
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{service.name}</span>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    service.status === 'operational' || service.status === 'loaded'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">{isAdmin ? 'Users by role (database)' : 'Practice summary'}</h3>
          <div className="space-y-3">
            {isAdmin && platformStats ? (
              <>
                {Object.entries(platformStats.users.by_role)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground capitalize">{role}</span>
                      <span className="text-sm font-semibold text-foreground">{count}</span>
                    </div>
                  ))}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Appointments</span>
                  <span className="text-sm font-semibold text-foreground">{stats.totalAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active prescriptions</span>
                  <span className="text-sm font-semibold text-foreground">{stats.prescriptionsActive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending labs</span>
                  <span className="text-sm font-semibold text-foreground">{stats.labTestsPending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending imaging</span>
                  <span className="text-sm font-semibold text-foreground">{stats.imagingScansPending}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
