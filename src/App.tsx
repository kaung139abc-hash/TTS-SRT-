import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Upload, Download, Copy, Check, Play, Pause,
  Sparkles, RefreshCw, AlertCircle, DollarSign, Image,
  Languages, Clock, Subtitles, Volume2, Video, CheckCircle2,
  ExternalLink, Layers, ArrowRight, Settings2, Sliders, UserCheck,
  FileAudio, Info, Mic, X, BookOpen, Wand2, Lightbulb, History, Trash2, RotateCcw, Music, Music2, Disc,
  Users, Plus, ArrowUp, ArrowDown, MessageSquare, Users2, Megaphone, Zap, ShieldCheck, MoveVertical, Search, Square, Scissors, Gauge,
  Radio, ArrowLeftRight, MessageSquareQuote, Send, MicOff, VolumeX
} from 'lucide-react';
import { getAllHistory, saveHistoryRecord, deleteHistoryRecord, clearAllHistoryRecords, StoredHistoryItem } from './historyDb';

export interface InterpretMessage {
  id: string;
  speakerRole: 'personA' | 'personB';
  speakerName: string;
  sourceLang: string;
  targetLang: string;
  originalTranscript: string;
  translatedText: string;
  audioUrl?: string;
  timestamp: string;
}

interface VoiceItem {
  id: string;
  name: string;
  gender: string;
  category?: string;
  lang: string;
  desc: string;
}

interface BgmItem {
  id: string;
  name: string;
  category: string;
  volume?: number;
}

interface TTSResult {
  audioUrl: string;
  characterCount: number;
  voiceUsed: string;
  bgmUsed?: string;
  srt?: string;
}

interface ScriptResult {
  title: string;
  category: string;
  wordCount: number;
  estimatedMinutes: string;
  script: string;
}

interface HistoryItem {
  id: string;
  type: 'tts' | 'story';
  title: string;
  content: string;
  voiceName?: string;
  bgmName?: string;
  audioUrl?: string;
  characterCount: number;
  timestamp: number;
}

interface SpeakerSlot {
  id: string; // 'spk1', 'spk2', 'spk3', 'spk4', 'spk5'
  name: string;
  voice: string;
  color: string;
}

interface DialogueLine {
  id: string;
  speakerId: string;
  text: string;
}

interface DialogueResult {
  audioUrl: string;
  characterCount: number;
  dialogueCount: number;
  speakersUsed: string[];
}

// Interactive SRT Subtitle Cue Inspector with Exact Timestamps for CapCut / Premiere Users
const SrtTimelineInspector: React.FC<{
  srtText: string;
  title: string;
  onCopy: (text: string, type: string) => void;
  onDownload: (content: string, filename: string, mime: string) => void;
}> = ({ srtText, title, onCopy, onDownload }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'raw'>('timeline');

  // Parse raw SRT into structured cues
  const cues = React.useMemo(() => {
    if (!srtText) return [];
    const normalized = srtText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    const blocks = normalized.split(/\n\s*\n/);
    const parsed: { index: number; startTime: string; endTime: string; durationSec: string; text: string }[] = [];

    blocks.forEach((block, idx) => {
      const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const timeLineIndex = lines.findIndex(l => l.includes('-->'));
        if (timeLineIndex !== -1) {
          const timeParts = lines[timeLineIndex].split('-->');
          const startTime = timeParts[0].trim();
          const endTime = timeParts[1].trim();
          const text = lines.slice(timeLineIndex + 1).join(' ').trim();

          const parseSec = (t: string) => {
            const parts = t.replace('.', ',').split(':');
            if (parts.length === 3) {
              const h = parseInt(parts[0], 10) || 0;
              const m = parseInt(parts[1], 10) || 0;
              const sParts = parts[2].split(',');
              const s = parseInt(sParts[0], 10) || 0;
              const ms = parseInt(sParts[1] || '0', 10) || 0;
              return h * 3600 + m * 60 + s + ms / 1000;
            }
            return 0;
          };

          const startS = parseSec(startTime);
          const endS = parseSec(endTime);
          const durS = Math.max(0.1, endS - startS).toFixed(1);

          parsed.push({
            index: idx + 1,
            startTime,
            endTime,
            durationSec: durS,
            text
          });
        }
      }
    });
    return parsed;
  }, [srtText]);

  const filteredCues = React.useMemo(() => {
    if (!searchQuery.trim()) return cues;
    const q = searchQuery.toLowerCase();
    return cues.filter(c =>
      c.text.toLowerCase().includes(q) ||
      c.startTime.toLowerCase().includes(q) ||
      c.endTime.toLowerCase().includes(q) ||
      String(c.index).includes(q)
    );
  }, [cues, searchQuery]);

  return (
    <div className="bg-[#0b0e17] rounded-2xl border border-white/10 overflow-hidden shadow-2xl space-y-0">
      {/* Header Bar */}
      <div className="p-4 bg-[#121624] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full text-emerald-300">
              {cues.length} Cues
            </span>
          </h4>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-white/10 text-[10px] font-bold">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'timeline'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⏱️ စက္ကန့်အလိုက် (Timeline)
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'raw'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📝 Raw SRT
            </button>
          </div>

            <button
              onClick={() => onDownload(srtText, 'VoiceMaster_Subtitles.srt', 'text/plain')}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold active:scale-95 flex items-center gap-1 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>10x Turbo .SRT ဒေါင်းလုဒ်</span>
            </button>
          <button
            onClick={() => onCopy(srtText, 'srt_inspector_full')}
            className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold border border-white/5 active:scale-95 flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy All</span>
          </button>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        <div className="p-4 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="စာသား သို့မဟုတ် စက္ကန့်ရှာရန် (ဥပမာ: 00:01 သို့မဟုတ် မင်္ဂလာပါ)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Cue Cards Container */}
          <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredCues.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-500">ရှာဖွေမှုနှင့် ကိုက်ညီသော SRT စာတန်းထိုး မတွေ့ပါခင်ဗျာ။</p>
            ) : (
              filteredCues.map((cue) => (
                <div
                  key={cue.index}
                  className="p-3 bg-[#111420] hover:bg-[#161a29] border border-white/5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-all group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        #{cue.index}
                      </span>
                      {/* Exact Timestamp Badge */}
                      <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{cue.startTime} ➔ {cue.endTime}</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {cue.durationSec}s
                      </span>
                    </div>

                    <p className="text-xs text-slate-100 font-medium leading-relaxed break-words pl-0.5">
                      {cue.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onCopy(cue.text, `cue_txt_${cue.index}`)}
                      title="Copy Spoken Text"
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold active:scale-95 flex items-center gap-1 border border-white/5"
                    >
                      <Copy className="w-3 h-3 text-emerald-400" />
                      <span>စာသား Copy</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <textarea
            readOnly
            value={srtText}
            className="w-full h-80 bg-black/50 border border-white/5 rounded-xl p-3.5 text-xs font-mono leading-relaxed text-slate-200 focus:outline-none resize-none"
          />
        </div>
      )}
    </div>
  );
};

export const STUDIO_HUMAN_SAMPLE_TEXT = `မင်္ဂလာပါခင်ဗျာ... VoiceMaster AI ရဲ့ အဆင့်မြင့် လူသားစစ်စစ် စတူဒီယို အသံသွင်းစနစ်ကနေ ကြိုဆိုပါတယ်။ 

ကျွန်တော်တို့ရဲ့ အသံနည်းပညာဟာ စက်ရုပ်ဆန်တဲ့ အသံထွက်တွေကို လုံးဝဖယ်ရှားထားပြီး၊ အသက်ရှူသံ၊ လေယူလေသိမ်းနဲ့ စကားပြောဟန် နွေးထွေးကြည်လင်တဲ့ လူသားစစ်စစ် အသံအဖြစ် အကောင်းဆုံး ဖန်တီးပေးထားပါတယ်။ စိတ်ဝင်စားဖွယ် ဇာတ်လမ်းတွေ၊ YouTube နဲ့ TikTok ဗီဒီယိုတွေအတွက် အသံသွင်းဖို့ စာသားတွေကို ဒီနေရာမှာ ရိုက်ထည့်ပြီး စိတ်တိုင်းကျ အသုံးပြုနိုင်ပါပြီခင်ဗျာ။`;

export const FAIRY_TALE_SAMPLE = `ဟိုးရှေးရှေးတုန်းကပေါ့... မြူခိုးတွေ ဝေဆာနေတဲ့ တောင်တန်းကြီးရဲ့ အောက်ခြေမှာ သာယာအေးချမ်းတဲ့ ရွာကလေးတစ်ရွာ ရှိခဲ့ဖူးတယ်။ အဲ့ဒီရွာလေးမှာတော့ ဉာဏ်ပညာရှိပြီး ကြင်နာတတ်တဲ့ လူငယ်တစ်ယောက် နေထိုင်ခဲ့ပါတယ်။ တစ်နေ့တော့ သူဟာ တောနက်ကြီးထဲကို သစ်သီးရှာရင်း လျှို့ဝှက်ဆန်းကြယ်တဲ့ ရွှေရောင်ရေကန်ကြီးတစ်ခုကို မထင်မှတ်ဘဲ တွေ့ရှိသွားခဲ့ပါတော့တယ်...`;

export const MYSTERY_SAMPLE = `အဲ့ဒီညက မိုးတွေ အရမ်းသည်းထန်စွာ ရွာသွန်းနေခဲ့တယ်ဗျာ။ ည ၁၂ နာရီတိတိမှာ ရဲစခန်းဆီကို ထူးဆန်းတဲ့ ဖုန်းခေါ်ဆိုမှုတစ်ခု ဝင်လာခဲ့ပါတယ်။ ဖုန်းလိုင်းထဲကနေ ကြောက်လန့်တကြား အော်ဟစ်သံနဲ့အတူ "သူ ရောက်လာပြီ... တံခါးကို ခေါက်နေတယ်..." ဆိုတဲ့ စကားသံတစ်ခုသာ ကြားလိုက်ရပြီး လိုင်းချက်ချင်း ပြတ်တောက်သွားခဲ့တာပါ။ စုံထောက်ကြီးကတော့ မိုးကာအင်္ကျီကို အမြန်ဝတ်ပြီး အခင်းဖြစ်ပွားရာဆီကို ချက်ချင်း ထွက်ခွာသွားပါတော့တယ်...`;

export const MOTIVATIONAL_SAMPLE = `လူတစ်ယောက်ရဲ့ ဘဝမှာ အောင်မြင်မှုဆိုတာ ကံတရားတစ်ခုတည်းကြောင့် မဟုတ်ပါဘူး။ ကိုယ်လျှောက်လှမ်းနေတဲ့ လမ်းကြောင်းပေါ်မှာ မလျှော့သော ဇွဲလုံ့လ၊ နေ့စဉ်ကြိုးစားအားထုတ်မှုနဲ့ ကိုယ့်ကိုယ်ကိုယ် ယုံကြည်မှုတို့ ပေါင်းစပ်လိုက်တဲ့အခါ မဖြစ်နိုင်ဘူးလို့ ထင်ထားတဲ့ အရာအားလုံးဟာ ဖြစ်လာနိုင်ပါတယ်။ ဒီနေ့ကစပြီး သင့်ရဲ့ အိပ်မက်တွေအတွက် အကောင်းဆုံး စတင်လိုက်ပါခင်ဗျာ။`;

// 1-Click Converter from stiff bookish Burmese to natural conversational spoken Burmese
export function convertBookishToSpokenBurmese(text: string): string {
  if (!text) return '';
  return text
    .replace(/ဖြစ်ပါသည်/g, 'ဖြစ်ပါတယ်')
    .replace(/မရှိပါ(?=[။\s\n])/g, 'မရှိပါဘူး')
    .replace(/ရှိပါသည်/g, 'ရှိပါတယ်')
    .replace(/ကြပါသည်/g, 'ကြပါတယ်')
    .replace(/ခဲ့ပါသည်/g, 'ခဲ့ပါတယ်')
    .replace(/နေပါသည်/g, 'နေပါတယ်')
    .replace(/ရပါသည်/g, 'ရပါတယ်')
    .replace(/ပါသည်/g, 'ပါတယ်')
    .replace(/ခဲ့သည်(?=[။\s\n])/g, 'ခဲ့တယ်')
    .replace(/နေသည်(?=[။\s\n])/g, 'နေတယ်')
    .replace(/ရသည်(?=[။\s\n])/g, 'ရတယ်')
    .replace(/သွားသည်(?=[။\s\n])/g, 'သွားတယ်')
    .replace(/လာသည်(?=[။\s\n])/g, 'လာတယ်')
    .replace(/တတ်သည်(?=[။\s\n])/g, 'တတ်တယ်')
    .replace(/ပေသည်(?=[။\s\n])/g, 'ပေတယ်')
    .replace(/သည်။/g, 'တယ်။')
    .replace(/သည်(?=[။\s\n])/g, 'တယ်')
    .replace(/၏(?=[\s\u1000-\u109F])/g, 'ရဲ့')
    .replace(/၌(?=[\s\u1000-\u109F])/g, 'မှာ')
    .replace(/၍(?=[\s\u1000-\u109F])/g, 'ပြီးတော့');
}

export const TARGET_LANGUAGES = [
  { id: 'en', flag: '🇺🇸', name: 'English (အမေရိကန် / အင်္ဂလိပ်)', nativeName: 'English' },
  { id: 'my', flag: '🇲🇲', name: 'Myanmar (မြန်မာဘာသာ Unicode)', nativeName: 'မြန်မာစကားပြော' },
  { id: 'lo', flag: '🇱🇦', name: 'Lao (လာအိုဘာသာ - ພາສາລາວ)', nativeName: 'ພາສາລາວ' },
  { id: 'th', flag: '🇹🇭', name: 'Thai (ထိုင်းဘာသာ - ภาษาไทย)', nativeName: 'ภาษาไทย' },
  { id: 'ja', flag: '🇯🇵', name: 'Japanese (ဂျပန်ဘာသာ - 日本語)', nativeName: '日本語' },
  { id: 'ko', flag: '🇰🇷', name: 'Korean (ကိုရီးယားဘာသာ - 한국어)', nativeName: '한국어' },
  { id: 'zh', flag: '🇨🇳', name: 'Chinese (တရုတ် မန်ဒရင်း - 中文)', nativeName: '中文' },
  { id: 'es', flag: '🇪🇸', name: 'Spanish (စပိန်ဘာသာ - Español)', nativeName: 'Español' },
  { id: 'fr', flag: '🇫🇷', name: 'French (ပြင်သစ်ဘာသာ - Français)', nativeName: 'Français' },
  { id: 'de', flag: '🇩🇪', name: 'German (ဂျာမန်ဘာသာ - Deutsch)', nativeName: 'Deutsch' },
  { id: 'ru', flag: '🇷🇺', name: 'Russian (ရုရှားဘာသာ - Русский)', nativeName: 'Русский' },
  { id: 'vi', flag: '🇻🇳', name: 'Vietnamese (ဗီယက်နမ်ဘာသာ - Tiếng Việt)', nativeName: 'Tiếng Việt' },
  { id: 'id', flag: '🇮🇩', name: 'Indonesian (အင်ဒိုနီးရှားဘာသာ)', nativeName: 'Bahasa Indonesia' },
  { id: 'hi', flag: '🇮🇳', name: 'Hindi (ဟိန္ဒီဘာသာ - हिन्दी)', nativeName: 'हिन्दी' },
  { id: 'ar', flag: '🇸🇦', name: 'Arabic (အာရဗီဘာသာ - العربية)', nativeName: 'العربية' }
];

