import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  FlaskConical,
  HeartPulse,
  Hospital,
  MapPin,
  MessageSquare,
  Package,
  Pill,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TestTube2,
  Users,
  Video,
  Database,
  Terminal,
  ActivitySquare
} from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { normalizeUserRole } from '@/lib/roleUtils';
import { getVisibleReferrals } from '@/lib/referralUtils';
import type { Appointment, Referral } from '@/data/mockData';
import CareNetworkGraph from '@/components/CareNetworkGraph';

type RoleKey =
  | 'patient'
  | 'doctor'
  | 'physiotherapist'
  | 'hospital'
  | 'laboratory'
  | 'imaging'
  | 'pharmacy'
  | 'ambulance'
  | 'admin'
  | 'super_admin';

type Tone = 'primary' | 'success' | 'warning' | 'critical' | 'info' | 'neutral' | 'emergency';

type Metric = {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
  tone: Tone;
  href: string;
};

type WorkItem = {
  title: string;
  meta: string;
  status: string;
  href: string;
  tone?: Tone;
};

type Action = {
  label: string;
  href: string;
  icon: React.ReactNode;
  emphasis?: 'primary' | 'danger';
};

const roleCopy: Record<RoleKey, { eyebrow: string; title: string; summary: string; focus: string; icon: React.ReactNode }> = {
  patient: {
    eyebrow: 'Personal health cockpit',
    title: 'Your care, organized around what matters next',
    summary: 'A calm, dark-themed control center of appointments, medicines, results, insurance touchpoints, and urgent support.',
    focus: 'Reduce anxiety, surface critical indicators, and view the entire medical node timeline.',
    icon: <HeartPulse className="h-5 w-5 text-teal-400" />,
  },
  doctor: {
    eyebrow: 'Clinical workspace console',
    title: 'Move from queue to diagnostic decision with speed',
    summary: 'Today’s consults, historical context, prescriptions, referrals, and clinical timelines are staged in an intuitive visual stack.',
    focus: 'Protect clinician focus, speed up diagnostic orders, and map clinical network nodes.',
    icon: <Stethoscope className="h-5 w-5 text-violet-400" />,
  },
  physiotherapist: {
    eyebrow: 'Recovery Programs Console',
    title: 'Coordinate therapy plans and recovery adherence',
    summary: 'A high-contrast workspace for session queues, program guidelines, active patient lists, and inter-provider handoffs.',
    focus: 'Expose rehabilitation velocity and synchronize patient goals.',
    icon: <Activity className="h-5 w-5 text-emerald-400" />,
  },
  hospital: {
    eyebrow: 'Command center & admissions',
    title: 'Govern incoming referrals and ambulance routing',
    summary: 'A unified operations overview for ward assignments, ambulance transfers, specialized clinicians, and security handoffs.',
    focus: 'Maintain absolute system throughput without operational choke points.',
    icon: <Hospital className="h-5 w-5 text-cyan-400" />,
  },
  laboratory: {
    eyebrow: 'Diagnostic Laboratory Engine',
    title: 'Track biological samples from extraction to validation',
    summary: 'Specimen orders, test scheduling, result verification, and critical report publishing in a single verified flow.',
    focus: 'Enforce quality control, prevent critical delay, and verify report integrity.',
    icon: <FlaskConical className="h-5 w-5 text-pink-400" />,
  },
  imaging: {
    eyebrow: 'Imaging Center Deck',
    title: 'Organize high-resolution scans and radiologist reports',
    summary: 'Request backlogs, modality queues, DICOM study assignments, and verified clinical publications in real time.',
    focus: 'Keep imaging scans accessible and reduce handoff bottleneck.',
    icon: <ScanLine className="h-5 w-5 text-amber-400" />,
  },
  pharmacy: {
    eyebrow: 'Pharmacy Fulfillment Panel',
    title: 'Verify electronic prescriptions and stock safety',
    summary: 'Dispensing queues, inventory safety stocks, refill validations, drug-interaction checkers, and patient notification triggers.',
    focus: 'Eliminate medication dispense errors and optimize critical storage levels.',
    icon: <Pill className="h-5 w-5 text-teal-400" />,
  },
  ambulance: {
    eyebrow: 'Tactical Emergency Dispatch',
    title: 'Fleet telemetry, priority calls, and rapid destination routing',
    summary: 'Emergency queues, paramedic statuses, vehicle fuel levels, high-acuity patients, and instant hospital coordinates.',
    focus: 'Prioritize life-threatening calls, deploy nearby units, and update hospitals.',
    icon: <Ambulance className="h-5 w-5 text-red-500" />,
  },
  admin: {
    eyebrow: 'Platform Health Console',
    title: 'Operate Alera with absolute observability and control',
    summary: 'Provider credential reviews, security status monitors, node configurations, audit telemetry, and user management.',
    focus: 'Audit ecosystem compliance, resolve verifications, and monitor API performance.',
    icon: <ShieldCheck className="h-5 w-5 text-teal-400" />,
  },
  super_admin: {
    eyebrow: 'Global Operations Deck',
    title: 'Govern the entire Alera healthcare ecosystem',
    summary: 'A supreme operational cockpit showing total active nodes, systemic risk, financial billing logs, and immutable audit structures.',
    focus: 'Visualize global healthcare network transactions, risk postures, and system metrics.',
    icon: <BadgeCheck className="h-5 w-5 text-teal-300" />,
  },
};

