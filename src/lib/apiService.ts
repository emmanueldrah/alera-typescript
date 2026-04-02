import { apiClient } from './apiClient';

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export const authApi = {
  register: async (userData: {
    email: string;
    password: string;
    full_name: string;
    role: 'patient' | 'provider' | 'pharmacist' | 'admin';
    phone?: string;
  }) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data; // { access_token, refresh_token, user }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

// ============================================================================
// USER ENDPOINTS
// ============================================================================

export const usersApi = {
  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (userData: {
    full_name?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    specialization?: string;
  }) => {
    const response = await apiClient.put('/users/me', userData);
    return response.data;
  },

  getUserById: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  listAllUsers: async (skip: number = 0, limit: number = 100) => {
    const response = await apiClient.get('/users/', { params: { skip, limit } });
    return response.data;
  },
};

// ============================================================================
// APPOINTMENT ENDPOINTS
// ============================================================================

export const appointmentsApi = {
  createAppointment: async (appointmentData: {
    patient_id: string;
    provider_id: string;
    appointment_date: string;
    appointment_time: string;
    appointment_type: 'in-person' | 'telehealth';
    reason_for_visit: string;
  }) => {
    const response = await apiClient.post('/appointments', appointmentData);
    return response.data;
  },

  listAppointments: async (skip: number = 0, limit: number = 20) => {
    const response = await apiClient.get('/appointments', { params: { skip, limit } });
    return response.data;
  },

  getAppointment: async (appointmentId: string) => {
    const response = await apiClient.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  updateAppointment: async (
    appointmentId: string,
    updateData: {
      appointment_date?: string;
      appointment_time?: string;
      appointment_type?: 'in-person' | 'telehealth';
      reason_for_visit?: string;
      status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    }
  ) => {
    const response = await apiClient.put(`/appointments/${appointmentId}`, updateData);
    return response.data;
  },

  cancelAppointment: async (appointmentId: string, reason: string) => {
    const response = await apiClient.post(`/appointments/${appointmentId}/cancel`, {
      cancellation_reason: reason,
    });
    return response.data;
  },
};

// ============================================================================
// PRESCRIPTION ENDPOINTS
// ============================================================================

export const prescriptionsApi = {
  createPrescription: async (prescriptionData: {
    patient_id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration_days: number;
    refills_allowed: number;
    notes?: string;
  }) => {
    const response = await apiClient.post('/prescriptions', prescriptionData);
    return response.data;
  },

  listPrescriptions: async (skip: number = 0, limit: number = 20) => {
    const response = await apiClient.get('/prescriptions', { params: { skip, limit } });
    return response.data;
  },

  getPrescription: async (prescriptionId: string) => {
    const response = await apiClient.get(`/prescriptions/${prescriptionId}`);
    return response.data;
  },

  updatePrescription: async (
    prescriptionId: string,
    updateData: {
      dosage?: string;
      frequency?: string;
      duration_days?: number;
      refills_allowed?: number;
      notes?: string;
    }
  ) => {
    const response = await apiClient.put(`/prescriptions/${prescriptionId}`, updateData);
    return response.data;
  },
};

// ============================================================================
// ALLERGY ENDPOINTS
// ============================================================================

export const allergiesApi = {
  createAllergy: async (allergyData: {
    patient_id: string;
    allergen_name: string;
    allergen_type: string;
    severity: 'mild' | 'moderate' | 'severe';
    reaction_description: string;
    notes?: string;
  }) => {
    const response = await apiClient.post('/allergies', allergyData);
    return response.data;
  },

  listAllergies: async (skip: number = 0, limit: number = 20) => {
    const response = await apiClient.get('/allergies', { params: { skip, limit } });
    return response.data;
  },

  getAllergy: async (allergyId: string) => {
    const response = await apiClient.get(`/allergies/${allergyId}`);
    return response.data;
  },

  updateAllergy: async (
    allergyId: string,
    updateData: {
      allergen_name?: string;
      allergen_type?: string;
      severity?: 'mild' | 'moderate' | 'severe';
      reaction_description?: string;
      notes?: string;
    }
  ) => {
    const response = await apiClient.put(`/allergies/${allergyId}`, updateData);
    return response.data;
  },

  deleteAllergy: async (allergyId: string) => {
    const response = await apiClient.delete(`/allergies/${allergyId}`);
    return response.data;
  },

  getPatientAllergies: async (patientId: string) => {
    const response = await apiClient.get(`/allergies/patient/${patientId}`);
    return response.data;
  },
};

// ============================================================================
// MEDICAL HISTORY ENDPOINTS (Implicit from user context)
// ============================================================================

export const medicalHistoryApi = {
  listMedicalHistory: async (skip: number = 0, limit: number = 20) => {
    const response = await apiClient.get('/medical-history', { params: { skip, limit } });
    return response.data;
  },

  getMedicalRecord: async (recordId: string) => {
    const response = await apiClient.get(`/medical-history/${recordId}`);
    return response.data;
  },

  getUserMedicalHistory: async (userId: string) => {
    const response = await apiClient.get(`/medical-history/user/${userId}`);
    return response.data;
  },
};

// ============================================================================
// NOTIFICATION ENDPOINTS
// ============================================================================

export const notificationsApi = {
  listNotifications: async (skip: number = 0, limit: number = 20) => {
    const response = await apiClient.get('/notifications', { params: { skip, limit } });
    return response.data;
  },

  getNotification: async (notificationId: string) => {
    const response = await apiClient.get(`/notifications/${notificationId}`);
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  archiveNotification: async (notificationId: string) => {
    const response = await apiClient.put(`/notifications/${notificationId}/archive`);
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.put('/notifications/mark-all/read');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/summary/unread-count');
    return response.data;
  },
};

// ============================================================================
// VIDEO CALL ENDPOINTS
// ============================================================================

export const videoCallsApi = {
  initiateCall: async (callData: {
    patient_id: string;
    provider_id: string;
    scheduled_time?: string;
  }) => {
    const response = await apiClient.post('/telemedicine/video-calls', callData);
    return response.data; // { channel_name, call_token, agora_uid }
  },

  listCalls: async (skip: number = 0, limit: number = 20) => {
    const response = await apiClient.get('/telemedicine/video-calls', { params: { skip, limit } });
    return response.data;
  },

  getCallDetails: async (callId: string) => {
    const response = await apiClient.get(`/telemedicine/video-calls/${callId}`);
    return response.data;
  },

  updateCallStatus: async (
    callId: string,
    updateData: {
      status: 'initiated' | 'ringing' | 'connected' | 'ended' | 'failed';
      call_quality?: string;
      recording_url?: string;
    }
  ) => {
    const response = await apiClient.put(`/telemedicine/video-calls/${callId}`, updateData);
    return response.data;
  },
};

// ============================================================================
// MESSAGING ENDPOINTS
// ============================================================================

export const messagingApi = {
  sendMessage: async (messageData: {
    recipient_id: string;
    subject: string;
    content: string;
    attachment_url?: string;
  }) => {
    const response = await apiClient.post('/telemedicine/messages', messageData);
    return response.data;
  },

  listMessages: async (skip: number = 0, limit: number = 20) => {
    const response = await apiClient.get('/telemedicine/messages', { params: { skip, limit } });
    return response.data;
  },

  getMessage: async (messageId: string) => {
    const response = await apiClient.get(`/telemedicine/messages/${messageId}`);
    return response.data;
  },

  updateMessage: async (
    messageId: string,
    updateData: {
      is_read?: boolean;
      is_archived?: boolean;
    }
  ) => {
    const response = await apiClient.put(`/telemedicine/messages/${messageId}`, updateData);
    return response.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await apiClient.delete(`/telemedicine/messages/${messageId}`);
    return response.data;
  },
};

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

export const adminApi = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  getAppointmentAnalytics: async () => {
    const response = await apiClient.get('/admin/analytics/appointments');
    return response.data;
  },

  getUserAnalytics: async () => {
    const response = await apiClient.get('/admin/analytics/users');
    return response.data;
  },

  listAllUsers: async (skip: number = 0, limit: number = 100) => {
    const response = await apiClient.get('/admin/users', { params: { skip, limit } });
    return response.data;
  },

  deactivateUser: async (userId: string, reason: string) => {
    const response = await apiClient.put(`/admin/users/${userId}/deactivate`, {
      deactivation_reason: reason,
    });
    return response.data;
  },

  changeUserRole: async (userId: string, newRole: string) => {
    const response = await apiClient.put(`/admin/users/${userId}/change-role`, {
      new_role: newRole,
    });
    return response.data;
  },

  getAuditLogs: async (skip: number = 0, limit: number = 100) => {
    const response = await apiClient.get('/admin/audit-logs', { params: { skip, limit } });
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await apiClient.get('/admin/system/health');
    return response.data;
  },

  getAdminNotifications: async () => {
    const response = await apiClient.get('/admin/notifications');
    return response.data;
  },
};

// ============================================================================
// EXPORT ALL APIS
// ============================================================================

export const api = {
  auth: authApi,
  users: usersApi,
  appointments: appointmentsApi,
  prescriptions: prescriptionsApi,
  allergies: allergiesApi,
  medicalHistory: medicalHistoryApi,
  notifications: notificationsApi,
  videoCalls: videoCallsApi,
  messaging: messagingApi,
  admin: adminApi,
};
