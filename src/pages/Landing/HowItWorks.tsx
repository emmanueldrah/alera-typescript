import { motion, type Variants } from 'framer-motion';
import {
  UserCheck, Search, Video, FlaskConical, Pill, Ambulance, ClipboardList, BarChart3, type LucideIcon
} from 'lucide-react';

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
};

const steps: Step[] = [
  {
    icon: UserCheck,
    title: 'Register Your Role',
    description: 'Sign up as a patient, doctor, hospital, pharmacy, laboratory, imaging center, or ambulance service. Each role gets a tailored dashboard.',
    tag: 'All roles',
    tagColor: 'bg-slate-100 text-slate-700',
  },
  {
    icon: Search,
    title: 'Find What You Need',
    description: 'Patients browse verified doctors by specialty. Doctors refer to labs and imaging. Hospitals coordinate entire care teams — all in one place.',
    tag: 'Patients & Providers',
    tagColor: 'bg-sky-100 text-sky-700',
  },
  {
    icon: Video,
    title: 'Consult Securely',
    description: 'Start a video consultation, live chat, or in-person appointment. Doctors document clinical notes and manage allergies, prescriptions, and referrals in real time.',
    tag: 'Doctors & Patients',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: FlaskConical,
    title: 'Labs & Imaging Process Requests',
    description: 'Laboratory and imaging centers receive test requests, upload results, and notify doctors automatically. Patients can track the status of their tests.',
    tag: 'Labs & Imaging',
    tagColor: 'bg-violet-100 text-violet-700',
  },
  {
    icon: Pill,
    title: 'Pharmacy Fulfils Prescriptions',
    description: 'Doctors send e-prescriptions directly to connected pharmacies. Pharmacists manage inventory, verify validity, and coordinate pickup or delivery.',
    tag: 'Pharmacies',
    tagColor: 'bg-teal-100 text-teal-700',
  },
  {
    icon: Ambulance,
    title: 'Emergency Dispatch',
    description: 'Patients can request emergency ambulance services. Ambulance teams manage vehicles, track requests, and coordinate hospital handoffs.',
    tag: 'Ambulance & Hospitals',
    tagColor: 'bg-rose-100 text-rose-700',
  },
  {
    icon: ClipboardList,
    title: 'Full Medical Records',
    description: 'Every interaction is recorded — appointments, prescriptions, lab results, imaging scans, clinical notes, consents, and medical history are all connected.',
    tag: 'All roles',
    tagColor: 'bg-slate-100 text-slate-700',
  },
  {
    icon: BarChart3,
    title: 'Admin Oversight & Analytics',
    description: 'System administrators oversee users, verifications, billing, audit logs, and platform analytics to ensure quality of care and compliance.',
    tag: 'Admins',
    tagColor: 'bg-indigo-100 text-indigo-700',
  },
];

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const groupReveal: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const HowItWorks = () => {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">How It Works</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            One ecosystem, every step of the care journey
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
            Alera connects all the players in healthcare — from initial consultation through lab testing, pharmacy fulfilment, imaging,
            and emergency response — ensuring information flows seamlessly between every stakeholder.
          </p>
        </div>

        <motion.div
          variants={groupReveal}
          initial="hidden"
          animate="visible"
          className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={sectionReveal}
                className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.5)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-42px_rgba(15,23,42,0.55)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#eff6ff,_#ecfeff)] text-sky-700 ring-1 ring-sky-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${step.tagColor}`}>
                    {step.tag}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-[11px] font-semibold text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-base font-semibold text-slate-950">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
