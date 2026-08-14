import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'df4he5ovu';
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || '252214753723296';
const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET || 'TlpeLMZtVRJcjXNDPc6zORlZurU';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, folder = 'products' } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
    });

    return res.status(200).json({ url: uploadResponse.secure_url || uploadResponse.url });
  } catch (error: any) {
    console.error('Cloudinary API upload error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
}
