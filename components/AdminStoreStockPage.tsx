
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(url);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                    <h2 className="text-lg font-bold text-slate-800">Shop Banner ({shopLocation})</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Banner Image URL</label>
                        <input 
                            type="text" 
                            value={url} 
                            onChange={(e) => setUrl(e.target.value)} 
                            placeholder="https://..." 
                            className="mt-1 w-full p-2 border border-slate-300 bg-white text-slate-800 rounded-md focus:ring-amber-500 focus:border-amber-500" 
                        />
                        <p className="text-xs text-slate-500 mt-1">Recommended size: 1200x300px</p>
                    </div>
                    {url && (
                        <div className="mt-2">
                            <p className="text-xs font-bold text-slate-500 mb-1">Preview:</p>
                            <img src={url} alt="Preview" className="w-full h-24 object-cover rounded border border-slate-200" />
                        </div>
                    )}
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button type="submit" className="bg-amber-600 text-white font-bold py-2 px-6 rounded-md hover:bg-amber-700 shadow-sm transition-colors">Save Banner</button>
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const dataToSave = {
            ...formData,
            purchasePrice: Number(formData.purchasePrice) || 0,
            sellingPrice: Number(formData.sellingPrice) || 0,
            quantity: Number(formData.quantity) || 0,
        };
        try {
            await onSave(dataToSave as StoreStockItem);
        } catch (error) {
            console.error("Save failed", error);
            setIsSaving(false); // Only reset if failed, successful save usually closes modal
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            {/* Modal Container: Flex Col to ensure header/footer stay put, middle scrolls */}
            <div 
                className="bg-white border border-slate-200 rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Stock Item' : 'Add New Stock Item'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                
                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                    <form id="stock-form" onSubmit={handleSubmit} className="space-y-4">
                        
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
                            <BuildingStorefrontIcon className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700">Adding to: {formData.shopLocation}</span>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-600">Item Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., USB-C Fast Charger" required className="mt-1 w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-600">Category</label>
                            <select id="category" name="category" value={formData.category} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:ring-amber-500 focus:border-amber-500">
                                {STORE_STOCK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        {/* Enhanced Image Uploader */}
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Item Image</label>
                             <ImageUploader 
                                imageUrl={formData.imageUrl}
                                onImageChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                                onClear={() => setFormData(prev => ({...prev, imageUrl: ''}))}
                                allowFullSize={true} // Enable full frame images
                             />
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="purchasePrice" className="block text-sm font-medium text-slate-600">Purchase Price (NPR)</label>
                                <input type="number" id="purchasePrice" name="purchasePrice" value={formData.purchasePrice} onChange={handleNumericChange} placeholder="e.g., 1500" required className="mt-1 w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                            </div>
                            <div>
                                <label htmlFor="sellingPrice" className="block text-sm font-medium text-slate-600">Selling Price (NPR)</label>
                                <input type="number" id="sellingPrice" name="sellingPrice" value={formData.sellingPrice} onChange={handleNumericChange} placeholder="e.g., 2000" required className="mt-1 w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-slate-600">Initial Quantity</label>
                            <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleNumericChange} placeholder="e.g., 50" required className="mt-1 w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                    </form>
                </div>
                
                {/* Fixed Footer */}
                <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <button type="button" onClick={onClose} className="mr-4 px-4 py-2 text-slate-500 hover:text-slate-700 font-medium hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                    <button 
                        type="submit" 
                        form="stock-form" 
                        disabled={isSaving}
                        className="bg-amber-600 text-white font-bold py-2 px-6 rounded-md hover:bg-amber-700 shadow-sm transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSaving ? <Spinner size="w-4 h-4" /> : null}
                        <span className={isSaving ? "ml-2" : ""}>{isSaving ? 'Saving...' : 'Save Item'}</span>
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
                } catch(e) {
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
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Store Stock</h1>
                    <p className="text-sm text-slate-500">Manage inventory for: <span className={`font-bold ${headerColorClass}`}>{shopLocation}</span></p>
                </div>
            </div>
            
            {/* Banner Section */}
            {bannerUrl && (
                <div className="w-full h-48 rounded-xl overflow-hidden mb-6 shadow-md relative group border border-slate-200">
                    <img src={bannerUrl} alt="Shop Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button 
                            onClick={() => setIsBannerModalOpen(true)}
                            className="bg-white text-gray-800 font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2"
                        >
                            <PhotoIcon className="w-5 h-5" /> Change Banner
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile-Optimized Grid for Actions */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 mb-6">
                 {/* QR Scan Button */}
                 <button 
                    onClick={() => setIsScannerOpen(true)} 
                    className="bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 flex flex-col md:flex-row items-center justify-center gap-2 shadow-md transition-colors"
                    title="Scan Product QR/Barcode to Add"
                >
                    <QrCodeIcon className="w-5 h-5"/> 
                    <span className="text-xs md:text-sm">Scan to Add</span>
                </button>

                {/* Download PDF Button */}
                <button 
                    onClick={handleDownloadPDF} 
                    className="bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-700 flex flex-col md:flex-row items-center justify-center gap-2 shadow-md transition-colors"
                >
                    <ArrowDownTrayIcon className="w-5 h-5"/> 
                    <span className="text-xs md:text-sm">Report PDF</span>
                </button>

                <button 
                    onClick={() => { setEditingItem({ shopLocation: shopLocation }); setIsModalOpen(true); }} 
                    className={`${btnColorClass} text-white font-bold py-2.5 px-4 rounded-lg flex flex-col md:flex-row items-center justify-center gap-2 shadow-md transition-colors`}
                >
                    <PlusCircleIcon className="w-5 h-5"/> 
                    <span className="text-xs md:text-sm">Add Item</span>
                </button>
                
                {!bannerUrl && (
                    <button 
                        onClick={() => setIsBannerModalOpen(true)} 
                        className="bg-slate-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-slate-700 flex flex-col md:flex-row items-center justify-center gap-2 shadow-md transition-colors"
                    >
                        <PhotoIcon className="w-5 h-5"/> 
                        <span className="text-xs md:text-sm">Set Banner</span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input type="text" placeholder={`Search in ${shopLocation}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-300 bg-white rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="w-full p-2 border border-slate-300 bg-white rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <option value="All">All Categories</option>
                        {STORE_STOCK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>
            
             <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <span className="text-slate-500 font-medium">Total Stock Value ({shopLocation}): </span>
                <span className={`font-bold text-2xl ${headerColorClass}`}>NPR {totalStockValue.toLocaleString()}</span>
            </div>

            {loading ? <div className="text-center py-8"><Spinner /></div> : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden w-full max-w-full">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-2.5 lg:px-3 py-3">Image</th>
                                        <th className="px-2.5 lg:px-3 py-3">Name</th>
                                        <th className="px-2.5 lg:px-3 py-3">Category</th>
                                        <th className="px-2.5 lg:px-3 py-3">Purchase Price</th>
                                        <th className="px-2.5 lg:px-3 py-3">Selling Price</th>
                                        <th className="px-2.5 lg:px-3 py-3">Quantity</th>
                                        <th className="px-2.5 lg:px-3 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="bg-white hover:bg-slate-50 transition-colors">
                                            <td className="px-2.5 lg:px-3 py-2">
                                                <img src={item.imageUrl || 'https://placehold.co/100x100/e2e8f0/94a3b8?text=No+Img'} alt={item.name} className="w-12 h-12 object-contain rounded-md border border-slate-200 bg-slate-50"/>
                                            </td>
                                            <td className="px-2.5 lg:px-3 py-3 font-medium text-slate-800">{item.name}</td>
                                            <td className="px-2.5 lg:px-3 py-3">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold border border-slate-200">{item.category}</span>
                                            </td>
                                            <td className="px-2.5 lg:px-3 py-3">NPR {item.purchasePrice.toLocaleString()}</td>
                                            <td className="px-2.5 lg:px-3 py-3 text-amber-600 font-semibold">NPR {item.sellingPrice.toLocaleString()}</td>
                                            <td className="px-2.5 lg:px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleQuantityChange(item.id, -1)} className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold w-6 h-6 flex items-center justify-center border border-slate-200">-</button>
                                                    <span className="w-8 text-center font-bold text-slate-800">{item.quantity}</span>
                                                    <button onClick={() => handleQuantityChange(item.id, 1)} className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold w-6 h-6 flex items-center justify-center border border-slate-200">+</button>
                                                </div>
                                            </td>
                                            <td className="px-2.5 lg:px-3 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><PencilSquareIcon className="w-5 h-5"/></button>
                                                    <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {filteredItems.map(item => (
                            <div key={item.id} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-3">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex items-start gap-3">
                                        <img src={item.imageUrl || 'https://placehold.co/100x100/e2e8f0/94a3b8?text=No+Img'} alt={item.name} className="w-16 h-16 object-contain rounded-md bg-slate-50 border border-slate-200 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-bold text-slate-800">{item.name}</h3>
                                            <p className="text-xs text-slate-500">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col flex-shrink-0 gap-1">
                                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><PencilSquareIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-slate-100 pt-2">
                                    <div><p className="text-slate-500 text-xs">Buy Price</p><p className="font-medium text-slate-600">NPR {item.purchasePrice.toLocaleString()}</p></div>
                                    <div><p className="text-slate-500 text-xs">Sell Price</p><p className="font-medium text-amber-600">NPR {item.sellingPrice.toLocaleString()}</p></div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                     <span className="text-sm font-medium text-slate-500">Stock: <span className="font-bold text-lg text-slate-800">{item.quantity}</span></span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleQuantityChange(item.id, -1)} className="px-3 py-1 text-lg rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border border-slate-200">-</button>
                                        <button onClick={() => handleQuantityChange(item.id, 1)} className="px-3 py-1 text-lg rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border border-slate-200">+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredItems.length === 0 && <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">No items found in {shopLocation}.</div>}
                </>
            )}
            {isModalOpen && <StockModal item={editingItem} activeShop={shopLocation} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} onSave={handleSaveItem} />}
            
            {isBannerModalOpen && <BannerModal currentUrl={bannerUrl} shopLocation={shopLocation} onClose={() => setIsBannerModalOpen(false)} onSave={handleSaveBanner} />}

            {/* QR Scanner Modal */}
            {isScannerOpen && <QrScannerModal onClose={() => setIsScannerOpen(false)} onScan={handleQrScan} />}
        </div>
    );
    
};

export default AdminStoreStockPage;
