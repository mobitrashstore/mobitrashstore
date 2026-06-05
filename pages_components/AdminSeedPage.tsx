
import React, { useState } from 'react';
import * as api from '../services/api';
import { DEFAULT_INVENTORY_ITEMS, BLOG_POSTS, PRICE_BASELINE, DEFAULT_DEDUCTIONS, BRANDS_DATA } from '../constants';
import Spinner from '../components/Spinner';
import { ExclamationTriangleIcon } from '../components/icons/ExclamationTriangleIcon';

interface AdminSeedPageProps {
    navigate: (path: string) => void;
}

const AdminSeedPage: React.FC<AdminSeedPageProps> = ({ navigate }) => {
    const [isProductLoading, setIsProductLoading] = useState(false);
    const [productResult, setProductResult] = useState<{ success: boolean, message: string } | null>(null);
    
    const [isBlogLoading, setIsBlogLoading] = useState(false);
    const [blogResult, setBlogResult] = useState<{ success: boolean, message: string } | null>(null);

    const [isValuationLoading, setIsValuationLoading] = useState(false);
    const [valuationResult, setValuationResult] = useState<{ success: boolean, message: string } | null>(null);

    const [isDeductionLoading, setIsDeductionLoading] = useState(false);
    const [deductionResult, setDeductionResult] = useState<{ success: boolean, message: string } | null>(null);

    const [isBrandsLoading, setIsBrandsLoading] = useState(false);
    const [brandsResult, setBrandsResult] = useState<{ success: boolean, message: string } | null>(null);

    const checkDeveloperAccess = () => {
        const password = window.prompt("Enter Developer Password to proceed:");
        if (password !== "9827801575") {
            alert("ACCESS DENIED! Incorrect password.");
            return false;
        }
        return true;
    };

    const handleClearAndSeedProducts = async () => {
        if (!checkDeveloperAccess()) return;

        if (!window.confirm("DANGER: This will DELETE ALL products in your database and then add the default ones. This is the correct way to fix data issues but cannot be undone. Are you absolutely sure?")) {
            return;
        }

        setIsProductLoading(true);
        setProductResult(null);
        try {
            const count = await api.clearAndSeedInventory(DEFAULT_INVENTORY_ITEMS);
            setProductResult({ success: true, message: `Successfully cleared and reset inventory with ${count} default products.` });
        } catch (error: any) {
            console.error("Product clear & seed failed:", error);
            setProductResult({ success: false, message: `An error occurred during reset: ${error.message}` });
        } finally {
            setIsProductLoading(false);
        }
    };

    const handleSeedBlog = async () => {
        if (!checkDeveloperAccess()) return;

        if (!window.confirm("Are you sure you want to seed the blog posts? This will overwrite existing posts with the same slug.")) {
            return;
        }

        setIsBlogLoading(true);
        setBlogResult(null);
        try {
            const count = await api.seedBlogPosts(BLOG_POSTS);
            setBlogResult({ success: true, message: `Successfully seeded ${count} posts into the 'blogPosts' collection.` });
        } catch (error: any) {
            console.error("Blog seeding failed:", error);
            setBlogResult({ success: false, message: `An error occurred during seeding: ${error.message}` });
        } finally {
            setIsBlogLoading(false);
        }
    }

    const handleSeedValuations = async () => {
        if (!checkDeveloperAccess()) return;

         if (!window.confirm("This will upload all hardcoded prices from constants.ts to the database. Existing DB entries with same model/storage will be overwritten. Proceed?")) {
            return;
        }
        setIsValuationLoading(true);
        setValuationResult(null);
        try {
            const count = await api.seedValuations(PRICE_BASELINE);
            setValuationResult({ success: true, message: `Successfully synced ${count} valuation baselines to Firestore.` });
        } catch (error: any) {
             console.error("Valuation seeding failed:", error);
             setValuationResult({ success: false, message: `Error: ${error.message}`});
        } finally {
            setIsValuationLoading(false);
        }
    }

    const handleSeedDeductions = async () => {
        if (!checkDeveloperAccess()) return;

         if (!window.confirm("This will upload the default fault deduction percentages to the database. Existing entries with same ID will be overwritten. Proceed?")) {
            return;
        }
        setIsDeductionLoading(true);
        setDeductionResult(null);
        try {
            const count = await api.seedValuationDeductions(DEFAULT_DEDUCTIONS);
            setDeductionResult({ success: true, message: `Successfully synced ${count} deduction rules to Firestore.` });
        } catch (error: any) {
             console.error("Deduction seeding failed:", error);
             setDeductionResult({ success: false, message: `Error: ${error.message}`});
        } finally {
            setIsDeductionLoading(false);
        }
    }

    const handleSeedBrands = async () => {
        if (!checkDeveloperAccess()) return;

        if (!window.confirm("This will add all hardcoded brands from constants.ts to the database. Proceed?")) {
            return;
        }
        setIsBrandsLoading(true);
        setBrandsResult(null);
        try {
            const count = await api.seedBrands(BRANDS_DATA);
            setBrandsResult({ success: true, message: `Successfully seeded ${count} brands.` });
        } catch (error: any) {
            console.error("Brand seeding failed:", error);
            setBrandsResult({ success: false, message: `Error: ${error.message}` });
        } finally {
            setIsBrandsLoading(false);
        }
    }

    return (
        <div className="animate-fade-in space-y-8">
            <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Database Utilities</h1>
            
            {/* Valuation Seeder */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Valuation & Pricing</h2>
                <p className="mt-2 text-slate-500">
                    Manage the initial data for your dynamic pricing engine.
                </p>
                
                <div className="mt-6 flex flex-wrap gap-4">
                    <button
                        onClick={handleSeedValuations}
                        disabled={isValuationLoading}
                        className="bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors disabled:bg-slate-300 disabled:cursor-wait flex items-center gap-2 shadow-md"
                    >
                        {isValuationLoading && <Spinner size="w-5 h-5" />}
                        {isValuationLoading ? 'Migrating...' : 'Import Device Prices'}
                    </button>

                    <button
                        onClick={handleSeedDeductions}
                        disabled={isDeductionLoading}
                        className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-wait flex items-center gap-2 shadow-md"
                    >
                        {isDeductionLoading && <Spinner size="w-5 h-5" />}
                        {isDeductionLoading ? 'Seeding...' : 'Import Fault Deductions'}
                    </button>
                </div>

                 {(valuationResult || deductionResult) && (
                    <div className="mt-6 space-y-2">
                        {valuationResult && (
                            <div className={`p-4 rounded-lg text-sm border ${valuationResult.success ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                <p>{valuationResult.message}</p>
                            </div>
                        )}
                         {deductionResult && (
                            <div className={`p-4 rounded-lg text-sm border ${deductionResult.success ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                <p>{deductionResult.message}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Brands Seeder */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Brands</h2>
                <p className="mt-2 text-slate-500">
                    Import default brands to the database.
                </p>
                <div className="mt-6">
                    <button
                        onClick={handleSeedBrands}
                        disabled={isBrandsLoading}
                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-wait flex items-center gap-2 shadow-md"
                    >
                        {isBrandsLoading && <Spinner size="w-5 h-5" />}
                        {isBrandsLoading ? 'Importing...' : 'Import Brands'}
                    </button>
                </div>
                {brandsResult && (
                    <div className={`mt-6 p-4 rounded-lg text-sm border ${brandsResult.success ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        <p>{brandsResult.message}</p>
                    </div>
                )}
            </div>

            {/* Product Seeder */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Reset Product Inventory</h2>
                <p className="mt-2 text-slate-500">
                    This utility restores the product database to the default set of items defined in the application's code. Use this to fix data corruption issues or to start fresh.
                </p>
                <div className="mt-4 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-10 h-10 text-rose-600 flex-shrink-0" />
                    <div>
                        <p className="font-bold">DANGER ZONE: This is a destructive action.</p>
                        <p className="text-sm mt-1">Clicking the button below will permanently delete all current products in the database and replace them. Use this only if you need to restore the site to its original state.</p>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleClearAndSeedProducts}
                        disabled={isProductLoading}
                        className="bg-rose-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-rose-700 transition-colors disabled:bg-slate-300 disabled:cursor-wait flex items-center gap-2 shadow-md"
                    >
                        {isProductLoading && <Spinner size="w-5 h-5" />}
                        {isProductLoading ? 'Resetting...' : 'Clear & Reset Product Inventory (Locked)'}
                    </button>
                </div>
                {productResult && (
                    <div className={`mt-6 p-4 rounded-lg text-sm border ${productResult.success ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        <p>{productResult.message}</p>
                    </div>
                )}
            </div>

             {/* Blog Seeder */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Seed Blog Posts</h2>
                <p className="mt-2 text-slate-500">
                    Uploads all blog posts from `constants.ts` to the live 'blogPosts' collection in Firestore.
                </p>
                <div className="mt-4 p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl">
                    <p><strong>Warning:</strong> This will create or completely overwrite blog posts with matching slugs. This is for initial setup or content updates.</p>
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleSeedBlog}
                        disabled={isBlogLoading}
                        className="bg-cyan-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-cyan-700 transition-colors disabled:bg-slate-300 disabled:cursor-wait flex items-center gap-2 shadow-md"
                    >
                        {isBlogLoading && <Spinner size="w-5 h-5" />}
                        {isBlogLoading ? 'Seeding Posts...' : 'Seed Blog Posts'}
                    </button>
                </div>
                 {blogResult && (
                    <div className={`mt-6 p-4 rounded-lg text-sm border ${blogResult.success ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        <p>{blogResult.message}</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminSeedPage;
