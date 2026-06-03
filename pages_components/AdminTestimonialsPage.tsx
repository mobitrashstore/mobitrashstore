
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Testimonial } from '../types';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import Spinner from '../components/Spinner';

interface AdminTestimonialsPageProps {
    navigate: (path: string) => void;
}

const TestimonialModal: React.FC<{
    onClose: () => void;
    onSave: (data: Omit<Testimonial, 'id'>) => Promise<void>;
}> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        quote: '',
        rating: 5,
        imageUrl: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            alert("Failed to save testimonial");
        } finally {
            setSaving(false);
        }
    };

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto" onClick={onClose}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md mb-10 overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-800">Add Testimonial</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1.5">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1.5">Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1.5">Quote</label>
                        <textarea name="quote" value={formData.quote} onChange={handleChange} required rows={3} className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1.5">Rating</label>
                        <select name="rating" value={formData.rating} onChange={handleChange} className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-amber-500 focus:border-amber-500">
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1.5">Photo URL (Optional)</label>
                        <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                        <button type="submit" disabled={saving} className="bg-amber-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-slate-300 disabled:cursor-wait shadow-md">
                            {saving ? 'Saving...' : 'Add Testimonial'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminTestimonialsPage: React.FC<AdminTestimonialsPageProps> = ({ navigate }) => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const data = await api.getTestimonials();
            setTestimonials(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleAddTestimonial = async (data: Omit<Testimonial, 'id'>) => {
        await api.addTestimonial(data);
        fetchTestimonials();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this testimonial?")) {
            await api.deleteTestimonial(id);
            fetchTestimonials();
        }
    };

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Testimonials Manager</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-green-700 flex items-center gap-2 shadow-md transition-all transform active:scale-95"
                >
                    <PlusCircleIcon className="w-5 h-5" /> Add Testimonial
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.length > 0 ? testimonials.map(testimonial => (
                        <div key={testimonial.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative group hover:border-amber-200">
                            <button onClick={() => handleDelete(testimonial.id)} className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-rose-50 rounded-full border border-rose-100">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-4 mb-4">
                                {testimonial.imageUrl ? (
                                    <img src={testimonial.imageUrl} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-slate-800">{testimonial.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{testimonial.location}</p>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm italic mb-4 leading-relaxed">"{testimonial.quote}"</p>
                            <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-3">
                                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 font-bold">{testimonial.rating} Stars</span>
                                <span className="text-slate-400">{testimonial.date}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-slate-500">No testimonials found.</p>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && <TestimonialModal onClose={() => setIsModalOpen(false)} onSave={handleAddTestimonial} />}
        </div>
    );
};

export default AdminTestimonialsPage;
