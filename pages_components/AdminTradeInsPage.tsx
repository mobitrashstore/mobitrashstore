
// ... existing imports ...
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { TradeIn } from '../types';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import Spinner from '../components/Spinner';
import { DevicePhoneMobileIcon } from '../components/icons/DevicePhoneMobileIcon';
import { InformationCircleIcon } from '../components/icons/InformationCircleIcon';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { sendEmail, getSellOfferEmailTemplate } from '../services/email';

interface AdminTradeInsPageProps {
    navigate: (path: string) => void;
}

// ... (Keep Modal Components: UpdateStatusModal, TradeInDetailsModal) ...
// ... (Code for modals remains the same) ...
const UpdateStatusModal: React.FC<{
    tradeIn: TradeIn;
    onClose: () => void;
    onSave: (tradeInId: string, newStatus: TradeIn['status']) => void;
}> = ({ tradeIn, onClose, onSave }) => {
    // ... implementation ...
    const [status, setStatus] = useState<TradeIn['status']>(tradeIn.status);

    const handleSave = () => {
        onSave(tradeIn.id, status);
    };

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto" onClick={onClose}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden mb-10 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Update Status</h2>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{tradeIn.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-6 bg-white">
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Device Info</p>
                        <p className="font-bold text-slate-800 text-lg">{tradeIn.device}</p>
                        <p className="text-sm text-slate-600 mt-1">Quote: <span className="font-bold text-amber-600">NPR {tradeIn.quote.toLocaleString()}</span ></p>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-bold text-slate-700 mb-2">Current Status</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as TradeIn['status'])}
                            className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-800 focus:ring-amber-500 focus:border-amber-500 text-base"
                        >
                            <option>Pending Pickup</option>
                            <option>Inspecting</option>
                            <option>Completed</option>
                        </select>
                    </div>
                </div>
                <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button onClick={handleSave} className="bg-amber-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-amber-700 shadow-md transition-all active:scale-95">
                        Save Update
                    </button>
                </div>
            </div>
        </div>
    );
};

