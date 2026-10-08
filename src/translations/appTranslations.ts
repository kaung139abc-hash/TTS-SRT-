export type AppLanguage = 
  | 'my' 
  | 'en' 
  | 'ja' 
  | 'ko' 
  | 'zh' 
  | 'th' 
  | 'lo' 
  | 'vi' 
  | 'id' 
  | 'es' 
  | 'ru' 
  | 'ar';

export interface LanguageOption {
  code: AppLanguage;
  flag: string;
  name: string;
  nativeName: string;
}

export const APP_LANGUAGES: LanguageOption[] = [
  { code: 'my', flag: '🇲🇲', name: 'Myanmar', nativeName: 'မြန်မာဘာသာ' },
  { code: 'en', flag: '🇺🇸', name: 'English', nativeName: 'English (US)' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', flag: '🇰🇷', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinese', nativeName: '简体中文' },
  { code: 'th', flag: '🇹🇭', name: 'Thai', nativeName: 'ภาษาไทย' },
  { code: 'lo', flag: '🇱🇦', name: 'Lao', nativeName: 'ພາສາລາວ' },
  { code: 'vi', flag: '🇻🇳', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', flag: '🇮🇩', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية' },
];

export interface AppTranslationStrings {
  appName: string;
  appBadge: string;
  appDescription: string;
  autoHealActive: string;
  historyBtn: string;
  uiLangSelectorLabel: string;
  
  // Navigation Tabs
  tabTts: string;
  tabSubtitle: string;
  tabImager: string;
  tabAutoPipeline: string;
  tabWriter: string;
  tabHistory: string;
  tabDialogue: string;
  tabTranslator: string;
  tabVoiceChanger: string;
  tabTranscribe: string;
  tabAudioModifier: string;
  tabSilenceRemover: string;
  tabInterp: string;

  // Actions
  generateVoice: string;
  generatingVoice: string;
  downloadAudio: string;
  play: string;
  pause: string;
  clear: string;
  copy: string;
  copied: string;
  loadSample: string;
  saveHistory: string;
  share: string;

  // Input & labels
  textInputPlaceholder: string;
  voiceSelectLabel: string;
  speedLabel: string;
  pitchLabel: string;
  bgmLabel: string;
  bgmVolumeLabel: string;
  charCount: string;

  // Translator Tab
  translateTabTitle: string;
  translateTabDesc: string;
  sourceLangLabel: string;
  targetLangLabel: string;
  targetVoiceLabel: string;
  translateBtn: string;
  translatingBtn: string;
  sourcePlaceholder: string;
  translationOutputTitle: string;
  nativeAccentBadge: string;

  // System & Resilience Badges
  highLoadShield: string;
  naturalVoiceNotice: string;
  errorRetryNotice: string;
}

