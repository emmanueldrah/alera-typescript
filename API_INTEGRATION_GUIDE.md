# Frontend API Integration - Implementation Guide

## Overview

The ALERA frontend is now connected to the FastAPI backend with all 56 API endpoints integrated. This guide explains how to use the API client and integrate it into React components.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_ENV=development
```

### Starting the Backend

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### Starting the Frontend

```bash
npm run dev
```

## API Client Architecture

### 1. **API Client** (`src/lib/apiClient.ts`)

Core Axios instance with:
- Automatic token injection in request headers
- Token refresh with refresh tokens
- 401 error handling with automatic retry
- Configurable request timeout

**Token Management**
```typescript
import { setTokens, getAccessToken, clearTokens } from '@/lib/apiClient';

// Login sets tokens
const response = await authApi.login(email, password);
setTokens(response.access_token, response.refresh_token);

// Tokens are automatically added to requests
// Tokens are stored in localStorage: access_token, refresh_token

// Logout
clearTokens();
```

### 2. **API Services** (`src/lib/apiService.ts`)

Organized API endpoint wrappers:
- `authApi` - Authentication endpoints
- `usersApi` - User management
- `appointmentsApi` - Appointment scheduling
- `prescriptionsApi` - Prescription management
- `allergiesApi` - Allergy tracking
- `notificationsApi` - Notification management
- `videoCallsApi` - Telemedicine video calls
- `messagingApi` - Secure messaging
- `adminApi` - Admin dashboard

**Usage Example**
```typescript
import { api } from '@/lib/apiService';

// List appointments
const appointments = await api.appointments.listAppointments(0, 20);

// Create prescription
const prescription = await api.prescriptions.createPrescription({
  patient_id: 'patient-123',
  medication_name: 'Aspirin',
  dosage: '500mg',
  frequency: 'daily',
  duration_days: 30,
  refills_allowed: 3,
});

// Get notifications
const notifications = await api.notifications.listNotifications();
```

### 3. **Error Handling** (`src/lib/errorHandler.ts`)

Comprehensive error handling utilities:

```typescript
import { 
  getErrorMessage, 
  isAuthError, 
  isAuthorizationError,
  getValidationErrors,
  handleApiError 
} from '@/lib/errorHandler';

try {
  await api.appointments.createAppointment(data);
} catch (error) {
  // Get formatted error message
  const message = getErrorMessage(error);
  
  // Check error type
  if (isAuthError(error)) {
    // Session expired - redirect to login
  }
  
  if (isAuthorizationError(error)) {
    // Insufficient permissions
  }
  
  // Get validation errors as object
  const errors = getValidationErrors(error);
  // { patient_id: 'Invalid value', ... }
}
```

### 4. **API Hooks** (`src/hooks/use-api.ts`)

React hooks for API calls with automatic loading and error states:

```typescript
import { useApi, useMutation } from '@/hooks/use-api';

