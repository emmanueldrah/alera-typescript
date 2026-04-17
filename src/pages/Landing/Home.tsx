import { Link } from 'react-router-dom';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  ArrowRight, BadgeCheck, LockKeyhole, Zap,
  Ambulance, FlaskConical, ScanLine, Pill, Building2,
  Stethoscope, Users, Video, ShieldCheck, MessageSquareText,
  CalendarDays, HeartPulse, ChevronRight, Activity, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
  { icon: BadgeCheck, label: 'Admins', color: 'text-slate-600', bg: 'bg-slate-50', hover: 'hover:bg-slate-100 hover:ring-slate-200' },
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

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-sky-100 selection:text-sky-900 font-body overflow-x-hidden">
      {/* ──────────── HERO ──────────── */}
      <section className="relative isolate pt-14 text-slate-900 overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sky-200 to-emerald-200 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col items-start text-left">
              <motion.div variants={fadeUp} className="mb-6 inline-flex">
                <div className="relative rounded-full px-4 py-1.5 text-sm font-semibold text-sky-700 ring-1 ring-sky-700/20 bg-sky-50 transition-all">
                  Alera 2.0 has arrived <span className="ml-2 font-light text-slate-400">|</span> 
                  <Link to="/features" className="ml-2 text-sky-600 hover:text-sky-800 group inline-flex items-center">
                    Read the announcement <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl font-display leading-[1.1]">
                Healthcare Unified, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
                  Care Maximized.
                </span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="mt-6 text-lg leading-8 text-slate-600 max-w-xl">
                Alera brings patients, doctors, pharmacies, and labs onto one single, intelligent platform. Experience the power of zero data silos.
              </motion.p>
              
              <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-start gap-4 sm:gap-x-6 w-full sm:w-auto">
                <Button asChild size="lg" className="h-14 w-full sm:w-auto rounded-full px-8 text-base shadow-glow transition-all hover:scale-105 bg-gradient-primary border-0 text-white">
                  <Link to="/signup">
                    Get Started <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Link to="/why-alera" className="text-base font-semibold leading-6 text-slate-900 transition-colors hover:text-sky-600 flex items-center group">
                  See how it works <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
               <div className="absolute -inset-4 bg-gradient-to-tr from-sky-200 to-emerald-100 rounded-[3rem] blur-xl opacity-50 mix-blend-multiply"></div>
               <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-900/10">
                  <img src="/images/hero_medical_team.png" alt="Diverse medical team" className="object-cover w-full h-[500px]" />
                  
                  {/* Floating UI Element */}
                  <motion.div 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.6, duration: 0.5 }}
                     className="absolute bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/40 flex items-center gap-4 max-w-xs"
                  >
                     <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6 text-emerald-600" />
                     </div>
                     <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Active Shift</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">8 Specialists connected right now</p>
                     </div>
                  </motion.div>
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
                              <p className="text-sm text-slate-500">Real-time data flow across all providers</p>
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
                     Ending Healthcare Fragmentation.
                  </p>
                  <p className="mt-6 text-lg leading-8 text-slate-300">
                     For too long, healthcare delivery has been fundamentally disconnected. Patients carry physical paper records, doctors spend hours chasing down lab results, and pharmacies dispense medications without full clinical context.
                  </p>
                  <p className="mt-4 text-lg leading-8 text-slate-300">
                     <strong className="text-white font-semibold">Alera was built to solve this.</strong> We act as the central nervous system for healthcare. When a doctor requests a scan, the imaging center receives it instantly. When a prescription is written, the pharmacy is automatically notified. 
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
                  Everything you need to deliver world-class care
               </p>
               <p className="mt-6 text-lg leading-8 text-slate-600">
                  Say goodbye to lost paper records and fragmented communications. Alera brings the entire patient journey into one cohesive hub.
               </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
               <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                  {[
                     {
                        title: 'Interoperable Records',
                        description: 'Patient records update instantly when a pharmacy dispenses medication or a lab upload results. Single source of truth.',
                        icon: ShieldCheck,
                        color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
                     },
                     {
                        title: 'Secure Communications',
                        description: 'Built-in chat and video conferencing. Discuss complex cases with specialists without leaving the platform.',
                        icon: MessageSquareText,
                        color: 'bg-sky-50 text-sky-600 border-sky-100'
                     },
                     {
                        title: 'Intelligent Workflows',
                        description: 'Automated referrals, smart appointment reminders, and one-click ambulance dispatch reduce administrative burden.',
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
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">Trusted by modern care providers</h2>
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
               Ready to streamline your workflow?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
               Join thousands of patients and providers experiencing the future of healthcare communication and delivery.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
               <Button asChild size="lg" className="h-14 w-full sm:w-auto rounded-full px-8 shadow-md transition-transform hover:scale-105 bg-slate-900 border-0 text-white hover:bg-slate-800">
                  <Link to="/signup">Start Standard Free</Link>
               </Button>
               <Link to="/who-we-serve" className="text-sm font-semibold leading-6 text-slate-900 hover:text-sky-600 transition-colors group flex items-center">
                  View pricing <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
