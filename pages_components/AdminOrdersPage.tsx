
// ... existing imports ...
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Order } from '../types';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { MapPinIcon } from '../components/icons/MapPinIcon';
import Spinner from '../components/Spinner';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';

import { sendEmail, getOrderEmailTemplate } from '../services/email';
import * as pathaoService from '../services/pathaoService';

interface AdminOrdersPageProps {
    navigate: (path: string) => void;
}

// ... (keep helper functions like dataURLtoBlob and OrderDetailsModal) ...
// Helper function to convert a data URL to a Blob for faster rendering
function dataURLtoBlob(dataurl: string) {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

const OrderDetailsModal: React.FC<{
    order: Order;
    onClose: () => void;
    onStatusChange: (orderId: string, updates: Partial<Order>) => void;
}> = ({ order, onClose, onStatusChange }) => {
    // ... (Keep existing implementation of OrderDetailsModal)
    const [status, setStatus] = useState(order.status);
    const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
    const [imageObjectURL, setImageObjectURL] = useState<string | null>(null);

    // Pathao State
    const [pathaoCities, setPathaoCities] = useState<any[]>([]);
    const [pathaoZones, setPathaoZones] = useState<any[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<number | ''>('');
    const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('');
    const [isSendingToPathao, setIsSendingToPathao] = useState(false);

    useEffect(() => {
        pathaoService.getCities().then(setPathaoCities).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedCityId) {
            pathaoService.getZones(Number(selectedCityId)).then(setPathaoZones).catch(console.error);
        } else {
            setPathaoZones([]);
            setSelectedZoneId('');
        }
    }, [selectedCityId]);

    const handleSendToPathao = async () => {
        if (!selectedCityId || !selectedZoneId) {
            alert("Please select both City and Zone for Pathao Delivery.");
            return;
        }
        setIsSendingToPathao(true);
        try {
            const consignmentId = await pathaoService.createOrder(
                order, 
                Number(selectedCityId), 
                Number(selectedZoneId), 
                order.customerDetails.address
            );
            setTrackingCode(consignmentId);
            setStatus('Shipped');
            alert(`SUCCESS! Order pushed to Pathao.\nConsignment ID: ${consignmentId}`);
        } catch (e: any) {
            alert(e.message || "Failed to push order to Pathao.");
        } finally {
            setIsSendingToPathao(false);
        }
    };

    useEffect(() => {
        let objectUrl: string | null = null;
        setImageObjectURL(null);

        if (order.paymentMethod === 'Fonepay' && order.paymentProofData) {
            const blob = dataURLtoBlob(order.paymentProofData);
            if (blob) {
                objectUrl = URL.createObjectURL(blob);
                setImageObjectURL(objectUrl);
            }
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [order]);


    const handleSave = () => {
        const updates: Partial<Order> = { status };
        updates.trackingCode = trackingCode;
        onStatusChange(order.id, updates);
        onClose();
    };

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[9999] flex items-center justify-center p-2 sm:p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh] h-auto overflow-hidden relative z-10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ... (Keep Modal Content) ... */}
                <div className="flex items-center justify-between p-4 lg:p-5 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Order Details</h2>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{order.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-white text-slate-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Customer Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-200">
                                        {order.customerDetails.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{order.customerDetails.name}</p>
                                        <p className="text-xs text-slate-500">Customer</p>
                                    </div>
                                </div>
                                <div className="pt-2 space-y-2">
                                    <p className="flex items-center gap-2 text-sm text-slate-500"><EnvelopeIcon className="w-4 h-4 text-slate-400" /> {order.customerDetails.email}</p>
                                    <p className="flex items-center gap-2 text-sm text-slate-500"><PhoneIcon className="w-4 h-4 text-slate-400" /> {order.customerDetails.phone}</p>
                                    <p className="flex items-start gap-2 text-sm text-slate-500"><MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" /> {order.customerDetails.address}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Status & Payment</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-slate-500 mb-1">Update Status</label>
                                    <select
                                        id="status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as Order['status'])}
                                        className="w-full border border-slate-300 bg-white text-slate-800 rounded-lg text-sm p-2.5 focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="Payment Pending">Payment Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>

                                {status === 'Shipped' && (
                                    <div>
                                        <label htmlFor="trackingCode" className="block text-sm font-medium text-slate-500 mb-1">Manual Tracking Code</label>
                                        <input
                                            id="trackingCode"
                                            type="text"
                                            value={trackingCode}
                                            onChange={(e) => setTrackingCode(e.target.value)}
                                            placeholder="Enter tracking number..."
                                            className="w-full border border-slate-300 bg-white text-slate-800 rounded-lg text-sm p-2.5 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                )}

                                <div className="pt-2 border-t border-slate-200 mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-slate-500">Method</span>
                                        <span className="text-sm font-semibold text-slate-800">{order.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Date</span>
                                        <span className="text-sm font-semibold text-slate-800">{order.date}</span>
                                    </div>
                                    {order.paymentMethod === 'Fonepay' && imageObjectURL && (
                                        <div className="mt-3">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Payment Proof</p>
                                            <a href={imageObjectURL} target="_blank" rel="noopener noreferrer" className="block w-full h-24 border border-slate-200 rounded-lg overflow-hidden relative group shadow-sm">
                                                <img src={imageObjectURL} alt="Payment Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-white text-slate-800 text-xs font-bold px-2 py-1 rounded shadow-sm">View Full</span>
                                                </div>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PATHAO INTEGRATION PANEL */}
                    <div className="mt-6 bg-slate-50 p-5 rounded-xl border border-red-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                            🚚 Pathao Courier Integration
                        </h3>
                        {trackingCode && trackingCode.length > 5 ? (
                            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200 font-medium">
                                ✔ Sent to Pathao. Consignment: <strong className="font-mono">{trackingCode}</strong>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Recipient City</label>
                                    <select
                                        value={selectedCityId}
                                        onChange={e => setSelectedCityId(e.target.value ? Number(e.target.value) : '')}
                                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-red-500 focus:border-red-500 bg-white"
                                    >
                                        <option value="">-- Select City --</option>
                                        {pathaoCities.map(c => (
                                            <option key={c.city_id} value={c.city_id}>{c.city_name} (ID: {c.city_id})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Recipient Zone</label>
                                    <select
                                        value={selectedZoneId}
                                        onChange={e => setSelectedZoneId(e.target.value ? Number(e.target.value) : '')}
                                        disabled={!selectedCityId}
                                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-red-500 focus:border-red-500 disabled:bg-slate-100 bg-white"
                                    >
                                        <option value="">-- Select Zone --</option>
                                        {pathaoZones.map(z => (
                                            <option key={z.zone_id} value={z.zone_id}>{z.zone_name} (ID: {z.zone_id})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 flex items-center justify-between pt-1">
                                    {selectedCityId && selectedZoneId && (
                                        <span className="text-[10px] text-slate-400 font-mono">city_id={selectedCityId} zone_id={selectedZoneId}</span>
                                    )}
                                    <button
                                        onClick={handleSendToPathao}
                                        disabled={isSendingToPathao || !selectedCityId || !selectedZoneId}
                                        className="ml-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {isSendingToPathao ? '⏳ Pushing to Pathao...' : '🚀 Create Pathao Delivery'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-3">Order Items</h3>
                        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <ul className="divide-y divide-slate-200">
                                {order.items.map((item, index) => (
                                    <li key={`${item.sku}-${index}`} className="flex justify-between items-center p-4 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-md bg-white border border-slate-300 flex items-center justify-center text-slate-500 text-xs font-bold shadow-sm">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                                                <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800 text-sm">NPR {(item.quantity * item.price).toLocaleString()}</p>
                                            <p className="text-xs text-slate-500">Unit: {item.price.toLocaleString()}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="bg-white p-4 border-t border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-500">Total Amount</span>
                                <span className="font-extrabold text-xl text-amber-600">NPR {order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-4 lg:p-5 bg-slate-50 border-t border-slate-200 shrink-0">
                    <button onClick={onClose} className="mr-3 px-5 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSave} className="bg-amber-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-amber-700 transition-colors shadow-md transform active:scale-95 text-sm">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ navigate }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Parse search query from URL
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) setSearchQuery(q);

        const fetchOrders = async () => {
            setLoading(true);
            const allOrders = await api.getOrders();
            setOrders(allOrders);
            setLoading(false);
        };
        fetchOrders();
    }, []);

    // ... (Keep existing helper functions getStatusColor etc.)
    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Shipped': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Payment Pending': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusColorForEmail = (status: Order['status'] | undefined) => {
        switch (status) {
            case 'Processing': return '#3b82f6';
            case 'Shipped': return '#f59e0b';
            case 'Delivered': return '#10b981';
            case 'Payment Pending': return '#f43f5e';
            default: return '#4b5563';
        }
    }

    // ... (Keep handleStatusChange logic)
    const handleStatusChange = async (orderId: string, updates: Partial<Order>) => {
        const originalOrder = orders.find(order => order.id === orderId);
        if (!originalOrder) return;
        const statusChanged = updates.status && originalOrder.status !== updates.status;

        try {
            await api.updateOrder(orderId, updates);
            const updatedOrderData = { ...originalOrder, ...updates } as Order;
            setOrders(prevOrders => prevOrders.map(order =>
                order.id === orderId ? updatedOrderData : order
            ));

            if (statusChanged) {
                try {
                    let emailTitle = "";
                    let emailSubtitle = "";
                    const steps = [
                        { label: 'Confirmed', active: true },
                        { label: 'Processing', active: false },
                        { label: 'Shipped', active: false },
                        { label: 'Delivered', active: false }
                    ];

                    switch (updatedOrderData.status) {
                        case 'Processing':
                            emailTitle = "Your Order is being Processed!";
                            emailSubtitle = "We are currently packing your items and preparing them for shipment. We'll notify you as soon as they're on the way!";
                            steps[1].active = true;
                            break;
                        case 'Shipped':
                            emailTitle = "Great News! Your Order has Shipped!";
                            emailSubtitle = `Your items are on their way to you. ${updates.trackingCode ? `You can track your package with code: <strong>${updates.trackingCode}</strong>.` : ''}`;
                            steps[1].active = true;
                            steps[2].active = true;
                            break;
                        case 'Delivered':
                            emailTitle = "Order Delivered!";
                            emailSubtitle = "Your order has been successfully delivered. We hope you love your new purchase! Thank you for shopping with Mobi Store.";
                            steps[1].active = true;
                            steps[2].active = true;
                            steps[3].active = true;
                            break;
                        case 'Payment Pending':
                            emailTitle = "Order Payment Pending";
                            emailSubtitle = "We are waiting to verify your payment. Once verified, we will start processing your order immediately.";
                            break;
                        default:
                            emailTitle = "Order Status Updated";
                            emailSubtitle = `Your order status is now: ${updatedOrderData.status}.`;
                    }

                    const emailBody = getOrderEmailTemplate(
                        updatedOrderData,
                        emailTitle,
                        emailSubtitle,
                        steps
                    );

                    await sendEmail({
                        to: updatedOrderData.customerDetails.email,
                        subject: `Update on your Mobi Store Order #${updatedOrderData.id}`,
                        body: emailBody
                    });

                    alert('Order updated and notification email sent successfully!');
                } catch (emailError: any) {
                    console.error("Status email error:", emailError);
                    alert(`Order updated, but email notification failed.`);
                }
            } else {
                alert('Order details updated successfully!');
            }
        } catch (e) {
            console.error("Failed to update order status", e);
            alert("Failed to update order status.");
        }
    };

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerDetails.phone.includes(searchQuery)
    );

    return (
        <div className="animate-fade-in pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Order Management</h1>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 font-medium text-slate-600">
                    Total: <span className="text-slate-900 font-bold">{orders.length}</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by Order ID, Customer Name, or Phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="w-12 h-12" /></div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Order ID</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Customer</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Total</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                        <tr key={order.id} className="bg-white hover:bg-slate-50 transition-colors group">
                                            <th scope="row" className="px-6 py-4 font-mono text-xs text-slate-500 font-medium">
                                                {order.id}
                                            </th>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{order.customerDetails.name}</div>
                                                <div className="text-xs text-slate-500">{order.customerDetails.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{order.date}</td>
                                            <td className="px-6 py-4 font-bold text-slate-800">NPR {order.total.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors font-medium text-sm"
                                                >
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="text-center py-16 text-slate-500 italic">No orders found matching "{searchQuery}".</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {filteredOrders.length > 0 ? filteredOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                                {/* ... (Keep Card Content) ... */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Order ID</span>
                                        <h3 className="font-mono text-sm font-bold text-slate-700">{order.id}</h3>
                                    </div>
                                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Customer</span>
                                        <span className="font-bold text-slate-800">{order.customerDetails.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Date</span>
                                        <span className="text-slate-600">{order.date}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center pt-3 border-t border-slate-100 mt-3">
                                        <span className="text-slate-500">Total Amount</span>
                                        <span className="font-extrabold text-lg text-amber-600">NPR {order.total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors border border-slate-200 active:scale-[0.98]"
                                >
                                    View & Manage
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200">No orders found.</div>
                        )}
                    </div>
                </>
            )}

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={handleStatusChange}
                />
            )}
        </div>
    );
};

export default AdminOrdersPage;
