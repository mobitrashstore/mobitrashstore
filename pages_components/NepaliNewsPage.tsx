
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { NewspaperIcon } from '../components/icons/NewspaperIcon';
import Spinner from '../components/Spinner';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import * as api from '../services/api';
import { newsService, NewsItem } from '../services/newsService';
import { NewsSource, OfficialNews } from '../types';
import { ClockIcon } from '../components/icons/ClockIcon';
import { ArrowPathIcon } from '../components/icons/ArrowPathIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';

// --- READER COMPONENT ---
const NewsReaderModal: React.FC<{ item: NewsItem; onClose: () => void }> = ({ item: initialItem, onClose }) => {
    const [activeItem, setActiveItem] = useState<NewsItem>(initialItem);
    const [history, setHistory] = useState<NewsItem[]>([]);
    const [viewMode, setViewMode] = useState<'reader' | 'web'>('reader');
    const [loading, setLoading] = useState(true);
    const [pageContent, setPageContent] = useState<string>(''); // For reader mode
    const [rawWebContent, setRawWebContent] = useState<string>(''); // For iframe

    const contentRef = useRef<HTMLDivElement>(null);

    // PROXY LIST for reader extraction
    const PROXY_LIST = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
    ];

    // Load Logic
    useEffect(() => {
        loadContent(activeItem);
    }, [activeItem]);

    const loadContent = async (newsItem: NewsItem) => {
        setLoading(true);
        if (contentRef.current) contentRef.current.scrollTop = 0;

        // Strip any existing proxy prefix if present in the link to avoid double-proxying or splash screens
        let cleanLink = newsItem.link;
        const proxiesToStrip = ['https://corsproxy.io/?', 'https://api.allorigins.win/raw?url='];
        proxiesToStrip.forEach(p => {
            if (cleanLink.startsWith(p)) {
                cleanLink = decodeURIComponent(cleanLink.replace(p, ''));
            }
        });

        try {
            // 1. Check if we already have good content
            if (newsItem.isInternal || (newsItem.content && newsItem.content.length > 500)) {
                setPageContent(newsItem.content || newsItem.contentSnippet || '');
                setLoading(false);
                setViewMode('reader');
                return;
            }

            // 2. Fetch External for Reader Mode
            let rawHTML = '';
            let fetchSuccess = false;

            for (const proxyBase of PROXY_LIST) {
                try {
                    const proxiedUrl = `${proxyBase}${encodeURIComponent(cleanLink)}`;
                    const response = await fetch(proxiedUrl);
                    if (response.ok) {
                        rawHTML = await response.text();
                        fetchSuccess = true;
                        break;
                    }
                } catch (e) { }
            }

            if (!fetchSuccess) {
                setRawWebContent(cleanLink);
                setViewMode('web');
                setLoading(false);
                return;
            }

            // 3. Extract content
            const parser = new DOMParser();
            const doc = parser.parseFromString(rawHTML, 'text/html');

            // Set dynamic title from meta if possible (for deep-linked articles)
            const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
            if (ogTitle && activeItem.title === "New Article") {
                setActiveItem(prev => ({ ...prev, title: ogTitle }));
            }

            let mainContentEl = doc.querySelector('article, .story-content, .news-detail, .td-post-content, #main-content');

            if (!mainContentEl) {
                // Heuristic: target the largest text block
                const pTags = Array.from(doc.querySelectorAll('p'));
                const parentCounts = new Map();
                pTags.forEach(p => {
                    const parent = p.parentElement;
                    if (parent) parentCounts.set(parent, (parentCounts.get(parent) || 0) + 1);
                });
                let bestParent = null;
                let maxPCount = 0;
                parentCounts.forEach((count, parent) => {
                    if (count > maxPCount) {
                        maxPCount = count;
                        bestParent = parent;
                    }
                });
                mainContentEl = bestParent || doc.body;
            }

            const extractedHTML = mainContentEl ? mainContentEl.innerHTML : newsItem.contentSnippet || '';

            // Clean-up and stay internal
            const cleanedContent = extractedHTML
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/target="_blank"/gi, 'target="_self"');

            setPageContent(cleanedContent);
            setViewMode('reader');
        } catch (e) {
            setRawWebContent(cleanLink);
            setViewMode('web');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        const itemToShare = activeItem;
        if (navigator.share) {
            try {
                await navigator.share({ title: itemToShare.title, url: itemToShare.link });
            } catch (error) { }
        } else {
            navigator.clipboard.writeText(itemToShare.link);
            alert("Link copied!");
        }
    };

    const handleBack = () => {
        if (history.length > 0) {
            const last = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            setActiveItem(last);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col animate-fade-in touch-none">
            {/* Header */}
            <div className="bg-slate-900 border-b border-white/10 p-4 pt-safe flex items-center justify-between flex-shrink-0 relative z-10 pt-safe">
                <button onClick={handleBack} className="p-2 bg-white/10 rounded-full text-white">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex-grow text-center px-4">
                    <h3 className="text-white text-sm font-bold truncate leading-tight uppercase tracking-tighter">{activeItem.source}</h3>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleShare} className="p-2 bg-white/10 rounded-full text-white">
                        <ShareIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div
                className="flex-grow overflow-y-auto bg-white relative z-0"
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    const link = target.closest('a');
                    if (link && link.href && link.href.startsWith('http')) {
                        e.preventDefault();
                        const newUrl = link.href;
                        // Avoid infinite recursion on same link
                        if (newUrl === activeItem.link) return;

                        setHistory(prev => [...prev, activeItem]);
                        setActiveItem({
                            id: newUrl,
                            title: "New Article",
                            link: newUrl,
                            pubDate: new Date().toISOString(),
                            source: activeItem.source,
                            sourceId: activeItem.sourceId,
                            isInternal: false,
                            contentSnippet: ""
                        });
                    }
                }}
            >
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-full gap-4">
                        <Spinner size="w-12 h-12" />
                        <p className="text-slate-400 font-bold animate-pulse text-sm">LOADING BULLET FEED...</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'reader' && pageContent ? (
                            <div className="max-w-[95vw] lg:max-w-6xl mx-auto p-4 md:p-12 w-full animate-fade-in-up">
                                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">{activeItem.title}</h1>
                                <div className="flex items-center gap-4 mb-10 text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-y border-slate-100 py-4">
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4 text-orange-500" />
                                        <span>{new Date(activeItem.pubDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="w-px h-4 bg-slate-200"></div>
                                    <div className="flex items-center gap-2">
                                        <NewspaperIcon className="w-4 h-4 text-orange-500" />
                                        <span className="text-slate-900">{activeItem.source}</span>
                                    </div>
                                </div>
                                <div className="prose prose-slate prose-xl lg:prose-2xl max-w-none news-content-viewer overflow-x-hidden selection:bg-orange-100" dangerouslySetInnerHTML={{ __html: pageContent }}></div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col">
                                <div className="p-2 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <span className="text-[10px] font-bold text-slate-400 truncate max-w-[50%]">{rawWebContent}</span>
                                    <button
                                        onClick={() => window.open(rawWebContent, '_blank')}
                                        className="text-[10px] font-black text-white bg-orange-500 px-3 py-1 rounded-full uppercase"
                                    >
                                        Open in Browser
                                    </button>
                                </div>
                                <iframe
                                    src={rawWebContent}
                                    className="flex-grow w-full border-0 bg-white"
                                    title="News Content"
                                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                ></iframe>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

interface NepaliNewsPageProps {
    navigate: (path: string) => void;
}

const NewsSkeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
        <div className="w-full h-40 bg-slate-100 rounded-xl mb-4"></div>
        <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
    </div>
);

const NepaliNewsPage: React.FC<NepaliNewsPageProps> = ({ navigate }) => {
    const [officialNews, setOfficialNews] = useState<OfficialNews[]>([]);
    const [externalNews, setExternalNews] = useState<NewsItem[]>([]);
    const [sources, setSources] = useState<NewsSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [filterSourceId, setFilterSourceId] = useState<string | null>(null);

    // Categories in Nepali
    const categories = [
        { id: 'main', label: 'ताजा समाचार' },
        { id: 'sports', label: 'खेलकुद', keywords: ['खेल', 'क्रिकेट', 'फुटबल', 'sports', 'आईपिएल', 'विश्वकप'] },
        { id: 'entertainment', label: 'मनोरञ्जन', keywords: ['फिल्म', 'नायक', 'नायिका', 'entertainment', 'कलाकार', 'संगीत', 'भिडियो'] },
        { id: 'international', label: 'अन्तर्राष्ट्रिय', keywords: ['अमेरिका', 'भारत', 'चीन', 'international', 'विश्व', 'इजरायल', 'गाजा', 'जापान'] },
        { id: 'literature', label: 'साहित्य', keywords: ['साहित्य', 'कविता', 'साहित्यिक', 'गजल', 'किताब'] }
    ];

    // Initial Load
    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);

            // 1. Show cached news INSTANTLY for "Bullet Fire" speed
            const cached = newsService.getCachedNews();
            if (cached.length > 0) {
                setExternalNews(cached);
            }

            try {
                // 2. Fetch fresh Official News
                const official = await api.getOfficialNews();
                setOfficialNews(official);

                // 3. Update External News & Sources
                const newsSources = await api.getNewsSources();
                setSources(newsSources);

                const fresh = await newsService.fetchLatestNews(newsSources.length > 0 ? newsSources : []);
                setExternalNews(fresh);
            } catch (error) {
                console.error("News Load Error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitial();
    }, []);

    // Helper to group news by category
    const groupedNews = useMemo(() => {
        let filtered = externalNews;
        if (filterSourceId) {
            filtered = externalNews.filter(n => n.sourceId === filterSourceId);
        }

        const grouped: { [key: string]: NewsItem[] } = {};
        categories.forEach(cat => {
            if (cat.id === 'main') {
                grouped[cat.id] = filtered.slice(0, 10);
            } else {
                grouped[cat.id] = filtered.filter(n =>
                    cat.keywords?.some(k => n.title.toLowerCase().includes(k.toLowerCase()))
                ).slice(0, 4);
            }
        });
        return grouped;
    }, [externalNews, filterSourceId]);

    return (
        <div className="bg-[#f0f2f5] min-h-screen pb-24 overflow-x-hidden">
            <MobileSkyHeader title="Nepali News" Icon={NewspaperIcon} hasSpacer={true} />

            <div className="pt-4 px-0">
                {/* --- NEWS SOURCE BAR (Horizontal Scroll) --- */}
                <div className="bg-white py-4 shadow-sm mb-6 border-b border-slate-100 overflow-hidden">
                    <div className="flex gap-5 overflow-x-auto px-6 scrollbar-hide snap-x">
                        <button
                            onClick={() => setFilterSourceId(null)}
                            className={`flex-shrink-0 flex flex-col items-center gap-1.5 transition-all snap-start ${!filterSourceId ? 'scale-110' : 'opacity-40 grayscale'}`}
                        >
                            <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-slate-50 ${!filterSourceId ? 'border-orange-500 shadow-lg' : 'border-slate-100'}`}>
                                <NewspaperIcon className="w-8 h-8 text-orange-500" />
                            </div>
                            <span className="text-[11px] font-black text-slate-800 tracking-tight">All</span>
                        </button>

                        {sources.map(source => (
                            <button
                                key={source.id}
                                onClick={() => setFilterSourceId(source.id)}
                                className={`flex-shrink-0 flex flex-col items-center gap-1.5 transition-all snap-start ${filterSourceId === source.id ? 'scale-110' : 'opacity-60 grayscale-[0.5]'}`}
                            >
                                <div className={`w-16 h-16 rounded-full border-2 overflow-hidden bg-white flex items-center justify-center p-1 cursor-pointer ${filterSourceId === source.id ? 'border-orange-500 shadow-lg' : 'border-slate-100'}`}>
                                    <img src={source.logoUrl} alt={source.name} className="w-full h-full object-contain" />
                                </div>
                                <span className="text-[11px] font-black text-slate-800 truncate max-w-[70px]">{source.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- NEWS SECTIONS --- */}
                <div className="px-4 space-y-10">
                    {categories.map(cat => {
                        const items = groupedNews[cat.id] || [];
                        if (items.length === 0 && cat.id !== 'main') return null;

                        return (
                            <div key={cat.id} className="animate-fade-in-up">
                                {/* Section Header */}
                                <div className="flex items-center justify-between mb-4 border-b-2 border-orange-500/10 pb-2">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                                        <div className="w-2 h-7 bg-orange-500 rounded-full shadow-sm shadow-emerald-200"></div>
                                        {cat.label}
                                    </h2>
                                    <button className="text-[11px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">सबै हेर्नुहोस्</button>
                                </div>

                                {/* Section Cards (HORIZONTAL LAYOUT) */}
                                <div className="space-y-4">
                                    {items.map((item, idx) => {
                                        const source = sources.find(s => s.id === item.sourceId);
                                        const isLogo = !item.thumbnail || (source && item.thumbnail === source.logoUrl);

                                        return (
                                            <div
                                                key={item.id + idx}
                                                onClick={() => setSelectedNews(item)}
                                                className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm hover:shadow-xl transition-all active:scale-[0.97] cursor-pointer group border border-slate-100"
                                            >
                                                {/* Thumbnail Left */}
                                                <div className="w-32 h-[100px] flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 relative shadow-inner flex items-center justify-center">
                                                    <img
                                                        src={item.thumbnail || (source?.logoUrl) || 'https://ik.imagekit.io/Btmobilecare/logo.png?updatedAt=1765729150142'}
                                                        alt=""
                                                        className={`w-full h-full ${isLogo ? 'object-contain p-2 bg-white' : 'object-cover'} group-hover:scale-110 transition-transform duration-700`}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>

                                                {/* Content Right */}
                                                <div className="flex-grow flex flex-col justify-between py-1 min-w-0">
                                                    <h3 className="text-[15px] font-black text-slate-900 line-clamp-3 leading-[1.3] group-hover:text-orange-600 transition-colors tracking-tight">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter truncate max-w-[100px] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">{item.source}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                            <ClockIcon className="w-3 h-3" />
                                                            {new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {items.length === 0 && loading && (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => <NewsSkeleton key={i} />)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {!loading && externalNews.length === 0 && !filterSourceId && (
                    <div className="text-center py-20 px-10">
                        <NewspaperIcon className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">THE FEED IS EMPTY</h2>
                        <p className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-wide">WE ARE SOURCING LATEST UPDATES...</p>
                    </div>
                )}
            </div>

            {/* Reader Modal */}
            {selectedNews && (
                <NewsReaderModal
                    item={selectedNews}
                    onClose={() => setSelectedNews(null)}
                />
            )}
        </div>
    );
};

export default NepaliNewsPage;
