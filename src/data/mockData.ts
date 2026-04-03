// Data types for the ALERA platform

export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress' | 'confirmed-by-doctor' | 'rescheduled';
  type: string;
  appointmentMode: 'telemedicine' | 'in-person';
  notes?: string;
  reminder24hSent?: boolean;
  reminder1hSent?: boolean;
  reminder15mSent?: boolean;
  // New fields for appointment management
  doctorConfirmed?: boolean;
  doctorConfirmationTime?: string;
  cancellationReason?: string;
  cancelledBy?: 'patient' | 'doctor' | 'admin';
  cancellationTime?: string;
  rescheduledFrom?: string; // ID of original appointment
  appointmentFile?: string; // Path to appointment document or notes
}

export interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  date: string;
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
  status: 'active' | 'dispensed' | 'expired';
  pharmacyId?: string;
  // New fields for refill management
  refillsAllowed?: number;
  refillsUsed?: number;
  refillRequests?: Array<{ id: string; requestDate: string; status: 'pending' | 'approved' | 'dispensed'; dispensedDate?: string }>;
  expiryDate?: string;
}

// CRITICAL: Allergy Management System
export interface PatientAllergy {
  id: string;
  patientId: string;
  patientName?: string;
  allergen: string; // e.g. "Penicillin", "Shellfish", "Latex"
  allergyType: 'medication' | 'food' | 'environmental' | 'latex' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reaction: string; // e.g. "Rash", "Anaphylaxis", "Itching"
  dateIdentified: string;
  addedDate: string;
  status: 'active' | 'resolved' | 'suspected';
  notes?: string;
}

// Drug Interaction Database
export interface DrugInteraction {
  id: string;
  drug1: string;
  drug2: string;
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  management: string; // What to do about the interaction
  evidenceLevel: string; // Clinical evidence level
}

// Electronic Health Record (EHR)
export interface PatientMedicalHistory {
  id: string;
  patientId: string;
  conditions: Array<{
    id: string;
    name: string;
    dateOnset: string;
    status: 'active' | 'resolved' | 'chronic';
    notes?: string;
  }>;
  surgeries: Array<{
    id: string;
    name: string;
    date: string;
    surgeon: string;
    hospital: string;
    notes?: string;
  }>;
  familyHistory: Array<{
    id: string;
    relation: string; // "mother", "father", "sibling", etc
    condition: string;
  }>;
  socialHistory: {
    smoking: 'never' | 'former' | 'current';
    alcohol: string;
    drugs: string;
    occupation?: string;
    lastUpdated?: string;
  };
  vaccinations: Array<{
    id: string;
    name: string;
    date: string;
    nextDue?: string;
    provider?: string;
  }>;
  lastUpdated: string;
}

// Patient Consent and Compliance
export interface PatientConsent {
  id: string;
  patientId: string;
  consentType: 'hipaa' | 'research' | 'treatment' | 'medication' | 'procedure';
  consentedDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'revoked';
  consentText?: string;
  revokedDate?: string;
  revokedReason?: string;
}

// Clinical Notes for Doctor Visits
export interface ClinicalNote {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'visit' | 'consultation' | 'follow-up' | 'procedure';
  subjective: string; // Chief complaints and history
  objective: string; // Exam findings, vital signs, test results
  assessment: string; // Diagnosis and clinical impression
  plan: string; // Treatment plan and next steps
  problemIds?: string[]; // Links to problem list
  prescriptionIds?: string[]; // Associated prescriptions
  referralIds?: string[]; // Associated referrals
  status: 'draft' | 'completed' | 'signed';
}

// Patient Problem List (Active Health Issues)
export interface PatientProblem {
  id: string;
  patientId: string;
  problem: string; // e.g. "Type 2 Diabetes", "Hypertension"
  icd10Code?: string; // Medical code
  dateIdentified: string;
  status: 'active' | 'resolved';
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
  treatments?: string[]; // Related prescription IDs or treatment names
}

// Medication Adherence Tracking
export interface MedicationAdherence {
  id: string;
  patientId: string;
  prescriptionId: string;
  medicationName: string;
  startDate: string;
  dueDate?: string;
  adherencePercentage: number; // 0-100
  missedDoses: number;
  totalDoses: number;
  lastDoseDate?: string;
  notes?: string;
}

// BILLING & PAYMENT SYSTEM (Ghana-specific)

