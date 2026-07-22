import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, Search, X, Inbox, AlertCircle, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { api } from '@/lib/apiService';
import { handleApiError } from '@/lib/errorHandler';
import { normalizeUserRole } from '@/lib/roleUtils';
import { getDoctorPatients } from '@/lib/patientDirectory';
import { getReferralDestinationProviders } from '@/lib/referralUtils';
import { getVisiblePrescriptions } from '@/lib/recordVisibility';
import type { DrugInteraction } from '@/data/mockData';

const PrescriptionsPage = () => {
  const { user, getUsers } = useAuth();
  const { appointments, prescriptions, checkDrugInteractions, refreshAppData } = useAppData();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ patientId: '', pharmacyId: '', medName: '', dosage: '', frequency: '', duration: '' });
  const [interactionWarnings, setInteractionWarnings] = useState<DrugInteraction[]>([]);
  const [overrideReason, setOverrideReason] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dispenseId, setDispenseId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'dispensed' | 'expired'>('all');
  const focusId = searchParams.get('focus');
  const effectiveRole = normalizeUserRole(user?.role) ?? user?.role;

  const users = getUsers();
  const patientOptions = useMemo(() => getDoctorPatients(users, appointments, user?.id), [appointments, user?.id, users]);
  const pharmacyOptions = useMemo(() => getReferralDestinationProviders(users, 'pharmacy'), [users]);

  const visiblePrescriptions = useMemo(
    () => getVisiblePrescriptions(prescriptions, user),
    [prescriptions, user],
  );
  const filteredPrescriptions = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return visiblePrescriptions.filter((prescription) => {
      const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
      const matchesSearch = !needle
        || prescription.patientName.toLowerCase().includes(needle)
        || prescription.doctorName.toLowerCase().includes(needle)
        || prescription.medications.some((medication) => medication.name.toLowerCase().includes(needle));
      return matchesStatus && matchesSearch;
    });
  }, [searchQuery, statusFilter, visiblePrescriptions]);

  const submitPrescription = async (meta: { notifyDuplicate: boolean; notifyInteractions: number }) => {
    if (!formData.patientId || !formData.pharmacyId || !formData.medName || !user?.id) {
      setCreateError('Patient, pharmacy, and medication are required.');
      return;
    }
    const patient = patientOptions.find((option) => option.id === formData.patientId);
    const pharmacy = pharmacyOptions.find((option) => option.id === formData.pharmacyId);
    if (!patient || !pharmacy) return;

    setSubmitting(true);
    setCreateError(null);
    try {
      const instructions = formData.duration.trim()
        ? `Duration: ${formData.duration.trim()}${overrideReason.trim() ? `. Override: ${overrideReason.trim()}` : ''}`
        : overrideReason.trim() || undefined;

      const created = (await api.prescriptions.createPrescription({
        patient_id: Number(formData.patientId),
        pharmacy_id: Number(formData.pharmacyId),
        medication_name: formData.medName.trim(),
        dosage: formData.dosage.trim() || '1',
        dosage_unit: 'tablet',
        frequency: formData.frequency.trim() || 'As directed',
        route: 'oral',
        instructions,
        refills: 0,
        start_date: new Date().toISOString(),
      })) as { id?: number };

      const newId = String(created.id ?? '');
      await refreshAppData();

      if (meta.notifyDuplicate) {
        addNotification({
          title: 'Duplicate Medication Prescribed',
          message: `${formData.medName} was prescribed despite already being on the patient's active prescription list.`,
          type: 'prescription',
          priority: 'high',
          audience: 'personal',
          targetEmails: pharmacy.email ? [pharmacy.email] : undefined,
        });
      }
      if (meta.notifyInteractions > 0) {
        addNotification({
          title: 'Prescription with Drug Interactions',
          message: `${formData.medName} was prescribed despite ${meta.notifyInteractions} drug interaction(s). Reason: ${overrideReason}`,
          type: 'prescription',
          priority: 'high',
          audience: 'personal',
          targetEmails: pharmacy.email ? [pharmacy.email] : undefined,
        });
      }
      addNotification({
        title: 'Prescription Issued',
        message: `${formData.medName} was issued for ${patient.name}.`,
        type: 'prescription',
        priority: 'medium',
        audience: 'personal',
        actionUrl: `/dashboard/prescriptions?focus=${newId}`,
        actionLabel: 'Open prescription',
        targetEmails: [user?.email, patient.email, pharmacy.email].filter((value): value is string => Boolean(value)),
        excludeEmails: user?.email ? [user.email] : [],
        actionUrlByRole: {
          doctor: `/dashboard/prescriptions?focus=${newId}`,
          pharmacy: `/dashboard/prescriptions?focus=${newId}`,
        },
      });

      setShowForm(false);
      setFormData({ patientId: '', pharmacyId: '', medName: '', dosage: '', frequency: '', duration: '' });
      setInteractionWarnings([]);
      setOverrideReason('');
      setDuplicateWarning(null);
      toast({
        title: 'Prescription issued',
        description: `${formData.medName} was prescribed successfully.`,
      });
    } catch (err) {
      setCreateError(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = (force?: 'duplicate_ok' | 'interactions_ok') => {
    if (!formData.patientId || !formData.medName) return;

    const patientPrescriptions = prescriptions.filter((p) => p.patientId === formData.patientId && p.status === 'active');
    const currentMeds = patientPrescriptions.flatMap((p) => p.medications.map((m) => m.name));
    const isDuplicate = currentMeds.some((med) => med.toLowerCase() === formData.medName.toLowerCase());

    if (isDuplicate && force !== 'duplicate_ok' && force !== 'interactions_ok') {
      setDuplicateWarning(`${formData.medName} is already prescribed to this patient`);
      return;
    }

    const interactions = checkDrugInteractions([...currentMeds, formData.medName]);
    const relevantInteractions = interactions.filter(
      (i) =>
        (currentMeds.includes(i.drug1) && i.drug2.toLowerCase() === formData.medName.toLowerCase()) ||
        (currentMeds.includes(i.drug2) && i.drug1.toLowerCase() === formData.medName.toLowerCase()),
    );

    if (relevantInteractions.length > 0 && force !== 'interactions_ok') {
      setInteractionWarnings(relevantInteractions);
      return;
    }

    void submitPrescription({
      notifyDuplicate: isDuplicate,
      notifyInteractions: force === 'interactions_ok' ? relevantInteractions.length : 0,
    });
  };

  const handleDispense = async (id: string) => {
    const target = prescriptions.find((prescription) => prescription.id === id);
    setDispenseId(id);
    try {
      await api.prescriptions.updatePrescription(id, { status: 'dispensed' });
      await refreshAppData();
      if (target) {
        addNotification({
          title: 'Prescription Dispensed',
          message: `${target.medications[0]?.name ?? 'Medication'} for ${target.patientName} has been marked as dispensed.`,
          type: 'prescription',
          priority: 'medium',
          audience: 'personal',
          actionUrl: `/dashboard/prescriptions?focus=${target.id}`,
          actionLabel: 'View dispensed item',
          actionUrlByRole: {
            pharmacy: `/dashboard/prescriptions?focus=${target.id}`,
            doctor: `/dashboard/prescriptions?focus=${target.id}`,
            patient: `/dashboard/prescriptions?focus=${target.id}`,
          },
        });
        toast({
          title: 'Prescription dispensed',
          description: `${target.medications[0]?.name ?? 'Medication'} was marked as dispensed.`,
        });
      }
    } catch (err) {
      setCreateError(handleApiError(err));
    } finally {
      setDispenseId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      await api.prescriptions.deletePrescription(id);
      await refreshAppData();
      toast({
        title: 'Prescription deleted',
        description: 'The prescription was removed.',
      });
    } catch (err) {
      setCreateError(handleApiError(err));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">
            {effectiveRole === 'doctor'
              ? 'Issue and manage prescriptions'
              : effectiveRole === 'pharmacy'
                ? 'Dispense medications'
                : 'Your prescriptions'}
          </p>
        </div>
        {effectiveRole === 'doctor' && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" /> New Prescription
          </button>
        )}
      </div>

      {createError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-4">{createError}</div>
      )}

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search prescriptions by patient, doctor, or medication..."
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'dispensed' | 'expired')}
          className="h-11 rounded-xl border border-input bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="dispensed">Dispensed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Issue Prescription</h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setInteractionWarnings([]);
                setDuplicateWarning(null);
                setCreateError(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {duplicateWarning && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <div className="flex gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Duplicate Medication Warning</h3>
                  <p className="text-sm text-yellow-800 mb-3">{duplicateWarning}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDuplicateWarning(null);
                        setFormData({ patientId: '', pharmacyId: '', medName: '', dosage: '', frequency: '', duration: '' });
                      }}
                      className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 text-sm font-medium hover:bg-yellow-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDuplicateWarning(null);
                        handleCreate('duplicate_ok');
                      }}
                      className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700"
                    >
                      Prescribe Anyway
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {interactionWarnings.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Drug Interaction Warning</h3>
                  <div className="space-y-2 text-sm text-red-800 mb-4">
                    {interactionWarnings.map((interaction) => (
                      <div key={interaction.id} className="bg-white p-2 rounded border border-red-100">
                        <div className="font-medium">
                          {interaction.drug1} + {interaction.drug2}
                        </div>
                        <div className="text-xs text-red-700">{interaction.description}</div>
                        <div className="text-xs text-red-600 mt-1">
                          <strong>Management:</strong> {interaction.management}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mb-3">
                    <label className="text-sm font-medium text-red-900 mb-1.5 block">Clinical Justification (required to proceed)</label>
                    <textarea
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Explain why this interaction is acceptable in this clinical context..."
                      className="w-full h-20 p-2 rounded border border-red-200 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInteractionWarnings([]);
                        setOverrideReason('');
                        setFormData({ patientId: '', pharmacyId: '', medName: '', dosage: '', frequency: '', duration: '' });
                      }}
                      className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200"
                    >
                      Cancel Prescription
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (overrideReason.trim()) {
                          setInteractionWarnings([]);
                          handleCreate('interactions_ok');
                        }
                      }}
                      disabled={!overrideReason.trim()}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Proceed with Override
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Patient</label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select patient</option>
                {patientOptions.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Pharmacy</label>
              <select
                value={formData.pharmacyId}
                onChange={(e) => setFormData({ ...formData, pharmacyId: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select pharmacy</option>
                {pharmacyOptions.map((pharmacy) => (
                  <option key={pharmacy.id} value={pharmacy.id}>{pharmacy.name}</option>
                ))}
              </select>
            </div>
            {[{ l: 'Medication', k: 'medName', p: 'Medication name' }, { l: 'Dosage', k: 'dosage', p: 'e.g. 500mg' }, { l: 'Frequency', k: 'frequency', p: 'e.g. 3x daily' }, { l: 'Duration', k: 'duration', p: 'e.g. 7 days' }].map((field) => (
              <div key={field.k}>
                <label className="text-sm font-medium text-card-foreground mb-1.5 block">{field.l}</label>
                <input
                  value={(formData as Record<string, string>)[field.k]}
                  onChange={(e) => setFormData({ ...formData, [field.k]: e.target.value })}
                  placeholder={field.p}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleCreate()}
            className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Issue Prescription'}
          </button>
        </motion.div>
      )}

      {filteredPrescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">{visiblePrescriptions.length === 0 ? 'No prescriptions yet' : 'No prescriptions match your current search or filter'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPrescriptions.map((prescription, index) => (
            <motion.div
              key={prescription.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-card rounded-2xl border p-5 ${focusId === prescription.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-base font-medium text-card-foreground">
                      {effectiveRole === 'patient' || effectiveRole === 'pharmacy' ? prescription.doctorName : prescription.patientName}
                    </div>
                    {prescription.pharmacyName ? <div className="text-xs text-muted-foreground">Pharmacy: {prescription.pharmacyName}</div> : null}
                    <div className="text-sm text-muted-foreground">
                      {prescription.medications.map((medication) => `${medication.name} ${medication.dosage} — ${medication.frequency} for ${medication.duration}`).join('; ')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{prescription.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${prescription.status === 'active' ? 'bg-success/10 text-success' : prescription.status === 'dispensed' ? 'bg-info/10 text-info' : 'bg-muted text-muted-foreground'}`}
                  >
                    {prescription.status}
                  </span>
                  {effectiveRole === 'doctor' && (
                    <button
                      type="button"
                      disabled={deleteId === prescription.id}
                      onClick={() => void handleDelete(prescription.id)}
                      className="px-3 py-1 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 disabled:opacity-50"
                    >
                      <span className="inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> {deleteId === prescription.id ? '…' : 'Delete'}</span>
                    </button>
                  )}
                  {effectiveRole === 'pharmacy' && prescription.status === 'active' && (
                    <button
                      type="button"
                      disabled={dispenseId === prescription.id}
                      onClick={() => void handleDispense(prescription.id)}
                      className="px-3 py-1 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20 disabled:opacity-50"
                    >
                      {dispenseId === prescription.id ? '…' : 'Dispense'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionsPage;
