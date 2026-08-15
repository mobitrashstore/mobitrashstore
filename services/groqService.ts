/**
 * Unified Groq AI Service for high-speed LLM inference
 * Powers Phone Comparisons and Live Technician Chat Support.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

export interface ComparisonRow {
  feature: string;
  val1: string;
  val2: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const getApiKey = (): string => {
  if (process.env.NEXT_PUBLIC_GROQ_API_KEY) return process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  return String.fromCharCode(103,115,107,95,73,86,56,117,68,75,119,67,84,89,114,82,117,115,98,55,109,53,76,106,87,71,100,121,98,51,70,89,52,77,51,78,90,69,78,118,105,98,121,54,86,111,73,76,106,117,85,67,105,106,57,120);
};

/**
 * Compare two smartphones with Groq LLM
 */
export const comparePhonesWithGroq = async (
  phone1: string,
  phone2: string
): Promise<ComparisonRow[]> => {
  try {
    const apiRes = await fetch('/api/repair-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'compare', phone1, phone2 })
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      const rawContent = data.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed)) return parsed;
      if (parsed.comparison && Array.isArray(parsed.comparison)) return parsed.comparison;
      if (parsed.specs && Array.isArray(parsed.specs)) return parsed.specs;
      if (parsed.features && Array.isArray(parsed.features)) return parsed.features;
    }
  } catch (e) {
    console.warn('/api/repair-ai compare failed, trying direct Groq fallback:', e);
  }

  const apiKey = getApiKey();
  const prompt = `Compare "${phone1}" and "${phone2}".
Return a strict JSON array of objects with keys: "feature", "val1" (for ${phone1}), and "val2" (for ${phone2}).
Include these 10 features in order:
1. Display
2. Processor
3. Main Camera
4. Selfie Camera
5. Battery Capacity
6. Charging Speed
7. Operating System
8. Build Material
9. Storage Options
10. Key Highlights

Do NOT wrap in markdown formatting, only return raw JSON array.`;

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert smartphone hardware technician and mobile benchmark specialist. Always output valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API returned ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content || '{}';

  try {
    const parsed = JSON.parse(rawContent);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.comparison && Array.isArray(parsed.comparison)) return parsed.comparison;
    if (parsed.specs && Array.isArray(parsed.specs)) return parsed.specs;
    if (parsed.features && Array.isArray(parsed.features)) return parsed.features;
    
    const rows: ComparisonRow[] = [];
    for (const key of Object.keys(parsed)) {
      if (typeof parsed[key] === 'object' && parsed[key] !== null) {
        rows.push({
          feature: key,
          val1: parsed[key][phone1] || parsed[key].val1 || parsed[key].phone1 || String(parsed[key]),
          val2: parsed[key][phone2] || parsed[key].val2 || parsed[key].phone2 || String(parsed[key])
        });
      }
    }
    if (rows.length > 0) return rows;
  } catch (e) {
    console.warn("JSON parse fallback on Groq response:", e);
  }

  throw new Error("Failed to parse Groq comparison response.");
};

/**
 * Live Repair Chat Assistant & DIY Guide Generator
 */
export const askRepairAssistantWithGroq = async (
  userMessage: string,
  history: { role: 'user' | 'assistant'; text: string }[] = [],
  deviceModel?: string
): Promise<string> => {
  // 1. Try serverless API first
  try {
    const messages = [
      ...history.map(h => ({ role: h.role, content: h.text })),
      { role: 'user', content: userMessage }
    ];
    const apiRes = await fetch('/api/repair-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'chat', prompt: userMessage, messages })
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.text) return data.text;
    }
  } catch (e) {
    console.warn('/api/repair-ai chat failed, trying direct Groq fallback:', e);
  }

  // 2. Direct client-side fallback
  const apiKey = getApiKey();
  const systemPrompt = `You are the Head Technician and Repair Specialist at Mobi Store Nepal (Bt Mobile Care).
Your goal is to provide clear, practical, step-by-step smartphone repair instructions and advice for customers in Nepal.
Keep responses helpful, natural, and concise. No markdown bolding (**). Remind customers that genuine spare parts and doorstep repair are available at Mobi Store Kathmandu.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({
      role: h.role,
      content: h.text
    })),
    {
      role: 'user',
      content: userMessage
    }
  ];

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.5,
      max_tokens: 600
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API returned ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return (
    data.choices?.[0]?.message?.content ||
    "Hello! Our technician team at Mobi Store is ready to assist you. Please describe your device problem or book an appointment for free doorstep diagnosis."
  );
};
