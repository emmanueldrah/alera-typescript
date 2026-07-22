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
    title: 'Verified Professional Credentials',
    description: 'Every medical practitioner, hospital registrar, connected lab, and emergency fleet operator undergoes direct credential auditing by platform administrators.',
  },
  {
    icon: LockKeyhole,
    title: 'Zero-Trust Cryptographic Access',
    description: 'All system sessions, medical logs, and message payloads are guarded with end-to-end cypher standards. Patient data is released only with direct consent keys.',
  },
  {
    icon: Clock3,
    title: 'Precision Performance Metrics',
    description: 'Average transaction dispatch time measures under 12ms. Fleet locations, lab assays, and pharmacy stocks are synchronised instantly.',
  },
  {
    icon: ShieldCheck,
    title: 'Granular Patient Release Keys',
    description: 'Patients dictate precisely what information nodes can access. All releases are validated digitally and preserved in append-only records.',
  },
  {
    icon: FileSearch,
    title: 'Immutable Event Auditing',
    description: 'Every node action—from a prescription dispatch to administrative credentials reviews—is recorded inside an append-only chronological log.',
  },
  {
    icon: ActivitySquare,
    title: 'Unified Communication Lines',
    description: 'Labs route findings straight to clinics. Pharmacies receive e-prescriptions instantly. Hospital dispatches map triage coordinates en route.',
  },
];

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const groupReveal: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

const Trust = () => {
  return (
    <section className="px-6 py-20 bg-white sm:px-8 lg:px-12 border-b border-slate-200">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl border-b border-slate-200 pb-10">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Security & Compliance Catalog</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Accountability, Privacy, & Infrastructure Integrity
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Clinical security is fundamental to Alera. Every medical stakeholder operates inside an engineered environment matching strict global safety directives.
          </p>
        </div>

        {/* Monospace high-contrast checklist directory */}
        <motion.div
          variants={groupReveal}
          initial="hidden"
          animate="visible"
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                variants={sectionReveal}
                className="rounded border border-slate-200 bg-slate-50/40 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded border border-slate-300 bg-white text-slate-900">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 text-xs font-bold text-slate-950">{point.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{point.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Authoritative Audit Summary */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          animate="visible"
          className="mt-12 rounded border border-slate-300 bg-slate-50 p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Audit Summary</p>
              <p className="mt-2 text-sm font-bold text-slate-950 leading-relaxed">
                Constant professional credential verification, encrypted clinical logs, and append-only action registries represent our baseline standard.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {['Audit Logs Verified', 'Zero-Trust Pipeline', 'NIST Standard Compliant'].map((item) => (
                <div key={item} className="rounded border border-slate-200 bg-white px-3 py-2 text-[10px] font-mono font-bold uppercase text-slate-700 text-center">
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
