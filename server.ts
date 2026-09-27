import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { Communicate, SubMaker } from 'edge-tts-universal';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Setup file upload destination in /tmp
const upload = multer({
  dest: '/tmp/uploads/',
  limits: { fileSize: 150 * 1024 * 1024 } // 150MB max
});

if (!fs.existsSync('/tmp/uploads')) {
  fs.mkdirSync('/tmp/uploads', { recursive: true });
}

// -------------------------------------------------------------------------------------
// Automatic Server Memory & Disk Garbage Cleaner (Prevents disk full / server freeze)
// -------------------------------------------------------------------------------------
function cleanOldTempFiles() {
  try {
    const tmpDirs = ['/tmp', '/tmp/uploads'];
    const now = Date.now();
    const maxAgeMs = 10 * 60 * 1000; // Delete temp files older than 10 minutes

    for (const dir of tmpDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file === 'yt-dlp') continue; // Preserve yt-dlp binary
        const filePath = path.join(dir, file);
        try {
          const stat = fs.statSync(filePath);
          if (stat.isFile() && (now - stat.mtimeMs > maxAgeMs)) {
            fs.unlinkSync(filePath);
          }
        } catch (_) {}
      }
    }
  } catch (err) {
    console.warn('Temp file cleanup warning:', err);
  }
}

// Clean every 5 minutes
cleanOldTempFiles();
setInterval(cleanOldTempFiles, 5 * 60 * 1000);

// Ensure yt-dlp binary is present in /tmp
let ytDlpPath: string | null = fs.existsSync('/tmp/yt-dlp') ? '/tmp/yt-dlp' : null;

async function ensureYtDlp(): Promise<string | null> {
  if (ytDlpPath && fs.existsSync(ytDlpPath)) return ytDlpPath;
  try {
    console.log('Downloading yt-dlp binary...');
    await execAsync('curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /tmp/yt-dlp && chmod +x /tmp/yt-dlp');
    ytDlpPath = '/tmp/yt-dlp';
    return ytDlpPath;
  } catch (err) {
    console.error('Failed to download yt-dlp:', err);
    return null;
  }
}
ensureYtDlp();

const ai = new GoogleGenAI({});

// High-fidelity Real Human Voices (100% Organic Natural Human Sound - Zero Robotic Artifacts)
export const SUPPORTED_VOICES = [
  {
    id: 'en-AU-WilliamMultilingualNeural',
    name: '🌟 ဝီလျံ (William - Pure Human Deep)',
    gender: 'Male',
    lang: 'Multilingual / Human Deep',
    desc: 'တည်ကြည်လေးနက်ပြီး အလွန်သဘာဝကျသော လူသားစစ်စစ် Deep Voice (လူကြိုက်အများဆုံး ဇာတ်လမ်းဖတ်အသံ)'
  },
  {
    id: 'ko-KR-HyunsuMultilingualNeural',
    name: '🌟 ဟျွန်းဆူ (Hyunsu - Multilingual Pure Human)',
    gender: 'Male',
    lang: 'Multilingual / Pure Human',
    desc: 'ဝီလျံကဲ့သို့ သဘာဝကျပြီး နွေးထွေးတည်ငြိမ်သော မျိုးဆက်သစ် လူသားစစ်စစ် အသံ'
  },
  {
    id: 'en-US-AndrewMultilingualNeural',
    name: '🎙️ အင်ဒရူး (Andrew - Human Storyteller)',
    gender: 'Male',
    lang: 'Multilingual / Storyteller',
    desc: 'ရုပ်ရှင်အသံထွက်ကဲ့သို့ သဘာဝကျပြီး သက်ဝင်လှုပ်ရှားသော လူသားစစ်စစ် Storyteller အသံ'
  },
  {
    id: 'en-US-ChristopherNeural',
    name: '🎙️ ခရစ်စတိုဖာ (Christopher - Deep Human Male)',
    gender: 'Male',
    lang: 'Multilingual / Deep Male',
    desc: 'ဩဇာပြည့်ဝပြီး ဇာတ်ကြောင်းပြောရန် အထူးကောင်းမွန်သော လူသားစစ်စစ် အမျိုးသားအသံ'
  },
  {
    id: 'en-US-BrianMultilingualNeural',
    name: '📻 ဘရိုင်ယန် (Brian - Podcast Human)',
    gender: 'Male',
    lang: 'Multilingual / Podcast Host',
    desc: 'အပြောစကား အပြန်အလှန် ပုံစံ၊ Podcast နှင့် ဗဟုသုတ ဝေမျှရန် သဘာဝအသံ'
  },
  {
    id: 'de-DE-FlorianMultilingualNeural',
    name: '🎬 ဖလိုရီယန် (Florian - Cinematic Deep)',
    gender: 'Male',
    lang: 'Multilingual / Deep Male',
    desc: 'ဩဇာပြည့်ဝသော ရုပ်ရှင်စတိုင် Deep Voice လူသားစစ်စစ်'
  },
  {
    id: 'it-IT-GiuseppeMultilingualNeural',
    name: '🏛️ ဂျူဆက်ပီ (Giuseppe - Classic Male)',
    gender: 'Male',
    lang: 'Multilingual / Warm Male',
    desc: 'နွေးထွေးလေးနက်သော လူလတ်ပိုင်း လူသားစစ်စစ် အမျိုးသားအသံ'
  },
  {
    id: 'fr-FR-RemyMultilingualNeural',
    name: '☕ ရီမီ (Remy - Warm Tone)',
    gender: 'Male',
    lang: 'Multilingual / Warm Voice',
    desc: 'နူးညံ့သိမ်မွေ့သော သဘာဝအသံ (စိတ်အေးချမ်းစေသော ဇာတ်လမ်းများအတွက်)'
  },
  {
    id: 'en-US-JennyNeural',
    name: '🌸 ဂျန်နီ (Jenny - Smooth Human Female)',
    gender: 'Female',
    lang: 'Multilingual / Smooth Female',
    desc: 'ကြည်လင်ချိုသာပြီး နားထောင်ရ အလွန်သဘာဝကျသော လူသားစစ်စစ် အမျိုးသမီးအသံ'
  },
  {
    id: 'en-US-AvaMultilingualNeural',
    name: '🌸 အေဗာ (Ava - Smooth Human Female)',
    gender: 'Female',
    lang: 'Multilingual / Narration',
    desc: 'သဘာဝကျပြီး နားထောင်ရ သက်တောင့်သက်သာရှိသော YouTube Narration အမျိုးသမီးအသံ'
  },
  {
    id: 'en-US-EmmaMultilingualNeural',
    name: '📖 အမ်မာ (Emma - Audiobook Female)',
    gender: 'Female',
    lang: 'Multilingual / Audiobook',
    desc: 'နူးညံ့ညင်သာသော ဇာတ်လမ်းဖတ်ပြ သဘာဝ အမျိုးသမီးအသံ'
  },
  {
    id: 'de-DE-SeraphinaMultilingualNeural',
    name: '✨ ဆာရာဖီနာ (Seraphina - Expressive Female)',
    gender: 'Female',
    lang: 'Multilingual / Clear Tone',
    desc: 'ကြည်လင်ပြတ်သားပြီး အသက်ဝင်သော သဘာဝ အမျိုးသမီးအသံစစ်စစ်'
  },
  {
    id: 'fr-FR-VivienneMultilingualNeural',
    name: '👑 ဗီဗီယန် (Vivienne - Elegant Female)',
    gender: 'Female',
    lang: 'Multilingual / Elegant Female',
    desc: 'ကြည်လင်ပျော့ပျောင်းသော တော်ဝင်စတိုင် အမျိုးသမီး သဘာဝအသံစစ်စစ်'
  },
  {
    id: 'pt-BR-ThalitaMultilingualNeural',
    name: '🌷 သာလီတာ (Thalita - Gentle Female)',
    gender: 'Female',
    lang: 'Multilingual / Soft Narrative',
    desc: 'ပျော့ပျောင်းငြိမ့်ညောင်းသော သဘာဝ အမျိုးသမီး ဇာတ်လမ်းပြောအသံ'
  }
];

