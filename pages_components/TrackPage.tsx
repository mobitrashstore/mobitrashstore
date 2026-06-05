

import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { Order, TradeIn } from '../types';
import Spinner from '../components/Spinner';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { TruckIcon } from '../components/icons/TruckIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { useNotification } from '../context/NotificationContext';

export interface TrackPageProps {
    navigate: (path: string) => void;
}

const TrackPage: React.FC<TrackPageProps> = ({ navigate }) => {
    const [trackingId, setTrackingId] = useState('');
    const [result, setResult] = useState<Order | TradeIn | null | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [searchAttempted, setSearchAttempted] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    // FIX: Changed 'copied' state to 'copiedId' to track which specific ID was copied
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { addNotification } = useNotification();

    const performSearch = useCallback(async (id: string) => {
        if (!id) return;
        setLoading(true);
        setSearchAttempted(true);
        const foundItem = await api.findOrderOrTradeIn(id);
        setResult(foundItem);
        setLoading(false);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const idFromUrl = params.get('id');
        if (idFromUrl) {
            setTrackingId(idFromUrl);
            performSearch(idFromUrl);
        } else {
            setTrackingId('');
            setResult(undefined);
            setSearchAttempted(false);
        }
    }, [performSearch]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(trackingId);
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id); // Set the ID that was copied
        addNotification("ID Copied to clipboard", "success");
        setTimeout(() => setCopiedId(null), 2000); // Clear after 2 seconds
    }

    const isOrder = (item: Order | TradeIn): item is Order => {
        return 'items' in item;
    };

    const handleCancelOrder = async () => {
        if (!result || !isOrder(result)) return;
        if (!confirm("Are you sure you want to cancel this order?")) return;

        setCancelling(true);
        try {
            await api.cancelOrder(result.id);
            // Refresh
            performSearch(result.id);
            alert("Order cancelled successfully.");
        } catch (e) {
            alert("Failed to cancel order.");
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="bg-gray-50">
            {/* Disabled spacer and adjusted padding to remove gap */}
            <MobileSkyHeader title="Track Your Item" Icon={TruckIcon} hasSpacer={false} />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-16 sm:py-24 pt-44 md:pt-24">
                <div className="max-w-xl mx-auto text-center hidden md:block"> {/* Re-introduced max-w-xl mx-auto */}
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">Track Your Item</h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Enter your Order ID or Trade-in ID below to check its status.
                    </p>
                </div>
                <div className="mt-4 md:mt-10 max-w-xl mx-auto"> {/* Re-introduced max-w-xl mx-auto */}
                    <form onSubmit={handleFormSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value.trim())}
                            placeholder="e.g., ORD-1234 or TRD-5678"
                            className="flex-grow w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-amber-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </form>
                </div>

                <div className="mt-12 max-w-2xl mx-auto"> {/* Re-introduced max-w-2xl mx-auto */}
                    {!searchAttempted && !loading && (
                        <div className="text-center text-gray-500 py-8">
                            <p>Enter an ID to begin tracking.</p>
                        </div>
                    )}
                    {loading && <div className="text-center flex justify-center py-8"><Spinner size="w-12 h-12" /></div>}
                    {result === null && searchAttempted && !loading && (
                        <div className="bg-rose-100 text-rose-700 p-4 rounded-lg text-center">
                            <strong>Not Found:</strong> We couldn't find an item with the ID "{trackingId}". Please check the ID and try again.
                        </div>
                    )}
                    {result && !loading && (
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                Tracking Details for <span className="text-amber-600">{result.id}</span>
                                <button
                                    onClick={() => handleCopy(result.id, `id-${result.id}`)}
                                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-amber-600 transition-colors"
                                    title="Copy ID"
                                >
                                    {/* FIX: Check 'copiedId' state */}
                                    {copiedId === `id-${result.id}` ? <CheckCircleIcon className="w-5 h-5 text-orange-500" /> : <ClipboardIcon className="w-5 h-5" />}
                                </button>
                            </h2>
                            <div className="mt-4 space-y-2 text-gray-700">
                                <p><strong>Customer:</strong> {isOrder(result) ? result.customerDetails.name : result.customerName}</p>
                                <p><strong>Date:</strong> {result.date}</p>
                                {isOrder(result) ? (
                                    <>
                                        <p><strong>Item(s):</strong> {result.items.map(i => `${i.title} (x${i.quantity})`).join(', ')}</p>
                                        <p><strong>Total:</strong> NPR {result.total.toLocaleString()}</p>
                                        {result.trackingCode && (
                                            <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded border border-blue-100 w-fit">
                                                <span className="text-xs font-bold text-blue-700 uppercase">Shipping Code:</span>
                                                <span className="font-mono font-bold text-blue-900">{result.trackingCode}</span>
                                                <button
                                                    onClick={() => handleCopy(result.trackingCode!, `tc-${result.id}`)}
                                                    className="ml-1 text-blue-400 hover:text-blue-600"
                                                >
                                                    {/* FIX: Check 'copiedId' state */}
                                                    {copiedId === `tc-${result.id}` ? <CheckCircleIcon className="w-4 h-4 text-orange-500" /> : <ClipboardIcon className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Device:</strong> {result.device}</p>
                                        <p><strong>Quote:</strong> NPR {result.quote.toLocaleString()}</p>
                                    </>
                                )}
                                <p className="font-semibold pt-2"><strong>Status:</strong> <span className={`px-2 py-1 rounded text-white text-sm ${result.status === 'Cancelled' ? 'bg-rose-500' : 'bg-amber-50'}`}>{result.status}</span></p>

                                {isOrder(result) && (result.status === 'Payment Pending' || result.status === 'Processing') && (
                                    <div className="pt-4 mt-4 border-t border-gray-100">
                                        <button
                                            onClick={handleCancelOrder}
                                            disabled={cancelling}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors"
                                        >
                                            {cancelling ? <Spinner size="w-4 h-4" /> : <XCircleIcon className="w-5 h-5" />}
                                            {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackPage;
