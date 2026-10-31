import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Let's test Edge TTS with 1 chunk
async function test() {
  console.log('Testing Edge TTS...');
  const tts = new MsEdgeTTS();
  await tts.setMetadata('en-AU-WilliamMultilingualNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const text = 'မင်္ဂလာပါခင်ဗျာ။ နေကောင်းကြရဲ့လားခင်ဗျာ။ ဒီနေ့ ရာသီဥတုက အရမ်းသာယာနေပါတယ်။';
  const { audioStream } = await tts.toStream(text);
  const chunks = [];
  await new Promise((resolve, reject) => {
    audioStream.on('data', c => chunks.push(c));
    audioStream.on('end', resolve);
    audioStream.on('error', reject);
  });
  const buf = Buffer.concat(chunks);
  console.log('Synthesized test chunk bytes:', buf.length);
}

test().catch(console.error);
