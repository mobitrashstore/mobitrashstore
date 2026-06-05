
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
    const [modelsForBrand, setModelsForBrand] = useState<SellModel[]>([]);
    const [filteredModels, setFilteredModels] = useState<SellModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchModels = async () => {
            setLoading(true);
            
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
                            onClick={() => onNext(m)}
                            className="group relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-amber-200 hover:shadow-md transition-all duration-200 h-full active:scale-95"
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
            
            <div className="mt-12 flex justify-start max-w-5xl mx-auto">
                 <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" /> Back
                </button>
            </div>
        </div>
    );
};

export default SelectModelStep;
