import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Stethoscope, Building2, Pill, FlaskConical, ScanLine, Ambulance, Users, ShieldCheck,
  ArrowRight, type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Stakeholder = {
  icon: LucideIcon;
  role: string;
  tagline: string;
  description: string;
  capabilities: string[];
};

const stakeholders: Stakeholder[] = [
  {
    icon: Users,
    role: 'Patients',
    tagline: 'Direct, clear portal to medical follow-ups.',
    description: 'Schedule consults, receive e-prescriptions, track diagnostic lab timelines, and view high-resolution scan findings.',
    capabilities: ['Intake Scheduling', 'Encrypted Telemedicine', 'Laboratory History Tracking', 'Emergency Dispatches'],
  },
  {
    icon: Stethoscope,
    role: 'Clinicians',
    tagline: 'Professional workspace built for diagnostic speed.',
    description: 'Synthesize consult charts, audit allergy vectors, prescribe drugs, and dispatch Specialist referrals.',
    capabilities: ['Integrated Consult Dashboard', 'e-Prescription Dispatch', 'Specialist referrals', 'Allergy Verification Logs'],
  },
  {
    icon: Building2,
    role: 'Hospitals',
    tagline: 'Institutional capacity and emergency intake.',
    description: 'Coordinate multi-department workflows, admit trauma transfers, and sync on-call clinician schedules.',
    capabilities: ['Intake Telemetry Mapping', 'Department Roster Management', 'Clinical Transfers Registry', 'Operational Performance Logs'],
  },
  {
    icon: Pill,
    role: 'Pharmacies',
    tagline: 'Secure inventory synchronization and verification.',
    description: 'Process validated electronic scripts, track low stock events, and maintain automated compliance logs.',
    capabilities: ['Validated Script Receipts', 'Live Inventory Telemetry', 'Safety Margin Auditing', 'Regulatory Reports'],
  },
  {
    icon: FlaskConical,
    role: 'Laboratories',
    tagline: 'Automated test workflows and distribution.',
    description: 'Receive biological test requests, register automated accessions, and dispatch verified diagnostic results.',
    capabilities: ['Accession Registry Logs', 'Test Queue Telemetry', 'Secure Results Dispatch', 'Compliance Audit Trails'],
  },
  {
    icon: ScanLine,
    role: 'Imaging Centers',
    tagline: 'High-resolution DICOM record delivery.',
    description: 'Process radiologic referrals, schedule technical scan sessions, and publish verified diagnostic reports.',
    capabilities: ['DICOM Record Mapping', 'Scan Schedule Control', 'Automated Clinic Delivery', 'Administrative Audit logs'],
  },
  {
    icon: Ambulance,
    role: 'Ambulance Services',
    tagline: 'Emergency fleet telemetry and dispatch.',
    description: 'Coordinate dispatches with precise location feeds, triage patient queues, and alert receiving trauma wards.',
    capabilities: ['GPS Fleet Feeds', 'Triage Category Queues', 'Hospital Handoff System', 'Incident Action Reports'],
  },
  {
    icon: ShieldCheck,
    role: 'Administrators',
    tagline: 'Platform-wide oversight and governance.',
    description: 'Audit system actions, verify professional credentials, manage multi-node billing, and oversee compliance.',
    capabilities: ['Credential Auditing Control', 'Ecosystem Performance Logs', 'Multi-Node Bill Settlement', 'System Access Control'],
  },
];

const WhoWeServe = () => {
  return (
    <section className="px-6 py-20 bg-white sm:px-8 lg:px-12 border-b border-slate-200">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl border-b border-slate-200 pb-10">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Ecosystem Stakeholders</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Unified Interface Standards for Every Node
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Alera does not force a generalized layout onto diverse clinical actors. We design intentionally structured interfaces customized for specific care roles.
          </p>
        </div>

        {/* Editorial Split List Layout */}
        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {stakeholders.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.role}
                className="rounded border border-slate-200 bg-slate-50/40 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-4 items-center">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-slate-900">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-950">{s.role}</p>
                      <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">{s.tagline}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-slate-600">{s.description}</p>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2.5">Critical Modules</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {s.capabilities.map((cap) => (
                      <li key={cap} className="flex items-center gap-2 text-[10px] text-slate-600">
                        <span className="h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Crisp Monospace CTA Container */}
        <div className="mt-16 rounded border border-slate-300 bg-slate-950 p-8 text-white sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Initialize Gateway Node</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Connect your organization to the Alera Operating Layer.
              </h2>
              <p className="mt-2 text-xs text-slate-300 max-w-xl">
                Establish a verified profile, declare your operational capabilities, and begin coordinating with the rest of the medical network.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-shrink-0">
              <Button asChild size="lg" className="rounded bg-white px-5 text-xs font-mono font-bold uppercase tracking-wider text-slate-950 hover:bg-slate-100">
                <Link to="/signup">
                  Register Profile
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded border border-white/20 bg-white/5 px-5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-white/10">
                <Link to="/features">System Index</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeServe;
