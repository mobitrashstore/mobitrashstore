
import React, { useState, useEffect } from 'react';
import { FacebookIcon } from './icons/FacebookIcon';
import { TikTokIcon } from './icons/TikTokIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import * as api from '../services/api';
import CertificateModal from './CertificateModal';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ArrowTopRightOnSquareIcon } from './icons/ArrowTopRightOnSquareIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface FooterProps {
    navigate: (path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ navigate }) => {
    const [darazConfig, setDarazConfig] = useState<{ url: string } | null>(null);
    const [showCertificate, setShowCertificate] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const config = await api.getDarazConfig();
                if (config.enabled) {
                    setDarazConfig({ url: config.shopUrl });
                }
            } catch (e) {
                console.error("Footer fetch error", e);
            }
        };
        fetchConfig();
    }, []);

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        navigate(path);
    };

    const handleAppStoreClick = (e: React.MouseEvent) => {
        e.preventDefault();
        alert("iOS App Coming Soon!");
    }

    return (
        <>
            <footer className="bg-[#050505] border-t border-white/5 hidden md:block text-slate-400 font-sans">
                <div className="w-full px-6 lg:px-10 py-10">
                    <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10"> {/* Changed from max-w-7xl mx-auto to w-full */}

                        {/* BRAND & OFFICIAL INFO COLUMN (4 Spans) */}
                        <div className="md:col-span-4 flex flex-col justify-between h-full space-y-6">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <img src="/header-logo.png" alt="Mobi Store logo" width="134" height="40" className="h-10 w-auto object-contain" />
                                    <div className="h-8 w-px bg-white/10"></div>
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-tight">
                                    The Most Trusted<br />Re-commerce
                                    </p>
                                </div>

                                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-5">
                                    The safest way to buy, sell, and repair smartphones worldwide. Instant valuation, data security, and worldwide pickup.
                                </p>

                                {/* Official Govt Badge - High Visibility */}
                                <div className="inline-flex items-center gap-4 px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-lg relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                        <ShieldCheckIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Govt. Regd. PAN</p>
                                        <p className="text-xl font-mono font-black text-white tracking-widest leading-none mt-0.5">140158515</p>
                                    </div>
                                </div>
                            </div>

                            {/* Developer Profile Section */}
                            <div className="pt-5 border-t border-white/5">
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Platform Developed By</p>
                                <a
                                    href="https://www.facebook.com/bishalmishra9827"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 group bg-[#0a0a0a] hover:bg-[#111] p-2 pr-4 rounded-full transition-all border border-white/5 hover:border-white/10 w-fit"
                                    title="Connect with Lead Engineer Mobi Store Team on Facebook"
                                >
                                    <div className="relative">
                                        <img
                                            src="https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg"
                                            alt="Mobi Store Team"
                                            width="40"
                                            height="40"
                                            className="w-10 h-10 rounded-full object-cover border-2 border-[#0a0a0a] group-hover:border-amber-500/50 transition-colors"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Bishal+Mishra&background=0D8ABC&color=fff'; }}
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-orange-500 border-2 border-[#0a0a0a] rounded-full"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-none">Mobi Store Team</p>
                                        <p className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-0.5">Lead Engineer & CEO</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* LINKS GRID (8 Spans) */}
                        <div className="md:col-span-8 grid grid-cols-3 gap-4 lg:gap-8">

                            {/* SERVICES */}
                            <div>
                                <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Services</h4>
                                <ul className="space-y-2 text-sm text-slate-400">
                                    <li><a href="/product" onClick={(e) => handleNav(e, '/product')} className="hover:text-white transition-colors block" title="Shop All Available Phones">Shop Phones</a></li>
                                    <li><a href="/sell" onClick={(e) => handleNav(e, '/sell')} className="hover:text-white transition-colors block" title="Sell Your Used Smartphone Instantly">Sell Device</a></li>
                                    <li><a href="/repair" onClick={(e) => handleNav(e, '/repair')} className="hover:text-white transition-colors block" title="Professional Repair Lab Services">Repair Lab</a></li>
                                    <li><a href="/compare" onClick={(e) => handleNav(e, '/compare')} className="hover:text-white transition-colors block" title="Compare Device Specs & Features">Compare Specs</a></li>
                                    <li><a href="/emi-calculator" onClick={(e) => handleNav(e, '/emi-calculator')} className="hover:text-white transition-colors block" title="Calculate Your Monthly EMI Payments">EMI Calculator</a></li>
                                    <li><a href="/track" onClick={(e) => handleNav(e, '/track')} className="hover:text-white transition-colors block" title="Track Your Existing Order">Track Order</a></li>

                                    {/* Daraz Button */}
                                    {darazConfig && (
                                        <li className="pt-3">
                                            <a
                                                href={darazConfig.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-[#f85606] hover:text-white transition-colors group text-xs font-bold bg-[#f85606]/10 px-3 py-1.5 rounded-lg border border-[#f85606]/20 hover:bg-[#f85606] hover:border-[#f85606]"
                                                title="Shop Our Official Products on Daraz"
                                            >
                                                <span>Visit Daraz Store</span>
                                                <ArrowTopRightOnSquareIcon className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* COMPANY */}
                            <div>
                                <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Company</h4>
                                <ul className="space-y-2 text-sm text-slate-400">
                                    <li><a href="/about" onClick={(e) => handleNav(e, '/about')} className="hover:text-white transition-colors block" title="About Mobi Store">About Us</a></li>
                                    <li><a href="/trust" onClick={(e) => handleNav(e, '/trust')} className="hover:text-orange-400 transition-colors flex items-center gap-1.5 font-bold" title="Our Commitment to Trust & Safety"><ShieldCheckIcon className="w-3.5 h-3.5" /> Trust & Safety</a></li>
                                    <li><a href="/tech-news" onClick={(e) => handleNav(e, '/tech-news')} className="hover:text-white transition-colors block font-bold text-rose-400" title="Read Latest Global Tech News">Tech News</a></li>
                                    <li><a href="/gallery" onClick={(e) => handleNav(e, '/gallery')} className="hover:text-white transition-colors block" title="View Our Collection & Store Gallery">Gallery</a></li>
                                    <li><a href="/blog" onClick={(e) => handleNav(e, '/blog')} className="hover:text-white transition-colors block" title="Explore Our Tech Blog">Blog</a></li>
                                    <li><a href="/contact" onClick={(e) => handleNav(e, '/contact')} className="hover:text-white transition-colors block" title="Contact Our Support Team">Contact Support</a></li>
                                    <li><a href="/sitemap" onClick={(e) => handleNav(e, '/sitemap')} className="hover:text-white transition-colors block" title="View Website Map">Sitemap</a></li>
                                    <li className="pt-2">
                                        <button
                                            onClick={() => setShowCertificate(true)}
                                            className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1.5 text-xs font-bold"
                                            title="View Official Government Certifications"
                                        >
                                            <ShieldCheckIcon className="w-4 h-4" />
                                            View Certificate
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* LEGAL & APP */}
                            <div className="flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Legal</h4>
                                    <ul className="space-y-2 text-sm text-slate-400">
                                        <li><a href="/terms" onClick={(e) => handleNav(e, '/terms')} className="hover:text-white transition-colors block" title="Read Terms of Service">Terms of Service</a></li>
                                        <li><a href="/privacy" onClick={(e) => handleNav(e, '/privacy')} className="hover:text-white transition-colors block" title="Review Privacy Policy">Privacy Policy</a></li>
                                        <li><a href="/return-policy" onClick={(e) => handleNav(e, '/return-policy')} className="hover:text-white transition-colors block" title="Check Returns & Refunds Policy">Returns & Refunds</a></li>
                                        <li><a href="/data-deletion" onClick={(e) => handleNav(e, '/data-deletion')} className="hover:text-rose-400 text-rose-500/80 transition-colors block" title="Request Data Deletion">Data Deletion</a></li>
                                        <li><a href="/report-problem" onClick={(e) => handleNav(e, '/report-problem')} className="hover:text-rose-400 text-rose-500/80 transition-colors block" title="Report a Technical Problem">Report Problem</a></li>
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Download App</p>
                                    <div className="flex flex-wrap gap-2">
                                        <a href="https://play.google.com/store/apps/details?id=com.mobistore.shop" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 hover:scale-105 transition-all" title="Download Official App from Play Store">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" width="135" height="40" className="h-8 w-auto" />
                                        </a>
                                        <button onClick={handleAppStoreClick} className="opacity-80 hover:opacity-100 hover:scale-105 transition-all" title="Download Official App from App Store (Coming Soon)">
                                            <img src="https://ik.imagekit.io/fonepay/appstore.png?updatedAt=1760235759216" alt="App Store" width="120" height="40" className="h-8 w-auto" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                        <p>&copy; {new Date().getFullYear()} Mobi Store. A Venture of <span className="text-slate-400 font-bold hover:text-white transition-colors cursor-pointer">Mobi Store Tech</span>.</p>

                        <div className="flex gap-6">
                            <a href="https://www.facebook.com/share/17SwmmmU6f/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#1877F2] transition-colors hover:scale-110 transform" title="Follow Us on Facebook"><FacebookIcon className="h-5 w-5" /></a>
                            <a href="https://wa.me/+9779812141777" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#25D366] transition-colors hover:scale-110 transform" title="Chat with Support on WhatsApp"><WhatsAppIcon className="h-5 w-5" /></a>
                            <a href="https://www.tiktok.com/@mobistoreapp?_r=1&_t=ZS-91M9tAbNqqK" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors hover:scale-110 transform" title="Follow Us on TikTok"><TikTokIcon className="h-5 w-5" /></a>
                            <a href="https://www.instagram.com/btmobile_care/?igsh=MXJpNWw0ejR2M3RhMA%3D%3D#" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#E4405F] transition-colors hover:scale-110 transform" title="Follow Us on Instagram"><InstagramIcon className="h-5 w-5" /></a>
                        </div>
                    </div>
                </div>
            </footer>
            {showCertificate && <CertificateModal onClose={() => setShowCertificate(false)} />}
        </>
    );
};

export default Footer;
