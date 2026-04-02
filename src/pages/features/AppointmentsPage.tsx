import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, X, Clock, Inbox, Star, MapPin, AlertCircle, Check, XCircle, Edit2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { type Appointment, type Doctor } from '@/data/mockData';
import { getBookableDoctors } from '@/lib/providerDirectory';
import { getAvailableAppointmentSlots, getVisibleAppointments } from '@/lib/appointmentUtils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const AppointmentsPage = () => {
  const { user, getUsers } = useAuth();
  const { appointments, addAppointment, cancelAppointment, confirmAppointment, rescheduleAppointment } = useAppData();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({ doctorId: '', date: '', time: '', type: '', appointmentMode: 'telemedicine' as const });
  const [cancelDialogOpen, setCancelDialogOpen] = useState<string | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState<string | null>(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [cancellationReason, setCancellationReason] = useState('');
  const focusId = searchParams.get('focus');
  const selectedDoctorId = searchParams.get('doctor');
  const visibleAppointments = useMemo(() => getVisibleAppointments(appointments, user), [appointments, user]);
  const filtered = useMemo(
    () => (filter === 'all' ? visibleAppointments : visibleAppointments.filter((appointment) => appointment.status === filter)),
    [filter, visibleAppointments],
  );
  const availableDoctors = useMemo(() => getBookableDoctors(getUsers()), [getUsers]);
  const users = useMemo(() => getUsers(), [getUsers]);

  useEffect(() => {
    if (!selectedDoctorId || selectedDoctor) return;
    const doctor = availableDoctors.find((candidate) => candidate.id === selectedDoctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setFormData((current) => ({ ...current, doctorId: doctor.id }));
      setShowForm(true);
    }
  }, [availableDoctors, selectedDoctor, selectedDoctorId]);

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData((current) => ({ ...current, doctorId: doctor.id }));
  };

  const handleBook = () => {
    if (!selectedDoctor || !formData.date || !formData.time || !formData.type || user?.role !== 'patient') return;
    const doctorEmail = users.find((account) => account.id === selectedDoctor.id)?.email;

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientName: user?.name || 'Patient',
      patientId: user?.id || '',
      doctorName: selectedDoctor.name,
      doctorId: selectedDoctor.id,
      date: formData.date,
      time: formData.time,
      status: 'scheduled',
      type: formData.type,
      appointmentMode: formData.appointmentMode,
    };

    addAppointment(newAppointment);
    addNotification({
      title: 'Appointment Booked',
      message: `Your ${formData.type} appointment with ${selectedDoctor.name} is confirmed for ${formData.date} at ${formData.time} via ${formData.appointmentMode}.`,
      type: 'appointment',
      priority: 'medium',
      audience: 'personal',
      actionUrl: `/dashboard/appointments?focus=${newAppointment.id}`,
      actionLabel: 'Open appointment',
      targetEmails: [user?.email, doctorEmail].filter((value): value is string => Boolean(value)),
      excludeEmails: user?.email ? [user.email] : [],
      actionUrlByRole: {
        patient: `/dashboard/appointments?focus=${newAppointment.id}`,
        doctor: `/dashboard/appointments?focus=${newAppointment.id}`,
      },
    });
    setShowForm(false);
    setSelectedDoctor(null);
    setFormData({ doctorId: '', date: '', time: '', type: '', appointmentMode: 'telemedicine' });
  };

  const availableSlots = selectedDoctor && formData.date
    ? getAvailableAppointmentSlots(selectedDoctor, formData.date, appointments)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Book and manage your medical consultations</p>
        </div>
        {user?.role === 'patient' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        )}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Book New Appointment</h2>
            <button onClick={() => { setShowForm(false); setSelectedDoctor(null); }} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>

          {!selectedDoctor ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">Select a doctor to view their availability</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {availableDoctors.map((doctor) => (
                  <motion.button
                    key={doctor.id}
                    onClick={() => handleSelectDoctor(doctor)}
                    className="relative p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left"
                    whileHover={{ scale: 1.02 }}
                  >
                    {doctor.status === 'available' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-success"></span>}
                    <div className="font-semibold text-card-foreground">{doctor.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{doctor.specialty}</div>
                    <div className="text-xs text-muted-foreground">{doctor.experience} years experience</div>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <span className="text-xs font-medium text-accent">{doctor.rating}</span>
                      <span className="text-xs text-muted-foreground">({doctor.reviewCount})</span>
                    </div>
                    <div className="text-sm font-semibold text-primary mt-2">${doctor.consultationFee}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-card-foreground">{selectedDoctor.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedDoctor.specialty}</div>
                    <div className="text-sm text-muted-foreground mt-1">Consultation fee: ${selectedDoctor.consultationFee}</div>
                  </div>
                  <button onClick={() => setSelectedDoctor(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1.5 block">Appointment Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select type</option>
                    <option value="Initial Consultation">Initial Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Check-up">Check-up</option>
                    <option value="Specialist Consultation">Specialist Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1.5 block">Consultation Mode</label>
                  <select
                    value={formData.appointmentMode}
                    onChange={(e) => setFormData({ ...formData, appointmentMode: e.target.value as 'telemedicine' | 'in-person' })}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="telemedicine">Video Consultation</option>
                    <option value="in-person">In-Person Visit</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1.5 block">Time Slot</label>
                  {formData.date && availableSlots.length > 0 ? (
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Select time</option>
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  ) : formData.date ? (
                    <div className="w-full h-11 px-4 rounded-xl border border-input bg-background text-muted-foreground flex items-center">
                      No available slots on this day
                    </div>
                  ) : (
                    <div className="w-full h-11 px-4 rounded-xl border border-input bg-background text-muted-foreground flex items-center">
                      Select a date first
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={!formData.type || !formData.date || !formData.time}
                className="w-full mt-4 px-6 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Booking
              </button>
            </div>
          )}
        </motion.div>
      )}

      <div className="flex gap-2 flex-wrap">
        {['all', 'scheduled', 'in-progress', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">No appointments yet</p>
          <p className="text-xs mt-1">Book your first appointment to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-card rounded-2xl border p-5 ${focusId === appointment.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {appointment.appointmentMode === 'telemedicine' ? (
                      <Calendar className="w-6 h-6" />
                    ) : (
                      <MapPin className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-medium text-card-foreground">{appointment.type}</div>
                    <div className="text-sm text-muted-foreground">{user?.role === 'doctor' ? appointment.patientName : appointment.doctorName}</div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {appointment.date} at {appointment.time}
                      </div>
                      <span className="px-2 py-1 rounded-md bg-secondary/50">{appointment.appointmentMode === 'telemedicine' ? '📹 Video Call' : '🏥 In-Person'}</span>
                    </div>
                    {appointment.cancellationReason && (
                      <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-destructive/10">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <div className="text-xs text-destructive">{appointment.cancellationReason}</div>
                      </div>
                    )}
                    {appointment.doctorConfirmed && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-success">
                        <Check className="w-3 h-3" /> Confirmed by {appointment.doctorName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                      appointment.status === 'scheduled'
                        ? 'bg-primary/10 text-primary'
                        : appointment.status === 'confirmed-by-doctor'
                          ? 'bg-success/10 text-success'
                          : appointment.status === 'in-progress'
                            ? 'bg-info/10 text-info'
                            : appointment.status === 'completed'
                              ? 'bg-success/10 text-success'
                              : appointment.status === 'cancelled'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {appointment.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {user?.role === 'doctor' && appointment.status === 'scheduled' && (
                    <Button
                      onClick={() => confirmAppointment(appointment.id)}
                      className="h-8 text-xs gap-1"
                      variant="default"
                      size="sm"
                    >
                      <Check className="w-3 h-3" /> Confirm
                    </Button>
                  )}
                  {user?.role === 'patient' && (
                    <Dialog open={rescheduleDialogOpen === appointment.id} onOpenChange={(open) => setRescheduleDialogOpen(open ? appointment.id : null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Reschedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reschedule Appointment</DialogTitle>
                          <DialogDescription>Choose a new date and time for your appointment</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <label className="text-sm font-medium">New Date</label>
                            <input
                              type="date"
                              value={rescheduleData.date}
                              onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full h-9 px-3 rounded-md border border-input mt-2"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">New Time</label>
                            <input
                              type="time"
                              value={rescheduleData.time}
                              onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                              className="w-full h-9 px-3 rounded-md border border-input mt-2"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setRescheduleDialogOpen(null)}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (rescheduleData.date && rescheduleData.time) {
                                rescheduleAppointment(appointment.id, rescheduleData.date, rescheduleData.time);
                                addNotification({
                                  title: 'Appointment Rescheduled',
                                  message: `Your appointment has been rescheduled to ${rescheduleData.date} at ${rescheduleData.time}`,
                                  type: 'appointment',
                                  priority: 'medium',
                                  audience: 'personal',
                                });
                                setRescheduleDialogOpen(null);
                                setRescheduleData({ date: '', time: '' });
                              }
                            }}
                          >
                            Confirm
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Dialog open={cancelDialogOpen === appointment.id} onOpenChange={(open) => setCancelDialogOpen(open ? appointment.id : null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1 text-destructive hover:text-destructive"
                      >
                        <XCircle className="w-3 h-3" /> Cancel
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>Please provide a reason for cancellation</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Textarea
                          placeholder="Enter your reason for cancellation..."
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          className="min-h-24"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => { setCancelDialogOpen(null); setCancellationReason(''); }}>
                          Keep Appointment
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            cancelAppointment(appointment.id, cancellationReason || 'No reason provided', user?.role === 'patient' ? 'patient' : 'doctor');
                            addNotification({
                              title: 'Appointment Cancelled',
                              message: `Your appointment on ${appointment.date} has been cancelled.`,
                              type: 'appointment',
                              priority: 'medium',
                              audience: 'personal',
                            });
                            setCancelDialogOpen(null);
                            setCancellationReason('');
                          }}
                        >
                          Cancel Appointment
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
