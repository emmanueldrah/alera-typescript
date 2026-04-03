import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  LockKeyhole,
  Clock3,
  Ambulance,
  FlaskConical,
  ScanLine,
  Pill,
  Building2,
  Stethoscope,
  Users,
  Video,
  ShieldCheck,
  MessageSquareText,
  CalendarDays,
  PhoneCall,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const groupReveal: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const ecosystemRoles = [
  { icon: Stethoscope, label: 'Doctors', color: 'text-sky-700', bg: 'bg-sky-50 ring-sky-100' },
  { icon: Building2, label: 'Hospitals', color: 'text-indigo-700', bg: 'bg-indigo-50 ring-indigo-100' },
  { icon: Pill, label: 'Pharmacies', color: 'text-emerald-700', bg: 'bg-emerald-50 ring-emerald-100' },
  { icon: FlaskConical, label: 'Laboratories', color: 'text-violet-700', bg: 'bg-violet-50 ring-violet-100' },
  { icon: ScanLine, label: 'Imaging', color: 'text-cyan-700', bg: 'bg-cyan-50 ring-cyan-100' },
  { icon: Ambulance, label: 'Ambulance', color: 'text-rose-700', bg: 'bg-rose-50 ring-rose-100' },
  { icon: Users, label: 'Patients', color: 'text-teal-700', bg: 'bg-teal-50 ring-teal-100' },
  { icon: BadgeCheck, label: 'Admins', color: 'text-slate-700', bg: 'bg-slate-50 ring-slate-100' },
];

const Home = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-100/40 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-16 sm:px-6 md:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-24">
          <motion.div variants={groupReveal} initial="hidden" animate="visible" className="max-w-2xl">
            <motion.div
              variants={sectionReveal}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              One platform. The entire healthcare journey.
            </motion.div>

            <motion.h1
              variants={sectionReveal}
              className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl md:text-6xl"
            >
              Healthcare Unified, Delivered Securely.
            </motion.h1>

            <motion.p variants={sectionReveal} className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Alera connects patients with doctors, hospitals, pharmacies, laboratories, imaging centers, and ambulance services — all on one secure, integrated platform. From first consultation to prescription delivery, everything works together.
            </motion.p>

            <motion.div variants={sectionReveal} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full bg-sky-600 px-6 text-white shadow-lg shadow-sky-600/20 transition-transform hover:-translate-y-0.5 hover:bg-sky-500">
                <Link to="/signup">
                  Join the Ecosystem
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-slate-200 bg-white/80 px-6 text-slate-700 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-slate-50">
                <Link to="/features">Explore the Platform</Link>
              </Button>
            </motion.div>

            <motion.p variants={sectionReveal} className="mt-4 text-sm text-slate-500">
              Available to patients, providers, and healthcare organizations.
            </motion.p>

            {/* Stats */}
            <motion.div variants={sectionReveal} className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Healthcare roles', value: '8 types', icon: Users },
                { label: 'Data encryption', value: 'End-to-end', icon: LockKeyhole },
                { label: 'Average response', value: '< 2 min', icon: Clock3 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                        <p className="text-lg font-semibold text-slate-950">{item.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Dashboard preview card */}
          <motion.div variants={sectionReveal} initial="hidden" animate="visible" className="relative">
            <Card className="relative overflow-hidden rounded-[2rem] border-white/80 bg-white/85 p-5 shadow-[0_40px_100px_-45px_rgba(15,23,42,0.5)] backdrop-blur-sm sm:p-6">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(14,165,233,0.12)_0%,_rgba(20,184,166,0.08)_48%,_rgba(255,255,255,0)_100%)]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Alera Ecosystem</p>
                    <p className="text-sm text-slate-500">All stakeholders, one connected platform</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Live
                  </div>
                </div>

                {/* Ecosystem roles grid */}
                <div className="mt-5 grid grid-cols-4 gap-3">
                  {ecosystemRoles.map(({ icon: Icon, label, color, bg }) => (
                    <div key={label} className={`flex flex-col items-center gap-2 rounded-2xl p-3 ring-1 ${bg}`}>
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className={`text-[10px] font-semibold ${color}`}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Connected services preview */}
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl bg-slate-950 p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-200">
                        <Video className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Video Consultation</p>
                        <p className="text-xs text-slate-300">Dr. Ama Mensah — Family Medicine</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-slate-300">
                      <div className="rounded-xl bg-white/5 px-3 py-2">Reviewed lab results from Central Lab</div>
                      <div className="rounded-xl bg-sky-500/15 px-3 py-2 text-sky-100">Prescription sent to PharmaCare Dispensary</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <p className="text-xs font-semibold text-slate-950">Lab & Imaging Connected</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Results flow directly to your doctor</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <MessageSquareText className="h-4 w-4 text-sky-600" />
                        <p className="text-xs font-semibold text-slate-950">Real-Time Chat</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Message any provider in your care team</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-violet-600" />
                        <p className="text-xs font-semibold text-slate-950">Appointment Confirmed</p>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <PhoneCall className="h-3 w-3" />
                        Tuesday 10:30 AM — reminder set
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <div className="pointer-events-none absolute -right-2 top-8 hidden h-24 w-24 rounded-full border border-sky-200/70 bg-sky-100/40 lg:block" />
            <div className="pointer-events-none absolute -bottom-3 left-10 hidden h-20 w-20 rounded-full border border-emerald-200/70 bg-emerald-100/40 lg:block" />
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Card className="overflow-hidden rounded-[2rem] border-slate-200 bg-slate-950 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.75)]">
            <div className="grid gap-8 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-200">Ready when you are</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  Whether you're a patient, a provider, or a healthcare organization.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                  Alera is built for every role in the healthcare journey. Sign up, pick your role, and connect instantly with the rest of the ecosystem.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Button asChild size="lg" className="h-12 rounded-full bg-white px-6 text-slate-950 shadow-none transition-transform hover:-translate-y-0.5 hover:bg-slate-100">
                  <Link to="/signup">Create Your Account</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                  <Link to="/who-we-serve">Who We Serve</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
};

export default Home;
