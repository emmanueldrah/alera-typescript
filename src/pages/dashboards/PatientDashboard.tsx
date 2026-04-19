import { motion } from 'framer-motion';
import {
  Activity,
  Ambulance,
  ArrowRight,
  Calendar,
  Clock,
  FlaskConical,
  HeartPulse,
  Inbox,
  Pill,
  ScanLine,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';

const card = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06 },
});

const PatientDashboard = () => {
  const { user } = useAuth();
  const { appointments, prescriptions, labTests, imagingScans, isLoading } = useAppData();

  const patientAppointments = appointments.filter((appointment) => appointment.patientId === user?.id);
  const upcomingAppointments = patientAppointments.filter(
    (appointment) => appointment.status === 'scheduled' || appointment.status === 'confirmed-by-doctor',
  );
  const activePrescriptions = prescriptions.filter(
    (prescription) => prescription.status === 'active' && prescription.patientId === user?.id,
  );
  const patientLabTests = labTests.filter((test) => test.patientId === user?.id);
  const patientImaging = imagingScans.filter((scan) => scan.patientId === user?.id);

  const recentTimeline = [
    ...patientAppointments.map((appointment) => ({
      id: `appointment-${appointment.id}`,
      title: `${appointment.type} with ${appointment.doctorName}`,
      meta: `${appointment.date} at ${appointment.time}`,
      timestamp: appointment.date,
      tone: 'sky',
    })),
    ...patientLabTests.map((test) => ({
      id: `lab-${test.id}`,
      title: `Lab: ${test.testName}`,
      meta: `${test.date} • ${test.status}`,
      timestamp: test.date,
      tone: 'emerald',
    })),
    ...patientImaging.map((scan) => ({
      id: `imaging-${scan.id}`,
      title: `Imaging: ${scan.scanType}`,
      meta: `${scan.date} • ${scan.status}`,
      timestamp: scan.date,
      tone: 'amber',
    })),
  ]
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(135deg,_#ffffff_0%,_#f8fbff_54%,_#f1faf6_100%)] p-8 shadow-sm"
      >
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-700">
              <HeartPulse className="h-4 w-4" />
              Personal care overview
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              Welcome back, {user?.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Keep up with appointments, prescriptions, labs, and imaging in one place. Your dashboard brings the next step in your care to the top.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: <Calendar className="h-5 w-5" />,
                  label: 'Upcoming visits',
                  value: isLoading ? '...' : upcomingAppointments.length,
                  helper: 'Scheduled or confirmed',
                  link: '/dashboard/appointments',
                  tone: 'bg-sky-50 text-sky-700',
                },
                {
                  icon: <Pill className="h-5 w-5" />,
                  label: 'Active prescriptions',
                  value: isLoading ? '...' : activePrescriptions.length,
                  helper: 'Current medication plan',
                  link: '/dashboard/prescriptions',
                  tone: 'bg-emerald-50 text-emerald-700',
                },
                {
                  icon: <FlaskConical className="h-5 w-5" />,
                  label: 'Lab results',
                  value: isLoading ? '...' : patientLabTests.length,
                  helper: 'Tests on your record',
                  link: '/dashboard/lab-results',
                  tone: 'bg-amber-50 text-amber-700',
                },
                {
                  icon: <Activity className="h-5 w-5" />,
                  label: 'Timeline events',
                  value: isLoading ? '...' : recentTimeline.length,
                  helper: 'Recent care activity',
                  link: '/dashboard/timeline',
                  tone: 'bg-slate-100 text-slate-700',
                },
              ].map((item, index) => (
                <motion.div key={item.label} {...card(index)}>
                  <Link
                    to={item.link}
                    className="block rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                  >
                    <div className={`inline-flex rounded-2xl p-3 ${item.tone}`}>{item.icon}</div>
                    <div className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{item.value}</div>
                    <div className="mt-1 text-sm font-medium text-slate-700">{item.label}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.helper}</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">At a glance</p>
            <h2 className="mt-3 text-xl font-semibold">Your next care touchpoints</h2>
            <div className="mt-6 space-y-4">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">{appointment.type}</div>
                  <div className="mt-1 text-sm text-slate-300">{appointment.doctorName}</div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {appointment.date} at {appointment.time}
                  </div>
                </div>
              ))}
              {upcomingAppointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                  No upcoming appointments yet. Use the quick actions below to book your next visit.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.div {...card(4)} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Medical timeline</h2>
              <p className="mt-1 text-sm text-slate-500">Recent appointments, tests, and imaging events.</p>
            </div>
            <Link to="/dashboard/timeline" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentTimeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="mb-2 h-8 w-8" />
              <p className="text-sm">No timeline events yet</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {recentTimeline.map((event) => (
                <div key={event.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className={`mt-1 h-3 w-3 rounded-full ${
                    event.tone === 'sky' ? 'bg-sky-500' : event.tone === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{event.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{event.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...card(5)} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Quick actions</h2>
              <p className="mt-1 text-sm text-slate-500">Jump straight to the most common tasks.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Book appointment', icon: <Calendar className="h-5 w-5" />, link: '/dashboard/appointments' },
              { label: 'Request ambulance', icon: <Ambulance className="h-5 w-5" />, link: '/dashboard/ambulance' },
              { label: 'View lab results', icon: <FlaskConical className="h-5 w-5" />, link: '/dashboard/lab-results' },
              { label: 'Open imaging', icon: <ScanLine className="h-5 w-5" />, link: '/dashboard/imaging' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.link}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-primary/30 hover:bg-white"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-slate-800">
                  <span className="rounded-xl bg-white p-2 text-primary shadow-sm">{action.icon}</span>
                  {action.label}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDashboard;
