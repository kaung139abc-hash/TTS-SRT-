import React, { useState } from 'react';
import { 
  Grid, LayoutGrid, Search, X, Sparkles, Smartphone, CheckCircle, ExternalLink
} from 'lucide-react';
import { APP_DEFINITIONS } from '../constants/apps';
import { FloatingWindowConfig, AppDefinition, AppCategory } from '../types/floating';
import { Translations } from '../translations';
import { AppIcon } from './AppIcon';

interface DesktopDockProps {
  windows: FloatingWindowConfig[];
  activeWindowId: string | null;
  customApps?: AppDefinition[];
  t: Translations;
  onOpenApp: (appId: string) => void;
  onFocusWindow: (id: string) => void;
  onMinimizeWindow: (id: string) => void;
}

export const DesktopDock: React.FC<DesktopDockProps> = ({
  windows,
  activeWindowId,
  customApps = [],
  t,
  onOpenApp,
  onFocusWindow,
  onMinimizeWindow
}) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<AppCategory>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const allApps = [...APP_DEFINITIONS, ...customApps];

  const categories: { id: AppCategory; label: string }[] = [
    { id: 'all', label: 'အားလုံး (All)' },
    { id: 'social', label: 'Social' },
    { id: 'banking', label: 'KPay / Wave' },
    { id: 'google', label: 'Google' },
    { id: 'media', label: 'Media' },
    { id: 'utility', label: 'Tools' },
    { id: 'game', label: 'Games' },
  ];

  const filteredApps = allApps.filter((app) => {
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    const matchesSearch = 
      app.name.mm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.packageName && app.packageName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Floating App Drawer Popover (Full Android Phone App Drawer) */}
      {showDrawer && (
        <div 
          onClick={() => setShowDrawer(false)}
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl max-w-xl w-full space-y-3.5 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-6 duration-200 max-h-[82vh] flex flex-col"
          >
            {/* Header & Search Bar */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">ဖုန်းတွင်းရှိ Apps အားလုံး ({allApps.length})</h3>
                  <p className="text-[10px] text-slate-400">Auto-detected phone apps catalog</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instant Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ဖုန်းထဲက App ရှာရန် (Search YouTube, KPay, Facebook, Viber...)"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* App Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-5 gap-2.5 pt-1">
              {filteredApps.map((app) => {
                const isOpen = windows.some((w) => w.appId === app.id);
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      onOpenApp(app.id);
                      setShowDrawer(false);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-indigo-500/60 transition-all text-center group relative cursor-pointer"
                  >
                    {isOpen && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/40 animate-pulse" />
                    )}
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-1.5 shadow-md group-hover:scale-110 transition-transform text-white border border-white/10`}>
                      <AppIcon name={app.icon} className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200 line-clamp-1 group-hover:text-indigo-300">
                      {app.name.mm}
                    </span>
                    <span className="text-[9px] text-slate-500 line-clamp-1">
                      {app.name.en}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Taskbar Dock Bar (Bottom Center) */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] max-w-full px-2 sm:px-3">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/70 rounded-2xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-2xl shadow-black/90">
          {/* Launcher Menu Button (All Apps Drawer) */}
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
              showDrawer ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800/90 text-indigo-400 hover:bg-slate-800'
            }`}
            title="All Phone Apps Drawer"
          >
            <Grid className="w-5 h-5" />
          </button>

          <div className="w-[1px] h-6 bg-slate-700/60 my-auto shrink-0" />

          {/* Quick Launch & Active Window Dock Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-[65vw] sm:max-w-[70vw] scrollbar-none py-0.5 px-0.5">
            {allApps.slice(0, 16).map((app) => {
              const activeWin = windows.find((w) => w.appId === app.id);
              const isOpen = !!activeWin;
              const isFocused = activeWin?.id === activeWindowId && !activeWin.isMinimized;

              return (
                <button
                  key={app.id}
                  onClick={() => {
                    if (isOpen) {
                      if (isFocused) onMinimizeWindow(activeWin.id);
                      else onFocusWindow(activeWin.id);
                    } else {
                      onOpenApp(app.id);
                    }
                  }}
                  className={`relative p-2 rounded-xl transition-all group flex items-center justify-center shrink-0 ${
                    isFocused
                      ? 'bg-slate-800 ring-2 ring-indigo-500 shadow-lg text-white'
                      : isOpen
                      ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-white opacity-85 hover:opacity-100'
                  }`}
                  title={app.name.mm}
                >
                  <AppIcon name={app.icon} className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />

                  {/* Active Indicator Dot */}
                  {isOpen && (
                    <span
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                        isFocused ? 'bg-indigo-400 ring-2 ring-indigo-400/50' : 'bg-emerald-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="w-[1px] h-6 bg-slate-700/60 my-auto hidden sm:block shrink-0" />

          {/* System Tray Clock */}
          <div className="hidden sm:flex flex-col items-end px-2 text-slate-300 font-mono text-[11px] leading-tight select-none shrink-0">
            <span className="font-bold">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[9px] text-slate-400">
              {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
