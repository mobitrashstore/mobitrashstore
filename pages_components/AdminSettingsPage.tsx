
import React, { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';
import { DarazConfig, PaymentPartner, PathaoConfig } from '../types';
import Spinner from '../components/Spinner';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { ArrowDownTrayIcon } from '../components/icons/ArrowDownTrayIcon';
import { TruckIcon } from '../components/icons/TruckIcon';
import { GlobeAltIcon } from '../components/icons/GlobeAltIcon';

interface AdminSettingsPageProps {
    navigate: (path: string) => void;
}

// Client-side image compression helper
const compressImage = (file: File, maxWidth = 200, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

const ShopLogoUploader: React.FC<{
    title: string,
    logoUrl: string,
    setLogoUrl: (url: string) => void,
    onSave: () => void,
    isSaving: boolean,
    isProcessing: boolean,
    setIsProcessing: (is: boolean) => void,
    colorClass: string
}> = ({ title, logoUrl, setLogoUrl, onSave, isSaving, isProcessing, setIsProcessing, colorClass }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsProcessing(true);
        try {
            const compressed = await compressImage(file);
            setLogoUrl(compressed);
        } catch(e) {
            alert('Failed to process image.');
        } finally {
            setIsProcessing(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div>
            <h3 className={`text-lg font-bold ${colorClass} mb-3`}>{title}</h3>
            <div className="space-y-3">
                <div className="w-full aspect-video bg-slate-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 p-2 overflow-hidden">
                    {isProcessing ? <Spinner/> : logoUrl ? <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain rounded"/> : <span className="text-slate-400 text-sm font-medium">No Logo Uploaded</span>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-sm text-slate-600 bg-white border border-slate-300 py-2.5 rounded-lg hover:bg-slate-50 font-bold shadow-sm">
                    Upload Image
                </button>
                <button 
                    type="button" 
                    onClick={onSave}
                    disabled={isSaving}
                    className={`w-full font-bold py-2.5 px-4 rounded-lg text-white transition-colors disabled:bg-slate-300 disabled:cursor-wait shadow-md ${colorClass.replace('text-', 'bg-').replace('-500', '-600')} hover:opacity-90`}
                >
                    {isSaving ? 'Saving...' : 'Save Logo'}
                </button>
            </div>
        </div>
    );
};

const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ navigate }) => {
    const [loading, setLoading] = useState(true);
    const [darazConfig, setDarazConfig] = useState<DarazConfig>({ enabled: true, shopUrl: '', logoUrl: '' });
    const [pathaoConfig, setPathaoConfig] = useState<PathaoConfig>({ clientId: '', clientSecret: '', username: '', password: '', isEnabled: false });
    const [partners, setPartners] = useState<PaymentPartner[]>([]);
    const [newPartner, setNewPartner] = useState({ name: '', logoUrl: '' });
    const [isAddingPartner, setIsAddingPartner] = useState(false);
    const [isSavingDaraz, setIsSavingDaraz] = useState(false);
    const [isSavingPathao, setIsSavingPathao] = useState(false);
    const [townplanningLogo, setTownplanningLogo] = useState('');
    const [nayabazarLogo, setNayabazarLogo] = useState('');
    const [isSavingTP, setIsSavingTP] = useState(false);
    const [isSavingNB, setIsSavingNB] = useState(false);
    const [isProcessingTP, setIsProcessingTP] = useState(false);
    const [isProcessingNB, setIsProcessingNB] = useState(false);
    
    const [isGeneratingReport, setIsGeneratingReport] = useState<string | null>(null);
    
    // NEW: Sitemap Generation State
    const [isGeneratingSitemap, setIsGeneratingSitemap] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [darazData, pathaoData, partnersData, tpSettings, nbSettings] = await Promise.all([
                    api.getDarazConfig(),
                    api.getPathaoConfig(),
                    api.getPaymentPartners(),
                    api.getShopSetting('Townplanning'),
                    api.getShopSetting('Nayabazar')
                ]);
                setDarazConfig(darazData);
                setPathaoConfig(pathaoData);
                setPartners(partnersData);
                setTownplanningLogo(tpSettings?.logoUrl || '');
                setNayabazarLogo(nbSettings?.logoUrl || '');
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handlers
    const handleDarazChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setDarazConfig(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleSaveDaraz = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingDaraz(true);
        try { await api.updateDarazConfig(darazConfig); alert('Daraz settings updated successfully!'); } 
        catch (error) { alert("Failed to save."); } 
        finally { setIsSavingDaraz(false); }
    };

    const handlePathaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setPathaoConfig(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSavePathao = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingPathao(true);
        try { await api.updatePathaoConfig(pathaoConfig); alert('Pathao settings updated successfully!'); }
        catch (error) { alert("Failed to save Pathao settings."); }
        finally { setIsSavingPathao(false); }
    }

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPartner.name || !newPartner.logoUrl) return;
        setIsAddingPartner(true);
        try {
            await api.addPaymentPartner(newPartner);
            setNewPartner({ name: '', logoUrl: '' });
            setPartners(await api.getPaymentPartners());
        } catch (error) { console.error(error); } 
        finally { setIsAddingPartner(false); }
    };
    const handleDeletePartner = async (id: string) => {
        if (confirm("Delete this payment partner?")) {
            await api.deletePaymentPartner(id);
            setPartners(await api.getPaymentPartners());
        }
    };
    const handleSaveLogo = async (loc: 'Townplanning' | 'Nayabazar') => {
        const isTP = loc === 'Townplanning';
        const setter = isTP ? setIsSavingTP : setIsSavingNB;
        setter(true);
        try { await api.updateShopSetting(loc, { logoUrl: isTP ? townplanningLogo : nayabazarLogo }); alert(`${loc} logo updated!`); }
        catch (e) { alert(`Failed to save ${loc} logo.`); }
        finally { setter(false); }
    };

    const handleDownloadReport = async (location: string) => {
        setIsGeneratingReport(location);
        try {
            const allItems = await api.getStoreStockItems();
            const itemsToPrint = allItems.filter(i => {
                let loc = i.shopLocation as string | undefined;
                if (!loc || loc === 'Shop 1') loc = 'Townplanning';
                if (loc === 'Shop 2') loc = 'Nayabazar';
                return loc === location;
            });

            if (itemsToPrint.length === 0) {
                alert(`No stock items found for ${location}.`);
                setIsGeneratingReport(null);
                return;
            }

            const totalValue = itemsToPrint.reduce((acc, item) => acc + (item.purchasePrice * item.quantity), 0);
            const totalSellValue = itemsToPrint.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert("Please allow popups to download the PDF.");
                setIsGeneratingReport(null);
                return;
            }

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Stock Report - ${location}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; -webkit-print-color-adjust: exact; }
                        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                        .logo { font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
                        .meta { text-align: right; font-size: 10px; color: #64748b; }
                        h1 { font-size: 16px; margin-bottom: 15px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; }
                        table { width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed; }
                        th { background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; padding: 8px 4px; text-align: left; font-weight: 800; color: #334155; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                        td { border-bottom: 1px solid #e2e8f0; padding: 6px 4px; color: #334155; vertical-align: middle; }
                        tr:nth-child(even) { background-color: #f8fafc; }
                        .col-sn { width: 6%; text-align: center; font-weight: bold; color: #64748b; }
                        .col-name { width: 34%; word-break: break-word; font-weight: 600; color: #0f172a; }
                        .col-cat { width: 12%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                        .col-price { width: 14%; text-align: right; white-space: nowrap; font-family: monospace; }
                        .col-qty { width: 8%; text-align: center; font-weight: bold; }
                        .col-total { width: 14%; text-align: right; white-space: nowrap; font-weight: 700; font-family: monospace; }
                        .summary { margin-top: 20px; display: flex; justify-content: flex-end; page-break-inside: avoid; }
                        .summary-box { background: #f1f5f9; padding: 15px; border-radius: 6px; width: 250px; border: 1px solid #cbd5e1; }
                        .summary-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px; }
                        .summary-row.total { border-top: 1px solid #94a3b8; margin-top: 8px; padding-top: 8px; font-weight: 800; font-size: 13px; color: #0f172a; }
                        @media print {
                            @page { margin: 10mm; size: A4 portrait; }
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">Mobi Store</div>
                        <div class="meta">
                            <div><strong>LOC:</strong> ${location}</div>
                            <div><strong>DATE:</strong> ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                    <h1>Stock Report</h1>
                    <table>
                        <thead>
                            <tr>
                                <th class="col-sn">S.N.</th>
                                <th class="col-name">Item Name</th>
                                <th class="col-cat">Category</th>
                                <th class="col-price">Buy</th>
                                <th class="col-price">Sell</th>
                                <th class="col-qty">Qty</th>
                                <th class="col-total">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsToPrint.map((item, index) => `
                                <tr>
                                    <td class="col-sn">${index + 1}</td>
                                    <td class="col-name">${item.name}</td>
                                    <td class="col-cat">${item.category}</td>
                                    <td class="col-price">NPR ${item.purchasePrice.toLocaleString()}</td>
                                    <td class="col-price">NPR ${item.sellingPrice.toLocaleString()}</td>
                                    <td class="col-qty">${item.quantity}</td>
                                    <td class="col-total">NPR ${(item.purchasePrice * item.quantity).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="summary">
                        <div class="summary-box">
                            <div class="summary-row">
                                <span>Items:</span>
                                <span>${itemsToPrint.length}</span>
                            </div>
                            <div class="summary-row">
                                <span>Total Qty:</span>
                                <span>${itemsToPrint.reduce((sum, i) => sum + i.quantity, 0)}</span>
                            </div>
                            <div class="summary-row total">
                                <span>Stock Value:</span>
                                <span>NPR ${totalValue.toLocaleString()}</span>
                            </div>
                            <div class="summary-row" style="color: #64748b; font-size: 9px; margin-top: 2px;">
                                (Est. Revenue: NPR ${totalSellValue.toLocaleString()})
                            </div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { setTimeout(function(){ window.print(); }, 500); }
                    </script>
                </body>
                </html>
            `;
            printWindow.document.write(html);
            printWindow.document.close();
        } catch (error) {
            console.error(error);
            alert("Failed to generate report.");
        } finally {
            setIsGeneratingReport(null);
        }
    };
    
    // --- POWERFUL SITEMAP GENERATOR LOGIC ---
    const handleGenerateSitemap = async () => {
        const confirmMsg = "Do you want to generate a new sitemap.xml? This will fetch the latest products, categories, and blogs from the database. \n\nIMPORTANT: Since this is a client-side app, you must DOWNLOAD the generated file and manually upload it to your hosting 'public' folder or server root.";
        
        if (!confirm(confirmMsg)) return;
        
        setIsGeneratingSitemap(true);
        try {
            // FORCE FRESH DATA: Clear cache before fetching to ensure ALL items are retrieved
            localStorage.removeItem('mt_cache_inventory_items');
            localStorage.removeItem('mt_cache_blog_posts');
            localStorage.removeItem('mt_cache_categories');

            // 1. Fetch ALL dynamic content
            const [products, blogs, categories] = await Promise.all([
                api.getInventoryItems(),
                api.getBlogPosts(),
                api.getCategories()
            ]);
            
            const baseUrl = 'https://mobitrashstore.com';
            // Correct ISO Date format for Google (YYYY-MM-DD)
            const today = new Date().toISOString().split('T')[0];
            
            // Helper to generate slug (MATCHES FRONTEND LOGIC)
            const slugify = (text: string) => {
              return text
                .toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
            };
            
            // 2. Static Pages Definition (High Priority)
            const staticPages = [
                { path: '/', priority: '1.0' },
                { path: '/buy', priority: '0.9' },
                { path: '/sell', priority: '0.9' },
                { path: '/repair', priority: '0.9' },
                
                { path: '/track', priority: '0.8' },
                { path: '/compare', priority: '0.8' },
                { path: '/emi-calculator', priority: '0.8' },
                { path: '/request-product', priority: '0.8' },
                { path: '/categories', priority: '0.8' },
                
                { path: '/blog', priority: '0.7' },
                { path: '/gallery', priority: '0.7' },
                { path: '/spin-win', priority: '0.7' },
                { path: '/redeem-points', priority: '0.7' },
                { path: '/coupons', priority: '0.7' },
                
                { path: '/about', priority: '0.6' },
                { path: '/contact', priority: '0.6' },
                { path: '/trust', priority: '0.6' },
                { path: '/faq', priority: '0.6' },
                { path: '/report-problem', priority: '0.5' },
                
                { path: '/profile', priority: '0.5' },
                { path: '/login', priority: '0.5' },
                { path: '/signup', priority: '0.5' },
                { path: '/wishlist', priority: '0.5' },
                { path: '/order-history', priority: '0.5' },
                { path: '/address', priority: '0.5' },
                
                { path: '/terms', priority: '0.4' },
                { path: '/privacy', priority: '0.4' },
                { path: '/return-policy', priority: '0.4' },
                { path: '/data-deletion', priority: '0.4' },
                { path: '/cookies', priority: '0.4' },
                { path: '/sitemap', priority: '0.4' },
                { path: '/country', priority: '0.3' },
                { path: '/language', priority: '0.3' }
            ];
            
            // 3. Build XML String
            let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
            
            // Add Static Pages
            xml += `  <!-- Core Pages -->\n`;
            staticPages.forEach(p => {
                xml += `  <url>\n    <loc>${baseUrl}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p.priority}</priority>\n  </url>\n`;
            });
            
            // Add Category Pages
            xml += `\n  <!-- Category Pages -->\n`;
            categories.forEach(c => {
                 xml += `  <url>\n    <loc>${baseUrl}/buy?category=${encodeURIComponent(c.name)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
            });
            
            // Add Dynamic Products
             xml += `\n  <!-- Product Pages -->\n`;
            products.forEach(p => {
                 const slug = slugify(p.title);
                 xml += `  <url>\n    <loc>${baseUrl}/buy/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
            });
            
            // Add Dynamic Blogs
            xml += `\n  <!-- Blog Posts -->\n`;
            blogs.forEach(b => {
                 xml += `  <url>\n    <loc>${baseUrl}/blog/${b.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
            });
            
            xml += `</urlset>`;
            
            // 4. Trigger Download
            const blob = new Blob([xml], { type: 'text/xml' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sitemap.xml';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            alert(`SUCCESS! sitemap.xml generated with ${staticPages.length + categories.length + products.length + blogs.length} URLs.\n\nPlease upload this file to the 'public' folder of your project deployment.`);

        } catch (error) {
            console.error("Sitemap generation error:", error);
            alert("Failed to generate sitemap.");
        } finally {
            setIsGeneratingSitemap(false);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Store Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. SEO & Reports Section (Consolidated) */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                        Reports & SEO Tools
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        {/* Sitemap Generator */}
                         <button 
                            onClick={handleGenerateSitemap}
                            disabled={isGeneratingSitemap}
                            className="bg-slate-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingSitemap ? <Spinner size="w-5 h-5"/> : <GlobeAltIcon className="w-5 h-5 text-green-400"/>}
                            Generate Full Sitemap.xml
                        </button>
                        
                        {/* Stock Reports */}
                        <button 
                            onClick={() => handleDownloadReport('Townplanning')}
                            disabled={!!isGeneratingReport}
                            className="bg-amber-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingReport === 'Townplanning' ? <Spinner size="w-5 h-5"/> : <ArrowDownTrayIcon className="w-5 h-5"/>}
                            Stock Report (Townplanning)
                        </button>
                        <button 
                            onClick={() => handleDownloadReport('Nayabazar')}
                            disabled={!!isGeneratingReport}
                            className="bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                             {isGeneratingReport === 'Nayabazar' ? <Spinner size="w-5 h-5"/> : <ArrowDownTrayIcon className="w-5 h-5"/>}
                            Stock Report (Nayabazar)
                        </button>
                    </div>
                </div>

                {/* 2. Pathao Integration */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                        <TruckIcon className="w-6 h-6 text-red-600"/> Pathao Logistics
                    </h2>
                    <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded">
                        Note: Pathao API calls are made from the browser. You may need to enable CORS bypass or use a backend proxy for production.
                    </p>
                    <form onSubmit={handleSavePathao} className="space-y-5">
                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <input 
                                type="checkbox" 
                                id="pathaoEnabled" 
                                name="isEnabled" 
                                checked={pathaoConfig.isEnabled} 
                                onChange={handlePathaoChange} 
                                className="h-5 w-5 text-red-600 focus:ring-red-500 rounded border-slate-300"
                            />
                            <label htmlFor="pathaoEnabled" className="font-bold text-slate-700 cursor-pointer">Enable Pathao Shipping</label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Client ID</label>
                            <input type="text" name="clientId" value={pathaoConfig.clientId} onChange={handlePathaoChange} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-red-500 focus:border-red-500" placeholder="Pathao Client ID" />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Client Secret</label>
                            <input type="password" name="clientSecret" value={pathaoConfig.clientSecret} onChange={handlePathaoChange} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-red-500 focus:border-red-500" placeholder="Pathao Client Secret" />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Username (Email)</label>
                            <input type="text" name="username" value={pathaoConfig.username} onChange={handlePathaoChange} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-red-500 focus:border-red-500" placeholder="Pathao Username" />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Password</label>
                            <input type="password" name="password" value={pathaoConfig.password} onChange={handlePathaoChange} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-red-500 focus:border-red-500" placeholder="Pathao Password" />
                        </div>

                        <button type="submit" disabled={isSavingPathao} className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-700 transition-colors disabled:bg-slate-300 shadow-md">
                            {isSavingPathao ? 'Saving...' : 'Save Credentials'}
                        </button>
                    </form>
                </div>

                {/* 3. Daraz Configuration */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Daraz Integration</h2>
                    <form onSubmit={handleSaveDaraz} className="space-y-5">
                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <input 
                                type="checkbox" 
                                id="enabled" 
                                name="enabled" 
                                checked={darazConfig.enabled} 
                                onChange={handleDarazChange} 
                                className="h-5 w-5 text-amber-600 focus:ring-amber-500 rounded border-slate-300"
                            />
                            <label htmlFor="enabled" className="font-bold text-slate-700 cursor-pointer">Enable Daraz Links & Banners</label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Daraz Shop URL</label>
                            <input type="text" name="shopUrl" value={darazConfig.shopUrl} onChange={handleDarazChange} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" placeholder="https://..." />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Daraz Logo URL</label>
                            <div className="flex gap-4 items-center">
                                <input type="text" name="logoUrl" value={darazConfig.logoUrl} onChange={handleDarazChange} className="flex-grow p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" placeholder="https://..." />
                                {darazConfig.logoUrl && <img src={darazConfig.logoUrl} alt="Preview" className="h-12 w-12 object-contain border border-slate-200 rounded-lg bg-white p-1" />}
                            </div>
                        </div>

                        <button type="submit" disabled={isSavingDaraz} className="w-full bg-amber-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-amber-700 transition-colors disabled:bg-slate-300 shadow-md">
                            {isSavingDaraz ? 'Saving...' : 'Save Settings'}
                        </button>
                    </form>
                </div>

                {/* 4. Payment Partners */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Payment Partners</h2>
                    <div className="space-y-3 mb-6">
                        {partners.map(partner => (
                            <div key={partner.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <img src={partner.logoUrl} alt={partner.name} className="w-12 h-8 object-contain bg-white rounded border border-slate-200" />
                                    <span className="font-bold text-slate-700">{partner.name}</span>
                                </div>
                                <button onClick={() => handleDeletePartner(partner.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        ))}
                        {partners.length === 0 && <p className="text-slate-400 text-center text-sm py-4 italic">No partners added.</p>}
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Add New Partner</h3>
                        <form onSubmit={handleAddPartner} className="space-y-3">
                            <input type="text" placeholder="Partner Name" value={newPartner.name} onChange={e => setNewPartner(prev => ({...prev, name: e.target.value}))} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" required />
                            <div className="flex gap-2">
                                <input type="text" placeholder="Logo URL" value={newPartner.logoUrl} onChange={e => setNewPartner(prev => ({...prev, logoUrl: e.target.value}))} className="flex-grow p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" required />
                                {newPartner.logoUrl && <img src={newPartner.logoUrl} alt="Preview" className="h-11 w-11 object-contain border border-slate-200 rounded-lg bg-white p-1" />}
                            </div>
                            <button type="submit" disabled={isAddingPartner} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors disabled:bg-slate-300 flex items-center justify-center gap-2 shadow-md">
                                {isAddingPartner ? <Spinner size="w-5 h-5" /> : <><PlusCircleIcon className="w-5 h-5"/> Add Partner</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* 5. Shop Logos */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Shop Logos (For Receipts & Stock)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <ShopLogoUploader title="Townplanning Logo" logoUrl={townplanningLogo} setLogoUrl={setTownplanningLogo} onSave={() => handleSaveLogo('Townplanning')} isSaving={isSavingTP} isProcessing={isProcessingTP} setIsProcessing={setIsProcessingTP} colorClass="text-amber-600" />
                        <ShopLogoUploader title="Nayabazar Logo" logoUrl={nayabazarLogo} setLogoUrl={setNayabazarLogo} onSave={() => handleSaveLogo('Nayabazar')} isSaving={isSavingNB} isProcessing={isProcessingNB} setIsProcessing={setIsProcessingNB} colorClass="text-purple-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