// Provider Pricing - Doctor sets their own rates
export interface ProviderPricing {
  id: string;
  providerId: string; // Doctor ID
  providerName: string;
  serviceType: 'consultation' | 'procedure' | 'test' | 'imaging' | 'follow-up' | 'other';
  serviceDescription: string; // e.g. "General Consultation"
  priceGHS: number; // Price in Ghana Cedis
  lastUpdated: string;
  currency: 'GHS'; // Ghana Cedi
  notes?: string; // Any special notes about pricing
}

// Service Charge - Charge applied to an appointment/service
export interface ServiceCharge {
  id: string;
  patientId: string;
  appointmentId?: string; // Link to appointment if applicable
  providerId: string;
  providerName: string;
  serviceType: 'consultation' | 'procedure' | 'test' | 'imaging' | 'follow-up' | 'other';
  serviceDescription: string;
  amountGHS: number; // Charge in GHS
  chargeDate: string;
  invoiceId?: string; // Link to invoice if billed
  status: 'pending' | 'invoiced' | 'paid' | 'written-off';
  notes?: string;
}

// Invoice - Patient bill
export interface Invoice {
  id: string; // Invoice number: INV-2026-0001
  patientId: string;
  patientName: string;
  invoiceDate: string;
  dueDate: string;
  totalAmountGHS: number;
  amountPaidGHS: number;
  outstandingAmountGHS: number;
  currency: 'GHS';
  lineItems: Array<{
    id: string;
    description: string;
    amountGHS: number;
    serviceChargeId: string;
    quantity?: number;
  }>;
  paymentMethods?: Array<{
    method: 'mobile-money' | 'bank-transfer' | 'cash' | 'insurance';
    amountGHS: number;
    date: string;
    transactionId?: string;
  }>;
  status: 'draft' | 'issued' | 'partially-paid' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
}

// Appointment Reminders - Smart notification system
export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  doctorId: string;
  reminderType: '24h' | '1h' | '15m'; // Hours/minutes before appointment
  notificationMethod: 'email' | 'sms' | 'in-app';
  status: 'pending' | 'sent' | 'failed' | 'acknowledged';
  sentAt?: string;
  acknowledgedAt?: string;
  message: string;
  appointmentMode: 'telemedicine' | 'in-person';
  location?: string; // For in-person appointments
  notes?: string;
}

// Billing Record - Admin audit trail
export interface BillingRecord {
  id: string;
  timestamp: string;
  action: 'pricing-created' | 'pricing-updated' | 'charge-created' | 'invoice-created' | 'payment-recorded' | 'invoice-cancelled';
  actionBy: string; // admin or provider id
  actionByName: string;
  affectedPatientId?: string;
  affectedProviderId?: string;
  relatedInvoiceId?: string;
  relatedChargeId?: string;
  amountGHS?: number;
  details: string; // Description of what happened
  ipAddress?: string;
}

export interface LabTest {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  testName: string;
  date: string;
  status: 'requested' | 'in-progress' | 'completed' | 'cancelled';
  results?: string;
  labId?: string;
  // New fields for document management
  documentUrl?: string;
  referenceRange?: string;
  notes?: string;
}

export interface ImagingScan {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  scanType: 'X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound' | 'PET Scan' | 'DEXA Scan';
  date: string;
  status: 'requested' | 'in-progress' | 'completed' | 'cancelled';
  results?: string;
  centerId?: string;
  bodyPart?: string;
}

export interface AmbulanceRequest {
  id: string;
  patientName: string;
  patientId: string;
  location: string;
  date: string;
  time: string;
  status: 'requested' | 'dispatched' | 'en-route' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  vehicleId?: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  type: 'appointment' | 'consultation' | 'lab_test' | 'lab_result' | 'imaging' | 'imaging_result' | 'prescription' | 'ambulance';
  title: string;
  description: string;
  date: string;
  time: string;
  provider?: string;
  status: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'result' | 'prescription' | 'emergency' | 'system';
  read: boolean;
  date: string;
  time: string;
}

export interface PharmacyItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  unit: string;
  reorderLevel: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  status: 'available' | 'dispatched' | 'maintenance';
  crew: string;
  location: string;
}

