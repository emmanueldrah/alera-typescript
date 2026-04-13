import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  CheckCircle2, XCircle, ArrowRight, Star,
  Users, Stethoscope, Building2, Pill, FlaskConical, ScanLine, Ambulance, BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const groupReveal: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const comparisonItems = [
  'End-to-end patient journey in one login',
  'Real-time lab & imaging result delivery',
  'E-prescriptions to any connected pharmacy',
  'Live ambulance dispatch & GPS tracking',
  'Full audit trail & HIPAA-compliant records',
  'Role-based dashboards for every stakeholder',
  'Verified provider credentialing built-in',
];

const withoutAlera = [
  'Separate portals for every provider type',
  'Results faxed or phoned between facilities',
  'Paper prescriptions prone to errors',
  'Manual ambulance coordination',
  'No unified patient medical record',
  'Fragmented billing & compliance tracking',
  'Manual and slow credential verification',
];

const testimonials = [
  {
    quote: 'Alera eliminated the 3-day wait between my doctor ordering a blood test and the lab receiving it. Everything happens in minutes now.',
    name: 'Fatima Al-Rashid',
    role: 'Patient',
    initials: 'FA',
    color: 'bg-teal-100 text-teal-800',
    icon: Users,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
  },
  {
    quote: "I can prescribe, refer to imaging, and message my patient's pharmacy on the same screen. No faxes, no phone tag — it's transformed my workflow.",
    name: 'Dr. Kwame Mensah',
    role: 'Family Medicine Doctor',
    initials: 'KM',
    color: 'bg-sky-100 text-sky-800',
    icon: Stethoscope,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50',
  },
  {
    quote: 'Managing imaging referrals used to require a dedicated coordinator. Alera handles the routing automatically — our clinical team now focuses on patients, not logistics.',
    name: 'Amara Osei',
    role: 'Director, City Radiology Center',
    initials: 'AO',
    color: 'bg-cyan-100 text-cyan-800',
    icon: ScanLine,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-50',
  },
  {
    quote: 'The ambulance dispatch integration is a game changer. We get precise patient GPS locations and can coordinate hospital bed prep while the team is still en route.',
    name: 'Emeka Adeyemi',
    role: 'EMS Operations Manager',
    initials: 'EA',
    color: 'bg-rose-100 text-rose-800',
    icon: Ambulance,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
  },
  {
    quote: "Our pharmacy gets e-prescriptions instantly with the patient's allergy history attached. We've had zero dispensing errors since we joined Alera.",
    name: 'Nurse Grace Otieno',
    role: 'Chief Pharmacist',
    initials: 'GO',
    color: 'bg-emerald-100 text-emerald-800',
    icon: Pill,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
  {
    quote: 'The full audit trail alone justifies the switch. Every action across our hospital network is logged and traceable. Our compliance team loves it.',
    name: 'Hassan Al-Farsi',
    role: 'Hospital Administrator',
    initials: 'HA',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Building2,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
  },
  {
    quote: 'Lab test results used to take days to reach the ordering doctor. Now they arrive in real-time the moment we publish them. Our turnaround metric improved by 60%.',
    name: 'Dr. Priya Nair',
    role: 'Laboratory Director',
    initials: 'PN',
    color: 'bg-violet-100 text-violet-800',
    icon: FlaskConical,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
  },
  {
    quote: 'Provider verification that used to take weeks now takes hours. Alera gives administrators the tools to review credentials, activate accounts, and manage the ecosystem in one place.',
    name: 'Samuel Okafor',
    role: 'Platform Administrator',
    initials: 'SO',
    color: 'bg-slate-100 text-slate-800',
    icon: BadgeCheck,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-50',
  },
];

const stats = [
  { value: '8', label: 'Connected healthcare roles', sub: 'All stakeholders unified' },
  { value: '100%', label: 'End-to-end encrypted', sub: 'HIPAA compliant by design' },
  { value: 'Real-time', label: 'Lab & imaging notifications', sub: 'No more waiting for calls' },
  { value: 'Full', label: 'Audit trail coverage', sub: 'Every action logged' },
];

const WhyAlera = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden px-4 pb-16 pt-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-100/60 blur-3xl" />
          <div className="absolute right-10 bottom-0 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl">
          <motion.div variants={sectionReveal} initial="hidden" animate="visible" className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Why Alera?</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Healthcare is fragmented.{' '}
              <span className="bg-[linear-gradient(135deg,_#0ea5e9,_#14b8a6)] bg-clip-text text-transparent">
                Alera fixes that.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Doctors, hospitals, labs, pharmacies, imaging centers, and ambulance services all operate in silos. Patients fall through the gaps. Alera is the infrastructure layer that connects every stakeholder in a single, auditable, real-time ecosystem.
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={groupReveal} initial="hidden" animate="visible"
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={sectionReveal}
                className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-[0_12px_40px_-35px_rgba(15,23,42,0.4)]"
              >
                <div className="text-3xl font-semibold tracking-tight text-slate-950">{s.value}</div>
                <div className="mt-1 text-sm font-medium text-slate-700">{s.label}</div>
                <div className="mt-0.5 text-xs text-slate-500">{s.sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">The Difference</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Old way vs the Alera way
            </h2>
          </motion.div>

          <motion.div
            variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.3)]"
          >
            <div className="grid lg:grid-cols-2">
              {/* Without */}
              <div className="p-7 sm:p-10">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <XCircle className="h-3.5 w-3.5 text-slate-400" />
                  Without Alera — fragmented healthcare
                </div>
                <div className="space-y-4">
                  {withoutAlera.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-500">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* With */}
              <div className="border-t border-slate-100 bg-gradient-to-br from-sky-50/60 to-emerald-50/40 p-7 sm:p-10 lg:border-l lg:border-t-0">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  With Alera — one connected ecosystem
                </div>
                <div className="space-y-4">
                  {comparisonItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm font-medium text-slate-800">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA strip inside the card */}
            <div className="border-t border-slate-100 bg-slate-950 px-7 py-5 sm:px-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-300">
                  Ready to move from fragmented to unified? It takes less than 5 minutes to register.
                </p>
                <Button asChild className="h-10 rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100 flex-shrink-0">
                  <Link to="/signup">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">From the Ecosystem</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Real people. Real outcomes.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
              Patients, clinicians, pharmacists, lab directors, and administrators across the Alera ecosystem share how the platform changed how they work and receive care.
            </p>
          </motion.div>

          <motion.div
            variants={groupReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          >
            {testimonials.map((t) => {
              const Icon = t.icon;
              return (
                <motion.div
                  key={t.name} variants={sectionReveal}
                  className="flex flex-col gap-5 rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_45px_-40px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_22px_60px_-40px_rgba(14,165,233,0.2)]"
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${t.iconBg} ${t.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-7 text-slate-600">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${t.color}`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.75)] md:px-10"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-200">Join them</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                  Stop patching together fragmented tools.
                </h2>
                <p className="mt-3 max-w-xl text-base text-slate-300">
                  Join the healthcare ecosystem where every role works together. Pick your role and connect in minutes.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-shrink-0">
                <Button asChild size="lg" className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100">
                  <Link to="/signup">Create Your Account <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                  <Link to="/features">See All Features</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WhyAlera;
