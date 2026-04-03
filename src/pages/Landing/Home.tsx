import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  LockKeyhole,
  Clock3,
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
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

const groupReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
};

const Home = () => {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-100/40 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-16 sm:px-6 md:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-24">
          <motion.div
            variants={groupReveal}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.div
              variants={sectionReveal}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Secure care, wherever you are
            </motion.div>

            <motion.h1
              variants={sectionReveal}
              className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl md:text-6xl"
            >
              Talk to a Doctor Anytime, Anywhere
            </motion.h1>

            <motion.p variants={sectionReveal} className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Alera is a telemedicine platform that helps patients connect with verified doctors through secure video,
              live chat, and appointment booking. Start as a guest or create an account when you are ready.
            </motion.p>

            <motion.div variants={sectionReveal} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full bg-sky-600 px-6 text-white shadow-lg shadow-sky-600/20 transition-transform hover:-translate-y-0.5 hover:bg-sky-500">
                <Link to="/signup">
                  Start Consultation
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-slate-200 bg-white/80 px-6 text-slate-700 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-slate-50">
                <Link to="/how-it-works">Book Appointment</Link>
              </Button>
            </motion.div>

            <motion.p variants={sectionReveal} className="mt-4 text-sm text-slate-500">
              No account required to browse. Continue as a guest until you are ready to consult.
            </motion.p>

            <motion.div
              variants={sectionReveal}
              className="mt-10 grid gap-4 sm:grid-cols-3"
            >
              {[
                { label: 'Verified doctors', value: '150+', icon: BadgeCheck },
                { label: 'Private sessions', value: 'End-to-end', icon: LockKeyhole },
                { label: 'Average response', value: '2 min', icon: Clock3 },
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

          <motion.div
            variants={sectionReveal}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <Card className="relative overflow-hidden rounded-[2rem] border-white/80 bg-white/85 p-5 shadow-[0_40px_100px_-45px_rgba(15,23,42,0.5)] backdrop-blur-sm sm:p-6">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(14,165,233,0.12)_0%,_rgba(20,184,166,0.08)_48%,_rgba(255,255,255,0)_100%)]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Consultation Room</p>
                    <p className="text-sm text-slate-500">Secure video visit with live notes</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Doctor online
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/25">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,_rgba(14,165,233,0.26),_rgba(20,184,166,0.24))]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/90 text-white">
                            <Users className="h-6 w-6" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                            Live
                          </div>
                        </div>
                        <div>
                          <p className="text-base font-semibold">Dr. Ama Mensah</p>
                          <p className="text-sm text-slate-300">Family Medicine</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Wait time</p>
                        <p className="text-base font-semibold">Under 2 min</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-200">
                            <Video className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Video ready</p>
                            <p className="text-xs text-slate-300">Clear audio and camera access</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Private session</p>
                            <p className="text-xs text-slate-300">Protected patient data</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                        <span>Quick notes</span>
                        <span>Today</span>
                      </div>
                      <div className="mt-3 space-y-3 text-sm text-slate-200">
                        <div className="rounded-2xl bg-white/5 px-4 py-3">
                          Patient reports recurring headaches and wants advice on next steps.
                        </div>
                        <div className="rounded-2xl bg-sky-500/15 px-4 py-3 text-sky-50">
                          Suggest hydration, monitor symptoms, and schedule follow-up if pain persists.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Chat support</p>
                          <p className="text-xs text-slate-500">Ask a question before the video call</p>
                        </div>
                        <MessageSquareText className="h-5 w-5 text-sky-600" />
                      </div>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-slate-700">
                          Hi doctor, I need help with a fever and sore throat.
                        </div>
                        <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-emerald-50 px-4 py-3 text-emerald-900">
                          A doctor is available now. We can start with a quick chat.
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Appointment status</p>
                          <p className="text-xs text-slate-500">Booked, tracked, and easy to manage</p>
                        </div>
                        <CalendarDays className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <PhoneCall className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-950">Consultation confirmed</p>
                          <p className="text-xs text-slate-500">Tuesday, 10:30 AM - reminder enabled</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Guests', value: 'Allowed' },
                        { label: 'Notes', value: 'Synced' },
                        { label: 'Rx', value: 'Managed' },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-950">{item.value}</p>
                        </div>
                      ))}
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

      <section className="px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Card className="overflow-hidden rounded-[2rem] border-slate-200 bg-slate-950 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.75)]">
            <div className="grid gap-8 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-200">Ready when you are</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  Start care without waiting for the right moment.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                  Explore doctors, choose the type of care you need, and begin a consultation on your own schedule.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Button asChild size="lg" className="h-12 rounded-full bg-white px-6 text-slate-950 shadow-none transition-transform hover:-translate-y-0.5 hover:bg-slate-100">
                  <Link to="/signup">Start Consultation</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                  <Link to="/signup?flow=appointment">Book Appointment</Link>
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
