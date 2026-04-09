import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, Inbox, Plus, Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import type { UserRole } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { Button } from '@/components/ui/button';
import type { ReferralType } from '@/data/mockData';
import { getDoctorPatients } from '@/lib/patientDirectory';
import {
  REFERRAL_DESTINATION_ERROR,
  canAcceptReferral,
  canCancelReferral,
  canCompleteReferral,
  getReferralDestinationProviders,
  getReferralDepartmentId,
  getVisibleReferrals,
  isReferralDestinationValid,
  referralKindLabel,
  type ReferralKind,
} from '@/lib/referralUtils';
import { normalizeUserRole } from '@/lib/roleUtils';

export interface ReferralsPageProps {
  /** Which referral queue this dashboard page represents (routes lab / imaging / hospital / pharmacy separately). */
  referralKind?: ReferralKind;
}

const coordinatorRolesForType = (t: ReferralType): UserRole[] => {
  if (t === 'laboratory') return ['laboratory'];
  if (t === 'imaging') return ['imaging'];
  if (t === 'pharmacy') return ['pharmacy'];
  return ['hospital'];
};

const dashboardPathForReferralType = (t: ReferralType): string => {
  if (t === 'laboratory') return '/dashboard/lab-referrals';
  if (t === 'imaging') return '/dashboard/imaging-referrals';
  if (t === 'pharmacy') return '/dashboard/pharmacy-referrals';
  return '/dashboard/referrals';
};

