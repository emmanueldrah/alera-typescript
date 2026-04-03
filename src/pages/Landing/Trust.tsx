import { motion, type Variants } from 'framer-motion';
import {
  BadgeCheck, LockKeyhole, Clock3, ShieldCheck, FileSearch, ActivitySquare, type LucideIcon
} from 'lucide-react';

type TrustPoint = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const trustPoints: TrustPoint[] = [
  {
    icon: BadgeCheck,
    title: 'Verified Healthcare Providers',
    description: 'Every doctor, hospital, laboratory, imaging center, pharmacy, and ambulance service is reviewed and verified by platform administrators before going active.',
  },
  {
    icon: LockKeyhole,
    title: 'Secure & Private by Design',
    description: 'All sessions, records, and communications are protected using end-to-end encryption. Patient data is never shared without explicit consent.',
  },
  {
    icon: Clock3,
    title: 'Fast, Responsive Care',
    description: 'Average consultation response time under 2 minutes. Ambulance dispatch, lab results, and pharmacy fulfilment are all tracked in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'Patient Consent at Every Step',
    description: 'Patients control what information is shared with providers. Consent forms are managed digitally and stored securely within the platform.',
  },
  {
    icon: FileSearch,
    title: 'Full Audit Trail',
    description: 'Every action taken by every user — from a prescription update to an admin verification — is logged and auditable to ensure accountability across the ecosystem.',
  },
  {
    icon: ActivitySquare,
    title: 'Connected, Not Siloed',
    description: 'Labs send results directly to referring doctors. Pharmacies receive prescriptions instantly. Hospitals coordinate with ambulances automatically. Nothing falls through the cracks.',
  },
];

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const groupReveal: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const Trust = () => {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Trust & Security</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Built on accountability, privacy, and connected care
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
            Trust is foundational to Alera. Every stakeholder — from patients to administrators — operates within a system designed for transparency, security, and clinical integrity.
          </p>
        </div>

        <motion.div
          variants={groupReveal}
          initial="hidden"
          animate="visible"
          className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                variants={sectionReveal}
                className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_45px_-42px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">{point.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{point.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Summary callout */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          animate="visible"
          className="mt-10 rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,_rgba(239,246,255,0.9),_rgba(236,253,245,0.9))] p-6 shadow-[0_20px_60px_-50px_rgba(14,165,233,0.35)] sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">Why the whole ecosystem trusts Alera</p>
              <p className="mt-3 text-xl font-semibold text-slate-950 md:text-2xl">
                Verified providers. Protected records. Real-time accountability. For every stakeholder, at every step.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {['Verified providers', 'Encrypted records', 'Full audit trail'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/80 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Trust;
