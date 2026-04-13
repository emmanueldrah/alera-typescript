import { lazy, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import RouteLoader from '@/components/RouteLoader';
import { useAuth } from '@/contexts/useAuth';
import { canAccessFeature, featureAccessMap } from '@/lib/featureAccess';
import type { ReferralKind } from '@/lib/referralUtils';

const AppointmentsPage = lazy(() => import('@/pages/features/AppointmentsPage'));
const PrescriptionsPage = lazy(() => import('@/pages/features/PrescriptionsPage'));
const LabResultsPage = lazy(() => import('@/pages/features/LabResultsPage'));
const ImagingPage = lazy(() => import('@/pages/features/ImagingPage'));
const AmbulancePage = lazy(() => import('@/pages/features/AmbulancePage'));
const TimelinePage = lazy(() => import('@/pages/features/TimelinePage'));
const InventoryPage = lazy(() => import('@/pages/features/InventoryPage'));
const VehiclesPage = lazy(() => import('@/pages/features/VehiclesPage'));
const UsersPage = lazy(() => import('@/pages/features/UsersPage'));
const ProfilePage = lazy(() => import('@/pages/features/ProfilePage'));
const VerificationsPage = lazy(() => import('@/pages/features/VerificationsPage'));
const AnalyticsPage = lazy(() => import('@/pages/features/AnalyticsPage'));
const PatientsPage = lazy(() => import('@/pages/features/PatientsPage'));
const DoctorsPage = lazy(() => import('@/pages/features/DoctorsPage'));
const ReferralsPage = lazy(() => import('@/pages/features/ReferralsPage'));
const MessagesPage = lazy(() => import('@/pages/features/MessagesPage'));
const HealthMetricsPage = lazy(() => import('@/pages/features/HealthMetricsPage'));
const NotificationCenterPage = lazy(() => import('@/pages/features/NotificationCenterPage'));
const AppointmentRemindersPage = lazy(() => import('@/pages/features/AppointmentRemindersPage'));
const AllergyManagementPage = lazy(() => import('@/pages/features/AllergyManagementPage'));
const PrescriptionRefillPage = lazy(() => import('@/pages/features/PrescriptionRefillPage'));
const MedicalHistoryPage = lazy(() => import('@/pages/features/MedicalHistoryPage'));
const PatientConsentPage = lazy(() => import('@/pages/features/PatientConsentPage'));
const ClinicalNotesPage = lazy(() => import('@/pages/features/ClinicalNotesPage'));
const PatientProblemListPage = lazy(() => import('@/pages/features/PatientProblemListPage'));
const MedicationAdherencePage = lazy(() => import('@/pages/features/MedicationAdherencePage'));
const LabResultsManagementPage = lazy(() => import('@/pages/features/LabResultsManagementPage'));
const SmartAppointmentRemindersPage = lazy(() =>
  import('@/pages/features/SmartAppointmentRemindersPage').then((module) => ({ default: module.SmartAppointmentRemindersPage }))
);
const PricingSettingsPage = lazy(() => import('@/pages/features/PricingSettingsPage'));
const BillingPage = lazy(() => import('@/pages/features/BillingPage'));
const AdminBillingDashboard = lazy(() => import('@/pages/features/AdminBillingDashboard'));
const AuditLogsPage = lazy(() => import('@/pages/features/AuditLogsPage'));
const CreateAdminPage = lazy(() => import('@/pages/features/CreateAdminPage'));

interface FeatureWrapperProps {
  page: string;
}

interface FeatureConfig {
  component: React.ComponentType<Record<string, unknown>>;
  /** Passed to pages that need route-specific props (e.g. referral queue). */
  props?: Record<string, unknown>;
}

const pageMap: Record<string, FeatureConfig> = {
  appointments: { component: AppointmentsPage },
  prescriptions: { component: PrescriptionsPage },
  'lab-results': { component: LabResultsPage },
  'lab-referrals': { component: ReferralsPage, props: { referralKind: 'laboratory' as ReferralKind } },
  'test-requests': { component: LabResultsPage },
  imaging: { component: ImagingPage },
  'imaging-referrals': { component: ImagingPage },
  'scan-requests': { component: ImagingPage },
  ambulance: { component: AmbulancePage },
  requests: { component: AmbulancePage },
  timeline: { component: TimelinePage },
  inventory: { component: InventoryPage },
  vehicles: { component: VehiclesPage },
  users: { component: UsersPage },
  profile: { component: ProfilePage },
  verifications: { component: VerificationsPage },
  analytics: { component: AnalyticsPage },
  patients: { component: PatientsPage },
  doctors: { component: DoctorsPage },
  referrals: { component: ReferralsPage, props: { referralKind: 'hospital' as ReferralKind } },
  'pharmacy-referrals': { component: ReferralsPage, props: { referralKind: 'pharmacy' as ReferralKind } },
  results: { component: LabResultsPage },
  messages: { component: MessagesPage },
  'health-metrics': { component: HealthMetricsPage },
  notifications: { component: NotificationCenterPage },
  'appointment-reminders': { component: AppointmentRemindersPage },
  allergies: { component: AllergyManagementPage },
  'prescription-refills': { component: PrescriptionRefillPage },
  'medical-history': { component: MedicalHistoryPage },
  consent: { component: PatientConsentPage },
  'clinical-notes': { component: ClinicalNotesPage },
  'problem-list': { component: PatientProblemListPage },
  'medication-adherence': { component: MedicationAdherencePage },
  'lab-results-management': { component: LabResultsManagementPage },
  'smart-appointment-reminders': { component: SmartAppointmentRemindersPage },
  'pricing-settings': { component: PricingSettingsPage },
  billing: { component: BillingPage },
  'admin-billing': { component: AdminBillingDashboard },
  audit: { component: AuditLogsPage },
  'admin/create': { component: CreateAdminPage },
};

const FeatureWrapper = ({ page }: FeatureWrapperProps) => {
  const { user } = useAuth();
  const config = pageMap[page];
  const Page = page === 'results' && user?.role === 'imaging' ? ImagingPage : config?.component;

  if (!config) return <DashboardLayout><div className="text-center py-12 text-muted-foreground">Page not found</div></DashboardLayout>;
  if (!canAccessFeature(page, user?.role)) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-muted-foreground">You do not have access to this page.</div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <Suspense fallback={<RouteLoader compact label="Loading workspace..." />}>
        <Page {...(config.props ?? {})} />
      </Suspense>
    </DashboardLayout>
  );
};

export default FeatureWrapper;
