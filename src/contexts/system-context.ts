import { SystemSettings } from '@/lib/apiService';

export interface SystemContextType {
  settings: SystemSettings | null;
  isLoading: boolean;
  isMaintenanceMode: boolean;
  bannerVisible: boolean;
  closeBanner: () => void;
  refreshSettings: () => Promise<void>;
}
