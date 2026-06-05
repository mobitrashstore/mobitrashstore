
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { db } from '../services/firebase';

interface SearchResult {
    id: string;
    title: string;
    subtitle?: string;
    category: string;
    icon: string;
    action: () => void;
    badge?: string;
    badgeColor?: string;
    image?: string;
}

const PAGE_ROUTES: { label: string; path: string; category: string; keywords: string[]; icon: string }[] = [
    { label: 'Dashboard', path: '/admin/dashboard', category: 'Pages', keywords: ['dashboard', 'home', 'overview'], icon: '📊' },
    { label: 'Orders', path: '/admin/orders', category: 'Pages', keywords: ['orders', 'purchases', 'shopping'], icon: '📦' },
    { label: 'Sale Requests', path: '/admin/trade-ins', category: 'Pages', keywords: ['trade', 'sale requests', 'trade-ins', 'sell'], icon: '🔄' },
    { label: 'Product Requests', path: '/admin/product-requests', category: 'Pages', keywords: ['product requests', 'requests', 'demand'], icon: '🛒' },
    { label: 'Repair Bookings', path: '/admin/repairs', category: 'Pages', keywords: ['repairs', 'fix', 'bookings', 'service'], icon: '🔧' },
    { label: 'Khata: Townplanning', path: '/admin/notebook/townplanning', category: 'Pages', keywords: ['khata', 'notebook', 'townplanning', 'ledger'], icon: '📒' },
    { label: 'Khata: Nayabazar', path: '/admin/notebook/nayabazar', category: 'Pages', keywords: ['khata', 'notebook', 'nayabazar'], icon: '📒' },
    { label: 'Log: Townplanning', path: '/admin/sales-log/townplanning', category: 'Pages', keywords: ['log', 'sales log', 'townplanning', 'transactions'], icon: '📋' },
    { label: 'Log: Nayabazar', path: '/admin/sales-log/nayabazar', category: 'Pages', keywords: ['log', 'sales log', 'nayabazar'], icon: '📋' },
    { label: 'Products (Online)', path: '/admin/inventory', category: 'Pages', keywords: ['products', 'inventory', 'stock', 'items', 'online'], icon: '📱' },
    { label: 'Stock: Townplanning', path: '/admin/store-stock/townplanning', category: 'Pages', keywords: ['stock', 'store', 'townplanning'], icon: '🏪' },
    { label: 'Stock: Nayabazar', path: '/admin/store-stock/nayabazar', category: 'Pages', keywords: ['stock', 'store', 'nayabazar'], icon: '🏪' },
    { label: 'Categories', path: '/admin/categories', category: 'Pages', keywords: ['categories', 'category', 'types'], icon: '🗂️' },
    { label: 'Brands', path: '/admin/brands', category: 'Pages', keywords: ['brands', 'brand', 'manufacturers'], icon: '🏷️' },
    { label: 'Sell Models', path: '/admin/sell-models', category: 'Pages', keywords: ['sell models', 'models', 'config'], icon: '📲' },
    { label: 'Valuations', path: '/admin/valuations', category: 'Pages', keywords: ['valuations', 'pricing', 'price', 'value'], icon: '💰' },
    { label: 'Coupons', path: '/admin/coupons', category: 'Pages', keywords: ['coupons', 'discounts', 'promo', 'codes', 'vouchers'], icon: '🎫' },
    { label: 'Points & Referrals', path: '/admin/points', category: 'Pages', keywords: ['points', 'referrals', 'rewards', 'loyalty'], icon: '🎁' },
    { label: 'Spin & Win', path: '/admin/spin-wheel', category: 'Pages', keywords: ['spin', 'wheel', 'win', 'game', 'lucky'], icon: '🎡' },
    { label: 'Notifications', path: '/admin/notifications', category: 'Pages', keywords: ['notifications', 'push', 'alerts', 'messages'], icon: '🔔' },
    { label: 'Bulk Email', path: '/admin/bulk-email', category: 'Pages', keywords: ['bulk email', 'mail', 'newsletter', 'broadcast'], icon: '📧' },
    { label: 'Banners', path: '/admin/banners', category: 'Pages', keywords: ['banners', 'ads', 'images', 'sliders'], icon: '🖼️' },
    { label: 'Notice Banner', path: '/admin/notice-banner', category: 'Pages', keywords: ['notice', 'banner', 'announcement', 'megaphone'], icon: '📢' },
    { label: 'Gallery', path: '/admin/gallery', category: 'Pages', keywords: ['gallery', 'photos', 'media'], icon: '🖼️' },
    { label: 'News Channels', path: '/admin/news', category: 'Pages', keywords: ['news', 'channels', 'feeds', 'rss'], icon: '📰' },
    { label: 'Blog', path: '/admin/blog', category: 'Pages', keywords: ['blog', 'posts', 'articles', 'write'], icon: '✍️' },
    { label: 'Testimonials', path: '/admin/testimonials', category: 'Pages', keywords: ['testimonials', 'reviews', 'feedback', 'quotes'], icon: '⭐' },
    { label: 'Product Reviews', path: '/admin/reviews', category: 'Pages', keywords: ['reviews', 'ratings', 'product feedback'], icon: '💬' },
    { label: 'Messages', path: '/admin/contacts', category: 'Pages', keywords: ['messages', 'contacts', 'inquiries', 'support'], icon: '✉️' },
    { label: 'Problem Reports', path: '/admin/problems', category: 'Pages', keywords: ['problems', 'reports', 'bugs', 'issues'], icon: '⚠️' },
    { label: 'Users', path: '/admin/users', category: 'Pages', keywords: ['users', 'customers', 'accounts', 'members'], icon: '👥' },
    { label: 'ML Features', path: '/admin/ml-features', category: 'Pages', keywords: ['ml', 'ai', 'machine learning', 'ocr', 'barcode', 'smart'], icon: '🤖' },
    { label: 'About Manager', path: '/admin/about', category: 'Pages', keywords: ['about', 'info', 'company', 'profile'], icon: 'ℹ️' },
    { label: 'Legal Pages', path: '/admin/legal', category: 'Pages', keywords: ['legal', 'terms', 'privacy', 'policy'], icon: '⚖️' },
    { label: 'Store Settings', path: '/admin/settings', category: 'Pages', keywords: ['settings', 'config', 'store', 'configuration'], icon: '⚙️' },
    { label: 'API Workflow', path: '/admin/workflow', category: 'Pages', keywords: ['workflow', 'api', 'integration'], icon: '🔗' },
    { label: 'Analytics', path: '/admin/analytics', category: 'Pages', keywords: ['analytics', 'stats', 'traffic', 'data', 'reports'], icon: '📈' },
    { label: 'Seed Database', path: '/admin/seed', category: 'Pages', keywords: ['seed', 'database', 'import', 'data'], icon: '🌱' },
];

