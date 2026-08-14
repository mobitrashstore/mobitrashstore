import { db, storage } from './firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { InventoryItem, BlogPost, Order, TradeIn, User, ContactMessage, SellModel, StoreStockItem, Category, Banner, GlobalNotification, Referral, Coupon, Address, ValuationBaseline, ValuationDeduction, OfflineSale, DarazConfig, PathaoConfig, PaymentPartner, SpinWheelConfig, SpinParticipant, AboutPageConfig, Testimonial, Brand, RepairBooking, LegalPageContent, NotebookEntry, ProblemReport, Review, GalleryItem, SiteVisit, SystemLog, ProductRequest, RedemptionRequest, NewsSource, OfficialNews, NoticeBanner, BroadcastLog } from '../types';

// Helper types
type DocumentData = firebase.firestore.DocumentData;
const Timestamp = firebase.firestore.Timestamp;

const fromDoc = <T extends { id: string }>(doc: DocumentData): T => {
    const data = doc.data();
    // Convert Firestore Timestamps to ISO date strings
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString().split('T')[0];
        }
    }
    return { ...data, id: doc.id } as T;
};

// CRITICAL FIX: Sanitize payloads to remove 'undefined' values which crash Firestore
const sanitizePayload = (data: any): any => {
    if (data === null || data === undefined) return null;
    if (Array.isArray(data)) return data.map(sanitizePayload);
    if (typeof data === 'object' && !(data instanceof Date)) {
        const result: any = {};
        for (const key in data) {
            const val = data[key];
            if (val !== undefined) {
                result[key] = sanitizePayload(val);
            } else {
                result[key] = null; // Convert undefined to null
            }
        }
        return result;
    }
    return data;
};

// Utility to create URL-safe slugs
export const slugify = (text: string) => {
    if (!text) return '';
    return String(text)
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .substring(0, 150)
        .replace(/-+$/, ''); 
};

// --- HIGH-SPEED IN-MEMORY & PERSISTENT L1/L2 CACHING SYSTEM (0ms Instant Load) ---
const CACHE_PREFIX = 'mt_cache_';
const DEFAULT_TTL = 15 * 60 * 1000; // 15 Minutes
const ONE_HOUR_TTL = 60 * 60 * 1000; // 1 Hour
const ONE_MINUTE_TTL = 1 * 60 * 1000; // 1 Minute

interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

// L1 Ultra-Fast RAM Cache (Zero JSON serialization overhead, 0.0001 ms lookup)
const memoryCache = new Map<string, CacheItem<any>>();

const getFromCache = <T>(key: string): T | null => {
    const now = Date.now();

    // 1. Check Ultra-Fast L1 RAM Cache first
    const memItem = memoryCache.get(key);
    if (memItem) {
        const effectiveTtl = memItem.ttl || DEFAULT_TTL;
        if (now - memItem.timestamp <= effectiveTtl) {
            return memItem.data as T;
        }
        // Stale data available in RAM for instant fallback
    }

    // 2. Check Persistent L2 LocalStorage
    try {
        if (typeof window === 'undefined' || !window.localStorage) return memItem ? (memItem.data as T) : null;
        const cachedStr = localStorage.getItem(CACHE_PREFIX + key);
        if (!cachedStr) return memItem ? (memItem.data as T) : null;
        const item: CacheItem<T> = JSON.parse(cachedStr);
        const effectiveTtl = item.ttl || DEFAULT_TTL;

        // Store into L1 RAM Cache
        memoryCache.set(key, item);

        if (now - item.timestamp > effectiveTtl) {
            return item.data; // Return stale for instant render while revalidating
        }
        return item.data;
    } catch (e) {
        return memItem ? (memItem.data as T) : null;
    }
};

const setInCache = <T>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
    const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl
    };
    // 1. Instant L1 RAM write
    memoryCache.set(key, item);

    // 2. Persistent L2 LocalStorage write
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
        }
    } catch (e) {
        // Handle storage quota gracefully
    }
};

// Exported synchronous cache getter for Instant 0ms Component Mounts
export const getCachedData = <T>(key: string): T | null => {
    return getFromCache<T>(key);
};

// Stale-While-Revalidate Fast Cache Wrapper
const withCache = async <T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> => {
    const cached = getFromCache<T>(key);

    // Instant 0ms return if cached
    if (cached !== null && cached !== undefined) {
        const memItem = memoryCache.get(key);
        const now = Date.now();
        const effectiveTtl = ttl || DEFAULT_TTL;

        // Background silent revalidation if data is older than 2 minutes
        if (memItem && (now - memItem.timestamp > Math.min(effectiveTtl / 2, 2 * 60 * 1000))) {
            fetcher().then((freshData) => {
                if (freshData !== null && freshData !== undefined) {
                    setInCache(key, freshData, ttl);
                }
            }).catch(() => {});
        }
        return cached;
    }

    const data = await fetcher();
    if (data !== null && data !== undefined) {
        setInCache(key, data, ttl);
    }
    return data;
};

// --- SYSTEM & LOGGING ---
export const logSystemIssue = async (type: 'error' | 'warning', message: string, stack?: string) => {
    try {
        await db.collection('systemLogs').add({
            type,
            message,
            stack: stack || null,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
    } catch (e) {
        console.error("Failed to log system issue", e);
    }
};

export const getSystemLogs = async (): Promise<SystemLog[]> => {
    const snapshot = await db.collection('systemLogs').orderBy('timestamp', 'desc').limit(50).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SystemLog));
};

// --- Traffic & Analytics ---
export const trackTraffic = async (path: string): Promise<void> => {
    // 1. Skip Bots / Prerender / Admin
    const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent) || (window as any)._IS_PRERENDER;
    if (path === '/undefined' || path.includes('favicon') || path.startsWith('/admin') || isBot) return;

    const today = new Date().toISOString().split('T')[0];
    const docRef = db.collection('siteTraffic').doc(today);

    const ua = navigator.userAgent;
    let deviceType = 'desktop';

    // Robust Device Detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua);

    if (isTablet || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        deviceType = 'tablet';
    } else if (isMobile) {
        deviceType = 'mobile';
    }

    // 2. Determine Primary Source (Entry Point)
    // We only want to increment the source count ONCE per session to show TRUE traffic sources
    const sessionReferrerKey = 'mt_session_referrer_recorded';
    const isNewSessionHit = !sessionStorage.getItem(sessionReferrerKey);
    let resolvedSource = '';

    if (isNewSessionHit) {
        const isCapacitor = (window as any).Capacitor && (window as any).Capacitor.platform !== 'web';
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isCapacitor) {
            resolvedSource = 'Mobile App';
        } else if (isStandalone) {
            resolvedSource = 'Mobile Manifest';
        } else if (document.referrer) {
            try {
                const url = new URL(document.referrer);
                // Only treat as external if it's not our own domain
                if (url.hostname !== window.location.hostname) {
                    resolvedSource = url.hostname.replace('www.', '');
                } else {
                    resolvedSource = 'Main Domain';
                }
            } catch (e) {
                resolvedSource = 'Main Domain';
            }
        } else {
            resolvedSource = 'Main Domain';
        }
        sessionStorage.setItem(sessionReferrerKey, resolvedSource);
    }

    const cleanPath = path === '/' ? 'home' : path.replace(/\//g, '_');

    // 3. Throttle 'totalHits' to prevent increment on every refresh (once per path per session)
    const hitSessionKey = `mt_hit_${today}_${cleanPath}`;
    const hasBeenHitInSession = sessionStorage.getItem(hitSessionKey);

    const visitKey = `mt_visit_${today}`;
    const isUniqueVisitor = !localStorage.getItem(visitKey);

    const updates: any = {
        date: today,
        // Only increment totalHits if NOT already hit in this session/refresh (accuracy fix)
        totalHits: hasBeenHitInSession ? firebase.firestore.FieldValue.increment(0) : firebase.firestore.FieldValue.increment(1),
        devices: {
            [deviceType]: firebase.firestore.FieldValue.increment(1)
        },
        pageViews: {
            [cleanPath]: firebase.firestore.FieldValue.increment(1)
        }
    };

    // Only increment source count if it's a NEW session entry point
    if (isNewSessionHit && resolvedSource) {
        const cleanSource = resolvedSource.replace(/\./g, '_');
        updates.sources = {
            [cleanSource]: firebase.firestore.FieldValue.increment(1)
        };
    }

    if (isUniqueVisitor) {
        updates.uniqueVisitors = firebase.firestore.FieldValue.increment(1);
        localStorage.setItem(visitKey, 'true');
    }

    try {
        // Set first to prevent double-counting on rapid load/StrictMode
        sessionStorage.setItem(hitSessionKey, 'true');
        await docRef.set(updates, { merge: true });
    } catch (e) {
        console.warn("Traffic tracking failed", e);
    }
};

export const incrementProductViewAndGetCount = async (productTitle: string): Promise<number> => {
    // Normalize slug (keep existing logic)
    const slug = slugify(productTitle);

    // Prevent double-counting from React StrictMode/Initial double-render
    // We use a short 3-second cooldown in sessionStorage
    const lastHitKey = `mt_hit_time_${slug}`;
    const lastHitTime = sessionStorage.getItem(lastHitKey);
    const now = Date.now();

    // 1. Permanent Lifetime Counter Ref
    const statsRef = db.collection('productStats').doc(slug);

    try {
        if (!lastHitTime || (now - parseInt(lastHitTime)) > 3000) {
            // Set first to prevent race condition during await
            sessionStorage.setItem(lastHitKey, now.toString());
            await statsRef.set({
                id: slug,
                title: productTitle,
                totalViews: firebase.firestore.FieldValue.increment(1),
                lastViewed: new Date().toISOString()
            }, { merge: true });
        }

        // Return the fresh TOTAL count
        const doc = await statsRef.get();
        return doc.data()?.totalViews || 1;

    } catch (error) {
        console.error("View increment failed:", error);
        // Fallback: Just return current count if possible
        try {
            const snap = await statsRef.get();
            return snap.data()?.totalViews || 1;
        } catch (e) {
            return 1;
        }
    }
};

