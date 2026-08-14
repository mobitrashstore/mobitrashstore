
import { Order } from '../types';
import * as api from './api';

const PATHAO_BASE_URL = 'https://api-hermes.pathao.com'; 

// --- ROBUST FALLBACK DATA (Major Nepal Cities) --- 
// Every entry MUST have a 'zones' array to prevent .map() crashes.
const PATHAO_DATA: any[] = [
    { city_id: 63, city_name: "Kathmandu Valley", zones: [{ zone_id: 1312, zone_name: "Inside Valley" }] },
    { city_id: 64, city_name: "Lalitpur", zones: [{ zone_id: 1340, zone_name: "Jawalakhel" }] },
    { city_id: 65, city_name: "Bhaktapur", zones: [{ zone_id: 1360, zone_name: "Thimi" }] },
    { city_id: 108, city_name: "Pokhara (ID: 108)", zones: [{ zone_id: 1200, zone_name: "Pokhara City" }] },
    { city_id: 181, city_name: "Chitwan (ID: 181)", zones: [{ zone_id: 1201, zone_name: "Bharatpur Center" }] },
    { city_id: 327, city_name: "Dharan (ID: 327)", zones: [{ zone_id: 1202, zone_name: "Dharan City" }] },
    { city_id: 284, city_name: "Biratnagar (ID: 284)", zones: [{ zone_id: 1203, zone_name: "Biratnagar City" }] },
    { city_id: 301, city_name: "Butwal (ID: 301)", zones: [{ zone_id: 1204, zone_name: "Butwal City" }] },
    { city_id: 260, city_name: "Hetauda (ID: 260)", zones: [{ zone_id: 1205, zone_name: "Hetauda City" }] },
    { city_id: 329, city_name: "Itahari (ID: 329)", zones: [{ zone_id: 1206, zone_name: "Itahari City" }] },
    { city_id: 309, city_name: "Nepalgunj (ID: 309)", zones: [{ zone_id: 1207, zone_name: "Nepalgunj City" }] },
    { city_id: 67, city_name: "Bhairahawa (ID: 67)", zones: [{ zone_id: 1208, zone_name: "Bhairahawa City" }] },
    { city_id: 353, city_name: "Aanbukhaireni (ID: 353)", zones: [{ zone_id: 1209, zone_name: "Aanbukhaireni City" }] },
    { city_id: 135, city_name: "Amargadhi (ID: 135)", zones: [{ zone_id: 1210, zone_name: "Amargadhi City" }] },
    { city_id: 233, city_name: "Amlekhganj (ID: 233)", zones: [{ zone_id: 1211, zone_name: "Amlekhganj City" }] }
];


// Optimized Proxy List for Production & Localhost (Vercel & Modern Environments)
const PROXY_LIST = [
    'https://corsproxy.io/?',              // #1 High Reliability
    'https://api.allorigins.win/raw?url=', // #2 Good for large responses
];

let cachedToken: string | null = null;

const fetchWithProxy = async (endpoint: string, options: RequestInit) => {
    const targetUrl = `${PATHAO_BASE_URL}${endpoint}`;
    
    // Try proxies with a timeout-based rotation to prevent hanging
    for (const proxyBase of PROXY_LIST) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout per proxy

            let url = `${proxyBase}${targetUrl}`;
            if (proxyBase.includes('codetabs') || proxyBase.includes('allorigins')) {
                url = `${proxyBase}${encodeURIComponent(targetUrl)}`;
            }

            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    ...options.headers,
                    'X-Requested-With': 'XMLHttpRequest' // Helps bypass some proxy filters
                }
            });

            clearTimeout(timeoutId);

            if (response.status >= 200 && response.status < 500) {
                return response;
            }
        } catch (e) {
            console.warn(`Proxy ${proxyBase} failed, trying next...`);
        }
    }
    
    throw new Error(`Pathao API Connection Blocked. This is usually due to CORS on your domain. Falling back to internal directory.`);
};

