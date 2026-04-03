import { motion, type Variants } from 'framer-motion';
import { UserCheck, Stethoscope, Video, type LucideIcon } from 'lucide-react';

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    icon: UserCheck,
    title: 'Sign up or continue as guest',
    description: 'Get started quickly without a long onboarding flow.',
  },
  {
    icon: Stethoscope,
    title: 'Choose a doctor',
    description: 'Browse verified doctors by specialty, availability, or care need.',
  },
  {
    icon: Video,
    title: 'Start consultation',
    description: 'Begin a secure video or chat consultation in minutes.',
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

const stepBadgeVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.35 },
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

const HowItWorks = () => {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="How it works"
          title="A simple path from first question to care"
          description="Alera keeps the first step easy so patients can understand what happens next without needing to guess."
        />

        <motion.div
          variants={groupReveal}
          initial="hidden"
          animate="visible"
          className="mt-12 grid gap-4 md:grid-cols-3"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                variants={sectionReveal}
                className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.5)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-42px_rgba(15,23,42,0.55)]"
              >
                <motion.div
                  variants={stepBadgeVariants}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#eff6ff,_#ecfeff)] text-sky-700 ring-1 ring-sky-100"
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <div className="mt-5 flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                    0{index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-950">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
