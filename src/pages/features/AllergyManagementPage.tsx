import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, X, AlertCircle, CheckCircle, Pill, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { PatientAllergy } from '@/data/mockData';

const ALLERGY_TYPES = ['medication', 'food', 'environmental', 'latex', 'other'] as const;
const SEVERITY_LEVELS = ['mild', 'moderate', 'severe', 'life-threatening'] as const;

type AllergyType = typeof ALLERGY_TYPES[number];
type SeverityLevel = typeof SEVERITY_LEVELS[number];

const isAllergyType = (value: any): value is AllergyType => {
  return ALLERGY_TYPES.includes(value);
};

const isSeverityLevel = (value: any): value is SeverityLevel => {
  return SEVERITY_LEVELS.includes(value);
};

const AllergyManagementPage = () => {
  const { user } = useAuth();
  const { patientAllergies, prescriptions, addAllergy, removeAllergy, checkDrugInteractions } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    allergen: string;
    allergyType: AllergyType;
    severity: SeverityLevel;
    reaction: string;
    notes: string;
  }>({
    allergen: '',
    allergyType: 'medication',
    severity: 'moderate',
    reaction: '',
    notes: '',
  });

  const userAllergies = useMemo(
    () => patientAllergies.filter((allergy) => allergy.patientId === user?.id && allergy.status === 'active'),
    [patientAllergies, user?.id],
  );

  // Get current medications from prescriptions
  const currentMedications = useMemo(() => {
    return prescriptions
      .filter((p) => p.patientId === user?.id && p.status === 'active')
      .flatMap((p) => p.medications.map((m) => m.name));
  }, [prescriptions, user?.id]);

  // Check for drug interactions with current medications and medication allergies
  const medicationAlergiesAndInteractions = useMemo(() => {
    const medicationAllergies = userAllergies.filter((a) => a.allergyType === 'medication');
    const interactions = checkDrugInteractions(currentMedications);

    return {
      medicationAllergies,
      interactions: interactions.filter((int) => {
        const allergens = medicationAllergies.map((a) => a.allergen.toLowerCase());
        return (
          allergens.includes(int.drug1.toLowerCase()) || allergens.includes(int.drug2.toLowerCase())
        );
      }),
    };
  }, [userAllergies, currentMedications, checkDrugInteractions]);

  const handleAddAllergy = () => {
    if (!formData.allergen || !formData.reaction) return;

    const newAllergy: PatientAllergy = {
      id: `allergy-${Date.now()}`,
      patientId: user?.id || '',
      allergen: formData.allergen,                                  
      allergyType: formData.allergyType,
      severity: formData.severity,
      reaction: formData.reaction,
      dateIdentified: new Date().toISOString().split('T')[0],
      addedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      notes: formData.notes || undefined,
    };

    addAllergy(newAllergy);
    setFormData({
      allergen: '',
      allergyType: 'medication',
      severity: 'moderate',
      reaction: '',
      notes: '',
    });
    setShowForm(false);
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'severe':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'life-threatening':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Allergy Management</h1>
          <p className="text-muted-foreground mt-1">Manage your allergies and check for medication interactions</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Allergy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Allergy</DialogTitle>
              <DialogDescription>Document your allergies to ensure safe treatment</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium">Allergen Name</label>
                <Input
                  placeholder="e.g., Penicillin, Shellfish, Peanuts"
                  value={formData.allergen}
                  onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Allergy Type</label>
                <select
                  value={formData.allergyType}
                  onChange={(e) => {
                    if (isAllergyType(e.target.value)) {
                      setFormData({ ...formData, allergyType: e.target.value });
                    }
                  }}
                  className="w-full h-9 px-3 rounded-md border border-input mt-2"
                >
                  {ALLERGY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => {
                    if (isSeverityLevel(e.target.value)) {
                      setFormData({ ...formData, severity: e.target.value });
                    }
                  }}
                  className="w-full h-9 px-3 rounded-md border border-input mt-2"
                >
                  {SEVERITY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Reaction</label>
                <Input
                  placeholder="e.g., Rash, Difficulty breathing, Anaphylaxis"
                  value={formData.reaction}
                  onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea
                  placeholder="Any additional information about this allergy..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-2 min-h-20"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAllergy} disabled={!formData.allergen || !formData.reaction}>
                Add Allergy
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Drug Interaction Warnings */}
      {medicationAlergiesAndInteractions.interactions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Medication Interaction Detected</h3>
              <p className="text-sm text-red-800 mb-3">
                Your current medications may interact with your allergies. Please review with your healthcare provider.
              </p>
              <div className="space-y-2">
                {medicationAlergiesAndInteractions.interactions.map((interaction) => (
                  <div key={interaction.id} className="p-3 rounded-lg bg-white border border-red-100">
                    <div className="font-medium text-red-900 mb-1">
                      {interaction.drug1} + {interaction.drug2}
                    </div>
                    <div className="text-xs text-red-700 mb-2">{interaction.description}</div>
                    <div className="text-xs font-medium text-red-800">Recommendation: {interaction.management}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Allergies */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Allergies</h2>
        {userAllergies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-xl border border-border p-6">
            <Heart className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">No allergies recorded</p>
            <p className="text-xs mt-1">Keep your health information up to date</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {userAllergies.map((allergy) => (
              <motion.div
                key={allergy.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl border ${severityColor(allergy.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Pill className="w-4 h-4" />
                      <span className="font-semibold">{allergy.allergen}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-60">
                        {allergy.allergyType}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-60 font-semibold uppercase">
                        {allergy.severity}
                      </span>
                    </div>
                    <div className="text-sm mb-2">Reaction: {allergy.reaction}</div>
                    {allergy.notes && <div className="text-xs opacity-75">{allergy.notes}</div>}
                    <div className="text-xs opacity-60 mt-2">Identified: {allergy.dateIdentified}</div>
                  </div>
                  <button
                    onClick={() => removeAllergy(allergy.id)}
                    className="text-inherit hover:opacity-70 transition p-1 rounded-lg hover:bg-white hover:bg-opacity-50 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Current Medications Check */}
      {currentMedications.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Current Medications & Interaction Check</h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            {currentMedications.map((med, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm">{med}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 Your medications are being monitored for interactions with your allergies. If you notice any side effects, contact your healthcare provider immediately.
          </p>
        </div>
      )}

      {/* Safety Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">⚕️ Safety Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Always inform healthcare providers about all your allergies before starting new medications</li>
          <li>• Keep a copy of your allergy information with you at all times</li>
          <li>• Report new allergies or reactions immediately to your healthcare provider</li>
          <li>• If you have a severe allergy, consider wearing medical alert identification</li>
        </ul>
      </div>
    </div>
  );
};

export default AllergyManagementPage;
