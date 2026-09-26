export type AppCategory = 'all' | 'social' | 'banking' | 'google' | 'media' | 'utility' | 'game' | 'system' | 'entertainment' | 'finance';
export type AppId = string;

export interface FloatingWindowConfig {
  id: string;
  appId: string;
  title: string;
  icon: string;
  deepLink?: string;
  webUrl?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minSize: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  isPinned: boolean; // Always on top
  opacity: number; // 0.3 to 1.0
  zIndex: number;
  isPip: boolean; // Picture in Picture mini float mode
  data?: any;
}

export interface AppDefinition {
  id: string;
  name: { mm: string; en: string };
  icon: string;
  color: string;
  deepLink: string; // Android/iOS custom URI scheme (e.g. youtube://)
  webUrl: string;   // Fallback Web URL for floating window iframe/preview
  defaultSize: { width: number; height: number };
  category: AppCategory;
  packageName?: string; // Android package name
  isCustom?: boolean;
}

export type WallpaperStyle = 'phone_dark' | 'aurora' | 'cyber' | 'glass_dark' | 'space' | 'sunset' | 'minimal';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  color: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface CustomAppItem {
  id: string;
  name: string;
  deepLink: string;
  webUrl: string;
  iconColor: string;
}

export interface TaskbarPermissionState {
  displayOverApps: boolean;      // SYSTEM_ALERT_WINDOW (Overlay)
  accessibilityService: boolean;  // BIND_ACCESSIBILITY_SERVICE
  usageAccess: boolean;           // PACKAGE_USAGE_STATS
  notificationListener: boolean; // BIND_NOTIFICATION_LISTENER_SERVICE
  storageMedia: boolean;         // READ_EXTERNAL_STORAGE
  cameraMicrophone: boolean;     // CAMERA & RECORD_AUDIO
  taskbarEnabled: boolean;       // Master toggle
}
