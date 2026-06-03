
import React, { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';
import { NoticeBanner } from '../types';
import Spinner from '../components/Spinner';

interface AdminNoticeBannerPageProps {
    navigate: (path: string) => void;
}

// Image compression
const compressImage = (file: File, maxWidth = 1000, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

const AdminNoticeBannerPage: React.FC<AdminNoticeBannerPageProps> = ({ navigate }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [banner, setBanner] = useState<NoticeBanner>({
        id: 'noticeBanner',
        text: '',
        link: '',
        linkText: '',
        imageUrl: '',
        isStripActive: false,
        isPopupActive: false,
        backgroundColor: '#10b981',
        textColor: '#ffffff',
        showCloseButton: true,
        popupDelay: 0,
        autoHideSeconds: 0,
        displayFrequency: 'session',
        frequencyValue: 1,
        targetPage: 'all',
        targetDevice: 'all',
        showOnExit: false,
        updatedAt: new Date().toISOString()
    });

    useEffect(() => {
        const fetchBanner = async () => {
            setLoading(true);
            try {
                const data = await api.getNoticeBanner();
                setBanner({
                    ...data,
                    displayFrequency: data.displayFrequency || 'session',
                    frequencyValue: data.frequencyValue || 1,
                    popupDelay: data.popupDelay || 0,
                    autoHideSeconds: data.autoHideSeconds || 0,
                    targetPage: data.targetPage || 'all',
                    targetDevice: data.targetDevice || 'all',
                    showOnExit: data.showOnExit || false
                });
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanner();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                           type === 'number' ? Number(value) : value;
        setBanner(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessingImage(true);
        try {
            const compressedDataUrl = await compressImage(file);
            setBanner(prev => ({ ...prev, imageUrl: compressedDataUrl }));
        } catch (error) {
            alert("Failed to process image.");
        } finally {
            setIsProcessingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updatedBanner = { ...banner, updatedAt: new Date().toISOString() };
            await api.updateNoticeBanner(updatedBanner);
            alert('Settings Saved Successfully');
            setBanner(updatedBanner);
        } catch (error) {
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading settings...</div>;

    return (
        <div className="w-full h-full pb-20 animate-fade-in p-4 lg:p-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">Marketing Notice & Popup Intelligence</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target smarter, sell better.</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => navigate('/admin/dashboard')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors">Back</button>
                    <button onClick={handleSave} disabled={saving} className="px-10 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:bg-slate-300 transition-colors shadow-lg">
                        {saving ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-6">
                    
                    {/* VISIBILITY TOGGLES */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className={`flex-1 p-5 border rounded-xl transition-all ${banner.isStripActive ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center justify-between">
                                <h3 className={`font-bold text-sm ${banner.isStripActive ? 'text-emerald-800' : 'text-slate-800'}`}>Header Strip Live</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="isStripActive" checked={banner.isStripActive} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                        <div className={`flex-1 p-5 border rounded-xl transition-all ${banner.isPopupActive ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center justify-between">
                                <h3 className={`font-bold text-sm ${banner.isPopupActive ? 'text-blue-800' : 'text-slate-800'}`}>Visual Popup Live</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="isPopupActive" checked={banner.isPopupActive} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ADVANCED TARGETING */}
                    <div className="bg-white p-6 border border-slate-200 rounded-xl space-y-6">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-2">Campaign Targeting</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Show on Pages</label>
                                <select 
                                    name="targetPage" 
                                    value={banner.targetPage} 
                                    onChange={handleChange} 
                                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 font-bold"
                                >
                                    <option value="all">Site-wide (All Pages)</option>
                                    <option value="home">Home Page Only</option>
                                    <option value="buy">Buy (Shop) Page Only</option>
                                    <option value="sell">Sell (Trade-in) Page Only</option>
                                    <option value="repair">Repair Booking Page Only</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Target Devices</label>
                                <select 
                                    name="targetDevice" 
                                    value={banner.targetDevice} 
                                    onChange={handleChange} 
                                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 font-bold"
                                >
                                    <option value="all">Everywhere (All Devices)</option>
                                    <option value="mobile">Mobile Devices Only</option>
                                    <option value="desktop">Desktop & Tablet Only</option>
                                </select>
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="flex items-center gap-3 p-2.5 border border-slate-300 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                                    <input type="checkbox" name="showOnExit" checked={banner.showOnExit} onChange={handleChange} className="h-4 w-4 rounded" />
                                    <span className="text-xs font-bold text-slate-600">Trigger on Exit Intent</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* FREQUENCY & TIMERS */}
                    <div className="bg-white p-6 border border-slate-200 rounded-xl space-y-5">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-4">Frequency & Engagement</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                             <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Display Mode</label>
                                <select name="displayFrequency" value={banner.displayFrequency} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white font-bold">
                                    <option value="always">Always Reload</option>
                                    <option value="session">Per Visit Session</option>
                                    <option value="hours">Every X Hours</option>
                                    <option value="days">Every X Days</option>
                                </select>
                            </div>
                            {(banner.displayFrequency === 'hours' || banner.displayFrequency === 'days') && (
                                <div className="animate-fade-in">
                                    <label className="block text-xs font-bold text-slate-600 mb-2">Value ({banner.displayFrequency})</label>
                                    <input type="number" name="frequencyValue" value={banner.frequencyValue} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-bold bg-white" min="1"  />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                             <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Wait Delay (Secs)</label>
                                <input type="number" name="popupDelay" value={banner.popupDelay} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded bg-slate-50 text-xs font-bold" />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Auto-Hide (Secs)</label>
                                <input type="number" name="autoHideSeconds" value={banner.autoHideSeconds} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded bg-slate-50 text-xs font-bold" />
                             </div>
                        </div>
                    </div>

                    {/* CONTENT MANAGER */}
                    <div className="bg-white p-6 border border-slate-200 rounded-xl space-y-5">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-4">Global Content Override</h2>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Main Notice Message</label>
                            <textarea name="text" value={banner.text} onChange={handleChange} className="w-full p-4 border border-slate-300 rounded-xl text-sm italic font-medium" rows={3}  />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Button Action Text</label>
                                <input type="text" name="linkText" value={banner.linkText} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Redirect Link (Relative or Absolute)</label>
                                <input type="text" name="link" value={banner.link} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="/buy" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-6">
                    {/* Visual & Assets */}
                    <div className="bg-white p-6 border border-slate-200 rounded-xl space-y-4 shadow-sm">
                         <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Notice Branding</h2>
                         <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Campaign Accent Color</label>
                            <input type="color" name="backgroundColor" value={banner.backgroundColor} onChange={handleChange} className="h-10 w-full p-0 border border-slate-300 rounded cursor-pointer" />
                         </div>
                         <div className="w-full aspect-square rounded-xl border-4 border-slate-50 bg-slate-200 flex items-center justify-center overflow-hidden mb-2 shadow-inner">
                             {banner.imageUrl ? <img src={banner.imageUrl} alt="pre" className="w-full h-full object-cover" /> : <p className="text-[10px] text-slate-400 font-bold">Post Image Required</p>}
                         </div>
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-xs font-bold hover:bg-black transition-all">Upload Campaign Media</button>
                         <p className="text-[9px] text-center text-slate-400 italic">Portrait (8:10) images look best on mobile popups.</p>
                         <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                         <div className="flex items-center gap-2 pt-2 pb-1 border-t mt-4 border-slate-50">
                            <input type="checkbox" name="showCloseButton" id="showCloseButton" checked={banner.showCloseButton} onChange={handleChange} className="h-4 w-4 rounded" />
                            <label htmlFor="showCloseButton" className="text-xs font-bold text-slate-700 cursor-pointer select-none">Show Dismiss "X" Button</label>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <h2 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Targeting Summary</h2>
                        <div className="space-y-2">
                             <div className="flex justify-between text-[11px] font-bold">
                                 <span className="text-slate-400 uppercase">Page:</span>
                                 <span className="text-indigo-600">{banner.targetPage.toUpperCase()}</span>
                             </div>
                             <div className="flex justify-between text-[11px] font-bold">
                                 <span className="text-slate-400 uppercase">Device:</span>
                                 <span className="text-indigo-600">{banner.targetDevice.toUpperCase()}</span>
                             </div>
                             <div className="flex justify-between text-[11px] font-bold">
                                 <span className="text-slate-400 uppercase">Mode:</span>
                                 <span className="text-indigo-600">{banner.displayFrequency.toUpperCase()}</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNoticeBannerPage;
