import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Activity, TrendingUp, Inbox, Heart, FlaskConical, ScanLine } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { systemStats, doctors } from '@/data/mockData';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { appointments, prescriptions, labTests, imagingScans } = useAppData();
  const scopedAppointments = useMemo(() => {
    if (user?.role === 'doctor') return appointments.filter((appointment) => appointment.doctorId === user.id);
    if (user?.role === 'patient') return appointments.filter((appointment) => appointment.patientId === user.id);
    return appointments;
  }, [appointments, user?.id, user?.role]);
  const scopedPrescriptions = useMemo(() => {
    if (user?.role === 'doctor') return prescriptions.filter((prescription) => prescription.doctorId === user.id);
    if (user?.role === 'patient') return prescriptions.filter((prescription) => prescription.patientId === user.id);
    return prescriptions;
  }, [prescriptions, user?.id, user?.role]);
  const scopedLabTests = useMemo(() => {
    if (user?.role === 'doctor') return labTests.filter((test) => test.doctorId === user.id);
    if (user?.role === 'patient') return labTests.filter((test) => test.patientId === user.id);
    return labTests;
  }, [labTests, user?.id, user?.role]);
  const scopedImagingScans = useMemo(() => {
    if (user?.role === 'doctor') return imagingScans.filter((scan) => scan.doctorId === user.id);
    if (user?.role === 'patient') return imagingScans.filter((scan) => scan.patientId === user.id);
    return imagingScans;
  }, [imagingScans, user?.id, user?.role]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

    return {
      // Appointment stats
      totalAppointments: scopedAppointments.length,
      appointmentsTodayCount: scopedAppointments.filter(a => a.date === today).length,
      appointmentsThisWeek: scopedAppointments.filter(a => new Date(a.date) >= thisWeekStart).length,
      appointmentsScheduled: scopedAppointments.filter(a => a.status === 'scheduled').length,
      appointmentsCompleted: scopedAppointments.filter(a => a.status === 'completed').length,

      // Prescription stats
      totalPrescriptions: scopedPrescriptions.length,
      prescriptionsActive: scopedPrescriptions.filter(p => p.status === 'active').length,
      prescriptionsDispensed: scopedPrescriptions.filter(p => p.status === 'dispensed').length,

      // Lab stats
      totalLabTests: scopedLabTests.length,
      labTestsCompleted: scopedLabTests.filter(t => t.status === 'completed').length,
      labTestsPending: scopedLabTests.filter(t => t.status === 'requested' || t.status === 'in-progress').length,

      // Imaging stats
      totalImagingScans: scopedImagingScans.length,
      imagingScansCompleted: scopedImagingScans.filter(s => s.status === 'completed').length,
      imagingScansPending: scopedImagingScans.filter(s => s.status === 'requested' || s.status === 'in-progress').length,

      // System stats
      totalDoctors: doctors.length,
      activeDoctors: doctors.filter(d => d.status === 'available').length,
    };
  }, [scopedAppointments, scopedPrescriptions, scopedLabTests, scopedImagingScans]);

  // Only admins can see full analytics, others see personal stats
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';

  if (!isAdmin && !isDoctor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Health Analytics</h1>
          <p className="text-muted-foreground mt-1">Overview of your medical records</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">System Analytics</h1>
        <p className="text-muted-foreground mt-1">{isAdmin ? 'Platform-wide metrics' : 'Your practice analytics'}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Users className="w-5 h-5" />, label: 'Total Doctors', value: stats.totalDoctors, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: <Calendar className="w-5 h-5" />, label: 'Total Appts', value: stats.totalAppointments, change: `📈 ${stats.appointmentsThisWeek} this week`, color: 'text-info', bg: 'bg-info/10' },
          { icon: <Activity className="w-5 h-5" />, label: 'Lab Tests', value: stats.totalLabTests, change: `✅ ${stats.labTestsCompleted} completed`, color: 'text-success', bg: 'bg-success/10' },
          { icon: <TrendingUp className="w-5 h-5" />, label: 'Active Doctors', value: stats.activeDoctors, change: `${((stats.activeDoctors / stats.totalDoctors) * 100).toFixed(0)}% available`, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((s, i) => (
          <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-display font-bold text-card-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
            {s.change && <div className="text-xs text-muted-foreground mt-2">{s.change}</div>}
          </motion.div>
        ))}
      </div>

      {/* Activity Overview */}
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

      {/* System Health */}
      <motion.div {...card(5)} className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Service Status</h3>
          <div className="space-y-3">
            {[
              { name: 'Telemedicine API', status: 'operational' },
              { name: 'Lab Integration', status: 'operational' },
              { name: 'Imaging Services', status: 'operational' },
              { name: 'Pharmacy Network', status: 'operational' },
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{service.name}</span>
                <span className="px-2 py-1 rounded-md bg-success/10 text-success text-xs font-medium">🟢 {service.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Top Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Consultation Fee</span>
              <span className="text-sm font-semibold text-foreground">${(doctors.reduce((a, b) => a + b.consultationFee, 0) / Math.max(doctors.length, 1)).toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Doctor Rating</span>
              <span className="text-sm font-semibold text-foreground">{(doctors.reduce((a, b) => a + b.rating, 0) / Math.max(doctors.length, 1)).toFixed(1)}⭐</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Reviews</span>
              <span className="text-sm font-semibold text-foreground">{doctors.reduce((a, b) => a + b.reviewCount, 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className="text-sm font-semibold text-foreground">99.9%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