const TradeInDetailsModal: React.FC<{
    tradeIn: TradeIn;
    onClose: () => void;
}> = ({ tradeIn, onClose }) => {
    // ... implementation ...
    const condition = tradeIn.condition;

    const formatLabel = (key: string) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const renderConditionRow = (label: string, value: any, isBad: boolean) => (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <span className={`text-sm font-bold ${isBad ? 'text-rose-600' : 'text-slate-800'}`}>
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
            </span>
        </div>
    );

    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto" onClick={onClose}>
            {selectedImg && (
                <div 
                    className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedImg(null)}
                >
                    <img src={selectedImg} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                    <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                </div>
            )}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] mb-10" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Request Details</h2>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Reference: {tradeIn.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-white custom-scrollbar space-y-6">

                    {/* Top Info Card ... */}
                    {/* (rest of the content remains same, we update the onClick below) */}

                    {/* Top Info Card */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Customer</p>
                            <p className="font-bold text-slate-800">{tradeIn.customerName}</p>
                            <p className="text-xs text-slate-500">{tradeIn.customerEmail}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase">Device Quote</p>
                            <p className="font-black text-amber-600 text-xl">NPR {tradeIn.quote.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 font-medium">{tradeIn.device}</p>
                        </div>
                    </div>

                    {/* Condition Details */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <InformationCircleIcon className="w-4 h-4 text-slate-400" />
                            Reported Condition
                        </h3>

                        {condition ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-100 pb-1">Screen & Body</h4>
                                    {renderConditionRow('Screen Cracks', condition.screen_cracks, condition.screen_cracks !== 'none')}
                                    {renderConditionRow('LCD Damage', condition.lcd_damage, condition.lcd_damage !== 'none')}
                                    {renderConditionRow('Back Glass', condition.back_glass, condition.back_glass !== 'ok')}
                                    {renderConditionRow('Scratches', condition.minor_scratches, condition.minor_scratches)}
                                </div>

                                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-100 pb-1">Functionality</h4>
                                    {renderConditionRow('Powers On', condition.powers_on, !condition.powers_on)}
                                    {renderConditionRow('Battery Health', `${condition.battery_health_pct}%`, condition.battery_health_pct < 80)}
                                    {renderConditionRow('FaceID / TouchID', condition.face_id_touch_id, condition.face_id_touch_id !== 'ok')}
                                    {renderConditionRow('Camera', condition.camera, condition.camera !== 'ok')}
                                    {renderConditionRow('Buttons', condition.buttons, condition.buttons !== 'ok')}
                                </div>

                                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm md:col-span-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-100 pb-1">Other</h4>
                                    {renderConditionRow('Water Damage', condition.water_damage, condition.water_damage !== 'none')}
                                    {renderConditionRow('Unlocked / MDMS', condition.factory_unlocked_mdms_free, !condition.factory_unlocked_mdms_free)}
                                    {renderConditionRow('IMEI Status', condition.imei_status, condition.imei_status !== 'clean')}
                                    {renderConditionRow('Age', `${condition.age_months} months`, false)}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
                                <p className="text-slate-500 italic">No detailed condition report available for this request.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Device Images */}
                    {tradeIn.deviceImages && tradeIn.deviceImages.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Device Photos</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {tradeIn.deviceImages.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm cursor-zoom-in group">
                                        <img 
                                            src={img} 
                                            alt={`Device ${idx + 1}`} 
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                            onClick={() => setSelectedImg(img)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
                <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button onClick={onClose} className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-slate-800 shadow-md transition-all active:scale-95">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminTradeInsPage: React.FC<AdminTradeInsPageProps> = ({ navigate }) => {
    const [tradeIns, setTradeIns] = useState<TradeIn[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTradeIn, setEditingTradeIn] = useState<TradeIn | null>(null);
    const [viewingTradeIn, setViewingTradeIn] = useState<TradeIn | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Load Search
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) setSearchQuery(q);

        const fetchTradeIns = async () => {
            setLoading(true);
            const allTradeIns = await api.getTradeIns();
            setTradeIns(allTradeIns);
            setLoading(false);
        };
        fetchTradeIns();
    }, []);


    const getStatusColor = (status: TradeIn['status']) => {
        switch (status) {
            case 'Pending Pickup': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Inspecting': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Completed': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const handleStatusSave = async (tradeInId: string, newStatus: TradeIn['status']) => {
        const tradeIn = tradeIns.find(t => t.id === tradeInId);
        if (!tradeIn) return;

        await api.updateTradeIn(tradeInId, { status: newStatus });
        
        // --- SEND STATUS EMAIL TO CUSTOMER ---
        sendEmail({
            to: tradeIn.customerEmail,
            subject: `Update on your Sell Request: ${tradeIn.device}`,
            body: getSellOfferEmailTemplate({
                customerName: tradeIn.customerName,
                customerEmail: tradeIn.customerEmail,
                customerPhone: '', // Not needed for status update as much
                device: tradeIn.device,
                quote: tradeIn.quote,
                status: newStatus,
                isAdminView: false
            })
        }).catch(e => console.error("Status update email failed", e));

        setTradeIns(prev => prev.map(t => t.id === tradeInId ? { ...t, status: newStatus } : t));
        setEditingTradeIn(null);
    };

    const filteredTradeIns = tradeIns.filter(t =>
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.device.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-fade-in pb-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sale Requests</h1>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 font-medium text-slate-600">
                    Total: <span className="text-slate-900 font-bold">{tradeIns.length}</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search requests by ID, Device, or Customer..."
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
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Request ID</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Customer</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Device Info</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Quote</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTradeIns.length > 0 ? filteredTradeIns.map(trade => (
                                        <tr key={trade.id} className="bg-white hover:bg-slate-50 transition-colors group">
                                            <th scope="row" className="px-6 py-4 font-mono text-xs text-slate-500 transition-colors">{trade.id}</th>
                                            <td className="px-6 py-4 font-medium text-slate-800">{trade.customerName}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <DevicePhoneMobileIcon className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-600">{trade.device}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">NPR {trade.quote.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(trade.status)}`}>
                                                    {trade.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => setViewingTradeIn(trade)}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingTradeIn(trade)}
                                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
                                                    >
                                                        Update Status
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="text-center py-16 text-slate-500 italic">No sale requests found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {filteredTradeIns.length > 0 ? filteredTradeIns.map(trade => (
                            <div key={trade.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Request ID</span>
                                        <h3 className="font-mono text-sm font-bold text-slate-600">{trade.id}</h3>
                                    </div>
                                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(trade.status)}`}>
                                        {trade.status}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-5">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Device</p>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-slate-100 rounded-md text-slate-500">
                                                <DevicePhoneMobileIcon className="w-4 h-4" />
                                            </div>
                                            <p className="font-bold text-slate-800 text-sm">{trade.device}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                                        <div>
                                            <p className="text-xs text-slate-500">Customer</p>
                                            <p className="font-medium text-slate-800 text-sm">{trade.customerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 text-right">Quote</p>
                                            <p className="font-extrabold text-amber-600 text-lg">NPR {trade.quote.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setViewingTradeIn(trade)}
                                        className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors border border-slate-200 active:scale-[0.98]"
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => setEditingTradeIn(trade)}
                                        className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl text-sm transition-colors border border-amber-200 active:scale-[0.98]"
                                    >
                                        Status
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200">No sale requests found.</div>
                        )}
                    </div>
                </>
            )}

            {editingTradeIn && (
                <UpdateStatusModal
                    tradeIn={editingTradeIn}
                    onClose={() => setEditingTradeIn(null)}
                    onSave={handleStatusSave}
                />
            )}

            {viewingTradeIn && (
                <TradeInDetailsModal
                    tradeIn={viewingTradeIn}
                    onClose={() => setViewingTradeIn(null)}
                />
            )}
        </div>
    );
};

export default AdminTradeInsPage;
