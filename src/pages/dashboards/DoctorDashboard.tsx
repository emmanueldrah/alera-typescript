import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  FlaskConical,
  Inbox,
  ScanLine,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';

const card = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06 },
});

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { appointments, labTests, imagingScans } = useAppData();

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(
    (appointment) =>
      appointment.doctorId === user?.id &&
      appointment.date === today &&
      (appointment.status === 'scheduled' || appointment.status === 'in-progress' || appointment.status === 'confirmed-by-doctor'),
  );
  const scheduledAppointments = appointments.filter(
    (appointment) =>
      appointment.doctorId === user?.id &&
      (appointment.status === 'scheduled' || appointment.status === 'confirmed-by-doctor'),
  );
  const activePatients = new Set(
    appointments.filter((appointment) => appointment.doctorId === user?.id).map((appointment) => appointment.patientId),
  ).size;
  const pendingLabTests = labTests.filter(
    (test) => test.doctorId === user?.id && (test.status === 'requested' || test.status === 'in-progress'),
  );
  const pendingImaging = imagingScans.filter(
    (scan) => scan.doctorId === user?.id && scan.status !== 'completed' && scan.status !== 'cancelled',
  );
  const urgentQueue = [...pendingLabTests, ...pendingImaging]
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: 'testName' in item ? item.testName : item.scanType,
      patientName: item.patientName,
      status: item.status,
      destination: 'destinationProviderName' in item ? item.destinationProviderName : item.destinationProviderName,
      type: 'testName' in item ? 'Lab' : 'Imaging',
    }));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(145deg,_#ffffff_0%,_#f7fbff_55%,_#eefaf4_100%)] p-8 shadow-sm"
      >
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-sky-700">
              <Stethoscope className="h-4 w-4" />
              Clinical command view
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">Good morning, {user?.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Today’s visits, pending diagnostics, and your active patient panel are all arranged here so you can move from triage to follow-up without hunting through the sidebar.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: <Calendar className="h-5 w-5" />,
                  label: "Today's appointments",
                  value: todaysAppointments.length,
                  helper: 'Scheduled, confirmed, or in progress',
                  link: '/dashboard/appointments',
                  tone: 'bg-sky-50 text-sky-700',
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  label: 'Active patients',
                  value: activePatients,
                  helper: 'Distinct patients on your panel',
                  link: '/dashboard/patients',
                  tone: 'bg-emerald-50 text-emerald-700',
                },
                {
                  icon: <FlaskConical className="h-5 w-5" />,
                  label: 'Pending labs',
                  value: pendingLabTests.length,
                  helper: 'Awaiting result or review',
                  link: '/dashboard/lab-referrals',
                  tone: 'bg-amber-50 text-amber-700',
                },
                {
                  icon: <ScanLine className="h-5 w-5" />,
                  label: 'Pending imaging',
                  value: pendingImaging.length,
                  helper: 'Open imaging studies',
                  link: '/dashboard/imaging-referrals',
                  tone: 'bg-slate-100 text-slate-700',
                },
              ].map((item, index) => (
                <motion.div key={item.label} {...card(index)}>
                  <Link
                    to={item.link}
                    className="block rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Today</p>
            <h2 className="mt-3 text-xl font-semibold">Schedule snapshot</h2>
            <div className="mt-6 space-y-4">
              {todaysAppointments.slice(0, 4).map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{appointment.patientName}</div>
                      <div className="mt-1 text-sm text-slate-300">{appointment.type}</div>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                      {appointment.status === 'in-progress' ? 'Live' : 'Planned'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {appointment.time}
                  </div>
                </div>
              ))}
              {todaysAppointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                  No appointments on today’s schedule.
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
              <h2 className="text-xl font-semibold text-slate-950">Upcoming appointments</h2>
              <p className="mt-1 text-sm text-slate-500">The next confirmed and scheduled visits on your calendar.</p>
            </div>
            <Link to="/dashboard/appointments" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Manage <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {scheduledAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="mb-2 h-8 w-8" />
              <p className="text-sm">No upcoming appointments</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {scheduledAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{appointment.patientName}</div>
                      <div className="mt-1 text-sm text-slate-600">{appointment.type}</div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {appointment.date} at {appointment.time}
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {appointment.appointmentMode === 'telemedicine' ? 'Telemedicine' : 'In person'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...card(5)} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Diagnostic queue</h2>
              <p className="mt-1 text-sm text-slate-500">Outstanding lab and imaging requests that still need movement.</p>
            </div>
            <Link to="/dashboard/lab-referrals" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Open referrals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {urgentQueue.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No pending lab or imaging work right now.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {urgentQueue.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.type}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-600">{item.patientName}</div>
                      {item.destination ? <div className="mt-2 text-xs text-slate-500">{item.destination}</div> : null}
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                      {item.status}
                    </span>
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
