import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Thermometer, Wind, Download, Droplets, Plus, Loader, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Inbox, LineChart, Scale, CalendarClock, NotebookPen } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNotifications } from '@/contexts/useNotifications';
import { toast } from '@/components/ui/use-toast';
import type { VitalSigns } from '@/data/mockData';

const vitalMetrics = [
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', icon: Heart, normalRange: [60, 100], color: 'text-red-500' },
  { key: 'systolicBP', label: 'Systolic BP', unit: 'mm Hg', icon: Droplets, normalRange: [90, 120], color: 'text-blue-500' },
  { key: 'diastolicBP', label: 'Diastolic BP', unit: 'mm Hg', icon: Droplets, normalRange: [60, 80], color: 'text-blue-500' },
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer, normalRange: [36.5, 37.5], color: 'text-orange-500' },
  { key: 'oxygenLevel', label: 'Oxygen Level', unit: '%', icon: Wind, normalRange: [95, 100], color: 'text-cyan-500' },
  { key: 'weight', label: 'Weight', unit: 'kg', icon: Activity, normalRange: [0, 200], color: 'text-purple-500' },
];

const HealthMetricsPage = () => {
  const { user } = useAuth();
  const { vitalSigns, addVitalSigns } = useAppData();
  const { addNotification } = useNotifications();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [criticalAlerts, setCriticalAlerts] = useState<Array<{label: string; value: number; unit: string; severity: string}>>([]);
  const [formData, setFormData] = useState({
    heartRate: '',
    systolicBP: '',
    diastolicBP: '',
    temperature: '',
    oxygenLevel: '',
    weight: '',
    notes: '',
  });

  const isPatient = user?.role === 'patient';
  const userVitals = useMemo(
    () => (isPatient ? vitalSigns.filter((vital) => vital.patientId === user?.id) : []),
    [isPatient, user?.id, vitalSigns],
  );
  const sortedVitals = useMemo(
    () => [...userVitals].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [userVitals],
  );
  const latestVitals = sortedVitals[0] ?? null;

  // Vital trends
  const trends = useMemo(() => {
    if (sortedVitals.length < 2) return {};
    const latest = sortedVitals[0];
    const previous = sortedVitals[1];

    return {
      heartRate: latest.heartRate - previous.heartRate,
      systolicBP: latest.systolicBP - previous.systolicBP,
      diastolicBP: latest.diastolicBP - previous.diastolicBP,
      temperature: latest.temperature - previous.temperature,
      oxygenLevel: latest.oxygenLevel - previous.oxygenLevel,
      weight: latest.weight - previous.weight,
    };
  }, [sortedVitals]);

  const insights = useMemo(() => {
    if (!latestVitals) return null;

    const abnormalMetrics = vitalMetrics
      .map((metric) => {
        const rawValue = latestVitals[metric.key as keyof VitalSigns];
        if (typeof rawValue !== 'number') return null;

        return {
          key: metric.key,
          label: metric.label,
          status: getStatus(rawValue, metric.normalRange as [number, number]),
          value: rawValue,
          unit: metric.unit,
        };
      })
      .filter((metric): metric is { key: string; label: string; status: string; value: number; unit: string } => Boolean(metric))
      .filter((metric) => metric.status !== 'normal');

    const averageHeartRate = sortedVitals.length > 0
      ? sortedVitals.reduce((sum, vital) => sum + vital.heartRate, 0) / sortedVitals.length
      : 0;
    const averageOxygenLevel = sortedVitals.length > 0
      ? sortedVitals.reduce((sum, vital) => sum + vital.oxygenLevel, 0) / sortedVitals.length
      : 0;
    const bmi = latestVitals.weight > 0 ? latestVitals.weight / (1.7 * 1.7) : null;

    return {
      abnormalMetrics,
      averageHeartRate,
      averageOxygenLevel,
      bmi,
      latestNote: sortedVitals.find((vital) => vital.notes?.trim())?.notes?.trim() ?? null,
    };
  }, [latestVitals, sortedVitals]);

  function getStatus(value: number, range: [number, number]) {
    if (value >= range[0] && value <= range[1]) return 'normal';
    if (Math.abs(value - range[0]) <= 10 || Math.abs(value - range[1]) <= 10) return 'warning';
    return 'critical';
  }

  const handleAddVitals = async () => {
    if (!formData.heartRate || !formData.systolicBP || !formData.diastolicBP || !formData.temperature || !formData.oxygenLevel || !formData.weight) {
      setError('All vital sign fields are required');
      return;
    }

    const heartRate = Number(formData.heartRate);
    const systolicBP = Number(formData.systolicBP);
    const diastolicBP = Number(formData.diastolicBP);
    const temperature = Number(formData.temperature);
    const oxygenLevel = Number(formData.oxygenLevel);
    const weight = Number(formData.weight);

    if ([heartRate, systolicBP, diastolicBP, temperature, oxygenLevel, weight].some((value) => Number.isNaN(value) || value <= 0)) {
      setError('Enter valid numeric values greater than zero for all vital signs');
      return;
    }

    if (diastolicBP >= systolicBP) {
      setError('Diastolic blood pressure must be lower than systolic blood pressure');
      return;
    }

    // Check for critical values
    const alerts = [];
    if (systolicBP > 180 || diastolicBP > 120) alerts.push({ label: 'Blood Pressure (CRITICAL)', value: systolicBP, unit: 'mm Hg', severity: 'critical' });
    if (oxygenLevel < 90) alerts.push({ label: 'Oxygen Level (CRITICAL)', value: oxygenLevel, unit: '%', severity: 'critical' });
    if (heartRate < 40 || heartRate > 140) alerts.push({ label: 'Heart Rate (CRITICAL)', value: heartRate, unit: 'bpm', severity: 'critical' });
    if (temperature < 35.5 || temperature > 40) alerts.push({ label: 'Temperature (CRITICAL)', value: temperature, unit: '°C', severity: 'critical' });

    if (alerts.length > 0) {
      setCriticalAlerts(alerts);
      addNotification({
        title: '🚨 CRITICAL VITAL SIGNS DETECTED',
        message: `Critical values detected: ${alerts.map(a => a.label).join(', ')}. Please seek immediate medical attention or contact emergency services.`,
        type: 'alert',
        priority: 'critical',
        audience: 'personal',
      });
    }

    setIsLoading(true);
    setError('');
    try {
      const newVital: VitalSigns = {
        id: `vital-${Date.now()}`,
        patientId: user?.id || '',
        timestamp: new Date().toISOString(),
        heartRate,
        systolicBP,
        diastolicBP,
        temperature,
        oxygenLevel,
        weight,
        notes: formData.notes.trim() || undefined,
      };
      addVitalSigns(newVital);
      setFormData({ heartRate: '', systolicBP: '', diastolicBP: '', temperature: '', oxygenLevel: '', weight: '', notes: '' });
      setIsDialogOpen(false);
      toast({
        title: 'Vitals logged',
        description: 'Your latest health metrics were saved successfully.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add vital signs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportVitals = () => {
    if (sortedVitals.length === 0) {
      toast({
        title: 'Nothing to export',
        description: 'There are no vitals to export yet.',
        variant: 'destructive',
      });
      return;
    }

    const csv = [
      ['Timestamp', 'Heart Rate', 'Systolic BP', 'Diastolic BP', 'Temperature', 'Oxygen Level', 'Weight', 'Notes'].join(','),
      ...sortedVitals.map((vital) => [
        vital.timestamp,
        String(vital.heartRate),
        String(vital.systolicBP),
        String(vital.diastolicBP),
        String(vital.temperature),
        String(vital.oxygenLevel),
        String(vital.weight),
        vital.notes ?? '',
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-metrics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Health metrics exported',
      description: 'Your vitals history was downloaded as CSV.',
    });
  };

  const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } });

  if (!isPatient) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p className="text-sm">This feature is only available for patients</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {criticalAlerts.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-red-50 border-2 border-red-500">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">🚨 CRITICAL VALUES DETECTED</h3>
              <div className="space-y-1 text-sm text-red-800 mb-3">
                {criticalAlerts.map((alert, idx) => (
                  <div key={idx} className="font-medium">{alert.label}: {alert.value} {alert.unit}</div>
                ))}
              </div>
              <p className="text-sm text-red-700 font-semibold">⚠️ Please seek immediate medical attention or call emergency services (911/112)</p>
            </div>
          </div>
        </motion.div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Health Metrics</h1>
          <p className="text-muted-foreground mt-1">Track your vital signs and health indicators</p>
        </div>
        <Button variant="outline" onClick={handleExportVitals} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Log Vitals
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log Vital Signs</DialogTitle>
              <DialogDescription>Record your current vital signs</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Heart Rate (bpm)</label>
                  <Input
                    type="number"
                    placeholder="70"
                    value={formData.heartRate}
                    onChange={e => setFormData({ ...formData, heartRate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Systolic BP (mm Hg)</label>
                  <Input
                    type="number"
                    placeholder="120"
                    value={formData.systolicBP}
                    onChange={e => setFormData({ ...formData, systolicBP: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Diastolic BP (mm Hg)</label>
                  <Input
                    type="number"
                    placeholder="80"
                    value={formData.diastolicBP}
                    onChange={e => setFormData({ ...formData, diastolicBP: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Temperature (°C)</label>
                  <Input
                    type="number"
                    placeholder="37"
                    step="0.1"
                    value={formData.temperature}
                    onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Oxygen Level (%)</label>
                  <Input
                    type="number"
                    placeholder="98"
                    value={formData.oxygenLevel}
                    onChange={e => setFormData({ ...formData, oxygenLevel: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Weight (kg)</label>
                  <Input
                    type="number"
                    placeholder="70"
                    step="0.1"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                <Textarea
                  placeholder="Any additional notes..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-20 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleAddVitals} disabled={isLoading} className="gap-2">
                {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Logging...' : 'Log Vitals'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {latestVitals ? (
        <>
          {insights && (
            <div className="grid gap-3 md:grid-cols-3">
              <motion.div {...card(0)} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Latest reading
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{new Date(latestVitals.timestamp).toLocaleString()}</div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {insights.abnormalMetrics.length === 0
                    ? 'All tracked vitals are currently within the expected range.'
                    : `${insights.abnormalMetrics.length} metric${insights.abnormalMetrics.length > 1 ? 's' : ''} need attention right now.`}
                </div>
              </motion.div>
              <motion.div {...card(1)} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Heart className="h-4 w-4 text-primary" />
                  Recent averages
                </div>
                <div className="mt-3 space-y-2 text-sm text-foreground">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Heart rate</span>
                    <span>{insights.averageHeartRate.toFixed(0)} bpm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Oxygen level</span>
                    <span>{insights.averageOxygenLevel.toFixed(0)}%</span>
                  </div>
                </div>
              </motion.div>
              <motion.div {...card(2)} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Scale className="h-4 w-4 text-primary" />
                  Quick insight
                </div>
                <div className="mt-3 space-y-2 text-sm text-foreground">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Entries logged</span>
                    <span>{sortedVitals.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estimated BMI</span>
                    <span>{insights.bmi ? insights.bmi.toFixed(1) : 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Latest Vital Signs Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { key: 'heartRate', value: latestVitals.heartRate, range: [60, 100] as [number, number], icon: Heart },
              { key: 'systolicBP', value: latestVitals.systolicBP, range: [90, 120] as [number, number], icon: Droplets },
              { key: 'diastolicBP', value: latestVitals.diastolicBP, range: [60, 80] as [number, number], icon: Droplets },
              { key: 'temperature', value: latestVitals.temperature, range: [36.5, 37.5] as [number, number], icon: Thermometer },
              { key: 'oxygenLevel', value: latestVitals.oxygenLevel, range: [95, 100] as [number, number], icon: Wind },
              { key: 'weight', value: latestVitals.weight, range: [0, 200] as [number, number], icon: Activity },
            ].map((metric, i) => {
              const status = getStatus(metric.value, metric.range);
              const Icon = metric.icon;
              const trendValue = trends[metric.key as keyof typeof trends] || 0;
              const trendLabel = vitalMetrics.find(m => m.key === metric.key);

              return (
                <motion.div
                  key={metric.key}
                  {...card(i)}
                  className={`p-4 rounded-xl border transition ${
                    status === 'normal' ? 'bg-success/5 border-success/30' : status === 'warning' ? 'bg-warning/5 border-warning/30' : 'bg-destructive/5 border-destructive/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 ${status === 'normal' ? 'text-success' : status === 'warning' ? 'text-warning' : 'text-destructive'}`} />
                    {trendValue !== 0 && (
                      <span className={`flex items-center gap-0.5 text-xs font-medium ${trendValue > 0 ? 'text-warning' : 'text-success'}`}>
                        {trendValue > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trendValue).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-foreground">{metric.value.toFixed(metric.key === 'temperature' ? 1 : 0)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{trendLabel?.unit}</div>
                </motion.div>
              );
            })}
          </div>

          {insights && insights.abnormalMetrics.length > 0 && (
            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-warning">
                <AlertCircle className="h-4 w-4" />
                Review suggested
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {insights.abnormalMetrics.map((metric) => (
                  <span
                    key={metric.key}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${
                      metric.status === 'critical'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {metric.label}: {metric.value}{metric.unit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {insights?.latestNote && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <NotebookPen className="h-4 w-4 text-primary" />
                Latest note
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{insights.latestNote}</p>
            </div>
          )}

          {/* Vital History */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Vital History</h2>
            </div>
            {userVitals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Inbox className="w-10 h-10 mb-3" />
                <p className="text-sm">No vital signs logged yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Date & Time</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Heart Rate</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Blood Pressure</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Temperature</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Oxygen</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Weight</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedVitals.map((vital, i) => {
                      const hrStatus = getStatus(vital.heartRate, [60, 100]);
                      const bpStatus = getStatus(vital.systolicBP, [90, 120]);
                      const tempStatus = getStatus(vital.temperature, [36.5, 37.5]);
                      const o2Status = getStatus(vital.oxygenLevel, [95, 100]);

                      return (
                        <motion.tr
                          key={vital.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border last:border-0 hover:bg-secondary/30 transition"
                        >
                          <td className="px-5 py-4 text-sm text-foreground">{new Date(vital.timestamp).toLocaleString()}</td>
                          <td className="px-5 py-4 text-sm font-medium text-foreground">{vital.heartRate} bpm</td>
                          <td className="px-5 py-4 text-sm font-medium text-foreground">
                            {vital.systolicBP}/{vital.diastolicBP} mm Hg
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-foreground">{vital.temperature.toFixed(1)}°C</td>
                          <td className="px-5 py-4 text-sm font-medium text-foreground">{vital.oxygenLevel}%</td>
                          <td className="px-5 py-4 text-sm font-medium text-foreground">{vital.weight.toFixed(1)} kg</td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                                hrStatus === 'normal' && bpStatus === 'normal' && tempStatus === 'normal' && o2Status === 'normal'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-warning/10 text-warning'
                              }`}
                            >
                              {hrStatus === 'normal' && bpStatus === 'normal' && tempStatus === 'normal' && o2Status === 'normal' ? (
                                <>
                                  <CheckCircle className="w-3 h-3" /> Normal
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3" /> Review
                                </>
                              )}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">No vital signs logged yet. Start tracking your health!</p>
        </div>
      )}
    </div>
  );
};

export default HealthMetricsPage;
