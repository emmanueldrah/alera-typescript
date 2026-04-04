import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, CheckCircle, XCircle, Heart, FlaskConical, 
  ScanLine, Pill, Ambulance, Building2, Inbox, FileCheck, RefreshCcw 
} from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/apiService';
import { handleApiError } from '@/lib/errorHandler';
import { useToast } from '@/hooks/use-toast';
import { normalizeUserRole } from '@/lib/roleUtils';

const roleIcons: Record<string, React.ReactNode> = {
  doctor: <Heart className="w-5 h-5" />,
  hospital: <Building2 className="w-5 h-5" />,
  laboratory: <FlaskConical className="w-5 h-5" />,
  imaging: <ScanLine className="w-5 h-5" />,
  pharmacy: <Pill className="w-5 h-5" />,
  ambulance: <Ambulance className="w-5 h-5" />,
};

const roleLabels: Record<string, string> = {
  doctor: 'Doctor/Provider',
  hospital: 'Hospital',
  laboratory: 'Laboratory',
  imaging: 'Imaging Center',
  pharmacy: 'Pharmacy',
  ambulance: 'Ambulance Service',
};

const VerificationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.listVerifications();
      // Map backend User objects to verification items
      const mapped = data.map(u => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        email: u.email,
        role: normalizeUserRole(u.role) ?? 'doctor',
        status: u.is_verified ? 'approved' : (!u.is_active ? 'rejected' : 'pending'),
        appliedDate: new Date(u.created_at).toLocaleDateString(),
        documents: `License: ${u.license_number || 'N/A'} (${u.license_state || 'Any'})`,
        notes: u.bio,
      }));
      setVerifications(mapped);
    } catch (error) {
      toast({
        title: 'Error',
        description: handleApiError(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return verifications;
    return verifications.filter(v => v.status === statusFilter);
  }, [verifications, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: verifications.length,
      pending: verifications.filter(v => v.status === 'pending').length,
      approved: verifications.filter(v => v.status === 'approved').length,
      rejected: verifications.filter(v => v.status === 'rejected').length,
    };
  }, [verifications]);

  const handleApprove = async (id: number) => {
    try {
      await api.admin.approveProvider(id);
      toast({ title: 'Success', description: 'Provider verified successfully' });
      fetchVerifications();
    } catch (error) {
      toast({ title: 'Approval Failed', description: handleApiError(error), variant: 'destructive' });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.admin.rejectProvider(id);
      toast({ title: 'Provider Rejected', description: 'Account has been flagged/deactivated' });
      fetchVerifications();
    } catch (error) {
      toast({ title: 'Action Failed', description: handleApiError(error), variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'approved':
        return 'bg-success/10 text-success border-success/30';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/30';
    }
  };

  const card = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.03 } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Provider Verifications</h1>
        <p className="text-muted-foreground mt-1">Review and approve provider registrations</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-4">
          <div className="text-muted-foreground text-xs font-medium">Total</div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.total}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-warning/5 rounded-xl border border-warning/30 p-4">
          <div className="text-warning text-xs font-medium flex items-center gap-1">
            <FileCheck className="w-3 h-3" /> Pending
          </div>
          <div className="text-2xl font-bold text-warning mt-1">{stats.pending}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-success/5 rounded-xl border border-success/30 p-4">
          <div className="text-success text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Approved
          </div>
          <div className="text-2xl font-bold text-success mt-1">{stats.approved}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-destructive/5 rounded-xl border border-destructive/30 p-4">
          <div className="text-destructive text-xs font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </div>
          <div className="text-2xl font-bold text-destructive mt-1">{stats.rejected}</div>
        </motion.div>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
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
          <p className="text-sm">No verifications found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((verification, i) => (
            <motion.div
              key={verification.id}
              {...card(i)}
              className={`bg-card rounded-xl border p-4 transition hover:border-primary/30 ${getStatusColor(verification.status).replace('text-', 'border-')}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{verification.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{verification.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getStatusColor(verification.status)}`}>
                      {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground">
                      {roleIcons[verification.role]}
                      {roleLabels[verification.role]}
                    </span>
                    <span className="text-xs text-muted-foreground">Applied: {verification.appliedDate}</span>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-lg text-xs mb-3">
                    <p className="font-medium text-foreground mb-1">Documents:</p>
                    <p className="text-muted-foreground">{verification.documents}</p>
                  </div>

                  {verification.notes && (
                    <div className="bg-blue-500/5 p-3 rounded-lg text-xs mb-3 border border-blue-500/20">
                      <p className="font-medium text-blue-600 mb-1">Verification Notes:</p>
                      <p className="text-muted-foreground">{verification.notes}</p>
                    </div>
                  )}

                  {verification.verificationDate && (
                    <div className="text-xs text-muted-foreground mb-3">
                      Verified by {verification.verifiedBy} on {verification.verificationDate}
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {verification.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(verification.id)}
                          className="gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(verification.id)}
                          className="gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </Button>
                      </>
                    )}
                    {verification.status === 'approved' && (
                      <span className="text-xs font-medium text-success flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                    {verification.status === 'rejected' && (
                      <span className="text-xs font-medium text-destructive flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Rejected
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

export default VerificationsPage;
