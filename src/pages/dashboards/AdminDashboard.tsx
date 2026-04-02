import { motion } from 'framer-motion';
import { Users, ShieldCheck, Activity, Building2, FlaskConical, Pill, Ambulance, Heart, BarChart3, AlertCircle, ScanLine, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const AdminDashboard = () => {
  const { user, getUsers } = useAuth();
  const { appointments, ambulanceRequests, providerVerifications } = useAppData();
  const { notifications } = useNotifications();
  const users = getUsers();
  const today = new Date().toISOString().split('T')[0];
  const userCounts = {
    patient: users.filter((account) => account.role === 'patient').length,
    doctor: users.filter((account) => account.role === 'doctor').length,
    hospital: users.filter((account) => account.role === 'hospital').length,
    laboratory: users.filter((account) => account.role === 'laboratory').length,
    imaging: users.filter((account) => account.role === 'imaging').length,
    pharmacy: users.filter((account) => account.role === 'pharmacy').length,
    ambulance: users.filter((account) => account.role === 'ambulance').length,
  };
  const pendingVerifications = providerVerifications.filter((verification) => verification.status === 'pending');
  const appointmentsToday = appointments.filter((appointment) => appointment.date === today);
  const activeEmergencies = ambulanceRequests.filter((request) => request.priority === 'critical' && request.status !== 'completed');
  const recentActivity = [
    ...appointments.slice(0, 3).map((appointment) => ({
      id: `appointment-${appointment.id}`,
      label: `Appointment ${appointment.status}`,
      detail: `${appointment.patientName} with ${appointment.doctorName}`,
    })),
    ...pendingVerifications.slice(0, 2).map((verification) => ({
      id: `verification-${verification.id}`,
      label: 'Verification pending',
      detail: `${verification.name} • ${verification.role}`,
    })),
    ...notifications.filter((notification) => !notification.archived).slice(0, 2).map((notification) => ({
      id: `notification-${notification.id}`,
      label: notification.title,
      detail: notification.message,
    })),
  ].slice(0, 5);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview for {user?.name}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Users className="w-5 h-5" />, label: 'Total Users', value: users.length, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: <ShieldCheck className="w-5 h-5" />, label: 'Pending Verify', value: pendingVerifications.length, color: 'text-warning', bg: 'bg-warning/10' },
          { icon: <Activity className="w-5 h-5" />, label: 'Appts Today', value: appointmentsToday.length, color: 'text-info', bg: 'bg-info/10' },
          { icon: <AlertCircle className="w-5 h-5" />, label: 'Emergencies', value: activeEmergencies.length, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map((s, i) => (
          <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-display font-bold text-card-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>
      <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-display font-semibold text-card-foreground mb-4">User Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-4 h-4" />, label: 'Patients', value: userCounts.patient },
            { icon: <Heart className="w-4 h-4" />, label: 'Doctors', value: userCounts.doctor },
            { icon: <Building2 className="w-4 h-4" />, label: 'Hospitals', value: userCounts.hospital },
            { icon: <FlaskConical className="w-4 h-4" />, label: 'Labs', value: userCounts.laboratory },
            { icon: <ScanLine className="w-4 h-4" />, label: 'Imaging', value: userCounts.imaging },
            { icon: <Pill className="w-4 h-4" />, label: 'Pharmacies', value: userCounts.pharmacy },
            { icon: <Ambulance className="w-4 h-4" />, label: 'Ambulances', value: userCounts.ambulance },
            { icon: <BarChart3 className="w-4 h-4" />, label: 'Total', value: users.length },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <span className="text-primary">{item.icon}</span>
              <div>
                <div className="text-lg font-bold text-card-foreground">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...card(5)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">User Management</h2>
            <Link to="/dashboard/users" className="text-sm text-primary hover:underline">Manage users</Link>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mb-2" />
            <p className="text-sm">Add and manage system users</p>
          </div>
        </motion.div>
        <motion.div {...card(6)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Pending Verifications</h2>
            <Link to="/dashboard/verifications" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {pendingVerifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No pending verifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingVerifications.slice(0, 3).map((verification) => (
                <div key={verification.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <div className="text-sm font-medium text-card-foreground">{verification.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{verification.role} • applied {verification.appliedDate}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <motion.div {...card(7)} className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-card-foreground">System Activity</h2>
          <Link to="/dashboard/analytics" className="text-sm text-primary hover:underline">Analytics</Link>
        </div>
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Activity className="w-8 h-8 mb-2" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                <div className="text-sm font-medium text-card-foreground">{entry.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{entry.detail}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
