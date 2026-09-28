import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Upload, Download, Copy, Check, Play, Pause,
  Sparkles, RefreshCw, AlertCircle, DollarSign, Image,
  Languages, Clock, Subtitles, Volume2, Video, CheckCircle2,
  ExternalLink, Layers, ArrowRight, Settings2, Sliders, UserCheck,
  FileAudio, Info, Mic, X, BookOpen, Wand2, Lightbulb, History, Trash2, RotateCcw, Music, Music2, Disc,
  Users, Plus, ArrowUp, ArrowDown, MessageSquare, Users2, Megaphone, Zap, ShieldCheck, MoveVertical, Search
} from 'lucide-react';
import { getAllHistory, saveHistoryRecord, deleteHistoryRecord, clearAllHistoryRecords, StoredHistoryItem } from './historyDb';

interface VoiceItem {
  id: string;
  name: string;
  gender: string;
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
            <span>.SRT ဒေါင်းလုဒ်</span>
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

export const App: React.FC = () => {
  // Main Navigation Modes: 'tts' | 'dialogue' | 'writer' | 'video' | 'history' | 'imager' | 'transcribe' | 'audioModifier' | 'autoPipeline' | 'translator'
  const [mainMode, setMainMode] = useState<'tts' | 'dialogue' | 'writer' | 'video' | 'history' | 'imager' | 'transcribe' | 'audioModifier' | 'autoPipeline' | 'translator'>('tts');

  // ----------------------------------------------------
  // Mode 1: Text-to-Speech (TTS) State
  // ----------------------------------------------------
  const [ttsText, setTtsText] = useState('');
  const [voices, setVoices] = useState<VoiceItem[]>([]);
  const [bgmTracks, setBgmTracks] = useState<BgmItem[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('en-AU-WilliamMultilingualNeural');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
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
    { id: 'spk1', name: 'ကိုဝီလျံ', voice: 'en-AU-WilliamMultilingualNeural', color: 'indigo' },
    { id: 'spk2', name: 'မအေဗာ', voice: 'en-US-AvaMultilingualNeural', color: 'emerald' },
    { id: 'spk3', name: 'ကိုအင်ဒရူး', voice: 'en-US-AndrewMultilingualNeural', color: 'amber' },
    { id: 'spk4', name: 'မအမ်မာ', voice: 'en-US-EmmaMultilingualNeural', color: 'rose' },
    { id: 'spk5', name: 'ကိုဟျွန်းဆူ', voice: 'ko-KR-HyunsuMultilingualNeural', color: 'purple' },
  ]);

  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([
    { id: 'dlg_1', speakerId: 'spk1', text: 'မင်္ဂလာပါရှင်၊ ဒီနေ့ စကားဝိုင်း အပြန်အလှန်ပြောကြားတဲ့ စမ်းသပ်ချက် အဆင်ပြေရဲ့လားခင်ဗျာ။' },
    { id: 'dlg_2', speakerId: 'spk2', text: 'မင်္ဂလာပါ ကိုဝီလျံ၊ အဆင်ပြေပါတယ်ရှင်။ လူသားစစ်စစ် အသံတွေနဲ့ အပြန်အလှန် စကားပြောတာ အလွန်သဘာဝကျပြီး နားထောင်ရတာ ကောင်းပါတယ်။' },
    { id: 'dlg_3', speakerId: 'spk3', text: 'ဟုတ်ပါတယ်၊ ကျွန်တော် အင်ဒရူးလည်း ပါဝင်လိုက်တော့ စကားဝိုင်းက ပိုပြီး သက်ဝင်လှုပ်ရှားသွားပါပြီ။' },
    { id: 'dlg_4', speakerId: 'spk4', text: 'ကျွန်မ အေဗာလည်း ပါဝင်ခွင့်ရတာ ဝမ်းသာပါတယ်ရှင်။' },
    { id: 'dlg_5', speakerId: 'spk5', text: 'ကျွန်တော် ဟျွန်းဆူလည်း ဒီ ၅ ယောက် အပြန်အလှန် စကားဝိုင်းမှာ ဝမ်းမြောက်စွာ ပါဝင်ပါတယ်။' },
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

  const registerGenerationAndCheckAd = (featureName?: string) => {
    setGenerationCount(prev => {
      const nextCount = prev + 1;
      try {
        localStorage.setItem('vm_usage_count', String(nextCount));
      } catch (_) {}
      // Any feature used 2 times (2, 4, 6, 8, ...) triggers the ad popup
      if (nextCount > 0 && nextCount % 2 === 0) {
        setAdCountdown(15);
        setShowInAppAdModal(true);
      }
      return nextCount;
    });
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
  const [videoBgImage, setVideoBgImage] = useState<string>(''); // Base64 of custom background
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
  const [pipelineDuration, setPipelineDuration] = useState<'short' | 'medium' | 'long' | 'epic'>('medium');
  const [isPipelineLoading, setIsPipelineLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<{
    title: string;
    script: string;
    audioUrl: string;
    imageUrl: string;
    videoUrl: string;
  } | null>(null);
  const [pipelineError, setPipelineError] = useState('');

  // ----------------------------------------------------
  // New Studio State 6: Multi-Language Translator + Speech State
  // ----------------------------------------------------
  const [translateText, setTranslateText] = useState('');
  const [translateTargetLang, setTranslateTargetLang] = useState('my');
  const [isTranslateLoading, setIsTranslateLoading] = useState(false);
  const [translateResult, setTranslateResult] = useState<{
    originalText: string;
    translatedText: string;
    detectedSourceLang: string;
    audioUrl: string;
    characterCount: number;
  } | null>(null);
  const [translateError, setTranslateError] = useState('');

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
    setVideoBgImage('');
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

      // Convert bgImage base64 into file blob for streamed upload
      if (videoBgImage && (videoBgImage.startsWith('data:image') || videoBgImage.includes('base64,'))) {
        const parts = videoBgImage.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const imageBlob = new Blob([u8arr], { type: mime });
        formData.append('bgImageFile', imageBlob, 'input_bg.png');
      } else if (videoBgImage) {
        formData.append('bgImageData', videoBgImage);
      }

      // Append standard text options
      formData.append('titleText', videoTitleText);
      formData.append('subtitleText', videoSubtitleText);
      formData.append('aspectRatio', videoAspectRatio);
      formData.append('theme', videoTheme);
      formData.append('waveStyle', videoWaveStyle);
      formData.append('customWaveColor', videoCustomWaveColor);
      formData.append('waveYPercentage', String(videoWaveY));

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
      if (audioUrl.startsWith('data:')) {
        // Convert base64 data URL to Blob for 100% reliable direct browser download across all devices
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
        }, 1000);
      } else {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = audioUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 1000);
      }
    } catch (err) {
      console.error('Download error:', err);
      // Fallback
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

      const res = await fetch('/api/multi-speaker-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dialogue: payload, pauseDuration })
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (_) {
        throw new Error('ဆာဗာ တုံ့ပြန်မှု မရရှိခဲ့ပါ။ ခေတ္တစောင့်ပြီး ပြန်လည် ကြိုးစားပေးပါခင်ဗျာ။');
      }

      if (!res.ok || !data.success) {
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
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText.trim(),
          voice: selectedVoice,
          rate: speechRate,
          pitch: speechPitch,
          bgm: selectedBgm,
          bgmVolume: bgmVolume,
          voiceEffect: voiceEffect
        })
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        throw new Error('ဆာဗာနှင့် ချိတ်ဆက်မှု အဆင်မပြေဖြစ်သွားပါသည်။ ခေတ္တစောင့်ပြီး ပြန်လည် ကြိုးစားပေးပါခင်ဗျာ။');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Text-to-speech generation failed');
      }

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
    const element = document.createElement('a');
    const file = new Blob([content], { type: mime });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
      let data: any = null;

