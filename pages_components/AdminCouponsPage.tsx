import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import { Coupon, Category, InventoryItem } from '../types';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import Spinner from '../components/Spinner';

interface AdminCouponsPageProps {
    navigate: (path: string) => void;
}

const CouponModal: React.FC<{
    onClose: () => void;
    onSave: (coupon: Omit<Coupon, 'id'>) => Promise<void>;
    categories: Category[];
    inventory: InventoryItem[];
}> = ({ onClose, onSave, categories, inventory }) => {
    const [formData, setFormData] = useState<{
        code: string;
        description: string;
        discountType: 'percentage' | 'fixed';
        value: number;
        minOrderAmount: number;
        expiryDate: string;
        isActive: boolean;
        applicableTo: 'all' | 'category' | 'product';
        targetIds: string[];
    }>({
        code: '',
        description: '',
        discountType: 'percentage',
        value: 0,
        minOrderAmount: 0,
        expiryDate: '',
        isActive: true,
        applicableTo: 'all',
        targetIds: []
    });
    const [saving, setSaving] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'value' || name === 'minOrderAmount' ? Number(value) : value
        }));
    };

    const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentTargets = prev.targetIds;
            if (checked) {
                return { ...prev, targetIds: [...currentTargets, value] };
            } else {
                return { ...prev, targetIds: currentTargets.filter(id => id !== value) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.applicableTo !== 'all' && formData.targetIds.length === 0) {
            alert(`Please select at least one ${formData.applicableTo}.`);
            return;
        }

        setSaving(true);
        try {
            await onSave({ ...formData, code: formData.code.toUpperCase() });
            onClose();
        } catch (error) {
            console.error("Save error", error);
            alert("Failed to save coupon");
        } finally {
            setSaving(false);
        }
    };

    // Filtered inventory for search
    const filteredInventory = useMemo(() => {
        if (!productSearch) return inventory.slice(0, 50); // Limit initial view
        return inventory.filter(i =>
            i.title.toLowerCase().includes(productSearch.toLowerCase()) ||
            i.sku.toLowerCase().includes(productSearch.toLowerCase())
        ).slice(0, 50);
    }, [inventory, productSearch]);

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] mb-10 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800">Create Coupon</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                </div>

                <div className="overflow-y-auto p-6 space-y-4">
                    <form id="coupon-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Coupon Code</label>
                                <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g. SAVE10" className="mt-1 w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:ring-amber-500 uppercase font-bold" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Expiry Date</label>
                                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:ring-amber-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600">Description</label>
                            <input type="text" name="description" value={formData.description} onChange={handleChange} required placeholder="e.g. 10% off on all items" className="mt-1 w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:ring-amber-500" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Type</label>
                                <select name="discountType" value={formData.discountType} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:ring-amber-500">
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (NPR)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Value</label>
                                <input type="number" name="value" value={formData.value || ''} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:ring-amber-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600">Min Order Amount (NPR)</label>
                            <input type="number" name="minOrderAmount" value={formData.minOrderAmount || ''} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:ring-amber-500" />
                        </div>

                        {/* Targeting Section */}
                        <div className="border-t border-slate-100 pt-4 mt-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Applicable To</label>
                            <div className="flex gap-4 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="applicableTo"
                                        value="all"
                                        checked={formData.applicableTo === 'all'}
                                        onChange={() => setFormData(prev => ({ ...prev, applicableTo: 'all', targetIds: [] }))}
                                        className="text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="text-sm">All Orders</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="applicableTo"
                                        value="category"
                                        checked={formData.applicableTo === 'category'}
                                        onChange={() => setFormData(prev => ({ ...prev, applicableTo: 'category', targetIds: [] }))}
                                        className="text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="text-sm">Specific Category</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="applicableTo"
                                        value="product"
                                        checked={formData.applicableTo === 'product'}
                                        onChange={() => setFormData(prev => ({ ...prev, applicableTo: 'product', targetIds: [] }))}
                                        className="text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="text-sm">Specific Product</span>
                                </label>
                            </div>

                            {/* Specific Selectors */}
                            {formData.applicableTo === 'category' && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Select Categories</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {categories.map(cat => (
                                            <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    value={cat.name}
                                                    checked={formData.targetIds.includes(cat.name)}
                                                    onChange={handleTargetChange}
                                                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                                />
                                                <span className="text-sm">{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {formData.applicableTo === 'product' && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="mb-2">
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={productSearch}
                                            onChange={e => setProductSearch(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded text-sm"
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-1">
                                        {filteredInventory.map(item => (
                                            <label key={item.sku} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded border-b border-slate-100 last:border-0">
                                                <input
                                                    type="checkbox"
                                                    value={item.sku}
                                                    checked={formData.targetIds.includes(item.sku)}
                                                    onChange={handleTargetChange}
                                                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                                />
                                                <div className="text-sm truncate">
                                                    <span className="font-bold block text-slate-700">{item.title}</span>
                                                    <span className="text-xs text-slate-400">{item.sku}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 text-right">{formData.targetIds.length} products selected</p>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="flex justify-end pt-4 p-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <button type="submit" form="coupon-form" disabled={saving} className="bg-amber-600 text-white font-bold py-2 px-6 rounded-md hover:bg-amber-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                        {saving ? 'Saving...' : 'Create Coupon'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminCouponsPage: React.FC<AdminCouponsPageProps> = ({ navigate }) => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [data, cats, items] = await Promise.all([
                api.getCoupons(),
                api.getCategories(),
                api.getInventoryItems()
            ]);
            setCoupons(data);
            setCategories(cats);
            setInventory(items);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleAddCoupon = async (couponData: Omit<Coupon, 'id'>) => {
        await api.addCoupon(couponData);
        fetchAllData();
    };

    const handleDeleteCoupon = async (id: string) => {
        if (confirm("Are you sure you want to delete this coupon?")) {
            await api.deleteCoupon(id);
            fetchAllData();
        }
    };

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Coupon Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5" /> Create Coupon
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                        {coupons.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3">Code</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3">Applicable To</th>
                                            <th className="px-6 py-3">Value</th>
                                            <th className="px-6 py-3">Min Order</th>
                                            <th className="px-6 py-3">Expiry</th>
                                            <th className="px-6 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {coupons.map(coupon => (
                                            <tr key={coupon.id} className="bg-white hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-slate-800">{coupon.code}</td>
                                                <td className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{coupon.discountType}</td>
                                                <td className="px-6 py-4">
                                                    {coupon.applicableTo === 'all' || !coupon.applicableTo ? (
                                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">All Orders</span>
                                                    ) : coupon.applicableTo === 'category' ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-purple-600">Category:</span>
                                                            <span className="text-xs text-slate-600 truncate max-w-[150px]">{coupon.targetIds?.join(', ') || 'None'}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-amber-600">Products:</span>
                                                            <span className="text-xs text-slate-600 truncate max-w-[150px]" title={coupon.targetIds?.join(', ')}>{coupon.targetIds?.length || 0} Items</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-amber-600">
                                                    {coupon.discountType === 'percentage' ? `${coupon.value}%` : `NPR ${coupon.value}`}
                                                </td>
                                                <td className="px-6 py-4">NPR {coupon.minOrderAmount}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span>{coupon.expiryDate}</span>
                                                        <span className={`text-[10px] uppercase font-bold ${new Date(coupon.expiryDate) > new Date() ? 'text-green-600' : 'text-rose-500'}`}>
                                                            {new Date(coupon.expiryDate) > new Date() ? 'Active' : 'Expired'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-rose-500 hover:text-rose-700 bg-rose-50 p-2 rounded-md transition-colors hover:bg-rose-100" title="Delete">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-slate-500">
                                No coupons created yet.
                            </div>
                        )}
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {coupons.length > 0 ? coupons.map(coupon => (
                            <div key={coupon.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <code className="font-mono font-bold text-lg text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200">{coupon.code}</code>
                                        <p className="text-sm text-slate-500 mt-1">{coupon.description}</p>
                                    </div>
                                    <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-rose-500 hover:text-rose-700 p-1 bg-rose-50 rounded" title="Delete">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2">
                                    <div>
                                        <span className="text-xs text-slate-400 block font-bold uppercase">Value</span>
                                        <span className="font-bold text-amber-600">
                                            {coupon.discountType === 'percentage' ? `${coupon.value}%` : `NPR ${coupon.value}`}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-400 block font-bold uppercase">Expires</span>
                                        <span className={`text-sm font-medium ${new Date(coupon.expiryDate) > new Date() ? 'text-slate-700' : 'text-rose-600'}`}>
                                            {coupon.expiryDate}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2 bg-slate-50 p-2 rounded text-xs flex justify-between items-center">
                                    <span className="font-bold text-slate-500">Target:</span>
                                    <span className="text-slate-700 truncate max-w-[150px]">
                                        {coupon.applicableTo === 'category' ? `Cat: ${coupon.targetIds?.join(', ')}` :
                                            coupon.applicableTo === 'product' ? `${coupon.targetIds?.length} Products` : 'All Orders'}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-16 text-slate-500 bg-white rounded-lg border border-slate-200 shadow-sm">
                                No coupons created yet.
                            </div>
                        )}
                    </div>
                </>
            )}

            {isModalOpen && <CouponModal onClose={() => setIsModalOpen(false)} onSave={handleAddCoupon} categories={categories} inventory={inventory} />}
        </div>
    );
};

export default AdminCouponsPage;
