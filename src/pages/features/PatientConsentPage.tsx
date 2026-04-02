import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, FileText, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { PatientConsent } from '@/data/mockData';

const CONSENT_TYPES = ['hipaa', 'research', 'treatment', 'medication', 'procedure'] as const;

const PatientConsentPage = () => {
  const { user } = useAuth();
  const { patientConsents, addPatientConsent, updatePatientConsent } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    consentType: 'hipaa' as typeof CONSENT_TYPES[number],
    consentText: '',
  });

  const userConsents = useMemo(
    () => patientConsents.filter((c) => c.patientId === user?.id),
    [patientConsents, user?.id],
  );

  const activeConsents = useMemo(() => userConsents.filter((c) => c.status === 'active'), [userConsents]);
  const revokedConsents = useMemo(() => userConsents.filter((c) => c.status === 'revoked'), [userConsents]);
  const expiredConsents = useMemo(() => userConsents.filter((c) => c.status === 'expired'), [userConsents]);

  const handleAddConsent = () => {
    if (!formData.consentType) return;

    const newConsent: PatientConsent = {
      id: `consent-${Date.now()}`,
      patientId: user?.id ?? '',
      consentType: formData.consentType,
      consentedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      consentText: formData.consentText || undefined,
    };

    addPatientConsent(newConsent);
    setFormData({ consentType: 'hipaa', consentText: '' });
    setShowForm(false);
  };

  const handleRevokeConsent = (id: string) => {
    updatePatientConsent(id, (consent) => ({
      ...consent,
      status: 'revoked',
      revokedDate: new Date().toISOString().split('T')[0],
      revokedReason: 'Patient revoked consent',
    }));
  };

  const getConsentDescription = (type: typeof CONSENT_TYPES[number]) => {
    const descriptions: Record<typeof CONSENT_TYPES[number], string> = {
      hipaa: 'Authorization for healthcare providers to access and share my medical information',
      research: 'Permission to use my health data for approved medical research',
      treatment: 'Consent for medical treatment and procedures',
      medication: 'Authorization to prescribe medications',
      procedure: 'Consent for specific medical procedures',
    };
    return descriptions[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Patient Consent & Privacy</h1>
          <p className="text-muted-foreground mt-1">Manage your healthcare authorizations and privacy preferences</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Give Consent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provide Healthcare Consent</DialogTitle>
              <DialogDescription>Authorize healthcare services and information sharing</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium">Consent Type</label>
                <select
                  value={formData.consentType}
                  onChange={(e) => setFormData({ ...formData, consentType: e.target.value as typeof CONSENT_TYPES[number] })}
                  className="w-full h-9 px-3 rounded-md border border-input mt-2"
                >
                  {CONSENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)} Consent
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-2">{getConsentDescription(formData.consentType)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Additional Details (Optional)</label>
                <Textarea
                  placeholder="Add any specific conditions or limitations to this consent..."
                  value={formData.consentText}
                  onChange={(e) => setFormData({ ...formData, consentText: e.target.value })}
                  className="mt-2 min-h-20"
                />
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-900">
                  By providing consent, you authorize your healthcare providers to access and manage your medical information in accordance with HIPAA regulations.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddConsent}>
                Provide Consent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Consents */}
      {activeConsents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" /> Active Consents
          </h2>
          <div className="grid gap-3">
            {activeConsents.map((consent, idx) => (
              <motion.div
                key={consent.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl border border-green-200 bg-green-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-green-900 mb-1">
                      {consent.consentType.charAt(0).toUpperCase() + consent.consentType.slice(1)} Consent
                    </div>
                    <p className="text-sm text-green-800 mb-2">{getConsentDescription(consent.consentType as typeof CONSENT_TYPES[number])}</p>
                    {consent.consentText && <p className="text-xs text-green-700 italic">{consent.consentText}</p>}
                    <div className="text-xs text-green-700 mt-2">Consented on {consent.consentedDate}</div>
                    {consent.expiryDate && <div className="text-xs text-green-700">Expires: {consent.expiryDate}</div>}
                  </div>
                  <button
                    onClick={() => handleRevokeConsent(consent.id)}
                    className="px-3 py-1 rounded-lg text-xs font-medium text-green-900 hover:bg-green-100 transition shrink-0"
                  >
                    Revoke
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Revoked Consents */}
      {revokedConsents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" /> Revoked Consents
          </h2>
          <div className="grid gap-3">
            {revokedConsents.map((consent, idx) => (
              <motion.div
                key={consent.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl border border-red-200 bg-red-50 opacity-60"
              >
                <div>
                  <div className="font-semibold text-red-900 mb-1">
                    {consent.consentType.charAt(0).toUpperCase() + consent.consentType.slice(1)} Consent (Revoked)
                  </div>
                  <div className="text-xs text-red-700">
                    Revoked on {consent.revokedDate}
                    {consent.revokedReason && ` - ${consent.revokedReason}`}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Your Privacy Rights Under HIPAA
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>✓ You have the right to access your medical records</li>
          <li>✓ You can request corrections to your health information</li>
          <li>✓ You can limit who sees your medical information</li>
          <li>✓ You can request an accounting of disclosures</li>
          <li>✓ You can revoke consent at any time, except for actions already taken</li>
          <li>✓ Your healthcare provider must protect your privacy</li>
        </ul>
      </div>

      {/* No Consents State */}
      {activeConsents.length === 0 && revokedConsents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-xl border border-border p-6">
          <FileText className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">No active consents found</p>
          <p className="text-xs mt-1">Provide consent to authorize healthcare services</p>
        </div>
      )}

      {/* Legal Notice */}
      <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
        <p>
          <strong>Legal Notice:</strong> This application manages healthcare consent in accordance with HIPAA (Health Insurance Portability and Accountability Act).
          All patient consents are recorded for compliance and audit purposes.
        </p>
      </div>
    </div>
  );
};

export default PatientConsentPage;