const STATUS_COLORS: Record<string, string> = {
    'Processing': 'bg-blue-100 text-blue-700',
    'Shipped': 'bg-purple-100 text-purple-700',
    'Delivered': 'bg-orange-100 text-orange-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Payment Pending': 'bg-amber-100 text-amber-700',
    'Pending Pickup': 'bg-amber-100 text-amber-700',
    'Inspecting': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-orange-100 text-orange-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Pending': 'bg-amber-100 text-amber-700',
    'In Stock': 'bg-orange-100 text-orange-700',
    'Out of Stock': 'bg-red-100 text-red-700',
    'Confirmed': 'bg-blue-100 text-blue-700',
    'admin': 'bg-purple-100 text-purple-700',
    'user': 'bg-slate-100 text-slate-600',
};

interface GlobalSearchProps {
    navigate: (path: string) => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    isMobile?: boolean;
    autoFocus?: boolean;
    onClose?: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
    navigate,
    placeholder = 'Global Search (Pages, Orders, Products...)',
    className = '',
    inputClassName = '',
    isMobile = false,
    autoFocus = false,
    onClose,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const closeSearch = useCallback(() => {
        setIsOpen(false);
        setSearchQuery('');
        setResults([]);
        setSelectedIndex(0);
        onClose?.();
    }, [onClose]);

