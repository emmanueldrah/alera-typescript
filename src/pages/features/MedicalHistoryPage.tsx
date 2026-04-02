import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, X, AlertCircle, Heart, Activity, Syringe, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { PatientMedicalHistory } from '@/data/mockData';

const MedicalHistoryPage = () => {
  const { user } = useAuth();
  const { medicalHistories, addMedicalHistory, updateMedicalHistory } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'condition' | 'surgery' | 'family' | 'vaccination'>('condition');
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    notes: '',
    relation: '', // for family history
    surgeon: '', // for surgeries
    hospital: '', // for surgeries
  });

  const userMedicalHistory = useMemo(
    () => medicalHistories.find((mh) => mh.patientId === user?.id),
    [medicalHistories, user?.id],
  );

  const handleAddHistoryItem = () => {
    if (!userMedicalHistory) {
      // Create new medical history if it doesn't exist
      const newHistory: PatientMedicalHistory = {
        id: `mh-${Date.now()}`,
        patientId: user?.id ?? '',
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
      // Update existing history
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
        } else if (formType === 'surgery' && formData.name) {
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
        } else if (formType === 'family' && formData.name) {
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
        } else if (formType === 'vaccination' && formData.name) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Medical History & EHR</h1>
          <p className="text-muted-foreground mt-1">Your comprehensive electronic health record</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Medical History</DialogTitle>
              <DialogDescription>Document important medical information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium">Record Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as 'condition' | 'surgery' | 'family' | 'vaccination')}
                  className="w-full h-9 px-3 rounded-md border border-input mt-2"
                >
                  <option value="condition">Medical Condition</option>
                  <option value="surgery">Surgery</option>
                  <option value="family">Family History</option>
                  <option value="vaccination">Vaccination</option>
                </select>
              </div>

              {formType === 'condition' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Condition Name</label>
                    <Input
                      placeholder="e.g., Diabetes, Hypertension"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date of Onset</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      placeholder="Any additional notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              {formType === 'surgery' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Surgery Type</label>
                    <Input
                      placeholder="e.g., Appendectomy"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Surgeon</label>
                    <Input
                      placeholder="Surgeon's name"
                      value={formData.surgeon}
                      onChange={(e) => setFormData({ ...formData, surgeon: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hospital</label>
                    <Input
                      placeholder="Hospital name"
                      value={formData.hospital}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      placeholder="Surgery details..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              {formType === 'family' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Relation to Patient</label>
                    <select
                      value={formData.relation}
                      onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                      className="w-full h-9 px-3 rounded-md border border-input mt-2"
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
                    <Input
                      placeholder="e.g., Heart Disease, Cancer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              {formType === 'vaccination' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Vaccination Name</label>
                    <Input
                      placeholder="e.g., COVID-19, Flu"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Provider</label>
                    <Input
                      placeholder="Healthcare provider"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddHistoryItem} disabled={!formData.name}>
                Add Record
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!userMedicalHistory ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-xl border border-border p-6">
          <FileText className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">No medical history recorded yet</p>
          <p className="text-xs mt-1">Start building your EHR by adding medical records</p>
        </div>
      ) : (
        <>
          {/* Active Conditions */}
          {userMedicalHistory.conditions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" /> Medical Conditions
              </h2>
              <div className="grid gap-3">
                {userMedicalHistory.conditions.map((condition, idx) => (
                  <motion.div
                    key={condition.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-xl border ${
                      condition.status === 'active'
                        ? 'bg-red-50 border-red-200'
                        : condition.status === 'chronic'
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{condition.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {condition.status === 'active'
                            ? 'Ongoing'
                            : condition.status === 'chronic'
                              ? 'Chronic'
                              : 'Resolved'}{' '}
                          since {condition.dateOnset}
                        </div>
                        {condition.notes && <p className="text-sm mt-2">{condition.notes}</p>}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          condition.status === 'active'
                            ? 'bg-red-100 text-red-800'
                            : condition.status === 'chronic'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {condition.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Surgeries */}
          {userMedicalHistory.surgeries.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Surgical History
              </h2>
              <div className="grid gap-3">
                {userMedicalHistory.surgeries.map((surgery, idx) => (
                  <motion.div
                    key={surgery.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="font-semibold mb-2">{surgery.name}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Date:</span> {surgery.date}
                      </div>
                      <div>
                        <span className="font-medium">Surgeon:</span> {surgery.surgeon}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Hospital:</span> {surgery.hospital}
                      </div>
                    </div>
                    {surgery.notes && <p className="text-sm mt-2 pt-2 border-t border-border">{surgery.notes}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Vaccinations */}
          {userMedicalHistory.vaccinations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Syringe className="w-5 h-5 text-primary" /> Vaccinations
              </h2>
              <div className="grid gap-3">
                {userMedicalHistory.vaccinations.map((vaccine, idx) => (
                  <motion.div
                    key={vaccine.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-xl border border-border bg-green-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-green-900 mb-1">{vaccine.name}</div>
                        <div className="text-sm text-green-800">Date: {vaccine.date}</div>
                        {vaccine.provider && <div className="text-sm text-green-800">Provider: {vaccine.provider}</div>}
                        {vaccine.nextDue && <div className="text-sm text-green-700">Next due: {vaccine.nextDue}</div>}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">Completed</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Family History */}
          {userMedicalHistory.familyHistory.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Family History
              </h2>
              <div className="grid gap-3">
                {userMedicalHistory.familyHistory.map((fh, idx) => (
                  <motion.div
                    key={fh.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-xl border border-border bg-purple-50"
                  >
                    <div className="font-semibold text-purple-900">{fh.condition}</div>
                    <div className="text-sm text-purple-700 mt-1">Relation: {fh.relation}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Info message if no data */}
          {userMedicalHistory.conditions.length === 0 &&
            userMedicalHistory.surgeries.length === 0 &&
            userMedicalHistory.vaccinations.length === 0 &&
            userMedicalHistory.familyHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-xl border border-border p-6">
                <FileText className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm">No medical history recorded yet</p>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default MedicalHistoryPage;
