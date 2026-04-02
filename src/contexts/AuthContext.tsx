import React, { useState, useCallback } from 'react';
import { clearAleraStorage, storageKeys } from '@/lib/storageKeys';
import { AuthContext } from './auth-context';

export type UserRole = 'patient' | 'doctor' | 'hospital' | 'laboratory' | 'imaging' | 'pharmacy' | 'ambulance' | 'admin';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  notificationEmail: boolean;
  notificationSms: boolean;
  privacyPublicProfile: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  profile?: UserProfile;
  createdAt?: string;
  lastLogin?: string;
}

const DEFAULT_ADMIN_EMAIL = 'admin@alera.local';
const DEFAULT_ADMIN_PASSWORD = 'Admin@12345';
const DEFAULT_DOCTOR_EMAIL = 'doctor@alera.local';
const DEFAULT_DOCTOR_PASSWORD = 'Doctor@12345';
const DEFAULT_PATIENT_EMAIL = 'patient@alera.local';
const DEFAULT_PATIENT_PASSWORD = 'Patient@12345';
const USERS_STORAGE_KEY = storageKeys.authUsers;

const createDefaultProfile = (): UserProfile => ({
  firstName: '',
  lastName: '',
  phone: undefined,
  address: undefined,
  city: undefined,
  state: undefined,
  zipCode: undefined,
  dateOfBirth: undefined,
  bio: undefined,
  avatar: undefined,
  notificationEmail: true,
  notificationSms: false,
  privacyPublicProfile: false,
});

const createSeedUser = (
  id: string,
  email: string,
  password: string,
  name: string,
  role: UserRole,
  profile?: Partial<UserProfile>,
) => ({
  password,
  user: {
    id,
    email,
    name,
    role,
    avatar: undefined,
    profile: {
      ...createDefaultProfile(),
      firstName: name.split(' ')[0] ?? '',
      lastName: name.split(' ').slice(1).join(' '),
      ...profile,
    },
    createdAt: new Date().toISOString(),
  } satisfies User,
});

const defaultUsers: Record<string, { password: string; user: User }> = {
  [DEFAULT_ADMIN_EMAIL.toLowerCase()]: {
    ...createSeedUser('admin-default', DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, 'ALERA Admin', 'admin', {
      firstName: 'ALERA',
      lastName: 'Admin',
    }),
  },
  [DEFAULT_DOCTOR_EMAIL.toLowerCase()]: createSeedUser('doctor-default', DEFAULT_DOCTOR_EMAIL, DEFAULT_DOCTOR_PASSWORD, 'Dr. Michael Chen', 'doctor', {
    firstName: 'Dr. Michael',
    lastName: 'Chen',
    bio: 'Cardiology',
  }),
  [DEFAULT_PATIENT_EMAIL.toLowerCase()]: createSeedUser('patient-default', DEFAULT_PATIENT_EMAIL, DEFAULT_PATIENT_PASSWORD, 'Sarah Johnson', 'patient', {
    firstName: 'Sarah',
    lastName: 'Johnson',
  }),
};

const safeParseUsers = (): Record<string, { password: string; user: User }> => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return defaultUsers;
    return { ...defaultUsers, ...JSON.parse(raw) };
  } catch {
    return defaultUsers;
  }
};

