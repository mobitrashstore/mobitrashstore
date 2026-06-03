
import React, { useState } from 'react';
import { useVisualEditing } from '../context/VisualEditingContext';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import VisualEditorModal from './VisualEditorModal';
import VisualDropZone from './VisualDropZone';

interface VisualEditWrapperProps {
    children: React.ReactNode;
    onEdit?: () => void;
    onSave?: (newData: any) => Promise<void>;
    onAddWidget?: (widgetId: string, position: 'before' | 'after') => void;
    config?: any;
    label: string;
    className?: string;
}

const VisualEditWrapper: React.FC<VisualEditWrapperProps> = ({
    children,
    onEdit,
    onSave,
    onAddWidget,
    config,
    label,
    className = ""
}) => {
    const { isEditing } = useVisualEditing();

    if (!isEditing) return <>{children}</>;

    return (
        <div className="w-full">
            {onAddWidget && (
                <VisualDropZone onDrop={(w) => onAddWidget(w, 'before')} label={`Insert before ${label}`} />
            )}

            <div className={`relative group/editor border-2 border-transparent hover:border-indigo-500/50 transition-all rounded-xl ${className}`}>
                {/* Editor Badge */}
                <div className="absolute -top-3 left-4 z-[40] bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter opacity-0 group-hover/editor:opacity-100 transition-opacity pointer-events-none shadow-lg">
                    {label} (Inline Edit Active)
                </div>

                {children}

                {/* Visual Guide: Dotted line on hover */}
                <div className="absolute inset-0 border-2 border-indigo-400 border-dashed rounded-xl pointer-events-none opacity-0 group-hover/editor:opacity-40 transition-opacity"></div>
            </div>

            {onAddWidget && (
                <VisualDropZone onDrop={(w) => onAddWidget(w, 'after')} label={`Insert after ${label}`} />
            )}
        </div>
    );
};

export default VisualEditWrapper;