      // If a file is selected and is larger than 15MB (up to 1GB), use chunked sliced upload to bypass Cloud 32MB limits
      if (selectedTranscribeFile && selectedTranscribeFile.size > 15 * 1024 * 1024) {
        const file = selectedTranscribeFile;
        const CHUNK_SIZE = 15 * 1024 * 1024; // 15MB chunks
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const uploadId = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(file.size, start + CHUNK_SIZE);
          const chunkBlob = file.slice(start, end);

          const chunkFormData = new FormData();
          chunkFormData.append('chunk', chunkBlob, file.name);
          chunkFormData.append('uploadId', uploadId);
          chunkFormData.append('chunkIndex', String(i));
          chunkFormData.append('totalChunks', String(totalChunks));
          chunkFormData.append('fileName', file.name);
          chunkFormData.append('fileSize', String(file.size));

          const chunkRes: any = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/transcribe-chunk');
            xhr.timeout = 15 * 60 * 1000;

            xhr.upload.onprogress = (evt) => {
              if (evt.lengthComputable) {
                const chunkRatio = evt.loaded / evt.total;
                const overallPercent = Math.min(99, Math.round(((i + chunkRatio) / totalChunks) * 100));
                setUploadProgress(overallPercent);
                if (i === totalChunks - 1 && chunkRatio >= 1) {
                  setTranscribeStage('extracting');
                  setTimeout(() => {
                    setTranscribeStage('transcribing');
                  }, 1200);
                }
              }
            };

            xhr.onload = () => {
              let resData: any = null;
              try {
                resData = JSON.parse(xhr.responseText);
              } catch (_) {
                reject(new Error(`ဆာဗာမှ တုံ့ပြန်မှု မမှန်ကန်ပါ (Status: ${xhr.status})။ ခေတ္တစောင့်ပြီး ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။`));
                return;
              }
              if (xhr.status >= 200 && xhr.status < 300 && resData.success) {
                resolve(resData);
              } else {
                reject(new Error(resData?.error || `Chunk ${i + 1}/${totalChunks} တင်သွင်းရာတွင် အမှားဖြစ်ပေါ်သွားပါသည်။`));
              }
            };

            xhr.onerror = () => reject(new Error('ကွန်ရက် ချိတ်ဆက်မှု အခက်အခဲ ဖြစ်ပေါ်သွားပါသည်။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));
            xhr.ontimeout = () => reject(new Error('အချိန်ကုန်သွားပါသည် (Request Timeout)။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));

            xhr.send(chunkFormData);
          });

          if (i === totalChunks - 1) {
            data = chunkRes;
          }
        }
      } else {
        // Direct upload for small audio files (<= 15MB) or base64 / audio URL
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
          xhr.timeout = 15 * 60 * 1000;

          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const percent = Math.round((evt.loaded / evt.total) * 100);
              setUploadProgress(percent);
              if (percent >= 100) {
                setTranscribeStage('extracting');
                setTimeout(() => {
                  setTranscribeStage('transcribing');
                }, 1200);
              }
            }
          };