// Supported Natural Background Music (BGM) Tracks
const SUPPORTED_BGM_TRACKS = [
  { id: 'none', name: 'BGM မထည့်ပါ (သီးသန့် လူအသံ)', category: 'none', volume: 0 },
  { id: 'horror', name: '👻 သရဲ / ထိတ်လန့်ဖွယ် သဘာဝအသံ (Spooky Ambient)', category: 'horror', file: 'horror.mp3', volume: 0.20 },
  { id: 'calm', name: '🌿 သဘာဝ အေးချမ်းဖွယ် သံစဉ် (Calm Nature & Piano)', category: 'calm', file: 'calm.mp3', volume: 0.18 },
  { id: 'inspiring', name: '✨ စိတ်ခွန်အားဖြည့် သံစဉ် (Inspiring Cinematic)', category: 'inspiring', file: 'inspiring.mp3', volume: 0.18 },
  { id: 'mystery', name: '🕵️ လျှို့ဝှက်ဆန်းကြယ် သံစဉ် (Mystery Suspense)', category: 'mystery', file: 'mystery.mp3', volume: 0.22 },
  { id: 'emotional', name: '🍂 ရင်နင့်ဖွယ် ဒရာမာ သံစဉ် (Emotional Drama)', category: 'emotional', file: 'emotional.mp3', volume: 0.18 },
];

function isValidHttpUrl(stringUrl: string): boolean {
  if (!stringUrl || typeof stringUrl !== 'string') return false;
  if (!/^https?:\/\//i.test(stringUrl.trim())) return false;
  try {
    const url = new URL(stringUrl.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// -------------------------------------------------------------------------------------
// 1. Text-To-Speech (TTS) + Unlimited Character Length Synthesis + Natural BGM Mixing
// -------------------------------------------------------------------------------------
app.get('/api/tts-voices', (_req: Request, res: Response) => {
  return res.json({ 
    voices: SUPPORTED_VOICES,
    bgmTracks: SUPPORTED_BGM_TRACKS
  });
});

app.post('/api/text-to-speech', async (req: Request, res: Response) => {
  const { text, voice = 'my-MM-ThihaNeural', rate = '+0%', pitch = '+0Hz', bgm = 'none', bgmVolume = 0.2, voiceEffect = 'none' } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'ကျေးဇူးပြု၍ စာသား ရိုက်ထည့်ပေးပါခင်ဗျာ။' });
  }

  const cleanText = text.trim();

  try {
    console.log(`Starting TTS with effect: ${voiceEffect}, voice: ${voice}, BGM: ${bgm}`);
    
    const synthesizeStream = async (txt: string, vName: string): Promise<Buffer> => {
      // Basic attempt loop
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const comm = new Communicate(txt, {
            voice: vName,
            rate: rate || '+0%',
            pitch: pitch || '+0Hz',
          });
          const parts: Buffer[] = [];
          
          // Use a timeout for the stream to prevent hanging
          const streamPromise = (async () => {
              for await (const chunk of comm.stream()) {
                if (chunk.type === 'audio' && chunk.data) {
                  parts.push(chunk.data);
                }
              }
              return Buffer.concat(parts);
          })();

          const buf = await Promise.race([
              streamPromise,
              new Promise<Buffer>((_, reject) => setTimeout(() => reject(new Error('TTS Stream Timeout')), 15000))
          ]);
          
          if (buf.length > 0) return buf;
          
          console.warn(`Attempt ${attempt} for voice ${vName} returned empty audio.`);
        } catch (err: any) {
          console.warn(`Attempt ${attempt} for voice ${vName} error:`, err.message || err);
        }
        await new Promise(r => setTimeout(r, 2000 * attempt));
      }
      return Buffer.alloc(0);
    };

    let audioBuffer: Buffer = Buffer.alloc(0);
    const voicesToTry = [voice, 'en-US-ChristopherNeural', 'en-AU-WilliamMultilingualNeural', 'my-MM-ThihaNeural'];

    // Try primary voice and fallbacks
    for (const vName of voicesToTry) {
      console.log(`Attempting synthesis with voice: ${vName}`);
      
      // Robust chunking: Split text into chunks of max 400 characters to prevent edge-tts timeouts or limits
      const chunks: string[] = [];
      let currentChunk = '';
      const words = cleanText.split(/\s+/);
      for (const word of words) {
        if ((currentChunk + ' ' + word).length > 400) {
          if (currentChunk.trim()) chunks.push(currentChunk.trim());
          currentChunk = word;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + word;
        }
      }
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      if (chunks.length === 0) chunks.push(cleanText);

      const audioChunks: Buffer[] = [];
      for (const chunk of chunks) {
        const sBuf = await synthesizeStream(chunk, vName);
        if (sBuf.length > 0) audioChunks.push(sBuf);
      }
      if (audioChunks.length > 0) {
        audioBuffer = Buffer.concat(audioChunks);
        break; // Success!
      }
    }

    if (audioBuffer.length === 0) throw new Error('Speech synthesis failed for all available voices.');

    // Apply Voice Effects
    if (voiceEffect !== 'none') {
      const tempIn = `/tmp/eff_in_${Date.now()}.mp3`;
      const tempOut = `/tmp/eff_out_${Date.now()}.mp3`;
      try {
        fs.writeFileSync(tempIn, audioBuffer);
        let audioFilter = '';
        if (voiceEffect === 'echo') audioFilter = 'aecho=0.8:0.88:60:0.4';
        else if (voiceEffect === 'deep') audioFilter = 'atempo=1.0,asetrate=24000*0.85,aresample=24000';
        else if (voiceEffect === 'radio') audioFilter = 'highpass=f=1000,lowpass=f=3000';
        
        if (audioFilter) {
          console.log(`Applying filter: ${audioFilter}`);
          await execAsync(`ffmpeg -y -i "${tempIn}" -af "${audioFilter}" "${tempOut}"`);
          if (fs.existsSync(tempOut)) {
            audioBuffer = fs.readFileSync(tempOut);
            console.log('Voice effect applied successfully.');
          } else {
            console.warn('Voice effect FFmpeg output file not found.');
          }
        }
      } catch (effErr) {
        console.error('Voice Effect application failed:', effErr);
      } finally {
        try { if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn); } catch (_) {}
        try { if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut); } catch (_) {}
      }
    }

    // 4. BGM Audio Mixing
    if (bgm && bgm !== 'none') {
      const selectedBgmTrack = SUPPORTED_BGM_TRACKS.find(b => b.id === bgm);
      if (selectedBgmTrack && selectedBgmTrack.file) {
        // Check public and dist folders
        let bgmFilePath = path.join(__dirname, 'public', 'bgm', selectedBgmTrack.file);
        if (!fs.existsSync(bgmFilePath)) {
          bgmFilePath = path.join(__dirname, 'dist', 'bgm', selectedBgmTrack.file);
        }

        if (fs.existsSync(bgmFilePath)) {
          const tempSpeechPath = `/tmp/speech_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.mp3`;
          const tempMixedPath = `/tmp/mixed_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.mp3`;
          try {
            fs.writeFileSync(tempSpeechPath, audioBuffer);
            // Crisp human voice (100%) + Solid pleasant BGM volume (~35%-40% gain)
            const userVol = typeof bgmVolume === 'number' ? bgmVolume : 0.25;
            const finalBgmVol = Math.max(0.15, Math.min(0.65, userVol * 1.6));
            
            const ffmpegMixCmd = `ffmpeg -y -i "${tempSpeechPath}" -stream_loop -1 -i "${bgmFilePath}" -filter_complex "[0:a]volume=1.0[speech];[1:a]volume=${finalBgmVol}[bgm];[speech][bgm]amix=inputs=2:duration=first:dropout_transition=0" -c:a libmp3lame -b:a 192k "${tempMixedPath}"`;
            
            await execAsync(ffmpegMixCmd);
            if (fs.existsSync(tempMixedPath)) {
              audioBuffer = fs.readFileSync(tempMixedPath);
              try { fs.unlinkSync(tempMixedPath); } catch (_) {}
            }
          } catch (mixErr) {
            console.warn('BGM Mixing failed, returning raw speech audio:', mixErr);
          } finally {
            try { if (fs.existsSync(tempSpeechPath)) fs.unlinkSync(tempSpeechPath); } catch (_) {}
          }
        } else {
          console.warn('BGM file not found at path:', bgmFilePath);
        }
      }
    }

    const base64Audio = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return res.json({
      success: true,
      audioUrl: audioDataUrl,
      audioBytes: audioBuffer.length,
      characterCount: cleanText.length,
      voiceUsed: voice,
      bgmUsed: bgm
    });
  } catch (err: any) {
    console.error('Edge TTS Error:', err?.message || err);
    return res.status(500).json({ 
      error: 'Text-to-Speech ပြုလုပ်ရာတွင် အသံဖမ်းယူမှု မအောင်မြင်ပါ။ စာသားတိုတိုဖြင့် သို့မဟုတ် အခြားအသံ ရွေးချယ်၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။' 
    });
  }
});

