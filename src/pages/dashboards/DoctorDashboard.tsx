import { motion } from 'framer-motion';
import { Calendar, Users, FlaskConical, ScanLine, ArrowRight, Inbox, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { appointments, labTests, imagingScans, referrals } = useAppData();

  // Get today's appointments for this doctor
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(
    (apt) => apt.doctorId === user?.id && apt.date === today && (apt.status === 'scheduled' || apt.status === 'in-progress'),
  );
  
  // Get all scheduled appointments for this doctor
  const allScheduledAppointments = appointments.filter(
    (apt) => apt.doctorId === user?.id && apt.status === 'scheduled',
  );

  // Get unique patients
  const uniquePatients = new Set(appointments.filter((apt) => apt.doctorId === user?.id).map((apt) => apt.patientId)).size;

  // Count pending lab/imaging requests
  const pendingLabTests = labTests.filter(
    (test) => test.doctorId === user?.id && (test.status === 'requested' || test.status === 'in-progress'),
  );
  const pendingImagingScans = imagingScans.filter(
    (scan) => scan.doctorId === user?.id && (scan.status === 'requested' || scan.status === 'in-progress'),
  );
  const pendingImagingReferrals = referrals.filter(
    (referral) => referral.fromDoctorId === user?.id && referral.referralType === 'imaging' && referral.status !== 'completed' && referral.status !== 'cancelled',
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Good morning, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">You have {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} today</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Calendar className="w-5 h-5" />, label: "Today's Appts", value: todayAppointments.length, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: <Users className="w-5 h-5" />, label: 'Active Patients', value: uniquePatients, color: 'text-info', bg: 'bg-info/10' },
          { icon: <FlaskConical className="w-5 h-5" />, label: 'Pending Labs', value: pendingLabTests.length, color: 'text-warning', bg: 'bg-warning/10' },
          { icon: <ScanLine className="w-5 h-5" />, label: 'Pending Scans', value: pendingImagingScans.length, color: 'text-accent', bg: 'bg-accent/10' },
          { icon: <ScanLine className="w-5 h-5" />, label: 'Imaging Referrals', value: pendingImagingReferrals.length, color: 'text-cyan-700', bg: 'bg-cyan-100' },
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
            <h2 className="text-lg font-display font-semibold text-card-foreground">Today's Schedule</h2>
            <Link to="/dashboard/appointments" className="text-sm text-primary hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {todayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-card-foreground">{apt.patientName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{apt.type}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {apt.time}
                        </span>
                        {apt.appointmentMode === 'telemedicine' ? (
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">📹 Video</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-warning/10 text-warning text-xs">🏥 In-Person</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${apt.status === 'in-progress' ? 'bg-info/10 text-info' : 'bg-primary/10 text-primary'}`}>
                      {apt.status === 'in-progress' ? 'In Progress' : 'Scheduled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...card(5)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Upcoming Appointments</h2>
            <Link to="/dashboard/appointments" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {allScheduledAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allScheduledAppointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-card-foreground">{apt.patientName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{apt.type}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                        <Clock className="w-3 h-3" /> {apt.date} at {apt.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
