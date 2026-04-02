import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Plus, X, Eye, Edit2, FileText, Calendar, Pill, ArrowRight, Inbox } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ClinicalNote } from '@/data/mockData';

const noteTypes = ['visit', 'consultation', 'follow-up', 'procedure'] as const;
const noteStatuses = ['draft', 'completed', 'signed'] as const;

const ClinicalNotesPage = () => {
  const { user } = useAuth();
  const { clinicalNotes, addClinicalNote, updateClinicalNote, patientProblems } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [formData, setFormData] = useState({
    patientId: '',
    type: 'visit' as typeof noteTypes[number],
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const userNotes = useMemo(
    () => user?.role === 'doctor' 
      ? clinicalNotes.filter((note) => note.doctorId === user?.id)
      : clinicalNotes.filter((note) => note.patientId === user?.id),
    [clinicalNotes, user?.id, user?.role]
  );

  const sortedNotes = useMemo(
    () => [...userNotes].sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()),
    [userNotes]
  );

  const handleAddNote = () => {
    if (!formData.patientId || !formData.subjective || !formData.objective || !formData.assessment || !formData.plan) {
      return;
    }

    const newNote: ClinicalNote = {
      id: `note-${Date.now()}`,
      patientId: formData.patientId,
      doctorId: user?.id || '',
      doctorName: user?.name || '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }),
      type: formData.type,
      subjective: formData.subjective,
      objective: formData.objective,
      assessment: formData.assessment,
      plan: formData.plan,
      status: 'draft',
    };

    addClinicalNote(newNote);
    setFormData({ patientId: '', type: 'visit', subjective: '', objective: '', assessment: '', plan: '' });
    setShowForm(false);
  };

  const handleSignNote = (id: string) => {
    updateClinicalNote(id, (note) => ({ ...note, status: 'signed' }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'bg-blue-50 border-blue-200';
      case 'signed':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-card border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Clinical Notes</h1>
          <p className="text-muted-foreground mt-1">{user?.role === 'doctor' ? 'Record visit notes and care plans' : 'Review your clinical notes'}</p>
        </div>
        {user?.role === 'doctor' && (
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> New Note
          </Button>
        )}
      </div>

      {showForm && user?.role === 'doctor' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border p-6 ${getStatusColor('draft')}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Create Clinical Note</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Note Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof noteTypes[number] })}
                className="w-full h-10 px-3 rounded-lg border border-border mt-1"
              >
                {noteTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Subjective (Chief Complaints & History)</label>
              <Textarea
                placeholder="Patient-reported symptoms and history..."
                value={formData.subjective}
                onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                className="mt-1 min-h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Objective (Exam & Findings)</label>
              <Textarea
                placeholder="Vital signs, physical exam findings, test results..."
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="mt-1 min-h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Assessment (Diagnosis & Impression)</label>
              <Textarea
                placeholder="Clinical diagnosis and medical impressions..."
                value={formData.assessment}
                onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                className="mt-1 min-h-20"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Plan (Treatment & Next Steps)</label>
              <Textarea
                placeholder="Treatment plan, medications, referrals, follow-up..."
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="mt-1 min-h-20"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleAddNote} disabled={!formData.subjective || !formData.objective || !formData.assessment || !formData.plan}>
                Save as Draft
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {selectedNote && viewMode === 'view' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border p-6 ${getStatusColor(selectedNote.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">View Note</h2>
              <p className="text-sm text-muted-foreground mt-1">{selectedNote.date} at {selectedNote.time}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedNote(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Subjective</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedNote.subjective}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Objective</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedNote.objective}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Assessment</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedNote.assessment}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Plan</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedNote.plan}</p>
            </div>

            {user?.role === 'doctor' && selectedNote.doctorId === user?.id && selectedNote.status !== 'signed' && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedNote(null)}>Close</Button>
                <Button onClick={() => handleSignNote(selectedNote.id)}>Sign Note</Button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          <FileText className="w-10 h-10 mb-3" />
          <p className="text-sm">{user?.role === 'doctor' ? 'No clinical notes yet' : 'No notes available'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-2xl border p-4 cursor-pointer transition hover:border-primary/50 ${getStatusColor(note.status)}`}
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{note.type.charAt(0).toUpperCase() + note.type.slice(1)} Note</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        note.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        note.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{note.doctorName} • {note.date} at {note.time}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{note.subjective}</p>
                  </div>
                </div>
                <Eye className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClinicalNotesPage;
