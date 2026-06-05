

import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Category } from '../types';
import Spinner from '../components/Spinner';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { Squares2x2Icon } from '../components/icons/Squares2x2Icon';
import SEO from '../components/SEO';

interface CategoriesPageProps {
    navigate: (path: string) => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ navigate }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                // This API call now leverages the caching implemented in services/api.ts
                const data = await api.getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Failed to load categories", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryName: string) => {
        // Navigate to catalog page with query param
        navigate(`/product?category=${encodeURIComponent(categoryName)}`);
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><Spinner /></div>;
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            <SEO
                title="Shop by Category - Phones, Accessories & Electronics"
                description="Explore all product categories at Mobi Store. From certified iPhones and Androids to premium accessories and electronic gadgets in Nepal."
                canonicalUrl="https://mobitrashstore.com/categories"
            />
            {/* Disabled spacer and adjusted padding to remove gap */}
            <MobileSkyHeader title="Shop by Category" Icon={Squares2x2Icon} hasSpacer={false} />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 md:py-8 pt-32 md:pt-24">
                {/* Desktop Header */}
                <h1 className="hidden md:block text-2xl font-bold text-gray-900 mb-6">Shop by Category</h1>

                {categories.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.name)}
                                className="flex flex-col items-center group"
                            >
                                <div className="w-full aspect-square bg-gray-50 rounded-xl p-4 flex items-center justify-center border border-gray-100 shadow-sm group-hover:border-[#ff5722] group-hover:shadow-md transition-all duration-200">
                                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain" />
                                </div>
                                <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-[#ff5722] text-center leading-tight">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No categories available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;
