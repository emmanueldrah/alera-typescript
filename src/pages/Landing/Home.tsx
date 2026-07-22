import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Ambulance,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  LockKeyhole,
  Mic,
  Pill,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Video,
  Layers,
  Database,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CareNetworkGraph from '@/components/CareNetworkGraph';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

type RoleCard = {
  name: string;
  icon: LucideIcon;
  summary: string;
  detail: string;
};

const roleCards: RoleCard[] = [
  {
    name: 'Patient Portal',
    icon: UserRound,
    summary: 'A clear, direct route to consult scheduling, secure prescriptions, and laboratory records.',
    detail: 'Appointments • Prescriptions • Follow-up Plans',
  },
  {
    name: 'Clinician Workspace',
    icon: Stethoscope,
    summary: 'Visits loaded with active medical history, diagnostics orders, and direct specialist referrals.',
    detail: 'EMR Records • Diagnostics • Referrals',
  },
  {
    name: 'Hospital Management',
    icon: Building2,
    summary: 'Streamline emergency admissions, specialist transfers, and multi-department rosters.',
    detail: 'Intake • Department Routing • Rosters',
  },
  {
    name: 'Pharmacy Console',
    icon: Pill,
    summary: 'Electronic prescription matching, safety margin auditing, and secure inventory sync.',
    detail: 'Fulfillment • Prescription Verification • Safety',
  },
  {
    name: 'Laboratory Hub',
    icon: FlaskConical,
    summary: 'Biological orders, sample accession tracking, and automated results distribution.',
    detail: 'Assays • Accession • Verified Reports',
  },
  {
    name: 'Imaging Deck',
    icon: ScanLine,
    summary: 'High-resolution study scheduling, DICOM integration, and direct radiologist sign-off.',
    detail: 'DICOM • Scheduling • Findings',
  },
  {
    name: 'Emergency Dispatch',
    icon: Ambulance,
    summary: 'Triage priority queues, ambulance fleet routing, and direct trauma unit signaling.',
    detail: 'GPS Telemetry • Triage • Route Planning',
  },
];

const setMetaContent = (selector: string, value: string, attribute: 'name' | 'property') => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    const key = selector.match(/"([^"]+)"/)?.[1];
    if (key) {
      element.setAttribute(attribute, key);
    }
  }

  element.setAttribute('content', value);
};

