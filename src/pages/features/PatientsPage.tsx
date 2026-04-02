import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Calendar, Phone, MapPin, Inbox, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { getAccessiblePatients } from '@/lib/patientDirectory';

const PatientsPage = () => {
  const { user, getUsers } = useAuth();
  const { appointments, prescriptions, labTests } = useAppData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Get unique patients for this doctor
  const patientsList = useMemo(
    () => getAccessiblePatients(getUsers(), appointments, prescriptions, labTests, user),
    [appointments, getUsers, labTests, prescriptions, user],
  );

  // Filter by search
  const filtered = useMemo(() => {
    return patientsList.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [patientsList, search]);

  const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } });
  const canMessagePatient = user?.role === 'doctor';
  const canViewHistory = user?.role === 'doctor';

  if (user?.role !== 'doctor' && user?.role !== 'admin' && user?.role !== 'hospital') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Patients</h1>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Users className="w-10 h-10 mb-3" />
          <p className="text-sm">You don't have access to patient management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{user?.role === 'doctor' ? 'My Patients' : 'Patients'}</h1>
        <p className="text-muted-foreground mt-1">View and manage patient relationships</p>
      </div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patients by name..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </motion.div>

      {/* Patients List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">{patientsList.length === 0 ? 'No patients yet' : 'No patients match your search'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((patient, index) => {
            return (
              <motion.div
                key={patient.id}
                {...card(index)}
                className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-foreground">{patient.name}</h3>
                        {patient.hasActive && <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">Active</span>}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {patient.appointmentCount} appointments
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {patient.prescriptionCount} prescriptions
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {patient.labTestCount} lab tests
                        </div>
                      </div>

                      {patient.lastVisit && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {canMessagePatient && (
                      <button
                        onClick={() => navigate(`/dashboard/messages?thread=${patient.id}`)}
                        className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition"
                      >
                        Message
                      </button>
                    )}
                    {canViewHistory && (
                      <button
                        onClick={() => navigate(`/dashboard/timeline?patient=${patient.id}`)}
                        className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition"
                      >
                        History
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
