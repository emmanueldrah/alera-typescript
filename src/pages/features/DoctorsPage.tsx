import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Star, Clock, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { getBookableDoctors } from '@/lib/providerDirectory';

const DoctorsPage = () => {
  const { getUsers, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const doctors = useMemo(() => getBookableDoctors(getUsers()), [getUsers]);

  // Get unique specialties
  const specialties = useMemo(() => ['all', ...new Set(doctors.map(d => d.specialty))], [doctors]);

  // Filter doctors
  const filtered = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(search.toLowerCase()) || 
                           doctor.specialty.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, selectedSpecialty]);

  const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Medical Directory</h1>
        <p className="text-muted-foreground mt-1">Find and book consultations with doctors</p>
      </div>

      {/* Search and Filters */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctors by name or specialty..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Filter by Specialty</p>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  selectedSpecialty === specialty
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                {specialty === 'all' ? 'All Specialties' : specialty}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Doctors Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">No doctors found matching your search</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              {...card(index)}
              className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-lg transition-all"
            >
              {/* Status Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  doctor.status === 'available' ? 'bg-success/10 text-success' :
                  doctor.status === 'busy' ? 'bg-warning/10 text-warning' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {doctor.status === 'available' ? '🟢 Available' : doctor.status === 'busy' ? '🟡 Busy' : '⚫ Offline'}
                </span>
              </div>

              {/* Doctor Info */}
              <h3 className="text-lg font-semibold text-foreground">{doctor.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{doctor.specialty}</p>

              {/* Qualifications */}
              <div className="mt-3 space-y-1">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Experience:</span> {doctor.experience} years
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Qualifications:</span> {doctor.qualifications.join(', ')}
                </p>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{doctor.rating}</span>
                <span className="text-xs text-muted-foreground">({doctor.reviewCount} reviews)</span>
              </div>

              {/* Consultation Fee */}
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">${doctor.consultationFee}</span>
                  <span className="text-muted-foreground text-xs ml-1">per consultation</span>
                </p>
              </div>

              {/* Availability Preview */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <p className="text-xs font-medium text-foreground">Available Hours</p>
                <div className="space-y-1">
                  {doctor.availableHours.slice(0, 3).map((hours, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{hours.dayOfWeek}: {hours.startTime} - {hours.endTime}</span>
                    </div>
                  ))}
                  {doctor.availableHours.length > 3 && (
                    <p className="text-xs text-muted-foreground italic">+{doctor.availableHours.length - 3} more days</p>
                  )}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => navigate(`/dashboard/appointments?doctor=${doctor.id}`)}
                disabled={user?.role !== 'patient'}
                className="w-full mt-6 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
              >
                {user?.role === 'patient' ? 'Book Appointment' : 'View Doctor'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
