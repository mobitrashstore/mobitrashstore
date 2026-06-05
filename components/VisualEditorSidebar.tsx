import React, { useState } from 'react';
import { useVisualEditing } from '../context/VisualEditingContext';
import { Squares2x2Icon } from './icons/Squares2x2Icon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { DevicePhoneMobileIcon } from './icons/DevicePhoneMobileIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { BoltIcon } from './icons/BoltIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { UserIcon } from './icons/UserIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { StarIcon } from './icons/StarIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { MinusIcon } from './icons/MinusIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PlusIcon } from './icons/PlusIcon';
import { AdjustmentsHorizontalIcon } from './icons/AdjustmentsHorizontalIcon';
import { GiftIcon } from './icons/GiftIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';

const WIDGETS = [
    { id: 'heading', label: 'Heading', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { id: 'text', label: 'Text Editor', icon: <PencilSquareIcon className="w-5 h-5" /> },
    { id: 'image', label: 'Image', icon: <PhotoIcon className="w-5 h-5" /> },
    { id: 'video', label: 'Video', icon: <PlayIcon className="w-5 h-5" /> },
    { id: 'button', label: 'Button', icon: <PlusIcon className="w-5 h-5" /> },
    { id: 'divider', label: 'Divider', icon: <MinusIcon className="w-5 h-5" /> },
    { id: 'faq', label: 'FAQ Accordion', icon: <ListBulletIcon className="w-5 h-5" /> },
    { id: 'gallery', label: 'Gallery', icon: <Squares2x2Icon className="w-5 h-5" /> },
    { id: 'testimonial', label: 'Testimonial', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'contact', label: 'Contact Form', icon: <EnvelopeIcon className="w-5 h-5" /> },
    { id: 'map', label: 'Google Map', icon: <MapPinIcon className="w-5 h-5" /> },
    { id: 'rating', label: 'Review / Stars', icon: <StarIcon className="w-5 h-5" /> },
    { id: 'posts', label: 'Recent Posts', icon: <ListBulletIcon className="w-5 h-5" /> },
    { id: 'products', label: 'Product Grid', icon: <DevicePhoneMobileIcon className="w-5 h-5" /> },
    { id: 'stats', label: 'Stats Counter', icon: <ChartBarIcon className="w-5 h-5" /> },
    { id: 'brands', label: 'Partners / Logos', icon: <BuildingStorefrontIcon className="w-5 h-5" /> },
    { id: 'social', label: 'Social Feed', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { id: 'countdown', label: 'Countdown Timer', icon: <ClockIcon className="w-5 h-5" /> },
    { id: 'announcement', label: 'Promo Banner', icon: <MegaphoneIcon className="w-5 h-5" /> },
    { id: 'gift', label: 'Offer Box', icon: <GiftIcon className="w-5 h-5" /> },
];

const VisualEditorSidebar: React.FC = () => {
    const { isEditing, toggleEditing, setDraggedWidget, primaryColor, setPrimaryColor, fullWidth, setFullWidth } = useVisualEditing();
    const [activeTab, setActiveTab] = useState<'elements' | 'settings'>('elements');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isEditing) return null;

    const filteredWidgets = WIDGETS.filter(w =>
        w.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <aside className="fixed top-20 left-0 h-[calc(100vh-5rem)] w-80 bg-[#831843] text-white z-[9999] shadow-2xl flex flex-col font-sans border-r border-[#be185d]/30 animate-slide-in-left">
            {/* Header */}
            <div className="p-4 bg-[#701a3d] flex items-center justify-between border-b border-[#9d174d]">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white text-[#831843] rounded flex items-center justify-center font-black text-[10px]">E</div>
                    <span className="font-bold text-xs tracking-tight uppercase">Visual Elementor</span>
                </div>
                <button
                    onClick={toggleEditing}
                    className="p-1 hover:bg-rose-500 rounded-md transition-colors"
                    title="Close Editor"
                >
                    <XMarkIcon className="w-4 h-4 text-pink-100" />
                </button>
            </div>

            {/* Search */}
            <div className="p-4 bg-[#6c1539]">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300" />
                    <input
                        type="text"
                        placeholder="Search elements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#5a1230] border-none rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-pink-400 focus:ring-1 focus:ring-rose-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#701a3d] border-b border-[#9d174d]">
                <button
                    onClick={() => setActiveTab('elements')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'elements' ? 'text-white border-b-2 border-orange-400 bg-[#831843]' : 'text-pink-300 hover:text-white'}`}
                >
                    <Squares2x2Icon className="w-3.5 h-3.5" />
                    Elements
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'settings' ? 'text-white border-b-2 border-orange-400 bg-[#831843]' : 'text-pink-300 hover:text-white'}`}
                >
                    <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                    Settings
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide bg-[#831843]">
                {activeTab === 'elements' ? (
                    <div className="grid grid-cols-3 gap-3 pb-20">
                        {filteredWidgets.map(widget => (
                            <div
                                key={widget.id}
                                className="flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow-sm hover:shadow-indigo-500/20 hover:scale-[1.05] transition-all cursor-grab active:cursor-grabbing group aspect-square border-b border-slate-200 active:opacity-50"
                                draggable
                                onDragStart={(e) => {
                                    setDraggedWidget(widget.id);
                                    if (e.dataTransfer) {
                                        e.dataTransfer.setData('text/plain', widget.id);
                                        e.dataTransfer.effectAllowed = 'copy';
                                    }
                                }}
                                onDragEnd={() => setDraggedWidget(null)}
                            >
                                <div className="text-slate-400 group-hover:text-[#831843] transition-colors mb-2">
                                    {widget.icon}
                                </div>
                                <span className="text-[8px] font-black text-slate-500 group-hover:text-slate-900 text-center leading-tight uppercase tracking-tight">
                                    {widget.label}
                                </span>
                            </div>
                        ))}
                        {filteredWidgets.length === 0 && (
                            <div className="col-span-3 py-10 text-center">
                                <p className="text-pink-300 text-xs font-bold uppercase tracking-widest opacity-50">No element found</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 pb-20">
                        <div className="p-3 bg-[#701a3d] rounded-xl border border-[#9d174d] shadow-inner">
                            <label className="text-[10px] uppercase font-black tracking-widest text-pink-300 block mb-3">Main Theme Color</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="w-12 h-12 rounded-lg cursor-pointer bg-white p-1 hover:scale-110 transition-transform"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs text-white font-mono uppercase font-bold">{primaryColor}</span>
                                    <span className="text-[8px] text-pink-300 uppercase font-black">Brand Hex</span>
                                </div>
                            </div>
                            <p className="text-[9px] text-pink-300/60 mt-3 italic leading-tight">This color will be applied globally across all UI components.</p>
                        </div>

                        <div className="p-3 bg-[#701a3d] rounded-xl border border-[#9d174d] shadow-inner">
                            <label className="text-[10px] uppercase font-black tracking-widest text-pink-300 block mb-3">Editor Preferences</label>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Full Width Interface</span>
                                    <button
                                        onClick={() => setFullWidth(!fullWidth)}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${fullWidth ? 'bg-orange-500' : 'bg-[#5a1230]'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${fullWidth ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                                <p className="text-[9px] text-pink-300/60 leading-tight">Removes container constraints for a wide-screen editing experience.</p>
                            </div>
                        </div>

                        <div className="p-3 bg-[#701a3d] rounded-xl border border-[#9d174d] shadow-inner">
                            <label className="text-[10px] uppercase font-black tracking-widest text-pink-300 block mb-3">Workspace Actions</label>
                            <div className="space-y-2">
                                <button className="w-full bg-[#5a1230] text-pink-200 py-2.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest text-left hover:bg-rose-500 hover:text-white transition-all shadow-md">Reset to Default</button>
                                <button className="w-full bg-[#5a1230] text-pink-200 py-2.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest text-left hover:bg-orange-500 hover:text-white transition-all shadow-md">Export Config (JSON)</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#701a3d] border-t border-[#9d174d] mt-auto">
                <button
                    className="w-full bg-orange-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-400 transition-all active:scale-95 shadow-xl shadow-emerald-950/20 group"
                    onClick={() => {
                        const btn = document.getElementById('publish-btn-text');
                        if (btn) btn.innerText = "SAVING CHANGES...";
                        setTimeout(() => {
                            window.location.reload();
                        }, 1200);
                    }}
                >
                    <span id="publish-btn-text" className="flex items-center justify-center gap-2">
                        <BoltIcon className="w-4 h-4 text-orange-100 group-hover:animate-pulse" />
                        Publish Changes
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default VisualEditorSidebar;
