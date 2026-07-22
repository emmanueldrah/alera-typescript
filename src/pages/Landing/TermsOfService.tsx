import { motion } from 'framer-motion';
import { FileText, UserCheck, AlertCircle, Scale, ShieldAlert } from 'lucide-react';

const sections = [
  {
    icon: UserCheck,
    title: '1. Acceptance of Terms',
    content: `By accessing or using the Alera healthcare platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform.

These Terms apply to all users including patients, healthcare providers (doctors, hospitals, laboratories, imaging centers, pharmacies, ambulance services), and administrators.`,
  },
  {
    icon: FileText,
    title: '2. Account Registration & Eligibility',
    content: `To use the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your login credentials.

Professional accounts (doctors, hospitals, labs, pharmacies, imaging centers, ambulance services) require submission of valid professional license information. Accounts remain in "pending" status until credentials are verified by a platform administrator. Misrepresentation of credentials is grounds for immediate account termination and may be reported to relevant licensing authorities.

You must be at least 18 years old to create an account.`,
  },
  {
    icon: AlertCircle,
    title: '3. Appropriate Use',
    content: `You agree to use the Platform only for lawful purposes related to healthcare delivery, management, and coordination. You must not:
• Use the Platform to transmit unauthorized or harmful content
• Attempt to gain unauthorized access to any part of the Platform or other users' data
• Use the Platform to provide false or misleading health information
• Use automated tools, bots, or scrapers to access the Platform without written authorization
• Share your account credentials with any other person

Patient health information accessed through the Platform may only be used for the purpose of providing or receiving healthcare services.`,
  },
  {
    icon: Scale,
    title: '4. Healthcare Disclaimer',
    content: `The Alera Platform is a healthcare coordination and communication tool. It does not replace the professional judgment of qualified healthcare providers.

Information presented on the Platform, including lab results, imaging reports, and prescription records, must be interpreted by a licensed healthcare professional. Patients should always consult their doctor or a qualified medical professional for medical advice, diagnosis, or treatment decisions.

Alera does not provide medical advice, and use of the Platform does not constitute a doctor-patient relationship with Alera itself.`,
  },
  {
    icon: ShieldAlert,
    title: '5. Termination & Governing Law',
    content: `We reserve the right to suspend or terminate your account at any time if you violate these Terms or engage in conduct that we determine is harmful to the Platform, other users, or third parties.

These Terms are governed by applicable laws. Any disputes arising from these Terms or your use of the Platform will be subject to binding arbitration, except where prohibited by law.

We may update these Terms from time to time. Continued use of the Platform after updates constitutes acceptance of the revised Terms. For questions about these Terms, contact legal@alera.health.`,
  },
];

const TermsOfService = () => (
  <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Terms of Service</h1>
        <p className="mt-3 text-slate-500">Last updated: April 2026 · Effective: April 1, 2026</p>
        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          Please read these Terms carefully before using the Alera Platform. These Terms constitute a legally binding agreement between you and Alera.
        </div>
      </div>

      <div className="space-y-10">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-slate-950">{section.title}</h2>
              </div>
              <div className="text-sm leading-7 text-slate-600 whitespace-pre-line pl-12">
                {section.content}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 border-t border-slate-200 pt-8 text-sm text-slate-500">
        <p>Questions about these Terms? Contact us at <span className="text-sky-700">legal@alera.health</span></p>
      </div>
    </motion.div>
  </div>
);

export default TermsOfService;
