import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, X, Calendar, TrendingUp, Pill, Activity, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import type { MedicationAdherence } from '@/data/mockData';

const MedicationAdherencePage: React.FC = () => {
  const { user } = useAuth();
  const { medicationAdherence, recordMedicationAdherence, prescriptions } = useAppData();
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const patientId = user?.role === 'patient' ? user.id : '';

  const patientAdherence = medicationAdherence.filter((a) => a.patientId === patientId);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patientId);

  const [formData, setFormData] = useState({
    prescriptionId: selectedPrescription || '',
    medicationName: '',
    tookDose: true,
    notes: '',
  });

  // Calculate overall statistics
  const stats = useMemo(() => {
    const overall = patientAdherence.length > 0
      ? (patientAdherence.reduce((sum, a) => sum + a.adherencePercentage, 0) / patientAdherence.length)
      : 0;
    const poor = patientAdherence.filter((a) => a.adherencePercentage < 80).length;
    const excellent = patientAdherence.filter((a) => a.adherencePercentage >= 95).length;

    return {
      totalMedications: patientAdherence.length,
      overallAdherence: Math.round(overall),
      poorAdherence: poor,
      excellentAdherence: excellent,
    };
  }, [patientAdherence]);

  const handleRecordAdherence = () => {
    if (!patientId) {
      alert('No patient is signed in');
      return;
    }
    if (!formData.prescriptionId || !formData.medicationName) {
      alert('Please select a prescription and enter medication name');
      return;
    }

    const newAdherence: MedicationAdherence = {
      id: `adh-${Date.now()}`,
      patientId,
      prescriptionId: formData.prescriptionId,
      medicationName: formData.medicationName,
      startDate: new Date().toISOString().split('T')[0],
      adherencePercentage: formData.tookDose ? 100 : 0,
      missedDoses: formData.tookDose ? 0 : 1,
      totalDoses: 1,
      lastDoseDate: formData.tookDose ? new Date().toISOString().split('T')[0] : undefined,
      notes: formData.notes || undefined,
    };

    recordMedicationAdherence(newAdherence);
    setFormData({ prescriptionId: selectedPrescription || '', medicationName: '', tookDose: true, notes: '' });
    setShowForm(false);
  };

  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 95) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAdherenceLabel = (percentage: number) => {
    if (percentage >= 95) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 60) return 'Fair';
    return 'Poor';
  };

  const card = (index: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05 },
  });

  const filteredAdherence = selectedPrescription
    ? patientAdherence.filter((a) => a.prescriptionId === selectedPrescription)
    : patientAdherence;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medication Adherence</h1>
          <p className="text-muted-foreground mt-1">Track your daily medication compliance</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Record Dose
          </Button>
        )}
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div {...card(0)} className="bg-card rounded-xl border border-border p-4">
          <div className="text-muted-foreground text-xs font-medium">Medications</div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.totalMedications}</div>
        </motion.div>

        <motion.div {...card(1)} className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="text-blue-600 text-xs font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Overall
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{stats.overallAdherence}%</div>
        </motion.div>

        <motion.div {...card(2)} className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
          <div className="text-emerald-600 text-xs font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            Excellent
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.excellentAdherence}</div>
        </motion.div>

        <motion.div {...card(3)} className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="text-red-600 text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Needs Help
          </div>
          <div className="text-2xl font-bold text-red-700 mt-1">{stats.poorAdherence}</div>
        </motion.div>
      </div>

      {/* Alert for Poor Adherence */}
      {stats.poorAdherence > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-orange-900">Adherence Alert</h3>
            <p className="text-sm text-orange-700 mt-1">
              {stats.poorAdherence} medication(s) with adherence below 80%. Missing doses can reduce treatment effectiveness.
            </p>
          </div>
        </motion.div>
      )}

      {/* Add Adherence Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold text-foreground">Record Dose</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Select Prescription</label>
              <select
                value={formData.prescriptionId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    prescriptionId: e.target.value,
                  }))
                }
                className="w-full h-11 px-4 rounded-xl border border-input bg-background mt-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Choose medication...</option>
                {patientPrescriptions.map((rx) => (
                  <option key={rx.id} value={rx.id}>
                    {rx.medications[0]?.name || 'Unknown'} - {rx.medications[0]?.dosage || ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Medication Name</label>
              <input
                type="text"
                value={formData.medicationName}
                onChange={(e) => setFormData((prev) => ({ ...prev, medicationName: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background mt-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g., Aspirin 500mg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Did You Take Your Dose?</label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={formData.tookDose ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, tookDose: true }))}
                  className="flex-1 gap-2"
                >
                  <Check className="w-4 h-4" />
                  Yes
                </Button>
                <Button
                  variant={!formData.tookDose ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, tookDose: false }))}
                  className="flex-1 gap-2"
                >
                  <X className="w-4 h-4" />
                  No
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background mt-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g., Took with food"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleRecordAdherence} className="flex-1">
              Save Record
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={!selectedPrescription ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPrescription(null)}
          className="whitespace-nowrap"
        >
          All Medications
        </Button>
        {patientPrescriptions.map((rx) => (
          <Button
            key={rx.id}
            variant={selectedPrescription === rx.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPrescription(rx.id)}
            className="whitespace-nowrap"
          >
            {rx.medications[0]?.name || 'Medication'}
          </Button>
        ))}
      </div>

      {/* Adherence Records */}
      {filteredAdherence.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          <Pill className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">{patientAdherence.length === 0 ? 'No adherence records yet' : 'No records for this medication'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAdherence.map((adherence, i) => (
            <motion.div
              key={adherence.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border p-4 ${getAdherenceColor(adherence.adherencePercentage)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{adherence.medicationName}</h3>
                  <p className="text-sm opacity-90 mt-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Started: {new Date(adherence.startDate).toLocaleDateString()}
                  </p>

                  {adherence.lastDoseDate && (
                    <p className="text-sm opacity-90 mt-1">
                      Last dose: {new Date(adherence.lastDoseDate).toLocaleDateString()}
                    </p>
                  )}

                  {adherence.notes && <p className="text-sm opacity-90 mt-2 italic">"{adherence.notes}"</p>}
                </div>

                <div className="text-right ml-4">
                  <div className="text-3xl font-bold">{adherence.adherencePercentage}%</div>
                  <p className="text-sm font-medium opacity-90 mt-1">{getAdherenceLabel(adherence.adherencePercentage)}</p>

                  <div className="text-xs opacity-75 mt-2">
                    {adherence.missedDoses > 0 && <p>{adherence.missedDoses} dose(s) missed</p>}
                    <p>{adherence.totalDoses} total doses</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2 rounded-full bg-black/10 overflow-hidden">
                <div
                  className="h-full bg-current transition-all duration-500"
                  style={{ width: `${adherence.adherencePercentage}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Education Box */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex gap-3">
        <Activity className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Why Adherence Matters</h3>
          <p className="text-sm text-blue-700">
            Taking medications as prescribed is crucial for treatment effectiveness. An adherence rate of 80% or higher is generally recommended for most medications. 
            If you're having trouble remembering doses, ask your doctor about reminder options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicationAdherencePage;