// -------------------------------------------------------------------------------------
// 1.5 Multi-Speaker Dialogue TTS (Up to 5 speakers talking back and forth)
// -------------------------------------------------------------------------------------
app.post('/api/multi-speaker-tts', async (req: Request, res: Response) => {
  const { dialogue, pauseDuration = 0.35 } = req.body;

  if (!dialogue || !Array.isArray(dialogue) || dialogue.length === 0) {
    return res.status(400).json({ error: 'ကျေးဇူးပြု၍ အနည်းဆုံး စကားပြော စာကြောင်း ၁ ကြောင်း ထည့်သွင်းပေးပါခင်ဗျာ။' });
  }

  try {
    console.log(`Starting Multi-Speaker Dialogue Synthesis for ${dialogue.length} dialogue lines...`);

    const synthesizeStream = async (txt: string, vName: string): Promise<Buffer> => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const comm = new Communicate(txt, { voice: vName });
          const parts: Buffer[] = [];
          for await (const chunk of comm.stream()) {
            if (chunk.type === 'audio' && chunk.data) {
              parts.push(chunk.data);
            }
          }
          const buf = Buffer.concat(parts);
          if (buf.length > 0) return buf;
        } catch (err) {
          console.warn(`Attempt ${attempt} for voice ${vName} error:`, err);
          await new Promise(r => setTimeout(r, 200 * attempt));
        }
      }
      return Buffer.alloc(0);
    };

    // Generate natural silence file
    const silencePath = `/tmp/silence_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.mp3`;
    const silenceTime = typeof pauseDuration === 'number' ? Math.max(0.1, Math.min(1.5, pauseDuration)) : 0.35;
    await execAsync(`ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t ${silenceTime} -c:a libmp3lame -b:a 192k "${silencePath}"`);

    const lineFiles: string[] = [];
    let totalChars = 0;
    const speakersUsedSet = new Set<string>();

    for (let i = 0; i < dialogue.length; i++) {
      const line = dialogue[i];
      const txt = (line.text || '').trim();
      const voice = line.voice || 'en-AU-WilliamMultilingualNeural';
      const speakerName = line.speakerName || `Speaker ${i + 1}`;

      if (!txt) continue;

      totalChars += txt.length;
      speakersUsedSet.add(speakerName);

      const buf = await synthesizeStream(txt, voice);
      if (buf.length > 0) {
        const lineFilePath = `/tmp/dlg_line_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}.mp3`;
        fs.writeFileSync(lineFilePath, buf);
        lineFiles.push(lineFilePath);

        // Add pause after line (except last line)
        if (i < dialogue.length - 1 && fs.existsSync(silencePath)) {
          lineFiles.push(silencePath);
        }
      }
    }

    if (lineFiles.length === 0) {
      throw new Error('No dialogue audio produced.');
    }

    // Stitch all line files together
    const concatListPath = `/tmp/concat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.txt`;
    const concatContent = lineFiles.map(f => `file '${f}'`).join('\n');
    fs.writeFileSync(concatListPath, concatContent);

    const mergedAudioPath = `/tmp/merged_dialogue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.mp3`;
    await execAsync(`ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c:a libmp3lame -b:a 192k "${mergedAudioPath}"`);

    let finalAudioBuffer: Buffer;
    if (fs.existsSync(mergedAudioPath)) {
      finalAudioBuffer = fs.readFileSync(mergedAudioPath);
    } else {
      throw new Error('Merging dialogue audio failed.');
    }

    // Cleanup temporary line files
    try {
      if (fs.existsSync(silencePath)) fs.unlinkSync(silencePath);
      if (fs.existsSync(concatListPath)) fs.unlinkSync(concatListPath);
      if (fs.existsSync(mergedAudioPath)) fs.unlinkSync(mergedAudioPath);
      for (const f of lineFiles) {
        if (f !== silencePath && fs.existsSync(f)) {
          try { fs.unlinkSync(f); } catch (_) {}
        }
      }
    } catch (_) {}

    const base64Audio = finalAudioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return res.json({
      success: true,
      audioUrl: audioDataUrl,
      audioBytes: finalAudioBuffer.length,
      characterCount: totalChars,
      dialogueCount: dialogue.length,
      speakersUsed: Array.from(speakersUsedSet)
    });
  } catch (err: any) {
    console.error('Multi-Speaker Dialogue Error:', err?.message || err);
    return res.status(500).json({
      error: 'အပြန်အလှန် စကားပြော အသံဖိုင် ဖန်တီးရာတွင် အမှားအယွင်း ရှိနေပါသည်။ ကျေးဇူးပြု၍ စာကြောင်းများကို ပြန်လည်စစ်ဆေး၍ အသစ်စမ်းသပ်ပေးပါခင်ဗျာ။'
    });
  }
});

