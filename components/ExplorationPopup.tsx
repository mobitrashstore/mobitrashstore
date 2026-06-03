
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { CameraIcon } from './icons/CameraIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { BoltIcon } from './icons/BoltIcon';

interface ExplorationPopupProps {
    onClose: () => void;
}

const ExplorationPopup: React.FC<ExplorationPopupProps> = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [permissions, setPermissions] = useState({
        camera: false,
        location: false,
        microphone: false
    });

    const requestAll = async () => {
        try {
            // Request Geo
            // FIX: Explicitly typed Promise to boolean to avoid 'unknown' type error in setPermissions
            const geo = new Promise<boolean>((resolve) => {
                navigator.geolocation.getCurrentPosition(() => resolve(true), () => resolve(false));
            });
            
            // Request Media
            const media = navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                .then(() => true)
                .catch(() => false);

            const [geoRes, mediaRes] = await Promise.all([geo, media]);
            
            setPermissions({
                camera: mediaRes,
                location: geoRes,
                microphone: mediaRes
            });
            setStep(2);
        } catch (e) {
            setStep(2);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden relative border border-white/20">
                {/* Visual Header */}
                <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-lg animate-bounce-slow">
                            <SparklesIcon className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white leading-tight">Mobi Store Unlocked!</h2>
                        <p className="text-emerald-50 text-sm mt-2 font-medium">Your journey to smart tech recycling begins here.</p>
                    </div>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Essential Permissions</h3>
                                <p className="text-slate-500 text-sm mt-1">To use our AI scanner, diagnostic tools, and doorstep pickup, we need your permission.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><CameraIcon className="w-5 h-5"/></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-800">Camera Access</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">AI Identification & OCR</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center"><MapPinIcon className="w-5 h-5"/></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-800">Location Access</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Doorstep Pickup Logistics</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center"><MicrophoneIcon className="w-5 h-5"/></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-800">Microphone Access</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Audio Diagnostics</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={requestAll}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                            >
                                Grant & Explore
                            </button>
                        </div>
                    ) : (
                        <div className="text-center animate-fade-in">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircleIcon className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">You're All Set!</h3>
                            <p className="text-slate-500 mb-8 px-4">Our AI tools and diagnostic lab are now fully active. Start selling or fixing with confidence.</p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <BoltIcon className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-800 uppercase">Sell Phone</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <SparklesIcon className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-800 uppercase">Repair Lab</p>
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl active:scale-95"
                            >
                                Let's Start
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default ExplorationPopup;
