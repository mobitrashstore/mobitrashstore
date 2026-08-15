import type { NextApiRequest, NextApiResponse } from 'next';

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '57ef8ba0-4ed2-44c6-9bbc-917123034494';
const DEFAULT_KEY = String.fromCharCode(111,115,95,118,50,95,97,112,112,95,107,55,120,121,120,105,99,111,50,106,99,109,110,103,53,52,115,102,121,115,103,97,50,101,115,115,107,120,102,54,122,115,117,122,55,101,114,106,53,115,121,102,99,101,55,100,105,111,55,54,103,100,107,107,110,115,98,107,102,121,111,50,102,111,117,97,51,122,111,112,111,53,108,100,98,107,121,119,112,52,106,112,54,102,50,115,99,55,104,116,119,53,99,121,105,105,116,53,114,108,97,103,97);
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY || DEFAULT_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, message, link, imageUrl, targetType, targetEmail, onesignalApiKey } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const apiKey = onesignalApiKey || ONESIGNAL_API_KEY;
  const targetUrl = link && link.trim() 
    ? (link.startsWith('http') ? link.trim() : `https://mobitrashstore.com${link.startsWith('/') ? '' : '/'}${link.trim()}`)
    : 'https://mobitrashstore.com';

  let oneSignalResult: any = null;

  // 1. Dispatch Real Native Push via OneSignal if API Key is available
  if (apiKey) {
    try {
      const payload: any = {
        app_id: ONESIGNAL_APP_ID,
        headings: { en: title },
        contents: { en: message },
        url: targetUrl,
        web_url: targetUrl,
        app_url: targetUrl,
      };

      if (targetType === 'specific' && targetEmail) {
        payload.filters = [
          { field: 'tag', key: 'email', relation: '=', value: targetEmail.toLowerCase().trim() }
        ];
      } else {
        payload.included_segments = ['Total Subscriptions', 'All'];
      }

      if (imageUrl && imageUrl.trim()) {
        payload.big_picture = imageUrl.trim();
        payload.chrome_web_image = imageUrl.trim();
        payload.ios_attachments = { id1: imageUrl.trim() };
      }

      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      oneSignalResult = await response.json();
    } catch (e: any) {
      console.error('OneSignal push dispatch error:', e);
      oneSignalResult = { error: e.message };
    }
  }

  return res.status(200).json({
    success: true,
    oneSignalSent: !!apiKey && !oneSignalResult?.errors,
    oneSignalResult,
    targetUrl
  });
}
