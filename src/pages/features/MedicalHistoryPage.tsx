import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  FlaskConical,
  Heart,
  Pill,
  Plus,
  ScanLine,
  ShieldCheck,
  Syringe,
  User,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { recordsApi, type SynchronizedHistoryResponse, type SynchronizedHistoryTimelineEntry } from '@/lib/apiService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { PatientMedicalHistory } from '@/data/mockData';

type RecordFormType = 'condition' | 'surgery' | 'family' | 'vaccination';

const formatDate = (value?: string | null) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } }).response;
    if (typeof response?.data?.detail === 'string') return response.data.detail;
  }
  if (error instanceof Error) return error.message;
  return 'Unable to load synchronized history right now.';
};

const timelineMeta = (source: string) => {
  switch (source) {
    case 'appointment':
      return { icon: <Calendar className="h-4 w-4" />, tone: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'prescription':
      return { icon: <Pill className="h-4 w-4" />, tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'lab_test':
      return { icon: <FlaskConical className="h-4 w-4" />, tone: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'imaging_scan':
      return { icon: <ScanLine className="h-4 w-4" />, tone: 'bg-violet-50 text-violet-700 border-violet-200' };
    case 'medical_history':
      return { icon: <Heart className="h-4 w-4" />, tone: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { icon: <FileText className="h-4 w-4" />, tone: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
};

const SummaryCard = ({ label, value, helper }: { label: string; value: number | string; helper: string }) => (
  <Card className="border-border/70">
    <CardContent className="p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{helper}</div>
    </CardContent>
  </Card>
);

const UnifiedTimeline = ({ entries }: { entries: SynchronizedHistoryTimelineEntry[] }) => {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-muted-foreground">
        <FileText className="mb-3 h-9 w-9 opacity-50" />
        <p className="text-sm">No synchronized events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const meta = timelineMeta(entry.source);
        return (
          <motion.div
            key={`${entry.source}-${entry.source_id}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="relative flex gap-4"
          >
            <div className="relative pt-1">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${meta.tone}`}>
                {meta.icon}
              </div>
              {index < entries.length - 1 && <div className="absolute left-1/2 top-10 h-full w-px -translate-x-1/2 bg-border" />}
            </div>
            <div className="flex-1 rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-foreground">{entry.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {entry.provider_name ? `Provider: ${entry.provider_name}` : 'Provider information unavailable'}
                  </div>
                </div>
                {entry.status ? <Badge variant="secondary">{entry.status}</Badge> : null}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">{formatDateTime(entry.timestamp)}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const MedicalHistoryPage = () => {
  const { user, getUsers } = useAuth();
  const { medicalHistories, addMedicalHistory, updateMedicalHistory } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<RecordFormType>('condition');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [syncedHistory, setSyncedHistory] = useState<SynchronizedHistoryResponse | null>(null);
  const [isLoadingSyncedHistory, setIsLoadingSyncedHistory] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    notes: '',
    relation: '',
    surgeon: '',
    hospital: '',
  });

  const isPatientView = user?.role === 'patient';
  const canSelectPatient = user?.role === 'doctor' || user?.role === 'hospital' || user?.role === 'admin' || user?.role === 'super_admin';

  const userMedicalHistory = useMemo(
    () => medicalHistories.find((mh) => mh.patientId === user?.id),
    [medicalHistories, user?.id],
  );

  const accessiblePatients = useMemo(
    () =>
      getUsers()
        .filter((candidate) => candidate.role === 'patient')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [getUsers],
  );

  useEffect(() => {
    if (!user) return;

    if (isPatientView) {
      setSelectedPatientId(user.id);
      return;
    }

    if (!canSelectPatient) {
      setSelectedPatientId('');
      return;
    }

    const requestedPatientId = searchParams.get('patient');
    const requestedIsAccessible = accessiblePatients.some((candidate) => candidate.id === requestedPatientId);
    const nextPatientId = requestedIsAccessible ? requestedPatientId ?? '' : accessiblePatients[0]?.id ?? '';

    if (nextPatientId !== selectedPatientId) {
      setSelectedPatientId(nextPatientId);
    }
  }, [accessiblePatients, canSelectPatient, isPatientView, searchParams, selectedPatientId, user]);

  useEffect(() => {
    if (!canSelectPatient || !selectedPatientId) return;

    const nextParams = new URLSearchParams(searchParams);
    if (nextParams.get('patient') !== selectedPatientId) {
      nextParams.set('patient', selectedPatientId);
      setSearchParams(nextParams, { replace: true });
    }
  }, [canSelectPatient, searchParams, selectedPatientId, setSearchParams]);

  const focusedPatientId = isPatientView ? user?.id ?? '' : selectedPatientId;
  const focusedPatientName = isPatientView ? user?.name : accessiblePatients.find((candidate) => candidate.id === focusedPatientId)?.name;

  useEffect(() => {
    if (!focusedPatientId) {
      setSyncedHistory(null);
      setSyncError(null);
      return;
    }

    let active = true;

    const loadSynchronizedHistory = async () => {
      setIsLoadingSyncedHistory(true);
      setSyncError(null);

      try {
        const response = await recordsApi.getSynchronizedHistory(focusedPatientId);
        if (!active) return;
        setSyncedHistory(response);
      } catch (error) {
        if (!active) return;
        setSyncedHistory(null);
        setSyncError(getErrorMessage(error));
      } finally {
        if (active) setIsLoadingSyncedHistory(false);
      }
    };

    void loadSynchronizedHistory();

    return () => {
      active = false;
    };
  }, [focusedPatientId]);

  const handleAddHistoryItem = () => {
    if (!user) return;

    if (!userMedicalHistory) {
      const newHistory: PatientMedicalHistory = {
        id: `mh-${Date.now()}`,
        patientId: user.id,
        conditions: [],
        surgeries: [],
        familyHistory: [],
        socialHistory: {
          smoking: 'never',
          alcohol: '',
          drugs: '',
          lastUpdated: new Date().toISOString().split('T')[0],
        },
        vaccinations: [],
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      if (formType === 'condition' && formData.name) {
        newHistory.conditions.push({
          id: `cond-${Date.now()}`,
          name: formData.name,
          dateOnset: formData.date,
          status: 'active',
          notes: formData.notes,
        });
      } else if (formType === 'surgery' && formData.name) {
        newHistory.surgeries.push({
          id: `surg-${Date.now()}`,
          name: formData.name,
          date: formData.date,
          surgeon: formData.surgeon,
          hospital: formData.hospital,
          notes: formData.notes,
        });
      } else if (formType === 'family' && formData.name) {
        newHistory.familyHistory.push({
          id: `fam-${Date.now()}`,
          relation: formData.relation,
          condition: formData.name,
        });
      } else if (formType === 'vaccination' && formData.name) {
        newHistory.vaccinations.push({
          id: `vac-${Date.now()}`,
          name: formData.name,
          date: formData.date,
          provider: formData.notes,
        });
      }

      addMedicalHistory(newHistory);
    } else {
      updateMedicalHistory(userMedicalHistory.id, (history) => {
        if (formType === 'condition' && formData.name) {
          return {
            ...history,
            conditions: [
              ...history.conditions,
              {
                id: `cond-${Date.now()}`,
                name: formData.name,
                dateOnset: formData.date,
                status: 'active',
                notes: formData.notes,
              },
            ],
          };
        }

        if (formType === 'surgery' && formData.name) {
          return {
            ...history,
            surgeries: [
              ...history.surgeries,
              {
                id: `surg-${Date.now()}`,
                name: formData.name,
                date: formData.date,
                surgeon: formData.surgeon,
                hospital: formData.hospital,
                notes: formData.notes,
              },
            ],
          };
        }

        if (formType === 'family' && formData.name) {
          return {
            ...history,
            familyHistory: [
              ...history.familyHistory,
              {
                id: `fam-${Date.now()}`,
                relation: formData.relation,
                condition: formData.name,
              },
            ],
          };
        }

        if (formType === 'vaccination' && formData.name) {
          return {
            ...history,
            vaccinations: [
              ...history.vaccinations,
              {
                id: `vac-${Date.now()}`,
                name: formData.name,
                date: formData.date,
                provider: formData.notes,
              },
            ],
          };
        }

        return history;
      });
    }

    setFormData({ name: '', date: '', notes: '', relation: '', surgeon: '', hospital: '' });
    setShowForm(false);
  };

  const unifiedConditions = syncedHistory?.medical_history ?? [];
  const unifiedPrescriptions = syncedHistory?.prescriptions ?? [];
  const unifiedLabTests = syncedHistory?.lab_tests ?? [];
  const unifiedImagingScans = syncedHistory?.imaging_scans ?? [];
  const unifiedTimeline = syncedHistory?.timeline ?? [];

  const renderPatientComposer = isPatientView ? (
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Personal Entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medical History</DialogTitle>
          <DialogDescription>Document important medical information for your personal record.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm font-medium">Record Type</label>
            <select
              value={formType}
              onChange={(event) => setFormType(event.target.value as RecordFormType)}
              className="mt-2 h-9 w-full rounded-md border border-input px-3"
            >
              <option value="condition">Medical Condition</option>
              <option value="surgery">Surgery</option>
              <option value="family">Family History</option>
              <option value="vaccination">Vaccination</option>
            </select>
          </div>

          {formType === 'condition' ? (
            <>
              <div>
                <label className="text-sm font-medium">Condition Name</label>
                <Input className="mt-2" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Date of Onset</label>
                <Input className="mt-2" type="date" value={formData.date} onChange={(event) => setFormData({ ...formData, date: event.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea className="mt-2" value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} />
              </div>
            </>
          ) : null}

          {formType === 'surgery' ? (
            <>
              <div>
                <label className="text-sm font-medium">Surgery Type</label>
                <Input className="mt-2" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input className="mt-2" type="date" value={formData.date} onChange={(event) => setFormData({ ...formData, date: event.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Surgeon</label>
                <Input className="mt-2" value={formData.surgeon} onChange={(event) => setFormData({ ...formData, surgeon: event.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Hospital</label>
                <Input className="mt-2" value={formData.hospital} onChange={(event) => setFormData({ ...formData, hospital: event.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea className="mt-2" value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} />
              </div>
            </>
          ) : null}

          {formType === 'family' ? (
            <>
              <div>
                <label className="text-sm font-medium">Relation to Patient</label>
                <select
                  value={formData.relation}
                  onChange={(event) => setFormData({ ...formData, relation: event.target.value })}
                  className="mt-2 h-9 w-full rounded-md border border-input px-3"
                >
                  <option value="">Select relation</option>
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="sibling">Sibling</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="aunt">Aunt</option>
                  <option value="uncle">Uncle</option>
                  <option value="cousin">Cousin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Condition</label>
                <Input className="mt-2" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
              </div>
            </>
          ) : null}

          {formType === 'vaccination' ? (
            <>
              <div>
                <label className="text-sm font-medium">Vaccination Name</label>
                <Input className="mt-2" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input className="mt-2" type="date" value={formData.date} onChange={(event) => setFormData({ ...formData, date: event.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Provider</label>
                <Input className="mt-2" value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} />
              </div>
            </>
          ) : null}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddHistoryItem} disabled={!formData.name}>
            Add Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  ) : null;

  const renderLocalHistory = isPatientView ? (
    <div className="space-y-6">
      {!userMedicalHistory ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-muted-foreground">
          <FileText className="mb-3 h-10 w-10 opacity-50" />
          <p className="text-sm">No personal entries recorded yet</p>
          <p className="mt-1 text-xs">Add conditions, surgeries, vaccinations, or family history here.</p>
        </div>
      ) : (
        <>
          {userMedicalHistory.conditions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-primary" />
                  Personal Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userMedicalHistory.conditions.map((condition) => (
                  <div key={condition.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{condition.name}</div>
                      <Badge variant="secondary">{condition.status}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Onset: {condition.dateOnset || 'Not recorded'}</div>
                    {condition.notes ? <p className="mt-2 text-sm">{condition.notes}</p> : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {userMedicalHistory.surgeries.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-primary" />
                  Surgical History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userMedicalHistory.surgeries.map((surgery) => (
                  <div key={surgery.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="font-semibold">{surgery.name}</div>
                    <div className="mt-2 text-sm text-muted-foreground">Date: {surgery.date || 'Not recorded'}</div>
                    <div className="text-sm text-muted-foreground">Surgeon: {surgery.surgeon || 'Not recorded'}</div>
                    <div className="text-sm text-muted-foreground">Hospital: {surgery.hospital || 'Not recorded'}</div>
                    {surgery.notes ? <p className="mt-2 text-sm">{surgery.notes}</p> : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {userMedicalHistory.vaccinations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Syringe className="h-5 w-5 text-primary" />
                  Vaccinations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userMedicalHistory.vaccinations.map((vaccine) => (
                  <div key={vaccine.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="font-semibold">{vaccine.name}</div>
                    <div className="mt-2 text-sm text-muted-foreground">Date: {vaccine.date || 'Not recorded'}</div>
                    <div className="text-sm text-muted-foreground">Provider: {vaccine.provider || 'Not recorded'}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {userMedicalHistory.familyHistory.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Family History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userMedicalHistory.familyHistory.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="font-semibold">{item.condition}</div>
                    <div className="mt-2 text-sm text-muted-foreground">Relation: {item.relation || 'Not recorded'}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  ) : null;

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Medical History & Unified Record</h1>
          <p className="mt-1 text-muted-foreground">
            {isPatientView
              ? 'See the synchronized view of your care history across providers, plus your own personal notes.'
              : 'Review the synchronized patient record shared across organizations the patient has interacted with.'}
          </p>
        </div>
        {renderPatientComposer}
      </div>

      {canSelectPatient ? (
        <Card className="border-primary/15 bg-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Patient Context</CardTitle>
            <CardDescription>Select a patient to load their synchronized record.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  {accessiblePatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!focusedPatientId && canSelectPatient ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No patient selected</AlertTitle>
          <AlertDescription>Select a patient to load their synchronized medical history.</AlertDescription>
        </Alert>
      ) : null}

      {syncError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load synchronized history</AlertTitle>
          <AlertDescription>{syncError}</AlertDescription>
        </Alert>
      ) : null}

      {isLoadingSyncedHistory ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="mt-4 h-8 w-16 rounded bg-muted" />
                <div className="mt-3 h-3 w-32 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {syncedHistory ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Appointments" value={syncedHistory.counts.appointments} helper="Clinical encounters on file" />
            <SummaryCard label="Prescriptions" value={syncedHistory.counts.prescriptions} helper="Medication records synchronized" />
            <SummaryCard label="Diagnostics" value={syncedHistory.counts.lab_tests + syncedHistory.counts.imaging_scans} helper="Lab and imaging studies" />
            <SummaryCard label="Organizations" value={syncedHistory.interacting_organizations.length} helper="Linked care organizations" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Sharing Status
                </CardTitle>
                <CardDescription>
                  {focusedPatientName ? `Viewing record for ${focusedPatientName}.` : 'Viewing synchronized patient record.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Access: {syncedHistory.access_scope}</Badge>
                  <Badge variant={syncedHistory.has_shared_history_consent ? 'default' : 'secondary'}>
                    {syncedHistory.has_shared_history_consent ? 'Consent active' : 'Consent missing'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Shared history is only exposed when the patient has interacted with the organization and has an active consent on file.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Connected Care Teams
                </CardTitle>
                <CardDescription>Organizations already linked to this patient’s care journey.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {syncedHistory.interacting_organizations.length > 0 ? (
                  syncedHistory.interacting_organizations.map((participant) => (
                    <div key={participant.user_id} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                      <div className="font-medium text-foreground">{participant.name}</div>
                      <Badge variant="secondary">{participant.role}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No linked organizations found yet.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
              {isPatientView ? <TabsTrigger value="personal">Personal Entries</TabsTrigger> : null}
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Synchronized Timeline</CardTitle>
                  <CardDescription>Unified chronology across appointments, prescriptions, diagnostics, and structured records.</CardDescription>
                </CardHeader>
                <CardContent>
                  <UnifiedTimeline entries={unifiedTimeline} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conditions and Allergies</CardTitle>
                  <CardDescription>Longitudinal medical history and allergy data synchronized from the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {unifiedConditions.length > 0 ? (
                    unifiedConditions.map((condition) => (
                      <div key={String(condition.id ?? condition.condition_name)} className="rounded-2xl border border-border bg-background p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-foreground">{String(condition.condition_name ?? 'Medical condition')}</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              Onset: {formatDate(typeof condition.onset_date === 'string' ? condition.onset_date : null)}
                            </div>
                          </div>
                          {condition.status ? <Badge variant="secondary">{String(condition.status)}</Badge> : null}
                        </div>
                        {typeof condition.description === 'string' ? <p className="mt-3 text-sm">{condition.description}</p> : null}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No synchronized conditions recorded yet.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medication History</CardTitle>
                  <CardDescription>Prescriptions written across connected providers and pharmacies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {unifiedPrescriptions.length > 0 ? (
                    unifiedPrescriptions.map((prescription) => (
                      <div key={String(prescription.id ?? prescription.medication_name)} className="rounded-2xl border border-border bg-background p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-foreground">{String(prescription.medication_name ?? 'Medication')}</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {String(prescription.dosage ?? '')} {String(prescription.dosage_unit ?? '')} · {String(prescription.frequency ?? '')}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">Provider: {String(prescription.provider_name ?? 'Unknown')}</div>
                          </div>
                          {prescription.status ? <Badge variant="secondary">{String(prescription.status)}</Badge> : null}
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground">
                          Start: {formatDate(typeof prescription.start_date === 'string' ? prescription.start_date : null)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No synchronized prescriptions recorded yet.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnostics" className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lab Results</CardTitle>
                    <CardDescription>Laboratory requests and results connected to this patient.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {unifiedLabTests.length > 0 ? (
                      unifiedLabTests.map((test) => (
                        <div key={String(test.id ?? test.test_name)} className="rounded-2xl border border-border bg-background p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold text-foreground">{String(test.test_name ?? 'Lab test')}</div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                Ordered: {formatDate(typeof test.ordered_at === 'string' ? test.ordered_at : null)}
                              </div>
                            </div>
                            {test.status ? <Badge variant="secondary">{String(test.status)}</Badge> : null}
                          </div>
                          {typeof test.result_notes === 'string' && test.result_notes ? <p className="mt-3 text-sm">{test.result_notes}</p> : null}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No synchronized lab tests recorded yet.</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Imaging</CardTitle>
                    <CardDescription>Radiology and imaging studies available in the shared record.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {unifiedImagingScans.length > 0 ? (
                      unifiedImagingScans.map((scan) => (
                        <div key={String(scan.id ?? scan.scan_type)} className="rounded-2xl border border-border bg-background p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold text-foreground">{String(scan.scan_type ?? 'Imaging study')}</div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                Ordered: {formatDate(typeof scan.ordered_at === 'string' ? scan.ordered_at : null)}
                              </div>
                            </div>
                            {scan.status ? <Badge variant="secondary">{String(scan.status)}</Badge> : null}
                          </div>
                          {typeof scan.impression === 'string' && scan.impression ? <p className="mt-3 text-sm">{scan.impression}</p> : null}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No synchronized imaging studies recorded yet.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {isPatientView ? (
              <TabsContent value="personal" className="space-y-4">
                {renderLocalHistory}
              </TabsContent>
            ) : null}
          </Tabs>
        </>
      ) : null}
    </div>
  );
};

export default MedicalHistoryPage;
