
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { ProblemReport } from '../types';
import Spinner from '../components/Spinner';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { PhotoIcon } from '../components/icons/PhotoIcon';

interface AdminProblemReportsPageProps {
    navigate: (path: string) => void;
}

const ReportDetailsModal: React.FC<{ report: ProblemReport; onClose: () => void }> = ({ report, onClose }) => {
    const [viewingImage, setViewingImage] = useState(false);

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto" onClick={onClose}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] mb-10" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-800">Report Details</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 overflow-y-auto text-slate-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Info</h3>
                            <p className="mb-1"><span className="font-bold text-slate-700 text-sm">Type:</span> <span className="text-slate-800 font-medium">{report.type}</span></p>
                            <p className="mb-1"><span className="font-bold text-slate-700 text-sm">Status:</span> <span className={`font-bold ${report.status === 'New' ? 'text-rose-600' : 'text-green-600'}`}>{report.status}</span></p>
                            <p><span className="font-bold text-slate-700 text-sm">Date:</span> <span className="text-slate-800">{new Date(report.createdAt).toLocaleString()}</span></p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">User</h3>
                            <p className="text-slate-800 font-medium">{report.userEmail || 'Anonymous'}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-2">Description</h3>
                        <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed shadow-sm">{report.description}</p>
                    </div>

                    {report.screenshotUrl && (
                        <div>
                            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-2">Screenshot</h3>
                            <div
                                className="relative group cursor-pointer border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all bg-slate-100"
                                onClick={() => setViewingImage(true)}
                            >
                                <img src={report.screenshotUrl} alt="Screenshot" className="w-full max-h-64 object-contain p-2" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <span className="bg-white text-slate-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg">Click to Enlarge</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold transition-colors shadow-sm">Close</button>
                </div>
            </div>

            {viewingImage && report.screenshotUrl && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingImage(false)}>
                    <button
                        onClick={() => setViewingImage(false)}
                        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                    >
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                    <img
                        src={report.screenshotUrl}
                        alt="Full Screenshot"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

const AdminProblemReportsPage: React.FC<AdminProblemReportsPageProps> = ({ navigate }) => {
    const [reports, setReports] = useState<ProblemReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<ProblemReport | null>(null);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await api.getProblemReports();
            setReports(data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleToggleStatus = async (report: ProblemReport) => {
        const newStatus = report.status === 'New' ? 'Reviewed' : 'New';
        try {
            await api.updateProblemReportStatus(report.id, newStatus);
            setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: newStatus } : r));
        } catch (error) {
            alert("Failed to update status.");
        }
    };

    return (
        <div className="animate-fade-in pb-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Problem Reports</h1>
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm font-bold text-slate-600 text-sm">
                    Total: {reports.length}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Type</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Description</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">User</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reports.length > 0 ? reports.map(report => (
                                        <tr key={report.id} className="hover:bg-slate-50 transition-colors bg-white">
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">{report.type}</td>
                                            <td className="px-6 py-4 max-w-xs truncate text-slate-600">{report.description}</td>
                                            <td className="px-6 py-4 text-slate-500">{report.userEmail || 'Anonymous'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full border ${report.status === 'New' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-green-50 text-green-600 border-green-200'
                                                    }`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedReport(report)}
                                                        className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium transition-colors border border-transparent hover:border-blue-100"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(report)}
                                                        className={`px-3 py-1.5 rounded-lg font-medium text-xs border transition-colors ${report.status === 'New'
                                                            ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100'
                                                            : 'text-slate-500 border-slate-200 bg-slate-50 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        {report.status === 'New' ? 'Mark Reviewed' : 'Mark New'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="text-center py-16 text-slate-500 italic">No reports found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {reports.length > 0 ? reports.map(report => (
                            <div key={report.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="text-xs font-medium text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                                        <h3 className="font-bold text-slate-800 text-lg">{report.type}</h3>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${report.status === 'New' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-green-50 text-green-600 border-green-200'
                                        }`}>
                                        {report.status}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-600 mb-4 line-clamp-2 bg-slate-50 p-3 rounded-lg border border-slate-100">{report.description}</p>

                                <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                        {report.screenshotUrl && <PhotoIcon className="w-4 h-4 text-blue-500" />}
                                        {report.userEmail ? 'User Report' : 'Anonymous'}
                                    </span>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedReport(report)}
                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100 active:scale-95 transition-transform"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(report)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold border active:scale-95 transition-transform ${report.status === 'New' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                                }`}
                                        >
                                            {report.status === 'New' ? 'Done' : 'Undo'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200">No reports found.</div>
                        )}
                    </div>
                </>
            )}

            {selectedReport && (
                <ReportDetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />
            )}
        </div>
    );
};

export default AdminProblemReportsPage;