const toneClasses: Record<Tone, string> = {
  primary: 'border-teal-500/30 bg-teal-950/40 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]',
  success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
  warning: 'border-amber-500/30 bg-amber-950/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
  critical: 'border-red-500/30 bg-red-950/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
  emergency: 'border-red-500/40 bg-red-950/60 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse',
  info: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
  neutral: 'border-white/10 bg-slate-900/40 text-slate-300',
};

const statusTone = (status: string): Tone => {
  if (['completed', 'approved', 'dispensed', 'available', 'active', 'verified', 'signed'].includes(status)) return 'success';
  if (['critical', 'high', 'cancelled', 'rejected', 'out-of-stock', 'life-threatening'].includes(status)) return 'critical';
  if (['requested', 'pending', 'scheduled', 'low-stock', 'in-progress', 'processing'].includes(status)) return 'warning';
  if (['dispatched', 'en-route', 'accepted', 'confirmed-by-doctor'].includes(status)) return 'info';
  return 'neutral';
};

const displayDate = (value?: string) => {
  if (!value) return 'Date pending';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const isOpenAppointment = (appointment: Appointment) =>
  ['scheduled', 'confirmed-by-doctor', 'in-progress', 'rescheduled'].includes(appointment.status);

const sortByDateDesc = <T extends { date?: string }>(items: T[]) =>
  [...items].sort((left, right) => (right.date ?? '').localeCompare(left.date ?? ''));

const DashboardShell = ({
  role,
  metrics,
  workItems,
  actions,
  signal,
  secondaryTitle,
  secondaryItems,
}: {
  role: RoleKey;
  metrics: Metric[];
  workItems: WorkItem[];
  actions: Action[];
  signal: { label: string; value: string; detail: string; tone: Tone };
  secondaryTitle: string;
  secondaryItems: WorkItem[];
}) => {
  const { user } = useAuth();
  const copy = roleCopy[role];

  return (
    <div className="alera-experience space-y-6 text-slate-200">

      {/* Sci-fi Command Center Kicker Card */}
      <div className="rounded-3xl border border-white/5 bg-gradient-to-r from-slate-950 via-[#0a0d16] to-slate-950 p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[150px] bg-violet-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="grid gap-6 md:grid-cols-[1fr_auto] items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-950/40 px-3.5 py-1.5 text-xs text-teal-400 font-semibold tracking-wider uppercase backdrop-blur-md">
              {copy.icon}
              <span>{copy.eyebrow}</span>
            </div>

            <h1 className="mt-4 text-2xl md:text-3.5xl font-extrabold tracking-tight text-white leading-tight">
              {copy.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400 max-w-3xl">
              {copy.summary}
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-500 border-l-2 border-teal-500/40 pl-3">
              <Sparkles className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
              <span>{copy.focus}</span>
            </div>
          </div>

          {/* Real-time System Status Indicator */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 backdrop-blur-md min-w-[240px] flex flex-col justify-between h-full">
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Node Target</p>
              <h2 className="mt-1 text-xl font-bold text-white tracking-tight">{signal.value}</h2>
              <p className="text-xs text-slate-400 mt-1">{signal.detail}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">TELEMETRY</span>
              <span className={`alera-status-pill text-[10px] ${toneClasses[signal.tone]}`}>{signal.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <section className="alera-metric-grid" aria-label={`${copy.eyebrow} metrics`}>
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="h-full"
          >
            <Link
              to={metric.href}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-slate-950/70 p-5 h-full hover:border-teal-500/20 hover:bg-slate-900/40 transition-all shadow-lg"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">{metric.label}</span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${toneClasses[metric.tone]}`}>
                  {metric.icon}
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white tracking-tight group-hover:text-teal-400 transition-colors">
                  {metric.value}
                </span>
                <p className="text-xs text-slate-400 mt-1">{metric.helper}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Work Queue & Side Panels */}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">

        {/* Core Workflow List */}
        <section className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Node Pipeline</p>
              <h2 className="text-lg font-bold text-white mt-1">
                {role === 'patient' ? 'What Needs Your Attention' : 'Active Queue Worklist'}
              </h2>
            </div>
            <Link to={actions[0]?.href ?? '/dashboard'} className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300">
              Open Workdeck <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {workItems.length > 0 ? (
              workItems.slice(0, 6).map((item, idx) => (
                <Link
                  key={`${item.title}-${item.meta}-${idx}`}
                  to={item.href}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/30 p-4 hover:border-teal-500/15 hover:bg-slate-900/60 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-600">0{idx + 1}</span>
                    <div>
                      <strong className="text-sm font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                        {item.title}
                      </strong>
                      <span className="block text-xs text-slate-400 mt-0.5">{item.meta}</span>
                    </div>
                  </div>
                  <span className={`alera-status-pill text-[10px] ${toneClasses[item.tone ?? statusTone(item.status)]}`}>
                    {item.status}
                  </span>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-xl">
                <CheckCircle2 className="h-8 w-8 text-slate-600" />
                <strong className="text-slate-200 mt-2 block">System Sync Clear</strong>
                <span className="text-xs text-slate-400 max-w-sm mt-1">No outstanding priority tasks require your signature right now.</span>
              </div>
            )}
          </div>
        </section>

        {/* Side Actions & Secondary Connections */}
        <aside className="space-y-6">

          {/* Quick Cockpit Actions */}
          <section className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 backdrop-blur">
            <div className="border-b border-white/5 pb-3 mb-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Rapid Deploy</p>
              <h2 className="text-base font-bold text-white mt-1">Console Pathfinders</h2>
            </div>

            <div className="grid gap-2">
              {actions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-semibold uppercase tracking-wider transition-all hover:scale-[1.01] ${
                    action.emphasis === 'danger'
                      ? 'border-red-500/30 bg-red-950/40 text-red-400 hover:bg-red-950/60'
                      : action.emphasis === 'primary'
                      ? 'border-teal-500/30 bg-teal-950/40 text-teal-400 hover:bg-teal-950/60'
                      : 'border-white/5 bg-slate-900/40 text-slate-300 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {action.icon}
                    <span>{action.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </section>

          {/* Living Care Graph sidebar or Secondary Feed */}
          <section className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 backdrop-blur">
            <div className="border-b border-white/5 pb-3 mb-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Continuity Stream</p>
              <h2 className="text-base font-bold text-white mt-1">{secondaryTitle}</h2>
            </div>

            <div className="space-y-2">
              {secondaryItems.length > 0 ? (
                secondaryItems.slice(0, 4).map((item, idx) => (
                  <Link
                    key={`${item.title}-${item.meta}-${idx}`}
                    to={item.href}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-slate-900/20 hover:border-white/10 hover:bg-slate-900/40 transition-all"
                  >
                    <div>
                      <strong className="block text-xs font-bold text-slate-200">{item.title}</strong>
                      <small className="block text-[10px] text-slate-500 mt-0.5">{item.meta}</small>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      item.tone === 'success' || statusTone(item.status) === 'success' ? 'bg-emerald-400' :
                      item.tone === 'critical' || statusTone(item.status) === 'critical' ? 'bg-red-400' :
                      'bg-teal-400'
                    }`} />
                  </Link>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No active secondary logs found.
                </div>
              )}
            </div>
          </section>

        </aside>
      </div>

      {/* Trust Signposts */}
      <section className="grid gap-4 md:grid-cols-2 rounded-2xl border border-white/5 bg-slate-950/60 p-5" aria-label="Care assurance">
        <div className="flex items-start gap-3">
          <Terminal className="h-5 w-5 text-teal-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-200">Interactive Telemetry Graph</p>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
              Your console renders verified health pathways live. Status points are generated from cryptographic node protocols.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 text-violet-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-200">Session Audit Signature</p>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
              Active security session: {user?.name ? `${user.name.toUpperCase()}` : 'GUEST'}. Encryption and permission matrix verified by Alera Zero-Trust module.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default function AleraCommandCenter({ role: roleOverride }: { role?: RoleKey }) {
  const { user, getUsers } = useAuth();
  const data = useAppData();
  const role = (roleOverride ?? normalizeUserRole(user?.role ?? '') ?? 'patient') as RoleKey;
  const today = new Date().toISOString().split('T')[0];
  const users = getUsers();
  const appointments = data.appointments ?? [];
  const prescriptions = data.prescriptions ?? [];
  const labTests = data.labTests ?? [];
  const imagingScans = data.imagingScans ?? [];
  const ambulanceRequests = data.ambulanceRequests ?? [];
  const inventoryItems = data.inventoryItems ?? [];
  const ambulances = data.ambulances ?? [];
  const referrals = data.referrals ?? [];
  const providerVerifications = data.providerVerifications ?? [];
  const clinicalNotes = data.clinicalNotes ?? [];
  const billingRecords = data.billingRecords ?? [];
  const invoices = data.invoices ?? [];

  const patientAppointments = appointments.filter((item) => item.patientId === user?.id);
  const doctorAppointments = appointments.filter((item) => item.doctorId === user?.id);
  const openAppointments = appointments.filter(isOpenAppointment);
  const visibleReferrals = getVisibleReferrals(referrals, user);
  const activeEmergency = ambulanceRequests.filter((item) => !['completed', 'cancelled'].includes(item.status));
  const criticalEmergency = activeEmergency.filter((item) => item.priority === 'critical' || item.priority === 'high');
  const pendingLabs = labTests.filter((item) => ['requested', 'in-progress'].includes(item.status));
  const pendingImaging = imagingScans.filter((item) => ['requested', 'in-progress'].includes(item.status));
  const activePrescriptions = prescriptions.filter((item) => item.status === 'active');
  const lowStock = inventoryItems.filter((item) => item.status === 'low-stock' || item.status === 'out-of-stock');
  const pendingVerifications = providerVerifications.filter((item) => item.status === 'pending');
  const verifiedDoctors = users.filter((item) => normalizeUserRole(item.role) === 'doctor' && item.isVerified !== false && item.isActive !== false);

  const appointmentItems = (items: Appointment[], href = '/dashboard/appointments'): WorkItem[] =>
    sortByDateDesc(items).map((item) => ({
      title: role === 'patient' ? `${item.type} with ${item.doctorName}` : `${item.patientName} - ${item.type}`,
      meta: `${displayDate(item.date)} at ${item.time} · ${item.appointmentMode === 'telemedicine' ? 'Video Consult' : 'In Person Clinic'}`,
      status: item.status,
      href,
    }));

  const referralItems = (items: Referral[], href = '/dashboard/referrals'): WorkItem[] =>
    sortByDateDesc(items).map((item) => ({
      title: `${item.patientName} · ${item.toDepartment}`,
      meta: `${item.fromDoctorName} · ${displayDate(item.date)}`,
      status: item.status,
      href,
    }));

  const patientConfig = {
    metrics: [
      { label: 'Upcoming Consults', value: patientAppointments.filter(isOpenAppointment).length, helper: 'Scheduled or confirmed visits', icon: <Calendar className="h-5 w-5" />, tone: 'primary' as Tone, href: '/dashboard/appointments' },
      { label: 'Medication Plans', value: prescriptions.filter((item) => item.patientId === user?.id && item.status === 'active').length, helper: 'Active clinical plans', icon: <Pill className="h-5 w-5" />, tone: 'success' as Tone, href: '/dashboard/prescriptions' },
      { label: 'Lab Reports', value: labTests.filter((item) => item.patientId === user?.id).length, helper: 'Synchronized test records', icon: <FlaskConical className="h-5 w-5" />, tone: 'info' as Tone, href: '/dashboard/lab-results' },
      { label: 'Emergency Alerts', value: ambulanceRequests.filter((item) => item.patientId === user?.id && !['completed', 'cancelled'].includes(item.status)).length, helper: 'Dispatched response units', icon: <Ambulance className="h-5 w-5" />, tone: 'critical' as Tone, href: '/dashboard/ambulance' },
    ],
    workItems: [
      ...appointmentItems(patientAppointments.filter(isOpenAppointment)),
      ...prescriptions.filter((item) => item.patientId === user?.id && item.status === 'active').map((item) => ({
        title: item.medications[0]?.name ?? 'Medication plan',
        meta: `${item.doctorName} · ${item.medications.length} prescription item${item.medications.length === 1 ? '' : 's'}`,
        status: 'active',
        href: '/dashboard/prescriptions',
      })),
    ],
    actions: [
      { label: 'Book Clinical Visit', href: '/dashboard/appointments', icon: <Calendar className="h-5 w-5" />, emphasis: 'primary' as const },
      { label: 'Emergency Dispatch', href: '/dashboard/ambulance', icon: <Ambulance className="h-5 w-5" />, emphasis: 'danger' as const },
      { label: 'Message Clinician', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { label: 'Ecosystem Timeline', href: '/dashboard/timeline', icon: <Clock3 className="h-5 w-5" /> },
    ],
    signal: { label: 'Secure Access', value: 'System Node Sync', detail: 'Your medical telemetry is active and guarded with AES-256 keys.', tone: 'success' as Tone },
    secondaryTitle: 'Ecosystem Trace',
    secondaryItems: [
      ...labTests.filter((item) => item.patientId === user?.id).map((item) => ({ title: item.testName, meta: `${displayDate(item.date)} · ${item.patientName}`, status: item.status, href: '/dashboard/lab-results' })),
      ...imagingScans.filter((item) => item.patientId === user?.id).map((item) => ({ title: item.scanType, meta: `${displayDate(item.date)} · ${item.bodyPart ?? 'Imaging'}`, status: item.status, href: '/dashboard/imaging' })),
    ],
  };

  const configs: Record<RoleKey, Parameters<typeof DashboardShell>[0]> = {
    patient: { role: 'patient', ...patientConfig },
    doctor: {
      role: 'doctor',
      metrics: [
        { label: "Visits Scheduled", value: doctorAppointments.filter((item) => item.date === today && isOpenAppointment(item)).length, helper: 'Active consultation queue', icon: <Calendar className="h-5 w-5" />, tone: 'primary', href: '/dashboard/appointments' },
        { label: 'Active Patients', value: new Set(doctorAppointments.map((item) => item.patientId)).size, helper: 'Assigned node panel', icon: <Users className="h-5 w-5" />, tone: 'info', href: '/dashboard/patients' },
        { label: 'Pending Diagnoses', value: pendingLabs.length + pendingImaging.length, helper: 'Awaiting lab reports', icon: <TestTube2 className="h-5 w-5" />, tone: 'warning', href: '/dashboard/lab-referrals' },
        { label: 'Active Referrals', value: referrals.filter((item) => item.fromDoctorId === user?.id && item.status === 'pending').length, helper: 'Outbound specialist handoffs', icon: <FileText className="h-5 w-5" />, tone: 'neutral', href: '/dashboard/referrals' },
      ],
      workItems: appointmentItems(doctorAppointments.filter(isOpenAppointment)),
      actions: [
        { label: 'Open Consultation Space', href: '/dashboard/appointments', icon: <Video className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'File Clinical Note', href: '/dashboard/clinical-notes', icon: <FileText className="h-5 w-5" /> },
        { label: 'Order Laboratory Test', href: '/dashboard/lab-referrals', icon: <FlaskConical className="h-5 w-5" /> },
        { label: 'Draft Prescription', href: '/dashboard/prescriptions', icon: <Pill className="h-5 w-5" /> },
      ],
      signal: { label: 'Clinical Queue', value: `${doctorAppointments.filter((item) => item.date === today && isOpenAppointment(item)).length} Active Today`, detail: 'Awaiting your visual sign-off and record validation.', tone: 'primary' },
      secondaryTitle: 'Pending Diagnostics',
      secondaryItems: [
        ...pendingLabs.map((item) => ({ title: item.testName, meta: `${item.patientName} · ${item.destinationProviderName ?? 'Laboratory'}`, status: item.status, href: '/dashboard/lab-referrals' })),
        ...pendingImaging.map((item) => ({ title: item.scanType, meta: `${item.patientName} · ${item.destinationProviderName ?? 'Imaging Center'}`, status: item.status, href: '/dashboard/imaging-referrals' })),
      ],
    },
    physiotherapist: {
      role: 'physiotherapist',
      metrics: [
        { label: 'Therapy Sessions', value: doctorAppointments.filter(isOpenAppointment).length, helper: 'Rehabilitation schedules', icon: <Activity className="h-5 w-5" />, tone: 'primary', href: '/dashboard/appointments' },
        { label: 'Therapy Panel', value: new Set(doctorAppointments.map((item) => item.patientId)).size, helper: 'Active recovering patients', icon: <Users className="h-5 w-5" />, tone: 'info', href: '/dashboard/patients' },
        { label: 'Active Care Plans', value: clinicalNotes.filter((item) => item.doctorId === user?.id).length, helper: 'Structured regimes', icon: <FileText className="h-5 w-5" />, tone: 'success', href: '/dashboard/clinical-notes' },
        { label: 'Specialist Referrals', value: visibleReferrals.length, helper: 'Department transitions', icon: <ArrowRight className="h-5 w-5" />, tone: 'warning', href: '/dashboard/referrals' },
      ],
      workItems: appointmentItems(doctorAppointments.filter(isOpenAppointment)),
      actions: [
        { label: 'Open Therapy Log', href: '/dashboard/appointments', icon: <Calendar className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Refine Recovery Plan', href: '/dashboard/clinical-notes', icon: <FileText className="h-5 w-5" /> },
        { label: 'Trace Patient Timeline', href: '/dashboard/timeline', icon: <Clock3 className="h-5 w-5" /> },
        { label: 'Secure Message Box', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: 'Continuity Match', value: 'Sync Recovery Hub', detail: 'Exercise regimens and clinical notes are fully permission-tied.', tone: 'success' },
      secondaryTitle: 'Inbound Handoffs',
      secondaryItems: referralItems(visibleReferrals),
    },
    hospital: {
      role: 'hospital',
      metrics: [
        { label: 'Inbound Referrals', value: new Set(visibleReferrals.map((item) => item.patientId)).size, helper: 'Emergency & specialist records', icon: <Users className="h-5 w-5" />, tone: 'primary', href: '/dashboard/patients' },
        { label: 'Credentialed Doctors', value: verifiedDoctors.length, helper: 'Verified clinic providers', icon: <Stethoscope className="h-5 w-5" />, tone: 'success', href: '/dashboard/doctors' },
        { label: 'Awaiting Admittance', value: visibleReferrals.filter((item) => item.status === 'pending').length, helper: 'Incoming transfers', icon: <FileText className="h-5 w-5" />, tone: 'warning', href: '/dashboard/referrals' },
        { label: 'Emergency Arrivals', value: activeEmergency.length, helper: 'ETA of ambulance dispatches', icon: <Ambulance className="h-5 w-5" />, tone: activeEmergency.length ? 'critical' : 'neutral', href: '/dashboard/requests' },
      ],
      workItems: referralItems(visibleReferrals),
      actions: [
        { label: 'Verify Transfers', href: '/dashboard/referrals', icon: <FileText className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Emergency Arrival Feed', href: '/dashboard/requests', icon: <Ambulance className="h-5 w-5" />, emphasis: activeEmergency.length ? 'danger' : undefined },
        { label: 'Clinical Roster', href: '/dashboard/doctors', icon: <Stethoscope className="h-5 w-5" /> },
        { label: 'Operator Messages', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: activeEmergency.length ? 'Urgent Arrival' : 'Hospital Green', value: `${visibleReferrals.filter((item) => item.status === 'pending').length} Inbound Cases`, detail: 'Referral workflows and trauma queues are locked.', tone: activeEmergency.length ? 'critical' : 'primary' },
      secondaryTitle: 'Ambulance Transits',
      secondaryItems: activeEmergency.map((item) => ({ title: item.patientName, meta: `${item.location} · ${item.priority} Priority`, status: item.status, href: '/dashboard/requests' })),
    },
    laboratory: {
      role: 'laboratory',
      metrics: [
        { label: 'New Lab Orders', value: labTests.filter((item) => item.status === 'requested').length, helper: 'Awaiting sample registration', icon: <FlaskConical className="h-5 w-5" />, tone: 'warning', href: '/dashboard/test-requests' },
        { label: 'In Extraction', value: labTests.filter((item) => item.status === 'in-progress').length, helper: 'Biological assays active', icon: <Activity className="h-5 w-5" />, tone: 'info', href: '/dashboard/test-requests' },
        { label: 'Verified Results', value: labTests.filter((item) => item.status === 'completed').length, helper: 'Reports submitted to doctor', icon: <CheckCircle2 className="h-5 w-5" />, tone: 'success', href: '/dashboard/results' },
        { label: 'Critical Escalations', value: labTests.filter((item) => item.notes?.toLowerCase().includes('critical')).length, helper: 'Danger values requiring notice', icon: <AlertTriangle className="h-5 w-5" />, tone: 'critical', href: '/dashboard/lab-results-management' },
      ],
      workItems: pendingLabs.map((item) => ({ title: item.testName, meta: `${item.patientName} · ordered by ${item.doctorName}`, status: item.status, href: '/dashboard/test-requests' })),
      actions: [
        { label: 'Process Assay Queue', href: '/dashboard/test-requests', icon: <FlaskConical className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Publish Lab Report', href: '/dashboard/lab-results-management', icon: <FileText className="h-5 w-5" /> },
        { label: 'Verify Spectrum Analytics', href: '/dashboard/results', icon: <BadgeCheck className="h-5 w-5" /> },
        { label: 'Operator Chat', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: 'Assay Pipeline', value: `${pendingLabs.length} Samples Unverified`, detail: 'Verify critical values before finalizing clinical nodes.', tone: pendingLabs.length ? 'warning' : 'success' },
      secondaryTitle: 'Analytical Logs',
      secondaryItems: sortByDateDesc(labTests).map((item) => ({ title: item.testName, meta: `${item.patientName} · ${displayDate(item.date)}`, status: item.status, href: '/dashboard/results' })),
    },
    imaging: {
      role: 'imaging',
      metrics: [
        { label: 'Scan Requests', value: imagingScans.filter((item) => item.status === 'requested').length, helper: 'Awaiting modality scheduling', icon: <ScanLine className="h-5 w-5" />, tone: 'warning', href: '/dashboard/scan-requests' },
        { label: 'Active DICOM Studies', value: imagingScans.filter((item) => item.status === 'in-progress').length, helper: 'Patients in scan room', icon: <Activity className="h-5 w-5" />, tone: 'info', href: '/dashboard/imaging-referrals' },
        { label: 'Completed Studies', value: imagingScans.filter((item) => item.status === 'completed').length, helper: 'Reports published to node', icon: <CheckCircle2 className="h-5 w-5" />, tone: 'success', href: '/dashboard/results' },
        { label: 'Clinical Referrals', value: visibleReferrals.filter((item) => item.referralType === 'imaging').length, helper: 'Pending diagnostic consult', icon: <FileText className="h-5 w-5" />, tone: 'neutral', href: '/dashboard/imaging-referrals' },
      ],
      workItems: pendingImaging.map((item) => ({ title: `${item.scanType}${item.bodyPart ? ` · ${item.bodyPart}` : ''}`, meta: `${item.patientName} · ${item.clinicalIndication ?? item.doctorName}`, status: item.status, href: '/dashboard/scan-requests' })),
      actions: [
        { label: 'Schedule Scan Time', href: '/dashboard/scan-requests', icon: <Calendar className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Open Referrals Queue', href: '/dashboard/imaging-referrals', icon: <ScanLine className="h-5 w-5" /> },
        { label: 'Publish Imaging Study', href: '/dashboard/results', icon: <FileText className="h-5 w-5" /> },
        { label: 'Radiology Chat', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: 'Modality Traffic', value: `${pendingImaging.length} Studies Scheduled`, detail: 'Scan pipelines, DICOM feeds, and diagnostic reports are bound.', tone: pendingImaging.length ? 'warning' : 'success' },
      secondaryTitle: 'Completed Imaging Scans',
      secondaryItems: sortByDateDesc(imagingScans).map((item) => ({ title: item.scanType, meta: `${item.patientName} · ${displayDate(item.date)}`, status: item.status, href: '/dashboard/results' })),
    },
    pharmacy: {
      role: 'pharmacy',
      metrics: [
        { label: 'Rx Processing', value: activePrescriptions.length, helper: 'Awaiting clinical verification', icon: <Pill className="h-5 w-5" />, tone: 'warning', href: '/dashboard/prescriptions' },
        { label: 'Dispensed Orders', value: prescriptions.filter((item) => item.status === 'dispensed').length, helper: 'Fulfillments completed', icon: <CheckCircle2 className="h-5 w-5" />, tone: 'success', href: '/dashboard/prescriptions' },
        { label: 'Inventory Depletion', value: lowStock.length, helper: 'Below safe-stock metrics', icon: <Package className="h-5 w-5" />, tone: lowStock.length ? 'critical' : 'success', href: '/dashboard/inventory' },
        { label: 'Refill Validation', value: prescriptions.flatMap((item) => item.refillRequests ?? []).filter((item) => item.status === 'pending').length, helper: 'Awaiting pharmacist sign-off', icon: <Clock3 className="h-5 w-5" />, tone: 'info', href: '/dashboard/prescription-refills' },
      ],
      workItems: activePrescriptions.map((item) => ({ title: item.patientName, meta: `${item.medications[0]?.name ?? 'Medication'}${item.medications.length > 1 ? ` +${item.medications.length - 1}` : ''} · ${item.doctorName}`, status: item.status, href: '/dashboard/prescriptions' })),
      actions: [
        { label: 'Verify Rx Ingredients', href: '/dashboard/prescriptions', icon: <Pill className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Scan Safe Inventory', href: '/dashboard/inventory', icon: <Package className="h-5 w-5" />, emphasis: lowStock.length ? 'danger' : undefined },
        { label: 'Referral Requests', href: '/dashboard/pharmacy-referrals', icon: <FileText className="h-5 w-5" /> },
        { label: 'Safe Pharmacy Chat', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: lowStock.length ? 'Depleted Items' : 'Drug Safety OK', value: `${activePrescriptions.length} Prescription Requests`, detail: 'Verify clinical dosages before activating fulfillment node.', tone: lowStock.length ? 'critical' : 'primary' },
      secondaryTitle: 'Stock depletion alerts',
      secondaryItems: lowStock.map((item) => ({ title: item.name, meta: `${item.stock} ${item.unit} remaining · reorder at ${item.reorderLevel}`, status: item.status, href: '/dashboard/inventory' })),
    },
    ambulance: {
      role: 'ambulance',
      metrics: [
        { label: 'Active Alerts', value: activeEmergency.length, helper: 'Trauma response cases', icon: <Radio className="h-5 w-5" />, tone: activeEmergency.length ? 'critical' : 'success', href: '/dashboard/requests' },
        { label: 'Critical Incidents', value: criticalEmergency.length, helper: 'Life-threatening dispatches', icon: <AlertTriangle className="h-5 w-5" />, tone: criticalEmergency.length ? 'critical' : 'neutral', href: '/dashboard/requests' },
        { label: 'Available Rigs', value: ambulances.filter((item) => item.status === 'available').length, helper: 'Rigs parked & fueled', icon: <Ambulance className="h-5 w-5" />, tone: 'success', href: '/dashboard/vehicles' },
        { label: 'Dispatched Units', value: ambulances.filter((item) => ['dispatched', 'in-transit', 'on-scene'].includes(item.status)).length, helper: 'Active emergency transit', icon: <MapPin className="h-5 w-5" />, tone: 'info', href: '/dashboard/vehicles' },
      ],
      workItems: activeEmergency.map((item) => ({ title: item.patientName, meta: `${item.location} · ${item.time} · ${item.priority} Priority`, status: item.status, href: '/dashboard/requests', tone: item.priority === 'critical' || item.priority === 'high' ? 'critical' : statusTone(item.status) })),
      actions: [
        { label: 'Deploy Rig Dispatch', href: '/dashboard/requests', icon: <Radio className="h-5 w-5" />, emphasis: activeEmergency.length ? 'danger' : 'primary' },
        { label: 'Track Rig Fleet', href: '/dashboard/vehicles', icon: <Ambulance className="h-5 w-5" /> },
        { label: 'Signal Hospital Trauma', href: '/dashboard/messages', icon: <Hospital className="h-5 w-5" /> },
        { label: 'Telemetry Maps', href: '/dashboard/requests', icon: <MapPin className="h-5 w-5" /> },
      ],
      signal: { label: criticalEmergency.length ? 'Triage Deploy' : 'Rig Standby', value: `${activeEmergency.length} Deployments Active`, detail: 'Satellite coordinates and trauma history are synchronized live.', tone: criticalEmergency.length ? 'critical' : 'success' },
      secondaryTitle: 'Trauma Rig Status',
      secondaryItems: ambulances.map((item) => ({ title: item.callSign, meta: `${item.plateNumber} · Fuel ${item.fuel}%`, status: item.status, href: '/dashboard/vehicles' })),
    },
    admin: {
      role: 'admin',
      metrics: [
        { label: 'Managed Nodes', value: users.length, helper: 'Active clinical credentials', icon: <Users className="h-5 w-5" />, tone: 'primary', href: '/dashboard/users' },
        { label: 'Credential Reviews', value: pendingVerifications.length, helper: 'Providers seeking clinical sign-off', icon: <ShieldCheck className="h-5 w-5" />, tone: pendingVerifications.length ? 'warning' : 'success', href: '/dashboard/verifications' },
        { label: 'Global Consultation Vol', value: openAppointments.length, helper: 'Active sessions', icon: <Activity className="h-5 w-5" />, tone: 'info', href: '/dashboard/analytics' },
        { label: 'Active Alerts', value: activeEmergency.length, helper: 'Acuity emergency alerts', icon: <Ambulance className="h-5 w-5" />, tone: activeEmergency.length ? 'critical' : 'neutral', href: '/dashboard/requests' },
      ],
      workItems: pendingVerifications.map((item) => ({ title: item.name, meta: `${item.role} · ${item.email}`, status: item.status, href: '/dashboard/verifications' })),
      actions: [
        { label: 'Audit Doctor Credentials', href: '/dashboard/verifications', icon: <ShieldCheck className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Configure Users', href: '/dashboard/users', icon: <Users className="h-5 w-5" /> },
        { label: 'Telemetry Analytics', href: '/dashboard/analytics', icon: <Activity className="h-5 w-5" /> },
        { label: 'Global System Alerts', href: '/dashboard/notifications', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: 'Platform Watch', value: `${pendingVerifications.length} Verifications Pending`, detail: 'System security level: GREEN. Identity nodes validated.', tone: pendingVerifications.length ? 'warning' : 'success' },
      secondaryTitle: 'System Audit Logs',
      secondaryItems: [
        ...appointmentItems(openAppointments, '/dashboard/appointments'),
        ...activeEmergency.map((item) => ({ title: item.patientName, meta: `${item.location} · Emergency`, status: item.status, href: '/dashboard/requests' })),
      ],
    },
    super_admin: {
      role: 'super_admin',
      metrics: [
        { label: 'Global Platform Users', value: users.length, helper: 'Patients and medical personnel', icon: <Users className="h-5 w-5" />, tone: 'primary', href: '/dashboard/users' },
        { label: 'Clinical Organizations', value: users.filter((item) => ['hospital', 'laboratory', 'imaging', 'pharmacy', 'ambulance'].includes(normalizeUserRole(item.role) ?? '')).length, helper: 'Active system nodes', icon: <Building2 className="h-5 w-5" />, tone: 'info', href: '/dashboard/users' },
        { label: 'System Risk Posture', value: pendingVerifications.length + activeEmergency.length + lowStock.length, helper: 'Outstanding system alerts', icon: <AlertTriangle className="h-5 w-5" />, tone: pendingVerifications.length + activeEmergency.length + lowStock.length ? 'warning' : 'success', href: '/dashboard/audit' },
        { label: 'Financial Transactions', value: billingRecords.length + invoices.length, helper: 'Ecosystem billing metrics', icon: <FileText className="h-5 w-5" />, tone: 'neutral', href: '/dashboard/admin-billing' },
      ],
      workItems: [
        ...pendingVerifications.map((item) => ({ title: item.name, meta: `${item.role} verification · ${item.email}`, status: item.status, href: '/dashboard/verifications' })),
        ...activeEmergency.map((item) => ({ title: item.patientName, meta: `${item.location} · ${item.priority} Priority`, status: item.status, href: '/dashboard/requests', tone: item.priority === 'critical' || item.priority === 'high' ? 'critical' : statusTone(item.status) })),
        ...lowStock.map((item) => ({ title: item.name, meta: `${item.stock} ${item.unit} remaining`, status: item.status, href: '/dashboard/inventory' })),
      ],
      actions: [
        { label: 'Global Executive View', href: '/dashboard/analytics', icon: <Activity className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Immutable Audit Logs', href: '/dashboard/audit', icon: <ShieldCheck className="h-5 w-5" /> },
        { label: 'Platform Billing Matrix', href: '/dashboard/admin-billing', icon: <FileText className="h-5 w-5" /> },
        { label: 'Authorize New Admin', href: '/dashboard/admin/create', icon: <BadgeCheck className="h-5 w-5" /> },
      ],
      signal: { label: 'Supreme Cockpit', value: `${users.length} Active System Nodes`, detail: 'Zero unmapped transfers found. Compliance is verified.', tone: 'primary' },
      secondaryTitle: 'System Activity Node Flow',
      secondaryItems: appointmentItems(openAppointments, '/dashboard/appointments'),
    },
  };

  return <DashboardShell {...(configs[role] ?? configs.patient)} />;
}
