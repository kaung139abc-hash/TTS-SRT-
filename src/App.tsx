import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Link2, Upload, Download, Copy, Check, Play, Pause,
  Sparkles, RefreshCw, AlertCircle, DollarSign,
  Languages, Clock, Subtitles, Volume2, Video, CheckCircle2,
  ExternalLink, Layers, ArrowRight, Settings2, Sliders, UserCheck,
  FileAudio, Info, Mic
} from 'lucide-react';

interface VoiceItem {
  id: string;
  name: string;
  gender: string;
  lang: string;
  desc: string;
}

interface SubtitleItem {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

interface TranscribeResult {
  title?: string;
  url?: string;
  language: string;
  transcript: string;
  subtitles: SubtitleItem[];
  srt: string;
}

interface TTSResult {
  audioUrl: string;
  srt: string;
  characterCount: number;
  voiceUsed: string;
}

export const App: React.FC = () => {
  // Main Navigation Modes: 'tts' (Text to Speech 10k chars) vs 'stt' (Video to SRT)
  const [mainMode, setMainMode] = useState<'tts' | 'stt'>('tts');

  // ----------------------------------------------------
  // Mode 1: Text-to-Speech (TTS) State
  // ----------------------------------------------------
  const [ttsText, setTtsText] = useState('');
  const [voices, setVoices] = useState<VoiceItem[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('my-MM-ThihaNeural');
  const [speechRate, setSpeechRate] = useState('+0%');
  const [speechPitch, setSpeechPitch] = useState('+0Hz');
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [ttsResult, setTtsResult] = useState<TTSResult | null>(null);
  const [ttsError, setTtsError] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // ----------------------------------------------------
  // Mode 2: Video/Audio to SRT (STT) State
  // ----------------------------------------------------
  const [sttTab, setSttTab] = useState<'url' | 'upload'>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSttLoading, setIsSttLoading] = useState(false);
  const [sttStatus, setSttStatus] = useState('');
  const [sttError, setSttError] = useState('');
  const [sttResult, setSttResult] = useState<TranscribeResult | null>(null);

  // Common UI State
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Adsterra / Monetag Monetization Links
  const [showAdSettings, setShowAdSettings] = useState(false);
  const [adsterraDirectLink, setAdsterraDirectLink] = useState('https://www.profitablecpmrate.com/example');
  const [showBannerAds, setShowBannerAds] = useState(true);

  // Load voices on mount
  useEffect(() => {
    fetch('/api/tts-voices')
      .then((res) => res.json())
      .then((data) => {
        if (data.voices) {
          setVoices(data.voices);
        }
      })
      .catch((err) => console.error('Failed to load voices:', err));
  }, []);

  const triggerMonetizationAd = () => {
    if (adsterraDirectLink && adsterraDirectLink.startsWith('http')) {
      try {
        window.open(adsterraDirectLink, '_blank', 'noopener,noreferrer');
      } catch (_) {}
    }
  };

  // ----------------------------------------------------
  // Text to Speech Execution (Up to 10,000 characters)
  // ----------------------------------------------------
  const handleGenerateTTS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttsText.trim()) return;

    if (ttsText.length > 10000) {
      setTtsError(`စာလုံးရေ ${ttsText.length} လုံး ဖြစ်နေပါသည်။ တစ်ကြိမ်လျှင် ၁၀,၀၀၀ (10,000 characters) အထိသာ ထည့်သွင်းပေးပါခင်ဗျာ။`);
      return;
    }

