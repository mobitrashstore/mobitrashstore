
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { GalleryItem } from '../types';
import Spinner from '../components/Spinner';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { PlayIcon } from '../components/icons/PlayIcon';
import { FacebookIcon } from '../components/icons/FacebookIcon';
import { TikTokIcon } from '../components/icons/TikTokIcon';
import { InstagramIcon } from '../components/icons/InstagramIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import { ArrowDownTrayIcon } from '../components/icons/ArrowDownTrayIcon';

interface GalleryPageProps {
    navigate: (path: string) => void;
}

const GalleryPage: React.FC<GalleryPageProps> = ({ navigate }) => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video'>('all');

    // Lightbox State
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
    const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const data = await api.getGalleryItems();
                setItems(data);
            } catch (error) {
                console.error("Failed to fetch gallery", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    // Filter Items
    const filteredItems = activeFilter === 'all' ? items : items.filter(i => i.type === activeFilter);

    // --- Helpers ---

    const extractUrl = (input: string): string => {
        if (!input) return '';
        if (input.startsWith('data:image')) return input;
        let cleaned = input.trim().replace(/!\[.*?\]\((.*?)\)/g, '$1');
        if (cleaned.startsWith('http') && !cleaned.includes(' ')) return cleaned;
        const attrMatch = cleaned.match(/(?:cite|src|href)=["'](https?:\/\/[^"']+)["']/);
        if (attrMatch) return attrMatch[1];
        const urlMatch = cleaned.match(/https?:\/\/[^\s"']+/);
        return urlMatch ? urlMatch[0] : cleaned;
    };

    const getYouTubeThumbnail = (url: string): string | null => {
        if (!url || url.startsWith('data:')) return null;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
                if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
        } catch (e) { return null; }
        return null;
    };

    const getEmbedUrl = (url: string, autoPlay = false): string | null => {
        if (!url || url.startsWith('data:')) return null;
        try {
            // Check for specific providers that NEED transformation
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;

            if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
                const params = `autoplay=${autoPlay ? 1 : 0}&modestbranding=1&rel=0&controls=1&showinfo=0&iv_load_policy=3&fs=1&color=white`;
                return `https://www.youtube.com/embed/${videoId}?${params}`;
            }
            if (hostname.includes('facebook.com') || hostname.includes('fb.watch')) {
                // If it's already an embed plugin url, return it
                if (url.includes('plugins/video.php')) return url;
                return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&t=0&autoplay=${autoPlay}`;
            }
            if (hostname.includes('instagram.com')) {
                if (url.includes('embed')) return url;
                let path = urlObj.pathname;
                if (!path.endsWith('/')) path += '/';
                return `https://www.instagram.com${path}embed`;
            }
            if (hostname.includes('tiktok.com')) {
                if (url.includes('embed')) return url;
                const match = urlObj.pathname.match(/video\/(\d+)/);
                if (match && match[1]) return `https://www.tiktok.com/embed/v2/${match[1]}`;
            }

            // For any other website (Kick, Twitch, etc.), return the URL as is to allow embedding
            // This assumes the provided URL is suitable for an iframe src
            return url;

        } catch (e) { return null; }
    };

    const isVerticalVideo = (url: string) => {
        if (!url) return false;
        return url.includes('tiktok.com') || url.includes('instagram.com') || url.includes('shorts') || url.includes('facebook.com/reel') || url.includes('fb.watch');
    };

    const toggleLike = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newLiked = new Set(likedItems);
        if (newLiked.has(id)) newLiked.delete(id);
        else newLiked.add(id);
        setLikedItems(newLiked);
    };

    const handleShare = async (e: React.MouseEvent, item: GalleryItem) => {
        e.stopPropagation();
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Mobi Store Gallery', text: item.caption, url: item.url });
            } catch (err) { console.log('Error sharing', err); }
        } else {
            navigator.clipboard.writeText(item.url);
            alert("Link copied!");
        }
    };

    const handleDownload = async (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `mobistore-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            window.open(url, '_blank');
        }
    }

    // --- Lightbox Navigation ---
    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedItemIndex !== null && selectedItemIndex < filteredItems.length - 1) {
            setSelectedItemIndex(selectedItemIndex + 1);
        }
    }, [selectedItemIndex, filteredItems.length]);

    const handlePrev = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedItemIndex !== null && selectedItemIndex > 0) {
            setSelectedItemIndex(selectedItemIndex - 1);
        }
    }, [selectedItemIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedItemIndex === null) return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setSelectedItemIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItemIndex, handleNext, handlePrev]);


    // Derived Data
    const videos = items.filter(i => i.type === 'video');
    const selectedItem = selectedItemIndex !== null ? filteredItems[selectedItemIndex] : null;

    return (
        <div className="bg-slate-50 min-h-screen pb-20 overflow-x-hidden">
            {/* Manually handled spacer to remove gap */}
            <MobileSkyHeader title="Media Gallery" Icon={PhotoIcon} hasSpacer={false} />

            {/* Content Container - Reduced padding to remove gap */}
            <div className="pt-44 md:pt-32">

                {/* --- TOP REELS STRIP (Stories Style) --- */}
                {videos.length > 0 && (
                    <div className="pb-6 px-4">
                        <h2 className="text-slate-800 text-sm font-bold uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                            <PlayIcon className="w-4 h-4 text-amber-500" /> Featured Reels
                        </h2>
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-2 snap-x">
                            {videos.slice(0, 8).map((video, idx) => {
                                const cleanUrl = extractUrl(video.url);
                                const thumb = getYouTubeThumbnail(cleanUrl) || 'https://placehold.co/300x500/f1f5f9/94a3b8?text=Video';
                                return (
                                    <div
                                        key={video.id}
                                        onClick={() => {
                                            setActiveFilter('video');
                                            const newIdx = videos.findIndex(v => v.id === video.id);
                                            setSelectedItemIndex(newIdx);
                                        }}
                                        className="flex-shrink-0 w-24 h-40 md:w-32 md:h-52 rounded-xl overflow-hidden relative border border-slate-200 shadow-md snap-center cursor-pointer group hover:scale-105 transition-transform"
                                    >
                                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                                        <div className="absolute bottom-2 left-2 right-2">
                                            <p className="text-[9px] text-white line-clamp-2 leading-tight font-medium drop-shadow-sm">{video.caption || 'Watch'}</p>
                                        </div>
                                        <div className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow-sm">
                                            <PlayIcon className="w-2.5 h-2.5 text-slate-900" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Filters */}
                    <div className="flex justify-center mb-8 sticky top-[100px] z-20 py-2">
                        <div className="bg-white/90 backdrop-blur-md p-1 rounded-full flex shadow-lg border border-slate-100">
                            {(['all', 'image', 'video'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => { setActiveFilter(f); setSelectedItemIndex(null); }}
                                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${activeFilter === f
                                        ? 'bg-amber-500 text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20"><Spinner /></div>
                    ) : (
                        /* MASONRY GRID */
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                            {filteredItems.map((item, idx) => {
                                const cleanUrl = extractUrl(item.url);
                                const isVideo = item.type === 'video';
                                const ytThumbnail = isVideo ? getYouTubeThumbnail(cleanUrl) : null;

                                let SourceIcon = null;
                                if (cleanUrl.includes('facebook')) SourceIcon = FacebookIcon;
                                else if (cleanUrl.includes('instagram')) SourceIcon = InstagramIcon;
                                else if (cleanUrl.includes('tiktok')) SourceIcon = TikTokIcon;
                                else if (cleanUrl.includes('youtu')) SourceIcon = PlayIcon;

                                return (
                                    <div
                                        key={item.id}
                                        className="break-inside-avoid bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 group cursor-pointer hover:shadow-xl hover:border-amber-200 transition-all duration-300"
                                        onClick={() => setSelectedItemIndex(idx)}
                                    >
                                        <div className="relative">
                                            {/* Media Preview */}
                                            {item.type === 'image' ? (
                                                <img
                                                    src={cleanUrl}
                                                    alt={item.caption}
                                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="relative aspect-video bg-slate-100">
                                                    {ytThumbnail ? (
                                                        <img src={ytThumbnail} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                            <PlayIcon className="w-12 h-12 text-slate-300" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                                                            <PlayIcon className="w-4 h-4 text-slate-900" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Source Badge */}
                                            {SourceIcon && (
                                                <div className="absolute top-2 right-2 bg-white p-1.5 rounded-full text-slate-900 shadow-md">
                                                    <SourceIcon className="w-3 h-3" />
                                                </div>
                                            )}

                                            {/* Overlay Stats */}
                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent pt-8 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                                                <div className="flex gap-2 ml-auto">
                                                    <button onClick={(e) => toggleLike(e, item.id)} className="bg-white/20 backdrop-blur-md p-1.5 rounded-full hover:bg-white/40">
                                                        <HeartIcon className={`w-4 h-4 ${likedItems.has(item.id) ? 'text-rose-500 fill-rose-500' : 'text-white'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Minimal Caption Area */}
                                        <div className="p-3 bg-white">
                                            <p className="text-xs font-medium text-slate-700 line-clamp-2">{item.caption || 'Mobi Store Gallery'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* --- ADVANCED LIGHTBOX (Keep Dark Mode for Viewing) --- */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in touch-none">

                    {/* Header Controls */}
                    <div className="absolute top-0 left-0 right-0 p-4 pt-safe flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
                        <span className="text-white/70 text-xs font-mono">
                            {selectedItemIndex! + 1} / {filteredItems.length}
                        </span>
                        <div className="flex gap-4">
                            {selectedItem.type === 'image' && (
                                <button onClick={(e) => handleDownload(e, extractUrl(selectedItem.url))} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                                    <ArrowDownTrayIcon className="w-6 h-6" />
                                </button>
                            )}
                            <button onClick={() => setSelectedItemIndex(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area with Nav Arrows */}
                    <div className="flex-grow flex items-center justify-center relative w-full h-full">

                        {/* Prev Button (Desktop) */}
                        {selectedItemIndex! > 0 && (
                            <button
                                onClick={handlePrev}
                                className="hidden md:flex absolute left-4 z-40 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-all backdrop-blur-sm group"
                            >
                                <ChevronLeftIcon className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                            </button>
                        )}

                        {/* Media Display */}
                        <div className="w-full h-full flex items-center justify-center p-0 md:p-12 relative" onClick={(e) => e.stopPropagation()}>
                            {selectedItem.type === 'image' ? (
                                <img
                                    src={extractUrl(selectedItem.url)}
                                    className="max-w-full max-h-full object-contain shadow-2xl"
                                    alt="Gallery"
                                />
                            ) : (
                                <div className={`relative w-full max-w-5xl shadow-2xl rounded-xl overflow-hidden bg-black ${isVerticalVideo(extractUrl(selectedItem.url)) ? 'h-full max-w-sm' : 'aspect-video'}`}>
                                    <iframe
                                        src={getEmbedUrl(extractUrl(selectedItem.url), true) || ''}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}
                        </div>

                        {/* Next Button (Desktop) */}
                        {selectedItemIndex! < filteredItems.length - 1 && (
                            <button
                                onClick={handleNext}
                                className="hidden md:flex absolute right-4 z-40 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-all backdrop-blur-sm group"
                            >
                                <ChevronRightIcon className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>

                    {/* Bottom Floating Nav for Mobile (Reduced margin) */}
                    <div className="md:hidden absolute bottom-28 w-full px-4 flex justify-between pointer-events-none">
                        <button
                            onClick={handlePrev}
                            disabled={selectedItemIndex === 0}
                            className={`p-3 rounded-full bg-black/40 backdrop-blur-md text-white pointer-events-auto transition-opacity ${selectedItemIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={selectedItemIndex === filteredItems.length - 1}
                            className={`p-3 rounded-full bg-black/40 backdrop-blur-md text-white pointer-events-auto transition-opacity ${selectedItemIndex === filteredItems.length - 1 ? 'opacity-0' : 'opacity-100'}`}
                        >
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Compact Footer / Caption */}
                    <div className="bg-black/90 backdrop-blur-lg border-t border-white/10 px-4 py-3 pb-6 md:p-6 pb-safe">
                        <div className="max-w-4xl mx-auto flex flex-row items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium leading-snug truncate">{selectedItem.caption || 'No caption'}</p>
                                <p className="text-slate-500 text-[10px] mt-0.5">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="flex gap-2 flex-shrink-0">
                                <button
                                    onClick={(e) => toggleLike(e, selectedItem.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${likedItems.has(selectedItem.id)
                                        ? 'bg-rose-500/20 border-rose-500 text-rose-500'
                                        : 'border-white/20 text-white hover:bg-white/10'
                                        }`}
                                >
                                    <HeartIcon className={`w-4 h-4 ${likedItems.has(selectedItem.id) ? 'fill-current' : ''}`} />
                                    <span className="text-xs font-bold">Like</span>
                                </button>
                                <button
                                    onClick={(e) => handleShare(e, selectedItem)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
                                >
                                    <ShareIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold">Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;
