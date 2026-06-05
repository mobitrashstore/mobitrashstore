import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

function fetchUrl(url: string): Promise<string> {
    const options = {
        headers: {
            'User-Agent': 'MobiTrashStoreBot/1.0 (contact@mobitrashstore.com)'
        }
    };
    return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

function checkUrlExists(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'MobiTrashStoreBot/1.0' } }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

async function fetchSmartCommonsImage(deviceName: string): Promise<string | null> {
    if (!deviceName || deviceName.trim().length < 2) return null;
    
    let query = deviceName.trim();
    const modelNumbers = query.match(/\d+/g) || [];
    
    if (/^\d/.test(query) && !/iphone|samsung|pixel|oneplus|xiaomi/i.test(query)) {
        query = `iPhone ${query}`;
    }
    
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&prop=imageinfo&iiprop=url&format=json&origin=*`;
    
    try {
        const resStr = await fetchUrl(url);
        const data = JSON.parse(resStr);
        
        if (!data.query || !data.query.pages) return null;
        
        const pages = data.query.pages;
        const candidateFiles = [];
        
        for (const pageId of Object.keys(pages)) {
            const page = pages[pageId];
            if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
                candidateFiles.push({
                    title: page.title.toLowerCase(),
                    url: page.imageinfo[0].url
                });
            }
        }
        
        const negativeKeywords = [
            'case', 'box', 'screenshot', 'lockscreen', 'sperrbildschirm', 
            'broken', 'packaging', 'charger', 'cable', 'manual', 'lens', 
            'cutout', 'logo', 'drawing', 'chart', 'diagram', 'graph', 
            'data', 'comparison', 'specifications', 'specs', 'pricing', 
            'table', 'ad', 'poster', 'mockup', '机型', '对比', '性能'
        ];
        
        for (const file of candidateFiles) {
            if (file.url.toLowerCase().endsWith('.svg')) continue;
            if (negativeKeywords.some(kw => file.title.includes(kw))) continue;
            
            let aligned = true;
            for (const num of modelNumbers) {
                if (!file.title.includes(num)) {
                    aligned = false;
                    break;
                }
            }
            if (!aligned) continue;
            
            return file.url;
        }
    } catch (e) {
        console.warn("Wikimedia Commons search failed on API route:", e);
    }
    return null;
}

async function fetchGsmArenaImage(deviceName: string): Promise<string | null> {
    const clean = deviceName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '');
    const parts = clean.split(/\s+/);
    if (parts.length === 0) return null;
    
    let brand = '';
    let model = '';
    
    const brands = ['apple', 'samsung', 'google', 'oneplus', 'xiaomi', 'huawei', 'oppo', 'vivo', 'realme', 'nokia', 'sony', 'motorola'];
    if (brands.includes(parts[0])) {
        brand = parts[0];
        model = parts.slice(1).join('-');
    } else {
        if (clean.includes('iphone')) {
            brand = 'apple';
            model = parts.join('-');
        } else {
            brand = parts[0];
            model = parts.slice(1).join('-');
        }
    }
    
    if (!model) return null;
    
    let slug = '';
    if (model.startsWith(brand)) {
        slug = model;
    } else {
        slug = `${brand}-${model}`;
    }
    
    const candidates = [
        `https://fdn2.gsmarena.com/vv/bigpic/${slug}.jpg`,
        `https://fdn2.gsmarena.com/vv/bigpic/${slug}-5g.jpg`,
        `https://fdn2.gsmarena.com/vv/bigpic/${slug}-4g.jpg`
    ];
    
    if (brand === 'apple' && !model.startsWith('iphone') && !model.startsWith('apple')) {
        candidates.unshift(`https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-${model}.jpg`);
    }
    
    for (const url of candidates) {
        const exists = await checkUrlExists(url);
        if (exists) return url;
    }
    return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { device } = req.query;
    if (!device || typeof device !== 'string') {
        return res.status(400).json({ error: 'Device query parameter is required' });
    }
    
    try {
        // 1. Try Wikimedia Commons Smart Search
        let imageUrl = await fetchSmartCommonsImage(device);
        if (imageUrl) {
            return res.status(200).json({ imageUrl });
        }
        
        // 2. Try GSMArena Check
        imageUrl = await fetchGsmArenaImage(device);
        if (imageUrl) {
            return res.status(200).json({ imageUrl });
        }
        
        return res.status(200).json({ imageUrl: null });
    } catch (error: any) {
        console.error("Device image search error:", error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
