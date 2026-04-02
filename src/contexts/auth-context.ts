import { createContext } from 'react';
import type { User, UserProfile, UserRole } from './AuthContext';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  addUser: (name: string, email: string, password: string, role: UserRole) => Promise<User>;
  getUsers: () => User[];
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateBasicInfo: (firstName: string, lastName: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateNotificationPreferences: (email: boolean, sms: boolean) => Promise<void>;
  updatePrivacySettings: (publicProfile: boolean) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  clearCache: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
