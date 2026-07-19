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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

type RoleCard = {
  name: string;
  icon: LucideIcon;
  summary: string;
  detail: string;
  tone: string;
  accent: string;
};

const roleCards: RoleCard[] = [
  {
    name: 'Patient',
    icon: UserRound,
    summary: 'Book care, review results, and follow every next step in one calm journey.',
    detail: 'Appointments • Prescriptions • Follow-up',
    tone: 'bg-cyan-50',
    accent: 'text-cyan-700',
  },
  {
    name: 'Clinician',
    icon: Stethoscope,
    summary: 'Open visits with the right context, from history to diagnostics to discharge planning.',
    detail: 'Notes • Diagnostics • Referrals',
    tone: 'bg-sky-50',
    accent: 'text-sky-700',
  },
  {
    name: 'Hospital',
    icon: Building2,
    summary: 'Coordinate admissions, referrals, and care transitions without handoff friction.',
    detail: 'Handoffs • Operations • Discharge',
    tone: 'bg-indigo-50',
    accent: 'text-indigo-700',
  },
  {
    name: 'Pharmacy',
    icon: Pill,
    summary: 'Verify prescriptions and keep fulfillment moving without repeated clarification.',
    detail: 'Verification • Fulfillment • Safety',
    tone: 'bg-emerald-50',
    accent: 'text-emerald-700',
  },
  {
    name: 'Laboratory',
    icon: FlaskConical,
    summary: 'Accept orders, upload results, and keep providers and patients aligned in real time.',
    detail: 'Orders • Results • Alerts',
    tone: 'bg-violet-50',
    accent: 'text-violet-700',
  },
  {
    name: 'Imaging',
    icon: ScanLine,
    summary: 'Move scan requests and images through the care pathway without bottlenecks.',
    detail: 'Scheduling • Imaging • Reporting',
    tone: 'bg-amber-50',
    accent: 'text-amber-700',
  },
  {
    name: 'Ambulance',
    icon: Ambulance,
    summary: 'Route urgent transfers with patient context and receiving-facility coordination.',
    detail: 'Dispatch • Routing • Live status',
    tone: 'bg-rose-50',
    accent: 'text-rose-700',
  },
];

const trustPills = ['End-to-end encryption', 'Role-based permissions', 'Audit-ready timelines', 'HIPAA-ready workflows'];

const homepageMetrics = [
  {
    title: 'One operating system',
    value: '7 care roles',
    copy: 'Patients, clinicians, hospitals, pharmacies, labs, imaging teams, and ambulance services share one workspace.',
  },
  {
    title: 'Visible trust',
    value: '24/7 clarity',
    copy: 'Every action is attributed and every status change is easier to understand for patients and care teams.',
  },
  {
    title: 'Faster next steps',
    value: '4-step flow',
    copy: 'Book, consult, fulfill, and follow up through a single, visible path.',
  },
];

