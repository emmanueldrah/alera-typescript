import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Upload, Plus, Search, X, Inbox, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { toast } from '@/components/ui/use-toast';
import { type LabTest } from '@/data/mockData';
import { getDoctorPatients } from '@/lib/patientDirectory';
import { getVisibleLabTests } from '@/lib/recordVisibility';
import { getReferralDestinationProviders } from '@/lib/referralUtils';
import { normalizeUserRole } from '@/lib/roleUtils';
import { api } from '@/lib/apiService';

interface LabResultsPageProps {
  page?: string;
}

const labPageDisplayMap: Record<string, { title: string; subtitle: string }> = {
  'lab-results': {
    title: 'Lab Results',
    subtitle: 'View your test results',
  },
  'lab-referrals': {
    title: 'Lab Referrals',
    subtitle: 'Order lab tests and manage care team requests',
  },
  'test-requests': {
    title: 'Test Requests',
    subtitle: 'Process and upload lab results for ordered tests',
  },
  results: {
    title: 'Results',
    subtitle: 'Review completed lab results and share updates with care team',
  },
};

const LabResultsPage = ({ page }: LabResultsPageProps) => {
  const { user, getUsers } = useAuth();
  const { appointments, labTests, addLabTest, updateLabTest, refreshAppData } = useAppData();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [showUpload, setShowUpload] = useState<string | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [uploadResult, setUploadResult] = useState('');
  const [orderForm, setOrderForm] = useState({ patientId: '', labId: '', testName: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LabTest['status']>('all');
  const focusId = searchParams.get('focus');
  const effectiveRole = normalizeUserRole(user?.role) ?? user?.role;
  const currentPage = page ?? (user?.role === 'laboratory' ? 'test-requests' : effectiveRole === 'doctor' ? 'lab-referrals' : 'lab-results');
  const users = getUsers();
  const patientOptions = useMemo(() => getDoctorPatients(users, appointments, user?.id), [appointments, user?.id, users]);
  const labOptions = useMemo(() => getReferralDestinationProviders(users, 'laboratory'), [users]);
  const visibleLabTests = useMemo(
    () => getVisibleLabTests(labTests, user),
    [labTests, user],
  );
  const filteredLabTests = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return visibleLabTests.filter((test) => {
      const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
      const matchesQuery = !normalizedQuery
        || test.testName.toLowerCase().includes(normalizedQuery)
        || test.patientName.toLowerCase().includes(normalizedQuery)
        || test.doctorName.toLowerCase().includes(normalizedQuery)
        || (test.destinationProviderName || '').toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [searchQuery, statusFilter, visibleLabTests]);

  const handleUpload = (id: string) => {
    if (!uploadResult.trim()) {
      toast({ title: 'Result required', description: 'Enter the lab result details before submitting.', variant: 'destructive' });
      return;
    }
    const target = labTests.find((test) => test.id === id);
    updateLabTest(id, (test) => ({ ...test, status: 'completed' as const, results: uploadResult }));
    if (target) {
      const doctorEmail = users.find((account) => account.id === target.doctorId)?.email;
      const patientEmail = users.find((account) => account.id === target.patientId)?.email;
      addNotification({
        title: 'Lab Result Uploaded',
        message: `${target.testName} for ${target.patientName} was completed and published.`,
        type: 'result',
        priority: 'high',
        audience: 'personal',
        actionUrl: `/dashboard/${currentPage}?focus=${target.id}`,
        actionLabel: 'Open result',
        targetEmails: [doctorEmail, patientEmail].filter((value): value is string => Boolean(value)),
        excludeEmails: user?.email ? [user.email] : [],
        actionUrlByRole: {
          laboratory: `/dashboard/test-requests?focus=${target.id}`,
          doctor: `/dashboard/lab-referrals?focus=${target.id}`,
          patient: `/dashboard/lab-results?focus=${target.id}`,
        },
      });
    }
    setShowUpload(null);
    setUploadResult('');
    toast({ title: 'Result published', description: 'The completed lab result is now available to the care team.' });
  };

  const handleOrder = () => {
    if (!orderForm.patientId || !orderForm.labId || !orderForm.testName) {
      toast({ title: 'Complete the order form', description: 'Choose a patient, a laboratory, and a test before ordering.', variant: 'destructive' });
      return;
    }
    const patient = patientOptions.find((option) => option.id === orderForm.patientId);
    const lab = labOptions.find((option) => option.id === orderForm.labId);
    if (!patient || !lab) {
      toast({ title: 'Order could not be created', description: 'The selected patient or laboratory is unavailable.', variant: 'destructive' });
      return;
    }
    const test: LabTest = {
      id: `lt-${Date.now()}`,
      patientName: patient.name,
      patientId: patient.id,
      doctorName: user?.name || 'Doctor',
      doctorId: user?.id || '',
      labId: lab.id,
      destinationProviderName: lab.name,
      testName: orderForm.testName,
      date: new Date().toISOString().split('T')[0],
      status: 'requested',
    };
    addLabTest(test);
    addNotification({
      title: 'Lab Test Ordered',
      message: `${orderForm.testName} was ordered for ${patient.name} and sent to ${lab.name}.`,
      type: 'result',
      priority: 'medium',
      audience: 'personal',
      actionUrl: `/dashboard/lab-referrals?focus=${test.id}`,
      actionLabel: 'Open order',
      targetEmails: [user?.email, patient.email, lab.email].filter((value): value is string => Boolean(value)),
      excludeEmails: user?.email ? [user.email] : [],
      actionUrlByRole: {
        doctor: `/dashboard/lab-referrals?focus=${test.id}`,
        laboratory: `/dashboard/test-requests?focus=${test.id}`,
      },
    });
    setShowOrder(false);
    setOrderForm({ patientId: '', labId: '', testName: '' });
    toast({ title: 'Lab test ordered', description: `${orderForm.testName} was sent to ${lab.name}.` });
  };

  const handleStatusChange = (id: string, status: LabTest['status']) => {
    updateLabTest(id, (test) => ({ ...test, status }));
    toast({ title: 'Worklist updated', description: `The test status is now ${status.replace('-', ' ')}.` });
    if (showUpload === id && status !== 'completed') {
      setShowUpload(null);
      setUploadResult('');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      await api.labTests.deleteLabTest(id);
      await refreshAppData();
      toast({ title: 'Lab test deleted', description: 'The request was removed from the worklist.' });
    } catch (error) {
      console.error('Failed to delete lab test:', error);
      toast({ title: 'Delete failed', description: 'The lab test could not be removed. Please try again.', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  const pageDisplay = labPageDisplayMap[currentPage] ?? {
    title: user?.role === 'laboratory' ? 'Test Requests' : effectiveRole === 'doctor' ? 'Lab Referrals' : 'Lab Results',
    subtitle: user?.role === 'laboratory' ? 'Process and upload results' : effectiveRole === 'doctor' ? 'Order lab tests' : 'View your test results',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">{pageDisplay.title}</h1><p className="text-muted-foreground mt-1">{pageDisplay.subtitle}</p></div>
        {effectiveRole === 'doctor' && <button onClick={() => setShowOrder(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"><Plus className="w-4 h-4" /> Order Test</button>}
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by patient, doctor, test, or laboratory..."
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | LabTest['status'])}
          className="h-11 rounded-xl border border-input bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All statuses</option>
          <option value="requested">Requested</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {showOrder && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-display font-semibold text-card-foreground">Order Lab Test</h2><button onClick={() => setShowOrder(false)} className="text-muted-foreground"><X className="w-5 h-5" /></button></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-card-foreground mb-1.5 block">Patient</label><select value={orderForm.patientId} onChange={(e) => setOrderForm({ ...orderForm, patientId: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"><option value="">Select patient</option>{patientOptions.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></div>
            <div><label className="text-sm font-medium text-card-foreground mb-1.5 block">Laboratory</label><select value={orderForm.labId} onChange={(e) => setOrderForm({ ...orderForm, labId: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"><option value="">Select laboratory</option>{labOptions.map((lab) => <option key={lab.id} value={lab.id}>{lab.name}</option>)}</select></div>
            <div className="md:col-span-2"><label className="text-sm font-medium text-card-foreground mb-1.5 block">Test</label><select value={orderForm.testName} onChange={(e) => setOrderForm({ ...orderForm, testName: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"><option value="">Select</option><option>CBC</option><option>Lipid Panel</option><option>HbA1c</option><option>Thyroid Panel</option></select></div>
          </div>
          <button onClick={handleOrder} disabled={!orderForm.patientId || !orderForm.labId || !orderForm.testName} className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-50">Order Test</button>
        </motion.div>
      )}
      {filteredLabTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">{visibleLabTests.length === 0 ? 'No lab tests yet' : 'No lab tests match your current filters'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLabTests.map((test, index) => (
            <motion.div key={test.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`bg-card rounded-2xl border p-5 ${focusId === test.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${test.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}><FlaskConical className="w-6 h-6" /></div>
                  <div>
                    <div className="text-base font-medium text-card-foreground">{test.testName}</div>
                    <div className="text-sm text-muted-foreground">{test.patientName} • {test.doctorName}</div>
                    {test.destinationProviderName ? <div className="text-xs text-muted-foreground mt-1">Laboratory: {test.destinationProviderName}</div> : null}
                    <div className="text-xs text-muted-foreground mt-1">{test.date}</div>
                    {test.results && <div className="mt-2 p-3 rounded-lg bg-success/5 border border-success/10 text-sm text-card-foreground"><span className="font-medium text-success">Results: </span>{test.results}</div>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${test.status === 'requested' ? 'bg-warning/10 text-warning' : test.status === 'in-progress' ? 'bg-info/10 text-info' : test.status === 'cancelled' ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success'}`}>{test.status === 'cancelled' ? 'cancelled' : test.status}</span>
                  <div className="flex gap-2">
                    {user?.role === 'laboratory' && test.status === 'requested' && (
                      <button onClick={() => handleStatusChange(test.id, 'in-progress')} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-info/10 text-info text-xs font-medium hover:bg-info/20">
                        Start
                      </button>
                    )}
                    {user?.role === 'laboratory' && test.status !== 'completed' && test.status !== 'cancelled' && <button onClick={() => setShowUpload(test.id)} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"><Upload className="w-3 h-3" /> Upload</button>}
                    {(user?.role === 'laboratory' || effectiveRole === 'doctor') && test.status !== 'completed' && test.status !== 'cancelled' && (
                      <button onClick={() => handleStatusChange(test.id, 'cancelled')} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20">
                        Cancel
                      </button>
                    )}
                    {effectiveRole === 'doctor' && (
                      <button onClick={() => void handleDelete(test.id)} disabled={deleteId === test.id} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 disabled:opacity-50">
                        <Trash2 className="w-3 h-3" /> {deleteId === test.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {showUpload === test.id && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 rounded-xl bg-secondary/50">
                  <textarea value={uploadResult} onChange={(e) => setUploadResult(e.target.value)} rows={3} placeholder="Enter test results..." className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleUpload(test.id)} className="px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium">Submit</button>
                    <button onClick={() => { setShowUpload(null); setUploadResult(''); }} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Cancel</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabResultsPage;