          xhr.onload = () => {
            let resData: any = null;
            try {
              resData = JSON.parse(xhr.responseText);
            } catch (_) {
              reject(new Error(`ဆာဗာမှ တုံ့ပြန်မှု မမှန်ကန်ပါ (Status: ${xhr.status})။ ခေတ္တစောင့်ပြီး ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။`));
              return;
            }
            if (xhr.status >= 200 && xhr.status < 300 && resData.success) {
              resolve(resData);
            } else {
              reject(new Error(resData?.error || 'အသံဖိုင်ကို စာသားပြောင်းရာတွင် အမှားအယွင်း ရှိနေပါသည်။'));
            }
          };

          xhr.onerror = () => reject(new Error('ကွန်ရက် ချိတ်ဆက်မှု အခက်အခဲ ဖြစ်ပေါ်သွားပါသည်။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));
          xhr.ontimeout = () => reject(new Error('အချိန်ကုန်သွားပါသည် (Request Timeout)။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));

          xhr.send(formData);
        });
      }

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
        body: JSON.stringify({ srtText: textToTranslate, targetLang: 'my' })
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (_) {
        throw new Error(`ဆာဗာမှ တုံ့ပြန်မှု မမှန်ကန်ပါ (Status: ${res.status})။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'SRT ဘာသာပြန်ခြင်း မအောင်မြင်ပါ။');
      }

      setTranslatedSrt(data.translatedSrt);
      setTranslatedTranscript(data.translatedTranscript);
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
          let resData: any = null;
          try {
            resData = JSON.parse(xhr.responseText);
          } catch (_) {
            reject(new Error(`ဆာဗာမှ တုံ့ပြန်မှု မမှန်ကန်ပါ (Status: ${xhr.status})။ ခေတ္တစောင့်ပြီး ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။`));
            return;
          }
          if (xhr.status >= 200 && xhr.status < 300 && resData.success) {
            resolve(resData);
          } else {
            reject(new Error(resData?.error || '1-Click ဗီဒီယို ဖန်တီး၍ မရပါ။'));
          }
        };

        xhr.onerror = () => reject(new Error('ကွန်ရက် ချိတ်ဆက်မှု အခက်အခဲ ဖြစ်ပေါ်သွားပါသည်။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));
        xhr.ontimeout = () => reject(new Error('အချိန်ကုန်သွားပါသည် (Request Timeout)။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'));

        xhr.send(JSON.stringify({
          topic: pipelineTopic,
          genre: pipelineGenre,
          aspectRatio: pipelineAspectRatio,
          voice: selectedVoice,
          targetDuration: pipelineDuration
        }));
      });

      setPipelineResult(data);
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
          voice: selectedVoice
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
    } catch (err: any) {
      setTranslateError(err.message || 'ဘာသာပြန်မှု မအောင်မြင်ပါ။');
    } finally {
      setIsTranslateLoading(false);
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
            onClick={() => setMainMode('dialogue')}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mainMode === 'dialogue'
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-lg shadow-amber-600/40 ring-2 ring-amber-400/50'
                : 'text-amber-300 hover:text-white hover:bg-amber-500/10 bg-[#0e111a] border border-amber-500/20'
            }`}
          >
            <Users className="w-4 h-4 shrink-0 text-amber-400" />
            <span>💬 စကားဝိုင်း</span>
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
            onClick={() => setMainMode('video')}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mainMode === 'video'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 ring-2 ring-purple-400/50'
                : 'text-purple-300 hover:text-white hover:bg-purple-500/10 bg-[#0e111a] border border-purple-500/20'
            }`}
          >
            <Video className="w-4 h-4 shrink-0 text-purple-400" />
            <span>🎬 ဗီဒီယို</span>
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

        {/* Premium Tools Sub-Tabs Row */}
        <div className="bg-[#191d30]/50 p-2.5 rounded-2xl border border-indigo-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-4xl mx-auto w-full shadow-xl">
          <button
            onClick={() => setMainMode('autoPipeline')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
              mainMode === 'autoPipeline'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md ring-2 ring-amber-400/50'
                : 'text-amber-300 hover:text-white hover:bg-amber-500/10 bg-[#0e111a] border border-amber-500/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ 1-Click ဗီဒီယို</span>
          </button>

          <button
            onClick={() => setMainMode('translator')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
              mainMode === 'translator'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5 bg-[#0e111a] border border-white/5'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span>🌐 ဘာသာပြန် + အသံ</span>
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
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md ring-2 ring-amber-400/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5 bg-[#0e111a] border border-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>🎛️ Speed / Pitch</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODE 4: AI IMAGE GENERATOR                                               */}
        {/* ========================================================================= */}
        {mainMode === 'imager' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Image className="w-5 h-5 text-cyan-400" />
                  <span>AI ရုပ်ပုံ ထုတ်လုပ်စက် (Image Generator)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  မိမိစိတ်ကူးထဲက ပုံရိပ်များကို စာသားဖြင့် ရေးသားပြီး အလှပဆုံး AI ရုပ်ပုံများ ထုတ်လုပ်ပါ
                </p>
              </div>

              <form onSubmit={handleGenerateStandaloneImage} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-cyan-400" />
                    <span>ရုပ်ပုံအတွက် စာသား ရိုက်ထည့်ပါ (English ဖြင့် ရေးပါက ပိုမိုလှပပါသည်):</span>
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="ဥပမာ - A cinematic landscape of a mystical mountain forest at sunset, 8k, photorealistic..."
                    rows={3}
                    className="w-full bg-[#0d0f17] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all resize-none shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">အရွယ်အစား (Aspect Ratio):</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: '9:16', name: '📱 9:16', desc: 'TikTok' },
                        { id: '16:9', name: '💻 16:9', desc: 'YouTube' },
                        { id: '1:1', name: '📷 1:1', desc: 'Square' }
                      ].map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setImageGenAspectRatio(r.id as any)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center ${
                            imageGenAspectRatio === r.id
                              ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200'
                              : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          <span>{r.name}</span>
                          <span className="opacity-50 font-normal">{r.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Style (အလှဆင်ပုံစံ):</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cinematic', name: '🎬 Cinematic' },
                        { id: 'photorealistic', name: '📸 Realistic' },
                        { id: 'anime', name: '🏯 Anime' },
                        { id: 'digital-art', name: '🎨 Digital Art' }
                      ].map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setImageStyle(s.id)}
                          className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                            imageStyle === s.id
                              ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200'
                              : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isImageGenerating || !imagePrompt.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isImageGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI က ရုပ်ပုံကို ရေးဆွဲနေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>AI ရုပ်ပုံ ဖန်တီးမည် (Generate Image)</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {imageError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{imageError}</p>
              </div>
            )}

            {imageResultUrl && (
              <div className="bg-[#151926] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>AI ရုပ်ပုံ အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ</span>
                  </h3>
                </div>

                <div className="relative group max-w-sm mx-auto overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                  <img src={imageResultUrl} alt="AI Result" className="w-full h-auto object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                     <button 
                       onClick={() => {
                         const a = document.createElement('a');
                         a.href = imageResultUrl;
                         a.download = `AI_Image_${Date.now()}.png`;
                         a.click();
                       }}
                       className="p-3 bg-white text-black rounded-full hover:scale-110 transition-all shadow-lg"
                       title="Download"
                     >
                       <Download className="w-5 h-5" />
                     </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      setVideoBgImage(imageResultUrl);
                      setMainMode('video');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <Video className="w-4 h-4" />
                    <span>ဤပုံကို ဗီဒီယိုနောက်ခံအဖြစ် အသုံးပြုမည်</span>
                  </button>

                  <a
                    href={imageResultUrl}
                    download={`AI_Image_${Date.now()}.png`}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 border border-white/10"
                  >
                    <Download className="w-4 h-4" />
                    <span>ဖုန်းထဲသို့ သိမ်းဆည်းမည် (Download)</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

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

                    {/* Gender Filter Tabs */}
                    <div className="flex items-center gap-1.5 bg-[#0d0f17] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setGenderFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          genderFilter === 'all'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        အကုန်လုံး ({voices.length || 13})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenderFilter('male')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          genderFilter === 'male'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>👨 အမျိုးသား ({voices.filter(v => v.gender === 'Male').length || 8})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenderFilter('female')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          genderFilter === 'female'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>👩 အမျိုးသမီး ({voices.filter(v => v.gender === 'Female').length || 5})</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {voices
                      .filter(v => {
                        if (genderFilter === 'male') return v.gender === 'Male';
                        if (genderFilter === 'female') return v.gender === 'Female';
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
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>ဖတ်ပြစေလိုသော စာသားများ ရိုက်ထည့်ပါ (မြန်မာ သို့မဟုတ် အင်္ဂလိပ်)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setTtsText('မင်္ဂလာပါရှင်။ VoiceMaster Studio မှ ကြိုဆိုပါတယ်။ ကျွန်မတို့ စနစ်ဟာ စက်ရုပ်အသံလုံးဝ မဟုတ်ဘဲ လူသားစစ်စစ်ရဲ့ သဘာဝလေယူလေသိမ်းအတိုင်း အလွန်ချောမွေ့ကြည်လင်စွာ ဖတ်ကြားပေးနိုင်ပါတယ်။')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-normal"
                    >
                      နမူနာစာသား စမ်းထည့်ရန်
                    </button>
                  </label>

                  <textarea
                    rows={8}
                    required
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="ဒီနေရာတွင် ဖတ်ပြစေလိုသော စာများကို ရိုက်ထည့်ပါ သို့မဟုတ် ကူးယူထည့်သွင်းပါ (စာလုံးရေ ၁၀,၀၀၀ အထိ အပြည့်အစုံ ဖတ်ပြပေးပါမည်)..."
                    className="w-full bg-[#0d0f17] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-sans resize-y"
                  />
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
                      <span>Download .MP3 (တိုက်ရိုက်ဒေါင်းမည်)</span>
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
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-slate-400">
                      ✓ ဤအသံဖိုင်ကို သမိုင်းမှတ်တမ်း (History) တွင် အလိုအလျောက် သိမ်းဆည်းပြီးဖြစ်ပါသည်
                    </p>
                    <button
                      onClick={() => setMainMode('history')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline underline-offset-4"
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
                    ဇာတ်ကောင် ၅ ယောက်အထိ မတူညီသော လူသားအသံများ ရွေးချယ်၍ အပြန်အလှန် စကားပြော အသံဖိုင် သဘာဝအတိုင်း ထုတ်ယူနိုင်ပါသည်
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
                    <span>ဇာတ်ကောင် (၅) ယောက် ရွေးချယ် ပြင်ဆင်ရန် (Speakers Setup)</span>
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
                            ဇာတ်ကောင် {idx + 1}
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
                            {voices.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.gender === 'Female' ? '👩' : '👨'} {v.name}
                              </option>
                            ))}
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
                      <span>Download Dialogue .MP3 (ဒေါင်းမည်)</span>
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
                          <span>MP4 ဗီဒီယို ဒေါင်းလုဒ် (Download)</span>
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
                    
                    {/* Background Image Upload */}
                    <div className="p-3 bg-black/20 border border-white/5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Custom Background Image (Optional)</span>
                        {videoBgImage && (
                          <button 
                            onClick={() => setVideoBgImage('')}
                            className="text-[10px] text-rose-400 hover:text-rose-300 transition-all font-bold"
                          >
                            ဖယ်ထုတ်မည်
                          </button>
                        )}
                      </div>
                      
                      {!videoBgImage ? (
                        <label className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-white/10 rounded-xl hover:border-indigo-500/50 hover:bg-white/5 transition-all cursor-pointer group">
                          <Image className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 mb-1" />
                          <span className="text-[11px] text-slate-400 group-hover:text-slate-200">နောက်ခံပုံ တင်ရန် (Upload Background)</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setVideoBgImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      ) : (
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/10">
                          <img src={videoBgImage} className="w-full h-full object-cover" alt="Background" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-white font-bold">တင်ပြီးပါပြီ</span>
                          </div>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-500 italic">ပုံမတင်လျှင် အောက်ပါ Theme အရောင်များကို အသုံးပြုပါမည်။</p>
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
                          <span>ဒေါင်းလုဒ်ဆွဲမည် (.MP4)</span>
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
                              <span>MP3</span>
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 block">
                      အသံဖိုင် သို့မဟုတ် ဗီဒီယိုဖိုင် ရွေးချယ်ပါ (MP4 / MKV / MOV / MP3 / WAV - 1GB အထိ):
                    </label>
                    {selectedTranscribeFile && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        {(selectedTranscribeFile.size / (1024 * 1024)).toFixed(1)} MB / 1,024 MB
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="audio/*,video/*,.mp4,.mkv,.mov,.avi,.webm,.mp3,.wav,.m4a"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedTranscribeFile(file);
                        setTranscribeAudio(file.name);
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in fade-in">
                    {/* Plain Text Transcript */}
                    <div className="bg-[#0c0e14] p-4 rounded-xl border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          <span>စာသားအပြည့်အစုံ (Plain Transcript)</span>
                        </span>
                        <button
                          onClick={() => handleCopy(transcribeResult, 'transcript_raw')}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold border border-white/5 active:scale-95 flex items-center gap-1"
                        >
                          {copiedType === 'transcript_raw' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedType === 'transcript_raw' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={transcribeResult}
                        className="w-full h-64 bg-black/40 border border-white/5 rounded-lg p-3 text-xs leading-relaxed text-slate-200 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Interactive SRT Timeline Inspector */}
                    <div className="md:col-span-2">
                      <SrtTimelineInspector
                        srtText={transcribeSrt}
                        title="CapCut / Premiere အသင့်သုံး စာတန်းထိုး Timeline (စက္ကန့်အလိုက်)"
                        onCopy={handleCopy}
                        onDownload={downloadFile}
                      />
                    </div>
                  </div>
                )}

                {/* 1-Click Translate SRT to Myanmar Button */}
                {transcribeSrt && (
                  <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Languages className="w-4 h-4 text-emerald-400" />
                          <span>🇲🇲 စာတန်းထိုးများကို မြန်မာဘာသာသို့ ပြန်ဆိုမည် (Translate SRT to Myanmar)</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          အထက်ပါ စာတန်းထိုး Timestamps များကို အတိအကျ ထိန်းသိမ်းထားပြီး စာသားအားလုံးကို သဘာဝကျသော မြန်မာစကားပြော (Unicode) သို့ ၁ ချက်နှိပ်ရုံဖြင့် ပြောင်းလဲပါမည်
                        </p>
                      </div>

                      <button
                        onClick={() => handleTranslateSrt()}
                        disabled={isTranslatingSrt}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-50 shrink-0"
                      >
                        {isTranslatingSrt ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>မြန်မာစာသို့ ပြန်ဆိုနေပါသည်...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-emerald-200" />
                            <span>🇲🇲 မြန်မာဘာသာသို့ ပြန်ဆိုမည်</span>
                          </>
                        )}
                      </button>
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
                          <span>🇲🇲 မြန်မာ SRT ဒေါင်းလုဒ်</span>
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
                    <div className="relative">
                      <input
                        type="file"
                        accept=".srt,.txt"
                        id="external_srt_file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              const content = reader.result as string;
                              setCustomSrtInput(content);
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="external_srt_file"
                        className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>.SRT ဖိုင် တင်သွင်းမည်</span>
                      </label>
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
                          <span>ဒေါင်းလုဒ်ဆွဲမည် (.MP3)</span>
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
                      <option value="short">⚡ ၃၀ စက္ကန့် - ၁ မိနစ်တို (Shorts/Reels)</option>
                      <option value="medium">🎬 ၂ မိနစ် - ၃ မိနစ် (Standard Story)</option>
                      <option value="long">🎥 ၅ မိနစ် - ၈ မိနစ် (Long Narrative)</option>
                      <option value="epic">🏆 ၁၀ မိနစ်အထိ ဇာတ်ကားရှည်အပြည့် (Up to 10 Mins)</option>
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
                        <span>.MP4 Download</span>
                      </a>
                    </div>
                  </div>

                  {/* Video Player */}
                  <div className="max-w-md mx-auto aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <video src={pipelineResult.videoUrl} controls className="w-full h-full object-contain" />
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: MULTI-LANGUAGE TRANSLATOR + SPEECH (FEATURE 4)                       */}
        {/* ========================================================================= */}
        {mainMode === 'translator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#151926] border border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 mb-2">
                  <Languages className="w-3.5 h-3.5 text-blue-400" />
                  <span>Feature 4: Global AI Translator & Dubbing</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🌐 Multi-Language AI Translator + Human Speech Studio</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  မြန်မာ၊ အင်္ဂလိပ်၊ ကိုရီးယား၊ ဂျပန်၊ တရုတ်၊ ထိုင်း ဘာသာစကားများကို တိကျမှန်ကန်စွာ ဘာသာပြန်ပြီး သက်ဆိုင်ရာ နိုင်ငံအသံထွက် လူသားစစ်စစ်ဖြင့် အသံဖိုင် ချက်ချင်း ထုတ်ယူနိုင်ပါသည်
                </p>
              </div>

              <form onSubmit={handleTranslateAndSpeak} className="space-y-5">
                {/* Source Text Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">ဘာသာပြန်လိုသော စာသား (Original Text):</label>
                  <textarea
                    rows={4}
                    required
                    value={translateText}
                    onChange={(e) => setTranslateText(e.target.value)}
                    placeholder="ဘာသာပြန်လိုသည့် စာသားများကို ရိုက်ထည့်ပါ (မြန်မာ သို့မဟုတ် မည်သည့်ဘာသာစကားမဆို)..."
                    className="w-full bg-[#0d101d] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Target Language Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">ပြောင်းလဲလိုသော ဘာသာစကား (Target Language):</label>
                    <select
                      value={translateTargetLang}
                      onChange={(e) => setTranslateTargetLang(e.target.value)}
                      className="w-full bg-[#0d101d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="en">🇺🇸 English (အင်္ဂလိပ်ဘာသာ)</option>
                      <option value="my">🇲🇲 Myanmar (မြန်မာဘာသာ)</option>
                      <option value="ko">🇰🇷 Korean (ကိုရီးယားဘာသာ)</option>
                      <option value="ja">🇯🇵 Japanese (ဂျပန်ဘာသာ)</option>
                      <option value="zh">🇨🇳 Chinese (တရုတ်ဘာသာ)</option>
                      <option value="th">🇹🇭 Thai (ထိုင်းဘာသာ)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">အသံ လေသံ (Voice Profile):</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full bg-[#0d101d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      {voices.slice(0, 8).map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.desc})</option>
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
                      <span>AI က ဘာသာပြန်ဆိုပြီး အသံဖိုင် ဖန်တီးနေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4 text-blue-300" />
                      <span>🌐 ဘာသာပြန်ပြီး အသံဖိုင် ထုတ်ယူမည် (Translate & Speak)</span>
                    </>
                  )}
                </button>
              </form>

              {/* Translation Result Display */}
              {translateResult && (
                <div className="p-5 bg-[#0a0c12] rounded-2xl border border-blue-500/30 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ဘာသာပြန်နှင့် အသံဖိုင် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ!</span>
                    </span>
                    <button
                      onClick={() => handleCopy(translateResult.translatedText, 'translated_text')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold border border-white/10 flex items-center gap-1.5 active:scale-95"
                    >
                      {copiedType === 'translated_text' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'translated_text' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Translated Text Output */}
                  <div className="p-4 bg-[#121520] rounded-xl border border-white/5 text-sm text-slate-100 font-medium leading-relaxed whitespace-pre-line">
                    {translateResult.translatedText}
                  </div>

                  {/* Audio Player and Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <audio src={translateResult.audioUrl} controls className="w-full sm:w-2/3 h-9" />
                    <button
                      onClick={() => downloadAudioFile(translateResult.audioUrl, `VoiceMaster_Translated_${Date.now()}.mp3`)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>.MP3 Download</span>
                    </button>
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
                      <span>.MP4 Download</span>
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