// Empty data arrays — connect a backend to populate
export const appointments: Appointment[] = [];
export const prescriptions: Prescription[] = [];
export const labTests: LabTest[] = [];
export const imagingScans: ImagingScan[] = [];
export const ambulanceRequests: AmbulanceRequest[] = [];
export const timelineEvents: TimelineEvent[] = [];
export const notifications: Notification[] = [];
export const appointmentReminders: AppointmentReminder[] = [];
export const pharmacyInventory: PharmacyItem[] = [];
export const vehicles: Vehicle[] = [];

// CRITICAL: Allergy Management & Drug Interactions
export const patientAllergies: PatientAllergy[] = [];
export const medicalHistories: PatientMedicalHistory[] = [];
export const patientConsents: PatientConsent[] = [];
export const clinicalNotes: ClinicalNote[] = [];
export const patientProblems: PatientProblem[] = [];
export const medicationAdherence: MedicationAdherence[] = [];

// BILLING & PAYMENT SYSTEM
export const providerPricing: ProviderPricing[] = [];
export const serviceCharges: ServiceCharge[] = [];
export const invoices: Invoice[] = [];
export const billingRecords: BillingRecord[] = [];

// Comprehensive Drug Interaction Database
export const drugInteractionDatabase: DrugInteraction[] = [
  { id: 'di-001', drug1: 'Warfarin', drug2: 'Aspirin', severity: 'severe', description: 'Significantly increases bleeding risk', management: 'Monitor INR closely, consider alternative antiplatelet agent', evidenceLevel: 'Established' },
  { id: 'di-002', drug1: 'Metformin', drug2: 'Contrast dye', severity: 'severe', description: 'Risk of lactic acidosis', management: 'Hold metformin 48 hours before and after contrast procedures', evidenceLevel: 'Established' },
  { id: 'di-003', drug1: 'ACE Inhibitor', drug2: 'Potassium supplements', severity: 'moderate', description: 'Risk of hyperkalemia', management: 'Monitor potassium levels regularly', evidenceLevel: 'Probable' },
  { id: 'di-004', drug1: 'Statins', drug2: 'Clarithromycin', severity: 'moderate', description: 'Increased risk of myopathy', management: 'Consider alternative antibiotic or temporarily discontinue statin', evidenceLevel: 'Probable' },
  { id: 'di-005', drug1: 'SSRIs', drug2: 'MAOIs', severity: 'severe', description: 'Risk of serotonin syndrome', management: 'Wash-out period required; never use together', evidenceLevel: 'Established' },
  { id: 'di-006', drug1: 'Digoxin', drug2: 'Amiodarone', severity: 'severe', description: 'Increased digoxin toxicity', management: 'Reduce digoxin dose by 50%, monitor levels closely', evidenceLevel: 'Established' },
  { id: 'di-007', drug1: 'NSAIDs', drug2: 'ACE Inhibitor', severity: 'moderate', description: 'Risk of acute kidney injury', management: 'Monitor renal function, avoid in dehydrated patients', evidenceLevel: 'Probable' },
  { id: 'di-008', drug1: 'Alcohol', drug2: 'Benzodiazepines', severity: 'severe', description: 'Severe CNS depression risk', management: 'Advise against alcohol consumption', evidenceLevel: 'Established' },
];

// Doctor availability data for telemedicine platform
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string[];
  experience: number; // years
  profileImage?: string;
  rating: number; // 1-5
  reviewCount: number;
  consultationFee: number;
  status: 'available' | 'busy' | 'offline';
  availableHours: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  slotDuration: number; // minutes, typically 30 or 60
}