export const getAccessToken = async (): Promise<string> => {
    if (cachedToken) return cachedToken;

    const config = await api.getPathaoConfig();
    
    if (!config.clientId || !config.clientSecret || !config.username || !config.password) {
        throw new Error("Pathao credentials are incomplete in settings.");
    }

    try {
        const response = await fetchWithProxy('/aladdin/api/v1/issue-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: config.clientId,
                client_secret: config.clientSecret,
                username: config.username,
                password: config.password,
                grant_type: "password"
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Login failed: ${response.status}`);
        }
        
        cachedToken = data.access_token;
        return data.access_token;
    } catch (error: any) {
        console.error("Pathao Auth Error", error);
        throw error;
    }
};

// Fetch REAL city list from Pathao's API using a valid token
export const getCities = async (): Promise<any[]> => {
    try {
        const token = await getAccessToken();
        
        // Try the correct Pathao city endpoint discovered via network inspection
        const endpoints = [
            '/aladdin/api/v1/city-list',
            '/aladdin/api/v1/cities',
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetchWithProxy(endpoint, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                const json = await response.json();
                console.log('[Pathao] Cities raw response:', JSON.stringify(json).substring(0, 500));
                
                // Pathao wraps data in different ways, handle all formats
                const cities = json?.data?.data || json?.data || json?.cities || [];
                if (Array.isArray(cities) && cities.length > 0) {
                    console.log('[Pathao] Using live city IDs. First city:', cities[0]);
                    return cities;
                }
            } catch (endpointErr) {
                console.warn(`[Pathao] City endpoint ${endpoint} failed:`, endpointErr);
            }
        }
    } catch (e) {
        console.warn('[Pathao] Auth failed for city fetch:', e);
    }
    // Fallback to hardcoded data (these are APPROXIMATE - Pathao may reject them)
    console.warn('[Pathao] WARNING: Using hardcoded city IDs - may cause "city does not exist" errors!');
    return PATHAO_DATA.map(c => ({ city_id: c.city_id, city_name: c.city_name }));
};

// Fetch REAL zone list from Pathao's API using a valid token
export const getZones = async (cityId: number): Promise<any[]> => {
    try {
        const token = await getAccessToken();
        
        // Try the correct Pathao zone endpoint discovered via network inspection
        const endpoints = [
            `/aladdin/api/v1/zone-list?city_id=${cityId}`,
            `/aladdin/api/v1/cities/${cityId}/zone-list`,
            `/aladdin/api/v1/zones?city_id=${cityId}`,
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetchWithProxy(endpoint, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                const json = await response.json();
                console.log('[Pathao] Zones raw response:', JSON.stringify(json).substring(0, 500));
                
                const zones = json?.data?.data || json?.data || json?.zones || [];
                if (Array.isArray(zones) && zones.length > 0) {
                    console.log('[Pathao] Using live zone IDs. First zone:', zones[0]);
                    return zones;
                }
            } catch (endpointErr) {
                console.warn(`[Pathao] Zone endpoint ${endpoint} failed:`, endpointErr);
            }
        }
    } catch (e) {
        console.warn('[Pathao] Auth failed for zone fetch:', e);
    }
    // Fallback to hardcoded zones
    const city = PATHAO_DATA.find(c => c.city_id === cityId);
    // CRITICAL: Ensure we NEVER return undefined. If entry exists, return zones, else empty array.
    return (city && city.zones) ? city.zones : [];
};

export const getStores = async (token: string): Promise<any[]> => {
    try {
        const response = await fetchWithProxy('/aladdin/api/v1/stores', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        const json = await response.json();
        return json?.data?.data || [];
    } catch (e) {
        console.error("Failed to fetch stores", e);
        // Fallback store ID if fetch fails (optional, but store ID is specific to user account)
        return [];
    }
}

export const createOrder = async (order: Order, cityId: number, zoneId: number, address: string): Promise<string> => {
    cachedToken = null; // Force fresh token
    const token = await getAccessToken();
    
    // Get Store ID dynamically
    const stores = await getStores(token);
    if (stores.length === 0) {
        throw new Error("No Store found. Please create a store in Pathao dashboard.");
    }
    const storeId = stores[0].store_id;

    // Calculate Collection Amount
    const amountToCollect = order.paymentMethod === 'Cash on Delivery' ? order.total : 0;

    const payload = {
        store_id: storeId, 
        merchant_order_id: order.id,
        recipient_name: order.customerDetails.name,
        recipient_phone: order.customerDetails.phone,
        recipient_address: address,
        recipient_city: Number(cityId), // Ensure Number
        recipient_zone: Number(zoneId), // Ensure Number
        amount_to_collect: amountToCollect,
        item_quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
        item_type: 2, // 2 = Parcel (1 = Document - not allowed for this merchant)
        delivery_type: 48, // Standard Delivery
        item_description: order.items.map(i => `${i.title} x${i.quantity}`).join(', '),
        order_type: 1, // Normal
        item_weight: 0.5
    };

    const response = await fetchWithProxy('/aladdin/api/v1/orders', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const text = await response.text();
    let json: any;
    try {
        json = JSON.parse(text);
    } catch (e) {
        throw new Error(`Invalid API Response: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
        if (json.errors) {
             const errorMsg = Object.entries(json.errors).map(([k, v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join('\n');
             throw new Error(`Pathao Validation Error: ${errorMsg}`);
        }
        throw new Error(json.message || `Pathao Error (${response.status})`);
    }

    if (!json?.data?.consignment_id) {
        throw new Error("Order created but no Consignment ID returned.");
    }

    return json.data.consignment_id;
};
