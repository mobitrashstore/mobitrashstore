
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { InventoryItem, BlogPost, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { XMarkIcon } from './icons/XMarkIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import Spinner from './Spinner';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { WrenchIcon } from './icons/WrenchIcon';
import { TruckIcon } from './icons/TruckIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { HeartIcon } from './icons/HeartIcon';
import { StarIcon } from './icons/StarIcon';
import { Squares2x2Icon } from './icons/Squares2x2Icon';
import { BoltIcon } from './icons/BoltIcon';
import { CalculatorIcon } from './icons/CalculatorIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CubeIcon } from './icons/CubeIcon';
import { UsersIcon } from './icons/UsersIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    navigate: (path: string) => void;
}

type SearchResultType = 'product' | 'page' | 'blog' | 'category' | 'action' | 'tracking' | 'admin';

interface SearchResultItem {
    type: SearchResultType;
    id: string;
    title: string;
    subtitle: string;
    image?: string;
    icon?: React.ElementType;
    path: string;
    price?: number;
    highlight?: boolean;
}

// Define static pages for global search
const STATIC_PAGES = [
    { name: 'Sell Phone', path: '/sell', icon: CurrencyDollarIcon, description: 'Get cash for your device', keywords: ['sell', 'cash', 'quote', 'price', 'old', 'trade', 'exchange'] },
    { name: 'Repair Services', path: '/repair', icon: WrenchIcon, description: 'Screen & battery replacement', keywords: ['repair', 'fix', 'broken', 'screen', 'battery', 'damage', 'service', 'technician'] },
    { name: 'Nepali News', path: '/nepali-news', icon: NewspaperIcon, description: 'Latest updates & articles', keywords: ['news', 'nepali', 'khabar', 'update', 'article', 'read'] },
    { name: 'Track Order', path: '/track', icon: TruckIcon, description: 'Check order status', keywords: ['track', 'order', 'status', 'shipping', 'delivery', 'where'] },
    { name: 'Contact Us', path: '/contact', icon: PhoneIcon, description: 'Get support & location', keywords: ['contact', 'support', 'help', 'location', 'map', 'phone', 'email', 'chat'] },
    { name: 'Trust & Safety', path: '/trust', icon: ShieldCheckIcon, description: 'Certificates & Security', keywords: ['trust', 'safe', 'legal', 'pan', 'registered', 'scam', 'security'] },
    { name: 'Request Product', path: '/request-product', icon: ShoppingBagIcon, description: 'Order custom items', keywords: ['request', 'order', 'custom', 'find', 'search', 'import'] },
    { name: 'Blog', path: '/blog', icon: BookOpenIcon, description: 'Tech news & tips', keywords: ['blog', 'news', 'tips', 'guide', 'article', 'read'] },
    { name: 'Profile', path: '/profile', icon: UserCircleIcon, description: 'Account settings', keywords: ['profile', 'account', 'login', 'signup', 'register', 'settings', 'password'] },
    { name: 'My Wishlist', path: '/wishlist', icon: HeartIcon, description: 'Saved items', keywords: ['wishlist', 'saved', 'favorite', 'later'] },
    { name: 'Redeem Points', path: '/redeem-points', icon: StarIcon, description: 'Loyalty rewards', keywords: ['redeem', 'points', 'rewards', 'gift', 'loyalty', 'bonus'] },
    { name: 'Spin & Win', path: '/spin-win', icon: BoltIcon, description: 'Play and win prizes', keywords: ['spin', 'win', 'game', 'play', 'luck', 'prize'] },
    { name: 'EMI Calculator', path: '/emi-calculator', icon: CalculatorIcon, description: 'Calculate loan installments', keywords: ['emi', 'calculator', 'loan', 'finance', 'installment', 'credit'] },
    { name: 'Gallery', path: '/gallery', icon: PhotoIcon, description: 'Photos & Videos', keywords: ['gallery', 'photo', 'video', 'image', 'picture', 'media'] },
    { name: 'Compare', path: '/compare', icon: BoltIcon, description: 'Compare devices', keywords: ['compare', 'vs', 'versus', 'diff', 'specs'] },
    { name: 'Return Policy', path: '/return-policy', icon: DocumentTextIcon, description: 'Returns & Refunds', keywords: ['return', 'refund', 'policy', 'replacement', 'warranty'] },
];

