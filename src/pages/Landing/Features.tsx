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
};

const features: Feature[] = [
  // Consultation
  { icon: Video, title: 'Video Consultation', description: 'Secure real-time clinical consultations over encrypted media streams.', category: 'Clinical Consult' },
  { icon: MessageSquareText, title: 'Integrated Messaging', description: 'Secure text threads linking patients with their clinical care team.', category: 'Clinical Consult' },
  { icon: CalendarDays, title: 'Intake Scheduling', description: 'Structured calendar allocation with automatic status reminders.', category: 'Clinical Consult' },

  // Clinical
  { icon: ClipboardList, title: 'Electronic Medical Notes', description: 'Structured clinical findings and diagnostic registries.', category: 'Clinical Node' },
  { icon: HeartPulse, title: 'Chronological Health Log', description: 'Linear unified history indexing consults, labs, and diagnostic scans.', category: 'Clinical Node' },
  { icon: ShieldCheck, title: 'Allergy Verification Ledger', description: 'Automated warnings matched against prescriptions to prevent conflict events.', category: 'Clinical Node' },

  // Prescriptions & Pharmacy
  { icon: FileText, title: 'e-Prescription Dispatch', description: 'Immediate, verified prescription routing to patient-selected pharmacies.', category: 'Prescriptions' },
  { icon: Pill, title: 'Inventory Synchronisation', description: 'Live stock telemetry, verification auditing, and automatic alerts.', category: 'Prescriptions' },

  // Labs & Imaging
  { icon: FlaskConical, title: 'Lab Order Distribution', description: 'Direct test requests with automated, verified results delivery loops.', category: 'Labs & Scans' },
  { icon: ScanLine, title: 'Diagnostic Scan Registry', description: 'DICOM record connectivity, diagnostic scanning schedules, and reporting.', category: 'Labs & Scans' },

  // Emergency
  { icon: Ambulance, title: 'Emergency Fleet Coordination', description: 'Triage prioritization queues and real-time fleet coordinates.', category: 'Emergency Node' },

  // Admin & Ops
  { icon: UserCheck, title: 'Provider Verification Ledger', description: 'Strict administrator control loop auditing professional licenses.', category: 'Platform Governance' },
  { icon: BarChart3, title: 'Platform Telemetry', description: 'Real-time performance dashboards monitoring latency, node activity, and service queues.', category: 'Platform Governance' },
  { icon: Receipt, title: 'Billing Audit Logs', description: 'Secured transaction registries tracking payments, insurance matching, and billing.', category: 'Platform Governance' },
  { icon: FolderOpen, title: 'Consent Indexing', description: 'Digital patient release records and validated clinical uploads.', category: 'Platform Governance' },
  { icon: Bell, title: 'Status Dispatch', description: 'System-triggered action notices and critical medication alerts.', category: 'Platform Governance' },
  { icon: Stethoscope, title: 'Referral Chain', description: 'Tracked clinical handoffs linking general clinicians with specialists.', category: 'Clinical Node' },
];

const Features = () => {
  // Let's organize these into high-density clinical lists categorized elegantly.
  const categories = Array.from(new Set(features.map(f => f.category)));

  return (
    <section className="px-6 py-20 bg-white sm:px-8 lg:px-12 border-b border-slate-200">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl border-b border-slate-200 pb-10">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">System Capabilities Index</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Integrated Clinical & Operational Capabilities
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Alera replaces disconnected point solutions with a single, highly structured system. Every tool is built on matching compliance rules and instant node handoffs, replacing high-overhead administrative tasks.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {categories.map((category) => {
            const categoryFeatures = features.filter(f => f.category === category);
            return (
              <div key={category} className="grid gap-8 lg:grid-cols-[240px_1fr] items-start border-b border-slate-100 pb-12 last:border-b-0">
                <div>
                  <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-l-2 border-slate-900 pl-3">
                    {category}
                  </h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {categoryFeatures.map((feat) => {
                    const Icon = feat.icon;
                    return (
                      <div key={feat.title} className="rounded border border-slate-200 bg-slate-50/40 p-5 flex gap-4 items-start">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-slate-900">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-950">{feat.title}</h3>
                          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
