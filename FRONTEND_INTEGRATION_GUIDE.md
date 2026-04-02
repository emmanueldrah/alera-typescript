# ALERA Frontend-Backend Integration Guide

## Overview

This guide explains how to connect the React frontend to the Python/FastAPI backend, replacing all `localStorage`-based mock data with real API calls.

---

## 1. Backend API Base URL Configuration

### Step 1: Update Environment Variables

Add to `src/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_ENABLE_MOCK_DATA=false
```

For production:
```env
VITE_API_BASE_URL=https://your-backend.vercel.app
VITE_API_TIMEOUT=30000
VITE_ENABLE_MOCK_DATA=false
```

### Step 2: Create API Client

Create `src/lib/apiClient.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuth } from '../contexts/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class APIClient {
  private client: AxiosInstance;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
          // Token expired, try refresh
          if (!this.tokenRefreshPromise) {
            this.tokenRefreshPromise = this.refreshToken();
          }

          try {
            const newToken = await this.tokenRefreshPromise;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          } finally {
            this.tokenRefreshPromise = null;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await this.client.post('/api/auth/refresh', {
      refresh_token: refreshToken,
    });

    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    return access_token;
  }

  // Generic GET request
  get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  // Generic POST request
  post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  // Generic PUT request
  put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  // Generic DELETE request
  delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new APIClient();
```

---

## 2. Authentication Flow

### Update `AuthContext.tsx`:

```typescript
import { apiClient } from '../lib/apiClient';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      loadCurrentUser();
    }
    setLoading(false);
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data } = await apiClient.get('/api/users/me');
      setUser(data);
    } catch (error) {
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await apiClient.post('/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      await loadCurrentUser();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (userData: UserCreate) => {
    try {
      await apiClient.post('/api/auth/register', userData);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 3. Data Contexts Update

### AppDataContext

Replace `localStorage` calls with API calls:

```typescript
// Old (localStorage)
const appointments = JSON.parse(localStorage.getItem('alera_appointments') || '[]');

