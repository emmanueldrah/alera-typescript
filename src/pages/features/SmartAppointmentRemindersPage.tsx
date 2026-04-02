import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Bell, CheckCircle2, Clock, Send } from 'lucide-react';
import { useAppData } from '@/contexts/useAppData';
import { useAuth } from '@/contexts/useAuth';
import type { Appointment } from '@/data/mockData';

export const SmartAppointmentRemindersPage: React.FC = () => {
  const { appointments, appointmentReminders, generateAppointmentReminders, sendReminder, acknowledgeReminder, getPatientReminders, getReminderByAppointment } = useAppData();
  const { user } = useAuth();
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set());
  const [selectedReminders, setSelectedReminders] = useState<Set<'24h' | '1h' | '15m'>>(new Set(['24h', '1h']));
  const [activeTab, setActiveTab] = useState<'generate' | 'manage'>('generate');

  // Filter appointments: upcoming, not cancelled, no existing reminders
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((apt) => {
        const aptDate = new Date(apt.date);
        return (
          aptDate > now &&
          apt.status !== 'cancelled' &&
          (user?.role === 'doctor' || apt.patientId === user?.id) &&
          getReminderByAppointment(apt.id).length === 0
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, user, getReminderByAppointment]);

  // Get patient reminders
  const patientReminders = useMemo(() => {
    if (user?.role === 'doctor') return [];
    return getPatientReminders(user?.id || '');
  }, [user, getPatientReminders]);

  const handleSelectAppointment = (appointmentId: string) => {
    const newSelected = new Set(selectedAppointments);
    if (newSelected.has(appointmentId)) {
      newSelected.delete(appointmentId);
    } else {
      newSelected.add(appointmentId);
    }
    setSelectedAppointments(newSelected);
  };

  const handleToggleReminder = (reminderType: '24h' | '1h' | '15m') => {
    const newSelected = new Set(selectedReminders);
    if (newSelected.has(reminderType)) {
      newSelected.delete(reminderType);
    } else {
      newSelected.add(reminderType);
    }
    setSelectedReminders(newSelected);
  };

  const handleGenerateReminders = () => {
    selectedAppointments.forEach((appointmentId) => {
      generateAppointmentReminders(appointmentId, Array.from(selectedReminders) as ('24h' | '1h' | '15m')[]);
    });
    setSelectedAppointments(new Set());
    setActiveTab('manage');
  };

  const handleResendReminder = (reminderId: string) => {
    sendReminder(reminderId, 'email');
  };

  const handleAcknowledgeReminder = (reminderId: string) => {
    acknowledgeReminder(reminderId, user?.id || '');
  };

  // Reminder status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Send className="w-3 h-3 mr-1" /> Sent</Badge>;
      case 'acknowledged':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Acknowledged</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case '24h':
        return '24 hours before';
      case '1h':
        return '1 hour before';
      case '15m':
        return '15 minutes before';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smart Appointment Reminders</h1>
        <p className="text-gray-600 mt-2">Manage appointment notifications and reminders</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'generate'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Generate Reminders
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'manage'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage Reminders ({patientReminders.length})
        </button>
      </div>

      {/* Generate Reminders Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          {upcomingAppointments.length === 0 ? (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-blue-800">No upcoming appointments without reminders</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Reminder Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reminder Types</CardTitle>
                  <CardDescription>Select when to send reminders before appointments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {(['24h', '1h', '15m'] as const).map((reminderType) => (
                      <div key={reminderType} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={`reminder-${reminderType}`}
                          checked={selectedReminders.has(reminderType)}
                          onCheckedChange={() => handleToggleReminder(reminderType)}
                        />
                        <label htmlFor={`reminder-${reminderType}`} className="flex-1 cursor-pointer">
                          <div className="font-medium text-gray-900">{getReminderTypeLabel(reminderType)}</div>
                          <div className="text-sm text-gray-600">
                            {reminderType === '24h' && 'Get notified a full day before'}
                            {reminderType === '1h' && 'Get notified an hour before'}
                            {reminderType === '15m' && 'Get notified 15 minutes before'}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                  <CardDescription>Select appointments to create reminders for</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`apt-${appointment.id}`}
                        checked={selectedAppointments.has(appointment.id)}
                        onCheckedChange={() => handleSelectAppointment(appointment.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label htmlFor={`apt-${appointment.id}`} className="font-medium text-gray-900 cursor-pointer">
                            {appointment.doctorName ?? 'Doctor'} - {appointment.type ?? 'Appointment'}
                          </label>
                          <Badge variant="outline" className="text-xs">{appointment.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>📅 {new Date(appointment.date).toLocaleDateString()}</div>
                          <div>⏰ {appointment.time}</div>
                          {appointment.appointmentMode && <div>📍 {appointment.appointmentMode === 'telemedicine' ? 'Virtual' : 'In-person'}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Generate Button */}
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateReminders}
                  disabled={selectedAppointments.size === 0 || selectedReminders.size === 0}
                  className="gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Generate Reminders ({selectedAppointments.size})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedAppointments(new Set())}
                  disabled={selectedAppointments.size === 0}
                >
                  Clear Selection
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Manage Reminders Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {patientReminders.length === 0 ? (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-6">
                <p className="text-gray-700">No reminders created yet. Go to the "Generate Reminders" tab to create some.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Group reminders by appointment */}
              {Array.from(new Set(patientReminders.map((r) => r.appointmentId)))
                .map((aptId) => {
                  const reminders = patientReminders.filter((r) => r.appointmentId === aptId);
                  const appointment = appointments.find((a) => a.id === aptId);
                  return (
                    <Card key={aptId}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{appointment?.doctorName ?? 'Doctor'} - {appointment?.type ?? 'Appointment'}</CardTitle>
                            <CardDescription>
                              {appointment ? `${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}` : 'Date pending'}
                            </CardDescription>
                          </div>
                          {appointment?.appointmentMode && <Badge variant="secondary">{appointment.appointmentMode === 'telemedicine' ? 'Virtual' : 'In-person'}</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {reminders.map((reminder) => (
                          <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{getReminderTypeLabel(reminder.reminderType)}</span>
                                {getStatusBadge(reminder.status)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Method: <span className="font-medium capitalize">{reminder.notificationMethod}</span>
                                {reminder.sentAt && <div>Sent: {new Date(reminder.sentAt).toLocaleString()}</div>}
                                {reminder.acknowledgedAt && <div>Acknowledged: {new Date(reminder.acknowledgedAt).toLocaleString()}</div>}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              {reminder.status === 'failed' && (
                                <Button size="sm" variant="outline" onClick={() => handleResendReminder(reminder.id)}>
                                  Resend
                                </Button>
                              )}
                              {reminder.status === 'sent' && reminder.patientId === user?.id && (
                                <Button size="sm" variant="outline" onClick={() => handleAcknowledgeReminder(reminder.id)}>
                                  Acknowledge
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            How Smart Reminders Work
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 space-y-2">
          <p>• Reminders are automatically generated for upcoming appointments at specified intervals</p>
          <p>• You can choose multiple reminder times (24 hours, 1 hour, or 15 minutes before)</p>
          <p>• Reminders are sent via your preferred method (in-app, email, or SMS)</p>
          <p>• Acknowledge reminders once you've seen them to keep your dashboard organized</p>
          <p>• Admin can track reminder delivery and retry failed notifications</p>
        </CardContent>
      </Card>
    </div>
  );
};
