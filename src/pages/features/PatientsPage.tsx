import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  ChevronRight,
  Inbox,
  MessageSquare,
  Search,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { getAccessiblePatients } from '@/lib/patientDirectory';

const PatientsPage = () => {
  const { user, getUsers } = useAuth();
  const { appointments, prescriptions, labTests } = useAppData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const patientsList = useMemo(
    () => getAccessiblePatients(getUsers(), appointments, prescriptions, labTests, user),
    [appointments, getUsers, labTests, prescriptions, user],
  );

  const filteredPatients = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    if (!normalizedQuery) return patientsList;
    return patientsList.filter((patient) => patient.name.toLowerCase().includes(normalizedQuery));
  }, [patientsList, search]);

  const canMessagePatient = user?.role === 'doctor';
  const canViewHistory =
    user?.role === 'doctor' || user?.role === 'hospital' || user?.role === 'admin' || user?.role === 'super_admin';

  if (user?.role !== 'doctor' && user?.role !== 'admin' && user?.role !== 'hospital') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Patients</h1>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Users className="mb-3 h-10 w-10" />
          <p className="text-sm">You don't have access to patient management</p>
        </div>
      </div>
    );
  }

  const totalAppointments = filteredPatients.reduce((sum, patient) => sum + patient.appointmentCount, 0);
  const totalPrescriptions = filteredPatients.reduce((sum, patient) => sum + patient.prescriptionCount, 0);
  const totalLabTests = filteredPatients.reduce((sum, patient) => sum + patient.labTestCount, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(145deg,_#ffffff_0%,_#f8fbff_60%,_#f4fbfa_100%)] p-8 shadow-sm"
      >
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-sky-700">
              <Users className="h-4 w-4" />
              Patient relationship workspace
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              {user?.role === 'doctor' ? 'My Patients' : 'Patients'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Review the people currently connected to your workflow, jump into their history, and pick up the next conversation without digging through separate modules.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Visible patients', value: filteredPatients.length, helper: 'Current filtered list', tone: 'bg-sky-50 text-sky-700' },
                { label: 'Appointments', value: totalAppointments, helper: 'Linked care visits', tone: 'bg-emerald-50 text-emerald-700' },
                { label: 'Diagnostics', value: totalLabTests + totalPrescriptions, helper: 'Labs and prescriptions', tone: 'bg-amber-50 text-amber-700' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm">
                  <div className={`inline-flex rounded-2xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${item.tone}`}>
                    {item.label}
                  </div>
                  <div className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{item.value}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.helper}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Search</p>
            <h2 className="mt-3 text-xl font-semibold">Find the right patient faster</h2>
            <div className="relative mt-6">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients by name..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">Care continuity</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Open a patient history or message thread directly from the list so you can move from review to action in one step.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">Patient panel size</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {patientsList.length} patient{patientsList.length === 1 ? '' : 's'} currently available to your role.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-border bg-card py-14 text-muted-foreground shadow-sm">
          <Inbox className="mb-3 h-10 w-10" />
          <p className="text-sm">{patientsList.length === 0 ? 'No patients yet' : 'No patients match your search'}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm transition hover:border-primary/20 hover:shadow-md"
            >
              <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">{patient.name}</h3>
                      {patient.hasActive ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                          Active
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          Appointments
                        </div>
                        <div className="mt-2 text-lg font-semibold text-slate-900">{patient.appointmentCount}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          <Activity className="h-3.5 w-3.5" />
                          Prescriptions
                        </div>
                        <div className="mt-2 text-lg font-semibold text-slate-900">{patient.prescriptionCount}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          <Activity className="h-3.5 w-3.5" />
                          Lab tests
                        </div>
                        <div className="mt-2 text-lg font-semibold text-slate-900">{patient.labTestCount}</div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-slate-500">
                      {patient.lastVisit
                        ? `Last visit: ${new Date(patient.lastVisit).toLocaleDateString()}`
                        : 'No recorded visit yet'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 xl:justify-end">
                  {canMessagePatient ? (
                    <button
                      onClick={() => navigate(`/dashboard/messages?thread=${patient.id}`)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/20"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </button>
                  ) : null}
                  {canViewHistory ? (
                    <button
                      onClick={() => navigate(`/dashboard/medical-history?patient=${patient.id}`)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                    >
                      History
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredPatients.length > 0 ? (
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          {totalPrescriptions} prescriptions and {totalLabTests} lab tests are linked to the currently visible patient list.
        </div>
      ) : null}
    </div>
  );
};

export default PatientsPage;
