
import React, { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';
import { Banner, BannerSection } from '../types';
import { TrashIcon } from '../components/icons/TrashIcon';
import Spinner from '../components/Spinner';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { CameraIcon } from '../components/icons/CameraIcon';
import { ArrowUpTrayIcon } from '../components/icons/ArrowUpTrayIcon';


interface AdminBannersPageProps {
    navigate: (path: string) => void;
}

// No client-side compression. Images are uploaded raw to Cloudinary at full resolution.

const sections: { id: BannerSection; label: string; dimension: string }[] = [
    { id: 'hero', label: 'Main Hero Slider', dimension: '1920 x 600 px (Aspect Ratio ~32:9)' },
    { id: 'hero_side', label: 'Hero Side Banner (Desktop)', dimension: '600 x 800 px (Portrait) or Square' },
    { id: 'home_square', label: 'Home Top Squares', dimension: '300 x 300 px (Square)' },
    { id: 'home_mobile_hero_bg', label: 'Home Mobile Header BG', dimension: '800 x 600 px (Landscape)' },
    { id: 'sell_hero', label: 'Sell Page Slider', dimension: '1920 x 400 px (Slimmer Aspect Ratio)' },
    { id: 'buy_hero', label: 'Buy Page Hero', dimension: '1920 x 600 px' },
    { id: 'repair_hero', label: 'Repair Page Hero', dimension: '1920 x 600 px' },
    { id: 'auth_desktop', label: 'Login/Signup Desktop', dimension: '800 h 1000 px (Portrait)' },
    { id: 'section1', label: 'Section 1 (Top Category Features)', dimension: '300 x 300 px (Square)' },
    { id: 'section2', label: 'Section 2 (Above Accessories)', dimension: '1200 x 300 px' },
    { id: 'section3', label: 'Section 3 (Above Tools)', dimension: '1200 x 300 px' },
    { id: 'section4', label: 'Section 4 (Above Parts)', dimension: '1200 x 300 px' },
    { id: 'section5', label: 'Section 5 (Above Certified Phones)', dimension: '1200 x 300 px' },
];

const AdminBannersPage: React.FC<AdminBannersPageProps> = ({ navigate }) => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [newBannerUrl, setNewBannerUrl] = useState('');
    const [newBannerLink, setNewBannerLink] = useState('');
    const [newBannerTitle, setNewBannerTitle] = useState('');
    const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
    const [activeSection, setActiveSection] = useState<BannerSection>('hero');
    const [adding, setAdding] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const data = await api.getBanners();
            setBanners(data);
        } catch (error) {
            console.error("Failed to load banners", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProgress(0);
        try {
            const url = await api.uploadImage(file, 'banners', (pct) => {
                setProgress(Math.round(pct));
            });
            setNewBannerUrl(url);
        } catch (error: any) {
            console.error("Image upload error:", error);
            alert("Failed to upload image. " + (error.message || error));
        } finally {
            setProgress(null);
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
        }
    };

    const triggerFileInput = (capture = false) => {
        if (fileInputRef.current) {
            if (capture) {
                fileInputRef.current.setAttribute('capture', 'environment');
            } else {
                fileInputRef.current.removeAttribute('capture');
            }
            fileInputRef.current.click();
        }
    };

    const handleAddBanner = async () => {
        if (!newBannerUrl) return;
        setAdding(true);
        try {
            await api.addBanner({
                imageUrl: newBannerUrl,
                section: activeSection,
                link: newBannerLink,
                title: newBannerTitle,
                subtitle: newBannerSubtitle,
            });
            setNewBannerUrl('');
            setNewBannerLink('');
            setNewBannerTitle('');
            setNewBannerSubtitle('');
            await fetchBanners();
        } catch (error) {
            console.error("Failed to add banner", error);
            alert("Failed to add banner.");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteBanner = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this banner?")) {
            await api.deleteBanner(id);
            await fetchBanners();
        }
    };

    const filteredBanners = banners.filter(b => b.section === activeSection);
    const currentSectionInfo = sections.find(s => s.id === activeSection);

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Banner Management</h1>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
                    {sections.map(sec => (
                        <button
                            key={sec.id}
                            onClick={() => setActiveSection(sec.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === sec.id
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
                                }`}
                        >
                            {sec.label}
                        </button>
                    ))}
                </div>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <h3 className="text-blue-700 font-bold text-lg">{currentSectionInfo?.label}</h3>
                    <p className="text-blue-600 text-sm mt-1">Recommended Size: <strong>{currentSectionInfo?.dimension}</strong></p>
                </div>

                {/* Add Banner Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-5 border border-slate-200 bg-slate-50/50 rounded-xl">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-slate-600 mb-2">New Banner Image</label>
                        <div className="w-full aspect-video bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden relative">
                            {newBannerUrl ? <img src={newBannerUrl} alt="Preview" className="w-full h-full object-cover" /> : <PhotoIcon className="w-8 h-8 text-slate-300" />}
                            {progress !== null && (
                                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-4 z-10 gap-2">
                                    <Spinner size="w-8 h-8" />
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className="bg-amber-500 h-1.5 rounded-full transition-all duration-200"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600">{progress}%</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button type="button" onClick={() => triggerFileInput(false)} disabled={progress !== null} className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 p-2.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                <ArrowUpTrayIcon className="w-4 h-4" /> Upload
                            </button>
                            <button type="button" onClick={() => triggerFileInput(true)} disabled={progress !== null} className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 p-2.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                <CameraIcon className="w-4 h-4" /> Camera
                            </button>
                        </div>
                        <input
                            type="text"
                            value={newBannerUrl.startsWith('data:image') ? '' : newBannerUrl}
                            onChange={e => setNewBannerUrl(e.target.value)}
                            placeholder="Or paste URL"
                            className="w-full mt-2 p-2.5 border border-slate-300 rounded-lg text-xs text-center bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                    </div>

                    <div className="md:col-span-2 flex flex-col justify-end gap-3">
                        <div className="grid grid-cols-2 gap-3 mb-1">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Title (Optional)</label>
                                <input
                                    type="text"
                                    value={newBannerTitle}
                                    onChange={e => setNewBannerTitle(e.target.value)}
                                    placeholder="Main headline"
                                    className="w-full p-3 border border-slate-300 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Subtitle (Optional)</label>
                                <input
                                    type="text"
                                    value={newBannerSubtitle}
                                    onChange={e => setNewBannerSubtitle(e.target.value)}
                                    placeholder="Short description"
                                    className="w-full p-3 border border-slate-300 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Target Link (Optional)</label>
                            <input
                                type="text"
                                value={newBannerLink}
                                onChange={e => setNewBannerLink(e.target.value)}
                                placeholder="e.g. /buy or /product/iphone-15"
                                className="w-full p-3 border border-slate-300 rounded-xl text-sm bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                            />
                            <p className="text-xs text-slate-500 mt-1">Leave empty for no link. Use relative paths like <code>/buy</code> or full URLs.</p>
                        </div>
                        <button
                            onClick={handleAddBanner}
                            disabled={adding || !newBannerUrl}
                            className="bg-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-700 transition-all shadow-md disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none flex items-center justify-center gap-2 w-full active:scale-95"
                        >
                            {adding ? <Spinner size="w-5 h-5" /> : <PlusCircleIcon className="w-5 h-5" />}
                            Add Banner to "{currentSectionInfo?.label}"
                        </button>
                    </div>
                </div>


                {/* Banner List */}
                {loading ? (
                    <div className="flex justify-center py-12"><Spinner /></div>
                ) : filteredBanners.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {filteredBanners.map(banner => (
                            <div key={banner.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm relative group bg-white">
                                <img src={banner.imageUrl} alt="Banner" className="w-full aspect-video object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleDeleteBanner(banner.id)}
                                        className="bg-white text-rose-600 p-3 rounded-full hover:bg-rose-50 transition-colors shadow-lg"
                                    >
                                        <TrashIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="p-3 bg-white text-xs border-t border-slate-100 flex flex-col gap-1">
                                    {banner.title && <div className="font-bold text-slate-800 truncate">{banner.title}</div>}
                                    {banner.subtitle && <div className="text-slate-500 truncate">{banner.subtitle}</div>}
                                    <div className="text-slate-400 truncate font-mono mt-1">{banner.imageUrl}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500 font-medium">No banners added for this section yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBannersPage;
