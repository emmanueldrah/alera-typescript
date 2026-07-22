import {
  UserCheck, Search, Video, FlaskConical, Pill, Ambulance, ClipboardList, BarChart3, type LucideIcon
} from 'lucide-react';

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
};

const steps: Step[] = [
  {
    icon: UserCheck,
    title: 'Initialize Role Node',
    description: 'Establish a secure profile mapped to your real clinical identity: patient, clinician, hospital, lab, pharmacy, imaging center, or ambulance fleet.',
    tag: 'Platform Registry',
  },
  {
    icon: Search,
    title: 'Coordinate Care Channels',
    description: 'Immediate, secure access allows patients to locate certified clinicians. General practitioners route specialized referrals inside the same ledger.',
    tag: 'Referral Pipeline',
  },
  {
    icon: Video,
    title: 'Secure Clinical Consultation',
    description: 'Execute video and messaging sessions. Clinicians formulate charts, allergy alerts, and digital prescription receipts in real time.',
    tag: 'Clinical Workspace',
  },
  {
    icon: FlaskConical,
    title: 'Diagnostics Dispatch',
    description: 'Connected labs receive diagnostic test orders. Results are securely published back to the referring clinician and patient simultaneously.',
    tag: 'Laboratory Node',
  },
  {
    icon: Pill,
    title: 'Automated Pharmacy Dispensing',
    description: 'Clinicians route verified e-prescriptions straight to patient-selected dispensaries. Pharmacists audit logs and verify inventory telemetry.',
    tag: 'Pharmacy Node',
  },
  {
    icon: Ambulance,
    title: 'Emergency Response Integration',
    description: 'Initiate emergency dispatches with live coordinates, managing triage channels and trauma ward prep en route.',
    tag: 'Emergency Node',
  },
  {
    icon: ClipboardList,
    title: 'Cryptographic Health Records',
    description: 'Consolidate every test, diagnostic report, consult log, and prescription receipt into a single unified patient health index.',
    tag: 'Ecosystem Ledger',
  },
  {
    icon: BarChart3,
    title: 'Platform Compliance Monitoring',
    description: 'Administrators audit licenses, verify credentials, manage multi-node billing, and monitor system-wide compliance queues.',
    tag: 'Governance Node',
  },
];

const HowItWorks = () => {
  return (
    <section className="px-6 py-20 bg-white sm:px-8 lg:px-12 border-b border-slate-200">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl border-b border-slate-200 pb-10">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Care Execution Blueprint</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            The Integrated Operational Care Path
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Learn how Alera maps coordinates, diagnostic findings, and clinical events into a single, continuous timeline across every stakeholder.
          </p>
        </div>

        {/* High density vertical layout checklist timeline */}
        <div className="mt-16 max-w-4xl space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex gap-6 items-start relative group">
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-slate-50 text-slate-900 font-mono text-xs font-bold">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-[1px] h-20 bg-slate-200 mt-2" />
                  )}
                </div>

                <div className="flex-1 rounded border border-slate-200 bg-slate-50/40 p-6 grid gap-4 sm:grid-cols-[1.5fr_1fr] items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="rounded border border-slate-300 bg-white p-1 text-slate-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-950">{step.title}</h3>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600">{step.description}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-block rounded border border-slate-300 bg-white px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase text-slate-500">
                      {step.tag}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