// -------------------------------------------------------------------------------------
// 1.8 Audio to MP4 Video Visualizer (TikTok / Reels / Shorts Generator)
// -------------------------------------------------------------------------------------
app.post('/api/audio-to-video', async (req: Request, res: Response) => {
  const { 
    audioData, 
    titleText = 'VoiceMaster Studio', 
    subtitleText = '', 
    aspectRatio = '9:16', 
    theme = 'cyberpunk',
    waveStyle = 'cline',
    customWaveColor = '',
    waveYPercentage = 50,
    bgImageData = ''
  } = req.body;

  if (!audioData) {
    return res.status(400).json({ error: 'အသံဖိုင်ဒေတာ မပါဝင်ပါ။ ကျေးဇူးပြု၍ အသံဖိုင်ရွေးချယ်ပေးပါခင်ဗျာ။' });
  }

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 5);
  const inputAudioPath = `/tmp/video_in_${timestamp}_${randomId}.mp3`;
  const inputImagePath = `/tmp/video_bg_${timestamp}_${randomId}.png`;
  const outputVideoPath = `/tmp/video_out_${timestamp}_${randomId}.mp4`;

  try {
    // 1. Extract audio base64
    let base64Content = audioData;
    if (audioData.includes('base64,')) {
      base64Content = audioData.split('base64,')[1];
    }
    const audioBuffer = Buffer.from(base64Content, 'base64');
    fs.writeFileSync(inputAudioPath, audioBuffer);

    // 1.5 Extract image base64 if provided
    let hasCustomBg = false;
    if (bgImageData) {
      let imgBase64 = bgImageData;
      if (bgImageData.includes('base64,')) {
        imgBase64 = bgImageData.split('base64,')[1];
      }
      fs.writeFileSync(inputImagePath, Buffer.from(imgBase64, 'base64'));
      hasCustomBg = true;
    }

    // 2. Set dimensions according to aspect ratio (Ultra-optimized for full-length 5fps rendering to prevent OOM)
    let width = 360;
    let height = 640; // 9:16 vertical TikTok/Shorts
    if (aspectRatio === '16:9') {
      width = 640;
      height = 360;
    } else if (aspectRatio === '1:1') {
      width = 480;
      height = 480;
    }

    // 3. Theme colors
    let bgHex = '0x0f172a';
    let waveColors = '0x818cf8|0xc084fc';
    if (customWaveColor) {
      waveColors = customWaveColor;
    } else if (theme === 'indigo') {
      bgHex = '0x1e1b4b';
      waveColors = '0x6366f1|0x818cf8';
    } else if (theme === 'sunset') {
      bgHex = '0x2a0800';
      waveColors = '0xf97316|0xf43f5e';
    } else if (theme === 'emerald') {
      bgHex = '0x022c22';
      waveColors = '0x10b981|0x34d399';
    } else if (theme === 'dark') {
      bgHex = '0x09090b';
      waveColors = '0xa1a1aa|0xe4e4e7';
    }

    const waveW = Math.round(width * 0.85);
    const waveH = Math.round(height * 0.22);
    // Custom wave Y position based on percentage (0% top, 100% bottom, 50% middle)
    const waveY = Math.round((height * (waveYPercentage / 100)) - (waveH / 2));

    const cleanTitle = (titleText || '').replace(/['"\\]/g, '').slice(0, 50);
    const bgFilter = hasCustomBg 
      ? `[1:v]scale=${width}:${height},setsar=1[bg]`
      : `color=c=${bgHex}:s=${width}x${height}[bg]`;

    // Optimization: render showwaves at a tiny size (120x60 at 5fps) and scale up instantly using neighbor interpolation for 10x speedup
    const filterParts = [
      bgFilter,
      `[0:a]showwaves=r=5:s=120x60:mode=${waveStyle}:colors=${waveColors},scale=${waveW}:${waveH}:flags=neighbor[waves]`,
      `[bg][waves]overlay=(W-w)/2:${waveY}[v1]`
    ];

    if (cleanTitle) {
      filterParts.push(`[v1]drawtext=text='${cleanTitle}':fontcolor=white:fontsize=${Math.round(width * 0.05)}:x=(w-text_w)/2:y=${Math.round(height * 0.15)}[v]`);
    } else {
      filterParts.push(`[v1]copy[v]`);
    }

    const filterString = filterParts.join(';');
    const inputArgs = hasCustomBg ? `-i "${inputAudioPath}" -loop 1 -i "${inputImagePath}"` : `-i "${inputAudioPath}"`;
    const ffmpegCmd = `ffmpeg -y ${inputArgs} -t 60 -filter_complex "${filterString}" -map "[v]" -map 0:a -c:v libx264 -preset ultrafast -tune zerolatency -threads 0 -r 5 -pix_fmt yuv420p -shortest "${outputVideoPath}"`;

    try {
      await execAsync(ffmpegCmd);
    } catch (ffmpegErr) {
      console.warn('Primary Video Generation with text failed, falling back to clean visualizer without text overlay:', ffmpegErr);
      
      // Fallback filter without drawtext (Guaranteed to work on any system without fonts installed)
      const fallbackFilterParts = [
        bgFilter,
        `[0:a]showwaves=r=5:s=120x60:mode=${waveStyle}:colors=${waveColors},scale=${waveW}:${waveH}:flags=neighbor[waves]`,
        `[bg][waves]overlay=(W-w)/2:${waveY}[v]`
      ];
      const fallbackFilterString = fallbackFilterParts.join(';');
      const fallbackCmd = `ffmpeg -y ${inputArgs} -t 60 -filter_complex "${fallbackFilterString}" -map "[v]" -map 0:a -c:v libx264 -preset ultrafast -tune zerolatency -threads 0 -r 5 -pix_fmt yuv420p -shortest "${outputVideoPath}"`;
      
      await execAsync(fallbackCmd);
    }

    if (!fs.existsSync(outputVideoPath)) {
      throw new Error('Video generation failed to produce output file.');
    }

    const videoBuffer = fs.readFileSync(outputVideoPath);
    const videoBase64 = videoBuffer.toString('base64');
    const videoDataUrl = `data:video/mp4;base64,${videoBase64}`;

    return res.json({
      success: true,
      videoUrl: videoDataUrl,
      videoBytes: videoBuffer.length,
      aspectRatio,
      theme
    });
  } catch (err: any) {
    console.error('Audio to Video Visualizer Error:', err?.message || err);
    return res.status(500).json({
      error: 'MP4 ဗီဒီယို ဖန်တီးရာတွင် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။ ကျေးဇူးပြု၍ ပြန်လည် စမ်းသပ်ပေးပါခင်ဗျာ။'
    });
  } finally {
    try {
      if (fs.existsSync(inputAudioPath)) fs.unlinkSync(inputAudioPath);
      if (fs.existsSync(inputImagePath)) fs.unlinkSync(inputImagePath);
      if (fs.existsSync(outputVideoPath)) fs.unlinkSync(outputVideoPath);
    } catch (_) {}
  }
});

// -------------------------------------------------------------------------------------
// 2. Video Link / Upload -> Speech-To-Text (SRT) Transcription via Gemini AI
// -------------------------------------------------------------------------------------
async function transcribeAudioToSRT(audioFilePath: string, originalName: string, mimeType: string = 'audio/mp3') {
  console.log(`Starting AI transcription for: ${originalName} (${audioFilePath})`);

  const fileBuffer = fs.readFileSync(audioFilePath);
  const base64Audio = fileBuffer.toString('base64');
  const targetMime = mimeType.startsWith('video') ? 'video/mp4' : 'audio/mp3';

  const prompt = `You are a world-class professional subtitle generator and transcriber specializing in Burmese (Myanmar) and multilingual audio/video.
Your mission is to produce 100% faithful, word-by-word accurate subtitles matching exact speech timings.

Instructions:
1. Listen thoroughly to the entire media from the very first second to the last. Do not summarize or skip any parts, especially in long recordings.
2. Transcribe in authentic Unicode Myanmar script (if Burmese is spoken) or the actual spoken language. Ensure correct Burmese spelling and grammatical boundaries.
3. Every subtitle cue MUST have precise start and end timestamps in standard SRT time format: "HH:MM:SS,mmm" (e.g. 00:01:23,450).
4. Synchronize each line tightly with the speaker's vocal pace (typically 2 to 6 seconds per subtitle line, containing 1 natural spoken clause).
5. Output structured JSON matching the schema.

Schema:
{
  "detectedLanguage": "string (e.g. Myanmar, English, etc.)",
  "fullTranscript": "string (continuous complete transcript)",
  "subtitles": [
    {
      "index": 1,
      "startTime": "00:00:01,200",
      "endTime": "00:00:04,500",
      "text": "spoken phrase"
    }
  ]
}`;

  const audioPart = {
    inlineData: {
      mimeType: targetMime,
      data: base64Audio,
    },
  };

  let response = null;
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  for (const m of modelsToTry) {
    try {
      response = await ai.models.generateContent({
        model: m,
        contents: [
          {
            role: 'user',
            parts: [
              audioPart,
              { text: prompt }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });
      if (response && response.text) break;
    } catch (modelErr: any) {
      console.warn(`Model ${m} failed, trying fallback:`, modelErr?.message || modelErr);
    }
  }

  if (!response || !response.text) {
    throw new Error('AI transcription service temporarily unavailable.');
  }

  let parsedData = null;
  try {
    const text = response.text || '{}';
    parsedData = JSON.parse(text);
  } catch (err) {
    console.error('JSON parse error from Gemini:', err, response.text);
    throw new Error('AI output format error');
  }

  let srtContent = '';
  if (Array.isArray(parsedData.subtitles)) {
    srtContent = parsedData.subtitles
      .map((item: any, i: number) => {
        const idx = item.index || (i + 1);
        const start = item.startTime || '00:00:00,000';
        const end = item.endTime || '00:00:02,000';
        const txt = item.text || '';
        return `${idx}\n${start} --> ${end}\n${txt}\n`;
      })
      .join('\n');
  }

  return {
    language: parsedData.detectedLanguage || 'Auto-detected',
    transcript: parsedData.fullTranscript || '',
    subtitles: parsedData.subtitles || [],
    srt: srtContent
  };
}

// =====================================================================================
// AI Story & Video Script Generator (Generates full, rich, long 7,000-character scripts)
// =====================================================================================
app.post('/api/generate-story-script', async (req: Request, res: Response) => {
  const { topic, genre = 'horror', duration = '5min', template = 'none' } = req.body;
  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'ဇာတ်လမ်း သို့မဟုတ် ခေါင်းစဉ်ကို ထည့်သွင်းပေးပါခင်ဗျာ။' });
  }

  try {
    let totalTargetChars = 7500;
    let partTargetChars = 3750;
    let minutesLabel = '၅ မိနစ် (စာလုံးရေ ၇,၅၀၀ ခန့်)';

    if (duration === '3min') {
      totalTargetChars = 4500;
      partTargetChars = 2250;
      minutesLabel = '၃ မိနစ် (စာလုံးရေ ၄,၅၀၀ ခန့်)';
    } else if (duration === '5min') {
      totalTargetChars = 7500;
      partTargetChars = 3750;
      minutesLabel = '၅ မိနစ် (စာလုံးရေ ၇,၅၀၀ ခန့်)';
    } else if (duration === '6min') {
      totalTargetChars = 9000;
      partTargetChars = 4500;
      minutesLabel = '၆ မိနစ် (စာလုံးရေ ၉,၀၀၀ ခန့်)';
    } else if (duration === '8min') {
      totalTargetChars = 12000;
      partTargetChars = 6000;
      minutesLabel = '၈ မိနစ် (စာလုံးရေ ၁၂,၀၀၀ ခန့်)';
    } else if (duration === '10min') {
      totalTargetChars = 15000;
      partTargetChars = 7500;
      minutesLabel = '၁၀ မိနစ် (စာလုံးရေ ၁၅,၀၀၀ ခန့်)';
    }

    let templateInstruction = '';
    if (template === 'news') templateInstruction = 'Write this in a Professional News Anchor report style (သတင်းတင်ဆက်မှု ပုံစံမျိုးဖြင့် ရေးသားပါ)။';
    else if (template === 'tiktok') templateInstruction = 'Write this in a Viral Short-form Content style, punchy sentences, high energy (TikTok/Reels စတိုင်မျိုးဖြင့် လိုတိုရှင်း ရေးသားပါ)။';
    else if (template === 'documentary') templateInstruction = 'Write this in a Deep Documentary Narrator style, informative and calm (မှတ်တမ်းတင် တင်ဆက်သူ ပုံစံမျိုးဖြင့် ရေးသားပါ)။';
    else if (template === 'health') templateInstruction = 'Write this in an Informative Health & Wellness advice style (ကျန်းမာရေး ဗဟုသုတ ပေးသည့် ပုံစံမျိုးဖြင့် ရေးသားပါ)။';

    console.log(`Starting Pro Script Generation for topic: "${topic}" (${genre}) Template: ${template}...`);

    // Part 1: Act 1 & Act 2
    const promptPart1 = `You are an acclaimed master novelist, film screenwriter, and viral storyteller in Myanmar.
The user wants an EXTREMELY IMMERSIVE storytelling script in natural spoken Burmese Unicode (မြန်မာစကားပြော လေသံစစ်စစ်).
${templateInstruction}

Topic/Theme: "${topic.trim()}"
Genre: "${genre}"

INSTRUCTIONS FOR PART 1:
- Write Part 1 covering the introduction and rising action.
- IMPORTANT: You MUST write exactly or at least ${partTargetChars} Myanmar Unicode characters for this Part 1!
- Respond strictly in valid JSON:
{
  "title": "string (Creative Myanmar Title)",
  "category": "string",
  "part1Text": "string (long spoken Burmese story text)"
}`;

    let resPart1: any = null;
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    for (const m of modelsToTry) {
      try {
        resPart1 = await ai.models.generateContent({
          model: m,
          contents: promptPart1,
          config: {
            responseMimeType: 'application/json',
            maxOutputTokens: 8192
          }
        });
        if (resPart1 && resPart1.text) break;
      } catch (err: any) {
        console.warn(`Part 1 generation failed with ${m}:`, err?.message || err);
      }
    }

    if (!resPart1 || !resPart1.text) {
      throw new Error('AI script generation failed. Please try again.');
    }

    const dataPart1 = JSON.parse(resPart1.text);
    const storyTitle = dataPart1.title || topic;
    const part1Story = dataPart1.part1Text || '';

    // Part 2: Act 3 & Act 4 (Climax, intense revelation, emotional escape/aftermath, memorable conclusion)
    const promptPart2 = `You are continuing the master storytelling script: "${storyTitle}".
Here is the previous narrative (Part 1):
${part1Story.slice(-1200)}

INSTRUCTIONS FOR PART 2:
- Write Part 2 covering Act 3 (Shocking climax, revelation of the true mystery, intense heart-pounding moments) and Act 4 (Emotional aftermath, realization, memorable lesson/conclusion).
- IMPORTANT: You MUST write exactly or at least ${partTargetChars} Myanmar Unicode characters for this Part 2 so the grand total reaches exactly ${totalTargetChars} characters (~${duration} runtime)!
- Continue smoothly from Part 1.
- Do NOT include bracketed directions like [Music] or [Ending].

Respond strictly in valid JSON:
{
  "part2Text": "string (continuation spoken Burmese story text of exactly ${partTargetChars} characters)"
}`;

    let resPart2: any = null;
    for (const m of modelsToTry) {
      try {
        resPart2 = await ai.models.generateContent({
          model: m,
          contents: promptPart2,
          config: {
            responseMimeType: 'application/json',
            maxOutputTokens: 8192
          }
        });
        if (resPart2 && resPart2.text) break;
      } catch (err: any) {
        console.warn(`Part 2 generation failed with ${m}:`, err?.message || err);
      }
    }

    let fullNarration = part1Story;
    if (resPart2 && resPart2.text) {
      try {
        const dataPart2 = JSON.parse(resPart2.text);
        if (dataPart2.part2Text) {
          fullNarration = `${part1Story.trim()}\n\n${dataPart2.part2Text.trim()}`;
        }
      } catch (_) {}
    }

    console.log(`Generated story successfully! Total characters: ${fullNarration.length}`);

    return res.json({
      success: true,
      title: storyTitle,
      category: dataPart1.category || genre,
      wordCount: fullNarration.length,
      estimatedMinutes: minutesLabel,
      script: fullNarration
    });
  } catch (error: any) {
    console.error('Script generation error:', error);
    const errStr = error?.message || String(error);
    if (errStr.includes('quota') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('rate-limit')) {
      return res.status(429).json({ error: 'AI Quota အသုံးပြုမှု ခေတ္တပြည့်သွားပါသည် (Rate Limit Exceeded)။ ကျေးဇူးပြု၍ ခေတ္တစောင့်ပြီး (၁ မိနစ်ခန့်အကြာ) ထပ်မံကြိုးစားပေးပါခင်ဗျာ။' });
    }
    return res.status(500).json({ error: errStr || 'ဇာတ်ညွှန်းဖန်တီးရာတွင် အမှားဖြစ်ပေါ်သွားပါသည်။ နောက်တစ်ကြိမ် ထပ်မံကြိုးစားပေးပါ။' });
  }
});

// -------------------------------------------------------------------------------------
// AI Story Scene Storyboard Prompt Generator (Lightning-fast cinematic prompts)
// -------------------------------------------------------------------------------------
app.post('/api/generate-story-images', async (req: Request, res: Response) => {
  const { title, script, genre = 'horror' } = req.body;
  if (!script) {
    return res.status(400).json({ error: 'No script provided' });
  }

  try {
    const promptExtractor = `You are a professional film storyboard artist.
Based on the story "${title}", create 4 cinematic visual scene descriptions in English for AI image generation. Each scene: (1. Opening, 2. Rising Action, 3. Climax, 4. Resolution).
Match "${genre}" mood.

Respond strictly in valid JSON:
{
  "scenes": [
    { "sceneNumber": 1, "title": "Opening", "visualPrompt": "English prompt...", "mood": "mood" },
    { "sceneNumber": 2, "title": "Rising Action", "visualPrompt": "English prompt...", "mood": "mood" },
    { "sceneNumber": 3, "title": "Climax", "visualPrompt": "English prompt...", "mood": "mood" },
    { "sceneNumber": 4, "title": "Resolution", "visualPrompt": "English prompt...", "mood": "mood" }
  ]
}`;

    const resExtraction = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptExtractor,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(resExtraction.text || '{}');
    const scenePrompts = parsed.scenes || [];
    
    // Actually generate the images for each scene
    const scenesWithImages = await Promise.all(scenePrompts.map(async (scene: any) => {
      try {
        const imgRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: `${scene.visualPrompt}, cinematic lighting, photorealistic, 8k resolution, cinematic atmosphere` }]
          },
          config: {
            imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
          }
        });

        let imageUrl = '';
        if (imgRes.candidates?.[0]?.content?.parts) {
          for (const part of imgRes.candidates[0].content.parts) {
            if (part.inlineData) {
              imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        }
        return { ...scene, imageUrl };
      } catch (e) {
        console.warn(`Failed to generate image for scene ${scene.sceneNumber}:`, e);
        return { ...scene, imageUrl: '' };
      }
    }));

    return res.json({
      success: true,
      scenes: scenesWithImages
    });
  } catch (err: any) {
    console.error('Story Image Generation Error:', err);
    return res.status(500).json({ error: 'AI ဇာတ်ကွက် နှင့် ရုပ်ပုံများ ဖန်တီးရာတွင် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။' });
  }
});

