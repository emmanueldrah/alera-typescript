import { motion } from 'framer-motion';
import { Users, FileText, Heart, Calendar, ArrowRight, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { getVisibleReferrals } from '@/lib/referralUtils';
import { normalizeUserRole } from '@/lib/roleUtils';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const HospitalDashboard = () => {
  const { user, getUsers } = useAuth();
  const { ambulanceRequests = [], referrals = [] } = useAppData();
  const verifiedDoctors = getUsers().filter(
    (account) =>
      normalizeUserRole(account.role) === 'doctor' &&
      account.isVerified !== false &&
      account.isActive !== false,
  );
  const hospitalReferrals = getVisibleReferrals(referrals, user);
  const totalPatients = new Set(hospitalReferrals.map((referral) => referral.patientId).filter(Boolean)).size;
  const todaysDate = new Date().toISOString().split('T')[0];
  const todaysAdmissions = hospitalReferrals.filter(
    (referral) =>
      referral.status !== 'cancelled' &&
      referral.date === todaysDate,
  ).length;
  const pendingReferrals = hospitalReferrals.filter((referral) => referral.status === 'pending');
  const activeEmergencyRequests = ambulanceRequests.filter(
    (request) => request.status !== 'completed' && request.status !== 'cancelled',
  );
  const recentAdmissions = [...hospitalReferrals]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Hospital Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Users className="w-5 h-5" />, label: 'Referred Patients', value: totalPatients, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: <Heart className="w-5 h-5" />, label: 'Verified Doctors', value: verifiedDoctors.length, color: 'text-info', bg: 'bg-info/10' },
          { icon: <Calendar className="w-5 h-5" />, label: "Today's Admissions", value: todaysAdmissions, color: 'text-success', bg: 'bg-success/10' },
          { icon: <FileText className="w-5 h-5" />, label: 'Pending Referrals', value: pendingReferrals.length, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((s, i) => (
          <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-display font-bold text-card-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Recent Admissions</h2>
            <Link to="/dashboard/referrals" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recentAdmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No hospital admissions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAdmissions.map((referral) => (
                <div key={referral.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <div className="text-sm font-medium text-card-foreground">{referral.patientName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{referral.toDepartment} • {referral.date}</div>
                  <div className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">{referral.status}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...card(5)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Emergency Coordination</h2>
            <Link to="/dashboard/requests" className="text-sm text-primary hover:underline flex items-center gap-1">Open queue <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {activeEmergencyRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No active emergency requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeEmergencyRequests.slice(0, 3).map((request) => {
                return (
                  <div key={request.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                    <div className="text-sm font-medium text-card-foreground">{request.patientName}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{request.location} • {request.priority} priority</div>
                    <div
                      className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        request.status === 'completed'
                          ? 'bg-success/15 text-success'
                          : request.status === 'cancelled'
                            ? 'bg-destructive/15 text-destructive'
                            : 'bg-warning/15 text-warning'
                      }`}
                    >
                      {request.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
