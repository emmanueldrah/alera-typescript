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
} from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { normalizeUserRole } from '@/lib/roleUtils';
import { getVisibleReferrals } from '@/lib/referralUtils';
import type { Appointment, Referral } from '@/data/mockData';

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
    summary: 'A calm view of appointments, medicines, results, insurance touchpoints, and urgent support so patients never have to hunt for the next step.',
    focus: 'Reduce anxiety, surface next actions, and keep the full care timeline understandable.',
    icon: <HeartPulse className="h-5 w-5" />,
  },
  doctor: {
    eyebrow: 'Clinical workflow',
    title: 'Move from queue to decision with fewer clicks',
    summary: 'Today’s visits, patient context, diagnostic orders, prescriptions, referrals, and clinical notes are staged for fast, defensible care.',
    focus: 'Protect attention, speed up documentation, and highlight clinical risk.',
    icon: <Stethoscope className="h-5 w-5" />,
  },
  physiotherapist: {
    eyebrow: 'Recovery programs',
    title: 'Coordinate therapy plans, progress, and follow-up',
    summary: 'A focused view for sessions, care plans, referred patients, adherence, and clinical messages across rehabilitation workflows.',
    focus: 'Make continuity of care visible between every visit.',
    icon: <Activity className="h-5 w-5" />,
  },
  hospital: {
    eyebrow: 'Hospital operations',
    title: 'Coordinate referrals, admissions, teams, and emergencies',
    summary: 'A command layer for incoming referrals, referred patients, verified doctors, ambulance coordination, and hospital communication.',
    focus: 'Keep departments aligned without overwhelming operational teams.',
    icon: <Hospital className="h-5 w-5" />,
  },
  laboratory: {
    eyebrow: 'Diagnostic laboratory',
    title: 'Track every sample from request to verified result',
    summary: 'Orders, sample status, result verification, critical values, uploads, and reporting are presented as a single accountable workflow.',
    focus: 'Prevent missed critical values and make turnaround visible.',
    icon: <FlaskConical className="h-5 w-5" />,
  },
  imaging: {
    eyebrow: 'Imaging center',
    title: 'Schedule scans, review studies, and publish reports',
    summary: 'Requests, modality queues, study status, uploaded reports, and completed imaging are organized for clinical handoff.',
    focus: 'Make imaging throughput legible and keep findings easy to act on.',
    icon: <ScanLine className="h-5 w-5" />,
  },
  pharmacy: {
    eyebrow: 'Pharmacy operations',
    title: 'Verify prescriptions and protect medication safety',
    summary: 'Prescription verification, inventory risk, refill requests, availability, interaction awareness, and delivery workflow live together.',
    focus: 'Reduce medication errors and keep stock risk visible.',
    icon: <Pill className="h-5 w-5" />,
  },
  ambulance: {
    eyebrow: 'Emergency dispatch',
    title: 'Live requests, fleet readiness, and response status',
    summary: 'Emergency requests, patient context, vehicle status, location, priority, and hospital destination are arranged for time-critical response.',
    focus: 'Prioritize the most urgent call and keep field teams oriented.',
    icon: <Ambulance className="h-5 w-5" />,
  },
  admin: {
    eyebrow: 'Platform administration',
    title: 'Operate Alera with trust, visibility, and control',
    summary: 'Users, provider verifications, analytics, notifications, security posture, and platform health are surfaced for responsible administration.',
    focus: 'Make governance and service quality observable.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  super_admin: {
    eyebrow: 'Executive control room',
    title: 'Govern the healthcare ecosystem end to end',
    summary: 'A complete operating picture for users, hospitals, clinicians, diagnostics, billing, audit logs, risk, and system performance.',
    focus: 'Expose scale, risk, revenue, and trust signals without visual noise.',
    icon: <BadgeCheck className="h-5 w-5" />,
  },
};