// -------------------------------------------------------------------------------------
// Direct AI Story Video Generator (Combines AI Image + Audio + Waveform into MP4 directly)
// -------------------------------------------------------------------------------------
app.post('/api/generate-story-video', async (req: Request, res: Response) => {
  const { 
    title, 
    script, 
    genre = 'horror', 
    voice = 'my-MM-ThihaNeural', 
    waveYPercentage = 62.5, 
    bgImageData = '', 
    allSceneImages = [], // New: Array of all generated scene images
    enableSubtitles = false,
    voiceEffect = 'none' // New: 'none' | 'echo' | 'deep' | 'radio'
  } = req.body;

  if (!script) {
    return res.status(400).json({ error: 'No script provided' });
  }

  const timestamp = Date.now();
  const audioPath = path.join(os.tmpdir(), `story_audio_${timestamp}.mp3`);
  const finalAudioPath = path.join(os.tmpdir(), `story_audio_effect_${timestamp}.mp3`);
  const videoPath = path.join(os.tmpdir(), `story_video_${timestamp}.mp4`);
  
  // Array to store temp image paths
  const imagePaths: string[] = [];

  try {
    console.log(`Generating AI Story Video (Pro) for "${title}"...`);

    // 1. Synthesize audio
    const comm = new Communicate(script, { voice, rate: '+0%', pitch: '+0Hz' });
    const audioParts: Buffer[] = [];
    for await (const chunk of comm.stream()) {
      if (chunk.type === 'audio' && chunk.data) audioParts.push(chunk.data);
    }
    const audioBuf = Buffer.concat(audioParts);
    if (audioBuf.length === 0) throw new Error('Audio synthesis failed.');
    fs.writeFileSync(audioPath, audioBuf);

    // Apply Voice Effects if selected
    let audioFilter = '';
    if (voiceEffect === 'echo') audioFilter = 'aecho=0.8:0.88:60:0.4';
    else if (voiceEffect === 'deep') audioFilter = 'atempo=1.0,asetrate=24000*0.85,aresample=24000';
    else if (voiceEffect === 'radio') audioFilter = 'highpass=f=1000,lowpass=f=3000';

    if (audioFilter) {
      await execAsync(`ffmpeg -y -i "${audioPath}" -af "${audioFilter}" "${finalAudioPath}"`);
    } else {
      fs.copyFileSync(audioPath, finalAudioPath);
    }

    // 2. Prepare Background Image (Use bgImageData or generate one)
    let bgImagePath = path.join(os.tmpdir(), `story_bg_${timestamp}.png`);
    let imageGenerated = false;

    if (bgImageData && bgImageData.startsWith('data:image')) {
        const base64Data = bgImageData.split('base64,')[1];
        fs.writeFileSync(bgImagePath, Buffer.from(base64Data, 'base64'));
        imageGenerated = true;
    }

    // Generate if not provided or failed
    if (!imageGenerated) {
      try {
        const imgRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: { parts: [{ text: `Cinematic background for story "${title}", ${genre} mood, photorealistic, 8k, 9:16 vertical` }] },
          config: { imageConfig: { aspectRatio: "9:16", imageSize: "1K" } }
        });
        if (imgRes.candidates?.[0]?.content?.parts) {
          for (const part of imgRes.candidates[0].content.parts) {
            if (part.inlineData) {
              fs.writeFileSync(bgImagePath, Buffer.from(part.inlineData.data, 'base64'));
              imageGenerated = true;
              break;
            }
          }
        }
      } catch (e) { console.warn('Gemini image failed:', e); }
    }

    // 3. Get Audio Duration (simplified)
    const { stdout: durationOut } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${finalAudioPath}"`);
    const totalDuration = parseFloat(durationOut.trim()) || 10;

    // 4. Build FFmpeg Filter Complex for Slideshow + Waveform + (Optional) Subtitles
    let waveColors = '0x818cf8|0xc084fc';
    if (genre === 'horror') waveColors = '0xf97316|0xf43f5e';
    else if (genre === 'motivation') waveColors = '0x10b981|0x34d399';

    const width = 360;
    const height = 640;
    const waveW = 300;
    const waveH = 120;
    const waveY = Math.round((height * (waveYPercentage / 100)) - (waveH / 2));
    const cleanTitle = title.replace(/['"\\]/g, '').slice(0, 40);

    // Single-input argument for image
    const inputArgs = `-loop 1 -i "${bgImagePath}"`;
    
    // Audio is the 2nd input (index 1)
    const audioIdx = 1;
    
    const filterParts = [
      `[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1[bg]`,
      `[${audioIdx}:a]showwaves=r=5:s=120x60:mode=cline:colors=${waveColors},scale=${waveW}:${waveH}:flags=neighbor[waves]`,
      `[bg][waves]overlay=(W-w)/2:${waveY}[v_base]`
    ];

    // Subtitles Logic with character-length proportion timing
    let lastV = 'v_base';
    if (enableSubtitles) {
      const words = script.split(/\s+/);
      const chunkSize = 6;
      const rawChunks: string[] = [];
      for (let i = 0; i < words.length; i += chunkSize) rawChunks.push(words.slice(i, i + chunkSize).join(' '));
      
      const totalChars = rawChunks.reduce((acc, c) => acc + c.length, 0) || 1;
      let currentTime = 0;

      rawChunks.forEach((chunk, idx) => {
        const proportion = chunk.length / totalChars;
        const chunkDuration = Math.max(1.0, totalDuration * proportion);
        const start = currentTime.toFixed(2);
        const end = (currentTime + chunkDuration).toFixed(2);
        currentTime += chunkDuration;

        // Properly escape special characters for FFmpeg drawtext filter
        const cleanChunk = chunk
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "'\\''")
          .replace(/:/g, '\\:')
          .replace(/%/g, '\\%');

        const nextV = `v_sub_${idx}`;
        filterParts.push(`[${lastV}]drawtext=text='${cleanChunk}':fontcolor=white:fontsize=18:x=(w-text_w)/2:y=h-120:box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,${start},${end})'[${nextV}]`);
        lastV = nextV;
      });
    }

    // Properly escape title for FFmpeg
    const escapedTitle = cleanTitle
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "'\\''")
      .replace(/:/g, '\\:')
      .replace(/%/g, '\\%');

    // Add Title Overlay at the top
    filterParts.push(`[${lastV}]drawtext=text='${escapedTitle}':fontcolor=white:fontsize=22:x=(w-text_w)/2:y=80:shadowcolor=black:shadowx=2:shadowy=2[v_final]`);

    const filterString = filterParts.join(';');
    const ffmpegCmd = `ffmpeg -y ${inputArgs} -i "${finalAudioPath}" -filter_complex "${filterString}" -map "[v_final]" -map ${audioIdx}:a -c:v libx264 -preset ultrafast -r 5 -pix_fmt yuv420p -shortest "${videoPath}"`;

    await execAsync(ffmpegCmd);

    if (!fs.existsSync(videoPath)) throw new Error('Video file not produced.');

    const videoBuf = fs.readFileSync(videoPath);
    const videoBase64 = `data:video/mp4;base64,${videoBuf.toString('base64')}`;

    // Cleanup
    [audioPath, finalAudioPath, videoPath, bgImagePath].forEach(p => {
      try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (_) {}
    });

    return res.json({ success: true, title, videoUrl: videoBase64 });
  } catch (err: any) {
    console.error('Pro Video Generation Error:', err);
    [audioPath, finalAudioPath, videoPath, ...imagePaths].forEach(p => {
      try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (_) {}
    });
    return res.status(500).json({ error: err.message || 'ဗီဒီယိုဖန်တီးမှု မအောင်မြင်ပါ။' });
  }
});

