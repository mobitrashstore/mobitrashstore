
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { AboutPageConfig } from '../types';
import Spinner from '../components/Spinner';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from '../components/icons/SparklesIcon';

interface AdminAboutPageProps {
    navigate: (path: string) => void;
}

const AdminAboutPage: React.FC<AdminAboutPageProps> = ({ navigate }) => {
    const [formData, setFormData] = useState<AboutPageConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await api.getAboutPageData();
                setFormData(data);
            } catch (error) {
                console.error("Failed to fetch about data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (section: keyof AboutPageConfig, field: string, value: string) => {
        if (!formData) return;
        if (section === 'story') {
            setFormData(prev => prev ? { ...prev, story: value } : null);
        } else {
            setFormData(prev => prev ? { ...prev, [section]: { ...(prev[section] as any), [field]: value } } : null);
        }
    };

    const handleGenerateStory = async () => {
        if (!formData) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Write a compelling, professional, and SEO-friendly 'About Us' story for "Mobi Store", a venture of "Mobi Store Tech" based in Nepal.
            
            Key Points to Include:
            - Founded by ${formData.leadership.founder}.
            - Mission: Solving the problem of e-waste and unorganized second-hand mobile market in Nepal.
            - Values: Trust, Instant Valuation, Data Security, and Sustainability.
            - Location: ${formData.headquarters.location}.
            
            Format: Use HTML tags (<p>, <strong>, <br>) for formatting. Do NOT use Markdown. Keep it engaging and under 400 words.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });

            const storyText = response.text;
            if (storyText) {
                // Strip potential Markdown code blocks if AI includes them
                const cleanedStory = storyText.replace(/```html/g, '').replace(/```/g, '').trim();
                setFormData(prev => prev ? { ...prev, story: cleanedStory } : null);
            }
        } catch (error) {
            console.error("AI Gen Failed", error);
            alert("Failed to generate story. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        setSaving(true);
        try {
            await api.updateAboutPageData(formData);
            alert("About page updated successfully!");
        } catch (error) {
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;
    if (!formData) return <div>Error loading data</div>;

    return (
        <div className="animate-fade-in pb-10">
            <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm mb-6">Manage About Page</h1>

            <form onSubmit={handleSave} className="space-y-8 max-w-5xl">

                {/* Leadership Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Leadership</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Founder & CEO</label>
                            <input type="text" value={formData.leadership.founder} onChange={(e) => handleChange('leadership', 'founder', e.target.value)} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Developed By</label>
                            <input type="text" value={formData.leadership.developedBy} onChange={(e) => handleChange('leadership', 'developedBy', e.target.value)} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Established Date</label>
                            <input type="text" value={formData.leadership.established} onChange={(e) => handleChange('leadership', 'established', e.target.value)} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                    </div>
                </div>

                {/* Headquarters Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Headquarters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Parent Company</label>
                            <input type="text" value={formData.headquarters.parentCompany} onChange={(e) => handleChange('headquarters', 'parentCompany', e.target.value)} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Location</label>
                            <input type="text" value={formData.headquarters.location} onChange={(e) => handleChange('headquarters', 'location', e.target.value)} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Industry</label>
                            <input type="text" value={formData.headquarters.industry} onChange={(e) => handleChange('headquarters', 'industry', e.target.value)} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                    </div>
                </div>

                {/* Story Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-bold text-slate-800">Our Story</h2>
                        <button
                            type="button"
                            onClick={handleGenerateStory}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 transition-colors text-sm disabled:opacity-50"
                        >
                            {isGenerating ? <Spinner size="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                        </button>
                    </div>
                    <textarea
                        value={formData.story}
                        onChange={(e) => handleChange('story', '', e.target.value)}
                        rows={12}
                        className="w-full p-4 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500 leading-relaxed font-mono text-sm"
                        placeholder="Enter the company story here (HTML supported)..."
                    />
                </div>

                {/* Contact Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Contact Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Phone 1</label>
                            <input type="text" value={formData.contact.phone1} onChange={(e) => handleChange('contact', 'phone1', e.target.value)} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Phone 2</label>
                            <input type="text" value={formData.contact.phone2} onChange={(e) => handleChange('contact', 'phone2', e.target.value)} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Address</label>
                            <input type="text" value={formData.contact.address} onChange={(e) => handleChange('contact', 'address', e.target.value)} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-amber-600 text-white font-bold py-3 px-10 rounded-xl hover:bg-amber-700 shadow-lg transition-all transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAboutPage;