    setIsTtsLoading(true);
    setTtsError('');
    setTtsResult(null);
    triggerMonetizationAd();

    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText.trim(),
          voice: selectedVoice,
          rate: speechRate,
          pitch: speechPitch
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Text-to-speech generation failed');
      }

      setTtsResult(data);
    } catch (err: any) {
      setTtsError(err.message || 'အသံထွက်ထုတ်ယူရာတွင် ချွတ်ယွင်းချက် ဖြစ်ပေါ်သွားပါသည်။');
    } finally {
      setIsTtsLoading(false);
    }
  };

  // ----------------------------------------------------
  // Video to SRT Execution
  // ----------------------------------------------------
  const handleTranscribeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setIsSttLoading(true);
    setSttError('');
    setSttResult(null);
    setSttStatus('ဗီဒီယို လင့်ခ်မှ အသံဖိုင်ကို ဒေါင်းလုဒ်ရယူနေပါသည်...');
    triggerMonetizationAd();

    try {
      setSttStatus('AI က စကားသံများကို နားထောင်ပြီး SRT စာတန်းထိုး တွက်ချက်နေပါသည်...');
      const res = await fetch('/api/transcribe-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      setSttResult(data);
    } catch (err: any) {
      setSttError(err.message || 'ဗီဒီယိုမှ စကားသံကို ထုတ်ယူရာတွင် အမှားဖြစ်ပေါ်သွားပါသည်။');
    } finally {
      setIsSttLoading(false);
    }
  };

  const handleTranscribeFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsSttLoading(true);
    setSttError('');
    setSttResult(null);
    setSttStatus('မီဒီယာဖိုင်ကို ဆာဗာသို့ တင်ပို့နေပါသည်...');
    triggerMonetizationAd();

    try {
      const formData = new FormData();
      formData.append('mediaFile', selectedFile);

      setSttStatus('AI က မူရင်းစကားသံများကို မီလီစက္ကန့်မလွဲ နားထောင်ပြီး SRT စာတန်းထိုး ရေးဖွဲ့နေပါသည်...');
      const res = await fetch('/api/transcribe-upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'File transcription failed');
      }

      setSttResult(data);
    } catch (err: any) {
      setSttError(err.message || 'ဖိုင်မှ အသံကို စာတန်းထိုး ထုတ်ယူရာတွင် အမှားဖြစ်ပေါ်သွားပါသည်။');
    } finally {
      setIsSttLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-[#0d0f15] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#121520]/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              VoiceMaster Studio
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                10k Chars • 9 Human Voices • SRT Sync
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              လူအစစ်အသံ Text-to-Speech (စာလုံးရေ ၁၀,၀၀၀) + Video to SRT စာတန်းထိုးစနစ်
            </p>
          </div>
        </div>

        {/* Adsterra/Monetag Quick Config Toggle */}
        <button
          onClick={() => setShowAdSettings(!showAdSettings)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Adsterra / Monetag Ads</span>
          <span>ကြော်ငြာ Setting</span>
        </button>
      </header>

      {/* Ad Setting Drawer */}
      {showAdSettings && (
        <div className="bg-amber-950/30 border-b border-amber-500/20 px-4 lg:px-8 py-3 text-xs text-amber-200">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-400 mb-1">
                <Settings2 className="w-4 h-4" /> သင်၏ Adsterra / Monetag Direct Link ကို ထည့်ပါ -
              </span>
              <p className="text-[11px] text-amber-300/80">
                အသုံးပြုသူများ အသံထွက်ထုတ်ယူခြင်း သို့မဟုတ် SRT ဒေါင်းလုဒ်ဆွဲချိန်တွင် သင့်ကြော်ငြာပွင့်ပြီး ဝင်ငွေ (CPM) ဝင်ပါမည်။
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={adsterraDirectLink}
                onChange={(e) => setAdsterraDirectLink(e.target.value)}
                placeholder="https://www.profitablecpmrate.com/your-ad-code"
                className="bg-black/50 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-amber-100 flex-1 sm:w-80 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => setShowAdSettings(false)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold shrink-0 hover:bg-amber-400"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Ad Container */}
      {showBannerAds && (
        <div className="w-full bg-[#131622] border-b border-white/5 py-2 px-4 flex items-center justify-center">
          <div className="w-full max-w-[728px] h-[65px] rounded-lg border border-dashed border-slate-700 bg-slate-800/40 flex flex-col items-center justify-center text-center p-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
              Advertisement Banner Slot (728x90 Responsive)
            </span>
            <span className="text-xs text-slate-400">Adsterra / Monetag Banner Code နေရာ (User အကန့်အသတ်မရှိ သုံးနိုင်သည်)</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Navigation Tabs: Mode 1 (TTS 10k Chars) vs Mode 2 (Video-to-SRT) */}
        <div className="bg-[#151824] p-1.5 rounded-2xl border border-white/10 flex items-center gap-2 max-w-lg mx-auto w-full shadow-lg">
          <button
            onClick={() => setMainMode('tts')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mainMode === 'tts'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Text to Speech (စာလုံး ၁၀,၀၀၀)</span>
          </button>

          <button
            onClick={() => setMainMode('stt')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mainMode === 'stt'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Subtitles className="w-4 h-4" />
            <span>Video to SRT စာတန်းထိုး</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: TEXT-TO-SPEECH (TTS) - 9 Human Voices, 10,000 Chars, SRT Sync */}
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
                    စက်ရုပ်အသံလုံးဝမပေါက်သော Neural Real Human Voices ဖြင့် စာလုံးရေ ၁၀,၀၀၀ အထိ အသံဖတ်ပေးပါမည်
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                  {ttsText.length} / 10,000 စာလုံး
                </span>
              </div>

              <form onSubmit={handleGenerateTTS} className="space-y-5">
                {/* 1. Voice Selection (9 Varieties of Real Human Voices) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      <span>အသံအမျိုးအစား ရွေးချယ်ပါ (လူအစစ်အသံ ၉ မျိုး ရွေးနိုင်ပါသည်)</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-normal">
                      ✓ စက်ရုပ်အသံလုံးဝမဟုတ်ပါ
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {voices.map((v) => {
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
                      <span>ဖတ်ပြစေလိုသော စာသားကို ရိုက်ထည့်ပါ (မြန်မာစာ / English စာလုံး ၁၀,၀၀၀ ထိ ရပါသည်)</span>
                    </span>
                  </label>

                  <textarea
                    rows={7}
                    required
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="ဒီနေရာတွင် သင်ဖတ်ပြစေလိုသော စာအုပ်၊ ဝတ္ထု၊ သတင်း၊ ဇာတ်လမ်း သို့မဟုတ် စာသားများကို ကူးယူထည့်သွင်းပါ (စာလုံးရေ ၁၀,၀၀၀ အထိ အပြည့်အစုံ ဖတ်ပေးနိုင်ပါသည်)..."
                    className="w-full bg-[#0d0f17] border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans leading-relaxed"
                  />
                </div>

                {/* Speed Controls */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0f121d] border border-white/5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      အသံအမြန်နှုန်း (Speech Speed)
                    </label>
                    <select
                      value={speechRate}
                      onChange={(e) => setSpeechRate(e.target.value)}
                      className="w-full bg-[#161a26] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="-20%">ဖြည်းဖြည်း (0.8x Slow)</option>
                      <option value="+0%">ပုံမှန် အမြန်နှုန်း (1.0x Normal)</option>
                      <option value="+15%">အနည်းငယ်မြန် (1.15x)</option>
                      <option value="+25%">မြန်မြန် (1.25x Fast)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      အသံမြင့်/နိမ့် (Pitch)
                    </label>
                    <select
                      value={speechPitch}
                      onChange={(e) => setSpeechPitch(e.target.value)}
                      className="w-full bg-[#161a26] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="-5Hz">နက်ရှိုင်းသော အသံ (Deep)</option>
                      <option value="+0Hz">သဘာဝ အသံ (Natural)</option>
                      <option value="+5Hz">ကြည်လင်စူးရှသော အသံ (High)</option>
                    </select>
                  </div>
                </div>

                {/* Error Banner */}
                {ttsError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2.5 text-rose-200 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{ttsError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isTtsLoading || !ttsText.trim()}
                  className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTtsLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>လူအစစ်အသံနှင့် SRT စာတန်းထိုး ထုတ်လုပ်နေပါသည် (ခေတ္တစောင့်ပါ)...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      <span>အသံဖိုင် (MP3) နှင့် အချိန်ကိုက် SRT စာတန်းထိုး ထုတ်မည်</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* TTS Results Card */}
            {ttsResult && (
              <div className="bg-[#151926] border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>လူအစစ်အသံ MP3 & SRT အောင်မြင်စွာ ရရှိပါပြီ!</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      ဖတ်ပြထားသော စာလုံးရေ: {ttsResult.characterCount} လုံး
                    </h3>
                  </div>

                  {/* Downloads */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        triggerMonetizationAd();
                        const a = document.createElement('a');
                        a.href = ttsResult.audioUrl;
                        a.download = `voice_narration_${Date.now()}.mp3`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .MP3</span>
                    </button>

                    <button
                      onClick={() => downloadFile(ttsResult.srt, `subtitles_${Date.now()}.srt`, 'text/plain;charset=utf-8')}
                      className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                    >
                      <Subtitles className="w-4 h-4" />
                      <span>Download .SRT</span>
                    </button>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="p-4 rounded-xl bg-[#0d0f17] border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>အသံဖိုင် ချက်ချင်း ဖွင့်နားထောင်ရန် -</span>
                  </div>
                  <audio
                    ref={audioPlayerRef}
                    controls
                    src={ttsResult.audioUrl}
                    className="w-full h-10 rounded-lg outline-none"
                    onPlay={() => setIsPlayingAudio(true)}
                    onPause={() => setIsPlayingAudio(false)}
                  />
                </div>

                {/* Subtitle SRT Content */}
                {ttsResult.srt && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>အချိန်ကိုက် SRT စာတန်းထိုးများ (Timestamps Synchronized)</span>
                      </span>
                      <button
                        onClick={() => handleCopy(ttsResult.srt, 'srt_tts')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedType === 'srt_tts' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">SRT ကူးယူပြီး!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy SRT</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-[#0c0e14] border border-white/10 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto leading-relaxed select-text">
                      {ttsResult.srt}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: VIDEO TO SRT (STT) - YouTube/TikTok Link or File Upload */}
        {/* ========================================================================= */}
        {mainMode === 'stt' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Input Switcher */}
            <div className="bg-[#151824] p-1.5 rounded-2xl border border-white/10 flex items-center gap-1 max-w-md mx-auto w-full">
              <button
                onClick={() => setSttTab('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  sttTab === 'url'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>Video Link ဖြင့် ထည့်ရန်</span>
              </button>
              <button
                onClick={() => setSttTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  sttTab === 'upload'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>ဖိုင် တိုက်ရိုက် Upload တင်ရန်</span>
              </button>
            </div>

            {/* Form */}
            <div className="bg-[#151926] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
              {sttTab === 'url' ? (
                <form onSubmit={handleTranscribeUrl} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <Video className="w-4 h-4 text-indigo-400" />
                      <span>ဗီဒီယို လင့်ခ် (YouTube, TikTok, Facebook, etc.)</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... သို့မဟုတ် TikTok link"
                      className="w-full bg-[#0d0f17] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSttLoading || !videoUrl.trim()}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSttLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AI စာတန်းထိုး ထုတ်လုပ်နေပါသည်...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>မူရင်းစကားသံ SRT စာတန်းထိုး ထုတ်မည်</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleTranscribeFile} className="space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-2xl p-6 sm:p-8 text-center cursor-pointer bg-[#0d0f17]/50 hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center gap-3"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*,audio/*,.mp4,.mp3,.wav,.mkv,.m4a"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Upload className="w-7 h-7" />
                    </div>

                    {selectedFile ? (
                      <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> {selectedFile.name}
                      </span>
                    ) : (
                      <p className="text-xs sm:text-sm font-semibold text-slate-200">
                        ဒီနေရာကို နှိပ်ပြီး ဗီဒီယို/အော်ဒီယိုဖိုင် ရွေးချယ်ပါ (MP4, MP3, 150MB အထိ)
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSttLoading || !selectedFile}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSttLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AI စာတန်းထိုး ထုတ်လုပ်နေပါသည်...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>ဖိုင်ထဲက စကားသံများကို SRT စာတန်းထိုး ပြောင်းမည်</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Status / Error */}
              {isSttLoading && (
                <div className="mt-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3 text-xs text-indigo-200">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>{sttStatus}</span>
                </div>
              )}
              {sttError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{sttError}</span>
                </div>
              )}
            </div>

            {/* STT Results */}
            {sttResult && (
              <div className="bg-[#151926] border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>SRT စာတန်းထိုး အောင်မြင်စွာ ရရှိပါပြီ!</span>
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {sttResult.title || 'Extracted Subtitles'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadFile(sttResult.srt, 'subtitles.srt', 'text/plain;charset=utf-8')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .SRT</span>
                    </button>
                    <button
                      onClick={() => downloadFile(sttResult.transcript, 'transcript.txt', 'text/plain;charset=utf-8')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-white/10 active:scale-95"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Text</span>
                    </button>
                  </div>
                </div>

                {/* Subtitle Segments */}
                <div className="max-h-72 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                  {sttResult.subtitles.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#0f121b] border border-white/5 flex items-start gap-3"
                    >
                      <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded shrink-0">
                        {sub.startTime}
                      </span>
                      <span className="text-xs text-slate-200 leading-relaxed">
                        {sub.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0c0e14] py-4 px-6 text-center text-xs text-slate-500">
        VoiceMaster Studio • 10k Chars Real Human TTS & Subtitle Engine
      </footer>
    </div>
  );
};

export default App;
