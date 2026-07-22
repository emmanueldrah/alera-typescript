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
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

type RoleCard = {
  name: string;
  icon: LucideIcon;
  summary: string;
  detail: string;
  tone: string;
  accent: string;
  glow: string;
};

const roleCards: RoleCard[] = [
  {
    name: 'Patient',
    icon: UserRound,
    summary: 'Book care, review results, and follow every next step in one calm journey.',
    detail: 'Appointments • Prescriptions • Follow-up',
    tone: 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400',
    accent: 'text-cyan-400',
    glow: 'from-cyan-500/10 to-transparent',
  },
  {
    name: 'Clinician',
    icon: Stethoscope,
    summary: 'Open visits with the right context, from history to diagnostics to discharge planning.',
    detail: 'Notes • Diagnostics • Referrals',
    tone: 'bg-violet-950/40 border-violet-500/20 text-violet-400',
    accent: 'text-violet-400',
    glow: 'from-violet-500/10 to-transparent',
  },
  {
    name: 'Hospital',
    icon: Building2,
    summary: 'Coordinate admissions, referrals, and care transitions without handoff friction.',
    detail: 'Handoffs • Operations • Discharge',
    tone: 'bg-indigo-950/40 border-indigo-500/20 text-indigo-400',
    accent: 'text-indigo-400',
    glow: 'from-indigo-500/10 to-transparent',
  },
  {
    name: 'Pharmacy',
    icon: Pill,
    summary: 'Verify prescriptions and keep fulfillment moving without repeated clarification.',
    detail: 'Verification • Fulfillment • Safety',
    tone: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400',
    accent: 'text-emerald-400',
    glow: 'from-emerald-500/10 to-transparent',
  },
  {
    name: 'Laboratory',
    icon: FlaskConical,
    summary: 'Accept orders, upload results, and keep providers and patients aligned in real time.',
    detail: 'Orders • Results • Alerts',
    tone: 'bg-pink-950/40 border-pink-500/20 text-pink-400',
    accent: 'text-pink-400',
    glow: 'from-pink-500/10 to-transparent',
  },
  {
    name: 'Imaging',
    icon: ScanLine,
    summary: 'Move scan requests and images through the care pathway without bottlenecks.',
    detail: 'Scheduling • Imaging • Reporting',
    tone: 'bg-amber-950/40 border-amber-500/20 text-amber-400',
    accent: 'text-amber-400',
    glow: 'from-amber-500/10 to-transparent',
  },
  {
    name: 'Ambulance',
    icon: Ambulance,
    summary: 'Route urgent transfers with patient context and receiving-facility coordination.',
    detail: 'Dispatch • Routing • Live status',
    tone: 'bg-rose-950/40 border-rose-500/20 text-rose-400',
    accent: 'text-rose-400',
    glow: 'from-rose-500/10 to-transparent',
  },
];

const trustPills = ['End-to-end encryption', 'Role-based permissions', 'Audit-ready timelines', 'HIPAA-ready workflows'];

const deploymentSignal = 'Alera Care OS 2026';

const homepageMetrics = [
  {
    title: 'One operating system',
    value: '7 care roles',
    copy: 'Patients, clinicians, hospitals, pharmacies, labs, imaging, and ambulance services share one workspace.',
  },
  {
    title: 'Visible trust',
    value: '24/7 clarity',
    copy: 'Every action is attributed and status changes are instantly synchronized for complete system transparency.',
  },
  {
    title: 'Faster next steps',
    value: '4-step flow',
    copy: 'Book, consult, fulfill, and follow up through a single, visible path without manual intervention.',
  },
];

const journeySteps = [
  {
    title: '1. Book with confidence',
    icon: CalendarClock,
    copy: 'Patients choose the right service, time, and route to care without navigating fragmented channels.',
    glow: 'shadow-[0_0_15px_rgba(34,211,238,0.15)] border-cyan-500/30'
  },
  {
    title: '2. Consult with context',
    icon: Stethoscope,
    copy: 'Doctors see prior notes, medications, diagnostics, and secure communication in one clinical view.',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)] border-violet-500/30'
  },
  {
    title: '3. Fulfill without delay',
    icon: ClipboardCheck,
    copy: 'Pharmacies, labs, and imaging teams receive verified next steps and update the care loop instantly.',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/30'
  },
  {
    title: '4. Follow through calmly',
    icon: HeartPulse,
    copy: 'Patients and caregivers receive reminders, results, and instructions that reduce uncertainty after every visit.',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)] border-rose-500/30'
  },
];

