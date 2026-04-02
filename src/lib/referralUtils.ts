import type { User } from '@/contexts/AuthContext';
import type { Referral } from '@/data/mockData';

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
  if (user.role === 'doctor') {
    return referrals.filter((referral) => referral.fromDoctorId === user.id);
  }
  if (user.role === 'hospital') {
    return referrals;
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

export const canAcceptReferral = (referral: Referral, role?: User['role']) =>
  role === 'hospital' && referral.status === 'pending';

export const canCompleteReferral = (referral: Referral, role?: User['role']) =>
  role === 'hospital' && referral.status === 'accepted';

export const canCancelReferral = (referral: Referral, role?: User['role']) =>
  role === 'doctor' && referral.status === 'pending';
