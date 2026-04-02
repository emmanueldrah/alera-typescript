import React, { useState, useCallback, useEffect } from 'react';
import { clearAleraStorage, storageKeys } from '@/lib/storageKeys';
import { AuthContext } from './auth-context';
import { authApi, type ApiUser } from '@/lib/apiService';
import { setTokens, getAccessToken, clearTokens } from '@/lib/apiClient';

export type UserRole = 'patient' | 'provider' | 'pharmacist' | 'admin';

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

type SignupRole = UserRole | 'doctor' | 'hospital' | 'laboratory' | 'imaging' | 'pharmacy' | 'ambulance';

const isApiUser = (data: unknown): data is ApiUser => {
  return typeof data === 'object' && data !== null && 'id' in data && 'email' in data;
};

// Map backend user roles to frontend format if needed
const mapBackendUser = (data: ApiUser): User => {
  const fullName = data.full_name?.trim() || [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
  const [firstName = '', ...lastNameParts] = fullName.split(' ');
  return {
    id: data.id,
    email: data.email,
    name: fullName || data.email,
    role: data.role as UserRole,
    avatar: data.avatar || data.profile_image_url,
    createdAt: data.created_at,
    lastLogin: data.last_login,
    profile: {
      firstName,
      lastName: lastNameParts.join(' '),
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      dateOfBirth: data.date_of_birth,
      bio: data.bio,
      avatar: data.avatar || data.profile_image_url,
      notificationEmail: true,
      notificationSms: false,
      privacyPublicProfile: false,
    }
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from stored token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          // Try to fetch current user
          const userData = await authApi.getCurrentUser();
          if (isApiUser(userData)) {
            setUser(mapBackendUser(userData));
          } else {
            clearTokens();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const { access_token, refresh_token, user: userData } = response;
      
      setTokens(access_token, refresh_token);
      if (!isApiUser(userData)) {
        throw new Error('Login response did not include a valid user');
      }
      setUser(mapBackendUser(userData));
    } catch (error) {
      clearTokens();
      throw error;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, role: SignupRole) => {
    try {
      const [firstName = '', ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      
      // Map frontend roles to backend roles
      const roleMap: Record<string, UserRole> = {
        'patient': 'patient',
        'doctor': 'provider',
        'hospital': 'provider',
        'laboratory': 'provider',
        'imaging': 'provider',
        'pharmacy': 'pharmacist',
        'ambulance': 'provider'
      };
      const backendRole = roleMap[role] || 'patient';
      
      // Generate username from email (remove domain)
      const username = email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '.');
      
      const response = await authApi.register({
        email,
        password,
        username,
        first_name: firstName,
        last_name: lastName,
        role: backendRole,
        phone: undefined,
      });
      
      const { access_token, refresh_token, user: userData } = response;
      setTokens(access_token, refresh_token);
      if (isApiUser(userData)) {
        setUser(mapBackendUser(userData));
      }
    } catch (error) {
      clearTokens();
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const response = await authApi.updateProfile({
      full_name: undefined,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zip_code: profile.zipCode,
      date_of_birth: profile.dateOfBirth,
    });

    if (isApiUser(response)) {
      setUser(mapBackendUser(response));
    }
  }, [user]);

  const updateBasicInfo = useCallback(async (firstName: string, lastName: string) => {
    if (!user) throw new Error('No user logged in');

    const fullName = `${firstName} ${lastName}`.trim();
    const response = await authApi.updateProfile({
      full_name: fullName,
    });

    if (isApiUser(response)) {
      setUser(mapBackendUser(response));
    }
  }, [user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('No user logged in');

    await authApi.changePassword(currentPassword, newPassword);
  }, [user]);

  const updateNotificationPreferences = useCallback(async (email: boolean, sms: boolean) => {
    if (!user) throw new Error('No user logged in');

    await updateProfile({
      notificationEmail: email,
      notificationSms: sms,
    });
  }, [user, updateProfile]);

  const updatePrivacySettings = useCallback(async (publicProfile: boolean) => {
    if (!user) throw new Error('No user logged in');

    await updateProfile({
      privacyPublicProfile: publicProfile,
    });
  }, [user, updateProfile]);

  const deleteAccount = useCallback(async (password: string) => {
    if (!user) throw new Error('No user logged in');

    // TODO: Implement account deletion endpoint
    // await authApi.deleteAccount(password);
    clearTokens();
    setUser(null);
  }, [user]);

  const clearCache = useCallback(() => {
    clearAleraStorage();
    clearTokens();
    setUser(null);
  }, []);

  // Mock functions for backward compatibility - to be replaced by API calls
  const addUser = useCallback(async () => {
    throw new Error('Use signup instead');
  }, []);

  const getUsers = useCallback(async () => {
    throw new Error('Use admin endpoints instead');
  }, []);

  // Get current user helper (for when needed)
  const getCurrentUser = useCallback(async () => {
    if (!user) throw new Error('No user logged in');

    const userData = await authApi.getCurrentUser();
    if (isApiUser(userData)) {
      const updatedUser = mapBackendUser(userData);
      setUser(updatedUser);
      return updatedUser;
    }
  }, [user]);

  if (isLoading) {
    return (
      <AuthContext.Provider value={{ 
        user: null, 
        isAuthenticated: false, 
        login: async () => {}, 
        signup: async () => {}, 
        logout: async () => {}, 
        addUser: async () => {}, 
        getUsers: async () => [], 
        updateProfile: async () => {}, 
        updateBasicInfo: async () => {}, 
        changePassword: async () => {}, 
        updateNotificationPreferences: async () => {}, 
        updatePrivacySettings: async () => {}, 
        deleteAccount: async () => {}, 
        clearCache: () => {} 
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      signup, 
      logout, 
      addUser, 
      getUsers, 
      updateProfile, 
      updateBasicInfo, 
      changePassword, 
      updateNotificationPreferences, 
      updatePrivacySettings, 
      deleteAccount, 
      clearCache 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
