
import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';
import Spinner from '../Spinner';
import { SellModel } from '../../types';

interface SelectModelStepProps {
    brand: string;
    onBack: () => void;
    onNext: (model: SellModel) => void;
}

const SelectModelStep: React.FC<SelectModelStepProps> = ({ brand, onBack, onNext }) => {
    const [selectedModel, setSelectedModel] = useState<SellModel | null>(null);
    const [modelsForBrand, setModelsForBrand] = useState<SellModel[]>([]);
    const [filteredModels, setFilteredModels] = useState<SellModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchModels = async () => {
            setLoading(true);
            setSelectedModel(null);
            
            // Note: We removed the static list of Apple models. 
            // Now, ALL models, including Apple, are fetched from the database.
            
            try {
                const dbModels = await api.getSellModelsByBrand(brand);
                
                // Filter out hidden models and sort
                // We use name for consistent sorting
                const visibleModels = dbModels.filter(m => !m.isHidden);
                visibleModels.sort((a, b) => a.name.localeCompare(b.name));
                
                setModelsForBrand(visibleModels);
                setFilteredModels(visibleModels);
            } catch (error) {
                console.error(`Failed to fetch models for ${brand}.`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, [brand]);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredModels(modelsForBrand);
        } else {
            const lower = searchQuery.toLowerCase();
            setFilteredModels(modelsForBrand.filter(m => m.name.toLowerCase().includes(lower)));
        }
    }, [searchQuery, modelsForBrand]);

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Select {brand} Model</h2>
                <p className="text-slate-500 mb-6">Find your specific device model.</p>
                
                {/* Search Bar */}
                <div className="max-w-md mx-auto relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder={`Search ${brand} models...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner />
                </div>
            ) : filteredModels.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                    {filteredModels.map(m => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedModel(m)}
                            className={`
                                group relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 h-full
                                ${selectedModel?.name === m.name 
                                    ? 'border-amber-500 bg-amber-50 shadow-lg scale-105 z-10' 
                                    : 'bg-white border-slate-100 hover:border-amber-200 hover:shadow-md'
                                }
                            `}
                        >
                            <div className="h-28 w-full flex items-center justify-center mb-3">
                                <img 
                                    src={m.imageUrl} 
                                    alt={m.name} 
                                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" 
                                />
                            </div>
                            <span className="font-bold text-sm text-center text-slate-700 group-hover:text-slate-900 leading-tight">
                                {m.name}
                            </span>
                            
                            {selectedModel?.name === m.name && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-sm">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">
                        {searchQuery ? `No models found matching "${searchQuery}".` : `No models found for ${brand}. Please add them in Admin Panel.`}
                    </p>
                </div>
            )}
            
            <div className="mt-12 flex justify-between items-center max-w-2xl mx-auto">
                 <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" /> Back
                </button>
                <button
                    onClick={() => { if(selectedModel) onNext(selectedModel)}}
                    disabled={!selectedModel}
                    className="
                        flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all transform
                        disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed
                        enabled:bg-amber-600 enabled:hover:bg-amber-700 enabled:active:scale-95
                    "
                >
                    Next Step <ArrowRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default SelectModelStep;