// Upload Media File -> Speech-to-SRT
app.post('/api/transcribe-upload', upload.single('mediaFile'), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No media file was uploaded.' });
  }

  const tempPath = file.path;
  const originalName = file.originalname || 'uploaded_media';
  const audioExtractPath = `${tempPath}_extracted.mp3`;

  try {
    let finalAudioPath = tempPath;
    let finalMime = file.mimetype;

    if (file.mimetype.startsWith('video') || file.originalname.endsWith('.mp4') || file.originalname.endsWith('.mkv')) {
      try {
        await execAsync(`ffmpeg -y -i "${tempPath}" -vn -ar 24000 -ac 1 -b:a 64k "${audioExtractPath}"`);
        if (fs.existsSync(audioExtractPath)) {
          finalAudioPath = audioExtractPath;
          finalMime = 'audio/mp3';
        }
      } catch (ffErr) {
        console.warn('ffmpeg extraction fallback to direct file:', ffErr);
      }
    }

    const result = await transcribeAudioToSRT(finalAudioPath, originalName, finalMime);

    return res.json({
      success: true,
      title: originalName,
      language: result.language,
      transcript: result.transcript,
      subtitles: result.subtitles,
      srt: result.srt
    });
  } catch (err: any) {
    console.error('Transcription upload error:', err);
    return res.status(500).json({ 
      error: 'Failed to transcribe audio. Please make sure the audio contains audible speech.' 
    });
  } finally {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      if (fs.existsSync(audioExtractPath)) fs.unlinkSync(audioExtractPath);
    } catch (_) {}
  }
});

