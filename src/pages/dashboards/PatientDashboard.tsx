import { motion } from 'framer-motion';
import { Calendar, Pill, FlaskConical, ScanLine, Ambulance, Activity, ArrowRight, Inbox, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const PatientDashboard = () => {
  const { user } = useAuth();
  const { appointments, prescriptions, labTests, imagingScans, isLoading } = useAppData();

  // Get upcoming (scheduled) appointments
  const upcomingAppointments = appointments.filter((apt) => apt.status === 'scheduled' && apt.patientId === user?.id);
  const totalUpcoming = upcomingAppointments.length;
  const totalActivePrescriptions = prescriptions.filter((p) => p.status === 'active' && p.patientId === user?.id).length;
  const totalLabTests = labTests.filter((t) => t.patientId === user?.id).length;
  const timelineEvents = [
    ...upcomingAppointments.map((appointment) => ({
      id: appointment.id,
      date: appointment.date,
      label: `${appointment.type} with ${appointment.doctorName}`,
      meta: appointment.time,
    })),
    ...prescriptions
      .filter((prescription) => prescription.patientId === user?.id)
      .map((prescription) => ({
        id: prescription.id,
        date: prescription.date,
        label: `Prescription: ${prescription.medications[0]?.name ?? 'Medication'}`,
        meta: prescription.status,
      })),
    ...labTests
      .filter((test) => test.patientId === user?.id)
      .map((test) => ({
        id: test.id,
        date: test.date,
        label: `Lab: ${test.testName}`,
        meta: test.status,
      })),
    ...imagingScans
      .filter((scan) => scan.patientId === user?.id)
      .map((scan) => ({
        id: scan.id,
        date: scan.date,
        label: `Imaging: ${scan.scanType}`,
        meta: scan.status,
      })),
  ].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">Here's your health overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Calendar className="w-5 h-5" />, label: 'Upcoming', value: isLoading ? '...' : totalUpcoming, color: 'text-primary', bg: 'bg-primary/10', link: '/dashboard/appointments' },
          { icon: <Pill className="w-5 h-5" />, label: 'Active Rx', value: isLoading ? '...' : totalActivePrescriptions, color: 'text-info', bg: 'bg-info/10', link: '/dashboard/prescriptions' },
          { icon: <FlaskConical className="w-5 h-5" />, label: 'Lab Tests', value: isLoading ? '...' : totalLabTests, color: 'text-success', bg: 'bg-success/10', link: '/dashboard/lab-results' },
          { icon: <Activity className="w-5 h-5" />, label: 'Timeline', value: isLoading ? '...' : timelineEvents.length, color: 'text-accent', bg: 'bg-accent/10', link: '/dashboard/timeline' },
        ].map((s, i) => (
          <motion.div key={i} {...card(i)}>
            <Link to={s.link} className="block p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-glow transition-all">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
              <div className="text-2xl font-display font-bold text-card-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Upcoming Appointments</h2>
            <Link to="/dashboard/appointments" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-card-foreground">{apt.type}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{apt.doctorName}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {apt.date} at {apt.time}
                        </span>
                        {apt.appointmentMode === 'telemedicine' && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">📹 Video</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...card(5)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Medical Timeline</h2>
            <Link to="/dashboard/timeline" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {timelineEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No timeline events yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timelineEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <div className="text-sm font-medium text-card-foreground">{event.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{event.date} • {event.meta}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Book Appointment', icon: <Calendar className="w-5 h-5" />, link: '/dashboard/appointments' },
          { label: 'Request Ambulance', icon: <Ambulance className="w-5 h-5" />, link: '/dashboard/ambulance' },
          { label: 'View Lab Results', icon: <FlaskConical className="w-5 h-5" />, link: '/dashboard/lab-results' },
          { label: 'View Imaging', icon: <ScanLine className="w-5 h-5" />, link: '/dashboard/imaging' },
        ].map((a, i) => (
          <Link key={i} to={a.link} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-glow transition-all">
            <span className="text-primary">{a.icon}</span>
            <span className="text-sm font-medium text-card-foreground">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PatientDashboard;
