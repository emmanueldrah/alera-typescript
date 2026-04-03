import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AmbulanceRequest, Appointment, ImagingScan, LabTest, Prescription, VitalSigns, HealthMetric, InventoryItem, AmbulanceVehicle, Referral, ProviderVerification, PatientAllergy, PatientMedicalHistory, PatientConsent, DrugInteraction, ClinicalNote, PatientProblem, MedicationAdherence, ProviderPricing, ServiceCharge, Invoice, BillingRecord, AppointmentReminder } from '@/data/mockData';
import { ambulances as mockAmbulances, inventoryItems as mockInventoryItems, referrals as mockReferrals, providerVerifications as mockVerifications, drugInteractionDatabase as mockDrugInteractions, patientAllergies as mockAllergies, medicalHistories as mockMedicalHistories, patientConsents as mockConsents } from '@/data/mockData';
import { getAppDataStorageKey, storageKeys } from '@/lib/storageKeys';
import { AppDataContext, type AppDataContextType } from './app-data-context';
import { appointmentsApi, prescriptionsApi, allergiesApi, api } from '@/lib/apiService';
import { useAuth } from './useAuth';
import { buildScheduledIso } from '@/lib/appointmentUtils';

type BackendAppointment = {
  id: string | number;
  patient_id: string | number;
  provider_id: string | number;
  title: string;
  description?: string;
  scheduled_time: string;
  appointment_type?: string;
  status?: string;
  notes?: string;
  patient_name?: string | null;
  provider_name?: string | null;
};

type BackendPrescription = {
  id: string | number;
  medication_name: string;
  dosage: string;
  dosage_unit?: string;
  frequency: string;
  route?: string;
  instructions?: string | null;
  quantity?: number | null;
  provider_id: string | number;
  patient_id: string | number;
  status?: string;
  refills?: number;
  refills_remaining?: number;
  prescribed_date?: string;
  created_at?: string;
  patient_name?: string | null;
  provider_name?: string | null;
};

type BackendAllergy = {
  id: string | number;
  patient_id: string | number;
  allergen: string;
  allergen_type: string;
  severity: PatientAllergy['severity'];
  reaction_description: string;
  treatment?: string;
  onset_date?: string;
  created_at?: string;
};

const getListPayload = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === 'object' && value !== null && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: T[] }).items;
  }

  return [];
};

interface StoredAppData {
  appointments: Appointment[];
  prescriptions: Prescription[];
  labTests: LabTest[];
  imagingScans: ImagingScan[];
  ambulanceRequests: AmbulanceRequest[];
  vitalSigns: VitalSigns[];
  healthMetrics: HealthMetric[];
  inventoryItems: InventoryItem[];
  ambulances: AmbulanceVehicle[];
  referrals: Referral[];
  providerVerifications: ProviderVerification[];
  patientAllergies: PatientAllergy[];
  medicalHistories: PatientMedicalHistory[];
  patientConsents: PatientConsent[];
  clinicalNotes: ClinicalNote[];
  patientProblems: PatientProblem[];
  medicationAdherence: MedicationAdherence[];
  providerPricing: ProviderPricing[];
  serviceCharges: ServiceCharge[];
  invoices: Invoice[];
  billingRecords: BillingRecord[];
  appointmentReminders: AppointmentReminder[];
}

const emptyData: StoredAppData = {
  appointments: [],
  prescriptions: [],
  labTests: [],
  imagingScans: [],
  ambulanceRequests: [],
  vitalSigns: [],
  healthMetrics: [],
  inventoryItems: [],
  ambulances: [],
  referrals: [],
  providerVerifications: [],
  patientAllergies: [],
  medicalHistories: [],
  patientConsents: [],
  clinicalNotes: [],
  patientProblems: [],
  medicationAdherence: [],
  providerPricing: [],
  serviceCharges: [],
  invoices: [],
  billingRecords: [],
  appointmentReminders: [],
};

