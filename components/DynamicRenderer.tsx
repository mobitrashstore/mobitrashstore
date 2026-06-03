import React from 'react';
import EditableText from './EditableText';
import { useVisualEditing } from '../context/VisualEditingContext';
import { TrashIcon } from './icons/TrashIcon';
import { StarIcon } from './icons/StarIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PlayIcon } from './icons/PlayIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { Squares2x2Icon } from './icons/Squares2x2Icon';
import { AdjustmentsHorizontalIcon } from './icons/AdjustmentsHorizontalIcon';
import VisualDropZone from './VisualDropZone';

export interface DynamicSectionData {
    id: string;
    type: string;
    content: any;
}

interface DynamicRendererProps {
    sections: DynamicSectionData[];
    onUpdate: (sections: DynamicSectionData[]) => void;
    onAddAt?: (widgetId: string, index: number) => void;
}

const DynamicRenderer: React.FC<DynamicRendererProps> = ({ sections, onUpdate, onAddAt }) => {
    const { isEditing } = useVisualEditing();

    const updateSectionContent = (id: string, newContent: any) => {
        const newSections = sections.map(s => s.id === id ? { ...s, content: newContent } : s);
        onUpdate(newSections);
    };

    const removeSection = (id: string) => {
        const newSections = sections.filter(s => s.id !== id);
        onUpdate(newSections);
    };

    const renderSection = (section: DynamicSectionData, index: number) => {
        const wrapper = (children: React.ReactNode, label?: string) => (
            <React.Fragment key={section.id}>
                {isEditing && onAddAt && index === 0 && (
                    <VisualDropZone onDrop={(w) => onAddAt(w, 0)} label="Insert Widget at Start" />
                )}

                <div className="relative group/section my-12 px-4 md:px-0 animate-fade-in">
                    {isEditing && (
                        <div className="absolute right-0 md:-right-14 top-0 opacity-0 group-hover/section:opacity-100 transition-opacity z-50 flex flex-col gap-2">
                            <div className="bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter mb-1 whitespace-nowrap shadow-xl">
                                {label || section.type}
                            </div>
                            <button
                                onClick={() => removeSection(section.id)}
                                className="p-2.5 bg-rose-500 text-white rounded-xl shadow-xl hover:bg-rose-600 transition-all hover:scale-110 active:scale-95"
                                title="Remove Section"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    {children}
                </div>

                {isEditing && onAddAt && (
                    <VisualDropZone onDrop={(w) => onAddAt(w, index + 1)} label={`Insert Widget after Section ${index + 1}`} />
                )}
            </React.Fragment>
        );

        const SetupBlock = ({ title, children }: { title: string, children: React.ReactNode }) => (
            <div className="mt-8 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <AdjustmentsHorizontalIcon className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{title} Configuration</h4>
                </div>
                <div className="grid gap-4">
                    {children}
                </div>
            </div>
        );

        switch (section.type) {
            case 'heading':
                return wrapper(
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            <EditableText
                                value={section.content.text || "Epic New Heading"}
                                onSave={(val) => updateSectionContent(section.id, { ...section.content, text: val })}
                            />
                        </h2>
                        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
                    </div>,
                    "Heading"
                );
            case 'text':
                return wrapper(
                    <div className="max-w-3xl mx-auto text-slate-600 leading-relaxed text-center text-lg">
                        <EditableText
                            value={section.content.text || "Experience a new level of quality and service with our premium offerings."}
                            onSave={(val) => updateSectionContent(section.id, { ...section.content, text: val })}
                            multiline
                        />
                    </div>,
                    "Text Editor"
                );
            case 'image':
                return wrapper(
                    <div className="max-w-5xl mx-auto space-y-4">
                        <div className="group/img relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100">
                            <img
                                src={section.content.url || "https://images.unsplash.com/photo-1556656793-062ff987b50d?auto=format&fit=crop&q=80&w=2000"}
                                alt="Dynamic"
                                className="w-full h-auto object-cover max-h-[600px] hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        {isEditing && (
                            <SetupBlock title="Image">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black text-slate-400 ml-1">Picture Link (URL)</p>
                                    <EditableText
                                        value={section.content.url || "https://images.unsplash.com/photo-1556656793-062ff987b50d?auto=format&fit=crop&q=80&w=2000"}
                                        onSave={(val) => updateSectionContent(section.id, { ...section.content, url: val })}
                                        className="text-primary font-mono text-xs break-all block p-3 bg-white rounded-2xl border border-slate-100"
                                    />
                                </div>
                            </SetupBlock>
                        )}
                    </div>,
                    "Image"
                );
            case 'video':
                const videoUrl = section.content.url || "https://www.youtube.com/embed/dQw4w9WgXcQ";
                return wrapper(
                    <div className="max-w-5xl mx-auto space-y-4">
                        <div className="aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative border-8 border-white group/vid">
                            <iframe
                                className="w-full h-full"
                                src={videoUrl}
                                title="Video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        {isEditing && (
                            <SetupBlock title="Video">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black text-slate-400 ml-1">YouTube Embed Link</p>
                                    <EditableText
                                        value={section.content.url || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                                        onSave={(val) => updateSectionContent(section.id, { ...section.content, url: val })}
                                        className="text-primary font-mono text-xs break-all block p-3 bg-white rounded-2xl border border-slate-100"
                                    />
                                    <p className="text-[9px] text-slate-400 italic mt-2 ml-1">Use the Link from YouTube: Right Click &gt; Copy Embed Code &gt; Extract the https:// part.</p>
                                </div>
                            </SetupBlock>
                        )}
                    </div>,
                    "Video Player"
                );
            case 'faq':
                return wrapper(
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                            <CheckCircleIcon className="w-6 h-6 text-primary" />
                            <EditableText value={section.content.title || "Frequently Asked Questions"} onSave={(v) => updateSectionContent(section.id, { ...section.content, title: v })} />
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="font-bold text-slate-900 mb-2">
                                        <EditableText value={section.content[`q${i}`] || `Question ${i} - How does this work?`} onSave={(v) => updateSectionContent(section.id, { ...section.content, [`q${i}`]: v })} />
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        <EditableText value={section.content[`a${i}`] || "Tailored response content goes here, explaining the details perfectly."} onSave={(v) => updateSectionContent(section.id, { ...section.content, [`a${i}`]: v })} multiline />
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>,
                    "FAQ Accordion"
                );
            case 'testimonial':
                return wrapper(
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} className="w-6 h-6 text-amber-500 fill-amber-500" />)}
                        </div>
                        <p className="text-2xl font-medium text-slate-800 italic leading-relaxed">
                            "<EditableText value={section.content.quote || "Absolutely incredible experience. Best in class service and support!"} onSave={(v) => updateSectionContent(section.id, { ...section.content, quote: v })} multiline />"
                        </p>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-200 rounded-full mb-3 overflow-hidden shadow-inner border-2 border-white">
                                <img src={`https://i.pravatar.cc/150?u=${section.id}`} alt="Avatar" />
                            </div>
                            <p className="font-bold text-slate-900">
                                <EditableText value={section.content.author || "Ramesh Khatri"} onSave={(v) => updateSectionContent(section.id, { ...section.content, author: v })} />
                            </p>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                                <EditableText value={section.content.role || "Verified Buyer"} onSave={(v) => updateSectionContent(section.id, { ...section.content, role: v })} />
                            </p>
                        </div>
                    </div>,
                    "Testimonial"
                );
            case 'contact':
                return wrapper(
                    <div className="max-w-3xl mx-auto bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="relative z-10 space-y-8">
                            <div className="text-center space-y-3">
                                <h3 className="text-4xl font-black">
                                    <EditableText value={section.content.title || "Get In Touch"} onSave={(v) => updateSectionContent(section.id, { ...section.content, title: v })} className="text-white" />
                                </h3>
                                <p className="text-white/60 text-lg">
                                    <EditableText value={section.content.desc || "Have questions? We're here to help you 24/7."} onSave={(v) => updateSectionContent(section.id, { ...section.content, desc: v })} multiline className="text-white/60" />
                                </p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input disabled placeholder="Full Name" className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/30" />
                                <input disabled placeholder="Email Address" className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/30" />
                                <button className="md:col-span-2 w-full bg-white text-slate-900 font-black py-4 rounded-2xl shadow-lg hover:bg-slate-100 transition-colors uppercase tracking-widest text-xs">Submit Request</button>
                            </div>
                        </div>
                    </div>,
                    "Contact Form"
                );
            case 'button':
                return wrapper(
                    <div className="flex justify-center my-6">
                        <button className="bg-primary hover:bg-opacity-90 text-white font-black py-4 px-12 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-lg">
                            <EditableText
                                value={section.content.text || "Book Now"}
                                onSave={(val) => updateSectionContent(section.id, { ...section.content, text: val })}
                                className="text-white"
                            />
                        </button>
                    </div>,
                    "CTA Button"
                );
            case 'divider':
                return wrapper(
                    <div className="flex items-center justify-center gap-4 py-8">
                        <div className="h-px bg-slate-100 flex-1 max-w-xs"></div>
                        <div className="w-3 h-3 bg-primary rotate-45 rounded-sm"></div>
                        <div className="h-px bg-slate-100 flex-1 max-w-xs"></div>
                    </div>,
                    "Separator"
                );
            case 'gallery':
                return wrapper(
                    <div className="max-w-6xl mx-auto space-y-6">
                        <p className="text-center font-black text-slate-900 text-3xl tracking-tight mb-8">
                            <EditableText
                                value={section.content.title || "Our Latest Collection Gallery"}
                                onSave={(val) => updateSectionContent(section.id, { ...section.content, title: val })}
                            />
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-md border-4 border-white group/gitem relative">
                                    <img
                                        src={section.content[`img${i}`] || `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800&u=${i}`}
                                        alt="Gallery"
                                        className="w-full h-full object-cover group-hover/gitem:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            ))}
                        </div>
                        {isEditing && (
                            <SetupBlock title="Gallery Photos">
                                <div className="grid grid-cols-2 gap-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="p-3 bg-white rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 mb-1 uppercase">Photo {i} Link</p>
                                            <EditableText
                                                value={section.content[`img${i}`] || ""}
                                                onSave={(v) => updateSectionContent(section.id, { ...section.content, [`img${i}`]: v })}
                                                className="text-[9px] font-mono break-all line-clamp-1 text-primary"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </SetupBlock>
                        )}
                    </div>,
                    "Image Gallery"
                );
            case 'map':
                return wrapper(
                    <div className="max-w-6xl mx-auto space-y-4">
                        <div className="h-[400px] bg-slate-100 rounded-[3rem] overflow-hidden shadow-2xl relative border-8 border-white">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                src={`https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${encodeURIComponent(section.content.location || "Pako Phedi, Kathmandu, Nepal")}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
                            ></iframe>
                        </div>
                        {isEditing && (
                            <SetupBlock title="Store Map">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black text-slate-400 ml-1">Store Address</p>
                                    <EditableText
                                        value={section.content.location || "Pako Phedi, Kathmandu, Nepal"}
                                        onSave={(val) => updateSectionContent(section.id, { ...section.content, location: val })}
                                        className="text-primary font-bold text-sm block p-3 bg-white rounded-2xl border border-slate-100"
                                    />
                                    <p className="text-[9px] text-slate-400 italic mt-2 ml-1">The map will automatically center on the address you type above.</p>
                                </div>
                            </SetupBlock>
                        )}
                    </div>,
                    "Google Map"
                );
            case 'stats':
                return wrapper(
                    <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="text-center space-y-2 p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-50">
                                <p className="text-4xl font-black text-primary">
                                    <EditableText value={section.content[`v${i}`] || (i * 10).toString() + "+"} onSave={(v) => updateSectionContent(section.id, { ...section.content, [`v${i}`]: v })} />
                                </p>
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                    <EditableText value={section.content[`l${i}`] || "Satisfied Clients"} onSave={(v) => updateSectionContent(section.id, { ...section.content, [`l${i}`]: v })} />
                                </p>
                            </div>
                        ))}
                    </div>,
                    "Stats Counter"
                );
            case 'brands':
                return wrapper(
                    <div className="max-w-6xl mx-auto py-12 px-4 bg-white rounded-[3rem] shadow-xl border border-slate-100">
                        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-8">Our Certified Partners</p>
                        <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                            {[1, 2, 3, 4, 5].map(i => (
                                <img key={i} src={`https://ik.imagekit.io/fixedmyspeaker/partner${i}.png?tr=w-120`} className="h-8 md:h-12 object-contain" alt="Partner" />
                            ))}
                        </div>
                    </div>,
                    "Partner Logos"
                );
            case 'social':
                return wrapper(
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div className="text-center">
                            <h3 className="text-2xl font-black">
                                <EditableText value={section.content.title || "Follow Our Journey"} onSave={(v) => updateSectionContent(section.id, { ...section.content, title: v })} />
                            </h3>
                            <p className="text-primary font-bold">@mobistorestore</p>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-sm hover:scale-105 transition-transform">
                                    <img src={`https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400&u=social${i}`} className="w-full h-full object-cover" alt="Social" />
                                </div>
                            ))}
                        </div>
                    </div>,
                    "Social Feed"
                );
            case 'countdown':
                return wrapper(
                    <div className="max-w-4xl mx-auto bg-primary rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                        <h3 className="text-xl font-black uppercase tracking-[0.2em] mb-8 text-white/80 italic">Flash Sale Ending In</h3>
                        <div className="flex justify-center gap-4 md:gap-8">
                            {['Days', 'Hours', 'Mins', 'Secs'].map(unit => (
                                <div key={unit} className="flex flex-col items-center">
                                    <div className="w-20 h-24 md:w-28 md:h-32 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl flex items-center justify-center text-4xl md:text-5xl font-black mb-2">
                                        {Math.floor(Math.random() * 60)}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>,
                    "Countdown Timer"
                );
            case 'announcement':
                return wrapper(
                    <div className="max-w-6xl mx-auto bg-amber-400 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-b-8 border-amber-600 active:translate-y-1 transition-transform cursor-default">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center animate-bounce">
                                <StarIcon className="w-6 h-6 text-slate-900" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight italic leading-none">
                                    <EditableText value={section.content.title || "Limited Time Offer!"} onSave={(v) => updateSectionContent(section.id, { ...section.content, title: v })} />
                                </h4>
                                <p className="text-slate-900/60 font-bold text-xs">
                                    <EditableText value={section.content.sub || "Get 10% extra on trade-ins today only."} onSave={(v) => updateSectionContent(section.id, { ...section.content, sub: v })} />
                                </p>
                            </div>
                        </div>
                        <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-110 active:scale-95 transition-all">Claim Now</button>
                    </div>,
                    "Promo Banner"
                );
            case 'gift':
                return wrapper(
                    <div className="max-w-2xl mx-auto p-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[3.5rem] shadow-2xl animate-gradient-slow">
                        <div className="bg-white p-10 rounded-[3rem] text-center space-y-6">
                            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] mx-auto flex items-center justify-center shadow-inner">
                                <StarIcon className="w-10 h-10 text-rose-500 animate-pulse" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                                <EditableText value={section.content.title || "Surprise Reward!"} onSave={(v) => updateSectionContent(section.id, { ...section.content, title: v })} />
                            </h3>
                            <p className="text-slate-500 font-medium italic">
                                <EditableText value={section.content.desc || "A special token of appreciation for our first 100 customers today."} onSave={(v) => updateSectionContent(section.id, { ...section.content, desc: v })} multiline />
                            </p>
                            <div className="pt-4">
                                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:ring-8 ring-indigo-100 transition-all shadow-xl">Reveal Gift</button>
                            </div>
                        </div>
                    </div>,
                    "Offer Box"
                );
            case 'rating':
                return wrapper(
                    <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 text-center space-y-4">
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} className="w-8 h-8 text-amber-500 fill-amber-500" />)}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-5xl font-black text-slate-900">
                                <EditableText value={section.content.score || "4.9/5"} onSave={(v) => updateSectionContent(section.id, { ...section.content, score: v })} />
                            </h4>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                <EditableText value={section.content.sub || "Average Customer Trust Rating"} onSave={(v) => updateSectionContent(section.id, { ...section.content, sub: v })} />
                            </p>
                        </div>
                    </div>,
                    "Trust Rating"
                );
            case 'posts':
                return wrapper(
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-primary pl-4">
                                <EditableText value={section.content.title || "Latest From Blog"} onSave={(v) => updateSectionContent(section.id, { ...section.content, title: v })} />
                            </h3>
                            <div className="h-0.5 bg-slate-100 flex-1 mx-6 hidden md:block"></div>
                            <span className="text-xs font-black uppercase tracking-widest text-primary cursor-pointer">View All</span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 group/pitem">
                                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                                        <img src={`https://images.unsplash.com/photo-1512428559083-a400a440af64?auto=format&fit=crop&q=80&w=800&u=${i}`} className="w-full h-full object-cover group-hover/pitem:scale-110 transition-transform duration-700" alt="post" />
                                    </div>
                                    <div className="p-5 space-y-3 text-left">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                                            <span>Maintenance</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="text-slate-400">Feb 10</span>
                                        </div>
                                        <h4 className="font-black text-slate-900 text-lg leading-tight">Importance of Cleaning Your Charging Port Regularly</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>,
                    "Blog Posts Feed"
                );
            case 'products':
                return wrapper(
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div className="text-center space-y-2">
                            <h3 className="text-3xl font-black tracking-tight text-slate-900">
                                <EditableText value={section.content.title || "Best Selling Accessories"} onSave={(v) => updateSectionContent(section.id, { ...section.content, title: v })} />
                            </h3>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Premium Gear For Your Gadgets</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white p-4 rounded-3xl shadow-xl border border-slate-50 flex flex-col items-center gap-4 text-center">
                                    <div className="aspect-square w-full bg-slate-50 rounded-2xl p-4">
                                        <img src={`https://images.unsplash.com/photo-1583394838336-397f71f48731?auto=format&fit=crop&q=80&w=400&u=${i}`} alt="product" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-black text-slate-900 text-sm">Protective Silicone Case</p>
                                        <p className="text-primary font-black text-lg">Rs. 950</p>
                                    </div>
                                    <button className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">Buy Now</button>
                                </div>
                            ))}
                        </div>
                    </div>,
                    "Product Collection Grid"
                );
            default:
                return wrapper(
                    <div className="p-12 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200 text-center">
                        <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <StarIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Unsupported Widget: {section.type}</p>
                    </div>,
                    "Unknown Widget"
                );
        }
    };

    return (
        <div className="dynamic-sections-container space-y-16">
            {sections.map(renderSection)}
        </div>
    );
};

export default DynamicRenderer;
