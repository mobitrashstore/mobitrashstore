import React, { useState, useEffect, useRef } from 'react';
import { useVisualEditing } from '../context/VisualEditingContext';
import { useNotification } from '../context/NotificationContext';
import { CheckIcon } from './icons/CheckIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface EditableTextProps {
    value: string;
    onSave: (newValue: string) => void;
    className?: string;
    tag?: string;
    placeholder?: string;
    htmlMode?: boolean;
    multiline?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({
    value,
    onSave,
    className = '',
    tag = 'div',
    placeholder = 'Click to edit...',
    htmlMode = false,
    multiline = false
}) => {
    const { isEditing } = useVisualEditing();
    const { addNotification } = useNotification();
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const contentRef = useRef<HTMLElement>(null);

    // Sync internal state with external value changes
    useEffect(() => {
        if (contentRef.current) {
            const currentVal = htmlMode ? contentRef.current.innerHTML : contentRef.current.innerText;
            if (currentVal !== value) {
                if (htmlMode) contentRef.current.innerHTML = value;
                else contentRef.current.innerText = value;
            }
        }
        setHasChanges(false);
    }, [value, htmlMode]);

    const handleInput = () => {
        if (!contentRef.current) return;
        const currentVal = htmlMode ? contentRef.current.innerHTML : contentRef.current.innerText;
        setHasChanges(currentVal !== value);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!contentRef.current) return;

        const newText = htmlMode ? contentRef.current.innerHTML : contentRef.current.innerText;

        setIsSaving(true);
        try {
            await onSave(newText);
            addNotification('Content updated successfully!', 'success');
            setHasChanges(false);
        } catch (error) {
            console.error("Save failed", error);
            addNotification('Failed to update content.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (contentRef.current) {
            if (htmlMode) contentRef.current.innerHTML = value;
            else contentRef.current.innerText = value;
        }
        setHasChanges(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            contentRef.current?.blur();
        }
    };

    const Tag = tag as any;

    if (!isEditing) {
        if (htmlMode) {
            return <Tag className={className} dangerouslySetInnerHTML={{ __html: value }} />;
        }
        return <Tag className={className}>{value}</Tag>;
    }

    return (
        <div className="relative group inline-block w-full">
            <Tag
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className={`${className} outline-none border border-transparent hover:border-indigo-400 focus:border-indigo-600 focus:bg-indigo-50/10 rounded px-1 -mx-1 transition-all cursor-text min-h-[1em] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400`}
                data-placeholder={placeholder}
                {...(htmlMode ? { dangerouslySetInnerHTML: { __html: value } } : { children: value })}
            />

            {hasChanges && !isSaving && (
                <div className="absolute -top-10 right-0 flex items-center gap-1 z-[100] animate-fade-in">
                    <button
                        onClick={handleSave}
                        className="p-1.5 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
                        title="Save Changes"
                    >
                        <CheckIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                        title="Discard Changes"
                    >
                        <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {isSaving && (
                <div className="absolute right-0 top-0 -mt-2 -mr-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg animate-pulse z-50">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            )}

            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 pointer-events-none transform translate-x-full ml-2 z-50 h-full flex items-center">
                <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-sm whitespace-nowrap">
                    Click to Edit
                </span>
            </div>
        </div>
    );
};

export default EditableText;
