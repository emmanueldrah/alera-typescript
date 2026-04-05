import type { UserRole } from '@/contexts/AuthContext';
import { normalizeUserRole } from '@/lib/roleUtils';

export const featureAccessMap: Record<string, UserRole[]> = {
  appointments: ['patient', 'doctor'],
  prescriptions: ['patient', 'doctor', 'pharmacy'],
  'lab-results': ['patient'],
  'lab-referrals': ['doctor'],
  'test-requests': ['laboratory'],
  imaging: ['patient'],
  'imaging-referrals': ['doctor'],
  'scan-requests': ['imaging'],
  ambulance: ['patient'],
  requests: ['ambulance'],
  timeline: ['patient', 'doctor'],
  inventory: ['pharmacy'],
  vehicles: ['ambulance'],
  users: ['admin', 'super_admin'],
  profile: ['patient', 'doctor', 'hospital', 'laboratory', 'imaging', 'pharmacy', 'ambulance', 'admin', 'super_admin'],
  verifications: ['admin', 'super_admin'],
  analytics: ['doctor', 'admin', 'super_admin'],
  patients: ['doctor', 'hospital', 'admin', 'super_admin'],
  doctors: ['patient', 'hospital', 'admin', 'super_admin'],
  referrals: ['doctor', 'hospital'],
  'pharmacy-referrals': ['doctor', 'pharmacy'],
  results: ['laboratory', 'imaging'],
  messages: ['patient', 'doctor'],
  'health-metrics': ['patient'],
  notifications: ['admin', 'super_admin'],
  'appointment-reminders': ['patient', 'doctor'],
  allergies: ['patient', 'doctor'],
  'prescription-refills': ['patient'],
  'medical-history': ['patient', 'doctor'],
  consent: ['patient'],
  'clinical-notes': ['patient', 'doctor'],
  'problem-list': ['patient'],
  'medication-adherence': ['patient'],
  'lab-results-management': ['patient'],
  'smart-appointment-reminders': ['patient', 'doctor'],
  'pricing-settings': ['doctor'],
  billing: ['patient'],
  'admin-billing': ['admin', 'super_admin'],
  audit: ['admin', 'super_admin'],
  'admin/create': ['super_admin'],
};

export const canAccessFeature = (page: string, role?: UserRole | string) => {
  const normalized = normalizeUserRole(role);
  return Boolean(normalized && featureAccessMap[page]?.includes(normalized));
};
