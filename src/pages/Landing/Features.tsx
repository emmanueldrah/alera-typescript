import { motion, type Variants } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Video,
  MessageSquareText,
  CalendarDays,
  FileText,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react';

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Video,
    title: 'Video Consultation',
    description: 'Face-to-face care from any device with a clear, secure video experience.',
  },
  {
    icon: MessageSquareText,
    title: 'Live Chat',
    description: 'Message a doctor when you need quick answers or follow-up guidance.',
  },
  {
    icon: CalendarDays,
    title: 'Appointment Booking',
    description: 'Reserve time with the right clinician and manage upcoming visits.',
  },
  {
    icon: FileText,
    title: 'Prescription Management',
    description: 'Receive and review prescriptions in one place after consultation.',
  },
  {
    icon: HeartPulse,
    title: 'Medical History',
    description: 'Keep previous visits, notes, and treatments organized for continuity of care.',
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

const FeatureIcon = ({ icon: Icon }: { icon: LucideIcon }) => (
  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100">
    <Icon className="h-5 w-5" />
  </div>
);

const Features = () => {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Features"
          title="Everything needed for practical telemedicine"
          description="Each feature supports a real care task, keeping the experience simple for patients and useful for clinicians."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={sectionReveal}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group h-full rounded-[1.75rem] border-slate-200 bg-white/90 p-6 shadow-[0_16px_45px_-40px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_22px_60px_-40px_rgba(14,165,233,0.25)]">
                  <FeatureIcon icon={Icon} />
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
