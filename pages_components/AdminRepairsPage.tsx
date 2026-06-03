import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import { RepairBooking } from '../types';
import Spinner from '../components/Spinner';
import { ClipboardDocumentListIcon } from '../components/icons/ClipboardDocumentListIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { WrenchIcon } from '../components/icons/WrenchIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';

interface AdminRepairsPageProps {
    navigate: (path: string) => void;
}

const RepairDetailsModal: React.FC<{ booking: RepairBooking; onClose: () => void }> = ({ booking, onClose }) => {
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto" onClick={onClose}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden mb-10" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Repair Details</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto bg-white text-slate-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Customer Info</h3>
                            <div className="space-y-2">
                                <p><span className="text-sm text-slate-500">Name:</span> <span className="font-bold text-slate-800">{booking.customerName}</span></p>
                                <p><span className="text-sm text-slate-500">Phone:</span> <span className="font-medium text-slate-700">{booking.phone}</span></p>
                                <p><span className="text-sm text-slate-500">Date:</span> <span className="font-medium text-slate-700">{booking.appointmentDate}</span></p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Device Info</h3>
                            <div className="space-y-2">
                                <p><span className="text-sm text-slate-500">Model:</span> <span className="font-bold text-slate-800">{booking.deviceModel}</span></p>
                                <p><span className="text-sm text-slate-500">Issue:</span> <span className="font-medium text-amber-600">{booking.issueType}</span></p>
                                <p><span className="text-sm text-slate-500">Status:</span> <span className="font-bold text-slate-800">{booking.status}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-2">Problem Description</h3>
                        <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                            {booking.description || <span className="italic text-slate-400">No description provided.</span>}
                        </p>
                    </div>

                    {booking.issueImages && booking.issueImages.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-3">Uploaded Images</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {booking.issueImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setViewingImage(img)}
                                        className="block border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative aspect-square bg-slate-50"
                                    >
                                        <img src={img} alt={`Issue ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">View</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-xl font-bold transition-colors shadow-sm">Close Details</button>
                </div>
            </div>

            {viewingImage && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingImage(null)}>
                    <button onClick={() => setViewingImage(null)} className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors">
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                    <img src={viewingImage} alt="Full Preview" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
};


const AdminRepairsPage: React.FC<AdminRepairsPageProps> = ({ navigate }) => {
    const [bookings, setBookings] = useState<RepairBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<RepairBooking | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.getRepairBookings();
            setBookings(data);
        } catch (error) {
            console.error("Failed to fetch repair bookings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusChange = async (booking: RepairBooking, newStatus: RepairBooking['status']) => {
        if (newStatus === 'Completed' && booking.status !== 'Completed') {
            const costStr = window.prompt("Enter the final repair cost (NPR). This will be logged as revenue.", "");
            if (costStr === null) return; // User cancelled

            const cost = Number(costStr);
            if (isNaN(cost) || cost < 0) {
                alert("Please enter a valid, non-negative number for the cost.");
                return;
            }

            try {
                // Log revenue to offlineSales
                await api.addOfflineSale({
                    itemId: booking.id,
                    itemName: `Repair: ${booking.deviceModel}`,
                    quantity: 1,
                    pricePerUnit: cost,
                    total: cost,
                    date: new Date().toISOString(),
                    category: 'Repair Service',
                    shopLocation: 'Townplanning' // Default to main shop or could be selectable
                });

                // Update booking status
                await api.updateRepairBookingStatus(booking.id, newStatus);
                alert("Repair marked as complete and revenue recorded!");
                fetchData(); // Refresh data
            } catch (error) {
                console.error("Failed to complete repair", error);
                alert("An error occurred. Please check console and try again.");
            }
        } else {
            // For other status changes (e.g., Confirmed, Cancelled)
            await api.updateRepairBookingStatus(booking.id, newStatus);
            setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));
        }
    };

    const getStatusStyles = (status: RepairBooking['status']) => {
        switch (status) {
            case 'Pending': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Confirmed': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="animate-fade-in space-y-6 pb-10">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Repair Bookings</h1>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 font-medium text-slate-600">
                    Active: <span className="text-slate-900 font-bold">{bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').length}</span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="w-12 h-12" /></div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Customer</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Device & Issue</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {bookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors bg-white">
                                        <td className="px-6 py-4 font-medium text-slate-500">{booking.appointmentDate}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{booking.customerName}</p>
                                            <p className="text-xs text-slate-500">{booking.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-700 text-sm">{booking.deviceModel}</p>
                                            <p className="text-xs text-amber-600 font-medium">{booking.issueType}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyles(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2 items-center">
                                                <select
                                                    value={booking.status}
                                                    onChange={e => handleStatusChange(booking, e.target.value as RepairBooking['status'])}
                                                    className="text-xs bg-white border-slate-300 text-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500 py-1.5"
                                                >
                                                    <option>Pending</option>
                                                    <option>Confirmed</option>
                                                    <option>Completed</option>
                                                    <option>Cancelled</option>
                                                </select>
                                                <button onClick={() => setSelectedBooking(booking)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-colors" title="View Details">
                                                    <ClipboardDocumentListIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {bookings.map(booking => (
                            <div key={booking.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{booking.customerName}</h3>
                                        <p className="text-xs text-slate-500">{booking.appointmentDate} • {booking.phone}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyles(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                                    <p className="text-sm font-bold text-slate-700">{booking.deviceModel}</p>
                                    <p className="text-xs text-amber-600 font-semibold mt-0.5">{booking.issueType}</p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <select
                                        value={booking.status}
                                        onChange={e => handleStatusChange(booking, e.target.value as RepairBooking['status'])}
                                        className="flex-grow text-sm bg-white border-slate-300 text-slate-700 rounded-xl focus:ring-amber-500 focus:border-amber-500 font-medium"
                                    >
                                        <option>Pending</option>
                                        <option>Confirmed</option>
                                        <option>Completed</option>
                                        <option>Cancelled</option>
                                    </select>
                                    <button
                                        onClick={() => setSelectedBooking(booking)}
                                        className="p-2.5 bg-white text-blue-600 rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-95 transition-transform"
                                    >
                                        <ClipboardDocumentListIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {bookings.length === 0 && (
                        <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200">
                            No repair bookings found.
                        </div>
                    )}
                </>
            )}

            {selectedBooking && <RepairDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
        </div>
    );
};

export default AdminRepairsPage;
