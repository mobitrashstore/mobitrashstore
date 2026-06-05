
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { User, BroadcastLog } from '../types';
import { sendEmail } from '../services/email';
import Spinner from '../components/Spinner';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from '../components/icons/ExclamationTriangleIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { ClockIcon } from '../components/icons/ClockIcon';

interface AdminBulkEmailPageProps {
    navigate: (path: string) => void;
}

const AdminBulkEmailPage: React.FC<AdminBulkEmailPageProps> = ({ navigate }) => {
    // Data State
    const [users, setUsers] = useState<User[]>([]);
    const [history, setHistory] = useState<BroadcastLog[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Form State
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [sendMode, setSendMode] = useState<'all' | 'selected'>('all');
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [userSearchQuery, setUserSearchQuery] = useState('');

    // Sending State
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'sending' | 'completed' | 'error'>('idle');
    const [results, setResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoadingUsers(true);
        setLoadingHistory(true);
        setFetchError(null);
        
        // Fetch Users
        try {
            console.log("Fetching users...");
            const allUsers = await api.getUsers();
            console.log("Users fetched:", allUsers?.length || 0);
            setUsers(allUsers || []);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setFetchError("Connection error while fetching users.");
        } finally {
            setLoadingUsers(false);
        }

        // Fetch History
        try {
            const allHistory = await api.getBroadcastLogs();
            setHistory(allHistory || []);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const allHistory = await api.getBroadcastLogs();
            setHistory(allHistory);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const toggleUserSelection = (userId: string) => {
        const newSelected = new Set(selectedUserIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUserIds(newSelected);
        if (newSelected.size > 0) setSendMode('selected');
    };

    const selectAllUsers = () => {
        setSelectedUserIds(new Set(users.map(u => u.id)));
        setSendMode('selected');
    };

    const deselectAllUsers = () => {
        setSelectedUserIds(new Set());
        setSendMode('all');
    };

    const handleSendBulkEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !content) {
            alert("Subject and Content are required.");
            return;
        }

        const targetUsers = sendMode === 'all' ? users : users.filter(u => selectedUserIds.has(u.id));

        if (targetUsers.length === 0) {
            alert("No users selected to send email to.");
            return;
        }

        const confirmSend = window.confirm(`This will send an email to ${targetUsers.length} users. Are you sure?`);
        if (!confirmSend) return;

        setIsSending(true);
        setStatus('sending');
        setProgress(0);
        setResults({ success: 0, failed: 0 });

        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < targetUsers.length; i++) {
            const user = targetUsers[i];
            try {
                await sendEmail({
                    to: user.email,
                    subject: subject,
                    body: content
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to send email to ${user.email}`, err);
                failedCount++;
            }
            
            const currentProgress = Math.round(((i + 1) / targetUsers.length) * 100);
            setProgress(currentProgress);
            setResults({ success: successCount, failed: failedCount });
            
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // Save to History
        try {
            await api.addBroadcastLog({
                subject,
                content,
                recipientCount: targetUsers.length,
                successCount,
                failedCount
            });
            await fetchHistory();
        } catch (err) {
            console.error("Failed to save broadcast log", err);
        }

        setIsSending(false);
        setStatus('completed');
    };

    const handleDeleteLog = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this broadcast record?")) return;
        try {
            await api.deleteBroadcastLog(id);
            setHistory(history.filter(log => log.id !== id));
        } catch (err) {
            alert("Failed to delete log");
        }
    };

    const handleReuse = (log: BroadcastLog) => {
        setSubject(log.subject);
        setContent(log.content);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleIndividualSend = (user: User) => {
        setSelectedUserIds(new Set([user.id]));
        setSendMode('selected');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <MegaphoneIcon className="w-8 h-8 text-amber-600" />
                        Bulk Email Broadcast
                    </h1>
                    <p className="text-slate-500 mt-1">Send marketing emails or updates to your users.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-blue-500" />
                        <span className="text-slate-600 font-medium">Potential Audience:</span>
                        <span className={`text-slate-900 font-bold ${users.length === 0 && !loadingUsers ? 'text-rose-600' : ''}`}>
                            {loadingUsers ? '...' : `${users.length} Users`}
                        </span>
                        {!loadingUsers && users.length === 0 && (
                            <button 
                                onClick={fetchInitialData}
                                className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded bg-slate-50 border border-slate-200"
                                title="Refresh Users"
                            >
                                <Spinner size="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    {fetchError && <p className="text-[10px] text-rose-500 font-bold uppercase">{fetchError}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Compose Message</h2>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => setSendMode('all')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sendMode === 'all' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
                                >
                                    To All ({users.length})
                                </button>
                                <button 
                                    onClick={() => setSendMode('selected')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sendMode === 'selected' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                                >
                                    To Selected ({selectedUserIds.size})
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSendBulkEmail} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="e.g. Big Sale this Weekend! 🎁"
                                    required
                                    disabled={isSending}
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                                    <span>Message Body (HTML enabled)</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spark Plan Friendly</span>
                                </label>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    rows={12}
                                    placeholder="Write your message here... You can use HTML tags like <b>, <br>, <p>, etc."
                                    required
                                    disabled={isSending}
                                    className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-mono text-sm text-slate-800 bg-slate-50/50"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={isSending || loadingUsers || !subject || !content || (sendMode === 'selected' && selectedUserIds.size === 0)}
                                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 md:py-3.5 px-4 md:px-6 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-lg whitespace-nowrap"
                                >
                                    {isSending ? (
                                        <>
                                            <Spinner size="w-4 h-4 md:w-5 md:h-5" />
                                            <span>Broadcasting... {progress}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <EnvelopeIcon className="w-5 h-5 md:w-6 md:h-6" />
                                            <span className="truncate">
                                                {sendMode === 'all' 
                                                    ? `Send to all ${users.length} Users` 
                                                    : `Send to ${selectedUserIds.size} Selected`}
                                            </span>
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/dashboard')}
                                    disabled={isSending}
                                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Status & Preview Section */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Status Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            Status Indicator
                        </h2>
                        
                        {status === 'idle' && (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <EnvelopeIcon className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500 text-sm">Waiting for broadcast command...</p>
                            </div>
                        )}

                        {status === 'sending' && (
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-blue-600">Sending Progress</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className="bg-blue-600 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                        <p className="text-[10px] uppercase font-bold text-orange-600/70 tracking-wider">Success</p>
                                        <p className="text-2xl font-black text-orange-700">{results.success}</p>
                                    </div>
                                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                                        <p className="text-[10px] uppercase font-bold text-rose-600/70 tracking-wider">Failed</p>
                                        <p className="text-2xl font-black text-rose-700">{results.failed}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 italic text-center">Do not close this window until finished.</p>
                            </div>
                        )}

                        {status === 'completed' && (
                            <div className="text-center py-4 space-y-4">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircleIcon className="w-10 h-10 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Broadcast Finished!</h3>
                                    <p className="text-sm text-slate-500">Successfully sent to {results.success} users.</p>
                                    {results.failed > 0 && <p className="text-sm text-rose-500 font-bold mt-1">{results.failed} emails failed.</p>}
                                </div>
                                <button 
                                    onClick={() => setStatus('idle')}
                                    className="w-full py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors"
                                >
                                    Start New
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quick Selection Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                             <UsersIcon className="w-5 h-5 text-blue-500" />
                             Quick Selection
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                             <button onClick={selectAllUsers} className="py-2 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">Select All</button>
                             <button onClick={deselectAllUsers} className="py-2 text-xs font-bold bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">Deselect All</button>
                        </div>
                        {selectedUserIds.size > 0 && (
                            <p className="text-[10px] text-blue-500 font-bold uppercase mt-3 text-center">{selectedUserIds.size} Users marked for delivery</p>
                        )}
                    </div>

                    {/* Pro Tips Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg text-white">
                        <h3 className="font-bold flex items-center gap-2 mb-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-300" />
                            Spark Plan Notice
                        </h3>
                        <div className="space-y-3 text-sm text-blue-100 leading-relaxed font-medium">
                            <p>• You are using the Google Apps Script (GAS) fallback for mailing.</p>
                            <p>• Daily quota: ~100 emails (Free Gmail) or ~1500 (Google Workspace).</p>
                            <p>• We recommend sending in small batches if you have thousands of users.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Preview Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Live Email Preview</h2>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">WYSIWYG Mode</span>
                </div>
                <div className="p-8 bg-slate-100 min-h-[300px] flex justify-center">
                    <div className="bg-white w-full max-w-2xl shadow-xl rounded-lg overflow-hidden border border-slate-200">
                        <div className="bg-slate-800 p-4 flex items-center gap-3">
                             <img src="https://ik.imagekit.io/fixedmyspeaker/main%20logo.PNG" className="h-6 w-auto" alt="Logo" />
                             <div className="h-4 w-px bg-slate-600"></div>
                             <span className="text-white text-xs font-bold tracking-tight uppercase">Mobi Store</span>
                        </div>
                        <div className="p-10">
                            {subject && <h1 className="text-2xl font-bold text-slate-900 mb-6">{subject}</h1>}
                            <div 
                                className="prose prose-slate max-w-none text-slate-700 font-sans"
                                dangerouslySetInnerHTML={{ __html: content || '<p className="text-slate-400 italic">Your message will appear here...</p>' }}
                            ></div>
                            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Mobi Store. All rights reserved.</p>
                                <p className="text-xs text-slate-400 mt-1">Naya Bazar, Kirtipur, Kathmandu, Nepal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mailing List / User Selection List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-blue-500" />
                        Mailing List (All Users)
                    </h2>
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider w-10">Select</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">User</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Email Address</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loadingUsers ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <Spinner size="w-8 h-8" />
                                        <p className="text-slate-400 mt-2 font-medium">Loading user database...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic font-medium">No users match your search.</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className={`hover:bg-slate-50 transition-colors group ${selectedUserIds.has(user.id) ? 'bg-blue-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUserIds.has(user.id)}
                                            onChange={() => toggleUserSelection(user.id)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-200 overflow-hidden">
                                                {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-500">{user.email}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleIndividualSend(user)}
                                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm transition-all active:scale-95"
                                        >
                                            Prepare Mail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                    End of user database
                </div>
            </div>

            {/* Broadcast History Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ClockIcon className="w-6 h-6 text-indigo-500" />
                        Broadcast History
                    </h2>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{history.length} Saved Records</span>
                        <p className="text-[9px] text-slate-400 font-medium italic mt-0.5">* Only mails sent after the history update are tracked.</p>
                    </div>
                </div>
                
                {loadingHistory ? (
                    <div className="p-20 text-center">
                        <Spinner size="w-8 h-8" />
                        <p className="text-slate-500 mt-3 font-medium">Loading history...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                            <ClockIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium">No previous broadcasts found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Subject</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider text-center">Stats</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-700">{new Date(log.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-800 line-clamp-1 max-w-xs">{log.subject}</p>
                                            <p className="text-[10px] text-slate-400 truncate max-w-xs">{log.content.replace(/<[^>]*>/g, '')}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-bold text-orange-600">SUCCESS</p>
                                                    <p className="text-sm font-black text-slate-700">{log.successCount}</p>
                                                </div>
                                                <div className="h-6 w-px bg-slate-100"></div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-bold text-rose-500">FAILED</p>
                                                    <p className="text-sm font-black text-slate-700">{log.failedCount}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleReuse(log)}
                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                                                    title="Reuse this content"
                                                >
                                                    Reuse
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteLog(log.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete record"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBulkEmailPage;