export const doctors: Doctor[] = [
  {
    id: 'd-001',
    name: 'Dr. Sarah Johnson',
    specialty: 'General Practitioner',
    qualifications: ['MD', 'Board Certified'],
    experience: 12,
    rating: 4.8,
    reviewCount: 342,
    consultationFee: 50,
    status: 'available',
    availableHours: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '16:00' },
      { dayOfWeek: 'Saturday', startTime: '10:00', endTime: '14:00' },
    ],
    slotDuration: 30,
  },
  {
    id: 'd-002',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiologist',
    qualifications: ['MD', 'Cardiology Fellowship', 'Board Certified'],
    experience: 15,
    rating: 4.9,
    reviewCount: 256,
    consultationFee: 75,
    status: 'available',
    availableHours: [
      { dayOfWeek: 'Monday', startTime: '10:00', endTime: '16:00' },
      { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '16:00' },
      { dayOfWeek: 'Thursday', startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 'Friday', startTime: '10:00', endTime: '16:00' },
    ],
    slotDuration: 45,
  },
  {
    id: 'd-003',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrician',
    qualifications: ['MD', 'Pediatric Specialty'],
    experience: 10,
    rating: 4.7,
    reviewCount: 198,
    consultationFee: 45,
    status: 'available',
    availableHours: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Saturday', startTime: '10:00', endTime: '13:00' },
    ],
    slotDuration: 25,
  },
  {
    id: 'd-004',
    name: 'Dr. James Wilson',
    specialty: 'Dermatologist',
    qualifications: ['MD', 'Dermatology Fellowship'],
    experience: 8,
    rating: 4.6,
    reviewCount: 167,
    consultationFee: 60,
    status: 'busy',
    availableHours: [
      { dayOfWeek: 'Tuesday', startTime: '13:00', endTime: '17:00' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 'Thursday', startTime: '13:00', endTime: '17:00' },
    ],
    slotDuration: 30,
  },
  {
    id: 'd-005',
    name: 'Dr. Lisa Anderson',
    specialty: 'Psychiatrist',
    qualifications: ['MD', 'Psychiatry Board Certified'],
    experience: 14,
    rating: 4.8,
    reviewCount: 203,
    consultationFee: 70,
    status: 'available',
    availableHours: [
      { dayOfWeek: 'Monday', startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 'Friday', startTime: '14:00', endTime: '19:00' },
    ],
    slotDuration: 50,
  },
];

export const patients: { id: string; name: string }[] = [];

export interface ImagingCenter {
  id: string;
  name: string;
  location: string;
  phone: string;
  availableScanTypes: string[];
  rating: number;
}

export interface Laboratory {
  id: string;
  name: string;
  location: string;
  phone: string;
  availableTests: string[];
  rating: number;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string;
  bedCount: number;
  rating: number;
  specialties: string[];
}

export const imagingCenters: ImagingCenter[] = [
  { id: 'ic-001', name: 'Advanced Imaging Center', location: 'Downtown Medical Plaza', phone: '+1-555-0101', availableScanTypes: ['X-Ray', 'MRI', 'CT Scan', 'Ultrasound'], rating: 4.7 },
  { id: 'ic-002', name: 'Diagnostic Radiology', location: 'Health District', phone: '+1-555-0102', availableScanTypes: ['X-Ray', 'CT Scan', 'PET Scan'], rating: 4.8 },
];

export const laboratories: Laboratory[] = [
  { id: 'lab-001', name: 'Central Diagnostics Lab', location: 'Main Hospital', phone: '+1-555-0201', availableTests: ['CBC', 'Lipid Panel', 'HbA1c', 'Thyroid Panel', 'Liver Panel'], rating: 4.9 },
  { id: 'lab-002', name: 'Quick Labs', location: 'City Center', phone: '+1-555-0202', availableTests: ['CBC', 'Urinalysis', 'Glucose Test'], rating: 4.6 },
];

export const hospitals: Hospital[] = [
  { id: 'h-001', name: 'Metropolitan Hospital', location: 'Downtown', phone: '+1-555-0301', bedCount: 500, rating: 4.8, specialties: ['General', 'Cardiology', 'Neurology', 'Orthopedics'] },
  { id: 'h-002', name: 'City General Hospital', location: 'Midtown', phone: '+1-555-0302', bedCount: 350, rating: 4.7, specialties: ['General', 'Pediatrics', 'OB/GYN'] },
];

export const systemStats = {
  get totalUsers() { return patients.length + doctors.length; },
  get totalPatients() { return patients.length; },
  get totalDoctors() { return doctors.length; },
  totalHospitals: hospitals.length,
  totalLabs: laboratories.length,
  totalImagingCenters: imagingCenters.length,
  totalPharmacies: 12,
  get totalAmbulances() { return vehicles.length; },
  get appointmentsToday() { return 0; },
  get pendingVerifications() { return 0; },
  get activeEmergencies() { return ambulanceRequests.filter(r => r.priority === 'critical' && r.status !== 'completed').length; },
};

// PHASE 2: Health Metrics & Vitals
export interface VitalSigns {
  id: string;
  patientId: string;
  timestamp: string;
  heartRate: number; // bpm
  systolicBP: number; // mm Hg (top number)
  diastolicBP: number; // mm Hg (bottom number)
  temperature: number; // Celsius
  oxygenLevel: number; // %
  weight: number; // kg
  notes?: string;
}

