import type { UserRole } from '@/contexts/AuthContext';
import { normalizeUserRole } from '@/lib/roleUtils';

export const featureAccessMap: Record<string, UserRole[]> = {
  appointments: ['patient', 'doctor', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  prescriptions: ['patient', 'doctor', 'pharmacy', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  'lab-results': ['patient'],
  'lab-referrals': ['doctor', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  'test-requests': ['laboratory'],
  imaging: ['patient'],
  'imaging-referrals': ['doctor', 'imaging', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  'scan-requests': ['imaging'],
  ambulance: ['patient', 'ambulance', 'hospital', 'doctor', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  requests: ['ambulance', 'hospital', 'doctor', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  timeline: ['patient', 'doctor', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  inventory: ['pharmacy'],
  vehicles: ['ambulance'],
  users: ['admin', 'super_admin'],
  profile: ['patient', 'doctor', 'hospital', 'laboratory', 'imaging', 'pharmacy', 'ambulance', 'admin', 'super_admin', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  verifications: ['admin', 'super_admin'],
  analytics: ['doctor', 'admin', 'super_admin', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  patients: ['doctor', 'hospital', 'admin', 'super_admin', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  doctors: ['patient', 'hospital', 'admin', 'super_admin', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  referrals: ['doctor', 'hospital', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  'pharmacy-referrals': ['doctor', 'pharmacy', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  results: ['laboratory', 'imaging'],
  messages: ['patient', 'doctor', 'hospital', 'laboratory', 'imaging', 'pharmacy', 'ambulance', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  'health-metrics': ['patient'],
  notifications: ['admin', 'super_admin'],
  'appointment-reminders': ['patient', 'doctor', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  allergies: ['patient', 'doctor', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  'prescription-refills': ['patient'],
  'medical-history': ['patient', 'doctor', 'hospital', 'admin', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  consent: ['patient'],
  'clinical-notes': ['patient', 'doctor', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  'problem-list': ['patient'],
  'medication-adherence': ['patient'],
  'lab-results-management': ['patient'],
  'smart-appointment-reminders': ['patient', 'doctor', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  'pricing-settings': ['doctor', 'cardiologist', 'endocrinologist', 'physiotherapist'],
  billing: ['patient'],
  'admin-billing': ['admin', 'super_admin'],
  audit: ['admin', 'super_admin'],
  'admin/create': ['super_admin'],
};

export const canAccessFeature = (page: string, role?: UserRole | string) => {
  const normalized = normalizeUserRole(role);
  if (normalized === 'super_admin') return true;
  return Boolean(normalized && featureAccessMap[page]?.includes(normalized));
};
