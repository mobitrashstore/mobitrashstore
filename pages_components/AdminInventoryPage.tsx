
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as api from '../services/api';
import { InventoryItem, Category, Brand, ProductVariant } from '../types';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import Spinner from '../components/Spinner';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { SPEC_TEMPLATES, WARRANTY_OPTIONS, BRANDS_DATA, MODELS, STORAGE_OPTIONS, PHONE_SPECS } from '../constants';
import { ImageUploader } from '../components/ImageUploader';
// Fix: Import Type from @google/genai to define response schema for AI generation
import { GoogleGenAI, Type } from "@google/genai";
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { TagIcon } from '../components/icons/TagIcon';
import { GlobeAltIcon } from '../components/icons/GlobeAltIcon';
import { ArrowDownTrayIcon } from '../components/icons/ArrowDownTrayIcon';
import { ArrowPathIcon } from '../components/icons/ArrowPathIcon';
import { BoltIcon } from '../components/icons/BoltIcon';
import { LockClosedIcon } from '../components/icons/LockClosedIcon';
import { ArchiveBoxIcon } from '../components/icons/ArchiveBoxIcon';

interface AdminInventoryPageProps {
    navigate: (path: string) => void;
}

type Spec = { key: string; value: string };

const PlayIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l1.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const ProductModal: React.FC<{
    item: Partial<InventoryItem> | null;
    categories: Category[];
    brands: Brand[];
    homeConfig: any;
    onClose: () => void;
    onSave: (item: InventoryItem, shouldClose?: boolean) => void;
    onDelete?: (sku: string) => void;
}> = ({ item, categories, brands, homeConfig, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        currency: 'NPR' as const,
        specs: {},
        category: '',
        colorsString: '',
        tagsString: '',
        dimensions: { length: '', width: '', height: '' },
        videoUrl: '',
        ...item,
        grade: item?.grade || 'New',
        brand: (item?.specs?.brand as string) || '',
        model: (item?.specs?.model as string) || '',
        homePageSections: item?.homePageSections || [],
        metaTitle: item?.metaTitle || '',
        metaDescription: item?.metaDescription || '',
        flashSaleEndTime: item?.flashSaleEndTime || '',
        isDraft: item?.isDraft ?? false,
        purchasePrice: item?.purchasePrice || 0,
        availabilityStatus: item?.availabilityStatus || 'In Stock',
        lowStockThreshold: item?.lowStockThreshold || 5,
        internalNotes: item?.internalNotes || '',
        isFreeShipping: item?.isFreeShipping ?? false,
        mpn: item?.mpn || '',
        // Ensure media has 10 slots
        media: item?.media ? [...item.media, ...Array(10 - item.media.length).fill('')].slice(0, 10) : Array(10).fill('')
    });

    const [suggestedModels, setSuggestedModels] = useState<string[]>([]);
    const [suggestedStorages, setSuggestedStorages] = useState<number[]>([]);

    const categoryConfig = useMemo(() => {
        const cat = (formData.category || '').toLowerCase();

        // Default Configuration
        const config = {
            brandLabel: 'Brand / Manufacturer',
            modelLabel: 'Model / Type / Variety',
            variantLabel: 'Variation (Color/Type)',
            detailLabel: 'Detail (Size/Spec)',
            showColors: true,
            showDimensions: true,
            showWeight: true,
            placeholderTitle: 'e.g. Product Name',
            isPhone: false
        };

        if (cat.includes('phone') || cat === 'mobile' || cat === 'certified pre-owned') {
            config.brandLabel = 'Phone Brand';
            config.modelLabel = 'Phone Model';
            config.variantLabel = 'Color';
            config.detailLabel = 'Storage / RAM';
            config.placeholderTitle = 'e.g. iPhone 15 Pro Max';
            config.isPhone = true;
        } else if (cat.includes('keyboard') || cat.includes('mouse')) {
            config.brandLabel = 'Manufacturer';
            config.modelLabel = 'Model Name';
            config.variantLabel = 'Switch / Color';
            config.detailLabel = 'Layout / Connection';
            config.placeholderTitle = 'e.g. Logitech G Pro';
        } else if (cat.includes('tool') || cat.includes('part')) {
            config.brandLabel = 'Manufacturer';
            config.modelLabel = 'Part No / Model Name';
            config.variantLabel = 'Capacity / Size';
            config.detailLabel = 'Compatibility';
            config.showDimensions = false;
            config.placeholderTitle = 'e.g. Falcon 530 Cleaner';
        } else if (cat.includes('case') || cat.includes('protection')) {
            config.brandLabel = 'Brand';
            config.modelLabel = 'Fits Device Model';
            config.variantLabel = 'Pill Color';
            config.detailLabel = 'Material / Type';
            config.placeholderTitle = 'e.g. Silicon Case for iPhone 15';
        } else if (cat.includes('charger') || cat.includes('cable') || cat.includes('power bank')) {
            config.brandLabel = 'Brand';
            config.modelLabel = 'Model Name / Spec';
            config.variantLabel = 'Color / Length';
            config.detailLabel = 'Output (W/mAh)';
            config.placeholderTitle = 'e.g. 20W Fast Charger';
        } else if (cat.includes('watch') || cat.includes('wearable')) {
            config.brandLabel = 'Brand';
            config.modelLabel = 'Model / Series';
            config.variantLabel = 'Strap Color';
            config.detailLabel = 'Case Size';
            config.placeholderTitle = 'e.g. Apple Watch Series 9';
        }

        return config;
    }, [formData.category]);

    // Complex state for Variants and Image Mappings
    const [variants, setVariants] = useState<ProductVariant[]>(item?.variants || []);
    const [imageColorMap, setImageColorMap] = useState<{ [index: number]: string }>(item?.imageColorIndex || {});

    const initialSpecs = { ...item?.specs };
    delete (initialSpecs as any).brand;
    delete (initialSpecs as any).model;
    const [specs, setSpecs] = useState<Spec[]>(Object.entries(initialSpecs).map(([key, value]) => ({ key, value: String(value) })));

    const [isBadgeEnabled, setIsBadgeEnabled] = useState(!!item?.badge?.text);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const isEditMode = !!item?.sku;

    // --- DRAFT LOGIC ---
    useEffect(() => {
        // Load Draft if new product
        if (!isEditMode) {
            const draft = localStorage.getItem('admin_product_draft');
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    // Ask user? Or just load? User is angry, just load but show toast/log
                    console.log("Loaded draft");
                    setFormData(prev => ({ ...prev, ...parsed.formData }));
                    if (parsed.variants) setVariants(parsed.variants);
                    if (parsed.specs) setSpecs(parsed.specs);
                } catch (e) {
                    console.error("Draft load failed", e);
                }
            }
        }
    }, [isEditMode]);

    // Save Draft on Change
    useEffect(() => {
        if (!isEditMode) {
            const draftData = {
                formData,
                variants,
                specs
            };
            localStorage.setItem('admin_product_draft', JSON.stringify(draftData));
        }
    }, [formData, variants, specs, isEditMode]);

    // --- LOCK LOGIC ---
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isLocked) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isLocked]);

    // Derived list of available colors from the input string
    const availableColors = useMemo(() => {
        return formData.colorsString
            ? formData.colorsString.split(',').map(c => c.trim()).filter(c => c !== '')
            : [];
    }, [formData.colorsString]);

    // Auto-generate SKU from Model/Type for new products
    useEffect(() => {
        if (!isEditMode) {
            const generateSku = (value: string) => {
                return value.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
            };
            const newSku = generateSku(formData.model || '');
            setFormData(prev => ({ ...prev, sku: newSku }));
        }
    }, [formData.model, isEditMode]);

    useEffect(() => {
        if (!isEditMode) {
            const template = SPEC_TEMPLATES[formData.category];
            const newSpecs = template ? JSON.parse(JSON.stringify(template)) : [{ key: '', value: '' }];
            setSpecs(newSpecs);
        }
    }, [formData.category, isEditMode]);

    // Update suggestions when brand/model changes
    useEffect(() => {
        if (formData.brand && MODELS[formData.brand]) {
            setSuggestedModels(MODELS[formData.brand]);
        } else {
            setSuggestedModels([]);
        }
    }, [formData.brand]);

    useEffect(() => {
        if (formData.model && STORAGE_OPTIONS[formData.model]) {
            setSuggestedStorages(STORAGE_OPTIONS[formData.model]);
        } else {
            setSuggestedStorages([]);
        }
    }, [formData.model]);

    useEffect(() => {
        if (!isEditMode && item?.category) {
            setFormData(prev => ({ ...prev, category: item.category ?? '' }));
        } else if (!isEditMode && !item?.category && categories.length > 0) {
            setFormData(prev => ({ ...prev, category: categories[0].name }));
        }

        if (item?.colors) {
            setFormData(prev => ({ ...prev, colorsString: item.colors!.join(', ') }));
        }
        if (item?.tags) {
            setFormData(prev => ({ ...prev, tagsString: item.tags!.join(', ') }));
        }
    }, [item, isEditMode, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name.includes('Price') || name === 'stock' || name === 'weight_g' || name.includes('Price') ? (value === '' ? '' : Number(value)) : value }));
    };

    const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            dimensions: {
                ...prev.dimensions,
                [name]: value ? Number(value) : ''
            }
        }));
    };

    const handleImageChange = (index: number, value: string) => {
        const newMedia = [...formData.media];
        newMedia[index] = value;
        setFormData(prev => ({ ...prev, media: newMedia }));

        // If image is removed, remove its color mapping
        if (!value) {
            const newMap = { ...imageColorMap };
            delete newMap[index];
            setImageColorMap(newMap);
        }
    };

    const handleImageColorSelect = (index: number, color: string) => {
        setImageColorMap(prev => ({ ...prev, [index]: color }));
    };

    const handleBadgeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newBadge = {
                ...(prev.badge || { text: '', color: 'bg-blue-500', position: 'top-left' as const }),
                [name]: value,
            };
            return { ...prev, badge: newBadge };
        });
    };

    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    const addSpecField = () => {
        setSpecs([...specs, { key: '', value: '' }]);
    };

    const removeSpecField = (index: number) => {
        setSpecs(specs.filter((_, i) => i !== index));
    };

    const generateAiDescriptionAndTags = async () => {
        if (!formData.brand || !formData.model) {
            alert("Please enter Brand and Model first.");
            return;
        }

        setIsGeneratingAi(true);
        let key = (process.env as any).API_KEY || (process.env as any).GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
        if (key) key = key.toString().replace(/^["']|["']$/g, '');
        
        if (!key) {
             alert("Missing API Key. Ensure it is in .env.local and you have restarted the Vite server.");
             setIsGeneratingAi(false);
             return;
        }

        const promptText = `Describe "${formData.brand} ${formData.model}" (${formData.category}). Output JSON ONLY: {"metaTitle": "string", "metaDescription": "string", "description": "Markdown text", "tags": "tags", "specs": [{"key": "string", "value": "string"}]}`;

        try {
            // Using gemini-flash-latest as confirmed available by your diagnostic check
            const apiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
            });

            const result = await apiResp.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                let text = result.candidates[0].content.parts[0].text;
                text = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
                const success = JSON.parse(text);
                
                setFormData(prev => ({
                    ...prev,
                    metaTitle: success.metaTitle || '',
                    metaDescription: success.metaDescription || '',
                    description: success.description || '',
                    tagsString: success.tags || ''
                }));
                if (success.specs) setSpecs(success.specs);
                alert("AI Magic Complete!");
            } else if (result.error) {
                 // Final fallback attempt using gemini-2.0-flash
                 console.log("gemini-flash-latest failed, trying gemini-2.0-flash...");
                 const flash2Resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
                 });
                 const flash2Result = await flash2Resp.json();
                 if (flash2Result.candidates?.[0]?.content?.parts?.[0]?.text) {
                     let text = flash2Result.candidates[0].content.parts[0].text;
                     text = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
                     const data = JSON.parse(text);
                     setFormData(prev => ({ ...prev, metaTitle: data.metaTitle, metaDescription: data.metaDescription, description: data.description, tagsString: data.tags }));
                     if (data.specs) setSpecs(data.specs);
                     alert("AI Magic Complete!");
                 } else {
                     throw new Error(result.error.message || "Model failed to generate content.");
                 }
            }
        } catch (error: any) {
            console.error("AI Generation failed:", error);
            alert("AI Magic failed: " + (error.message || "Unknown error"));
        } finally {
            setIsGeneratingAi(false);
        }
    };

    // --- Variant Handlers ---
    const addVariant = () => {
        setVariants([...variants, { id: Date.now().toString(), color: '', storage: '', price: 0, stock: 0 }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const handleFinalSubmit = (e: React.FormEvent, shouldClose = false) => {
        e.preventDefault(); // Prevent standard submission

        // Run validation logic from original handleSubmit
        const validMedia = formData.media.filter(url => url && url.trim() !== '');
        if (validMedia.length === 0) {
            alert("Please add at least one main image.");
            return;
        }

        const otherSpecsObject = specs.reduce((obj, { key, value }) => {
            if (key.trim()) obj[key.trim()] = value;
            return obj;
        }, {} as { [key: string]: string | number });

        const specsObject = {
            brand: formData.brand,
            model: formData.model,
            ...otherSpecsObject
        };

        // If variants exist, prioritize the LOWEST price as the display price
        let finalPrice = formData.price;
        let finalStock = formData.stock;

        if (variants.length > 0) {
            // Find lowest price
            const minPrice = Math.min(...variants.map(v => v.price));
            if (minPrice > 0) finalPrice = minPrice;

            // Sum stock
            const totalVariantStock = variants.reduce((sum, v) => sum + v.stock, 0);
            finalStock = totalVariantStock;
        }

        const tagsArray = formData.tagsString
            ? formData.tagsString.split(',').map(t => t.trim()).filter(t => t !== '')
            : [];

        const { brand, model, media, colorsString, tagsString, ...restOfFormData } = formData;

        const finalData = {
            ...restOfFormData,
            price: finalPrice,
            stock: finalStock,
            media: validMedia,
            specs: specsObject,
            colors: availableColors,
            tags: tagsArray,
            variants: variants,
            imageColorIndex: imageColorMap,
            flashSaleEndTime: formData.flashSaleEndTime || null,
            dimensions: {
                length: Number(formData.dimensions.length) || 0,
                width: Number(formData.dimensions.width) || 0,
                height: Number(formData.dimensions.height) || 0,
            }
        };

        if (!isBadgeEnabled || !finalData.badge?.text?.trim()) {
            delete finalData.badge;
        }

        // Pass shouldClose flag
        onSave(finalData as InventoryItem, shouldClose);

        // Clear draft if saving new item successfully (optimistic)
        if (!isEditMode) {
            localStorage.removeItem('admin_product_draft');
        }
    };

    // Kept for form implicit submit (Enter key), defaults to Keep Open
    const handleSubmit = (e: React.FormEvent) => handleFinalSubmit(e, false);

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    // Simplified logic: Check if category is related to phones for specific UI hints
    const isPhoneCategory = categoryConfig.isPhone;
    const specTemplateKeys = SPEC_TEMPLATES[formData.category] ? SPEC_TEMPLATES[formData.category].map(s => s.key) : [];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-start justify-center p-4 pt-16 overflow-y-auto animate-fade-in custom-scrollbar">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-auto max-h-[85vh] overflow-hidden relative z-10 my-4 sm:my-8">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Enter product information accurately for the storefront.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                    <div className="flex-1 p-4 lg:p-6 space-y-8 overflow-y-auto custom-scrollbar bg-white min-h-0">
                        <section className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Product Title</label>
                                    <input type="text" name="title" value={formData.title || ''} onChange={handleChange} placeholder={categoryConfig.placeholderTitle} required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                        <select 
                                            value={formData.isDraft ? 'Draft' : 'Published'} 
                                            onChange={(e) => setFormData(p => ({ ...p, isDraft: e.target.value === 'Draft' }))}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="Published">Online (Live)</option>
                                            <option value="Draft">Draft (Hidden)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Status</label>
                                        <select
                                            name="availabilityStatus"
                                            value={formData.availabilityStatus}
                                            onChange={handleChange}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="In Stock">In Stock</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                            <option value="Pre-Order">Pre-Order</option>
                                            <option value="Arriving Soon">Arriving Soon</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-800 mb-3">Homepage Sections</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                    {[
                                        { key: 'hotProducts', internal: 'Hot Product' },
                                        { key: 'hotAccessories', internal: 'Hot Accessory' },
                                        { key: 'phoneCases', internal: 'Phone Cases' },
                                        { key: 'hotTools', internal: 'Hot Tool' },
                                        { key: 'hotParts', internal: 'Hot Part' },
                                        { key: 'certifiedPreOwned', internal: 'Certified Pre-Owned' }
                                    ].map(section => (
                                        <label key={section.internal} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded cursor-pointer hover:border-blue-400">
                                            <input
                                                type="checkbox"
                                                checked={formData.homePageSections.includes(section.internal)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        homePageSections: checked
                                                            ? [...(prev.homePageSections || []), section.internal]
                                                            : (prev.homePageSections || []).filter(s => s !== section.internal)
                                                    }));
                                                }}
                                                className="w-3.5 h-3.5 text-blue-600 rounded"
                                            />
                                            <span className="text-xs font-medium text-gray-700">
                                                {homeConfig?.titles?.[section.key] || section.internal}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-200">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Flash Sale Countdown (Optional)</label>
                                <input
                                    type="datetime-local"
                                    name="flashSaleEndTime"
                                    value={formData.flashSaleEndTime || ''}
                                    onChange={handleChange}
                                    className="w-full max-w-xs p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">Displays a countdown timer on the product card.</p>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">SKU (Part Number)</label>
                                <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} placeholder="e.g. APL-IP14-BK" required disabled={isEditMode} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-50 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Manufacturer / Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    list="brand-suggestions"
                                    placeholder="e.g. Apple"
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <datalist id="brand-suggestions">
                                    {brands.map(b => <option key={b.name} value={b.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Model Name</label>
                                <input type="text" name="model" value={formData.model} onChange={handleChange} list="model-suggestions" placeholder="e.g. iPhone 15 Pro" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                                <datalist id="model-suggestions">
                                    {suggestedModels.map(m => <option key={m} value={m} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Condition</label>
                                <select name="grade" value={formData.grade || 'New'} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white">
                                    <option value="New">Brand New</option>
                                    <option value="Open Box">Open Box</option>
                                    <option value="99%">99% Like New</option>
                                    <option value="90%">90% Minor Use</option>
                                    <option value="Fair">Fair / Budget</option>
                                    <option value="Refurbished">Refurbished</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1 text-nowrap">Available Colors (Comma Separated)</label>
                                <input type="text" name="colorsString" value={formData.colorsString || ''} onChange={handleChange} placeholder="Black, White, Gold, Silver" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                        </section>

                        {/* Pricing & Variants Section */}
                        <section className="p-5 border border-gray-200 rounded-xl bg-white space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Pricing & Inventory</h3>
                                <button type="button" onClick={addVariant} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                    <PlusCircleIcon className="w-4 h-4" /> Add Color/Storage Variant
                                </button>
                            </div>

                            {/* Variants Table */}
                            {variants.length > 0 && (
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-3 py-2 font-bold text-gray-600">{categoryConfig.variantLabel}</th>
                                                <th className="px-3 py-2 font-bold text-gray-600">{categoryConfig.detailLabel}</th>
                                                <th className="px-3 py-2 font-bold text-gray-600">Price (NPR)</th>
                                                <th className="px-3 py-2 font-bold text-gray-600 text-center">Stock</th>
                                                <th className="px-3 py-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {variants.map((v, idx) => (
                                                <tr key={v.id}>
                                                    <td className="px-2 py-1.5">
                                                        <input
                                                            type="text"
                                                            value={v.color}
                                                            onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                                                            placeholder="Color"
                                                            className="w-full p-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1.5">
                                                        <input
                                                            type="text"
                                                            value={v.storage}
                                                            onChange={(e) => updateVariant(idx, 'storage', e.target.value)}
                                                            placeholder="e.g. 128GB"
                                                            className="w-full p-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1.5">
                                                        <input
                                                            type="number"
                                                            value={v.price}
                                                            onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                                                            className="w-full p-1 border rounded font-mono"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1.5">
                                                        <input
                                                            type="number"
                                                            value={v.stock}
                                                            onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                                                            className="w-full p-1 border rounded text-center w-16 mx-auto"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1.5 text-center">
                                                        <button type="button" onClick={() => removeVariant(idx)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cost Price (NPR)</label>
                                    <input type="number" name="purchasePrice" value={formData.purchasePrice || ''} onChange={handleChange} placeholder="0" className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Selling Price (NPR)</label>
                                    <input type="number" name="price" value={formData.price || ''} onChange={handleChange} placeholder="0" required={variants.length === 0} readOnly={variants.length > 0} className={`w-full p-2 border rounded text-sm ${variants.length > 0 ? 'bg-gray-50 text-gray-400' : 'border-gray-300 focus:ring-1 focus:ring-blue-500'}`} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Old Price (MRP)</label>
                                    <input type="number" name="oldPrice" value={formData.oldPrice || ''} onChange={handleChange} placeholder="0" className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Base Stock</label>
                                    <input type="number" name="stock" value={formData.stock || 0} onChange={handleChange} required={variants.length === 0} readOnly={variants.length > 0} className={`w-full p-2 border rounded text-sm ${variants.length > 0 ? 'bg-gray-50 text-gray-400' : 'border-gray-300 focus:ring-1 focus:ring-blue-500'}`} />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900 uppercase">Product Media</h3>
                                <div className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Max 10 Images</div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {formData.media.map((imgUrl, index) => (
                                     <div key={index} className="space-y-2">
                                         <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                             {index === 0 ? 'Primary Image' : `Img ${index + 1}`}
                                         </label>
                                         <ImageUploader
                                             imageUrl={imgUrl}
                                             onImageChange={(dataUrl) => handleImageChange(index, dataUrl)}
                                             onClear={() => handleImageChange(index, '')}
                                         />
                                         {imgUrl && availableColors.length > 0 && (
                                             <select
                                                 value={imageColorMap[index] || ''}
                                                 onChange={(e) => handleImageColorSelect(index, e.target.value)}
                                                 className="w-full p-1 text-[10px] border border-gray-300 rounded bg-white"
                                             >
                                                 <option value="">Map Color...</option>
                                                 {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                                             </select>
                                         )}
                                     </div>
                                 ))}
                            </div>

                            {/* Added Video URL Input */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                                    <PlayIcon className="w-3 h-3 text-rose-500" />
                                    Product Video Portfolio URL (YouTube / Vimeo / mp4)
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="videoUrl"
                                        value={formData.videoUrl || ''}
                                        onChange={handleChange}
                                        placeholder="Paste link e.g. https://www.youtube.com/watch?v=..."
                                        className="w-full p-3 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500 transition-all font-medium"
                                    />
                                    {formData.videoUrl && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase animate-pulse">Live</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 italic leading-relaxed">
                                    Supports YouTube links, Shorts, Vimeo, or direct .mp4 links. This video will appear as a playable thumb in the product gallery.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase">Specifications & Meta</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-semibold text-gray-700">Description</label>
                                            <button
                                                type="button"
                                                onClick={generateAiDescriptionAndTags}
                                                disabled={isGeneratingAi}
                                                className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md text-[9px] font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                                            >
                                                {isGeneratingAi ? <ArrowPathIcon className="w-2.5 h-2.5 animate-spin" /> : <SparklesIcon className="w-2.5 h-2.5" />}
                                                AI GPT
                                            </button>
                                        </div>
                                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={5} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">SEO Tags</label>
                                        <input type="text" name="tagsString" value={formData.tagsString || ''} onChange={handleChange} placeholder="iphone, buy mobile, kathmandu" className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-xs font-bold text-gray-600 uppercase">Technical Specs</h4>
                                        <div className="flex gap-2 items-center">
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const modelSpecs = PHONE_SPECS[formData.model];
                                                    if (modelSpecs) {
                                                        const newSpecs = Object.entries(modelSpecs).map(([key, value]) => ({ 
                                                            key, 
                                                            value: Array.isArray(value) ? value.join(', ') : String(value) 
                                                        }));
                                                        setSpecs(newSpecs);
                                                    } else {
                                                        if (confirm("No predefined specs found. Use AI to generate them now?")) {
                                                            generateAiDescriptionAndTags();
                                                        }
                                                    }
                                                }}
                                                className="text-[10px] font-bold text-blue-600 hover:underline"
                                            >
                                                Auto-Fill
                                            </button>
                                            <button
                                                type="button"
                                                onClick={generateAiDescriptionAndTags}
                                                disabled={isGeneratingAi}
                                                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-[10px] font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {isGeneratingAi ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <SparklesIcon className="w-3 h-3" />}
                                                {isGeneratingAi ? 'Generating...' : 'AI Magic'}
                                            </button>
                                            <button type="button" onClick={addSpecField} className="text-[10px] font-bold text-gray-600 hover:underline">+ Add</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 h-48 overflow-y-auto pr-1 custom-scrollbar">
                                        {specs.map((spec, index) => (
                                            <div key={index} className="flex gap-1 items-center">
                                                <input
                                                    type="text"
                                                    value={spec.key}
                                                    onChange={e => handleSpecChange(index, 'key', e.target.value)}
                                                    placeholder="e.g. RAM"
                                                    className="w-1/3 p-1.5 border border-gray-300 rounded text-xs outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    value={spec.value}
                                                    onChange={e => handleSpecChange(index, 'value', e.target.value)}
                                                    placeholder="e.g. 8GB"
                                                    className="flex-1 p-1.5 border border-gray-300 rounded text-xs outline-none"
                                                />
                                                <button type="button" onClick={() => removeSpecField(index)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-gray-100 rounded-lg">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">MPN</label>
                                    <input type="text" name="mpn" value={formData.mpn || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Warranty</label>
                                    <select name="warranty" value={formData.warranty || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-sm outline-none">
                                        {WARRANTY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Low Stock Alert</label>
                                    <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold || 5} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-sm outline-none" />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Fixed Footer Actions */}
                    <div className="flex justify-between p-4 lg:p-5 border-t border-slate-100 items-center flex-wrap gap-3 bg-slate-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsLocked(!isLocked)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${isLocked ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                title="Prevent accidental closing"
                            >
                                <LockClosedIcon className={`w-4 h-4 ${isLocked ? 'text-rose-600' : 'text-slate-500'}`} />
                                {isLocked ? 'Locked' : 'Unlock'}
                            </button>

                            {/* Save Draft Button */}
                            {!isEditMode && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const draftData = { formData, variants, specs };
                                        localStorage.setItem('admin_product_draft', JSON.stringify(draftData));
                                        alert("Draft saved locally!");
                                    }}
                                    className="hidden lg:flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200"
                                >
                                    <ArchiveBoxIcon className="w-4 h-4" /> Save Draft
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2.5 ml-auto items-center">
                            {isEditMode && onDelete && (
                                <button type="button" onClick={() => formData.sku && onDelete(formData.sku)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mr-1" title="Delete">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}

                            <button type="button" onClick={onClose} className="px-3 py-2 text-slate-500 text-xs font-bold hover:bg-slate-200 rounded-lg transition-colors">
                                Exit
                            </button>

                            <button type="button" onClick={(e) => handleFinalSubmit(e, false)} className="bg-amber-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-amber-700 shadow-md transition-all active:scale-95 flex items-center gap-1.5">
                                Save
                            </button>

                            <button type="button" onClick={(e) => handleFinalSubmit(e, true)} className="bg-green-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-green-700 shadow-md transition-all active:scale-95 flex items-center gap-1.5">
                                Save & Exit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminInventoryPage: React.FC<AdminInventoryPageProps> = ({ navigate }) => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [homeConfig, setHomeConfig] = useState<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [items, fetchedCategories, fetchedBrands, configData] = await Promise.all([
                api.getInventoryItems(),
                api.getCategories(),
                api.getBrands(),
                api.getGenericConfig('settings', 'homepage', {})
            ]);
            setInventory(items);
            setCategories(fetchedCategories);
            setBrands(fetchedBrands);
            setHomeConfig(configData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsAddDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleOpenAddModal = (prefilledCategory?: string) => {
        setIsAddDropdownOpen(false);
        const newItem: Partial<InventoryItem> = prefilledCategory ? { category: prefilledCategory } : {};
        setEditingItem(newItem);
        setIsModalOpen(true);
    };

    const handleSaveItem = async (itemToSave: InventoryItem, shouldClose = true) => {
        try {
            if (editingItem && editingItem.sku) { // Update
                await api.updateInventoryItem(itemToSave.sku, itemToSave);
            } else { // Create
                await api.addProduct(itemToSave);
                // After creating, we should treat it as an edit if the user stays
                setEditingItem(itemToSave);
            }

            // SEO FAST-TRACK: Ping Google Search Console
            api.pingGoogleSitemap();

            await fetchData(); // Refresh list

            if (shouldClose) {
                setIsModalOpen(false);
                setEditingItem(null);
            } else {
                alert("Product saved successfully!");
            }
        } catch (error) {
            console.error("Failed to save product:", error);
            alert("Failed to save product. Please try again.");
        }
    };

    const handleDeleteItem = async (sku: string) => {
        if (window.confirm(`Are you sure you want to delete product ${sku}? This cannot be undone.`)) {
            await api.deleteProduct(sku);
            await fetchData();
        }
    };

    const handleGenerateSitemap = () => {
        const baseUrl = 'https://mobitrashstore.com';
        const today = new Date().toISOString().split('T')[0];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Static Pages
        const staticPages = ['', '/buy', '/sell', '/repair', '/about', '/contact', '/faq', '/blog', '/nepali-news', '/gallery'];
        staticPages.forEach(p => {
            xml += `  <url>\n    <loc>${baseUrl}${p}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
        });

        // Products
        inventory.forEach(item => {
            const slug = (item.title || 'product').toLowerCase().trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
            xml += `  <url>\n    <loc>${baseUrl}/buy/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.9</priority>\n  </url>\n`;
        });

        xml += '</urlset>';

        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert("Sitemap generated and download started! Please upload this to your host's public/ directory to keep Google updated.");
    };

    const handleManualPing = async () => {
        // Since the user is on cPanel, we guide them through the local sitemap generation
        const msg = `Since you are using cPanel, follow these steps to update your products on Google:

1. Open your terminal and run: npm run sitemap
2. This will update your "public/sitemap.xml" file.
3. Run "npm run build" and upload the new "dist/" folder to your cPanel.

Would you like to open Google Search Console to manually request an "Instant Index" for a specific product?`;

        if (window.confirm(msg)) {
            window.open("https://search.google.com/search-console", '_blank');
        }
    };

    const handleStockChange = async (sku: string, newStock: number) => {
        if (newStock < 0) return;

        // If stock decreases, record it as an offline sale
        const currentItem = inventory.find(i => i.sku === sku);
        if (currentItem && newStock < currentItem.stock) {
            const diff = currentItem.stock - newStock;
            // Only if confirmed or implicitly
            await api.addOfflineSale({
                itemId: sku,
                itemName: currentItem.title,
                quantity: diff,
                pricePerUnit: currentItem.price,
                total: diff * currentItem.price,
                date: new Date().toISOString(),
                category: currentItem.category
            });
        }

        await api.updateInventoryItem(sku, { stock: newStock });
        setInventory(prev => prev.map(item => item.sku === sku ? { ...item, stock: newStock } : item));
    };

    const filteredInventory = useMemo(() => {
        return inventory
            .filter(item => {
                const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
                const searchMatch = searchQuery === '' ||
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.sku.toLowerCase().includes(searchQuery.toLowerCase());
                return categoryMatch && searchMatch;
            });
    }, [inventory, activeCategory, searchQuery]);

    // The Menu content to be reused in Desktop Dropdown and Mobile Modal
    const AddMenuContent = () => (
        <div className="bg-white rounded-xl overflow-hidden w-full md:w-80 border border-slate-200 text-slate-800 shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 md:hidden bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800">Select Category</h3>
                <button onClick={() => setIsAddDropdownOpen(false)} className="p-2 bg-white rounded-full shadow-sm border border-slate-200 hover:bg-slate-100">
                    <XMarkIcon className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
                {/* General Section */}
                <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 sticky top-0 z-10">
                    General
                </div>
                <a href="#" onClick={(e) => { e.preventDefault(); handleOpenAddModal(); }} className="block px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium border-b border-slate-100">
                    General Product (Uncategorized)
                </a>

                {/* Hot Sections */}
                <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 sticky top-0 z-10">
                    Home Page Sections
                </div>
                {[
                    { key: 'hotProducts', internal: 'Hot Product', default: 'Hot Product' },
                    { key: 'hotAccessories', internal: 'Hot Accessory', default: 'Hot Accessory' },
                    { key: 'hotTools', internal: 'Hot Tool', default: 'Hot Tool' },
                    { key: 'hotParts', internal: 'Hot Part', default: 'Hot Part' },
                    { key: 'certifiedPreOwned', internal: 'Certified Pre-Owned', default: 'Certified Pre-Owned' }
                ].map(sec => (
                    <a key={sec.internal} href="#" onClick={(e) => { e.preventDefault(); handleOpenAddModal(sec.internal); }} className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-colors border-b border-slate-100">
                        {homeConfig?.titles?.[sec.key] || sec.default}
                    </a>
                ))}

                {/* Dynamic Categories */}
                <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 sticky top-0 z-10">
                    Your Categories
                </div>
                {categories.length > 0 ? (
                    categories.map(cat => (
                        <a key={cat.id} href="#" onClick={(e) => { e.preventDefault(); handleOpenAddModal(cat.name); }} className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 border-b border-slate-100 transition-colors">
                            Add to {cat.name}
                        </a>
                    ))
                ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 italic bg-white">No categories created yet</div>
                )}

                {/* Create New Category Link */}
                <a
                    href="#/admin/categories"
                    onClick={(e) => { e.preventDefault(); navigate('/admin/categories'); }}
                    className="block px-4 py-4 text-sm font-bold text-white bg-green-600 hover:bg-green-700 sticky bottom-0 z-20 text-center transition-colors"
                >
                    + Create New Category
                </a>
            </div>
        </div>
    );

    // Mobile Filter Modal
    const FilterModal = () => {
        // Lock Body Scroll when modal is open
        useEffect(() => {
            document.body.classList.add('no-scroll');
            return () => {
                document.body.classList.remove('no-scroll');
            };
        }, []);

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-fade-in overflow-hidden" onClick={() => setIsFilterModalOpen(false)}>
                <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-slide-in-up border border-slate-200" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 shrink-0">
                        <h3 className="font-bold text-lg text-slate-800">Filter Products</h3>
                        <button onClick={() => setIsFilterModalOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 border border-slate-200">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto text-slate-700">
                        <button onClick={() => { setActiveCategory('All'); setIsFilterModalOpen(false); }} className={`w-full text-left px-4 py-3 border-b border-slate-100 ${activeCategory === 'All' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}>
                            All Categories
                        </button>
                        <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase">Home Page Sections</div>
                        {[
                            { key: 'hotProducts', internal: 'Hot Product', default: 'Hot Product' },
                            { key: 'hotAccessories', internal: 'Hot Accessory', default: 'Hot Accessory' },
                            { key: 'hotTools', internal: 'Hot Tool', default: 'Hot Tool' },
                            { key: 'hotParts', internal: 'Hot Part', default: 'Hot Part' },
                            { key: 'certifiedPreOwned', internal: 'Certified Pre-Owned', default: 'Certified Pre-Owned' }
                        ].map(sec => (
                            <button key={sec.internal} onClick={() => { setActiveCategory(sec.internal); setIsFilterModalOpen(false); }} className={`w-full text-left px-4 py-3 border-b border-slate-100 ${activeCategory === sec.internal ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}>
                                {homeConfig?.titles?.[sec.key] || sec.default}
                            </button>
                        ))}
                        <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase">Categories</div>
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => { setActiveCategory(cat.name); setIsFilterModalOpen(false); }} className={`w-full text-left px-4 py-3 border-b border-slate-100 ${activeCategory === cat.name ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in pb-10 w-full min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">Product Management</h1>

                {/* Add Product Wrapper */}
                <div className={`relative ${isAddDropdownOpen ? 'z-[60]' : 'z-10'}`} ref={dropdownRef}>
                    <div className="flex items-center gap-2">
                        {/* SEO TOOLS */}
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                            <button
                                onClick={handleManualPing}
                                title="Ping Google to Index Products"
                                className="p-2.5 text-blue-600 hover:bg-white rounded-lg transition-all flex items-center gap-2 font-bold text-xs"
                            >
                                <GlobeAltIcon id="ping-btn" className="w-5 h-5" />
                                <span className="hidden lg:inline">Notify Google</span>
                            </button>
                            <div className="w-[1px] bg-slate-200 mx-1"></div>
                            <button
                                onClick={handleGenerateSitemap}
                                title="Download Fresh Sitemap"
                                className="p-2.5 text-emerald-600 hover:bg-white rounded-lg transition-all flex items-center gap-2 font-bold text-xs"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                <span className="hidden lg:inline">Sitemap</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setIsAddDropdownOpen(prev => !prev)}
                            className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 active:scale-95"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            <span>Add Product</span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isAddDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Desktop Dropdown */}
                    {isAddDropdownOpen && (
                        <div className="hidden md:block absolute right-0 mt-2 w-80 rounded-xl shadow-2xl bg-white border border-slate-200 z-[60] overflow-hidden animate-fade-in-down origin-top-right">
                            <AddMenuContent />
                        </div>
                    )}

                    {/* Mobile Full-Screen Modal Menu */}
                    {isAddDropdownOpen && (
                        <div className="md:hidden fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsAddDropdownOpen(false)}>
                            <div onClick={e => e.stopPropagation()} className="w-full max-w-sm animate-slide-in-up">
                                <AddMenuContent />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-slate-200 relative z-10">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 bg-white rounded-lg leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                        />
                    </div>
                    {/* Desktop Category Filter */}
                    <div className="hidden md:flex flex-wrap gap-2 items-center relative">
                        <span className="text-sm font-bold text-slate-500 mr-1 uppercase tracking-wide">Filter:</span>
                        <button onClick={() => setActiveCategory('All')} className={`px-4 py-1.5 text-sm rounded-full transition-all border font-medium ${activeCategory === 'All' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>All</button>

                        {categories.slice(0, 5).map(cat => (
                            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-1.5 text-sm rounded-full transition-all border font-medium ${activeCategory === cat.name ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>{cat.name}</button>
                        ))}

                        {categories.length > 5 && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                    className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 font-medium ${!['All', ...categories.slice(0, 5).map(c => c.name), 'Hot Product'].includes(activeCategory)
                                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <span>More...</span>
                                    <ChevronDownIcon className="w-4 h-4" />
                                </button>

                                {isCategoryDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsCategoryDropdownOpen(false)}></div>
                                        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-20 max-h-60 overflow-y-auto py-1 animate-fade-in-down">
                                            {categories.slice(5).map(cat => (
                                                <button
                                                    key={cat.name}
                                                    onClick={() => { setActiveCategory(cat.name); setIsCategoryDropdownOpen(false); }}
                                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${activeCategory === cat.name ? 'text-amber-600 font-bold bg-amber-50' : 'text-slate-700'}`}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        <button onClick={() => setActiveCategory('Hot Product')} className={`px-4 py-1.5 text-sm rounded-full transition-all border font-medium ${activeCategory === 'Hot Product' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>Hot Products</button>
                    </div>

                    {/* Mobile Dropdown Replacement */}
                    <div className="md:hidden w-full sm:w-auto">
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="w-full p-3 bg-white border border-slate-300 rounded-lg flex justify-between items-center shadow-sm text-slate-700 font-bold active:bg-slate-50 transition-colors"
                        >
                            <span className="truncate">{activeCategory === 'All' ? 'All Categories' : activeCategory}</span>
                            <ChevronDownIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20"><Spinner size="w-12 h-12" /></div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative z-0 w-full max-w-full">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs lg:text-[13px] text-left text-slate-600">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-3 lg:px-4 py-4 font-bold whitespace-nowrap tracking-wider">Image</th>
                                        <th className="px-3 lg:px-4 py-4 font-bold tracking-wider">Product Details</th>
                                        <th className="px-3 lg:px-4 py-4 font-bold whitespace-nowrap tracking-wider">Category</th>
                                        <th className="px-3 lg:px-4 py-4 font-bold whitespace-nowrap tracking-wider">Price</th>
                                        <th className="px-3 lg:px-4 py-4 font-bold tracking-wider">Stock</th>
                                        <th className="px-3 lg:px-4 py-4 font-bold text-center whitespace-nowrap tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredInventory.length > 0 ? filteredInventory.map(item => (
                                        <tr key={item.sku} className="bg-white hover:bg-slate-50 transition-colors group">
                                            <td className="px-3 lg:px-4 py-3">
                                                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                                                    <img src={(item.media && item.media[0]) || 'https://placehold.co/50'} alt={item.title} className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="px-3 lg:px-4 py-3">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-800 leading-tight block">{item.title}</span>
                                                    <span className="text-[10px] font-mono text-slate-400 mt-1 select-all" title="Click to copy SKU">SKU: {item.sku}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-full border border-blue-200">{item.category}</span>
                                            </td>
                                            <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-amber-600 font-extrabold">NPR {(item.price || 0).toLocaleString()}</td>
                                            <td className="px-3 lg:px-4 py-3">
                                                <div className="flex items-center gap-1 whitespace-nowrap">
                                                    <button onClick={() => handleStockChange(item.sku, item.stock - 1)} className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors border border-slate-200">-</button>
                                                    <span className={`w-6 text-center font-bold ${item.stock === 0 ? 'text-rose-500' : 'text-slate-800'}`}>{item.stock}</span>
                                                    <button onClick={() => handleStockChange(item.sku, item.stock + 1)} className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors border border-slate-200">+</button>
                                                </div>
                                            </td>
                                            <td className="px-3 lg:px-4 py-3 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Edit"><PencilSquareIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDeleteItem(item.sku)} className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Delete"><TrashIcon className="w-5 h-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="text-center py-16 text-slate-500 italic">No products found for the current filter.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Grid View */}
                    <div className="md:hidden grid grid-cols-2 gap-3 relative z-0">
                        {filteredInventory.length > 0 ? filteredInventory.map(item => (
                            <div key={item.sku} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                                <div className="relative pt-[100%] bg-white border-b border-slate-100">
                                    <img src={(item.media && item.media[0]) || 'https://placehold.co/80'} alt={item.title} className="absolute top-0 left-0 w-full h-full object-contain p-3" />
                                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-blue-600 rounded-md border border-slate-200 shadow-sm truncate max-w-[80%]">{item.category}</span>
                                </div>
                                <div className="p-3 flex flex-col flex-grow">
                                    <h3 className="font-bold text-slate-800 text-xs line-clamp-2 mb-1 flex-grow leading-snug">{item.title}</h3>
                                    <p className="font-extrabold text-amber-600 text-sm">NPR {(item.price || 0).toLocaleString()}</p>

                                    {/* Stock Control - Compact */}
                                    <div className="flex items-center justify-between mt-3 bg-slate-50 rounded-lg px-1 py-1 border border-slate-200">
                                        <button onClick={() => handleStockChange(item.sku, item.stock - 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 text-sm active:scale-95 transition-transform font-bold border border-slate-200">-</button>
                                        <span className={`text-xs font-bold ${item.stock === 0 ? 'text-rose-500' : 'text-slate-800'}`}>{item.stock}</span>
                                        <button onClick={() => handleStockChange(item.sku, item.stock + 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 text-sm active:scale-95 transition-transform font-bold border border-slate-200">+</button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-3 pt-2 border-t border-slate-100 shrink-0">
                                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center justify-center active:bg-blue-100 transition-colors border border-blue-100"><PencilSquareIcon className="w-3.5 h-3.5 mr-1" /> Edit</button>
                                        <button onClick={() => handleDeleteItem(item.sku)} className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold flex items-center justify-center active:bg-rose-100 transition-colors border border-rose-100"><TrashIcon className="w-3.5 h-3.5 mr-1" /> Del</button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">No products found.</div>
                        )}
                    </div>
                </>
            )}

            {isModalOpen && (
                <ProductModal
                    item={editingItem}
                    categories={categories}
                    brands={brands}
                    homeConfig={homeConfig}
                    onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
                    onSave={handleSaveItem}
                    onDelete={(sku) => {
                        handleDeleteItem(sku);
                        setIsModalOpen(false);
                        setEditingItem(null);
                    }}
                />
            )}

            {/* Render Filter Modal */}
            {isFilterModalOpen && <FilterModal />}
        </div>
    );
};

export default AdminInventoryPage;