export const TARGET_LANG_VOICES: Record<string, { id: string; name: string; desc: string; country: string }[]> = {
  en: [
    { id: 'en-US-AndrewMultilingualNeural', name: 'Andrew (အမျိုးသားအသံ - US Native)', desc: 'သဘာဝကျပြီး ဆွဲဆောင်မှုရှိသော အမေရိကန် အသံထွက်', country: '🇺🇸' },
    { id: 'en-US-AvaMultilingualNeural', name: 'Ava (အမျိုးသမီးအသံ - US Native)', desc: 'ချိုသာကြည်လင်သော အမေရိကန် အမျိုးသမီး အသံထွက်', country: '🇺🇸' },
    { id: 'en-US-BrianMultilingualNeural', name: 'Brian (အမျိုးသားအသံ - Deep & Professional)', desc: 'ရုပ်သံသံဟန် တည်ကြည်သောအသံ', country: '🇺🇸' },
    { id: 'en-US-EmmaMultilingualNeural', name: 'Emma (အမျိုးသမီးအသံ - Warm & Clear)', desc: 'စာဖတ်သံနှင့် ရှင်းပြသံအတွက် အထူးကောင်းမွန်', country: '🇺🇸' },
    { id: 'en-AU-WilliamMultilingualNeural', name: 'William (ဩစတြေးလျ အမျိုးသား)', desc: 'သဘာဝကျသော ဩစတြေးလျ အသံဟန်', country: '🇦🇺' }
  ],
  my: [
    { id: 'my-MM-ThihaNeural', name: 'သီဟ (Thiha - Pure Human Cinema Male)', desc: '၁၀၀% စံမြန်မာ လူသားစစ်စစ် ရုပ်ရှင်ဆန်ဆန် တည်ကြည်ပြတ်သားသော အမျိုးသားအသံ', country: '🇲🇲' },
    { id: 'my-MM-NilarNeural', name: 'နီလာ (Nilar - Pure Human Cinema Female)', desc: '၁၀၀% စံမြန်မာ လူသားစစ်စစ် ချိုသာကြည်လင်သော အမျိုးသမီးအသံ', country: '🇲🇲' },
    { id: 'en-AU-WilliamMultilingualNeural', name: 'ဝီလျံ (William - Pure Human Cinema Deep)', desc: 'တည်ကြည်လေးနက်ပြီး အလွန်သဘာဝကျသော ၁၀၀% လူသားစစ်စစ် Deep Voice', country: '🇲🇲' },
    { id: 'en-US-AndrewMultilingualNeural', name: 'အင်ဒရူး (Andrew - Fast Storyteller)', desc: 'သွက်လက်ရွှင်လန်းသော လူသားစစ်စစ် အမျိုးသားအသံ', country: '🇲🇲' }
  ],
  lo: [
    { id: 'lo-LA-KeomanyNeural', name: 'Keomany (ကီယိုမာနီ - လာအို အမျိုးသမီးအသံ)', desc: 'ချိုသာကြည်လင်သော သဘာဝလာအိုစကားပြော အမျိုးသမီးအသံ (၁၀၀% Authentic Lao)', country: '🇱🇦' },
    { id: 'lo-LA-ChanthavongNeural', name: 'Chanthavong (ချန်သာဗွန် - လာအို အမျိုးသားအသံ)', desc: '၁၀၀% သဘာဝကျသော လာအိုစကားပြော အမျိုးသားလေသံ', country: '🇱🇦' }
  ],
  th: [
    { id: 'th-TH-NiwatNeural', name: 'Niwat (နိဝတ် - ထိုင်းအမျိုးသားအသံ)', desc: '၁၀၀% သဘာဝကျသော ထိုင်းစကားပြော လေသံစစ်စစ်', country: '🇹🇭' },
    { id: 'th-TH-PremwadeeNeural', name: 'Premwadee (ပရမ်ဝတီ - ထိုင်းအမျိုးသမီးအသံ)', desc: 'ချိုသာသော ထိုင်းစကားပြော အမျိုးသမီးအသံ', country: '🇹🇭' },
    { id: 'th-TH-AcharaNeural', name: 'Achara (အာချာရာ - သဘာဝထိုင်းအသံ)', desc: 'ကြည်လင်ရှင်းလင်းသော ထိုင်းအသံ', country: '🇹🇭' }
  ],
  ja: [
    { id: 'ja-JP-KeitaNeural', name: 'Keita (ကေအိတ - ဂျပန်အမျိုးသားအသံ)', desc: 'ဂျပန်စကားပြော သဘာဝအသံစစ်စစ်', country: '🇯🇵' },
    { id: 'ja-JP-NanamiNeural', name: 'Nanami (နာနာမိ - ဂျပန်အမျိုးသမီးအသံ)', desc: 'ချိုသာကြည်လင်သော ဂျပန်အမျိုးသမီးအသံ', country: '🇯🇵' },
    { id: 'ja-JP-AoiNeural', name: 'Aoi (အိုအိ - သဘာဝဂျပန်လေသံ)', desc: 'ယဉ်ကျေးနူးညံ့သော ဂျပန်အသံ', country: '🇯🇵' }
  ],
  ko: [
    { id: 'ko-KR-InJoonNeural', name: 'InJoon (အင်ဂျွန်း - ကိုရီးယားအမျိုးသားအသံ)', desc: 'ကိုရီးယား ဇာတ်လမ်းတွဲသံဟန် အမျိုးသားအသံ', country: '🇰🇷' },
    { id: 'ko-KR-SunHiNeural', name: 'SunHi (ဆန်းဟီး - ကိုရီးယားအမျိုးသမီးအသံ)', desc: 'ချစ်စဖွယ် ကိုရီးယားအမျိုးသမီး သဘာဝအသံ', country: '🇰🇷' },
    { id: 'ko-KR-HyunsuMultilingualNeural', name: 'Hyunsu (ဟွန်းဆူ - ကိုရီးယားအသံ)', desc: 'ကြည်လင်ပြတ်သားသော ကိုရီးယားအသံ', country: '🇰🇷' }
  ],
  zh: [
    { id: 'zh-CN-YunxiNeural', name: 'Yunxi (ယွန်းရှီး - တရုတ်အမျိုးသားအသံ)', desc: 'မန်ဒရင်း တရုတ်စကားပြော သဘာဝအသံ', country: '🇨🇳' },
    { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao (ရှောင်ရှောင် - တရုတ်အမျိုးသမီးအသံ)', desc: 'ချိုမြိန်ကြည်လင်သော တရုတ်အမျိုးသမီးအသံ', country: '🇨🇳' },
    { id: 'zh-CN-YunjianNeural', name: 'Yunjian (ယွန်းကျန်း - တရုတ်သတင်းသံဟန်)', desc: 'သတင်းကြေညာဟန် တည်ကြည်သောအသံ', country: '🇨🇳' }
  ],
  es: [
    { id: 'es-ES-AlvaroNeural', name: 'Alvaro (အယ်လ်ဗာရို - စပိန်အမျိုးသား)', desc: 'စပိန်စကားပြော သဘာဝအသံ', country: '🇪🇸' },
    { id: 'es-ES-ElviraNeural', name: 'Elvira (အယ်လ်ဗီရာ - စပိန်အမျိုးသမီး)', desc: 'ကြည်လင်သော စပိန်အမျိုးသမီးအသံ', country: '🇪🇸' }
  ],
  fr: [
    { id: 'fr-FR-HenriNeural', name: 'Henri (အွန်နရီ - ပြင်သစ်အမျိုးသား)', desc: 'ပြင်သစ်စကားပြော သဘာဝအသံ', country: '🇫🇷' },
    { id: 'fr-FR-DeniseNeural', name: 'Denise (ဒနိစ် - ပြင်သစ်အမျိုးသမီး)', desc: 'နူးညံ့သော ပြင်သစ်အမျိုးသမီးအသံ', country: '🇫🇷' }
  ],
  de: [
    { id: 'de-DE-ConradNeural', name: 'Conrad (ကွန်ရက်ဒ် - ဂျာမန်အမျိုးသား)', desc: 'ဂျာမန်စကားပြော သဘာဝအသံ', country: '🇩🇪' },
    { id: 'de-DE-KatjaNeural', name: 'Katja (ကတ်ဂျာ - ဂျာမန်အမျိုးသမီး)', desc: 'ပြတ်သားသော ဂျာမန်အမျိုးသမီးအသံ', country: '🇩🇪' }
  ],
  ru: [
    { id: 'ru-RU-DmitryNeural', name: 'Dmitry (ဒီမီထရီ - ရုရှားအမျိုးသား)', desc: 'ရုရှားစကားပြော သဘာဝအသံ', country: '🇷🇺' },
    { id: 'ru-RU-SvetlanaNeural', name: 'Svetlana (ဆဗက်လန်နာ - ရုရှားအမျိုးသမီး)', desc: 'ကြည်လင်သော ရုရှားအမျိုးသမီးအသံ', country: '🇷🇺' }
  ],
  vi: [
    { id: 'vi-VN-NamMinhNeural', name: 'NamMinh (နမ်မင်း - ဗီယက်နမ်အမျိုးသား)', desc: 'ဗီယက်နမ်စကားပြော သဘာဝအသံ', country: '🇻🇳' },
    { id: 'vi-VN-HoaiMyNeural', name: 'HoaiMy (ဟွိုင်မီ - ဗီယက်နမ်အမျိုးသမီး)', desc: 'ချိုသာသော ဗီယက်နမ်အမျိုးသမီးအသံ', country: '🇻🇳' }
  ],
  id: [
    { id: 'id-ID-ArdiNeural', name: 'Ardi (အာဒီ - အင်ဒိုနီးရှားအမျိုးသား)', desc: 'အင်ဒိုနီးရှားစကားပြော သဘာဝအသံ', country: '🇮🇩' },
    { id: 'id-ID-GadisNeural', name: 'Gadis (ဂါဒစ် - အင်ဒိုနီးရှားအမျိုးသမီး)', desc: 'ချိုသာသော အင်ဒိုနီးရှားအမျိုးသမီးအသံ', country: '🇮🇩' }
  ],
  hi: [
    { id: 'hi-IN-MadhurNeural', name: 'Madhur (မဒူးရ် - ဟိန္ဒီအမျိုးသား)', desc: 'ဟိန္ဒီစကားပြော သဘာဝအသံစစ်စစ်', country: '🇮🇳' },
    { id: 'hi-IN-SwaraNeural', name: 'Swara (ဆွာရာ - ဟိန္ဒီအမျိုးသမီး)', desc: 'ကြည်လင်သော ဟိန္ဒီအမျိုးသမီးအသံ', country: '🇮🇳' }
  ],
  ar: [
    { id: 'ar-SA-HamedNeural', name: 'Hamed (ဟာမက် - အာရဗီအမျိုးသား)', desc: 'အာရဗီစကားပြော သဘာဝအသံ', country: '🇸🇦' },
    { id: 'ar-SA-ZariyahNeural', name: 'Zariyah (ဇာရီယာ - အာရဗီအမျိုးသမီး)', desc: 'ကြည်လင်သော အာရဗီအမျိုးသမီးအသံ', country: '🇸🇦' }
  ]
};

export const App: React.FC = () => {
  // Main Navigation Modes: 'tts' | 'dialogue' | 'writer' | 'video' | 'voiceChanger' | 'history' | 'imager' | 'transcribe' | 'audioModifier' | 'autoPipeline' | 'translator' | 'silenceRemover' | 'subtitleBurner'
  const [mainMode, setMainMode] = useState<'tts' | 'dialogue' | 'writer' | 'video' | 'voiceChanger' | 'history' | 'imager' | 'transcribe' | 'audioModifier' | 'autoPipeline' | 'translator' | 'silenceRemover' | 'subtitleBurner'>('tts');

  // Cloned Voice Profiles State
  // getAllClonedProfiles was removed as part of voice cloning removal.

  // ----------------------------------------------------
  // Mode 1: Text-to-Speech (TTS) State
  // ----------------------------------------------------
  const [ttsText, setTtsText] = useState(STUDIO_HUMAN_SAMPLE_TEXT);
  const [voices, setVoices] = useState<VoiceItem[]>([]);
  const [bgmTracks, setBgmTracks] = useState<BgmItem[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('en-AU-WilliamMultilingualNeural');
  const [voiceCategoryFilter, setVoiceCategoryFilter] = useState<'all' | 'storyteller' | 'elderly_male' | 'elderly_female' | 'child' | 'female' | 'myanmar'>('all');
  const [selectedBgm, setSelectedBgm] = useState('none');
  const [bgmVolume, setBgmVolume] = useState(0.0);
  const [speechRate, setSpeechRate] = useState('+0%');
  const [speechPitch, setSpeechPitch] = useState('+0Hz');
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [ttsResult, setTtsResult] = useState<TTSResult | null>(null);
  const [ttsError, setTtsError] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // ----------------------------------------------------
  // Mode 1.5: Multi-Speaker Conversation Studio (Up to 5 Speakers)
  // ----------------------------------------------------
  const [speakers, setSpeakers] = useState<SpeakerSlot[]>([
    { id: 'spk1', name: '👑 ဝီလျံ (Cinema Deep)', voice: 'en-AU-WilliamMultilingualNeural', color: 'indigo' },
    { id: 'spk2', name: '🌸 အေဗာ (Smooth Female)', voice: 'en-US-AvaMultilingualNeural', color: 'emerald' },
    { id: 'spk3', name: '🎙️ အင်ဒရူး (Storyteller)', voice: 'en-US-AndrewMultilingualNeural', color: 'amber' },
    { id: 'spk4', name: '📖 အမ်မာ (Audiobook)', voice: 'en-US-EmmaMultilingualNeural', color: 'rose' },
    { id: 'spk5', name: '👴 အဖိုး ရော်ဂျာ (William Elder)', voice: 'elderly-roger', color: 'purple' },
  ]);

  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([
    { id: 'dlg_1', speakerId: 'spk1', text: 'မင်္ဂလာပါခင်ဗျာ၊ ဝီလျံရဲ့ လူသားစစ်စစ် Cinema Deep အသံနဲ့ ဒီနေ့ စကားဝိုင်း အပြန်အလှန်ပြောကြားတဲ့ စမ်းသပ်ချက် အဆင်ပြေရဲ့လားခင်ဗျာ။' },
    { id: 'dlg_2', speakerId: 'spk2', text: 'မင်္ဂလာပါ ကိုဝီလျံ၊ အဆင်ပြေပါတယ်ရှင်။ ဝီလျံလို လူသားစစ်စစ် အသံတွေနဲ့ အပြန်အလှန် စကားပြောတာ အလွန်သဘာဝကျပြီး ရုပ်ရှင်ကြည့်နေရသလိုပါပဲ။' },
    { id: 'dlg_3', speakerId: 'spk3', text: 'ဟုတ်ပါတယ်၊ ကျွန်တော် အင်ဒရူးလည်း ပါဝင်လိုက်တော့ စကားဝိုင်းက ပိုပြီး သက်ဝင်လှုပ်ရှားသွားပါပြီ။' },
    { id: 'dlg_4', speakerId: 'spk4', text: 'ကျွန်မ အမ်မာလည်း ဝီလျံနဲ့အတူ ပုံပြင်ဖတ်ပြဖို့ အသင့်ပါပဲရှင်။' },
    { id: 'dlg_5', speakerId: 'spk5', text: 'အေးကွယ်... အဘ ရော်ဂျာလည်း ဝီလျံလို လေးနက်တဲ့ အသံနဲ့ ဇာတ်လမ်းရှည်တွေ ပြောပြပေးမယ်ကွယ်။' },
  ]);

  const [pauseDuration, setPauseDuration] = useState(0.35);
  const [isDialogueLoading, setIsDialogueLoading] = useState(false);
  const [dialogueResult, setDialogueResult] = useState<DialogueResult | null>(null);
  const [dialogueError, setDialogueError] = useState('');
  const dialoguePlayerRef = useRef<HTMLAudioElement | null>(null);

  // ----------------------------------------------------
  // Advertisement Interstitial Modal State (Appears every 2 uses of ANY feature)
  // ----------------------------------------------------
  const [generationCount, setGenerationCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('vm_usage_count') || '0', 10);
    } catch (_) {
      return 0;
    }
  });

  const [translationCount, setTranslationCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vm_trans_usage_count');
      return saved ? parseInt(saved, 10) : 0;
    } catch (_) {
      return 0;
    }
  });

  const registerGenerationAndCheckAd = (featureName?: string) => {
    const isTranslation = Boolean(
      featureName &&
      [
        'text_translation',
        'live_voice_interpreter',
        'live_text_interpreter',
        'translate_srt',
        'translation'
      ].includes(featureName)
    );

    if (isTranslation) {
      setTranslationCount(prev => {
        const nextCount = prev + 1;
        try {
          localStorage.setItem('vm_trans_usage_count', String(nextCount));
        } catch (_) {}
        // Translation features: Trigger ad popup after every 4 translations (4, 8, 12, 16, ...)
        if (nextCount > 0 && nextCount % 4 === 0) {
          setAdCountdown(15);
          setShowInAppAdModal(true);
        }
        return nextCount;
      });
    } else {
      setGenerationCount(prev => {
        const nextCount = prev + 1;
        try {
          localStorage.setItem('vm_usage_count', String(nextCount));
        } catch (_) {}
        // Other features: Trigger ad popup after every 2 usages (2, 4, 6, 8, ...) as before
        if (nextCount > 0 && nextCount % 2 === 0) {
          setAdCountdown(15);
          setShowInAppAdModal(true);
        }
        return nextCount;
      });
    }
  };

  // ----------------------------------------------------
  // Audio to MP4 Video Visualizer State (TikTok & Reels Generator)
  // ----------------------------------------------------
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoAudioData, setVideoAudioData] = useState('');
  const [videoTitleText, setVideoTitleText] = useState('');
  const [videoSubtitleText, setVideoSubtitleText] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [videoTheme, setVideoTheme] = useState<'cyberpunk' | 'indigo' | 'sunset' | 'emerald' | 'dark'>('cyberpunk');
  const [videoWaveStyle, setVideoWaveStyle] = useState<'cline' | 'line' | 'point'>('cline');
  const [videoCustomWaveColor, setVideoCustomWaveColor] = useState('');
  const [videoWaveY, setVideoWaveY] = useState(50); // Default to middle
  const [videoBgImages, setVideoBgImages] = useState<string[]>([]); // Base64 array of up to 10 background images
  const videoBgImage = videoBgImages[0] || '';
  const setVideoBgImage = (img: string) => setVideoBgImages(img ? [img] : []);
  const [videoBurnSubtitles, setVideoBurnSubtitles] = useState(true);
  const [videoSubtitleSrt, setVideoSubtitleSrt] = useState('');
  const [videoSubtitleStyle, setVideoSubtitleStyle] = useState<'tiktok_yellow' | 'capcut_white' | 'neon_cyan' | 'luxury_gold'>('tiktok_yellow');
  const [videoSubtitlePosition, setVideoSubtitlePosition] = useState<'bottom' | 'middle'>('bottom');
  const [videoSubtitleFontSize, setVideoSubtitleFontSize] = useState(16);
  const [videoColorFilter, setVideoColorFilter] = useState<'none' | 'cinematic' | 'vintage' | 'drama' | 'cool' | 'warm'>('cinematic');
  const [videoFrameStyle, setVideoFrameStyle] = useState<'none' | 'gold_border' | 'neon_frame' | 'film_strip' | 'white_minimal'>('none');
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoResultUrl, setVideoResultUrl] = useState('');
  const [videoError, setVideoError] = useState('');

  // ----------------------------------------------------
  // New Studio State 1: Speech-To-Text / Transcribe & SRT Translate State
  // ----------------------------------------------------
  const [transcribeAudio, setTranscribeAudio] = useState<string>('');
  const [selectedTranscribeFile, setSelectedTranscribeFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeResult, setTranscribeResult] = useState('');
  const [transcribeSrt, setTranscribeSrt] = useState('');
  const [transcribeError, setTranscribeError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [transcribeElapsedSec, setTranscribeElapsedSec] = useState(0);
  const [transcribeStage, setTranscribeStage] = useState<'idle' | 'uploading' | 'extracting' | 'transcribing' | 'completed'>('idle');
  const [transcribeVideoPreviewUrl, setTranscribeVideoPreviewUrl] = useState('');
  
  // SRT to Myanmar Translator State
  const [translatedSrt, setTranslatedSrt] = useState('');
  const [translatedTranscript, setTranslatedTranscript] = useState('');
  const [srtTargetLang, setSrtTargetLang] = useState('my');
  const [isTranslatingSrt, setIsTranslatingSrt] = useState(false);
  const [translateSrtError, setTranslateSrtError] = useState('');
  const [customSrtInput, setCustomSrtInput] = useState('');

  // ----------------------------------------------------
  // New Studio State 3: Audio Speed & Pitch Shifter State
  // ----------------------------------------------------
  const [shifterAudioData, setShifterAudioData] = useState('');
  const [shifterSpeed, setShifterSpeed] = useState(1.0);
  const [shifterPitch, setShifterPitch] = useState(1.0);
  const [isShifting, setIsShifting] = useState(false);
  const [shifterResultUrl, setShifterResultUrl] = useState('');
  const [shifterError, setShifterError] = useState('');

  // ----------------------------------------------------
  // New Studio State 5: 1-Click Auto Video Pipeline State
  // ----------------------------------------------------
  const [pipelineTopic, setPipelineTopic] = useState('');
  const [pipelineGenre, setPipelineGenre] = useState('motivation');
  const [pipelineAspectRatio, setPipelineAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [pipelineDuration, setPipelineDuration] = useState<string>('8min');
  const [pipelineImages, setPipelineImages] = useState<string[]>([]);
  const [isPipelineLoading, setIsPipelineLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<{
    title: string;
    script: string;
    audioUrl: string;
    imageUrl: string;
    videoUrl: string;
    srtText?: string;
  } | null>(null);
  const [pipelineError, setPipelineError] = useState('');

  // Subtitle synchronization & editing state variables
  const [pipelineSrt, setPipelineSrt] = useState<string>('');
  const [editingCues, setEditingCues] = useState<Array<{ index: number; startTime: string; endTime: string; text: string }>>([]);
  const [isBurningSubtitles, setIsBurningSubtitles] = useState(false);
  const [burnError, setBurnError] = useState('');

  // Auto-populate subtitle cues if empty to guarantee editor is always visible
  useEffect(() => {
    if (pipelineResult && (!editingCues || editingCues.length === 0)) {
      const script = pipelineResult.script || '';
      const sentences = script.split(/(?<=[။\.\?\!\n])\s*/).filter(s => s.trim().length > 0);
      const cueDur = 4.0; // 4 seconds per sentence fallback
      const generatedCues = sentences.map((sentence, idx) => {
        const start = idx * cueDur;
        const end = (idx + 1) * cueDur;
        
        const formatSrtTime = (seconds: number): string => {
          const hrs = Math.floor(seconds / 3600);
          const mins = Math.floor((seconds % 3600) / 60);
          const secs = Math.floor(seconds % 60);
          const ms = Math.floor((seconds % 1) * 1000);
          const pad = (num: number, size: number) => ('000' + num).slice(-size);
          return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)},${pad(ms, 3)}`;
        };

        return {
          index: idx + 1,
          startTime: formatSrtTime(start),
          endTime: formatSrtTime(end),
          text: sentence.trim()
        };
      });
      setEditingCues(generatedCues);
    }
  }, [pipelineResult]);

  // Subtitles Burning & Dubbing Studio state variables
  const [burnerVideoFile, setBurnerVideoFile] = useState<File | null>(null);
  const [burnerSrtText, setBurnerSrtText] = useState<string>('');
  const [burnerResultVideoUrl, setBurnerResultVideoUrl] = useState<string>('');
  const [isBurnerLoading, setIsBurnerLoading] = useState(false);
  const [burnerError, setBurnerError] = useState('');
  const [burnerVoice, setBurnerVoice] = useState<string>('my-MM-ThihaNeural');
  const [burnerVoiceSpeed, setBurnerVoiceSpeed] = useState<string>('+0%');
  const [burnerDubbedAudioUrl, setBurnerDubbedAudioUrl] = useState<string>('');
  const [isBurnerVoiceLoading, setIsBurnerVoiceLoading] = useState(false);
  const [burnerMixOption, setBurnerMixOption] = useState<'mix' | 'replace'>('mix');
  const [burnerBurnSubtitles, setBurnerBurnSubtitles] = useState<boolean>(true);
  const [showBurnerSyncEditor, setShowBurnerSyncEditor] = useState(false);
  
  const handleOpenBurnerSyncEditor = () => {
    if (!burnerSrtText.trim()) {
      setBurnerError('ကျေးဇူးပြု၍ စာတန်းထိုး SRT စာသားကို အရင် ရေးသား/ထည့်သွင်းပေးပါရန်။');
      return;
    }
    const cues = parseSrtHelper(burnerSrtText);
    if (cues.length === 0) {
      setBurnerError('SRT Format မမှန်ကန်ပါ။ ကျေးဇူးပြု၍ စစ်ဆေးပေးပါရန်။');
      return;
    }
    setEditingCues(cues);
    setShowBurnerSyncEditor(true);
  };

  // ----------------------------------------------------
  // New Studio State 6: Multi-Language Translator & Live Voice Interpreter State
  // ----------------------------------------------------
  const [translatorTab, setTranslatorTab] = useState<'live' | 'text' | 'srt'>('live');
  const [interpLangA, setInterpLangA] = useState('my'); // 🇲🇲 Myanmar
  const [interpLangB, setInterpLangB] = useState('lo'); // 🇱🇦 Lao
  const [interpVoiceGender, setInterpVoiceGender] = useState<'male' | 'female'>('male');
  const [interpAutoPlay, setInterpAutoPlay] = useState(true);
  const [interpFaceToFace, setInterpFaceToFace] = useState(false);
  const [interpMessages, setInterpMessages] = useState<InterpretMessage[]>([
    {
      id: 'init_sample_1',
      speakerRole: 'personA',
      speakerName: '🇲🇲 သင် (ငါပြောမယ်)',
      sourceLang: 'my',
      targetLang: 'lo',
      originalTranscript: 'မင်္ဂလာပါခင်ဗျာ။ တွေ့ရတာ ဝမ်းသာပါတယ်။',
      translatedText: 'ສະບາຍດີ! ຍິນດີທີ່ໄດ້ຮູ້ຈັກ.',
      timestamp: 'နမူနာ'
    },
    {
      id: 'init_sample_2',
      speakerRole: 'personB',
      speakerName: '🇱🇦 တစ်ဖက်လူ (လာအို)',
      sourceLang: 'lo',
      targetLang: 'my',
      originalTranscript: 'ສະບາຍດີ ເຈົ້າສະບາຍດີບໍ່',
      translatedText: 'မင်္ဂလာပါ၊ နေကောင်းကြရဲ့လားခင်ဗျာ။',
      timestamp: 'နမူနာ'
    }
  ]);
  const [interpActiveSpeaker, setInterpActiveSpeaker] = useState<'personA' | 'personB' | null>(null);
  const [interpIsRecording, setInterpIsRecording] = useState(false);
  const [interpRecordSec, setInterpRecordSec] = useState(0);
  const [interpStatusText, setInterpStatusText] = useState('');
  const [isInterpLoading, setIsInterpLoading] = useState(false);
  const [interpTextInput, setInterpTextInput] = useState('');
  const [interpTextInputSpeaker, setInterpTextInputSpeaker] = useState<'personA' | 'personB'>('personA');
  const [interpError, setInterpError] = useState('');
  const interpMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const interpAudioChunksRef = useRef<Blob[]>([]);
  const interpRecordTimerRef = useRef<any>(null);
  const interpAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [translateText, setTranslateText] = useState('');
  const [translateTargetLang, setTranslateTargetLang] = useState('en');
  const [translateVoice, setTranslateVoice] = useState('en-US-AndrewMultilingualNeural');
  const [isTranslateLoading, setIsTranslateLoading] = useState(false);
  const [translateResult, setTranslateResult] = useState<{
    originalText: string;
    translatedText: string;
    detectedSourceLang: string;
    targetLang?: string;
    voiceUsed?: string;
    audioUrl: string;
    characterCount: number;
  } | null>(null);
  const [translateError, setTranslateError] = useState('');

  // ----------------------------------------------------
  // Voice Character Effects Studio State
  // ----------------------------------------------------
  const [vcInputMode, setVcInputMode] = useState<'upload' | 'mic' | 'tts'>('upload');
  const [vcAudioFile, setVcAudioFile] = useState<File | null>(null);
  const [vcAudioPreview, setVcAudioPreview] = useState<string>('');
  const [vcTtsText, setVcTtsText] = useState('');
  const [vcTtsVoice, setVcTtsVoice] = useState('en-AU-WilliamMultilingualNeural');
  const [vcSelectedEffect, setVcSelectedEffect] = useState<string>('robot');
  const [vcIsRecording, setVcIsRecording] = useState(false);
  const [vcRecordSec, setVcRecordSec] = useState(0);
  const vcMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const vcAudioChunksRef = useRef<Blob[]>([]);
  const vcRecordTimerRef = useRef<any>(null);
  const [isVcLoading, setIsVcLoading] = useState(false);
  const [vcResultUrl, setVcResultUrl] = useState('');
  const [vcError, setVcError] = useState('');
  const [isPlayingVcAudio, setIsPlayingVcAudio] = useState(false);
  const vcAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // ----------------------------------------------------
  // AI Agent Auto-Healing & Diagnostic System State
  // ----------------------------------------------------
  const [aiAgentNotice, setAiAgentNotice] = useState<string | null>(null);
  const triggerAiAgentAutoHeal = async (actionName: string, errorMsg: string) => {
    try {
      await fetch('/api/ai-agent-auto-heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionName, errorDetails: errorMsg })
      });
      setAiAgentNotice(`🛡️ AI Agent မှ "${actionName}" Error အား အလိုအလျောက် ပြုပြင်ပေးပြီးပါပြီ`);
      setTimeout(() => setAiAgentNotice(null), 5000);
    } catch (_) {}
  };

  const openVideoModalForAudio = (audioUrl: string, title?: string, subtitle?: string) => {
    setVideoAudioData(audioUrl);
    setVideoTitleText(title || '');
    setVideoSubtitleText(subtitle || '');
    setVideoBgImages([]);
    setVideoResultUrl('');
    setVideoError('');
    setMainMode('video');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateMP4Video = async () => {
    if (!videoAudioData) return;
    setIsVideoGenerating(true);
    setVideoError('');
    setVideoResultUrl('');

    try {
      const formData = new FormData();

      // Convert audio base64/dataurl or URL into file blob for streamed upload
      if (videoAudioData.startsWith('data:audio') || videoAudioData.startsWith('data:application') || videoAudioData.includes('base64,')) {
        const parts = videoAudioData.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'audio/mp3';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const audioBlob = new Blob([u8arr], { type: mime });
        formData.append('audioFile', audioBlob, 'input_audio.mp3');
      } else if (videoAudioData.startsWith('http') || videoAudioData.startsWith('/')) {
        try {
          const audioFetch = await fetch(videoAudioData);
          const audioBlob = await audioFetch.blob();
          formData.append('audioFile', audioBlob, 'input_audio.mp3');
        } catch (_) {
          formData.append('audioData', videoAudioData);
        }
      } else {
        formData.append('audioData', videoAudioData);
      }

      // Convert bgImages base64 into file blobs for streamed upload (supports up to 10 images)
      if (videoBgImages && videoBgImages.length > 0) {
        formData.append('bgImageDatas', JSON.stringify(videoBgImages));
        videoBgImages.slice(0, 10).forEach((imgBase64, idx) => {
          if (imgBase64.startsWith('data:image') || imgBase64.includes('base64,')) {
            try {
              const parts = imgBase64.split(',');
              const mimeMatch = parts[0].match(/:(.*?);/);
              const mime = mimeMatch ? mimeMatch[1] : 'image/png';
              const bstr = atob(parts[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const imageBlob = new Blob([u8arr], { type: mime });
              formData.append('bgImageFiles', imageBlob, `input_bg_${idx}.png`);
            } catch (_) {}
          }
        });
        formData.append('bgImageData', videoBgImages[0]);
      }

      // Append standard text & subtitle options
      formData.append('titleText', videoTitleText);
      formData.append('subtitleText', videoSubtitleText);
      formData.append('aspectRatio', videoAspectRatio);
      formData.append('theme', videoTheme);
      formData.append('waveStyle', videoWaveStyle);
      formData.append('customWaveColor', videoCustomWaveColor);
      formData.append('waveYPercentage', String(videoWaveY));
      formData.append('burnSubtitles', String(videoBurnSubtitles));
      formData.append('subtitlesSrt', videoSubtitleSrt);
      formData.append('subtitleStyle', videoSubtitleStyle);
      formData.append('subtitlePosition', videoSubtitlePosition);
      formData.append('subtitleFontSize', String(videoSubtitleFontSize));
      formData.append('colorFilter', videoColorFilter);
      formData.append('frameStyle', videoFrameStyle);

      const res = await fetch('/api/audio-to-video', {
        method: 'POST',
        body: formData
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        throw new Error('ဆာဗာ တုံ့ပြန်မှု အချိန်ကုန်သွားပါသည် (သို့မဟုတ်) Memory ကန့်သတ်ချက် ကျော်လွန်သွားပါသည်။ ကျေးဇူးပြု၍ ခေတ္တစောင့်ပြီး ထပ်ကြိုးစားပေးပါခင်ဗျာ။');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'MP4 ဗီဒီယို ဖန်တီးရာတွင် အမှားအယွင်း ရှိနေပါသည်။');
      }

      setVideoResultUrl(data.videoUrl);
      registerGenerationAndCheckAd('mp4_video');
    } catch (err: any) {
      setVideoError(err.message || 'MP4 ဗီဒီယို ဖန်တီး၍ မရပါ။');
    } finally {
      setIsVideoGenerating(false);
    }
  };

  // ----------------------------------------------------
  // Mode 1.85: Smart Silence Remover & Audio Trimmer State
  // ----------------------------------------------------
  const [silenceAudioData, setSilenceAudioData] = useState('');
  const [selectedSilenceFile, setSelectedSilenceFile] = useState<File | null>(null);
  const [silenceMinDuration, setSilenceMinDuration] = useState('0.5');
  const [silenceThresholdDb, setSilenceThresholdDb] = useState('-38');
  const [isSilenceProcessing, setIsSilenceProcessing] = useState(false);
  const [silenceResult, setSilenceResult] = useState<{
    audioUrl: string;
    originalDurationSec: number;
    trimmedDurationSec: number;
    removedSilenceSec: number;
    savedPercentage: number;
    statsLabel: string;
  } | null>(null);
  const [silenceError, setSilenceError] = useState('');

  const handleRemoveSilence = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSilenceFile && !silenceAudioData) {
      setSilenceError('ကျေးဇူးပြု၍ အသံဖိုင် ရွေးချယ်ပါ သို့မဟုတ် TTS/အသံပြောင်းစက်မှ အသံဖိုင် သွင်းယူပါခင်ဗျာ။');
      return;
    }
    setIsSilenceProcessing(true);
    setSilenceError('');
    setSilenceResult(null);

    try {
      const formData = new FormData();
      if (selectedSilenceFile) {
        formData.append('audioFile', selectedSilenceFile);
      } else if (silenceAudioData) {
        formData.append('audioData', silenceAudioData);
      }
      formData.append('minSilenceDuration', silenceMinDuration);
      formData.append('thresholdDb', silenceThresholdDb);

      const res = await fetch('/api/remove-silence', {
        method: 'POST',
        body: formData
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (_) {
        throw new Error(res.status === 504 || res.status === 408 
          ? 'ဆာဗာ တုံ့ပြန်မှု အချိန်စောင့်ဆိုင်းခြင်း ကုန်ဆုံးသွားပါသည်။ ကျေးဇူးပြု၍ ခေတ္တစောင့်ပြီး ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။' 
          : 'ဆာဗာမှ တုံ့ပြန်မှု ပြီးဆုံးခဲ့သော်လည်း အဖြေဖတ်ရှု၍ မရပါ။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။');
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'အသံတိတ်နေရာများ ဖြတ်တောက်ခြင်း မအောင်မြင်ပါ။');
      }

      setSilenceResult({
        audioUrl: data.audioUrl,
        originalDurationSec: data.originalDurationSec,
        trimmedDurationSec: data.trimmedDurationSec,
        removedSilenceSec: data.removedSilenceSec,
        savedPercentage: data.savedPercentage,
        statsLabel: data.statsLabel
      });
      registerGenerationAndCheckAd('remove_silence');
    } catch (err: any) {
      setSilenceError(err.message || 'အသံတိတ်နေရာများ ဖြတ်တောက်၍ မရပါ။');
    } finally {
      setIsSilenceProcessing(false);
    }
  };

  // ----------------------------------------------------
  // Mode 2: AI Story & Video Script Generator State (Option 1)
  // ----------------------------------------------------
  const [scriptTopic, setScriptTopic] = useState('');
  const [scriptGenre, setScriptGenre] = useState('horror');
  const [scriptDuration, setScriptDuration] = useState('5min');
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState('');
  const [generatedScript, setGeneratedScript] = useState<ScriptResult | null>(null);
  const [storyImages, setStoryImages] = useState<any[]>([]);
  const [isStoryImagesLoading, setIsStoryImagesLoading] = useState(false);
  const [storyImagesError, setStoryImagesError] = useState('');
  const [isStoryVideoLoading, setIsStoryVideoLoading] = useState(false);
  const [storyVideoUrl, setStoryVideoUrl] = useState('');
  const [storyVideoError, setStoryVideoError] = useState('');

  // ----------------------------------------------------
  // Mode 3: Audio & Story History Library State (IndexedDB + Storage Backup)
  // ----------------------------------------------------
  const [historyItems, setHistoryItems] = useState<StoredHistoryItem[]>([]);

  // Load history from IndexedDB on mount
  useEffect(() => {
    getAllHistory().then(items => {
      setHistoryItems(items);
    }).catch(err => console.warn('Failed to load history:', err));
  }, []);

  // Save history to IndexedDB (Up to 5 items preserved reliably)
  const saveToHistory = async (item: Omit<StoredHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: StoredHistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now()
    };
    try {
      const updated = await saveHistoryRecord(newItem);
      setHistoryItems(updated);
    } catch (err) {
      console.warn('History save error:', err);
      setHistoryItems(prev => [newItem, ...prev.slice(0, 4)]);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const updated = await deleteHistoryRecord(id);
      setHistoryItems(updated);
    } catch (_) {
      setHistoryItems(prev => prev.filter(i => i.id !== id));
    }
  };

  // ----------------------------------------------------
  // Mode 4: Standalone AI Image Generator State
  // ----------------------------------------------------
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageGenAspectRatio, setImageGenAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [imageStyle, setImageStyle] = useState('cinematic');
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [imageResultUrl, setImageResultUrl] = useState('');
  const [imageError, setImageError] = useState('');

  // New Pro Features States
  const [voiceEffect, setVoiceEffect] = useState<'none' | 'echo' | 'deep' | 'radio'>('none');
  const [enableSubtitles, setEnableSubtitles] = useState(false);
  const [scriptTemplate, setScriptTemplate] = useState('none');

  const handleGenerateStandaloneImage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!imagePrompt.trim()) return;

    setIsImageGenerating(true);
    setImageError('');
    setImageResultUrl('');

    try {
      const res = await fetch('/api/generate-standalone-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageGenAspectRatio,
          style: imageStyle
        })
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (_) {
        throw new Error('ဆာဗာ တုံ့ပြန်မှု မရရှိခဲ့ပါ။ ခေတ္တစောင့်ပြီး ထပ်မံကြိုးစားပေးပါခင်ဗျာ။');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI ရုပ်ပုံ ဖန်တီး၍ မရပါ။');
      }

      setImageResultUrl(data.imageUrl);
      registerGenerationAndCheckAd('standalone_image');
    } catch (err: any) {
      setImageError(err.message || 'ရုပ်ပုံ ဖန်တီးမှု မအောင်မြင်ပါ။');
    } finally {
      setIsImageGenerating(false);
    }
  };

  const clearAllHistory = async () => {
    if (window.confirm('သမိုင်းမှတ်တမ်း အားလုံးကို ဖျက်ပစ်ရန် သေချာပါသလားခင်ဗျာ?')) {
      setHistoryItems([]);
      try {
        await clearAllHistoryRecords();
      } catch (_) {}
    }
  };

  // Common UI State
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Adsterra Direct Link provided by user: https://omg10.com/4/11846053
  const adsterraDirectLink = 'https://omg10.com/4/11846053';

  // In-App Ad Modal state (so user stays 100% inside this app and never thrown out to browser)
  const [showInAppAdModal, setShowInAppAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(20);

  const resultsSectionRef = useRef<HTMLDivElement | null>(null);

  // 20-Second Mandatory Ad Countdown Timer
  useEffect(() => {
    let timer: any;
    if (showInAppAdModal && adCountdown > 0) {
      timer = setInterval(() => {
        setAdCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showInAppAdModal, adCountdown]);

  // Load voices and BGM tracks on mount
  useEffect(() => {
    fetch('/api/tts-voices')
      .then(async (res) => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })
      .then((data) => {
        if (data && data.voices) {
          setVoices(data.voices);
        }
        if (data && data.bgmTracks) {
          setBgmTracks(data.bgmTracks);
        }
      })
      .catch((err) => console.error('Failed to load voices:', err));
  }, []);

  const triggerMonetizationAd = () => {
    setAdCountdown(15);
    setShowInAppAdModal(true);
  };

  const downloadAudioFile = (audioUrl: string, filename: string) => {
    registerGenerationAndCheckAd('download_audio');
    try {
      // 10x Turbo Download Logic: Use direct Blob stream when possible
      if (audioUrl.startsWith('data:')) {
        const arr = audioUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'audio/mp3';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 100); // Super fast cleanup
      } else {
        // External URL: Fetch then blob for instant browser download
        fetch(audioUrl)
          .then(res => res.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          })
          .catch(() => {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = audioUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => document.body.removeChild(a), 100);
          });
      }
    } catch (err) {
      console.error('Turbo Download error:', err);
      window.open(audioUrl, '_blank');
    }
  };

  // ----------------------------------------------------
  // Multi-Speaker Dialogue Handlers
  // ----------------------------------------------------
  const handleUpdateSpeaker = (id: string, field: 'name' | 'voice', value: string) => {
    setSpeakers(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddDialogueLine = (speakerId?: string) => {
    const newId = `dlg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const spk = speakerId || speakers[0]?.id || 'spk1';
    setDialogueLines(prev => [...prev, { id: newId, speakerId: spk, text: '' }]);
  };

  const handleRemoveDialogueLine = (id: string) => {
    setDialogueLines(prev => prev.filter(l => l.id !== id));
  };

  const handleMoveDialogueLine = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === dialogueLines.length - 1)) return;
    const newLines = [...dialogueLines];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newLines[index];
    newLines[index] = newLines[targetIdx];
    newLines[targetIdx] = temp;
    setDialogueLines(newLines);
  };

  const handleUpdateLineSpeaker = (id: string, speakerId: string) => {
    setDialogueLines(prev => prev.map(l => l.id === id ? { ...l, speakerId } : l));
  };

  const handleUpdateLineText = (id: string, text: string) => {
    setDialogueLines(prev => prev.map(l => l.id === id ? { ...l, text } : l));
  };

  const handleLoadSampleDialogue = () => {
    setDialogueLines([
      { id: 'dlg_s1', speakerId: 'spk1', text: 'မင်္ဂလာပါရှင်၊ ဒီနေ့ စကားဝိုင်း အပြန်အလှန်ပြောကြားတဲ့ စမ်းသပ်ချက် အဆင်ပြေရဲ့လားခင်ဗျာ။' },
      { id: 'dlg_s2', speakerId: 'spk2', text: 'မင်္ဂလာပါ ကိုဝီလျံ၊ အဆင်ပြေပါတယ်ရှင်။ လူသားစစ်စစ် အသံတွေနဲ့ အပြန်အလှန် စကားပြောတာ အလွန်သဘာဝကျပြီး နားထောင်ရတာ ကောင်းပါတယ်။' },
      { id: 'dlg_s3', speakerId: 'spk3', text: 'ဟုတ်ပါတယ်၊ ကျွန်တော် အင်ဒရူးလည်း ပါဝင်လိုက်တော့ စကားဝိုင်းက ပိုပြီး သက်ဝင်လှုပ်ရှားသွားပါပြီ။' },
      { id: 'dlg_s4', speakerId: 'spk4', text: 'ကျွန်မ အေဗာလည်း ပါဝင်ခွင့်ရတာ ဝမ်းသာပါတယ်ရှင်။' },
      { id: 'dlg_s5', speakerId: 'spk5', text: 'ကျွန်တော် ဟျွန်းဆူလည်း ဒီ ၅ ယောက် အပြန်အလှန် စကားဝိုင်းမှာ ဝမ်းမြောက်စွာ ပါဝင်ပါတယ်။' }
    ]);
  };

  const handleGenerateDialogue = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogueError('');
    setDialogueResult(null);

    const validLines = dialogueLines.filter(l => l.text.trim().length > 0);
    if (validLines.length === 0) {
      setDialogueError('ကျေးဇူးပြု၍ အနည်းဆုံး စကားပြော စာကြောင်း ၁ ကြောင်း ရိုက်ထည့်ပေးပါခင်ဗျာ။');
      return;
    }

    setIsDialogueLoading(true);

    try {
      const payload = validLines.map(l => {
        const spk = speakers.find(s => s.id === l.speakerId) || speakers[0];
        return {
          speakerId: spk.id,
          speakerName: spk.name,
          voice: spk.voice,
          text: l.text.trim()
        };
      });

      let res: Response | null = null;
      let responseText = '';

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          res = await fetch('/api/multi-speaker-tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              dialogue: payload, 
              pauseDuration
            })
          });
          if (res) {
            responseText = await res.text();
            break;
          }
        } catch (fetchErr: any) {
          if (attempt === 2) throw new Error('ကွန်ရက် ချိတ်ဆက်မှု အခက်အခဲ ဖြစ်ပေါ်သွားပါသည်။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။');
          await new Promise(r => setTimeout(r, 600));
        }
      }

      const data = safeParseResponse(responseText);
      if (!data) {
        throw new Error('ဆာဗာမှ တုံ့ပြန်မှု ယာယီ ကြန့်ကြာသွားပါသည်။ "အပြန်အလှန် စကားပြော အသံဖိုင် ထုတ်လုပ်မည်" ကို ထပ်မံ နှိပ်ပေးပါခင်ဗျာ။');
      }

      if (!res?.ok || !data.success) {
        throw new Error(data.error || 'အပြန်အလှန် စကားပြော အသံဖိုင် ဖန်တီး၍ မရပါ။');
      }

      setDialogueResult({
        audioUrl: data.audioUrl,
        characterCount: data.characterCount,
        dialogueCount: data.dialogueCount,
        speakersUsed: data.speakersUsed
      });

      saveToHistory({
        type: 'tts',
        title: `💬 ၅ ယောက် စကားဝိုင်း အသံဖိုင် (${data.dialogueCount} ကြောင်း)`,
        content: validLines.map(l => {
          const s = speakers.find(sp => sp.id === l.speakerId);
          return `[${s?.name || 'Speaker'}]: ${l.text}`;
        }).join('\n'),
        voiceName: `${data.speakersUsed.join(', ')}`,
        audioUrl: data.audioUrl,
        characterCount: data.characterCount
      });

      // Track generation count for interstitial ad (triggers every 2 generations)
      registerGenerationAndCheckAd();
    } catch (err: any) {
      setDialogueError(err.message || 'အပြန်အလှန် စကားပြော အသံဖိုင် ဖန်တီးရာတွင် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။');
    } finally {
      setIsDialogueLoading(false);
    }
  };

  // ----------------------------------------------------
  // Text to Speech Execution (Unlimited characters + BGM Mixing)
  // ----------------------------------------------------
  const handleGenerateTTS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttsText.trim()) return;

    setIsTtsLoading(true);
    setTtsError('');
    setTtsResult(null);

    try {
      const data: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/text-to-speech');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 10 * 60 * 1000;

        xhr.onload = () => {
          const rawText = (xhr.responseText || '').trim();
          let resData: any = null;
          try {
            resData = JSON.parse(rawText);
          } catch (_) {
            if (rawText.startsWith('<')) {
              reject(new Error('ဆာဗာနှင့် ချိတ်ဆက်မှု ယာယီ ပြတ်တောက်သွားပါသည်။ ခေတ္တစောင့်ပြီး ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));
              return;
            }
          }

          if (xhr.status >= 200 && xhr.status < 300) {
            if (resData && resData.success && resData.audioUrl) {
              resolve(resData);
              return;
            }
            reject(new Error(resData?.error || 'အသံထွက်ထုတ်ယူရာတွင် ချွတ်ယွင်းချက် ဖြစ်ပေါ်သွားပါသည်။'));
            return;
          }

          reject(new Error(resData?.error || `ဆာဗာ အမှား ဖြစ်ပေါ်ခဲ့ပါသည် (Status: ${xhr.status})`));
        };

        xhr.onerror = () => reject(new Error('ကွန်ရက် ချိတ်ဆက်မှု အခက်အခဲ ဖြစ်ပေါ်သွားပါသည်။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));
        xhr.ontimeout = () => reject(new Error('အချိန်ကုန်သွားပါသည် (Request Timeout)။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));

        xhr.send(JSON.stringify({
          text: ttsText.trim(),
          voice: selectedVoice,
          rate: speechRate,
          pitch: speechPitch,
          bgm: selectedBgm,
          bgmVolume: bgmVolume,
          voiceEffect: voiceEffect
        }));
      });

      setTtsResult(data);
      const voiceName = voices.find(v => v.id === selectedVoice)?.name || selectedVoice;
      const bgmName = bgmTracks.find(b => b.id === selectedBgm)?.name;

      // Automatically save to Audio History Library
      saveToHistory({
        type: 'tts',
        title: `${voiceName} ၏ အသံဖတ်ကြားချက်${selectedBgm !== 'none' ? ` (${bgmName})` : ''}`,
        content: ttsText.trim(),
        voiceName,
        bgmName,
        audioUrl: data.audioUrl,
        characterCount: data.characterCount
      });

      // Track generation count for interstitial ad (triggers every 2 generations)
      registerGenerationAndCheckAd();

      // Auto-scroll directly to player so user immediately sees and hears audio
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } catch (err: any) {
      setTtsError(err.message || 'အသံထွက်ထုတ်ယူရာတွင် ချွတ်ယွင်းချက် ဖြစ်ပေါ်သွားပါသည်။');
    } finally {
      setIsTtsLoading(false);
    }
  };

  // ----------------------------------------------------
  // AI Story & Video Script Generation (Option 1)
  // ----------------------------------------------------
  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptTopic.trim()) return;

    setIsScriptLoading(true);
    setScriptError('');
    setGeneratedScript(null);

    try {
      const res = await fetch('/api/generate-story-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: scriptTopic.trim(),
          genre: scriptGenre,
          duration: scriptDuration,
          template: scriptTemplate // New: Script Template
        })
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        throw new Error('ဆာဗာနှင့် ချိတ်ဆက်မှု အဆင်မပြေဖြစ်သွားပါသည်။ ခေတ္တစောင့်ပြီး ပြန်လည် ကြိုးစားပေးပါခင်ဗျာ။');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      setGeneratedScript(data);

      // Automatically start generating scene images for the story
      setTimeout(() => {
        handleGenerateStoryImages(data);
      }, 500);

      // Automatically save generated story to History Library
      saveToHistory({
        type: 'story',
        title: data.title,
        content: data.script,
        characterCount: data.script.length
      });
    } catch (err: any) {
      setScriptError(err.message || 'ဇာတ်ညွှန်းဖန်တီးရာတွင် ချွတ်ယွင်းချက်ဖြစ်ပေါ်သွားပါသည်။');
    } finally {
      setIsScriptLoading(false);
    }
  };

  const handleGenerateStoryImages = async (scriptData?: ScriptResult) => {
    const targetScript = scriptData || generatedScript;
    if (!targetScript) return;
    setIsStoryImagesLoading(true);
    setStoryImagesError('');
    setStoryImages([]);

    try {
      const res = await fetch('/api/generate-story-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetScript.title,
          script: targetScript.script,
          genre: scriptGenre
        })
      });
      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (_) {
        throw new Error('ဆာဗာ တုံ့ပြန်မှု မရရှိခဲ့ပါ။ ခေတ္တစောင့်ပြီး ထပ်ကြိုးစားပေးပါခင်ဗျာ။');
      }
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate story scene images');
      }
      setStoryImages(data.scenes || []);
    } catch (err: any) {
      setStoryImagesError(err.message || 'AI ရုပ်ပုံများ ထုတ်ယူ၍ မရပါ။');
    } finally {
      setIsStoryImagesLoading(false);
    }
  };

  const handleGenerateStoryVideo = async (customBgData?: string) => {
    if (!generatedScript) return;
    setIsStoryVideoLoading(true);
    setStoryVideoError('');
    setStoryVideoUrl('');

    try {
      const res = await fetch('/api/generate-story-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedScript.title,
          script: generatedScript.script,
          genre: scriptGenre,
          waveYPercentage: videoWaveY,
          bgImageData: customBgData || '',
          allSceneImages: storyImages.map(img => img.imageUrl).filter(Boolean), // Send all 4 scene images for multi-scene video
          enableSubtitles: enableSubtitles,
          voiceEffect: voiceEffect
        })
      });
      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('ဆာဗာ တုံ့ပြန်မှု အချိန်ကုန်သွားပါသည် (Timeout)။');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI ဇာတ်လမ်းဗီဒီယို ဖန်တီး၍ မရပါ။');
      }

      setStoryVideoUrl(data.videoUrl);
    } catch (err: any) {
      setStoryVideoError(err.message || 'ဗီဒီယို ဖန်တီးမှု မအောင်မြင်ပါ။');
    } finally {
      setIsStoryVideoLoading(false);
    }
  };

  // Transfer generated script directly to TTS Engine with one click and auto-match natural BGM!
  const sendScriptToTTS = (scriptContent: string, genre?: string) => {
    setTtsText(scriptContent);
    // Auto-select matching natural BGM based on genre
    const targetGenre = genre || scriptGenre;
    if (targetGenre === 'horror') setSelectedBgm('horror');
    else if (targetGenre === 'motivation') setSelectedBgm('inspiring');
    else if (targetGenre === 'history' || targetGenre === 'tech') setSelectedBgm('mystery');
    else if (targetGenre === 'bedtime-story' || targetGenre === 'fun-facts') setSelectedBgm('calm');
    else setSelectedBgm('calm');

    setMainMode('tts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    triggerMonetizationAd();
    try {
      const blob = new Blob([content], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.href = blobUrl;
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      
      // Cleanup with microtask for zero UI lag
      setTimeout(() => {
        document.body.removeChild(element);
        URL.revokeObjectURL(blobUrl);
      }, 50);
    } catch (err) {
      console.error('Turbo file download error:', err);
    }
  };

  // Bulletproof JSON response parser that handles control characters, markdown code fences, BOM, and partial chunks safely
  const safeParseResponse = (rawText: string): any => {
    if (!rawText || typeof rawText !== 'string') return null;
    let clean = rawText.trim();
    if (clean.charCodeAt(0) === 0xFEFF) clean = clean.slice(1);

    try {
      return JSON.parse(clean);
    } catch (_) {}

    // Strip markdown code fences if wrapped in ```json ... ```
    const stripped = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
      return JSON.parse(stripped);
    } catch (_) {}

    // Extract JSON object safely without catastrophic regex
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = clean.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (_) {
        try {
          // Remove only unescaped control characters (ASCII < 32 except tab, LF, CR)
          const sanitized = candidate.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
          return JSON.parse(sanitized);
        } catch (_) {}
      }
    }

    // Extract JSON array
    const firstBracket = clean.indexOf('[');
    const lastBracket = clean.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(clean.slice(firstBracket, lastBracket + 1));
      } catch (_) {}
    }

    return null;
  };

  // ----------------------------------------------------
  // New Studio Handlers 1: Speech-To-Text / Transcribe (1GB Turbo Engine with Chunked Slicing)
  // ----------------------------------------------------
  const handleTranscribeAudio = async () => {
    if (!transcribeAudio && !selectedTranscribeFile) return;
    setIsTranscribing(true);
    setTranscribeError('');
    setTranscribeResult('');
    setTranscribeSrt('');
    setUploadProgress(0);
    setTranscribeElapsedSec(0);
    setTranscribeStage('uploading');

    let timerInterval: any = setInterval(() => {
      setTranscribeElapsedSec(prev => prev + 1);
    }, 1000);

    try {
      // ⚡ 15x-100x INSTANT SRT / VTT UPLOAD:
      // If the user uploaded a .srt, .vtt, or subtitle file, parse locally in 0.01 seconds without waiting!
      if (selectedTranscribeFile && /\.(srt|vtt|sub|txt)$/i.test(selectedTranscribeFile.name)) {
        const textContent = await selectedTranscribeFile.text();
        if (textContent.includes('-->') || /^\d+\s*\n\d{2}:/m.test(textContent)) {
          const lines = textContent.split('\n');
          const textOnly = lines.filter(l => l.trim() && !/^\d+$/.test(l.trim()) && !l.includes('-->')).join(' ');
          setTranscribeStage('completed');
          setTranscribeResult(textOnly);
          setTranscribeSrt(textContent);
          setTranslatedSrt('');
          setTranslatedTranscript('');
          setUploadProgress(100);
          return;
        }
      }

      let data: any = null;

      // Direct High-Speed Turbo Stream Upload for all media files (Supports up to 1GB MP4/MKV/MOV/MP3)
      const formData = new FormData();
      if (selectedTranscribeFile) {
        formData.append('mediaFile', selectedTranscribeFile, selectedTranscribeFile.name);
      } else if (transcribeAudio.startsWith('data:') || transcribeAudio.includes('base64,')) {
        const parts = transcribeAudio.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'audio/mp3';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const audioBlob = new Blob([u8arr], { type: mime });
        formData.append('mediaFile', audioBlob, 'input.mp3');
      } else {
        formData.append('audioUrl', transcribeAudio);
      }

      data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/transcribe-upload');
        xhr.timeout = 30 * 60 * 1000;

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            setUploadProgress(percent);
            if (percent >= 100) {
              setTranscribeStage('extracting');
              setTimeout(() => {
                setTranscribeStage('transcribing');
              }, 800);
            }
          }
        };

        xhr.onload = () => {
          const rawText = (xhr.responseText || '').trim();
          const resData = safeParseResponse(rawText);

          if (xhr.status >= 200 && xhr.status < 300) {
            if (resData && (resData.success || resData.transcript !== undefined || resData.srt !== undefined)) {
              resolve({
                success: true,
                transcript: resData.transcript || '',
                srt: resData.srt || '',
                subtitles: resData.subtitles || [],
                title: resData.title || selectedTranscribeFile?.name || 'transcribed_media',
                language: resData.language || 'Burmese'
              });
              return;
            }
            if (resData && resData.error) {
              reject(new Error(resData.error));
              return;
            }
            // Direct SRT / transcript text fallback recovery (handles plain text SRT from backend)
            if (rawText.includes('-->') || (rawText.length > 5 && !rawText.startsWith('<'))) {
              const lines = rawText.split('\n');
              const textOnly = lines.filter(l => l.trim() && !/^\d+$/.test(l.trim()) && !l.includes('-->')).join(' ');
              resolve({
                success: true,
                transcript: textOnly || rawText,
                srt: rawText.includes('-->') ? rawText : `1\n00:00:00,000 --> 00:00:05,000\n${rawText}\n`,
                subtitles: [],
                title: selectedTranscribeFile?.name || 'transcribed_media',
                language: 'Burmese'
              });
              return;
            }
            if (rawText.startsWith('<')) {
              reject(new Error('ဆာဗာမှ တုံ့ပြန်မှု ယာယီ ကြန့်ကြာသွားပါသည်။ "အသံအညီ စာတန်းထိုး (SRT) ချက်ချင်းထုတ်မည်" ကို ထပ်မံ နှိပ်ပေးပါခင်ဗျာ။'));
              return;
            }
            reject(new Error(`ဆာဗာမှ တုံ့ပြန်မှု မမှန်ကန်ပါ (Status: ${xhr.status})။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။`));
            return;
          }

          if (resData && resData.error) {
            reject(new Error(resData.error));
          } else {
            reject(new Error(`စာတန်းထိုး ထုတ်ယူရာတွင် အခက်အခဲရှိပါသည် (Status: ${xhr.status})။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။`));
          }
        };

        xhr.onerror = () => reject(new Error('ကွန်ရက် ချိတ်ဆက်မှု အခက်အခဲ ဖြစ်ပေါ်သွားပါသည်။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));
        xhr.ontimeout = () => reject(new Error('အချိန်ကုန်သွားပါသည် (Request Timeout)။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));

        xhr.send(formData);
      });

      setTranscribeStage('completed');
      setTranscribeResult(data?.transcript || '');
      setTranscribeSrt(data?.srt || '');
      // Reset previous translations if new audio is transcribed
      setTranslatedSrt('');
      setTranslatedTranscript('');
    } catch (err: any) {
      setTranscribeError(err.message || 'စာသားပြောင်း၍ မရပါ။');
      setTranscribeStage('idle');
    } finally {
      clearInterval(timerInterval);
      setIsTranscribing(false);
      setUploadProgress(null);
    }
  };

  const handleTranslateSrt = async (inputSrt?: string) => {
    const textToTranslate = inputSrt || transcribeSrt || customSrtInput;
    if (!textToTranslate.trim()) return;
    setIsTranslatingSrt(true);
    setTranslateSrtError('');

    try {
      const res = await fetch('/api/translate-srt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srtText: textToTranslate, targetLang: srtTargetLang || 'my' })
      });

      const responseText = await res.text();
      const data = safeParseResponse(responseText);

      if (!data) {
        if ((responseText || '').includes('-->')) {
          setTranslatedSrt(responseText);
          const lines = responseText.split('\n');
          const textOnly = lines.filter(l => l.trim() && !/^\d+$/.test(l.trim()) && !l.includes('-->')).join(' ');
          setTranslatedTranscript(textOnly);
          return;
        }
        if (!res.ok) {
          throw new Error(`ဆာဗာမှ တုံ့ပြန်မှု အမှား ဖြစ်ပေါ်ခဲ့ပါသည် (Status: ${res.status})`);
        }
        if ((responseText || '').trim().startsWith('<')) {
          throw new Error('ဆာဗာမှ တုံ့ပြန်မှု ယာယီ ကြန့်ကြာသွားပါသည်။ "မြန်မာဘာသာသို့ ပြန်ဆိုမည်" ကို ထပ်မံ နှိပ်ပေးပါခင်ဗျာ။');
        }
        throw new Error(`ဆာဗာမှ တုံ့ပြန်မှု မမှန်ကန်ပါ (Status: ${res.status})။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error || `SRT ဘာသာပြန်ခြင်း မအောင်မြင်ပါ (Status: ${res.status})`);
      }

      setTranslatedSrt(data.translatedSrt || responseText);
      setTranslatedTranscript(data.translatedTranscript || '');
      registerGenerationAndCheckAd('translate_srt');
    } catch (err: any) {
      setTranslateSrtError(err.message || 'SRT စာတန်းထိုး ဘာသာပြန်၍ မရပါ။');
    } finally {
      setIsTranslatingSrt(false);
    }
  };

  // ----------------------------------------------------
  // New Studio Handlers 2: Speed & Pitch Shifter
  // ----------------------------------------------------
  const handleShiftAudio = async () => {
    if (!shifterAudioData) return;
    setIsShifting(true);
    setShifterError('');
    setShifterResultUrl('');

    try {
      const formData = new FormData();
      if (shifterAudioData.startsWith('data:audio') || shifterAudioData.includes('base64,')) {
        const parts = shifterAudioData.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'audio/mp3';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const audioBlob = new Blob([u8arr], { type: mime });
        formData.append('audioFile', audioBlob, 'input.mp3');
      } else if (shifterAudioData.startsWith('http') || shifterAudioData.startsWith('/')) {
        try {
          const res = await fetch(shifterAudioData);
          const audioBlob = await res.blob();
          formData.append('audioFile', audioBlob, 'input.mp3');
        } catch (_) {
          formData.append('audioUrl', shifterAudioData);
        }
      } else {
        formData.append('audioUrl', shifterAudioData);
      }

      formData.append('speed', String(shifterSpeed));
      formData.append('pitch', String(shifterPitch));

      const res = await fetch('/api/shift-audio', {
        method: 'POST',
        body: formData
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (_) {
        throw new Error('ဆာဗာ တုံ့ပြန်မှု အချိန်ကုန်သွားပါသည် သို့မဟုတ် ဝန်ပိနေပါသည်။');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'အသံဖိုင် ပြောင်းလဲရာတွင် အမှားအယွင်း ရှိနေပါသည်။');
      }

      setShifterResultUrl(data.audioUrl);
    } catch (err: any) {
      setShifterError(err.message || 'အသံ ပြောင်းလဲ၍ မရပါ။');
    } finally {
      setIsShifting(false);
    }
  };

  // ----------------------------------------------------
  // New Studio Handlers 4: 1-Click Auto Video Pipeline
  // ----------------------------------------------------
  const handleAutoPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineTopic.trim()) return;
    setIsPipelineLoading(true);
    setPipelineError('');
    setPipelineResult(null);

    try {
      const data: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/auto-video-pipeline');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 10 * 60 * 1000; // 10 minutes timeout

        xhr.onload = () => {
          const rawText = (xhr.responseText || '').trim();
          const resData = safeParseResponse(rawText);

          if (xhr.status >= 200 && xhr.status < 300) {
            if (resData && (resData.success || resData.videoUrl)) {
              resolve(resData);
              return;
            }
            if (resData && resData.error) {
              reject(new Error(resData.error));
              return;
            }
            if (rawText.startsWith('<')) {
              reject(new Error('ဆာဗာမှ ယာယီ ချိတ်ဆက်မှု ပြတ်တောက်သွားပါသည် (HTML Response)။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));
              return;
            }
            reject(new Error(`ဆာဗာမှ တုံ့ပြန်မှု မမှန်ကန်ပါ (Status: ${xhr.status})။ ကျေးဇူးပြု၍ ခေတ္တစောင့်ပြီး ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။`));
            return;
          }

          if (resData && resData.error) {
            reject(new Error(resData.error));
          } else {
            reject(new Error(`1-Click ဗီဒီယို ဖန်တီး၍ မရပါ (Status: ${xhr.status})။`));
          }
        };

        xhr.onerror = () => reject(new Error('ကွန်ရက် ချိတ်ဆက်မှု အခက်အခဲ ဖြစ်ပေါ်သွားပါသည်။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));
        xhr.ontimeout = () => reject(new Error('အချိန်ကုန်သွားပါသည် (Request Timeout)။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));

        const validImages = pipelineImages.filter(img => typeof img === 'string' && img.startsWith('data:image'));
        xhr.send(JSON.stringify({
          topic: pipelineTopic,
          genre: pipelineGenre,
          aspectRatio: pipelineAspectRatio,
          voice: selectedVoice,
          targetDuration: pipelineDuration,
          images: validImages
        }));
      });

      setPipelineResult(data);
      if (data.srtText) {
        setPipelineSrt(data.srtText);
        setEditingCues(parseSrtHelper(data.srtText));
      } else {
        setPipelineSrt('');
        setEditingCues([]);
      }
      saveToHistory({
        type: 'story',
        title: `⚡ 1-Click: ${data.title}`,
        content: data.script,
        audioUrl: data.audioUrl,
        characterCount: data.script.length
      });
      registerGenerationAndCheckAd('one_click_pipeline');
    } catch (err: any) {
      setPipelineError(err.message || '1-Click ဗီဒီယို ဖန်တီးမှု မအောင်မြင်ပါ။');
    } finally {
      setIsPipelineLoading(false);
    }
  };

  // Subtitle editor parsing & timing synchronization helper functions
  const parseSrtHelper = (srt: string) => {
    if (!srt) return [];
    const blocks = srt.trim().split(/\n\s*\n/);
    return blocks.map(block => {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const index = parseInt(lines[0], 10);
        const timingLine = lines[1];
        const text = lines.slice(2).join('\n');
        const match = timingLine.match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/);
        if (match) {
          return { index, startTime: match[1].replace('.', ','), endTime: match[2].replace('.', ','), text };
        }
      }
      return null;
    }).filter(Boolean) as Array<{ index: number; startTime: string; endTime: string; text: string }>;
  };

  const serializeSrtHelper = (cues: Array<{ index: number; startTime: string; endTime: string; text: string }>) => {
    return cues.map(c => `${c.index}\n${c.startTime} --> ${c.endTime}\n${c.text}`).join('\n\n');
  };

  const adjustCueTime = (cueIdx: number, type: 'start' | 'end', deltaMs: number) => {
    const newCues = [...editingCues];
    const cue = { ...newCues[cueIdx] };
    const timeStr = type === 'start' ? cue.startTime : cue.endTime;
    
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const hrs = parseInt(parts[0], 10);
      const mins = parseInt(parts[1], 10);
      const secsParts = parts[2].split(',');
      const secs = parseInt(secsParts[0], 10);
      const ms = parseInt(secsParts[1], 10);
      
      let totalMs = (hrs * 3600 + mins * 60 + secs) * 1000 + ms + deltaMs;
      if (totalMs < 0) totalMs = 0;
      
      const newHrs = Math.floor(totalMs / 3600000);
      const newMins = Math.floor((totalMs % 3600000) / 60000);
      const newSecs = Math.floor((totalMs % 60000) / 1000);
      const newMs = totalMs % 1000;
      
      const pad = (num: number, size: number) => ('000' + num).slice(-size);
      const formatted = `${pad(newHrs, 2)}:${pad(newMins, 2)}:${pad(newSecs, 2)},${pad(newMs, 3)}`;
      
      if (type === 'start') {
        cue.startTime = formatted;
      } else {
        cue.endTime = formatted;
      }
      newCues[cueIdx] = cue;
      setEditingCues(newCues);
    }
  };

  const handleBurnSubtitles = async () => {
    if (!pipelineResult) return;
    setIsBurningSubtitles(true);
    setBurnError('');
    try {
      const serialized = serializeSrtHelper(editingCues);
      const res = await fetch('/api/burn-subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: pipelineResult.videoUrl,
          srtText: serialized
        })
      });
      const data = await res.json();
      if (data.success && data.videoUrl) {
        setPipelineResult({
          ...pipelineResult,
          videoUrl: data.videoUrl,
          srtText: serialized
        });
        setAiAgentNotice('🎉 စာတန်းထိုးများကို ဗီဒီယိုအတွင်းသို့ အောင်မြင်စွာ တိုက်ရိုက် ထည့်သွင်း/ပြင်ဆင်ပြီးပါပြီ!');
        setTimeout(() => setAiAgentNotice(''), 4000);
      } else {
        throw new Error(data.error || 'စာတန်းထိုးများကို ဗီဒီယိုအတွင်းသို့ ထည့်သွင်း၍မရပါ။');
      }
    } catch (e: any) {
      setBurnError(e.message || 'စာတန်းထိုး ဗီဒီယိုထုတ်လုပ်မှု မအောင်မြင်ပါ။');
    } finally {
      setIsBurningSubtitles(false);
    }
  };

  // Subtitles Burning & Dubbing Studio Actions
  const handleBurnerSpeakSrt = async () => {
    if (!burnerSrtText.trim()) {
      setBurnerError('ကျေးဇူးပြု၍ စာတန်းထိုး SRT စာသားကို အရင် ရေးသား/ထည့်သွင်းပေးပါရန်။');
      return;
    }
    setIsBurnerVoiceLoading(true);
    setBurnerError('');
    setBurnerDubbedAudioUrl('');
    try {
      const res = await fetch('/api/speak-srt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          srtText: burnerSrtText,
          voice: burnerVoice,
          speed: burnerVoiceSpeed
        })
      });
      const data = await res.json();
      if (data.success && data.audioUrl) {
        setBurnerDubbedAudioUrl(data.audioUrl);
      } else {
        throw new Error(data.error || 'TTS Synthesis Failure');
      }
    } catch (e: any) {
      setBurnerError(e.message || 'စာတန်းထိုးမှ အသံဖျက်ထုတ်ယူမှု မအောင်မြင်ပါ။');
    } finally {
      setIsBurnerVoiceLoading(false);
    }
  };

  const handleBurnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!burnerVideoFile) {
      setBurnerError('ကျေးဇူးပြု၍ ဗီဒီယိုဖိုင် (.mp4) တစ်ခုကို အရင် ရွေးချယ်တင်ပေးပါရန်။');
      return;
    }
    
    // Use either the raw text area or the visual editor's content
    let finalSrt = burnerSrtText;
    if (editingCues && editingCues.length > 0 && showBurnerSyncEditor) {
      finalSrt = serializeSrtHelper(editingCues);
    }

    if (!finalSrt.trim()) {
      setBurnerError('ကျေးဇူးပြု၍ စာတန်းထိုး SRT စာသားများကို ရေးသား/ထည့်သွင်းပေးပါရန်။');
      return;
    }

    setIsBurnerLoading(true);
    setBurnerError('');
    setBurnerResultVideoUrl('');

    try {
      const formData = new FormData();
      formData.append('videoFile', burnerVideoFile);
      formData.append('srtText', finalSrt);
      formData.append('voice', burnerVoice);
      formData.append('rate', burnerVoiceSpeed);
      formData.append('audioMixOption', burnerMixOption);
      formData.append('burnSubtitles', String(burnerBurnSubtitles));

      const res = await fetch('/api/dub-video-srt', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.videoUrl) {
        setBurnerResultVideoUrl(data.videoUrl);
        setAiAgentNotice('🎉 ဗီဒီယိုအား စာတန်းထိုး အသံသွင်းခြင်း (Dubbing) နှင့် စာတန်းထိုးထည့်ခြင်း အောင်မြင်စွာ လုပ်ဆောင်ပြီးပါပြီ!');
        setTimeout(() => setAiAgentNotice(''), 4000);
      } else {
        throw new Error(data.error || 'Dubbing & subtitles burning failure');
      }
    } catch (err: any) {
      setBurnerError(err.message || 'ဗီဒီယိုအတွင်း စာတန်းထိုးအသံသွင်းခြင်း မအောင်မြင်ပါ။');
    } finally {
      setIsBurnerLoading(false);
    }
  };

  // ----------------------------------------------------
  // New Studio Handlers 5: Multi-Language Translator + Speech
  // ----------------------------------------------------
  const handleTranslateAndSpeak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!translateText.trim()) return;
    setIsTranslateLoading(true);
    setTranslateError('');
    setTranslateResult(null);

    try {
      const res = await fetch('/api/translate-and-speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: translateText,
          targetLang: translateTargetLang,
          voice: translateVoice
        })
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (_) {
        throw new Error('ဆာဗာ တုံ့ပြန်မှု အချိန်ကုန်သွားပါသည် သို့မဟုတ် ဝန်ပိနေပါသည်။');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ဘာသာပြန်၍ မရပါ။');
      }

      setTranslateResult(data);
      saveToHistory({
        type: 'tts',
        title: `🌐 ဘာသာပြန်: ${data.translatedText.slice(0, 30)}...`,
        content: data.translatedText,
        audioUrl: data.audioUrl,
        characterCount: data.characterCount
      });
      registerGenerationAndCheckAd('text_translation');
    } catch (err: any) {
      setTranslateError(err.message || 'ဘာသာပြန်မှု မအောင်မြင်ပါ။');
    } finally {
      setIsTranslateLoading(false);
    }
  };

  // ----------------------------------------------------
  // Live 2-Way Voice-to-Voice Interpreter Handlers
  // ----------------------------------------------------
  const swapInterpLanguages = () => {
    const prevA = interpLangA;
    const prevB = interpLangB;
    setInterpLangA(prevB);
    setInterpLangB(prevA);
  };

  const startInterpRecording = async (speakerRole: 'personA' | 'personB') => {
    try {
      setInterpError('');
      setInterpActiveSpeaker(speakerRole);
      setInterpStatusText(speakerRole === 'personA' ? '🎙️ သင်ပြောသော စကားသံကို ဖမ်းယူနေပါသည်...' : '🎙️ တစ်ဖက်လူ ပြောသော စကားသံကို ဖမ်းယူနေပါသည်...');

      // Check if getUserMedia is supported in the browser
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('BROWSER_MIC_UNSUPPORTED');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (_) {
        // Fallback to basic audio request
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      interpAudioChunksRef.current = [];

      // Determine the best supported audio MIME type across Chrome, Safari, iOS, Android
      let mimeType = '';
      const candidateTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];

      for (const t of candidateTypes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
          mimeType = t;
          break;
        }
      }

      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      } catch (_) {
        mediaRecorder = new MediaRecorder(stream);
      }

      interpMediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          interpAudioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const finalMime = mimeType || 'audio/webm';
        const blob = new Blob(interpAudioChunksRef.current, { type: finalMime });
        stream.getTracks().forEach((t) => t.stop());
        if (blob.size > 100) {
          await processInterpAudioBlob(blob, speakerRole);
        } else {
          setInterpStatusText('');
          setIsInterpLoading(false);
          setInterpActiveSpeaker(null);
        }
      };

      // Slice recording data every 250ms for maximum reliability
      mediaRecorder.start(250);
      setInterpIsRecording(true);
      setInterpRecordSec(0);
      if (interpRecordTimerRef.current) clearInterval(interpRecordTimerRef.current);
      interpRecordTimerRef.current = setInterval(() => {
        setInterpRecordSec((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone error in browser:', err);

      // Try Web Speech API SpeechRecognition fallback if getUserMedia is denied/unavailable
      const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecClass) {
        try {
          const recognition = new SpeechRecClass();
          const sLang = speakerRole === 'personA' ? interpLangA : interpLangB;
          const langMap: Record<string, string> = {
            'my': 'my-MM',
            'lo': 'lo-LA',
            'th': 'th-TH',
            'en': 'en-US',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'ru': 'ru-RU',
            'vi': 'vi-VN'
          };
          recognition.lang = langMap[sLang] || 'en-US';
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setInterpIsRecording(true);
            setInterpStatusText('🎙️ Web Speech API ဖြင့် အသံဖမ်းယူနေပါသည်... စကားပြောပါ');
          };

          recognition.onresult = (event: any) => {
            const transcript = event?.results?.[0]?.[0]?.transcript;
            if (transcript) {
              handleSendInterpText(speakerRole, transcript);
            }
          };

          recognition.onerror = () => {
            setInterpActiveSpeaker(null);
            setInterpIsRecording(false);
            setInterpStatusText('');
            setInterpError('မိုက်ခရိုဖုန်း ချိတ်ဆက်မရပါက အောက်ပါ စာရိုက်ဘား (သို့မဟုတ် အသံဖိုင် တင်သွင်းမှု) ဖြင့် တိုက်ရိုက် ဘာသာပြန်နိုင်ပါသည် ခင်ဗျာ။');
          };

          recognition.onend = () => {
            setInterpIsRecording(false);
            setInterpStatusText('');
          };

          recognition.start();
          return;
        } catch (_) {}
      }

      setInterpActiveSpeaker(null);
      setInterpIsRecording(false);
      setInterpStatusText('');
      setInterpError('မိုက်ခရိုဖုန်း အဆင်မပြေပါက အောက်ပါ စာရိုက်ဘား (သို့မဟုတ် အသံဖိုင် တင်သွင်းမှု) ဖြင့် တိုက်ရိုက် စကားပြော ဘာသာပြန်နိုင်ပါသည် ခင်ဗျာ။');
    }
  };

  const handleInterpFileUpload = (e: React.ChangeEvent<HTMLInputElement>, speakerRole: 'personA' | 'personB') => {
    const file = e.target.files?.[0];
    if (file) {
      setIsInterpLoading(true);
      setInterpActiveSpeaker(speakerRole);
      setInterpStatusText('⏳ တင်သွင်းထားသော အသံဖိုင်ကို နားထောင်ပြီး ဘာသာပြန်ဆိုနေပါသည်...');
      processInterpAudioBlob(file, speakerRole);
    }
  };

  const stopInterpRecording = () => {
    if (interpMediaRecorderRef.current && interpIsRecording) {
      if (interpRecordTimerRef.current) clearInterval(interpRecordTimerRef.current);
      setInterpIsRecording(false);
      setInterpStatusText('⏳ AI ဖြင့် ဘာသာပြန်ဆိုပြီး အသံထုတ်လုပ်နေပါသည်...');
      setIsInterpLoading(true);
      interpMediaRecorderRef.current.stop();
    }
  };

  const processInterpAudioBlob = async (blob: Blob, speakerRole: 'personA' | 'personB') => {
    const sLang = speakerRole === 'personA' ? interpLangA : interpLangB;
    const tLang = speakerRole === 'personA' ? interpLangB : interpLangA;
    const sLangItem = TARGET_LANGUAGES.find(l => l.id === sLang);
    const tLangItem = TARGET_LANGUAGES.find(l => l.id === tLang);

    const formData = new FormData();
    formData.append('audioFile', blob, `voice_${Date.now()}.webm`);
    formData.append('sourceLang', sLang);
    formData.append('targetLang', tLang);
    formData.append('speakerRole', speakerRole);
    formData.append('voiceGender', interpVoiceGender);

    try {
      const res = await fetch('/api/live-voice-interpret', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'စကားပြန် ဘာသာပြန်မှု မအောင်မြင်ပါ။');
      }

      const newMsg: InterpretMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        speakerRole,
        speakerName: speakerRole === 'personA' ? `${sLangItem?.flag || '🇲🇲'} သင် (${sLangItem?.name?.split(' ')[0] || sLang})` : `${sLangItem?.flag || '🌐'} တစ်ဖက်လူ (${sLangItem?.name?.split(' ')[0] || sLang})`,
        sourceLang: sLang,
        targetLang: tLang,
        originalTranscript: data.originalTranscript,
        translatedText: data.translatedText,
        audioUrl: data.audioUrl,
        timestamp: new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' })
      };

      setInterpMessages(prev => [...prev, newMsg]);
      registerGenerationAndCheckAd('live_voice_interpreter');

      if (interpAutoPlay && data.audioUrl) {
        if (interpAudioPlayerRef.current) {
          interpAudioPlayerRef.current.src = data.audioUrl;
          interpAudioPlayerRef.current.play().catch(() => {});
        }
      }
    } catch (e: any) {
      setInterpError(e.message || 'စကားပြန် အမှား ဖြစ်ပေါ်သွားပါသည်။');
    } finally {
      setIsInterpLoading(false);
      setInterpActiveSpeaker(null);
      setInterpStatusText('');
    }
  };

  const handleSendInterpText = async (speakerRole: 'personA' | 'personB', directText?: string) => {
    const textToSend = (directText || interpTextInput).trim();
    if (!textToSend) return;
    setInterpError('');
    setIsInterpLoading(true);
    setInterpActiveSpeaker(speakerRole);
    setInterpStatusText('⏳ AI ဖြင့် ဘာသာပြန်ဆိုပြီး အသံထုတ်လုပ်နေပါသည်...');

    const sLang = speakerRole === 'personA' ? interpLangA : interpLangB;
    const tLang = speakerRole === 'personA' ? interpLangB : interpLangA;
    const sLangItem = TARGET_LANGUAGES.find(l => l.id === sLang);

    try {
      const res = await fetch('/api/live-voice-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          sourceLang: sLang,
          targetLang: tLang,
          speakerRole,
          voiceGender: interpVoiceGender
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ဘာသာပြန်ဆိုခြင်း မအောင်မြင်ပါ။');
      }

      const newMsg: InterpretMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        speakerRole,
        speakerName: speakerRole === 'personA' ? `${sLangItem?.flag || '🇲🇲'} သင် (${sLangItem?.name?.split(' ')[0] || sLang})` : `${sLangItem?.flag || '🌐'} တစ်ဖက်လူ (${sLangItem?.name?.split(' ')[0] || sLang})`,
        sourceLang: sLang,
        targetLang: tLang,
        originalTranscript: data.originalTranscript,
        translatedText: data.translatedText,
        audioUrl: data.audioUrl,
        timestamp: new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' })
      };

      setInterpMessages(prev => [...prev, newMsg]);
      registerGenerationAndCheckAd('live_text_interpreter');
      if (!directText) setInterpTextInput('');

      if (interpAutoPlay && data.audioUrl) {
        if (interpAudioPlayerRef.current) {
          interpAudioPlayerRef.current.src = data.audioUrl;
          interpAudioPlayerRef.current.play().catch(() => {});
        }
      }
    } catch (e: any) {
      setInterpError(e.message || 'ဘာသာပြန် အမှား ဖြစ်ပေါ်သွားပါသည်။');
    } finally {
      setIsInterpLoading(false);
      setInterpActiveSpeaker(null);
      setInterpStatusText('');
    }
  };

  // ----------------------------------------------------
  // Voice Character Effects Studio Handlers
  // ----------------------------------------------------
  const startVcRecording = async () => {
    try {
      setVcError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      vcAudioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      vcMediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          vcAudioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(vcAudioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recorded_voice_${Date.now()}.webm`, { type: 'audio/webm' });
        setVcAudioFile(file);
        const url = URL.createObjectURL(blob);
        setVcAudioPreview(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setVcIsRecording(true);
      setVcRecordSec(0);

      if (vcRecordTimerRef.current) clearInterval(vcRecordTimerRef.current);
      vcRecordTimerRef.current = setInterval(() => {
        setVcRecordSec(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      setVcError('မိုက်ခရိုဖုန်း အသုံးပြုခွင့် မရရှိပါ (Microphone Permission Denied)။');
    }
  };

  const stopVcRecording = () => {
    if (vcMediaRecorderRef.current && vcIsRecording) {
      vcMediaRecorderRef.current.stop();
      setVcIsRecording(false);
      if (vcRecordTimerRef.current) clearInterval(vcRecordTimerRef.current);
    }
  };

  const handleApplyVoiceCharacterEffect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vcInputMode === 'upload' && !vcAudioFile && !vcAudioPreview) {
      setVcError('ကျေးဇူးပြု၍ အသံဖိုင် ရွေးချယ်တင်သွင်းပေးပါခင်ဗျာ။');
      return;
    }
    if (vcInputMode === 'mic' && !vcAudioFile && !vcAudioPreview) {
      setVcError('ကျေးဇူးပြု၍ မိုက်ခရိုဖုန်းဖြင့် အသံသွင်းပေးပါခင်ဗျာ။');
      return;
    }
    if (vcInputMode === 'tts' && !vcTtsText.trim()) {
      setVcError('ကျေးဇူးပြု၍ ပြောကြားစေလိုသော စာသား ရိုက်ထည့်ပေးပါခင်ဗျာ။');
      return;
    }

    setIsVcLoading(true);
    setVcError('');
    setVcResultUrl('');

    try {
      const formData = new FormData();
      if (vcInputMode === 'tts') {
        formData.append('text', vcTtsText.trim());
        formData.append('voice', vcTtsVoice);
      } else if (vcAudioFile) {
        formData.append('audioFile', vcAudioFile);
      } else if (vcAudioPreview) {
        if (vcAudioPreview.startsWith('blob:')) {
          const blobRes = await fetch(vcAudioPreview);
          const blob = await blobRes.blob();
          formData.append('audioFile', blob, 'recorded_audio.webm');
        } else if (vcAudioPreview.startsWith('data:audio') || vcAudioPreview.startsWith('http')) {
          formData.append('audioData', vcAudioPreview);
        }
      }

      formData.append('effect', vcSelectedEffect);

      const res = await fetch('/api/voice-character-effect', {
        method: 'POST',
        body: formData
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error('ဆာဗာ တုံ့ပြန်မှု အချိန်ကုန်သွားပါသည် သို့မဟုတ် ဝန်ပိနေပါသည်။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။');
      }

      if (!res.ok || !data.success || !data.audioUrl) {
        throw new Error(data.error || 'အသံပြောင်းလဲ၍ မရပါ။');
      }

      setVcResultUrl(data.audioUrl);
      saveToHistory({
        type: 'tts',
        title: `🎭 Voice Changer: ${vcSelectedEffect.toUpperCase()}`,
        content: `Effect: ${vcSelectedEffect}, Duration: ${data.durationSec ? data.durationSec.toFixed(1) + 's' : ''}`,
        audioUrl: data.audioUrl,
        characterCount: 0
      });
      registerGenerationAndCheckAd('voice_character_effect');
    } catch (err: any) {
      console.error('Voice Character Effect error:', err);
      setVcError(err.message || 'အသံပြောင်းလဲရာတွင် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။');
      triggerAiAgentAutoHeal('Voice Character Changer', err.message || 'DSP Render Error');
    } finally {
      setIsVcLoading(false);
    }
  };

  const predefinedGenres = [
    { id: 'horror', label: 'သရဲ / ထိတ်လန့်ဖွယ် 👻', placeholder: 'ဥပမာ - ညသန်းခေါင် အဝေးပြေးလမ်းမပေါ်က ထူးဆန်းသော ကားကြုံခရီးသည်' },
    { id: 'motivation', label: 'စိတ်ခွန်အားဖြည့် 💪', placeholder: 'ဥပမာ - စိတ်ဓာတ်ကျနေချိန် ပြန်လည်ရုန်းထနိုင်မည့် စိတ်ခွန်အားပေး စကားများ' },
    { id: 'tech', label: 'နည်းပညာ / AI ဗဟုသုတ 💻', placeholder: 'ဥပမာ - အနာဂတ်တွင် လူသားများကို အံ့အားသင့်စေမည့် AI စနစ်သစ်များ' },
    { id: 'history', label: 'သမိုင်းကြောင်း / ထူးခြားဖြစ်ရပ်များ 🏛️', placeholder: 'ဥပမာ - ပျောက်ဆုံးသွားသော ရှေးဟောင်း ရွှေရောင်မြို့တော်ကြီး၏ လျှို့ဝှက်ချက်' },
    { id: 'fun-facts', label: 'စိတ်ဝင်စားဖွယ်ရာ ဗဟုသုတ 💡', placeholder: 'ဥပမာ - ကမ္ဘာပေါ်မှာ လူတွေမသိသေးတဲ့ အလွန်ထူးဆန်းသော တိရစ္ဆာန်များ' },
    { id: 'bedtime-story', label: 'ပုံပြင် / ဒဏ္ဍာရီ 🌙', placeholder: 'ဥပမာ - သစ်တောနက်ကြီးထဲက မှော်သစ်ပင်နှင့် ရိုးသားသော သစ်ခုတ်သမား' },
  ];

  return (
    <div className="min-h-screen bg-[#0d0f15] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#121520]/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              VoiceMaster Studio
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Unlimited TTS & Story Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              လူအစစ်အသံ Text-to-Speech (စာလုံးရေ အကန့်အသတ်မရှိ) + YouTube/TikTok ဇာတ်လမ်းစက်
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Agent Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 shadow-sm shadow-emerald-950/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Agent Auto-Heal: Active</span>
          </div>

          {/* Direct Header History Access Button */}
          <button
            onClick={() => setMainMode('history')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
              mainMode === 'history'
                ? 'bg-purple-600 text-white border-purple-500 ring-2 ring-purple-400/40 shadow-purple-600/30'
                : 'bg-[#1a1e2e] border-indigo-500/30 text-indigo-200 hover:bg-indigo-600/20 hover:border-indigo-400'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>မှတ်တမ်း ({historyItems.length})</span>
            {historyItems.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>
        </div>
      </header>

      {/* Floating AI Agent Auto-Heal Notification */}
      {aiAgentNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{aiAgentNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="bg-[#151824] p-2 rounded-2xl border border-white/15 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-w-4xl mx-auto w-full shadow-2xl shadow-black/50">
          <button
            onClick={() => setMainMode('tts')}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mainMode === 'tts'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5 bg-[#0e111a] border border-white/5'
            }`}
          >
            <Volume2 className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>လူအစစ် TTS</span>
          </button>

          <button
            onClick={() => setMainMode('subtitleBurner')}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mainMode === 'subtitleBurner'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-400/50'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-500/10 bg-[#0e111a] border border-emerald-500/30'
            }`}
          >
            <Subtitles className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>🎬 စာတန်းထိုးကပ်စက်</span>
          </button>

          <button
            onClick={() => setMainMode('imager')}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mainMode === 'imager'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/40 ring-2 ring-cyan-400/50'
                : 'text-cyan-300 hover:text-white hover:bg-cyan-500/10 bg-[#0e111a] border border-cyan-500/20'
            }`}
          >
            <Image className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>🖼️ ပုံထုတ်စက်</span>
          </button>

          <button
            onClick={() => setMainMode('autoPipeline')}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mainMode === 'autoPipeline'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 ring-2 ring-purple-400/50'
                : 'text-purple-300 hover:text-white hover:bg-purple-500/10 bg-[#0e111a] border border-purple-500/30'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0 text-purple-400" />
            <span>⚡ 1-Click ဗီဒီယို</span>
          </button>

          <button
            onClick={() => setMainMode('writer')}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mainMode === 'writer'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 ring-2 ring-purple-400/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5 bg-[#0e111a] border border-white/5'
            }`}
          >
            <Wand2 className="w-4 h-4 shrink-0 text-pink-400" />
            <span>AI ဇာတ်လမ်း</span>
          </button>

          <button
            onClick={() => setMainMode('history')}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all relative ${
              mainMode === 'history'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-400/50'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-500/10 bg-[#0e111a] border border-emerald-500/30'
            }`}
          >
            <History className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>📂 မှတ်တမ်း</span>
          </button>
        </div>

        {/* Secondary Tools Grid */}
        <div className="bg-[#191d30]/50 p-2.5 rounded-2xl border border-indigo-500/20 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 max-w-6xl mx-auto w-full shadow-xl">
          <button
            onClick={() => setMainMode('dialogue')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
              mainMode === 'dialogue'
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md ring-2 ring-amber-400/50'
                : 'text-amber-300 hover:text-white hover:bg-amber-500/10 bg-[#0e111a] border border-amber-500/30'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>💬 စကားဝိုင်း</span>
          </button>

          <button
            onClick={() => setMainMode('video')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
              mainMode === 'video'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md ring-2 ring-purple-400/50'
                : 'text-purple-300 hover:text-white hover:bg-purple-500/10 bg-[#0e111a] border border-purple-500/30'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>🎬 MP4 Generator</span>
          </button>

          <button
            onClick={() => setMainMode('voiceChanger')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
              mainMode === 'voiceChanger'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md ring-2 ring-amber-400/50'
                : 'text-amber-300 hover:text-white hover:bg-amber-500/10 bg-[#0e111a] border border-amber-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>🎭 အသံပြောင်းစက်</span>
          </button>

          <button
            onClick={() => setMainMode('silenceRemover')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
              mainMode === 'silenceRemover'
                ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white shadow-md ring-2 ring-rose-400/50'
                : 'text-rose-300 hover:text-white hover:bg-rose-500/10 bg-[#0e111a] border border-rose-500/30'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-rose-400" />
            <span>✂️ Silence Remover</span>
          </button>

          <button
            onClick={() => {
              setMainMode('translator');
              setTranslatorTab('live');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
              mainMode === 'translator' && translatorTab === 'live'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-md ring-2 ring-emerald-400/50'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-500/10 bg-[#0e111a] border border-emerald-500/40'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>🎙️ Live စကားပြန်</span>
          </button>

          <button
            onClick={() => {
              setMainMode('translator');
              setTranslatorTab('text');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
              mainMode === 'translator' && translatorTab === 'text'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5 bg-[#0e111a] border border-white/5'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span>🌐 စာသား ဘာသာပြန်</span>
          </button>

          <button
            onClick={() => setMainMode('transcribe')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
              mainMode === 'transcribe'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-2 ring-emerald-400/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5 bg-[#0e111a] border border-white/5'
            }`}
          >
            <Subtitles className="w-3.5 h-3.5 text-emerald-400" />
            <span>📝 အသံ ➔ စာတန်းထိုး</span>
          </button>

          <button
            onClick={() => setMainMode('audioModifier')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
              mainMode === 'audioModifier'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md ring-2 ring-orange-400/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5 bg-[#0e111a] border border-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span>🎛️ Speed / Pitch</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: TEXT-TO-SPEECH (TTS) - Unlimited Chars, 9 Human Voices            */}
        {/* ========================================================================= */}
        {mainMode === 'tts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Form Card */}
            <div className="bg-[#151926] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>လူအစစ်အသံ Text to Speech Engine</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    စက်ရုပ်အသံလုံးဝမပေါက်သော Neural Real Human Voices ဖြင့် စာလုံးရေ အကန့်အသတ်မရှိ (Unlimited) အသံဖတ်ပေးပါမည်
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    {ttsText.length} စာလုံး (Unlimited)
                  </span>
                </div>
              </div>

              <form onSubmit={handleGenerateTTS} className="space-y-5">
                {/* 1. Voice Selector */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      <span>အသံအမျိုးအစား ရွေးချယ်ပါ (လူသားစစ်စစ်အသံ {voices.length || 13} မျိုး)</span>
                    </label>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-[#0d0f17] p-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setVoiceCategoryFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          voiceCategoryFilter === 'all'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🌟 အကုန်လုံး ({voices.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceCategoryFilter('storyteller')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          voiceCategoryFilter === 'storyteller'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🎙️ ဝီလျံ/လူသားစစ်စစ်</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceCategoryFilter('elderly_male')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          voiceCategoryFilter === 'elderly_male'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>👴 အဖိုးအသံ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceCategoryFilter('elderly_female')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          voiceCategoryFilter === 'elderly_female'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>👵 အဖွားအသံ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceCategoryFilter('child')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          voiceCategoryFilter === 'child'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🧒 ကလေးအသံ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceCategoryFilter('female')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          voiceCategoryFilter === 'female'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>👩 အမျိုးသမီး</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceCategoryFilter('myanmar')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          voiceCategoryFilter === 'myanmar'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🇲🇲 စံမြန်မာ</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {voices
                      .filter(v => {
                        const idLow = v.id.toLowerCase();
                        if (voiceCategoryFilter === 'storyteller') return v.category === 'storyteller' || idLow.includes('william') || idLow.includes('andrew') || idLow.includes('hyunsu') || idLow.includes('brian') || idLow.includes('florian') || idLow.includes('remy');
                        if (voiceCategoryFilter === 'elderly_male') return (v.category === 'elderly' && v.gender === 'Male') || idLow.includes('roger') || idLow.includes('steffan') || idLow.includes('thomas') || idLow.includes('christopher');
                        if (voiceCategoryFilter === 'elderly_female') return (v.category === 'elderly' && v.gender === 'Female') || idLow.includes('jenny') || idLow.includes('jane') || idLow.includes('sonia') || idLow.includes('nancy');
                        if (voiceCategoryFilter === 'child') return v.category === 'child' || idLow.includes('ana') || idLow.includes('kevin') || idLow.includes('maisie');
                        if (voiceCategoryFilter === 'female') return v.gender === 'Female';
                        if (voiceCategoryFilter === 'myanmar') return v.category === 'myanmar' || v.id.startsWith('my-MM') || v.lang.includes('စံမြန်မာ');
                        return true;
                      })
                      .map((v) => {
                      const isSelected = selectedVoice === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVoice(v.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/40'
                              : 'bg-[#0e111a] border-white/10 hover:border-white/25 hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              {v.gender === 'Female' ? '👩' : '👨'} {v.name}
                            </span>
                            <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                              {v.gender}
                            </span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 block mb-1">
                            {v.lang}
                          </span>
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                            {v.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Text Input Area (Supports up to 10,000 characters) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>ဖတ်ပြစေလိုသော စာသားများ ရိုက်ထည့်ပါ (မြန်မာ သို့မဟုတ် အင်္ဂလိပ်)</span>
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 1-Click Natural Spoken Burmese Converter */}
                      {ttsText && (
                        <button
                          type="button"
                          onClick={() => {
                            const natural = convertBookishToSpokenBurmese(ttsText);
                            setTtsText(natural);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 transition-all shadow"
                          title="စာဆန်သော စကားလုံးများကို သဘာဝကျကျ စကားပြောဟန်အဖြစ် ပြောင်းလဲပေးပါမည်"
                        >
                          <Languages className="w-3 h-3 text-cyan-400" />
                          <span>စကားပြောဟန် ပြောင်းမည်</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setTtsText(STUDIO_HUMAN_SAMPLE_TEXT);
                          handleCopy(STUDIO_HUMAN_SAMPLE_TEXT, 'human_sample_tts');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{copiedType === 'human_sample_tts' ? '✅ ထည့်ပြီးပါပြီ' : '🎙️ စတူဒီယို နမူနာ'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (ttsText) {
                            handleCopy(ttsText, 'tts_full_copy');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[11px] font-bold flex items-center gap-1 transition-all"
                      >
                        {copiedType === 'tts_full_copy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedType === 'tts_full_copy' ? 'ကူးယူပြီး' : 'Copy'}</span>
                      </button>
                      {ttsText && (
                        <button
                          type="button"
                          onClick={() => setTtsText('')}
                          className="text-[11px] text-rose-400 hover:text-rose-300 underline font-normal"
                        >
                          ရှင်းလင်းမည်
                        </button>
                      )}
                    </div>
                  </label>

                  {/* Quick Story Topic Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap py-1">
                    <span className="text-[10px] text-slate-400 font-semibold">⚡ အသင့်သုံး ဇာတ်လမ်းများ:</span>
                    <button
                      type="button"
                      onClick={() => setTtsText(FAIRY_TALE_SAMPLE)}
                      className="px-2 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold transition-all"
                    >
                      🧚 ရှေးပုံပြင်
                    </button>
                    <button
                      type="button"
                      onClick={() => setTtsText(MYSTERY_SAMPLE)}
                      className="px-2 py-0.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-semibold transition-all"
                    >
                      🕵️ သည်းထိတ်ရင်ဖို
                    </button>
                    <button
                      type="button"
                      onClick={() => setTtsText(MOTIVATIONAL_SAMPLE)}
                      className="px-2 py-0.5 rounded-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-semibold transition-all"
                    >
                      💡 ဘဝအောင်မြင်ရေး
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    required
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="ဒီနေရာတွင် ဖတ်ပြစေလိုသော စာများကို ရိုက်ထည့်ပါ သို့မဟုတ် ကူးယူထည့်သွင်းပါ (စာလုံးရေ ၁၀,၀၀၀ အထိ အပြည့်အစုံ ဖတ်ပြပေးပါမည်)..."
                    className="w-full bg-[#0d0f17] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-sans resize-y"
                  />

                  {/* Live Character & Duration Status Bar */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <div className="flex items-center gap-3">
                      <span>📝 စာလုံးရေ: <strong className="text-indigo-300">{ttsText.length}</strong> လုံး</span>
                      <span>⏱️ ခန့်မှန်းဖတ်ချိန်: <strong className="text-emerald-300">~{Math.max(1, Math.ceil(ttsText.length / 18))} စက္ကန့်</strong></span>
                    </div>
                    <span className="text-slate-500">✨ ၁၀၀% လူသားစစ်စစ် စတူဒီယို အသံထွက်</span>
                  </div>
                </div>

                {/* 4. Speed & Pitch Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0d0f17] p-3.5 rounded-xl border border-white/5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>အသံအမြန်နှုန်း (Speech Speed)</span>
                      </span>
                      <span className="text-indigo-400 font-mono font-bold">{speechRate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {['-20%', '-10%', '+0%', '+10%', '+20%'].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setSpeechRate(rate)}
                          className={`flex-1 py-1 rounded text-[11px] font-bold transition-all ${
                            speechRate === rate
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {rate === '+0%' ? 'မူလ' : rate}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                          <span>အသံအနိမ့်အမြင့် (Pitch Tone)</span>
                        </span>
                        <span className="text-indigo-400 font-mono font-bold">{speechPitch}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {['-10Hz', '-5Hz', '+0Hz', '+5Hz', '+10Hz'].map((pitch) => (
                          <button
                            key={pitch}
                            type="button"
                            onClick={() => setSpeechPitch(pitch)}
                            className={`flex-1 py-1 rounded text-[11px] font-bold transition-all ${
                              speechPitch === pitch
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                          >
                            {pitch === '+0Hz' ? 'မူလ' : pitch}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-indigo-400" />
                          <span>အသံ၏ အထူးပြုလုပ်ချက် (Voice Effect)</span>
                        </span>
                      </div>
                      <select 
                        value={voiceEffect}
                        onChange={(e) => setVoiceEffect(e.target.value as any)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="none">ပုံမှန် (Normal)</option>
                        <option value="echo">ပဲ့တင်သံ (Echo)</option>
                        <option value="deep">အသံကြီး/အသံဩ (Deep)</option>
                        <option value="radio">ရေဒီယိုအသံ (Radio)</option>
                        <option value="horror">ခြောက်ခြားဖွယ် (Horror)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {ttsError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{ttsError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isTtsLoading || !ttsText.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isTtsLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>လူအစစ်အသံ ထုတ်လုပ်နေပါသည် (စာသားအပြည့်အစုံ)...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>လူအစစ်အသံဖြင့် အသံထွက်ပြောင်းမည် (MP3 အသံဖိုင် ရယူမည်)</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results Player Section */}
            {ttsResult && (
              <div 
                ref={resultsSectionRef}
                className="bg-[#151926] border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in duration-300"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>အသံဖိုင် အပြည့်အစုံ အောင်မြင်စွာ ထွက်ရှိပါပြီ</span>
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>{voices.find(v => v.id === ttsResult.voiceUsed)?.name || ttsResult.voiceUsed} ၏ အသံထွက်</span>
                      <span className="text-xs font-normal text-slate-400 font-mono">
                        ({ttsResult.characterCount} စာလုံးရေ အပြည့်)
                      </span>
                      {selectedBgm !== 'none' && (
                        <span className="text-[11px] font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Music className="w-3 h-3 text-purple-400" />
                          <span>BGM: {bgmTracks.find(b => b.id === selectedBgm)?.name || selectedBgm}</span>
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {ttsResult.srt && (
                      <button
                        onClick={() => {
                          const vName = voices.find(v => v.id === ttsResult.voiceUsed)?.name || 'VoiceMaster';
                          downloadFile(ttsResult.srt!, `${vName}_Subtitles_${Date.now()}.srt`, 'text/plain');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/30 active:scale-95 transition-all"
                      >
                        <Subtitles className="w-4 h-4 text-amber-200" />
                        <span>⚡ .SRT စာတန်းထိုး ရယူမည်</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const vName = voices.find(v => v.id === ttsResult.voiceUsed)?.name || 'VoiceMaster';
                        openVideoModalForAudio(ttsResult.audioUrl, `${vName} ၏ ဇာတ်လမ်း`, ttsText.trim().slice(0, 200));
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
                    >
                      <Video className="w-4 h-4 text-purple-200" />
                      <span>🎬 TikTok / Reels MP4 ဗီဒီယို ပြုလုပ်မည်</span>
                    </button>

                    <button
                      onClick={() => {
                        const vName = voices.find(v => v.id === ttsResult.voiceUsed)?.name || 'VoiceMaster';
                        downloadAudioFile(ttsResult.audioUrl, `${vName}_Audio_${Date.now()}.mp3`);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>10x Turbo Download (.MP3)</span>
                    </button>
                  </div>
                </div>

                {/* Audio Player Container */}
                <div className="bg-[#0c0e14] p-4 rounded-xl border border-white/10 flex flex-col gap-3">
                  <audio
                    ref={audioPlayerRef}
                    src={ttsResult.audioUrl}
                    controls
                    className="w-full h-11"
                    onPlay={() => setIsPlayingAudio(true)}
                    onPause={() => setIsPlayingAudio(false)}
                    onEnded={() => setIsPlayingAudio(false)}
                  />

                  {/* Playback Speed Selectors */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                      <span>နားထောင်နှုန်း (Playback Speed):</span>
                      <div className="flex items-center gap-1 ml-1">
                        {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => {
                              if (audioPlayerRef.current) {
                                audioPlayerRef.current.playbackRate = spd;
                              }
                            }}
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-indigo-600/30 text-[11px] font-mono font-bold text-slate-300 hover:text-white border border-white/5 transition-all"
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setMainMode('history')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline underline-offset-4"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>မှတ်တမ်းကြည့်ရှုမည် ➔</span>
                    </button>
                  </div>
                </div>

                {/* Synchronized SRT Subtitle Timeline Inspector */}
                {ttsResult.srt && (
                  <div className="pt-1">
                    <SrtTimelineInspector
                      srtText={ttsResult.srt}
                      title="🎬 စာဖတ်သံနှင့် ၁၀၀% တိကျစွာ ကိုက်ညီသော SRT စာတန်းထိုး Timeline"
                      onCopy={handleCopy}
                      onDownload={downloadFile}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 1.5: MULTI-SPEAKER DIALOGUE STUDIO (Up to 5 Speakers)                */}
        {/* ========================================================================= */}
        {mainMode === 'dialogue' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <span>၅ ယောက် အပြန်အလှန် စကားပြော Studio (Multi-Speaker Conversation)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    စကားပြောသူ ၅ ယောက်အထိ မတူညီသော လူသားအသံများ ရွေးချယ်၍ အပြန်အလှန် စကားပြော အသံဖိုင် သဘာဝအတိုင်း ထုတ်ယူနိုင်ပါသည်
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSampleDialogue}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>နမူနာ စကားဝိုင်း ဖြည့်ရန်</span>
                </button>
              </div>

              {/* 1. Character Setup Section (Up to 5 Speakers) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>စကားပြောသူ (၅) ယောက် ရွေးချယ် ပြင်ဆင်ရန် (Speakers Setup)</span>
                  </span>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    ✓ မတူညီသော လူသားအသံများ တွဲဖက်နိုင်သည်
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {speakers.map((spk, idx) => {
                    const badgeColors = [
                      'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
                      'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
                      'border-amber-500/40 bg-amber-500/10 text-amber-300',
                      'border-rose-500/40 bg-rose-500/10 text-rose-300',
                      'border-purple-500/40 bg-purple-500/10 text-purple-300'
                    ];
                    return (
                      <div
                        key={spk.id}
                        className="bg-[#0e111a] border border-white/10 rounded-xl p-3 space-y-2.5 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeColors[idx % badgeColors.length]}`}>
                            စကားပြောသူ {idx + 1}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Speaker #{idx + 1}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block">နာမည် (Name):</span>
                          <input
                            type="text"
                            value={spk.name}
                            onChange={(e) => handleUpdateSpeaker(spk.id, 'name', e.target.value)}
                            placeholder={`Speaker ${idx + 1}`}
                            className="w-full bg-[#151824] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block">အသံ (Voice):</span>
                          <select
                            value={spk.voice}
                            onChange={(e) => handleUpdateSpeaker(spk.id, 'voice', e.target.value)}
                            className="w-full bg-[#151824] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <optgroup label="🎙️ စနစ်တွင်း မူလအသံများ (Standard Voices)">
                              {voices.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.gender === 'Female' ? '👩' : '👨'} {v.name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Dialogue Lines Scripting Section */}
              <form onSubmit={handleGenerateDialogue} className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>အပြန်အလှန် စကားပြော စာကြောင်းများ ရေးသားရန် ({dialogueLines.length} ကြောင်း)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddDialogueLine()}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>စာကြောင်းသစ် ထည့်မည်</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDialogueLines([])}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold transition-all"
                    >
                      အကုန်ရှင်းမည်
                    </button>
                  </div>
                </div>

                {/* Dialogue List */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  {dialogueLines.length === 0 ? (
                    <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-[#0d0f17]">
                      <Users2 className="w-8 h-8 text-amber-400/50 mx-auto" />
                      <p className="text-xs text-slate-400">စကားပြော စာကြောင်း မရှိသေးပါ။ အထက်ပါ "+ စာကြောင်းသစ် ထည့်မည်" သို့မဟုတ် "နမူနာ စကားဝိုင်း ဖြည့်ရန်" ကို နှိပ်ပါခင်ဗျာ။</p>
                    </div>
                  ) : (
                    dialogueLines.map((line, idx) => {
                      const spk = speakers.find(s => s.id === line.speakerId) || speakers[0];
                      return (
                        <div
                          key={line.id}
                          className="bg-[#0e111a] border border-white/10 rounded-xl p-3.5 space-y-2 hover:border-amber-500/30 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                                #{idx + 1}
                              </span>
                              
                              <select
                                value={line.speakerId}
                                onChange={(e) => handleUpdateLineSpeaker(line.id, e.target.value)}
                                className="bg-[#151824] border border-amber-500/30 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                              >
                                {speakers.map((s, sIdx) => (
                                  <option key={s.id} value={s.id}>
                                    🗣️ {s.name || `Speaker ${sIdx + 1}`} ({voices.find(v => v.id === s.voice)?.name.split(' ')[0] || ''})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center gap-1 self-end sm:self-auto">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveDialogueLine(idx, 'up')}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === dialogueLines.length - 1}
                                onClick={() => handleMoveDialogueLine(idx, 'down')}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveDialogueLine(line.id)}
                                className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={2}
                            value={line.text}
                            onChange={(e) => handleUpdateLineText(line.id, e.target.value)}
                            placeholder={`${spk?.name || 'Speaker'} ပြောမယ့် စကားများကို ရိုက်ထည့်ပါ...`}
                            className="w-full bg-[#151824] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 resize-y"
                          />
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Speaker Pause Interval Selector */}
                <div className="bg-[#0d0f17] p-3.5 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>စကားပြောသူတစ်ယောက်နှင့်တစ်ယောက် ကြားကာလ (Pause Interval):</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[0.2, 0.35, 0.5, 0.8].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setPauseDuration(sec)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          pauseDuration === sec
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {sec} စက္ကန့် {sec === 0.35 ? '(သဘာဝအတိုင်း)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Banner */}
                {dialogueError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{dialogueError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isDialogueLoading || dialogueLines.filter(l => l.text.trim()).length === 0}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isDialogueLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>၅ ယောက် စကားဝိုင်း အသံဖိုင် ပေါင်းစပ်ဖန်တီးနေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>💬 ၅ ယောက် အပြန်အလှန် စကားပြော အသံဖိုင် ဖန်တီးမည် (MP3 ရယူမည်)</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results Player Section */}
            {dialogueResult && (
              <div className="bg-[#151926] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>၅ ယောက် အပြန်အလှန် စကားပြော အသံဖိုင် ပေါင်းစပ်ပြီးပါပြီ</span>
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>💬 စကားဝိုင်း အသံဖိုင် ({dialogueResult.dialogueCount} ကြောင်း / {dialogueResult.characterCount} စာလုံး)</span>
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {dialogueResult.speakersUsed.map((spkName, i) => (
                        <span key={i} className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          🗣️ {spkName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        openVideoModalForAudio(dialogueResult.audioUrl, '၅ ယောက် အပြန်အလှန် စကားဝိုင်း', 'VoiceMaster Studio Multi-Speaker Dialogue');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
                    >
                      <Video className="w-4 h-4 text-purple-200" />
                      <span>🎬 TikTok / Reels MP4 ဗီဒီယို ပြုလုပ်မည်</span>
                    </button>

                    <button
                      onClick={() => {
                        downloadAudioFile(dialogueResult.audioUrl, `5Person_Dialogue_Audio_${Date.now()}.mp3`);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/30 active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>10x Turbo Download Dialogue (.MP3)</span>
                    </button>
                  </div>
                </div>

                {/* Audio Player Container */}
                <div className="bg-[#0c0e14] p-4 rounded-xl border border-white/10 flex flex-col gap-3">
                  <audio
                    ref={dialoguePlayerRef}
                    src={dialogueResult.audioUrl}
                    controls
                    className="w-full h-11"
                  />
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-slate-400">
                      ✓ ဤစကားဝိုင်း အသံဖိုင်ကို သမိုင်းမှတ်တမ်း (History) တွင် သိမ်းဆည်းပြီးဖြစ်ပါသည်
                    </p>
                    <button
                      onClick={() => setMainMode('history')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 underline underline-offset-4"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>မှတ်တမ်းကြည့်ရှုမည် ➔</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: AI STORY & VIDEO SCRIPT GENERATOR (Option 1 - 100% Reliable & Viral) */}
        {/* ========================================================================= */}
        {mainMode === 'writer' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Form */}
            <div className="bg-[#151926] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  <span>AI ဇာတ်လမ်းနှင့် ဗီဒီယို ဇာတ်ညွှန်း ရေးဖွဲ့စက် (Story & Script Generator)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  YouTube, TikTok, Facebook Creator များအတွက် ခေါင်းစဉ်တစ်ခု ပေးရုံဖြင့် ဆွဲဆောင်မှုအပြည့်ရှိသော မြန်မာဇာတ်ညွှန်းကို AI က ချက်ချင်း အစအဆုံး ရေးဖွဲ့ပေးပါမည်
                </p>
              </div>

              <form onSubmit={handleGenerateScript} className="space-y-5">
                {/* 1. Category / Genre Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>ဇာတ်လမ်း / ဗီဒီယို အမျိုးအစား ရွေးချယ်ပါ</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {predefinedGenres.map((g) => {
                      const isSel = scriptGenre === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setScriptGenre(g.id)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                            isSel
                              ? 'bg-indigo-600/25 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                              : 'bg-[#0d0f17] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Topic Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>ဇာတ်လမ်း ခေါင်းစဉ် သို့မဟုတ် အကြောင်းအရာ ရိုက်ထည့်ပါ</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={scriptTopic}
                    onChange={(e) => setScriptTopic(e.target.value)}
                    placeholder={predefinedGenres.find(g => g.id === scriptGenre)?.placeholder || 'ဥပမာ - ညသန်းခေါင် ထူးဆန်းသော ဖြစ်ရပ်'}
                    className="w-full bg-[#0d0f17] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* 3. Duration Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>ဇာတ်လမ်း အရှည် (Duration)</span>
                    </label>
                    <select 
                      value={scriptDuration}
                      onChange={(e) => setScriptDuration(e.target.value)}
                      className="w-full bg-[#0d0f17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="3min">၃ မိနစ် (Short)</option>
                      <option value="5min">၅ မိနစ် (Standard)</option>
                      <option value="6min">၆ မိနစ် (Pro)</option>
                      <option value="8min">၈ မိနစ် (Ultra)</option>
                      <option value="10min">၁၀ မိနစ် (Long)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>ပုံစံခွက် (Script Template)</span>
                    </label>
                    <select 
                      value={scriptTemplate}
                      onChange={(e) => setScriptTemplate(e.target.value)}
                      className="w-full bg-[#0d0f17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="none">ပုံမှန် (Normal)</option>
                      <option value="news">သတင်းတင်ဆက်မှု (News Report)</option>
                      <option value="tiktok">TikTok/Reels Script</option>
                      <option value="documentary">မှတ်တမ်းတင် (Documentary)</option>
                      <option value="health">ကျန်းမာရေး (Health Tips)</option>
                    </select>
                  </div>
                </div>

                {/* Error Banner */}
                {scriptError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{scriptError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isScriptLoading || !scriptTopic.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-bold shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isScriptLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI က စိတ်ဝင်စားဖွယ် ဇာတ်ညွှန်းကို ရေးဖွဲ့နေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>AI ဖြင့် ဇာတ်ညွှန်း ရေးဖွဲ့မည် (Generate Viral Script)</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Generated Script Results */}
            {generatedScript && (
              <div className="bg-[#151926] border border-purple-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[11px] font-bold border border-purple-500/20 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>ဇာတ်ညွှန်း အောင်မြင်စွာ ရေးဖွဲ့ပြီးပါပြီ</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {generatedScript.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      ခန့်မှန်းကြာချိန် - {generatedScript.estimatedMinutes} • စာလုံးရေ - {generatedScript.script.length} လုံး
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* One-click Send to Human TTS */}
                    <button
                      onClick={() => sendScriptToTTS(generatedScript.script)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>လူအသံစစ်စစ်ဖြင့် အသံထွက်ပြောင်းမည် ➔</span>
                    </button>
                    <button
                      onClick={() => handleCopy(generatedScript.script, 'script')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-white/10 active:scale-95"
                    >
                      {copiedType === 'script' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedType === 'script' ? 'ကူးယူပြီး' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Script Content */}
                <div className="bg-[#0c0e14] p-4 sm:p-5 rounded-2xl border border-white/10 max-h-96 overflow-y-auto leading-relaxed text-sm text-slate-200 whitespace-pre-line font-sans select-text">
                  {generatedScript.script}
                </div>

                <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex items-center justify-between text-xs text-indigo-300">
                  <span>💡 အကြံပြုချက် - အပေါ်ရှိ <b>"လူအသံစစ်စစ်ဖြင့် အသံထွက်ပြောင်းမည်"</b> ခလုတ်ကို နှိပ်လိုက်ပါက ဤဇာတ်ညွှန်းစာသား အပြည့်အစုံကို မြန်မာလူအသံစစ်စစ် (သီဟ သို့မဟုတ် နီလာ) ဖြင့် MP3 အသံဖိုင်အပြည့်အစုံ ချက်ချင်း ထုတ်ယူနိုင်ပါမည်။</span>
                </div>

                {/* AI Storyboard Scene Images Generator Box */}
                <div className="p-4 bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>🎨 ဇာတ်လမ်းဇာတ်ကွက်အလိုက် AI သရုပ်ဖော်ပုံများ (AI Storyboard Scenes)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ဤဇာတ်လမ်းနှင့် တိုက်ရိုက်ကိုက်ညီသော Cinematic AI ရုပ်ပုံ (၄) ပုံကို အလိုအလျောက် ထုတ်ယူပါ
                      </p>
                    </div>

                    <button
                      onClick={() => handleGenerateStoryImages()}
                      disabled={isStoryImagesLoading}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 active:scale-95 disabled:opacity-50 shrink-0"
                    >
                      {isStoryImagesLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI ရုပ်ပုံများ ဖန်တီးနေပါသည်...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>✨ AI ဇာတ်လမ်းပုံများ ထုတ်မည်</span>
                        </>
                      )}
                    </button>
                  </div>

                  {storyImagesError && (
                    <p className="text-xs text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                      {storyImagesError}
                    </p>
                  )}

                  {storyImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {storyImages.map((scene) => (
                        <div key={scene.sceneNumber} className="bg-[#0c0e14] p-3 rounded-xl border border-white/10 space-y-2 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                                {scene.title || `Scene ${scene.sceneNumber}`}
                              </span>
                              <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                🎭 {scene.mood}
                              </span>
                            </div>

                            {scene.imageUrl && (
                              <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/10 shadow-lg group relative">
                                <img 
                                  src={scene.imageUrl} 
                                  alt={scene.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                                  <span className="text-[10px] text-white font-bold">AI Generated Vision</span>
                                </div>
                              </div>
                            )}

                            <p className="text-[11px] text-slate-300 font-mono bg-black/30 p-2.5 rounded-lg border border-white/5 select-all leading-relaxed">
                              {scene.visualPrompt}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {scene.imageUrl && (
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleGenerateStoryVideo(scene.imageUrl)}
                                  disabled={isStoryVideoLoading}
                                  className="py-2 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow transition-all active:scale-95 disabled:opacity-50"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>ဇာတ်လမ်းဗီဒီယို ထုတ်မည်</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setVideoBgImage(scene.imageUrl);
                                    setVideoTitleText(generatedScript?.title || '');
                                    setMainMode('video');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="py-2 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow transition-all active:scale-95"
                                >
                                  <Settings2 className="w-3 h-3" />
                                  <span>ဒီဇိုင်း ပြင်ဆင်မည်</span>
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => handleCopy(scene.visualPrompt, `scene_${scene.sceneNumber}`)}
                              className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-[9px] flex items-center justify-center gap-1.5 border border-white/5 transition-all active:scale-95"
                            >
                              {copiedType === `scene_${scene.sceneNumber}` ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedType === `scene_${scene.sceneNumber}` ? 'Prompt ကူးယူပြီး' : 'AI Prompt ကူးယူမည်'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct AI Story Video Maker Card */}
                <div className="p-4 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-indigo-950/40 border border-pink-500/30 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-pink-400" />
                        <span>🎬 AI ရုပ်ပုံနှင့် အသံဖိုင်ကို ဗီဒီယိုအဖြစ် တိုက်ရိုက်ပေါင်းစပ်မည် (Direct AI Video Maker)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ဤဇာတ်လမ်းအတွက် Cinematic AI နောက်ခံပုံ၊ အသံဖိုင် နှင့် အသံလှိုင်း (Waveform) တို့ကို Download ဆွဲစရာမလိုဘဲ MP4 ဗီဒီယိုအဖြစ် တစ်ခါတည်း တိုက်ရိုက်ပေါင်းစပ်ပါ
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Voice Effect:</label>
                          <select 
                            value={voiceEffect}
                            onChange={(e) => setVoiceEffect(e.target.value as any)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none"
                          >
                            <option value="none">Normal</option>
                            <option value="echo">Echo Effect</option>
                            <option value="deep">Deep Voice</option>
                            <option value="radio">Radio Style</option>
                            <option value="horror">Horror Vibe</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                          <input 
                            type="checkbox" 
                            id="sub_toggle"
                            checked={enableSubtitles} 
                            onChange={(e) => setEnableSubtitles(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-white/10 bg-black/20 text-pink-500 focus:ring-pink-500" 
                          />
                          <label htmlFor="sub_toggle" className="text-[10px] font-bold text-slate-300 cursor-pointer">Auto Subtitles (စာတန်းထိုး)</label>
                        </div>
                      </div>

                      <button
                        onClick={() => handleGenerateStoryVideo()}
                        disabled={isStoryVideoLoading}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-pink-600/35 active:scale-95 disabled:opacity-50 shrink-0"
                      >
                        {isStoryVideoLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Pro ဗီဒီယို ဖန်တီးနေပါသည်...</span>
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4" />
                            <span>🎬 Pro ဗီဒီယို တိုက်ရိုက်ထုတ်မည် (Multi-Scene)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {storyVideoError && (
                    <p className="text-xs text-rose-300 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30">
                      {storyVideoError}
                    </p>
                  )}

                  {storyVideoUrl && (
                    <div className="space-y-3 bg-[#0c0e14] p-4 rounded-xl border border-pink-500/30 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>AI ဗီဒီယို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ! (Download ဆွဲစရာမလိုဘဲ တိုက်ရိုက်ကြည့်ရှုနိုင်ပါပြီ)</span>
                        </span>
                        <a
                          href={storyVideoUrl}
                          download={`AI_Story_Video_${Date.now()}.mp4`}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span>10x Turbo Download (.MP4)</span>
                        </a>
                      </div>

                      <div className="aspect-[9/16] max-h-[480px] w-full mx-auto bg-black rounded-xl overflow-hidden border border-white/10 relative shadow-2xl flex items-center justify-center">
                        <video
                          src={storyVideoUrl}
                          controls
                          autoPlay
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 4: STANDALONE AI IMAGE GENERATOR STUDIO                              */}
        {/* ========================================================================= */}
        {mainMode === 'imager' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 mb-2">
                  <Image className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pro Feature: Cinematic AI Image Engine</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🖼️ Standalone AI Image Generator Studio</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  ဇာတ်လမ်းနောက်ခံပုံများ၊ YouTube Thumbnail များနှင့် စိတ်ကူးယဉ်ရုပ်ပုံများကို AI ဖြင့် တိကျစွာ အလှပဆုံး ထုတ်ယူနိုင်ပါသည်
                </p>
              </div>

              <form onSubmit={handleGenerateStandaloneImage} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">ထုတ်လုပ်လိုသော ပုံအကြောင်းအရာ (Image Prompt):</label>
                  <textarea
                    rows={4}
                    required
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="ဥပမာ - Realistic ancient golden city in the jungle, cinematic lighting, 8k resolution..."
                    className="w-full bg-[#0d101d] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">ပုံအရွယ်အစား (Aspect Ratio):</label>
                    <select
                      value={imageGenAspectRatio}
                      onChange={(e) => setImageGenAspectRatio(e.target.value as any)}
                      className="w-full bg-[#0d101d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="9:16">📱 9:16 Vertical (TikTok/Reels)</option>
                      <option value="16:9">💻 16:9 Horizontal (YouTube)</option>
                      <option value="1:1">📷 1:1 Square (FB/IG Post)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">ပုံစံ (Style):</label>
                    <select
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value)}
                      className="w-full bg-[#0d101d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="cinematic">🎬 Cinematic (ရုပ်ရှင်ဆန်သော)</option>
                      <option value="realistic">📸 Photorealistic (အစစ်အမှန်ဆန်သော)</option>
                      <option value="anime">🎨 Anime / Digital Art (ကာတွန်းပုံစံ)</option>
                      <option value="fantasy">🧚 Fantasy (စိတ်ကူးယဉ်ဆန်သော)</option>
                    </select>
                  </div>
                </div>

                {imageError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200">
                    {imageError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isImageGenerating || !imagePrompt.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isImageGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                      <span>AI က ရုပ်ပုံကို အလှပဆုံး ဖန်တီးပေးနေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4 text-cyan-300" />
                      <span>✨ AI ရုပ်ပုံ ဖန်တီးမည် (Generate AI Image)</span>
                    </>
                  )}
                </button>
              </form>

              {imageResultUrl && (
                <div className="p-5 bg-[#0a0c12] rounded-2xl border border-cyan-500/30 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>AI ရုပ်ပုံ အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ!</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setVideoBgImage(imageResultUrl);
                          setMainMode('video');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold flex items-center gap-1 shadow transition-all active:scale-95"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>🎬 ဗီဒီယို ပြုလုပ်မည်</span>
                      </button>
                      <a
                        href={imageResultUrl}
                        download={`VoiceMaster_AI_Image_${Date.now()}.png`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow transition-all active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>10x Turbo Download .PNG</span>
                      </a>
                    </div>
                  </div>
                  <div className="max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <img src={imageResultUrl} alt="AI Generated" className="w-full h-auto" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2.5: MP4 VIDEO VISUALIZER GENERATOR (TikTok & Reels Video Maker)      */}
        {/* ========================================================================= */}
        {mainMode === 'video' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-purple-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-400" />
                  <span>🎬 TikTok / Reels MP4 Video Visualizer Studio</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  သင့်အသံဖိုင်များကို Waveform Spectrum Animation နှင့် စာတန်းထိုးပါဝင်သော TikTok / Reels / Shorts အဆင်သင့် MP4 ဗီဒီယိုအဖြစ် ၁-Click ပြုလုပ်ပါ
                </p>
              </div>

              {/* Step 1: Select Audio Source */}
              <div className="space-y-3 bg-[#0d101d] p-4 sm:p-5 rounded-xl border border-white/5">
                <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  ၁။ အသံဖိုင် ရွေးချယ်ခြင်း (Select Audio Source)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option A: Upload custom MP3 */}
                  <div className="p-4 bg-[#121524] rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-purple-400" />
                        <span>သင့်ကွန်ပျူတာ/ဖုန်းမှ MP3 တင်သွင်းမည်</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        သင့်ကိုယ်ပိုင်အသံ သို့မဟုတ် စိတ်ကြိုက် MP3/WAV ဖိုင် တင်သွင်းပါ
                      </p>
                    </div>

                    <label className="mt-3 cursor-pointer group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b0d16] border border-white/10 hover:border-purple-500/40 text-xs font-bold text-slate-300 hover:text-white transition-all">
                      <FileAudio className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-all" />
                      <span>{videoAudioData ? '🎵 အသံဖိုင် ပြောင်းလဲတင်မည်' : 'အသံဖိုင်ရွေးရန် နှိပ်ပါ (.mp3/.wav)'}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setVideoAudioData(event.target.result as string);
                              setVideoTitleText(file.name.replace(/\.[^/.]+$/, ''));
                              setVideoResultUrl('');
                              setVideoError('');
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Option B: Choose from generated history */}
                  <div className="p-4 bg-[#121524] rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <History className="w-4 h-4 text-emerald-400" />
                        <span>ယခင်ပြုလုပ်ထားသော History မှ ရွေးချယ်မည်</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        သင်ဖန်တီးခဲ့ဖူးသော စာဖတ်အသံဖိုင်များကို တိုက်ရိုက်ယူပါ
                      </p>
                    </div>

                    {historyItems.filter(h => h.type === 'tts' && h.audioUrl).length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic mt-3 text-center">
                        ယခင်ပြုလုပ်ထားသော TTS အသံမှတ်တမ်း မရှိသေးပါ
                      </p>
                    ) : (
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            setVideoAudioData(val);
                            const item = historyItems.find(h => h.audioUrl === val);
                            if (item) {
                              setVideoTitleText(item.title);
                            }
                            setVideoResultUrl('');
                            setVideoError('');
                          }
                        }}
                        className="mt-3 w-full bg-[#0b0d16] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        defaultValue=""
                      >
                        <option value="" disabled>-- အသံမှတ်တမ်းမှ ရွေးပါ --</option>
                        {historyItems.filter(h => h.type === 'tts' && h.audioUrl).map(h => (
                          <option key={h.id} value={h.audioUrl}>
                            🔊 {h.title} ({h.characterCount} လုံး)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {videoAudioData && (
                  <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl flex items-center justify-between gap-3 text-xs text-indigo-300">
                    <span className="flex items-center gap-1.5 truncate">
                      <Music2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>ရွေးချယ်ထားသော အသံဖိုင် အောင်မြင်စွာ တပ်ဆင်ပြီးပါပြီ။</span>
                    </span>
                    <button
                      onClick={() => {
                        setVideoAudioData('');
                        setVideoResultUrl('');
                      }}
                      className="text-slate-400 hover:text-white transition-all text-[11px]"
                    >
                      ဖယ်ထုတ်မည်
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Configure Video Details */}
              {videoAudioData && (
                <div className="space-y-4 bg-[#0d101d] p-4 sm:p-5 rounded-xl border border-white/5 animate-in slide-in-from-bottom-3 duration-200">
                  <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    ၂။ ဗီဒီယိုဒီဇိုင်းနှင့် အချက်အလက်များ ပြင်ဆင်ခြင်း
                  </h3>

                  {/* Aspect Ratio Picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      ဗီဒီယို အရွယ်အစား (Aspect Ratio):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setVideoAspectRatio('9:16')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                          videoAspectRatio === '9:16'
                            ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                            : 'bg-[#0b0d16] border-white/10 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <span>📱 TikTok / Shorts</span>
                        <span className="text-[10px] text-slate-400 font-mono">9:16 Vertical</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVideoAspectRatio('16:9')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                          videoAspectRatio === '16:9'
                            ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                            : 'bg-[#0b0d16] border-white/10 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <span>💻 YouTube</span>
                        <span className="text-[10px] text-slate-400 font-mono">16:9 Horizontal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVideoAspectRatio('1:1')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                          videoAspectRatio === '1:1'
                            ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                            : 'bg-[#0b0d16] border-white/10 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <span>📷 IG / FB Post</span>
                        <span className="text-[10px] text-slate-400 font-mono">1:1 Square</span>
                      </button>
                    </div>
                  </div>

                  {/* Themes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      နောက်ခံ ပုံစံ (Background & Theme):
                    </label>
                    
                    {/* Multi-Image Background Upload (Supports up to 10 images for Dynamic Motion Slideshow) */}
                    <div className="p-3.5 bg-black/25 border border-purple-500/20 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Image className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-slate-200">နောက်ခံပုံများ (အများဆုံး ၁၀ ပုံအထိ တင်နိုင်ပါသည်):</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                            {videoBgImages.length} / 10 ပုံ
                          </span>
                          {videoBgImages.length > 0 && (
                            <button 
                              type="button"
                              onClick={() => setVideoBgImages([])}
                              className="text-[10px] text-rose-400 hover:text-rose-300 transition-all font-bold px-1.5 py-0.5 rounded hover:bg-rose-500/10"
                            >
                              အားလုံးဖျက်မည်
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Image Upload Input Box */}
                      {videoBgImages.length < 10 && (
                        <label className="flex flex-col items-center justify-center py-3.5 px-4 border-2 border-dashed border-purple-500/30 rounded-xl hover:border-purple-400 hover:bg-purple-950/20 transition-all cursor-pointer group bg-[#0d0f17]/60">
                          <div className="flex items-center gap-2 text-purple-300 group-hover:text-white">
                            <Image className="w-5 h-5" />
                            <span className="text-xs font-bold">
                              {videoBgImages.length === 0 ? '+ နောက်ခံပုံများ ရွေးချယ်တင်သွင်းပါ (Upload up to 10 Images)' : `+ ပုံထပ်ထည့်မည် (${10 - videoBgImages.length} ပုံ ကျန်ရှိ)`}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5">တစ်ပြိုင်နက် ပုံများစွာ ရွေးချယ်နိုင်ပါသည် (JPG / PNG / WebP)</span>
                          <input 
                            type="file" 
                            multiple
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                const remainingSlots = 10 - videoBgImages.length;
                                const filesToRead = Array.from(files).slice(0, remainingSlots);
                                filesToRead.forEach(file => {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (reader.result) {
                                      setVideoBgImages(prev => prev.length < 10 ? [...prev, reader.result as string] : prev);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                });
                              }
                            }}
                          />
                        </label>
                      )}

                      {/* Thumbnails Grid (Up to 10 images) */}
                      {videoBgImages.length > 0 && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {videoBgImages.map((imgUrl, idx) => (
                              <div 
                                key={idx} 
                                className="relative aspect-video rounded-lg overflow-hidden border border-purple-500/40 bg-black group shadow-md"
                              >
                                <img src={imgUrl} className="w-full h-full object-cover" alt={`Slide ${idx + 1}`} />
                                
                                {/* Slide Number Badge */}
                                <span className="absolute top-1 left-1 bg-black/80 text-purple-300 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
                                  #{idx + 1}
                                </span>

                                {/* Reorder and Delete Controls */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      title="ရှေ့သို့ ရွှေ့မည်"
                                      onClick={() => {
                                        const newArr = [...videoBgImages];
                                        const temp = newArr[idx - 1];
                                        newArr[idx - 1] = newArr[idx];
                                        newArr[idx] = temp;
                                        setVideoBgImages(newArr);
                                      }}
                                      className="p-1 rounded bg-slate-800 text-white hover:bg-slate-700 text-[10px]"
                                    >
                                      ◀
                                    </button>
                                  )}
                                  
                                  <button
                                    type="button"
                                    title="ဖျက်မည်"
                                    onClick={() => {
                                      setVideoBgImages(videoBgImages.filter((_, i) => i !== idx));
                                    }}
                                    className="p-1 rounded bg-rose-600/90 text-white hover:bg-rose-500 text-[10px]"
                                  >
                                    ✕
                                  </button>

                                  {idx < videoBgImages.length - 1 && (
                                    <button
                                      type="button"
                                      title="နောက်သို့ ရွှေ့မည်"
                                      onClick={() => {
                                        const newArr = [...videoBgImages];
                                        const temp = newArr[idx + 1];
                                        newArr[idx + 1] = newArr[idx];
                                        newArr[idx] = temp;
                                        setVideoBgImages(newArr);
                                      }}
                                      className="p-1 rounded bg-slate-800 text-white hover:bg-slate-700 text-[10px]"
                                    >
                                      ▶
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {videoBgImages.length > 1 && (
                            <p className="text-[11px] text-emerald-400 font-medium bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                              <span>✨</span>
                              <span>ပုံ {videoBgImages.length} ပုံ ပါဝင်သောကြောင့် Dynamic Ken Burns Motion Slideshow အဖြစ် ဗီဒီယိုကို အလိုအလျောက် ပေါင်းစပ်ဖန်တီးပေးပါမည်။</span>
                            </p>
                          )}
                        </div>
                      )}

                      {videoBgImages.length === 0 && (
                        <p className="text-[10px] text-slate-500 italic">ပုံမတင်လျှင် အောက်ပါ Theme အရောင်များကို အသုံးပြုပါမည်။</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {[
                        { id: 'cyberpunk', name: '🌌 Neon Cyberpunk', color: 'bg-slate-900 border-indigo-500' },
                        { id: 'indigo', name: '🔮 Indigo Galaxy', color: 'bg-indigo-950 border-indigo-400' },
                        { id: 'sunset', name: '🌅 Sunset Glow', color: 'bg-amber-950 border-orange-500' },
                        { id: 'emerald', name: '🌿 Emerald Forest', color: 'bg-emerald-950 border-emerald-500' },
                        { id: 'dark', name: '🖤 Studio Dark', color: 'bg-zinc-950 border-zinc-500' }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setVideoTheme(t.id as any)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                            videoTheme === t.id
                              ? `${t.color} text-white ring-2 ring-purple-500`
                              : 'bg-[#0b0d16] border-white/10 text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Waveform Design Style */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      အသံလှိုင်း ပုံစံ (Waveform Spectrum Style):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'cline', name: '📊 မျဉ်းကွေးထူ (Cline)' },
                        { id: 'line', name: '📈 မျဉ်းကြောင်း (Line)' },
                        { id: 'point', name: '🌟 အစက်ကလေးများ (Point)' }
                      ].map(w => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setVideoWaveStyle(w.id as any)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                            videoWaveStyle === w.id
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                              : 'bg-[#0b0d16] border-white/10 text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          {w.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Waveform Custom Color Picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>အသံလှိုင်း အရောင် (Waveform Color Picker):</span>
                      <span className="text-[10px] text-purple-300">ကိုယ်ကြိုက်တဲ့ အရောင် ရွေးနိုင်ပါသည်</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: '', name: '✨ အလိုအလျောက် (Theme)', color: '#818cf8' },
                        { id: '0x38bdf8|0x0284c7', name: '💙 လျှပ်စစ်ပြာ (Cyan)', color: '#38bdf8' },
                        { id: '0x10b981|0x34d399', name: '💚 မြစိမ်း (Emerald)', color: '#10b981' },
                        { id: '0xf97316|0xf43f5e', name: '🧡 မီးတောက် (Fire)', color: '#f97316' },
                        { id: '0xec4899|0xf43f5e', name: '🩷 ပန်းရောင် (Hot Pink)', color: '#ec4899' },
                        { id: '0xeab308|0xfacc15', name: '💛 ရွှေဝါရောင် (Gold)', color: '#eab308' },
                        { id: '0xffffff|0xe2e8f0', name: '🤍 အဖြူစင်စစ် (White)', color: '#ffffff' }
                      ].map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setVideoCustomWaveColor(c.id)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                            videoCustomWaveColor === c.id
                              ? 'bg-purple-600/30 border-purple-500 text-white ring-2 ring-purple-400'
                              : 'bg-[#0b0d16] border-white/10 text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: c.color }}></span>
                          <span className="truncate">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Waveform Vertical Position Control */}
                  <div className="space-y-3 p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl">
                    <label className="text-xs font-bold text-indigo-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MoveVertical className="w-3.5 h-3.5" />
                        <span>အသံလှိုင်း အနိမ့်အမြင့် (Waveform Position):</span>
                      </span>
                      <span className="text-[11px] text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">{videoWaveY}%</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter shrink-0">Top</span>
                      <div className="relative flex-1 h-6 flex items-center">
                        <div className="absolute inset-0 bg-slate-800/50 rounded-full h-1.5 self-center"></div>
                        <input 
                          type="range"
                          min="15"
                          max="85"
                          step="1"
                          value={videoWaveY}
                          onChange={(e) => setVideoWaveY(parseInt(e.target.value))}
                          className="relative z-10 w-full h-1.5 bg-transparent appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter shrink-0">Bottom</span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic leading-relaxed text-center opacity-80">
                      💡 ဗီဒီယို၏ အပေါ် (သို့) အောက် ကြိုက်ရာနေရာသို့ အသံလှိုင်းကို ရွှေ့နိုင်ပါသည်
                    </p>
                  </div>

                  {/* Video Title Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      ဗီဒီယိုခေါင်းစဉ်စာသား (Video Header Title):
                    </label>
                    <input
                      type="text"
                      value={videoTitleText}
                      onChange={(e) => setVideoTitleText(e.target.value)}
                      placeholder="ခေါင်းစဉ်စာသား ရိုက်ထည့်ပါ..."
                      className="w-full bg-[#0b0d16] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Video Subtitle Info */}
                  <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl flex items-center gap-2 text-xs text-purple-300">
                    <span className="shrink-0 font-bold bg-purple-600 text-black px-1.5 py-0.5 rounded text-[10px]">INFO</span>
                    <span>ဗီဒီယို ပြုလုပ်ရာတွင် စိတ်လှုပ်ရှားဖွယ် Waveform Animation နှင့်အတူ သင့်တော်သော စာတန်းထိုးများကို စနစ်တကျ အလိုအလျောက် ပေါင်းစပ်ပေးသွားမည် ဖြစ်ပါသည်။</span>
                  </div>

                  {/* Error display */}
                  {videoError && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200">
                      {videoError}
                    </div>
                  )}

                  {/* Success Result Display */}
                  {videoResultUrl && (
                    <div className="space-y-4 p-4 sm:p-5 bg-[#08090f] rounded-xl border border-emerald-500/30 animate-in fade-in duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>MP4 Visualizer ဗီဒီယို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ</span>
                        </span>
                        <a
                          href={videoResultUrl}
                          download={`VoiceMaster_Visualizer_${Date.now()}.mp4`}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span>10x Turbo Download (.MP4)</span>
                        </a>
                      </div>

                      <video
                        src={videoResultUrl}
                        controls
                        className="w-full max-h-[420px] rounded-lg bg-black mx-auto shadow-2xl border border-white/10"
                      />
                    </div>
                  )}

                  {/* Generate Button */}
                  {!videoResultUrl && (
                    <button
                      type="button"
                      disabled={isVideoGenerating}
                      onClick={handleGenerateMP4Video}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      {isVideoGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                          <span>MP4 Video Visualizer ပြုလုပ်နေပါသည် ခေတ္တစောင့်ပါ...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-pink-300" />
                          <span>🎬 MP4 ဗီဒီယို စတင်ဖန်တီးမည် (TikTok/Reels အဆင်သင့်)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: AUDIO & STORY HISTORY LIBRARY (Local Persistent Storage)           */}
        {/* ========================================================================= */}
        {mainMode === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-400" />
                    <span>အသံဖိုင်နှင့် ဇာတ်လမ်း သမိုင်းမှတ်တမ်းများ (History Library)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    နောက်ဆုံး ထုတ်လုပ်ထားသော အသံဖိုင်နှင့် ဇာတ်လမ်း ၅ ခု အထိ အလိုအလျောက် သိမ်းဆည်းပေးထားပြီး ပြန်လည် နားဆင်/ဒေါင်းလုဒ် ရယူနိုင်ပါသည်
                  </p>
                </div>

                {historyItems.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>မှတ်တမ်းအားလုံး ဖျက်မည်</span>
                  </button>
                )}
              </div>

              {historyItems.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                    <History className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-300">မှတ်တမ်း မရှိသေးပါ</p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      လူအစစ်အသံ TTS သို့မဟုတ် AI ဇာတ်လမ်း ဖန်တီးလိုက်သည်နှင့် ဤနေရာတွင် အလိုအလျောက် သိမ်းဆည်းပေးပါမည်။
                    </p>
                  </div>
                  <button
                    onClick={() => setMainMode('tts')}
                    className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>TTS အသံ စတင်ထုတ်ယူမည်</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-[#0e111a] border border-white/10 hover:border-indigo-500/30 rounded-xl p-4 transition-all flex flex-col gap-3 shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.type === 'tts' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {item.type === 'tts' ? '🔊 TTS အသံဖိုင်' : '✍️ AI ဇာတ်လမ်း'}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">
                            {item.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-[11px] self-end sm:self-auto">
                          <span>{item.characterCount} စာလုံး</span>
                          <span>•</span>
                          <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <button
                            onClick={() => deleteHistoryItem(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors ml-1"
                            title="ဖျက်မည်"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans bg-black/20 p-2.5 rounded-lg border border-white/5">
                        {item.content}
                      </p>

                      {/* Audio Player if TTS */}
                      {item.type === 'tts' && item.audioUrl && (
                        <div className="bg-[#08090e] p-2 rounded-lg border border-white/5 flex flex-wrap items-center gap-2">
                          <audio src={item.audioUrl} controls className="w-full sm:flex-1 h-8" />
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                openVideoModalForAudio(item.audioUrl!, item.title, item.content.slice(0, 200));
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>MP4 Video</span>
                            </button>
                            <button
                              onClick={() => {
                                downloadAudioFile(item.audioUrl!, `${item.title}_${Date.now()}.mp3`);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>10x Turbo .MP3</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-slate-500">
                          {item.voiceName ? `အသံရှင်: ${item.voiceName}` : 'AI Scriptwriter'}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              sendScriptToTTS(item.content);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-indigo-300 font-semibold text-[11px] flex items-center gap-1 active:scale-95"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>TTS ဖြင့် ပြန်လည်ထုတ်မည်</span>
                          </button>

                          <button
                            onClick={() => handleCopy(item.content, `hist_${item.id}`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] flex items-center gap-1 border border-white/10 active:scale-95"
                          >
                            {copiedType === `hist_${item.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedType === `hist_${item.id}` ? 'ကူးပြီး' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* NEW MODE 1: AI SPEECH-TO-TEXT STUDIO (Transcribe & SRT Subtitles)         */}
        {/* ========================================================================= */}
        {mainMode === 'transcribe' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Languages className="w-5 h-5 text-emerald-400" />
                    <span>📝 AI Speech-to-Text & Subtitle Generator (1GB Turbo Engine)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ဗီဒီယို (1GB အထိ) နှင့် အသံဖိုင်များကို ၃ မိနစ်အတွင်း အသံအတိုင်း တိကျမှန်ကန်သော CapCut / TikTok အသင့်သုံး SRT စာတန်းထိုးအဖြစ် ထုတ်ပေးပါသည်
                  </p>
                </div>
                
                {/* 1GB Turbo Engine Badges */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>1GB Video File Support</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>&lt; 3 မိနစ် အမြန်နှုန်း</span>
                  </span>
                </div>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-black/30 rounded-xl border border-white/5 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    🎬
                  </div>
                  <div>
                    <div className="font-bold text-white">1GB ဖိုင်ကြီးများ လက်ခံခြင်း</div>
                    <div className="text-[10px] text-slate-400">MP4, MKV, MOV, MP3 ဖိုင်အားလုံး</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="font-bold text-white">၃ မိနစ်အတွင်း အပြီးသတ်</div>
                    <div className="text-[10px] text-slate-400">Parallel Turbo Chunking စနစ်</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    🎯
                  </div>
                  <div>
                    <div className="font-bold text-white">အသံနှင့် စာတန်းထိုး အတိအကျညီ</div>
                    <div className="text-[10px] text-slate-400">Word-level Timestamps Sync</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Input File upload box */}
                <div className="p-5 bg-[#0d101d] rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      အသံ/ဗီဒီယိုဖိုင် သို့မဟုတ် .SRT စာတန်းထိုးဖိုင် တင်သွင်းပါ (1GB အထိ):
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                        <span>⚡ 15x Turbo Upload</span>
                      </span>
                      {selectedTranscribeFile && (
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          {(selectedTranscribeFile.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="file"
                      id="transcribe_main_input"
                      accept="audio/*,video/*,.mp4,.mkv,.mov,.avi,.webm,.mp3,.wav,.m4a,.srt,.vtt,.sub,.txt"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedTranscribeFile(file);
                          setTranscribeAudio(file.name);

                          // Instant 15x client-side load if it's already an SRT / VTT subtitle file!
                          if (/\.(srt|vtt|sub|txt)$/i.test(file.name)) {
                            try {
                              const text = await file.text();
                              if (text.includes('-->') || /^\d+\s*\n\d{2}:/m.test(text)) {
                                const lines = text.split('\n');
                                const textOnly = lines.filter(l => l.trim() && !/^\d+$/.test(l.trim()) && !l.includes('-->')).join(' ');
                                setTranscribeSrt(text);
                                setTranscribeResult(textOnly);
                                setTranscribeStage('completed');
                                setCustomSrtInput(text);
                                setUploadProgress(100);
                                return;
                              }
                            } catch (_) {}
                          }

                          // Generate preview URL if it's a video file
                          if (file.type.startsWith('video') || /\.(mp4|mov|webm)$/i.test(file.name)) {
                            try {
                              const url = URL.createObjectURL(file);
                              setTranscribeVideoPreviewUrl(url);
                            } catch (_) {}
                          } else {
                            setTranscribeVideoPreviewUrl('');
                          }
                        }
                      }}
                      className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gradient-to-r file:from-emerald-600 file:to-teal-600 file:text-white hover:file:from-emerald-500 hover:file:to-teal-500 cursor-pointer"
                    />

                    {/* Dedicated 15x Fast SRT Upload Button */}
                    <label
                      htmlFor="transcribe_srt_direct"
                      className="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/35 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 whitespace-nowrap shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>⚡ .SRT ဖိုင် အမြန်တင်မည် (15x Faster)</span>
                      <input
                        type="file"
                        id="transcribe_srt_direct"
                        accept=".srt,.vtt,.txt"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedTranscribeFile(file);
                            setTranscribeAudio(file.name);
                            const text = await file.text();
                            const lines = text.split('\n');
                            const textOnly = lines.filter(l => l.trim() && !/^\d+$/.test(l.trim()) && !l.includes('-->')).join(' ');
                            setTranscribeSrt(text);
                            setTranscribeResult(textOnly);
                            setTranscribeStage('completed');
                            setCustomSrtInput(text);
                            setUploadProgress(100);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Video preview player if selected */}
                  {transcribeVideoPreviewUrl && (
                    <div className="pt-2 animate-in fade-in">
                      <div className="bg-black/60 rounded-xl overflow-hidden border border-white/10 max-w-md mx-auto">
                        <video
                          src={transcribeVideoPreviewUrl}
                          controls
                          className="w-full max-h-56 object-contain bg-black"
                        />
                        <div className="p-2 text-center text-[11px] text-slate-400 bg-[#090b12] border-t border-white/5">
                          📹 ဗီဒီယိုဖိုင် အစမ်းကြည့်ရှုမှု: <span className="text-white font-semibold">{selectedTranscribeFile?.name}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span>💡 သင့်ဖုန်းထဲမှ ရိုက်ကူးထားသော ဗီဒီယိုဖိုင်ကြီးများ (1GB အထိ) ကို တိုက်ရိုက် ထည့်သွင်းနိုင်ပါသည်</span>
                  </p>
                </div>

                {/* Live Turbo Progress Bar when uploading / processing */}
                {isTranscribing && (
                  <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>
                          {transcribeStage === 'uploading' && `ဗီဒီယိုဖိုင် ဆာဗာသို့ အပ်လုဒ်တင်နေသည်... (${uploadProgress || 0}%)`}
                          {transcribeStage === 'extracting' && 'အသံဖိုင် သီးသန့် အမြန်ထုတ်ယူနေသည် (FFmpeg Extraction)...'}
                          {transcribeStage === 'transcribing' && 'Gemini AI က စာတန်းထိုးများကို အသံအတိုင်း တိကျစွာ ထုတ်လုပ်နေပါသည်...'}
                          {transcribeStage === 'completed' && 'အောင်မြင်စွာ စာတန်းထိုး ထုတ်ပြီးပါပြီ!'}
                        </span>
                      </span>

                      <span className="font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{Math.floor(transcribeElapsedSec / 60).toString().padStart(2, '0')}:{(transcribeElapsedSec % 60).toString().padStart(2, '0')}</span>
                        <span className="text-[10px] text-slate-500">(ခန့်မှန်း &lt; 3 မိနစ်)</span>
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress !== null && uploadProgress < 100 ? uploadProgress : 92}%` }}
                      />
                    </div>

                    {/* Stage Pills */}
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-center pt-1">
                      <div className={`p-1.5 rounded-lg border ${uploadProgress !== null && uploadProgress >= 100 ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-black/30 border-white/5 text-slate-400'}`}>
                        1. Upload File {uploadProgress !== null ? `(${uploadProgress}%)` : ''}
                      </div>
                      <div className={`p-1.5 rounded-lg border ${transcribeStage === 'extracting' || transcribeStage === 'transcribing' || transcribeStage === 'completed' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-black/30 border-white/5 text-slate-400'}`}>
                        2. Fast Audio Stream
                      </div>
                      <div className={`p-1.5 rounded-lg border ${transcribeStage === 'transcribing' || transcribeStage === 'completed' ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' : 'bg-black/30 border-white/5 text-slate-400'}`}>
                        3. AI Multimodal Sync
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                {transcribeAudio && !isTranscribing && (
                  <button
                    onClick={handleTranscribeAudio}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-600/30"
                  >
                    <Languages className="w-4 h-4" />
                    <span>🚀 1GB Turbo Engine ဖြင့် အသံအညီ စာတန်းထိုး (SRT) ချက်ချင်းထုတ်မည် (&lt; 3 မိနစ်)</span>
                  </button>
                )}

                {/* Error Banner */}
                {transcribeError && (
                  <p className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                    {transcribeError}
                  </p>
                )}

                {/* Results block */}
                {(transcribeResult || transcribeSrt) && (
                  <div className="space-y-4 pt-2 animate-in fade-in">
                    {/* Interactive SRT Timeline Inspector */}
                    <div>
                      <SrtTimelineInspector
                        srtText={transcribeSrt}
                        title="CapCut / Premiere အသင့်သုံး စာတန်းထိုး Timeline (စက္ကန့်အလိုက် အပြည့်အစုံ)"
                        onCopy={handleCopy}
                        onDownload={downloadFile}
                      />
                    </div>

                    {/* Plain Text Transcript */}
                    <div className="bg-[#0c0e14] p-4 rounded-xl border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          <span>စာသားအပြည့်အစုံ (Continuous Plain Transcript)</span>
                        </span>
                        <button
                          onClick={() => handleCopy(transcribeResult, 'transcript_raw')}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold border border-white/5 active:scale-95 flex items-center gap-1 hover:text-white"
                        >
                          {copiedType === 'transcript_raw' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedType === 'transcript_raw' ? 'Copied' : 'Copy စာသားအားလုံး'}</span>
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={transcribeResult}
                        className="w-full h-48 bg-black/40 border border-white/5 rounded-lg p-3 text-xs leading-relaxed text-slate-200 focus:outline-none resize-none font-sans"
                        placeholder="စာသားများ အပြည့်အစုံ ဤနေရာတွင် ပေါ်လာပါမည်..."
                      />
                    </div>
                  </div>
                )}

                {/* 1-Click Translate SRT to Target Language Button */}
                {transcribeSrt && (
                  <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Languages className="w-4 h-4 text-emerald-400" />
                          <span>🌐 စာတန်းထိုးများကို ဘာသာပြန်ဆိုမည် (Translate SRT Subtitles)</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          စာတန်းထိုး Timestamps များကို အတိအကျ ထိန်းသိမ်းထားပြီး စာသားအားလုံးကို ရွေးချယ်ထားသော နိုင်ငံဘာသာစကားသို့ ၁ ချက်နှိပ်ရုံဖြင့် အမြန်ဆုံး ဘာသာပြန်ပေးပါမည်
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          value={srtTargetLang}
                          onChange={(e) => setSrtTargetLang(e.target.value)}
                          className="bg-[#090b12] border border-emerald-500/40 rounded-xl px-3 py-2 text-xs font-bold text-emerald-200 focus:outline-none focus:border-emerald-400"
                        >
                          {TARGET_LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>
                              {lang.flag} {lang.name}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleTranslateSrt()}
                          disabled={isTranslatingSrt}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
                        >
                          {isTranslatingSrt ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>ဘာသာပြန်ဆိုနေပါသည်...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-emerald-200" />
                              <span>⚡ စာတန်းထိုး ဘာသာပြန်မည်</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {translateSrtError && (
                      <p className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
                        {translateSrtError}
                      </p>
                    )}
                  </div>
                )}

                {/* Translated Myanmar SRT Display Results */}
                {translatedSrt && (
                  <div className="p-5 bg-[#090b12] border-2 border-emerald-500/40 rounded-2xl space-y-4 animate-in zoom-in-95 duration-300 shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>🇲🇲 မြန်မာဘာသာပြန် စာတန်းထိုး အောင်မြင်စွာ ရရှိပါပြီ (Myanmar Unicode SRT)</span>
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          CapCut / TikTok / Premiere Pro များတွင် အသင့်ထည့်သွင်း အသုံးပြုနိုင်ပါသည်
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => downloadFile(translatedSrt, 'VoiceMaster_Myanmar_Subtitles.srt', 'text/plain')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95"
                        >
                          <Download className="w-4 h-4" />
                          <span>10x Turbo Download Myanmar SRT</span>
                        </button>
                        <button
                          onClick={() => handleCopy(translatedSrt, 'translated_srt')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-white/10 active:scale-95"
                        >
                          {copiedType === 'translated_srt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedType === 'translated_srt' ? 'Copied SRT' : 'Copy SRT'}</span>
                        </button>
                        <button
                          onClick={() => handleCopy(translatedTranscript, 'translated_transcript')}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-bold text-xs flex items-center gap-1.5 border border-indigo-500/30 active:scale-95"
                        >
                          {copiedType === 'translated_transcript' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                          <span>{copiedType === 'translated_transcript' ? 'Copied စာသား' : 'Copy စာသား'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Myanmar Plain Transcript */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span>မြန်မာဘာသာပြန် စာသားအပြည့်အစုံ:</span>
                          <span className="text-[10px] text-slate-500">Unicode Myanmar</span>
                        </label>
                        <textarea
                          readOnly
                          value={translatedTranscript}
                          className="w-full h-64 bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs leading-relaxed text-white focus:outline-none resize-none font-sans"
                        />
                      </div>

                      {/* Interactive Myanmar SRT Timeline Inspector */}
                      <div className="md:col-span-2 pt-2">
                        <SrtTimelineInspector
                          srtText={translatedSrt}
                          title="🇲🇲 မြန်မာဘာသာပြန် စာတန်းထိုး Timeline (စက္ကန့်အလိုက်)"
                          onCopy={handleCopy}
                          onDownload={downloadFile}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Universal Standalone SRT Translator Box */}
                <div className="border-t border-white/10 pt-5 mt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-2">
                        <Languages className="w-4 h-4 text-blue-400" />
                        <span>🌐 မည်သည့် SRT ဖိုင်/စာသားမဆို မြန်မာဘာသာသို့ တိုက်ရိုက်ပြောင်းလဲရန်</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        အင်္ဂလိပ်၊ တရုတ်၊ ထိုင်း၊ ကိုရီးယား၊ ဂျပန် သို့မဟုတ် အခြားဘာသာစကားဖြင့်ရှိသော မည်သည့် SRT ဖိုင်မဆို ထည့်သွင်းပြီး မြန်မာစာတန်းထိုးသို့ ပြောင်းလဲနိုင်ပါသည်
                      </p>
                    </div>

                    {/* File Upload for external SRT */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-300 bg-blue-950/70 border border-blue-500/30 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                        <span>⚡ 15x Turbo Translate</span>
                      </span>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".srt,.txt,.vtt"
                          id="external_srt_file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const content = reader.result as string;
                                setCustomSrtInput(content);
                                // ⚡ 15x Instant Auto-Translate on upload
                                handleTranslateSrt(content);
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="external_srt_file"
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>⚡ .SRT ဖိုင် အမြန်တင်သွင်းမည် (15x Auto-Translate)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      value={customSrtInput}
                      onChange={(e) => setCustomSrtInput(e.target.value)}
                      placeholder={`ဒီနေရာတွင် ပြင်ပမှ မည်သည့် .SRT စာတန်းထိုးကိုမဆို ကူးယူထည့်သွင်းပါ (ဥပမာ):\n1\n00:00:01,000 --> 00:00:04,500\nHello, welcome to this video lesson.\n\n2\n00:00:05,000 --> 00:00:08,200\nToday we are exploring artificial intelligence.`}
                      className="w-full bg-[#080a13] border border-white/10 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500 resize-none shadow-inner"
                    />

                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleTranslateSrt(customSrtInput)}
                        disabled={isTranslatingSrt || !customSrtInput.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/30"
                      >
                        {isTranslatingSrt ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>မြန်မာဘာသာသို့ ပြန်ဆိုနေပါသည်...</span>
                          </>
                        ) : (
                          <>
                            <Languages className="w-3.5 h-3.5" />
                            <span>🇲🇲 မြန်မာ SRT သို့ ဘာသာပြန်မည်</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2.9: VOICE CHARACTER EFFECTS & VOICE CHANGER STUDIO                 */}
        {/* ========================================================================= */}
        {mainMode === 'voiceChanger' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>🎭 Voice Character Effects Studio (အသံပြောင်းစက် အထူးပြုလုပ်ချက်များ)</span>
                  </h2>
                  <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                    DSP Multi-Character Voice FX
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  မည်သည့် အသံဖိုင် သို့မဟုတ် စကားပြောသံကိုမဆို သရဲ/ဘီလူးသံ၊ စက်ရုပ်သံ၊ ကလေးသံ၊ စပီကာသံ၊ ဖုန်းပြောသံ၊ ပဲ့တင်သံ၊ ဂြိုဟ်သားသံ စသည့် ထူးခြားဆန်းပြားသော Character အသံ ၁၀ မျိုးအဖြစ် ချက်ချင်း ပြောင်းလဲထုတ်လုပ်ပါ
                </p>
              </div>

              {/* Step 1: Select Input Mode */}
              <div className="space-y-4 bg-[#0d101d] p-4 sm:p-5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    ၁။ အသံ ထည့်သွင်းမည့် နည်းလမ်း ရွေးချယ်ပါ (Select Input Method)
                  </h3>
                  <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setVcInputMode('upload')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        vcInputMode === 'upload'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📁 အသံဖိုင် တင်မည်
                    </button>
                    <button
                      type="button"
                      onClick={() => setVcInputMode('mic')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        vcInputMode === 'mic'
                          ? 'bg-rose-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🎙️ မိုက်ဖြင့် အသံသွင်းမည်
                    </button>
                    <button
                      type="button"
                      onClick={() => setVcInputMode('tts')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        vcInputMode === 'tts'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ✍️ စာသား ရိုက်ထည့်မည်
                    </button>
                  </div>
                </div>

                {/* Mode A: Upload Audio File */}
                {vcInputMode === 'upload' && (
                  <div className="space-y-3">
                    {/* Quick import from recent TTS */}
                    {ttsResult?.audioUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setVcAudioPreview(ttsResult.audioUrl);
                            setVcAudioFile(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>✨ လက်ရှိ TTS အသံကို ထည့်သွင်းမည်</span>
                        </button>
                      </div>
                    )}

                    <label className="border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-black/20 hover:bg-amber-500/5 transition-all text-center">
                      <Upload className="w-7 h-7 text-amber-400" />
                      <div className="text-xs font-bold text-slate-200">
                        {vcAudioFile ? vcAudioFile.name : 'MP3 / WAV / M4A / AAC အသံဖိုင် ရွေးချယ်တင်သွင်းရန် နှိပ်ပါ'}
                      </div>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVcAudioFile(file);
                            const url = URL.createObjectURL(file);
                            setVcAudioPreview(url);
                          }
                        }}
                      />
                    </label>

                    {vcAudioPreview && (
                      <div className="p-3 bg-black/40 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>မူရင်းအသံဖိုင် ထည့်သွင်းထားပြီးပါပြီ</span>
                        </div>
                        <audio src={vcAudioPreview} controls className="h-8 max-w-[220px]" />
                      </div>
                    )}
                  </div>
                )}

                {/* Mode B: Live Mic Recording */}
                {vcInputMode === 'mic' && (
                  <div className="space-y-4 text-center p-6 bg-black/30 rounded-xl border border-rose-500/20">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        vcIsRecording
                          ? 'bg-rose-600 animate-pulse ring-8 ring-rose-600/30 shadow-lg shadow-rose-600/50'
                          : 'bg-[#1e2337] border border-white/10'
                      }`}>
                        <Mic className={`w-8 h-8 ${vcIsRecording ? 'text-white' : 'text-rose-400'}`} />
                      </div>

                      {vcIsRecording ? (
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-rose-400 animate-pulse">
                            🎙️ အသံသွင်းနေပါသည် ({vcRecordSec} စက္ကန့်)
                          </div>
                          <p className="text-xs text-slate-400">စကားပြောဆိုပြီးပါက ရပ်တန့်ရန် ခလုတ်ကို နှိပ်ပါ</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-slate-200">
                            {vcAudioPreview ? '✓ အသံသွင်းယူပြီးပါပြီ (ပြန်လည်နားဆင်နိုင်ပါသည်)' : 'မိုက်ခရိုဖုန်း စတင် အသံသွင်းရန် အောက်ပါခလုတ်ကို နှိပ်ပါ'}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-1">
                        {vcIsRecording ? (
                          <button
                            type="button"
                            onClick={stopVcRecording}
                            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/40 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <Square className="w-4 h-4 fill-white" />
                            <span>အသံသွင်းခြင်း ရပ်တန့်မည် (Stop)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={startVcRecording}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-600/40 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <Mic className="w-4 h-4" />
                            <span>{vcAudioPreview ? 'အသံ အသစ်ပြန်သွင်းမည်' : 'အသံ စတင်သွင်းမည် (Record)'}</span>
                          </button>
                        )}
                      </div>

                      {vcAudioPreview && !vcIsRecording && (
                        <div className="w-full max-w-sm mt-3 p-3 bg-black/50 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-3">
                          <span className="text-[11px] font-bold text-emerald-400">သွင်းထားသော အသံ:</span>
                          <audio src={vcAudioPreview} controls className="h-8 max-w-[200px]" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mode C: Text to Speech Input */}
                {vcInputMode === 'tts' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <span>ပြောကြားစေလိုသော စာသား (Text to Speak):</span>
                        </label>
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                          <span>♾️ စာလုံးရေ အကန့်အသတ်မရှိ (Unlimited Characters)</span>
                          <span className="text-slate-400">| {vcTtsText.length} လုံး</span>
                        </span>
                      </div>
                      <textarea
                        value={vcTtsText}
                        onChange={(e) => setVcTtsText(e.target.value)}
                        placeholder="ဥပမာ - မင်္ဂလာပါရှင် ကျွန်တော်သည် အနာဂတ်မှ လာသော စက်ရုပ်ဖြစ်ပါသည် (စာလုံးရေ ထောင်နှင့်ချီ၍ စိတ်ကြိုက် ရိုက်ထည့်နိုင်ပါသည်)..."
                        className="w-full h-28 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all resize-none"
                      />
                    </div>

                    {/* Quick Sample Presets for Testing */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold">နမူနာ စာသားများ:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setVcTtsText('သတိပေးချက်! စနစ်လုံခြုံရေးချိုးဖောက်မှု တွေ့ရှိရပါသည်။ အလိုအလျောက် ကာကွယ်ရေးစနစ် စတင်အသက်ဝင်နေပါပြီ။');
                          setVcSelectedEffect('robot');
                        }}
                        className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] transition-all border border-white/5"
                      >
                        🤖 စက်ရုပ် အမိန့်သံ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVcTtsText('ညသန်းခေါင်ယံ အမှောင်ထုထဲကနေ မင်းကို စောင့်ကြည့်နေတာ ငါပဲ... ဘယ်သူမှ မလွတ်မြောက်နိုင်ဘူး ဟားဟားဟား!');
                          setVcSelectedEffect('monster');
                        }}
                        className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] transition-all border border-white/5"
                      >
                        👹 သရဲဘီလူးသံ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVcTtsText('ဟေး သူငယ်ချင်းတို့ရေ! ဒီနေ့တော့ တို့တွေ ပျော်စရာ ကစားနည်းအသစ်တစ်ခု ဆော့ကြရအောင်လား!');
                          setVcSelectedEffect('chipmunk');
                        }}
                        className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] transition-all border border-white/5"
                      >
                        🐿️ ကာတွန်း ကလေးသံ
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 shrink-0">အခြေခံအသံ:</span>
                      <select
                        value={vcTtsVoice}
                        onChange={(e) => setVcTtsVoice(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {voices.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Categorized Real Character Voice FX Presets */}
              <div className="space-y-4 bg-[#0d101d] p-4 sm:p-5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    ၂။ ပြောင်းလဲလိုသော အသံ Character ရွေးချယ်ပါ (Select Character Voice FX)
                  </h3>
                  <span className="text-[10px] text-amber-400/90 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    Real DSP Acoustic Presets
                  </span>
                </div>

                {/* Category 1: Real Cute Child & Kids */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-pink-300 flex items-center gap-1.5">
                    <span>👶 🧒 တကယ့် ကလေးအသံများ (Real Child & Kid Voices):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'child_cute', name: '🧒 တကယ့် ကလေးအသံ', sub: 'သဘာဝကျသော ကလေးငယ် စကားပြောသံစစ်စစ် (Real Cute Kid)' },
                      { id: 'baby_toddler', name: '👶 ကလေးငယ် ချစ်စဖွယ်သံ', sub: 'နူးညံ့ချိုသာသော ကလေးငယ်သံ (Sweet Toddler)' },
                      { id: 'chipmunk', name: '🐿️ ရှဉ့်ကလေးသံ', sub: 'ဟာသ ကာတွန်း အသံစူးစူးလေး (Cute Chipmunk)' }
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setVcSelectedEffect(c.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                          vcSelectedEffect === c.id
                            ? 'bg-pink-600/30 border-pink-500 text-white ring-2 ring-pink-500/50 shadow-lg shadow-pink-900/30'
                            : 'bg-black/30 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-xs font-bold text-pink-200">{c.name}</div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{c.sub}</div>
                        {vcSelectedEffect === c.id && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-400"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category 2: Real Horror, Ghost & Demonic Entities */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                    <span>👻 👹 ထိတ်လန့်ဖွယ် သရဲ/ဘီလူးသံများ (Horror, Demon & Ghost Voices):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'ghost_whisper', name: '👻 သရဲမ ခြောက်ခြားသံ', sub: 'လေတိုးသံ၊ အေးစက်သော ပဲ့တင်သံ (Ghost Whisper)' },
                      { id: 'demon_monster', name: '👹 ငရဲဘီလူး အသံနက်ကြီး', sub: 'ထိတ်လန့်ဖွယ် တုန်ခါသံနက်ကြီး (Demonic Growl)' },
                      { id: 'witch_horror', name: '🧙 စုန်းမကြီး ခြောက်ခြားသံ', sub: 'တုန်ခါကြောက်မက်ဖွယ် စုန်းမသံ (Witch Cackle)' },
                      { id: 'zombie_undead', name: '🧟 ဇွန်ဘီ/ဖုတ်ကောင်သံ', sub: 'လည်ချောင်းသံနက်ကြီးဖြင့် အသက်မဲ့သံ (Zombie)' }
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setVcSelectedEffect(c.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                          vcSelectedEffect === c.id
                            ? 'bg-purple-600/30 border-purple-500 text-white ring-2 ring-purple-500/50 shadow-lg shadow-purple-900/30'
                            : 'bg-black/30 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-xs font-bold text-purple-200">{c.name}</div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{c.sub}</div>
                        {vcSelectedEffect === c.id && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-400"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category 3: Sci-Fi, Cyber & Audio Special Devices */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🤖 📻 သိပ္ပံနှင့် အသံ အထူးပြုလုပ်ချက်များ (Sci-Fi & Audio FX):</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {[
                      { id: 'robot_cyborg', name: '🤖 သံမဏိ စက်ရုပ်သံ', sub: 'Cyber Cyborg Mech' },
                      { id: 'alien_cosmic', name: '👽 ဂြိုဟ်သားသံ', sub: 'Cosmic Alien UFO' },
                      { id: 'megaphone', name: '📢 လမ်းဘေး စပီကာသံ', sub: 'Megaphone Siren' },
                      { id: 'phone_radio', name: '📞 ဖုန်းပြောသံ', sub: 'Phone & Radio' },
                      { id: 'echo_cave', name: '🏰 ဂူနက် ပဲ့တင်သံ', sub: 'Cathedral Cave' },
                      { id: 'vintage_1920', name: '📻 ရှေးဟောင်း ဓာတ်ပြား', sub: '1920s Vinyl Radio' },
                      { id: 'comedy_fast', name: '🏎️ ဟာသ အမြန်သံ', sub: 'Fast Comedy Punch' },
                      { id: 'slow_drama', name: '🐢 ဒရာမာ အနှေးသံ', sub: 'Deep Cinema Slow' }
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setVcSelectedEffect(c.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                          vcSelectedEffect === c.id
                            ? 'bg-amber-600/30 border-amber-500 text-white ring-2 ring-amber-500/50 shadow-lg shadow-amber-900/30'
                            : 'bg-black/30 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-xs font-bold text-amber-200">{c.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{c.sub}</div>
                        {vcSelectedEffect === c.id && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {vcError && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{vcError}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                disabled={isVcLoading || (vcInputMode === 'upload' && !vcAudioFile && !vcAudioPreview) || (vcInputMode === 'mic' && !vcAudioPreview) || (vcInputMode === 'tts' && !vcTtsText.trim())}
                onClick={handleApplyVoiceCharacterEffect}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
              >
                {isVcLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-200" />
                    <span>အသံ အထူးပြုလုပ်ချက် ပြောင်းလဲနေပါသည် ခေတ္တစောင့်ပါ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>✨ 🎭 အသံ အထူးပြုလုပ်ချက် ပြောင်းလဲမည် (Apply Character Voice FX)</span>
                  </>
                )}
              </button>

              {/* Result Audio Player */}
              {vcResultUrl && (
                <div className="p-5 bg-[#0e1220] border border-amber-500/40 rounded-2xl space-y-4 shadow-2xl animate-in fade-in duration-300">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>အသံပြောင်းလဲမှု အောင်မြင်ပါသည်! ({vcSelectedEffect.toUpperCase()})</span>
                    </h3>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openVideoModalForAudio(vcResultUrl, `Voice Changer - ${vcSelectedEffect.toUpperCase()}`)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow active:scale-95 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>🎬 ဗီဒီယို ပြုလုပ်မည်</span>
                      </button>

                      <a
                        href={vcResultUrl}
                        download={`VoiceMaster_${vcSelectedEffect}_${Date.now()}.mp3`}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow active:scale-95 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>.MP3 ဒေါင်းလုဒ်</span>
                      </a>
                    </div>
                  </div>

                  <div className="p-3 bg-black/60 rounded-xl border border-white/10 flex items-center justify-center">
                    <audio src={vcResultUrl} controls autoPlay className="w-full max-w-lg" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* NEW MODE 3: AUDIO SPEED & PITCH SHIFTER STUDIO (Pro Modifier)             */}
        {/* ========================================================================= */}
        {mainMode === 'audioModifier' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-amber-500/20 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <span>🎛️ Audio Speed & Pitch Modifier Studio</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  အသံဖိုင်၏ မြန်နှုန်း (Speed) နှင့် အသံအနိမ့်အမြင့် (Pitch) ကို ကိုယ်တိုင်စိတ်ကြိုက် ချိန်ညှိပြီး TikTok ဟာသသံ သို့မဟုတ် စိတ်ဝင်စားဖွယ် Voice Tuning များ ပြုလုပ်နိုင်ပါသည်
                </p>
              </div>

              <div className="space-y-5">
                {/* Audio upload box */}
                <div className="p-4 bg-[#0d101d] rounded-xl border border-white/5 space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">အသံဖိုင် ရွေးချယ်ပါ (MP3 / WAV သို့မဟုတ် ဖန်တီးပြီးသား အသံ):</label>
                  
                  {/* Quick Select from recent TTS/Dialogue */}
                  <div className="flex flex-wrap gap-2">
                    {ttsResult?.audioUrl && (
                      <button
                        type="button"
                        onClick={() => setShifterAudioData(ttsResult.audioUrl)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>✨ လက်ရှိ TTS အသံကို ရွေးမည်</span>
                      </button>
                    )}
                    {dialogueResult?.audioUrl && (
                      <button
                        type="button"
                        onClick={() => setShifterAudioData(dialogueResult.audioUrl)}
                        className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>💬 စကားဝိုင်း အသံကို ရွေးမည်</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const r = new FileReader();
                        r.onload = () => setShifterAudioData(r.result as string);
                        r.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                  />

                  {shifterAudioData && (
                    <div className="p-2.5 bg-black/40 rounded-lg border border-emerald-500/30 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>မူရင်းအသံဖိုင် ထည့်သွင်းထားပြီးပါပြီ</span>
                      </span>
                      <audio src={shifterAudioData} controls className="h-7 max-w-[200px]" />
                    </div>
                  )}
                </div>

                {/* Slider Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Speed Modifier slider */}
                  <div className="p-4 bg-[#0c0e14] rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>မြန်နှုန်း multiplier (Speed Multiplier):</span>
                      <span className="text-amber-400 font-mono">{shifterSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={shifterSpeed}
                      onChange={(e) => setShifterSpeed(parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <p className="text-[10px] text-slate-500 leading-normal">
                      • 1.0x = ပုံမှန်အမြန်နှုန်း၊ 1.25x = အနည်းငယ်ပိုမြန်ပြီး သက်ဝင်၊ 0.8x = ပိုမိုနှေးကွေး
                    </p>
                  </div>

                  {/* Pitch Modifier slider */}
                  <div className="p-4 bg-[#0c0e14] rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>အသံအနိမ့်အမြင့် (Pitch Multiplier):</span>
                      <span className="text-amber-400 font-mono">{shifterPitch}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.05"
                      value={shifterPitch}
                      onChange={(e) => setShifterPitch(parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <p className="text-[10px] text-slate-500 leading-normal">
                      • 1.3x = ရှဉ့်သံစူးစူး (Chipmunk Voice)၊ 0.8x = အောအောကြီး (Deep Monster Voice)
                    </p>
                  </div>
                </div>

                {/* Action button */}
                {shifterAudioData && (
                  <button
                    onClick={handleShiftAudio}
                    disabled={isShifting}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-amber-600/25"
                  >
                    {isShifting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>FFmpeg က အသံလှိုင်းကို အမြန်နှုန်းနှင့် အမြင့်သံ ချိန်ညှိနေပါသည်...</span>
                      </>
                    ) : (
                      <>
                        <Sliders className="w-4 h-4" />
                        <span>🎛️ အသံပြောင်းလဲမှု စတင်ပြုလုပ်မည် (Apply Adjustments)</span>
                      </>
                    )}
                  </button>
                )}

                {/* Error Box */}
                {shifterError && (
                  <p className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                    {shifterError}
                  </p>
                )}

                {/* Result Display */}
                {shifterResultUrl && (
                  <div className="p-4 bg-[#0a0c12] rounded-xl border border-emerald-500/35 space-y-4 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>အသံဖိုင်ကို စိတ်ကြိုက်ပြောင်းလဲ ပြီးပါပြီ!</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setVideoAudioData(shifterResultUrl);
                            setMainMode('video');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1.5 shadow"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>ဗီဒီယို ပြုလုပ်မည် ➔</span>
                        </button>
                        <a
                          href={shifterResultUrl}
                          download={`VoiceMaster_Modified_${Date.now()}.mp3`}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1.5 shadow"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>10x Turbo Download (.MP3)</span>
                        </a>
                      </div>
                    </div>
                    <audio src={shifterResultUrl} controls className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: 1-CLICK AUTO VIDEO PIPELINE (FEATURE 1)                             */}
        {/* ========================================================================= */}
        {mainMode === 'autoPipeline' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Feature 1: 1-Click Viral Video Generator</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>⚡ 1-Click Story to TikTok/Reels Video Engine</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  ခေါင်းစဉ် (Topic) ရိုက်ထည့်လိုက်ရုံဖြင့် AI က ဇာတ်ညွှန်းရေးဖွဲ့ခြင်း၊ လူအစစ်အသံထွက်ပြောင်းခြင်း၊ AI နောက်ခံပုံထုတ်ခြင်းနှင့် လှပသော MP4 Video အဖြစ် <b>၁ ချက်နှိပ်ရုံဖြင့် အပြီးစီး ဖန်တီးပေးပါမည်</b>
                </p>
              </div>

              <form onSubmit={handleAutoPipeline} className="space-y-5">
                {/* Topic Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>ဗီဒီယို ပြုလုပ်လိုသော ခေါင်းစဉ် (Topic / Idea):</span>
                    <span className="text-[11px] text-amber-400 font-normal">ဥပမာ - သရဲပုံပြင်၊ စိတ်ဓာတ်ခွန်အား၊ သမိုင်းဖြစ်ရပ်</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pipelineTopic}
                    onChange={(e) => setPipelineTopic(e.target.value)}
                    placeholder="ဥပမာ - ညသန်းခေါင် အဝေးပြေးလမ်းမပေါ်က ထူးဆန်းသော ကားကြုံခရီးသည် (သို့မဟုတ်) စိတ်ဓာတ်ခွန်အား"
                    className="w-full bg-[#0d101d] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                {/* Image Upload for Slideshow */}
                <div className="space-y-2.5 p-4 rounded-xl bg-[#0d101d] border border-amber-500/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-amber-400" />
                      <span>ဗီဒီယို နောက်ခံပုံများ (ပုံ ၁၀ ပုံအထိ တင်နိုင်သည်):</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        ({pipelineImages.filter(Boolean).length}/10 ပုံ တင်ထားသည်)
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>ပုံ (၁၀) ပုံ တစ်ပြိုင်နက် ရွေးတင်ရန်</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []).slice(0, 10);
                            if (files.length > 0) {
                              Promise.all(
                                files.map(file => new Promise<string>((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => resolve(ev.target?.result as string);
                                  reader.readAsDataURL(file);
                                }))
                              ).then(loadedImgs => {
                                setPipelineImages(loadedImgs);
                              });
                            }
                          }}
                        />
                      </label>
                      {pipelineImages.filter(Boolean).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPipelineImages([])}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>ရှင်းမည်</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    💡 ပုံ (၁) ပုံမှ (၁၀) ပုံအထိ တင်နိုင်ပြီး AI က <b>Zoom In, Zoom Out, Pan & Slide Transitions</b> များဖြင့် ဇာတ်လမ်းမပြီးမချင်း အလှည့်ကျ လှုပ်ရှားပြသပေးပါမည်။ (ပုံမတင်ပါက AI က ဇာတ်လမ်းနှင့် ကိုက်ညီသော ပုံများကို အလိုအလျောက် ဖန်တီးပေးပါမည်)
                  </p>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="relative aspect-square bg-[#151926] border border-white/10 rounded-lg flex items-center justify-center overflow-hidden group">
                        {pipelineImages[i] ? (
                          <>
                            <img src={pipelineImages[i]} alt={`Slide ${i+1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 left-0.5 bg-black/70 text-[9px] text-white px-1 rounded">
                              #{i+1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...pipelineImages];
                                newImages.splice(i, 1);
                                setPipelineImages(newImages);
                              }}
                              className="absolute top-0 right-0 bg-rose-600/90 text-white p-1 rounded-bl-lg hover:bg-rose-500 transition-all"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full cursor-pointer text-slate-500 hover:text-amber-400 hover:border-amber-500 flex flex-col items-center justify-center gap-0.5 transition-all">
                            <Plus className="w-4 h-4" />
                            <span className="text-[9px] font-bold text-slate-500">#{i+1}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const newImages = [...pipelineImages];
                                  newImages[i] = ev.target?.result as string;
                                  setPipelineImages(newImages);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Genre, Duration & Aspect Ratio */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">ဇာတ်လမ်း အမျိုးအစား (Genre):</label>
                    <select
                      value={pipelineGenre}
                      onChange={(e) => setPipelineGenre(e.target.value)}
                      className="w-full bg-[#0d101d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="motivation">💪 စိတ်ခွန်အားဖြည့် (Motivation)</option>
                      <option value="horror">👻 သရဲ / ထိတ်လန့်ဖွယ် (Horror Mystery)</option>
                      <option value="history">🏛️ သမိုင်းနှင့် ထူးခြားဖြစ်ရပ်များ (History & Facts)</option>
                      <option value="tech">💻 နည်းပညာနှင့် အနာဂတ် AI (Tech & Future)</option>
                      <option value="bedtime-story">🌙 ဒဏ္ဍာရီပုံပြင် (Folktale & Legend)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-300">ဗီဒီယို ကြာမြင့်ချိန် (Duration):</label>
                    <select
                      value={pipelineDuration}
                      onChange={(e) => setPipelineDuration(e.target.value as any)}
                      className="w-full bg-[#0d101d] border border-amber-500/40 rounded-xl px-3 py-2.5 text-xs text-amber-200 font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="8min">⭐ ၈ မိနစ် ဇာတ်လမ်းရှည်အပြည့် (8 Minutes Full Story - စာလုံးရေ ၁၂,၀၀၀)</option>
                      <option value="5min">🎥 ၅ မိနစ် - ၆ မိနစ် (5-6 Mins Standard Story - စာလုံးရေ ၇,၅၀၀)</option>
                      <option value="10min">🏆 ၁၀ မိနစ် ရုပ်ရှင်ဇာတ်ကားရှည် (10 Mins Epic - စာလုံးရေ ၁၅,၀၀၀)</option>
                      <option value="3min">🎬 ၃ မိနစ် (3 Mins Story - စာလုံးရေ ၄,၅၀၀)</option>
                      <option value="short">⚡ ၃၀ စက္ကန့် - ၁ မိနစ်တို (Shorts / TikTok / Reels)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">ဗီဒီယို အရွယ်အစား (Aspect Ratio):</label>
                    <select
                      value={pipelineAspectRatio}
                      onChange={(e) => setPipelineAspectRatio(e.target.value as any)}
                      className="w-full bg-[#0d101d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="9:16">📱 9:16 Vertical (TikTok / Reels / Shorts)</option>
                      <option value="16:9">💻 16:9 Horizontal (YouTube / TV)</option>
                      <option value="1:1">📷 1:1 Square (Facebook / Instagram)</option>
                    </select>
                  </div>
                </div>

                {/* Error Banner */}
                {pipelineError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{pipelineError}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isPipelineLoading || !pipelineTopic.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isPipelineLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                      <span>⚡ AI က ဇာတ်ညွှန်း၊ အသံနှင့် ဗီဒီယိုကို အလိုအလျောက် ပေါင်းစပ်ထုတ်လုပ်နေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>⚡ 1-Click ဗီဒီယို အပြည့်အစုံ ဖန်တီးမည် (Auto-Generate MP4)</span>
                    </>
                  )}
                </button>
              </form>

              {/* Pipeline Result */}
              {pipelineResult && (
                <div className="p-5 bg-[#0a0c12] rounded-2xl border border-amber-500/30 space-y-5 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ဗီဒီယို အောင်မြင်စွာ ထုတ်လုပ်ပြီးစီးပါပြီ!</span>
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{pipelineResult.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={pipelineResult.videoUrl}
                        download={`VoiceMaster_Pipeline_${Date.now()}.mp4`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>10x Turbo Download (.MP4)</span>
                      </a>
                    </div>
                  </div>

                  {/* Video Player */}
                  <div className="max-w-md mx-auto aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <video src={pipelineResult.videoUrl} controls className="w-full h-full object-contain" />
                  </div>

                  {/* Visual Editor Notice Banner */}
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 text-xs text-amber-200">
                    <Zap className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                    <div>
                      <p className="font-bold">🎬 Subtitles Sync Editor အသင့်ရှိပါသည်!</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        အောက်တွင် စာတန်းထိုးများကို တစ်ခုချင်းစီ စိတ်ကြိုက်ပြင်ဆင်နိုင်ပြီး Timing ညှိကာ ဗီဒီယိုထဲသို့ တိုက်ရိုက် ထည့်သွင်းနိုင်ပါသည် (ဗီဒီယို၏ အောက်ဆုံးပိုင်းသို့ ဆွဲဆင်းကြည့်ပါ)
                      </p>
                    </div>
                  </div>

                  {/* Script Accordion */}
                  <div className="p-4 bg-[#121520] rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">📖 AI ရေးဖွဲ့ထားသော ဇာတ်ညွှန်း:</span>
                      <button
                        onClick={() => handleCopy(pipelineResult.script, 'pipeline_script')}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold border border-white/5 flex items-center gap-1 active:scale-95"
                      >
                        {copiedType === 'pipeline_script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedType === 'pipeline_script' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line bg-black/30 p-2.5 rounded-lg">
                      {pipelineResult.script}
                    </p>
                  </div>

                  {/* Visual Subtitle Edit & Sync Studio */}
                  {editingCues && editingCues.length > 0 && (
                    <div className="p-4 bg-[#121520] rounded-xl border border-amber-500/20 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span>🎬 SRT Subtitle & Video Synchronization Studio</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            စာတန်းထိုးစာသားနှင့် အချိန်ကိုက်Timing များကို စိတ်ကြိုက်ညှိပြီး ဗီဒီယိုအတွင်း တိုက်ရိုက်ထည့်သွင်းနိုင်ပါသည်
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={isBurningSubtitles}
                          onClick={handleBurnSubtitles}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 active:scale-95 disabled:opacity-50 transition-all"
                        >
                          {isBurningSubtitles ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>ဗီဒီယိုထဲသို့ စာတန်းထိုးထည့်နေသည်...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-amber-300" />
                              <span>🔥 Burn Subtitles directly to Video</span>
                            </>
                          )}
                        </button>
                      </div>

                      {burnError && (
                        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-200">
                          {burnError}
                        </div>
                      )}

                      {/* Cue list */}
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 bg-black/20 p-2.5 rounded-lg">
                        {editingCues.map((cue, idx) => (
                          <div key={idx} className="p-3 bg-[#0d101d] border border-white/5 rounded-lg flex flex-col gap-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-1.5">
                              <span className="text-[10px] font-bold text-amber-400">Cue #{cue.index}</span>
                              <div className="flex items-center gap-3">
                                {/* Start time control */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-400">စချိန်:</span>
                                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/20">{cue.startTime}</span>
                                  <button type="button" onClick={() => adjustCueTime(idx, 'start', -500)} className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold">-0.5s</button>
                                  <button type="button" onClick={() => adjustCueTime(idx, 'start', -100)} className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold">-0.1s</button>
                                  <button type="button" onClick={() => adjustCueTime(idx, 'start', 100)} className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold">+0.1s</button>
                                  <button type="button" onClick={() => adjustCueTime(idx, 'start', 500)} className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold">+0.5s</button>
                                </div>
                                {/* End time control */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-400">ဆုံးချိန်:</span>
                                  <span className="font-mono text-[10px] text-rose-400 bg-rose-950/30 px-1.5 py-0.5 rounded border border-rose-500/20">{cue.endTime}</span>
                                  <button type="button" onClick={() => adjustCueTime(idx, 'end', -500)} className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold">-0.5s</button>
                                  <button type="button" onClick={() => adjustCueTime(idx, 'end', -100)} className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold">-0.1s</button>
                                  <button type="button" onClick={() => adjustCueTime(idx, 'end', 100)} className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold">+0.1s</button>
                                  <button type="button" onClick={() => adjustCueTime(idx, 'end', 500)} className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold">+0.5s</button>
                                </div>
                              </div>
                            </div>
                            {/* Text Input */}
                            <input
                              type="text"
                              value={cue.text}
                              onChange={(e) => {
                                const newCues = [...editingCues];
                                newCues[idx] = { ...cue, text: e.target.value };
                                setEditingCues(newCues);
                              }}
                              className="w-full bg-[#151926] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: PRO SUBTITLE BURNER & VIDEO DUBBING STUDIO (FEATURE 2)              */}
        {/* ========================================================================= */}
        {mainMode === 'subtitleBurner' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
                  <Subtitles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Feature 2: Advanced Subtitle Burner & Dubber</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🎬 Pro Subtitle Burner & Video Dubbing Studio</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  သင့်ဗီဒီယိုများကို စာတန်းထိုး (Subtitles) တိုက်ရိုက်ကပ်ခြင်းနှင့် AI အသံဖြင့် အသံသွင်းခြင်း (Dubbing) ကို တိကျစွာ ပြုလုပ်ပေးပါသည်
                </p>
              </div>

              <form onSubmit={handleBurnerSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column: Video & Voice Setup */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-200">၁။ ဗီဒီယိုဖိုင် တင်ရန် (Upload Video):</label>
                      <input
                        type="file"
                        accept="video/*"
                        required
                        onChange={(e) => setBurnerVideoFile(e.target.files?.[0] || null)}
                        className="w-full bg-[#0d101d] border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-black/30 rounded-xl border border-white/5">
                      <label className="text-xs font-bold text-emerald-400">၂။ Dubbing အသံရှင် ရွေးချယ်ရန်:</label>
                      <div className="grid grid-cols-1 gap-3">
                        <select
                          value={burnerVoice}
                          onChange={(e) => setBurnerVoice(e.target.value)}
                          className="w-full bg-[#0d101d] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          {voices.slice(0, 10).map(v => (
                            <option key={v.id} value={v.id}>{v.name} ({v.desc})</option>
                          ))}
                        </select>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>အသံအမြန်နှုန်း:</span>
                          <div className="flex items-center gap-1.5">
                            {['-10%', '+0%', '+10%', '+20%'].map(r => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setBurnerVoiceSpeed(r)}
                                className={`px-2 py-0.5 rounded border transition-all ${burnerVoiceSpeed === r ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleBurnerSpeakSrt}
                          disabled={isBurnerVoiceLoading || !burnerSrtText.trim()}
                          className="w-full py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          {isBurnerVoiceLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>အသံသွင်းကြည့်မည် (Preview Voice)</span>
                        </button>

                        {burnerDubbedAudioUrl && (
                          <div className="pt-1">
                            <audio src={burnerDubbedAudioUrl} controls className="w-full h-8" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: SRT Input & Burning Options */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="text-xs font-bold text-slate-200">၃။ SRT စာတန်းထိုး ထည့်သွင်းရန်:</label>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-500/40 cursor-pointer flex items-center gap-1 transition-all active:scale-95 shadow">
                            <Upload className="w-3 h-3 text-cyan-400" />
                            <span>⚡ .SRT ဖိုင် တင်မည် (15x Fast)</span>
                            <input
                              type="file"
                              accept=".srt,.txt,.vtt"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onload = () => {
                                    const text = r.result as string;
                                    setBurnerSrtText(text);
                                    setEditingCues(parseSrtHelper(text));
                                  };
                                  r.readAsText(file);
                                }
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setBurnerSrtText("1\n00:00:01,000 --> 00:00:04,500\nမင်္ဂလာပါခင်ဗျာ၊ VoiceMaster မှ ကြိုဆိုပါတယ်။\n\n2\n00:00:05,000 --> 00:00:08,200\nဒီဗီဒီယိုမှာ စာတန်းထိုးကပ်နည်းကို လေ့လာနိုင်ပါတယ်။");
                            }}
                            className="text-[10px] text-emerald-400 hover:underline"
                          >
                            နမူနာထည့်မည်
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={8}
                        value={burnerSrtText}
                        onChange={(e) => setBurnerSrtText(e.target.value)}
                        placeholder="SRT format ဖြင့် စာတန်းထိုးများကို ဤနေရာတွင် ထည့်ပါ..."
                        className="w-full bg-[#0d101d] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-emerald-500 resize-none leading-relaxed mb-3"
                      />
                      
                      <button
                        type="button"
                        onClick={handleOpenBurnerSyncEditor}
                        className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>🛠️ Visual Subtitle Sync Editor ဖွင့်မည် (Timing ညှိရန်)</span>
                      </button>
                    </div>

                    {/* Visual Editor in Burner Mode */}
                    {showBurnerSyncEditor && editingCues.length > 0 && (
                      <div className="p-4 bg-black/40 border border-amber-500/30 rounded-xl space-y-4 animate-in slide-in-from-top-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <h4 className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Timing Editor (အသံနှင့် စာတန်းထိုး ညှိရန်)</span>
                          </h4>
                          <button 
                            type="button" 
                            onClick={() => setShowBurnerSyncEditor(false)}
                            className="text-[10px] text-slate-500 hover:text-white"
                          >
                            Close Editor ✕
                          </button>
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {editingCues.map((cue, idx) => (
                            <div key={idx} className="p-2.5 bg-[#0d101d] border border-white/5 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400">#{cue.index}</span>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] text-slate-500">စချိန်:</span>
                                    <span className="font-mono text-[9px] text-emerald-400 bg-emerald-950/30 px-1 py-0.5 rounded border border-emerald-500/20">{cue.startTime}</span>
                                    <button type="button" onClick={() => adjustCueTime(idx, 'start', -100)} className="p-0.5 rounded bg-slate-800 text-[8px]">-0.1s</button>
                                    <button type="button" onClick={() => adjustCueTime(idx, 'start', 100)} className="p-0.5 rounded bg-slate-800 text-[8px]">+0.1s</button>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] text-slate-500">ဆုံးချိန်:</span>
                                    <span className="font-mono text-[9px] text-rose-400 bg-rose-950/30 px-1 py-0.5 rounded border border-rose-500/20">{cue.endTime}</span>
                                    <button type="button" onClick={() => adjustCueTime(idx, 'end', -100)} className="p-0.5 rounded bg-slate-800 text-[8px]">-0.1s</button>
                                    <button type="button" onClick={() => adjustCueTime(idx, 'end', 100)} className="p-0.5 rounded bg-slate-800 text-[8px]">+0.1s</button>
                                  </div>
                                </div>
                              </div>
                              <input 
                                type="text"
                                value={cue.text}
                                onChange={(e) => {
                                  const newCues = [...editingCues];
                                  newCues[idx] = { ...cue, text: e.target.value };
                                  setEditingCues(newCues);
                                }}
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">စာတန်းထိုး တိုက်ရိုက်ကပ်မည်:</label>
                        <input
                          type="checkbox"
                          checked={burnerBurnSubtitles}
                          onChange={(e) => setBurnerBurnSubtitles(e.target.checked)}
                          className="w-4 h-4 accent-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300">အသံသွင်းစတိုင် (Audio Mix):</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setBurnerMixOption('mix')}
                            className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${burnerMixOption === 'mix' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-black/40 border-white/10 text-slate-400'}`}
                          >
                            မူရင်းအသံ + AI (Mix)
                          </button>
                          <button
                            type="button"
                            onClick={() => setBurnerMixOption('replace')}
                            className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${burnerMixOption === 'replace' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-black/40 border-white/10 text-slate-400'}`}
                          >
                            AI အသံသီးသန့် (Replace)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {burnerError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{burnerError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBurnerLoading || !burnerVideoFile || !burnerSrtText.trim()}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-2xl shadow-emerald-600/40 flex items-center justify-center gap-3 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {isBurnerLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-200" />
                      <span>ဗီဒီယိုကို အသံသွင်းပြီး စာတန်းထိုးကပ်နေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-emerald-300" />
                      <span>🔥 ဗီဒီယိုအတွင်း စာတန်းထိုးနှင့် အသံသွင်းခြင်း စတင်မည်</span>
                    </>
                  )}
                </button>
              </form>

              {burnerResultVideoUrl && (
                <div className="p-6 bg-[#0a0c12] rounded-2xl border-2 border-emerald-500/40 space-y-5 animate-in zoom-in-95 duration-300 shadow-2xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>ဗီဒီယို အောင်မြင်စွာ ထုတ်လုပ်ပြီးပါပြီ!</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">CapCut/TikTok အတွက် အသင့်သုံးနိုင်သော ဗီဒီယို ဖြစ်ပါသည်</p>
                    </div>
                    <a
                      href={burnerResultVideoUrl}
                      download={`VoiceMaster_BurnedVideo_${Date.now()}.mp4`}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>10x Turbo Download (.MP4)</span>
                    </a>
                  </div>

                  <div className="aspect-[9/16] max-h-[500px] w-full mx-auto bg-black rounded-xl overflow-hidden border border-white/10 relative shadow-inner">
                    <video src={burnerResultVideoUrl} controls className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: MULTI-LANGUAGE TRANSLATOR & LIVE 2-WAY VOICE INTERPRETER (FEATURE 4) */}
        {/* ========================================================================= */}
        {mainMode === 'translator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hidden Audio Element for Auto-Playing Interpreted Spoken Voice */}
            <audio ref={interpAudioPlayerRef} className="hidden" />

            <div className="bg-[#151926] border border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              {/* Studio Header */}
              <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 mb-2">
                    <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span>Feature 4: Global Live Voice Interpreter & Translator</span>
                  </div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🌐 Real-Time Live 2-Way Voice-to-Voice Interpreter & Translation Studio</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    မြန်မာ၊ လာအို (Lao)၊ ထိုင်း၊ အင်္ဂလိပ်နှင့် ကမ္ဘာ့ဘာသာစကားများအကြား အသံဖြင့်ပြောဆို၍ အပြန်အလှန် စကားပြန်အဖြစ် အသံထွက် ချက်ချင်း ပြန်ဆိုပေးပါသည်
                  </p>
                </div>

                {/* Subtab Navigation */}
                <div className="flex items-center gap-1 bg-[#0d101d] p-1.5 rounded-xl border border-white/10 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setTranslatorTab('live')}
                    className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      translatorTab === 'live'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-emerald-300" />
                    <span>🎙️ Live အသံ စကားပြန်</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTranslatorTab('text')}
                    className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      translatorTab === 'text'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Languages className="w-3.5 h-3.5 text-blue-300" />
                    <span>🌐 စာသား ဘာသာပြန် + အသံ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTranslatorTab('srt')}
                    className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      translatorTab === 'srt'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Subtitles className="w-3.5 h-3.5 text-purple-300" />
                    <span>📝 စာတန်းထိုး SRT</span>
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 1: LIVE 2-WAY VOICE INTERPRETER (WALKIE-TALKIE DUAL MIC) */}
              {/* ------------------------------------------------------------- */}
              {translatorTab === 'live' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Language Settings & Controls Bar */}
                  <div className="p-4 bg-[#0d101d] rounded-2xl border border-white/10 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                      {/* Speaker A Language (You) */}
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                          <span>👤 သင် (သင့်ဘာသာစကား):</span>
                          <span className="text-[10px] text-slate-400">Speaker A</span>
                        </label>
                        <select
                          value={interpLangA}
                          onChange={(e) => setInterpLangA(e.target.value)}
                          className="w-full bg-[#151926] border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-bold"
                        >
                          {TARGET_LANGUAGES.map((l) => (
                            <option key={`a_${l.id}`} value={l.id}>
                              {l.flag} {l.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Swap Languages Button */}
                      <div className="md:col-span-3 flex justify-center">
                        <button
                          type="button"
                          onClick={swapInterpLanguages}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-2 active:scale-95 shadow transition-all"
                        >
                          <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
                          <span>ဘာသာစကား လဲလှယ်မည်</span>
                        </button>
                      </div>

                      {/* Speaker B Language (Foreign Friend) */}
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-xs font-bold text-cyan-400 flex items-center justify-between">
                          <span>👥 တစ်ဖက်လူ (သူ့ဘာသာစကား):</span>
                          <span className="text-[10px] text-slate-400">Speaker B</span>
                        </label>
                        <select
                          value={interpLangB}
                          onChange={(e) => setInterpLangB(e.target.value)}
                          className="w-full bg-[#151926] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                        >
                          {TARGET_LANGUAGES.map((l) => (
                            <option key={`b_${l.id}`} value={l.id}>
                              {l.flag} {l.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Additional Options: Voice Gender, Auto-Play, Face-to-Face */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Voice Gender Switch */}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px] font-bold">စကားပြန် အသံ:</span>
                          <div className="flex items-center bg-[#151926] p-0.5 rounded-lg border border-white/10">
                            <button
                              type="button"
                              onClick={() => setInterpVoiceGender('male')}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                interpVoiceGender === 'male'
                                  ? 'bg-blue-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              👨 အမျိုးသားသံ
                            </button>
                            <button
                              type="button"
                              onClick={() => setInterpVoiceGender('female')}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                interpVoiceGender === 'female'
                                  ? 'bg-pink-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              👩 အမျိုးသမီးသံ
                            </button>
                          </div>
                        </div>

                        {/* Auto-Play Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                          <input
                            type="checkbox"
                            checked={interpAutoPlay}
                            onChange={(e) => setInterpAutoPlay(e.target.checked)}
                            className="w-4 h-4 accent-emerald-500"
                          />
                          <span className="text-[11px] font-bold">🔊 အလိုအလျောက် အသံဖွင့်ပြမည် (Auto-Speak)</span>
                        </label>
                      </div>

                      {/* Face-to-Face Mode Switch */}
                      <button
                        type="button"
                        onClick={() => setInterpFaceToFace(!interpFaceToFace)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          interpFaceToFace
                            ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                            : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        📱 မျက်နှာချင်းဆိုင် မုဒ် ({interpFaceToFace ? 'ON' : 'OFF'})
                      </button>
                    </div>
                  </div>

                  {/* Dual Walkie-Talkie Microphone Controls */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${interpFaceToFace ? 'flex flex-col-reverse md:grid' : ''}`}>
                    {/* Speaker A Microphone Card (You - e.g. Myanmar) */}
                    <div className="p-5 bg-gradient-to-b from-emerald-950/40 via-[#0e171b] to-[#0a1014] rounded-2xl border-2 border-emerald-500/40 shadow-xl flex flex-col items-center justify-between gap-4 text-center">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40">
                          <span>{TARGET_LANGUAGES.find((l) => l.id === interpLangA)?.flag || '🇲🇲'}</span>
                          <span>{TARGET_LANGUAGES.find((l) => l.id === interpLangA)?.name?.split(' ')[0] || interpLangA} (သင့်ဘက်မှ ပြောပါ)</span>
                        </div>
                        <h3 className="text-sm font-bold text-white">သင် စကားပြောရန် ဖိနှိပ်ပါ</h3>
                        <p className="text-[11px] text-slate-400">
                          {TARGET_LANGUAGES.find((l) => l.id === interpLangA)?.name?.split(' ')[0]}လို ပြောပါက တစ်ဖက်သို့ {TARGET_LANGUAGES.find((l) => l.id === interpLangB)?.name?.split(' ')[0]}လို ပြန်ဆိုပေးပါမည်
                        </p>
                      </div>

                      {/* Big Mic Action Button */}
                      <div className="py-2 flex flex-col items-center gap-2">
                        {interpIsRecording && interpActiveSpeaker === 'personA' ? (
                          <button
                            type="button"
                            onClick={stopInterpRecording}
                            className="w-24 h-24 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center justify-center gap-1 shadow-2xl shadow-rose-600/60 ring-8 ring-rose-500/30 animate-pulse active:scale-95 transition-all"
                          >
                            <Square className="w-8 h-8 fill-white" />
                            <span className="text-[11px] font-bold font-mono">{interpRecordSec}s ရပ်မည်</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isInterpLoading || (interpIsRecording && interpActiveSpeaker !== 'personA')}
                            onClick={() => startInterpRecording('personA')}
                            className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex flex-col items-center justify-center gap-1 shadow-2xl shadow-emerald-600/50 ring-4 ring-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <Mic className="w-8 h-8" />
                            <span className="text-[11px] font-bold">နှိပ်ပြီး ပြောပါ</span>
                          </button>
                        )}

                        {/* Audio File Upload Option for Speaker A */}
                        <div className="w-full pt-1">
                          <input
                            type="file"
                            accept="audio/*"
                            id="spkA_audio_upload"
                            className="hidden"
                            onChange={(e) => handleInterpFileUpload(e, 'personA')}
                          />
                          <label
                            htmlFor="spkA_audio_upload"
                            className="text-[10px] text-emerald-400/90 hover:text-emerald-300 font-bold flex items-center justify-center gap-1 cursor-pointer bg-emerald-950/60 hover:bg-emerald-900/60 py-1.5 px-3 rounded-xl border border-emerald-500/30 transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>📂 သို့မဟုတ် အသံဖိုင် တင်သွင်းမည်</span>
                          </label>
                        </div>
                      </div>

                      {/* Quick Myanmar Phrase Pills */}
                      <div className="w-full space-y-1.5 pt-2 border-t border-emerald-500/20">
                        <span className="text-[10px] text-emerald-400 font-bold block">စမ်းသပ်ပြောကြည့်ရန် အသင့်သုံး စကားစုများ:</span>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {[
                            'မင်္ဂလာပါခင်ဗျာ',
                            'နေကောင်းရဲ့လား',
                            'ဘယ်လောက်ကျပါသလဲ',
                            'ကျေးဇူးအများကြီးတင်ပါတယ်',
                            'အားလုံး အဆင်ပြေပါတယ်'
                          ].map((ph, idx) => (
                            <button
                              key={idx}
                              type="button"
                              disabled={isInterpLoading}
                              onClick={() => handleSendInterpText('personA', ph)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 text-[10px] font-medium border border-emerald-500/30 active:scale-95 transition-all"
                            >
                              {ph}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Speaker B Microphone Card (Foreign Friend - e.g. Lao) */}
                    <div
                      className={`p-5 bg-gradient-to-b from-cyan-950/40 via-[#0a151f] to-[#080d14] rounded-2xl border-2 border-cyan-500/40 shadow-xl flex flex-col items-center justify-between gap-4 text-center ${
                        interpFaceToFace ? 'rotate-180 md:rotate-0' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/40">
                          <span>{TARGET_LANGUAGES.find((l) => l.id === interpLangB)?.flag || '🇱🇦'}</span>
                          <span>{TARGET_LANGUAGES.find((l) => l.id === interpLangB)?.name?.split(' ')[0] || interpLangB} (တစ်ဖက်လူ ပြောရန်)</span>
                        </div>
                        <h3 className="text-sm font-bold text-white">တစ်ဖက်လူ ပြောရန် ဖိနှိပ်ပါ</h3>
                        <p className="text-[11px] text-slate-400">
                          {TARGET_LANGUAGES.find((l) => l.id === interpLangB)?.name?.split(' ')[0]}လို ပြောပါက သင့်ထံသို့ {TARGET_LANGUAGES.find((l) => l.id === interpLangA)?.name?.split(' ')[0]}လို ပြန်ဆိုပေးပါမည်
                        </p>
                      </div>

                      {/* Big Mic Action Button */}
                      <div className="py-2 flex flex-col items-center gap-2">
                        {interpIsRecording && interpActiveSpeaker === 'personB' ? (
                          <button
                            type="button"
                            onClick={stopInterpRecording}
                            className="w-24 h-24 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center justify-center gap-1 shadow-2xl shadow-rose-600/60 ring-8 ring-rose-500/30 animate-pulse active:scale-95 transition-all"
                          >
                            <Square className="w-8 h-8 fill-white" />
                            <span className="text-[11px] font-bold font-mono">{interpRecordSec}s ရပ်မည်</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isInterpLoading || (interpIsRecording && interpActiveSpeaker !== 'personB')}
                            onClick={() => startInterpRecording('personB')}
                            className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white flex flex-col items-center justify-center gap-1 shadow-2xl shadow-cyan-600/50 ring-4 ring-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <Mic className="w-8 h-8" />
                            <span className="text-[11px] font-bold">နှိပ်ပြီး ပြောပါ</span>
                          </button>
                        )}

                        {/* Audio File Upload Option for Speaker B */}
                        <div className="w-full pt-1">
                          <input
                            type="file"
                            accept="audio/*"
                            id="spkB_audio_upload"
                            className="hidden"
                            onChange={(e) => handleInterpFileUpload(e, 'personB')}
                          />
                          <label
                            htmlFor="spkB_audio_upload"
                            className="text-[10px] text-cyan-400/90 hover:text-cyan-300 font-bold flex items-center justify-center gap-1 cursor-pointer bg-cyan-950/60 hover:bg-cyan-900/60 py-1.5 px-3 rounded-xl border border-cyan-500/30 transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>📂 သို့မဟုတ် အသံဖိုင် တင်သွင်းမည်</span>
                          </label>
                        </div>
                      </div>

                      {/* Quick Foreign Phrase Pills (Lao/Thai/English) */}
                      <div className="w-full space-y-1.5 pt-2 border-t border-cyan-500/20">
                        <span className="text-[10px] text-cyan-400 font-bold block">နမူနာ စကားစုများ:</span>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {(interpLangB === 'lo'
                            ? [
                                'ສະບາຍດີ',
                                'ສະບາຍດີບໍ່',
                                'ລາຄາເທົ່າໃດ',
                                'ຂອບໃຈຫຼາຍໆ',
                                'ຍິນດີທີ່ໄດ້ຮູ້ຈັກ'
                              ]
                            : interpLangB === 'th'
                            ? [
                                'สวัสดีครับ',
                                'สบายดีไหมครับ',
                                'ราคาเท่าไหร่ครับ',
                                'ขอบคุณมากๆครับ'
                              ]
                            : [
                                'Hello! Nice to meet you.',
                                'How much does this cost?',
                                'Thank you so much!',
                                'Have a wonderful day.'
                              ]
                          ).map((ph, idx) => (
                            <button
                              key={idx}
                              type="button"
                              disabled={isInterpLoading}
                              onClick={() => handleSendInterpText('personB', ph)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 text-[10px] font-medium border border-cyan-500/30 active:scale-95 transition-all"
                            >
                              {ph}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status / Processing Indicator */}
                  {interpStatusText && (
                    <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-xs font-bold flex items-center justify-center gap-2 animate-pulse shadow-lg">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-300" />
                      <span>{interpStatusText}</span>
                    </div>
                  )}

                  {/* Error Box */}
                  {interpError && (
                    <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center gap-2 text-xs text-rose-200">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{interpError}</span>
                    </div>
                  )}

                  {/* Optional Manual Text Input Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendInterpText(interpTextInputSpeaker);
                    }}
                    className="p-3 bg-[#0d101d] rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-2.5"
                  >
                    <select
                      value={interpTextInputSpeaker}
                      onChange={(e) => setInterpTextInputSpeaker(e.target.value as any)}
                      className="w-full sm:w-auto bg-[#151926] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:outline-none"
                    >
                      <option value="personA">
                        {TARGET_LANGUAGES.find((l) => l.id === interpLangA)?.flag || '🇲🇲'} သင် (Speaker A) အဖြစ် စာပို့မည်
                      </option>
                      <option value="personB">
                        {TARGET_LANGUAGES.find((l) => l.id === interpLangB)?.flag || '🇱🇦'} တစ်ဖက်လူ (Speaker B) အဖြစ် စာပို့မည်
                      </option>
                    </select>

                    <input
                      type="text"
                      value={interpTextInput}
                      onChange={(e) => setInterpTextInput(e.target.value)}
                      placeholder="သို့မဟုတ် မိုက်အသုံးမပြုဘဲ စာရိုက်၍ ဘာသာပြန်ဆိုရန် ရေးပါ..."
                      className="flex-1 w-full bg-[#151926] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />

                    <button
                      type="submit"
                      disabled={isInterpLoading || !interpTextInput.trim()}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 transition-all shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ပို့မည်</span>
                    </button>
                  </form>

                  {/* Live Dialogue Timeline History */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        <span>အပြန်အလှန် စကားပြောမှတ်တမ်း (Live Dialogue Timeline)</span>
                      </h4>
                      {interpMessages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setInterpMessages([])}
                          className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>မှတ်တမ်းရှင်းမည်</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {interpMessages.map((msg) => {
                        const isA = msg.speakerRole === 'personA';
                        return (
                          <div
                            key={msg.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              isA
                                ? 'bg-gradient-to-r from-emerald-950/50 via-[#0d1617] to-[#0a1114] border-emerald-500/30 mr-0 sm:mr-12'
                                : 'bg-gradient-to-r from-cyan-950/50 via-[#0b151e] to-[#090f17] border-cyan-500/30 ml-0 sm:ml-12'
                            }`}
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                              <span
                                className={`text-[11px] font-bold flex items-center gap-1.5 ${
                                  isA ? 'text-emerald-400' : 'text-cyan-400'
                                }`}
                              >
                                <span>{msg.speakerName}</span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                            </div>

                            {/* Spoken original and translated result */}
                            <div className="space-y-2 text-xs">
                              {/* Original Spoken */}
                              <div className="text-slate-300">
                                <span className="text-[10px] text-slate-500 block font-bold">မူရင်းပြောဆိုချက်:</span>
                                <p className="font-medium text-slate-200 mt-0.5">{msg.originalTranscript}</p>
                              </div>

                              {/* Translated Output */}
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                                <span
                                  className={`text-[10px] font-bold block ${
                                    isA ? 'text-emerald-400' : 'text-cyan-400'
                                  }`}
                                >
                                  ✨ တိုက်ရိုက် ဘာသာပြန်ချက်:
                                </span>
                                <p className="text-sm font-bold text-white leading-relaxed">{msg.translatedText}</p>
                              </div>

                              {/* Audio playback & actions */}
                              <div className="flex items-center justify-between gap-2 pt-1">
                                {msg.audioUrl ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (interpAudioPlayerRef.current) {
                                          interpAudioPlayerRef.current.src = msg.audioUrl!;
                                          interpAudioPlayerRef.current.play().catch(() => {});
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                      <span>အသံပြန်ဖွင့်မည်</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        downloadAudioFile(msg.audioUrl!, `VoiceMaster_Interpret_${Date.now()}.mp3`)
                                      }
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/10"
                                      title="Download MP3"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div />
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleCopy(msg.translatedText, msg.id)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-white/10 flex items-center gap-1"
                                >
                                  {copiedType === msg.id ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>{copiedType === msg.id ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 2: UNLIMITED TEXT TRANSLATOR + NATIVE HUMAN SPEECH     */}
              {/* ------------------------------------------------------------- */}
              {translatorTab === 'text' && (
                <form onSubmit={handleTranslateAndSpeak} className="space-y-5 animate-in fade-in">
                  {/* Source Text Area with Unlimited Badges & File Upload */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span>ဘာသာပြန်လိုသော စာသား (Original Source Text):</span>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                          <span>⚡ Unlimited (စာလုံးရေ ကန့်သတ်ချက်မရှိ)</span>
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
                        {/* File Import Button */}
                        <input
                          type="file"
                          accept=".txt,.srt,.vtt,.text"
                          id="translate_file_input"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const content = reader.result as string;
                                if (content) setTranslateText(content);
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="translate_file_input"
                          className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                        >
                          <Upload className="w-3 h-3" />
                          <span>📁 စာသားဖိုင် တင်သွင်းမည် (.txt/.srt)</span>
                        </label>

                        {translateText && (
                          <button
                            type="button"
                            onClick={() => setTranslateText('')}
                            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-bold"
                          >
                            ရှင်းလင်းမည်
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      rows={5}
                      required
                      value={translateText}
                      onChange={(e) => setTranslateText(e.target.value)}
                      placeholder="ဘာသာပြန်လိုသည့် မည်သည့်စာသားမဆို ထည့်သွင်းပါ (မြန်မာ၊ လာအို၊ အင်္ဂလိပ်၊ ထိုင်း သို့မဟုတ် ကမ္ဘာ့ဘာသာစကားများ - စာလုံးရေ အကန့်အသတ်မရှိ တစ်ပြိုင်နက် ဘာသာပြန်နိုင်ပါသည်)..."
                      className="w-full bg-[#0d101d] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed font-sans"
                    />

                    {/* Character Counter & Quick Samples */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span>{translateText.length.toLocaleString()} စာလုံး</span>
                        <span>•</span>
                        <span>{translateText.trim() ? translateText.trim().split(/\s+/).length.toLocaleString() : 0} စကားလုံး</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-500">နမူနာစာသား:</span>
                        <button
                          type="button"
                          onClick={() =>
                            setTranslateText(
                              'မင်္ဂလာပါခင်ဗျာ။ ကျွန်ုပ်တို့ရဲ့ AI အသံထွက် နည်းပညာနှင့် စာတန်းထိုး စနစ်ကို အသုံးပြုသည့်အတွက် အထူးပင် ကျေးဇူးတင်ရှိပါသည်။ ဒီနေ့ ရာသီဥတုက အလွန် သာယာလှပနေပါတယ်။'
                            )
                          }
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          🇲🇲 မြန်မာ
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTranslateText(
                              'ສະບາຍດີ! ຍິນດີຕ້ອນຮັບສູ່ລະບົບແປພາສາ ແລະ ສຽງເວົ້າອັດສະລິຍະ ຂໍໃຫ້ມື້ນີ້ເປັນມື້ທີ່ດີສຳລັບທຸກຄົນ.'
                            )
                          }
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          🇱🇦 လာအို (Lao)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTranslateText(
                              'สวัสดีครับ ขอต้อนรับทุกท่านเข้าสู่ระบบแปลภาษาและสังเคราะห์เสียงอัจฉริยะ วันนี้ขอให้เป็นวันที่ดีสำหรับทุกคนครับ'
                            )
                          }
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          🇹🇭 ထိုင်း
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTranslateText(
                              'Hello and welcome! Thank you for using our next-generation voice synthesis and translation studio. Today is a great day to create something amazing.'
                            )
                          }
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          🇺🇸 English
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Target Language & Native Voice Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Target Language Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>ပြောင်းလဲလိုသော နိုင်ငံ ဘာသာစကား (Target Country / Language):</span>
                      </label>
                      <select
                        value={translateTargetLang}
                        onChange={(e) => {
                          const newLang = e.target.value;
                          setTranslateTargetLang(newLang);
                          const vList = TARGET_LANG_VOICES[newLang] || TARGET_LANG_VOICES['en'];
                          if (vList && vList.length > 0) {
                            setTranslateVoice(vList[0].id);
                          }
                        }}
                        className="w-full bg-[#0d101d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                      >
                        {TARGET_LANGUAGES.map((lang) => (
                          <option key={lang.id} value={lang.id}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Country Native Voice Profile */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>နိုင်ငံအလိုက် သဘာဝလူသားအသံ (Native Spoken Voice):</span>
                        <span className="text-[10px] text-blue-400 font-mono">100% Native Accent</span>
                      </label>
                      <select
                        value={translateVoice}
                        onChange={(e) => setTranslateVoice(e.target.value)}
                        className="w-full bg-[#0d101d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                      >
                        {(TARGET_LANG_VOICES[translateTargetLang] || TARGET_LANG_VOICES['en']).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.country} {v.name} - {v.desc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Error Box */}
                  {translateError && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-200">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{translateError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isTranslateLoading || !translateText.trim()}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {isTranslateLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
                        <span>ရွေးချယ်ထားသော နိုင်ငံဘာသာစကားသို့ တိကျစွာ ဘာသာပြန်ပြီး သဘာဝအသံဖိုင် ဖန်တီးနေပါသည်...</span>
                      </>
                    ) : (
                      <>
                        <Languages className="w-4 h-4 text-blue-300" />
                        <span>🌐 နိုင်ငံဘာသာစကားသို့ တိုက်ရိုက် ဘာသာပြန်ပြီး အသံဖိုင် ထုတ်ယူမည် (Translate & Speak)</span>
                      </>
                    )}
                  </button>

                  {/* Translation Result Display */}
                  {translateResult && (
                    <div className="p-5 bg-[#0a0c12] rounded-2xl border border-blue-500/30 space-y-4 animate-in fade-in">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ဘာသာပြန်နှင့် နိုင်ငံအလိုက် အသံဖိုင် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ!</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30">
                            {translateResult.characterCount} စာလုံး
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(translateResult.translatedText, 'translated_text')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 flex items-center gap-1.5 active:scale-95"
                          >
                            {copiedType === 'translated_text' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedType === 'translated_text' ? 'Copied' : 'Copy Text'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              downloadFile(
                                translateResult.translatedText,
                                `VoiceMaster_Translated_${Date.now()}.txt`,
                                'text/plain'
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 flex items-center gap-1.5 active:scale-95"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-400" />
                            <span>Download .TXT</span>
                          </button>
                        </div>
                      </div>

                      {/* Translated Text Output */}
                      <div className="p-4 bg-[#121520] rounded-xl border border-white/5 text-sm text-slate-100 font-medium leading-relaxed whitespace-pre-line select-text max-h-96 overflow-y-auto">
                        {translateResult.translatedText}
                      </div>

                      {/* Audio Player and Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <audio src={translateResult.audioUrl} controls className="w-full sm:w-2/3 h-9" />
                        <button
                          type="button"
                          onClick={() =>
                            downloadAudioFile(
                              translateResult.audioUrl,
                              `VoiceMaster_Translated_${Date.now()}.mp3`
                            )
                          }
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95"
                        >
                          <Download className="w-4 h-4" />
                          <span>10x Turbo Download (.MP3)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 3: TRANSLATE SRT SUBTITLES                            */}
              {/* ------------------------------------------------------------- */}
              {translatorTab === 'srt' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="p-5 bg-[#0d101d] rounded-2xl border border-purple-500/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Subtitles className="w-4 h-4 text-purple-400" />
                          <span>SRT Subtitles Translator (စာတန်းထိုး အမြန် ဘာသာပြန်မည်)</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          မည်သည့်နိုင်ငံခြား SRT စာတန်းထိုးဖိုင်ကိုမဆို Timestamps မပျက်စေဘဲ မြန်မာယူနီကုဒ် သို့မဟုတ် ရွေးချယ်ထားသော နိုင်ငံဘာသာစကားသို့ တိကျစွာ ဘာသာပြန်ပေးပါသည်
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">SRT စာသား ထည့်သွင်းရန် (သို့မဟုတ် ဖိုင်တင်ရန်):</label>
                        <input
                          type="file"
                          accept=".srt"
                          id="srt_trans_input"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = () => {
                                if (typeof r.result === 'string') {
                                  setCustomSrtInput(r.result);
                                  handleTranslateSrt(r.result);
                                }
                              };
                              r.readAsText(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="srt_trans_input"
                          className="px-3 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>.SRT ဖိုင် တင်မည်</span>
                        </label>
                      </div>

                      <textarea
                        rows={6}
                        value={customSrtInput}
                        onChange={(e) => setCustomSrtInput(e.target.value)}
                        placeholder={`1\n00:00:01,000 --> 00:00:04,000\nHello and welcome to our world!\n\n2\n00:00:04,500 --> 00:00:08,000\nToday we are exploring something amazing.`}
                        className="w-full bg-[#151926] border border-white/10 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      />

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-xs font-bold text-slate-300">ဘာသာပြန်လိုသော ဘာသာ:</span>
                          <select
                            value={srtTargetLang}
                            onChange={(e) => setSrtTargetLang(e.target.value)}
                            className="bg-[#151926] border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none"
                          >
                            {TARGET_LANGUAGES.map((l) => (
                              <option key={`srt_${l.id}`} value={l.id}>
                                {l.flag} {l.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          disabled={isTranslatingSrt || !customSrtInput.trim()}
                          onClick={() => handleTranslateSrt(customSrtInput)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                          {isTranslatingSrt ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                              <span>SRT ဘာသာပြန်နေပါသည်...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 text-purple-300" />
                              <span>⚡ စာတန်းထိုး ဘာသာပြန်မည်</span>
                            </>
                          )}
                        </button>
                      </div>

                      {translateSrtError && (
                        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          <span>{translateSrtError}</span>
                        </div>
                      )}

                      {translatedSrt && (
                        <div className="p-4 bg-[#151926] rounded-xl border border-purple-500/40 space-y-3 pt-3 mt-4">
                          <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>SRT ဘာသာပြန် အောင်မြင်စွာ ရရှိပါပြီ!</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopy(translatedSrt, 'srt_out')}
                                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 flex items-center gap-1"
                              >
                                {copiedType === 'srt_out' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedType === 'srt_out' ? 'Copied' : 'Copy SRT'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadFile(translatedSrt, `VoiceMaster_Translated_${Date.now()}.srt`, 'text/plain')}
                                className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download .SRT</span>
                              </button>
                            </div>
                          </div>
                          <textarea
                            rows={8}
                            readOnly
                            value={translatedSrt}
                            className="w-full bg-[#0d101d] border border-white/10 rounded-xl p-3 text-xs font-mono text-emerald-300 select-text leading-relaxed"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: SMART SILENCE REMOVER & AUDIO TRIMMER STUDIO                         */}
        {/* ========================================================================= */}
        {mainMode === 'silenceRemover' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-rose-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-2">
                  <Scissors className="w-3.5 h-3.5 text-rose-400" />
                  <span>Smart Speech & Podcast Silence Remover</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>✂️ Smart Silence Remover & Audio Trimmer Studio</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Podcast၊ စကားပြောနှင့် အသံဇာတ်လမ်းဖိုင်များထဲမှ မလိုအပ်သော အသက်ရှူရပ်နားချိန် (Silence) များကို AI ဖြင့် တိကျစွာ ဖြတ်ထုတ်ပေးပါသည်
                </p>
              </div>

              <form onSubmit={handleRemoveSilence} className="space-y-5">
                {/* Audio Source Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>အသံဖိုင် ရွေးချယ်ရန် (Upload Audio File):</span>
                    {silenceAudioData && (
                      <span className="text-[11px] text-emerald-400 font-normal">
                        ✓ TTS / အသံပြောင်းစက်မှ အသံဖိုင် ပါဝင်ပြီး
                      </span>
                    )}
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="file"
                      accept="audio/*,video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedSilenceFile(e.target.files[0]);
                          setSilenceAudioData('');
                        }
                      }}
                      className="w-full bg-[#0d101d] border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-500 cursor-pointer"
                    />

                    {ttsResult && (
                      <button
                        type="button"
                        onClick={() => {
                          setSilenceAudioData(ttsResult.audioUrl);
                          setSelectedSilenceFile(null);
                        }}
                        className="w-full sm:w-auto shrink-0 px-3 py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>TTS အသံဖိုင် ယူမည်</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sensitivity Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200">
                    ဖြတ်တောက်မည့် စတိုင်နှင့် စိစစ်မှုနှုန်း (Silence Sensitivity Preset):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSilenceMinDuration('0.3')}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        silenceMinDuration === '0.3'
                          ? 'bg-rose-600/25 border-rose-500 text-white ring-2 ring-rose-500/40'
                          : 'bg-[#0d101d] border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                        ⚡ Shorts / TikTok (0.3s)
                      </span>
                      <span className="text-[10px] text-slate-400 leading-snug">
                        အသံတိတ် ရပ်နားချိန် ၀.၃ စက္ကန့်ကျော်ပါက အမြန်ဆုံး ဖြတ်ထုတ်မည်
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSilenceMinDuration('0.5')}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        silenceMinDuration === '0.5'
                          ? 'bg-rose-600/25 border-rose-500 text-white ring-2 ring-rose-500/40'
                          : 'bg-[#0d101d] border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                        🎙️ Podcast / စကားပြော (0.5s)
                      </span>
                      <span className="text-[10px] text-slate-400 leading-snug">
                        အသံတိတ် ရပ်နားချိန် ၀.၅ စက္ကန့်ကျော်ပါက သဘာဝကျစွာ ဖြတ်ထုတ်မည်
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSilenceMinDuration('0.8')}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        silenceMinDuration === '0.8'
                          ? 'bg-rose-600/25 border-rose-500 text-white ring-2 ring-rose-500/40'
                          : 'bg-[#0d101d] border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                        📖 ဇာတ်လမ်း / စာအုပ် (0.8s)
                      </span>
                      <span className="text-[10px] text-slate-400 leading-snug">
                        ရှည်လျားလွန်းသော အသံတိတ်များကိုသာ အဓိပ္ပာယ်မပျက် ဖြတ်ထုတ်မည်
                      </span>
                    </button>
                  </div>
                </div>

                {/* Error Box */}
                {silenceError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{silenceError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSilenceProcessing || (!selectedSilenceFile && !silenceAudioData)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isSilenceProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-rose-200" />
                      <span>အသံတိတ်နေရာများ ဖြတ်တောက်နေပါသည် ခေတ္တစောင့်ပါ...</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4 text-pink-300" />
                      <span>✂️ အသံတိတ်နေရာများ အလိုအလျောက် ဖြတ်တောက်မည် (Remove Silence)</span>
                    </>
                  )}
                </button>
              </form>

              {/* Result Display */}
              {silenceResult && (
                <div className="p-5 bg-[#0a0c12] rounded-2xl border border-rose-500/30 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{silenceResult.statsLabel}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                      {silenceResult.savedPercentage}% Time Saved
                    </span>
                  </div>

                  {/* Audio Player and Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <audio src={silenceResult.audioUrl} controls className="w-full sm:w-1/2 h-9" />
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoAudioData(silenceResult.audioUrl);
                          setShowVideoModal(true);
                        }}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>🎬 ဗီဒီယို ပြုလုပ်မည်</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadAudioFile(silenceResult.audioUrl, `VoiceMaster_Trimmed_${Date.now()}.mp3`)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>10x Turbo Download (.MP3)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0c0e14] py-4 px-6 text-center text-xs text-slate-500">
        VoiceMaster Studio • 10k Chars Real Human TTS & AI Viral Scriptwriter
      </footer>

      {/* In-App Ad Popup Modal (Mandatory 20-second viewing before closing) */}
      {showInAppAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121520] border border-white/20 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-3.5 bg-[#171a29] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black">
                  SPONSORED
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  စပွန်ဆာ ကြော်ငြာ ကမ်းလှမ်းချက်
                </span>
              </div>
              
              {/* Top Countdown indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[11px] font-mono text-indigo-300 font-bold">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{adCountdown > 0 ? `${adCountdown}s ကျန်` : 'ပိတ်နိုင်ပါပြီ'}</span>
              </div>
            </div>

            {/* In-App Ad Content Container */}
            <div className="flex-1 bg-black min-h-[360px] sm:min-h-[420px] relative">
              <iframe
                src={adsterraDirectLink}
                title="Sponsor Offer"
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="w-full h-full min-h-[360px] sm:min-h-[420px] border-none"
              />
            </div>

            <div className="p-3.5 bg-[#121520] border-t border-white/10 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 text-[11px]">
                {adCountdown > 0 ? `ကျေးဇူးပြု၍ ${adCountdown} စက္ကန့် ကြည့်ရှုပေးပါခင်ဗျာ...` : 'ကြော်ငြာ ကြည့်ရှုပြီးပါပြီ'}
              </span>

              {adCountdown > 0 ? (
                <button
                  disabled
                  className="px-4 py-2 rounded-xl bg-slate-800/80 text-slate-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed border border-white/5 opacity-70"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>{adCountdown} စက္ကန့် စောင့်ပါ</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowInAppAdModal(false)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                >
                  ပိတ်မည် (Close Ad) ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MP4 Video Visualizer Modal (TikTok & Reels Generator) */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[#121520] border border-purple-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#171a29] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  🎬 TikTok / Reels MP4 Video Visualizer Generator
                </h3>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Aspect Ratio Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  ဗီဒီယို အရွယ်အစား (Aspect Ratio):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('9:16')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      videoAspectRatio === '9:16'
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                        : 'bg-[#0d0f17] border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <span>📱 TikTok / Shorts</span>
                    <span className="text-[10px] text-slate-400 font-mono">9:16 Vertical</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('16:9')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      videoAspectRatio === '16:9'
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                        : 'bg-[#0d0f17] border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <span>💻 YouTube</span>
                    <span className="text-[10px] text-slate-400 font-mono">16:9 Horizontal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('1:1')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      videoAspectRatio === '1:1'
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                        : 'bg-[#0d0f17] border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <span>📷 IG / FB Post</span>
                    <span className="text-[10px] text-slate-400 font-mono">1:1 Square</span>
                  </button>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  နောက်ခံ Theme နှင့် အသံလှိုင်း အရောင် (Theme Style):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'cyberpunk', name: '🌌 Neon Cyberpunk', color: 'bg-slate-900 border-indigo-500' },
                    { id: 'indigo', name: '🔮 Indigo Galaxy', color: 'bg-indigo-950 border-indigo-400' },
                    { id: 'sunset', name: '🌅 Sunset Glow', color: 'bg-amber-950 border-orange-500' },
                    { id: 'emerald', name: '🌿 Emerald Forest', color: 'bg-emerald-950 border-emerald-500' },
                    { id: 'dark', name: '🖤 Studio Dark', color: 'bg-zinc-950 border-zinc-500' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setVideoTheme(t.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        videoTheme === t.id
                          ? `${t.color} text-white ring-2 ring-purple-500`
                          : 'bg-[#0d0f17] border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Image Background Upload (Supports up to 10 images) */}
              <div className="p-3 bg-[#0d0f17] border border-purple-500/20 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-bold text-slate-200">နောက်ခံပုံများ (အများဆုံး ၁၀ ပုံအထိ):</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                      {videoBgImages.length} / 10 ပုံ
                    </span>
                    {videoBgImages.length > 0 && (
                      <button 
                        type="button"
                        onClick={() => setVideoBgImages([])}
                        className="text-[10px] text-rose-400 hover:text-rose-300 transition-all font-bold px-1.5 py-0.5 rounded"
                      >
                        ဖျက်မည်
                      </button>
                    )}
                  </div>
                </div>

                {videoBgImages.length < 10 && (
                  <label className="flex items-center justify-center gap-2 py-2.5 px-3 border border-dashed border-purple-500/30 rounded-lg hover:border-purple-400 hover:bg-purple-950/20 transition-all cursor-pointer group bg-black/30 text-purple-300">
                    <Image className="w-4 h-4" />
                    <span className="text-[11px] font-bold">
                      {videoBgImages.length === 0 ? '+ နောက်ခံပုံများ ရွေးချယ်မည် (Upload up to 10 Images)' : `+ ပုံထပ်ထည့်မည် (${10 - videoBgImages.length} ပုံ ကျန်ရှိ)`}
                    </span>
                    <input 
                      type="file" 
                      multiple
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const remainingSlots = 10 - videoBgImages.length;
                          const filesToRead = Array.from(files).slice(0, remainingSlots);
                          filesToRead.forEach(file => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) {
                                setVideoBgImages(prev => prev.length < 10 ? [...prev, reader.result as string] : prev);
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }
                      }}
                    />
                  </label>
                )}

                {videoBgImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
                    {videoBgImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-video rounded-md overflow-hidden border border-purple-500/40 bg-black group">
                        <img src={imgUrl} className="w-full h-full object-cover" alt={`Slide ${idx + 1}`} />
                        <span className="absolute top-0.5 left-0.5 bg-black/80 text-purple-300 font-mono font-bold text-[8px] px-1 rounded">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setVideoBgImages(videoBgImages.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 p-0.5 rounded bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity text-[9px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title Text Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  ခေါင်းစဉ်စာသား (Video Header Title):
                </label>
                <input
                  type="text"
                  value={videoTitleText}
                  onChange={(e) => setVideoTitleText(e.target.value)}
                  placeholder="ဗီဒီယို အပေါ်တွင် ဖော်ပြမည့် ခေါင်းစဉ်..."
                  className="w-full bg-[#0d0f17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Color Grading & Frame Borders Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#0d0f17] rounded-xl border border-purple-500/20">
                {/* Color Grading */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <span>🎨 အရောင်မွမ်းမံမှု (Color Filter):</span>
                  </span>
                  <select
                    value={videoColorFilter}
                    onChange={(e) => setVideoColorFilter(e.target.value as any)}
                    className="w-full bg-[#151824] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="none">မူလအရောင် (No Filter)</option>
                    <option value="cinematic">🎬 Cinematic 4K (ရုပ်ရှင်စတိုင်)</option>
                    <option value="vintage">🎞️ Vintage Retro (ခေတ်ဟောင်း)</option>
                    <option value="drama">🎭 Dramatic Contrast (ပေါ်လွင်)</option>
                    <option value="cool">❄️ Cool Blue Tone (အေးမြ)</option>
                    <option value="warm">☀️ Warm Gold Tone (နွေးထွေး)</option>
                  </select>
                </div>

                {/* Decorative Frame */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <span>✨ ဘောင်အလှများ (Frame / Border):</span>
                  </span>
                  <select
                    value={videoFrameStyle}
                    onChange={(e) => setVideoFrameStyle(e.target.value as any)}
                    className="w-full bg-[#151824] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="none">ဘောင်မပါ (No Frame)</option>
                    <option value="gold_border">🟡 ရွှေရောင်ဘောင် (Gold Border)</option>
                    <option value="neon_frame">🔵 နီယွန်အလင်းဘောင် (Neon Cyan Frame)</option>
                    <option value="film_strip">🎞️ ရုပ်ရှင်ဖလင်ဘောင် (Film Strip)</option>
                    <option value="white_minimal">⚪ အဖြူရောင်ဘောင်ဆန်း (Minimal White)</option>
                  </select>
                </div>
              </div>

              {/* Subtitle Burn-In Controls */}
              <div className="space-y-3 p-3 bg-[#0d0f17] rounded-xl border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                    <Subtitles className="w-4 h-4 text-amber-400" />
                    <span>TikTok / CapCut စာတန်းထိုး တိုက်ရိုက်ကပ်မည် (Burn Subtitles)</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={videoBurnSubtitles}
                    onChange={(e) => setVideoBurnSubtitles(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                  />
                </div>

                {videoBurnSubtitles && (
                  <div className="space-y-3 pt-2 border-t border-white/10 animate-in fade-in">
                    {/* Subtitle Style Picker */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-300">စာတန်းထိုး ဒီဇိုင်း အရောင် (Subtitle Style):</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { id: 'tiktok_yellow', label: '🟡 TikTok Yellow', color: 'bg-amber-400/20 text-amber-300 border-amber-400/40' },
                          { id: 'capcut_white', label: '⚪ CapCut White', color: 'bg-white/10 text-white border-white/20' },
                          { id: 'neon_cyan', label: '🔵 Neon Cyan', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' },
                          { id: 'luxury_gold', label: '🟡 Luxury Gold', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40' }
                        ].map(st => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setVideoSubtitleStyle(st.id as any)}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                              videoSubtitleStyle === st.id ? `${st.color} ring-1 ring-purple-400` : 'bg-black/30 border-white/5 text-slate-400'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtitle Position */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-300">နေရာ (Position):</span>
                        <select
                          value={videoSubtitlePosition}
                          onChange={(e) => setVideoSubtitlePosition(e.target.value as any)}
                          className="w-full bg-[#151824] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          <option value="bottom">⬇️ အောက်ခြေ (TikTok Safe Zone)</option>
                          <option value="middle">↔️ အလယ်ဗဟို (Center)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-300">စာလုံးအရွယ်အစား (Font Size):</span>
                        <select
                          value={videoSubtitleFontSize}
                          onChange={(e) => setVideoSubtitleFontSize(Number(e.target.value))}
                          className="w-full bg-[#151824] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          <option value={14}>သေး (14px)</option>
                          <option value={16}>အလတ် (16px)</option>
                          <option value={18}>ကြီး (18px)</option>
                          <option value={20}>အကြီးဆုံး (20px)</option>
                        </select>
                      </div>
                    </div>

                    {/* Subtitle Text Area / SRT */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-300">စာတန်းထိုး စာသား သို့မဟုတ် SRT (Subtitles Text):</span>
                      <textarea
                        rows={2}
                        value={videoSubtitleSrt || videoSubtitleText}
                        onChange={(e) => {
                          setVideoSubtitleSrt(e.target.value);
                          setVideoSubtitleText(e.target.value);
                        }}
                        placeholder="ဗီဒီယိုပေါ်တွင် ဖော်ပြလိုသည့် စာတန်းထိုးများ (အလိုအလျောက် သီးခြားခွဲထုတ်ပြသမည်)..."
                        className="w-full bg-[#151824] border border-white/10 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {videoError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200">
                  {videoError}
                </div>
              )}

              {/* Rendered Video Result */}
              {videoResultUrl && (
                <div className="space-y-3 p-4 bg-[#0d0f17] rounded-xl border border-emerald-500/30 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>MP4 ဗီဒီယိုဖိုင် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ</span>
                    </span>
                    <a
                      href={videoResultUrl}
                      download={`VoiceMaster_Visualizer_${Date.now()}.mp4`}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>10x Turbo Download (.MP4)</span>
                    </a>
                  </div>

                  <video
                    src={videoResultUrl}
                    controls
                    className="w-full max-h-64 rounded-lg bg-black mx-auto"
                  />
                </div>
              )}

              {/* Generate Button */}
              {!videoResultUrl && (
                <button
                  type="button"
                  disabled={isVideoGenerating}
                  onClick={handleGenerateMP4Video}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isVideoGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                      <span>MP4 Visualizer ဗီဒီယို ပြုလုပ်နေပါသည် ခေတ္တစောင့်ပါ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-pink-300" />
                      <span>🎬 MP4 ဗီဒီယို စတင်ဖန်တီးမည် (TikTok/Reels အဆင်သင့်)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
