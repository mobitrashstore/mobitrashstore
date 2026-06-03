


import React, { useState, useEffect } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { InformationCircleIcon } from '../components/icons/InformationCircleIcon';
import { MapPinIcon } from '../components/icons/MapPinIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { BuildingStorefrontIcon } from '../components/icons/BuildingStorefrontIcon';
import * as api from '../services/api';
import { AboutPageConfig } from '../types';
import Spinner from '../components/Spinner';
import VisualEditWrapper from '../components/VisualEditWrapper';
import { useVisualEditing } from '../context/VisualEditingContext';
import EditableText from '../components/EditableText';

export interface AboutPageProps {
    navigate: (path: string) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
    const [data, setData] = useState<AboutPageConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = await api.getAboutPageData();
                setData(config);
            } catch (error) {
                console.error("Failed to load about page", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    if (!data) return <div>Failed to load content</div>;

    return (
        <div className="bg-gray-50">
            <MobileSkyHeader title="About Us" Icon={InformationCircleIcon} hasSpacer={false} />
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-20 pb-6 md:py-16"> {/* Changed to w-full */}
                <VisualEditWrapper
                    label="About Page Data"
                    config={data}
                    onSave={async (newData) => {
                        if (!data) return;
                        await api.updateAboutPageData(newData);
                        setData(newData);
                    }}
                >
                    <article className="prose max-w-4xl mx-auto bg-white p-5 md:p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in"> {/* Re-introduced max-w-4xl mx-auto */}
                        <div className="text-center mb-6">
                            <img src="https://ik.imagekit.io/Btmobilecare/logo.png?updatedAt=1765729150142" alt="Mobi Store Logo" className="h-16 mx-auto mb-3 object-contain" />
                            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-1">Mobi Store</h1>
                            <p className="text-sm md:text-lg text-amber-600 font-semibold uppercase tracking-wide">
                                A Venture of <EditableText
                                    value={data.headquarters.parentCompany}
                                    onSave={async (val) => {
                                        const newData = { ...data, headquarters: { ...data.headquarters, parentCompany: val } };
                                        await api.updateAboutPageData(newData);
                                        setData(newData);
                                    }}
                                    tag="span"
                                />
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h3 className="flex items-center gap-2 text-blue-800 font-bold text-base md:text-lg mb-2">
                                    <UserCircleIcon className="w-5 h-5" /> Leadership
                                </h3>
                                <ul className="space-y-1 text-blue-900/80 text-sm">
                                    <li className="flex gap-1"><strong>Founder & CEO:</strong> <EditableText value={data.leadership.founder} onSave={async (val) => { const newData = { ...data, leadership: { ...data.leadership, founder: val } }; await api.updateAboutPageData(newData); setData(newData); }} tag="span" /></li>
                                    <li className="flex gap-1"><strong>Developed By:</strong> <EditableText value={data.leadership.developedBy} onSave={async (val) => { const newData = { ...data, leadership: { ...data.leadership, developedBy: val } }; await api.updateAboutPageData(newData); setData(newData); }} tag="span" /></li>
                                    <li className="flex gap-1"><strong>Established:</strong> <EditableText value={data.leadership.established} onSave={async (val) => { const newData = { ...data, leadership: { ...data.leadership, established: val } }; await api.updateAboutPageData(newData); setData(newData); }} tag="span" /></li>
                                </ul>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <h3 className="flex items-center gap-2 text-amber-800 font-bold text-base md:text-lg mb-2">
                                    <BuildingStorefrontIcon className="w-5 h-5" /> Headquarters
                                </h3>
                                <ul className="space-y-1 text-amber-900/80 text-sm">
                                    <li className="flex gap-1"><strong>Parent Company:</strong> <EditableText value={data.headquarters.parentCompany} onSave={async (val) => { const newData = { ...data, headquarters: { ...data.headquarters, parentCompany: val } }; await api.updateAboutPageData(newData); setData(newData); }} tag="span" /></li>
                                    <li className="flex gap-1"><strong>Location:</strong> <EditableText value={data.headquarters.location} onSave={async (val) => { const newData = { ...data, headquarters: { ...data.headquarters, location: val } }; await api.updateAboutPageData(newData); setData(newData); }} tag="span" /></li>
                                    <li className="flex gap-1"><strong>Industry:</strong> <EditableText value={data.headquarters.industry} onSave={async (val) => { const newData = { ...data, headquarters: { ...data.headquarters, industry: val } }; await api.updateAboutPageData(newData); setData(newData); }} tag="span" /></li>
                                </ul>
                            </div>
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Our Story</h2>
                        <div className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                            <EditableText
                                value={data.story}
                                onSave={async (val) => {
                                    const newData = { ...data, story: val };
                                    await api.updateAboutPageData(newData);
                                    setData(newData);
                                }}
                                multiline={true}
                                htmlMode={true}
                            />
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Why We Exist</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-8 text-sm md:text-base">
                            <li>To provide a transparent, instant valuation for used smartphones using real-time market data.</li>
                            <li>To ensure 100% data security for sellers through certified data wiping.</li>
                            <li>To reduce electronic waste (e-waste) in Kathmandu by professionally refurbishing and recycling old devices.</li>
                            <li>To create a safe environment for buying certified pre-owned phones with warranties.</li>
                        </ul>

                        {/* White Theme Contact Section */}
                        <div className="bg-white border-2 border-slate-100 p-6 md:p-8 rounded-2xl mt-6 shadow-sm">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Contact Our Team</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">For Business & Support</p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-50 rounded-full text-amber-600">
                                                <PhoneIcon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-slate-700 text-sm">{data.contact.phone1}</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-50 rounded-full text-amber-600">
                                                <PhoneIcon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-slate-700 text-sm">{data.contact.phone2}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Visit Us</p>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-amber-50 rounded-full text-amber-600 mt-1">
                                            <MapPinIcon className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-slate-700 leading-relaxed text-sm">{data.contact.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-[10px] text-gray-400 mt-6">
                            &copy; {new Date().getFullYear()} Mobi Store. A Venture of {data.headquarters.parentCompany}. All Rights Reserved.
                        </p>
                    </article>
                </VisualEditWrapper>
            </div>
        </div>
    );
};

export default AboutPage;