const persistUsers = (users: Record<string, { password: string; user: User }>) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<Record<string, { password: string; user: User }>>(() => safeParseUsers());
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(storageKeys.authUser);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const normalizedEmail = email.toLowerCase();
    const entry = users[normalizedEmail];
    if (entry && entry.password === password) {
      const updatedUser = { ...entry.user, lastLogin: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem(storageKeys.authUser, JSON.stringify(updatedUser));
      const updatedUsers = {
        ...users,
        [normalizedEmail]: { ...entry, user: updatedUser },
      };
      setUsers(updatedUsers);
      persistUsers(updatedUsers);
      return;
    }
    throw new Error('Invalid credentials');
  }, [users]);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    await new Promise(r => setTimeout(r, 800));
    if (role === 'admin') {
      throw new Error('Admin accounts cannot be created from signup');
    }
    const normalizedEmail = email.toLowerCase();
    if (users[normalizedEmail]) {
      throw new Error('An account with this email already exists');
    }
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role,
      avatar: undefined,
      profile: { ...createDefaultProfile(), firstName, lastName },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    const nextUsers = {
      ...users,
      [normalizedEmail]: { password, user: newUser },
    };
    setUsers(nextUsers);
    persistUsers(nextUsers);
    setUser(newUser);
    localStorage.setItem(storageKeys.authUser, JSON.stringify(newUser));
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(storageKeys.authUser);
  }, []);

  const addUser = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    await new Promise(r => setTimeout(r, 800));
    const normalizedEmail = email.toLowerCase();
    if (users[normalizedEmail]) {
      throw new Error('A user with this email already exists');
    }
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role,
      avatar: undefined,
      profile: { ...createDefaultProfile(), firstName, lastName },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    const nextUsers = {
      ...users,
      [normalizedEmail]: { password, user: newUser },
    };
    setUsers(nextUsers);
    persistUsers(nextUsers);
    return newUser;
  }, [users]);

  const getUsers = useCallback(() => {
    return Object.values(users).map(entry => entry.user);
  }, [users]);

  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    await new Promise(r => setTimeout(r, 800));
    const currentProfile = user.profile || createDefaultProfile();
    const updatedProfile = { ...currentProfile, ...profile };
    const updatedUser = { ...user, profile: updatedProfile };
    setUser(updatedUser);
    localStorage.setItem(storageKeys.authUser, JSON.stringify(updatedUser));
    const normalizedEmail = user.email.toLowerCase();
    const nextUsers = {
      ...users,
      [normalizedEmail]: { ...users[normalizedEmail], user: updatedUser },
    };
    setUsers(nextUsers);
    persistUsers(nextUsers);
  }, [user, users]);

  const updateBasicInfo = useCallback(async (firstName: string, lastName: string) => {
    if (!user) throw new Error('No user logged in');
    await new Promise(r => setTimeout(r, 800));
    const name = `${firstName} ${lastName}`.trim();
    const currentProfile = user.profile || createDefaultProfile();
    const updatedProfile = { ...currentProfile, firstName, lastName };
    const updatedUser = { ...user, name, profile: updatedProfile };
    setUser(updatedUser);
    localStorage.setItem(storageKeys.authUser, JSON.stringify(updatedUser));
    const normalizedEmail = user.email.toLowerCase();
    const nextUsers = {
      ...users,
      [normalizedEmail]: { ...users[normalizedEmail], user: updatedUser },
    };
    setUsers(nextUsers);
    persistUsers(nextUsers);
  }, [user, users]);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!user) throw new Error('No user logged in');
    await new Promise(r => setTimeout(r, 800));
    const normalizedEmail = user.email.toLowerCase();
    const entry = users[normalizedEmail];
    if (!entry || entry.password !== oldPassword) {
      throw new Error('Current password is incorrect');
    }
    const nextUsers = {
      ...users,
      [normalizedEmail]: { ...entry, password: newPassword },
    };
    setUsers(nextUsers);
    persistUsers(nextUsers);
  }, [user, users]);

  const updateNotificationPreferences = useCallback(async (email: boolean, sms: boolean) => {
    if (!user) throw new Error('No user logged in');
    await new Promise(r => setTimeout(r, 800));
    await updateProfile({ notificationEmail: email, notificationSms: sms });
  }, [updateProfile, user]);

  const updatePrivacySettings = useCallback(async (publicProfile: boolean) => {
    if (!user) throw new Error('No user logged in');
    await new Promise(r => setTimeout(r, 800));
    await updateProfile({ privacyPublicProfile: publicProfile });
  }, [updateProfile, user]);

  const deleteAccount = useCallback(async (password: string) => {
    if (!user) throw new Error('No user logged in');
    await new Promise(r => setTimeout(r, 800));
    const normalizedEmail = user.email.toLowerCase();
    const entry = users[normalizedEmail];
    if (!entry || entry.password !== password) {
      throw new Error('Password is incorrect');
    }
    const nextUsers = { ...users };
    delete nextUsers[normalizedEmail];
    setUsers(nextUsers);
    persistUsers(nextUsers);
    setUser(null);
    localStorage.removeItem(storageKeys.authUser);
  }, [user, users]);

  const clearCache = useCallback(() => {
    clearAleraStorage();
    setUsers(defaultUsers);
    setUser(null);
    persistUsers(defaultUsers);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, addUser, getUsers, updateProfile, updateBasicInfo, changePassword, updateNotificationPreferences, updatePrivacySettings, deleteAccount, clearCache }}>
      {children}
    </AuthContext.Provider>
  );
};
