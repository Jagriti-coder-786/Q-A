/**
 * LLM Service - Resilient Multi-Tier AI Architecture
 * 
 * Priority 1: Google Gemini (gemini-3.6-flash)
 *   - Google AI Studio free tier: 1,500 free requests/day
 *   - 1,000,000 token context window
 *   - Best overall document reasoning and speed
 * 
 * Priority 2 (Fallback A): Groq (openai/gpt-oss-120b)
 *   - 120 Billion parameter frontier model hosted on Groq LPU
 *   - Free tier: 1,000 requests/day, fast reasoning
 * 
 * Priority 3 (Fallback B): Groq (qwen/qwen3.8-27b)
 *   - Lightweight 27B parameter safety buffer
 *   - High token-per-minute ceiling, multilingual accuracy
 */

export async function callLLM({ systemPrompt = '', userPrompt, temperature = 0.3, maxTokens = 1500 }) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  // 1. PRIMARY: Google Gemini (gemini-3.6-flash)
  if (geminiApiKey) {
    try {
      const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      };

      if (systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          console.log(`✨ [AI Engine: Gemini] Responded via ${geminiModel}`);
          return {
            text: text.trim(),
            provider: 'gemini',
            model: geminiModel
          };
        }
      } else {
        const errText = await response.text();
        console.warn(`⚠️ [Gemini Limit/Warning] Status ${response.status}: ${errText.slice(0, 140)}...`);
        console.log('🔄 [AI Fallback] Seamlessly switching to Groq...');
      }
    } catch (err) {
      console.warn('⚠️ [Gemini Network/Error]:', err.message);
      console.log('🔄 [AI Fallback] Seamlessly switching to Groq...');
    }
  }

  // 2. FALLBACK TIERS: Groq (120B model first, 27B buffer second)
  if (groqApiKey) {
    const preferredModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    const candidateModels = [preferredModel];
    if (preferredModel !== 'qwen/qwen3.8-27b') {
      candidateModels.push('qwen/qwen3.8-27b');
    }

    for (const model of candidateModels) {
      try {
        const messages = [];
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: userPrompt });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text && text.trim()) {
            console.log(`⚡ [AI Engine: Groq Fallback] Responded via ${model}`);
            return {
              text: text.trim(),
              provider: 'groq',
              model
            };
          }
        } else {
          const errorData = await response.text();
          console.warn(`⚠️ [Groq ${model} Quota Warning] Status ${response.status}: ${errorData.slice(0, 140)}...`);
        }
      } catch (err) {
        console.warn(`⚠️ [Groq ${model} Error]:`, err.message);
      }
    }
  }

  return null;
}