export interface HealthMetric {
  id: string;
  patientId: string;
  type: 'heart_rate' | 'blood_pressure' | 'temperature' | 'oxygen' | 'weight' | 'glucose' | 'sleep';
  date: string;
  value: number | string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
}

// PHASE 2: Pharmacy Inventory
export interface InventoryItem {
  id: string;
  name: string;
  category: 'medication' | 'supply' | 'equipment';
  stock: number;
  reorderLevel: number;
  price: number;
  unit: string;
  expiryDate?: string;
  supplier?: string;
  lastRestocked?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

// PHASE 2: Ambulance Fleet Management
export interface AmbulanceVehicle {
  id: string;
  callSign: string;
  plateNumber: string;
  type: 'Type-A' | 'Type-B' | 'Type-C'; // different emergency levels
  status: 'available' | 'dispatched' | 'in-transit' | 'on-scene' | 'returning' | 'maintenance';
  latitude?: number;
  longitude?: number;
  crew: { name: string; role: 'driver' | 'paramedic' | 'emt' }[];
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  fuel: number; // percentage
  equipment: string[];
}

// PHASE 2: Referrals between providers
export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  fromDoctorId: string;
  fromDoctorName: string;
  toDepartmentId: string;
  toDepartment: string;
  reason: string;
  date: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  lastUpdated: string;
  notes?: string;
}

// PHASE 2: Provider verifications
export interface ProviderVerification {
  id: string;
  providerId: string;
  name: string;
  email: string;
  role: 'doctor' | 'hospital' | 'laboratory' | 'imaging' | 'pharmacy' | 'ambulance';
  documents: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  verificationDate?: string;
  notes?: string;
}

// Mock data for Phase 2
export const vitalSigns: VitalSigns[] = [];

export const healthMetrics: HealthMetric[] = [];

export const inventoryItems: InventoryItem[] = [
  { id: 'inv-001', name: 'Amoxicillin 500mg', category: 'medication', stock: 250, reorderLevel: 50, price: 0.50, unit: 'tablet', supplier: 'MediSupply Inc', lastRestocked: '2026-03-20', status: 'in-stock' },
  { id: 'inv-002', name: 'Ibuprofen 200mg', category: 'medication', stock: 120, reorderLevel: 100, price: 0.25, unit: 'tablet', supplier: 'PharmaCorp', lastRestocked: '2026-03-15', status: 'in-stock' },
  { id: 'inv-003', name: 'Metformin 500mg', category: 'medication', stock: 45, reorderLevel: 75, price: 0.30, unit: 'tablet', supplier: 'MediSupply Inc', lastRestocked: '2026-02-28', status: 'low-stock' },
  { id: 'inv-004', name: 'Lisinopril 10mg', category: 'medication', stock: 0, reorderLevel: 50, price: 0.60, unit: 'tablet', supplier: 'PharmaCorp', lastRestocked: '2026-01-15', status: 'out-of-stock' },
  { id: 'inv-005', name: 'Sterile Gauze Pads', category: 'supply', stock: 500, reorderLevel: 100, price: 2.00, unit: 'box', supplier: 'MediSupply Inc', lastRestocked: '2026-03-22', status: 'in-stock' },
  { id: 'inv-006', name: 'Blood Pressure Cuff', category: 'equipment', stock: 12, reorderLevel: 5, price: 45.00, unit: 'unit', supplier: 'Equipment Solutions', lastRestocked: '2026-03-01', status: 'in-stock' },
  { id: 'inv-007', name: 'Glucose Meter Strips', category: 'supply', stock: 30, reorderLevel: 100, price: 15.00, unit: 'box', supplier: 'DiabetesCare Ltd', lastRestocked: '2026-02-10', status: 'low-stock' },
];

