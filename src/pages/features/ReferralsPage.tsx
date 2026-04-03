import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, Inbox, Plus, Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { Button } from '@/components/ui/button';
import { Referral } from '@/data/mockData';
import { getDoctorPatients } from '@/lib/patientDirectory';
import { canAcceptReferral, canCancelReferral, canCompleteReferral, getReferralDepartmentId, getReferralDepartments, getVisibleReferrals } from '@/lib/referralUtils';
import { normalizeUserRole } from '@/lib/roleUtils';

const ReferralsPage = () => {
  const { user, getUsers } = useAuth();
  const { referrals, appointments, addReferral, updateReferral } = useAppData();
  const { addNotification } = useNotifications();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ patientId: '', toDepartment: '', reason: '', notes: '' });

  const userReferrals = useMemo(() => getVisibleReferrals(referrals, user), [referrals, user]);
  const effectiveRole = normalizeUserRole(user?.role) ?? user?.role;
  const patientOptions = useMemo(
    () => getDoctorPatients(getUsers(), appointments, effectiveRole === 'doctor' ? user?.id : undefined),
    [appointments, getUsers, user, effectiveRole],
  );
  const departmentOptions = useMemo(() => getReferralDepartments(referrals), [referrals]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return userReferrals;
    return userReferrals.filter(r => r.status === statusFilter);
  }, [userReferrals, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: userReferrals.length,
      pending: userReferrals.filter(r => r.status === 'pending').length,
      accepted: userReferrals.filter(r => r.status === 'accepted').length,
      completed: userReferrals.filter(r => r.status === 'completed').length,
    };
  }, [userReferrals]);

  const handleAccept = (id: string) => {
    const referral = referrals.find(r => r.id === id);
    updateReferral(id, prev => ({
      ...prev,
      status: 'accepted',
      lastUpdated: new Date().toLocaleDateString('en-CA'),
    }));
    if (referral) {
      addNotification({
        title: 'Referral Accepted',
        message: `${referral.toDepartment} has accepted the referral for ${referral.patientName}`,
        type: 'system',
        priority: 'medium',
        audience: 'role',
        targetRoles: ['doctor'],
        actionUrl: '/dashboard/referrals',
        actionLabel: 'View referral',
      });
    }
  };

  const handleComplete = (id: string) => {
    const referral = referrals.find(r => r.id === id);
    updateReferral(id, prev => ({
      ...prev,
      status: 'completed',
      lastUpdated: new Date().toLocaleDateString('en-CA'),
    }));
    if (referral) {
      addNotification({
        title: 'Referral Completed',
        message: `${referral.toDepartment} has completed the referral for ${referral.patientName}`,
        type: 'system',
        priority: 'medium',
        audience: 'role',
        targetRoles: ['doctor'],
        actionUrl: '/dashboard/referrals',
        actionLabel: 'View referral',
      });
    }
  };

  const handleCancel = (id: string) => {
    const referral = referrals.find(r => r.id === id);
    updateReferral(id, prev => ({
      ...prev,
      status: 'cancelled',
      lastUpdated: new Date().toLocaleDateString('en-CA'),
    }));
    if (referral) {
      addNotification({
        title: 'Referral Cancelled',
        message: `The referral for ${referral.patientName} to ${referral.toDepartment} has been cancelled.`,
        type: 'system',
        priority: 'medium',
        audience: 'role',
        targetRoles: ['hospital'],
        actionUrl: '/dashboard/referrals',
        actionLabel: 'View referrals',
      });
    }
  };

  const handleCreateReferral = () => {
    if (effectiveRole !== 'doctor' || !formData.patientId || !formData.toDepartment || !formData.reason.trim()) return;

    const patient = patientOptions.find((option) => option.id === formData.patientId);
    if (!patient) return;

    const today = new Date().toLocaleDateString('en-CA');
    addReferral({
      id: `ref-${crypto.randomUUID()}`,
      patientId: patient.id,
      patientName: patient.name,
      fromDoctorId: user.id,
      fromDoctorName: user.name,
      toDepartmentId: getReferralDepartmentId(formData.toDepartment),
      toDepartment: formData.toDepartment,
      reason: formData.reason.trim(),
      date: today,
      status: 'pending',
      lastUpdated: today,
      notes: formData.notes.trim() || undefined,
    });
    addNotification({
      title: 'New referral submitted',
      message: `${patient.name} was referred to ${formData.toDepartment}.`,
      type: 'system',
      priority: 'medium',
      audience: 'role',
      targetRoles: ['hospital'],
      actionUrl: '/dashboard/referrals',
      actionLabel: 'Review referrals',
    });
    setFormData({ patientId: '', toDepartment: '', reason: '', notes: '' });
    setShowForm(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Referrals</h1>
          <p className="text-muted-foreground mt-1">
        {effectiveRole === 'doctor' ? 'Manage referrals sent to specialists' : 'Review and manage incoming referrals'}
          </p>
        </div>
        {effectiveRole === 'doctor' && (
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            New Referral
          </Button>
        )}
      </div>

      {showForm && effectiveRole === 'doctor' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Create Referral</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
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
              <label className="block text-sm font-medium text-foreground mb-1">Department</label>
              <select
                value={formData.toDepartment}
                onChange={(event) => setFormData((current) => ({ ...current, toDepartment: event.target.value }))}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select department</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
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
            <Button onClick={handleCreateReferral} disabled={!formData.patientId || !formData.toDepartment || !formData.reason.trim()}>
              Submit Referral
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

      <div className="flex gap-2">
        {['all', 'pending', 'accepted', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
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
                      <h3 className="font-semibold text-foreground">{referral.patientName}</h3>
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
                        Cancel Referral
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
                        Mark Complete
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
