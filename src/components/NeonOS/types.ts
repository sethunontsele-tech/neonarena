export type NeonAppId = 
  | 'desktop'
  | 'app_manager'
  | 'emperor'
  | 'toolbox'
  | 'gaming'
  | 'vr_spatial'
  | 'storage_arch'
  | 'cloud'
  | 'neon_ai'
  | 'creator_studio'
  | 'browser'
  | 'communication'
  | 'files'
  | 'security'
  | 'cross_device'
  | 'marketplace'
  | 'user_profile'
  | 'system_controls'
  | 'plugins';

export interface NeonWindow {
  id: string;
  appId: NeonAppId;
  title: string;
  iconName: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface StorageDrive {
  id: string;
  name: string;
  type: 'internal_nvme' | 'external_usbc' | 'cloud_pool';
  totalGB: number;
  usedGB: number;
  health: number; // 0-100%
  speedMBs: number;
  mountPoint: string;
}

export interface InstalledApp {
  id: string;
  name: string;
  category: 'Gaming' | 'Business' | 'Utility' | 'Creator' | 'AI' | 'Social' | 'System';
  sizeGB: number;
  version: string;
  batteryDrainPercent: number;
  permissions: string[];
  isArchived?: boolean;
  isCloned?: boolean;
}

export interface EmperorCompany {
  id: string;
  name: string;
  industry: string;
  valuationCredits: number;
  monthlyRevenue: number;
  employees: number;
  productsCount: number;
  rating: number;
}

export interface CreatorPost {
  id: string;
  title: string;
  type: 'reel' | 'short' | 'movie' | 'article';
  views: number;
  likes: number;
  revenue: number;
  date: string;
}