export const ambulances: AmbulanceVehicle[] = [
  {
    id: 'amb-001',
    callSign: 'Ambulance-1',
    plateNumber: 'AMB-001-X',
    type: 'Type-A',
    status: 'available',
    latitude: 40.7128,
    longitude: -74.0060,
    crew: [
      { name: 'John Smith', role: 'driver' },
      { name: 'Sarah Mitchell', role: 'paramedic' },
    ],
    lastMaintenanceDate: '2026-03-15',
    nextMaintenanceDate: '2026-04-15',
    fuel: 85,
    equipment: ['Defibrillator', 'Oxygen Tank', 'Stretcher', 'First Aid Kit', 'Monitor'],
  },
  {
    id: 'amb-002',
    callSign: 'Ambulance-2',
    plateNumber: 'AMB-002-X',
    type: 'Type-B',
    status: 'dispatched',
    latitude: 40.7150,
    longitude: -74.0050,
    crew: [
      { name: 'Mike Johnson', role: 'driver' },
      { name: 'Emma Davis', role: 'emt' },
    ],
    lastMaintenanceDate: '2026-03-10',
    nextMaintenanceDate: '2026-04-10',
    fuel: 65,
    equipment: ['Defibrillator', 'Oxygen Tank', 'Stretcher', 'First Aid Kit', 'Monitor', 'Ventilator'],
  },
  {
    id: 'amb-003',
    callSign: 'Ambulance-3',
    plateNumber: 'AMB-003-X',
    type: 'Type-C',
    status: 'available',
    latitude: 40.7100,
    longitude: -74.0080,
    crew: [
      { name: 'Robert Chen', role: 'driver' },
      { name: 'Lisa Anderson', role: 'paramedic' },
    ],
    lastMaintenanceDate: '2026-03-20',
    nextMaintenanceDate: '2026-04-20',
    fuel: 90,
    equipment: ['Defibrillator', 'Oxygen Tank', 'Stretcher', 'First Aid Kit', 'Monitor', 'Ventilator', 'Cardiac Equipment'],
  },
];

export const referrals: Referral[] = [
  {
    id: 'ref-001',
    patientId: 'pat-001',
    patientName: 'John Doe',
    fromDoctorId: 'd-001',
    fromDoctorName: 'Dr. Sarah Johnson',
    toDepartmentId: 'd-002',
    toDepartment: 'Cardiology',
    reason: 'Persistent chest pain, requires cardiac evaluation',
    date: '2026-03-25',
    status: 'pending',
    lastUpdated: '2026-03-25',
    notes: 'Patient reports chest discomfort during physical activity',
  },
  {
    id: 'ref-002',
    patientId: 'pat-002',
    patientName: 'Jane Smith',
    fromDoctorId: 'd-003',
    fromDoctorName: 'Dr. Emily Rodriguez',
    toDepartmentId: 'd-004',
    toDepartment: 'Dermatology',
    reason: 'Persistent skin rash, needs specialist evaluation',
    date: '2026-03-20',
    status: 'accepted',
    lastUpdated: '2026-03-24',
    notes: 'Rash appeared 3 weeks ago, not responding to standard treatment',
  },
  {
    id: 'ref-003',
    patientId: 'pat-003',
    patientName: 'Robert Johnson',
    fromDoctorId: 'd-001',
    fromDoctorName: 'Dr. Sarah Johnson',
    toDepartmentId: 'd-005',
    toDepartment: 'Psychiatry',
    reason: 'Anxiety symptoms, requires psychiatric consultation',
    date: '2026-03-15',
    status: 'completed',
    lastUpdated: '2026-03-28',
    notes: 'Patient completed initial psychiatric evaluation',
  },
];

export const providerVerifications: ProviderVerification[] = [
  {
    id: 'ver-001',
    providerId: 'prov-001',
    name: 'Dr. Michael Torres',
    email: 'torres@example.com',
    role: 'doctor',
    documents: 'MD License, Board Certification, Malpractice Insurance',
    appliedDate: '2026-03-18',
    status: 'pending',
    notes: 'Awaiting license verification from state board',
  },
  {
    id: 'ver-002',
    providerId: 'hosp-001',
    name: 'Central Health Hospital',
    email: 'admin@centralhealth.com',
    role: 'hospital',
    documents: 'Hospital License, CLIA Certification, Accreditation',
    appliedDate: '2026-03-10',
    status: 'approved',
    verifiedBy: 'admin-001',
    verificationDate: '2026-03-22',
    notes: 'All documents verified and approved',
  },
  {
    id: 'ver-003',
    providerId: 'lab-002',
    name: 'Advanced Diagnostics Lab',
    email: 'info@advdx.com',
    role: 'laboratory',
    documents: 'CLIA Certificate, Lab Director Credentials, Quality Assurance',
    appliedDate: '2026-03-12',
    status: 'rejected',
    verifiedBy: 'admin-002',
    verificationDate: '2026-03-26',
    notes: 'Lab director credentials incomplete, resubmission required',
  },
];
