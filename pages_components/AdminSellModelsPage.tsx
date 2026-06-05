import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/api';
import { SellModel, Brand } from '../types';
import { BRANDS_DATA, MODELS, STORAGE_OPTIONS } from '../constants';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import Spinner from '../components/Spinner';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { EyeSlashIcon } from '../components/icons/EyeSlashIcon';

const SellModelModal: React.FC<{
    model: Partial<SellModel> | null;
    brands: Brand[];
    onClose: () => void;
    onSave: (model: Omit<SellModel, 'id'> | SellModel) => void;
}> = ({ model, brands, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        brand: '',
        name: '',
        imageUrl: '',
        storageOptionsString: '', // Helper for input
        isHidden: false,
        ...model
    });
    // Treat static IDs as 'new' mode visually regarding ID (though we might show 'Edit')
    const isEditMode = !!model?.id && !String(model.id).startsWith('static-');

    useEffect(() => {
        if (model?.storageOptions) {
            setFormData(prev => ({ ...prev, storageOptionsString: model.storageOptions!.join(', ') }));
        }
    }, [model]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Process storage options
        const storageOptions = formData.storageOptionsString
            ? formData.storageOptionsString.split(',').map(s => s.trim()).filter(s => s !== '')
            : [];

        const { storageOptionsString, ...dataToSave } = formData;

        onSave({
            ...dataToSave,
            storageOptions
        } as SellModel);
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
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-lg mb-10 overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Sell Model' : 'Add/Edit Model'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Brand</label>
                        <select name="brand" value={formData.brand} onChange={handleChange} required disabled={!!formData.brand} className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-500">
                            <option value="">Select Brand</option>
                            {brands.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Model Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Galaxy S24 Ultra" required className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
                        <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." required className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Storage Variants (Comma Separated)</label>
                        <input
                            type="text"
                            name="storageOptionsString"
                            value={formData.storageOptionsString}
                            onChange={handleChange}
                            placeholder="e.g. 8/128GB, 8/256GB, 12/512GB"
                            className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">If left empty, system defaults will be used.</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isHidden"
                            name="isHidden"
                            checked={!!formData.isHidden}
                            onChange={handleChange}
                            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                        />
                        <label htmlFor="isHidden" className="text-sm font-medium text-slate-700 select-none">Hide this model from users</label>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                        <button type="button" onClick={onClose} className="mr-4 px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="bg-amber-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-amber-700 shadow-md transition-colors active:scale-95">Save Model</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminSellModelsPage: React.FC<{ navigate: (path: string) => void }> = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loadingBrands, setLoadingBrands] = useState(true);
    const [loadingModels, setLoadingModels] = useState(false);

    // Selection & Models
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [brandModels, setBrandModels] = useState<SellModel[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModel, setEditingModel] = useState<Partial<SellModel> | null>(null);

    // Initial Load: Brands Only
    useEffect(() => {
        const loadBrands = async () => {
            setLoadingBrands(true);
            const brandMap = new Map<string, Brand>();
            // Defaults
            BRANDS_DATA.forEach(b => brandMap.set(b.name.toLowerCase(), { id: `static-${b.name}`, ...b }));

            try {
                const dbBrands = await api.getBrands();
                // Overrides
                dbBrands.forEach(b => brandMap.set(b.name.toLowerCase(), b));
            } catch (e) {
                console.error(e);
            } finally {
                setBrands(Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
                setLoadingBrands(false);
            }
        };
        loadBrands();
    }, []);

    // Load Models when Brand Selected
    const fetchModelsForBrand = useCallback(async (brand: string) => {
        setLoadingModels(true);
        try {
            // 1. Get DB Models (Live, No Cache)
            const dbModels = await api.getSellModelsByBrand(brand);

            // 2. Get Static Models for this Brand (if any)
            const staticModels: SellModel[] = [];
            const staticList = MODELS[brand];
            if (staticList && Array.isArray(staticList)) {
                staticList.forEach((modelName, i) => {
                    staticModels.push({
                        id: `static-${brand}-${i}`,
                        brand: brand,
                        name: modelName,
                        imageUrl: '', // Static models usually lack images in this constants file, DB overrides fix this
                        storageOptions: STORAGE_OPTIONS[modelName]?.map(s => `${s}GB`) || []
                    });
                });
            }

            // 3. Combine Lists (NO DEDUPLICATION)
            // We want to show everything so admins can fix duplicates or see hidden overrides.
            const allModels = [...staticModels, ...dbModels];

            // 4. Sort
            allModels.sort((a, b) => a.name.localeCompare(b.name));

            setBrandModels(allModels);

        } catch (error) {
            console.error("Failed to load models for brand", error);
        } finally {
            setLoadingModels(false);
        }
    }, []);

    useEffect(() => {
        if (selectedBrand) {
            fetchModelsForBrand(selectedBrand);
        } else {
            setBrandModels([]);
        }
    }, [selectedBrand, fetchModelsForBrand]);

    const handleSaveModel = async (modelToSave: Omit<SellModel, 'id'> | SellModel) => {
        try {
            // If updating a static model (starts with static-), we create a new DB entry that overrides it
            if ('id' in modelToSave && modelToSave.id && String(modelToSave.id).startsWith('static-')) {
                const { id, ...rest } = modelToSave;
                await api.addSellModel(rest);
            }
            else if ('id' in modelToSave && modelToSave.id) { // Standard Update
                await api.updateSellModel(modelToSave.id, modelToSave);
            } else { // Create New
                await api.addSellModel(modelToSave);
            }

            // Refresh the current view
            if (selectedBrand) {
                await fetchModelsForBrand(selectedBrand);
            }
            setIsModalOpen(false);
            setEditingModel(null);

        } catch (e) {
            console.error("Failed to save model", e);
            alert("Failed to save model");
        }
    };

    const handleDeleteModel = async (model: SellModel) => {
        if (window.confirm(`Are you sure you want to delete the model "${model.name}"?`)) {

            const isStatic = String(model.id).startsWith('static-');

            if (isStatic) {
                // Soft delete static by creating a hidden record
                await api.addSellModel({
                    brand: model.brand,
                    name: model.name,
                    imageUrl: model.imageUrl,
                    storageOptions: model.storageOptions,
                    isHidden: true
                });
            } else {
                // Hard delete for DB models
                await api.deleteSellModel(model.id);
            }

            if (selectedBrand) {
                await fetchModelsForBrand(selectedBrand);
            }
        }
    };

    const handleOpenAddModal = () => {
        setEditingModel({ brand: selectedBrand || '' });
        setIsModalOpen(true);
    };


    if (loadingBrands) {
        return <div className="flex justify-center py-12"><Spinner /></div>;
    }

    if (!selectedBrand) {
        return (
            <div className="animate-fade-in pb-10">
                <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm mb-6">Select a Brand to Manage Models</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {brands.map(brand => (
                        <button
                            key={brand.name}
                            onClick={() => setSelectedBrand(brand.name)}
                            className="p-6 h-32 flex items-center justify-center rounded-2xl border-2 border-slate-100 bg-white hover:border-amber-500 hover:shadow-lg transition-all duration-300 shadow-sm group"
                        >
                            <img src={brand.logo} alt={brand.name} className="max-h-16 max-w-[80%] object-contain filter transition-all group-hover:scale-110" />
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in pb-10">
            <div className="flex items-center justify-between gap-4 mb-8">
                <button onClick={() => setSelectedBrand(null)} className="flex items-center gap-2 text-slate-500 hover:text-amber-600 font-bold transition-colors group">
                    <div className="p-1.5 bg-white border border-slate-200 rounded-full shadow-sm group-hover:border-amber-200">
                        <ArrowLeftIcon className="w-4 h-4" />
                    </div>
                    Back to Brands
                </button>
                <button onClick={handleOpenAddModal} className="bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-orange-700 flex items-center gap-2 shadow-md transition-all transform active:scale-95">
                    <PlusCircleIcon className="w-5 h-5" />
                    Add Model to {selectedBrand}
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-extrabold text-slate-800">{selectedBrand} Models</h2>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200">{brandModels.length}</span>
            </div>

            {loadingModels ? (
                <div className="flex justify-center py-12"><Spinner /></div>
            ) : brandModels.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {brandModels.map(model => (
                        <div key={model.id} className={`bg-white border border-slate-100 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-lg hover:border-amber-200 transition-all group relative ${model.isHidden ? 'opacity-60 grayscale' : ''}`}>

                            {String(model.id).startsWith('static-') && (
                                <div className="absolute top-2 right-2 z-10">
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 shadow-sm opacity-80">Default</span>
                                </div>
                            )}

                            {model.isHidden && (
                                <div className="absolute top-2 left-2 z-10">
                                    <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-200 shadow-sm flex items-center gap-1">
                                        <EyeSlashIcon className="w-3 h-3" /> Hidden
                                    </span>
                                </div>
                            )}

                            <div className="h-40 flex items-center justify-center p-4 bg-slate-50 relative">
                                <img src={model.imageUrl || 'https://placehold.co/150x200?text=No+Image'} alt={model.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110 mix-blend-multiply" />
                            </div>
                            <div className="p-4 flex-grow flex flex-col border-t border-slate-100">
                                <p className="font-bold text-sm text-center text-slate-700 flex-grow mb-2">{model.name}</p>
                                {model.storageOptions && model.storageOptions.length > 0 && (
                                    <p className="text-[10px] text-slate-400 text-center mb-3 font-medium">{model.storageOptions.length} Variants</p>
                                )}
                                <div className="flex justify-center items-center mt-auto gap-2 pt-2 border-t border-slate-50">
                                    <button onClick={() => { setEditingModel(model); setIsModalOpen(true); }} className="p-2 text-amber-600 hover:text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"><PencilSquareIcon className="w-4 h-4" /></button>
                                    <button
                                        onClick={() => handleDeleteModel(model)}
                                        className="p-2 rounded-lg transition-colors text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100"
                                        title="Delete Model"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl">
                    <p className="text-slate-500 text-lg font-medium">No models found for {selectedBrand}.</p>
                    <button onClick={handleOpenAddModal} className="mt-4 text-amber-600 font-bold hover:text-amber-700 hover:underline">
                        Add the first one!
                    </button>
                </div>
            )}


            {isModalOpen && (
                <SellModelModal
                    model={editingModel}
                    brands={brands}
                    onClose={() => { setIsModalOpen(false); setEditingModel(null); }}
                    onSave={handleSaveModel}
                />
            )}
        </div>
    );
};

export default AdminSellModelsPage;