const featureHighlights = [
  { title: 'Care orchestration', copy: 'Track the full journey from booking to follow-up with one shared operating view.', icon: Activity },
  { title: 'Secure conversation', copy: 'Clinical messages, updates, and follow-ups stay permissioned and easy to review.', icon: Mic },
  { title: 'Rapid triage support', copy: 'Emergency response teams can route urgent requests with context instead of hunting for details.', icon: Clock3 },
  { title: 'Human-centered onboarding', copy: 'New patients and providers can start quickly with Google sign-in and role-aware setup.', icon: Sparkles },
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
    document.title = 'Alera | Connected healthcare for patients, clinicians, and care networks';

    setMetaContent(
      'meta[name="description"]',
      'Alera is a connected healthcare ecosystem for patients, doctors, hospitals, pharmacies, labs, imaging centers, and ambulance teams.',
      'name',
    );
    setMetaContent(
      'meta[name="keywords"]',
      'healthcare management software, telemedicine platform, patient appointment booking, hospital workflow software, pharmacy prescription management, lab results platform, imaging center software, ambulance dispatch coordination',
      'name',
    );
    setMetaContent(
      'meta[property="og:title"]',
      'Alera | Connected Healthcare Management Software',
      'property',
    );
    setMetaContent(
      'meta[property="og:description"]',
      'Coordinate appointments, consultations, prescriptions, diagnostics, referrals, and emergency response through one secure healthcare platform.',
      'property',
    );
    setMetaContent(
      'meta[name="twitter:title"]',
      'Alera | Connected Healthcare Management Software',
      'name',
    );
    setMetaContent(
      'meta[name="twitter:description"]',
      'Healthcare management software for patients, doctors, hospitals, pharmacies, labs, imaging centers, and ambulance teams.',
      'name',
    );
  }, []);

  return (
    <div className="overflow-x-hidden bg-[#050709] pb-24 text-slate-100 md:pb-0">

      {/* Cinematic Hero Section */}
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.1),transparent_40%)] border-b border-white/5 py-12 md:py-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />

        {/* Soft volumetric top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">

          {/* Hero Content */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-3xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-950/40 px-4 py-2 text-sm text-teal-400 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-teal-400 animate-pulse" />
              {deploymentSignal} · Cinematic Medical Precision
            </motion.div>

            <motion.h1 variants={fadeUp} className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Alera <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-400">Care OS</span>
              <span className="mt-3 block text-2xl font-light text-slate-400 sm:text-3xl lg:text-4xl">One unified heartbeat for modern health networks.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              A premium, high-fidelity command center connecting patients, clinicians, laboratories, pharmacies, imaging, and ambulance teams on an absolute zero-trust framework.
            </motion.p>

            {/* CTA Group */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-13 rounded-xl bg-teal-500 px-8 text-base font-semibold text-slate-950 hover:bg-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all">
                <Link to="/signup">
                  Launch Command Center
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-13 rounded-xl border-white/10 bg-white/5 px-8 text-base text-slate-300 hover:bg-white/10 hover:text-white backdrop-blur">
                <a href="#experience">
                  Explore Ecosystem
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-2">
              {trustPills.map((pill) => (
                <span key={pill} className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {pill}
                </span>
              ))}
            </motion.div>

            {/* Operational Metrics */}
            <motion.div variants={fadeUp} className="mt-10 grid gap-4 sm:grid-cols-3">
              {homepageMetrics.map((metric) => (
                <div key={metric.title} className="rounded-2xl border border-white/5 bg-slate-950/60 p-5 backdrop-blur-md relative overflow-hidden group hover:border-teal-500/20 transition-all">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-teal-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400">{metric.title}</p>
                  <p className="mt-3 text-3xl font-bold text-white">{metric.value}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{metric.copy}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Living Care Network Graph Component */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="absolute inset-0 bg-teal-500/5 blur-[50px] rounded-full pointer-events-none" />
            <CareNetworkGraph className="shadow-2xl shadow-slate-950" />

            {/* Live Operational Status Card underneath */}
            <div className="mt-4 rounded-2xl border border-white/5 bg-slate-950/80 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">ALERA CORE SECURE TELEMETRY</span>
                </div>
                <span className="text-xs font-semibold text-teal-400">99.99% SYSTEM OPERATIONAL</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Grid of Roles Section */}
      <section id="experience" className="relative bg-[#07090c] py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent_40%)] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-400">Universal Care Orchestration</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Tailored workspaces for every link in the medical chain.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-400">
              Generic dashboards cause critical fatigue. Alera implements role-dedicated command panels built exclusively around the clinical action needed next.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {roleCards.map((role, i) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-2xl border border-white/5 bg-slate-950/60 p-6 backdrop-blur transition-all hover:border-teal-500/20 hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${role.glow} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none`} />
                  <div className={`inline-flex rounded-xl p-3 border ${role.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white group-hover:text-teal-300 transition-colors">{role.name}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">{role.summary}</p>
                  <div className="mt-5 border-t border-white/5 pt-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{role.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cinematic Contrast Highlight Area */}
      <section className="relative bg-[#050709] py-20 sm:py-24 border-t border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(20,184,166,0.05),transparent_40%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-400">Quiet Technological Power</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Built for split-second precision. Zero clutter.</h2>
              <p className="mt-5 text-base leading-relaxed text-slate-400">
                Healthcare is chaotic. The platform you use shouldn't be. Alera uses sub-millisecond data synchronization, strict dark-mode-first contrasts, and predictive actions so medical specialists spend seconds interacting with software, not minutes.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { label: 'Ecosystem Telemetry', desc: 'Real-time state verification across clinical nodes.' },
                  { label: 'Tactical Light Controls', desc: 'Cinematic obsidian modes matched with high-fidelity paper light options.' },
                  { label: 'Frictionless Handoffs', desc: 'Secure encryption keys bridging labs, providers and hospitals.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-400">
                      <BadgeCheck className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {featureHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/5 bg-[#0a0d11] p-6 hover:border-teal-500/25 transition-all group">
                    <div className="inline-flex rounded-xl bg-slate-900 p-3 text-teal-400 border border-white/5 group-hover:bg-teal-500/10 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-white group-hover:text-teal-300 transition-colors">{item.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.copy}</p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Simple Sequential Flow Pathway */}
      <section className="bg-[#07090c] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-400">Engineered Care Sequences</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">The four phases of unified care delivery.</h2>
            <p className="mt-5 text-base leading-relaxed text-slate-400">
              No dead-ends, no disjointed files. Every clinical action connects straight to the next physical step in the pathway.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {journeySteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className={`relative rounded-2xl border border-white/5 bg-[#090b0e] p-6 transition-all hover:scale-[1.02] ${step.glow}`}>
                  <div className="absolute top-4 right-4 text-4xl font-black text-slate-800 pointer-events-none select-none">
                    0{idx + 1}
                  </div>
                  <div className="inline-flex rounded-xl bg-slate-900 p-3 text-teal-400 border border-white/5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">{step.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Assurance section */}
      <section className="bg-[#050709] py-20 sm:py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-3xl border border-white/5 bg-gradient-to-r from-slate-950 via-[#0a0d14] to-slate-950 p-8 text-white sm:p-12 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 blur-[50px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-500/10 blur-[50px] rounded-full pointer-events-none" />

            <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center relative z-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-400">Ecosystem Integrity</p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Military-grade medical security, visible.</h3>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
                  Every user, document, prescription, and dispatch possesses a cryptographically validated signature. Audit trails cannot be altered. Handoffs are protected under multi-layer role validations.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
                <div className="flex items-center gap-3 text-teal-400">
                  <Fingerprint className="h-5 w-5 text-teal-400 animate-pulse" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Zero-Trust Engine</p>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-400 font-mono">
                  ACTIVE CIPHER: AES-GCM-256<br />
                  COMPLIANCE: HIPAA Ready / ISO 27001<br />
                  NODE AUTHENTICITY: VERIFIED
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Conversion Section */}
      <section className="relative bg-[#07090c] px-6 py-20 sm:py-24 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.05),transparent_45%)] pointer-events-none" />
        <div className="mx-auto max-w-5xl rounded-3xl border border-teal-500/20 bg-slate-950/80 p-8 text-center shadow-[0_0_50px_rgba(20,184,166,0.1)] sm:p-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-transparent" />

          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-400">Upgrade to Care OS 2026</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">Reimagine healthcare command.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
            Sign up for modern, beautiful, and secure clinical orchestration. Set up your node and synchronize with doctors, labs, and patients immediately.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-13 rounded-xl bg-teal-500 px-8 text-slate-950 hover:bg-teal-400 font-bold transition-all shadow-[0_0_20px_rgba(20,184,166,0.25)]">
              <Link to="/signup">Create Secure Node</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-13 rounded-xl border-white/10 bg-white/5 px-8 text-white hover:bg-white/10">
              <Link to="/login">Access with Google</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