    const searchPages = useCallback((q: string): SearchResult[] => {
        const lq = q.toLowerCase();
        return PAGE_ROUTES
            .filter(p =>
                p.label.toLowerCase().includes(lq) ||
                p.keywords.some(k => k.includes(lq))
            )
            .slice(0, 6)
            .map(p => ({
                id: `page-${p.path}`,
                title: p.label,
                subtitle: p.path,
                category: 'Pages',
                icon: p.icon,
                action: () => { navigate(p.path); closeSearch(); },
            }));
    }, [navigate, closeSearch]);

    const searchFirestore = useCallback(async (q: string): Promise<SearchResult[]> => {
        const lq = q.toLowerCase();
        const allResults: SearchResult[] = [];

        try {
            // Parallel fetch for speed
            const [ordersSnap, productsSnap, usersSnap, tradeinsSnap, repairsSnap] = await Promise.all([
                db.collection('orders').limit(80).get(),
                db.collection('inventory').limit(150).get(),
                db.collection('users').limit(80).get(),
                db.collection('trade_ins').limit(60).get(),
                db.collection('repair_bookings').limit(60).get(),
            ]);

            // Orders
            ordersSnap.docs.forEach(doc => {
                const d = doc.data();
                const id = doc.id;
                const name: string = d.customerDetails?.name || '';
                const email: string = d.customerDetails?.email || '';
                const phone: string = d.customerDetails?.phone || '';
                const itemTitles: string = (d.items || []).map((i: any) => i.title || '').join(' ');

                if (
                    id.toLowerCase().includes(lq) ||
                    name.toLowerCase().includes(lq) ||
                    email.toLowerCase().includes(lq) ||
                    phone.includes(lq) ||
                    itemTitles.toLowerCase().includes(lq)
                ) {
                    allResults.push({
                        id: `order-${id}`,
                        title: `#${id}`,
                        subtitle: `${name} • NPR ${Number(d.total || 0).toLocaleString()}`,
                        category: 'Orders',
                        icon: '📦',
                        badge: d.status,
                        badgeColor: STATUS_COLORS[d.status as string] || 'bg-gray-100 text-gray-700',
                        action: () => { navigate(`/admin/orders?q=${encodeURIComponent(id)}`); closeSearch(); },
                    });
                }
            });

            // Products
            productsSnap.docs.forEach(doc => {
                const d = doc.data();
                const id = doc.id;
                const title: string = d.title || '';
                const brand: string = d.specs?.brand || '';
                const model: string = d.specs?.model || '';
                const category: string = d.category || '';

                if (
                    title.toLowerCase().includes(lq) ||
                    brand.toLowerCase().includes(lq) ||
                    model.toLowerCase().includes(lq) ||
                    category.toLowerCase().includes(lq) ||
                    id.toLowerCase().includes(lq)
                ) {
                    const stock = Number(d.stock || 0);
                    allResults.push({
                        id: `product-${id}`,
                        title: title || id,
                        subtitle: `NPR ${Number(d.price || 0).toLocaleString()} • Stock: ${stock}`,
                        category: 'Products',
                        icon: '📱',
                        badge: stock > 0 ? 'In Stock' : 'Out of Stock',
                        badgeColor: stock > 0 ? STATUS_COLORS['In Stock'] : STATUS_COLORS['Out of Stock'],
                        image: Array.isArray(d.media) ? d.media[0] : undefined,
                        action: () => { navigate(`/admin/inventory?q=${encodeURIComponent(title || id)}`); closeSearch(); },
                    });
                }
            });

            // Users
            usersSnap.docs.forEach(doc => {
                const d = doc.data();
                const id = doc.id;
                const name: string = d.name || '';
                const email: string = d.email || '';

                if (
                    name.toLowerCase().includes(lq) ||
                    email.toLowerCase().includes(lq) ||
                    id.toLowerCase().includes(lq)
                ) {
                    allResults.push({
                        id: `user-${id}`,
                        title: name || email,
                        subtitle: email,
                        category: 'Users',
                        icon: '👤',
                        badge: d.role || 'user',
                        badgeColor: STATUS_COLORS[d.role as string] || STATUS_COLORS['user'],
                        image: d.photoURL || undefined,
                        action: () => { navigate(`/admin/users?q=${encodeURIComponent(email || name)}`); closeSearch(); },
                    });
                }
            });

            // Trade-ins
            tradeinsSnap.docs.forEach(doc => {
                const d = doc.data();
                const id = doc.id;
                const name: string = d.customerName || '';
                const email: string = d.customerEmail || '';
                const device: string = d.device || '';

                if (
                    id.toLowerCase().includes(lq) ||
                    name.toLowerCase().includes(lq) ||
                    email.toLowerCase().includes(lq) ||
                    device.toLowerCase().includes(lq)
                ) {
                    allResults.push({
                        id: `tradein-${id}`,
                        title: `${device || 'Trade-In'} by ${name}`,
                        subtitle: `NPR ${Number(d.quote || 0).toLocaleString()} • ${email}`,
                        category: 'Trade-ins',
                        icon: '🔄',
                        badge: d.status,
                        badgeColor: STATUS_COLORS[d.status as string] || 'bg-gray-100 text-gray-700',
                        action: () => { navigate(`/admin/trade-ins?q=${encodeURIComponent(id)}`); closeSearch(); },
                    });
                }
            });

            // Repairs
            repairsSnap.docs.forEach(doc => {
                const d = doc.data();
                const id = doc.id;
                const name: string = d.customerName || '';
                const device: string = d.deviceModel || '';
                const issue: string = d.issueType || '';
                const phone: string = d.phone || '';

                if (
                    id.toLowerCase().includes(lq) ||
                    name.toLowerCase().includes(lq) ||
                    device.toLowerCase().includes(lq) ||
                    issue.toLowerCase().includes(lq) ||
                    phone.includes(lq)
                ) {
                    allResults.push({
                        id: `repair-${id}`,
                        title: `${device || 'Repair'} — ${name}`,
                        subtitle: `${issue} • ${phone}`,
                        category: 'Repairs',
                        icon: '🔧',
                        badge: d.status,
                        badgeColor: STATUS_COLORS[d.status as string] || 'bg-gray-100 text-gray-700',
                        action: () => { navigate(`/admin/repairs?q=${encodeURIComponent(id)}`); closeSearch(); },
                    });
                }
            });

        } catch (err) {
            console.warn('[GlobalSearch] Firestore search error:', err);
        }

        return allResults.slice(0, 30);
    }, [navigate, closeSearch]);

