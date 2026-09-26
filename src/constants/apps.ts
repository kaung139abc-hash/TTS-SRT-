import { AppDefinition } from '../types/floating';

export const APP_DEFINITIONS: AppDefinition[] = [
  // Apps exactly as shown in user's phone Taskbar Start Menu
  {
    id: 'safety',
    name: { mm: 'Safety', en: 'Safety' },
    icon: 'Safety',
    color: 'from-slate-100 to-slate-200',
    deepLink: 'intent:#Intent;package=com.google.android.apps.safetyhub;end',
    webUrl: '',
    defaultSize: { width: 440, height: 500 },
    category: 'utility',
    packageName: 'com.google.android.apps.safetyhub'
  },
  {
    id: 'scanner',
    name: { mm: 'Scanner', en: 'Scanner' },
    icon: 'Scanner',
    color: 'from-slate-800 to-slate-900',
    deepLink: 'intent:#Intent;package=com.xiaomi.scanner;end',
    webUrl: '',
    defaultSize: { width: 420, height: 480 },
    category: 'utility',
    packageName: 'com.xiaomi.scanner'
  },
  {
    id: 'security',
    name: { mm: 'Security', en: 'Security' },
    icon: 'Security',
    color: 'from-emerald-500 to-green-600',
    deepLink: 'intent:#Intent;package=com.miui.securitycenter;end',
    webUrl: '',
    defaultSize: { width: 460, height: 520 },
    category: 'system',
    packageName: 'com.miui.securitycenter'
  },
  {
    id: 'services_feedback',
    name: { mm: 'Services & feedback', en: 'Services & feedback' },
    icon: 'ServicesFeedback',
    color: 'from-sky-400 to-blue-500',
    deepLink: 'intent:#Intent;package=com.miui.miservice;end',
    webUrl: '',
    defaultSize: { width: 420, height: 480 },
    category: 'system',
    packageName: 'com.miui.miservice'
  },
  {
    id: 'settings',
    name: { mm: 'Settings', en: 'Settings' },
    icon: 'Settings',
    color: 'from-slate-400 to-slate-600',
    deepLink: 'intent:#Intent;action=android.settings.SETTINGS;end',
    webUrl: '',
    defaultSize: { width: 480, height: 540 },
    category: 'system',
    packageName: 'com.android.settings'
  },
  {
    id: 'shareme',
    name: { mm: 'ShareMe', en: 'ShareMe' },
    icon: 'ShareMe',
    color: 'from-cyan-400 to-sky-600',
    deepLink: 'intent:#Intent;package=com.xiaomi.midrop;end',
    webUrl: '',
    defaultSize: { width: 440, height: 500 },
    category: 'utility',
    packageName: 'com.xiaomi.midrop'
  },
  {
    id: 'spotify',
    name: { mm: 'Spotify', en: 'Spotify' },
    icon: 'Spotify',
    color: 'from-emerald-500 to-green-700',
    deepLink: 'spotify:',
    webUrl: 'https://open.spotify.com',
    defaultSize: { width: 480, height: 540 },
    category: 'entertainment',
    packageName: 'com.spotify.music'
  },
  {
    id: 'taskbar_app',
    name: { mm: 'Taskbar', en: 'Taskbar' },
    icon: 'TaskbarDualWindow',
    color: 'from-blue-500 to-indigo-600',
    deepLink: 'intent:#Intent;package=com.floatdesk.phone.taskbar;end',
    webUrl: '',
    defaultSize: { width: 460, height: 520 },
    category: 'system',
    packageName: 'com.floatdesk.phone.taskbar'
  },
  {
    id: 'telegram',
    name: { mm: 'Telegram', en: 'Telegram' },
    icon: 'Telegram',
    color: 'from-sky-400 to-blue-600',
    deepLink: 'tg:',
    webUrl: 'https://web.telegram.org',
    defaultSize: { width: 480, height: 540 },
    category: 'social',
    packageName: 'org.telegram.messenger'
  },
  {
    id: 'themes',
    name: { mm: 'Themes', en: 'Themes' },
    icon: 'Themes',
    color: 'from-rose-400 to-orange-400',
    deepLink: 'intent:#Intent;package=com.android.thememanager;end',
    webUrl: '',
    defaultSize: { width: 440, height: 500 },
    category: 'utility',
    packageName: 'com.android.thememanager'
  },
  {
    id: 'tiktok',
    name: { mm: 'TikTok', en: 'TikTok' },
    icon: 'TikTok',
    color: 'from-slate-900 to-black',
    deepLink: 'snssdk1233:',
    webUrl: 'https://www.tiktok.com',
    defaultSize: { width: 420, height: 560 },
    category: 'entertainment',
    packageName: 'com.zhiliaoapp.musically'
  },
  {
    id: 'tonkeeper',
    name: { mm: 'Tonkeeper', en: 'Tonkeeper' },
    icon: 'Tonkeeper',
    color: 'from-blue-600 to-slate-900',
    deepLink: 'intent:#Intent;package=com.ton_keeper;end',
    webUrl: 'https://tonkeeper.com',
    defaultSize: { width: 420, height: 520 },
    category: 'finance',
    packageName: 'com.ton_keeper'
  },
  {
    id: 'v2raytun',
    name: { mm: 'v2RayTun', en: 'v2RayTun' },
    icon: 'v2RayTun',
    color: 'from-slate-800 to-slate-950',
    deepLink: 'intent:#Intent;package=com.v2raytun.android;end',
    webUrl: '',
    defaultSize: { width: 420, height: 500 },
    category: 'utility',
    packageName: 'com.v2raytun.android'
  },
  {
    id: 'viber',
    name: { mm: 'Viber', en: 'Viber' },
    icon: 'Viber',
    color: 'from-purple-600 to-indigo-700',
    deepLink: 'viber:',
    webUrl: '',
    defaultSize: { width: 440, height: 520 },
    category: 'social',
    packageName: 'com.viber.voip'
  },
  {
    id: 'vidmate',
    name: { mm: 'VidMate', en: 'VidMate' },
    icon: 'VidMate',
    color: 'from-rose-600 to-red-700',
    deepLink: 'intent:#Intent;package=com.nemo.vidmate;end',
    webUrl: '',
    defaultSize: { width: 440, height: 520 },
    category: 'entertainment',
    packageName: 'com.nemo.vidmate'
  },
  {
    id: 'weather',
    name: { mm: 'Weather', en: 'Weather' },
    icon: 'Weather',
    color: 'from-sky-400 to-blue-500',
    deepLink: 'intent:#Intent;package=com.miui.weather2;end',
    webUrl: 'https://weather.com',
    defaultSize: { width: 420, height: 480 },
    category: 'utility',
    packageName: 'com.miui.weather2'
  },
  {
    id: 'youtube',
    name: { mm: 'YouTube', en: 'YouTube' },
    icon: 'YouTube',
    color: 'from-red-600 to-rose-700',
    deepLink: 'vnd.youtube:',
    webUrl: 'https://www.youtube.com',
    defaultSize: { width: 500, height: 520 },
    category: 'entertainment',
    packageName: 'com.google.android.youtube'
  },
  {
    id: 'yt_music',
    name: { mm: 'YT Music', en: 'YT Music' },
    icon: 'YTMusic',
    color: 'from-red-700 to-rose-900',
    deepLink: 'intent:#Intent;package=com.google.android.apps.youtube.music;end',
    webUrl: 'https://music.youtube.com',
    defaultSize: { width: 460, height: 520 },
    category: 'entertainment',
    packageName: 'com.google.android.apps.youtube.music'
  },

  // Additional apps from top status
  {
    id: 'mservices',
    name: { mm: 'MServices', en: 'MServices' },
    icon: 'MServices',
    color: 'from-slate-100 to-slate-300',
    deepLink: 'intent:#Intent;package=com.mytel.mservices;end',
    webUrl: '',
    defaultSize: { width: 420, height: 500 },
    category: 'utility',
    packageName: 'com.mytel.mservices'
  },
  {
    id: 'cctube3',
    name: { mm: 'cctube3', en: 'cctube3' },
    icon: 'cctube3',
    color: 'from-red-600 to-red-800',
    deepLink: 'intent:#Intent;package=com.cctube3.app;end',
    webUrl: '',
    defaultSize: { width: 440, height: 500 },
    category: 'entertainment',
    packageName: 'com.cctube3.app'
  },
  {
    id: 'proton_vpn',
    name: { mm: 'Proton VPN', en: 'Proton VPN' },
    icon: 'ProtonVPN',
    color: 'from-purple-600 to-indigo-800',
    deepLink: 'intent:#Intent;package=ch.protonvpn.android;end',
    webUrl: 'https://protonvpn.com',
    defaultSize: { width: 420, height: 500 },
    category: 'utility',
    packageName: 'ch.protonvpn.android'
  },

  // Dock items
  {
    id: 'chrome',
    name: { mm: 'Chrome', en: 'Chrome' },
    icon: 'Chrome',
    color: 'from-amber-400 via-emerald-500 to-blue-500',
    deepLink: 'googlechrome:',
    webUrl: 'https://www.google.com',
    defaultSize: { width: 500, height: 540 },
    category: 'google',
    packageName: 'com.android.chrome'
  },
  {
    id: 'file_manager',
    name: { mm: 'File Manager', en: 'File Manager' },
    icon: 'FileManager',
    color: 'from-amber-400 to-amber-600',
    deepLink: 'intent:#Intent;package=com.miui.cleanmaster;end',
    webUrl: '',
    defaultSize: { width: 460, height: 500 },
    category: 'system',
    packageName: 'com.miui.cleanmaster'
  },
  {
    id: 'play_store',
    name: { mm: 'Play Store', en: 'Play Store' },
    icon: 'PlayStore',
    color: 'from-cyan-400 via-emerald-500 to-amber-400',
    deepLink: 'market://search',
    webUrl: 'https://play.google.com',
    defaultSize: { width: 480, height: 540 },
    category: 'google',
    packageName: 'com.android.vending'
  },

  // Built-in Utilities
  {
    id: 'calculator',
    name: { mm: 'Calculator', en: 'Calculator' },
    icon: 'Calculator',
    color: 'from-blue-600 to-indigo-700',
    deepLink: 'intent:#Intent;package=com.google.android.calculator;end',
    webUrl: '',
    defaultSize: { width: 360, height: 480 },
    category: 'utility',
    packageName: 'com.google.android.calculator'
  },
  {
    id: 'taskbar_permissions',
    name: { mm: 'Taskbar Permissions', en: 'Taskbar Permissions' },
    icon: 'ShieldCheck',
    color: 'from-indigo-600 via-purple-600 to-pink-600',
    deepLink: 'intent:#Intent;action=android.settings.action.MANAGE_OVERLAY_PERMISSION;end',
    webUrl: '',
    defaultSize: { width: 480, height: 540 },
    category: 'system'
  },
  {
    id: 'custom_adder',
    name: { mm: '+ Add Installed App', en: '+ Add Installed App' },
    icon: 'PlusCircle',
    color: 'from-emerald-500 to-teal-600',
    deepLink: '',
    webUrl: '',
    defaultSize: { width: 460, height: 480 },
    category: 'system'
  }
];
