
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Brand } from '../types';
import { BRANDS_DATA } from '../constants';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import Spinner from '../components/Spinner';

interface AdminBrandsPageProps {
    navigate: (path: string) => void;
}

const BrandModal: React.FC<{
    brand: Partial<Brand> | null;
    onClose: () => void;
    onSave: (brand: Omit<Brand, 'id'> | Brand) => void;
}> = ({ brand, onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: '', logo: '', ...brand });
    // Treat static IDs as 'new' mode visually, but we handle logic in parent
    const isEditMode = !!brand?.id && !String(brand.id).startsWith('static-');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Brand);
    };

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-2 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-slate-800">{brand?.id ? 'Edit Brand' : 'Add New Brand'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Brand Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Apple" required className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Logo URL</label>
                        <input type="text" name="logo" value={formData.logo} onChange={handleChange} placeholder="https://..." required className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                        <button type="button" onClick={onClose} className="mr-4 px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="bg-amber-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-amber-700 shadow-md transition-colors active:scale-95">Save Brand</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminBrandsPage: React.FC<AdminBrandsPageProps> = ({ navigate }) => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Partial<Brand> | null>(null);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const dbBrands = await api.getBrands();

            // Merge Logic: Default Brands + Database Overrides
            const brandMap = new Map<string, Brand>();

            // 1. Load Defaults
            BRANDS_DATA.forEach(b => {
                brandMap.set(b.name.toLowerCase(), {
                    id: `static-${b.name}`,
                    name: b.name,
                    logo: b.logo
                });
            });

            // 2. Overwrite with DB brands (if name matches)
            dbBrands.forEach(b => {
                brandMap.set(b.name.toLowerCase(), b);
            });

            setBrands(Array.from(brandMap.values()));
        } catch (error) {
            console.error("Error fetching brands", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleSaveBrand = async (brandToSave: Omit<Brand, 'id'> | Brand) => {
        // Logic: If saving a static brand, we treat it as creating a NEW DB entry that overrides the static one.
        if ('id' in brandToSave && brandToSave.id && String(brandToSave.id).startsWith('static-')) {
            const { id, ...rest } = brandToSave;
            // Create new entry in DB
            await api.addBrand(rest);
        }
        else if ('id' in brandToSave && brandToSave.id) {
            // Normal Update for existing DB brand
            await api.updateBrand(brandToSave.id, brandToSave);
        } else {
            // Create New
            await api.addBrand(brandToSave);
        }
        await fetchBrands();
        setIsModalOpen(false);
        setEditingBrand(null);
    };

    const handleDeleteBrand = async (id: string, name: string) => {
        if (id.startsWith('static-')) {
            alert(`"${name}" is a default system brand and cannot be deleted completely. You can edit it to change its details.`);
            return;
        }

        if (window.confirm(`Are you sure you want to delete the brand "${name}"?`)) {
            await api.deleteBrand(id);
            await fetchBrands();
        }
    };

    const handleOpenAddModal = () => {
        setEditingBrand({});
        setIsModalOpen(true);
    };

    if (loading) {
        return <div className="flex justify-center py-10"><Spinner /></div>;
    }

    return (
        <div className="animate-fade-in pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Manage Brands</h1>
                <button onClick={handleOpenAddModal} className="bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-orange-700 flex items-center gap-2 shadow-md transition-all transform active:scale-95">
                    <PlusCircleIcon className="w-5 h-5" />
                    Add Brand
                </button>
            </div>

            {brands.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {brands.map(brand => (
                        <div key={brand.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col group shadow-sm hover:shadow-lg hover:border-amber-200 transition-all relative">
                            {String(brand.id).startsWith('static-') && (
                                <div className="absolute top-2 right-2 z-10">
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">Default</span>
                                </div>
                            )}
                            <div className="aspect-video w-full bg-white flex items-center justify-center p-4 relative">
                                <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110 filter group-hover:brightness-110" />
                            </div>
                            <div className="p-3 flex-grow flex flex-col border-t border-slate-100 bg-slate-50/50">
                                <p className="font-bold text-center text-slate-800 flex-grow mb-2">{brand.name}</p>
                                <div className="flex justify-center items-center gap-2 pt-2 border-t border-slate-200/50">
                                    <button onClick={() => { setEditingBrand(brand); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit"><PencilSquareIcon className="w-5 h-5" /></button>
                                    <button
                                        onClick={() => handleDeleteBrand(brand.id, brand.name)}
                                        className={`p-1.5 rounded-lg transition-colors ${String(brand.id).startsWith('static-') ? 'text-slate-400 cursor-not-allowed' : 'text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100'}`}
                                        title={String(brand.id).startsWith('static-') ? "Cannot delete default brand" : "Delete"}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
                    <p className="text-slate-500 text-lg font-medium">No brands found.</p>
                    <button onClick={handleOpenAddModal} className="mt-6 text-amber-600 font-bold hover:text-amber-700 hover:underline">
                        Create your first brand
                    </button>
                </div>
            )}

            {isModalOpen && (
                <BrandModal
                    brand={editingBrand}
                    onClose={() => { setIsModalOpen(false); setEditingBrand(null); }}
                    onSave={handleSaveBrand}
                />
            )}
        </div>
    );
};

export default AdminBrandsPage;
