
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { XMarkIcon } from './icons/XMarkIcon';
import { CheckIcon } from './icons/CheckIcon';
import { useNotification } from '../context/NotificationContext';

// Simple Check Icon since it might not exist in icons folder
const LocalCheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

interface VisualEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    sectionId: string;
    label: string;
    config: any;
    onSave: (newData: any) => Promise<void>;
}

const VisualEditorModal: React.FC<VisualEditorModalProps> = ({ isOpen, onClose, sectionId, label, config, onSave }) => {
    const [formData, setFormData] = useState<any>(config || {});
    const [isSaving, setIsSaving] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        setFormData(config || {});
    }, [config, isOpen]);

    if (!isOpen) return null;

    const handleChange = (key: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            addNotification(`${label} updated successfully!`, 'success');
            onClose();
        } catch (error) {
            console.error('Save failed', error);
            addNotification('Failed to save changes.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const renderField = (key: string, value: any) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

        if (typeof value === 'boolean') {
            return (
                <div key={key} className="flex items-center gap-3 py-2">
                    <input
                        type="checkbox"
                        id={key}
                        checked={value}
                        onChange={(e) => handleChange(key, e.target.checked)}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={key} className="text-sm font-bold text-slate-700">{label}</label>
                </div>
            );
        }

        if (key.toLowerCase().includes('content') || key.toLowerCase().includes('description') || key.toLowerCase().includes('story')) {
            return (
                <div key={key} className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-tighter">{label}</label>
                    <textarea
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px]"
                    />
                </div>
            );
        }

        return (
            <div key={key} className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-tighter">{label}</label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                />
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
                <div className="bg-indigo-600 p-6 flex items-center justify-between text-white">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Visual Editor</p>
                        <h2 className="text-2xl font-black tracking-tight">{label}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {Object.entries(formData).map(([key, value]) => renderField(key, value))}

                    {Object.keys(formData).length === 0 && (
                        <div className="text-center py-10 text-slate-400 italic">
                            No editable fields found for this section.
                        </div>
                    )}
                </form>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-grow bg-indigo-600 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : (
                            <>
                                <LocalCheckIcon className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase rounded-2xl hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisualEditorModal;
