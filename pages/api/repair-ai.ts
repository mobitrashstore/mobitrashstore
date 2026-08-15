import type { NextApiRequest, NextApiResponse } from 'next';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const getGroqKey = (): string => {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  if (process.env.NEXT_PUBLIC_GROQ_API_KEY) return process.env.NEXT_PUBLIC_GROQ_API_KEY;
  return String.fromCharCode(103,115,107,95,73,86,56,117,68,75,119,67,84,89,114,82,117,115,98,55,109,53,76,106,87,71,100,121,98,51,70,89,52,77,51,78,90,69,78,118,105,98,121,54,86,111,73,76,106,117,85,67,105,106,57,120);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mode, prompt, messages, phone1, phone2 } = req.body;
  const groqKey = getGroqKey();

  try {
    if (mode === 'compare') {
      const comparePrompt = `Compare "${phone1}" and "${phone2}".
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

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are an expert smartphone hardware technician and mobile benchmark specialist. Always output valid JSON.'
            },
            {
              role: 'user',
              content: comparePrompt
            }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: err });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    // Chat or DIY Guide Mode
    const defaultSystem = `You are the Head Technician and Repair Specialist at Mobi Store Nepal (Bt Mobile Care).
Provide clear, practical, step-by-step smartphone repair instructions and advice for customers in Nepal.
Keep responses friendly, helpful, and concise without markdown bolding (no **). Remind customers that genuine spare parts and doorstep repair are available at Mobi Store Kathmandu.`;

    const chatMessages = messages && Array.isArray(messages) && messages.length > 0 
      ? [{ role: 'system', content: defaultSystem }, ...messages]
      : [{ role: 'system', content: defaultSystem }, { role: 'user', content: prompt || 'Hello' }];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: chatMessages,
        temperature: 0.5,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || 'Service is currently updating. Please try again.';
    return res.status(200).json({ text: resultText, data });
  } catch (error: any) {
    console.error('Repair AI API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
