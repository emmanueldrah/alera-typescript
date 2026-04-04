import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Upload, Plus, X, Inbox, Calendar } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { type ImagingScan } from '@/data/mockData';
import { getDoctorPatients } from '@/lib/patientDirectory';
import { getVisibleImagingScans } from '@/lib/recordVisibility';
import { normalizeUserRole } from '@/lib/roleUtils';

const SCAN_TYPES: ImagingScan['scanType'][] = ['X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'PET Scan', 'DEXA Scan'];

const ImagingPage = () => {
  const { user, getUsers } = useAuth();
  const { appointments, imagingScans, addImagingScan, updateImagingScan } = useAppData();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [showUpload, setShowUpload] = useState<string | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [uploadResult, setUploadResult] = useState('');
  const [orderForm, setOrderForm] = useState({ patientId: '', scanType: '' as ImagingScan['scanType'] | '', bodyPart: '' });
  const focusId = searchParams.get('focus');
  const effectiveRole = normalizeUserRole(user?.role) ?? user?.role;
  const currentPage = user?.role === 'imaging' ? 'scan-requests' : effectiveRole === 'doctor' ? 'imaging-referrals' : 'imaging';
  const users = getUsers();
  const patientOptions = useMemo(() => getDoctorPatients(users, appointments, user?.id), [appointments, user?.id, users]);

  const visibleScans = useMemo(
    () => getVisibleImagingScans(imagingScans, user),
    [imagingScans, user],
  );

  const handleUpload = (id: string) => {
    if (!uploadResult.trim()) return;
    const target = imagingScans.find((scan) => scan.id === id);
    updateImagingScan(id, (scan) => ({ ...scan, status: 'completed' as const, results: uploadResult }));
    if (target) {
      const doctorEmail = users.find((account) => account.id === target.doctorId)?.email;
      const patientEmail = users.find((account) => account.id === target.patientId)?.email;
      addNotification({
        title: 'Imaging Result Uploaded',
        message: `${target.scanType}${target.bodyPart ? ' (' + target.bodyPart + ')' : ''} for ${target.patientName} is now complete.`,
        type: 'result',
        priority: 'high',
        audience: 'personal',
        actionUrl: `/dashboard/${currentPage}?focus=${target.id}`,
        actionLabel: 'Open result',
        targetEmails: [doctorEmail, patientEmail].filter((value): value is string => Boolean(value)),
        excludeEmails: user?.email ? [user.email] : [],
        actionUrlByRole: {
          imaging: `/dashboard/scan-requests?focus=${target.id}`,
          doctor: `/dashboard/imaging-referrals?focus=${target.id}`,
          patient: `/dashboard/imaging?focus=${target.id}`,
        },
      });
    }
    setShowUpload(null);
    setUploadResult('');
  };

  const handleOrder = () => {
    if (!orderForm.patientId || !orderForm.scanType) return;
    const patient = patientOptions.find((option) => option.id === orderForm.patientId);
    if (!patient) return;
    const scan: ImagingScan = {
      id: `img-${Date.now()}`,
      patientName: patient.name,
      patientId: patient.id,
      doctorName: user?.name || 'Doctor',
      doctorId: user?.id || '',
      scanType: orderForm.scanType as ImagingScan['scanType'],
      bodyPart: orderForm.bodyPart,
      date: new Date().toISOString().split('T')[0],
      status: 'requested',
      centerId: undefined,
    };
    addImagingScan(scan);
    addNotification({
      title: 'Imaging Ordered',
      message: `${orderForm.scanType}${orderForm.bodyPart ? ' (' + orderForm.bodyPart + ')' : ''} was requested for ${patient.name}.`,
      type: 'result',
      priority: 'medium',
      audience: 'personal',
      actionUrl: `/dashboard/imaging-referrals?focus=${scan.id}`,
      actionLabel: 'Open order',
      targetEmails: [user?.email, patient.email].filter((value): value is string => Boolean(value)),
      targetRoles: ['imaging'],
      excludeEmails: user?.email ? [user.email] : [],
      actionUrlByRole: {
        doctor: `/dashboard/imaging-referrals?focus=${scan.id}`,
        imaging: `/dashboard/scan-requests?focus=${scan.id}`,
      },
    });
    setShowOrder(false);
    setOrderForm({ patientId: '', scanType: '', bodyPart: '' });
  };

  const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {user?.role === 'imaging' ? 'Scan Requests' : effectiveRole === 'doctor' ? 'Imaging Referrals' : 'Imaging Results'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'imaging' ? 'Process and upload scan results' : effectiveRole === 'doctor' ? 'Order imaging scans' : 'View your imaging results'}
          </p>
        </div>
        {effectiveRole === 'doctor' && (
          <button onClick={() => setShowOrder(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Order Scan
          </button>
        )}
      </div>

      {/* Order Form */}
      {showOrder && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Order Medical Imaging</h2>
            <button onClick={() => setShowOrder(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Patient</label>
              <select
                value={orderForm.patientId}
                onChange={(e) => setOrderForm({ ...orderForm, patientId: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select patient</option>
                {patientOptions.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Scan Type</label>
              <select
                value={orderForm.scanType}
                onChange={(e) => setOrderForm({ ...orderForm, scanType: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select scan type</option>
                {SCAN_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Body Part / Area (Optional)</label>
              <input
                value={orderForm.bodyPart}
                onChange={(e) => setOrderForm({ ...orderForm, bodyPart: e.target.value })}
                placeholder="e.g., Chest, Knee, Head"
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <button
            onClick={handleOrder}
            disabled={!orderForm.patientId || !orderForm.scanType}
            className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Order Scan
          </button>
        </motion.div>
      )}

      {/* Scans List */}
      {visibleScans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">No imaging scans yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleScans.map((scan, index) => (
            <motion.div
              key={scan.id}
              {...card(index)}
              className={`bg-card rounded-2xl border p-5 ${focusId === scan.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      scan.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <ScanLine className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-foreground">
                      {scan.scanType}
                      {scan.bodyPart && <span className="text-muted-foreground font-normal text-sm ml-2">({scan.bodyPart})</span>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Patient: {scan.patientName}</div>
                    <div className="text-sm text-muted-foreground">Doctor: {scan.doctorName}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" /> {scan.date}
                    </div>

                    {scan.results && (
                      <div className="mt-3 p-3 rounded-lg bg-success/5 border border-success/10">
                        <div className="text-xs font-medium text-success mb-1">Results Available</div>
                        <p className="text-sm text-card-foreground">{scan.results}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                      scan.status === 'requested'
                        ? 'bg-warning/10 text-warning'
                        : scan.status === 'in-progress'
                          ? 'bg-info/10 text-info'
                          : scan.status === 'cancelled'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-success/10 text-success'
                    }`}
                  >
                    {scan.status === 'requested'
                      ? 'Pending'
                      : scan.status === 'in-progress'
                        ? 'In Progress'
                        : scan.status === 'cancelled'
                          ? 'Cancelled'
                          : 'Completed'}
                  </span>
                  {user?.role === 'imaging' && scan.status !== 'completed' && scan.status !== 'cancelled' && (
                    <button
                      onClick={() => setShowUpload(scan.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                    >
                      <Upload className="w-3 h-3" /> Upload Results
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Results Form */}
              {showUpload === scan.id && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 rounded-xl bg-secondary/50">
                  <textarea
                    value={uploadResult}
                    onChange={(e) => setUploadResult(e.target.value)}
                    rows={3}
                    placeholder="Enter scan results and findings..."
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpload(scan.id)}
                      className="px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
                    >
                      Submit Results
                    </button>
                    <button
                      onClick={() => {
                        setShowUpload(null);
                        setUploadResult('');
                      }}
                      className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition"
                    >
                      Cancel
                    </button>
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

export default ImagingPage;
