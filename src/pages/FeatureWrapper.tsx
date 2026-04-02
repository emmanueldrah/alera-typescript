import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/useAuth';
import { canAccessFeature, featureAccessMap } from '@/lib/featureAccess';
import AppointmentsPage from '@/pages/features/AppointmentsPage';
import PrescriptionsPage from '@/pages/features/PrescriptionsPage';
import LabResultsPage from '@/pages/features/LabResultsPage';
import ImagingPage from '@/pages/features/ImagingPage';
import AmbulancePage from '@/pages/features/AmbulancePage';
import TimelinePage from '@/pages/features/TimelinePage';
import InventoryPage from '@/pages/features/InventoryPage';
import VehiclesPage from '@/pages/features/VehiclesPage';
import UsersPage from '@/pages/features/UsersPage';
import ProfilePage from '@/pages/features/ProfilePage';
import VerificationsPage from '@/pages/features/VerificationsPage';
import AnalyticsPage from '@/pages/features/AnalyticsPage';
import PatientsPage from '@/pages/features/PatientsPage';
import DoctorsPage from '@/pages/features/DoctorsPage';
import ReferralsPage from '@/pages/features/ReferralsPage';
import MessagesPage from '@/pages/features/MessagesPage';
import HealthMetricsPage from '@/pages/features/HealthMetricsPage';
import NotificationCenterPage from '@/pages/features/NotificationCenterPage';
import AppointmentRemindersPage from '@/pages/features/AppointmentRemindersPage';
import AllergyManagementPage from '@/pages/features/AllergyManagementPage';
import PrescriptionRefillPage from '@/pages/features/PrescriptionRefillPage';
import MedicalHistoryPage from '@/pages/features/MedicalHistoryPage';
import PatientConsentPage from '@/pages/features/PatientConsentPage';
import ClinicalNotesPage from '@/pages/features/ClinicalNotesPage';
import PatientProblemListPage from '@/pages/features/PatientProblemListPage';
import MedicationAdherencePage from '@/pages/features/MedicationAdherencePage';
import LabResultsManagementPage from '@/pages/features/LabResultsManagementPage';
import { SmartAppointmentRemindersPage } from '@/pages/features/SmartAppointmentRemindersPage';
import PricingSettingsPage from '@/pages/features/PricingSettingsPage';
import BillingPage from '@/pages/features/BillingPage';
import AdminBillingDashboard from '@/pages/features/AdminBillingDashboard';

interface FeatureWrapperProps {
  page: string;
}

interface FeatureConfig {
  component: React.ComponentType;
}

const pageMap: Record<string, FeatureConfig> = {
  appointments: { component: AppointmentsPage },
  prescriptions: { component: PrescriptionsPage },
  'lab-results': { component: LabResultsPage },
  'lab-referrals': { component: LabResultsPage },
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
  referrals: { component: ReferralsPage },
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
      <Page />
    </DashboardLayout>
  );
};

export default FeatureWrapper;
