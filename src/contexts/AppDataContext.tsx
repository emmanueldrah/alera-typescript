import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AmbulanceRequest, Appointment, ImagingScan, LabTest, Prescription, VitalSigns, HealthMetric, InventoryItem, AmbulanceVehicle, Referral, ProviderVerification, PatientAllergy, PatientMedicalHistory, PatientConsent, DrugInteraction, ClinicalNote, PatientProblem, MedicationAdherence, ProviderPricing, ServiceCharge, Invoice, BillingRecord, AppointmentReminder } from '@/data/mockData';
import { ambulances as mockAmbulances, inventoryItems as mockInventoryItems, referrals as mockReferrals, providerVerifications as mockVerifications, drugInteractionDatabase as mockDrugInteractions, patientAllergies as mockAllergies, medicalHistories as mockMedicalHistories, patientConsents as mockConsents } from '@/data/mockData';
import { storageKeys } from '@/lib/storageKeys';
import { AppDataContext, type AppDataContextType } from './app-data-context';

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

const STORAGE_KEY = storageKeys.appData;

const safeParse = (raw: string | null): StoredAppData => {
  if (!raw) {
    return {
      ...emptyData,
      ambulances: mockAmbulances,
      inventoryItems: mockInventoryItems,
      referrals: mockReferrals,
      providerVerifications: mockVerifications,
    };
  }
  try {
    const parsed = JSON.parse(raw) as StoredAppData;
    return {
      ...emptyData,
      ...parsed,
      ambulances: parsed.ambulances && parsed.ambulances.length > 0 ? parsed.ambulances : mockAmbulances,
      inventoryItems: parsed.inventoryItems && parsed.inventoryItems.length > 0 ? parsed.inventoryItems : mockInventoryItems,
      referrals: parsed.referrals && parsed.referrals.length > 0 ? parsed.referrals : mockReferrals,
      providerVerifications: parsed.providerVerifications && parsed.providerVerifications.length > 0 ? parsed.providerVerifications : mockVerifications,
    };
  } catch {
    return {
      ...emptyData,
      ambulances: mockAmbulances,
      inventoryItems: mockInventoryItems,
      referrals: mockReferrals,
      providerVerifications: mockVerifications,
    };
  }
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StoredAppData>(emptyData);

  useEffect(() => {
    setData(safeParse(localStorage.getItem(STORAGE_KEY)));

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setData(safeParse(event.newValue));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateData = useCallback((updater: (current: StoredAppData) => StoredAppData) => {
    setData((current) => {
      const next = updater(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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
    cancelAppointment: (id, reason, cancelledBy) => updateData((current) => ({
      ...current,
      appointments: current.appointments.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              status: 'cancelled' as const,
              cancellationReason: reason,
              cancelledBy,
              cancellationTime: new Date().toISOString(),
            }
          : appointment,
      ),
    })),
    confirmAppointment: (id) => updateData((current) => ({
      ...current,
      appointments: current.appointments.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: 'confirmed-by-doctor' as const, doctorConfirmed: true, doctorConfirmationTime: new Date().toISOString() }
          : appointment,
      ),
    })),
    rescheduleAppointment: (id, newDate, newTime) => updateData((current) => {
      const originalAppointment = current.appointments.find((apt) => apt.id === id);
      if (!originalAppointment) return current;
      return {
        ...current,
        appointments: [
          ...current.appointments.map((appointment) =>
            appointment.id === id ? { ...appointment, status: 'rescheduled' as const, date: newDate, time: newTime } : appointment,
          ),
        ],
      };
    }),
    
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
        doctorId: appointment.doctorId,
        reminderType,
        notificationMethod: 'in-app' as const,
        status: 'pending' as const,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        location: appointment.location || 'TBD',
        sentAt: null,
        acknowledgedAt: null,
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
  }), [data, updateData]);

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};
