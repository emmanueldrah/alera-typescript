import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Ambulance,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  FlaskConical,
  Globe,
  HeartPulse,
  LockKeyhole,
  Pill,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  tone: string;
  accent: string;
};

const roleCards: RoleCard[] = [
  {
    name: 'Patient',
    icon: UserRound,
    summary: 'Book visits, review results, receive prescriptions, and stay informed without repeating your story.',
    tone: 'bg-cyan-50',
    accent: 'text-cyan-700',
  },
  {
    name: 'Doctor',
    icon: Stethoscope,
    summary: 'Consult with context, review history fast, and coordinate next steps from one workspace.',
    tone: 'bg-sky-50',
    accent: 'text-sky-700',
  },
  {
    name: 'Hospital',
    icon: Building2,
    summary: 'Standardize handoffs across departments, admissions, follow-up, and referrals.',
    tone: 'bg-indigo-50',
    accent: 'text-indigo-700',
  },
  {
    name: 'Pharmacy',
    icon: Pill,
    summary: 'Receive verified orders, track fulfillment, and reduce prescription call-backs.',
    tone: 'bg-emerald-50',
    accent: 'text-emerald-700',
  },
  {
    name: 'Lab',
    icon: FlaskConical,
    summary: 'Accept requests, post results securely, and keep providers and patients in sync.',
    tone: 'bg-violet-50',
    accent: 'text-violet-700',
  },
  {
    name: 'Imaging Center',
    icon: ScanLine,
    summary: 'Move scan requests and results faster so treatment decisions are not delayed.',
    tone: 'bg-amber-50',
    accent: 'text-amber-700',
  },
  {
    name: 'Ambulance',
    icon: Ambulance,
    summary: 'Share live dispatch updates and route urgent cases to the right facility quickly.',
    tone: 'bg-rose-50',
    accent: 'text-rose-700',
  },
];

const trustPills = ['AES-256 encryption', 'HIPAA-ready workflows', 'Role-based access control', 'Audit-ready activity trails'];

const homepageMetrics = [
  {
    title: 'One connected journey',
    value: '7 care roles',
    copy: 'Patients, clinicians, hospitals, pharmacies, labs, imaging centers, and ambulance teams work from one coordinated system.',
  },
  {
    title: 'Security by design',
    value: 'AES-256',
    copy: 'Sensitive records stay protected in transit and at rest with healthcare-grade access controls.',
  },
  {
    title: 'Clearer action',
    value: '4-step flow',
    copy: 'Book, consult, fulfill, and follow up through one visible care pathway.',
  },
];

const journeySteps = [
  {
    title: '1. Book care',
    icon: CalendarClock,
    copy: 'Patients find the right service, choose a time, and receive confirmation without long call chains.',
  },
  {
    title: '2. Consult with context',
    icon: Stethoscope,
    copy: 'Doctors open appointments with charts, prior notes, imaging, and medication history already available.',
  },
  {
    title: '3. Fulfill next steps',
    icon: ClipboardCheck,
    copy: 'Pharmacies, labs, imaging teams, and hospitals receive the right requests without duplicate handoffs.',
  },
  {
    title: '4. Follow up confidently',
    icon: HeartPulse,
    copy: 'Patients and care teams stay aligned with results, reminders, status updates, and care instructions.',
  },
];

const roleFlows = {
  patient: {
    eyebrow: 'Patient demo',
    heading: 'From searching for care to getting follow-up instructions',
    summary:
      'The patient journey is reduced to a few clear steps, so people book care, see updates, and know what happens next without chasing multiple offices.',
    steps: [
      'Search for a doctor, lab, imaging center, or hospital service and book in minutes.',
      'Receive confirmations, reminders, and pre-visit instructions in one place.',
      'Join a consultation or attend in person with your history already available to the clinician.',
      'See prescriptions, test orders, and follow-up tasks after the visit without extra calls.',
    ],
    signalLabel: 'What the patient sees',
    signalCopy: 'Appointment status, provider instructions, prescriptions, results, and secure messages in one calm interface.',
  },
  doctor: {
    eyebrow: 'Doctor demo',
    heading: 'Consult faster with history, diagnostics, and care coordination in view',
    summary:
      'Clinicians move from intake to action without opening disconnected tools, reducing context switching and delays in decision-making.',
    steps: [
      'Open a patient visit with medical history, prior notes, allergies, and current medications already visible.',
      'Send lab, imaging, referral, and prescription orders from the same workflow.',
      'Launch video consultations when remote care is needed and document the encounter in context.',
      'Track whether downstream teams completed the requested actions and close the loop on follow-up.',
    ],
    signalLabel: 'What the clinician sees',
    signalCopy: 'A unified visit workspace with clinical context, live order status, and role-based communication.',
  },
  pharmacy: {
    eyebrow: 'Pharmacy demo',
    heading: 'Move prescriptions from provider approval to patient fulfillment with less friction',
    summary:
      'Pharmacy teams can verify incoming prescriptions, manage status, and confirm fulfillment without repeated clarification calls.',
    steps: [
      'Receive a verified prescription tied to the patient and prescribing clinician.',
      'Check medication details and fulfillment status from a clear queue.',
      'Update the care team when medication is ready, dispensed, delayed, or requires clarification.',
      'Keep a clean audit trail that supports safer medication coordination and better patient follow-through.',
    ],
    signalLabel: 'What the pharmacy sees',
    signalCopy: 'Verified orders, fulfillment tracking, communication logs, and a safer dispensing workflow.',
  },
};

