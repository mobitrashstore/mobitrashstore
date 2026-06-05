
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
                            onClick={() => onNext(brand.name)}
                            className="group relative h-32 rounded-2xl border-2 border-slate-100 bg-white flex flex-col items-center justify-center p-4 transition-all duration-300 hover:border-amber-300 hover:shadow-lg hover:-translate-y-1 active:scale-95"
                        >
                            <div className="h-16 w-full flex items-center justify-center mb-3">
                                <img 
                                    src={brand.logo} 
                                    alt={brand.name} 
                                    className="max-h-full max-w-[80%] object-contain filter transition-all duration-300 group-hover:brightness-110" 
                                />
                            </div>
                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">
                                {brand.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectBrandStep;
