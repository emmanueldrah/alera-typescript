import type { User } from '@/contexts/AuthContext';
import type { Referral } from '@/data/mockData';
import { normalizeUserRole } from '@/lib/roleUtils';

export const DEFAULT_REFERRAL_DEPARTMENTS = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Psychiatry',
  'Radiology',
] as const;

export const getVisibleReferrals = (referrals: Referral[], user?: Pick<User, 'id' | 'role'> | null) => {
  if (!user) return [];
  const role = normalizeUserRole(user.role) ?? user.role;
  if (role === 'doctor') {
    return referrals.filter((referral) => referral.fromDoctorId === user.id);
  }
  if (role === 'hospital') {
    return referrals;
  }
  if (role === 'patient') {
    return referrals.filter((referral) => referral.patientId === user.id);
  }
  return [];
};

export const getReferralDepartments = (referrals: Referral[]) => {
  const departments = new Set<string>(DEFAULT_REFERRAL_DEPARTMENTS);
  referrals.forEach((referral) => {
    if (referral.toDepartment.trim()) {
      departments.add(referral.toDepartment.trim());
    }
  });
  return Array.from(departments).sort((left, right) => left.localeCompare(right));
};

export const getReferralDepartmentId = (department: string) =>
  department.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const canAcceptReferral = (referral: Referral, role?: User['role'] | string) => {
  const normalized = normalizeUserRole(role) ?? role;
  return normalized === 'hospital' && referral.status === 'pending';
};

export const canCompleteReferral = (referral: Referral, role?: User['role'] | string) => {
  const normalized = normalizeUserRole(role) ?? role;
  return normalized === 'hospital' && referral.status === 'accepted';
};

export const canCancelReferral = (referral: Referral, role?: User['role'] | string) => {
  const normalized = normalizeUserRole(role) ?? role;
  return normalized === 'doctor' && referral.status === 'pending';
};
