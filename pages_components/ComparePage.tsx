

import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { MODELS } from '../constants';
import Spinner from '../components/Spinner';
import { BoltIcon } from '../components/icons/BoltIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { ListBulletIcon } from '../components/icons/ListBulletIcon';
import { useNotification } from '../context/NotificationContext';
import * as api from '../services/api';
import { InventoryItem, SellModel } from '../types';

export interface ComparePageProps {
    navigate: (path: string) => void;
}

// Flatten models for the dropdown list
const allModels = Object.values(MODELS).flat().sort();

// Smart Component that handles switching between Dropdown and Text Input
const DeviceSelection: React.FC<{
    value: string,
    onChange: (val: string) => void,
    otherValue: string,
    label: string
}> = ({ value, onChange, otherValue, label }) => {
    const [isCustom, setIsCustom] = useState(false);

    const toggleMode = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsCustom(!isCustom);
        onChange(''); // Reset value when switching modes to force user choice
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</label>
                <button
                    type="button"
                    onClick={toggleMode}
                    className="text-xs font-semibold text-[#059669] hover:text-[#047857] flex items-center gap-1 transition-colors"
                >
                    {isCustom ? (
                        <>
                            <ListBulletIcon className="w-3 h-3" /> Select from list
                        </>
                    ) : (
                        <>
                            <PencilSquareIcon className="w-3 h-3" /> Type manually
                        </>
                    )}
                </button>
            </div>

            {isCustom ? (
                <div className="relative">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Type model name (e.g. iPhone 18)"
                        className="w-full p-4 border border-gray-300 bg-white rounded-xl text-lg font-bold text-gray-900 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition-shadow hover:border-amber-400 outline-none"
                        autoFocus
                    />
                </div>
            ) : (
                <div className="relative">
                    <select
                        value={allModels.includes(value) ? value : ''} // Only set if value is in list, else empty
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full p-4 border border-gray-300 bg-white rounded-xl text-lg font-bold text-gray-900 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition-shadow hover:border-amber-400 outline-none appearance-none"
                    >
                        <option value="" disabled>Select a device...</option>
                        {allModels.map(model => (
                            <option key={model} value={model} disabled={model === otherValue}>{model}</option>
                        ))}
                    </select>
                    {/* Custom chevron to ensure UI consistency */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

const ComparePage: React.FC<ComparePageProps> = ({ navigate }) => {
    const [phone1, setPhone1] = useState<string>('iPhone 15 Pro Max');
    const [phone2, setPhone2] = useState<string>('Galaxy S24 Ultra');
    const [comparisonData, setComparisonData] = useState<{ feature: string, val1: string, val2: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasCompared, setHasCompared] = useState(false);
    const { addNotification } = useNotification();

    // States to cache products and trade-in models from db
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [sellModels, setSellModels] = useState<SellModel[]>([]);

    // Resolved phone image lists and indices for client-side loading
    const [phone1Images, setPhone1Images] = useState<string[]>([]);
    const [phone1ImgIndex, setPhone1ImgIndex] = useState<number>(0);
    const [phone2Images, setPhone2Images] = useState<string[]>([]);
    const [phone2ImgIndex, setPhone2ImgIndex] = useState<number>(0);

    useEffect(() => {
        const loadDeviceData = async () => {
            try {
                const [items, models] = await Promise.all([
                    api.getInventoryItems(),
                    api.getSellModels()
                ]);
                setInventoryItems(items);
                setSellModels(models);
            } catch (e) {
                console.warn("Failed to load inventory or sell models for comparison images:", e);
            }
        };
        loadDeviceData();
    }, []);

    const getDeviceImage = (deviceName: string, defaultFallback: string) => {
        if (!deviceName) return defaultFallback;
        const normalizedSearch = deviceName.toLowerCase().replace(/[^a-z0-9]/g, '');

        // 1. Check shop inventory
        const matchedItem = inventoryItems.find(item => {
            const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedModel = (item.specs?.model || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedSku = (item.sku || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return normalizedTitle.includes(normalizedSearch) || 
                   normalizedSearch.includes(normalizedTitle) ||
                   normalizedModel.includes(normalizedSearch) ||
                   normalizedSku.includes(normalizedSearch);
        });

        if (matchedItem && matchedItem.media && matchedItem.media.length > 0) {
            return matchedItem.media[0];
        }

        // 2. Check trade-in sell models
        const matchedModel = sellModels.find(m => {
            const normalizedModelName = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedFullName = `${m.brand} ${m.name}`.toLowerCase().replace(/[^a-z0-9]/g, '');
            return normalizedModelName.includes(normalizedSearch) || 
                   normalizedSearch.includes(normalizedModelName) ||
                   normalizedFullName.includes(normalizedSearch);
        });

        if (matchedModel && matchedModel.imageUrl) {
            return matchedModel.imageUrl;
        }

        return defaultFallback;
    };

    const getDeviceImageCandidates = async (deviceName: string, isPhone2: boolean): Promise<string[]> => {
        const candidates: string[] = [];
        if (!deviceName || deviceName.trim().length < 2) return candidates;

        // 1. Local Database Image
        const localImg = getDeviceImage(deviceName, '');
        if (localImg) {
            candidates.push(localImg);
        }

        // 2. Wikimedia Commons Smart Search (Client-Side Fetch)
        try {
            let query = deviceName.trim();
            const modelNumbers = query.match(/\d+/g) || [];
            if (/^\d/.test(query) && !/iphone|samsung|pixel|oneplus|xiaomi|huawei|oppo|vivo|realme/i.test(query)) {
                query = `iPhone ${query}`;
            }

            const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&prop=imageinfo&iiprop=url&format=json&origin=*`;
            
            const res = await fetch(commonsUrl);
            if (res.ok) {
                const data = await res.json();
                if (data.query && data.query.pages) {
                    const pages = data.query.pages;
                    const candidateFiles = [];
                    for (const pageId of Object.keys(pages)) {
                        const page = pages[pageId];
                        if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
                            candidateFiles.push({
                                title: page.title.toLowerCase(),
                                url: page.imageinfo[0].url
                            });
                        }
                    }

                    const negativeKeywords = [
                        'case', 'box', 'screenshot', 'lockscreen', 'sperrbildschirm', 
                        'broken', 'packaging', 'charger', 'cable', 'manual', 'lens', 
                        'cutout', 'logo', 'drawing', 'chart', 'diagram', 'graph', 
                        'data', 'comparison', 'specifications', 'specs', 'pricing', 
                        'table', 'ad', 'poster', 'mockup', '机型', '对比', '性能'
                    ];

                    for (const file of candidateFiles) {
                        if (file.url.toLowerCase().endsWith('.svg')) continue;
                        if (negativeKeywords.some(kw => file.title.includes(kw))) continue;

                        let aligned = true;
                        for (const num of modelNumbers) {
                            if (!file.title.includes(num)) {
                                aligned = false;
                                break;
                            }
                        }
                        if (aligned) {
                            candidates.push(file.url);
                            break; // Stop after first match to prioritize
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("Client-side Wikimedia Commons query failed:", e);
        }

        // 3. GSMArena Candidates
        const clean = deviceName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '');
        const parts = clean.split(/\s+/);
        if (parts.length > 0) {
            let brand = '';
            let model = '';
            const brands = ['apple', 'samsung', 'google', 'oneplus', 'xiaomi', 'huawei', 'oppo', 'vivo', 'realme', 'nokia', 'sony', 'motorola'];
            if (brands.includes(parts[0])) {
                brand = parts[0];
                model = parts.slice(1).join('-');
            } else {
                if (clean.includes('iphone')) {
                    brand = 'apple';
                    model = parts.join('-');
                } else {
                    brand = parts[0];
                    model = parts.slice(1).join('-');
                }
            }

            if (model) {
                let slug = model.startsWith(brand) ? model : `${brand}-${model}`;
                candidates.push(`https://fdn2.gsmarena.com/vv/bigpic/${slug}.jpg`);
                candidates.push(`https://fdn2.gsmarena.com/vv/bigpic/${slug}-5g.jpg`);
                candidates.push(`https://fdn2.gsmarena.com/vv/bigpic/${slug}-4g.jpg`);
                if (brand === 'apple' && !model.startsWith('iphone') && !model.startsWith('apple')) {
                    candidates.push(`https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-${model}.jpg`);
                }
            }
        }

        // 4. Default unsplash fallback
        candidates.push(
            isPhone2 
            ? 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&h=300&q=80'
            : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&h=300&q=80'
        );

        return candidates;
    };

    // Live effect hooks to update device images automatically
    useEffect(() => {
        const updateImg1 = async () => {
            const list = await getDeviceImageCandidates(phone1, false);
            setPhone1Images(list);
            setPhone1ImgIndex(0);
        };
        updateImg1();
    }, [phone1, inventoryItems, sellModels]);

    useEffect(() => {
        const updateImg2 = async () => {
            const list = await getDeviceImageCandidates(phone2, true);
            setPhone2Images(list);
            setPhone2ImgIndex(0);
        };
        updateImg2();
    }, [phone2, inventoryItems, sellModels]);

    const handleCompare = async () => {
        if (!phone1.trim() || !phone2.trim()) {
            addNotification("Please select or type both device names.", "error");
            return;
        }

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            addNotification("The AI API Key is not configured for this application.", "error");
            return;
        }

        setLoading(true);
        setHasCompared(false);
        try {
            const ai = new GoogleGenAI({ apiKey });

            const prompt = `Provide a highly detailed technical comparison between "${phone1}" and "${phone2}".
Return a JSON array of objects. Each object must have keys "feature", "val1" (for ${phone1}), and "val2" (for ${phone2}).
Do not add any text outside the JSON array.

You MUST include these features in this order:
'Display', 'Processor', 'Main Camera', 'Selfie Camera', 'Battery Capacity', 'Charging (Wired)', 'Operating System', 'Build Material', 'Stylus Support', 'Storage Options', 'Unique Feature'.

For 'Main Camera', detail all lenses (Wide, Ultrawide, Telephoto). For 'Display', include size, type, resolution, and brightness.

Example format:
[
  { "feature": "Display", "val1": "6.7-inch Super Retina XDR OLED, 120Hz, 2000 nits, Ceramic Shield", "val2": "6.8-inch Dynamic AMOLED 2X, 120Hz, 2600 nits, Gorilla Armor" }
]`;

            // FIX: Added responseSchema to enforce JSON output from the Gemini API.
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [{ text: prompt }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                feature: { type: Type.STRING },
                                val1: { type: Type.STRING },
                                val2: { type: Type.STRING }
                            },
                            required: ['feature', 'val1', 'val2']
                        }
                    }
                }
            });

            const text = response.text;
            if (!text) throw new Error("No response from AI. The model may have refused to answer, or the response was empty.");

            setComparisonData(JSON.parse(text));
            setHasCompared(true);
        } catch (error: any) {
            console.error("AI COMPARISON FAILED:", error);

            let detailedMessage = "An unknown error occurred.";
            if (error) {
                if (error.message) {
                    detailedMessage = error.message;
                } else {
                    try {
                        detailedMessage = JSON.stringify(error);
                    } catch (e) {
                        detailedMessage = String(error);
                    }
                }
            }

            addNotification(`Google API Error: ${detailedMessage}`, "error");
            addNotification("Switching to high-quota free tier model. Please check your network.", "info");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* 
                PERMANENTLY LOCKED HEADER (FIXED) 
                Changed from 'sticky' to 'fixed' to ensure it never moves during scroll.
             */}
            <div
                className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#059669] to-[#047857] pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3.5 px-4 md:hidden text-center shadow-md rounded-b-2xl"
            >
                <h1 className="text-xl font-bold text-white tracking-tight">Compare Phones</h1>
            </div>

            {/* SPACER FOR FIXED HEADER (Mobile Only) */}
            <div className="md:hidden h-[calc(5rem+env(safe-area-inset-top))]" aria-hidden="true"></div>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="text-center mb-8 md:mb-12 hidden md:block">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">Compare Phones</h1>
                    <p className="mt-4 text-lg text-gray-600 mx-auto max-w-2xl">
                        Powered by AI. Select any two devices (or type your own) to see a detailed, real-time spec showdown.
                    </p>
                </div>

                {/* Selection Area */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200 mb-8 relative overflow-visible">

                    {/* Desktop VS Circle */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-amber-500 rounded-full items-center justify-center text-white font-black text-xl shadow-lg border-4 border-white z-10">
                        VS
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                        <DeviceSelection label="Device 1" value={phone1} onChange={setPhone1} otherValue={phone2} />

                        {/* Mobile VS Badge */}
                        <div className="md:hidden flex justify-center -my-4 relative z-10">
                            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-md border-4 border-white">
                                VS
                            </div>
                        </div>

                        <DeviceSelection label="Device 2" value={phone2} onChange={setPhone2} otherValue={phone1} />
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleCompare}
                            disabled={loading}
                            className="bg-[#059669] text-white font-semibold py-3.5 px-10 rounded-xl hover:bg-[#047857] transition-all shadow-md active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2.5"
                        >
                            {loading ? <Spinner size="w-5 h-5 border-white" /> : <BoltIcon className="w-5 h-5" />}
                            {loading ? 'Analyzing Specs...' : 'Compare Now'}
                        </button>
                    </div>
                </div>

                {/* Visual Side-by-Side Comparison */}
                {hasCompared && !loading && (
                    <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto mb-8 animate-fade-in-up">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 mb-3 relative overflow-hidden">
                                <img 
                                    src={phone1Images[phone1ImgIndex] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&h=300&q=80'} 
                                    alt={phone1} 
                                    className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 hover:scale-105" 
                                    onError={(e) => {
                                        if (phone1ImgIndex < phone1Images.length - 1) {
                                            setPhone1ImgIndex(prev => prev + 1);
                                        } else {
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&h=300&q=80';
                                        }
                                    }}
                                />
                            </div>
                            <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 px-2 h-10 flex items-center justify-center">{phone1}</h3>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 mb-3 relative overflow-hidden">
                                <img 
                                    src={phone2Images[phone2ImgIndex] || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&h=300&q=80'} 
                                    alt={phone2} 
                                    className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 hover:scale-105"
                                    onError={(e) => {
                                        if (phone2ImgIndex < phone2Images.length - 1) {
                                            setPhone2ImgIndex(prev => prev + 1);
                                        } else {
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&h=300&q=80';
                                        }
                                    }}
                                />
                            </div>
                            <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 px-2 h-10 flex items-center justify-center">{phone2}</h3>
                        </div>
                    </div>
                )}

                {/* Comparison Results */}
                {hasCompared && !loading && (
                    <div className="animate-fade-in-up mt-8">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="grid grid-cols-3 bg-gray-800 text-white p-4 text-xs md:text-base font-bold text-left sticky top-0 z-10 rounded-t-2xl items-center">
                                <div className="pl-2">Feature</div>
                                <div className="text-amber-400 break-words px-2 text-center flex flex-col md:flex-row items-center justify-center gap-2">
                                    <img 
                                        src={phone1Images[phone1ImgIndex] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=80&h=80&q=80'} 
                                        alt="" 
                                        className="w-8 h-8 object-contain rounded bg-white p-0.5 border border-gray-600 flex-shrink-0"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=80&h=80&q=80';
                                        }}
                                    />
                                    <span className="line-clamp-1">{phone1}</span>
                                </div>
                                <div className="text-sky-400 break-words px-2 text-center flex flex-col md:flex-row items-center justify-center gap-2">
                                    <img 
                                        src={phone2Images[phone2ImgIndex] || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=80&h=80&q=80'} 
                                        alt="" 
                                        className="w-8 h-8 object-contain rounded bg-white p-0.5 border border-gray-600 flex-shrink-0"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=80&h=80&q=80';
                                        }}
                                    />
                                    <span className="line-clamp-1">{phone2}</span>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {comparisonData.map((row, index) => (
                                    <div key={index} className="grid grid-cols-3 text-sm md:text-base items-start">
                                        <div className="font-bold text-gray-800 bg-gray-100 p-4 h-full flex items-center">{row.feature}</div>
                                        <div className="text-left font-medium text-gray-800 px-4 py-3">{row.val1}</div>
                                        <div className="text-left font-medium text-gray-800 px-4 py-3">{row.val2}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-6">
                            * Comparison data generated by Bt mobile care AI based on available specifications.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComparePage;
