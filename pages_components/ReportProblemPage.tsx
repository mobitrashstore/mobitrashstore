import React, { useState } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { ExclamationTriangleIcon } from '../components/icons/ExclamationTriangleIcon';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

interface ReportProblemPageProps {
    navigate: (path: string) => void;
}

const ReportProblemPage: React.FC<ReportProblemPageProps> = ({ navigate }) => {
    const { addNotification } = useNotification();
    const { user } = useAuth();
    const [type, setType] = useState('Bug/Error');
    const [description, setDescription] = useState('');
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                addNotification('Please upload a valid image file.', 'error');
                return;
            }

            // Compress image using canvas
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        setScreenshot(dataUrl);
                    }
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) {
            addNotification("Please describe the problem.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.addProblemReport({
                type,
                description,
                screenshotUrl: screenshot || undefined,
                userEmail: user?.email
            });
            setSubmitted(true);
            // Fix: Scroll root element to top instead of window
            document.getElementById('root')?.scrollTo({ top: 0, behavior: 'auto' });
        } catch (error) {
            console.error("Failed to submit report", error);
            addNotification("Failed to submit report. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Disabled spacer and adjusted padding to remove gap */}
            <MobileSkyHeader title="Report a Problem" Icon={ExclamationTriangleIcon} hasSpacer={false} />

            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-44 md:pt-16">
                {submitted ? (
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">👍</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanks for your feedback!</h2>
                        <p className="text-gray-600 mb-8">We have received your report and will look into it shortly. Your input helps us improve Mobi Store.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-amber-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-amber-700 transition-colors shadow-md"
                        >
                            Back to Home
                        </button>
                    </div>
                ) : (
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200 animate-fade-in">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-extrabold text-gray-900 hidden md:block mb-2">Report a Problem</h1>
                            <p className="text-gray-600">Found a bug or facing an issue? Let us know and we'll fix it.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">What type of problem is it?</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 bg-white"
                                >
                                    <option value="Bug/Error">Bug or Error on Website & App</option>
                                    <option value="Order Issue">Issue with an Order</option>
                                    <option value="Payment Failed">Payment Failed</option>
                                    <option value="Login Issue">Login/Account Issue</option>
                                    <option value="Feature Request">Feature Request</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Describe the problem</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="Please explain what happened and how we can reproduce it..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Screenshot (Optional)</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden">
                                        {screenshot ? (
                                            <>
                                                <img src={screenshot} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setScreenshot(null); }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-sm z-10"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-gray-500">SVG, PNG, JPG (MAX. 1 Image)</p>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-amber-600 text-white font-bold py-4 rounded-lg hover:bg-amber-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-wait text-lg"
                            >
                                {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportProblemPage;
