

import React, { useState, useMemo, useEffect } from 'react';
// FIX: Corrected import syntax for api service
import * as api from '../services/api';
import { HomeHeroSlider } from '../components/HomeSliders';
import { InventoryItem, Category, Banner } from '../types';
import { BRANDS } from '../constants';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { ChevronUpIcon } from '../components/icons/ChevronUpIcon';
import { AdjustmentsHorizontalIcon } from '../components/icons/AdjustmentsHorizontalIcon';
import ProductCard from '../components/ProductCard';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { Squares2x2Icon } from '../components/icons/Squares2x2Icon';
import { ListBulletIcon } from '../components/icons/ListBulletIcon';
import SEO from '../components/SEO';
import { useVisualEditing } from '../context/VisualEditingContext';
import VisualEditWrapper from '../components/VisualEditWrapper';
import EditableText from '../components/EditableText';

const BUY_PAGE_CONFIG_DEFAULT = {
    title: "Premium Certified Devices",
    subtitle: "Every device is 100% genuine and comes with 1-Year BT Warranty."
};

export interface BuyPageProps {
    navigate: (path: string) => void;
}

import { slugify } from '../services/api'; 

// --- Components ---

const Accordion: React.FC<{
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-200 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full text-left group"
            >
                <span className="font-bold text-gray-800 text-sm uppercase tracking-wide group-hover:text-[#00bfff] transition-colors">{title}</span>
                {isOpen ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
            </button>
            {isOpen && (
                <div className="mt-3 space-y-2 animate-fade-in-down">
                    {children}
                </div>
            )}
        </div>
    );
};

