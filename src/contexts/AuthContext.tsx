import React, { useState, useCallback, useEffect } from 'react';
import { clearAleraStorage } from '@/lib/storageKeys';
import { AuthContext } from './auth-context';
import { authApi, type ApiUser } from '@/lib/apiService';
import { setTokens, getAccessToken, clearTokens } from '@/lib/apiClient';

export type UserRole =
  | 'patient'
  | 'doctor'
  | 'hospital'
  | 'laboratory'
  | 'imaging'
  | 'pharmacy'
  | 'ambulance'
  | 'admin';

export type SignupRole = Exclude<UserRole, 'admin'>;

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
  isVerified?: boolean;
  isActive?: boolean;
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  avatar?: string;
  profile?: UserProfile;
  createdAt?: string;
  lastLogin?: string;
}

const isApiUser = (data: unknown): data is ApiUser => {
  return typeof data === 'object' && data !== null && 'id' in data && 'email' in data;
};

type BackendRole = ApiUser['role'];

// Map backend user roles to frontend format
const mapBackendUser = (data: ApiUser): User => {
  const mapBackendRoleToUserRole = (role: BackendRole | string): UserRole => {
    switch (role) {
      case 'patient':
        return 'patient';
      case 'provider':
        return 'doctor';
      case 'pharmacist':
        return 'pharmacy';
      case 'hospital':
        return 'hospital';
      case 'laboratory':
        return 'laboratory';
      case 'imaging':
        return 'imaging';
      case 'ambulance':
        return 'ambulance';
      case 'admin':
        return 'admin';
      default:
        return 'patient';
    }
  };

  const fullName = data.full_name?.trim() || [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
  const [firstName = '', ...lastNameParts] = fullName.split(' ');
  return {
    id: String(data.id),
    email: data.email,
    name: fullName || data.email,
    role: mapBackendRoleToUserRole(data.role),
    isVerified: Boolean(data.is_verified),
    isActive: data.is_active ?? true,
    emailVerified: data.email_verified ?? false,
    emailVerifiedAt: data.email_verified_at ?? null,
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
    let isMounted = true;

    const initializeAuth = async () => {
      const initToken = getAccessToken();
      try {
        if (initToken) {
          // Try to fetch current user
          const userData = await authApi.getCurrentUser();
          // If a signup/login happened while this request was in flight,
          // ignore the stale initialization result so it can't overwrite state.
          if (!isMounted || getAccessToken() !== initToken) return;
          if (isApiUser(userData)) {
            setUser(mapBackendUser(userData));
          } else {
            clearTokens();
          }
        }
      } catch (error) {
        // Avoid clearing tokens based on a stale initialization request.
        if (!isMounted || !initToken || getAccessToken() !== initToken) return;
        console.error('Failed to initialize auth:', error);
        clearTokens();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();
    return () => {
      isMounted = false;
    };
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

  const signup = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: SignupRole,
    licenseNumber?: string,
    licenseState?: string,
    specialty?: string,
  ) => {
    try {
      const [firstName = '', ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      
      // Map frontend roles to backend roles
      const roleMap: Record<SignupRole, BackendRole> = {
        patient: 'patient',
        doctor: 'provider',
        hospital: 'hospital',
        laboratory: 'laboratory',
        imaging: 'imaging',
        pharmacy: 'pharmacist',
        ambulance: 'ambulance',
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
        license_number: role === 'patient' ? undefined : licenseNumber,
        license_state: role === 'patient' ? undefined : licenseState,
        specialty: role === 'patient' ? undefined : specialty,
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
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zip_code: profile.zipCode,
      date_of_birth: profile.dateOfBirth,
      bio: profile.bio,
      profile_image_url: profile.avatar,
    });

    if (isApiUser(response)) {
      setUser(mapBackendUser(response));
    }
  }, [user]);

  const updateBasicInfo = useCallback(async (firstName: string, lastName: string) => {
    if (!user) throw new Error('No user logged in');

    const response = await authApi.updateProfile({
      first_name: firstName,
      last_name: lastName,
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

  const refreshCurrentUser = useCallback(async () => {
    if (!getAccessToken()) return null;

    try {
      const userData = await authApi.getCurrentUser();
      if (isApiUser(userData)) {
        const updatedUser = mapBackendUser(userData);
        setUser(updatedUser);
        return updatedUser;
      }
      return null;
    } catch (error) {
      const status = typeof error === 'object' && error && 'response' in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

      if (status === 401 || status === 403) {
        clearTokens();
        setUser(null);
      } else {
        console.error('Failed to refresh current user:', error);
      }

      return null;
    }
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    if (!user) throw new Error('No user logged in');

    await authApi.deleteAccount(password);
  }, [user]);

  const resendEmailVerification = useCallback(async () => {
    if (!user) throw new Error('No user logged in');
    if (user.role === 'admin' || user.emailVerified) return;

    await authApi.resendVerificationEmail();
  }, [user]);

  const clearCache = useCallback(() => {
    clearAleraStorage();
    clearTokens();
    setUser(null);
  }, []);

  // Mock functions for backward compatibility - to be replaced by API calls
  const addUser = useCallback(async (name: string, email: string, password: string, role: SignupRole): Promise<User> => {
    throw new Error('Use signup instead');
  }, []);

  const getUsers = useCallback((): User[] => {
    console.warn('getUsers is deprecated. Use proper API endpoints.');
    return [];
  }, []);

  useEffect(() => {
    const syncUser = () => {
      void refreshCurrentUser();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncUser();
      }
    };

    window.addEventListener('focus', syncUser);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', syncUser);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshCurrentUser]);

  if (isLoading) {
    // Don't mock auth methods during initialization; we still need signup/login to work
    // (especially right after page load).
    return (
      <AuthContext.Provider value={{
        user,
        // During initialization `user` may still be null, but we can still consider
        // the session authenticated if we have a token. This prevents ProtectedRoute
        // from bouncing feature routes through /login.
        isAuthenticated: Boolean(getAccessToken()),
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
        resendEmailVerification,
        clearCache
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
      resendEmailVerification,
      clearCache 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
