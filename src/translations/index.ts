export interface Translations {
  appName: string;
  subTitle: string;
  floatingWindows: string;
  openApp: string;
  minimize: string;
  maximize: string;
  restore: string;
  close: string;
  opacity: string;
  alwaysOnTop: string;
  pipMode: string;
  launchApps: string;
  desktop: string;
  widgets: string;
  settings: string;
  wallpaper: string;
  language: string;
  
  // App Titles
  videoAppTitle: string;
  browserAppTitle: string;
  notesAppTitle: string;
  calcAppTitle: string;
  clockAppTitle: string;
  settingsAppTitle: string;
  aiAppTitle: string;

  // Video Downloader App
  inputPlaceholder: string;
  extractBtn: string;
  extracting: string;
  downloadHd: string;
  downloadMp3: string;
  playPip: string;
  noWatermark: string;
  supportedSites: string;

  // Notes App
  newNote: string;
  saveNote: string;
  deleteNote: string;
  notePlaceholder: string;

  // Browser App
  searchOrUrl: string;
  goBtn: string;
  quickLinks: string;

  // Calculator
  clear: string;

  // Clock
  stopwatch: string;
  timer: string;
  start: string;
  pause: string;
  reset: string;
}

export const translations: Record<'mm' | 'en', Translations> = {
  mm: {
    appName: "FloatDesk",
    subTitle: "Floating Window Multi-Tasking OS (မြန်မာ)",
    floatingWindows: "Floating Windows",
    openApp: "App ဖွင့်မည်",
    minimize: "သေးငယ်အောင်လုပ်ရန်",
    maximize: "မျက်နှာပြင်ပြည့်",
    restore: "မူလအရွယ်အစား",
    close: "ပိတ်မည်",
    opacity: "ကြည်လင်မှု / ကြည့်မြင်နိုင်စွမ်း",
    alwaysOnTop: "အပေါ်ဆုံးတွင် အမြဲမြှင့်ထားရန်",
    pipMode: "Picture-in-Picture (PiP) မုဒ်",
    launchApps: "Floating Apps များ",
    desktop: "ဒက်စ်တော့ခ်",
    widgets: "ဝိဂျက်များ",
    settings: "ချိန်ညှိချက်များ",
    wallpaper: "နောက်ခံ သတ်မှတ်ရန်",
    language: "ဘာသာစကား",

    videoAppTitle: "Floating Video Downloader & Player",
    browserAppTitle: "Floating Web Browser",
    notesAppTitle: "Floating Sticky Notes",
    calcAppTitle: "Floating Calculator",
    clockAppTitle: "Floating Clock & Timer",
    settingsAppTitle: "Desktop Settings",
    aiAppTitle: "Floating AI Helper",

    inputPlaceholder: "YouTube, TikTok, Facebook, Instagram လင့်ခ် ထည့်ပါ...",
    extractBtn: "ဗီဒီယို ဖတ်ယူမည်",
    extracting: "ဖတ်ယူနေပါသည်...",
    downloadHd: "HD Video ဒေါင်းလုဒ်ဆွဲမည်",
    downloadMp3: "MP3 သီချင်းသီးသန့်",
    playPip: "Floating PIP တင်ကြည့်မည်",
    noWatermark: "No Watermark ပါရှိပါသည်",
    supportedSites: "လက်ခံသော Platform များ",

    newNote: "မှတ်စုသစ်",
    saveNote: "သိမ်းမည်",
    deleteNote: "ဖျက်မည်",
    notePlaceholder: "ဒီနေရာတွင် မှတ်စုများ ရေးမှတ်ပါ...",

    searchOrUrl: "Website လင့်ခ် သို့မဟုတ် Google ရှာဖွေရန်...",
    goBtn: "သွားမည်",
    quickLinks: "မြန်ဆန်သော လင့်ခ်များ",

    clear: "C",

    stopwatch: "စတော့ပဝေါ့ချ်",
    timer: "အချိန်မှတ်နာရီ",
    start: "စမည်",
    pause: "ခဏရပ်မည်",
    reset: "ပြန်စမည်",
  },
  en: {
    appName: "FloatDesk",
    subTitle: "Floating Window Multi-Tasking OS",
    floatingWindows: "Floating Windows",
    openApp: "Open App",
    minimize: "Minimize",
    maximize: "Maximize",
    restore: "Restore",
    close: "Close",
    opacity: "Opacity / Transparency",
    alwaysOnTop: "Always on Top",
    pipMode: "Picture-in-Picture Mode",
    launchApps: "Floating Apps",
    desktop: "Desktop",
    widgets: "Widgets",
    settings: "Settings",
    wallpaper: "Wallpaper",
    language: "Language",

    videoAppTitle: "Floating Video Downloader & Player",
    browserAppTitle: "Floating Mini Browser",
    notesAppTitle: "Floating Sticky Notes",
    calcAppTitle: "Floating Glass Calculator",
    clockAppTitle: "Floating Clock & Timer",
    settingsAppTitle: "Desktop Settings",
    aiAppTitle: "Floating AI Assistant",

    inputPlaceholder: "Paste YouTube, TikTok, Facebook, Instagram link...",
    extractBtn: "Fetch Video",
    extracting: "Extracting...",
    downloadHd: "Download HD Video",
    downloadMp3: "Download MP3 Audio",
    playPip: "Play in Floating PiP",
    noWatermark: "No Watermark Included",
    supportedSites: "Supported Platforms",

    newNote: "New Note",
    saveNote: "Save",
    deleteNote: "Delete",
    notePlaceholder: "Type your quick notes here...",

    searchOrUrl: "Search Google or type web URL...",
    goBtn: "Go",
    quickLinks: "Quick Bookmarks",

    clear: "C",

    stopwatch: "Stopwatch",
    timer: "Timer",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
  }
};
