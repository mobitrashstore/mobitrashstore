
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { NewsSource, OfficialNews } from '../types';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { ArrowUpTrayIcon } from '../components/icons/ArrowUpTrayIcon';
import Spinner from '../components/Spinner';
import { ImageUploader } from '../components/ImageUploader';
import { NewspaperIcon } from '../components/icons/NewspaperIcon';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminNewsPageProps {
    navigate: (path: string) => void;
}

const DEFAULT_SOURCES: NewsSource[] = [
    {
        id: 'onlinekhabar',
        name: 'OnlineKhabar',
        url: 'https://www.onlinekhabar.com',
        feedUrl: 'https://www.onlinekhabar.com/feed',
        logoUrl: 'https://www.onlinekhabar.com/wp-content/themes/onlinekhabar-2018/img/logoMain.png',
        color: '#dc2626'
    },
    {
        id: 'ratopati',
        name: 'RatoPati',
        url: 'https://ratopati.com',
        feedUrl: 'https://ratopati.com/feed',
        logoUrl: 'https://ratopati.com/images/logo.png',
        color: '#ef4444'
    },
    {
        id: 'setopati',
        name: 'Setopati',
        url: 'https://www.setopati.com',
        feedUrl: 'https://www.setopati.com/feed',
        logoUrl: 'https://www.setopati.com/images/logo.png',
        color: '#000000'
    },
    {
        id: 'lokantar',
        name: 'Lokantar',
        url: 'https://lokantar.com',
        feedUrl: 'https://lokantar.com/feed',
        logoUrl: 'https://lokantar.com/images/logo.png',
        color: '#f59e0b'
    },
    {
        id: 'baahrakhari',
        name: '12Khari',
        url: 'https://baahrakhari.com',
        feedUrl: 'https://baahrakhari.com/feed',
        logoUrl: 'https://baahrakhari.com/images/logo.png',
        color: '#ea580c'
    }
];

