
import React from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface CertificateModalProps {
    onClose: () => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ onClose }) => {
    
    // Prevent right click context menu
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        return false;
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[250] flex items-center justify-center p-4 animate-fade-in backdrop-blur-md" onClick={onClose}>
            <div 
                className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Fixed Height */}
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center shrink-0 z-30 relative">
                    <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 leading-none">Official Registration</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Govt. of Nepal &middot; Inland Revenue Dept.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 shadow-sm border border-slate-200 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body - Scrollable Area */}
                <div className="relative bg-slate-200 flex-1 overflow-y-auto custom-scrollbar">
                   <div className="min-h-full p-4 flex items-center justify-center">
                        <div className="relative w-full select-none">
                            {/* PROTECTIVE OVERLAY: Blocks direct touch/click/drag on image */}
                            <div 
                                className="absolute inset-0 z-50 bg-transparent" 
                                onContextMenu={handleContextMenu}
                                onTouchStart={(e) => e.stopPropagation()} // Prevent long press
                            ></div>
                            
                            <img 
                                src="https://ik.imagekit.io/Btmobilecare/IMG_3624.jpeg" 
                                alt="Mobi Store Registration Certificate" 
                                className="w-full h-auto rounded shadow-sm relative z-10 block pointer-events-none select-none"
                                onContextMenu={handleContextMenu}
                                style={{
                                    WebkitUserSelect: 'none',
                                    userSelect: 'none',
                                    WebkitTouchCallout: 'none',
                                    pointerEvents: 'none' // Disables all mouse interactions
                                }}
                            />
                        </div>
                   </div>
                </div>

                {/* Footer Details - Fixed Height */}
                <div className="p-5 bg-white border-t border-slate-100 text-center shrink-0 z-30 relative">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Permanent Account Number (PAN)</p>
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                        <span className="text-2xl font-black text-slate-800 tracking-wider font-mono">140158515</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 max-w-xs mx-auto leading-relaxed">
                        This certificate serves as proof of registration for Mobi Store Tech (Mobi Store). Reproduction is prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CertificateModal;
