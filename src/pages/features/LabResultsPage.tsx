import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Upload, Plus, X, Inbox } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { type LabTest } from '@/data/mockData';
import { getDoctorPatients } from '@/lib/patientDirectory';
import { getVisibleLabTests } from '@/lib/recordVisibility';

const LabResultsPage = () => {
  const { user, getUsers } = useAuth();
  const { appointments, labTests, addLabTest, updateLabTest } = useAppData();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [showUpload, setShowUpload] = useState<string | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [uploadResult, setUploadResult] = useState('');
  const [orderForm, setOrderForm] = useState({ patientId: '', testName: '' });
  const focusId = searchParams.get('focus');
  const currentPage = user?.role === 'laboratory' ? 'test-requests' : user?.role === 'doctor' ? 'lab-referrals' : 'lab-results';
  const users = getUsers();
  const patientOptions = useMemo(() => getDoctorPatients(users, appointments, user?.id), [appointments, user?.id, users]);
  const visibleLabTests = useMemo(
    () => getVisibleLabTests(labTests, user),
    [labTests, user],
  );

  const handleUpload = (id: string) => {
    if (!uploadResult.trim()) return;
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
  };

  const handleOrder = () => {
    if (!orderForm.patientId || !orderForm.testName) return;
    const patient = patientOptions.find((option) => option.id === orderForm.patientId);
    if (!patient) return;
    const test: LabTest = {
      id: `lt-${Date.now()}`,
      patientName: patient.name,
      patientId: patient.id,
      doctorName: user?.name || 'Doctor',
      doctorId: user?.id || '',
      testName: orderForm.testName,
      date: new Date().toISOString().split('T')[0],
      status: 'requested',
    };
    addLabTest(test);
    addNotification({
      title: 'Lab Test Ordered',
      message: `${orderForm.testName} was ordered for ${patient.name}.`,
      type: 'result',
      priority: 'medium',
      audience: 'personal',
      actionUrl: `/dashboard/lab-referrals?focus=${test.id}`,
      actionLabel: 'Open order',
      targetEmails: [user?.email, patient.email].filter((value): value is string => Boolean(value)),
      targetRoles: ['laboratory'],
      excludeEmails: user?.email ? [user.email] : [],
      actionUrlByRole: {
        doctor: `/dashboard/lab-referrals?focus=${test.id}`,
        laboratory: `/dashboard/test-requests?focus=${test.id}`,
      },
    });
    setShowOrder(false);
    setOrderForm({ patientId: '', testName: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">{user?.role === 'laboratory' ? 'Test Requests' : user?.role === 'doctor' ? 'Lab Referrals' : 'Lab Results'}</h1><p className="text-muted-foreground mt-1">{user?.role === 'laboratory' ? 'Process and upload results' : user?.role === 'doctor' ? 'Order lab tests' : 'View your test results'}</p></div>
        {user?.role === 'doctor' && <button onClick={() => setShowOrder(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"><Plus className="w-4 h-4" /> Order Test</button>}
      </div>
      {showOrder && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-display font-semibold text-card-foreground">Order Lab Test</h2><button onClick={() => setShowOrder(false)} className="text-muted-foreground"><X className="w-5 h-5" /></button></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-card-foreground mb-1.5 block">Patient</label><select value={orderForm.patientId} onChange={(e) => setOrderForm({ ...orderForm, patientId: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"><option value="">Select patient</option>{patientOptions.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></div>
            <div><label className="text-sm font-medium text-card-foreground mb-1.5 block">Test</label><select value={orderForm.testName} onChange={(e) => setOrderForm({ ...orderForm, testName: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"><option value="">Select</option><option>CBC</option><option>Lipid Panel</option><option>HbA1c</option><option>Thyroid Panel</option></select></div>
          </div>
          <button onClick={handleOrder} disabled={!orderForm.patientId || !orderForm.testName} className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-50">Order Test</button>
        </motion.div>
      )}
      {visibleLabTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">No lab tests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleLabTests.map((test, index) => (
            <motion.div key={test.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`bg-card rounded-2xl border p-5 ${focusId === test.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${test.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}><FlaskConical className="w-6 h-6" /></div>
                  <div>
                    <div className="text-base font-medium text-card-foreground">{test.testName}</div>
                    <div className="text-sm text-muted-foreground">{test.patientName} • {test.doctorName}</div>
                    <div className="text-xs text-muted-foreground mt-1">{test.date}</div>
                    {test.results && <div className="mt-2 p-3 rounded-lg bg-success/5 border border-success/10 text-sm text-card-foreground"><span className="font-medium text-success">Results: </span>{test.results}</div>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${test.status === 'requested' ? 'bg-warning/10 text-warning' : test.status === 'in-progress' ? 'bg-info/10 text-info' : 'bg-success/10 text-success'}`}>{test.status}</span>
                  {user?.role === 'laboratory' && test.status !== 'completed' && <button onClick={() => setShowUpload(test.id)} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"><Upload className="w-3 h-3" /> Upload</button>}
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
