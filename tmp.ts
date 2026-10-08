          model: m,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { 
            responseMimeType: 'application/json',
            maxOutputTokens: 8192
          }
        });
        if (geminiRes && geminiRes.text) {
          const parsed = safeJsonParse(geminiRes.text);
          if (parsed && parsed.title && parsed.script) {
            scriptData = parsed;
            break;
          }
        }
      } catch (genErr) {
        console.warn(`[Auto Pipeline ${reqId}] Model ${m} fallback:`, genErr);
      }
    }

    // Auto-expansion loop for long / epic 10-minute durations if script needs extension
    if ((targetDuration === 'epic' || targetDuration === 'long' || targetDuration === 'medium') && scriptData.script.length < 2500) {
      try {
        const extendPrompt = `Expand and complete the following Burmese story script into an extremely detailed, full-length narrative story script.
Title: ${scriptData.title}
Current Beginning:
"${scriptData.script}"

INSTRUCTIONS:
Write a full, continuous, rich narrative in natural spoken Burmese. Include vivid atmosphere, character interactions, dramatic suspense, plot twists, and a complete powerful conclusion.

Output JSON:
{
  "extendedScript": "The complete combined long narrative script containing the entire story from beginning to the grand conclusion"
}`;
        for (const m of pipelineModels) {
          try {
            const extRes = await ai.models.generateContent({
              model: m,
              contents: [{ role: 'user', parts: [{ text: extendPrompt }] }],
              config: { responseMimeType: 'application/json', maxOutputTokens: 8192 }
            });
            if (extRes && extRes.text) {
              const parsedExt = safeJsonParse(extRes.text);
              if (parsedExt && parsedExt.extendedScript && parsedExt.extendedScript.length > scriptData.script.length) {
                scriptData.script = parsedExt.extendedScript;
                break;
              }
            }
          } catch (_) {}
        }
      } catch (_) {}
    }

    // Step 2: High-Speed Parallel Speech Synthesis for the Script
    const cleanScript = scriptData.script.replace(/[\*\#\_\[\]]/g, '').trim();
    
    // Chunk script into 350-character blocks for parallel TTS synthesis
    const chunks: string[] = [];
    let currentChunk = '';
    const words = cleanScript.split(/\s+/);
    for (const word of words) {
      if ((currentChunk + ' ' + word).length > 350) {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + word;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    if (chunks.length === 0) chunks.push(cleanScript);

    const synthesizeChunk = async (txt: string): Promise<Buffer> => {
      const voicesToTry = [voice, 'en-AU-WilliamMultilingualNeural', 'en-US-AndrewMultilingualNeural', 'en-US-AvaMultilingualNeural'];
      for (const v of voicesToTry) {
        try {
          const comm = new Communicate(txt, { voice: v });
          const parts: Buffer[] = [];
          for await (const chunk of comm.stream()) {
            if (chunk.type === 'audio' && chunk.data) parts.push(chunk.data);
          }
          const buf = Buffer.concat(parts);
          if (buf.length > 50) return buf;
        } catch (_) {}
      }
      try {
        const enc = encodeURIComponent(txt.slice(0, 180));
        const gRes = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${enc}&tl=en&client=tw-ob`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (gRes.ok) return Buffer.from(await gRes.arrayBuffer());
      } catch (_) {}
      return Buffer.alloc(0);
    };

    const audioChunkResults = await runWithConcurrency(chunks, synthesizeChunk, 4);
    const validAudioChunks = audioChunkResults.filter(b => b && b.length > 0);
    let audioBuffer = Buffer.concat(validAudioChunks);

    if (audioBuffer.length === 0) {
      throw new Error('အသံဖိုင် ဖန်တီး၍ မရပါ။');
