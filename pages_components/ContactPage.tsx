

import React, { useState } from 'react';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import { MapPinIcon } from '../components/icons/MapPinIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { WhatsAppIcon } from '../components/icons/WhatsAppIcon';
import { FacebookIcon } from '../components/icons/FacebookIcon';
import { TikTokIcon } from '../components/icons/TikTokIcon';
import { InstagramIcon } from '../components/icons/InstagramIcon';
import * as api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import MobileSkyHeader from '../components/MobileSkyHeader';
import EditableText from '../components/EditableText';
import VisualEditWrapper from '../components/VisualEditWrapper';
import { AboutPageConfig } from '../types';

export interface ContactPageProps {
    navigate: (path: string) => void;
}

const ContactInfoItem: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-6 h-6 text-amber-500">{icon}</div>
        <div className="text-gray-700">{children}</div>
    </div>
);


const ContactPage: React.FC<ContactPageProps> = () => {
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<AboutPageConfig | null>(null);
    const { addNotification } = useNotification();

    React.useEffect(() => {
        api.getAboutPageData().then(setConfig);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.addContactMessage(formState);
            setSubmitted(true);
            addNotification("Your message has been sent!", "success");
        } catch (error) {
            console.error("Failed to send message:", error);
            addNotification("Failed to send message. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-16 md:py-8 bg-gray-50 min-h-screen">
            {/* Disabled default spacer to remove the gap */}
            <MobileSkyHeader title="Contact Us" Icon={PhoneIcon} hasSpacer={false} />

            {/* Tucked content closer to header with pt-44 (increased from 20) */}
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-44 md:pt-0">
                <div className="text-center mb-8 hidden md:block">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Get in Touch</h1>
                    <p className="mt-2 text-base text-gray-600 mx-auto">
                        Have questions? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                        <VisualEditWrapper
                            label="Contact Info"
                            config={config}
                            onSave={async (newConfig: AboutPageConfig) => {
                                await api.updateAboutPageData(newConfig);
                                setConfig(newConfig);
                            }}
                        >
                            <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-2">Contact Information</h2>
                            <div className="space-y-5">
                                <ContactInfoItem icon={<MapPinIcon />}>
                                    <div className="hover:text-amber-500 font-medium">
                                        {config ? (
                                            <EditableText
                                                value={config.contact.address}
                                                onSave={async (val) => {
                                                    const newData = { ...config, contact: { ...config.contact, address: val } };
                                                    await api.updateAboutPageData(newData);
                                                    setConfig(newData);
                                                }}
                                            />
                                        ) : "Loading..."}
                                    </div>
                                </ContactInfoItem>
                                <ContactInfoItem icon={<PhoneIcon />}>
                                    <div className="flex flex-col gap-1 font-medium">
                                        {config ? (
                                            <>
                                                <EditableText
                                                    value={config.contact.phone1}
                                                    onSave={async (val) => {
                                                        const newData = { ...config, contact: { ...config.contact, phone1: val } };
                                                        await api.updateAboutPageData(newData);
                                                        setConfig(newData);
                                                    }}
                                                />
                                                <EditableText
                                                    value={config.contact.phone2}
                                                    onSave={async (val) => {
                                                        const newData = { ...config, contact: { ...config.contact, phone2: val } };
                                                        await api.updateAboutPageData(newData);
                                                        setConfig(newData);
                                                    }}
                                                />
                                            </>
                                        ) : "Loading..."}
                                    </div>
                                </ContactInfoItem>
                                <ContactInfoItem icon={<WhatsAppIcon />}>
                                    <a href="https://wa.me/+9779812141777" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 font-medium">
                                        Chat with us on WhatsApp
                                    </a>
                                </ContactInfoItem>
                                <ContactInfoItem icon={<EnvelopeIcon />}>
                                    <div className="hover:text-amber-500 font-medium break-all">
                                        {config ? (
                                            <EditableText
                                                value={config.contact.email || "Support@mobitrashstore.com"}
                                                onSave={async (val) => {
                                                    const newData = { ...config, contact: { ...config.contact, email: val } };
                                                    await api.updateAboutPageData(newData);
                                                    setConfig(newData);
                                                }}
                                            />
                                        ) : "Loading..."}
                                    </div>
                                </ContactInfoItem>
                                <ContactInfoItem icon={<ClockIcon />}>
                                    <div className="font-medium">
                                        {config ? (
                                            <EditableText
                                                value={config.contact.hours || "Sun - Fri, 10:00 AM - 6:00 PM"}
                                                onSave={async (val) => {
                                                    const newData = { ...config, contact: { ...config.contact, hours: val } };
                                                    await api.updateAboutPageData(newData);
                                                    setConfig(newData);
                                                }}
                                            />
                                        ) : "Loading..."}
                                    </div>
                                </ContactInfoItem>
                            </div>
                        </VisualEditWrapper>
                        <div className="mt-6 border-t border-gray-200 pt-5">
                            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Follow Us</h3>
                            <div className="flex gap-4">
                                <a href="https://www.facebook.com/share/17SwmmmU6f/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:scale-110 transition-transform"><FacebookIcon className="h-8 w-8" /></a>
                                <a href="https://www.tiktok.com/@mobistoreapp?_r=1&_t=ZS-91M9tAbNqqK" target="_blank" rel="noopener noreferrer" className="text-black hover:scale-110 transition-transform"><TikTokIcon className="h-8 w-8" /></a>
                                <a href="https://www.instagram.com/btmobile_care/?igsh=MXJpNWw0ejR2M3RhMA%3D%3D#" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:scale-110 transition-transform"><InstagramIcon className="h-8 w-8" /></a>
                            </div>
                        </div>
                    </div>
                    <div>
                        {submitted ? (
                            <div className="bg-amber-50 text-amber-800 p-8 rounded-2xl text-center h-full flex flex-col justify-center shadow-inner border border-amber-100">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🎉</div>
                                <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                                <p>Your message has been sent. We'll get back to you shortly.</p>
                                <button onClick={() => setSubmitted(false)} className="mt-6 text-sm font-bold underline hover:text-amber-900">Send another message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Send a Message</h2>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                    <input type="text" id="name" value={formState.name} onChange={handleChange} required className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                                    <input type="email" id="email" value={formState.email} onChange={handleChange} required className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                                    <textarea id="message" rows={4} value={formState.message} onChange={handleChange} required className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="How can we help you?" />
                                </div>
                                <div className="pt-2">
                                    <button type="submit" disabled={loading} className="w-full bg-amber-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-amber-700 transition-all transform active:scale-95 disabled:bg-gray-400 disabled:cursor-wait shadow-lg shadow-amber-500/30">
                                        {loading ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Branch Maps */}
                <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
                            Mobi Store Tech - Townplanning
                        </h3>
                        <div className="rounded-xl shadow-inner overflow-hidden bg-gray-100 h-64 border border-gray-200">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.4196159204434!2d85.2803892!3d27.673422899999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb180e80af61fb%3A0xc74b2980e71bff91!2sBt%20Mobile%20Care%20-%20Townplanning!5e0!3m2!1sen!2snp!4v1763612118343!5m2!1sen!2snp"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>

                    <div className="space-y-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                            Mobi Store - Nayabazar
                        </h3>
                        <div className="rounded-xl shadow-inner overflow-hidden bg-gray-100 h-64 border border-gray-200">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.4015557275925!2d85.27754717453446!3d27.673981326963947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb191199b3513f%3A0xff449a7be817afd8!2sMobi%20trash%20Store%20by%20Bt%20mobile%20Care!5e0!3m2!1sen!2snp!4v1763613787894!5m2!1sen!2snp"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContactPage;
