import React, { useState } from 'react';
import { WallpaperStyle, AppDefinition, AppCategory } from '../types/floating';
import { APP_DEFINITIONS } from '../constants/apps';
import { Smartphone, Search, X, Sparkles, LayoutGrid, ShieldCheck, ArrowRight } from 'lucide-react';
import { Translations } from '../translations';
import { AppIcon } from './AppIcon';

interface WallpaperCanvasProps {
  wallpaper: WallpaperStyle;
  customApps?: AppDefinition[];
  t: Translations;
  onOpenApp: (appId: string) => void;
}

export const WallpaperCanvas: React.FC<WallpaperCanvasProps> = ({
  wallpaper,
  customApps = [],
  onOpenApp
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('all');
  const [filterQuery, setFilterQuery] = useState('');

  const allApps = [...APP_DEFINITIONS, ...customApps];

  const categories: { id: AppCategory; label: string }[] = [
    { id: 'all', label: 'အားလုံး (All)' },
    { id: 'social', label: 'Social & Chat' },
    { id: 'banking', label: 'KPay / Wave' },
    { id: 'google', label: 'Google Apps' },
    { id: 'media', label: 'Media & Music' },
    { id: 'utility', label: 'Phone Tools' },
    { id: 'game', label: 'Games' },
  ];

  const filtered = allApps.filter((app) => {
    const matchCat = selectedCategory === 'all' || app.category === selectedCategory;
    const matchQuery = 
      app.name.mm.toLowerCase().includes(filterQuery.toLowerCase()) ||
      app.name.en.toLowerCase().includes(filterQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const getGradientClass = () => {
    switch (wallpaper) {
      case 'aurora':
        return 'from-slate-950 via-indigo-950 to-purple-950';
      case 'cyber':
        return 'from-slate-950 via-teal-950 to-emerald-950';
      case 'space':
        return 'from-black via-slate-950 to-indigo-950';
      case 'sunset':
        return 'from-slate-950 via-purple-950 to-rose-950';
      case 'minimal':
        return 'from-black to-slate-950';
      default:
        return 'from-slate-950 via-slate-900 to-indigo-950';
    }
  };

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${getGradientClass()} overflow-y-auto select-none transition-colors duration-700 pb-28`}>
      {/* Decorative ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Desktop Header / Search Controls */}
      <div className="p-4 sm:p-6 pb-2 max-w-7xl mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white font-sans flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-indigo-400" />
              <span>FloatDesk Phone Launcher</span>
            </h1>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              သင့်ဖုန်းအတွင်းရှိ Apps အားလုံးကို Auto ဖော်ပြပေးထားသော Floating OS
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search phone apps..."
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 backdrop-blur-md"
            />
            {filterQuery && (
              <button 
                onClick={() => setFilterQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Taskbar Permissions Card Banner */}
        <div 
          onClick={() => onOpenApp('taskbar_permissions')}
          className="cursor-pointer bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-slate-900/90 border border-indigo-500/60 hover:border-indigo-400 p-3 sm:p-4 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-md transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0 ring-2 ring-indigo-400/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <span>🛡️ Taskbar Required Permissions (ခွင့်ပြုချက်များ မီနူး)</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
                  ဒီမှာနှိပ်ပါ
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Display over apps, Accessibility, Xiaomi Background Pop-up နှင့် Android Permissions စစ်ဆေး/ဖွင့်ရန်
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 shadow flex items-center gap-1">
            <span>ဖွင့်ရန်</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Phone App Grid (Auto-detected phone apps) */}
      <div className="p-4 sm:p-6 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 sm:gap-4 max-w-7xl mx-auto">
        {filtered.map((app) => (
          <button
            key={app.id}
            onClick={() => onOpenApp(app.id)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group cursor-pointer text-center"
          >
            <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all border border-white/20 shrink-0 text-white`}>
              <AppIcon name={app.icon} className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 line-clamp-1 group-hover:text-indigo-300 drop-shadow">
              {app.name.mm}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