const networkSupport = [
  {
    title: 'Hospital operations',
    icon: Building2,
    copy: 'Keep referrals, admissions, and discharge follow-up visible across departments instead of buried in separate systems.',
  },
  {
    title: 'Laboratory coordination',
    icon: FlaskConical,
    copy: 'Turn test requests into secure results delivery that reaches both providers and patients without manual forwarding.',
  },
  {
    title: 'Imaging workflows',
    icon: ScanLine,
    copy: 'Speed up scan scheduling and result sharing so clinical decisions are not blocked by missing images or reports.',
  },
  {
    title: 'Ambulance routing',
    icon: Ambulance,
    copy: 'Share dispatch status and incoming patient context with receiving facilities when urgent transfers matter most.',
  },
];

const proofModules = [
  {
    title: 'Story block for patients',
    copy: 'Explain how a patient books care, receives a prescription, gets lab work done, and completes follow-up without repeating the same information.',
  },
  {
    title: 'Story block for clinicians',
    copy: 'Show how a doctor consults, orders tests, and sees downstream status without leaving the encounter workflow.',
  },
  {
    title: 'Story block for operations leaders',
    copy: 'Highlight fewer manual handoffs, clearer referral tracking, and more accountable coordination across the care network.',
  },
];

const complianceBadges = [
  { title: 'AES-256 encrypted', copy: 'Healthcare records and operational data are protected with strong encryption controls.' },
  { title: 'HIPAA-ready controls', copy: 'Role-based access, audit visibility, and secure communication support regulated care workflows.' },
  { title: 'Permissioned by role', copy: 'Patients, doctors, hospitals, pharmacies, labs, imaging teams, and ambulance staff each see only what they need.' },
];

const blogTopics = [
  'How Alera streamlines patient care from booking to follow-up',
  'The future of telemedicine for hospitals and outpatient clinics',
  'How pharmacies and clinicians reduce prescription delays with shared workflows',
];

const onboardingOptions = [
  {
    title: 'Continue with Google',
    copy: 'For faster onboarding, care teams and patients can start with Google sign-in and finish the role details Alera needs.',
    cta: 'Use Google sign-in',
    href: '/login',
    tone: 'border-emerald-200 bg-emerald-50',
  },
  {
    title: 'Create a role-based account',
    copy: 'Choose patient, doctor, hospital, pharmacy, laboratory, imaging center, or ambulance access during sign-up.',
    cta: 'Create your account',
    href: '/signup',
    tone: 'border-sky-200 bg-sky-50',
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
    document.head.appendChild(element);
  }

  element.setAttribute('content', value);
};

