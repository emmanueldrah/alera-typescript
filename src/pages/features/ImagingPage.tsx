import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock3, Download, FileImage, FileText, Inbox, Plus, ScanLine, Search, Trash2, Upload, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { type ImagingScan } from '@/data/mockData';
import { getDoctorPatients } from '@/lib/patientDirectory';
import { getVisibleImagingScans } from '@/lib/recordVisibility';
import { getReferralDestinationProviders } from '@/lib/referralUtils';
import { normalizeUserRole } from '@/lib/roleUtils';
import { api } from '@/lib/apiService';

const SCAN_TYPES: ImagingScan['scanType'][] = ['X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'PET Scan', 'DEXA Scan'];

const formatDateTime = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const toDateInputValue = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - (date.getTimezoneOffset() * 60_000));
  return local.toISOString().slice(0, 16);
};

const ImagingPage = () => {
  const { user, getUsers } = useAuth();
  const { appointments, imagingScans, addImagingScan, updateImagingScan, refreshAppData } = useAppData();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [showUpload, setShowUpload] = useState<string | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ImagingScan['status']>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'scheduled' | 'patient' | 'status'>('newest');
  const [orderForm, setOrderForm] = useState({
    patientId: '',
    centerId: '',
    scanType: '' as ImagingScan['scanType'] | '',
    bodyPart: '',
    clinicalIndication: '',
  });
  const [uploadForm, setUploadForm] = useState({
    findings: '',
    impression: '',
    reportFile: null as File | null,
    imageFiles: [] as File[],
  });
  const focusId = searchParams.get('focus');
  const effectiveRole = normalizeUserRole(user?.role) ?? user?.role;
  const currentPage = user?.role === 'imaging' ? 'scan-requests' : effectiveRole === 'doctor' ? 'imaging-referrals' : 'imaging';
  const users = getUsers();
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const patientOptions = useMemo(() => getDoctorPatients(users, appointments, user?.id), [appointments, user?.id, users]);
  const imagingCenterOptions = useMemo(() => getReferralDestinationProviders(users, 'imaging'), [users]);

  const visibleScans = useMemo(
    () => getVisibleImagingScans(imagingScans, user),
    [imagingScans, user],
  );
  const filteredScans = useMemo(() => {
    const needle = deferredSearchTerm.trim().toLowerCase();
    const matchesSearch = (scan: ImagingScan) => {
      if (!needle) return true;
      return [
        scan.patientName,
        scan.doctorName,
        scan.scanType,
        scan.bodyPart,
        scan.clinicalIndication,
        scan.destinationProviderName,
        scan.results,
        scan.impression,
      ].some((value) => value?.toLowerCase().includes(needle));
    };

    const matchesStatus = (scan: ImagingScan) => statusFilter === 'all' || scan.status === statusFilter;
    const rows = visibleScans.filter((scan) => matchesSearch(scan) && matchesStatus(scan));

    const statusRank: Record<ImagingScan['status'], number> = {
      requested: 0,
      'in-progress': 1,
      completed: 2,
      cancelled: 3,
    };

    return [...rows].sort((left, right) => {
      if (sortBy === 'patient') return left.patientName.localeCompare(right.patientName);
      if (sortBy === 'status') return statusRank[left.status] - statusRank[right.status] || left.patientName.localeCompare(right.patientName);
      if (sortBy === 'scheduled') {
        const leftTime = left.scheduledAt ? new Date(left.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
        const rightTime = right.scheduledAt ? new Date(right.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
        return leftTime - rightTime;
      }
      const leftTime = left.completedAt || left.scheduledAt || left.date;
      const rightTime = right.completedAt || right.scheduledAt || right.date;
      return String(rightTime).localeCompare(String(leftTime));
    });
  }, [deferredSearchTerm, sortBy, statusFilter, visibleScans]);
  const stats = useMemo(() => ({
    total: visibleScans.length,
    requested: visibleScans.filter((scan) => scan.status === 'requested').length,
    inProgress: visibleScans.filter((scan) => scan.status === 'in-progress').length,
    completed: visibleScans.filter((scan) => scan.status === 'completed').length,
    scheduled: visibleScans.filter((scan) => Boolean(scan.scheduledAt) && scan.status !== 'completed' && scan.status !== 'cancelled').length,
  }), [visibleScans]);

  const resetUploadForm = () => {
    setShowUpload(null);
    setUploadForm({
      findings: '',
      impression: '',
      reportFile: null,
      imageFiles: [],
    });
  };

  const handleUpload = async (scan: ImagingScan) => {
    const hasPayload =
      uploadForm.findings.trim() ||
      uploadForm.impression.trim() ||
      uploadForm.reportFile ||
      uploadForm.imageFiles.length > 0;

    if (!hasPayload) {
      toast({
        title: 'Upload details required',
        description: 'Add findings, an impression, or files before publishing the imaging result.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingId(scan.id);
    try {
      await api.imaging.uploadImagingResults(scan.id, {
        findings: uploadForm.findings,
        impression: uploadForm.impression,
        status: 'completed',
        reportFile: uploadForm.reportFile,
        imageFiles: uploadForm.imageFiles,
      });
      await refreshAppData();

      const doctorEmail = users.find((account) => account.id === scan.doctorId)?.email;
      const patientEmail = users.find((account) => account.id === scan.patientId)?.email;
      addNotification({
        title: 'Imaging Result Uploaded',
        message: `${scan.scanType}${scan.bodyPart ? ` (${scan.bodyPart})` : ''} for ${scan.patientName} is now complete.`,
        type: 'result',
        priority: 'high',
        audience: 'personal',
        actionUrl: `/dashboard/${currentPage}?focus=${scan.id}`,
        actionLabel: 'Open result',
        targetEmails: [doctorEmail, patientEmail].filter((value): value is string => Boolean(value)),
        excludeEmails: user?.email ? [user.email] : [],
        actionUrlByRole: {
          imaging: `/dashboard/scan-requests?focus=${scan.id}`,
          doctor: `/dashboard/imaging-referrals?focus=${scan.id}`,
          patient: `/dashboard/imaging?focus=${scan.id}`,
        },
      });
      resetUploadForm();
      toast({
        title: 'Imaging result published',
        description: 'The report and files are now available in the imaging workflow.',
      });
    } catch (error) {
      console.error('Failed to upload imaging results:', error);
      toast({
        title: 'Upload failed',
        description: 'We could not publish this imaging result right now.',
        variant: 'destructive',
      });
    } finally {
      setUploadingId(null);
    }
  };

  const notifyQueueUpdate = (scan: ImagingScan, title: string, message: string) => {
    const doctorEmail = users.find((account) => account.id === scan.doctorId)?.email;
    const patientEmail = users.find((account) => account.id === scan.patientId)?.email;
    addNotification({
      title,
      message,
      type: 'result',
      priority: 'medium',
      audience: 'personal',
      targetEmails: [doctorEmail, patientEmail].filter((value): value is string => Boolean(value)),
      excludeEmails: user?.email ? [user.email] : [],
      actionUrl: `/dashboard/${currentPage}?focus=${scan.id}`,
      actionLabel: 'Open study',
      actionUrlByRole: {
        imaging: `/dashboard/scan-requests?focus=${scan.id}`,
        doctor: `/dashboard/imaging-referrals?focus=${scan.id}`,
        patient: `/dashboard/imaging?focus=${scan.id}`,
      },
    });
  };

  const handleOrder = async () => {
    if (!orderForm.patientId || !orderForm.centerId || !orderForm.scanType) {
      toast({
        title: 'Complete the scan order',
        description: 'Select a patient, imaging center, and scan type before ordering.',
        variant: 'destructive',
      });
      return;
    }
    const patient = patientOptions.find((option) => option.id === orderForm.patientId);
    const center = imagingCenterOptions.find((option) => option.id === orderForm.centerId);
    if (!patient || !center) {
      toast({
        title: 'Order could not be created',
        description: 'The selected patient or imaging center is unavailable.',
        variant: 'destructive',
      });
      return;
    }

    const scan: ImagingScan = {
      id: `img-${Date.now()}`,
      patientName: patient.name,
      patientId: patient.id,
      doctorName: user?.name || 'Doctor',
      doctorId: user?.id || '',
      centerId: center.id,
      destinationProviderName: center.name,
      scanType: orderForm.scanType as ImagingScan['scanType'],
      bodyPart: orderForm.bodyPart.trim() || undefined,
      clinicalIndication: orderForm.clinicalIndication.trim() || undefined,
      date: new Date().toISOString().split('T')[0],
      status: 'requested',
    };

    addImagingScan(scan);
    addNotification({
      title: 'Imaging Ordered',
      message: `${orderForm.scanType}${orderForm.bodyPart ? ` (${orderForm.bodyPart})` : ''} was requested for ${patient.name} and sent to ${center.name}.`,
      type: 'result',
      priority: 'medium',
      audience: 'personal',
      actionUrl: `/dashboard/imaging-referrals`,
      actionLabel: 'Open order',
      targetEmails: [user?.email, patient.email, center.email].filter((value): value is string => Boolean(value)),
      excludeEmails: user?.email ? [user.email] : [],
      actionUrlByRole: {
        doctor: '/dashboard/imaging-referrals',
        imaging: '/dashboard/scan-requests',
        patient: '/dashboard/imaging',
      },
    });
    setShowOrder(false);
    setOrderForm({ patientId: '', centerId: '', scanType: '', bodyPart: '', clinicalIndication: '' });
    toast({
      title: 'Imaging ordered',
      description: `${orderForm.scanType} was sent to ${center.name}.`,
    });
  };

  const handleStatusChange = (id: string, status: ImagingScan['status']) => {
    const target = imagingScans.find((scan) => scan.id === id);
    updateImagingScan(id, (scan) => ({ ...scan, status }));
    toast({
      title: 'Study updated',
      description: `The imaging study is now ${status.replace('-', ' ')}.`,
    });
    if (showUpload === id && status !== 'completed') {
      resetUploadForm();
    }
    if (target && user?.role === 'imaging') {
      if (status === 'in-progress') {
        notifyQueueUpdate(target, 'Imaging Study Started', `${target.scanType}${target.bodyPart ? ` (${target.bodyPart})` : ''} for ${target.patientName} is now in progress.`);
      }
      if (status === 'cancelled') {
        notifyQueueUpdate(target, 'Imaging Study Cancelled', `${target.scanType}${target.bodyPart ? ` (${target.bodyPart})` : ''} for ${target.patientName} was cancelled.`);
      }
    }
  };

  const handleSchedule = async (scan: ImagingScan) => {
    const scheduleValue = scheduleDrafts[scan.id];
    if (!scheduleValue) return;
    setSchedulingId(scan.id);
    try {
      await api.imaging.updateImagingScan(scan.id, {
        scheduled_at: new Date(scheduleValue).toISOString(),
        status: 'scheduled',
      });
      await refreshAppData();
      startTransition(() => {
        setScheduleDrafts((current) => ({ ...current, [scan.id]: '' }));
      });
      notifyQueueUpdate(scan, 'Imaging Study Scheduled', `${scan.scanType}${scan.bodyPart ? ` (${scan.bodyPart})` : ''} for ${scan.patientName} was scheduled for ${formatDateTime(new Date(scheduleValue).toISOString())}.`);
      toast({
        title: 'Study scheduled',
        description: `${scan.patientName} is booked for ${formatDateTime(new Date(scheduleValue).toISOString())}.`,
      });
    } catch (error) {
      console.error('Failed to schedule imaging scan:', error);
      toast({
        title: 'Scheduling failed',
        description: 'We could not save the imaging appointment time.',
        variant: 'destructive',
      });
    } finally {
      setSchedulingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      await api.imaging.deleteImagingScan(id);
      await refreshAppData();
      toast({
        title: 'Imaging study deleted',
        description: 'The study was removed from the worklist.',
      });
    } catch (error) {
      console.error('Failed to delete imaging scan:', error);
      toast({
        title: 'Delete failed',
        description: 'We could not remove this imaging study.',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
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
            {user?.role === 'imaging' ? 'Schedule studies, process scans, and publish reports' : effectiveRole === 'doctor' ? 'Order medical imaging and track active studies' : 'View your imaging results and downloadable reports'}
          </p>
        </div>
        {effectiveRole === 'doctor' && (
          <button onClick={() => setShowOrder(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Order Scan
          </button>
        )}
      </div>

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
                aria-label="Patient"
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
                aria-label="Scan Type"
                value={orderForm.scanType}
                onChange={(e) => setOrderForm({ ...orderForm, scanType: e.target.value as ImagingScan['scanType'] | '' })}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select scan type</option>
                {SCAN_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Imaging Center</label>
              <select
                aria-label="Imaging Center"
                value={orderForm.centerId}
                onChange={(e) => setOrderForm({ ...orderForm, centerId: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select imaging center</option>
                {imagingCenterOptions.map((center) => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Body Part / Area</label>
              <input
                aria-label="Body Part / Area"
                value={orderForm.bodyPart}
                onChange={(e) => setOrderForm({ ...orderForm, bodyPart: e.target.value })}
                placeholder="e.g., Chest, Knee, Head"
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Clinical Indication</label>
              <textarea
                aria-label="Clinical Indication"
                value={orderForm.clinicalIndication}
                onChange={(e) => setOrderForm({ ...orderForm, clinicalIndication: e.target.value })}
                rows={3}
                placeholder="Why is this study being ordered? Include symptoms, suspected diagnosis, or clinical question."
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
          </div>
          <button
            onClick={() => void handleOrder()}
            disabled={!orderForm.patientId || !orderForm.centerId || !orderForm.scanType}
            className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Order Scan
          </button>
        </motion.div>
      )}

      {user?.role === 'imaging' && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              { label: 'Total Queue', value: stats.total, icon: <ScanLine className="w-4 h-4" />, tone: 'text-primary bg-primary/10' },
              { label: 'New Requests', value: stats.requested, icon: <Clock3 className="w-4 h-4" />, tone: 'text-warning bg-warning/10' },
              { label: 'Scheduled', value: stats.scheduled, icon: <Calendar className="w-4 h-4" />, tone: 'text-info bg-info/10' },
              { label: 'In Progress', value: stats.inProgress, icon: <Upload className="w-4 h-4" />, tone: 'text-info bg-info/10' },
              { label: 'Completed', value: stats.completed, icon: <CheckCircle2 className="w-4 h-4" />, tone: 'text-success bg-success/10' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-card p-4">
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>{item.icon}</div>
                <div className="text-2xl font-display font-bold text-card-foreground">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_220px_180px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  aria-label="Search studies"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by patient, doctor, modality, body part, or findings"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | ImagingScan['status'])}
                className="h-11 rounded-xl border border-input bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All statuses</option>
                <option value="requested">Pending</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                aria-label="Sort studies"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'newest' | 'scheduled' | 'patient' | 'status')}
                className="h-11 rounded-xl border border-input bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="newest">Sort: newest activity</option>
                <option value="scheduled">Sort: scheduled first</option>
                <option value="patient">Sort: patient name</option>
                <option value="status">Sort: queue status</option>
              </select>
            </div>
          </div>
        </>
      )}

      {filteredScans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">{visibleScans.length === 0 ? 'No imaging scans yet' : 'No studies match the current worklist filters'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan, index) => {
            const reportDownloadUrl = scan.reportFile?.downloadUrl || scan.reportUrl;
            const canUpload = user?.role === 'imaging' && scan.status !== 'completed' && scan.status !== 'cancelled';
            const canCancel = (user?.role === 'imaging' || effectiveRole === 'doctor') && scan.status !== 'completed' && scan.status !== 'cancelled';
            const canDelete = effectiveRole === 'doctor';
            const scheduleDraft = scheduleDrafts[scan.id] ?? toDateInputValue(scan.scheduledAt);
            const hasAssets = Boolean(reportDownloadUrl || scan.imageUrl || scan.imageFiles?.length);

            return (
              <motion.div
                key={scan.id}
                {...card(index)}
                className={`bg-card rounded-2xl border p-5 ${focusId === scan.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        scan.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <ScanLine className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="text-base font-semibold text-foreground">
                          {scan.scanType}
                          {scan.bodyPart ? <span className="text-muted-foreground font-normal text-sm ml-2">({scan.bodyPart})</span> : null}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Patient: {scan.patientName}</div>
                        <div className="text-sm text-muted-foreground">Doctor: {scan.doctorName}</div>
                        {scan.destinationProviderName ? <div className="text-xs text-muted-foreground">Imaging center: {scan.destinationProviderName}</div> : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Ordered {scan.date}
                        </span>
                        {scan.scheduledAt ? <span>Scheduled {formatDateTime(scan.scheduledAt)}</span> : null}
                        {scan.completedAt ? <span>Completed {formatDateTime(scan.completedAt)}</span> : null}
                      </div>

                      {scan.clinicalIndication ? (
                        <div className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-2">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Clinical indication</div>
                          <p className="mt-1 text-sm text-card-foreground">{scan.clinicalIndication}</p>
                        </div>
                      ) : null}

                      {user?.role === 'imaging' ? (
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                            Assets: {hasAssets ? `${scan.imageFiles?.length || 0} image file(s)` : 'none yet'}
                          </span>
                          <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                            Report: {scan.reportFile ? 'attached' : 'not attached'}
                          </span>
                        </div>
                      ) : null}

                      {scan.results || scan.impression ? (
                        <div className="space-y-2 rounded-lg bg-success/5 border border-success/10 p-3">
                          {scan.results ? (
                            <div>
                              <div className="text-xs font-medium text-success mb-1">Findings</div>
                              <p className="text-sm text-card-foreground whitespace-pre-wrap">{scan.results}</p>
                            </div>
                          ) : null}
                          {scan.impression ? (
                            <div>
                              <div className="text-xs font-medium text-success mb-1">Impression</div>
                              <p className="text-sm text-card-foreground whitespace-pre-wrap">{scan.impression}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {(reportDownloadUrl || (scan.imageFiles && scan.imageFiles.length > 0) || scan.postdicomStudyUrl) ? (
                        <div className="flex flex-wrap gap-2">
                          {reportDownloadUrl ? (
                            <a
                              href={reportDownloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                            >
                              <FileText className="w-3 h-3" />
                              {scan.reportFile?.filename || 'Download report'}
                              {scan.reportFile?.fileSize ? <span className="text-primary/70">({formatFileSize(scan.reportFile.fileSize)})</span> : null}
                            </a>
                          ) : null}
                          {(scan.imageFiles || []).map((file) => (
                            <a
                              key={file.fileId}
                              href={file.downloadUrl || scan.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition"
                            >
                              <FileImage className="w-3 h-3" />
                              {file.filename}
                              {file.fileSize ? <span className="text-muted-foreground">({formatFileSize(file.fileSize)})</span> : null}
                            </a>
                          ))}
                          {!scan.imageFiles?.length && scan.imageUrl ? (
                            <a
                              href={scan.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition"
                            >
                              <Download className="w-3 h-3" /> Open study image
                            </a>
                          ) : null}
                          {scan.postdicomStudyUrl ? (
                            <a
                              href={scan.postdicomStudyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                            >
                              <FileImage className="w-3 h-3" />
                              View in PostDICOM
                            </a>
                          ) : null}
                        </div>
                      ) : null}
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

                    <div className="flex flex-wrap justify-end gap-2">
                      {user?.role === 'imaging' && scan.status === 'requested' && (
                        <button
                          onClick={() => handleStatusChange(scan.id, 'in-progress')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-info/10 text-info text-xs font-medium hover:bg-info/20 transition"
                        >
                          Start
                        </button>
                      )}
                      {canUpload && (
                        <button
                          onClick={() => {
                            setShowUpload(scan.id);
                            setUploadForm({
                              findings: scan.results || '',
                              impression: scan.impression || '',
                              reportFile: null,
                              imageFiles: [],
                            });
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                        >
                          <Upload className="w-3 h-3" /> Upload Results
                        </button>
                      )}
                      {canCancel ? (
                        <button
                          onClick={() => handleStatusChange(scan.id, 'cancelled')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition"
                        >
                          Cancel
                        </button>
                      ) : null}
                      {canDelete ? (
                        <button
                          onClick={() => void handleDelete(scan.id)}
                          disabled={deleteId === scan.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" /> {deleteId === scan.id ? 'Deleting...' : 'Delete'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {user?.role === 'imaging' && scan.status !== 'completed' && scan.status !== 'cancelled' ? (
                  <div className="mt-4 rounded-xl border border-border/60 bg-secondary/30 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Schedule study</label>
                        <input
                          type="datetime-local"
                          aria-label="Schedule study"
                          value={scheduleDraft}
                          onChange={(e) => {
                            const nextValue = e.target.value;
                            startTransition(() => {
                              setScheduleDrafts((current) => ({ ...current, [scan.id]: nextValue }));
                            });
                          }}
                          className="mt-1 w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <button
                        onClick={() => void handleSchedule(scan)}
                        disabled={!scheduleDraft || schedulingId === scan.id}
                        className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition disabled:opacity-50"
                      >
                        {schedulingId === scan.id ? 'Saving...' : 'Save schedule'}
                      </button>
                    </div>
                  </div>
                ) : null}

                {showUpload === scan.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 rounded-xl bg-secondary/50 space-y-4">
                    {user?.role === 'imaging' && (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-primary-foreground">
                    Imaging uploads are sent directly to PostDICOM only. If you haven’t configured your PostDICOM endpoint yet, save it in your profile before submitting.
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-card-foreground mb-1.5 block">Findings</label>
                        <textarea
                          aria-label="Findings"
                          value={uploadForm.findings}
                          onChange={(e) => setUploadForm((prev) => ({ ...prev, findings: e.target.value }))}
                          rows={4}
                          placeholder="Describe the imaging findings..."
                          className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-card-foreground mb-1.5 block">Impression</label>
                        <textarea
                          aria-label="Impression"
                          value={uploadForm.impression}
                          onChange={(e) => setUploadForm((prev) => ({ ...prev, impression: e.target.value }))}
                          rows={3}
                          placeholder="Summarize the radiologist's impression..."
                          className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-card-foreground mb-1.5 block">Report File</label>
                        <input
                          type="file"
                          aria-label="Report File"
                          accept=".pdf,.doc,.docx,.txt,image/*"
                          onChange={(e) => setUploadForm((prev) => ({ ...prev, reportFile: e.target.files?.[0] || null }))}
                          className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary file:font-medium hover:file:bg-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-card-foreground mb-1.5 block">Study Images</label>
                        <input
                          type="file"
                          multiple
                          aria-label="Study Images"
                          accept="image/*,.dcm,.dicom,.pdf"
                          onChange={(e) => setUploadForm((prev) => ({ ...prev, imageFiles: Array.from(e.target.files || []) }))}
                          className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-secondary-foreground file:font-medium hover:file:bg-muted"
                        />
                      </div>
                    </div>

                    {uploadForm.reportFile || uploadForm.imageFiles.length > 0 ? (
                      <div className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-muted-foreground">
                        {uploadForm.reportFile ? <div>Report: {uploadForm.reportFile.name}</div> : null}
                        {uploadForm.imageFiles.length > 0 ? <div>{uploadForm.imageFiles.length} study image file(s) selected</div> : null}
                      </div>
                    ) : null}

                    <div className="flex gap-2">
                      <button
                        onClick={() => void handleUpload(scan)}
                        disabled={
                          uploadingId === scan.id ||
                          (user?.role === 'imaging' && !user?.postdicomApiUrl)
                        }
                        className="px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                      >
                        {uploadingId === scan.id ? 'Submitting...' : user?.role === 'imaging' ? 'Submit to PostDICOM' : 'Submit Results'}
                      </button>
                      <button
                        onClick={resetUploadForm}
                        className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImagingPage;