export const getProductStats = async (productTitle: string): Promise<number> => {
    // Normalize slug (must match increment logic)
    const slug = slugify(productTitle);

    const statsRef = db.collection('productStats').doc(slug);
    try {
        const doc = await statsRef.get();
        if (doc.exists) {
            return doc.data()?.totalViews || 1;
        }
        return 1;
    } catch (e) {
        console.warn("Failed to get product stats", e);
        return 1;
    }
};

export const getAllProductStats = async (): Promise<Record<string, number>> => {
    return withCache('product_stats', async () => {
        try {
            const snapshot = await db.collection('productStats').get();
            const stats: Record<string, number> = {};
            snapshot.docs.forEach(doc => {
                // Key it as _buy_slug to match existing UI logic in HomePage carousels
                stats['_buy_' + doc.id] = doc.data().totalViews || 0;
            });
            return stats;
        } catch (e) {
            console.warn("Failed to get all product stats", e);
            return {};
        }
    }, ONE_HOUR_TTL);
};

export const subscribeToProductStats = (onUpdate: (stats: Record<string, number>) => void) => {
    return db.collection('productStats').onSnapshot(snapshot => {
        const stats: Record<string, number> = {};
        snapshot.docs.forEach(doc => {
            stats['_buy_' + doc.id] = doc.data().totalViews || 0;
        });
        onUpdate(stats);
    }, error => {
        console.warn("Failed to subscribe to product stats:", error);
    });
};

// --- BLOG VIEW INCREMENTER (LIFETIME DATA) ---
export const incrementBlogViewAndGetCount = async (slug: string): Promise<number> => {
    // Use productStats collection as it has permissive rules, effectively sharing the stats collection
    // Prefix with 'blog_' to distinguish/avoid collisions
    const lastHitKey = `mt_blog_hit_time_${slug}`;
    const lastHitTime = sessionStorage.getItem(lastHitKey);
    const now = Date.now();

    const statsRef = db.collection('productStats').doc(`blog_${slug}`);
    try {
        if (!lastHitTime || (now - parseInt(lastHitTime)) > 3000) {
            // Set first to prevent race condition 
            sessionStorage.setItem(lastHitKey, now.toString());
            await statsRef.set({
                id: `blog_${slug}`,
                totalViews: firebase.firestore.FieldValue.increment(1),
                lastViewed: new Date().toISOString(),
                type: 'blog' // marker
            }, { merge: true });
        }

        // Fetch back for the current count
        const snap = await statsRef.get();
        return snap.data()?.totalViews || 1;
    } catch (e) {
        console.error("Blog view increment failed:", e);
        // Fallback: Still try to get the current count if increment failed
        try {
            const snap = await statsRef.get();
            return snap.data()?.totalViews || 1;
        } catch (err) {
            return 1;
        }
    }
};

export const getBlogStats = async (slug: string): Promise<number> => {
    try {
        const snap = await db.collection('productStats').doc(`blog_${slug}`).get();
        return snap.data()?.totalViews || 0;
    } catch (e) {
        return 0;
    }
};

export const getAllBlogStats = async (): Promise<Record<string, number>> => {
    try {
        // We only want blog stats, but productStats might contain actual product stats.
        // We can filter on client side if needed, or just return all and let the client look up by key.
        // Since we prefix keys with 'blog_', looking up 'blog_slug' works fine.
        // However, iterating to get *only* blog stats might be tricky if we don't query.
        // But since this is mostly used for bulk lookup, we can just fetch all.
        const snap = await db.collection('productStats').get();
        const stats: Record<string, number> = {};
        snap.forEach(doc => {
            if (doc.id.startsWith('blog_')) {
                const realSlug = doc.id.replace('blog_', '');
                stats[realSlug] = doc.data().totalViews || 0;
            }
        });
        return stats;
    } catch (e) {
        return {};
    }
};

// --- BLOG COMMENTS (REAL DATA) ---
export const getBlogComments = async (slug: string): Promise<any[]> => {
    const snapshot = await db.collection('blogComments')
        .where('blogSlug', '==', slug)
        .orderBy('timestamp', 'desc')
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addBlogComment = async (slug: string, comment: { name: string; text: string; userId?: string }): Promise<void> => {
    await db.collection('blogComments').add({
        blogSlug: slug,
        ...comment,
        timestamp: new Date().toISOString()
    });
};


export const getSiteTrafficStats = async (): Promise<SiteVisit[]> => {
    const snapshot = await db.collection('siteTraffic').orderBy('date', 'desc').limit(60).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SiteVisit));
};

export const getTodaysPageViews = async (): Promise<Record<string, number>> => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const doc = await db.collection('siteTraffic').doc(today).get();
        if (doc.exists) {
            return (doc.data() as SiteVisit).pageViews || {};
        }
        return {};
    } catch (e) {
        console.warn("Failed to get page views");
        return {};
    }
};

export const getFinancialStats = async (): Promise<any> => {
    const ordersSnap = await db.collection('orders').get();
    const salesSnap = await db.collection('offlineSales').get();
    const inventoryItems = await getInventoryItems();

    const costMap = new Map<string, number>();
    inventoryItems.forEach(item => {
        const cost = item.purchasePrice || (item.price * 0.8);
        costMap.set(item.sku, cost);
    });

    let totalRevenue = 0;
    let onlinePaymentTotal = 0;
    let codTotal = 0;
    let totalDiscounts = 0;
    let totalCost = 0;
    let totalDeliveryCharges = 0;

    ordersSnap.docs.forEach(doc => {
        const o = doc.data() as Order;
        if (o.status !== 'Cancelled') {
            totalRevenue += o.total;
            if (o.paymentMethod === 'Fonepay') onlinePaymentTotal += o.total;
            else codTotal += o.total;

            if (o.discountApplied) totalDiscounts += o.discountApplied;

            const isInsideValley = o.customerDetails.address.toLowerCase().includes('kathmandu') ||
                o.customerDetails.address.toLowerCase().includes('lalitpur') ||
                o.customerDetails.address.toLowerCase().includes('bhaktapur');
            totalDeliveryCharges += isInsideValley ? 150 : 200;

            o.items.forEach(item => {
                const unitCost = costMap.get(item.sku) || (item.price * 0.8);
                totalCost += (unitCost * item.quantity);
            });
        }
    });

    salesSnap.docs.forEach(doc => {
        const s = doc.data() as OfflineSale;
        totalRevenue += s.total;
        codTotal += s.total;
        totalCost += (s.total * 0.75);
    });

    const totalOrders = ordersSnap.size + salesSnap.size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const grossProfit = totalRevenue - totalCost;
    const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
        totalRevenue,
        onlinePaymentTotal,
        codTotal,
        totalOrders,
        averageOrderValue,
        grossProfit,
        grossMarginPercent,
        totalDiscounts,
        totalDeliveryCharges
    };
};

