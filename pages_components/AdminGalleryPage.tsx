
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { GalleryItem } from '../types';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { PlayIcon } from '../components/icons/PlayIcon';
import Spinner from '../components/Spinner';
import { ImageUploader } from '../components/ImageUploader';
import { FacebookIcon } from '../components/icons/FacebookIcon';
import { TikTokIcon } from '../components/icons/TikTokIcon';
import { InstagramIcon } from '../components/icons/InstagramIcon';

interface AdminGalleryPageProps {
    navigate: (path: string) => void;
}

const AdminGalleryPage: React.FC<AdminGalleryPageProps> = ({ navigate }) => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingType, setAddingType] = useState<'image' | 'video'>('image');
    const [form, setForm] = useState({ url: '', caption: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await api.getGalleryItems();
            setItems(data);
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Helper to extract clean URL from raw embed code or text
    const extractUrl = (input: string): string => {
        if (!input) return '';
        let cleaned = input.trim();
        
        // Remove potential Markdown image syntax ![alt](url)
        cleaned = cleaned.replace(/!\[.*?\]\((.*?)\)/g, '$1');

        if (cleaned.startsWith('http') && !cleaned.includes(' ')) return cleaned;

        // Regex to find URL in cite, src, or href attributes
        const attrMatch = cleaned.match(/(?:cite|src|href)=["'](https?:\/\/[^"']+)["']/);
        if (attrMatch) return attrMatch[1];

        // Fallback: find first http-like string
        const urlMatch = cleaned.match(/https?:\/\/[^\s"']+/);
        return urlMatch ? urlMatch[0] : cleaned;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.url) {
            alert("Please provide a URL or Image.");
            return;
        }
        setIsSubmitting(true);
        try {
            let finalUrl = form.url;

            // Check if it is a Base64 image (starts with data:image...)
            if (finalUrl.startsWith('data:')) {
                // DIRECT DATABASE STORAGE (Bypassing Firebase Storage for Spark Plan)
                // We verify size to ensure it doesn't exceed Firestore 1MB limit
                if (finalUrl.length > 900000) { 
                    throw new Error("Image is too large. Please use a smaller image or crop it.");
                }
                // No upload call needed. We save the string directly.
            } else {
                // It's a text URL or embed code, clean it up
                finalUrl = extractUrl(finalUrl);
            }

            await api.addGalleryItem({
                type: addingType,
                url: finalUrl,
                caption: form.caption
            });
            
            setForm({ url: '', caption: '' });
            fetchItems();
            alert("Item added successfully!");
        } catch (error: any) {
            console.error("Gallery add error:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this item?")) return;
        await api.deleteGalleryItem(id);
        fetchItems();
    };

    const handleImageChange = (dataUrl: string) => {
        setForm(prev => ({ ...prev, url: dataUrl }));
    }
    
    const getPlatformIcon = (url: string) => {
        if (url.includes('facebook') || url.includes('fb.watch')) return <FacebookIcon className="w-8 h-8 text-blue-600" />;
        if (url.includes('tiktok')) return <TikTokIcon className="w-8 h-8 text-black" />;
        if (url.includes('instagram')) return <InstagramIcon className="w-8 h-8 text-pink-600" />;
        if (url.includes('youtube') || url.includes('youtu.be')) return <PlayIcon className="w-10 h-10 text-red-600" />;
        return <PlayIcon className="w-10 h-10 text-slate-400" />;
    }

    return (
        <div className="animate-fade-in pb-10">
            <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm mb-6">Gallery Manager</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Add to Gallery</h2>
                        
                        <div className="flex p-1 bg-slate-100 rounded-lg mb-6 border border-slate-200">
                            <button 
                                onClick={() => setAddingType('image')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${addingType === 'image' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                            >
                                Photo
                            </button>
                            <button 
                                onClick={() => setAddingType('video')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${addingType === 'video' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                            >
                                Video Link
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {addingType === 'image' ? (
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Upload Photo</label>
                                    <ImageUploader 
                                        imageUrl={form.url} 
                                        onImageChange={handleImageChange} 
                                        onClear={() => handleImageChange('')}
                                        allowFullSize={true} // Enable full size upload but ImageUploader will compress
                                    />
                                    <p className="text-xs text-slate-400 mt-1 text-center font-mono">Images uploaded directly to Cloudinary at full quality.</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Video URL</label>
                                    <input 
                                        type="text" 
                                        value={form.url}
                                        onChange={(e) => setForm({...form, url: e.target.value})}
                                        placeholder="Paste link or embed code here..."
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 bg-white text-slate-800"
                                    />
                                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                                        Supports: <strong>YouTube, Facebook, TikTok, Instagram</strong>. <br/>
                                        You can paste direct links OR raw embed codes.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Caption</label>
                                <textarea 
                                    value={form.caption}
                                    onChange={(e) => setForm({...form, caption: e.target.value})}
                                    rows={3}
                                    placeholder="Describe this item..."
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 bg-white text-slate-800"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting || !form.url}
                                className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md active:scale-95"
                            >
                                {isSubmitting ? <Spinner size="w-5 h-5"/> : <><PlusCircleIcon className="w-5 h-5"/> Add Item</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {loading ? (
                            <div className="col-span-2 flex justify-center py-12"><Spinner /></div>
                        ) : items.length > 0 ? (
                            items.map(item => (
                                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative group">
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="absolute top-2 right-2 bg-white text-rose-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-rose-50 border border-rose-100"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="bg-gray-50 rounded-lg overflow-hidden aspect-video mb-3 border border-slate-100 relative flex items-center justify-center">
                                        {item.type === 'image' ? (
                                            <img 
                                                src={item.url} 
                                                alt="" 
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-white text-slate-500 gap-2 p-4 text-center">
                                                {getPlatformIcon(item.url)}
                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-2 break-all line-clamp-1 px-4">{extractUrl(item.url)}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.type === 'image' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                                            {item.type}
                                        </span>
                                        <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {item.caption && <p className="text-sm text-slate-700 mt-2 line-clamp-3 font-medium">{item.caption}</p>}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">Gallery is empty.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminGalleryPage;
