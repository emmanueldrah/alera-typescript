import { motion, type Variants } from 'framer-motion';
import { BadgeCheck, LockKeyhole, Clock3, type LucideIcon } from 'lucide-react';

type TrustPoint = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const trustPoints: TrustPoint[] = [
  {
    icon: BadgeCheck,
    title: 'Verified Doctors',
    description: 'Every doctor profile is checked so patients can choose with confidence.',
  },
  {
    icon: LockKeyhole,
    title: 'Secure & Private',
    description: 'Private sessions and protected records keep patient data guarded.',
  },
  {
    icon: Clock3,
    title: 'Fast Response Times',
    description: 'Quick access to care when symptoms cannot wait for a long queue.',
  },
];

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

const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
}) => (
  <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">{eyebrow}</p>
    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{title}</h2>
    <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">{description}</p>
  </div>
);

const Trust = () => {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Trust"
          title="Built to feel calm, safe, and reliable"
          description="Trust is not a feature on top of telemedicine. It is the core of the experience, from doctor verification to private sessions."
        />

        <motion.div
          variants={groupReveal}
          initial="hidden"
          animate="visible"
          className="mt-12 grid gap-4 lg:grid-cols-3"
        >
          {trustPoints.map((point) => {
            const Icon = point.icon;

            return (
              <motion.div
                key={point.title}
                variants={sectionReveal}
                className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_45px_-42px_rgba(15,23,42,0.45)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">{point.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{point.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={sectionReveal}
          initial="hidden"
          animate="visible"
          className="mt-8 rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,_rgba(239,246,255,0.9),_rgba(236,253,245,0.9))] p-6 shadow-[0_20px_60px_-50px_rgba(14,165,233,0.35)] sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">Why patients trust Alera</p>
              <p className="mt-3 text-xl font-semibold text-slate-950 md:text-2xl">
                Clear next steps, protected data, and quick access to a clinician when it matters.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {['Verified doctors', 'Private records', 'Fast response'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/80 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Trust;
