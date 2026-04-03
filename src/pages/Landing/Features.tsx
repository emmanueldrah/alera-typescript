import { motion, type Variants } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Video, MessageSquareText, CalendarDays, FileText, HeartPulse,
  FlaskConical, ScanLine, Pill, Ambulance, ClipboardList, BarChart3,
  ShieldCheck, Bell, UserCheck, Stethoscope, FolderOpen, Receipt,
  type LucideIcon,
} from 'lucide-react';

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
};

const features: Feature[] = [
  // Consultation
  { icon: Video, title: 'Video Consultation', description: 'Secure face-to-face telemedicine sessions between patients and verified doctors from any device.', category: 'Consultation', categoryColor: 'text-sky-700 bg-sky-50' },
  { icon: MessageSquareText, title: 'Real-Time Messaging', description: 'Patients and providers communicate through a secure chat system — before, during, and after appointments.', category: 'Consultation', categoryColor: 'text-sky-700 bg-sky-50' },
  { icon: CalendarDays, title: 'Appointment Booking', description: 'Smart scheduling for patients to book, track, and receive reminders for upcoming appointments.', category: 'Consultation', categoryColor: 'text-sky-700 bg-sky-50' },

  // Clinical
  { icon: ClipboardList, title: 'Clinical Notes', description: 'Doctors document symptoms, diagnoses, and treatment plans directly within the platform during or after visits.', category: 'Clinical', categoryColor: 'text-emerald-700 bg-emerald-50' },
  { icon: HeartPulse, title: 'Medical History & Timeline', description: 'A continuous log of every consultation, prescription, test, and scan — structured chronologically for every patient.', category: 'Clinical', categoryColor: 'text-emerald-700 bg-emerald-50' },
  { icon: ShieldCheck, title: 'Allergy Management', description: 'Allergy profiles are recorded and surfaced during prescription and treatment decisions to prevent adverse reactions.', category: 'Clinical', categoryColor: 'text-emerald-700 bg-emerald-50' },

  // Prescriptions & Pharmacy
  { icon: FileText, title: 'E-Prescription Management', description: 'Doctors issue electronic prescriptions that are sent directly to connected pharmacies for fulfilment and tracking.', category: 'Pharmacy', categoryColor: 'text-teal-700 bg-teal-50' },
  { icon: Pill, title: 'Pharmacy Inventory', description: 'Pharmacies manage drug stock, process prescription refill requests, and receive automatic low-stock alerts.', category: 'Pharmacy', categoryColor: 'text-teal-700 bg-teal-50' },

  // Labs & Imaging
  { icon: FlaskConical, title: 'Lab Test Requests & Results', description: 'Doctors order tests; laboratories process them and upload results that flow directly back to the requesting doctor.', category: 'Labs', categoryColor: 'text-violet-700 bg-violet-50' },
  { icon: ScanLine, title: 'Imaging & Scan Management', description: 'Imaging centers receive referrals, manage scan bookings, upload reports, and notify requesting providers.', category: 'Imaging', categoryColor: 'text-cyan-700 bg-cyan-50' },

  // Emergency
  { icon: Ambulance, title: 'Ambulance Dispatch', description: 'Patients request emergency services; ambulance teams manage vehicle assignments, dispatch, and hospital handoffs.', category: 'Emergency', categoryColor: 'text-rose-700 bg-rose-50' },

  // Admin & Ops
  { icon: UserCheck, title: 'Provider Verifications', description: 'Administrators review and verify doctor credentials, hospital registrations, and all healthcare provider accounts.', category: 'Admin', categoryColor: 'text-indigo-700 bg-indigo-50' },
  { icon: BarChart3, title: 'Platform Analytics', description: 'Dashboards giving administrators visibility into service volumes, user activity, response times, and platform health.', category: 'Admin', categoryColor: 'text-indigo-700 bg-indigo-50' },
  { icon: Receipt, title: 'Billing & Payments', description: 'Integrated billing for consultations, prescriptions, lab tests, and imaging — managed and audited across the platform.', category: 'Admin', categoryColor: 'text-indigo-700 bg-indigo-50' },
  { icon: FolderOpen, title: 'Document & Consent Management', description: 'Patients manage consent forms and documents; providers upload and retrieve clinical documents securely.', category: 'Records', categoryColor: 'text-amber-700 bg-amber-50' },
  { icon: Bell, title: 'Smart Reminders & Notifications', description: 'Automated appointment reminders, medication adherence alerts, and platform notifications for every role.', category: 'Reminders', categoryColor: 'text-orange-700 bg-orange-50' },
  { icon: Stethoscope, title: 'Referral Network', description: 'Doctors refer patients to specialists, labs, or imaging centers through a tracked referral workflow within the platform.', category: 'Clinical', categoryColor: 'text-emerald-700 bg-emerald-50' },
];

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const Features = () => {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Platform Features</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Every feature your care team needs
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
            Alera is built for the full healthcare ecosystem — not just telemedicine. From lab referrals and pharmacy fulfilment to ambulance dispatch and admin analytics, every feature maps to a real workflow.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={sectionReveal}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.04 }}
              >
                <Card className="group h-full rounded-[1.75rem] border-slate-200 bg-white/90 p-6 shadow-[0_16px_45px_-40px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_22px_60px_-40px_rgba(14,165,233,0.25)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-inset ring-black/5 ${feature.categoryColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${feature.categoryColor}`}>
                      {feature.category}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
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