const NewsSourceModal: React.FC<{
    source: Partial<NewsSource> | null;
    onClose: () => void;
    onSave: (source: Omit<NewsSource, 'id'> | NewsSource) => Promise<void>;
}> = ({ source, onClose, onSave }) => {
    const isEditMode = !!source?.id;
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        feedUrl: '',
        logoUrl: '',
        color: '#000000',
        ...source
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (url: string) => {
        setFormData(prev => ({ ...prev, logoUrl: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData as NewsSource);
            onClose();
        } catch (error) {
            alert("Failed to save news source.");
        } finally {
            setIsSaving(false);
        }
    };

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto">
            {/* Reduced max-width and made scrollable for mobile */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col max-h-[85vh] mb-10" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">{isEditMode ? 'Edit Source' : 'Add Source'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Channel Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="e.g. CNN Nepal" />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Website URL</label>
                            <input type="url" name="url" value={formData.url} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">RSS Feed URL</label>
                            <input type="url" name="feedUrl" value={formData.feedUrl} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="https://.../feed" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Logo & Color</label>
                        <div className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="w-20">
                                <ImageUploader
                                    imageUrl={formData.logoUrl}
                                    onImageChange={handleImageChange}
                                    onClear={() => handleImageChange('')}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Brand Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" name="color" value={formData.color} onChange={handleChange} className="w-8 h-8 p-0 border-0 rounded cursor-pointer shadow-sm" />
                                    <input type="text" name="color" value={formData.color} onChange={handleChange} className="flex-1 p-1.5 border border-slate-300 rounded text-xs uppercase font-mono" />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-4 flex justify-end border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <button type="button" onClick={onClose} className="mr-3 px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-700 transition-colors shadow-md disabled:bg-slate-300 text-sm">
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const OfficialNewsModal: React.FC<{
    news: Partial<OfficialNews> | null;
    onClose: () => void;
    onSave: (news: Omit<OfficialNews, 'id'> | OfficialNews) => Promise<void>;
}> = ({ news, onClose, onSave }) => {
    const isEditMode = !!news?.id;
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        imageUrl: '',
        author: 'Mobi Store',
        date: new Date().toISOString().split('T')[0],
        isInternal: true as const,
        ...news
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (url: string) => {
        setFormData(prev => ({ ...prev, imageUrl: url }));
    };

    const insertText = (tag: string, closeTag: string = '') => {
        const textarea = document.getElementById('news-content') as HTMLTextAreaElement;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.content;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);
        const newText = before + tag + selection + closeTag + after;
        setFormData(prev => ({ ...prev, content: newText }));
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tag.length, end + tag.length);
        }, 0);
    };

    const handleAiGenerate = async () => {
        if (!formData.title) {
            alert("Please enter a Headline first.");
            return;
        }

        setIsGenerating(true);
        try {
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.API_KEY;
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Write a HIGH-AUTHORITY, professional news report for "Mobi Store" in Nepal based on this headline: "${formData.title}". 
            
            REQUIREMENTS:
            1. Length: 700-1000 words. Be extremely detailed.
            2. Formatting: Use rich HTML (<h2>, <h3>, <p>, <b>, <ul>, <li>).
            3. Structure:
               - Engaging Lead Paragraph.
               - "The Details" section.
               - "Impact on Consumers in Nepal" section.
               - "Mobi Store Official Statement" section.
               - Closing Summary.
            
            Keep it professional and industry-standard.
            Return JSON with keys: "excerpt" (50 word summary) and "content" (The full HTML body).`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            excerpt: { type: Type.STRING },
                            content: { type: Type.STRING }
                        },
                        required: ["excerpt", "content"]
                    }
                }
            });

            if (response.text) {
                const result = JSON.parse(response.text);
                setFormData(prev => ({
                    ...prev,
                    excerpt: result.excerpt || prev.excerpt,
                    content: result.content || prev.content
                }));
            }
        } catch (error) {
            console.error(error);
            alert("AI generation failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData as OfficialNews);
            onClose();
        } catch (error) {
            alert("Failed to save news article.");
        } finally {
            setIsSaving(false);
        }
    };

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto">
            {/* Reduced max-width and max-height for better mobile fit */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh] mb-10" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">{isEditMode ? 'Edit News' : 'Compose News'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 mb-1">Headline</label>
                            <div className="flex gap-2">
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="flex-1 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="News Headline" />
                                <button
                                    type="button"
                                    onClick={handleAiGenerate}
                                    disabled={isGenerating || !formData.title}
                                    className="px-3 bg-purple-100 text-purple-700 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-purple-200 disabled:opacity-50 transition-colors border border-purple-200"
                                    title="Auto-fill with AI"
                                >
                                    {isGenerating ? <Spinner size="w-3 h-3" /> : <SparklesIcon className="w-3.5 h-3.5" />}
                                    AI
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Cover Image</label>
                        {/* Reduced height of preview */}
                        <div className="w-full h-24 bg-slate-50 border border-slate-300 rounded-lg overflow-hidden relative mb-2 flex items-center justify-center">
                            {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <div className="text-slate-400 text-xs">No Image Selected</div>}
                        </div>
                        <ImageUploader imageUrl={formData.imageUrl} onImageChange={handleImageChange} onClear={() => handleImageChange('')} allowFullSize={true} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Excerpt (Summary)</label>
                        <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} required rows={2} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="Brief summary..." />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Content (HTML)</label>
                        <div className="flex gap-1 mb-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200 flex-wrap">
                            <button type="button" onClick={() => insertText('<b>', '</b>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100">B</button>
                            <button type="button" onClick={() => insertText('<i>', '</i>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] italic hover:bg-slate-100">I</button>
                            <button type="button" onClick={() => insertText('<h2>', '</h2>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100">H2</button>
                            <button type="button" onClick={() => insertText('<p>', '</p>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] hover:bg-slate-100">P</button>
                            <button type="button" onClick={() => insertText('<img src="URL" class="w-full h-auto rounded-xl my-4 shadow-sm" />')} className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] hover:bg-slate-100 flex items-center gap-1"><PhotoIcon className="w-3 h-3" /> Img</button>
                        </div>
                        <textarea id="news-content" name="content" value={formData.content} onChange={handleChange} required rows={6} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-mono text-xs leading-relaxed" placeholder="Write HTML content..." />
                    </div>
                </form>

                <div className="p-4 flex justify-end border-t border-slate-100 bg-slate-50 flex-shrink-0 gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button type="submit" onClick={handleSubmit} disabled={isSaving} className="bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-700 transition-colors shadow-md disabled:bg-slate-300 text-sm">
                        {isSaving ? 'Saving...' : 'Publish'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminNewsPage: React.FC<AdminNewsPageProps> = ({ navigate }) => {
    const [sources, setSources] = useState<NewsSource[]>([]);
    const [officialNews, setOfficialNews] = useState<OfficialNews[]>([]);

    // Independent loading states
    const [loadingSources, setLoadingSources] = useState(true);
    const [loadingOfficial, setLoadingOfficial] = useState(true);

    const [activeTab, setActiveTab] = useState<'sources' | 'official'>('official');

    // Modals
    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<Partial<NewsSource> | null>(null);
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<Partial<OfficialNews> | null>(null);

    const [isSeeding, setIsSeeding] = useState(false);

    // Independent Fetch Functions
    const fetchSources = async () => {
        setLoadingSources(true);
        try {
            const data = await api.getNewsSources();
            setSources(data);
        } catch (error) {
            console.error("Failed to load sources:", error);
            // Don't crash UI, just show empty
            setSources([]);
        } finally {
            setLoadingSources(false);
        }
    };

    const fetchOfficialNews = async () => {
        setLoadingOfficial(true);
        try {
            const data = await api.getOfficialNews();
            setOfficialNews(data);
        } catch (error) {
            console.error("Failed to load official news:", error);
            // If rule check fails, this might happen. Log and show empty.
            setOfficialNews([]);
        } finally {
            setLoadingOfficial(false);
        }
    };

    useEffect(() => {
        fetchSources();
        fetchOfficialNews();
    }, []);

    // Source Handlers
    const handleSaveSource = async (sourceData: Omit<NewsSource, 'id'> | NewsSource) => {
        try {
            if ('id' in sourceData && sourceData.id) {
                await api.updateNewsSource(sourceData.id, sourceData);
            } else {
                await api.addNewsSource(sourceData);
            }
            await fetchSources(); // Reload only sources
        } catch (e) {
            alert("Failed to save source. Check console.");
            console.error(e);
        }
    };

    const handleDeleteSource = async (id: string) => {
        if (confirm("Delete this news channel?")) {
            await api.deleteNewsSource(id);
            await fetchSources();
        }
    };

    const handleSeedDefaults = async () => {
        if (confirm("This will add default Nepali news channels to your database. Proceed?")) {
            setIsSeeding(true);
            try {
                await api.seedNewsSources(DEFAULT_SOURCES);

                // FORCE CLEAR CACHE
                localStorage.removeItem('mt_cache_news_sources');

                // FORCE RE-FETCH
                await fetchSources();

                alert("Default channels added successfully!");
            } catch (error) {
                console.error(error);
                alert("Failed to seed channels.");
            } finally {
                setIsSeeding(false);
            }
        }
    };

    // News Handlers
    const handleSaveNews = async (newsData: Omit<OfficialNews, 'id'> | OfficialNews) => {
        try {
            if ('id' in newsData && newsData.id) {
                await api.updateOfficialNews(newsData.id, newsData);
            } else {
                await api.addOfficialNews(newsData);
            }
            await fetchOfficialNews(); // Reload only news
        } catch (e) {
            alert("Failed to save article. Check firebase rules.");
            console.error(e);
        }
    };

    const handleDeleteNews = async (id: string) => {
        if (confirm("Delete this news article?")) {
            await api.deleteOfficialNews(id);
            await fetchOfficialNews();
        }
    };

    const isLoading = loadingSources || loadingOfficial;

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Newsroom</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage external feeds and internal articles.</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={() => setActiveTab('official')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'official' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Official News</button>
                    <button onClick={() => setActiveTab('sources')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'sources' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>RSS Sources</button>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'official' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => { setEditingNews(null); setIsNewsModalOpen(true); }}
                            className="bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-orange-700 flex items-center gap-2 shadow-md transition-all transform active:scale-95"
                        >
                            <PlusCircleIcon className="w-5 h-5" /> Compose Article
                        </button>
                    </div>

                    {loadingOfficial ? (
                        <div className="flex justify-center py-20"><Spinner size="w-12 h-12" /></div>
                    ) : officialNews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {officialNews.map(news => (
                                <div key={news.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className="h-40 bg-slate-100 relative">
                                        {news.imageUrl ? (
                                            <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <NewspaperIcon className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2 mb-2">{news.title}</h3>
                                        <p className="text-xs text-slate-500 mb-4">{new Date(news.date).toLocaleDateString()}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingNews(news); setIsNewsModalOpen(true); }} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">Edit</button>
                                            <button onClick={() => handleDeleteNews(news.id)} className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="col-span-full text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500 font-bold mb-2">No official news articles yet.</p>
                            <p className="text-sm text-slate-400">Write your first article to display on the "Nepali News" page.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'sources' && (
                <div className="space-y-6">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={handleSeedDefaults}
                            disabled={isSeeding}
                            className="bg-slate-100 text-slate-600 font-bold py-2.5 px-4 rounded-xl hover:bg-slate-200 flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <ArrowUpTrayIcon className="w-5 h-5" /> Seed Defaults
                        </button>
                        <button
                            onClick={() => { setEditingSource(null); setIsSourceModalOpen(true); }}
                            className="bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-orange-700 flex items-center gap-2 shadow-md transition-all transform active:scale-95"
                        >
                            <PlusCircleIcon className="w-5 h-5" /> Add Source
                        </button>
                    </div>

                    {loadingSources ? (
                        <div className="flex justify-center py-20"><Spinner size="w-12 h-12" /></div>
                    ) : sources.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sources.map(source => (
                                <div key={source.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: source.color || '#000' }}></div>

                                    <div className="flex justify-between items-start pl-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
                                                {source.logoUrl ? (
                                                    <img src={source.logoUrl} alt={source.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <NewspaperIcon className="w-6 h-6 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg leading-tight">{source.name}</h3>
                                                <a href={source.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate max-w-[150px] block">{source.url}</a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pl-3 mb-4">
                                        <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100 truncate">
                                            RSS: {source.feedUrl}
                                        </p>
                                    </div>

                                    <div className="pl-3 flex gap-2 border-t border-slate-100 pt-3">
                                        <button
                                            onClick={() => { setEditingSource(source); setIsSourceModalOpen(true); }}
                                            className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSource(source.id)}
                                            className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="col-span-full text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500 font-bold mb-2">No news channels found.</p>
                            <p className="text-sm text-slate-400">Click "Seed Defaults" to load popular Nepali news sites instantly.</p>
                        </div>
                    )}
                </div>
            )}

            {isSourceModalOpen && (
                <NewsSourceModal
                    source={editingSource}
                    onClose={() => setIsSourceModalOpen(false)}
                    onSave={handleSaveSource}
                />
            )}

            {isNewsModalOpen && (
                <OfficialNewsModal
                    news={editingNews}
                    onClose={() => setIsNewsModalOpen(false)}
                    onSave={handleSaveNews}
                />
            )}
        </div>
    );
};

export default AdminNewsPage;
