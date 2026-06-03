
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { ContactMessage } from '../types';
import Spinner from '../components/Spinner';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';

interface AdminContactsPageProps {
    navigate: (path: string) => void;
}

const AdminContactsPage: React.FC<AdminContactsPageProps> = ({ navigate }) => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            const allMessages = await api.getContactMessages();
            setMessages(allMessages);
            setLoading(false);
        };
        fetchMessages();
    }, []);
    
    const handleStatusChange = async (id: string, newStatus: ContactMessage['status']) => {
        await api.updateContactMessageStatus(id, newStatus);
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, status: newStatus } : msg));
    };

    const getStatusColor = (status: ContactMessage['status']) => {
        switch (status) {
            case 'New': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Read': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            case 'Archived': return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm mb-6">Contact Messages</h1>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                {loading ? (
                    <div className="flex justify-center py-10"><Spinner /></div>
                ) : messages.length > 0 ? (
                    <div className="space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-sm hover:bg-white transition-all group">
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">{msg.name}</p>
                                        <a href={`mailto:${msg.email}`} className="text-sm text-amber-600 flex items-center gap-1 hover:underline hover:text-amber-700">
                                            <EnvelopeIcon className="w-4 h-4" />
                                            {msg.email}
                                        </a>
                                        <p className="text-xs text-slate-500 mt-1">{msg.date}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusColor(msg.status)}`}>
                                            {msg.status}
                                        </span>
                                        <select
                                            value={msg.status}
                                            onChange={(e) => handleStatusChange(msg.id, e.target.value as ContactMessage['status'])}
                                            className="text-xs border-slate-300 bg-white text-slate-700 rounded-lg p-1.5 focus:ring-amber-500 focus:border-amber-500 shadow-sm outline-none"
                                        >
                                            <option value="New">New</option>
                                            <option value="Read">Read</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                     <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm">{msg.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-10">No messages yet.</p>
                )}
            </div>
        </div>
    );
};

export default AdminContactsPage;
