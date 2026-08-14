import React from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { MapPinIcon } from '../components/icons/MapPinIcon';
import { HomeIcon } from '../components/icons/HomeIcon';
import { ShoppingCartIcon } from '../components/icons/ShoppingCartIcon';
import { WrenchIcon } from '../components/icons/WrenchIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import * as api from '../services/api';
import Spinner from '../components/Spinner';

export interface SitemapPageProps {
    navigate: (path: string) => void;
}

const SectionTitle: React.FC<{ icon: React.ElementType, title: string }> = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 text-amber-600 border-b border-amber-100 pb-2">
        <Icon className="w-5 h-5" />
        <h2 className="font-bold text-lg uppercase tracking-wide">{title}</h2>
    </div>
);

const LinkItem: React.FC<{ path: string, label: string, navigate: (path: string) => void }> = ({ path, label, navigate }) => (
    <li>
        <a
            href={path}
            onClick={(e) => { e.preventDefault(); navigate(path); }}
            className="text-gray-600 hover:text-[#059669] hover:underline transition-colors block py-1"
        >
            {label}
        </a>
    </li>
);

// FIX: Ensure correct typing to match expected IntrinsicAttributes when lazy loaded
const SitemapPage: React.FC<SitemapPageProps> = ({ navigate }) => {
    const [products, setProducts] = React.useState<any[]>([]);
    const [blogPosts, setBlogPosts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [p, b] = await Promise.all([
                    api.getInventoryItems(),
                    api.getBlogPosts()
                ]);
                setProducts(p);
                setBlogPosts(b);
            } catch (e) {
                console.error("Failed to fetch sitemap data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <MobileSkyHeader title="Sitemap" Icon={MapPinIcon} hasSpacer={false} />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-16 max-w-6xl mx-auto">
                <div className="text-center mb-12 hidden md:block">
                    <h1 className="text-4xl font-extrabold text-gray-900">Site Directory</h1>
                    <p className="mt-2 text-gray-600">Explore every corner of Mobi Store</p>
                </div>

                <div className="space-y-8">
                    {/* 1. Core Pages Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <div>
                            <SectionTitle icon={HomeIcon} title="Main Navigation" />
                            <ul className="space-y-2">
                                <LinkItem path="/" label="Home" navigate={navigate} />
                                <LinkItem path="/buy" label="Buy Phones" navigate={navigate} />
                                <LinkItem path="/sell" label="Sell Your Phone" navigate={navigate} />
                                <LinkItem path="/repair" label="Repair Services" navigate={navigate} />
                                <LinkItem path="/compare" label="Compare Devices" navigate={navigate} />
                                <LinkItem path="/blog" label="Blog Archive" navigate={navigate} />
                                <LinkItem path="/nepali-news" label="Nepali News Feed" navigate={navigate} />
                                <LinkItem path="/gallery" label="Media Gallery" navigate={navigate} />
                            </ul>
                        </div>

                        <div>
                            <SectionTitle icon={SparklesIcon} title="Customer Services" />
                            <ul className="space-y-2">
                                <LinkItem path="/track" label="Track Order / Trade-in" navigate={navigate} />
                                <LinkItem path="/redeem-points" label="Loyalty Program" navigate={navigate} />
                                <LinkItem path="/coupons" label="Available Coupons" navigate={navigate} />
                                <LinkItem path="/spin-win" label="Spin & Win Game" navigate={navigate} />
                                <LinkItem path="/emi-calculator" label="EMI Calculator" navigate={navigate} />
                                <LinkItem path="/request-product" label="Product Request" navigate={navigate} />
                            </ul>
                        </div>

                        <div>
                            <SectionTitle icon={UserCircleIcon} title="Personal & Legal" />
                            <ul className="space-y-2">
                                <LinkItem path="/profile" label="User Profile" navigate={navigate} />
                                <LinkItem path="/order-history" label="Recent Orders" navigate={navigate} />
                                <LinkItem path="/trust" label="Trust Center" navigate={navigate} />
                                <LinkItem path="/terms" label="Terms & Conditions" navigate={navigate} />
                                <LinkItem path="/privacy" label="Privacy Policy" navigate={navigate} />
                            </ul>
                        </div>
                    </div>

                    {/* 2. Real-time Products Section (TRACKING FROM ADMIN) */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <SectionTitle icon={ShoppingCartIcon} title={`Our Inventory (${products.length} Products)`} />
                        {loading ? (
                            <div className="flex justify-center p-8"><Spinner /></div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                                {products.map(p => (
                                    <LinkItem
                                        key={p.sku}
                                        path={api.getProductPermalink(p)}
                                        label={p.title}
                                        navigate={navigate}
                                    />
                                ))}
                                {products.length === 0 && <p className="text-gray-400 text-sm italic">No products listed yet.</p>}
                            </div>
                        )}
                    </div>

                    {/* 3. Real-time Blog Section (TRACKING FROM ADMIN) */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <SectionTitle icon={DocumentTextIcon} title={`Blog Archive (${blogPosts.length} Entries)`} />
                        {loading ? (
                            <div className="flex justify-center p-8"><Spinner /></div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                {blogPosts.map(bp => (
                                    <LinkItem
                                        key={bp.id}
                                        path={api.getBlogPermalink(bp)}
                                        label={bp.title}
                                        navigate={navigate}
                                    />
                                ))}
                                {blogPosts.length === 0 && <p className="text-gray-400 text-sm italic">No blog posts found.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SitemapPage;
