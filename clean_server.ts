  1080	          }
  1081	          const buf = Buffer.concat(parts);
  1082	          if (buf.length > 50) return buf;
  1083	        } catch (_) {}
  1084	      }
  1085	      try {
  1086	        const enc = encodeURIComponent(txt.slice(0, 180));
  1087	        const gRes = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${enc}&tl=en&client=tw-ob`, {
  1088	          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  1089	        });
  1090	        if (gRes.ok) return Buffer.from(await gRes.arrayBuffer());
  1091	      } catch (_) {}
  1092	      return Buffer.alloc(0);
  1093	    };
  1094	
  1095	    const audioChunkResults = await runWithConcurrency(chunks, synthesizeChunk, 4);