const CheckboxFilter: React.FC<{
    label: string;
    checked: boolean;
    onChange: () => void;
    count?: number;
    subLevel?: boolean;
}> = ({ label, checked, onChange, count, subLevel }) => (
    <label className={`flex items-center justify-between cursor-pointer group ${subLevel ? 'pl-6' : ''}`}>
        <div className="flex items-center">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 rounded border-gray-300 text-[#00bfff] focus:ring-[#00bfff] cursor-pointer"
            />
            <span className={`ml-3 text-sm ${checked ? 'text-gray-900 font-bold' : 'text-gray-600'} group-hover:text-[#00bfff] transition-colors`}>{label}</span>
        </div>
        {count !== undefined && <span className="text-xs text-gray-400 font-medium">{count}</span>}
    </label>
);

// --- Extracted FilterSidebar to fix Focus Issue ---
interface FilterSidebarProps {
    priceRange: { min: string, max: string };
    setPriceRange: React.Dispatch<React.SetStateAction<{ min: string, max: string }>>;
    showInStockOnly: boolean;
    setShowInStockOnly: (val: boolean) => void;
    selectedCategories: string[];
    toggleCategory: (cat: string) => void;
    phoneType: 'all' | 'iphone' | 'android';
    handlePhoneTypeChange: (type: 'iphone' | 'android') => void;
    dbCategories: Category[];
    brandsAvailable: string[];
    selectedBrands: string[];
    toggleBrand: (brand: string) => void;
    clearAllFilters: () => void;
    resultCount: number;
    isMobile?: boolean;
    closeMobileFilters?: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    priceRange, setPriceRange, showInStockOnly, setShowInStockOnly,
    selectedCategories, toggleCategory, phoneType, handlePhoneTypeChange,
    dbCategories, brandsAvailable, selectedBrands, toggleBrand,
    clearAllFilters, resultCount, isMobile, closeMobileFilters
}) => {
    return (
        <div className="space-y-2">
            {isMobile && (
                <div className="flex justify-between items-center mb-6 md:hidden border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    <button onClick={closeMobileFilters} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><XMarkIcon className="w-6 h-6 text-gray-600" /></button>
                </div>
            )}

            {/* Price Filter */}
            <div className="pb-6 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Price Range (NPR)</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                </div>
            </div>

            {/* Stock Filter */}
            <div className="py-4 border-b border-gray-100">
                <CheckboxFilter
                    label="In Stock Only"
                    checked={showInStockOnly}
                    onChange={() => setShowInStockOnly(!showInStockOnly)}
                />
            </div>

            {/* Dynamic Categories Filter */}
            <Accordion title="Categories" defaultOpen={true}>
                <div>
                    <CheckboxFilter
                        label="Phones"
                        checked={selectedCategories.includes('Phones')}
                        onChange={() => toggleCategory('Phones')}
                    />
                    {/* Sub-filters for Phones */}
                    {selectedCategories.includes('Phones') && (
                        <div className="mt-2 space-y-2 animate-fade-in pl-2 border-l-2 border-slate-100 ml-2">
                            <CheckboxFilter
                                label="iPhones"
                                checked={phoneType === 'iphone'}
                                onChange={() => handlePhoneTypeChange('iphone')}
                                subLevel
                            />
                            <CheckboxFilter
                                label="Android"
                                checked={phoneType === 'android'}
                                onChange={() => handlePhoneTypeChange('android')}
                                subLevel
                            />
                        </div>
                    )}
                </div>

                {dbCategories.filter(c => c.name !== 'Phones').map(cat => (
                    <CheckboxFilter
                        key={cat.id}
                        label={cat.name}
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => toggleCategory(cat.name)}
                    />
                ))}
            </Accordion>

            {/* Brands Filter (Dynamic) */}
            <Accordion title="Brands" defaultOpen={true}>
                {brandsAvailable.length > 0 ? brandsAvailable.map(brand => (
                    <CheckboxFilter
                        key={brand}
                        label={brand}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                    />
                )) : (
                    <p className="text-xs text-gray-500 italic">No brands available.</p>
                )}
            </Accordion>

            {/* Actions */}
            <div className="pt-6">
                <button
                    onClick={clearAllFilters}
                    className="w-full py-2.5 text-sm text-rose-600 font-bold hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                >
                    Clear All Filters
                </button>
            </div>

            {/* Mobile Apply Button */}
            {isMobile && (
                <div className="md:hidden mt-4">
                    <button
                        onClick={closeMobileFilters}
                        className="w-full py-3.5 bg-amber-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
                    >
                        Show {resultCount} Results
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---

const BuyPage: React.FC<BuyPageProps> = ({ navigate }) => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [dbCategories, setDbCategories] = useState<Category[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

    // Filters State
    const [phoneType, setPhoneType] = useState<'all' | 'iphone' | 'android'>('all');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState('featured');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Advanced Filters
    const [priceRange, setPriceRange] = useState<{ min: string, max: string }>({ min: '', max: '' });
    const [showInStockOnly, setShowInStockOnly] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const itemsPerPage = isMobileView ? 10 : 15;

    const [config, setConfig] = useState(BUY_PAGE_CONFIG_DEFAULT);

    const fetchConfig = async () => {
        const data = await api.getGenericConfig('settings', 'buypage', BUY_PAGE_CONFIG_DEFAULT);
        setConfig(data);
    };

    const updateConfig = async (newData: any) => {
        const updated = { ...config, ...newData };
        await api.updateGenericConfig('settings', 'buypage', updated);
        setConfig(updated);
    };

    // --- Data Fetching ---
    const fetchPageData = async () => {
        try {
            // These API calls now leverage the caching implemented in services/api.ts
            const [items, cats, productStats, allBanners] = await Promise.all([
                api.getInventoryItems(), // Caches for 1 minute
                api.getCategories(), // Caches for 1 hour
                api.getAllProductStats(),
                api.getBanners()
            ]);
            setInventory(items);
            setDbCategories(cats);
            setViewCounts(productStats);
            setBanners(allBanners);
        } catch (e) {
            console.error("Error fetching buy page data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
        fetchConfig();
        // REAL-TIME VIEW COUNT SUBSCRIPTION
        const unsubscribe = api.subscribeToProductStats(setViewCounts);
        // Responsive listener for mobile vs desktop
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);

        return () => {
            unsubscribe();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // SEPARATE: Handle URL param once categories are loaded
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get('category');
        if (catParam && dbCategories.length > 0) {
            const decodedCat = decodeURIComponent(catParam).toLowerCase();
            const actualCat = dbCategories.find(c => c.name.toLowerCase() === decodedCat);
            if (actualCat && !selectedCategories.includes(actualCat.name)) {
                setSelectedCategories([actualCat.name]);
            }
        }
    }, [dbCategories]);

    // --- Handlers ---

    const handleCategoryClick = (categoryName: string) => {
        // Navigate to catalog page with query param
        navigate(`/product?category=${encodeURIComponent(categoryName)}`);
    };

    const toggleCategory = (catName: string) => {
        setSelectedCategories(prev => {
            const isSelected = prev.includes(catName);
            if (isSelected) {
                if (catName === 'Phones') setPhoneType('all');
                return prev.filter(c => c !== catName);
            } else {
                return [...prev, catName];
            }
        });
    };

    const toggleBrand = (brandName: string) => {
        setSelectedBrands(prev =>
            prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
        );
    };

    const handlePhoneTypeChange = (type: 'iphone' | 'android') => {
        if (!selectedCategories.includes('Phones')) {
            setSelectedCategories(prev => [...prev, 'Phones']);
        }
        setPhoneType(prev => prev === type ? 'all' : type);
    };

    const clearAllFilters = () => {
        setPhoneType('all');
        setSelectedCategories([]);
        setSelectedBrands([]);
        setSortOrder('featured');
        setSearchQuery('');
        setPriceRange({ min: '', max: '' });
        setShowInStockOnly(false);
        setCurrentPage(1);
        window.history.replaceState(null, '', '/product');
    };

    // --- Smart Filtering Logic ---

    const finalFilteredItems = useMemo(() => {
        let result = [...inventory];

        // 1. Search Query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(q) ||
                item.sku.toLowerCase().includes(q) ||
                item.specs?.brand?.toLowerCase().includes(q)
            );
        }

        // 2. Category Filter
        if (selectedCategories.length > 0) {
            result = result.filter(item => selectedCategories.includes(item.category));
        }

        // 3. Phone Type Filter
        if (phoneType === 'iphone') {
            result = result.filter(item => item.category === 'Phones' && String(item.specs?.brand) === 'Apple');
        } else if (phoneType === 'android') {
            result = result.filter(item => item.category === 'Phones' && String(item.specs?.brand) !== 'Apple');
        }

        // 4. Brand Filter
        if (selectedBrands.length > 0) {
            result = result.filter(item => selectedBrands.includes(String(item.specs?.brand || '')));
        }

        // 5. Price Filter
        if (priceRange.min) {
            result = result.filter(item => item.price >= Number(priceRange.min));
        }
        if (priceRange.max) {
            result = result.filter(item => item.price <= Number(priceRange.max));
        }

        // 6. Stock Filter
        if (showInStockOnly) {
            result = result.filter(item => item.stock > 0);
        }

        // 7. Sorting
        switch (sortOrder) {
            case 'price_asc': result.sort((a, b) => a.price - b.price); break;
            case 'price_desc': result.sort((a, b) => b.price - a.price); break;
            case 'views': // Sort by popularity/views
                result.sort((a, b) => {
                    const viewA = viewCounts[`_buy_${slugify(a.title)}`] || 0;
                    const viewB = viewCounts[`_buy_${slugify(b.title)}`] || 0;
                    return viewB - viewA;
                });
                break;
            default: break;
        }

        return result;
    }, [inventory, phoneType, selectedCategories, selectedBrands, sortOrder, searchQuery, priceRange, showInStockOnly, viewCounts]);

    // Reset to page 1 when any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [phoneType, selectedCategories, selectedBrands, sortOrder, searchQuery, priceRange, showInStockOnly, itemsPerPage]);

    // Calculate available brands based on current category view
    const brandsAvailable = useMemo(() => {
        const brands = new Set<string>();
        finalFilteredItems.forEach(item => {
            if (item.specs?.brand) brands.add(String(item.specs.brand));
        });
        return Array.from(brands).sort();
    }, [finalFilteredItems]);

    // --- SEO Schema Construction ---
    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": finalFilteredItems.slice(0, 15).map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Product",
                "name": item.title,
                "image": item.media?.[0] || '',
                "description": item.description,
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "NPR",
                    "price": item.price || 0,
                    "itemCondition": "https://schema.org/UsedCondition",
                    "availability": (item.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                }
            }
        }))
    };

    // Cart & Wishlist Hooks
    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const handleWishlistToggle = (item: InventoryItem) => {
        isInWishlist(item.sku) ? removeFromWishlist(item.sku) : addToWishlist(item);
    };

    const seoTitle = useMemo(() => {
        if (selectedCategories.length === 1) {
            const cat = selectedCategories[0];
            return `Buy Certified ${cat}${cat.toLowerCase().endsWith('s') ? '' : 's'} in Nepal | Mobi Store`;
        }
        return "Buy Certified Phones, Accessories & Electronics in Nepal | Mobi Store";
    }, [selectedCategories]);

    return (
        <div className="bg-transparent min-h-screen">
            <SEO
                title={seoTitle}
                description="Shop certified used phones, premium accessories, and electronic items in Nepal. Apple, Samsung, and more with 1-Year Warranty. Best deals at Mobi Store."
                keywords="buy used iphone nepal, second hand mobile shop, refurbished phones kathmandu, mobi trash store, buy sell exchange mobile, cheap iphone nepal, mobile accessories nepal, electronic shop kathmandu"
                canonicalUrl="https://mobitrashstore.com/buy"
                schema={itemListSchema}
            />

            {/* Search Header Mobile - FIXED to cover overlaps and safe area */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-emerald-400 to-green-600 shadow-xl rounded-b-[2.5rem] overflow-hidden">
                <div className="pt-[env(safe-area-inset-top)] pb-5 px-4">
                    <div className="relative mt-2">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search devices, brands, accessories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/95 backdrop-blur-sm border-0 rounded-full py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-emerald-200 shadow-sm text-gray-900 placeholder:text-gray-500"
                        />
                    </div>
                </div>
            </div>

            {/* Spacer for Fixed Header - Increased to ensure no status bar touching */}
            <div className="md:hidden h-[calc(7rem+env(safe-area-inset-top))]"></div>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-6"> {/* Re-introduced max-w-7xl mx-auto */}

                {/* Mobile Filter Bar — shows count + filter + sort + layout toggle */}
                <div className="flex flex-col gap-2 mb-5 md:hidden">
                    {/* Row 1: Result count */}
                    <p className="text-xs font-semibold text-gray-500 px-1">
                        Showing <span className="font-black text-gray-900 text-sm">{finalFilteredItems.length}</span> results
                    </p>

                    {/* Row 2: Controls */}
                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl shadow-sm border border-gray-100">
                        {/* Filter Button */}
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="flex items-center gap-1.5 text-gray-700 font-bold text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shrink-0"
                        >
                            <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500" />
                            Filter
                            {selectedCategories.length + selectedBrands.length > 0 && (
                                <span className="w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] flex items-center justify-center">
                                    {selectedCategories.length + selectedBrands.length}
                                </span>
                            )}
                        </button>

                        {/* Sort By */}
                        <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value)}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg text-xs py-2 px-2 font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 min-w-0"
                        >
                            <option value="featured">Featured</option>
                            <option value="views">Most Popular 🔥</option>
                            <option value="price_asc">Price: Low → High</option>
                            <option value="price_desc">Price: High → Low</option>
                        </select>

                        {/* Layout Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200 shrink-0">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow text-amber-600' : 'text-gray-400'}`}>
                                <Squares2x2Icon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow text-amber-600' : 'text-gray-400'}`}>
                                <ListBulletIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Slider for Buy Page */}
                {banners.filter(b => b.section === 'buy_hero').length > 0 && (
                    <div className="mb-8">
                        <HomeHeroSlider banners={banners.filter(b => b.section === 'buy_hero')} navigate={navigate} />
                    </div>
                )}

                {/* Added Title & Subtitle Section */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">
                        <EditableText
                            value={config.title}
                            onSave={(val) => updateConfig({ title: val })}
                        />
                    </h1>
                    <p className="text-gray-500 font-medium">
                        <EditableText
                            value={config.subtitle}
                            onSave={(val) => updateConfig({ subtitle: val })}
                        />
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">

                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 max-h-[85vh] overflow-y-auto shadow-sm">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-black text-gray-800 tracking-tight">Filters</h2>
                                {(selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange.min || showInStockOnly) && (
                                    <button onClick={clearAllFilters} className="text-xs font-bold text-rose-500 hover:underline">Reset</button>
                                )}
                            </div>
                            <FilterSidebar
                                priceRange={priceRange} setPriceRange={setPriceRange}
                                showInStockOnly={showInStockOnly} setShowInStockOnly={setShowInStockOnly}
                                selectedCategories={selectedCategories} toggleCategory={toggleCategory}
                                phoneType={phoneType} handlePhoneTypeChange={handlePhoneTypeChange}
                                dbCategories={dbCategories}
                                brandsAvailable={brandsAvailable}
                                selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                                clearAllFilters={clearAllFilters}
                                resultCount={finalFilteredItems.length}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Desktop Top Bar */}
                        <div className="hidden md:flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-gray-600 font-medium text-sm">
                                Showing <span className="font-bold text-gray-900">{finalFilteredItems.length}</span> results
                            </p>

                            <div className="flex items-center gap-4">
                                {/* Layout Toggle Desktop */}
                                <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-400 hover:text-gray-600'}`} title="Grid View">
                                        <Squares2x2Icon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-400 hover:text-gray-600'}`} title="List View">
                                        <ListBulletIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="h-6 w-px bg-gray-200"></div>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500 font-medium">Sort By:</span>
                                    <select
                                        value={sortOrder}
                                        onChange={e => setSortOrder(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 rounded-lg text-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 font-medium text-gray-700 outline-none"
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="views">Most Popular 🔥</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid / List */}
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                                {Array.from({ length: isMobileView ? 10 : 15 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                            </div>
                        ) : finalFilteredItems.length > 0 ? (() => {
                            const totalPages = Math.ceil(finalFilteredItems.length / itemsPerPage);
                            const safeCurrentPage = Math.min(currentPage, totalPages);
                            const startIdx = (safeCurrentPage - 1) * itemsPerPage;
                            const pageItems = finalFilteredItems.slice(startIdx, startIdx + itemsPerPage);

                            // Build page numbers with ellipsis
                            const getPageNumbers = () => {
                                const pages: (number | '...')[] = [];
                                if (totalPages <= 7) {
                                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                                } else {
                                    pages.push(1);
                                    if (safeCurrentPage > 3) pages.push('...');
                                    for (let i = Math.max(2, safeCurrentPage - 1); i <= Math.min(totalPages - 1, safeCurrentPage + 1); i++) {
                                        pages.push(i);
                                    }
                                    if (safeCurrentPage < totalPages - 2) pages.push('...');
                                    pages.push(totalPages);
                                }
                                return pages;
                            };

                            return (
                                <>
                                    <div className={
                                        viewMode === 'grid'
                                            ? "grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4"
                                            : "flex flex-col gap-4"
                                    }>
                                        {pageItems.map(item => (
                                            <ProductCard
                                                key={item.sku}
                                                item={item}
                                                navigate={navigate}
                                                onAddToCart={addToCart}
                                                onWishlistToggle={handleWishlistToggle}
                                                isWishlisted={isInWishlist(item.sku)}
                                                viewCount={Math.max(1, viewCounts[`_buy_${slugify(item.title)}`] || 0)}
                                                layout={viewMode}
                                            />
                                        ))}
                                    </div>

                                    {/* Numbered Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
                                            {/* Prev */}
                                            <button
                                                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                disabled={safeCurrentPage === 1}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-sm shadow-sm"
                                                aria-label="Previous page"
                                            >
                                                ‹
                                            </button>

                                            {getPageNumbers().map((page, idx) =>
                                                page === '...' ? (
                                                    <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none">…</span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => { setCurrentPage(page as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                        className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-bold transition-all shadow-sm ${
                                                            safeCurrentPage === page
                                                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
                                                        }`}
                                                        aria-label={`Page ${page}`}
                                                        aria-current={safeCurrentPage === page ? 'page' : undefined}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            )}

                                            {/* Next */}
                                            <button
                                                onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                disabled={safeCurrentPage === totalPages}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-sm shadow-sm"
                                                aria-label="Next page"
                                            >
                                                ›
                                            </button>
                                        </div>
                                    )}
                                </>
                            );
                        })() : (
                            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-200 shadow-sm text-center px-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No products found</h3>
                                <p className="text-gray-500 mt-2 max-w-md mx-auto">We couldn't find any items matching your filters. Try adjusting your price range or categories.</p>
                                <button onClick={clearAllFilters} className="mt-6 text-white bg-amber-600 px-8 py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-lg active:scale-95">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end md:hidden">
                    {/* Backdrop — full screen overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsMobileFilterOpen(false)}></div>

                    {/* Drawer — starts below top header, not full height */}
                    <div
                        className="relative w-[85%] max-w-sm bg-white shadow-2xl animate-slide-in-right overflow-y-auto flex flex-col rounded-tl-3xl"
                        style={{
                            top: 'calc(env(safe-area-inset-top, 0px) + 56px)',
                            height: 'calc(100% - env(safe-area-inset-top, 0px) - 56px)',
                            position: 'absolute',
                            right: 0,
                        }}
                    >
                        <div className="p-5 pb-28">
                            <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                                <AdjustmentsHorizontalIcon className="w-6 h-6 text-amber-500" /> Filters
                            </h2>
                            <FilterSidebar
                                priceRange={priceRange} setPriceRange={setPriceRange}
                                showInStockOnly={showInStockOnly} setShowInStockOnly={setShowInStockOnly}
                                selectedCategories={selectedCategories} toggleCategory={toggleCategory}
                                phoneType={phoneType} handlePhoneTypeChange={handlePhoneTypeChange}
                                dbCategories={dbCategories}
                                brandsAvailable={brandsAvailable}
                                selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                                clearAllFilters={clearAllFilters}
                                resultCount={finalFilteredItems.length}
                                isMobile={true}
                                closeMobileFilters={() => setIsMobileFilterOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyPage;
