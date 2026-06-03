

import React, { useState } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { ShoppingBagIcon } from '../components/icons/ShoppingBagIcon';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import * as api from '../services/api';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';

interface RequestProductPageProps {
    navigate: (path: string) => void;
}

const RequestProductPage: React.FC<RequestProductPageProps> = ({ navigate }) => {
    const { user } = useAuth();
    const { addNotification } = useNotification();

    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            addNotification("Please log in to request a product.", "error");
            navigate('/login');
            return;
        }

        if (!productName || !budget || !phone) {
            addNotification("Please fill in all required fields.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.addProductRequest({
                userId: user.id,
                userName: user.name,
                userPhone: phone,
                productName,
                description,
                budget: Number(budget),
            });
            setIsSuccess(true);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Request failed", error);
            addNotification("Failed to submit request. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <MobileSkyHeader title="Request Received" Icon={ShoppingBagIcon} hasSpacer={false} />
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center pt-20">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircleIcon className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
                    <p className="text-gray-600 mb-8 max-w-xs">
                        We've received your request for <strong>{productName}</strong>. Our team will check availability and contact you at <strong>{phone}</strong> shortly.
                    </p>
                    <div className="flex gap-4 w-full max-w-sm">
                        <button
                            onClick={() => { setIsSuccess(false); setProductName(''); setDescription(''); setBudget(''); }}
                            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-100"
                        >
                            Request Another
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 shadow-md"
                        >
                            Back to Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <MobileSkyHeader title="Request Product" Icon={ShoppingBagIcon} hasSpacer={false} />

            <div className="w-full max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-44 md:pt-24">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Can't find what you need?</h1>
                    <p className="text-gray-500 text-sm mt-1">Tell us what you're looking for, and we'll bring it for you.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-5">

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Product Name <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-800 font-medium"
                            placeholder="e.g. iPhone 13 Mini Green"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Details / Specs</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-800 text-sm"
                            placeholder="Any specific color, storage size, or condition (e.g. 128GB, Brand New)..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Budget (NPR) <span className="text-rose-500">*</span></label>
                        <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-800 font-bold"
                            placeholder="e.g. 50000"
                            required
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number <span className="text-rose-500">*</span></label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-800 font-medium"
                            placeholder="98XXXXXXXX"
                            required
                        />
                        <p className="text-xs text-slate-400 mt-1">We will call you to confirm availability.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait mt-4"
                    >
                        {isSubmitting ? 'Submitting...' : 'Send Request'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default RequestProductPage;
