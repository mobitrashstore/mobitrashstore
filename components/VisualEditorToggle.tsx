
import React from 'react';
import { useVisualEditing } from '../context/VisualEditingContext';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { EyeIcon } from './icons/EyeIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { XMarkIcon } from './icons/XMarkIcon';

const VisualEditorToggle: React.FC = () => {
    const { isEditing, toggleEditing, canEdit } = useVisualEditing();

    if (!canEdit) return null;

    return (
        <div className="fixed bottom-24 right-5 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
            {isEditing && (
                <div className="bg-white/90 backdrop-blur-md border border-amber-200 p-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
                    <p className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wider">Visual Editor Mode</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.location.href = '/admin/dashboard'}
                            className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                        >
                            <Cog6ToothIcon className="w-4 h-4" />
                            Dashboard
                        </button>
                        <button
                            onClick={toggleEditing}
                            className="flex items-center gap-2 bg-rose-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                            Exit
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={toggleEditing}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 pointer-events-auto ${isEditing
                        ? 'bg-amber-500 text-white ring-4 ring-amber-200 ring-offset-2'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                title={isEditing ? "Exit Visual Editor" : "Enable Visual Editor"}
            >
                {isEditing ? <EyeIcon className="w-7 h-7" /> : <PencilSquareIcon className="w-7 h-7" />}
                {!isEditing && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
                    </span>
                )}
            </button>
        </div>
    );
};

export default VisualEditorToggle;
