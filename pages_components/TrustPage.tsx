

import React, { useState } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { DocumentCheckIcon } from '../components/icons/DocumentCheckIcon';
import { BanknotesIcon } from '../components/icons/BanknotesIcon';
import { LockClosedIcon } from '../components/icons/LockClosedIcon';
import { MapPinIcon } from '../components/icons/MapPinIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { ServerIcon } from '../components/icons/ServerIcon';
import { CloudflareIcon } from '../components/icons/CloudflareIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';
import SEO from '../components/SEO';
import CertificateModal from '../components/CertificateModal';

interface TrustPageProps {
    navigate: (path: string) => void;
}

const TrustPoint: React.FC<{
    icon: React.ElementType;
    title: string;
    description: string;
    colorClass: string;
    bgClass: string;
}> = ({ icon: Icon, title, description, colorClass, bgClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow group">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${bgClass} group-hover:scale-110 transition-transform`}>
            <Icon className={`w-7 h-7 ${colorClass}`} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
);

const SecurityFeature: React.FC<{
    icon: React.ElementType;
    title: string;
    desc: string;
    colorClass?: string;
}> = ({ icon: Icon, title, desc, colorClass = "text-orange-600" }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <div className={`p-2 bg-white rounded-lg shadow-sm ${colorClass}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const PaymentMethod: React.FC<{
    title: string;
    desc: string;
    logos: string[];
    direction: 'in' | 'out';
}> = ({ title, desc, logos, direction }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-2 opacity-5 ${direction === 'in' ? 'bg-orange-500' : 'bg-blue-500'} rounded-bl-3xl`}>
            <BanknotesIcon className="w-16 h-16" />
        </div>

        <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${direction === 'out' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                {direction === 'out' ? 'We Pay You' : 'You Pay Us'}
            </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">{desc}</p>

        <div className="flex items-center gap-3 mt-auto">
            {logos.map((logo, i) => (
                <div key={i} className="h-10 w-auto min-w-[60px] bg-white border border-slate-100 rounded-lg flex items-center justify-center p-1.5 shadow-sm">
                    <img src={logo} alt="Payment Logo" className="max-h-full w-auto object-contain" />
                </div>
            ))}
        </div>
    </div>
);

const TrustPage: React.FC<TrustPageProps> = ({ navigate }) => {
    const [showCertificate, setShowCertificate] = useState(false);

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEO
                title="Trust, Safety & Security Center | Mobi Store Nepal"
                description="Your safety is our priority. ISO certified data wiping, 256-bit SSL encryption, Govt registered (PAN 140158515), and physical warranty. Trade with confidence."
                keywords="mobi trash safety, is mobi trash legit, data privacy nepal, sell phone secure, bt mobile care legal, pan registration nepal"
                canonicalUrl="https://mobitrashstore.com/trust"
            />

            <MobileSkyHeader title="Trust Center" Icon={ShieldCheckIcon} hasSpacer={false} />

            {/* Adjusted padding: Removed pb-20, fixed spacing */}
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24 md:pt-10">

                {/* Hero Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider mb-4 border border-orange-200 shadow-sm">
                        <ShieldCheckIcon className="w-4 h-4" /> Official & Verified
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Your Safety is Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">#1 Priority.</span>
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                        Mobi Store operates with full transparency. We are a registered, tax-paying, and compliant business operating under the laws of Nepal.
                    </p>
                </div>

                {/* Govt Registration Card - Updated to Light Theme & Straight Cert */}
                <div className="bg-white rounded-3xl p-6 md:p-10 mb-12 shadow-2xl relative overflow-hidden border border-slate-200 group">
                    {/* Powerful SVG Background Graphic (Guilloche-inspired) */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="security-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <circle cx="10" cy="10" r="2" fill="currentColor" />
                                    <path d="M0 10h20M10 0v20" stroke="currentColor" strokeWidth="0.5" fill="none" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#security-pattern)" className="text-slate-900" />
                        </svg>
                    </div>

                    {/* Gradient Mesh for Premium Feel */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100/40 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/40 to-transparent rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-black mb-4 flex items-center justify-center md:justify-start gap-3 text-slate-900">
                                <div className="p-2 bg-orange-100 rounded-xl text-orange-600 shadow-sm border border-orange-200">
                                    <DocumentCheckIcon className="w-8 h-8" />
                                </div>
                                Government Registered
                            </h2>
                            <p className="text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
                                We operate legally under <strong>Mobi Store Tech</strong>. We pay our taxes, follow MDMS regulations, and are fully accountable to the Inland Revenue Department (IRD).
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="bg-slate-50 px-5 py-3 rounded-xl border border-slate-200 flex flex-col min-w-[140px] shadow-sm">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">PAN Number</span>
                                    <span className="text-xl font-mono font-black text-slate-800 tracking-widest mt-1">140158515</span>
                                </div>
                                <div className="bg-slate-50 px-5 py-3 rounded-xl border border-slate-200 flex flex-col min-w-[140px] shadow-sm">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Regd. Name</span>
                                    <span className="text-lg font-bold text-slate-800 mt-1">Mobi Store Tech</span>
                                </div>
                            </div>
                        </div>

                        {/* Certificate Image Interaction - STRAIGHT */}
                        <div
                            className="shrink-0 relative cursor-pointer"
                            onClick={() => setShowCertificate(true)}
                        >
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center z-20 backdrop-blur-[1px]">
                                <div className="bg-white p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                    <EyeIcon className="w-6 h-6 text-slate-900" />
                                </div>
                            </div>

                            {/* Removed rotation classes */}
                            <div className="relative shadow-2xl rounded-xl border-8 border-white overflow-hidden bg-white">
                                <img
                                    src="https://ik.imagekit.io/Btmobilecare/IMG_3624.jpeg"
                                    alt="Registration Certificate"
                                    className="w-56 md:w-72 h-auto object-cover block"
                                />
                                <div className="absolute inset-0 border border-slate-900/5 rounded-lg pointer-events-none"></div>
                            </div>
                            <p className="text-center text-xs text-slate-400 mt-4 font-bold uppercase tracking-wide">
                                Click to verify original
                            </p>
                        </div>
                    </div>
                </div>

                {/* 4 Pillars of Trust */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 mb-12">
                    <TrustPoint
                        icon={LockClosedIcon}
                        title="100% Data Wipe Guarantee"
                        description="Selling your phone? We use military-grade software algorithms to permanently erase all data before refurbishment. Your photos and messages are gone forever, guaranteed."
                        bgClass="bg-blue-50"
                        colorClass="text-blue-600"
                    />
                    <TrustPoint
                        icon={BanknotesIcon}
                        title="Instant & Secure Payments"
                        description="No waiting for checks. We transfer money instantly via Fonepay, eSewa, or Bank Transfer the moment your device passes inspection. Safe, digital, and documented."
                        bgClass="bg-amber-50"
                        colorClass="text-amber-600"
                    />
                    <TrustPoint
                        icon={MapPinIcon}
                        title="Real Physical Headquarters"
                        description="We aren't a ghost internet company. Visit our main lab and office at Naya Bazar, Kirtipur. Come meet our team, see our repairs, or have a cup of tea."
                        bgClass="bg-purple-50"
                        colorClass="text-purple-600"
                    />
                    <TrustPoint
                        icon={ShieldCheckIcon}
                        title="Comprehensive Warranty"
                        description="Buying from us? Every certified phone comes with a 1-Year Warranty and a 7-Day Replacement Policy. We stand behind every device we sell."
                        bgClass="bg-orange-50"
                        colorClass="text-orange-600"
                    />
                </div>

                {/* Payment Transparency Section */}
                <div className="mb-12">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BanknotesIcon className="w-6 h-6 text-orange-600" />
                        Transparent Payment Ecosystem
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PaymentMethod
                            direction="out"
                            title="Instant Seller Payouts"
                            desc="When you sell your device to us, we process the payment immediately upon verification. Funds are transferred directly to your bank or digital wallet."
                            logos={[
                                'https://ik.imagekit.io/fixedmyspeaker/esewa.png',
                                'https://ik.imagekit.io/fixedmyspeaker/khalti-ime-logo.png',
                                'https://ik.imagekit.io/fixedmyspeaker/fonepay_payments_fatafat.png'
                            ]}
                        />
                        <PaymentMethod
                            direction="in"
                            title="Secure Buyer Protection"
                            desc="Buying from us is safe. We use SSL-encrypted gateways for all transactions. Your financial data is never stored on our servers."
                            logos={[
                                'https://ik.imagekit.io/fixedmyspeaker/esewa.png',
                                'https://ik.imagekit.io/fixedmyspeaker/khalti-ime-logo.png',
                                'https://ik.imagekit.io/fixedmyspeaker/fonepay_payments_fatafat.png'
                            ]}
                        />
                    </div>
                </div>

                {/* Enterprise Security Section */}
                <div className="mb-12">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <LockClosedIcon className="w-6 h-6 text-slate-700" />
                        Enterprise Grade Security
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SecurityFeature
                            icon={LockClosedIcon}
                            title="SSL Encryption"
                            desc="All data transmitted between your device and our servers is encrypted using 256-bit SSL protocols."
                            colorClass="text-indigo-600"
                        />
                        <SecurityFeature
                            icon={ServerIcon}
                            title="Secure Cloud Storage"
                            desc="User data is stored in Google Firebase (USA), compliant with international data protection standards."
                            colorClass="text-blue-600"
                        />
                        <SecurityFeature
                            icon={CloudflareIcon}
                            title="DDoS Protection"
                            desc="Our platform is protected by Cloudflare & Google Cloud Armor against malicious attacks."
                            colorClass="text-orange-500"
                        />
                    </div>
                </div>

                {/* FAQ / Closing */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Still have questions?</h2>
                    <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                        We believe in total transparency. If you have any doubts about selling your device or buying a new one, talk directly to our founder or support team.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => navigate('/contact')}
                            className="bg-slate-900 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            Contact Support <ArrowRightIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigate('/about')}
                            className="bg-white text-slate-700 font-bold py-3.5 px-8 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
                        >
                            Meet the Team
                        </button>
                    </div>
                </div>

                {/* Founder Note */}
                <div className="mt-8 flex items-center justify-center gap-4 opacity-90 pb-2">
                    <div className="relative group cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open('https://www.facebook.com/bishalmishra9827', '_blank')}>
                        <img
                            src="https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg"
                            alt="Mobi Store Team"
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-orange-100"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Bishal+Mishra&background=0D8ABC&color=fff'; }}
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-orange-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">A Promise from the CEO</p>
                        <p className="text-sm font-medium text-slate-700 italic">"We built Mobi Store to fix the broken trust in Nepal's second-hand market."</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">— Mobi Store Team</p>
                    </div>
                </div>

            </div>

            {showCertificate && <CertificateModal onClose={() => setShowCertificate(false)} />}
        </div>
    );
};

export default TrustPage;
