import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Stethoscope, Building2, Pill, FlaskConical, ScanLine, Ambulance, Users, ShieldCheck,
  ArrowRight, type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Stakeholder = {
  icon: LucideIcon;
  role: string;
  tagline: string;
  description: string;
  capabilities: string[];
  iconBg: string;
  iconColor: string;
  accentBorder: string;
};

const stakeholders: Stakeholder[] = [
  {
    icon: Users,
    role: 'Patients',
    tagline: 'Your health, in your hands.',
    description: 'Get the care you need without leaving home. Book appointments, consult doctors, view lab results, track prescriptions, and manage your complete medical history — all in one place.',
    capabilities: ['Book & track appointments', 'Video & chat consultations', 'View lab & imaging results', 'Prescription tracking', 'Medical history & timeline', 'Request ambulance services'],
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-700',
    accentBorder: 'border-teal-200 hover:border-teal-300',
  },
  {
    icon: Stethoscope,
    role: 'Doctors & Clinicians',
    tagline: 'Clinical tools that keep you in flow.',
    description: 'Manage your patient load, conduct telemedicine sessions, issue prescriptions, write clinical notes, track referrals, and stay on top of every patient in your care — without switching between tools.',
    capabilities: ['Telemedicine & in-person visits', 'E-prescriptions & refill requests', 'Clinical notes & problem list', 'Lab & imaging referrals', 'Patient history & allergy alerts', 'Appointment scheduling & reminders'],
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-700',
    accentBorder: 'border-sky-200 hover:border-sky-300',
  },
  {
    icon: Building2,
    role: 'Hospitals',
    tagline: 'Coordinate care across your full organization.',
    description: 'Hospitals can manage doctors, beds, departments, and patient flows. Coordinate with labs, imaging centers, and ambulance services under one unified administrative view.',
    capabilities: ['Multi-doctor staff management', 'Department & patient coordination', 'Lab & imaging center integration', 'Ambulance coordination', 'Referral & handoff tracking', 'Organization-wide analytics'],
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-700',
    accentBorder: 'border-indigo-200 hover:border-indigo-300',
  },
  {
    icon: Pill,
    role: 'Pharmacies',
    tagline: 'Prescriptions delivered without friction.',
    description: 'Receive verified e-prescriptions directly from doctors, manage your inventory, process refill requests, and stay connected to the patient’s care plan in real time.',
    capabilities: ['Receive e-prescriptions instantly', 'Manage drug inventory', 'Prescription refill workflow', 'Patient medication history', 'Low-stock alerts', 'Compliance & audit trail'],
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    accentBorder: 'border-emerald-200 hover:border-emerald-300',
  },
  {
    icon: FlaskConical,
    role: 'Laboratories',
    tagline: 'Test requests, processed and delivered seamlessly.',
    description: 'Receive test orders from referring doctors, manage your lab workflow, upload verified results, and automatically notify providers and patients when results are ready.',
    capabilities: ['Receive doctor-issued test requests', 'Manage test queue & workflow', 'Upload & publish results', 'Auto-notify requesting providers', 'Patient result visibility', 'Lab audit logs'],
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-700',
    accentBorder: 'border-violet-200 hover:border-violet-300',
  },
  {
    icon: ScanLine,
    role: 'Imaging Centers',
    tagline: 'Referrals in, reports out — end to end.',
    description: 'Manage imaging referrals, book scan appointments, upload reports, and ensure results reach the requesting clinician instantly. All imaging data links to the patient’s unified record.',
    capabilities: ['Receive imaging referrals', 'Scan appointment management', 'Report upload & delivery', 'Link scans to patient records', 'Auto-notify referring doctors', 'Imaging audit trail'],
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-700',
    accentBorder: 'border-cyan-200 hover:border-cyan-300',
  },
  {
    icon: Ambulance,
    role: 'Ambulance Services',
    tagline: 'Emergency response, tracked from dispatch to handoff.',
    description: 'Receive patient emergency requests, assign vehicles, dispatch teams, and coordinate hospital handoffs — all tracked in real time with a full incident history.',
    capabilities: ['Real-time dispatch requests', 'Vehicle & fleet management', 'Hospital coordination & handoff', 'Incident tracking & history', 'Emergency contact management', 'Response time analytics'],
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-700',
    accentBorder: 'border-rose-200 hover:border-rose-300',
  },
  {
    icon: ShieldCheck,
    role: 'Administrators',
    tagline: 'Platform-wide oversight and governance.',
    description: 'System administrators oversee every user, verify provider credentials, manage billing, review audit logs, and maintain the integrity and performance of the entire platform.',
    capabilities: ['User management & access control', 'Provider verification workflows', 'Platform-wide analytics', 'Billing & financial oversight', 'Full audit log access', 'Notification & reminder management'],
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    accentBorder: 'border-slate-300 hover:border-slate-400',
  },
];

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const groupReveal: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const WhoWeServe = () => {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Who We Serve</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Built for everyone in the healthcare ecosystem
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
            Alera is not just for patients and doctors. It's a fully integrated platform that connects every stakeholder in healthcare — from pharmacies and laboratories to imaging centers, ambulance services, hospitals, and administrators.
          </p>
        </div>

        <motion.div
          variants={groupReveal}
          initial="hidden"
          animate="visible"
          className="mt-12 grid gap-6 lg:grid-cols-2"
        >
          {stakeholders.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.role}
                variants={sectionReveal}
                className={`rounded-[1.75rem] border bg-white/90 p-6 shadow-[0_16px_45px_-40px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1 ${s.accentBorder}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset ring-black/5 ${s.iconBg} ${s.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-slate-950">{s.role}</p>
                    <p className="text-sm font-medium text-slate-500">{s.tagline}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{s.description}</p>

                <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">
                  {s.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${s.iconColor.replace('text-', 'bg-')}`} />
                      {cap}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          animate="visible"
          className="mt-12 rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.75)] md:px-8 md:py-10"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">Join the ecosystem</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                No matter your role, Alera is built for you.
              </h2>
              <p className="mt-3 max-w-xl text-base text-slate-300">
                Create your account, select your role, and connect with the rest of the healthcare network that's already on Alera.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-shrink-0">
              <Button asChild size="lg" className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                <Link to="/features">See All Features</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhoWeServe;
