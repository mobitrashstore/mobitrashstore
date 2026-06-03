
import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Brand } from '../../types';
import { BRANDS_DATA } from '../../constants';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import Spinner from '../Spinner';

interface SelectBrandStepProps {
    onNext: (brand: string) => void;
}

const SelectBrandStep: React.FC<SelectBrandStepProps> = ({ onNext }) => {
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            setLoading(true);
            const brandMap = new Map<string, Brand>();
            
            // Load defaults first for instant UI
            BRANDS_DATA.forEach(b => {
                brandMap.set(b.name.toLowerCase(), {
                    id: `static-${b.name}`, 
                    name: b.name,
                    logo: b.logo
                });
            });

            try {
                const dbBrands = await api.getBrands();
                dbBrands.forEach(b => {
                    brandMap.set(b.name.toLowerCase(), b);
                });
            } catch (error) {
                console.error("Failed to fetch brands", error);
            } finally {
                setBrands(Array.from(brandMap.values()));
                setLoading(false);
            }
        };
        fetchBrands();
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Which brand is your device?</h2>
                <p className="text-slate-500">Select the brand to get started with the valuation.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-4xl mx-auto">
                    {brands.map(brand => (
                        <button
                            key={brand.name}
                            onClick={() => setSelectedBrand(brand.name)}
                            className={`
                                group relative h-32 rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all duration-300
                                ${selectedBrand === brand.name 
                                    ? 'border-amber-500 bg-amber-50 shadow-xl scale-105 ring-2 ring-amber-200' 
                                    : 'border-slate-100 bg-white hover:border-amber-300 hover:shadow-lg hover:-translate-y-1'
                                }
                            `}
                        >
                            <div className="h-16 w-full flex items-center justify-center mb-3">
                                <img 
                                    src={brand.logo} 
                                    alt={brand.name} 
                                    className="max-h-full max-w-[80%] object-contain filter transition-all duration-300 group-hover:brightness-110" 
                                />
                            </div>
                            <span className={`text-sm font-bold ${selectedBrand === brand.name ? 'text-amber-700' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                {brand.name}
                            </span>
                            
                            {/* Selection Checkmark */}
                            {selectedBrand === brand.name && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-sm animate-bounce-in">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="mt-12 flex justify-center">
                <button
                    onClick={() => { if(selectedBrand) onNext(selectedBrand)}}
                    disabled={!selectedBrand}
                    className="
                        flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform
                        disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none
                        enabled:bg-gradient-to-r enabled:from-amber-500 enabled:to-orange-600 enabled:text-white enabled:hover:scale-105 enabled:active:scale-95
                    "
                >
                    Next Step <ArrowRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default SelectBrandStep;
