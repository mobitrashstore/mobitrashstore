
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { GlobalNotification } from '../types';
import { TrashIcon } from '../components/icons/TrashIcon';
import Spinner from '../components/Spinner';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { ImageUploader } from '../components/ImageUploader';

interface AdminNotificationsPageProps {
    navigate: (path: string) => void;
    shopLocation?: string; // Added this line for compatibility
}

const AdminNotificationsPage: React.FC<AdminNotificationsPageProps> = ({ navigate }) => {
    const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    
    // Form State
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    
    // Audience Targeting
    const [targetType, setTargetType] = useState<'public' | 'specific'>('public');
    const [targetEmail, setTargetEmail] = useState('');

    const fetchNotifications = async () => {
        setLoading(true);
        try {
             const { db } = await import('../services/firebase');
             // Admin sees ALL notifications for audit
             db.collection('globalNotifications').orderBy('createdAt', 'desc').limit(50).onSnapshot(snap => {
                 const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GlobalNotification));
                 setNotifications(data);
                 setLoading(false);
             });
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;
        
        if (targetType === 'specific' && !targetEmail) {
            alert('Please enter user email for specific notification.');
            return;
        }

        setIsSending(true);
        try {
            await api.addGlobalNotification({
                title,
                message,
                link,
                imageUrl,
                targetEmail: targetType === 'specific' ? targetEmail : null
            });
            
            // Reset Form
            setTitle('');
            setMessage('');
            setLink('');
            setImageUrl('');
            setTargetType('public');
            setTargetEmail('');
            
            alert('Notification sent successfully!');
        } catch (error) {
            console.error("Failed to send notification", error);
            alert("Failed to send notification.");
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this notification? Users will no longer see it.")) {
            await api.deleteGlobalNotification(id);
            await fetchNotifications();
        }
    };

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Push Notifications</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <EnvelopeIcon className="w-5 h-5 text-amber-600" /> Send New
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            
                            {/* Audience Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Audience</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTargetType('public')}
                                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold transition-all ${targetType === 'public' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <UsersIcon className="w-4 h-4"/> Public (All)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTargetType('specific')}
                                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold transition-all ${targetType === 'specific' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <UserCircleIcon className="w-4 h-4"/> Specific User
                                    </button>
                                </div>
                            </div>
                            
                            {targetType === 'specific' && (
                                <div className="animate-fade-in-down">
                                    <label className="block text-sm font-bold text-slate-600 mb-1">User Email *</label>
                                    <input 
                                        type="email" 
                                        value={targetEmail}
                                        onChange={e => setTargetEmail(e.target.value)}
                                        required
                                        placeholder="user@example.com"
                                        className="w-full p-2.5 border border-blue-300 bg-blue-50/50 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Title *</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    placeholder="e.g. Flash Sale!"
                                    className="w-full p-2.5 border border-slate-300 bg-white rounded-lg focus:ring-amber-500 focus:border-amber-500 text-slate-800 placeholder-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Message *</label>
                                <textarea 
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    required
                                    rows={3}
                                    placeholder="e.g. Get 50% off on accessories today."
                                    className="w-full p-2.5 border border-slate-300 bg-white rounded-lg focus:ring-amber-500 focus:border-amber-500 text-slate-800 placeholder-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Link URL (Optional)</label>
                                <input 
                                    type="text" 
                                    value={link}
                                    onChange={e => setLink(e.target.value)}
                                    placeholder="e.g. /buy?category=Chargers"
                                    className="w-full p-2.5 border border-slate-300 bg-white rounded-lg focus:ring-amber-500 focus:border-amber-500 text-slate-800 placeholder-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Notification Image</label>
                                <div className="p-1 border border-slate-200 rounded-xl bg-slate-50">
                                    <ImageUploader 
                                        imageUrl={imageUrl}
                                        onImageChange={setImageUrl}
                                        onClear={() => setImageUrl('')}
                                        allowFullSize={true} 
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                                    Upload from device or paste URL. Images are auto-compressed.
                                </p>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSending}
                                className="w-full bg-amber-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-amber-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex justify-center shadow-md active:scale-95 mt-2"
                            >
                                {isSending ? <Spinner size="w-5 h-5" /> : 'Send Notification'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">Sent History (All)</h2>
                            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{notifications.length}</span>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-12"><Spinner /></div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {notifications.map(notif => (
                                    <div key={notif.id} className="p-5 hover:bg-slate-50 transition-colors flex gap-4 items-start group relative">
                                        
                                        {/* Target Badge */}
                                        <div className="absolute top-4 right-4">
                                            {notif.targetEmail ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                                    <UserCircleIcon className="w-3 h-3"/> {notif.targetEmail}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                    <UsersIcon className="w-3 h-3"/> Public
                                                </span>
                                            )}
                                        </div>

                                        {notif.imageUrl && (
                                            <div className="flex-shrink-0 w-20 h-20 rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                                                 <img src={notif.imageUrl} alt="Notif" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-grow pr-20">
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{notif.title}</h3>
                                            <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                                            {notif.link && (
                                                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-blue-600 font-mono border border-slate-200 max-w-full truncate">
                                                    <span>🔗</span> {notif.link}
                                                </div>
                                            )}
                                            <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wide">{new Date(notif.createdAt).toLocaleString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(notif.id)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 self-center"
                                            title="Delete"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                                    <EnvelopeIcon className="w-8 h-8" />
                                </div>
                                <p className="text-slate-500 font-medium">No notifications sent yet.</p>
                                <p className="text-slate-400 text-xs mt-1">Send your first push notification using the form.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotificationsPage;
