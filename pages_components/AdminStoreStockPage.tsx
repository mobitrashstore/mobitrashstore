import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as api from '../services/api';
import { StoreStockItem } from '../types';
import { STORE_STOCK_CATEGORIES } from '../constants';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import Spinner from '../components/Spinner';
import { QrCodeIcon } from '../components/icons/QrCodeIcon';
import QrScannerModal from '../components/QrScannerModal';
import { BuildingStorefrontIcon } from '../components/icons/BuildingStorefrontIcon';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { ImageUploader } from '../components/ImageUploader';
import { ArrowDownTrayIcon } from '../components/icons/ArrowDownTrayIcon';


type ShopLocation = 'Townplanning' | 'Nayabazar';

const BannerModal: React.FC<{
    currentUrl: string;
    shopLocation: string;
    onClose: () => void;
    onSave: (url: string) => void;
}> = ({ currentUrl, shopLocation, onClose, onSave }) => {
    const [url, setUrl] = useState(currentUrl);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16 overflow-y-auto custom-scrollbar">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 my-4 sm:my-8 text-slate-800">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Shop Banner</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(url); }} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Banner Image URL</label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste image link here..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        {url && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                <img src={url} alt="Preview" className="w-full h-32 object-cover" />
                            </div>
                        )}
                        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg text-sm">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StockModal: React.FC<{
    item: Partial<StoreStockItem> | null;
    activeShop: ShopLocation;
    onClose: () => void;
    onSave: (item: Omit<StoreStockItem, 'id'> | StoreStockItem) => Promise<void>;
}> = ({ item, activeShop, onClose, onSave }) => {
    const isEditMode = !!item?.id;
    const [formData, setFormData] = useState({
        name: item?.name || '',
        category: item?.category || STORE_STOCK_CATEGORIES[0],
        purchasePrice: isEditMode ? item?.purchasePrice ?? '' : (item?.purchasePrice ?? ''),
        sellingPrice: isEditMode ? item?.sellingPrice ?? '' : (item?.sellingPrice ?? ''),
        quantity: isEditMode ? item?.quantity ?? '' : (item?.quantity ?? 1),
        imageUrl: item?.imageUrl || '',
        shopLocation: item?.shopLocation || activeShop,
        ...item
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({
                ...formData,
                purchasePrice: Number(formData.purchasePrice) || 0,
                sellingPrice: Number(formData.sellingPrice) || 0,
                quantity: Number(formData.quantity) || 0,
            } as StoreStockItem);
        } catch (error) { setIsSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16 overflow-y-auto custom-scrollbar">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh] my-4 sm:my-8">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${activeShop === 'Townplanning' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
                            <BuildingStorefrontIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">{isEditMode ? 'Edit Stock Item' : 'Add New Item'}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{activeShop}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">
                    <form id="stock-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Name & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Type-C Charging Cable" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                                    {STORE_STOCK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Initial Quantity</label>
                                <input type="number" name="quantity" value={formData.quantity} onChange={handleNumericChange} placeholder="0" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Purchase Price (NPR)</label>
                                <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleNumericChange} placeholder="0.00" required className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selling Price (NPR)</label>
                                <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleNumericChange} placeholder="0.00" required className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono text-blue-600 font-bold" />
                            </div>
                        </div>

                        {/* Image */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Image</label>
                            <div className="max-w-[180px]">
                                <ImageUploader
                                    imageUrl={formData.imageUrl}
                                    onImageChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                                    onClear={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                    allowFullSize={true}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
                    <button
                        type="submit"
                        form="stock-form"
                        disabled={isSaving}
                        className={`px-8 py-2.5 text-white font-bold text-sm rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center gap-2 ${activeShop === 'Townplanning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                        {isSaving ? <Spinner size="w-4 h-4" /> : null}
                        {isSaving ? 'Saving...' : 'Save Item'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface AdminStoreStockPageProps {
    navigate: (path: string) => void;
    shopLocation: ShopLocation;
}

const AdminStoreStockPage: React.FC<AdminStoreStockPageProps> = ({ navigate, shopLocation }) => {
    const [stockItems, setStockItems] = useState<StoreStockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<StoreStockItem> | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Banner State
    const [bannerUrl, setBannerUrl] = useState('');
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

    const fetchStock = async () => {
        setLoading(true);
        try {
            const [items, banner] = await Promise.all([
                api.getStoreStockItems(),
                api.getShopBanner(shopLocation)
            ]);
            setStockItems(items);
            setBannerUrl(banner);
        } catch (error) {
            console.error("Failed to fetch stock data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStock();
    }, [shopLocation]); // Refetch when shop location changes

    const handleSaveItem = async (itemToSave: Omit<StoreStockItem, 'id'> | StoreStockItem) => {
        const itemWithShop = { ...itemToSave, shopLocation: shopLocation };

        try {
            if ('id' in itemWithShop && itemWithShop.id) {
                await api.updateStoreStockItem(itemWithShop.id, itemWithShop);
            } else {
                await api.addStoreStockItem(itemWithShop);
            }
            await fetchStock();
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (e) {
            console.error(e);
            throw e; // Modal will handle error display
        }
    };

    const handleSaveBanner = async (url: string) => {
        await api.updateShopBanner(shopLocation, url);
        setBannerUrl(url);
        setIsBannerModalOpen(false);
    }

    const handleDeleteItem = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}" from ${shopLocation}? This cannot be undone.`)) {
            await api.deleteStoreStockItem(id);
            await fetchStock();
        }
    };

    const handleQuantityChange = async (id: string, change: number) => {
        const item = stockItems.find(i => i.id === id);
        if (!item) return;

        const newQuantity = Math.max(0, item.quantity + change);

        // Determine if it's a sale (decrease in quantity)
        if (change < 0 && newQuantity < item.quantity) {
            // Record as Offline Sale
            const saleQty = Math.abs(change);
            await api.addOfflineSale({
                itemId: id,
                itemName: item.name,
                quantity: saleQty,
                pricePerUnit: item.sellingPrice,
                total: saleQty * item.sellingPrice,
                date: new Date().toISOString(),
                category: item.category,
                shopLocation: shopLocation // Record which shop sold it
            });
        }

        await api.updateStoreStockItem(id, { quantity: newQuantity });
        setStockItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQuantity } : i));
    };

    // --- QR Scan Handler ---
    const handleQrScan = async (data: string) => {
        setIsScannerOpen(false);

        // Try to find item in the MAIN inventory (online store) first using the scan data as SKU
        try {
            const inventoryItem = await api.getInventoryItemBySku(data);

            if (inventoryItem) {
                // Found in inventory! Auto-fill details
                setEditingItem({
                    name: inventoryItem.title,
                    category: inventoryItem.category,
                    sellingPrice: inventoryItem.price,
                    purchasePrice: 0, // Can't determine from public inventory
                    quantity: 1,
                    imageUrl: inventoryItem.media[0] || '',
                    shopLocation: shopLocation
                });
                alert(`Product Found: ${inventoryItem.title}. Details auto-filled for ${shopLocation}.`);
            } else {
                // Not found, just set name as the code for manual entry
                setEditingItem({
                    name: data, // Pre-fill scanned code as name or leave blank
                    quantity: 1,
                    shopLocation: shopLocation
                });
                // Optional: Check if data is valid JSON (custom QR)
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.name || parsed.title) {
                        setEditingItem({
                            name: parsed.name || parsed.title,
                            category: parsed.category,
                            sellingPrice: parsed.price,
                            quantity: 1,
                            shopLocation: shopLocation
                        });
                    }
                } catch (e) {
                    // Not JSON, treat as raw SKU
                }
                if (!inventoryItem) {
                    alert(`Code "${data}" scanned. Product not found in online inventory. Please fill details manually for ${shopLocation}.`);
                }
            }
        } catch (error) {
            console.error("Scan lookup error", error);
            setEditingItem({ name: data, quantity: 1, shopLocation: shopLocation });
        }

        setIsModalOpen(true);
    };

    const filteredItems = useMemo(() => {
        return stockItems.filter(item => {
            // Normalize legacy data
            let itemLoc = item.shopLocation as string | undefined;
            if (!itemLoc || itemLoc === 'Shop 1') itemLoc = 'Townplanning';
            if (itemLoc === 'Shop 2') itemLoc = 'Nayabazar';

            const shopMatch = itemLoc === shopLocation;
            const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
            const searchMatch = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return shopMatch && categoryMatch && searchMatch;
        });
    }, [stockItems, shopLocation, activeCategory, searchQuery]);

    const totalStockValue = useMemo(() => {
        return filteredItems.reduce((acc, item) => acc + (item.purchasePrice * item.quantity), 0);
    }, [filteredItems]);

    const headerColorClass = shopLocation === 'Townplanning' ? 'text-amber-600' : 'text-purple-600';
    const btnColorClass = shopLocation === 'Townplanning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700';

    const handleDownloadPDF = () => {
        const itemsToPrint = stockItems.filter(item => {
            let itemLoc = item.shopLocation as string | undefined;
            if (!itemLoc || itemLoc === 'Shop 1') itemLoc = 'Townplanning';
            if (itemLoc === 'Shop 2') itemLoc = 'Nayabazar';
            return itemLoc === shopLocation;
        });

        if (itemsToPrint.length === 0) {
            alert("No stock items found for this location.");
            return;
        }

        const totalValue = itemsToPrint.reduce((acc, item) => acc + (item.purchasePrice * item.quantity), 0);
        const totalSellValue = itemsToPrint.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Please allow popups to download the PDF.");
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Stock Report - ${shopLocation}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
                    .logo { font-size: 24px; font-weight: 900; color: #0f172a; }
                    .meta { text-align: right; }
                    .meta div { margin-bottom: 4px; font-size: 14px; color: #64748b; }
                    h1 { font-size: 20px; margin-bottom: 20px; color: #334155; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    th { background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; }
                    td { border-bottom: 1px solid #e2e8f0; padding: 12px; color: #334155; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: 700; }
                    .summary { margin-top: 30px; display: flex; justify-content: flex-end; }
                    .summary-box { background: #f8fafc; padding: 20px; border-radius: 8px; width: 300px; }
                    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                    .summary-row.total { border-top: 2px solid #cbd5e1; margin-top: 12px; padding-top: 12px; font-weight: 800; font-size: 16px; }
                    @media print {
                        @page { margin: 20px; }
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">Mobi Store</div>
                    <div class="meta">
                        <div><strong>Location:</strong> ${shopLocation}</div>
                        <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
                        <div><strong>Items:</strong> ${itemsToPrint.length}</div>
                    </div>
                </div>
                
                <h1>Inventory Stock Report (Full List)</h1>
                
                <table>
                    <thead>
                        <tr>
                            <th>S.N.</th>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th class="text-right">Buy Price</th>
                            <th class="text-right">Sell Price</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Total Value (Buy)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsToPrint.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${item.name}</td>
                                <td>${item.category}</td>
                                <td class="text-right">NPR ${item.purchasePrice.toLocaleString()}</td>
                                <td class="text-right">NPR ${item.sellingPrice.toLocaleString()}</td>
                                <td class="text-right font-bold">${item.quantity}</td>
                                <td class="text-right">NPR ${(item.purchasePrice * item.quantity).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="summary">
                    <div class="summary-box">
                        <div class="summary-row">
                            <span>Total Items:</span>
                            <span>${itemsToPrint.length}</span>
                        </div>
                        <div class="summary-row">
                            <span>Total Quantity:</span>
                            <span>${itemsToPrint.reduce((sum, i) => sum + i.quantity, 0)}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total Stock Value:</span>
                            <span>NPR ${totalValue.toLocaleString()}</span>
                        </div>
                        <div class="summary-row" style="color: #64748b; font-size: 12px; margin-top: 4px;">
                            (Potential Revenue: NPR ${totalSellValue.toLocaleString()})
                        </div>
                    </div>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="pb-20 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Store Inventory</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${shopLocation === 'Townplanning' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                            {shopLocation}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Stock Management Portal</span>
                    </div>
                </div>
                
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-4 py-2 border-r border-slate-100 text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Value</p>
                        <p className={`text-lg font-bold ${headerColorClass} mt-1 leading-none`}>NPR {totalStockValue.toLocaleString()}</p>
                    </div>
                    <div className="px-4 py-2 text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Item Count</p>
                        <p className="text-lg font-bold text-slate-700 mt-1 leading-none">{filteredItems.length}</p>
                    </div>
                </div>
            </div>

            {/* Banner Section */}
            {bannerUrl && (
                <div className="relative group overflow-hidden rounded-2xl border border-slate-200 shadow-sm aspect-[4/1] md:aspect-[6/1] bg-slate-100">
                    <img src={bannerUrl} alt="Store Banner" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-60 pointer-events-none" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setIsBannerModalOpen(true)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-xl text-slate-700 hover:bg-white transition-colors">
                            <PencilSquareIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Actions & Filters Toolbelt */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-2 flex flex-col lg:flex-row gap-2">
                <div className="flex flex-wrap gap-2 flex-grow">
                    <div className="relative flex-grow min-w-[200px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder={`Search in ${shopLocation}...`} 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        />
                    </div>
                    <select 
                        value={activeCategory} 
                        onChange={e => setActiveCategory(e.target.value)} 
                        className="p-2 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-slate-600"
                    >
                        <option value="All">All Categories</option>
                        {STORE_STOCK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                <div className="flex gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-2 lg:pt-0 lg:pl-2">
                    <button onClick={() => setIsScannerOpen(true)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Scan QR">
                        <QrCodeIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleDownloadPDF} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors" title="Export PDF">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setEditingItem({ shopLocation: shopLocation }); setIsModalOpen(true); }} className={`flex items-center gap-2 px-6 py-2.5 text-white font-bold text-sm rounded-xl shadow-lg transition-all active:scale-[0.98] ${btnColorClass}`}>
                        <PlusCircleIcon className="w-4 h-4" />
                        Add New Item
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Spinner size="w-8 h-8" />
                    <p className="mt-4 text-sm text-slate-500 font-medium">Syncing inventory data...</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Info</th>
                                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing</th>
                                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory</th>
                                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredItems.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-contain" /> : <BuildingStorefrontIcon className="w-5 h-5 text-slate-300" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors uppercase">{item.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Selling For</p>
                                            <p className="text-sm font-bold text-slate-800">NPR {item.sellingPrice?.toLocaleString()}</p>
                                            <p className="text-[10px] font-medium text-slate-400 mt-1">Cost: NPR {item.purchasePrice?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                                    <button onClick={() => handleQuantityChange(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-white rounded-md transition-all font-bold">-</button>
                                                    <span className="w-10 text-center text-sm font-black text-slate-800">{item.quantity}</span>
                                                    <button onClick={() => handleQuantityChange(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-orange-600 hover:bg-white rounded-md transition-all font-bold">+</button>
                                                </div>
                                                {item.quantity <= 5 && (
                                                    <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded uppercase leading-none">Low</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Item">
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete Item">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View - Polished Interface */}
                    <div className="md:hidden space-y-4">
                        {filteredItems.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                                        {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-contain p-1" /> : <BuildingStorefrontIcon className="w-6 h-6 text-slate-300" />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm leading-tight uppercase">{item.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.category}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><PencilSquareIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg text-rose-500"><TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Selling Price</p>
                                        <p className="text-sm font-bold text-blue-600">NPR {item.sellingPrice?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Stock</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-black text-slate-800">{item.quantity}</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleQuantityChange(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold active:scale-90 transition-transform">-</button>
                                                <button onClick={() => handleQuantityChange(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold active:scale-90 transition-transform">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
                            <BuildingStorefrontIcon className="w-12 h-12 text-slate-100 mx-auto" />
                            <p className="mt-4 text-slate-400 font-medium">No items found in {shopLocation}</p>
                        </div>
                    )}
                </>
            )}

            {isModalOpen && <StockModal item={editingItem} activeShop={shopLocation} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} onSave={handleSaveItem} />}
            {isBannerModalOpen && <BannerModal currentUrl={bannerUrl} shopLocation={shopLocation} onClose={() => setIsBannerModalOpen(false)} onSave={handleSaveBanner} />}
            {isScannerOpen && <QrScannerModal onClose={() => setIsScannerOpen(false)} onScan={handleQrScan} />}
        </div>
    );
};

export default AdminStoreStockPage;
