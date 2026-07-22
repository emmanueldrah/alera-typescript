import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  CheckCircle2, XCircle, ArrowRight,
  Users, Stethoscope, Building2, Pill, FlaskConical, ScanLine, Ambulance, BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
const groupReveal: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

const comparisonItems = [
  'End-to-end patient care records within a single login',
  'Real-time laboratory and diagnostic report distribution',
  'e-Prescriptions sent directly to patient-selected pharmacies',
  'Emergency fleet telemetry and direct trauma department coordinates',
  'Cryptographically append-only audit logs with full security coverage',
  'Role-specific command dashboards matching clinical tasks',
  'Automated professional credential verification en route',
];

const withoutAlera = [
  'Vague separate portals for every medical facility type',
  'Results physically faxed or telephoned between laboratories',
  'Paper prescriptions high in data transcription error rates',
  'Manual phone coordination for ambulance arrivals',
  'Fragmented patient data without a single timeline index',
  'Siloed billing settlement and complex audit queries',
  'Slow credential verification protocols taking weeks',
];

const testimonials = [
  {
    quote: 'Alera eliminated the delay between my clinical order and the laboratory accession. Results are returned on screen within minutes.',
    name: 'Dr. Kwame Mensah',
    role: 'Family Medicine Practitioner',
    icon: Stethoscope,
  },
  {
    quote: 'Handling imaging scans and radiologic findings used to require massive physical filing. Alera streams DICOM logs cleanly.',
    name: 'Amara Osei',
    role: 'Director, City Imaging Center',
    icon: ScanLine,
  },
  {
    quote: 'Emergency dispatch is finally coordinated. We stream trauma metrics directly to wards while patients are still en route.',
    name: 'Emeka Adeyemi',
    role: 'EMS Operations Manager',
    icon: Ambulance,
  },
  {
    quote: 'Electronic scripts arrive verified and structured with complete allergy histories. Transcription errors are eliminated.',
    name: 'Grace Otieno',
    role: 'Chief Pharmacist',
    icon: Pill,
  },
];

const stats = [
  { value: '8 Nodes', label: 'Ecosystem Alignment', sub: 'Unified operational consoles' },
  { value: '100%', label: 'Cipher Protection', sub: 'AES-256 standard encryption' },
  { value: '&lt; 15ms', label: 'Network Latency', sub: 'Instant status distribution' },
  { value: 'Full Log', label: 'Cryptographic Audit', sub: 'Chronological append-only events' },
];

const WhyAlera = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative px-6 pb-16 pt-16 sm:px-8 lg:px-12 border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={sectionReveal} initial="hidden" animate="visible" className="max-w-3xl">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Clinical Efficacy Report</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Eliminating Systemic Care Fragmentation
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600">
              Healthcare portals are isolated. Providers coordinate over faxes, paper slips, and physical phone lists. Alera implements a standard, high-performance infrastructure layer linking every medical stakeholder inside a single, zero-trust ecosystem.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            variants={groupReveal} initial="hidden" animate="visible"
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={sectionReveal}
                className="rounded border border-slate-200 bg-slate-50 p-5"
              >
                <div className="text-2xl font-bold tracking-tight text-slate-950" dangerouslySetInnerHTML={{ __html: s.value }} />
                <div className="mt-1.5 text-xs font-bold text-slate-900">{s.label}</div>
                <div className="mt-0.5 text-xs text-slate-500">{s.sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="px-6 py-16 sm:px-8 lg:px-12 border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Operational Comparison Matrix</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              The Analogue Pipeline vs. Alera Operating Layer
            </h2>
          </motion.div>

          <motion.div
            variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            className="mt-8 overflow-hidden rounded border border-slate-300 bg-white"
          >
            <div className="grid lg:grid-cols-2">
              {/* Without */}
              <div className="p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-slate-200">
                <div className="mb-6 inline-flex items-center gap-2 rounded border border-slate-300 bg-slate-50 px-3 py-1 text-[10px] font-mono font-bold uppercase text-slate-600">
                  <XCircle className="h-3.5 w-3.5 text-slate-500" />
                  Siloed Operations
                </div>
                <div className="space-y-4">
                  {withoutAlera.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* With */}
              <div className="bg-slate-50/50 p-8 sm:p-10">
                <div className="mb-6 inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1 text-[10px] font-mono font-bold uppercase text-slate-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-800" />
                  Alera Core Unified Layer
                </div>
                <div className="space-y-4">
                  {comparisonItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs font-semibold text-slate-900 leading-relaxed">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-800" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Flat Monospace Callout Bar */}
            <div className="border-t border-slate-300 bg-slate-950 px-8 py-6 sm:px-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-300 font-mono">
                  DEPLOYMENT PROTOCOL ESTABLISHES SECURE NETWORK INTEGRITY IN MINUTES.
                </p>
                <Button asChild className="rounded bg-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-950 hover:bg-slate-100 flex-shrink-0">
                  <Link to="/signup">
                    Initialize Core Node
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Editorial Testimonials */}
      <section className="px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="max-w-2xl">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Verified Clinical Accounts</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              Integrated Performance Outcomes
            </h2>
            <p className="mt-4 text-xs leading-relaxed text-slate-600">
              Review verified evaluations from active medical networks running Alera core nodes daily.
            </p>
          </motion.div>

          <motion.div
            variants={groupReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {testimonials.map((t) => {
              const Icon = t.icon;
              return (
                <motion.div
                  key={t.name} variants={sectionReveal}
                  className="flex flex-col gap-4 rounded border border-slate-200 bg-slate-50/40 p-5"
                >
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-900">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="flex-1 text-xs leading-relaxed text-slate-600">"{t.quote}"</p>
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-xs font-bold text-slate-950">{t.name}</p>
                    <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{t.role}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-20 pt-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="rounded border border-slate-300 bg-slate-950 p-8 text-white sm:p-10"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Deploy Operating Layer</p>
                <h2 className="mt-2 text-xl font-bold tracking-tight">
                  Stop patching fragmented, non-compliant portals.
                </h2>
                <p className="mt-2 text-xs text-slate-300 max-w-xl">
                  Unify your care team inside a zero-trust environment. Node authorization requires minutes to complete.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-shrink-0">
                <Button asChild size="lg" className="rounded bg-white px-5 text-xs font-mono font-bold uppercase tracking-wider text-slate-950 hover:bg-slate-100">
                  <Link to="/signup">Create Verified Account</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded border border-white/20 bg-white/5 px-5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-white/10">
                  <Link to="/features">System Index</Link>
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
