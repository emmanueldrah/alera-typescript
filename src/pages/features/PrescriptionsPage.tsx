import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, X, Inbox, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { type Prescription } from '@/data/mockData';
import { getDoctorPatients } from '@/lib/patientDirectory';
import { getVisiblePrescriptions } from '@/lib/recordVisibility';

const PrescriptionsPage = () => {
  const { user, getUsers } = useAuth();
  const { appointments, prescriptions, addPrescription, updatePrescription, checkDrugInteractions } = useAppData();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ patientId: '', medName: '', dosage: '', frequency: '', duration: '' });
  const [interactionWarnings, setInteractionWarnings] = useState<Array<{ severity: string; message: string; drugs: string[] }>>([]);
  const [overrideReason, setOverrideReason] = useState('');
  const [confirmedWithWarnings, setConfirmedWithWarnings] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [confirmedDuplicate, setConfirmedDuplicate] = useState(false);
  const focusId = searchParams.get('focus');
  const users = getUsers();
  const patientOptions = useMemo(() => getDoctorPatients(users, appointments, user?.id), [appointments, user?.id, users]);
  const visiblePrescriptions = useMemo(
    () => getVisiblePrescriptions(prescriptions, user),
    [prescriptions, user],
  );

  const handleCreate = () => {
    if (!formData.patientId || !formData.medName) return;
    const patient = patientOptions.find((option) => option.id === formData.patientId);
    if (!patient) return;

    // Check for duplicate medications
    const patientPrescriptions = prescriptions.filter((p) => p.patientId === formData.patientId && p.status === 'active');
    const currentMeds = patientPrescriptions.flatMap((p) => p.medications.map((m) => m.name));
    const isDuplicate = currentMeds.some((med) => med.toLowerCase() === formData.medName.toLowerCase());

    // If duplicate and not confirmed, show warning
    if (isDuplicate && !confirmedDuplicate) {
      setDuplicateWarning(`${formData.medName} is already prescribed to this patient`);
      return;
    }

    // Check for drug interactions
    const interactions = checkDrugInteractions([...currentMeds, formData.medName]);
    const relevantInteractions = interactions.filter((i) => 
      (currentMeds.includes(i.drug1) && i.drug2.toLowerCase() === formData.medName.toLowerCase()) ||
      (currentMeds.includes(i.drug2) && i.drug1.toLowerCase() === formData.medName.toLowerCase())
    );

    // If there are interactions and not confirmed, show warnings
    if (relevantInteractions.length > 0 && !confirmedWithWarnings) {
      setInteractionWarnings(relevantInteractions);
      return;
    }

    const prescription: Prescription = {
      id: `rx-${Date.now()}`,
      patientName: patient.name,
      patientId: patient.id,
      doctorName: user?.name || 'Doctor',
      doctorId: user?.id || '',
      date: new Date().toISOString().split('T')[0],
      medications: [{ name: formData.medName, dosage: formData.dosage, frequency: formData.frequency, duration: formData.duration }],
      status: 'active',
    };

    addPrescription(prescription);
    if (isDuplicate) {
      addNotification({
        title: 'Duplicate Medication Prescribed',
        message: `${formData.medName} was prescribed despite already being on the patient's active prescription list.`,
        type: 'prescription',
        priority: 'high',
        audience: 'personal',
        targetRoles: ['pharmacy'],
      });
    }
    if (relevantInteractions.length > 0) {
      addNotification({
        title: 'Prescription with Drug Interactions',
        message: `${formData.medName} was prescribed despite ${relevantInteractions.length} drug interaction(s). Reason: ${overrideReason}`,
        type: 'prescription',
        priority: 'high',
        audience: 'personal',
        targetRoles: ['pharmacy'],
      });
    }
    addNotification({
      title: 'Prescription Issued',
      message: `${formData.medName} was issued for ${patient.name}.`,
      type: 'prescription',
      priority: 'medium',
      audience: 'personal',
      actionUrl: `/dashboard/prescriptions?focus=${prescription.id}`,
      actionLabel: 'Open prescription',
      targetEmails: [user?.email, patient.email].filter((value): value is string => Boolean(value)),
      targetRoles: ['pharmacy'],
      excludeEmails: user?.email ? [user.email] : [],
      actionUrlByRole: {
        doctor: `/dashboard/prescriptions?focus=${prescription.id}`,
        pharmacy: `/dashboard/prescriptions?focus=${prescription.id}`,
      },
    });
    setShowForm(false);
    setFormData({ patientId: '', medName: '', dosage: '', frequency: '', duration: '' });
    setInteractionWarnings([]);
    setOverrideReason('');
    setConfirmedWithWarnings(false);
    setDuplicateWarning(null);
    setConfirmedDuplicate(false);
  };

  const handleDispense = (id: string) => {
    const target = prescriptions.find((prescription) => prescription.id === id);
    updatePrescription(id, (prescription) => ({ ...prescription, status: 'dispensed' as const }));
    if (target) {
      const doctorEmail = users.find((account) => account.id === target.doctorId)?.email;
      const patientEmail = users.find((account) => account.id === target.patientId)?.email;
      addNotification({
        title: 'Prescription Dispensed',
        message: `${target.medications[0]?.name ?? 'Medication'} for ${target.patientName} has been marked as dispensed.`,
        type: 'prescription',
        priority: 'medium',
        audience: 'personal',
        actionUrl: `/dashboard/prescriptions?focus=${target.id}`,
        actionLabel: 'View dispensed item',
        targetEmails: [doctorEmail, patientEmail].filter((value): value is string => Boolean(value)),
        excludeEmails: user?.email ? [user.email] : [],
        actionUrlByRole: {
          pharmacy: `/dashboard/prescriptions?focus=${target.id}`,
          doctor: `/dashboard/prescriptions?focus=${target.id}`,
          patient: `/dashboard/prescriptions?focus=${target.id}`,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">Prescriptions</h1><p className="text-muted-foreground mt-1">{user?.role === 'doctor' ? 'Issue and manage prescriptions' : user?.role === 'pharmacy' ? 'Dispense medications' : 'Your prescriptions'}</p></div>
        {user?.role === 'doctor' && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"><Plus className="w-4 h-4" /> New Prescription</button>}
      </div>
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-display font-semibold text-card-foreground">Issue Prescription</h2><button onClick={() => { setShowForm(false); setInteractionWarnings([]); setDuplicateWarning(null); }} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button></div>
          {duplicateWarning && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <div className="flex gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Duplicate Medication Warning</h3>
                  <p className="text-sm text-yellow-800 mb-3">{duplicateWarning}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setDuplicateWarning(null); setFormData({ patientId: '', medName: '', dosage: '', frequency: '', duration: '' }); }} className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 text-sm font-medium hover:bg-yellow-200">Cancel</button>
                    <button onClick={() => { setConfirmedDuplicate(true); handleCreate(); }} className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700">Prescribe Anyway</button>
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
                  <h3 className="font-semibold text-red-900 mb-2">⚠️ Drug Interaction Warning</h3>
                  <div className="space-y-2 text-sm text-red-800 mb-4">
                    {interactionWarnings.map((interaction) => (
                      <div key={interaction.id} className="bg-white p-2 rounded border border-red-100">
                        <div className="font-medium">{interaction.drug1} + {interaction.drug2}</div>
                        <div className="text-xs text-red-700">{interaction.description}</div>
                        <div className="text-xs text-red-600 mt-1"><strong>Management:</strong> {interaction.management}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mb-3">
                    <label className="text-sm font-medium text-red-900 mb-1.5 block">Clinical Justification (required to proceed)</label>
                    <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} placeholder="Explain why this interaction is acceptable in this clinical context..." className="w-full h-20 p-2 rounded border border-red-200 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setInteractionWarnings([]); setOverrideReason(''); setFormData({ patientId: '', medName: '', dosage: '', frequency: '', duration: '' }); }} className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200">Cancel Prescription</button>
                    <button onClick={() => { if (overrideReason.trim()) { setConfirmedWithWarnings(true); handleCreate(); } }} disabled={!overrideReason.trim()} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">Proceed with Override</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Patient</label>
              <select value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select patient</option>
                {patientOptions.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>
            {[{ l: 'Medication', k: 'medName', p: 'Medication name' }, { l: 'Dosage', k: 'dosage', p: 'e.g. 500mg' }, { l: 'Frequency', k: 'frequency', p: 'e.g. 3x daily' }, { l: 'Duration', k: 'duration', p: 'e.g. 7 days' }].map((field) => (
              <div key={field.k}><label className="text-sm font-medium text-card-foreground mb-1.5 block">{field.l}</label><input value={(formData as Record<string, string>)[field.k]} onChange={(e) => setFormData({ ...formData, [field.k]: e.target.value })} placeholder={field.p} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            ))}
          </div>
          <button onClick={handleCreate} className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">Issue Prescription</button>
        </motion.div>
      )}
      {visiblePrescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">No prescriptions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visiblePrescriptions.map((prescription, index) => (
            <motion.div key={prescription.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`bg-card rounded-2xl border p-5 ${focusId === prescription.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Pill className="w-6 h-6" /></div>
                  <div>
                    <div className="text-base font-medium text-card-foreground">{user?.role === 'patient' || user?.role === 'pharmacy' ? prescription.doctorName : prescription.patientName}</div>
                    <div className="text-sm text-muted-foreground">{prescription.medications.map((medication) => `${medication.name} ${medication.dosage} — ${medication.frequency} for ${medication.duration}`).join('; ')}</div>
                    <div className="text-xs text-muted-foreground mt-1">{prescription.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${prescription.status === 'active' ? 'bg-success/10 text-success' : prescription.status === 'dispensed' ? 'bg-info/10 text-info' : 'bg-muted text-muted-foreground'}`}>{prescription.status}</span>
                  {user?.role === 'pharmacy' && prescription.status === 'active' && <button onClick={() => handleDispense(prescription.id)} className="px-3 py-1 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20">Dispense</button>}
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