    const performSearch = useCallback(async (q: string) => {
        if (!q.trim() || q.length < 1) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setIsOpen(true);

        // Show page results immediately (instant)
        const pageResults = searchPages(q);
        setResults(pageResults);

        // Fetch Firestore results in parallel
        if (q.length >= 2) {
            const firestoreResults = await searchFirestore(q);
            setResults([...pageResults, ...firestoreResults]);
        }

        setIsLoading(false);
        setSelectedIndex(0);
    }, [searchPages, searchFirestore]);

    // Debounced search on query change
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(searchQuery), 280);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchQuery, performSearch]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                closeSearch();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeSearch]);

    // Global keyboard shortcut: Ctrl+K / Cmd+K
    useEffect(() => {
        const handleGlobalKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
        };
        document.addEventListener('keydown', handleGlobalKey);
        return () => document.removeEventListener('keydown', handleGlobalKey);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            results[selectedIndex]?.action();
        } else if (e.key === 'Escape') {
            closeSearch();
        }
    };

    // Scroll selected item into view
    useEffect(() => {
        const el = dropdownRef.current?.querySelector(`[data-idx="${selectedIndex}"]`);
        el?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    // Group results by category
    const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
        if (!acc[r.category]) acc[r.category] = [];
        acc[r.category].push(r);
        return acc;
    }, {});

    const catOrder = ['Pages', 'Products', 'Orders', 'Users', 'Trade-ins', 'Repairs'];
    const orderedGroups = catOrder
        .filter(c => grouped[c])
        .map(c => ({ category: c, items: grouped[c] }));

    let globalIdx = 0;

    return (
        <div ref={searchContainerRef} className={`relative ${className}`}>
            {/* Input */}
            <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    {isLoading ? (
                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    autoFocus={autoFocus}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (searchQuery.trim()) setIsOpen(true); }}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={`block w-full pl-10 pr-10 py-2.5 border-0 bg-white/80 rounded-xl text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 sm:text-sm transition-all hover:bg-white focus:bg-white ${inputClassName}`}
                />
                {searchQuery ? (
                    <button
                        onMouseDown={e => { e.preventDefault(); setSearchQuery(''); setResults([]); setIsOpen(false); }}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                ) : !isMobile ? (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-xs text-slate-400 font-mono border border-slate-200 bg-slate-50 rounded px-1.5 py-0.5">⌘K</span>
                    </div>
                ) : null}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-[9999] max-h-[72vh] overflow-y-auto"
                    style={{ minWidth: isMobile ? '100%' : '380px' }}
                >
                    {/* Loading state with no results yet */}
                    {isLoading && results.length === 0 && (
                        <div className="flex items-center justify-center py-8 gap-3 text-slate-500">
                            <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                            <span className="text-sm font-medium">Searching everywhere...</span>
                        </div>
                    )}

                    {/* No results */}
                    {!isLoading && results.length === 0 && searchQuery.length >= 1 && (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400 px-4">
                            <span className="text-4xl mb-3">🔍</span>
                            <p className="font-semibold text-slate-500 text-center">No results for "<span className="text-blue-600">{searchQuery}</span>"</p>
                            <p className="text-sm mt-1 text-center">Try searching orders, products, users, or page names</p>
                        </div>
                    )}

                    {/* Results grouped by category */}
                    {orderedGroups.map(({ category, items }) => (
                        <div key={category}>
                            {/* Category header */}
                            <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{category}</span>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5 leading-none">{items.length}</span>
                                {isLoading && category !== 'Pages' && (
                                    <div className="h-2.5 w-2.5 border border-blue-400 border-t-transparent rounded-full animate-spin ml-1" />
                                )}
                            </div>

                            {items.map(result => {
                                const idx = globalIdx++;
                                const isSelected = idx === selectedIndex;
                                return (
                                    <button
                                        key={result.id}
                                        data-idx={idx}
                                        onMouseDown={e => { e.preventDefault(); result.action(); }}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75 ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                    >
                                        {/* Icon / Image */}
                                        <div className="flex-shrink-0">
                                            {result.image ? (
                                                <img
                                                    src={result.image}
                                                    alt=""
                                                    className="w-9 h-9 rounded-lg object-cover border border-slate-200 bg-slate-100"
                                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl ${isSelected ? 'bg-blue-100' : 'bg-slate-100'} transition-colors`}>
                                                    {result.icon}
                                                </div>
                                            )}
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                                                {result.title}
                                            </p>
                                            {result.subtitle && (
                                                <p className="text-xs text-slate-400 truncate mt-0.5">{result.subtitle}</p>
                                            )}
                                        </div>

                                        {/* Badge */}
                                        {result.badge && (
                                            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${result.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                                                {result.badge}
                                            </span>
                                        )}

                                        {/* Arrow hint */}
                                        {isSelected && (
                                            <span className="text-blue-400 flex-shrink-0 font-bold">→</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}

                    {/* Footer */}
                    {results.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/80 text-[10px] text-slate-400 font-mono sticky bottom-0">
                            <span>↑↓ Navigate &nbsp;·&nbsp; Enter Select &nbsp;·&nbsp; Esc Close</span>
                            <span className="font-bold">{results.length} result{results.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
