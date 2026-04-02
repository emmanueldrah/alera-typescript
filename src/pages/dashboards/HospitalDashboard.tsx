import { motion } from 'framer-motion';
import { Users, FileText, Heart, Calendar, ArrowRight, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const HospitalDashboard = () => {
  const { user, getUsers } = useAuth();
  const { appointments, referrals } = useAppData();
  const doctors = getUsers().filter((account) => account.role === 'doctor');
  const totalPatients = new Set(appointments.map((appointment) => appointment.patientId).filter(Boolean)).size;
  const todaysVisits = appointments.filter((appointment) => appointment.date === new Date().toISOString().split('T')[0]).length;
  const pendingReferrals = referrals.filter((referral) => referral.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Hospital Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Users className="w-5 h-5" />, label: 'Total Patients', value: totalPatients, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: <Heart className="w-5 h-5" />, label: 'Active Doctors', value: doctors.length, color: 'text-info', bg: 'bg-info/10' },
          { icon: <Calendar className="w-5 h-5" />, label: "Today's Visits", value: todaysVisits, color: 'text-success', bg: 'bg-success/10' },
          { icon: <FileText className="w-5 h-5" />, label: 'Pending Referrals', value: pendingReferrals.length, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((s, i) => (
          <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-display font-bold text-card-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Recent Admissions</h2>
            <Link to="/dashboard/patients" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No recent admissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <div className="text-sm font-medium text-card-foreground">{appointment.patientName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{appointment.type} • {appointment.date}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...card(5)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Doctor Assignments</h2>
            <Link to="/dashboard/doctors" className="text-sm text-primary hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No doctors assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.slice(0, 3).map((doctor) => (
                <div key={doctor.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <div className="text-sm font-medium text-card-foreground">{doctor.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{doctor.profile?.bio?.trim() || 'Doctor'}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
