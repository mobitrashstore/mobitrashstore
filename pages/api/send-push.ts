import type { NextApiRequest, NextApiResponse } from 'next';

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '57ef8ba0-4ed2-44c6-9bbc-917123034494';
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY || '';

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
