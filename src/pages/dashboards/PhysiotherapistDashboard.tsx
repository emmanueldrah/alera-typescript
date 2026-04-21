import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardList,
  MessageSquare,
  MoveRight,
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

const PhysiotherapistDashboard = () => {
  const { user } = useAuth();
  const { appointments, referrals, clinicalNotes } = useAppData();

  const today = new Date().toISOString().split('T')[0];
  const myAppointments = appointments.filter((appointment) => appointment.doctorId === user?.id);
  const todaysSessions = myAppointments.filter(
    (appointment) =>
      appointment.date === today &&
      (appointment.status === 'scheduled' || appointment.status === 'in-progress' || appointment.status === 'confirmed-by-doctor'),
  );
  const activePatients = new Set(myAppointments.map((appointment) => appointment.patientId)).size;
  const openReferrals = referrals.filter(
    (referral) =>
      (referral.destinationProviderId === user?.id || referral.destinationProviderRole === 'physiotherapist') &&
      referral.status !== 'completed' &&
      referral.status !== 'cancelled',
  );
  const recentNotes = clinicalNotes
    .filter((note) => note.doctorId === user?.id)
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
  const completedThisWeek = myAppointments.filter((appointment) => {
    if (appointment.status !== 'completed') return false;
    const appointmentTime = new Date(`${appointment.date}T00:00:00`);
    const now = new Date();
    const diff = now.getTime() - appointmentTime.getTime();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_28%),radial-gradient(circle_at_right,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(145deg,_#fbfffd_0%,_#f2fbf8_55%,_#eef8ff_100%)] p-8 shadow-sm"
      >
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-4 py-1.5 text-sm font-medium text-emerald-700">
              <Activity className="h-4 w-4" />
              Rehabilitation command center
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">Welcome back, {user?.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Today’s recovery sessions, incoming referrals, and follow-up documentation are organized here so you can keep every patient’s rehab plan moving.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: <Calendar className="h-5 w-5" />,
                  label: "Today's sessions",
                  value: todaysSessions.length,
                  helper: 'Scheduled or currently active',
                  link: '/dashboard/appointments',
                  tone: 'bg-emerald-50 text-emerald-700',
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  label: 'Active caseload',
                  value: activePatients,
                  helper: 'Patients with active rehab touchpoints',
                  link: '/dashboard/patients',
                  tone: 'bg-sky-50 text-sky-700',
                },
                {
                  icon: <MoveRight className="h-5 w-5" />,
                  label: 'Open referrals',
                  value: openReferrals.length,
                  helper: 'Awaiting intake or handoff',
                  link: '/dashboard/referrals',
                  tone: 'bg-amber-50 text-amber-700',
                },
                {
                  icon: <CheckCircle2 className="h-5 w-5" />,
                  label: 'Completed this week',
                  value: completedThisWeek,
                  helper: 'Finished therapy sessions',
                  link: '/dashboard/appointments',
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
            <h2 className="mt-3 text-xl font-semibold">Session cadence</h2>
            <div className="mt-6 space-y-4">
              {todaysSessions.slice(0, 4).map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{appointment.patientName}</div>
                      <div className="mt-1 text-sm text-slate-300">{appointment.type}</div>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                      {appointment.status === 'in-progress' ? 'Active' : 'Scheduled'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {appointment.time}
                  </div>
                </div>
              ))}
              {todaysSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                  No rehab sessions booked for today yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <motion.div {...card(4)} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Referral intake</h2>
              <p className="mt-1 text-sm text-slate-500">New and active rehabilitation referrals that need assessment or follow-up.</p>
            </div>
            <Link to="/dashboard/referrals" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Review <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {openReferrals.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No open physiotherapy referrals right now.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {openReferrals.slice(0, 5).map((referral) => (
                <div key={referral.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{referral.patientName}</div>
                      <div className="mt-1 text-sm text-slate-600">{referral.reason}</div>
                      <div className="mt-2 text-xs text-slate-500">{referral.toDepartment}</div>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                      {referral.status}
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
              <h2 className="text-xl font-semibold text-slate-950">Documentation flow</h2>
              <p className="mt-1 text-sm text-slate-500">Recent treatment notes and the fastest next actions for your portal.</p>
            </div>
            <Link to="/dashboard/clinical-notes" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Open notes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/dashboard/clinical-notes" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-primary/20 hover:bg-white">
                <ClipboardList className="h-5 w-5 text-primary" />
                <div className="mt-4 text-lg font-semibold text-slate-950">{recentNotes.length}</div>
                <div className="mt-1 text-sm text-slate-600">Notes authored</div>
              </Link>
              <Link to="/dashboard/messages" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-primary/20 hover:bg-white">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div className="mt-4 text-lg font-semibold text-slate-950">Care team</div>
                <div className="mt-1 text-sm text-slate-600">Coordinate updates and handoffs</div>
              </Link>
            </div>

            {recentNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                No physiotherapy notes recorded yet.
              </div>
            ) : (
              recentNotes.slice(0, 4).map((note) => (
                <div key={note.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{note.patientId}</div>
                      <div className="mt-1 text-sm text-slate-600">{note.type}</div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                      {note.status}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">{note.date} at {note.time}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PhysiotherapistDashboard;