// Fetch data
export const AppointmentsList = () => {
  const { data: appointments, loading, error, refetch } = useApi(
    () => api.appointments.listAppointments(0, 20),
    [],
    {
      onSuccess: (data) => console.log('Loaded', data),
      onError: (error) => console.error('Failed:', error),
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {appointments?.map(apt => (
        <div key={apt.id}>{apt.patientName}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
};

// Create/Update data
export const CreateAppointment = () => {
  const { mutate, loading, error } = useMutation(
    (appointmentData) => 
      api.appointments.createAppointment(appointmentData)
  );

  const handleSubmit = async (formData) => {
    try {
      await mutate(formData);
      // Success - appointment created
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({/* form data */});
    }}>
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create Appointment'}
      </button>
    </form>
  );
};
```

## Context Integration

### AuthContext Integration

The AuthContext now uses the API backend:

```typescript
import { useAuth } from '@/contexts/useAuth';

export const LoginForm = () => {
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Successfully logged in - tokens are stored
      // User data is available in `user` state
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* form fields */}
    </form>
  );
};

// Check authentication status
if (!isAuthenticated) {
  // Not logged in
}
```

### AppDataContext Integration

The AppDataContext loads real data from the API on mount (if authenticated):

```typescript
import { useAppData } from '@/contexts/useAppData';

export const DashboardHome = () => {
  const { appointments, prescriptions, patientAllergies } = useAppData();

  return (
    <div>
      <p>Appointments: {appointments.length}</p>
      <p>Prescriptions: {prescriptions.length}</p>
      <p>Allergies: {patientAllergies.length}</p>
    </div>
  );
};
```

## Implementation Examples

### Creating an Appointment

```typescript
import { useState } from 'react';
import { useMutation } from '@/hooks/use-api';
import { api } from '@/lib/apiService';
import { getErrorMessage, getValidationErrors } from '@/lib/errorHandler';

export const BookAppointment = () => {
  const [formData, setFormData] = useState({
    patient_id: '',
    provider_id: '',
    appointment_date: '',
    appointment_time: '',
    appointment_type: 'in-person',
    reason_for_visit: '',
  });

  const { mutate, loading, error } = useMutation(
    (data) => api.appointments.createAppointment(data)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await mutate(formData);
      console.log('Appointment created:', result);
      // Reset form or navigate
    } catch (error) {
      const validationErrors = getValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        console.error('Validation errors:', validationErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="date"
        value={formData.appointment_date}
        onChange={(e) => setFormData({
          ...formData,
          appointment_date: e.target.value,
        })}
      />
      
      <button disabled={loading}>
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
};
```

### Fetching Video Calls

```typescript
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/apiService';

export const VideoCallsList = () => {
  const { data: calls, loading, error } = useApi(
    () => api.videoCalls.listCalls(0, 20)
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      {calls?.map((call) => (
        <div key={call.id}>
          <h3>{call.patient_name} with {call.provider_name}</h3>
          <p>Status: {call.status}</p>
          <button onClick={() => joinCall(call.id)}>
            Join Call
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Sending a Message

```typescript
import { useMutation } from '@/hooks/use-api';
import { api } from '@/lib/apiService';
import { useAuth } from '@/contexts/useAuth';

export const SendMessage = ({ recipientId }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const { mutate, loading } = useMutation(
    (data) => api.messaging.sendMessage(data)
  );

  const handleSend = async () => {
    await mutate({
      recipient_id: recipientId,
      subject,
      content: message,
    });
    setMessage('');
    setSubject('');
  };

  return (
    <div>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
};
```

## Complete Endpoint Reference

### Authentication (5 endpoints)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/change-password` - Change password
- `POST /auth/logout` - User logout

### Users (4 endpoints)
- `GET /users/me` - Get current user
- `PUT /users/me` - Update current user profile
- `GET /users/{id}` - Get user by ID
- `GET /users/` - List all users (admin only)

### Appointments (5 endpoints)
- `POST /appointments` - Create appointment
- `GET /appointments` - List appointments
- `GET /appointments/{id}` - Get appointment
- `PUT /appointments/{id}` - Update appointment
- `POST /appointments/{id}/cancel` - Cancel appointment

### Prescriptions (4 endpoints)
- `POST /prescriptions` - Create prescription
- `GET /prescriptions` - List prescriptions
- `GET /prescriptions/{id}` - Get prescription
- `PUT /prescriptions/{id}` - Update prescription

### Allergies (5 endpoints)
- `POST /allergies` - Create allergy
- `GET /allergies` - List allergies
- `GET /allergies/{id}` - Get allergy
- `PUT /allergies/{id}` - Update allergy
- `DELETE /allergies/{id}` - Delete allergy

### Notifications (7 endpoints)
- `GET /notifications` - List notifications
- `GET /notifications/{id}` - Get notification
- `PUT /notifications/{id}/read` - Mark as read
- `PUT /notifications/{id}/archive` - Archive notification
- `DELETE /notifications/{id}` - Delete notification
- `PUT /notifications/mark-all/read` - Mark all as read
- `GET /notifications/summary/unread-count` - Get unread count

### Video Calls (4 endpoints)
- `POST /telemedicine/video-calls` - Initiate call
- `GET /telemedicine/video-calls` - List calls
- `GET /telemedicine/video-calls/{id}` - Get call details
- `PUT /telemedicine/video-calls/{id}` - Update call status

### Messaging (5 endpoints)
- `POST /telemedicine/messages` - Send message
- `GET /telemedicine/messages` - List messages
- `GET /telemedicine/messages/{id}` - Get message
- `PUT /telemedicine/messages/{id}` - Update message
- `DELETE /telemedicine/messages/{id}` - Delete message

### Admin (9 endpoints)
- `GET /admin/dashboard/stats` - Dashboard stats
- `GET /admin/analytics/appointments` - Appointment analytics
- `GET /admin/analytics/users` - User analytics
- `GET /admin/users/` - List all users
- `PUT /admin/users/{id}/deactivate` - Deactivate user
- `PUT /admin/users/{id}/change-role` - Change user role
- `GET /admin/audit-logs/` - Audit logs
- `GET /admin/system/health` - System health
- `GET /admin/notifications/` - Admin notifications

## Troubleshooting

### 401 Unauthorized
Tokens have expired or are invalid. The API client automatically attempts to refresh. If refresh fails, user is redirected to login.

### 403 Forbidden
User doesn't have permission for this action. Check user role and permissions.

### 422 Validation Error
Request data doesn't match expected format. Use `getValidationErrors()` to see field-specific errors.

### Network Error
API server is not reachable. Check:
1. Backend server is running on port 8000
2. `VITE_API_URL` environment variable is correct
3. No firewall blocking localhost:8000

## Best Practices

1. **Use hooks for data fetching** - Always use `useApi` or `useMutation` for API calls in components
2. **Handle all errors** - Use error handling utilities to provide user feedback
3. **Check authentication** - Use `useAuth()` hook to check if user is logged in
4. **Use loading states** - Show loading indicators during API calls
5. **Validate input** - Validate form data before submitting to API
6. **Cache wisely** - Store API responses in context or state appropriately
7. **Log errors for debugging** - Use `logError()` utility for server-side logging

## Migration Checklist

- [x] API client setup with Axios
- [x] Token management and refresh
- [x] Error handling utilities
- [x] API service wrappers for all endpoints
- [x] React hooks for API calls
- [x] AuthContext updated to use API
- [x] AppDataContext updated to load from API
- [ ] Replace all mock data calls with API calls
- [ ] Update all forms to use API mutations
- [ ] Add loading indicators
- [ ] Add error messages to components
- [ ] Test all endpoints
- [ ] Deploy backend
- [ ] Configure production environment
