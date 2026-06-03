
import { NewsSource } from '../types';
import * as api from './api';

export interface NewsItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    contentSnippet?: string;
    content?: string;
    source: string;
    sourceId: string;
    thumbnail?: string;
    isInternal: boolean;
}

const CACHE_KEY = 'mobi_news_cache_v1';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

const FALLBACK_SOURCES: NewsSource[] = [
    { id: 'onlinekhabar', name: 'OnlineKhabar', url: 'https://www.onlinekhabar.com', feedUrl: 'https://www.onlinekhabar.com/feed', logoUrl: 'https://www.onlinekhabar.com/wp-content/themes/onlinekhabar-2018/img/logoMain.png', color: '#dc2626' },
    { id: 'ratopati', name: 'RatoPati', url: 'https://ratopati.com', feedUrl: 'https://ratopati.com/feed', logoUrl: 'https://ratopati.com/images/logo.png', color: '#ef4444' },
    { id: 'setopati', name: 'Setopati', url: 'https://setopati.com', feedUrl: 'https://setopati.com/feed', logoUrl: 'https://www.setopati.com/images/logo.png', color: '#000000' },
];

const PROXY_LIST = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://thingproxy.freeboard.io/fetch/',
];

export const newsService = {
    /**
     * Get cached news items instantly.
     */
    getCachedNews: (): NewsItem[] => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return [];
        try {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < CACHE_TTL) {
                return parsed.data;
            }
        } catch (e) {
            console.error("Failed to parse news cache", e);
        }
        return [];
    },

    /**
     * Fetch news from all sources and update cache.
     */
    fetchLatestNews: async (sources: NewsSource[]): Promise<NewsItem[]> => {
        const allItems: NewsItem[] = [];

        const fetchSource = async (source: NewsSource) => {
            let xmlText = '';
            let success = false;

            // Try direct first
            try {
                const res = await fetch(source.feedUrl);
                if (res.ok) {
                    xmlText = await res.text();
                    success = true;
                }
            } catch (e) { }

            // Try proxies
            if (!success) {
                for (const proxy of PROXY_LIST) {
                    try {
                        const res = await fetch(`${proxy}${encodeURIComponent(source.feedUrl)}`);
                        if (res.ok) {
                            xmlText = await res.text();
                            success = true;
                            break;
                        }
                    } catch (e) { }
                }
            }

            if (success && xmlText) {
                const items = parseRss(xmlText, source);
                return items;
            }
            return [];
        };

        const results = await Promise.all(sources.map(s => fetchSource(s)));
        results.forEach(items => allItems.push(...items));

        // Sort by date newest first
        allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

        // Cache the result
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: allItems
        }));

        return allItems;
    },

    /**
     * Prefetch news in the background.
     */
    prefetch: async () => {
        try {
            let sources = await api.getNewsSources();
            if (sources.length === 0) {
                sources = FALLBACK_SOURCES;
            }
            await newsService.fetchLatestNews(sources);
            console.log("News pre-fetched successfully.");
        } catch (e) {
            console.warn("News pre-fetch failed", e);
        }
    }
};

/**
 * Robust RSS Parser
 */
function parseRss(xmlString: string, source: NewsSource): NewsItem[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const items = xmlDoc.querySelectorAll("item");
    const newsItems: NewsItem[] = [];

    items.forEach(item => {
        const title = item.querySelector("title")?.textContent || "No Title";
        const link = item.querySelector("link")?.textContent || "#";
        const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
        const description = item.querySelector("description")?.textContent || "";
        const contentEncoded = item.querySelector("content\\:encoded")?.textContent || "";

        const cleanSnippet = (description || contentEncoded).replace(/<[^>]*>?/gm, '').slice(0, 150);

        let thumbnail = '';
        const enclosure = item.querySelector("enclosure");
        if (enclosure?.getAttribute('url')) thumbnail = enclosure.getAttribute('url')!;

        if (!thumbnail) {
            const mediaContent = item.querySelector("media\\:content") || item.querySelector("content");
            if (mediaContent?.getAttribute('url')) thumbnail = mediaContent.getAttribute('url')!;
        }

        if (!thumbnail) {
            const imgMatch = (description + contentEncoded).match(/<img.*?src="(.*?)"/);
            if (imgMatch) thumbnail = imgMatch[1];
        }

        // Final fallback to source logo
        if (!thumbnail || thumbnail.includes('null')) thumbnail = source.logoUrl;

        newsItems.push({
            id: link,
            title,
            link,
            pubDate,
            contentSnippet: cleanSnippet + (cleanSnippet.length >= 150 ? '...' : ''),
            content: contentEncoded || description,
            source: source.name,
            sourceId: source.id,
            thumbnail,
            isInternal: false
        });
    });

    return newsItems.slice(0, 20); // Keep top 20 per source to save space
}
