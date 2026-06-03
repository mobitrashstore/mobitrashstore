
import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import { ProductRequest } from '../types';
import Spinner from '../components/Spinner';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { ShoppingBagIcon } from '../components/icons/ShoppingBagIcon';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';

interface AdminProductRequestsPageProps {
    navigate: (path: string) => void;
}

const RequestDetailsModal: React.FC<{ request: ProductRequest; onClose: () => void }> = ({ request, onClose }) => {
    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden mb-10 max-h-[85vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ShoppingBagIcon className="w-5 h-5 text-emerald-600" />
                        Request Details
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto bg-white text-slate-600">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Product Name</p>
                        <p className="text-xl font-black text-slate-900">{request.productName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                            <p className="font-bold text-slate-800">{request.userName}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Budget</p>
                            <p className="font-black text-emerald-600">NPR {request.budget.toLocaleString()}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description / Specs</p>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 italic">
                            {request.description || "No detailed description provided."}
                        </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-3 text-amber-900">
                            <PhoneIcon className="w-5 h-5" />
                            <span className="font-bold">{request.userPhone}</span>
                        </div>
                        <a href={`tel:${request.userPhone}`} className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-amber-700 transition-colors">Call Now</a>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold transition-colors shadow-sm">Close</button>
                </div>
            </div>
        </div>
    );
};

const AdminProductRequestsPage: React.FC<AdminProductRequestsPageProps> = () => {
    const [requests, setRequests] = useState<ProductRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await api.getProductRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusChange = async (id: string, status: ProductRequest['status']) => {
        try {
            await api.updateProductRequestStatus(id, status);
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            alert(`Status updated to ${status}`);
        } catch (error) {
            alert("Failed to update status.");
        }
    };

    const getStatusColor = (status: ProductRequest['status']) => {
        switch (status) {
            case 'Pending': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Sourcing': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Arrived': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Completed': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-50 text-slate-500';
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(r =>
            r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.userName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [requests, searchQuery]);

    return (
        <div className="animate-fade-in space-y-6 pb-10">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Customer Product Requests</h1>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 font-bold text-slate-600">
                    Total: {requests.length}
                </div>
            </div>

            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search requests by product or customer..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 p-3 bg-white border border-slate-300 text-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-shadow"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="w-12 h-12" /></div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Customer</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Requested Product</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Budget</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRequests.length > 0 ? filteredRequests.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50 transition-colors bg-white">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{r.userName}</p>
                                            <p className="text-xs text-slate-500">{r.userPhone}</p>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{r.productName}</td>
                                        <td className="px-6 py-4 font-extrabold text-emerald-600">NPR {r.budget.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(r.status)}`}>
                                                {r.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <select
                                                    value={r.status}
                                                    onChange={e => handleStatusChange(r.id, e.target.value as any)}
                                                    className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-1.5 focus:ring-amber-500"
                                                >
                                                    <option>Pending</option>
                                                    <option>Sourcing</option>
                                                    <option>Arrived</option>
                                                    <option>Cancelled</option>
                                                    <option>Completed</option>
                                                </select>
                                                <button onClick={() => setSelectedRequest(r)} className="text-blue-600 hover:underline font-bold text-xs">DETAILS</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="text-center py-16 text-slate-500 italic">No requests found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedRequest && <RequestDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
        </div>
    );
};

export default AdminProductRequestsPage;
