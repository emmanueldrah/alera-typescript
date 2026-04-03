import type { User } from '@/contexts/AuthContext';
import type { Referral, ReferralType } from '@/data/mockData';
import { normalizeUserRole } from '@/lib/roleUtils';

/** Clinical queue — must match backend `referral_type` */
export type ReferralKind = ReferralType;

export const DEFAULT_HOSPITAL_DEPARTMENTS = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Psychiatry',
  'Radiology',
  'General Surgery',
] as const;

export const DEFAULT_LAB_REFERRAL_TARGETS = [
  'Core laboratory',
  'Pathology',
  'Microbiology',
  'Hematology',
  'Chemistry',
] as const;

export const DEFAULT_IMAGING_REFERRAL_TARGETS = [
  'Radiology',
  'CT',
  'MRI',
  'Ultrasound',
  'Nuclear medicine',
] as const;

export const DEFAULT_PHARMACY_REFERRAL_TARGETS = [
  'Clinical pharmacy',
  'Medication therapy management',
  'Specialty pharmacy',
  'Hospital outpatient pharmacy',
] as const;

/** @deprecated use DEFAULT_HOSPITAL_DEPARTMENTS */
export const DEFAULT_REFERRAL_DEPARTMENTS = DEFAULT_HOSPITAL_DEPARTMENTS;

const defaultsForKind = (kind: ReferralKind): readonly string[] => {
  switch (kind) {
    case 'laboratory':
      return DEFAULT_LAB_REFERRAL_TARGETS;
    case 'imaging':
      return DEFAULT_IMAGING_REFERRAL_TARGETS;
    case 'pharmacy':
      return DEFAULT_PHARMACY_REFERRAL_TARGETS;
    default:
      return DEFAULT_HOSPITAL_DEPARTMENTS;
  }
};

export const getReferralDepartmentsForKind = (kind: ReferralKind, referrals: Referral[]) => {
  const departments = new Set<string>(defaultsForKind(kind));
  referrals
    .filter((r) => r.referralType === kind)
    .forEach((referral) => {
      if (referral.toDepartment.trim()) {
        departments.add(referral.toDepartment.trim());
      }
    });
  return Array.from(departments).sort((left, right) => left.localeCompare(right));
};

/** @deprecated use getReferralDepartmentsForKind('hospital', referrals) */
export const getReferralDepartments = (referrals: Referral[]) =>
  getReferralDepartmentsForKind('hospital', referrals);

export const getVisibleReferrals = (
  referrals: Referral[],
  user?: Pick<User, 'id' | 'role'> | null,
  options?: { kind?: ReferralKind },
) => {
  if (!user) return [];
  const role = normalizeUserRole(user.role) ?? user.role;
  let rows: Referral[];

  if (role === 'doctor') {
    rows = referrals.filter((referral) => referral.fromDoctorId === user.id);
  } else if (role === 'hospital') {
    rows = referrals;
  } else if (role === 'patient') {
    rows = referrals.filter((referral) => referral.patientId === user.id);
  } else if (role === 'laboratory' || role === 'imaging' || role === 'pharmacy') {
    rows = referrals;
  } else {
    return [];
  }

  // Doctors use separate dashboard URLs per queue; hospital staff see hospital + pharmacy together from the API.
  if (options?.kind && role === 'doctor') {
    rows = rows.filter((r) => r.referralType === options.kind);
  }
  return rows;
};

export const getReferralDepartmentId = (department: string) =>
  department.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const referralKindLabel = (t: ReferralType): string => {
  switch (t) {
    case 'laboratory':
      return 'Laboratory';
    case 'imaging':
      return 'Imaging';
    case 'pharmacy':
      return 'Pharmacy';
    default:
      return 'Hospital / specialist';
  }
};

export const canAcceptReferral = (referral: Referral, role?: User['role'] | string) => {
  if (referral.status !== 'pending') return false;
  const normalized = normalizeUserRole(role) ?? role;
  if (normalized === 'hospital') {
    return referral.referralType === 'hospital' || referral.referralType === 'pharmacy';
  }
  if (normalized === 'laboratory') return referral.referralType === 'laboratory';
  if (normalized === 'imaging') return referral.referralType === 'imaging';
  if (normalized === 'pharmacy') return referral.referralType === 'pharmacy';
  return false;
};

export const canCompleteReferral = (referral: Referral, role?: User['role'] | string) => {
  if (referral.status !== 'accepted') return false;
  const normalized = normalizeUserRole(role) ?? role;
  if (normalized === 'hospital') {
    return referral.referralType === 'hospital' || referral.referralType === 'pharmacy';
  }
  if (normalized === 'laboratory') return referral.referralType === 'laboratory';
  if (normalized === 'imaging') return referral.referralType === 'imaging';
  if (normalized === 'pharmacy') return referral.referralType === 'pharmacy';
  return false;
};

export const canCancelReferral = (referral: Referral, role?: User['role'] | string) => {
  const normalized = normalizeUserRole(role) ?? role;
  return normalized === 'doctor' && referral.status === 'pending';
};