// Video Link (YouTube, TikTok, Facebook) -> Speech-to-SRT
app.post('/api/transcribe-url', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || !isValidHttpUrl(url)) {
    return res.status(400).json({ error: 'Please provide a valid video link (YouTube, TikTok, Facebook, etc).' });
  }

  const timestamp = Date.now();
  const targetAudioPath = `/tmp/link_audio_${timestamp}.mp3`;

  try {
    await ensureYtDlp();

    console.log(`Extracting audio from URL: ${url}`);
    const cmd = `/tmp/yt-dlp --no-warnings --no-playlist -x --audio-format mp3 -o "${targetAudioPath}" "${url}"`;
    await execAsync(cmd, { timeout: 120000 });

    if (!fs.existsSync(targetAudioPath)) {
      const altPath = targetAudioPath.endsWith('.mp3') ? targetAudioPath : `${targetAudioPath}.mp3`;
      if (!fs.existsSync(altPath)) {
        throw new Error('Audio extraction failed from the provided URL.');
      }
    }

    const actualPath = fs.existsSync(targetAudioPath) ? targetAudioPath : `${targetAudioPath}.mp3`;
    const result = await transcribeAudioToSRT(actualPath, url, 'audio/mp3');

    return res.json({
      success: true,
      url,
      language: result.language,
      transcript: result.transcript,
      subtitles: result.subtitles,
      srt: result.srt
    });
  } catch (err: any) {
    console.error('URL Transcription error:', err);
    return res.status(400).json({ 
      error: 'ဤ Video Link မှ အသံကို ဆာဗာက တိုက်ရိုက်ဆွဲယူ၍ မရနိုင်ပါ။ အောက်ပါ "ဖိုင် တိုက်ရိုက် Upload တင်မည်" ခလုတ်ကို နှိပ်ပြီး မိမိဖုန်းထဲရှိ Video/Audio ဖိုင်ကို ရွေးချယ်ပေးပါက SRT စာတန်းထိုး တိကျစွာ ချက်ချင်းရရှိပါမည်။' 
    });
  } finally {
    try {
      if (fs.existsSync(targetAudioPath)) fs.unlinkSync(targetAudioPath);
    } catch (_) {}
  }
});

