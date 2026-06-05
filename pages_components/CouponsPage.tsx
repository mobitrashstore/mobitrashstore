import React, { useEffect, useState } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { TicketIcon } from '../components/icons/TicketIcon';
import * as api from '../services/api';
import { Coupon } from '../types';
import Spinner from '../components/Spinner';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { useNotification } from '../context/NotificationContext';

/**
 * Fix: Added interface to define props for CouponsPage, 
 * resolving "Property 'navigate' does not exist on type 'IntrinsicAttributes'" error in App.tsx.
 */
export interface CouponsPageProps {
    navigate: (path: string) => void;
}

/**
 * Fix: Updated component definition to accept navigate prop.
 */
const CouponsPage: React.FC<CouponsPageProps> = ({ navigate }) => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { addNotification } = useNotification();

    useEffect(() => {
        const fetchActiveCoupons = async () => {
            setLoading(true);
            try {
                const allCoupons = await api.getCoupons();
                // Filter valid coupons for users
                const validCoupons = allCoupons.filter(c => c.isActive && new Date(c.expiryDate) > new Date());
                setCoupons(validCoupons);
            } catch (error) {
                console.error("Failed to fetch coupons", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActiveCoupons();
    }, []);

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        addNotification(`Coupon code ${code} copied!`, 'success');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Disabled spacer and adjusted padding to remove gap */}
            <MobileSkyHeader title="Coupons" Icon={TicketIcon} hasSpacer={false} />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 pt-44 md:pt-24 max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 hidden md:block mb-8">Active Deals & Coupons</h1>

                {loading ? (
                    <div className="flex justify-center py-12"><Spinner /></div>
                ) : coupons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coupons.map(coupon => (
                            <div key={coupon.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative group hover:shadow-md transition-all">
                                {/* Left notch decoration */}
                                <div className="absolute top-1/2 left-0 w-4 h-8 bg-gray-50 rounded-r-full -mt-4 border-r border-t border-b border-gray-200"></div>
                                <div className="absolute top-1/2 right-0 w-4 h-8 bg-gray-50 rounded-l-full -mt-4 border-l border-t border-b border-gray-200"></div>

                                <div className="p-6 text-center flex-grow">
                                    <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">
                                        {coupon.discountType === 'percentage' ? `${coupon.value}% OFF` : `NPR ${coupon.value} OFF`}
                                    </p>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{coupon.description}</h3>
                                    <p className="text-xs text-gray-500">Min order: NPR {coupon.minOrderAmount}</p>
                                    <p className="text-xs text-gray-500">Expires: {coupon.expiryDate}</p>
                                </div>

                                <div className="bg-gray-50 p-4 border-t border-dashed border-gray-300 flex items-center justify-between">
                                    <code className="font-mono font-bold text-lg text-gray-800 tracking-wide">{coupon.code}</code>
                                    <button
                                        onClick={() => handleCopy(coupon.code, coupon.id)}
                                        className="text-gray-500 hover:text-amber-600 transition-colors"
                                    >
                                        {copiedId === coupon.id ? <CheckCircleIcon className="w-6 h-6 text-orange-500" /> : <ClipboardIcon className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto text-center">
                        <TicketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No active coupons available right now.</p>
                        <p className="text-sm text-gray-500 mt-2">Check back later for exclusive deals!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponsPage;
