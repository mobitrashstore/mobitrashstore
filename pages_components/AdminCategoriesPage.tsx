
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Category } from '../types';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import Spinner from '../components/Spinner';

interface AdminCategoriesPageProps {
    navigate: (path: string) => void;
}

const CategoryModal: React.FC<{
    category: Partial<Category> | null;
    onClose: () => void;
    onSave: (category: Omit<Category, 'id'> | Category) => void;
}> = ({ category, onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: '', imageUrl: '', ...category });
    const isEditMode = !!category?.id;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Category);
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
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Category' : 'Add New Category'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Category Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Chargers" required className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
                        <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." required className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                        <button type="button" onClick={onClose} className="mr-4 px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="bg-amber-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-amber-700 shadow-md transition-colors active:scale-95">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({ navigate }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        const allCategories = await api.getCategories();
        setCategories(allCategories);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSaveCategory = async (categoryToSave: Omit<Category, 'id'> | Category) => {
        if ('id' in categoryToSave && categoryToSave.id) { // Update
            await api.updateCategory(categoryToSave.id, categoryToSave);
        } else { // Create
            await api.addCategory(categoryToSave);
        }
        await fetchCategories(); // Refresh list
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
            await api.deleteCategory(id);
            await fetchCategories();
        }
    };

    const handleOpenAddModal = () => {
        setEditingCategory({});
        setIsModalOpen(true);
    };

    if (loading) {
        return <div className="flex justify-center py-10"><Spinner /></div>;
    }

    return (
        <div className="animate-fade-in pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Manage Categories</h1>
                <button onClick={handleOpenAddModal} className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-green-700 flex items-center gap-2 shadow-md transition-all transform active:scale-95">
                    <PlusCircleIcon className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            {categories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col group shadow-sm hover:shadow-lg hover:border-amber-200 transition-all">
                            <div className="aspect-square w-full bg-slate-50 flex items-center justify-center p-6 relative">
                                <img src={cat.imageUrl} alt={cat.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" />
                            </div>
                            <div className="p-4 flex-grow flex flex-col border-t border-slate-100 bg-white">
                                <p className="font-bold text-center text-slate-800 flex-grow mb-2">{cat.name}</p>
                                <div className="flex justify-center items-center gap-2 pt-2 border-t border-slate-50">
                                    <button onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><PencilSquareIcon className="w-5 h-5" /></button>
                                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
                    <p className="text-slate-500 text-lg font-medium">No categories found.</p>
                    <p className="text-slate-400 text-sm mt-2">Add categories like 'Chargers', 'Cables', 'Speakers' to display them on the app.</p>
                    <button onClick={handleOpenAddModal} className="mt-6 text-amber-600 font-bold hover:text-amber-700 hover:underline">
                        Create your first category
                    </button>
                </div>
            )}

            {isModalOpen && (
                <CategoryModal
                    category={editingCategory}
                    onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
                    onSave={handleSaveCategory}
                />
            )}
        </div>
    );
};

export default AdminCategoriesPage;