const safeParse = (raw: string | null): StoredAppData => {
  if (!raw) {
    return { ...emptyData };
  }
  try {
    const parsed = JSON.parse(raw) as StoredAppData;
    return { ...emptyData, ...parsed };
  } catch {
    return { ...emptyData };
  }
};

// No-op - moved import to top


type BackendLabTest = {
  id: number;
  test_name: string;
  test_code?: string;
  description?: string;
  status: string;
  result_value?: string;
  result_unit?: string;
  reference_range?: string;
  result_notes?: string;
  result_file_url?: string;
  ordered_at: string;
  collected_at?: string;
  completed_at?: string;
  patient_id: number;
  ordered_by: number;
};

type BackendImagingScan = {
  id: number;
  scan_type: 'X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound' | 'PET Scan' | 'DEXA Scan';
  body_part?: string;
  clinical_indication?: string;
  status: string;
  findings?: string;
  impression?: string;
  report_url?: string;
  image_url?: string;
  ordered_at: string;
  scheduled_at?: string;
  completed_at?: string;
  patient_id: number;
  ordered_by: number;
};

const mapBackendStatus = (raw?: string): Appointment['status'] => {
  const s = (raw || 'scheduled').toLowerCase().replace(/_/g, '-');
  if (s === 'in-progress') return 'in-progress';
  if (s === 'confirmed') return 'confirmed-by-doctor';
  if (s === 'rescheduled') return 'rescheduled';
  if (s === 'completed') return 'completed';
  if (s === 'cancelled') return 'cancelled';
  if (s === 'scheduled') return 'scheduled';
  return 'scheduled';
};

// Helper to convert backend appointment to frontend format
const mapBackendAppointment = (apt: BackendAppointment): Appointment => {
  const at = (apt.appointment_type || 'telehealth').toLowerCase();
  const tele = at === 'telehealth' || at === 'phone';
  const st = new Date(apt.scheduled_time);
  return {
    id: String(apt.id),
    patientId: String(apt.patient_id),
    patientName: apt.patient_name?.trim() || `Patient #${apt.patient_id}`,
    doctorId: String(apt.provider_id),
    doctorName: apt.provider_name?.trim() || `Provider #${apt.provider_id}`,
    date: st.toISOString().slice(0, 10),
    time: st.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: apt.title || (tele ? 'Telehealth' : 'In-Person'),
    appointmentMode: tele ? 'telemedicine' : 'in-person',
    status: mapBackendStatus(apt.status),
    notes: apt.notes || apt.description || apt.title,
    doctorConfirmed: mapBackendStatus(apt.status) === 'confirmed-by-doctor',
  };
};

const mapBackendPrescriptionStatus = (raw?: string): Prescription['status'] => {
  const s = (raw || 'active').toLowerCase();
  if (s === 'dispensed') return 'dispensed';
  if (s === 'expired' || s === 'discontinued') return 'expired';
  return 'active';
};

// Helper to convert backend prescription to frontend format
const mapBackendPrescription = (presc: BackendPrescription): Prescription => {
  const total = presc.refills ?? 0;
  const remaining = presc.refills_remaining ?? total;
  const refillsUsed = Math.max(0, total - remaining);
  const duration =
    presc.quantity != null && presc.quantity > 0
      ? `${presc.quantity} units`
      : presc.instructions?.trim()
        ? presc.instructions
        : 'As directed';
  const dosageLabel = [presc.dosage, presc.dosage_unit].filter(Boolean).join(' ').trim() || presc.dosage;

  return {
    id: String(presc.id),
    patientName: presc.patient_name?.trim() || `Patient #${presc.patient_id}`,
    patientId: String(presc.patient_id),
    doctorName: presc.provider_name?.trim() || `Provider #${presc.provider_id}`,
    doctorId: String(presc.provider_id),
    date: presc.prescribed_date ? presc.prescribed_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    medications: [{
      name: presc.medication_name,
      dosage: dosageLabel,
      frequency: presc.frequency,
      duration,
    }],
    status: mapBackendPrescriptionStatus(presc.status),
    refillsAllowed: total,
    refillsUsed,
  };
};

