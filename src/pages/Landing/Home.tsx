import { Link } from 'react-router-dom';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  ArrowRight, LockKeyhole, Zap,
  Ambulance, FlaskConical, ScanLine, Pill, Building2,
  Stethoscope, Users, Video, ShieldCheck, MessageSquareText,
  CalendarDays, HeartPulse, ChevronRight, Activity, MapPin, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const ecosystemRoles = [
  { icon: Stethoscope, label: 'Doctors', color: 'text-sky-600', bg: 'bg-sky-50', hover: 'hover:bg-sky-100 hover:ring-sky-200' },
  { icon: Building2, label: 'Hospitals', color: 'text-indigo-600', bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100 hover:ring-indigo-200' },
  { icon: Pill, label: 'Pharmacies', color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100 hover:ring-emerald-200' },
  { icon: FlaskConical, label: 'Labs', color: 'text-violet-600', bg: 'bg-violet-50', hover: 'hover:bg-violet-100 hover:ring-violet-200' },
  { icon: ScanLine, label: 'Imaging', color: 'text-cyan-600', bg: 'bg-cyan-50', hover: 'hover:bg-cyan-100 hover:ring-cyan-200' },
  { icon: Ambulance, label: 'Ambulance', color: 'text-rose-600', bg: 'bg-rose-50', hover: 'hover:bg-rose-100 hover:ring-rose-200' },
  { icon: Users, label: 'Patients', color: 'text-teal-600', bg: 'bg-teal-50', hover: 'hover:bg-teal-100 hover:ring-teal-200' },
];

const liveEvents = [
  { text: 'Prescription verified by PharmaCare', icon: Pill, color: 'bg-emerald-500/10 text-emerald-600', iconBg: 'bg-emerald-100' },
  { text: 'Lab result ready: Complete Blood Count', icon: FlaskConical, color: 'bg-violet-500/10 text-violet-600', iconBg: 'bg-violet-100' },
  { text: 'Dispatcher en route to Victoria Island', icon: Ambulance, color: 'bg-rose-500/10 text-rose-600', iconBg: 'bg-rose-100' },
  { text: 'Telemedicine call started with Dr. Ama', icon: Video, color: 'bg-sky-500/10 text-sky-600', iconBg: 'bg-sky-100' },
  { text: 'New MRI scan uploaded by Radiology', icon: ScanLine, color: 'bg-cyan-500/10 text-cyan-600', iconBg: 'bg-cyan-100' },
];

const LiveActivityTicker = () => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % liveEvents.length), 3500);
    return () => clearInterval(timer);
  }, []);
  const event = liveEvents[current];
  const Icon = event.icon;
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white" style={{ minHeight: 48 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="flex flex-1 items-center gap-3 px-3 py-2.5 shadow-sm"
        >
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${event.iconBg} ${event.color}`}>
             <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-slate-700 truncate">{event.text}</span>
          <span className="relative ml-auto flex h-2 w-2 shrink-0">
             <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const STATS = [
  { label: 'Platform Uptime', value: '99.9%', icon: Activity },
  { label: 'Ecosystem Roles', value: '8 Connected', icon: Users },
  { label: 'Data Security', value: 'AES-256', icon: LockKeyhole },
]

const heroSignals = [
  { label: 'Care teams online', value: '148', icon: Users, color: 'bg-emerald-400 text-slate-950' },
  { label: 'Referrals in motion', value: '32', icon: ArrowRight, color: 'bg-sky-400 text-slate-950' },
  { label: 'Emergency lanes', value: '6', icon: MapPin, color: 'bg-amber-300 text-slate-950' },
];

const careJourney = [
  { label: 'Book', icon: CalendarDays, copy: 'Patients can book care fast without long calls or delays.' },
  { label: 'Consult', icon: Stethoscope, copy: 'Doctors can see records, notes, and history in one place.' },
  { label: 'Fulfill', icon: Pill, copy: 'Pharmacies, labs, imaging, and emergency teams get updates right away.' },
  { label: 'Follow up', icon: HeartPulse, copy: 'Results, reminders, and care plans stay connected after the visit.' },
];

const launchHighlights = [
  {
    title: 'Everyone stays on the same page',
    copy: 'Doctors, labs, imaging teams, and pharmacies can follow the same patient journey instead of working in separate systems.',
    icon: MessageSquareText,
    accent: 'from-sky-500/20 to-cyan-400/10',
  },
  {
    title: 'See what is happening live',
    copy: 'Teams can track appointments, results, prescriptions, and urgent cases without chasing updates by hand.',
    icon: ShieldCheck,
    accent: 'from-emerald-500/20 to-teal-400/10',
  },
];

const trustRibbon = [
  'Right access for each user',
  'Live updates across care teams',
  'Built-in tracking and safety checks',
];

const decisionTriggers = [
  {
    title: 'Stop wasting time',
    copy: 'No more chasing lab results, making extra calls, or using too many tools for one patient journey.',
    accent: 'border-sky-100 bg-sky-50/70',
  },
  {
    title: 'Bring every team together',
    copy: 'Patients, doctors, pharmacies, labs, hospitals, imaging centers, and ambulance teams can work in one simple flow.',
    accent: 'border-emerald-100 bg-emerald-50/70',
  },
  {
    title: 'Make people want in',
    copy: 'The page should make visitors feel this is the tool they have been missing, not just another app to read about.',
    accent: 'border-violet-100 bg-violet-50/70',
  },
];

const proofMoments = [
  'Faster referrals between care teams',
  'Better follow-up after each visit',
  'Clearer view for hospitals and larger teams',
  'Safer updates for prescriptions, tests, and scans',
];

const Home = () => {
  return (
    <div className="min-h-screen bg-[#f6fafb] selection:bg-sky-100 selection:text-sky-900 font-body overflow-x-hidden">
      {/* ──────────── HERO ──────────── */}
      <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden text-white">
        <img
          src="/images/hero_medical_team.png"
          alt="Diverse medical team collaborating inside a modern care setting"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,_rgba(6,18,34,0.94)_0%,_rgba(8,31,48,0.76)_46%,_rgba(8,31,48,0.34)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-[linear-gradient(180deg,_rgba(246,250,251,0)_0%,_#f6fafb_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,_transparent_1px),linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:72px_72px] opacity-40" />

        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center px-6 pb-20 pt-16 lg:px-8 lg:pb-28">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.55fr)] lg:items-end">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl">
              <motion.div variants={fadeUp} className="inline-flex flex-wrap items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 backdrop-blur">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <Sparkles className="h-4 w-4" />
                  Connected care command center
                </span>
                <span className="hidden h-4 w-px bg-white/15 sm:block" />
                <span className="text-xs uppercase tracking-[0.24em] text-slate-300">
                  Made for real healthcare work
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl font-display leading-[1.02]">
                Alera
                <span className="block text-emerald-200">brings healthcare together in one place.</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl">
                Patients, doctors, pharmacies, labs, imaging centers, hospitals, and ambulance teams can all work better when they use one platform that keeps everyone connected.
              </motion.p>
              
              <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-start gap-4 sm:gap-x-6 w-full sm:w-auto">
                <Button asChild size="lg" className="h-14 w-full sm:w-auto rounded-full bg-emerald-300 px-8 text-base text-slate-950 shadow-xl shadow-emerald-950/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-200">
                  <Link to="/signup">
                    Get started now <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Link to="/who-we-serve" className="flex items-center text-base font-semibold leading-6 text-white transition-colors hover:text-emerald-200 group">
                  See who this is for <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-5 flex flex-wrap gap-2">
                {['For patients', 'For clinicians', 'For hospitals', 'For pharmacies', 'For labs', 'For imaging', 'For ambulance teams'].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-100 backdrop-blur">
                    {tag}
                  </span>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} className="mt-12 grid gap-3 sm:grid-cols-3">
                {heroSignals.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <div key={signal.label} className="border-l border-white/20 bg-white/[0.08] px-4 py-4 backdrop-blur">
                      <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl ${signal.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-3xl font-bold tracking-tight">{signal.value}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">{signal.label}</p>
                    </div>
                  );
                })}
              </motion.div>

              <motion.div variants={fadeUp} className="mt-8 grid gap-4 lg:grid-cols-2">
                {launchHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className={`relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${item.accent} bg-white/[0.07] p-5 backdrop-blur`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg shadow-slate-950/10">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-200">{item.copy}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              className="hidden border border-white/15 bg-slate-950/55 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-xl lg:block"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Network Pulse</p>
                  <p className="mt-1 text-lg font-semibold text-white">Live care coordination</p>
                </div>
                <span className="flex h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(110,231,183,0.16)]" />
              </div>
              <div className="mt-5 space-y-3">
                {careJourney.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.label} className="flex gap-3 border border-white/10 bg-white/[0.07] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{step.label}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{step.copy}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Why teams choose Alera</p>
                <div className="mt-3 space-y-2">
                  {trustRibbon.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-slate-200">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────── PLATFORM PREVIEW ──────────── */}
      <section className="relative pb-24">
         <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="relative rounded-[2.5rem] bg-white ring-1 ring-slate-900/5 shadow-2xl shadow-slate-200/50 overflow-hidden"
            >
               <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"></div>
               
               <div className="grid lg:grid-cols-[1fr_400px] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                  <div className="p-8 sm:p-12 lg:p-16">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
                              <HeartPulse className="h-6 w-6" />
                           </div>
                           <div>
                              <h3 className="text-xl font-bold font-display text-slate-900">Ecosystem Network</h3>
                              <p className="text-sm text-slate-500">Fast updates across the whole care team</p>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {ecosystemRoles.map((role, i) => {
                           const Icon = role.icon;
                           return (
                              <motion.div 
                                 key={role.label} 
                                 initial={{ opacity: 0, scale: 0.9 }}
                                 whileInView={{ opacity: 1, scale: 1 }}
                                 viewport={{ once: true }}
                                 transition={{ delay: i * 0.05 + 0.2 }}
                                 className={`group flex flex-col items-center justify-center gap-3 p-4 rounded-3xl border border-slate-100 transition-all duration-300 cursor-pointer hover:shadow-md ${role.bg} ${role.hover}`}
                              >
                                 <div className={`p-3 rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 ${role.color}`}>
                                    <Icon className="h-5 w-5" />
                                 </div>
                                 <span className="font-semibold text-slate-700 text-sm">{role.label}</span>
                              </motion.div>
                           )
                        })}
                     </div>
                  </div>

                  <div className="bg-slate-50/50 p-8 sm:p-12 flex flex-col justify-center">
                     <div className="mb-6 flex justify-between items-center">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                           <Activity className="h-4 w-4 text-emerald-500" /> Live Activity Feed
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Log</span>
                     </div>
                     
                     <LiveActivityTicker />
                     
                     <div className="mt-8 space-y-4">
                        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                           <div className="absolute inset-y-0 left-0 w-1 bg-sky-500 rounded-l-2xl"></div>
                           <div className="flex gap-4">
                              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
                                 <Stethoscope className="h-5 w-5 text-slate-500" />
                              </div>
                              <div>
                                 <p className="text-sm font-semibold text-slate-900">Dr. Sarah Jenkins</p>
                                 <p className="text-xs text-slate-500 mt-0.5">Cardiologist • City Hospital</p>
                                 <div className="mt-3 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Available for Telemedicine
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.35)] sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Why Visitors Convert</p>
                  <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl font-display">
                  Alera should feel like the tool healthcare teams have been waiting for.
                  </h2>
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                  A good landing page should do more than explain the product. It should make people want to join. This page now shows the problem, shows the fix, and keeps giving visitors a reason to take the next step.
                  </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {decisionTriggers.map((item) => (
                    <div key={item.title} className={`rounded-[1.75rem] border p-5 ${item.accent}`}>
                      <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.copy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">What pulls people in</p>
                <div className="mt-4 space-y-3">
                  {proofMoments.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-slate-200">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Button asChild size="lg" className="mt-8 h-12 w-full rounded-full bg-white text-slate-950 hover:bg-slate-100">
                  <Link to="/signup">
                    Join Alera
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── MOTIVE & INTEGRATION (IMAGE VERSION) ──────────── */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-slate-900">
         <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 blur-[100px] opacity-30">
               <div className="aspect-square w-[40rem] rounded-full bg-gradient-to-br from-sky-400 to-emerald-400" />
            </div>
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 blur-[100px] opacity-20">
               <div className="aspect-square w-[30rem] rounded-full bg-gradient-to-tr from-violet-400 to-sky-400" />
            </div>
         </div>
         <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
               
               <motion.div 
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                  className="relative order-2 lg:order-1"
               >
                  <div className="relative rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl">
                     <img src="/images/consulting_patients.png" alt="Doctor and patient reviewing tablet" className="w-full object-cover h-[500px]" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                  
                  {/* Glass Card on Image */}
                  <div className="absolute -bottom-8 -right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hidden md:block max-w-[280px]">
                     <div className="flex items-center gap-3 text-emerald-400 font-semibold mb-2">
                        <ShieldCheck className="h-5 w-5" /> Single Source of Truth
                     </div>
                     <p className="text-slate-300 text-sm">Both doctors and patients viewing the exact identical lab report instantly, in real time.</p>
                  </div>
               </motion.div>

               <motion.div 
                  initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-2xl order-1 lg:order-2"
               >
                  <h2 className="text-sm font-semibold leading-7 text-sky-400 tracking-wider uppercase flex items-center gap-2">
                     <span className="h-px w-8 bg-sky-400"></span> Our Motive
                  </h2>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl font-display leading-[1.1]">
                     Stop care from breaking apart.
                  </p>
                  <p className="mt-6 text-lg leading-8 text-slate-300">
                     Too much care is still disconnected. Patients repeat themselves, doctors chase records, hospitals manage messy handoffs, and other teams work without the full picture.
                  </p>
                  <p className="mt-4 text-lg leading-8 text-slate-300">
                     <strong className="text-white font-semibold">Alera was built to fix this.</strong> When a doctor asks for a scan, the imaging center gets it at once. When a prescription is written, the pharmacy sees it fast. When a patient needs follow-up, the next team is already ready.
                  </p>
                  <div className="mt-8 flex items-center gap-4 text-sm font-medium text-white">
                     <div className="flex -space-x-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-500 ring-2 ring-slate-900 flex items-center justify-center"><Pill className="h-4 w-4" /></div>
                        <div className="h-8 w-8 rounded-full bg-sky-500 ring-2 ring-slate-900 flex items-center justify-center"><Stethoscope className="h-4 w-4" /></div>
                        <div className="h-8 w-8 rounded-full bg-violet-500 ring-2 ring-slate-900 flex items-center justify-center"><FlaskConical className="h-4 w-4" /></div>
                     </div>
                     Total System Integration
                  </div>
               </motion.div>
               
            </div>
         </div>
      </section>

      {/* ──────────── FEATURES / HIGHLIGHTS ──────────── */}
      <section className="py-24 sm:py-32 bg-white">
         <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-16">
               <h2 className="text-base font-semibold leading-7 text-sky-600">Faster, Smarter, Better</h2>
               <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl font-display">
                  Why people say yes to Alera
               </p>
               <p className="mt-6 text-lg leading-8 text-slate-600">
                  The value is simple: less delay, less stress, better teamwork, and a smoother care journey for everyone.
               </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
               <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                  {[
                     {
                        title: 'Interoperable Records',
                        description: 'Records update fast when medicine is given or test results come in, so every team sees the same information.',
                        icon: ShieldCheck,
                        color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
                     },
                     {
                        title: 'Secure Communications',
                        description: 'Built-in chat and video calls help teams talk faster and keep every update close to the patient record.',
                        icon: MessageSquareText,
                        color: 'bg-sky-50 text-sky-600 border-sky-100'
                     },
                     {
                        title: 'Intelligent Workflows',
                        description: 'Referrals, reminders, and emergency dispatch are easier to manage, so teams can move faster with less stress.',
                        icon: Zap,
                        color: 'bg-violet-50 text-violet-600 border-violet-100'
                     }
                  ].map((feature, idx) => (
                     <div key={feature.title} className="flex flex-col items-start transition-transform hover:-translate-y-1">
                        <div className={`rounded-2xl p-4 border ${feature.color} shadow-sm mb-5`}>
                           <feature.icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <dt className="text-xl font-semibold leading-7 text-slate-900 font-display">
                           {feature.title}
                        </dt>
                        <dd className="mt-3 flex flex-auto flex-col text-base leading-7 text-slate-600">
                           <p className="flex-auto">{feature.description}</p>
                        </dd>
                     </div>
                  ))}
               </dl>
            </div>
         </div>
      </section>

      {/* ──────────── STATS ──────────── */}
      <section className="bg-slate-900 py-16 sm:py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-hero mix-blend-multiply opacity-50"></div>
         <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
               <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">Made to feel clear and trusted from the first visit</h2>
               </div>
               <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-3 lg:grid-cols-3 ring-1 ring-white/10">
                  {STATS.map((stat) => (
                     <div key={stat.label} className="flex flex-col bg-white/5 p-8 backdrop-blur-md transition-colors hover:bg-white/10">
                        <dt className="text-sm font-semibold leading-6 text-slate-300 flex items-center justify-center gap-2">
                           <stat.icon className="h-4 w-4" /> {stat.label}
                        </dt>
                        <dd className="order-first text-4xl font-bold tracking-tight text-white mb-2 font-display">{stat.value}</dd>
                     </div>
                  ))}
               </dl>
            </div>
         </div>
      </section>

      {/* ──────────── FINAL CTA ──────────── */}
      <section className="relative isolate px-6 py-24 sm:py-32 lg:px-8 bg-white overflow-hidden">
         <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl">
            <div
               className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-sky-200 to-emerald-200"
               style={{
                  clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
               }}
            />
         </div>

         <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl font-display">
               Ready to bring your work into one simple platform?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
               If you want faster teamwork, clearer updates, and a better patient experience, this is the next step.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
               <Button asChild size="lg" className="h-14 w-full sm:w-auto rounded-full px-8 shadow-md transition-transform hover:scale-105 bg-slate-900 border-0 text-white hover:bg-slate-800">
                  <Link to="/signup">Create your account</Link>
               </Button>
               <Link to="/why-alera" className="text-sm font-semibold leading-6 text-slate-900 hover:text-sky-600 transition-colors group flex items-center">
                  See why people choose Alera <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
