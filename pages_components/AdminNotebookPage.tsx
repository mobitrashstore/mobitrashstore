
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as api from '../services/api';
import { NotebookEntry } from '../types';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';
import { ListBulletIcon } from '../components/icons/ListBulletIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import Spinner from '../components/Spinner';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { WhatsAppIcon } from '../components/icons/WhatsAppIcon';
import { ExclamationTriangleIcon } from '../components/icons/ExclamationTriangleIcon';
import { ArrowPathIcon } from '../components/icons/ArrowPathIcon';

type ShopLocation = 'Townplanning' | 'Nayabazar';

interface AdminNotebookPageProps {
    navigate: (path: string) => void;
    shopLocation: ShopLocation;
}

const NotebookModal: React.FC<{
    entry: Partial<NotebookEntry> | null;
    shopLocation: ShopLocation;
    onClose: () => void;
    onSave: (entry: Omit<NotebookEntry, 'id'> | NotebookEntry) => Promise<void>;
}> = ({ entry, shopLocation, onClose, onSave }) => {
    const isEditMode = !!entry?.id;
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        productName: '',
        totalAmount: 0,
        paidAmount: 0,
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
        // Initialize with prop but allow override if entry exists
        shopLocation: shopLocation,
        ...entry
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name.includes('Amount') ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const dueAmount = formData.totalAmount - formData.paidAmount;
        let status: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';

        if (formData.paidAmount >= formData.totalAmount) status = 'Paid';
        else if (formData.paidAmount > 0) status = 'Partial';

        // Explicitly enforce shopLocation from prop if not set, or preserve from formData
        const payload = {
            ...formData,
            dueAmount,
            status,
            shopLocation: formData.shopLocation || shopLocation
        };

        try {
            await onSave(payload as NotebookEntry);
        } catch (error: any) {
            console.error("Error saving record:", error);
            alert(`Failed to save record: ${error.message || 'Unknown error'}.`);
        } finally {
            setIsSaving(false);
        }
    };

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col mb-10" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Record' : 'Add Credit Record'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto bg-white custom-scrollbar">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-600 font-semibold mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Location: {shopLocation}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Customer Name</label>
                            <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow" placeholder="Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow" placeholder="98..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1.5">Product / Service</label>
                        <input type="text" name="productName" value={formData.productName} onChange={handleChange} required className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow" placeholder="e.g. iPhone 13 Repair" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Total Amount</label>
                            <input type="number" name="totalAmount" value={formData.totalAmount || ''} onChange={handleChange} required className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-bold" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Paid Amount</label>
                            <input type="number" name="paidAmount" value={formData.paidAmount || ''} onChange={handleChange} required className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-bold" />
                        </div>
                    </div>
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                        <p className="flex justify-between font-bold text-slate-700">
                            <span>Balance Due:</span>
                            <span className="text-rose-600 text-lg">NPR {(formData.totalAmount - formData.paidAmount).toLocaleString()}</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Purchase Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">Due Date (Promise)</label>
                            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1.5">Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full p-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Additional details..." />
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-amber-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-amber-700 shadow-md transition-all active:scale-95 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InvoiceModal: React.FC<{
    entry: NotebookEntry;
    shopLocation: ShopLocation;
    onClose: () => void;
}> = ({ entry, shopLocation, onClose }) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const shopPhone = shopLocation === 'Townplanning' ? '9827801575' : '9812141777';
    const shopAddress = shopLocation === 'Townplanning' ? 'Townplanning, Kirtipur, Kathmandu' : 'Naya Bazar, Kirtipur, Kathmandu';
    const shopName = `Mobi Store Tech - ${shopLocation}`;

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        const text = `
*INVOICE - ${shopName}*
--------------------------------
*Customer:* ${entry.customerName}
*Product:* ${entry.productName}
*Date:* ${entry.date}
*Invoice ID:* ${entry.id.slice(0, 8).toUpperCase()}

*Total:* NPR ${entry.totalAmount.toLocaleString()}
*Paid:* NPR ${entry.paidAmount.toLocaleString()}
*Due:* NPR ${entry.dueAmount.toLocaleString()}
--------------------------------
Thank you for visiting our store!
Contact: ${shopPhone}
        `.trim();

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto invoice-overlay">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 mb-10">
                {/* Modal Header (Not Printed) */}
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl no-print">
                    <h2 className="text-lg font-bold text-slate-800">Generated Invoice</h2>
                    <button onClick={onClose} className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-slate-800 shadow-sm transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Invoice Content (Printed) */}
                <div className="flex-1 overflow-y-auto p-8 bg-white print-area" ref={componentRef} id="invoice-print-section">

                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                        <div>
                            <img src="https://ik.imagekit.io/fixedmyspeaker/main%20logo.PNG" alt="Logo" className="h-12 object-contain mb-2" />
                            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">{shopName}</h1>
                            <p className="text-slate-600 text-sm mt-1">{shopAddress}</p>
                            <p className="text-slate-600 text-sm">Phone: {shopPhone}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-light text-slate-300 uppercase tracking-widest">INVOICE</h2>
                            <p className="font-bold text-slate-800 mt-2">#${entry.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-sm text-slate-500">Date: {entry.date}</p>
                            <p className="text-sm text-slate-500">Due Date: {entry.dueDate || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
                        <p className="text-xl font-bold text-slate-900">{entry.customerName}</p>
                        <p className="text-slate-600 font-medium">{entry.phone}</p>
                    </div>

                    {/* Line Items */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b border-slate-300">
                                <th className="text-left py-3 text-sm font-bold text-slate-600 uppercase">Description</th>
                                <th className="text-right py-3 text-sm font-bold text-slate-600 uppercase">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-100">
                                <td className="py-4 text-slate-800 font-medium">{entry.productName}</td>
                                <td className="py-4 text-right text-slate-800 font-bold">NPR {entry.totalAmount.toLocaleString()}</td>
                            </tr>
                            {entry.notes && (
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 text-slate-500 text-sm italic" colSpan={2}>Note: {entry.notes}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-full sm:w-1/2 space-y-3">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-medium">NPR {entry.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-orange-600 font-medium">
                                <span>Paid Amount</span>
                                <span>- NPR {entry.paidAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-slate-900 border-t-2 border-slate-800 pt-3 mt-2">
                                <span>Balance Due</span>
                                <span className={entry.dueAmount > 0 ? "text-rose-600" : "text-orange-600"}>NPR {entry.dueAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 pt-10 flex justify-between items-end">
                        <div className="pb-2">
                            <p className="text-slate-700 font-bold text-lg italic">Thank you for your business!</p>
                            <p className="text-xs text-slate-500 mt-1">Please make checks payable to {shopName}</p>
                        </div>
                        <div className="text-center relative w-48">
                            <img
                                src="https://ik.imagekit.io/fixedmyspeaker/Company%20stamp"
                                alt="Company Stamp"
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-auto mix-blend-multiply opacity-90 -rotate-6 pointer-events-none"
                            />
                            <div className="border-t-2 border-slate-800 pt-2 z-10 relative">
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions (Not Printed) */}
                <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 rounded-b-2xl no-print">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-100 text-orange-700 rounded-xl font-bold hover:bg-orange-200 transition-colors border border-orange-200"
                    >
                        <WhatsAppIcon className="w-5 h-5" /> Share via WhatsApp
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
                    >
                        <DocumentTextIcon className="w-5 h-5" /> Print / PDF
                    </button>
                </div>
            </div>

            <style>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .invoice-overlay, .invoice-overlay * {
                        visibility: visible;
                    }
                    .invoice-overlay {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: auto;
                        background: white !important;
                    }
                    .invoice-overlay > div { 
                        height: auto !important;
                        max-height: none !important;
                        box-shadow: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                        background: white !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-area {
                        overflow: visible !important;
                        height: auto !important;
                        display: block !important;
                        box-shadow: none !important;
                        background: white !important;
                    }
                    .print-area img {
                        mix-blend-mode: normal !important;
                        opacity: 1 !important;
                    }
                }
            `}</style>
        </div>
    );
};

const CalendarView: React.FC<{ entries: NotebookEntry[], onSelectDate: (date: string) => void }> = ({ entries, onSelectDate }) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const renderDays = () => {
        const days = [];
        // Empty slots for previous month days
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50 border border-slate-100 hidden sm:block"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            // Use local date format YYYY-MM-DD
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dueEntries = entries.filter(e => e.dueDate === dateStr && e.status !== 'Paid');

            const d = new Date();
            const isToday = i === d.getDate() && currentMonth === d.getMonth() && currentYear === d.getFullYear();

            days.push(
                <div
                    key={i}
                    onClick={() => dueEntries.length > 0 && onSelectDate(dateStr)}
                    className={`h-20 sm:h-24 border border-slate-100 p-1.5 relative transition-all overflow-hidden 
                        ${isToday ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-white'} 
                        ${dueEntries.length > 0 ? 'cursor-pointer hover:bg-amber-50' : ''}`}
                >
                    <span className={`text-xs sm:text-sm font-bold ${isToday ? 'text-blue-600 bg-blue-100 px-1.5 rounded' : 'text-slate-500'}`}>{i}</span>
                    {dueEntries.length > 0 && (
                        <div className="mt-1.5 space-y-1">
                            <div className="text-[10px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-md truncate border border-rose-200">
                                {dueEntries.length} Due
                            </div>
                            <div className="hidden sm:block space-y-1">
                                {dueEntries.slice(0, 2).map(entry => (
                                    <div key={entry.id} className="text-[10px] text-slate-600 truncate bg-slate-100 px-1 rounded">
                                        {entry.customerName}
                                    </div>
                                ))}
                                {dueEntries.length > 2 && <div className="text-[9px] text-slate-400 pl-1">+{dueEntries.length - 2} more</div>}
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-100">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg text-slate-600 font-bold shadow-sm transition-colors border border-transparent hover:border-slate-200">&lt;</button>
                <h3 className="font-bold text-lg text-slate-800">{monthNames[currentMonth]} {currentYear}</h3>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg text-slate-600 font-bold shadow-sm transition-colors border border-transparent hover:border-slate-200">&gt;</button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 bg-slate-50 py-2 border-b border-slate-100 uppercase tracking-wide">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 bg-slate-100 gap-px border-l border-t border-slate-100">
                {renderDays()}
            </div>
        </div>
    );
};

const AdminNotebookPage: React.FC<AdminNotebookPageProps> = ({ navigate, shopLocation }) => {
    const [entries, setEntries] = useState<NotebookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Partial<NotebookEntry> | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [selectedInvoiceEntry, setSelectedInvoiceEntry] = useState<NotebookEntry | null>(null);
    const [isMigrating, setIsMigrating] = useState(false);

    const fetchEntries = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getNotebookEntries();
            const filtered = data.filter(e => {
                const loc = e.shopLocation || 'Townplanning';
                return loc === shopLocation;
            });
            setEntries(filtered);
        } catch (error: any) {
            console.error("Failed to fetch notebook entries", error);
            setError(`Failed to load data: ${error.message || 'Permission denied? Check Rules.'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [shopLocation]);

    const handleSaveEntry = async (entryToSave: Omit<NotebookEntry, 'id'> | NotebookEntry) => {
        if ('id' in entryToSave && entryToSave.id) {
            await api.updateNotebookEntry(entryToSave.id, entryToSave);
        } else {
            await api.addNotebookEntry(entryToSave);
        }
        await fetchEntries();
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this record?")) {
            try {
                await api.deleteNotebookEntry(id);
                await fetchEntries();
            } catch (e) {
                alert("Failed to delete. Check permissions.");
            }
        }
    };

    const handleMarkPaid = async (entry: NotebookEntry) => {
        if (confirm(`Mark ${entry.customerName}'s record as fully paid?`)) {
            try {
                await api.updateNotebookEntry(entry.id, {
                    paidAmount: entry.totalAmount,
                    dueAmount: 0,
                    status: 'Paid'
                });
                await fetchEntries();
            } catch (e) {
                alert("Failed to update.");
            }
        }
    };

    // --- MIGRATION HANDLER ---
    const handleRecoverData = async () => {
        if (!confirm("Are you sure? This will attempt to copy data from the OLD database location to the NEW one. Use this if you are missing previous records.")) return;

        setIsMigrating(true);
        try {
            const result = await api.migrateKhataData();
            if (result.count > 0) {
                alert(`Successfully recovered ${result.count} records! Refreshing...`);
                await fetchEntries();
            } else {
                alert("No old data found to recover.");
            }
        } catch (e: any) {
            alert(`Recovery failed: ${e.message}`);
        } finally {
            setIsMigrating(false);
        }
    };

    const stats = useMemo(() => {
        const totalDue = entries.reduce((acc, curr) => acc + (curr.status !== 'Paid' ? curr.dueAmount : 0), 0);
        const collected = entries.reduce((acc, curr) => acc + curr.paidAmount, 0);
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const dueToday = entries.filter(e => e.dueDate === todayStr && e.status !== 'Paid').length;
        return { totalDue, collected, dueToday };
    }, [entries]);

    const filteredEntries = useMemo(() => {
        return entries.filter(e => {
            const matchesSearch = e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || e.phone.includes(searchQuery);
            const matchesStatus = filterStatus === 'All' || e.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [entries, searchQuery, filterStatus]);

    const headerColorClass = shopLocation === 'Townplanning' ? 'text-amber-600' : 'text-purple-600';
    const btnColorClass = shopLocation === 'Townplanning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700';

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">Khata ({shopLocation})</h1>
                    <p className={`text-sm font-bold ${headerColorClass}`}>Customer Credit Ledger</p>
                </div>
                <div className="flex gap-3">
                    {/* Recovery Button */}
                    <button
                        onClick={handleRecoverData}
                        disabled={isMigrating}
                        className="bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 hover:bg-slate-300 transition-colors text-xs"
                    >
                        {isMigrating ? <Spinner size="w-4 h-4" /> : <ArrowPathIcon className="w-4 h-4" />}
                        Recover Old Data
                    </button>

                    <button
                        onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}
                        className={`${btnColorClass} text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all transform hover:scale-105 w-full md:w-auto justify-center`}
                    >
                        <PlusCircleIcon className="w-5 h-5" /> Add Record
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-rose-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-rose-800">System Error</h3>
                        <p className="text-sm text-rose-700">{error}</p>
                        <button onClick={fetchEntries} className="text-xs font-bold underline mt-1 text-rose-800 hover:text-rose-900">Retry Fetching</button>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-1">Total Due</p>
                    <p className="text-3xl font-black text-rose-500 tracking-tight">NPR {stats.totalDue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-1">Collected</p>
                    <p className="text-3xl font-black text-orange-600 tracking-tight">NPR {stats.collected.toLocaleString()}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-1">Due Today</p>
                    <p className={`text-3xl font-black tracking-tight ${headerColorClass}`}>{stats.dueToday} <span className="text-lg text-slate-400 font-medium">Payments</span></p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto border border-slate-200">
                    <button onClick={() => setViewMode('list')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                        <ListBulletIcon className="w-4 h-4" /> List
                    </button>
                    <button onClick={() => setViewMode('calendar')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                        <CalendarDaysIcon className="w-4 h-4" /> Calendar
                    </button>
                </div>

                {viewMode === 'list' && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <div className="relative flex-grow w-full">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search customer by name or phone..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow text-slate-800 placeholder-slate-400"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 w-full sm:w-auto focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partial">Partial</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="w-12 h-12" /></div>
            ) : viewMode === 'list' ? (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider">Customer</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Product</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Due Date</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Amount Due</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredEntries.length > 0 ? filteredEntries.map(entry => (
                                        <tr key={entry.id} className="bg-white hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800">{entry.customerName}</p>
                                                <a href={`tel:${entry.phone}`} className="text-xs text-amber-600 hover:underline flex items-center gap-1 mt-0.5 font-medium">
                                                    <PhoneIcon className="w-3 h-3" /> {entry.phone}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-600" title={entry.productName}>{entry.productName}</td>
                                            <td className="px-6 py-4">
                                                <span className={entry.dueDate && new Date(entry.dueDate) < new Date() && entry.status !== 'Paid' ? 'text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded' : 'text-slate-500'}>
                                                    {entry.dueDate || 'No Date'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                {entry.status === 'Paid' ? <span className="text-orange-600 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" /> Paid</span> : `NPR ${entry.dueAmount.toLocaleString()}`}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border 
                                                    ${entry.status === 'Paid' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                        entry.status === 'Partial' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                            'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                                    {entry.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => setSelectedInvoiceEntry(entry)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Invoice">
                                                        <DocumentTextIcon className="w-5 h-5" />
                                                    </button>
                                                    {entry.status !== 'Paid' && (
                                                        <button onClick={() => handleMarkPaid(entry)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Mark Paid">
                                                            <CheckCircleIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => { setEditingEntry(entry); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(entry.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="text-center py-16 text-slate-500 italic">No records found matching your search.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {filteredEntries.length > 0 ? filteredEntries.map(entry => (
                            <div key={entry.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{entry.customerName}</h3>
                                        <a href={`tel:${entry.phone}`} className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                                            <PhoneIcon className="w-3 h-3" /> {entry.phone}
                                        </a>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border 
                                        ${entry.status === 'Paid' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                            entry.status === 'Partial' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                        {entry.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="col-span-2">
                                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Product</span>
                                        <span className="font-medium text-slate-700">{entry.productName}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Due Date</span>
                                        <span className={entry.dueDate && new Date(entry.dueDate) < new Date() && entry.status !== 'Paid' ? 'text-rose-600 font-bold' : 'font-medium text-slate-600'}>
                                            {entry.dueDate || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Due Amount</span>
                                        <span className="font-extrabold text-slate-800">NPR {entry.dueAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button onClick={() => setSelectedInvoiceEntry(entry)} className="p-2 text-slate-500 bg-white hover:bg-slate-50 rounded-xl active:scale-95 transition-all border border-slate-200">
                                        <DocumentTextIcon className="w-5 h-5" />
                                    </button>
                                    {entry.status !== 'Paid' && (
                                        <button onClick={() => handleMarkPaid(entry)} className="flex items-center gap-1 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold border border-orange-100 active:scale-95 transition-transform">
                                            <CheckCircleIcon className="w-4 h-4" /> Paid
                                        </button>
                                    )}
                                    <button onClick={() => { setEditingEntry(entry); setIsModalOpen(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 active:scale-95 transition-transform">
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(entry.id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 active:scale-95 transition-transform">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200">No records found.</div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                    <p>Calendar view available on desktop or larger screens.</p>
                </div>
            )}

            {isModalOpen && (
                <NotebookModal
                    entry={editingEntry}
                    shopLocation={shopLocation}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveEntry}
                />
            )}

            {selectedInvoiceEntry && (
                <InvoiceModal
                    entry={selectedInvoiceEntry}
                    shopLocation={shopLocation}
                    onClose={() => setSelectedInvoiceEntry(null)}
                />
            )}
        </div>
    );
};

export default AdminNotebookPage;