const toneClasses: Record<Tone, string> = {
  primary: 'border-primary/25 bg-primary/8 text-primary',
  success: 'border-success/25 bg-success/8 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  critical: 'border-destructive/25 bg-destructive/10 text-destructive',
  emergency: 'border-red-700/25 bg-red-700/10 text-red-800',
  info: 'border-info/25 bg-info/8 text-info',
  neutral: 'border-border bg-secondary text-foreground',
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
    <div className="alera-experience space-y-6">
      <section className="alera-hero">
        <div className="alera-hero__copy">
          <div className="alera-kicker">
            <span className="alera-kicker__icon">{copy.icon}</span>
            {copy.eyebrow}
          </div>
          <h1>{copy.title}</h1>
          <p>{copy.summary}</p>
          <div className="alera-focus">
            <Sparkles className="h-4 w-4" />
            <span>{copy.focus}</span>
          </div>
        </div>

        <div className="alera-care-card" aria-label="Current operational priority">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Now</p>
            <h2>{signal.value}</h2>
            <p>{signal.detail}</p>
          </div>
          <span className={`alera-status-pill ${toneClasses[signal.tone]}`}>{signal.label}</span>
        </div>
      </section>

      <section className="alera-metric-grid" aria-label={`${copy.eyebrow} metrics`}>
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035 }}
          >
            <Link to={metric.href} className="alera-metric">
              <span className={`alera-metric__icon ${toneClasses[metric.tone]}`}>{metric.icon}</span>
              <span className="alera-metric__value">{metric.value}</span>
              <span className="alera-metric__label">{metric.label}</span>
              <span className="alera-metric__helper">{metric.helper}</span>
            </Link>
          </motion.div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <section className="alera-panel">
          <div className="alera-panel__header">
            <div>
              <p>Priority workflow</p>
              <h2>{role === 'patient' ? 'What needs your attention' : 'Work queue'}</h2>
            </div>
            <Link to={actions[0]?.href ?? '/dashboard'} className="alera-link">
              Open workflow <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="alera-work-list">
            {workItems.length > 0 ? (
              workItems.slice(0, 6).map((item) => (
                <Link key={`${item.title}-${item.meta}`} to={item.href} className="alera-work-item">
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.meta}</small>
                  </span>
                  <span className={`alera-status-pill ${toneClasses[item.tone ?? statusTone(item.status)]}`}>{item.status}</span>
                </Link>
              ))
            ) : (
              <div className="alera-empty">
                <CheckCircle2 className="h-8 w-8" />
                <strong>Nothing urgent right now</strong>
                <span>New activity will appear here with its next best action.</span>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="alera-panel alera-actions-panel">
            <div className="alera-panel__header">
              <div>
                <p>Next actions</p>
                <h2>Fast paths</h2>
              </div>
            </div>
            <div className="alera-action-grid">
              {actions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className={`alera-action ${action.emphasis === 'danger' ? 'alera-action--danger' : action.emphasis === 'primary' ? 'alera-action--primary' : ''}`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </section>

          <section className="alera-panel">
            <div className="alera-panel__header">
              <div>
                <p>Continuity</p>
                <h2>{secondaryTitle}</h2>
              </div>
            </div>
            <div className="alera-compact-list">
              {secondaryItems.length > 0 ? (
                secondaryItems.slice(0, 4).map((item) => (
                  <Link key={`${item.title}-${item.meta}`} to={item.href}>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.meta}</small>
                    </span>
                    <span className={`alera-dot ${item.tone ?? statusTone(item.status)}`} />
                  </Link>
                ))
              ) : (
                <div className="alera-empty alera-empty--compact">
                  <span>No recent continuity items.</span>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

      <section className="alera-assurance" aria-label="Care assurance">
        <div>
          <ShieldCheck className="h-5 w-5" />
          <span>AAA-oriented contrast tokens, visible focus states, reduced-motion support, and touch-sized controls are built into this surface.</span>
        </div>
        <div>
          <MessageSquare className="h-5 w-5" />
          <span>{user?.name ? `${user.name}'s` : 'Your'} workspace keeps clinical communication, auditability, and next actions connected.</span>
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

  const patientAppointments = data.appointments.filter((item) => item.patientId === user?.id);
  const doctorAppointments = data.appointments.filter((item) => item.doctorId === user?.id);
  const openAppointments = data.appointments.filter(isOpenAppointment);
  const visibleReferrals = getVisibleReferrals(data.referrals, user);
  const activeEmergency = data.ambulanceRequests.filter((item) => !['completed', 'cancelled'].includes(item.status));
  const criticalEmergency = activeEmergency.filter((item) => item.priority === 'critical' || item.priority === 'high');
  const pendingLabs = data.labTests.filter((item) => ['requested', 'in-progress'].includes(item.status));
  const pendingImaging = data.imagingScans.filter((item) => ['requested', 'in-progress'].includes(item.status));
  const activePrescriptions = data.prescriptions.filter((item) => item.status === 'active');
  const lowStock = data.inventoryItems.filter((item) => item.status === 'low-stock' || item.status === 'out-of-stock');
  const pendingVerifications = data.providerVerifications.filter((item) => item.status === 'pending');
  const activePatients = new Set(data.appointments.map((item) => item.patientId).filter(Boolean)).size;
  const verifiedDoctors = users.filter((item) => normalizeUserRole(item.role) === 'doctor' && item.isVerified !== false && item.isActive !== false);

  const appointmentItems = (items: Appointment[], href = '/dashboard/appointments'): WorkItem[] =>
    sortByDateDesc(items).map((item) => ({
      title: role === 'patient' ? `${item.type} with ${item.doctorName}` : `${item.patientName} - ${item.type}`,
      meta: `${displayDate(item.date)} at ${item.time} · ${item.appointmentMode === 'telemedicine' ? 'Video visit' : 'In person'}`,
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
      { label: 'Upcoming visits', value: patientAppointments.filter(isOpenAppointment).length, helper: 'Scheduled or confirmed', icon: <Calendar className="h-5 w-5" />, tone: 'primary' as Tone, href: '/dashboard/appointments' },
      { label: 'Active medications', value: data.prescriptions.filter((item) => item.patientId === user?.id && item.status === 'active').length, helper: 'Current medication plan', icon: <Pill className="h-5 w-5" />, tone: 'success' as Tone, href: '/dashboard/prescriptions' },
      { label: 'Lab records', value: data.labTests.filter((item) => item.patientId === user?.id).length, helper: 'Results and requests', icon: <FlaskConical className="h-5 w-5" />, tone: 'info' as Tone, href: '/dashboard/lab-results' },
      { label: 'Emergency access', value: data.ambulanceRequests.filter((item) => item.patientId === user?.id && !['completed', 'cancelled'].includes(item.status)).length, helper: 'Active requests', icon: <Ambulance className="h-5 w-5" />, tone: 'critical' as Tone, href: '/dashboard/ambulance' },
    ],
    workItems: [
      ...appointmentItems(patientAppointments.filter(isOpenAppointment)),
      ...data.prescriptions.filter((item) => item.patientId === user?.id && item.status === 'active').map((item) => ({
        title: item.medications[0]?.name ?? 'Medication plan',
        meta: `${item.doctorName} · ${item.medications.length} medication${item.medications.length === 1 ? '' : 's'}`,
        status: 'active',
        href: '/dashboard/prescriptions',
      })),
    ],
    actions: [
      { label: 'Book appointment', href: '/dashboard/appointments', icon: <Calendar className="h-5 w-5" />, emphasis: 'primary' as const },
      { label: 'Request ambulance', href: '/dashboard/ambulance', icon: <Ambulance className="h-5 w-5" />, emphasis: 'danger' as const },
      { label: 'Message care team', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { label: 'Open timeline', href: '/dashboard/timeline', icon: <Clock3 className="h-5 w-5" /> },
    ],
    signal: { label: 'Care ready', value: 'Next step visible', detail: 'Appointments, medications, labs, imaging, and urgent help remain one action away.', tone: 'success' as Tone },
    secondaryTitle: 'Recent care events',
    secondaryItems: [
      ...data.labTests.filter((item) => item.patientId === user?.id).map((item) => ({ title: item.testName, meta: `${displayDate(item.date)} · ${item.patientName}`, status: item.status, href: '/dashboard/lab-results' })),
      ...data.imagingScans.filter((item) => item.patientId === user?.id).map((item) => ({ title: item.scanType, meta: `${displayDate(item.date)} · ${item.bodyPart ?? 'Imaging'}`, status: item.status, href: '/dashboard/imaging' })),
    ],
  };

  const configs: Record<RoleKey, Parameters<typeof DashboardShell>[0]> = {
    patient: { role: 'patient', ...patientConfig },
    doctor: {
      role: 'doctor',
      metrics: [
        { label: "Today's visits", value: doctorAppointments.filter((item) => item.date === today && isOpenAppointment(item)).length, helper: 'Ready for consult', icon: <Calendar className="h-5 w-5" />, tone: 'primary', href: '/dashboard/appointments' },
        { label: 'Patient panel', value: new Set(doctorAppointments.map((item) => item.patientId)).size, helper: 'Distinct patients', icon: <Users className="h-5 w-5" />, tone: 'info', href: '/dashboard/patients' },
        { label: 'Pending diagnostics', value: pendingLabs.length + pendingImaging.length, helper: 'Labs and imaging', icon: <TestTube2 className="h-5 w-5" />, tone: 'warning', href: '/dashboard/lab-referrals' },
        { label: 'Open referrals', value: data.referrals.filter((item) => item.fromDoctorId === user?.id && item.status === 'pending').length, helper: 'Awaiting acceptance', icon: <FileText className="h-5 w-5" />, tone: 'neutral', href: '/dashboard/referrals' },
      ],
      workItems: appointmentItems(doctorAppointments.filter(isOpenAppointment)),
      actions: [
        { label: 'Start consultation', href: '/dashboard/appointments', icon: <Video className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Write clinical note', href: '/dashboard/clinical-notes', icon: <FileText className="h-5 w-5" /> },
        { label: 'Order lab test', href: '/dashboard/lab-referrals', icon: <FlaskConical className="h-5 w-5" /> },
        { label: 'Create prescription', href: '/dashboard/prescriptions', icon: <Pill className="h-5 w-5" /> },
      ],
      signal: { label: 'Clinical queue', value: `${doctorAppointments.filter((item) => item.date === today && isOpenAppointment(item)).length} today`, detail: 'Visits, notes, diagnostics, prescriptions, and referrals are staged together.', tone: 'primary' },
      secondaryTitle: 'Diagnostics needing follow-up',
      secondaryItems: [
        ...pendingLabs.map((item) => ({ title: item.testName, meta: `${item.patientName} · ${item.destinationProviderName ?? 'Laboratory'}`, status: item.status, href: '/dashboard/lab-referrals' })),
        ...pendingImaging.map((item) => ({ title: item.scanType, meta: `${item.patientName} · ${item.destinationProviderName ?? 'Imaging center'}`, status: item.status, href: '/dashboard/imaging-referrals' })),
      ],
    },
    physiotherapist: {
      role: 'physiotherapist',
      metrics: [
        { label: 'Therapy sessions', value: doctorAppointments.filter(isOpenAppointment).length, helper: 'Upcoming care plan work', icon: <Activity className="h-5 w-5" />, tone: 'primary', href: '/dashboard/appointments' },
        { label: 'Patients', value: new Set(doctorAppointments.map((item) => item.patientId)).size, helper: 'Active rehabilitation panel', icon: <Users className="h-5 w-5" />, tone: 'info', href: '/dashboard/patients' },
        { label: 'Care plans', value: data.clinicalNotes.filter((item) => item.doctorId === user?.id).length, helper: 'Notes and exercises', icon: <FileText className="h-5 w-5" />, tone: 'success', href: '/dashboard/clinical-notes' },
        { label: 'Referrals', value: visibleReferrals.length, helper: 'Incoming and outgoing', icon: <ArrowRight className="h-5 w-5" />, tone: 'warning', href: '/dashboard/referrals' },
      ],
      workItems: appointmentItems(doctorAppointments.filter(isOpenAppointment)),
      actions: [
        { label: 'Open schedule', href: '/dashboard/appointments', icon: <Calendar className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Update care plan', href: '/dashboard/clinical-notes', icon: <FileText className="h-5 w-5" /> },
        { label: 'Patient timeline', href: '/dashboard/timeline', icon: <Clock3 className="h-5 w-5" /> },
        { label: 'Messages', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: 'Recovery focus', value: 'Continuity first', detail: 'Therapy sessions and care-plan context stay close to patient communication.', tone: 'success' },
      secondaryTitle: 'Recent rehabilitation context',
      secondaryItems: referralItems(visibleReferrals),
    },
    hospital: {
      role: 'hospital',
      metrics: [
        { label: 'Referred patients', value: new Set(visibleReferrals.map((item) => item.patientId)).size, helper: 'Unique active records', icon: <Users className="h-5 w-5" />, tone: 'primary', href: '/dashboard/patients' },
        { label: 'Verified doctors', value: verifiedDoctors.length, helper: 'Credentialed clinicians', icon: <Stethoscope className="h-5 w-5" />, tone: 'success', href: '/dashboard/doctors' },
        { label: 'Pending referrals', value: visibleReferrals.filter((item) => item.status === 'pending').length, helper: 'Need department action', icon: <FileText className="h-5 w-5" />, tone: 'warning', href: '/dashboard/referrals' },
        { label: 'Emergency arrivals', value: activeEmergency.length, helper: 'Active ambulance cases', icon: <Ambulance className="h-5 w-5" />, tone: activeEmergency.length ? 'critical' : 'neutral', href: '/dashboard/requests' },
      ],
      workItems: referralItems(visibleReferrals),
      actions: [
        { label: 'Review referrals', href: '/dashboard/referrals', icon: <FileText className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Emergency queue', href: '/dashboard/requests', icon: <Ambulance className="h-5 w-5" />, emphasis: activeEmergency.length ? 'danger' : undefined },
        { label: 'Doctors', href: '/dashboard/doctors', icon: <Stethoscope className="h-5 w-5" /> },
        { label: 'Messages', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: activeEmergency.length ? 'Emergency active' : 'Operational', value: `${visibleReferrals.filter((item) => item.status === 'pending').length} pending`, detail: 'Referral intake and emergency coordination are connected for hospital teams.', tone: activeEmergency.length ? 'critical' : 'primary' },
      secondaryTitle: 'Emergency coordination',
      secondaryItems: activeEmergency.map((item) => ({ title: item.patientName, meta: `${item.location} · ${item.priority} priority`, status: item.status, href: '/dashboard/requests' })),
    },
    laboratory: {
      role: 'laboratory',
      metrics: [
        { label: 'New requests', value: data.labTests.filter((item) => item.status === 'requested').length, helper: 'Awaiting accession', icon: <FlaskConical className="h-5 w-5" />, tone: 'warning', href: '/dashboard/test-requests' },
        { label: 'In process', value: data.labTests.filter((item) => item.status === 'in-progress').length, helper: 'Samples in workflow', icon: <Activity className="h-5 w-5" />, tone: 'info', href: '/dashboard/test-requests' },
        { label: 'Completed', value: data.labTests.filter((item) => item.status === 'completed').length, helper: 'Verified results', icon: <CheckCircle2 className="h-5 w-5" />, tone: 'success', href: '/dashboard/results' },
        { label: 'Critical review', value: data.labTests.filter((item) => item.notes?.toLowerCase().includes('critical')).length, helper: 'Requires escalation', icon: <AlertTriangle className="h-5 w-5" />, tone: 'critical', href: '/dashboard/lab-results-management' },
      ],
      workItems: pendingLabs.map((item) => ({ title: item.testName, meta: `${item.patientName} · ordered by ${item.doctorName}`, status: item.status, href: '/dashboard/test-requests' })),
      actions: [
        { label: 'Process queue', href: '/dashboard/test-requests', icon: <FlaskConical className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Upload result', href: '/dashboard/lab-results-management', icon: <FileText className="h-5 w-5" /> },
        { label: 'Verify reports', href: '/dashboard/results', icon: <BadgeCheck className="h-5 w-5" /> },
        { label: 'Messages', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: 'Specimen flow', value: `${pendingLabs.length} open`, detail: 'Requests, sample status, result upload, and verification are kept in one queue.', tone: pendingLabs.length ? 'warning' : 'success' },
      secondaryTitle: 'Recent lab history',
      secondaryItems: sortByDateDesc(data.labTests).map((item) => ({ title: item.testName, meta: `${item.patientName} · ${displayDate(item.date)}`, status: item.status, href: '/dashboard/results' })),
    },
    imaging: {
      role: 'imaging',
      metrics: [
        { label: 'Scan requests', value: data.imagingScans.filter((item) => item.status === 'requested').length, helper: 'Awaiting scheduling', icon: <ScanLine className="h-5 w-5" />, tone: 'warning', href: '/dashboard/scan-requests' },
        { label: 'In progress', value: data.imagingScans.filter((item) => item.status === 'in-progress').length, helper: 'Studies underway', icon: <Activity className="h-5 w-5" />, tone: 'info', href: '/dashboard/imaging-referrals' },
        { label: 'Completed', value: data.imagingScans.filter((item) => item.status === 'completed').length, helper: 'Reports available', icon: <CheckCircle2 className="h-5 w-5" />, tone: 'success', href: '/dashboard/results' },
        { label: 'Open referrals', value: visibleReferrals.filter((item) => item.referralType === 'imaging').length, helper: 'Pending handoff', icon: <FileText className="h-5 w-5" />, tone: 'neutral', href: '/dashboard/imaging-referrals' },
      ],
      workItems: pendingImaging.map((item) => ({ title: `${item.scanType}${item.bodyPart ? ` · ${item.bodyPart}` : ''}`, meta: `${item.patientName} · ${item.clinicalIndication ?? item.doctorName}`, status: item.status, href: '/dashboard/scan-requests' })),
      actions: [
        { label: 'Schedule scans', href: '/dashboard/scan-requests', icon: <Calendar className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Open referrals', href: '/dashboard/imaging-referrals', icon: <ScanLine className="h-5 w-5" /> },
        { label: 'Publish results', href: '/dashboard/results', icon: <FileText className="h-5 w-5" /> },
        { label: 'Messages', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: 'Imaging queue', value: `${pendingImaging.length} open`, detail: 'Scheduling, study status, and reporting stay aligned for clean clinical handoff.', tone: pendingImaging.length ? 'warning' : 'success' },
      secondaryTitle: 'Recent studies',
      secondaryItems: sortByDateDesc(data.imagingScans).map((item) => ({ title: item.scanType, meta: `${item.patientName} · ${displayDate(item.date)}`, status: item.status, href: '/dashboard/results' })),
    },
    pharmacy: {
      role: 'pharmacy',
      metrics: [
        { label: 'Pending Rx', value: activePrescriptions.length, helper: 'Awaiting verification', icon: <Pill className="h-5 w-5" />, tone: 'warning', href: '/dashboard/prescriptions' },
        { label: 'Dispensed', value: data.prescriptions.filter((item) => item.status === 'dispensed').length, helper: 'Completed orders', icon: <CheckCircle2 className="h-5 w-5" />, tone: 'success', href: '/dashboard/prescriptions' },
        { label: 'Inventory risk', value: lowStock.length, helper: 'Low or out of stock', icon: <Package className="h-5 w-5" />, tone: lowStock.length ? 'critical' : 'success', href: '/dashboard/inventory' },
        { label: 'Refill requests', value: data.prescriptions.flatMap((item) => item.refillRequests ?? []).filter((item) => item.status === 'pending').length, helper: 'Need review', icon: <Clock3 className="h-5 w-5" />, tone: 'info', href: '/dashboard/prescription-refills' },
      ],
      workItems: activePrescriptions.map((item) => ({ title: item.patientName, meta: `${item.medications[0]?.name ?? 'Medication'}${item.medications.length > 1 ? ` +${item.medications.length - 1}` : ''} · ${item.doctorName}`, status: item.status, href: '/dashboard/prescriptions' })),
      actions: [
        { label: 'Verify prescriptions', href: '/dashboard/prescriptions', icon: <Pill className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Check inventory', href: '/dashboard/inventory', icon: <Package className="h-5 w-5" />, emphasis: lowStock.length ? 'danger' : undefined },
        { label: 'Referral requests', href: '/dashboard/pharmacy-referrals', icon: <FileText className="h-5 w-5" /> },
        { label: 'Messages', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: lowStock.length ? 'Stock risk' : 'Medication safety', value: `${activePrescriptions.length} Rx open`, detail: 'Prescription verification, medication availability, refill work, and inventory risk stay connected.', tone: lowStock.length ? 'critical' : 'primary' },
      secondaryTitle: 'Inventory watch',
      secondaryItems: lowStock.map((item) => ({ title: item.name, meta: `${item.stock} ${item.unit} remaining · reorder at ${item.reorderLevel}`, status: item.status, href: '/dashboard/inventory' })),
    },
    ambulance: {
      role: 'ambulance',
      metrics: [
        { label: 'Active requests', value: activeEmergency.length, helper: 'Not yet completed', icon: <Radio className="h-5 w-5" />, tone: activeEmergency.length ? 'critical' : 'success', href: '/dashboard/requests' },
        { label: 'Critical calls', value: criticalEmergency.length, helper: 'High-acuity cases', icon: <AlertTriangle className="h-5 w-5" />, tone: criticalEmergency.length ? 'critical' : 'neutral', href: '/dashboard/requests' },
        { label: 'Available units', value: data.ambulances.filter((item) => item.status === 'available').length, helper: 'Ready to dispatch', icon: <Ambulance className="h-5 w-5" />, tone: 'success', href: '/dashboard/vehicles' },
        { label: 'In field', value: data.ambulances.filter((item) => ['dispatched', 'in-transit', 'on-scene'].includes(item.status)).length, helper: 'Assigned vehicles', icon: <MapPin className="h-5 w-5" />, tone: 'info', href: '/dashboard/vehicles' },
      ],
      workItems: activeEmergency.map((item) => ({ title: item.patientName, meta: `${item.location} · ${item.time} · ${item.priority} priority`, status: item.status, href: '/dashboard/requests', tone: item.priority === 'critical' || item.priority === 'high' ? 'critical' : statusTone(item.status) })),
      actions: [
        { label: 'Dispatch queue', href: '/dashboard/requests', icon: <Radio className="h-5 w-5" />, emphasis: activeEmergency.length ? 'danger' : 'primary' },
        { label: 'Fleet status', href: '/dashboard/vehicles', icon: <Ambulance className="h-5 w-5" /> },
        { label: 'Hospital handoff', href: '/dashboard/messages', icon: <Hospital className="h-5 w-5" /> },
        { label: 'Live location', href: '/dashboard/requests', icon: <MapPin className="h-5 w-5" /> },
      ],
      signal: { label: criticalEmergency.length ? 'Critical response' : 'Dispatch ready', value: `${activeEmergency.length} active`, detail: 'Priority, routing, patient identity, and fleet readiness remain visible for emergency teams.', tone: criticalEmergency.length ? 'critical' : 'success' },
      secondaryTitle: 'Fleet readiness',
      secondaryItems: data.ambulances.map((item) => ({ title: item.callSign, meta: `${item.plateNumber} · fuel ${item.fuel}%`, status: item.status, href: '/dashboard/vehicles' })),
    },
    admin: {
      role: 'admin',
      metrics: [
        { label: 'Users', value: users.length, helper: 'Managed accounts', icon: <Users className="h-5 w-5" />, tone: 'primary', href: '/dashboard/users' },
        { label: 'Verifications', value: pendingVerifications.length, helper: 'Pending provider review', icon: <ShieldCheck className="h-5 w-5" />, tone: pendingVerifications.length ? 'warning' : 'success', href: '/dashboard/verifications' },
        { label: 'Care volume', value: openAppointments.length, helper: 'Open appointments', icon: <Activity className="h-5 w-5" />, tone: 'info', href: '/dashboard/analytics' },
        { label: 'Emergencies', value: activeEmergency.length, helper: 'Active requests', icon: <Ambulance className="h-5 w-5" />, tone: activeEmergency.length ? 'critical' : 'neutral', href: '/dashboard/requests' },
      ],
      workItems: pendingVerifications.map((item) => ({ title: item.name, meta: `${item.role} · ${item.email}`, status: item.status, href: '/dashboard/verifications' })),
      actions: [
        { label: 'Review providers', href: '/dashboard/verifications', icon: <ShieldCheck className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Manage users', href: '/dashboard/users', icon: <Users className="h-5 w-5" /> },
        { label: 'Analytics', href: '/dashboard/analytics', icon: <Activity className="h-5 w-5" /> },
        { label: 'Notifications', href: '/dashboard/notifications', icon: <MessageSquare className="h-5 w-5" /> },
      ],
      signal: { label: 'Governance', value: `${pendingVerifications.length} reviews`, detail: 'Identity, verification, analytics, alerts, and service quality are visible from one surface.', tone: pendingVerifications.length ? 'warning' : 'success' },
      secondaryTitle: 'Platform activity',
      secondaryItems: [
        ...appointmentItems(openAppointments, '/dashboard/appointments'),
        ...activeEmergency.map((item) => ({ title: item.patientName, meta: `${item.location} · emergency`, status: item.status, href: '/dashboard/requests' })),
      ],
    },
    super_admin: {
      role: 'super_admin',
      metrics: [
        { label: 'Ecosystem users', value: users.length, helper: 'Patients and providers', icon: <Users className="h-5 w-5" />, tone: 'primary', href: '/dashboard/users' },
        { label: 'Organizations', value: users.filter((item) => ['hospital', 'laboratory', 'imaging', 'pharmacy', 'ambulance'].includes(normalizeUserRole(item.role) ?? '')).length, helper: 'Care network operators', icon: <Building2 className="h-5 w-5" />, tone: 'info', href: '/dashboard/users' },
        { label: 'Open risk', value: pendingVerifications.length + activeEmergency.length + lowStock.length, helper: 'Verification, emergency, stock', icon: <AlertTriangle className="h-5 w-5" />, tone: pendingVerifications.length + activeEmergency.length + lowStock.length ? 'warning' : 'success', href: '/dashboard/audit' },
        { label: 'Billing records', value: data.billingRecords.length + data.invoices.length, helper: 'Financial operations', icon: <FileText className="h-5 w-5" />, tone: 'neutral', href: '/dashboard/admin-billing' },
      ],
      workItems: [
        ...pendingVerifications.map((item) => ({ title: item.name, meta: `${item.role} verification · ${item.email}`, status: item.status, href: '/dashboard/verifications' })),
        ...activeEmergency.map((item) => ({ title: item.patientName, meta: `${item.location} · ${item.priority} priority`, status: item.status, href: '/dashboard/requests', tone: item.priority === 'critical' || item.priority === 'high' ? 'critical' : statusTone(item.status) })),
        ...lowStock.map((item) => ({ title: item.name, meta: `${item.stock} ${item.unit} remaining`, status: item.status, href: '/dashboard/inventory' })),
      ],
      actions: [
        { label: 'Platform analytics', href: '/dashboard/analytics', icon: <Activity className="h-5 w-5" />, emphasis: 'primary' },
        { label: 'Audit logs', href: '/dashboard/audit', icon: <ShieldCheck className="h-5 w-5" /> },
        { label: 'Admin billing', href: '/dashboard/admin-billing', icon: <FileText className="h-5 w-5" /> },
        { label: 'Create admin', href: '/dashboard/admin/create', icon: <BadgeCheck className="h-5 w-5" /> },
      ],
      signal: { label: 'Executive view', value: `${users.length} accounts`, detail: 'Alera’s trust, risk, care volume, revenue, and audit picture are connected here.', tone: 'primary' },
      secondaryTitle: 'System continuity',
      secondaryItems: appointmentItems(openAppointments, '/dashboard/appointments'),
    },
  };

  return <DashboardShell {...(configs[role] ?? configs.patient)} />;
}
