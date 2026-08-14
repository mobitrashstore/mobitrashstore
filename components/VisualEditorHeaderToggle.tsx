
import React from 'react';
import { useVisualEditing } from '../context/VisualEditingContext';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { EyeIcon } from './icons/EyeIcon';

const VisualEditorHeaderToggle: React.FC = () => {
    const { isEditing, toggleEditing, canEdit } = useVisualEditing();

    if (!canEdit) return null;

    return (
        <button
            onClick={toggleEditing}
            className={`p-2 rounded-full border transition-all duration-300 ${isEditing
                ? 'bg-amber-500 text-white border-amber-500 shadow-md animate-pulse-slow'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#059669]'
                }`}
            title={isEditing ? "Exit Visual Editor" : "Enable Visual Editor"}
            aria-label={isEditing ? "Exit Visual Editor" : "Enable Visual Editor"}
        >
            {isEditing ? (
                <EyeIcon className="w-5 h-5" />
            ) : (
                <PencilSquareIcon className="w-5 h-5" />
            )}
        </button>
    );
};

export default VisualEditorHeaderToggle;
