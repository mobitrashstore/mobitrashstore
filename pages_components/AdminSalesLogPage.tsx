import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import { OfflineSale, Category } from '../types';
import { STORE_STOCK_CATEGORIES } from '../constants';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import Spinner from '../components/Spinner';

type ShopLocation = 'Townplanning' | 'Nayabazar';

interface AdminSalesLogPageProps {
    navigate: (path: string) => void;
    shopLocation: ShopLocation;
}

const SaleModal: React.FC<{
    sale: Partial<OfflineSale> | null;
    categories: Category[];
    onClose: () => void;
    onSave: (sale: Omit<OfflineSale, 'id'>) => Promise<void>;
}> = ({ sale, categories, onClose, onSave }) => {
    const isEditMode = !!sale?.id;

    // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const getInitialDate = () => {
        const d = sale?.date ? new Date(sale.date) : new Date();
        // Adjust to local timezone for the input value
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        itemName: '',
        category: STORE_STOCK_CATEGORIES[0],
        quantity: 1,
        pricePerUnit: 0,
        ...sale,
        // Ensure date is in input-friendly format
        date: getInitialDate(),
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    // Combine system constants and DB categories
    const availableCategories = useMemo(() => {
        const dbCatNames = categories.map(c => c.name);
        return Array.from(new Set([...STORE_STOCK_CATEGORIES, ...dbCatNames])).sort();
    }, [categories]);

    // Check if the editing sale has a category not in the list (implies custom)
    useEffect(() => {
        if (sale?.category && !availableCategories.includes(sale.category)) {
            setIsCustomCategory(true);
        }
    }, [sale, availableCategories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (name === 'quantity' || name === 'pricePerUnit') ? Number(value) : value }));
    };

    const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === '___CUSTOM___') {
            setIsCustomCategory(true);
            setFormData(prev => ({ ...prev, category: '' }));
        } else {
            setIsCustomCategory(false);
            setFormData(prev => ({ ...prev, category: val }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category.trim()) {
            alert("Please enter a category.");
            return;
        }

        // Ensure date is valid, fallback to NOW
        const validDate = formData.date ? new Date(formData.date).toISOString() : new Date().toISOString();

        setIsSaving(true);
        try {
            const payload: Omit<OfflineSale, 'id'> = {
                ...formData,
                itemId: formData.itemName.replace(/\s+/g, '-').toLowerCase(),
                total: formData.quantity * formData.pricePerUnit,
                date: validDate,
            };
            await onSave(payload);
        } catch (error: any) {
            console.error("Error saving sale:", error);
            alert(`Failed to save sale: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const total = (formData.quantity || 0) * (formData.pricePerUnit || 0);

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 mb-10 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header with God Photo */}
                <div className="flex items-center justify-between p-3 md:p-5 border-b border-amber-100 bg-amber-50">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://png.pngtree.com/png-clipart/20230429/original/pngtree-golden-shree-ganeshay-namah-hindi-calligraphy-with-lord-ganesh-hand-drawn-png-image_9119794.png"
                            alt="Shree Ganesh"
                            className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-full border-2 border-amber-200 shadow-sm"
                            onError={(e) => {
                                // Fallback in case the truncated base64 fails
                                (e.target as HTMLImageElement).src = 'https://www.transparentpng.com/thumb/sri-ganesh/shree-ganeshaya-png-24.png';
                            }}
                        />
                        <div>
                            <h2 className="text-lg md:text-xl font-extrabold text-slate-800 leading-tight">
                                {isEditMode ? 'Edit Sale' : 'Record Sale'}
                            </h2>
                            <p className="text-[10px] md:text-xs text-amber-600 font-bold uppercase tracking-wider">Shree Ganeshay Namah</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full shadow-sm border border-slate-200 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                </div>

                {/* Compact Form for Mobile */}
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-3 md:space-y-5">

                    {/* Date Input */}
                    <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-600 mb-1">Date & Time</label>
                        <input
                            type="datetime-local"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full p-2 md:p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-amber-500 focus:border-amber-500 font-medium text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-600 mb-1">Item Name</label>
                        <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} required className="w-full p-2 md:p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-amber-500 focus:border-amber-500 placeholder-slate-400 text-sm" placeholder="Product Name" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs md:text-sm font-bold text-slate-600">Category</label>
                            {isCustomCategory && (
                                <button
                                    type="button"
                                    onClick={() => { setIsCustomCategory(false); setFormData(prev => ({ ...prev, category: availableCategories[0] })); }}
                                    className="text-[10px] md:text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <ArrowLeftIcon className="w-3 h-3" /> Select list
                                </button>
                            )}
                        </div>

                        {isCustomCategory ? (
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                autoFocus
                                className="w-full p-2 md:p-3 border border-blue-300 bg-blue-50 rounded-xl text-slate-900 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Type custom category..."
                            />
                        ) : (
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleCategorySelect}
                                className="w-full p-2 md:p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-amber-500 focus:border-amber-500 text-sm"
                            >
                                {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                <option disabled>──────────</option>
                                <option value="___CUSTOM___">✨ Add Custom Category...</option>
                            </select>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-5">
                        <div>
                            <label className="block text-xs md:text-sm font-bold text-slate-600 mb-1">Quantity</label>
                            <input type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} required min="1" className="w-full p-2 md:p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-amber-500 focus:border-amber-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-bold text-slate-600 mb-1">Price / Unit</label>
                            <input type="number" name="pricePerUnit" value={formData.pricePerUnit || ''} onChange={handleChange} required className="w-full p-2 md:p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-amber-500 focus:border-amber-500 text-sm" />
                        </div>
                    </div>

                    <div className="p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <span className="text-slate-500 font-bold text-xs md:text-sm">Total Amount:</span>
                        <span className="font-extrabold text-lg md:text-xl text-amber-600">NPR {total.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={isSaving} className="w-full bg-amber-600 text-white font-bold py-2.5 md:py-3 rounded-xl hover:bg-amber-700 shadow-md transition-all active:scale-95 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm md:text-base">
                            {isSaving ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminSalesLogPage: React.FC<AdminSalesLogPageProps> = ({ navigate, shopLocation }) => {
    const [sales, setSales] = useState<OfflineSale[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSale, setEditingSale] = useState<Partial<OfflineSale> | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allSales, allCategories] = await Promise.all([
                api.getOfflineSales(),
                api.getCategories()
            ]);
            const shopSales = allSales.filter(s => (s.shopLocation || 'Townplanning') === shopLocation);
            setSales(shopSales);
            setCategories(allCategories);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [shopLocation]);

    const handleSave = async (saleData: Omit<OfflineSale, 'id'>) => {
        const payload = { ...saleData, shopLocation };
        if (editingSale && 'id' in editingSale) {
            await api.updateOfflineSale(editingSale.id!, payload);
        } else {
            await api.addOfflineSale(payload);
        }
        await fetchData();
        setIsModalOpen(false);
        setEditingSale(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this sale record?")) {
            await api.deleteOfflineSale(id);
            await fetchData();
        }
    };

    const filteredSales = useMemo(() => {
        return sales.filter(s => s.itemName.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [sales, searchQuery]);

    const stats = useMemo(() => {
        const now = new Date();
        const isToday = (d: Date) => d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        const isThisMonth = (d: Date) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

        let todayRevenue = 0;
        let monthRevenue = 0;

        sales.forEach(s => {
            const date = new Date(s.date);
            if (isThisMonth(date)) {
                monthRevenue += s.total;
                if (isToday(date)) {
                    todayRevenue += s.total;
                }
            }
        });
        return { todayRevenue, monthRevenue };
    }, [sales]);

    const headerColor = shopLocation === 'Townplanning' ? 'text-amber-600' : 'text-purple-600';
    const btnColor = shopLocation === 'Townplanning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700';
    const cardBorder = shopLocation === 'Townplanning' ? 'border-amber-200' : 'border-purple-200';

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">Sales Log</h1>
                    <p className={`text-sm font-bold uppercase tracking-wider ${headerColor}`}>{shopLocation}</p>
                </div>
                <button onClick={() => { setEditingSale(null); setIsModalOpen(true); }} className={`${btnColor} text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-105 w-full md:w-auto`}>
                    <PlusCircleIcon className="w-5 h-5" /> Add Custom Sale
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`bg-white p-5 rounded-2xl shadow-sm border ${cardBorder}`}>
                    <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wide mb-1">Today's Sales</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">NPR {stats.todayRevenue.toLocaleString()}</p>
                </div>
                <div className={`bg-white p-5 rounded-2xl shadow-sm border ${cardBorder}`}>
                    <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wide mb-1">This Month</p>
                    <p className="text-3xl font-black text-blue-600 tracking-tight">NPR {stats.monthRevenue.toLocaleString()}</p>
                </div>
            </div>

            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search sales by item name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 p-3 bg-white border border-slate-300 text-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm outline-none transition-shadow placeholder-slate-400"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? <div className="p-12 text-center"><Spinner size="w-12 h-12" /></div> :
                    filteredSales.length === 0 ? <p className="text-center p-12 text-slate-500 font-medium">No sales records found.</p> :
                        (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm text-left text-slate-600">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                                                <th className="px-6 py-4 font-bold tracking-wider">Item</th>
                                                <th className="px-6 py-4 font-bold tracking-wider">Category</th>
                                                <th className="px-6 py-4 text-right font-bold tracking-wider">Qty</th>
                                                <th className="px-6 py-4 text-right font-bold tracking-wider">Total</th>
                                                <th className="px-6 py-4 text-center font-bold tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredSales.map(sale => (
                                                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 text-slate-500">{new Date(sale.date).toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-800">{sale.itemName}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold border border-slate-200">{sale.category}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-slate-600">{sale.quantity}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-amber-600">NPR {sale.total.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => { setEditingSale(sale); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><PencilSquareIcon className="w-5 h-5" /></button>
                                                            <button onClick={() => handleDelete(sale.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-4 p-4 bg-white">
                                    {filteredSales.map(sale => (
                                        <div key={sale.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-bold text-slate-900 text-lg">{sale.itemName}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{new Date(sale.date).toLocaleString()}</p>
                                                </div>
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold uppercase border border-slate-200">{sale.category}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Total</p>
                                                    <p className="text-lg font-black text-amber-600">NPR {sale.total.toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded">x{sale.quantity}</span>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => { setEditingSale(sale); setIsModalOpen(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg active:scale-95 transition-transform"><PencilSquareIcon className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(sale.id)} className="p-2 text-rose-600 bg-rose-50 rounded-lg active:scale-95 transition-transform"><TrashIcon className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
            </div>

            {isModalOpen && <SaleModal sale={editingSale} categories={categories} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

export default AdminSalesLogPage;
