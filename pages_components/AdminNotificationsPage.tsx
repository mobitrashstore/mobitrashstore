import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { GlobalNotification } from '../types';
import { TrashIcon } from '../components/icons/TrashIcon';
import Spinner from '../components/Spinner';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { ImageUploader } from '../components/ImageUploader';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { DevicePhoneMobileIcon } from '../components/icons/DevicePhoneMobileIcon';
import { BoltIcon } from '../components/icons/BoltIcon';

interface AdminNotificationsPageProps {
    navigate: (path: string) => void;
    shopLocation?: string;
}

const AdminNotificationsPage: React.FC<AdminNotificationsPageProps> = ({ navigate }) => {
    const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState<string | null>(null);
    const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
    
    // Form State
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    
    // Audience Targeting
    const [targetType, setTargetType] = useState<'public' | 'specific'>('public');
    const [targetEmail, setTargetEmail] = useState('');
    
    // OneSignal REST API Key configuration
    const [onesignalApiKey, setOnesignalApiKey] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setBrowserPermission(Notification.permission);
        }
        const savedKey = localStorage.getItem('onesignal_rest_api_key');
        if (savedKey) setOnesignalApiKey(savedKey);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { db } = await import('../services/firebase');
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

    const handleSaveKey = (val: string) => {
        setOnesignalApiKey(val);
        localStorage.setItem('onesignal_rest_api_key', val);
    };

    // Trigger immediate local test notification on admin's device
    const handleTestOnThisDevice = async () => {
        if (!('Notification' in window)) {
            alert('Your browser does not support Web Notifications.');
            return;
        }

        let perm = Notification.permission;
        if (perm !== 'granted') {
            perm = await Notification.requestPermission();
            setBrowserPermission(perm);
        }

        if (perm === 'granted') {
            const testTitle = title.trim() || '🔔 Mobi Store Test Push';
            const testMsg = message.trim() || 'This is how your push notification appears on Android, iOS, and Desktop!';
            
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SHOW_NOTIFICATION',
                    title: testTitle,
                    options: {
                        body: testMsg,
                        icon: '/icon-192.png',
                        badge: '/icon-192.png',
                        image: imageUrl || undefined,
                        data: { url: link || 'https://mobitrashstore.com' },
                        vibrate: [200, 100, 200]
                    }
                });
            } else {
                new Notification(testTitle, {
                    body: testMsg,
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    image: imageUrl || undefined
                } as any);
            }
            alert('Test notification triggered on your screen!');
        } else {
            alert('Please allow notification permissions in your browser settings.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return;
        
        if (targetType === 'specific' && !targetEmail.trim()) {
            alert('Please enter a user email for targeted notification.');
            return;
        }

        setIsSending(true);
        setSendSuccess(null);
        try {
            const result = await api.sendPushNotification({
                title: title.trim(),
                message: message.trim(),
                link: link.trim(),
                imageUrl: imageUrl.trim(),
                targetType,
                targetEmail: targetType === 'specific' ? targetEmail.trim() : null,
                onesignalApiKey: onesignalApiKey.trim() || undefined
            });
            
            // Reset Form
            setTitle('');
            setMessage('');
            setLink('');
            setImageUrl('');
            setTargetType('public');
            setTargetEmail('');
            
            setSendSuccess('Push broadcast sent successfully to all subscribed devices!');
            setTimeout(() => setSendSuccess(null), 5000);
        } catch (error) {
            console.error("Failed to send notification", error);
            alert("Failed to send notification. Please check your connection.");
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
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl shadow-inner">
                            📢
                        </span>
                        Push Notifications & Broadcasts
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Send real-time alerts to Android phones, iPhones (iOS PWA), and Desktop browsers.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleTestOnThisDevice}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95"
                    >
                        <BoltIcon className="w-4 h-4 text-amber-500" />
                        Test on My Screen
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowKeyInput(!showKeyInput)}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-all"
                    >
                        ⚙️ OneSignal API Key
                    </button>
                </div>
            </div>

            {/* Optional OneSignal Key Config */}
            {showKeyInput && (
                <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl animate-fade-in space-y-2">
                    <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                        🔑 OneSignal REST API Key (Optional Override)
                    </h3>
                    <p className="text-xs text-emerald-700">
                        Enter your OneSignal REST API key to send directly to native devices without relying on background worker defaults.
                    </p>
                    <div className="flex gap-2 pt-1">
                        <input
                            type="password"
                            value={onesignalApiKey}
                            onChange={e => handleSaveKey(e.target.value)}
                            placeholder="os_v2_app_..."
                            className="flex-1 text-xs p-2.5 bg-white border border-emerald-300 rounded-xl text-slate-800 font-mono"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKeyInput(false)}
                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}

            {/* Success Alert */}
            {sendSuccess && (
                <div className="bg-emerald-500 text-white px-5 py-4 rounded-2xl flex items-center justify-between shadow-lg animate-fade-in">
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-emerald-100 flex-shrink-0" />
                        <span className="text-sm font-bold">{sendSuccess}</span>
                    </div>
                    <button onClick={() => setSendSuccess(null)} className="text-xs font-bold underline opacity-80 hover:opacity-100">
                        Dismiss
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-6 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                            <EnvelopeIcon className="w-5 h-5 text-emerald-600" />
                            Compose Push Notification
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Audience Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Audience
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTargetType('public')}
                                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                            targetType === 'public'
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <UsersIcon className="w-4 h-4 text-emerald-600" /> All Subscribers (Broadcast)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTargetType('specific')}
                                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                            targetType === 'specific'
                                                ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <UserCircleIcon className="w-4 h-4 text-blue-600" /> Specific User Email
                                    </button>
                                </div>
                            </div>
                            
                            {targetType === 'specific' && (
                                <div className="animate-fade-in">
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Recipient Email *
                                    </label>
                                    <input 
                                        type="email" 
                                        value={targetEmail}
                                        onChange={e => setTargetEmail(e.target.value)}
                                        required
                                        placeholder="customer@gmail.com"
                                        className="w-full p-2.5 border border-blue-300 bg-blue-50/40 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Notification Title *
                                </label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    placeholder="e.g. 🔥 Flash Sale: 20% Off iPhones Today!"
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Message Body *
                                </label>
                                <textarea 
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    required
                                    rows={3}
                                    placeholder="e.g. Limited stock available at New Road, Kathmandu. Tap to claim before it ends!"
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Click Action URL (Optional)
                                </label>
                                <input 
                                    type="text" 
                                    value={link}
                                    onChange={e => setLink(e.target.value)}
                                    placeholder="e.g. /buy or /sell or https://mobitrashstore.com/deal"
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    When the customer taps the notification, it opens this page automatically.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Banner Image (Optional)
                                </label>
                                <div className="p-2 border border-slate-200 rounded-xl bg-slate-50">
                                    <ImageUploader 
                                        imageUrl={imageUrl}
                                        onImageChange={setImageUrl}
                                        onClear={() => setImageUrl('')}
                                        allowFullSize={true} 
                                    />
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSending || !title.trim() || !message.trim()}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md active:scale-98 text-sm"
                            >
                                {isSending ? (
                                    <>
                                        <Spinner size="w-5 h-5" />
                                        <span>Broadcasting to Devices...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🚀 Send Real Push Notification</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Preview & Delivery Status Section */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Live Mobile & Desktop Notification Preview */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <DevicePhoneMobileIcon className="w-4 h-4 text-emerald-400" />
                                Live Device Appearance Preview
                            </h3>
                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                Android / iOS / Desktop
                            </span>
                        </div>

                        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 shadow-xl space-y-3">
                            <div className="flex items-center gap-3">
                                <img src="/icon-192.png" alt="App Icon" className="w-8 h-8 rounded-lg shadow-sm border border-slate-700 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-300">Mobi Store • now</span>
                                        <span className="text-[10px] text-slate-400">mobitrashstore.com</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white truncate mt-0.5">
                                        {title.trim() || '🔥 Notification Title Preview'}
                                    </h4>
                                </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed pl-11">
                                {message.trim() || 'This is a live preview of how your message will look when delivered to users.'}
                            </p>

                            {imageUrl && (
                                <div className="pl-11 pt-1">
                                    <img 
                                        src={imageUrl} 
                                        alt="Push Banner" 
                                        className="w-full h-32 object-cover rounded-lg border border-slate-700" 
                                    />
                                </div>
                            )}

                            {link && (
                                <div className="pl-11 pt-1">
                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                                        🔗 Opens: {link}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Supported Channels Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Active Delivery Channels
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>📱</span> Android Devices
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">Chrome, Edge & Installed PWA</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>🍏</span> Apple iOS (iPhones)
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">iOS 16.4+ Safari & Home Screen App</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>💻</span> Desktop Browsers
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">Windows, Mac & Linux Browsers</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>🔔</span> In-App Bell Badge
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">Realtime Firestore notification badge</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sent History Section */}
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <span>📋</span> Notification Broadcast History
                            </h2>
                            <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">
                                {notifications.length} Total
                            </span>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-12"><Spinner /></div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {notifications.map(notif => (
                                    <div key={notif.id} className="p-5 hover:bg-slate-50/70 transition-colors flex gap-4 items-start group relative">
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            {notif.targetEmail ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    <UserCircleIcon className="w-3.5 h-3.5"/> {notif.targetEmail}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <UsersIcon className="w-3.5 h-3.5"/> Public (All)
                                                </span>
                                            )}
                                        </div>

                                        {notif.imageUrl && (
                                            <div className="flex-shrink-0 w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                                                 <img src={notif.imageUrl} alt="Notif" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-grow pr-28">
                                            <h3 className="font-bold text-slate-800 text-base leading-tight">{notif.title}</h3>
                                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                                            {notif.link && (
                                                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-xs text-emerald-700 font-mono border border-slate-200">
                                                    <span>🔗</span> {notif.link}
                                                </div>
                                            )}
                                            <p className="text-[10px] text-slate-400 mt-2 font-semibold uppercase tracking-wider">
                                                {new Date(notif.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(notif.id)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100 self-center"
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
                                <p className="text-slate-600 font-bold">No notifications sent yet.</p>
                                <p className="text-slate-400 text-xs mt-1">Send your first push broadcast using the form above.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotificationsPage;
