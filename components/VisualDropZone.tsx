import React, { useState } from 'react';
import { useVisualEditing } from '../context/VisualEditingContext';
import { PlusIcon } from './icons/PlusIcon';

interface VisualDropZoneProps {
    onDrop: (widgetId: string) => void;
    label?: string;
}

const VisualDropZone: React.FC<VisualDropZoneProps> = ({ onDrop, label = "Drag widget here" }) => {
    const { isEditing, draggedWidget } = useVisualEditing();
    const [isOver, setIsOver] = useState(false);

    if (!isEditing) return null;

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedWidget) {
            setIsOver(true);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
        if (draggedWidget) {
            setIsOver(true);
        }
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        if (draggedWidget) {
            onDrop(draggedWidget);
        }
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative w-full transition-all duration-500 ease-out border-2 rounded-2xl flex flex-col items-center justify-center my-4 overflow-hidden ${isOver
                ? 'h-40 bg-primary/10 border-primary scale-[1.02] shadow-2xl z-20'
                : draggedWidget
                    ? 'h-24 bg-slate-50 border-dashed border-slate-300 opacity-100 z-10 animate-pulse border-primary/20 shadow-lg'
                    : 'h-6 border-transparent opacity-0 hover:h-20 hover:opacity-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
        >
            <div className={`flex flex-col items-center gap-3 transition-all duration-300 ${isOver ? 'scale-110' : 'scale-100'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isOver ? 'bg-primary text-white rotate-0' : 'bg-white text-slate-400 rotate-45 group-hover:rotate-0'}`}>
                    <PlusIcon className="w-6 h-6" />
                </div>
                <div className="text-center">
                    <span className={`text-xs font-black uppercase tracking-[0.2em] block transition-colors ${isOver ? 'text-primary' : 'text-slate-400'}`}>
                        {isOver ? `Confirm: Drop ${draggedWidget}` : label}
                    </span>
                    {(isOver || draggedWidget) && (
                        <span className="text-[10px] text-primary/60 font-bold uppercase mt-1 animate-bounce block">
                            {isOver ? 'Release to Add Component' : 'Drop anywhere see brand targets'}
                        </span>
                    )}
                </div>
            </div>

            {/* Visual Guide for empty page */}
            {!draggedWidget && !isOver && (
                <div className="absolute inset-0 pointer-events-none border-t border-slate-100 group-hover:border-none"></div>
            )}
        </div>
    );
};

export default VisualDropZone;