const ReferralsPage = ({ referralKind = 'hospital' }: ReferralsPageProps) => {
  const { user, getUsers } = useAuth();
  const { referrals, appointments, addReferral, updateReferral } = useAppData();
  const { addNotification } = useNotifications();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ patientId: '', destinationProviderId: '', toDepartment: '', reason: '', notes: '' });

  const effectiveRole = normalizeUserRole(user?.role) ?? user?.role;
  const users = getUsers();
  const usersById = useMemo(() => new Map(users.map((account) => [account.id, account])), [users]);

  const userReferrals = useMemo(() => {
    const kindFilter = effectiveRole === 'doctor' ? referralKind : undefined;
    return getVisibleReferrals(referrals, user, kindFilter ? { kind: kindFilter } : undefined);
  }, [referrals, user, effectiveRole, referralKind]);

  const patientOptions = useMemo(
    () => getDoctorPatients(users, appointments, effectiveRole === 'doctor' ? user?.id : undefined),
    [appointments, users, user, effectiveRole],
  );

  const destinationOptions = useMemo(
    () => getReferralDestinationProviders(users, referralKind),
    [users, referralKind],
  );

  const pageHeading = useMemo(() => {
    switch (referralKind) {
      case 'laboratory':
        return { title: 'Laboratory referrals', subtitleDoctor: 'Send patients to a specific laboratory', subtitleOther: 'Laboratory referrals assigned to this facility' };
      case 'imaging':
        return { title: 'Imaging referrals', subtitleDoctor: 'Send patients to a specific imaging center', subtitleOther: 'Imaging referrals assigned to this facility' };
      case 'pharmacy':
        return { title: 'Pharmacy referrals', subtitleDoctor: 'Refer patients to a specific pharmacy', subtitleOther: 'Pharmacy referrals assigned to this facility' };
      default:
        return {
          title: 'Hospital referrals',
          subtitleDoctor: 'Refer patients to a specific hospital',
          subtitleOther: 'Hospital referrals assigned to this facility',
        };
    }
  }, [referralKind]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return userReferrals;
    return userReferrals.filter((r) => r.status === statusFilter);
  }, [userReferrals, statusFilter]);

  const stats = useMemo(
    () => ({
      total: userReferrals.length,
      pending: userReferrals.filter((r) => r.status === 'pending').length,
      accepted: userReferrals.filter((r) => r.status === 'accepted').length,
      completed: userReferrals.filter((r) => r.status === 'completed').length,
    }),
    [userReferrals],
  );

  const handleAccept = (id: string) => {
    const referral = referrals.find((r) => r.id === id);
    updateReferral(id, (prev) => ({
      ...prev,
      status: 'accepted',
      lastUpdated: new Date().toLocaleDateString('en-CA'),
    }));
    if (referral) {
      const doctorEmail = usersById.get(referral.fromDoctorId)?.email;
      addNotification({
        title: 'Referral accepted',
        message: `${referralKindLabel(referral.referralType)}: ${referral.toDepartment} accepted the referral for ${referral.patientName}.`,
        type: 'system',
        priority: 'medium',
        audience: 'personal',
        targetEmails: doctorEmail ? [doctorEmail] : undefined,
        targetRoles: doctorEmail ? undefined : ['doctor'],
        actionUrl: dashboardPathForReferralType(referral.referralType),
        actionLabel: 'View referral',
      });
    }
  };

  const handleComplete = (id: string) => {
    const referral = referrals.find((r) => r.id === id);
    updateReferral(id, (prev) => ({
      ...prev,
      status: 'completed',
      lastUpdated: new Date().toLocaleDateString('en-CA'),
    }));
    if (referral) {
      const doctorEmail = usersById.get(referral.fromDoctorId)?.email;
      addNotification({
        title: 'Referral completed',
        message: `${referralKindLabel(referral.referralType)}: ${referral.toDepartment} completed the referral for ${referral.patientName}.`,
        type: 'system',
        priority: 'medium',
        audience: 'personal',
        targetEmails: doctorEmail ? [doctorEmail] : undefined,
        targetRoles: doctorEmail ? undefined : ['doctor'],
        actionUrl: dashboardPathForReferralType(referral.referralType),
        actionLabel: 'View referral',
      });
    }
  };

  const handleCancel = (id: string) => {
    const referral = referrals.find((r) => r.id === id);
    updateReferral(id, (prev) => ({
      ...prev,
      status: 'cancelled',
      lastUpdated: new Date().toLocaleDateString('en-CA'),
    }));
    if (referral) {
      const destinationEmail = referral.destinationProviderId ? usersById.get(referral.destinationProviderId)?.email : undefined;
      addNotification({
        title: 'Referral cancelled',
        message: `A ${referralKindLabel(referral.referralType).toLowerCase()} referral for ${referral.patientName} was cancelled.`,
        type: 'system',
        priority: 'medium',
        audience: 'personal',
        targetEmails: destinationEmail ? [destinationEmail] : undefined,
        targetRoles: destinationEmail ? undefined : coordinatorRolesForType(referral.referralType),
        actionUrl: dashboardPathForReferralType(referral.referralType),
        actionLabel: 'View referrals',
      });
    }
  };

  const handleCreateReferral = async () => {
    if (effectiveRole !== 'doctor' || !formData.patientId || !formData.destinationProviderId || !formData.toDepartment || !formData.reason.trim()) return;

    if (!isReferralDestinationValid(referralKind, formData.toDepartment)) {
      setFormError(REFERRAL_DESTINATION_ERROR);
      return;
    }

    const patient = patientOptions.find((option) => option.id === formData.patientId);
    const destinationProvider = destinationOptions.find((option) => option.id === formData.destinationProviderId);
    if (!patient || !destinationProvider) return;

    const today = new Date().toLocaleDateString('en-CA');
    try {
      await addReferral({
        id: `ref-${crypto.randomUUID()}`,
        referralType: referralKind,
        patientId: patient.id,
        patientName: patient.name,
        fromDoctorId: user.id,
        fromDoctorName: user.name,
        destinationProviderId: destinationProvider.id,
        destinationProviderName: destinationProvider.name,
        destinationProviderRole: destinationProvider.role === 'pharmacy' ? 'pharmacy' : referralKind,
        toDepartmentId: destinationProvider.id || getReferralDepartmentId(destinationProvider.name),
        toDepartment: destinationProvider.name,
        reason: formData.reason.trim(),
        date: today,
        status: 'pending',
        lastUpdated: today,
        notes: formData.notes.trim() || undefined,
      });

      const path = dashboardPathForReferralType(referralKind);
      addNotification({
        title: 'New referral submitted',
        message: `${patient.name} — ${referralKindLabel(referralKind)} to ${destinationProvider.name}.`,
        type: 'system',
        priority: 'medium',
        audience: 'personal',
        targetEmails: destinationProvider.email ? [destinationProvider.email] : undefined,
        targetRoles: destinationProvider.email ? undefined : coordinatorRolesForType(referralKind),
        actionUrl: path,
        actionLabel: 'Review referrals',
      });
      setFormError(null);
      setFormData({ patientId: '', destinationProviderId: '', toDepartment: '', reason: '', notes: '' });
      setShowForm(false);
    } catch (error) {
      setFormError('Unable to submit referral. Please try again.');
      console.error('handleCreateReferral failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'accepted':
        return 'bg-info/10 text-info border-info/30';
      case 'completed':
        return 'bg-success/10 text-success border-success/30';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/30';
    }
  };

  const card = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.03 } });

  const showTypeBadge = effectiveRole === 'hospital';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{pageHeading.title}</h1>
          <p className="text-muted-foreground mt-1">
            {effectiveRole === 'doctor' ? pageHeading.subtitleDoctor : pageHeading.subtitleOther}
          </p>
        </div>
        {effectiveRole === 'doctor' && (
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            New referral
          </Button>
        )}
      </div>

      {showForm && effectiveRole === 'doctor' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-card-foreground">
              Create {referralKindLabel(referralKind)} referral
            </h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Patient</label>
              <select
                value={formData.patientId}
                onChange={(event) => setFormData((current) => ({ ...current, patientId: event.target.value }))}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select patient</option>
                {patientOptions.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {referralKind === 'hospital' ? 'Hospital' : `${referralKindLabel(referralKind)} destination`}
              </label>
              <select
                value={formData.destinationProviderId}
                onChange={(event) => {
                  setFormError(null);
                  const selected = destinationOptions.find((option) => option.id === event.target.value);
                  setFormData((current) => ({
                    ...current,
                    destinationProviderId: event.target.value,
                    toDepartment: selected?.name || '',
                  }));
                }}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select destination</option>
                {destinationOptions.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}{provider.profile?.city ? ` - ${provider.profile.city}` : ''}
                  </option>
                ))}
              </select>
              {formError ? <p className="mt-2 text-sm text-destructive">{formError}</p> : null}
              {destinationOptions.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No verified {referralKind === 'hospital' ? 'hospitals' : `${referralKind} providers`} available yet.
                </p>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(event) => setFormData((current) => ({ ...current, reason: event.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreateReferral} disabled={!formData.patientId || !formData.destinationProviderId || !formData.reason.trim()}>
              Submit referral
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-4">
          <div className="text-muted-foreground text-xs font-medium">Total</div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.total}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-warning/5 rounded-xl border border-warning/30 p-4">
          <div className="text-warning text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </div>
          <div className="text-2xl font-bold text-warning mt-1">{stats.pending}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-info/5 rounded-xl border border-info/30 p-4">
          <div className="text-info text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Accepted
          </div>
          <div className="text-2xl font-bold text-info mt-1">{stats.accepted}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-success/5 rounded-xl border border-success/30 p-4">
          <div className="text-success text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Completed
          </div>
          <div className="text-2xl font-bold text-success mt-1">{stats.completed}</div>
        </motion.div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'accepted', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              statusFilter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">{userReferrals.length === 0 ? 'No referrals' : 'No referrals match your filter'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((referral, i) => (
            <motion.div
              key={referral.id}
              {...card(i)}
              className={`bg-card rounded-xl border p-4 transition hover:border-primary/30 ${getStatusColor(referral.status).replace('text-', 'border-')}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{referral.patientName}</h3>
                        {showTypeBadge && (
                          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                            {referralKindLabel(referral.referralType)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        From: {referral.fromDoctorName} • To: {referral.toDepartment}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getStatusColor(referral.status)}`}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {referral.reason}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span>Date: {referral.date}</span>
                    <span>Updated: {referral.lastUpdated}</span>
                  </div>

                  {referral.notes && (
                    <div className="bg-muted/30 p-2 rounded-lg text-xs mb-3">
                      <p className="font-medium text-foreground mb-1">Notes:</p>
                      <p className="text-muted-foreground">{referral.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {canAcceptReferral(referral, user?.role) && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAccept(referral.id)}
                        className="gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Accept
                      </Button>
                    )}
                    {canCancelReferral(referral, user?.role) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(referral.id)}
                        className="gap-1"
                      >
                        Cancel referral
                      </Button>
                    )}
                    {canCompleteReferral(referral, user?.role) && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleComplete(referral.id)}
                        className="gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Mark complete
                      </Button>
                    )}
                    {referral.status === 'completed' && (
                      <span className="text-xs font-medium text-success flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Completed on {referral.lastUpdated}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferralsPage;