const Home = () => {
  useEffect(() => {
    document.title = 'Alera | Integrated Healthcare Infrastructure Operating System';

    setMetaContent(
      'meta[name="description"]',
      'Alera is a highly secure, integrated medical operating system connecting patients, clinicians, laboratories, pharmacies, and emergency services.',
      'name',
    );
    setMetaContent(
      'meta[name="keywords"]',
      'healthcare software, clinical operating system, EMR infrastructure, telemedicine, electronic prescriptions, lab results, ambulance dispatch',
      'name',
    );
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 pb-24 md:pb-0 font-sans">

      {/* Handcrafted Structural Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16 md:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

            {/* Hero Copy */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Infrastructure Edition 2026
              </motion.div>

              <motion.h1 variants={fadeUp} className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1]">
                Alera: A unified operating layer for integrated health networks.
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 text-lg leading-relaxed text-slate-600">
                Alera connects patients, clinicians, pharmacies, laboratories, and ambulance dispatches onto a single secure infrastructure. No fragmentation. Zero redundant data entries. Built with architectural rigor.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
                  <Link to="/signup">
                    Initialize Alera Core
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <a href="#architecture">
                    Study System Architecture
                  </a>
                </Button>
              </motion.div>

              {/* Compliance Badges */}
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4 border-t border-slate-200 pt-8 text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                <span>HIPAA Compliant</span>
                <span className="text-slate-300">•</span>
                <span>ISO 27001 Secure</span>
                <span className="text-slate-300">•</span>
                <span>AES-256 Encrypted</span>
              </motion.div>
            </motion.div>

            {/* Structured Schema/Graph Visual */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CareNetworkGraph className="border border-slate-200" />

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-[11px] font-mono text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="font-bold">HEALTH NODE STATUS: ACTIVE</span>
                  <span>LATENCY: 12ms</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Editorial Split Layout - The Problem & Solution */}
      <section id="architecture" className="bg-slate-50 py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

            {/* Split Left: Narrative */}
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">Operational Narrative</span>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
                Healthcare integration has been historically broken. We engineered a solution.
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-slate-600">
                Modern medical software operates in silos. Clinicians can't access pharmacy inventory; laboratory results require manual upload; patients coordinate appointments through fragmented portals.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Alera replaces this chaos with a unified infrastructure. Every patient transaction, prescription, laboratory assay, and fleet coordinate lives on a single, secure ledger. This ensures immediate accessibility, absolute trace security, and frictionless clinic operations.
              </p>
            </div>

            {/* Split Right: Systematic Flow */}
            <div className="space-y-6">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">Care Delivery Pipeline</span>

              <div className="relative border-l-2 border-slate-200 pl-6 space-y-8">
                {[
                  { step: '01', title: 'Context-Rich Intake', copy: 'Patients book visits with complete symptom histories, medical contexts, and automated reminders.' },
                  { step: '02', title: 'Structured Clinical Consultation', copy: 'Clinicians formulate diagnostic plans, write medical notes, and queue direct specialist referrals.' },
                  { step: '03', title: 'Instant Node Handoff', copy: 'Laboratory tests, radiology scans, and prescription fulfillments are dispatched to network providers in real time.' },
                  { step: '04', title: 'Complete Verification Loop', copy: 'Discharge timelines, results, and medications are cleanly returned to the patient portal, closing the loop.' }
                ].map((item) => (
                  <div key={item.step} className="relative">
                    <span className="absolute -left-[35px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-mono font-bold text-white">
                      {item.step}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Structured Multi-role Platform Sections */}
      <section className="bg-white py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">Unified Nodes</span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Handcrafted consoles for every healthcare discipline.</h2>
            <p className="mt-4 text-sm text-slate-600">
              Generic software forces everyone into the same UI template. Alera implements dedicated dashboards specifically built for the critical functions of each care network role.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {roleCards.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.name} className="rounded-lg border border-slate-200 bg-slate-50/50 p-6 hover:border-slate-400 transition-colors">
                  <div className="inline-flex rounded bg-slate-100 p-2.5 text-slate-700 border border-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-900">{role.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{role.summary}</p>
                  <p className="mt-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-3">{role.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security and Integrity Architecture */}
      <section className="bg-slate-50 py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-lg border border-slate-200 bg-white p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">Information Security</span>
                <h3 className="mt-3 text-2xl font-extrabold text-slate-900">An absolute zero-trust data pipeline.</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Every connection is authenticated. Patient biometrics, prescriptions, and lab records are securely encrypted on rest and in transit. Immutable audit logs track every authorization and access.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {['SOC2 Ready', 'NIST Compliant', 'E2E Cipher Integrity'].map((pill) => (
                    <span key={pill} className="rounded bg-slate-100 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase text-slate-600 border border-slate-200">
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-6 font-mono text-xs text-slate-700 space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                  <span>METRIC</span>
                  <span>VALUE</span>
                </div>
                <div className="flex justify-between">
                  <span>SSL_CIPHER_SUITE</span>
                  <span>ECDHE-RSA-AES256-GCM-SHA384</span>
                </div>
                <div className="flex justify-between">
                  <span>AUDIT_LOG_STRATEGY</span>
                  <span>CRYPTOGRAPHICALLY APPEND-ONLY</span>
                </div>
                <div className="flex justify-between">
                  <span>AUTHENTICATOR_ROLES</span>
                  <span>DOCTOR, PATIENT, ADMIN, LAB, PHARMACY, EMS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Section */}
      <section className="bg-white py-20 text-center">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">Get Started</span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Ready to synchronize your medical network?</h2>
          <p className="mt-4 text-sm text-slate-600">
            Establish a verified, compliant account and launch your custom clinical cockpit immediately.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
              <Link to="/signup">Initialize New Node</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Link to="/login">Access with Identity Provider</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
