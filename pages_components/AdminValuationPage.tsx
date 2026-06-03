import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import { ValuationBaseline, ValuationDeduction, SellModel } from '../types';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import Spinner from '../components/Spinner';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { MODELS, STORAGE_OPTIONS } from '../constants';

const ValuationModal: React.FC<{
    item: Partial<ValuationBaseline> | null;
    sellModels: SellModel[];
    onClose: () => void;
    onSave: (item: Omit<ValuationBaseline, 'id'> | ValuationBaseline) => void;
}> = ({ item, sellModels, onClose, onSave }) => {
    const isEditMode = !!item?.id;

    // Helper to construct the initial variant string for editing
    const getInitialVariant = () => {
        if (!item) return '';
        if (item.ram_gb && item.ram_gb > 0) {
            return `${item.ram_gb}/${item.storage_gb}GB`;
        }
        return item.storage_gb ? `${item.storage_gb}GB` : '';
    };

    const [formData, setFormData] = useState({
        brand: item?.brand || '',
        model: item?.model || '',
        variant: getInitialVariant(),
        baseline_npr: item?.baseline_npr || 0,
    });

    const [isCustomVariant, setIsCustomVariant] = useState(false);

    const availableModels = useMemo(() => {
        if (!formData.brand) return [];
        return sellModels.filter(m => m.brand === formData.brand);
    }, [formData.brand, sellModels]);

    const availableVariants = useMemo(() => {
        const modelData = sellModels.find(m => m.brand === formData.brand && m.name === formData.model);
        // Prefer model's specific storage options, fallback to global constant if mapped
        let opts = modelData?.storageOptions || [];
        if (opts.length === 0 && formData.model && STORAGE_OPTIONS[formData.model]) {
            opts = STORAGE_OPTIONS[formData.model].map(s => `${s}GB`);
        }
        return opts;
    }, [formData.brand, formData.model, sellModels]);

    // Check if initial variant is custom (not in list)
    useEffect(() => {
        if (isEditMode && formData.variant && availableVariants.length > 0 && !availableVariants.includes(formData.variant)) {
            setIsCustomVariant(true);
        }
    }, [isEditMode, formData.variant, availableVariants]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'baseline_npr' ? Number(value) : value }));
        // Reset model/variant if brand changes
        if (name === 'brand') {
            setFormData(prev => ({ ...prev, model: '', variant: '' }));
            setIsCustomVariant(false);
        }
        // Reset variant if model changes
        if (name === 'model') {
            setFormData(prev => ({ ...prev, variant: '' }));
            setIsCustomVariant(false);
        }
    };

    const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '___CUSTOM___') {
            setIsCustomVariant(true);
            setFormData(prev => ({ ...prev, variant: '' }));
        } else {
            setFormData(prev => ({ ...prev, variant: value }));
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let ram_gb = 0;
        let storage_gb = 0;
        const variant = formData.variant.replace(/GB/i, '').trim();

        if (variant.includes('/')) {
            const parts = variant.split('/');
            ram_gb = parseInt(parts[0], 10) || 0;
            storage_gb = parseInt(parts[1], 10) || 0;
        } else {
            ram_gb = 0;
            storage_gb = parseInt(variant, 10) || 0;
        }

        const payload: Omit<ValuationBaseline, 'id'> = {
            brand: formData.brand.trim(),
            model: formData.model.trim(),
            ram_gb,
            storage_gb,
            baseline_npr: formData.baseline_npr
        };

        if (isEditMode && item?.id) {
            onSave({ ...payload, id: item.id });
        } else {
            onSave(payload);
        }
    };

    const distinctBrands = useMemo(() => [...new Set(sellModels.map(m => m.brand))].sort(), [sellModels]);

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto" onClick={onClose}>
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md mb-10 overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Valuation' : 'Add New Valuation'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Brand</label>
                        <select name="brand" value={formData.brand} onChange={handleChange} required disabled={isEditMode} className="mt-1 w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-500">
                            <option value="" disabled>Select a brand...</option>
                            {distinctBrands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Model</label>
                        <select name="model" value={formData.model} onChange={handleChange} required disabled={isEditMode || !formData.brand} className="mt-1 w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-500">
                            <option value="" disabled>Select a model...</option>
                            {availableModels.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Variant (RAM/Storage)
                            {isCustomVariant && (
                                <button
                                    type="button"
                                    onClick={() => { setIsCustomVariant(false); setFormData(prev => ({ ...prev, variant: '' })); }}
                                    className="ml-2 text-xs text-blue-600 hover:underline font-normal"
                                >
                                    (Switch to List)
                                </button>
                            )}
                        </label>
                        {isCustomVariant ? (
                            <input
                                type="text"
                                name="variant"
                                value={formData.variant}
                                onChange={handleVariantChange}
                                placeholder="e.g. 12/256GB"
                                required
                                className="mt-1 w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                        ) : (
                            <select name="variant" value={formData.variant} onChange={handleVariantChange} required disabled={isEditMode || !formData.model} className="mt-1 w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-500">
                                <option value="" disabled>Select a variant...</option>
                                {availableVariants.map(v => <option key={v} value={v}>{v}</option>)}
                                <option value="___CUSTOM___">✨ Custom / Other...</option>
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Base Price (NPR)</label>
                        <input type="number" name="baseline_npr" value={formData.baseline_npr || ''} onChange={handleChange} placeholder="150000" required className="mt-1 w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-bold" />
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                        <button type="submit" className="bg-amber-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-amber-700 shadow-md transition-all transform active:scale-95">Save Valuation</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeductionModal: React.FC<{
    item: ValuationDeduction;
    onClose: () => void;
    onSave: (id: string, applePercentage: number, androidPercentage: number) => void;
}> = ({ item, onClose, onSave }) => {
    // Fallback to legacy percentage if specific ones aren't set
    const [applePct, setApplePct] = useState(item.applePercentage !== undefined ? item.applePercentage : (item.percentage || 0));
    const [androidPct, setAndroidPct] = useState(item.androidPercentage !== undefined ? item.androidPercentage : (item.percentage || 0));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(item.id, Number(applePct), Number(androidPct));
    };

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto" onClick={onClose}>
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-sm mb-10 overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <h2 className="text-lg font-bold text-slate-800">Edit Deductions</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wide mb-3 bg-slate-100 p-2 rounded border border-slate-200 text-center">{item.label}</p>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Apple Deduction (%)</label>
                        <input type="number" value={applePct} onChange={(e) => setApplePct(Number(e.target.value))} min="0" max="100" className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        <p className="text-xs text-slate-500 mt-1">Applied for iPhone, iPad, etc.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Android Deduction (%)</label>
                        <input type="number" value={androidPct} onChange={(e) => setAndroidPct(Number(e.target.value))} min="0" max="100" className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        <p className="text-xs text-slate-500 mt-1">Applied for Samsung, Xiaomi, etc.</p>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                        <button type="submit" className="bg-amber-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-amber-700 shadow-md transition-all active:scale-95">Update</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminValuationPage: React.FC<{ navigate: (path: string) => void }> = () => {
    const [activeTab, setActiveTab] = useState<'prices' | 'deductions'>('prices');
    const [valuations, setValuations] = useState<ValuationBaseline[]>([]);
    const [deductions, setDeductions] = useState<ValuationDeduction[]>([]);
    const [sellModels, setSellModels] = useState<SellModel[]>([]);
    const [loading, setLoading] = useState(true);

    const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
    const [editingValuation, setEditingValuation] = useState<Partial<ValuationBaseline> | null>(null);

    const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);
    const [editingDeduction, setEditingDeduction] = useState<ValuationDeduction | null>(null);

    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [priceData, deductionData, dbModels] = await Promise.all([
                api.getValuationBaselines(),
                api.getValuationDeductions(),
                api.getSellModels()
            ]);

            // --- MERGE MODELS (Static Other Brands + DB Models) ---

            // 1. Static Other Brands from MODELS constant
            const staticOthers: SellModel[] = [];
            Object.entries(MODELS).forEach(([brand, models]) => {
                if (brand === 'Apple') return; // Explicitly skip Apple from static model list
                models.forEach((modelName, i) => {
                    staticOthers.push({
                        id: `static-${brand}-${i}`,
                        brand: brand,
                        name: modelName,
                        imageUrl: '', // No image in constants for these usually
                        storageOptions: STORAGE_OPTIONS[modelName]?.map(s => `${s}GB`) || []
                    });
                });
            });

            // 2. Merge (DB overrides Static by name)
            const modelMap = new Map<string, SellModel>();

            // Add static first
            staticOthers.forEach(m => modelMap.set(`${m.brand}-${m.name}`, m));

            // Add/Overwrite with DB models (This includes ALL Apple models as they are only in DB now)
            dbModels.forEach(m => modelMap.set(`${m.brand}-${m.name}`, m));

            const mergedModels = Array.from(modelMap.values());

            // Sort Valuations for display
            priceData.sort((a, b) => {
                if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
                if (a.model !== b.model) return a.model.localeCompare(b.model);
                return a.storage_gb - b.storage_gb;
            });

            setValuations(priceData);
            setDeductions(deductionData);
            setSellModels(mergedModels);
        } catch (e) {
            console.error("Failed to fetch valuations", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Price Handlers
    const handleSaveValuation = async (item: Omit<ValuationBaseline, 'id'> | ValuationBaseline) => {
        if ('id' in item && item.id) {
            await api.updateValuationBaseline(item.id, item);
        } else {
            await api.addValuationBaseline(item);
        }
        await fetchData();
        setIsValuationModalOpen(false);
        setEditingValuation(null);
    };

    const handleDeleteValuation = async (id: string) => {
        if (confirm("Are you sure you want to delete this valuation?")) {
            await api.deleteValuationBaseline(id);
            await fetchData();
        }
    };

    // Deduction Handlers
    const handleSaveDeduction = async (id: string, applePercentage: number, androidPercentage: number) => {
        await api.updateValuationDeduction(id, applePercentage, androidPercentage);
        await fetchData(); // Refresh to show updated value
        setIsDeductionModalOpen(false);
        setEditingDeduction(null);
    };

    const filteredData = useMemo(() => {
        return valuations.filter(v =>
            v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [valuations, searchQuery]);

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Valuation Manager</h1>

            {/* Tabs */}
            <div className="flex space-x-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
                <button
                    className={`px-6 py-2.5 font-bold text-sm transition-all rounded-lg ${activeTab === 'prices' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('prices')}
                >
                    Device Prices
                </button>
                <button
                    className={`px-6 py-2.5 font-bold text-sm transition-all rounded-lg ${activeTab === 'deductions' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('deductions')}
                >
                    Fault Deductions
                </button>
            </div>

            {activeTab === 'prices' && (
                <>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="relative flex-grow max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search model or brand..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 bg-slate-50/50 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                            />
                        </div>
                        <button
                            onClick={() => { setEditingValuation(null); setIsValuationModalOpen(true); }}
                            className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 shadow-md transition-colors active:scale-95"
                        >
                            <PlusCircleIcon className="w-5 h-5" /> Add Valuation
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner /></div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-slate-600">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 font-bold tracking-wider">Brand</th>
                                                <th className="px-6 py-4 font-bold tracking-wider">Model</th>
                                                <th className="px-6 py-4 font-bold tracking-wider">Variant</th>
                                                <th className="px-6 py-4 font-bold tracking-wider">Baseline Price</th>
                                                <th className="px-6 py-4 font-bold tracking-wider text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredData.map(item => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-slate-700">{item.brand}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-900">{item.model}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-500">
                                                        <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-xs font-bold text-slate-600">
                                                            {item.ram_gb > 0 ? `${item.ram_gb}/${item.storage_gb}` : item.storage_gb} GB
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-amber-600 font-extrabold">NPR {item.baseline_npr.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => { setEditingValuation(item); setIsValuationModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><PencilSquareIcon className="w-5 h-5" /></button>
                                                            <button onClick={() => handleDeleteValuation(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {filteredData.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">{item.brand}</span>
                                                <h3 className="text-lg font-bold text-slate-900">{item.model}</h3>
                                            </div>
                                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded border border-slate-200">
                                                {item.ram_gb > 0 ? `${item.ram_gb}/${item.storage_gb}` : item.storage_gb} GB
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-slate-100 pt-3 mt-2">
                                            <div>
                                                <span className="text-xs text-slate-500 font-medium">Baseline Price</span>
                                                <p className="text-lg font-black text-amber-600">NPR {item.baseline_npr.toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingValuation(item); setIsValuationModalOpen(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg transition-colors"><PencilSquareIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleDeleteValuation(item.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredData.length === 0 && <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">No valuations found.</div>}
                        </>
                    )}
                </>
            )}

            {activeTab === 'deductions' && (
                <>
                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner /></div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-slate-600">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 font-bold tracking-wider">Fault Condition</th>
                                                <th className="px-6 py-4 font-bold tracking-wider text-center">Apple Deduction</th>
                                                <th className="px-6 py-4 font-bold tracking-wider text-center">Android Deduction</th>
                                                <th className="px-6 py-4 font-bold tracking-wider text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {deductions.map(item => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-800">{item.label}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-rose-600">
                                                        -{item.applePercentage !== undefined ? item.applePercentage : (item.percentage || 0)}%
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-rose-600">
                                                        -{item.androidPercentage !== undefined ? item.androidPercentage : (item.percentage || 0)}%
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => { setEditingDeduction(item); setIsDeductionModalOpen(true); }} className="text-blue-600 hover:underline font-bold text-xs uppercase tracking-wide bg-blue-50 px-3 py-1 rounded-md border border-blue-100">Edit</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {deductions.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="font-bold text-slate-800 text-sm flex-grow">{item.label}</p>
                                            <button onClick={() => { setEditingDeduction(item); setIsDeductionModalOpen(true); }} className="text-blue-600 text-xs font-bold px-3 py-1 bg-blue-50 rounded-md border border-blue-200">Edit</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                                                <p className="text-slate-500 mb-1 font-bold uppercase">Apple</p>
                                                <p className="font-black text-rose-500 text-lg">-{item.applePercentage !== undefined ? item.applePercentage : (item.percentage || 0)}%</p>
                                            </div>
                                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                                                <p className="text-slate-500 mb-1 font-bold uppercase">Android</p>
                                                <p className="font-black text-rose-500 text-lg">-{item.androidPercentage !== undefined ? item.androidPercentage : (item.percentage || 0)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {deductions.length === 0 && <div className="text-center py-12 text-slate-500">No deduction rules found. Please seed the database.</div>}
                        </>
                    )}
                </>
            )}

            {isValuationModalOpen && <ValuationModal item={editingValuation} sellModels={sellModels} onClose={() => setIsValuationModalOpen(false)} onSave={handleSaveValuation} />}
            {isDeductionModalOpen && editingDeduction && <DeductionModal item={editingDeduction} onClose={() => setIsDeductionModalOpen(false)} onSave={handleSaveDeduction} />}
        </div>
    );
};

export default AdminValuationPage;
