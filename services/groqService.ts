/**
 * Unified Groq AI Service for high-speed LLM inference
 * Powers Phone Comparisons and Live Technician Chat Support.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'; // Ultra-accurate 70B model

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
  return (
    process.env.NEXT_PUBLIC_GROQ_API_KEY ||
    process.env.GROQ_API_KEY ||
    ''
  );
};

/**
 * Compare two smartphones with Groq LLM
 */
export const comparePhonesWithGroq = async (
  phone1: string,
  phone2: string
): Promise<ComparisonRow[]> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Groq API Key is not configured');

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
    
    // In case object keys are feature names
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
 * Live Repair Chat Assistant
 */
export const askRepairAssistantWithGroq = async (
  userMessage: string,
  history: { role: 'user' | 'assistant'; text: string }[] = [],
  deviceModel?: string
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Groq API Key is not configured');

  const systemPrompt = `You are the Head Technician and Repair Specialist at Mobi Store Nepal (Bt Mobile Care).
Your goal is to provide clear, practical, step-by-step smartphone repair instructions and advice for customers in Nepal.

CRITICAL LANGUAGE & STYLE RULES:
1. Primary Language: ALWAYS respond in natural, friendly Romanized Nepali (Nepali language written in English alphabet / Nepali-English hybrid).
   Example tone: "Tapai ko phone repair garna talako step-by-step process follow garnuhos:
   1. Sabai bhanda pahila device switch off garnuhos ra SIM tray nikalnuhos.
   2. Pentalobe screwdriver le tala ko 2 ota screws kholnuhos.
   3. Suction cup ra pry tool use garera screen bistarai kholnuhos..."
2. No Meta-Thoughts: Never output internal reasoning or explanations of what you are doing. Start directly with the answer/steps.
3. No Markdown Bolding: Do NOT use asterisks (**) for bolding. Keep text clean and plain.
4. Genuine Parts & Store Note: Remind customers that genuine spare parts and doorstep repair service are available at Mobi Store, Kathmandu.`;

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
    "I'm here to help diagnose your device issue. Please describe the problem with your phone."
  );
};