const journeySteps = [
  {
    title: '1. Book with confidence',
    icon: CalendarClock,
    copy: 'Patients choose the right service, time, and route to care without navigating fragmented channels.',
  },
  {
    title: '2. Consult with context',
    icon: Stethoscope,
    copy: 'Doctors see prior notes, medications, diagnostics, and secure communication in one clinical view.',
  },
  {
    title: '3. Fulfill without delay',
    icon: ClipboardCheck,
    copy: 'Pharmacies, labs, and imaging teams receive verified next steps and update the care loop instantly.',
  },
  {
    title: '4. Follow through calmly',
    icon: HeartPulse,
    copy: 'Patients and caregivers receive reminders, results, and instructions that reduce uncertainty after every visit.',
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
    <div className="overflow-x-hidden bg-[#f4f7fb] pb-24 text-slate-900 md:pb-0">
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(135deg,_#071926_0%,_#0b2940_45%,_#103a3b_100%)] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,_transparent_1px),linear-gradient(90deg,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[size:72px_72px] opacity-25" />
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[minmax(0,1.05fr)_440px] lg:items-center lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-3xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-emerald-200" />
              A refined healthcare ecosystem for patients, clinicians, and operators
            </motion.div>

            <motion.h1 variants={fadeUp} className="mt-6 text-4xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              Calm care coordination
              <span className="mt-2 block text-cyan-200">for every part of the health journey.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              Alera brings booking, care delivery, diagnostics, pharmacy flow, and emergency coordination together in one secure platform designed to reduce anxiety and speed up action.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-13 rounded-full bg-emerald-300 px-8 text-base font-semibold text-slate-950 hover:bg-emerald-200">
                <Link to="/signup">
                  Start secure care coordination
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-13 rounded-full border-white/20 bg-white/10 px-8 text-base text-white hover:bg-white/15 hover:text-white">
                <a href="#experience">
                  Explore the experience
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
              {trustPills.map((pill) => (
                <span key={pill} className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                  {pill}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 grid gap-4 sm:grid-cols-3">
              {homepageMetrics.map((metric) => (
                <div key={metric.title} className="rounded-[1.3rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">{metric.title}</p>
                  <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{metric.copy}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative z-10 rounded-[2rem] border border-white/12 bg-white/10 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="rounded-[1.4rem] bg-white p-5 text-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Live care view</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">A coordinated care timeline</h2>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <HeartPulse className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-cyan-100 p-2.5 text-cyan-700"><CalendarClock className="h-4 w-4" /></div>
                    <div>
                      <p className="font-semibold text-slate-900">Appointment confirmed</p>
                      <p className="mt-1 text-sm text-slate-600">Cardiology follow-up created for 14:30 with pre-visit instructions attached.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-sky-100 p-2.5 text-sky-700"><Video className="h-4 w-4" /></div>
                    <div>
                      <p className="font-semibold text-slate-900">Clinician workspace ready</p>
                      <p className="mt-1 text-sm text-slate-600">History, medication list, and recent labs are already surfaced for review.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700"><Pill className="h-4 w-4" /></div>
                    <div>
                      <p className="font-semibold text-slate-900">Pharmacy update queued</p>
                      <p className="mt-1 text-sm text-slate-600">Verified prescription is ready for fulfillment and follow-up messaging.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[1.1rem] border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    <p className="font-semibold text-emerald-950">Secure, role-aware handoffs</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-900/80">Each team sees the next action clearly without exposing unrelated data.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="experience" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Every role, one coherent experience</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Designed so people understand where they are and what happens next.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">Alera removes the noise from healthcare software. It gives each role a tailored view, while preserving the shared logic of the care journey.</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {roleCards.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.name} className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
                  <div className={`inline-flex rounded-2xl p-3 ${role.tone} ${role.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{role.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{role.summary}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{role.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Why it feels different</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">The product is built around calm decision-making instead of clutter.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">Healthcare software should reduce friction, not create another layer of operational complexity. Alera is shaped to feel clear, reassuring, and fast for both patients and providers.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {featureHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.35rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,_#f7fcff_0%,_#eef8f4_100%)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Designed for the real care flow</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">A simple operational story that mirrors how care actually moves.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">The strongest interface is not overloaded with widgets. It gives teams a clear sequence: book, consult, fulfill, and follow up.</p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {journeySteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-[1.35rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex rounded-2xl bg-sky-50 p-3 text-sky-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{step.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,_#082032_0%,_#0f3e44_100%)] p-8 text-white sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">Trust and safety</p>
                <h3 className="mt-3 text-3xl font-bold tracking-tight">Security should feel present, visible, and reassuring.</h3>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">Alera makes encryption, permissions, and auditability visible at the moment teams need reassurance most, instead of hiding them in a support page.</p>
              </div>

              <div className="rounded-[1.35rem] bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center gap-3 text-emerald-200">
                  <BadgeCheck className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]">Security signposts</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-200">Approved compliance language, permissions, and audit references can appear here as the platform matures.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {['End-to-end encryption', 'Role-aware communication', 'Clear audit trails'].map((item) => (
              <div key={item} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-lg font-semibold text-slate-950">{item}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">Trust signals are folded directly into the experience so they feel natural rather than decorative.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2.3rem] border border-slate-200 bg-[linear-gradient(135deg,_#f8fcff_0%,_#edf8f4_100%)] p-8 text-center shadow-[0_24px_80px_-55px_rgba(15,23,42,0.4)] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Move from care coordination to action</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Create a role-based account and begin shaping a calmer healthcare experience.</h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">Whether you are a patient, clinician, hospital operator, or care team, Alera helps people find the right path without friction.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-13 rounded-full bg-slate-950 px-8 text-white hover:bg-slate-900">
              <Link to="/signup">Create your account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-13 rounded-full border-slate-300 bg-white px-8 text-slate-900 hover:bg-slate-50">
              <Link to="/login">Continue with Google</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
