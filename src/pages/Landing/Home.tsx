import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Ambulance,
  Building2,
  FlaskConical,
  Pill,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CareNetworkGraph from '@/components/CareNetworkGraph';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
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
    summary: 'Direct routes to clinical scheduling, secure prescription receipts, and immediate laboratory recordings.',
    detail: 'Intake Protocols • Verification Ledger • Secure Access',
  },
  {
    name: 'Clinician Workspace',
    icon: Stethoscope,
    summary: 'Real-time patient charts, diagnostics orders, and certified specialist referrals in a clean command interface.',
    detail: 'EMR Records • Diagnostic Routing • Direct Messaging',
  },
  {
    name: 'Hospital Management',
    icon: Building2,
    summary: 'Coordinate multi-department rosters, regional emergency transfers, and institutional capacity in real-time.',
    detail: 'Intake Control • Resource Mapping • Flow Telemetry',
  },
  {
    name: 'Pharmacy Console',
    icon: Pill,
    summary: 'Electronic prescription matching, secure drug audit logs, and automatic inventory synchronisation.',
    detail: 'Safety Margins • Script Ledger • Compliance Verification',
  },
  {
    name: 'Laboratory Hub',
    icon: FlaskConical,
    summary: 'Digital sample tracking, automated accession numbers, and instant results distribution to network doctors.',
    detail: 'Assay Queues • Accession Logs • Secure Sign-off',
  },
  {
    name: 'Imaging Deck',
    icon: ScanLine,
    summary: 'Technical DICOM integration, structured schedules, and immediate findings distribution to referring clinics.',
    detail: 'DICOM Integration • Schedule Telemetry • Case Sign-off',
  },
  {
    name: 'Emergency Dispatch',
    icon: Ambulance,
    summary: 'Triage prioritization, ambulance coordinates, and direct trauma department alerts on a single screen.',
    detail: 'GPS Telemetry • Triage Priority • Intake Dispatch',
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
    <div className="bg-white text-slate-900 pb-24 md:pb-0 font-sans">

      {/* Editorial Structural Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16 md:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

            {/* Structured Minimal Hero Content */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded border border-slate-300 bg-slate-50 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-800" />
                Infrastructure Standard · 2026
              </motion.div>

              <motion.h1 variants={fadeUp} className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl leading-[1.15]">
                Alera. The secure operating system for integrated clinical networks.
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 text-sm leading-relaxed text-slate-600">
                Alera standardizes communications across patients, providers, dispatches, pharmacies, and labs in one synchronized operational layer. Zero redundant registries. Fully auditable. Engineered with mathematical rigor.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="rounded bg-slate-950 px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-slate-900 transition-colors">
                  <Link to="/signup">
                    Initialize Core OS
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded border border-slate-300 bg-white px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50">
                  <a href="#system-pipeline">
                    System Blueprint
                  </a>
                </Button>
              </motion.div>

              {/* Monospace Credentials */}
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4 border-t border-slate-200 pt-8 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <span>HIPAA compliant</span>
                <span className="text-slate-300">/</span>
                <span>ISO 27001 standard</span>
                <span className="text-slate-300">/</span>
                <span>AES-256 cipher integrity</span>
              </motion.div>
            </motion.div>

            {/* Technical Node Specification Schema */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CareNetworkGraph className="border border-slate-300 shadow-none rounded" />

              <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-[10px] font-mono text-slate-600">
                <div className="flex justify-between items-center font-bold">
                  <span>HEALTH NODE STATUS: STABLE</span>
                  <span>SYSTEM LATENCY: &lt; 15ms</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Structured Split Layout: Context narrative & Pipeline */}
      <section id="system-pipeline" className="bg-slate-50 py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

            {/* Editorial left panel */}
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">System Context</span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl leading-snug">
                Healthcare integration has been historically fragmented. We built an absolute network layer.
              </h2>
              <p className="mt-6 text-xs leading-relaxed text-slate-600">
                Modern medical portals operate inside isolation. Primary practitioners lack pharmacy coordinates; diagnostics systems depend on physical uploads; hospital dispatches communicate in analogue waves.
              </p>
              <p className="mt-4 text-xs leading-relaxed text-slate-600">
                Alera consolidates this fragmentation. Every patient timeline, medical consult, prescription receipt, and laboratory result flows through a cryptographic ledger. This guarantees constant coordinate updates, complete history availability, and error-free clinic execution.
              </p>
            </div>

            {/* Schematic vertical timeline pipeline */}
            <div className="space-y-6">
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">Operational Care Path</span>

              <div className="relative border-l border-slate-300 pl-6 space-y-8">
                {[
                  { step: '01', title: 'Structured Intake', copy: 'Patients initialize consults loaded with precise histories, verified consents, and immediate reminders.' },
                  { step: '02', title: 'Clinical Integration', copy: 'Clinicians map symptoms, register allergy parameters, and dispatch secure referrals instantly.' },
                  { step: '03', title: 'Decentralized Handoff', copy: 'Laboratories, imaging nodes, and connected pharmacies execute orders with zero manual data duplications.' },
                  { step: '04', title: 'Operational Loop Closure', copy: 'Lab findings and medications securely return to the patient record, completing the cycle.' }
                ].map((item) => (
                  <div key={item.step} className="relative">
                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded border border-slate-300 bg-slate-100 text-[9px] font-mono font-bold text-slate-800">
                      {item.step}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Flat Grid Platform Sections */}
      <section className="bg-white py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">System Nodes</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">Intentionally designed consoles for every medical node.</h2>
            <p className="mt-4 text-xs text-slate-600">
              Healthcare roles are structurally different. Alera implements specific interfaces built to matching user capabilities and high-priority workflows.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roleCards.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.name} className="rounded border border-slate-200 bg-slate-50/50 p-6 transition-colors hover:border-slate-400">
                  <div className="inline-flex rounded border border-slate-300 bg-white p-2 text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 text-xs font-bold text-slate-950">{role.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{role.summary}</p>
                  <p className="mt-4 text-[9px] font-mono text-slate-400 uppercase tracking-wider border-t border-slate-200 pt-3">{role.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Architecture Box */}
      <section className="bg-slate-50 py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded border border-slate-300 bg-white p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">Information Security Standards</span>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">A strict zero-trust data hierarchy.</h3>
                <p className="mt-4 text-xs leading-relaxed text-slate-600">
                  Every connection is cryptographically audited. Patient biometric indexes, medication charts, and referral lines are completely encrypted. Append-only system logs audit every administrative query.
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {['SOC2 Audited', 'NIST NIST-800', 'AES-256 Encryption'].map((pill) => (
                    <span key={pill} className="rounded border border-slate-300 bg-slate-50 px-2.5 py-1 text-[9px] font-mono font-bold uppercase text-slate-600">
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-6 font-mono text-[10px] text-slate-700 space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold text-slate-800">
                  <span>TECHNICAL MATRIX</span>
                  <span>SPECIFICATION</span>
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
                  <span>PATIENT, DOCTOR, ADMIN, LAB, PHARMACY, EMS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Conversion Panel */}
      <section className="bg-white py-20 text-center">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">OS Deployment</span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">Unify your medical network coordinates today.</h2>
          <p className="mt-4 text-xs text-slate-600">
            Establish a verified, compliant profile and connect to your dedicated clinical cockpit.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded bg-slate-950 px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-slate-900 transition-colors">
              <Link to="/signup">Initialize New Node</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded border border-slate-300 bg-white px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50">
              <Link to="/login">Access with Identity Provider</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
