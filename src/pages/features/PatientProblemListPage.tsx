import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, X, Pill, AlertCircle, CheckCircle, Inbox, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { PatientProblem } from '@/data/mockData';

const problemSeverities = ['mild', 'moderate', 'severe'] as const;

const PatientProblemListPage = () => {
  const { user } = useAuth();
  const { patientProblems, addPatientProblem, updatePatientProblem } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('active');
  const [formData, setFormData] = useState({
    problem: '',
    icd10Code: '',
    severity: 'moderate' as typeof problemSeverities[number],
    notes: '',
  });

  const userProblems = useMemo(
    () => patientProblems.filter((p) => p.patientId === user?.id),
    [patientProblems, user?.id]
  );

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return userProblems;
    return userProblems.filter((p) => p.status === statusFilter);
  }, [userProblems, statusFilter]);

  const activeProblems = useMemo(
    () => userProblems.filter((p) => p.status === 'active'),
    [userProblems]
  );

  const resolvedProblems = useMemo(
    () => userProblems.filter((p) => p.status === 'resolved'),
    [userProblems]
  );

  const handleAddProblem = () => {
    if (!formData.problem) return;

    const newProblem: PatientProblem = {
      id: `prob-${Date.now()}`,
      patientId: user?.id || '',
      problem: formData.problem,
      icd10Code: formData.icd10Code || undefined,
      dateIdentified: new Date().toISOString().split('T')[0],
      status: 'active',
      severity: formData.severity,
      notes: formData.notes || undefined,
    };

    addPatientProblem(newProblem);
    setFormData({ problem: '', icd10Code: '', severity: 'moderate', notes: '' });
    setShowForm(false);
  };

  const handleResolveProblem = (id: string) => {
    updatePatientProblem(id, (p: PatientProblem) => ({ ...p, status: 'resolved' as const }));
  };

  const handleReactivateProblem = (id: string) => {
    updatePatientProblem(id, (p: PatientProblem) => ({ ...p, status: 'active' as const }));
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'mild':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'severe':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe':
        return <AlertCircle className="w-4 h-4" />;
      case 'moderate':
        return <Heart className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Problem List</h1>
          <p className="text-muted-foreground mt-1">Track your active health problems and conditions</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Problem
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Add Health Problem</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Problem/Condition</label>
              <Input
                placeholder="e.g., Type 2 Diabetes, Hypertension, Asthma"
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">ICD-10 Code (optional)</label>
              <Input
                placeholder="e.g., E11 for Type 2 Diabetes"
                value={formData.icd10Code}
                onChange={(e) => setFormData({ ...formData, icd10Code: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as typeof problemSeverities[number] })}
                className="w-full h-10 px-3 rounded-lg border border-border mt-1"
              >
                {problemSeverities.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Additional notes about this condition..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 min-h-20"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleAddProblem} disabled={!formData.problem}>
                Add Problem
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-4">
          <div className="text-muted-foreground text-xs font-medium">Total</div>
          <div className="text-2xl font-bold text-foreground mt-1">{userProblems.length}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="text-red-600 text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Active
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">{activeProblems.length}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="text-green-600 text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Resolved
          </div>
          <div className="text-2xl font-bold text-green-600 mt-1">{resolvedProblems.length}</div>
        </motion.div>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as ProblemStatus)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
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
          <p className="text-sm">{statusFilter === 'active' ? 'No active problems' : 'No resolved problems'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((problem, idx) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-2xl border p-4 ${getSeverityColor(problem.severity)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-current/10 text-current flex items-center justify-center shrink-0 mt-0.5">
                    {getSeverityIcon(problem.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{problem.problem}</h3>
                    {problem.icd10Code && (
                      <p className="text-xs text-muted-foreground mt-0.5">ICD-10: {problem.icd10Code}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {problem.severity.charAt(0).toUpperCase() + problem.severity.slice(1)} • Identified: {problem.dateIdentified}
                    </p>
                    {problem.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{problem.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {problem.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveProblem(problem.id)}
                      className="text-xs"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReactivateProblem(problem.id)}
                      className="text-xs"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" /> Reactivate
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientProblemListPage;
