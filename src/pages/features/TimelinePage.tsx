import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, FlaskConical, ScanLine, Pill, Ambulance, Heart, Inbox, Filter, Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';

type EventType = 'appointment' | 'prescription' | 'lab_test' | 'imaging';

const iconMap: Record<EventType, React.ReactNode> = {
  appointment: <Heart className="w-5 h-5" />,
  prescription: <Pill className="w-5 h-5" />,
  lab_test: <FlaskConical className="w-5 h-5" />,
  imaging: <ScanLine className="w-5 h-5" />,
};

const colorMap: Record<EventType, string> = {
  appointment: 'bg-primary/10 text-primary',
  prescription: 'bg-info/10 text-info',
  lab_test: 'bg-success/10 text-success',
  imaging: 'bg-accent/10 text-accent',
};

const TimelinePage = () => {
  const { user } = useAuth();
  const { appointments, prescriptions, labTests, imagingScans } = useAppData();
  const [searchParams] = useSearchParams();
  const [selectedFilter, setSelectedFilter] = useState<EventType | 'all'>('all');
  const isSupportedRole = user?.role === 'patient' || user?.role === 'doctor';
  const focusedPatientId = searchParams.get('patient');

  // Combine all events into timeline
  const timelineEvents = useMemo(() => {
    const events: {
      id: string;
      type: EventType;
      title: string;
      description: string;
      date: string;
      time?: string;
      status: string;
      icon: React.ReactNode;
      color: string;
    }[] = [];

    // Add appointments
    appointments.forEach(apt => {
      const matchesRole = isSupportedRole && (user.role === 'patient' ? apt.patientId === user.id : apt.doctorId === user.id);
      const matchesFocusedPatient = !focusedPatientId || apt.patientId === focusedPatientId;
      if (matchesRole && matchesFocusedPatient) {
        events.push({
          id: apt.id,
          type: 'appointment',
          title: `Appointment with ${user.role === 'patient' ? apt.doctorName : apt.patientName}`,
          description: `${apt.type} - ${apt.appointmentMode === 'telemedicine' ? '📹 Video' : '🏥 In-Person'}`,
          date: apt.date,
          time: apt.time,
          status: apt.status,
          icon: iconMap.appointment,
          color: colorMap.appointment,
        });
      }
    });

    // Add prescriptions
    prescriptions.forEach(rx => {
      const matchesRole = isSupportedRole && (user.role === 'patient' ? rx.patientId === user.id : rx.doctorId === user.id);
      const matchesFocusedPatient = !focusedPatientId || rx.patientId === focusedPatientId;
      if (matchesRole && matchesFocusedPatient) {
        events.push({
          id: rx.id,
          type: 'prescription',
          title: `Prescription: ${rx.medications[0]?.name || 'Medication'}`,
          description: `Status: ${rx.status} | ${rx.medications[0]?.dosage || 'N/A'}`,
          date: rx.date,
          status: rx.status,
          icon: iconMap.prescription,
          color: colorMap.prescription,
        });
      }
    });

    // Add lab tests
    labTests.forEach(test => {
      const matchesRole = isSupportedRole && (user.role === 'patient' ? test.patientId === user.id : test.doctorId === user.id);
      const matchesFocusedPatient = !focusedPatientId || test.patientId === focusedPatientId;
      if (matchesRole && matchesFocusedPatient) {
        events.push({
          id: test.id,
          type: 'lab_test',
          title: `Lab Test: ${test.testName}`,
          description: `Status: ${test.status}${test.results ? ' | Results available' : ''}`,
          date: test.date,
          status: test.status,
          icon: iconMap.lab_test,
          color: colorMap.lab_test,
        });
      }
    });

    // Add imaging scans
    imagingScans.forEach(scan => {
      const matchesRole = isSupportedRole && (user.role === 'patient' ? scan.patientId === user.id : scan.doctorId === user.id);
      const matchesFocusedPatient = !focusedPatientId || scan.patientId === focusedPatientId;
      if (matchesRole && matchesFocusedPatient) {
        events.push({
          id: scan.id,
          type: 'imaging',
          title: `Imaging: ${scan.scanType}${scan.bodyPart ? ` (${scan.bodyPart})` : ''}`,
          description: `Status: ${scan.status}${scan.results ? ' | Results available' : ''}`,
          date: scan.date,
          status: scan.status,
          icon: iconMap.imaging,
          color: colorMap.imaging,
        });
      }
    });

    // Sort by date descending
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, focusedPatientId, imagingScans, isSupportedRole, labTests, prescriptions, user]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'all') return timelineEvents;
    return timelineEvents.filter(e => e.type === selectedFilter);
  }, [timelineEvents, selectedFilter]);

  const card = (i: number) => ({ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.05 } });

  if (!isSupportedRole) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Inbox className="w-10 h-10 mb-3" />
        <p className="text-sm">Timeline is currently available for patients and doctors only</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Medical Timeline</h1>
        <p className="text-muted-foreground mt-1">
          {focusedPatientId && user?.role === 'doctor'
            ? 'Focused history for the selected patient'
            : 'Complete history of all your medical events'}
        </p>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(['all', 'appointment', 'prescription', 'lab_test', 'imaging'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              selectedFilter === filter
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            {filter === 'all' ? 'All Events' : filter === 'appointment' ? 'Appointments' : filter === 'prescription' ? 'Prescriptions' : filter === 'lab_test' ? 'Lab Tests' : 'Imaging'}
          </button>
        ))}
      </motion.div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">No events in this category</p>
          <p className="text-xs mt-1">Medical events will appear here as they occur</p>
        </div>
      ) : (
        <div className="space-y-0">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              {...card(index)}
              className="relative"
            >
              {/* Timeline connector */}
              {index < filteredEvents.length - 1 && (
                <div className="absolute left-[23px] top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-transparent"></div>
              )}

              {/* Event */}
              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className="relative pt-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-background ${event.color}`}>
                    {event.icon}
                  </div>
                </div>

                {/* Event card */}
                <div className="flex-1 pb-6">
                  <div className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${event.color}`}>
                        {event.status === 'scheduled' && '🔵 Scheduled'}
                        {event.status === 'in-progress' && '🟡 In Progress'}
                        {event.status === 'completed' && '✅ Completed'}
                        {event.status === 'active' && '✅ Active'}
                        {event.status === 'dispensed' && '✅ Dispensed'}
                        {event.status === 'requested' && '🔵 Requested'}
                        {event.status === 'cancelled' && '❌ Cancelled'}
                      </span>
                    </div>

                    {/* Date and Time */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {event.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Legend */}
      {filteredEvents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border">
          <p className="text-xs font-medium text-foreground mb-2">Legend</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['appointment', 'prescription', 'lab_test', 'imaging'] as const).map(type => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${colorMap[type]}`}>
                  {iconMap[type]}
                </div>
                <span className="text-xs text-foreground">
                  {type === 'appointment' && 'Appointment'}
                  {type === 'prescription' && 'Prescription'}
                  {type === 'lab_test' && 'Lab Test'}
                  {type === 'imaging' && 'Imaging'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TimelinePage;