// Download Subtitle
app.post('/api/download-subtitles', (req: Request, res: Response) => {
  const { content, filename = 'subtitles', format = 'srt' } = req.body;
  if (!content) {
    return res.status(400).send('No subtitle content provided');
  }

  const safeName = filename.replace(/[^\w\s-]/gi, '').trim() || 'subtitles';
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}.${format}"`);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.send(content);
});

// -------------------------------------------------------------------------------------
// Standalone AI Image Generator
// -------------------------------------------------------------------------------------
app.post('/api/generate-standalone-image', async (req: Request, res: Response) => {
  const { prompt, aspectRatio = '9:16', style = 'cinematic' } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Please provide a prompt.' });
  }

  try {
    const fullPrompt = `${prompt}, ${style} style, high quality, 8k resolution, detailed texture, masterfully composed`;
    
    const imgRes = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: fullPrompt }]
      },
      config: {
        imageConfig: { 
          aspectRatio: aspectRatio as any, 
          imageSize: "1K" 
        }
      }
    });

    let imageUrl = '';
    if (imgRes.candidates?.[0]?.content?.parts) {
      for (const part of imgRes.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error('Failed to generate image data.');
    }

    return res.json({
      success: true,
      imageUrl
    });
  } catch (err: any) {
    console.error('Image Generation Error:', err);
    return res.status(500).json({ error: 'AI ရုပ်ပုံ ဖန်တီးရာတွင် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။' });
  }
});

// Static assets / SPA setup
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