export const APP_TRANSLATIONS: Record<AppLanguage, AppTranslationStrings> = {
  my: {
    appName: "VoiceMaster Studio",
    appBadge: "Unlimited TTS & Story Engine",
    appDescription: "လူအစစ်အသံ Text-to-Speech (စာလုံးရေ အကန့်အသတ်မရှိ) + YouTube/TikTok ဇာတ်လမ်းစက်",
    autoHealActive: "AI စနစ် အလိုအလျောက် ထိန်းသိမ်းမှု: အလုပ်လုပ်နေသည်",
    historyBtn: "မှတ်တမ်း",
    uiLangSelectorLabel: "အက်ပ်ဘာသာစကား (App Language)",
    
    tabTts: "လူအစစ် TTS",
    tabSubtitle: "🎬 စာတန်းထိုးကပ်စက်",
    tabImager: "🖼️ ပုံထုတ်စက်",
    tabAutoPipeline: "⚡ 1-Click ဗီဒီယို",
    tabWriter: "AI ဇာတ်လမ်း",
    tabHistory: "📂 မှတ်တမ်း",
    tabDialogue: "💬 စကားဝိုင်း",
    tabTranslator: "🌐 ဘာသာပြန် & Native အသံ",
    tabVoiceChanger: "🎭 အသံပြောင်းစက်",
    tabTranscribe: "🎙️ အသံမှ စာသားဖတ်ယူစက်",
    tabAudioModifier: "🎛️ Audio EQ & Speed",
    tabSilenceRemover: "✂️ အသံအပိုဖြတ်စက်",
    tabInterp: "🔴 တိုက်ရိုက် စကားပြန်",

    generateVoice: "အသံဖန်တီးမည် (Generate Voice)",
    generatingVoice: "အသံဖန်တီးနေပါသည်...",
    downloadAudio: "MP3 ဒေါင်းလုဒ်ဆွဲမည်",
    play: "ဖွင့်မည်",
    pause: "ခေတ္တရပ်မည်",
    clear: "ရှင်းလင်းမည်",
    copy: "Copy ကူးမည်",
    copied: "Copy ကူးပြီးပါပြီ!",
    loadSample: "နမူနာ စာသားထည့်မည်",
    saveHistory: "မှတ်တမ်းသိမ်းမည်",
    share: "မျှဝေမည်",

    textInputPlaceholder: "အသံထွက်စေလိုသော စာသားများကို ဤနေရာတွင် ရိုက်ထည့်ပါ (စာလုံးရေ အကန့်အသတ်မရှိ)...",
    voiceSelectLabel: "လူသားစစ်စစ် အသံရွေးချယ်ပါ",
    speedLabel: "အသံအမြန်နှုန်း (Speed)",
    pitchLabel: "အသံအမြင့်အနိမ့် (Pitch)",
    bgmLabel: "သဘာဝနောက်ခံတေး (BGM)",
    bgmVolumeLabel: "BGM အသံပမာဏ",
    charCount: "စာလုံးရေ",

    translateTabTitle: "ကမ္ဘာလုံးဆိုင်ရာ နိုင်ငံတကာ ဘာသာပြန်စနစ် + Native စကားပြောအသံ",
    translateTabDesc: "အာရှနိုင်ငံများအားလုံး အပါအဝင် ကမ္ဘာ့ဘာသာစကားများသို့ တိကျမှန်ကန်စွာ ဘာသာပြန်ပြီး သက်ဆိုင်ရာနိုင်ငံသား အသံစစ်စစ်ဖြင့် အသံထွက်ပေးပါသည်။",
    sourceLangLabel: "မူရင်းဘာသာစကား (Source Language):",
    targetLangLabel: "ပြောင်းလဲလိုသော နိုင်ငံ ဘာသာစကား (Target Country / Language):",
    targetVoiceLabel: "နိုင်ငံအလိုက် သဘာဝလူသားအသံ (Native Spoken Voice):",
    translateBtn: "တိကျစွာ ဘာသာပြန်ပြီး Native အသံထွက်မည်",
    translatingBtn: "ဘာသာပြန်ပြီး အသံဖန်တီးနေပါသည်...",
    sourcePlaceholder: "ဘာသာပြန်လိုသော စာသားကို ဤနေရာတွင် ရိုက်ထည့်ပါ သို့မဟုတ် ကူးထည့်ပါ...",
    translationOutputTitle: "တိကျသော ဘာသာပြန်ရလဒ် & Native အသံထွက်",
    nativeAccentBadge: "၁၀၀% သက်ဆိုင်ရာနိုင်ငံသား အသံစစ်စစ်",

    highLoadShield: "လူသုံးများချိန်တွင်လည်း စနစ်ကျဆင်းမှုမရှိစေရန် Concurrency Shield ဖြင့် ကာကွယ်ထားပါသည်",
    naturalVoiceNotice: "၁၀၀% လူသားစစ်စစ် သဘာဝအသံ အထူးပြုစနစ်",
    errorRetryNotice: "ကွန်ရက်နှောင့်နှေးမှုရှိပါက အလိုအလျောက် ပြန်လည်ချိတ်ဆက်ပေးပါသည်"
  },

  en: {
    appName: "VoiceMaster Studio",
    appBadge: "Unlimited TTS & Story Engine",
    appDescription: "Authentic Human Voice Text-to-Speech (Unlimited Characters) + Video Storyteller Engine",
    autoHealActive: "AI System Auto-Resilience: Active",
    historyBtn: "History",
    uiLangSelectorLabel: "Interface Language",
    
    tabTts: "Human TTS",
    tabSubtitle: "🎬 Subtitle Burner",
    tabImager: "🖼️ AI Image Studio",
    tabAutoPipeline: "⚡ 1-Click Video",
    tabWriter: "AI Storyteller",
    tabHistory: "📂 History",
    tabDialogue: "💬 Multi-Speaker",
    tabTranslator: "🌐 Translator & Voice",
    tabVoiceChanger: "🎭 Voice Changer",
    tabTranscribe: "🎙️ Speech-to-Text",
    tabAudioModifier: "🎛️ Audio EQ & Speed",
    tabSilenceRemover: "✂️ Silence Remover",
    tabInterp: "🔴 Live Interpreter",

    generateVoice: "Generate Voice",
    generatingVoice: "Generating Audio...",
    downloadAudio: "Download MP3",
    play: "Play",
    pause: "Pause",
    clear: "Clear",
    copy: "Copy",
    copied: "Copied!",
    loadSample: "Load Sample Text",
    saveHistory: "Save to History",
    share: "Share",

    textInputPlaceholder: "Type or paste your text here (Supports unlimited characters without limits)...",
    voiceSelectLabel: "Select Authentic Human Voice Profile",
    speedLabel: "Speech Speed Rate",
    pitchLabel: "Voice Pitch",
    bgmLabel: "Background Music (BGM)",
    bgmVolumeLabel: "BGM Volume Level",
    charCount: "Characters",

    translateTabTitle: "Global Translation Suite & Authentic Native Voices",
    translateTabDesc: "Flawlessly localize text across all Asian and worldwide nations with 100% authentic native human voices.",
    sourceLangLabel: "Source Language:",
    targetLangLabel: "Target Country / Language:",
    targetVoiceLabel: "Native Spoken Voice Profile:",
    translateBtn: "Translate Accurately & Synthesize Voice",
    translatingBtn: "Translating & Synthesizing Speech...",
    sourcePlaceholder: "Type or paste text to translate into any Asian or international language...",
    translationOutputTitle: "Accurate Translation Output & Native Audio",
    nativeAccentBadge: "100% Native Accent Guaranteed",

    highLoadShield: "High-Traffic Concurrency Load Shield Active (Zero Downtime)",
    naturalVoiceNotice: "Studio-Grade Acoustic Neural Mastering Engine",
    errorRetryNotice: "Auto-Healing & Intelligent Network Recovery Enabled"
  },

  ja: {
    appName: "VoiceMaster Studio",
    appBadge: "無制限 TTS & ストーリーエンジン",
    appDescription: "リアルな人間の声 Text-to-Speech（文字数無制限）＋ YouTube/TikTok 動画生成",
    autoHealActive: "AI自動回復システム: 稼働中",
    historyBtn: "履歴",
    uiLangSelectorLabel: "表示言語 (Language)",
    
    tabTts: "人間の声 TTS",
    tabSubtitle: "🎬 字幕合成スタジオ",
    tabImager: "🖼️ AI 画像生成",
    tabAutoPipeline: "⚡ 1-Click 動画生成",
    tabWriter: "AI ストーリー",
    tabHistory: "📂 生成履歴",
    tabDialogue: "💬 会話スタジオ",
    tabTranslator: "🌐 翻訳 & ネイティブ音声",
    tabVoiceChanger: "🎭 ボイスチェンジャー",
    tabTranscribe: "🎙️ 音声文字起こし",
    tabAudioModifier: "🎛️ 音声EQ & 速度",
    tabSilenceRemover: "✂️ 無音カット",
    tabInterp: "🔴 リアルタイム通訳",

    generateVoice: "音声を生成する",
    generatingVoice: "音声を生成中...",
    downloadAudio: "MP3をダウンロード",
    play: "再生",
    pause: "一時停止",
    clear: "クリア",
    copy: "コピー",
    copied: "コピーしました！",
    loadSample: "サンプルテキストを読込",
    saveHistory: "履歴に保存",
    share: "共有",

    textInputPlaceholder: "ここにテキストを入力してください（文字数制限なし）...",
    voiceSelectLabel: "人間の音声プロファイルを選択",
    speedLabel: "読み上げ速度 (Speed)",
    pitchLabel: "声の高さ (Pitch)",
    bgmLabel: "BGM 音楽",
    bgmVolumeLabel: "BGM 音量",
    charCount: "文字数",

    translateTabTitle: "世界各国言語翻訳 & ネイティブ発音スタジオ",
    translateTabDesc: "すべてのアジア諸国をはじめとする世界の言語へ高精度に翻訳し、ネイティブの発音で音声合成します。",
    sourceLangLabel: "元の言語 (Source Language):",
    targetLangLabel: "翻訳先言語 (Target Language):",
    targetVoiceLabel: "現地のネイティブ音声 (Native Voice):",
    translateBtn: "高精度に翻訳してネイティブ音声で読み上げる",
    translatingBtn: "翻訳および音声生成中...",
    sourcePlaceholder: "翻訳したいテキストをここに入力してください...",
    translationOutputTitle: "正確な翻訳結果 & ネイティブ音声",
    nativeAccentBadge: "100% ネイティブ発音保証",

    highLoadShield: "高負荷自動分散シールド稼働中（アクセス集中時も安定稼働）",
    naturalVoiceNotice: "スタジオ品質のアコースティック・ニューラルマスタリング",
    errorRetryNotice: "ネットワーク自動復旧システム有効"
  },

  ko: {
    appName: "VoiceMaster Studio",
    appBadge: "무제한 TTS & 스토리 엔진",
    appDescription: "실제 사람 음성 Text-to-Speech (글자수 무제한) + AI 숏폼 영상 제작 엔진",
    autoHealActive: "AI 시스템 자동 복구: 활성화됨",
    historyBtn: "기록",
    uiLangSelectorLabel: "화면 언어 (Language)",
    
    tabTts: "사람 음성 TTS",
    tabSubtitle: "🎬 자막 인코딩기",
    tabImager: "🖼️ AI 이미지 생성",
    tabAutoPipeline: "⚡ 1-Click 비디오",
    tabWriter: "AI 스토리텔러",
    tabHistory: "📂 작업 기록",
    tabDialogue: "💬 다중 화자 대화",
    tabTranslator: "🌐 번역 & 네이티브 음성",
    tabVoiceChanger: "🎭 음성 변조기",
    tabTranscribe: "🎙️ 음성 인식 (STT)",
    tabAudioModifier: "🎛️ 오디오 EQ & 속도",
    tabSilenceRemover: "✂️ 무음 구간 제거",
    tabInterp: "🔴 실시간 동시통역",

    generateVoice: "음성 생성하기",
    generatingVoice: "음성 합성 중...",
    downloadAudio: "MP3 다운로드",
    play: "재생",
    pause: "일시정지",
    clear: "지우기",
    copy: "복사",
    copied: "복사 완료!",
    loadSample: "샘플 문장 입력",
    saveHistory: "기록에 저장",
    share: "공유",

    textInputPlaceholder: "음성으로 변환할 내용을 입력하세요 (글자 수 제한 없음)...",
    voiceSelectLabel: "원하는 인간 음성 모델 선택",
    speedLabel: "재생 속도",
    pitchLabel: "음조 (Pitch)",
    bgmLabel: "배경 음악 (BGM)",
    bgmVolumeLabel: "BGM 음량",
    charCount: "글자 수",

    translateTabTitle: "글로벌 번역 엔진 & 원어민 네이티브 음성",
    translateTabDesc: "모든 아시아 국가를 포함한 전 세계 언어로 완벽히 번역하고 현지 원어민 음성으로 읽어줍니다.",
    sourceLangLabel: "출발 언어 (Source):",
    targetLangLabel: "도착 국가 / 언어 (Target):",
    targetVoiceLabel: "해당 국가 원어민 음성:",
    translateBtn: "정확하게 번역하고 원어민 음성으로 듣기",
    translatingBtn: "번역 및 음성 생성 중...",
    sourcePlaceholder: "번역할 내용을 입력하세요...",
    translationOutputTitle: "정확한 번역 결과 및 네이티브 음성",
    nativeAccentBadge: "100% 현지 원어민 발음",

    highLoadShield: "대용량 트래픽 동시 접속 보호 쉴드 작동 중 (무중단 서비스)",
    naturalVoiceNotice: "스튜디오 급 방송 음향 마스터링 엔진 적용",
    errorRetryNotice: "스마트 네트워크 자동 복구 탑재"
  },

  zh: {
    appName: "VoiceMaster Studio",
    appBadge: "无限字数 TTS 与故事引擎",
    appDescription: "真人类原生 Text-to-Speech（不限字数）+ 社交媒体故事视频制作系统",
    autoHealActive: "AI 自动修复与高可用: 运行中",
    historyBtn: "历史记录",
    uiLangSelectorLabel: "界面语言 (Language)",
    
    tabTts: "真人类 TTS",
    tabSubtitle: "🎬 字幕压制机",
    tabImager: "🖼️ AI 图像生成",
    tabAutoPipeline: "⚡ 1键视频制作",
    tabWriter: "AI 故事编剧",
    tabHistory: "📂 生成记录",
    tabDialogue: "💬 多角色对话",
    tabTranslator: "🌐 智能翻译与母语朗读",
    tabVoiceChanger: "🎭 声音变声器",
    tabTranscribe: "🎙️ 语音转文字",
    tabAudioModifier: "🎛️ 音频均衡与变速",
    tabSilenceRemover: "✂️ 静音剪切",
    tabInterp: "🔴 实时双向同传",

    generateVoice: "生成语音 (Generate Voice)",
    generatingVoice: "正在合成真实语音...",
    downloadAudio: "下载 MP3",
    play: "播放",
    pause: "暂停",
    clear: "清空",
    copy: "复制",
    copied: "已复制！",
    loadSample: "载入示范文本",
    saveHistory: "保存至历史",
    share: "分享",

    textInputPlaceholder: "请输入需要朗读的文本（支持无限制超长文字）...",
    voiceSelectLabel: "选择真人发音模型",
    speedLabel: "语速调节",
    pitchLabel: "音调高低",
    bgmLabel: "背景音乐 (BGM)",
    bgmVolumeLabel: "BGM 音量大小",
    charCount: "字符数",

    translateTabTitle: "全球多语种精准翻译 & 原汁原味母语发音",
    translateTabDesc: "涵盖全亚洲国家及全球主流语言，精准地道本地化翻译，并由母语神经网络发音人清晰朗读。",
    sourceLangLabel: "源语言 (Source Language):",
    targetLangLabel: "目标国家 / 语言 (Target Language):",
    targetVoiceLabel: "当地母语原生发音人:",
    translateBtn: "精准翻译并以母语播报",
    translatingBtn: "正在翻译并生成语音...",
    sourcePlaceholder: "请输入要翻译的文本...",
    translationOutputTitle: "精准翻译文本与母语发音",
    nativeAccentBadge: "100% 当地纯正口音",

    highLoadShield: "高并发访问保护屏障已开启（多用户同时使用亦稳定流畅）",
    naturalVoiceNotice: "录音棚级广播声学母带处理",
    errorRetryNotice: "智能网络重试与无缝防崩保护"
  },

  th: {
    appName: "VoiceMaster Studio",
    appBadge: "TTS ไม่จำกัด & สร้างสตอรี่",
    appDescription: "เสียงพากย์คนจริง Text-to-Speech (ไม่จำกัดตัวอักษร) + สร้างวิดีโอ YouTube/TikTok",
    autoHealActive: "ระบบ AI กู้คืนอัตโนมัติ: กำลังทำงาน",
    historyBtn: "ประวัติ",
    uiLangSelectorLabel: "ภาษาของแอป (Language)",
    
    tabTts: "เสียงคนจริง TTS",
    tabSubtitle: "🎬 ฝังซับไตเติล",
    tabImager: "🖼️ สร้างรูปภาพ AI",
    tabAutoPipeline: "⚡ วิดีโอ 1-คลิก",
    tabWriter: "AI เขียนสตอรี่",
    tabHistory: "📂 ประวัติการสร้าง",
    tabDialogue: "💬 สนทนาหลายเสียง",
    tabTranslator: "🌐 แปลภาษา & เสียงเนทีฟ",
    tabVoiceChanger: "🎭 เปลี่ยนโทนเสียง",
    tabTranscribe: "🎙️ ถอดเสียงเป็นข้อความ",
    tabAudioModifier: "🎛️ ปรับ EQ & ความเร็ว",
    tabSilenceRemover: "✂️ ตัดช่วงเงียบ",
    tabInterp: "🔴 ล่ามเสียงสด",

    generateVoice: "สร้างเสียงพากย์",
    generatingVoice: "กำลังสร้างเสียง...",
    downloadAudio: "ดาวน์โหลด MP3",
    play: "เล่น",
    pause: "หยุดชั่วคราว",
    clear: "ล้างข้อความ",
    copy: "คัดลอก",
    copied: "คัดลอกเรียบร้อย!",
    loadSample: "โหลดตัวอย่าง",
    saveHistory: "บันทึกประวัติ",
    share: "แชร์",

    textInputPlaceholder: "พิมพ์หรือวางข้อความที่นี่ (ไม่จำกัดความยาวตัวอักษร)...",
    voiceSelectLabel: "เลือกโปรไฟล์เสียงคนจริง",
    speedLabel: "ความเร็วเสียงพูด",
    pitchLabel: "ระดับเสียง (Pitch)",
    bgmLabel: "เพลงพื้นหลัง (BGM)",
    bgmVolumeLabel: "ระดับเสียง BGM",
    charCount: "จำนวนตัวอักษร",

    translateTabTitle: "ระบบแปลภาษาระดับโลก & เสียงพากย์สำเนียงเนทีฟแท้",
    translateTabDesc: "แปลภาษาทุกประเทศในเอเชียและทั่วโลกอย่างแม่นยำ พร้อมพากย์เสียงสำเนียงเจ้าของภาษา 100%",
    sourceLangLabel: "ภาษาต้นทาง:",
    targetLangLabel: "ประเทศ / ภาษาปลายทาง:",
    targetVoiceLabel: "เสียงพากย์เจ้าของภาษา:",
    translateBtn: "แปลอย่างแม่นยำและพากย์เสียง",
    translatingBtn: "กำลังแปลและสร้างเสียงพากย์...",
    sourcePlaceholder: "พิมพ์ข้อความที่ต้องการแปลที่นี่...",
    translationOutputTitle: "ผลลัพธ์การแปลที่แม่นยำ & เสียงเนทีฟ",
    nativeAccentBadge: "สำเนียงเนทีฟแท้ 100%",

    highLoadShield: "เปิดใช้งานระบบป้องกันรองรับการใช้งานพร้อมกันสูง (เสถียร ไม่ล่ม)",
    naturalVoiceNotice: "ผ่านกระบวนการปรับแต่งเสียงระดับสตูดิโอมืออาชีพ",
    errorRetryNotice: "ระบบเชื่อมต่อใหม่อัตโนมัติเมื่อสัญญาณขัดข้อง"
  },

  lo: {
    appName: "VoiceMaster Studio",
    appBadge: "TTS ບໍ່ຈຳກັດ & ລະບົບສ້າງເລື່ອງ",
    appDescription: "ສຽງຄົນແທ້ Text-to-Speech (ບໍ່ຈຳກັດຕົວອັກສອນ) + ເຄື່ອງມືສ້າງວິດີໂອ YouTube/TikTok",
    autoHealActive: "ລະບົບ AI ຮັກສາຄວາມປອດໄພ: ເຮັດວຽກຢູ່",
    historyBtn: "ປະຫວັດ",
    uiLangSelectorLabel: "ພາສາຂອງແອັບ (Language)",
    
    tabTts: "ສຽງຄົນແທ້ TTS",
    tabSubtitle: "🎬 ຕິດຄຳບັນຍາຍ",
    tabImager: "🖼️ ສ້າງຮູບພາບ AI",
    tabAutoPipeline: "⚡ ວິດີໂອ 1-ຄລິກ",
    tabWriter: "AI ແຕ່ງເລື່ອງ",
    tabHistory: "📂 ປະຫວັດ",
    tabDialogue: "💬 ບົດສົນທະນາ",
    tabTranslator: "🌐 ແປພາສາ & ສຽງທ້ອງຖິ່ນ",
    tabVoiceChanger: "🎭 ປ່ຽນສຽງ",
    tabTranscribe: "🎙️ ປ່ຽນສຽງເປັນຂໍ້ຄວາມ",
    tabAudioModifier: "🎛️ ປັບ EQ & ຄວາມໄວ",
    tabSilenceRemover: "✂️ ຕັດຊ່ວງມິດງຽບ",
    tabInterp: "🔴 ລ່າມແປສຽງສົດ",

    generateVoice: "ສ້າງສຽງເວົ້າ",
    generatingVoice: "ກຳລັງສ້າງສຽງ...",
    downloadAudio: "ດາວໂຫລດ MP3",
    play: "ຫຼິ້ນ",
    pause: "ຢຸດຊົ່ວຄາວ",
    clear: "ລ້າງອອກ",
    copy: "ຄັດລອກ",
    copied: "ຄັດລອກແລ້ວ!",
    loadSample: "ໃສ່ຂໍ້ຄວາມຕົວຢ່າງ",
    saveHistory: "ບັນທຶກປະຫວັດ",
    share: "ແບ່ງປັນ",

    textInputPlaceholder: "ພິມຂໍ້ຄວາມທີ່ຕ້ອງການໃຫ້ເວົ້າຢູ່ນີ້ (ບໍ່ຈຳກັດຕົວອັກສອນ)...",
    voiceSelectLabel: "ເລືອກສຽງຄົນແທ້",
    speedLabel: "ຄວາມໄວສຽງ",
    pitchLabel: "ລະດັບສຽງ (Pitch)",
    bgmLabel: "ດົນຕີປະກອບ (BGM)",
    bgmVolumeLabel: "ຄວາມດັງ BGM",
    charCount: "ຈຳນວນຕົວອັກສອນ",

    translateTabTitle: "ລະບົບແປພາສາທົ່ວໂລກ & ສຽງເວົ້າສຳນຽງແທ້",
    translateTabDesc: "ແປພາສາທຸກປະເທດໃນອາຊີ ແລະ ທົ່ວໂລກຢ່າງຖືກຕ້ອງພ້ອມທັງເວົ້າອອກມາດ້ວຍສຽງສຳນຽງເຈົ້າຂອງພາສາແທ້ 100%.",
    sourceLangLabel: "ພາສາຕົ້ນທາງ:",
    targetLangLabel: "ປະເທດ / ພາສາປາຍທາງ:",
    targetVoiceLabel: "ສຽງເວົ້າເຈົ້າຂອງພາສາ:",
    translateBtn: "ແປຢ່າງຖືກຕ້ອງ ແລະ ເວົ້າສຽງອອກມາ",
    translatingBtn: "ກຳລັງແປ ແລະ ສ້າງສຽງ...",
    sourcePlaceholder: "ພິມຂໍ້ຄວາມທີ່ຕ້ອງການແປຢູ່ນີ້...",
    translationOutputTitle: "ຜົນການແປທີ່ຖືກຕ້ອງ & ສຽງເວົ້າທ້ອງຖິ່ນ",
    nativeAccentBadge: "ສຳນຽງແທ້ 100%",

    highLoadShield: "ມີລະບົບປ້ອງກັນຮອງຮັບຜູ້ໃຊ້ຈຳນວນຫຼາຍ (ບໍ່ມີຂໍ້ຜິດພາດ)",
    naturalVoiceNotice: "ຄຸນນະພາບສຽງສະຕູດີໂອມາດຕະຖານ",
    errorRetryNotice: "ລະບົບເຊື່ອມຕໍ່ໃໝ່ອັດຕະໂນມັດ"
  },

  vi: {
    appName: "VoiceMaster Studio",
    appBadge: "TTS Không Giới Hạn & Tạo Video",
    appDescription: "Chuyển văn bản thành giọng người thật Text-to-Speech (Không giới hạn ký tự) + Làm video YouTube/TikTok",
    autoHealActive: "Hệ thống tự phục hồi AI: Đang hoạt động",
    historyBtn: "Lịch sử",
    uiLangSelectorLabel: "Ngôn ngữ ứng dụng (Language)",
    
    tabTts: "Giọng người thật TTS",
    tabSubtitle: "🎬 Chèn phụ đề",
    tabImager: "🖼️ Tạo ảnh AI",
    tabAutoPipeline: "⚡ Video 1-Chạm",
    tabWriter: "AI Kể chuyện",
    tabHistory: "📂 Lịch sử tạo",
    tabDialogue: "💬 Đối thoại nhiều giọng",
    tabTranslator: "🌐 Dịch thuật & Giọng bản xứ",
    tabVoiceChanger: "🎭 Đổi tông giọng",
    tabTranscribe: "🎙️ Chuyển âm thanh thành văn bản",
    tabAudioModifier: "🎛️ Âm thanh EQ & Tốc độ",
    tabSilenceRemover: "✂️ Cắt khoảng lặng",
    tabInterp: "🔴 Phiên dịch trực tiếp",

    generateVoice: "Tạo giọng nói",
    generatingVoice: "Đang tạo âm thanh...",
    downloadAudio: "Tải xuống MP3",
    play: "Phát",
    pause: "Tạm dừng",
    clear: "Xóa",
    copy: "Sao chép",
    copied: "Đã sao chép!",
    loadSample: "Tải văn bản mẫu",
    saveHistory: "Lưu lịch sử",
    share: "Chia sẻ",

    textInputPlaceholder: "Nhập văn bản cần đọc tại đây (Hỗ trợ độ dài không giới hạn)...",
    voiceSelectLabel: "Chọn giọng người thật tự nhiên",
    speedLabel: "Tốc độ đọc",
    pitchLabel: "Cao độ giọng (Pitch)",
    bgmLabel: "Nhạc nền (BGM)",
    bgmVolumeLabel: "Âm lượng nhạc nền",
    charCount: "Số ký tự",

    translateTabTitle: "Bộ công cụ dịch thuật toàn cầu & Giọng đọc bản xứ",
    translateTabDesc: "Bản địa hóa chính xác cho mọi quốc gia Châu Á và quốc tế với 100% giọng đọc bản ngữ chuẩn xác.",
    sourceLangLabel: "Ngôn ngữ gốc:",
    targetLangLabel: "Quốc gia / Ngôn ngữ đích:",
    targetVoiceLabel: "Giọng đọc bản xứ chuẩn:",
    translateBtn: "Dịch chuẩn xác & Phát giọng nói",
    translatingBtn: "Đang dịch & Tạo giọng nói...",
    sourcePlaceholder: "Nhập văn bản cần dịch tại đây...",
    translationOutputTitle: "Bản dịch chính xác & Âm thanh bản xứ",
    nativeAccentBadge: "100% Giọng bản xứ chuẩn",

    highLoadShield: "Khiên bảo vệ tải cao kích hoạt (Dù đông người dùng vẫn ổn định, không lỗi)",
    naturalVoiceNotice: "Chuẩn âm thanh phòng thu chuyên nghiệp",
    errorRetryNotice: "Tự động phục hồi kết nối thông minh"
  },

  id: {
    appName: "VoiceMaster Studio",
    appBadge: "TTS Tanpa Batas & Mesin Cerita",
    appDescription: "Suara Manusia Asli Text-to-Speech (Karakter Tanpa Batas) + Generator Video Cerita YouTube/TikTok",
    autoHealActive: "Pemulihan Otomatis AI: Aktif",
    historyBtn: "Riwayat",
    uiLangSelectorLabel: "Bahasa Aplikasi (Language)",
    
    tabTts: "Suara Manusia TTS",
    tabSubtitle: "🎬 Pasang Subtitle",
    tabImager: "🖼️ Studio Gambar AI",
    tabAutoPipeline: "⚡ Video 1-Klik",
    tabWriter: "AI Pendongeng",
    tabHistory: "📂 Riwayat",
    tabDialogue: "💬 Percakapan Multi-Suara",
    tabTranslator: "🌐 Penerjemah & Suara Asli",
    tabVoiceChanger: "🎭 Pengubah Suara",
    tabTranscribe: "🎙️ Suara ke Teks",
    tabAudioModifier: "🎛️ EQ Audio & Kecepatan",
    tabSilenceRemover: "✂️ Pemotong Hening",
    tabInterp: "🔴 Penerjemah Langsung",

    generateVoice: "Buat Suara",
    generatingVoice: "Sedang membuat suara...",
    downloadAudio: "Unduh MP3",
    play: "Putar",
    pause: "Jeda",
    clear: "Hapus",
    copy: "Salin",
    copied: "Disalin!",
    loadSample: "Muat Contoh Teks",
    saveHistory: "Simpan ke Riwayat",
    share: "Bagikan",

    textInputPlaceholder: "Ketik teks di sini (Mendukung karakter tanpa batas)...",
    voiceSelectLabel: "Pilih Profil Suara Manusia Asli",
    speedLabel: "Kecepatan Bicara",
    pitchLabel: "Nada Suara (Pitch)",
    bgmLabel: "Musik Latar (BGM)",
    bgmVolumeLabel: "Volume BGM",
    charCount: "Jumlah Karakter",

    translateTabTitle: "Penerjemah Global & Suara Penutur Asli (Native)",
    translateTabDesc: "Terjemahkan dengan akurat ke seluruh negara Asia dan internasional dengan suara penutur asli 100%.",
    sourceLangLabel: "Bahasa Sumber:",
    targetLangLabel: "Negara / Bahasa Tujuan:",
    targetVoiceLabel: "Suara Penutur Asli:",
    translateBtn: "Terjemahkan Akurat & Bunyikan Suara",
    translatingBtn: "Sedang menerjemahkan & membuat suara...",
    sourcePlaceholder: "Ketik teks yang ingin diterjemahkan...",
    translationOutputTitle: "Hasil Terjemahan Akurat & Suara Asli",
    nativeAccentBadge: "100% Aksen Asli Terjamin",

    highLoadShield: "Pelindung Beban Konkurensi Tinggi Aktif (Bebas Error saat Ramai)",
    naturalVoiceNotice: "Mastering Akustik Standar Studio",
    errorRetryNotice: "Pemulihan Jaringan Cerdas Aktif"
  },

  es: {
    appName: "VoiceMaster Studio",
    appBadge: "TTS Ilimitado & Creador de Historias",
    appDescription: "Voz humana auténtica Text-to-Speech (Sin límite de caracteres) + Creador de videos para YouTube/TikTok",
    autoHealActive: "Auto-reparación IA: Activa",
    historyBtn: "Historial",
    uiLangSelectorLabel: "Idioma de la interfaz",
    
    tabTts: "Voz Humana TTS",
    tabSubtitle: "🎬 Incrustador de Subtítulos",
    tabImager: "🖼️ Generador de Imágenes IA",
    tabAutoPipeline: "⚡ Video en 1-Clic",
    tabWriter: "Guionista IA",
    tabHistory: "📂 Historial",
    tabDialogue: "💬 Diálogo Multi-Voz",
    tabTranslator: "🌐 Traductor & Voz Nativa",
    tabVoiceChanger: "🎭 Modulador de Voz",
    tabTranscribe: "🎙️ Voz a Texto",
    tabAudioModifier: "🎛️ EQ de Audio & Velocidad",
    tabSilenceRemover: "✂️ Eliminar Silencios",
    tabInterp: "🔴 Intérprete en Vivo",

    generateVoice: "Generar Voz",
    generatingVoice: "Sintetizando voz...",
    downloadAudio: "Descargar MP3",
    play: "Reproducir",
    pause: "Pausa",
    clear: "Limpiar",
    copy: "Copiar",
    copied: "¡Copiado!",
    loadSample: "Cargar texto de ejemplo",
    saveHistory: "Guardar en historial",
    share: "Compartir",

    textInputPlaceholder: "Escribe o pega tu texto aquí (Soporta caracteres ilimitados)...",
    voiceSelectLabel: "Seleccionar perfil de voz humana real",
    speedLabel: "Velocidad de habla",
    pitchLabel: "Tono de voz (Pitch)",
    bgmLabel: "Música de fondo (BGM)",
    bgmVolumeLabel: "Volumen de BGM",
    charCount: "Caracteres",

    translateTabTitle: "Suite de Traducción Global y Voces Nativas Auténticas",
    translateTabDesc: "Localización precisa para todos los países asiáticos y mundiales con voces 100% nativas humanas.",
    sourceLangLabel: "Idioma de origen:",
    targetLangLabel: "País / Idioma de destino:",
    targetVoiceLabel: "Voz hablada nativa:",
    translateBtn: "Traducir con precisión y sintetizar voz",
    translatingBtn: "Traduciendo y generando voz...",
    sourcePlaceholder: "Escribe el texto a traducir...",
    translationOutputTitle: "Traducción precisa y audio nativo",
    nativeAccentBadge: "100% Acento nativo garantizado",

    highLoadShield: "Escudo de alta concurrencia activo (Cero caídas y sin errores bajo alta demanda)",
    naturalVoiceNotice: "Masterización acústica de estudio profesional",
    errorRetryNotice: "Recuperación de red inteligente activa"
  },

  ru: {
    appName: "VoiceMaster Studio",
    appBadge: "Безлимитный TTS и Стори-Движок",
    appDescription: "Настоящий человеческий голос Text-to-Speech (без лимита символов) + Создание видео для YouTube/TikTok",
    autoHealActive: "Автовосстановление ИИ: Активно",
    historyBtn: "История",
    uiLangSelectorLabel: "Язык приложения (Language)",
    
    tabTts: "Живой голос TTS",
    tabSubtitle: "🎬 Вшивание субтитров",
    tabImager: "🖼️ Генерация картинок ИИ",
    tabAutoPipeline: "⚡ Видео в 1-клик",
    tabWriter: "ИИ-Сценарист",
    tabHistory: "📂 История записей",
    tabDialogue: "💬 Диалог нескольких голосов",
    tabTranslator: "🌐 Переводчик и нативная речь",
    tabVoiceChanger: "🎭 Изменение голоса",
    tabTranscribe: "🎙️ Распознавание речи",
    tabAudioModifier: "🎛️ Эквалайзер и скорость",
    tabSilenceRemover: "✂️ Удаление тишины",
    tabInterp: "🔴 Живой переводчик",

    generateVoice: "Сгенерировать голос",
    generatingVoice: "Идет генерация речи...",
    downloadAudio: "Скачать MP3",
    play: "Воспроизвести",
    pause: "Пауза",
    clear: "Очистить",
    copy: "Копировать",
    copied: "Скопировано!",
    loadSample: "Загрузить пример текста",
    saveHistory: "Сохранить в историю",
    share: "Поделиться",

    textInputPlaceholder: "Введите текст для озвучивания (поддерживается неограниченная длина)...",
    voiceSelectLabel: "Выберите профиль человеческого голоса",
    speedLabel: "Скорость речи",
    pitchLabel: "Высота тона (Pitch)",
    bgmLabel: "Фоновая музыка (BGM)",
    bgmVolumeLabel: "Громкость BGM",
    charCount: "Символов",

    translateTabTitle: "Глобальный переводчик и нативное произношение",
    translateTabDesc: "Точный перевод на языки всех стран Азии и мира с кристально чистым нативным произношением.",
    sourceLangLabel: "Исходный язык:",
    targetLangLabel: "Целевая страна / Язык:",
    targetVoiceLabel: "Нативный голос страны:",
    translateBtn: "Точно перевести и озвучить нативным голосом",
    translatingBtn: "Перевод и синтез речи...",
    sourcePlaceholder: "Введите текст для перевода...",
    translationOutputTitle: "Точный перевод и нативная аудиозапись",
    nativeAccentBadge: "100% Подлинный нативный акцент",

    highLoadShield: "Защита от высокой нагрузки активна (работа без сбоев при большом наплыве пользователей)",
    naturalVoiceNotice: "Студийный акустический мастеринг",
    errorRetryNotice: "Автоматическое переподключение сети"
  },

  ar: {
    appName: "VoiceMaster Studio",
    appBadge: "تحويل النص إلى صوت غير محدود",
    appDescription: "أصوات بشرية حقيقية لتحويل النص إلى صوت (بدون حد للحروف) + استوديو لإنشاء مقاطع الفيديو",
    autoHealActive: "نظام الإصلاح التلقائي: نشط",
    historyBtn: "السجل",
    uiLangSelectorLabel: "لغة التطبيق (Language)",
    
    tabTts: "صوت بشري TTS",
    tabSubtitle: "🎬 دمج الترجمة المرئية",
    tabImager: "🖼️ استوديو صور الذكاء الاصطناعي",
    tabAutoPipeline: "⚡ فيديو بنقرة واحدة",
    tabWriter: "كاتب القصص بالذكاء الاصطناعي",
    tabHistory: "📂 السجل",
    tabDialogue: "💬 محادثة متعددة الأصوات",
    tabTranslator: "🌐 ترجمة وصوت ناطق أصلي",
    tabVoiceChanger: "🎭 تغيير طبقة الصوت",
    tabTranscribe: "🎙️ تحويل الصوت إلى نص",
    tabAudioModifier: "🎛️ ضبط الصوت والسرعة",
    tabSilenceRemover: "✂️ إزالة فترات الصمت",
    tabInterp: "🔴 مترجم صوتي مباشر",

    generateVoice: "توليد الصوت",
    generatingVoice: "جارٍ توليد الصوت البشري...",
    downloadAudio: "تحميل MP3",
    play: "تشغيل",
    pause: "إيقاف مؤقت",
    clear: "مسح",
    copy: "نسخ",
    copied: "تم النسخ!",
    loadSample: "تحميل نص تجريبي",
    saveHistory: "حفظ في السجل",
    share: "مشاركة",

    textInputPlaceholder: "اكتب أو الصق النص هنا (يدعم نصوصاً طويلة بدون قيود)...",
    voiceSelectLabel: "اختر الصوت البشري المناسب",
    speedLabel: "سرعة القراءة",
    pitchLabel: "درجة الصوت (Pitch)",
    bgmLabel: "موسيقى الخلفية (BGM)",
    bgmVolumeLabel: "مستوى صوت الموسيقى",
    charCount: "عدد الأحرف",

    translateTabTitle: "نظام الترجمة العالمي وأصوات أصلية متقنة",
    translateTabDesc: "ترجمة دقيقة لجميع الدول الآسيوية والعالمية مع نطق بأصوات متحدثين أصليين بنسبة 100%.",
    sourceLangLabel: "اللغة الأصلية:",
    targetLangLabel: "الدولة / اللغة المستهدفة:",
    targetVoiceLabel: "صوت المتحدث الأصلي:",
    translateBtn: "ترجمة دقيقة ونطق بالصوت الأصلي",
    translatingBtn: "جارٍ الترجمة وتوليد الصوت...",
    sourcePlaceholder: "اكتب النص المراد ترجمته هنا...",
    translationOutputTitle: "نتيجة الترجمة الدقيقة والصوت الأصلي",
    nativeAccentBadge: "لهجة أصلية 100%",

    highLoadShield: "درع الحماية من ضغط المستخدمين نشط (خالٍ من الأخطاء أثناء الضغط العالي)",
    naturalVoiceNotice: "معالجة صوتية باحترافية الاستوديو",
    errorRetryNotice: "استعادة الاتصال التلقائية مفعلة"
  }
};