// --- CLOUDINARY UPLOAD HELPERS ---
const sha1 = async (str: string): Promise<string> => {
    const buffer = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-1', buffer);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

const getCloudinarySignature = async (params: Record<string, any>, apiSecret: string): Promise<string> => {
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys
        .map(key => `${key}=${params[key]}`)
        .join('&');
    const stringToSign = paramString + apiSecret;
    return sha1(stringToSign);
};

const uploadToCloudinary = async (
    fileData: string | Blob,
    folder: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    const getEnvVal = (nextKey: string, viteKey: string, fallback: string): string => {
        if (typeof process !== 'undefined' && process.env && process.env[nextKey]) return process.env[nextKey] as string;
        try {
            const metaEnv = (import.meta as any).env;
            if (metaEnv && metaEnv[viteKey]) return metaEnv[viteKey];
        } catch(e){}
        return fallback;
    };
    const cloudName = getEnvVal('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'VITE_CLOUDINARY_CLOUD_NAME', 'df4he5ovu');
    const apiKey = getEnvVal('NEXT_PUBLIC_CLOUDINARY_API_KEY', 'VITE_CLOUDINARY_API_KEY', '252214753723296');
    const apiSecret = getEnvVal('NEXT_PUBLIC_CLOUDINARY_API_SECRET', 'VITE_CLOUDINARY_API_SECRET', 'TlpeLMZtVRJcjXNDPc6zORlZurU');

    const timestamp = Math.round(new Date().getTime() / 1000);
    const params: Record<string, any> = {
        folder,
        timestamp
    };

    const signature = await getCloudinarySignature(params, apiSecret);

    const formData = new FormData();
    formData.append('file', fileData);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('folder', folder);
    formData.append('signature', signature);

    if (onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const progress = (e.loaded / e.total) * 100;
                    onProgress(progress);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response.secure_url || response.url);
                    } catch (err) {
                        reject(new Error("Invalid response from Cloudinary."));
                    }
                } else {
                    reject(new Error(`Cloudinary upload failed: ${xhr.responseText}`));
                }
            };

            xhr.onerror = () => reject(new Error("Network error during Cloudinary upload."));
            xhr.send(formData);
        });
    } else {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Cloudinary upload failed: ${text}`);
        }

        const data = await response.json();
        return data.secure_url || data.url;
    }
};

// --- IMAGE UPLOAD ---
export const uploadImage = async (
    file: Blob,
    path: string,
    onProgress: (progress: number) => void
): Promise<string> => {
    try {
        const folder = path.replace(/^\/+|\/+$/g, '') || 'products';
        return await uploadToCloudinary(file, folder, onProgress);
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw error;
    }
};

export const uploadBase64Image = async (
    base64String: string,
    path: string = 'gallery',
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        const folder = path.replace(/^\/+|\/+$/g, '') || 'gallery';
        return await uploadToCloudinary(base64String, folder, onProgress);
    } catch (error) {
        console.error("Cloudinary base64 upload failed:", error);
        throw error;
    }
};

// --- INVENTORY ---
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
    return withCache('inventory_items', async () => {
        const snapshot = await db.collection("inventory").get();
        return snapshot.docs.map(doc => fromDoc<InventoryItem>(doc));
    }, 1 * 60); // 1 Minute TTL for faster SEO updates
};

export const getInventoryItemBySku = async (sku: string): Promise<InventoryItem | null> => {
    // Ultra-Fast Lookup Strategy:
    // 1. Check Bullet cache first (Handled by withCache)
    // 2. Direct ID fetch (Daraz Style) -> Extremely Fast
    // 3. Targeted SKU query -> Fast
    // 4. Targeted Title-Slug query -> Fast (No more fetching ALL items)

    return withCache(`sku_${sku}`, async () => {
        const cleanSku = sku.replace('.html', '');

        // Pattern 1: Legacy ID match (consolidation to clean URL)
        if (cleanSku.includes('-i') || cleanSku.includes('-pk')) {
            const separator = cleanSku.includes('-i') ? '-i' : '-pk';
            const id = cleanSku.split(separator).pop();
            if (id) {
                const docSnap = await db.collection("inventory").doc(id).get();
                if (docSnap.exists) return fromDoc<InventoryItem>(docSnap);
            }
        }

        // Pattern 2: Direct Doc ID or SKU
        const docSnap = await db.collection("inventory").doc(cleanSku).get();
        if (docSnap.exists) return fromDoc<InventoryItem>(docSnap);

        const skuQuery = await db.collection("inventory").where("sku", "==", cleanSku).limit(1).get();
        if (!skuQuery.empty) return fromDoc<InventoryItem>(skuQuery.docs[0]);

        // Pattern 3: Standard Clean Lookup (Matches by slugified title, SKU, or ID)
        const allItems = await getInventoryItems();
        const inCache = allItems.find(item =>
            slugify(item.title) === cleanSku.toLowerCase() ||
            item.sku?.toLowerCase() === cleanSku.toLowerCase() ||
            item.id?.toLowerCase() === cleanSku.toLowerCase()
        );
        if (inCache) return inCache;

        // Pattern 4: Bulletproof Firestore Fallback (Real-time query if cache misses)
        // This handles cases where items were just added or cache is slightly stale.
        const directMatch = await db.collection("inventory").where("sku", "==", cleanSku).limit(1).get();
        if (!directMatch.empty) return fromDoc<InventoryItem>(directMatch.docs[0]);

        // Attempt by direct ID (bullet fast)
        // Pattern 5: Intelligent Fuzzy Match (The "Failsafe")
        // If exact match failed, check if the cleanSku is a truncated version or prefix of a real product.
        // This solves the "Trailing Hyphen" and "150-char cut-off" issues.
        const fuzzyMatch = allItems.find(item => {
            const itemSlug = slugify(item.title);
            if (!itemSlug) return false;
            // Match if one is a prefix of another (common with long titles)
            return itemSlug.startsWith(cleanSku.toLowerCase()) || 
                   cleanSku.toLowerCase().startsWith(itemSlug);
        });
        if (fuzzyMatch) return fuzzyMatch;

        return null;
    }, 1 * 60); // Reduced TTL to 1 minute for detailed SKU lookups to ensure rapid recovery
};

export const addProduct = async (product: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    const docRef = db.collection('inventory').doc(product.sku);
    const newProduct = { ...product, id: product.sku };
    await docRef.set(sanitizePayload(newProduct));
    localStorage.removeItem(CACHE_PREFIX + 'inventory_items');
    return newProduct;
};

export const updateInventoryItem = async (sku: string, updates: Partial<InventoryItem>): Promise<void> => {
    const docRef = db.collection("inventory").doc(sku);
    await docRef.update(sanitizePayload(updates));
    localStorage.removeItem(CACHE_PREFIX + 'inventory_items');
};

export const deleteProduct = async (sku: string): Promise<void> => {
    const docRef = db.collection('inventory').doc(sku);
    await docRef.delete();
    localStorage.removeItem(CACHE_PREFIX + 'inventory_items');
};

export const clearAndSeedInventory = async (items: InventoryItem[]): Promise<number> => {
    const snapshot = await db.collection("inventory").get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));

    let count = 0;
    for (const item of items) {
        const docRef = db.collection("inventory").doc(item.sku);
        batch.set(docRef, sanitizePayload(item));
        count++;
    }
    await batch.commit();
    return count;
};

export const seedInventory = async (items: InventoryItem[]): Promise<number> => {
    let count = 0;
    const batch = db.batch();
    for (const item of items) {
        const docRef = db.collection("inventory").doc(item.sku);
        batch.set(docRef, sanitizePayload(item));
        count++;
    }
    await batch.commit();
    return count;
};

// --- CATEGORIES ---
export const getCategories = async (): Promise<Category[]> => {
    return withCache('categories', async () => {
        const snapshot = await db.collection("categories").get();
        return snapshot.docs.map(doc => fromDoc<Category>(doc)).sort((a, b) => a.name.localeCompare(b.name));
    }, ONE_HOUR_TTL);
};

export const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    const docRef = db.collection('categories').doc();
    const newCategory: Category = { ...categoryData, id: docRef.id };
    await docRef.set(sanitizePayload(newCategory));
    localStorage.removeItem(CACHE_PREFIX + 'categories');
    return newCategory;
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
    const docRef = db.collection('categories').doc(id);
    await docRef.update(sanitizePayload(updates));
    localStorage.removeItem(CACHE_PREFIX + 'categories');
};

export const deleteCategory = async (id: string): Promise<void> => {
    const docRef = db.collection('categories').doc(id);
    await docRef.delete();
    localStorage.removeItem(CACHE_PREFIX + 'categories');
};

// --- BRANDS ---
export const getBrands = async (): Promise<Brand[]> => {
    return withCache('brands', async () => {
        const snapshot = await db.collection("brands").orderBy("name").get();
        return snapshot.docs.map(doc => fromDoc<Brand>(doc));
    }, ONE_HOUR_TTL);
};

export const addBrand = async (brandData: Omit<Brand, 'id'>): Promise<Brand> => {
    const docRef = db.collection('brands').doc();
    const newBrand: Brand = { ...brandData, id: docRef.id };
    await docRef.set(sanitizePayload(newBrand));
    localStorage.removeItem(CACHE_PREFIX + 'brands');
    return newBrand;
};

export const updateBrand = async (id: string, updates: Partial<Brand>): Promise<void> => {
    const docRef = db.collection("brands").doc(id);
    await docRef.update(sanitizePayload(updates));
    localStorage.removeItem(CACHE_PREFIX + 'brands');
};

export const deleteBrand = async (id: string): Promise<void> => {
    await db.collection("brands").doc(id).delete();
    localStorage.removeItem(CACHE_PREFIX + 'brands');
};

export const seedBrands = async (brands: { name: string, logo: string }[]): Promise<number> => {
    let count = 0;
    const batch = db.batch();
    for (const b of brands) {
        const ref = db.collection("brands").doc(b.name.toLowerCase());
        batch.set(ref, b);
        count++;
    }
    await batch.commit();
    return count;
};

// --- VALUATION BASELINES ---
export const getValuationForDevice = async (brand: string, model: string, ram: number, storage: number): Promise<number | null> => {
    try {
        let q = db.collection("valuationBaselines").where("model", "==", model);
        let snapshot = await q.get();

        if (snapshot.empty) {
            q = db.collection("valuationBaselines").where("brand", "==", brand);
            snapshot = await q.get();
        }

        if (snapshot.empty) return null;

        const candidates = snapshot.docs.map(doc => doc.data());
        const cleanString = (str: string) => str.toLowerCase().trim();
        const brandLower = cleanString(brand);

        const normalizeModel = (modelStr: string) => {
            let s = cleanString(modelStr);
            if (s.startsWith(brandLower)) {
                s = s.substring(brandLower.length).trim();
            }
            return s;
        };

        const targetModel = normalizeModel(model);

        const match = candidates.find(item => {
            const itemModel = normalizeModel(String(item.model));
            if (itemModel !== targetModel) return false;
            if (item.storage_gb != storage) return false;
            if (ram > 0 && item.ram_gb > 0) {
                if (item.ram_gb != ram) return false;
            }
            return true;
        });

        return match ? Number(match.baseline_npr) : null;

    } catch (e) {
        console.error("Valuation lookup failed:", e);
        return null;
    }
};

export const getValuationBaselines = async (): Promise<ValuationBaseline[]> => {
    return withCache('valuation_baselines', async () => {
        const snapshot = await db.collection("valuationBaselines").get();
        return snapshot.docs.map(doc => fromDoc<ValuationBaseline>(doc));
    }, ONE_HOUR_TTL);
};

export const addValuationBaseline = async (data: Omit<ValuationBaseline, 'id'>): Promise<void> => {
    const id = `${data.brand}-${data.model}-${data.ram_gb}-${data.storage_gb}`.replace(/[\s\/]+/g, '-').toLowerCase();
    await db.collection("valuationBaselines").doc(id).set(sanitizePayload({ ...data, id }));
    localStorage.removeItem(CACHE_PREFIX + 'valuation_baselines');
};

export const updateValuationBaseline = async (id: string, updates: Partial<ValuationBaseline>): Promise<void> => {
    await db.collection("valuationBaselines").doc(id).update(sanitizePayload(updates));
    localStorage.removeItem(CACHE_PREFIX + 'valuation_baselines');
};

export const deleteValuationBaseline = async (id: string): Promise<void> => {
    await db.collection("valuationBaselines").doc(id).delete();
    localStorage.removeItem(CACHE_PREFIX + 'valuation_baselines');
};

export const seedValuations = async (items: any[]): Promise<number> => {
    if (!items || items.length === 0) return 0;
    let count = 0;
    const batch = db.batch();
    for (const item of items) {
        const id = `${item.brand}-${item.model}-${item.ram_gb}-${item.storage_gb}`.replace(/[\s\/]+/g, '-').toLowerCase();
        const ref = db.collection("valuationBaselines").doc(id);
        batch.set(ref, sanitizePayload({ ...item, id }));
        count++;
    }
    await batch.commit();
    return count;
}

export const getValuationDeductions = async (): Promise<ValuationDeduction[]> => {
    return withCache('valuation_deductions', async () => {
        const snapshot = await db.collection("valuationDeductions").get();
        return snapshot.docs.map(doc => fromDoc<ValuationDeduction>(doc));
    }, ONE_HOUR_TTL);
};

export const updateValuationDeduction = async (id: string, applePercentage: number, androidPercentage: number): Promise<void> => {
    await db.collection("valuationDeductions").doc(id).update({ applePercentage, androidPercentage });
};

export const seedValuationDeductions = async (items: ValuationDeduction[]): Promise<number> => {
    let count = 0;
    const batch = db.batch();
    for (const item of items) {
        const ref = db.collection("valuationDeductions").doc(item.id);
        batch.set(ref, sanitizePayload(item));
        count++;
    }
    await batch.commit();
    return count;
};

// --- SELL MODELS ---
export const getSellModels = async (): Promise<SellModel[]> => {
    return withCache('sell_models', async () => {
        const snapshot = await db.collection("sellModels").get();
        const models = snapshot.docs.map(doc => fromDoc<SellModel>(doc));
        models.sort((a, b) => {
            if (a.brand < b.brand) return -1;
            if (a.brand > b.brand) return 1;
            return a.name.localeCompare(b.name);
        });
        return models;
    }, ONE_HOUR_TTL);
};

export const getSellModelsByBrand = async (brand: string): Promise<SellModel[]> => {
    const q = db.collection("sellModels").where("brand", "==", brand);
    const snapshot = await q.get();
    const models = snapshot.docs.map(doc => fromDoc<SellModel>(doc));
    models.sort((a, b) => a.name.localeCompare(b.name));
    return models;
};

export const addSellModel = async (modelData: Omit<SellModel, 'id'>): Promise<SellModel> => {
    const docRef = db.collection('sellModels').doc();
    const newModel: SellModel = { ...modelData, id: docRef.id };
    await docRef.set(sanitizePayload(newModel));
    localStorage.removeItem(CACHE_PREFIX + 'sell_models');
    return newModel;
};

export const updateSellModel = async (id: string, updates: Partial<SellModel>): Promise<void> => {
    const docRef = db.collection("sellModels").doc(id);
    await docRef.update(sanitizePayload(updates));
    localStorage.removeItem(CACHE_PREFIX + 'sell_models');
};

export const deleteSellModel = async (id: string): Promise<void> => {
    const docRef = db.collection('sellModels').doc(id);
    await docRef.delete();
    localStorage.removeItem(CACHE_PREFIX + 'sell_models');
};

// --- ORDERS ---
export const getOrders = async (): Promise<Order[]> => {
    const snapshot = await db.collection("orders").orderBy("date", "desc").get();
    return snapshot.docs.map(doc => fromDoc<Order>(doc));
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    const q = db.collection("orders").where("userId", "==", userId);
    const snapshot = await q.get();
    return snapshot.docs.map(doc => fromDoc<Order>(doc));
};

export const addOrder = async (orderData: Omit<Order, 'date' | 'status'>): Promise<Order> => {
    const status: Order['status'] = orderData.paymentMethod === 'Fonepay' ? 'Payment Pending' : 'Processing';
    const newOrderPayload: any = {
        id: orderData.id,
        customerDetails: orderData.customerDetails,
        items: orderData.items.map(item => JSON.parse(JSON.stringify(item))),
        total: orderData.total,
        status: status,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: orderData.paymentMethod,
        discountApplied: orderData.discountApplied || 0,
        couponCode: orderData.couponCode || null,
    };
    if (orderData.userId) newOrderPayload.userId = orderData.userId;
    if (orderData.paymentProofData) newOrderPayload.paymentProofData = orderData.paymentProofData;
    if (orderData.codFee) newOrderPayload.codFee = orderData.codFee;

    const finalOrder = newOrderPayload as Order;
    const safePayload = sanitizePayload(finalOrder);

    const batch = db.batch();
    const orderRef = db.collection("orders").doc(orderData.id);
    batch.set(orderRef, safePayload);

    for (const item of orderData.items) {
        const productRef = db.collection('inventory').doc(item.sku);
        batch.update(productRef, {
            soldCount: firebase.firestore.FieldValue.increment(item.quantity)
        });
    }

    await batch.commit();
    localStorage.removeItem(CACHE_PREFIX + 'inventory_items');
    return finalOrder;
};

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<void> => {
    const docRef = db.collection("orders").doc(orderId);
    await docRef.update(sanitizePayload(updates));
};

export const cancelOrder = async (orderId: string): Promise<void> => {
    await db.collection("orders").doc(orderId).update({ status: 'Cancelled' });
};

export const findOrderOrTradeIn = async (id: string): Promise<Order | TradeIn | null> => {
    const normalizedId = id.trim().toUpperCase();
    let docRef;
    if (normalizedId.startsWith('ORD-')) {
        docRef = db.collection("orders").doc(normalizedId);
    } else if (normalizedId.startsWith('TRD-')) {
        docRef = db.collection("tradeIns").doc(normalizedId);
    } else {
        return null;
    }
    const docSnap = await docRef.get();
    return docSnap.exists ? (docSnap.data() as Order | TradeIn) : null;
};

// --- TRADE-INS ---
export const getTradeIns = async (): Promise<TradeIn[]> => {
    const snapshot = await db.collection("tradeIns").orderBy("date", "desc").get();
    return snapshot.docs.map(doc => fromDoc<TradeIn>(doc));
};

export const addTradeIn = async (tradeIn: Omit<TradeIn, 'id' | 'date' | 'status'>): Promise<TradeIn> => {
    const tradeInId = `TRD-${Date.now()}`;
    const newTradeIn: TradeIn = {
        ...tradeIn,
        id: tradeInId,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending Pickup',
    };
    const docRef = db.collection("tradeIns").doc(tradeInId);
    await docRef.set(sanitizePayload(newTradeIn));
    return newTradeIn;
};

export const updateTradeIn = async (tradeInId: string, updates: Partial<TradeIn>): Promise<void> => {
    const docRef = db.collection("tradeIns").doc(tradeInId);
    await docRef.update(sanitizePayload(updates));
};

// --- OFFLINE SALES ---
export const addOfflineSale = async (sale: Omit<OfflineSale, 'id'>): Promise<void> => {
    const docRef = db.collection('offlineSales').doc();
    const batch = db.batch();

    batch.set(docRef, sanitizePayload({ ...sale, id: docRef.id }));

    if (sale.itemId) {
        const productRef = db.collection('inventory').doc(sale.itemId);
        const doc = await productRef.get();
        if (doc.exists) {
            batch.update(productRef, {
                soldCount: firebase.firestore.FieldValue.increment(sale.quantity)
            });
        }
    }

    await batch.commit();
};

export const getOfflineSales = async (): Promise<OfflineSale[]> => {
    const snapshot = await db.collection("offlineSales").orderBy("date", "desc").get();
    return snapshot.docs.map(doc => fromDoc<OfflineSale>(doc));
};

export const updateOfflineSale = async (id: string, updates: Partial<OfflineSale>): Promise<void> => {
    await db.collection('offlineSales').doc(id).update(sanitizePayload(updates));
};

export const deleteOfflineSale = async (id: string): Promise<void> => {
    await db.collection('offlineSales').doc(id).delete();
};

// --- STORE STOCK ---
export const getStoreStockItems = async (): Promise<StoreStockItem[]> => {
    const snapshot = await db.collection("storeStock").orderBy("name").get();
    return snapshot.docs.map(doc => fromDoc<StoreStockItem>(doc));
};

export const addStoreStockItem = async (itemData: Omit<StoreStockItem, 'id'>): Promise<StoreStockItem> => {
    const docRef = db.collection('storeStock').doc();
    const newItem: StoreStockItem = { ...itemData, id: docRef.id };
    await docRef.set(sanitizePayload(newItem));
    return newItem;
};

export const updateStoreStockItem = async (id: string, updates: Partial<StoreStockItem>): Promise<void> => {
    const docRef = db.collection("storeStock").doc(id);
    await docRef.update(sanitizePayload(updates));
};

export const deleteStoreStockItem = async (id: string): Promise<void> => {
    const docRef = db.collection('storeStock').doc(id);
    await docRef.delete();
};

// --- USERS ---
export const getUsers = async (): Promise<User[]> => {
    const snapshot = await db.collection("users").get();
    return snapshot.docs.map(doc => fromDoc<User>(doc));
};

export const deleteUser = async (userId: string): Promise<void> => {
    const docRef = db.collection('users').doc(userId);
    await docRef.delete();
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    const docRef = db.collection('users').doc(userId);
    await docRef.update(sanitizePayload(updates));
};

export const getUserByReferralCode = async (code: string): Promise<User | null> => {
    const snapshot = await db.collection("users").where("referralCode", "==", code).limit(1).get();
    if (snapshot.empty) return null;
    return fromDoc<User>(snapshot.docs[0]);
};

export const addPoints = async (userId: string, points: number): Promise<void> => {
    const userRef = db.collection("users").doc(userId);
    await userRef.update({ points: firebase.firestore.FieldValue.increment(points) });
};

// --- ADDRESSES ---
export const getAddresses = async (userId: string): Promise<Address[]> => {
    const snapshot = await db.collection("users").doc(userId).collection("addresses").get();
    return snapshot.docs.map(doc => fromDoc<Address>(doc));
};

export const addAddress = async (userId: string, address: Omit<Address, 'id'>): Promise<Address> => {
    const docRef = db.collection("users").doc(userId).collection("addresses").doc();
    const newAddress = { ...address, id: docRef.id };
    await docRef.set(sanitizePayload(newAddress));
    if (newAddress.isDefault) { await setDefaultAddress(userId, docRef.id); }
    return newAddress;
};

export const updateAddress = async (userId: string, addressId: string, updates: Partial<Address>): Promise<void> => {
    await db.collection("users").doc(userId).collection("addresses").doc(addressId).update(sanitizePayload(updates));
    if (updates.isDefault) { await setDefaultAddress(userId, addressId); }
};

export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
    await db.collection("users").doc(userId).collection("addresses").doc(addressId).delete();
};

export const setDefaultAddress = async (userId: string, addressId: string): Promise<void> => {
    const addressesRef = db.collection("users").doc(userId).collection("addresses");
    const snapshot = await addressesRef.get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        const data = doc.data() as Address;
        if (doc.id !== addressId && data.isDefault) {
            batch.update(doc.ref, { isDefault: false });
        } else if (doc.id === addressId && !data.isDefault) {
            batch.update(doc.ref, { isDefault: true });
        }
    });
    await batch.commit();
};

// --- COUPONS ---
export const getCoupons = async (): Promise<Coupon[]> => {
    return withCache('coupons', async () => {
        const snapshot = await db.collection('coupons').orderBy('expiryDate', 'asc').get();
        return snapshot.docs.map(doc => fromDoc<Coupon>(doc));
    }, ONE_HOUR_TTL);
};

export const addCoupon = async (couponData: Omit<Coupon, 'id'>): Promise<Coupon> => {
    const docRef = db.collection('coupons').doc(couponData.code);
    const newCoupon = { ...couponData, id: docRef.id };
    await docRef.set(sanitizePayload(newCoupon));
    localStorage.removeItem(CACHE_PREFIX + 'coupons');
    return newCoupon;
};

export const deleteCoupon = async (id: string): Promise<void> => {
    const docRef = db.collection('coupons').doc(id);
    await docRef.delete();
    localStorage.removeItem(CACHE_PREFIX + 'coupons');
};

export const validateCoupon = async (code: string): Promise<Coupon | null> => {
    const docRef = db.collection('coupons').doc(code);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return null;
    const coupon = fromDoc<Coupon>(docSnap);
    if (!coupon.isActive) return null;
    const expiry = new Date(coupon.expiryDate);
    expiry.setHours(23, 59, 59, 999);
    if (expiry < new Date()) return null;
    return coupon;
};

// --- REFERRALS ---
export const createReferral = async (referral: Omit<Referral, 'id'>): Promise<void> => {
    const docRef = db.collection("referrals").doc();
    await docRef.set(sanitizePayload({ ...referral, id: docRef.id }));
};

export const getPendingReferrals = async (): Promise<Referral[]> => {
    const snapshot = await db.collection("referrals").where("status", "==", "Pending").get();
    const refs = snapshot.docs.map(doc => fromDoc<Referral>(doc));
    return refs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const getUserReferrals = async (userId: string): Promise<Referral[]> => {
    const snapshot = await db.collection("referrals").where("referrerId", "==", userId).get();
    const refs = snapshot.docs.map(doc => fromDoc<Referral>(doc));
    return refs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const updateReferralStatus = async (referralId: string, status: Referral['status']): Promise<void> => {
    await db.collection("referrals").doc(referralId).update({ status });
}

// --- BANNERS ---
export const getBanners = async (): Promise<Banner[]> => {
    return withCache('banners', async () => {
        const snapshot = await db.collection("banners").get();
        return snapshot.docs.map(doc => fromDoc<Banner>(doc));
    }, ONE_HOUR_TTL);
};

export const addBanner = async (bannerData: Omit<Banner, 'id'>): Promise<Banner> => {
    const docRef = db.collection('banners').doc();
    const newBanner: Banner = { ...bannerData, id: docRef.id };
    await docRef.set(sanitizePayload(newBanner));
    localStorage.removeItem(CACHE_PREFIX + 'banners');
    return newBanner;
};

export const deleteBanner = async (id: string): Promise<void> => {
    const docRef = db.collection('banners').doc(id);
    await docRef.delete();
    localStorage.removeItem(CACHE_PREFIX + 'banners');
};

// --- NOTIFICATIONS ---
export const addGlobalNotification = async (notificationData: Omit<GlobalNotification, 'id' | 'createdAt'>): Promise<GlobalNotification> => {
    const docRef = db.collection('globalNotifications').doc();
    const newNotification: GlobalNotification = {
        ...notificationData,
        id: docRef.id,
        createdAt: new Date().toISOString(),
    };
    await docRef.set(sanitizePayload(newNotification));
    return newNotification;
};

export const deleteGlobalNotification = async (id: string): Promise<void> => {
    const docRef = db.collection('globalNotifications').doc(id);
    await docRef.delete();
};

// --- BLOG POSTS ---
export const getBlogPosts = async (): Promise<BlogPost[]> => {
    return withCache('blog_posts', async () => {
        const snapshot = await db.collection("blogPosts").orderBy("date", "desc").get();
        return snapshot.docs.map(doc => fromDoc<BlogPost>(doc));
    }, ONE_HOUR_TTL);
};

// --- DARAZ-STYLE SEO PERMALINKS ---
// PRO TIP: Including the unique ID in the URL makes lookups INSTANT (Bullet Fast) 
// and ensures Google never sees a "duplicate" page even if titles are similar.
export const getProductPermalink = (item: InventoryItem) => {
    // Generate an ultra-clean, keyword-rich slug (no IDs, no duplicates, no uppercase)
    const cleanSlug = slugify(item.title);
    return `/product/${cleanSlug}`;
};

export const getBlogPermalink = (post: BlogPost) => {
    const slug = slugify(post.title || 'post');
    return `/blog/${slug}-bp${post.id}`;
};

/**
 * PING GOOGLE INDEXING (SPARK-FRIENDLY)
 * Since you are on the Spark Plan (Free), Cloud Functions are not available.
 * Instead of failing, we provide a message that indexing is handled by the sitemap.
 */
export const pingGoogleIndexing = async (url: string) => {
    // Standard sitemap pings are the best way for Spark users.
    // We already generate a fresh sitemap during 'npm run build'.
    console.log(`ℹ️ Spark Plan: Automatic Indexing API Ping skipped for ${url}`);
    console.log(`👉 Professional Tip: Just run 'npm run build' and deploy to Hosting.`);
    return { success: true, message: "Spark Plan Mode: Handled via Sitemap" };
};

export const getBlogPostBySlug = async (rawSlug: string): Promise<BlogPost | undefined> => {
    if (!rawSlug) return undefined;
    
    // 0. Clean the slug (decode URI, remove .html, remove trailing slash)
    const cleanSlug = decodeURIComponent(String(rawSlug)).toLowerCase().replace('.html', '').replace(/\/+$/, '');
    const baseSlug = cleanSlug.includes('-bp') ? cleanSlug.split('-bp')[0] : cleanSlug;
    const bpId = cleanSlug.includes('-bp') ? cleanSlug.split('-bp').pop() : null;

    // 1. Try Daraz-style ID match (-bp[ID])
    if (bpId) {
        try {
            const docSnap = await db.collection("blogPosts").doc(bpId).get();
            if (docSnap.exists) return fromDoc<BlogPost>(docSnap);
        } catch (e) {}
    }

    // 2. Try direct Document ID match (Fastest)
    try {
        const docSnap = await db.collection("blogPosts").doc(cleanSlug).get();
        if (docSnap.exists) return fromDoc<BlogPost>(docSnap);
    } catch (e) {}

    // 3. Try 'slug' field query on cleanSlug or baseSlug
    try {
        const q1 = await db.collection("blogPosts").where("slug", "==", cleanSlug).limit(1).get();
        if (!q1.empty) return fromDoc<BlogPost>(q1.docs[0]);

        if (baseSlug !== cleanSlug) {
            const q2 = await db.collection("blogPosts").where("slug", "==", baseSlug).limit(1).get();
            if (!q2.empty) return fromDoc<BlogPost>(q2.docs[0]);
        }
    } catch (e) {}

    // 4. Last chance: Search all and match by slugified title
    const all = await getBlogPosts();
    return all.find(b => {
        const bSlug = (b.slug || '').toLowerCase();
        const titleSlug = slugify(b.title || '').toLowerCase();
        return bSlug === cleanSlug || bSlug === baseSlug || titleSlug === cleanSlug || titleSlug === baseSlug || b.id === bpId;
    });
};

export const addBlogPost = async (postData: Omit<BlogPost, 'id'>): Promise<BlogPost> => {
    const docRef = db.collection('blogPosts').doc(postData.slug);
    const newPost: BlogPost = { ...postData, id: postData.slug };
    await docRef.set(sanitizePayload(newPost));
    localStorage.removeItem(CACHE_PREFIX + 'blog_posts');
    return newPost;
};

export const updateBlogPost = async (slug: string, updates: Partial<BlogPost>): Promise<void> => {
    const docRef = db.collection('blogPosts').doc(slug);
    await docRef.update(sanitizePayload(updates));
    localStorage.removeItem(CACHE_PREFIX + 'blog_posts');
};

export const deleteBlogPost = async (slug: string): Promise<void> => {
    const docRef = db.collection('blogPosts').doc(slug);
    await docRef.delete();
    localStorage.removeItem(CACHE_PREFIX + 'blog_posts');
};

export const seedBlogPosts = async (posts: BlogPost[]): Promise<number> => {
    let count = 0;
    const batch = db.batch();
    for (const post of posts) {
        const docRef = db.collection("blogPosts").doc(post.slug);
        batch.set(docRef, sanitizePayload(post));
        count++;
    }
    await batch.commit();
    return count;
};

// --- CONTACT MESSAGES ---
export const addContactMessage = async (messageData: Omit<ContactMessage, 'id' | 'date' | 'status'>): Promise<ContactMessage> => {
    const docRef = db.collection('contacts').doc();
    const newMessage: ContactMessage = {
        ...messageData,
        id: docRef.id,
        date: new Date().toISOString().split('T')[0],
        status: 'New',
    };
    await docRef.set(sanitizePayload(newMessage));
    return newMessage;
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
    const snapshot = await db.collection('contacts').orderBy('date', 'desc').get();
    return snapshot.docs.map(doc => fromDoc<ContactMessage>(doc));
};

export const updateContactMessageStatus = async (id: string, status: ContactMessage['status']): Promise<void> => {
    const docRef = db.collection('contacts').doc(id);
    await docRef.update({ status });
};

// --- REPAIR BOOKINGS ---
export const getRepairBookings = async (): Promise<RepairBooking[]> => {
    const snapshot = await db.collection("repairBookings").orderBy("appointmentDate", "asc").get();
    return snapshot.docs.map(doc => fromDoc<RepairBooking>(doc));
};

export const addRepairBooking = async (booking: Omit<RepairBooking, 'id' | 'status' | 'createdAt'>): Promise<void> => {
    const docRef = db.collection('repairBookings').doc();
    const newBooking: RepairBooking = {
        ...booking,
        id: docRef.id,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    await docRef.set(sanitizePayload(newBooking));
};

export const updateRepairBookingStatus = async (id: string, status: RepairBooking['status']): Promise<void> => {
    await db.collection('repairBookings').doc(id).update({ status });
};

// --- PRODUCT REQUESTS ---
export const addProductRequest = async (request: Omit<ProductRequest, 'id' | 'createdAt' | 'status'>): Promise<void> => {
    const docRef = db.collection('productRequests').doc();
    const newRequest: ProductRequest = {
        ...request,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        status: 'Pending'
    };
    await docRef.set(sanitizePayload(newRequest));
};

export const getProductRequests = async (): Promise<ProductRequest[]> => {
    const snapshot = await db.collection('productRequests').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => fromDoc<ProductRequest>(doc));
};

export const updateProductRequestStatus = async (id: string, status: ProductRequest['status']): Promise<void> => {
    await db.collection('productRequests').doc(id).update({ status });
};

// --- REDEMPTION REQUESTS ---
export const addRedemptionRequest = async (request: Omit<RedemptionRequest, 'id' | 'date' | 'status'>): Promise<void> => {
    const docRef = db.collection('redemptionRequests').doc();
    const newRequest = {
        ...request,
        id: docRef.id,
        date: new Date().toISOString(),
        status: 'Pending'
    };
    await docRef.set(sanitizePayload(newRequest));
};

export const getRedemptionRequests = async (): Promise<RedemptionRequest[]> => {
    const snapshot = await db.collection('redemptionRequests').orderBy('date', 'desc').get();
    return snapshot.docs.map(doc => fromDoc<RedemptionRequest>(doc));
};

export const processRedemption = async (requestId: string, userId: string): Promise<void> => {
    const batch = db.batch();
    const requestRef = db.collection('redemptionRequests').doc(requestId);
    batch.update(requestRef, { status: 'Completed' });

    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, { points: 0 });

    await batch.commit();
};

// --- SPIN WHEEL ---
export const getSpinWheelConfig = async (): Promise<SpinWheelConfig | null> => {
    return withCache('spin_wheel_config', async () => {
        const docRef = db.collection('spinWheel').doc('config');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data() as SpinWheelConfig;
        }
        return null;
    }, ONE_HOUR_TTL);
};

export const updateSpinWheelConfig = async (config: SpinWheelConfig): Promise<void> => {
    await db.collection('spinWheel').doc('config').set(sanitizePayload(config));
    localStorage.removeItem(CACHE_PREFIX + 'spin_wheel_config');
};

export const recordSpinResult = async (userId: string, prize: string): Promise<void> => {
    try {
        await db.collection('spinHistory').add({
            userId,
            prize,
            date: new Date().toISOString()
        });
    } catch (e) {
        console.warn("recordSpinResult warning:", e);
    }
};

export const getSpinWheelStats = async (): Promise<any> => {
    const snapshot = await db.collection('spinHistory').get();
    const dailyMap: Record<string, any> = {};
    const rewardMap: Record<string, any> = {};

    snapshot.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.date).toISOString().slice(0, 10);
        if (!dailyMap[date]) dailyMap[date] = { totalSpins: 0, users: new Set() };
        dailyMap[date].totalSpins++;
        dailyMap[date].users.add(data.userId);

        if (!rewardMap[data.prize]) rewardMap[data.prize] = { label: data.prize, timesWon: 0, type: 'unknown' };
        rewardMap[data.prize].timesWon++;
    });

    return {
        daily: Object.keys(dailyMap).map(date => ({ date, totalSpins: dailyMap[date].totalSpins, uniqueUsers: dailyMap[date].users.size })),
        rewards: Object.values(rewardMap)
    };
};

export const registerForSpin = async (data: Omit<SpinParticipant, 'id' | 'status' | 'spinsAllocated' | 'spinsUsed' | 'createdAt'>): Promise<void> => {
    const docRef = db.collection('spinParticipants').doc(data.userId);
    const newParticipant: SpinParticipant = {
        ...data,
        id: data.userId,
        status: 'Pending',
        spinsAllocated: 0,
        spinsUsed: 0,
        createdAt: new Date().toISOString()
    };
    await docRef.set(sanitizePayload(newParticipant));
};

export const getSpinParticipant = async (userId: string): Promise<SpinParticipant | null> => {
    try {
        const docRef = db.collection('spinParticipants').doc(userId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data() as SpinParticipant;
        }
        return null;
    } catch (e) {
        console.warn("getSpinParticipant warning:", e);
        return null;
    }
};

export const getAllSpinParticipants = async (): Promise<SpinParticipant[]> => {
    try {
        const snapshot = await db.collection('spinParticipants').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => fromDoc<SpinParticipant>(doc));
    } catch (e) {
        console.warn("getAllSpinParticipants warning:", e);
        return [];
    }
};

export const updateSpinParticipantStatus = async (userId: string, updates: Partial<SpinParticipant>): Promise<void> => {
    const docRef = db.collection('spinParticipants').doc(userId);
    await docRef.update(sanitizePayload(updates));
};

export const incrementSpinUsage = async (userId: string): Promise<void> => {
    try {
        const docRef = db.collection('spinParticipants').doc(userId);
        await docRef.update({
            spinsUsed: firebase.firestore.FieldValue.increment(1)
        });
    } catch (e) {
        console.warn("incrementSpinUsage warning:", e);
    }
};

export const claimSocialReward = async (userId: string, platform: string, points: number): Promise<boolean> => {
    const userRef = db.collection("users").doc(userId);
    try {
        let alreadyClaimed = false;
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) throw new Error("User not found");
            const userData = userDoc.data();
            const claimed = userData?.claimedRewards || {};
            if (claimed[platform]) {
                alreadyClaimed = true;
                return;
            }
            transaction.update(userRef, {
                [`claimedRewards.${platform}`]: true,
                points: firebase.firestore.FieldValue.increment(points)
            });
        });
        return !alreadyClaimed;
    } catch (e) {
        return false;
    }
};

// --- SETTINGS (Daraz, Pathao, Payment Partners, Shop) ---
export const getDarazConfig = async (): Promise<DarazConfig> => {
    return withCache('daraz_config', async () => {
        const docRef = db.collection('settings').doc('daraz');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data() as DarazConfig;
        }
        return {
            enabled: true,
            shopUrl: 'https://www.daraz.com.np/shop/tkj7ryvb?dsource=share&laz_share_info=2286145336_100_3000_0_2286147336_null&laz_token=7e86d12f4a13ec2c3bd57e14911e3be9',
            logoUrl: 'https://icms-image.slatic.net/images/ims-web/3e97c801-6939-422a-b74e-59d4b9975371.png'
        };
    }, ONE_HOUR_TTL);
};

export const updateDarazConfig = async (config: DarazConfig): Promise<void> => {
    await db.collection('settings').doc('daraz').set(sanitizePayload(config));
    localStorage.removeItem(CACHE_PREFIX + 'daraz_config');
};

export const getPathaoConfig = async (): Promise<PathaoConfig> => {
    return withCache('pathao_config', async () => {
        const docRef = db.collection('settings').doc('pathao');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data() as PathaoConfig;
        }
        return {
            clientId: '',
            clientSecret: '',
            username: '',
            password: '',
            isEnabled: false
        };
    }, ONE_HOUR_TTL);
};

export const updatePathaoConfig = async (config: PathaoConfig): Promise<void> => {
    await db.collection('settings').doc('pathao').set(sanitizePayload(config));
    localStorage.removeItem(CACHE_PREFIX + 'pathao_config');
};

export const getPaymentPartners = async (): Promise<PaymentPartner[]> => {
    return withCache('payment_partners', async () => {
        const snapshot = await db.collection('paymentPartners').get();
        if (snapshot.empty) {
            return [
                { id: 'fonepay', name: 'Fonepay', logoUrl: 'https://f1.kwayisi.org/nepal/fonepay.png' },
                { id: 'esewa', name: 'eSewa', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.png' },
                { id: 'khalti', name: 'Khalti', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Khalti_Digital_Wallet_Logo.png' }
            ];
        }
        return snapshot.docs.map(doc => fromDoc<PaymentPartner>(doc));
    }, ONE_HOUR_TTL);
};

export const addPaymentPartner = async (partner: Omit<PaymentPartner, 'id'>): Promise<PaymentPartner> => {
    const docRef = db.collection('paymentPartners').doc();
    const newPartner = { ...partner, id: docRef.id };
    await docRef.set(sanitizePayload(newPartner));
    localStorage.removeItem(CACHE_PREFIX + 'payment_partners');
    return newPartner;
};

export const deletePaymentPartner = async (id: string): Promise<void> => {
    await db.collection('paymentPartners').doc(id).delete();
    localStorage.removeItem(CACHE_PREFIX + 'payment_partners');
};

export const getShopSetting = async (shopLocation: string): Promise<{ logoUrl?: string } | null> => {
    return withCache(`shop_settings_${shopLocation.toLowerCase()}`, async () => {
        const docRef = db.collection('settings').doc(`shop_${shopLocation.toLowerCase()}`);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data() as { logoUrl?: string };
        }
        return null;
    }, ONE_HOUR_TTL);
}

export const updateShopSetting = async (shopLocation: string, updates: { logoUrl: string }): Promise<void> => {
    await db.collection('settings').doc(`shop_${shopLocation.toLowerCase()}`).set(sanitizePayload(updates), { merge: true });
    localStorage.removeItem(CACHE_PREFIX + `shop_settings_${shopLocation.toLowerCase()}`);
};

export const getShopBanner = async (shopLocation: string): Promise<string> => {
    return withCache(`shop_banner_${shopLocation.toLowerCase()}`, async () => {
        const docId = `shop_banner_${shopLocation.toLowerCase().replace(/\s+/g, '_')}`;
        const docRef = db.collection('settings').doc(docId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data()?.imageUrl || '';
        }
        return '';
    }, ONE_HOUR_TTL);
};

export const updateShopBanner = async (shopLocation: string, imageUrl: string): Promise<void> => {
    const docId = `shop_banner_${shopLocation.toLowerCase().replace(/\s+/g, '_')}`;
    await db.collection('settings').doc(docId).set({ imageUrl }, { merge: true });
    localStorage.removeItem(CACHE_PREFIX + `shop_banner_${shopLocation.toLowerCase()}`);
};

// --- ABOUT & LEGAL ---
// --- SANITIZE BRANDING TEXT DYNAMICALLY ---
const sanitizeBrandingText = (text: string): string => {
    if (!text) return '';
    let sanitized = text;
    // Replace "Mobi Store" first to avoid partial matches
    sanitized = sanitized.replace(/Mobi\s+Trash\s+Store/gi, 'Mobi Store');
    // Replace "Mobi Trash"
    sanitized = sanitized.replace(/Mobi\s+Trash/gi, 'Mobi Store');
    // Replace "Bt Mobile Care"
    sanitized = sanitized.replace(/Bt\s+Mobile\s+Care/gi, 'Mobi Store Tech');
    // Replace "Bishal Mishra" or "Dev Bishal"
    sanitized = sanitized.replace(/Bishal\s+Mishra/gi, 'Mobi Store Team');
    sanitized = sanitized.replace(/Dev\s+Bishal/gi, 'Mobi Store Team');
    return sanitized;
};

export const getAboutPageData = async (): Promise<AboutPageConfig> => {
    return withCache('about_data', async () => {
        const docRef = db.collection('settings').doc('about');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data() as AboutPageConfig;
            return {
                leadership: {
                    founder: sanitizeBrandingText(data.leadership?.founder || 'Mobi Store Team'),
                    developedBy: sanitizeBrandingText(data.leadership?.developedBy || 'Mobi Store Team'),
                    established: data.leadership?.established || 'November 25, 2025'
                },
                headquarters: {
                    parentCompany: sanitizeBrandingText(data.headquarters?.parentCompany || 'Mobi Store Tech'),
                    location: sanitizeBrandingText(data.headquarters?.location || 'Naya Bazar, Kirtipur, Kathmandu'),
                    industry: data.headquarters?.industry || 'Consumer Electronics & Re-commerce'
                },
                story: sanitizeBrandingText(data.story || ''),
                contact: {
                    phone1: data.contact?.phone1 || '',
                    phone2: data.contact?.phone2 || '',
                    address: sanitizeBrandingText(data.contact?.address || ''),
                    email: data.contact?.email || 'Support@mobitrashstore.com',
                    hours: data.contact?.hours || ''
                }
            } as AboutPageConfig;
        }
        return {
            leadership: {
                founder: "Mobi Store Team",
                developedBy: "Mobi Store Team",
                established: "November 25, 2025"
            },
            headquarters: {
                parentCompany: "Mobi Store Tech",
                location: "Naya Bazar, Kirtipur, Kathmandu",
                industry: "Consumer Electronics & Re-commerce"
            },
            story: "Mobi Store was born out of a necessity identified by Mobi Store Tech...",
            contact: {
                phone1: "+977 9827801575",
                phone2: "+977 9812141777",
                address: "Mobi Store Tech, Naya Bazar, Kirtipur, Kathmandu 44618, Nepal",
                email: "Support@mobitrashstore.com",
                hours: "Sun - Fri, 10:00 AM - 6:00 PM"
            }
        };
    }, ONE_HOUR_TTL);
};

export const updateAboutPageData = async (data: AboutPageConfig): Promise<void> => {
    const sanitizedData = {
        ...data,
        leadership: data.leadership ? {
            ...data.leadership,
            founder: sanitizeBrandingText(data.leadership.founder),
            developedBy: sanitizeBrandingText(data.leadership.developedBy)
        } : undefined,
        headquarters: data.headquarters ? {
            ...data.headquarters,
            parentCompany: sanitizeBrandingText(data.headquarters.parentCompany),
            location: sanitizeBrandingText(data.headquarters.location)
        } : undefined,
        story: sanitizeBrandingText(data.story || ''),
        contact: data.contact ? {
            ...data.contact,
            address: sanitizeBrandingText(data.contact.address)
        } : undefined
    };
    await db.collection('settings').doc('about').set(sanitizePayload(sanitizedData));
    localStorage.removeItem(CACHE_PREFIX + 'about_data');
};

export const getLegalPage = async (pageId: string): Promise<LegalPageContent | null> => {
    return withCache(`legal_${pageId}`, async () => {
        const docRef = db.collection('settings').doc(pageId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data() as LegalPageContent;
            return {
                id: docSnap.id,
                title: sanitizeBrandingText(data.title),
                content: sanitizeBrandingText(data.content),
                lastUpdated: data.lastUpdated || ''
            } as LegalPageContent;
        }
        return null;
    }, ONE_HOUR_TTL);
};

export const updateLegalPage = async (pageId: string, content: Partial<LegalPageContent>): Promise<void> => {
    const sanitizedContent = {
        ...content,
        title: content.title ? sanitizeBrandingText(content.title) : undefined,
        content: content.content ? sanitizeBrandingText(content.content) : undefined
    };
    await db.collection('settings').doc(pageId).set(
        { ...sanitizePayload(sanitizedContent), lastUpdated: new Date().toISOString().split('T')[0] },
        { merge: true }
    );
    localStorage.removeItem(CACHE_PREFIX + `legal_${pageId}`);
};

// --- GENERIC CONFIG (FOR VISUAL EDITING) ---
export const getGenericConfig = async <T>(collection: string, docId: string, defaultValue: T): Promise<T> => {
    return withCache(`${collection}_${docId}`, async () => {
        const docRef = db.collection(collection).doc(docId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data() as T;
        }
        return defaultValue;
    }, ONE_HOUR_TTL);
};

export const updateGenericConfig = async (collection: string, docId: string, data: any): Promise<void> => {
    await db.collection(collection).doc(docId).set(sanitizePayload(data), { merge: true });
    localStorage.removeItem(CACHE_PREFIX + `${collection}_${docId}`);
};

// --- TESTIMONIALS & REVIEWS ---
export const getTestimonials = async (): Promise<Testimonial[]> => {
    return withCache('testimonials', async () => {
        const snapshot = await db.collection('testimonials').orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => fromDoc<Testimonial>(doc));
    }, ONE_HOUR_TTL);
};

export const addTestimonial = async (data: Omit<Testimonial, 'id'>): Promise<void> => {
    const docRef = db.collection('testimonials').doc();
    await docRef.set(sanitizePayload({ ...data, id: docRef.id }));
    localStorage.removeItem(CACHE_PREFIX + 'testimonials');
};

export const deleteTestimonial = async (id: string): Promise<void> => {
    await db.collection('testimonials').doc(id).delete();
    localStorage.removeItem(CACHE_PREFIX + 'testimonials');
};

export const getProductReviews = async (productId: string): Promise<Review[]> => {
    const q = db.collection("reviews").where("productId", "==", productId);
    const snapshot = await q.get();
    const reviews = snapshot.docs.map(doc => fromDoc<Review>(doc));
    reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return reviews;
};

/**
 * Pings Google Search Console to re-index the sitemap.
 */
export const pingGoogleSitemap = async (): Promise<void> => {
    const sitemapUrl = "https://mobitrashstore.com/sitemap.xml";
    try {
        await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, { mode: 'no-cors' });
        console.log("Sitemap ping sent to Google");
    } catch (e) {
        console.warn("Sitemap ping failed (Expected if blocked by CORS)", e);
    }
};

// --- NOTICE BANNER ---
export const getNoticeBanner = async (): Promise<NoticeBanner> => {
    return withCache('notice_banner', async () => {
        const docRef = db.collection('settings').doc('noticeBanner');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data() as NoticeBanner;
        }
        return {
            id: 'noticeBanner',
            text: 'Welcome to Mobi Store! Get the best deals on certified phones.',
            isStripActive: false,
            isPopupActive: false,
            displayFrequency: 'session',
            targetPage: 'all',
            targetDevice: 'all',
            backgroundColor: '#f97316',
            textColor: '#ffffff',
            showCloseButton: true,
            updatedAt: new Date().toISOString()
        } as NoticeBanner;
    }, 60 * 60 * 1000); // 1 Hour TTL
};

export const updateNoticeBanner = async (banner: NoticeBanner): Promise<void> => {
    await db.collection('settings').doc('noticeBanner').set(sanitizePayload(banner));
    localStorage.removeItem(CACHE_PREFIX + 'notice_banner');
};

export const getAllReviews = async (): Promise<Review[]> => {
    const snapshot = await db.collection("reviews").orderBy("date", "desc").get();
    return snapshot.docs.map(doc => fromDoc<Review>(doc));
};

export const addReview = async (reviewData: Omit<Review, 'id'>): Promise<Review> => {
    const docRef = db.collection('reviews').doc();
    const newReview: Review = { ...reviewData, id: docRef.id };
    await docRef.set(sanitizePayload(newReview));
    return newReview;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
    await db.collection('reviews').doc(reviewId).delete();
};

// --- GALLERY ---
export const getGalleryItems = async (): Promise<GalleryItem[]> => {
    return withCache('gallery_items', async () => {
        const snapshot = await db.collection("gallery").orderBy("createdAt", "desc").get();
        return snapshot.docs.map(doc => fromDoc<GalleryItem>(doc));
    }, ONE_HOUR_TTL);
};

export const addGalleryItem = async (itemData: Omit<GalleryItem, 'id' | 'createdAt'>): Promise<GalleryItem> => {
    const docRef = db.collection("gallery").doc();
    const newItem: GalleryItem = {
        ...itemData,
        id: docRef.id,
        createdAt: new Date().toISOString()
    };
    await docRef.set(sanitizePayload(newItem));
    localStorage.removeItem(CACHE_PREFIX + 'gallery_items');
    return newItem;
};

export const deleteGalleryItem = async (id: string): Promise<void> => {
    await db.collection('gallery').doc(id).delete();
    localStorage.removeItem(CACHE_PREFIX + 'gallery_items');
};

// --- NEWS SOURCES ---
export const getNewsSources = async (): Promise<NewsSource[]> => {
    return withCache('news_sources', async () => {
        const snapshot = await db.collection("newsSources").get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => fromDoc<NewsSource>(doc));
    }, ONE_HOUR_TTL);
};

export const addNewsSource = async (source: Omit<NewsSource, 'id'>): Promise<void> => {
    const docRef = db.collection("newsSources").doc();
    await docRef.set(sanitizePayload({ ...source, id: docRef.id }));
    localStorage.removeItem(CACHE_PREFIX + 'news_sources');
};

export const updateNewsSource = async (id: string, updates: Partial<NewsSource>): Promise<void> => {
    await db.collection("newsSources").doc(id).update(sanitizePayload(updates));
    localStorage.removeItem(CACHE_PREFIX + 'news_sources');
};

export const deleteNewsSource = async (id: string): Promise<void> => {
    await db.collection("newsSources").doc(id).delete();
    localStorage.removeItem(CACHE_PREFIX + 'news_sources');
};

export const seedNewsSources = async (sources: NewsSource[]): Promise<number> => {
    let count = 0;
    const batch = db.batch();
    for (const source of sources) {
        const id = source.id || source.name.toLowerCase().replace(/\s+/g, '-');
        const ref = db.collection("newsSources").doc(id);
        batch.set(ref, sanitizePayload({ ...source, id }));
        count++;
    }
    await batch.commit();
    localStorage.removeItem(CACHE_PREFIX + 'news_sources');
    return count;
};

// --- OFFICIAL NEWS ---
export const getOfficialNews = async (): Promise<OfficialNews[]> => {
    return withCache('official_news', async () => {
        const snapshot = await db.collection("officialNews").orderBy("date", "desc").get();
        return snapshot.docs.map(doc => fromDoc<OfficialNews>(doc));
    }, ONE_MINUTE_TTL);
};

export const addOfficialNews = async (news: Omit<OfficialNews, 'id'>): Promise<void> => {
    const docRef = db.collection("officialNews").doc();
    await docRef.set(sanitizePayload({ ...news, id: docRef.id }));
    localStorage.removeItem(CACHE_PREFIX + 'official_news');
};

export const updateOfficialNews = async (id: string, updates: Partial<OfficialNews>): Promise<void> => {
    await db.collection("officialNews").doc(id).update(sanitizePayload(updates));
    localStorage.removeItem(CACHE_PREFIX + 'official_news');
};

export const deleteOfficialNews = async (id: string): Promise<void> => {
    await db.collection("officialNews").doc(id).delete();
    localStorage.removeItem(CACHE_PREFIX + 'official_news');
};

// --- NOTEBOOK (Khata) ---
export const getNotebookEntries = async (): Promise<NotebookEntry[]> => {
    const snapshot = await db.collection("notebookEntries").orderBy("date", "desc").get();
    return snapshot.docs.map(doc => fromDoc<NotebookEntry>(doc));
};

export const addNotebookEntry = async (entry: Omit<NotebookEntry, 'id'>): Promise<NotebookEntry> => {
    const docRef = db.collection("notebookEntries").doc();
    const newEntry = { ...entry, id: docRef.id };
    await docRef.set(sanitizePayload(newEntry));
    return newEntry;
};

export const updateNotebookEntry = async (id: string, updates: Partial<NotebookEntry>): Promise<void> => {
    await db.collection("notebookEntries").doc(id).update(sanitizePayload(updates));
};

export const deleteNotebookEntry = async (id: string): Promise<void> => {
    await db.collection("notebookEntries").doc(id).delete();
};

export const migrateKhataData = async (): Promise<{ count: number, errors: number }> => {
    try {
        const oldSnapshot = await db.collection('notebook').get();
        if (oldSnapshot.empty) return { count: 0, errors: 0 };

        const batch = db.batch();
        let count = 0;
        let errors = 0;

        oldSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const newRef = db.collection('notebookEntries').doc(doc.id);
            const payload = {
                ...data,
                shopLocation: data.shopLocation || 'Townplanning'
            };
            batch.set(newRef, sanitizePayload(payload), { merge: true });
            count++;
        });
        await batch.commit();
        return { count, errors };
    } catch (e) {
        console.error("Migration failed", e);
        throw e;
    }
};

// --- PROBLEM REPORTS ---
export const getProblemReports = async (): Promise<ProblemReport[]> => {
    const snapshot = await db.collection("problemReports").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => fromDoc<ProblemReport>(doc));
};

export const addProblemReport = async (report: Omit<ProblemReport, 'id' | 'status' | 'createdAt'>): Promise<void> => {
    const docRef = db.collection("problemReports").doc();
    const newReport = {
        ...report,
        id: docRef.id,
        status: 'New',
        createdAt: new Date().toISOString()
    };
    await docRef.set(sanitizePayload(newReport));
};

export const updateProblemReportStatus = async (id: string, status: string): Promise<void> => {
    await db.collection("problemReports").doc(id).update({ status });
};

// --- BROADCAST LOGS ---
export const addBroadcastLog = async (log: Omit<BroadcastLog, 'id' | 'createdAt'>): Promise<void> => {
    const docRef = db.collection('broadcastHistory').doc();
    const newLog = {
        ...log,
        id: docRef.id,
        createdAt: new Date().toISOString()
    };
    await docRef.set(sanitizePayload(newLog));
};

export const getBroadcastLogs = async (): Promise<BroadcastLog[]> => {
    const snapshot = await db.collection('broadcastHistory').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => fromDoc<BroadcastLog>(doc));
};

export const deleteBroadcastLog = async (id: string): Promise<void> => {
    await db.collection('broadcastHistory').doc(id).delete();
};

// --- UTILS ---
export const addPointsByEmail = async (email: string, points: number): Promise<void> => {
    const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();
    if (snapshot.empty) {
        throw new Error("User not found with this email.");
    }
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
        points: firebase.firestore.FieldValue.increment(points)
    });
};

export const resetSalesData = async (target: 'All' | 'Online' | 'Townplanning' | 'Nayabazar'): Promise<void> => {
    const deleteCollection = async (collectionName: string, filterFn?: (doc: any) => boolean) => {
        const snapshot = await db.collection(collectionName).get();
        const batchSize = 500;
        let batch = db.batch();
        let count = 0;

        for (const doc of snapshot.docs) {
            if (!filterFn || filterFn(doc.data())) {
                batch.delete(doc.ref);
                count++;
                if (count >= batchSize) {
                    await batch.commit();
                    batch = db.batch();
                    count = 0;
                }
            }
        }
        if (count > 0) {
            await batch.commit();
        }
    };

    if (target === 'All') {
        await deleteCollection('orders');
        await deleteCollection('offlineSales');
        await deleteCollection('tradeIns');
        await deleteCollection('notebookEntries');
        await deleteCollection('siteTraffic');
    } else if (target === 'Online') {
        await deleteCollection('orders');
        await deleteCollection('tradeIns');
    } else {
        const loc = target;
        const isLoc = (data: any) => {
            let itemLoc = data.shopLocation;
            if (!itemLoc || itemLoc === 'Shop 1') itemLoc = 'Townplanning';
            if (itemLoc === 'Shop 2') itemLoc = 'Nayabazar';
            return itemLoc === loc;
        };

        await deleteCollection('offlineSales', isLoc);
        await deleteCollection('notebookEntries', isLoc);
    }
};
