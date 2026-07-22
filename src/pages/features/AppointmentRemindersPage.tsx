import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, CheckCircle, AlertCircle, Download, Send, Calendar, Search, User, Stethoscope } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import type { Appointment } from '@/data/mockData';
import { getAppointmentTimeUntilLabel, isWithinNext24Hours, isWithinNextHour, parseAppointmentDateTime } from '@/lib/appointmentUtils';

const AppointmentRemindersPage = () => {
  const { user } = useAuth();
  const { appointments, updateAppointment } = useAppData();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reminderFilter, setReminderFilter] = useState('all');

  const userAppointments = useMemo(() => {
    if (user?.role === 'doctor') {
      return appointments.filter(apt => apt.doctorId === user.id && apt.status === 'scheduled');
    }
    return appointments.filter(apt => apt.patientId === user?.id && apt.status === 'scheduled');
  }, [appointments, user?.id, user?.role]);

  const filtered = useMemo(() => {
    return userAppointments.filter(apt => {
      const matchesSearch = !searchQuery.trim()
        || apt.type.toLowerCase().includes(searchQuery.trim().toLowerCase())
        || apt.doctorName.toLowerCase().includes(searchQuery.trim().toLowerCase())
        || apt.patientName.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      if (reminderFilter === 'all') return matchesSearch && matchesStatus;
      if (reminderFilter === 'pending') return matchesSearch && matchesStatus && (!apt.reminder24hSent || !apt.reminder1hSent);
      if (reminderFilter === 'sent') return matchesSearch && matchesStatus && (apt.reminder24hSent || apt.reminder1hSent);
      return matchesSearch && matchesStatus;
    });
  }, [userAppointments, searchQuery, statusFilter, reminderFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dateA = parseAppointmentDateTime(a.date, a.time);
      const dateB = parseAppointmentDateTime(b.date, b.time);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filtered]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: userAppointments.length,
      upcoming24h: userAppointments.filter(apt => {
        return isWithinNext24Hours(apt.date, apt.time, now);
      }).length,
      remindersSent: userAppointments.filter(apt => apt.reminder24hSent || apt.reminder1hSent).length,
      pendingReminders: userAppointments.filter(apt => !apt.reminder24hSent && !apt.reminder1hSent).length,
    };
  }, [userAppointments]);

  const handleSend24hReminder = (appointment: Appointment) => {
    if (!appointment.reminder24hSent) {
      addNotification({
        type: 'reminder',
        title: `Appointment Reminder: ${appointment.type}`,
        message: user?.role === 'doctor'
          ? `Your appointment with ${appointment.patientName} is scheduled for ${appointment.date} at ${appointment.time}. Please be ready 5 minutes early.`
          : `Your appointment with ${appointment.doctorName} is scheduled for ${appointment.date} at ${appointment.time}. Please join 5 minutes early.`,
        audience: 'personal',
        priority: 'medium',
        targetEmails: user?.email ? [user.email] : [],
        actionUrl: '/dashboard/appointments',
        actionLabel: 'Open appointment',
      });
      updateAppointment(appointment.id, prev => ({ ...prev, reminder24hSent: true }));
      toast({
        title: '24-hour reminder sent',
        description: `Reminder queued for ${appointment.type} on ${appointment.date}.`,
      });
    }
  };

  const handleSend1hReminder = (appointment: Appointment) => {
    if (!appointment.reminder1hSent) {
      addNotification({
        type: 'reminder',
        title: `Appointment Starting Soon: ${appointment.type}`,
        message: user?.role === 'doctor'
          ? `Your appointment with ${appointment.patientName} starts in 1 hour. Please be ready to join.`
          : `Your appointment with ${appointment.doctorName} starts in 1 hour. Please be ready to join.`,
        audience: 'personal',
        priority: 'high',
        targetEmails: user?.email ? [user.email] : [],
        actionUrl: '/dashboard/appointments',
        actionLabel: 'Open appointment',
      });
      updateAppointment(appointment.id, prev => ({ ...prev, reminder1hSent: true }));
      toast({
        title: '1-hour reminder sent',
        description: `Reminder queued for ${appointment.type} on ${appointment.date}.`,
      });
    }
  };

  const handleExportReminders = () => {
    if (sorted.length === 0) {
      toast({
        title: 'Nothing to export',
        description: 'There are no reminder rows in the current view.',
        variant: 'destructive',
      });
      return;
    }

    const csv = [
      ['Appointment Type', 'Doctor', 'Patient', 'Date', 'Time', 'Mode', '24h Reminder', '1h Reminder'].join(','),
      ...sorted.map((appointment) => [
        appointment.type,
        appointment.doctorName,
        appointment.patientName,
        appointment.date,
        appointment.time,
        appointment.appointmentMode,
        appointment.reminder24hSent ? 'sent' : 'pending',
        appointment.reminder1hSent ? 'sent' : 'pending',
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-reminders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Reminders exported',
      description: 'The current reminder view was downloaded as CSV.',
    });
  };

  const card = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.03 } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Appointment Reminders</h1>
          <p className="text-muted-foreground mt-1">Manage notifications for your upcoming appointments</p>
        </div>
        <Button variant="outline" onClick={handleExportReminders} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-4">
          <div className="text-muted-foreground text-xs font-medium">Total Appointments</div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.total}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-warning/5 rounded-xl border border-warning/30 p-4">
          <div className="text-warning text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Within 24h
          </div>
          <div className="text-2xl font-bold text-warning mt-1">{stats.upcoming24h}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-success/5 rounded-xl border border-success/30 p-4">
          <div className="text-success text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Sent
          </div>
          <div className="text-2xl font-bold text-success mt-1">{stats.remindersSent}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-blue-500/5 rounded-xl border border-blue-500/30 p-4">
          <div className="text-blue-500 text-xs font-medium flex items-center gap-1">
            <Bell className="w-3 h-3" /> Pending
          </div>
          <div className="text-2xl font-bold text-blue-500 mt-1">{stats.pendingReminders}</div>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by appointment, doctor, or patient..."
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={reminderFilter}
          onChange={e => setReminderFilter(e.target.value)}
          className="h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Reminders</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          <Calendar className="w-10 h-10 mb-3" />
          <p className="text-sm">{userAppointments.length === 0 ? 'No upcoming appointments' : 'No appointments match your current search or filter'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((appointment, i) => {
            const now = new Date();
            const timeUntil = getAppointmentTimeUntilLabel(appointment.date, appointment.time, now);
            const canSend24h = isWithinNext24Hours(appointment.date, appointment.time, now) && !appointment.reminder24hSent;
            const canSend1h = isWithinNextHour(appointment.date, appointment.time, now) && !appointment.reminder1hSent;

            return (
              <motion.div
                key={appointment.id}
                {...card(i)}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{appointment.type}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3" /> {appointment.doctorName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                            {timeUntil}
                          </span>
                          {(appointment.reminder24hSent || appointment.reminder1hSent) && (
                            <span className="text-xs font-medium bg-success/10 text-success px-2 py-1 rounded flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Notified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {appointment.time}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-secondary">
                        {appointment.appointmentMode === 'telemedicine' ? '🖥️ Telemedicine' : '🏥 In-Person'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${appointment.reminder24hSent ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground'}`}>
                          <Bell className="w-3 h-3" />
                          24h Reminder
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${appointment.reminder1hSent ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground'}`}>
                          <Bell className="w-3 h-3" />
                          1h Reminder
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        {canSend24h && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSend24hReminder(appointment)}
                            className="gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send 24h
                          </Button>
                        )}
                        {canSend1h && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSend1hReminder(appointment)}
                            className="gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send 1h
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {stats.pendingReminders > 0 && stats.upcoming24h > 0 && (
        <div className="border-t border-border pt-6">
          <div className="bg-blue-500/5 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-500">Auto-send Available</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.pendingReminders} appointments within 24 hours are ready to receive reminders. You can manually send them above or enable auto-send in your notification settings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentRemindersPage;
