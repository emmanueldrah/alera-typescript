import type { User } from '@/contexts/AuthContext';
import type { ImagingScan, LabTest, Prescription } from '@/data/mockData';
import { normalizeUserRole } from '@/lib/roleUtils';

export const getVisiblePrescriptions = (prescriptions: Prescription[], user?: Pick<User, 'id' | 'role'> | null) => {
  if (!user) return [];
  const role = normalizeUserRole(user.role) ?? user.role;
  if (role === 'doctor') return prescriptions.filter((prescription) => prescription.doctorId === user.id);
  if (role === 'patient') return prescriptions.filter((prescription) => prescription.patientId === user.id);
  if (role === 'pharmacy') return prescriptions;
  return [];
};

export const getVisibleLabTests = (labTests: LabTest[], user?: Pick<User, 'id' | 'role'> | null) => {
  if (!user) return [];
  const role = normalizeUserRole(user.role) ?? user.role;
  if (role === 'laboratory' || user.role === 'laboratory') return labTests;
  if (role === 'doctor') return labTests.filter((test) => test.doctorId === user.id);
  if (role === 'patient') return labTests.filter((test) => test.patientId === user.id);
  return [];
};

export const getVisibleImagingScans = (imagingScans: ImagingScan[], user?: Pick<User, 'id' | 'role'> | null) => {
  if (!user) return [];
  const role = normalizeUserRole(user.role) ?? user.role;
  if (role === 'imaging' || user.role === 'imaging') return imagingScans;
  if (role === 'doctor') return imagingScans.filter((scan) => scan.doctorId === user.id);
  if (role === 'patient') return imagingScans.filter((scan) => scan.patientId === user.id);
  return [];
};