// Helper to convert backend allergy to frontend format
const mapBackendAllergy = (allergy: BackendAllergy): PatientAllergy => ({
  id: String(allergy.id),
  patientId: String(allergy.patient_id),
  allergen: allergy.allergen,
  allergyType: (allergy.allergen_type.toLowerCase() || 'other') as PatientAllergy['allergyType'],
  severity: (allergy.severity.toLowerCase() || 'mild') as PatientAllergy['severity'],
  reaction: allergy.reaction_description,
  dateIdentified: allergy.onset_date || allergy.created_at,
  addedDate: allergy.created_at,
  status: 'active',
  notes: allergy.treatment || '',
});

const mapBackendLabTest = (test: BackendLabTest): LabTest => ({
  id: String(test.id),
  patientId: String(test.patient_id),
  patientName: `Patient #${test.patient_id}`,
  doctorId: String(test.ordered_by),
  doctorName: `Provider #${test.ordered_by}`,
  testName: test.test_name,
  date: test.ordered_at.slice(0, 10),
  status: (test.status.toLowerCase() || 'requested') as LabTest['status'],
  results: test.result_value && test.result_unit ? `${test.result_value} ${test.result_unit}` : undefined,
  referenceRange: test.reference_range,
  notes: test.result_notes,
});

const mapBackendImagingScan = (scan: BackendImagingScan): ImagingScan => ({
  id: String(scan.id),
  patientId: String(scan.patient_id),
  patientName: `Patient #${scan.patient_id}`,
  doctorId: String(scan.ordered_by),
  doctorName: `Provider #${scan.ordered_by}`,
  scanType: scan.scan_type,
  bodyPart: scan.body_part || 'Unspecified',
  date: scan.ordered_at.slice(0, 10),
  status: (scan.status.toLowerCase() || 'requested') as ImagingScan['status'],
  results: scan.findings,
});

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user ? getAppDataStorageKey(user.email) : storageKeys.appData;

  const [data, setData] = useState<StoredAppData>(emptyData);
  const [isLoadingAPI, setIsLoadingAPI] = useState(true);

  // Load data from API
  const loadAPIData = useCallback(async (isPolling = false) => {
    try {
      const stored = safeParse(localStorage.getItem(storageKey));
      const token = localStorage.getItem('access_token');
      if (!token) {
        if (!isPolling) {
          setIsLoadingAPI(false);
          setData(stored);
        }
        return;
      }

      const [appointmentsRes, prescriptionsRes, allergiesRes, labRes, imagingRes] = await Promise.allSettled([
        appointmentsApi.listAppointments(0, 100),
        prescriptionsApi.listPrescriptions(0, 100),
        allergiesApi.listAllergies(0, 100),
        api.labTests.listLabTests(0, 100),
        api.imaging.listImagingScans(0, 100),
      ]);

      const appointments = appointmentsRes.status === 'fulfilled'
        ? getListPayload<BackendAppointment>(appointmentsRes.value).map(mapBackendAppointment)
        : [];

      const prescriptions = prescriptionsRes.status === 'fulfilled'
        ? getListPayload<BackendPrescription>(prescriptionsRes.value).map(mapBackendPrescription)
        : [];

      const patientAllergies = allergiesRes.status === 'fulfilled'
        ? getListPayload<BackendAllergy>(allergiesRes.value).map(mapBackendAllergy)
        : [];

      const labTests = labRes.status === 'fulfilled'
        ? getListPayload<BackendLabTest>(labRes.value).map(mapBackendLabTest)
        : [];

      const imagingScans = imagingRes.status === 'fulfilled'
        ? getListPayload<BackendImagingScan>(imagingRes.value).map(mapBackendImagingScan)
        : [];

      setData((current) => ({
        ...current,
        appointments,
        prescriptions,
        patientAllergies,
        labTests,
        imagingScans,
        // These may be local-only for now; keep what we already had cached for this user.
        ambulances: stored.ambulances,
        inventoryItems: stored.inventoryItems,
        referrals: stored.referrals,
        providerVerifications: stored.providerVerifications,
      }));
    } catch (error) {
      if (!isPolling) console.error('Failed to load API data:', error);
    } finally {
      if (!isPolling) setIsLoadingAPI(false);
    }
  }, [storageKey]);

  const refreshAppData = useCallback(async () => {
    await loadAPIData(true);
  }, [loadAPIData]);

  // Initial load and polling
  useEffect(() => {
    loadAPIData();

    const interval = setInterval(() => {
      loadAPIData(true);
    }, 30000); // Poll every 30 seconds for real-time updates

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'access_token') return;
      loadAPIData(); // Reload data if auth changes
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadAPIData]);


  const updateData = useCallback((updater: (current: StoredAppData) => StoredAppData) => {
    setData((current) => {
      const next = updater(current);
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const contextValue = useMemo<AppDataContextType>(() => ({
    appointments: data.appointments,
    prescriptions: data.prescriptions,
    labTests: data.labTests,
    imagingScans: data.imagingScans,
    ambulanceRequests: data.ambulanceRequests,
    vitalSigns: data.vitalSigns,
    healthMetrics: data.healthMetrics,
    inventoryItems: data.inventoryItems,
    ambulances: data.ambulances,
    referrals: data.referrals,
    providerVerifications: data.providerVerifications,
    patientAllergies: data.patientAllergies,
    medicalHistories: data.medicalHistories,
    patientConsents: data.patientConsents,
    clinicalNotes: data.clinicalNotes,
    patientProblems: data.patientProblems,
    medicationAdherence: data.medicationAdherence,
    providerPricing: data.providerPricing,
    serviceCharges: data.serviceCharges,
    invoices: data.invoices,
    billingRecords: data.billingRecords,
    drugInteractionDatabase: mockDrugInteractions,
    
    addAppointment: (appointment) => updateData((current) => ({ ...current, appointments: [appointment, ...current.appointments] })),
    updateAppointment: (id, update) => updateData((current) => ({
      ...current,
      appointments: current.appointments.map((appointment) => appointment.id === id ? update(appointment) : appointment),
    })),
    cancelAppointment: (id, reason, cancelledBy) => {
      void (async () => {
        try {
          await appointmentsApi.updateAppointment(id, {
            status: 'cancelled',
            cancellation_reason: reason,
          });
          await loadAPIData(true);
        } catch (error) {
          console.error('cancelAppointment failed:', error);
        }
      })();
      void cancelledBy;
    },
    confirmAppointment: (id) => {
      void (async () => {
        try {
          await appointmentsApi.updateAppointment(id, { status: 'confirmed' });
          await loadAPIData(true);
        } catch (error) {
          console.error('confirmAppointment failed:', error);
        }
      })();
    },
    rescheduleAppointment: (id, newDate, newTime) => {
      void (async () => {
        try {
          const scheduled_time = buildScheduledIso(newDate, newTime);
          await appointmentsApi.updateAppointment(id, {
            scheduled_time,
            status: 'rescheduled',
          });
          await loadAPIData(true);
        } catch (error) {
          console.error('rescheduleAppointment failed:', error);
        }
      })();
    },
    refreshAppData,
    
    addPrescription: (prescription) => updateData((current) => ({ ...current, prescriptions: [prescription, ...current.prescriptions] })),
    updatePrescription: (id, update) => updateData((current) => ({
      ...current,
      prescriptions: current.prescriptions.map((prescription) => prescription.id === id ? update(prescription) : prescription),
    })),
    requestPrescriptionRefill: (prescriptionId) => updateData((current) => ({
      ...current,
      prescriptions: current.prescriptions.map((prescription) => {
        if (prescription.id !== prescriptionId) return prescription;
        const refillRequests = prescription.refillRequests ?? [];
        const newRefill = { id: `refill-${Date.now()}`, requestDate: new Date().toISOString().split('T')[0], status: 'pending' as const };
        return { ...prescription, refillRequests: [...refillRequests, newRefill] };
      }),
    })),
    
    addLabTest: (test) => updateData((current) => ({ ...current, labTests: [test, ...current.labTests] })),
    updateLabTest: (id, update) => updateData((current) => ({
      ...current,
      labTests: current.labTests.map((test) => test.id === id ? update(test) : test),
    })),
    addImagingScan: (scan) => updateData((current) => ({ ...current, imagingScans: [scan, ...current.imagingScans] })),
    updateImagingScan: (id, update) => updateData((current) => ({
      ...current,
      imagingScans: current.imagingScans.map((scan) => scan.id === id ? update(scan) : scan),
    })),
    addAmbulanceRequest: (request) => updateData((current) => ({ ...current, ambulanceRequests: [request, ...current.ambulanceRequests] })),
    updateAmbulanceRequest: (id, update) => updateData((current) => ({
      ...current,
      ambulanceRequests: current.ambulanceRequests.map((request) => request.id === id ? update(request) : request),
    })),
    addVitalSigns: (vital) => updateData((current) => ({ ...current, vitalSigns: [vital, ...current.vitalSigns] })),
    addHealthMetric: (metric) => updateData((current) => ({ ...current, healthMetrics: [metric, ...current.healthMetrics] })),
    updateInventoryItem: (id, update) => updateData((current) => ({
      ...current,
      inventoryItems: current.inventoryItems.map((item) => item.id === id ? update(item) : item),
    })),
    updateAmbulance: (id, update) => updateData((current) => ({
      ...current,
      ambulances: current.ambulances.map((ambulance) => ambulance.id === id ? update(ambulance) : ambulance),
    })),
    addReferral: (referral) => updateData((current) => ({ ...current, referrals: [referral, ...current.referrals] })),
    updateReferral: (id, update) => updateData((current) => ({
      ...current,
      referrals: current.referrals.map((referral) => referral.id === id ? update(referral) : referral),
    })),
    addProviderVerification: (verification) => updateData((current) => ({ ...current, providerVerifications: [verification, ...current.providerVerifications] })),
    updateProviderVerification: (id, update) => updateData((current) => ({
      ...current,
      providerVerifications: current.providerVerifications.map((verification) => verification.id === id ? update(verification) : verification),
    })),
    
    // Allergy and drug interaction management
    addAllergy: (allergy) => updateData((current) => ({ ...current, patientAllergies: [allergy, ...current.patientAllergies] })),
    removeAllergy: (allergyId) => updateData((current) => ({
      ...current,
      patientAllergies: current.patientAllergies.filter((allergy) => allergy.id !== allergyId),
    })),
    addMedicalHistory: (history) => updateData((current) => ({ ...current, medicalHistories: [history, ...current.medicalHistories] })),
    updateMedicalHistory: (id, update) => updateData((current) => ({
      ...current,
      medicalHistories: current.medicalHistories.map((history) => history.id === id ? update(history) : history),
    })),
    addPatientConsent: (consent) => updateData((current) => ({ ...current, patientConsents: [consent, ...current.patientConsents] })),
    updatePatientConsent: (id, update) => updateData((current) => ({
      ...current,
      patientConsents: current.patientConsents.map((consent) => consent.id === id ? update(consent) : consent),
    })),
    checkDrugInteractions: (medications) => {
      const interactions: DrugInteraction[] = [];
      for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
          const interaction = mockDrugInteractions.find(
            (di) =>
              (di.drug1.toLowerCase() === medications[i].toLowerCase() && di.drug2.toLowerCase() === medications[j].toLowerCase()) ||
              (di.drug1.toLowerCase() === medications[j].toLowerCase() && di.drug2.toLowerCase() === medications[i].toLowerCase()),
          );
          if (interaction) interactions.push(interaction);
        }
      }
      return interactions;
    },
    getPatientAllergies: (patientId) => data.patientAllergies.filter((allergy) => allergy.patientId === patientId),
    
    // Clinical Notes Management (P2)
    addClinicalNote: (note) => updateData((current) => ({ ...current, clinicalNotes: [note, ...current.clinicalNotes] })),
    updateClinicalNote: (id, update) => updateData((current) => ({
      ...current,
      clinicalNotes: current.clinicalNotes.map((note) => note.id === id ? update(note) : note),
    })),
    
    // Patient Problem List Management (P2)
    addPatientProblem: (problem) => updateData((current) => ({ ...current, patientProblems: [problem, ...current.patientProblems] })),
    updatePatientProblem: (id, update) => updateData((current) => ({
      ...current,
      patientProblems: current.patientProblems.map((problem) => problem.id === id ? update(problem) : problem),
    })),
    
    // Medication Adherence Tracking (P2)
    updateMedicationAdherence: (id, update) => updateData((current) => ({
      ...current,
      medicationAdherence: current.medicationAdherence.map((adherence) => adherence.id === id ? update(adherence) : adherence),
    })),
    recordMedicationAdherence: (adherence) => updateData((current) => ({ ...current, medicationAdherence: [adherence, ...current.medicationAdherence] })),
    
    // Billing & Payment System (Ghana-specific)
    setProviderPricing: (pricing) => updateData((current) => {
      const existing = current.providerPricing.findIndex((p) => p.id === pricing.id);
      const newPricing = existing >= 0
        ? current.providerPricing.map((p, i) => i === existing ? pricing : p)
        : [pricing, ...current.providerPricing];
      const record: BillingRecord = {
        id: `br-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: existing >= 0 ? 'pricing-updated' : 'pricing-created',
        actionBy: pricing.providerId,
        actionByName: pricing.providerName,
        affectedProviderId: pricing.providerId,
        details: `${existing >= 0 ? 'Updated' : 'Created'} pricing for ${pricing.serviceDescription}: GHS ${pricing.priceGHS}`,
      };
      return { ...current, providerPricing: newPricing, billingRecords: [record, ...current.billingRecords] };
    }),
    getProviderPricing: (providerId) => data.providerPricing.filter((p) => p.providerId === providerId),
    
    createServiceCharge: (charge) => updateData((current) => {
      const record: BillingRecord = {
        id: `br-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'charge-created',
        actionBy: charge.providerId,
        actionByName: charge.providerName,
        affectedPatientId: charge.patientId,
        affectedProviderId: charge.providerId,
        amountGHS: charge.amountGHS,
        details: `Service charge created: ${charge.serviceDescription} (GHS ${charge.amountGHS}) for patient ${charge.patientId}`,
      };
      return { ...current, serviceCharges: [charge, ...current.serviceCharges], billingRecords: [record, ...current.billingRecords] };
    }),
    
    createInvoice: (invoice) => updateData((current) => {
      const record: BillingRecord = {
        id: `br-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'invoice-created',
        actionBy: 'system',
        actionByName: 'System',
        affectedPatientId: invoice.patientId,
        relatedInvoiceId: invoice.id,
        amountGHS: invoice.totalAmountGHS,
        details: `Invoice ${invoice.id} created for patient ${invoice.patientName}: GHS ${invoice.totalAmountGHS}`,
      };
      return { ...current, invoices: [invoice, ...current.invoices], billingRecords: [record, ...current.billingRecords] };
    }),
    
    recordPayment: (invoiceId, paymentMethod, amountGHS) => updateData((current) => {
      const invoice = current.invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) return current;
      const newPaymentMethods = [...(invoice.paymentMethods || []), { method: paymentMethod, amountGHS, date: new Date().toISOString().split('T')[0], transactionId: `tx-${Date.now()}` }];
      const totalPaid = newPaymentMethods.reduce((sum, p) => sum + p.amountGHS, 0);
      const outstanding = Math.max(0, invoice.totalAmountGHS - totalPaid);
      const updatedInvoice: Invoice = {
        ...invoice,
        amountPaidGHS: totalPaid,
        outstandingAmountGHS: outstanding,
        paymentMethods: newPaymentMethods,
        status: outstanding === 0 ? 'paid' : totalPaid > 0 ? 'partially-paid' : invoice.status,
      };
      const record: BillingRecord = {
        id: `br-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'payment-recorded',
        actionBy: 'system',
        actionByName: 'System',
        affectedPatientId: invoice.patientId,
        relatedInvoiceId: invoiceId,
        amountGHS,
        details: `Payment of GHS ${amountGHS} recorded via ${paymentMethod} for invoice ${invoiceId}`,
      };
      return {
        ...current,
        invoices: current.invoices.map((inv) => inv.id === invoiceId ? updatedInvoice : inv),
        billingRecords: [record, ...current.billingRecords],
      };
    }),
    
    getPatientBalance: (patientId) => {
      const patientInvoices = data.invoices.filter((inv) => inv.patientId === patientId);
      return patientInvoices.reduce((sum, inv) => sum + inv.outstandingAmountGHS, 0);
    },
    
    addBillingRecord: (record) => updateData((current) => ({ ...current, billingRecords: [record, ...current.billingRecords] })),
    getClinicalNotes: (patientId) => data.clinicalNotes.filter((note) => note.patientId === patientId),
    getPatientProblems: (patientId) => data.patientProblems.filter((problem) => problem.patientId === patientId),
    getAllBillingRecords: () => data.billingRecords,
    getInvoices: (patientId) => data.invoices.filter((inv) => inv.patientId === patientId),
    
    // Smart Appointment Reminders
    appointmentReminders: data.appointmentReminders,
    generateAppointmentReminders: (appointmentId, reminderTypes) => updateData((current) => {
      const appointment = current.appointments.find((apt) => apt.id === appointmentId);
      if (!appointment) return current;
      
      const newReminders: AppointmentReminder[] = reminderTypes.map((reminderType) => ({
        id: `reminder-${Date.now()}-${Math.random()}`,
        appointmentId,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        reminderType,
        notificationMethod: 'in-app' as const,
        status: 'pending' as const,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        message: `Reminder: You have an appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time}.`,
        appointmentMode: appointment.appointmentMode,
        sentAt: undefined,
        acknowledgedAt: undefined,
        createdAt: new Date().toISOString(),
      }));
      return { ...current, appointmentReminders: [...newReminders, ...current.appointmentReminders] };
    }),
    
    sendReminder: (reminderId, method) => updateData((current) => ({
      ...current,
      appointmentReminders: current.appointmentReminders.map((reminder) =>
        reminder.id === reminderId
          ? { ...reminder, notificationMethod: method, status: 'sent' as const, sentAt: new Date().toISOString() }
          : reminder,
      ),
    })),
    
    acknowledgeReminder: (reminderId, patientId) => updateData((current) => ({
      ...current,
      appointmentReminders: current.appointmentReminders.map((reminder) =>
        reminder.id === reminderId && reminder.patientId === patientId
          ? { ...reminder, status: 'acknowledged' as const, acknowledgedAt: new Date().toISOString() }
          : reminder,
      ),
    })),
    
    getPatientReminders: (patientId) => data.appointmentReminders.filter((reminder) => reminder.patientId === patientId),
    
    getReminderByAppointment: (appointmentId) => data.appointmentReminders.filter((reminder) => reminder.appointmentId === appointmentId),
    
    updateReminderStatus: (reminderId, status) => updateData((current) => ({
      ...current,
      appointmentReminders: current.appointmentReminders.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, status } : reminder,
      ),
    })),
  }), [data, updateData, loadAPIData, refreshAppData]);

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};