// New (API)
const { data: appointments } = await apiClient.get('/api/appointments');
```

### Implementation Pattern:

```typescript
export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/appointments');
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointment: AppointmentCreate) => {
    try {
      const { data } = await apiClient.post('/api/appointments', appointment);
      setAppointments([...appointments, data]);
      return data;
    } catch (error) {
      throw new Error('Failed to create appointment');
    }
  };

  const updateAppointment = async (id: number, updates: AppointmentUpdate) => {
    try {
      const { data } = await apiClient.put(`/api/appointments/${id}`, updates);
      setAppointments(appointments.map(a => a.id === id ? data : a));
      return data;
    } catch (error) {
      throw new Error('Failed to update appointment');
    }
  };

  const deleteAppointment = async (id: number) => {
    try {
      await apiClient.delete(`/api/appointments/${id}`);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (error) {
      throw new Error('Failed to delete appointment');
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <AppDataContext.Provider value={{ appointments, loading, createAppointment, updateAppointment, deleteAppointment }}>
      {children}
    </AppDataContext.Provider>
  );
};
```

---

## 4. API Endpoints Summary

### Authentication
```
POST   /api/auth/register           Register user
POST   /api/auth/login              Login & get tokens
POST   /api/auth/refresh            Refresh access token
POST   /api/auth/change-password    Change password
POST   /api/auth/logout             Logout
```

### Users
```
GET    /api/users/me                Current user
PUT    /api/users/me                Update profile
GET    /api/users/{id}              Get user by ID
```

### Appointments
```
GET    /api/appointments/           List appointments
POST   /api/appointments/           Create appointment
GET    /api/appointments/{id}       Get appointment
PUT    /api/appointments/{id}       Update appointment
DELETE /api/appointments/{id}       Cancel appointment
```

### Prescriptions
```
GET    /api/prescriptions/          List prescriptions
POST   /api/prescriptions/          Create prescription
GET    /api/prescriptions/{id}      Get prescription
PUT    /api/prescriptions/{id}      Update prescription
```

### Allergies
```
GET    /api/allergies/              List allergies
POST   /api/allergies/              Create allergy
GET    /api/allergies/{patient_id} Get patient allergies
PUT    /api/allergies/{id}          Update allergy
DELETE /api/allergies/{id}          Delete allergy
```

### Notifications
```
GET    /api/notifications/          List notifications
GET    /api/notifications/{id}      Get notification
PUT    /api/notifications/{id}/read Mark as read
PUT    /api/notifications/{id}/archive Archive
DELETE /api/notifications/{id}      Delete
GET    /api/notifications/summary/unread-count Unread count
```

### Telemedicine
```
POST   /api/telemedicine/video-calls/          Initiate call
GET    /api/telemedicine/video-calls/          List calls
GET    /api/telemedicine/video-calls/{id}      Get call
PUT    /api/telemedicine/video-calls/{id}      Update call

POST   /api/telemedicine/messages/             Send message
GET    /api/telemedicine/messages/             List messages
GET    /api/telemedicine/messages/{id}         Get message
PUT    /api/telemedicine/messages/{id}         Update message
DELETE /api/telemedicine/messages/{id}         Delete message
```

### Admin
```
GET    /api/admin/dashboard/stats              Dashboard stats
GET    /api/admin/users/                       List all users
PUT    /api/admin/users/{id}/deactivate        Deactivate user
PUT    /api/admin/users/{id}/change-role       Change user role
GET    /api/admin/analytics/appointments       Appointment analytics
GET    /api/admin/analytics/users              User analytics
GET    /api/admin/audit-logs/                  Audit logs
GET    /api/admin/system/health                System health
```

---

## 5. Error Handling

```typescript
import { useToast } from '../hooks/use-toast';

export const useAPI = () => {
  const { toast } = useToast();

  const handleError = (error: any) => {
    if (error.response?.status === 401) {
      toast({
        title: 'Unauthorized',
        description: 'Your session has expired. Please log in again.',
        variant: 'destructive',
      });
    } else if (error.response?.status === 403) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to perform this action.',
        variant: 'destructive',
      });
    } else if (error.response?.status === 404) {
      toast({
        title: 'Not Found',
        description: 'The requested resource was not found.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return { handleError };
};
```

---

## 6. Component Example: Appointments List

**Before (localStorage):**
```typescript
const [appointments, setAppointments] = useState([]);

useEffect(() => {
  const stored = localStorage.getItem('alera_appointments');
  setAppointments(stored ? JSON.parse(stored) : []);
}, []);
```

**After (API):**
```typescript
const { appointments, loading } = useAppData();
const { handleError } = useAPI();

useEffect(() => {
  // Auto-fetch on component mount (AppDataProvider handles this)
}, [appointments]);

const handleDelete = async (id: number) => {
  try {
    await apiClient.delete(`/api/appointments/${id}`);
    toast({ title: 'Appointment cancelled' });
  } catch (error) {
    handleError(error);
  }
};
```

---

## 7. Token Management

Tokens are automatically managed by the API client:
- **Stored in:** `localStorage`
- **Keys:** `access_token`, `refresh_token`
- **Refresh:** Automatic when access token expires
- **Logout:** Remove tokens from localStorage

---

## 8. Development vs Production

### Development (Local Backend)
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Production (Vercel)
```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

---

## 9. Testing Integration

```typescript
// Test login flow
const { login } = useAuth();
const success = await login('test@example.com', 'password123');

// Test appointment creation
const { createAppointment } = useAppData();
const newAppt = await createAppointment({
  provider_id: 2,
  title: 'Doctor Checkup',
  appointment_type: 'telehealth',
  scheduled_time: new Date(),
  duration_minutes: 30,
});
```

---

## 10. Migration Checklist

- [ ] Install axios: `npm install axios`
- [ ] Create `src/lib/apiClient.ts` with API client
- [ ] Update `AuthContext.tsx` to use API
- [ ] Update `AppDataContext.tsx` to use API
- [ ] Update `ChatContext.tsx` to use API
- [ ] Update `NotificationContext.tsx` to use API
- [ ] Add error handling to components
- [ ] Remove localStorage initialization
- [ ] Test all CRUD operations
- [ ] Test token refresh flow
- [ ] Test logout & redirect
- [ ] Update `.env.local` with backend URL
- [ ] Test with real backend running

---

**Status:** Ready for implementation  
**Next Steps:** Start replacing localStorage calls with API client calls in each context