const Home = () => {
  useEffect(() => {
    document.title = 'Alera | Healthcare Management Software for Patients, Doctors, Hospitals, Labs and Pharmacies';

    setMetaContent(
      'meta[name="description"]',
      'Alera is healthcare management software for patients, doctors, hospitals, pharmacies, labs, imaging centers, and ambulance teams. Book appointments, coordinate care, manage prescriptions, and deliver secure telemedicine in one connected platform.',
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
    <div className="overflow-x-hidden bg-[#f4f8fb] pb-28 font-body text-slate-900 md:pb-0">
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#082032_0%,_#0d2b3f_48%,_#10393b_100%)] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,_transparent_1px),linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:72px_72px] opacity-30" />
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-14 px-6 py-14 lg:grid-cols-[minmax(0,1.05fr)_440px] lg:items-center lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-3xl">
            <motion.div variants={fadeUp} className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-emerald-200" />
              Healthcare management software for connected care delivery
            </motion.div>

            <motion.h1 variants={fadeUp} className="mt-6 text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Make every healthcare handoff
              <span className="block text-cyan-200">clear, secure, and faster to act on.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              Alera helps patients, doctors, hospitals, pharmacies, labs, imaging centers, and ambulance teams coordinate appointments, consultations, prescriptions, diagnostics, and follow-up from one trusted healthcare platform.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-14 rounded-full bg-emerald-300 px-8 text-base text-slate-950 hover:bg-emerald-200">
                <Link to="/signup">
                  Start secure care coordination
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-white/20 bg-white/5 px-8 text-base text-white hover:bg-white/10 hover:text-white">
                <a href="#guided-demo">
                  See the role-based demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
              {trustPills.map((pill) => (
                <span key={pill} className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                  {pill}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 grid gap-4 sm:grid-cols-3">
              {homepageMetrics.map((metric) => (
                <div key={metric.title} className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">{metric.title}</p>
                  <p className="mt-3 text-3xl font-bold">{metric.value}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{metric.copy}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: 'easeOut' }}
            className="relative z-10 rounded-[2rem] border border-white/12 bg-white/10 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl"
          >
            <div className="rounded-[1.5rem] bg-white p-5 text-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Homepage wireframe</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">A guided care journey instead of a text wall</h2>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <HeartPulse className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Patient books a visit</p>
                      <p className="text-sm text-slate-600">Appointment slot selected, confirmation sent, pre-visit details shared.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Doctor consults with context</p>
                      <p className="text-sm text-slate-600">History, notes, orders, and telemedicine tools stay in one clinical workspace.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Pharmacy fulfills safely</p>
                      <p className="text-sm text-slate-600">Verified prescription received, status updated, patient follow-through supported.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    <p className="font-semibold text-emerald-900">Trust module</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-900/80">
                      Surface encryption, compliance, and role-based permissions where decision-makers actually see them.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="roles" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Role-based navigation</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Let every visitor recognize where they fit within seconds
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The homepage should not ask healthcare teams to decode generic product language. It should immediately show how Alera supports each role in the care network.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {roleCards.map((role) => {
              const Icon = role.icon;
              return (
                <motion.div key={role.name} variants={fadeUp} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
                  <div className={`inline-flex rounded-2xl p-3 ${role.tone} ${role.accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">{role.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{role.summary}</p>
                  <a href="#guided-demo" className="mt-5 inline-flex items-center text-sm font-semibold text-sky-700 hover:text-sky-800">
                    Explore this workflow
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section id="guided-demo" className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Guided demos</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Replace long paragraphs with role-based product walkthroughs
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Visitors should be able to follow exactly how patients book, doctors consult, and pharmacies fulfill care tasks. This is where the homepage becomes persuasive, not just descriptive.
              </p>
            </div>

            <Tabs defaultValue="patient" className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-55px_rgba(15,23,42,0.45)] sm:p-6">
              <TabsList className="grid h-auto grid-cols-3 rounded-[1.25rem] bg-slate-100 p-1">
                <TabsTrigger value="patient" className="rounded-[1rem] py-3 data-[state=active]:bg-white">Patients</TabsTrigger>
                <TabsTrigger value="doctor" className="rounded-[1rem] py-3 data-[state=active]:bg-white">Doctors</TabsTrigger>
                <TabsTrigger value="pharmacy" className="rounded-[1rem] py-3 data-[state=active]:bg-white">Pharmacies</TabsTrigger>
              </TabsList>

              {Object.entries(roleFlows).map(([key, flow]) => (
                <TabsContent key={key} value={key} className="mt-6">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">{flow.eyebrow}</p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{flow.heading}</h3>
                      <p className="mt-4 text-base leading-7 text-slate-600">{flow.summary}</p>

                      <div className="mt-6 space-y-3">
                        {flow.steps.map((step, index) => (
                          <div key={step} className="flex gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                              {index + 1}
                            </div>
                            <p className="text-sm leading-6 text-slate-700">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,_#082032_0%,_#10393b_100%)] p-5 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">{flow.signalLabel}</p>
                      <p className="mt-4 text-lg font-semibold">{flow.signalCopy}</p>
                      <div className="mt-6 space-y-3">
                        <div className="rounded-2xl bg-white/10 p-4">
                          <p className="text-sm font-semibold">Clear status signals</p>
                          <p className="mt-2 text-sm leading-6 text-slate-200">Confirmed, in consultation, awaiting lab, ready for pickup, and follow-up due.</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4">
                          <p className="text-sm font-semibold">Secure action trail</p>
                          <p className="mt-2 text-sm leading-6 text-slate-200">Every update stays attributable, permissioned, and easier to audit.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {networkSupport.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
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
      </section>

      <section className="bg-[linear-gradient(180deg,_#f7fcff_0%,_#eef8f4_100%)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Step-by-step care flow</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              A homepage story that mirrors how healthcare actually moves
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The strongest structure is a simple operational narrative: book care, consult, fulfill, and follow up. It is easier to scan, easier to trust, and easier to remember on mobile.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {journeySteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="inline-flex rounded-2xl bg-sky-50 p-3 text-sky-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{step.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Faster onboarding</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Give teams a secure path to start with Google sign-in
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Alera now supports Google sign-in on the live login and sign-up flows. Patients can move faster, while provider roles still complete the license and verification details required for secure healthcare access.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                <Globe className="h-4 w-4 text-emerald-700" />
                Google onboarding is available directly from the authentication screens
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {onboardingOptions.map((option) => (
                <div key={option.title} className={`rounded-[1.75rem] border p-6 shadow-sm ${option.tone}`}>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Entry option</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">{option.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{option.copy}</p>
                  <Button asChild size="lg" className="mt-6 h-12 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-900">
                    <Link to={option.href}>
                      {option.cta}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Trust-building content</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Publish proof in concise modules, not dense generic claims
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                This area should carry your approved testimonials, case studies, and outcomes once they are available. Until then, structure the section so it is ready for real evidence instead of filler copy.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {proofModules.map((module) => (
                <div key={module.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Case study slot</p>
                  <h3 className="mt-3 text-lg font-semibold text-slate-950">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{module.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-[2rem] bg-[linear-gradient(135deg,_#082032_0%,_#0f3e44_100%)] p-8 text-white sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">Security and compliance section</p>
                <h3 className="mt-3 text-3xl font-bold tracking-tight">Show trust signals where healthcare buyers look for them</h3>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                  Security should not be buried in the footer. Alera can position encryption, HIPAA-ready workflows, and role-based access controls as visible reasons to trust the platform.
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center gap-3 text-emerald-200">
                  <BadgeCheck className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]">Certification badge zone</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-200">
                  Add approved compliance badges, audit references, or security attestations here once legal and security review is complete.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {complianceBadges.map((badge) => (
                <div key={badge.title} className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                  <p className="text-lg font-semibold">{badge.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{badge.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">SEO and content strategy</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Support discovery with healthcare-specific language and a content engine
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                The homepage now uses search-friendly phrasing around healthcare management software, telemedicine, appointment booking, hospital workflows, prescription management, diagnostics, and care coordination.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {blogTopics.map((topic) => (
                <div key={topic} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Suggested article</p>
                  <h3 className="mt-3 text-lg font-semibold text-slate-950">{topic}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Use this topic to attract search traffic while explaining how connected care workflows improve the patient and provider experience.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-slate-200 bg-[linear-gradient(135deg,_#f7fcff_0%,_#eef8f4_100%)] p-8 text-center shadow-[0_24px_80px_-55px_rgba(15,23,42,0.4)] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Primary conversion block</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Bring booking, consultation, fulfillment, and follow-up into one healthcare platform
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            The homepage should close with a direct decision: create a role-based account, continue with Google sign-in, or review the guided demo first. Both primary paths remain visible on desktop and mobile.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 rounded-full bg-slate-950 px-8 text-white hover:bg-slate-900">
              <Link to="/signup">Create your Alera account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-slate-300 bg-white px-8 text-slate-900 hover:bg-slate-50">
              <Link to="/login">Continue with Google</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-slate-300 bg-white px-8 text-slate-900 hover:bg-slate-50">
              <a href="#guided-demo">Review the guided demo</a>
            </Button>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_32px_-18px_rgba(15,23,42,0.45)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Button asChild className="h-12 flex-1 rounded-full bg-slate-950 text-white hover:bg-slate-900">
            <Link to="/signup">Start now</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 flex-1 rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
            <Link to="/login">Google sign-in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