const ADMIN_PAGES = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: ChartBarIcon, description: 'Overview & Stats', keywords: ['admin', 'dashboard', 'stats', 'analytics'] },
    { name: 'Inventory', path: '/admin/inventory', icon: CubeIcon, description: 'Manage Products', keywords: ['inventory', 'product', 'stock', 'add'] },
    { name: 'Orders', path: '/admin/orders', icon: TruckIcon, description: 'Manage Orders', keywords: ['orders', 'shipping', 'sales'] },
    { name: 'Users', path: '/admin/users', icon: UsersIcon, description: 'Manage Users', keywords: ['users', 'customers', 'people'] },
    { name: 'Trade-ins', path: '/admin/trade-ins', icon: CurrencyDollarIcon, description: 'Manage Sale Requests', keywords: ['trade', 'requests', 'sell'] },
    { name: 'Repairs', path: '/admin/repairs', icon: WrenchIcon, description: 'Manage Bookings', keywords: ['repairs', 'bookings', 'service'] },
];

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, navigate }) => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResultItem[]>([]);

    // Fetch data once when opened
    useEffect(() => {
        if (isOpen && inventory.length === 0) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [items, blogPosts, cats] = await Promise.all([
                        api.getInventoryItems(),
                        api.getBlogPosts(),
                        api.getCategories()
                    ]);
                    setInventory(items);
                    setBlogs(blogPosts);
                    setCategories(cats);
                } catch (error) {
                    console.error("Failed to fetch data for search", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase().trim();
        const combinedResults: SearchResultItem[] = [];

        // 0. Tracking ID Detection (Powerful Feature)
        // Detects ORD-XXXX or TRD-XXXX patterns
        if (lowerQuery.startsWith('ord-') || lowerQuery.startsWith('trd-')) {
            combinedResults.push({
                type: 'tracking',
                id: 'track-direct',
                title: `Track ID: ${query.toUpperCase()}`,
                subtitle: 'Click to view status immediately',
                icon: TruckIcon,
                path: `/track?id=${query.toUpperCase()}`,
                highlight: true
            });
        }

        // 1. Admin Pages Search (Only if Admin)
        if (user?.role === 'admin') {
            const matchedAdmin = ADMIN_PAGES.filter(page =>
                page.name.toLowerCase().includes(lowerQuery) ||
                page.keywords.some(k => lowerQuery.includes(k))
            ).map(page => ({
                type: 'admin' as const,
                id: `admin-${page.path}`,
                title: page.name,
                subtitle: `Admin • ${page.description}`,
                icon: page.icon,
                path: page.path
            }));
            combinedResults.push(...matchedAdmin);
        }

        // 2. Intent/Keyword Search on Static Pages
        const matchedPages = STATIC_PAGES.filter(page =>
            page.name.toLowerCase().includes(lowerQuery) ||
            page.description.toLowerCase().includes(lowerQuery) ||
            page.keywords.some(k => lowerQuery.includes(k))
        ).map(page => ({
            type: 'page' as const,
            id: page.path,
            title: page.name,
            subtitle: page.description,
            icon: page.icon,
            path: page.path
        }));
        combinedResults.push(...matchedPages);

        // 3. Category Search
        const matchedCategories = categories.filter(cat =>
            cat.name.toLowerCase().includes(lowerQuery)
        ).map(cat => ({
            type: 'category' as const,
            id: `cat-${cat.id}`,
            title: cat.name,
            subtitle: 'Browse Category',
            icon: Squares2x2Icon,
            path: `/product?category=${encodeURIComponent(cat.name)}`
        }));
        combinedResults.push(...matchedCategories);

        // 4. Product Search (Enhanced with Slugs)
        const matchedProducts = inventory.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.sku.toLowerCase().includes(lowerQuery) ||
            item.category.toLowerCase().includes(lowerQuery) ||
            (item.specs?.brand && String(item.specs.brand).toLowerCase().includes(lowerQuery))
        ).slice(0, 10).map(item => ({
            type: 'product' as const,
            id: item.sku,
            title: item.title,
            subtitle: `${item.specs?.brand || 'Generic'} • ${item.category}`,
            image: item.media[0],
            path: api.getProductPermalink(item), // UPDATED: Use api helper
            price: item.price
        }));
        combinedResults.push(...matchedProducts);

        // 5. Blog Search
        const matchedBlogs = blogs.filter(post =>
            post.title.toLowerCase().includes(lowerQuery) ||
            post.excerpt.toLowerCase().includes(lowerQuery)
        ).slice(0, 3).map(post => ({
            type: 'blog' as const,
            id: post.id, // Fixed: Use ID instead of slug for ID consistency
            title: post.title,
            subtitle: `Article • ${post.date}`,
            image: post.imageUrl,
            path: api.getBlogPermalink(post) // UPDATED: Use api helper
        }));
        combinedResults.push(...matchedBlogs);

        setResults(combinedResults);
    }, [query, inventory, blogs, categories, user]);

    const handleResultClick = (path: string) => {
        navigate(path);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[110] animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full bg-white shadow-2xl animate-slide-in-down border-b border-gray-200 rounded-b-2xl max-h-[90vh] flex flex-col pt-[env(safe-area-inset-top)]"
                onClick={e => e.stopPropagation()}
            >
                <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
                    <div className="flex items-center p-4 gap-4 border-b border-gray-100">
                        <MagnifyingGlassIcon className="w-6 h-6 text-emerald-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search anything (e.g. iPhone, Repair, EMI, Sell)..."
                            className="flex-grow bg-transparent text-lg text-gray-900 placeholder-gray-400 focus:outline-none h-12"
                            autoFocus
                        />
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 bg-gray-100 rounded-full transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="px-4 pb-4 overflow-y-auto scrollbar-hide flex-grow">
                        {loading && <div className="flex justify-center py-8"><Spinner /></div>}

                        {!loading && query && results.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No results found for "{query}".</p>
                                <p className="text-sm text-gray-400 mt-2">Try generic terms like "iPhone", "Repair", or "Battery".</p>
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="divide-y divide-gray-50">
                                {results.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleResultClick(item.path)}
                                        className={`w-full flex items-center gap-4 py-3 hover:bg-gray-50 transition-colors text-left group px-2 rounded-lg ${item.highlight ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 my-2' : ''}`}
                                    >
                                        {/* Icon/Image Logic */}
                                        <div className={`w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center overflow-hidden ${item.type === 'tracking' ? 'bg-emerald-100 text-emerald-600' :
                                            item.type === 'admin' ? 'bg-slate-800 text-white' :
                                                item.type === 'page' ? 'bg-blue-50 text-blue-600' :
                                                    item.type === 'category' ? 'bg-purple-50 text-purple-600' :
                                                        'bg-gray-50 border border-gray-200'
                                            }`}>
                                            {item.icon ? (
                                                <item.icon className="w-6 h-6" />
                                            ) : (
                                                <img src={item.image || 'https://placehold.co/100'} alt={item.title} className="w-full h-full object-contain" />
                                            )}
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <h4 className={`font-bold text-gray-900 truncate group-hover:text-[#00bfff] transition-colors ${item.type === 'tracking' ? 'text-emerald-700' : ''}`}>
                                                {item.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                                        </div>

                                        <div className="text-right flex-shrink-0 flex flex-col items-end">
                                            {item.type === 'product' && item.price && (
                                                <p className="font-bold text-[#FFA500] text-sm">NPR {item.price.toLocaleString()}</p>
                                            )}

                                            <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 ${item.type === 'product' ? 'bg-gray-100 text-gray-600' :
                                                item.type === 'blog' ? 'bg-blue-50 text-blue-600' :
                                                    item.type === 'tracking' ? 'bg-emerald-100 text-emerald-700' :
                                                        item.type === 'admin' ? 'bg-slate-100 text-slate-800 font-bold' :
                                                            item.type === 'category' ? 'bg-purple-50 text-purple-600' :
                                                                'bg-green-50 text-green-600'
                                                }`}>
                                                {item.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <ChevronRightIcon className="w-5 h-5 text-gray-300" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {!loading && !query && (
                            <div className="py-6">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Quick Actions</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleResultClick('/sell')} className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center text-center hover:bg-emerald-100 transition-colors">
                                        <CurrencyDollarIcon className="w-6 h-6 text-emerald-600 mb-1" />
                                        <span className="text-sm font-bold text-gray-800">Sell Phone</span>
                                    </button>
                                    <button onClick={() => handleResultClick('/repair')} className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center text-center hover:bg-blue-100 transition-colors">
                                        <WrenchIcon className="w-6 h-6 text-blue-600 mb-1" />
                                        <span className="text-sm font-bold text-gray-800">Book Repair</span>
                                    </button>
                                    <button onClick={() => handleResultClick('/track')} className="p-3 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center text-center hover:bg-green-100 transition-colors">
                                        <TruckIcon className="w-6 h-6 text-green-600 mb-1" />
                                        <span className="text-sm font-bold text-gray-800">Track Order</span>
                                    </button>
                                    <button onClick={() => handleResultClick('/trust')} className="p-3 bg-teal-50 rounded-xl border border-teal-100 flex flex-col items-center text-center hover:bg-teal-100 transition-colors">
                                        <ShieldCheckIcon className="w-6 h-6 text-teal-600 mb-1" />
                                        <span className="text-sm font-bold text-gray-800">Trust Center</span>
                                    </button>
                                    <button onClick={() => handleResultClick('/spin-win')} className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex flex-col items-center text-center hover:bg-purple-100 transition-colors">
                                        <BoltIcon className="w-6 h-6 text-purple-600 mb-1" />
                                        <span className="text-sm font-bold text-gray-800">Spin & Win</span>
                                    </button>
                                    <button onClick={() => handleResultClick('/request-product')} className="p-3 bg-pink-50 rounded-xl border border-pink-100 flex flex-col items-center text-center hover:bg-pink-100 transition-colors">
                                        <ShoppingBagIcon className="w-6 h-6 text-pink-600 mb-1" />
                                        <span className="text-sm font-bold text-gray-800">Request Item</span>
                                    </button>
                                </div>

                                <p className="text-xs font-bold text-gray-400 uppercase mb-3 mt-6 tracking-wider">Trending Searches</p>
                                <div className="flex flex-wrap gap-2">
                                    {['iPhone 15 Pro', 'Screen Repair', 'Samsung S24', 'Charger', 'Battery', 'Exchange'].map(term => (
                                        <button
                                            key={term}
                                            onClick={() => setQuery(term)}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors active:scale-95"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
