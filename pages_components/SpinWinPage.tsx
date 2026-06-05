import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { SpinWheelConfig, SpinSegment, SpinParticipant } from '../types';
import Spinner from '../components/Spinner';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { LockClosedIcon } from '../components/icons/LockClosedIcon';
import { useNotification } from '../context/NotificationContext';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { PlayIcon } from '../components/icons/PlayIcon';
import { BoltIcon } from '../components/icons/BoltIcon';
import { SpeakerWaveIcon } from '../components/icons/SpeakerWaveIcon';

/**
 * Fix: Added interface to define props for SpinWinPage, 
 * resolving "Property 'navigate' does not exist on type 'IntrinsicAttributes'" error in App.tsx.
 */
export interface SpinWinPageProps {
    navigate: (path: string) => void;
}

// No client-side compression. Images are uploaded raw to Cloudinary at full resolution.

/**
 * Fix: Updated component definition to accept navigate prop.
 */
const SpinWinPage: React.FC<SpinWinPageProps> = ({ navigate }) => {
    const { user } = useAuth();
    const { addNotification } = useNotification();

    // Config & User State
    const [config, setConfig] = useState<SpinWheelConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [participant, setParticipant] = useState<SpinParticipant | null>(null);
    const [allParticipants, setAllParticipants] = useState<SpinParticipant[]>([]);

    // Game State
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [showPrizeModal, setShowPrizeModal] = useState(false);
    const [prizeSegment, setPrizeSegment] = useState<SpinSegment | null>(null);

    // Registration Form State
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
        productBought: '',
        purchasePlan: 'Standard'
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoUploadProgress, setPhotoUploadProgress] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sound
    const [soundEnabled, setSoundEnabled] = useState(true);
    const spinSoundRef = useRef<HTMLAudioElement | null>(null);
    const winSoundRef = useRef<HTMLAudioElement | null>(null);

    // --- Initialization ---
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Fetch Config
                const cfg = await api.getSpinWheelConfig();
                setConfig(cfg);

                // Fetch Participant Status if user is logged in
                if (user) {
                    const partData = await api.getSpinParticipant(user.id);
                    setParticipant(partData);
                }

                // Fetch All Participants for the sidebar list
                const participantsList = await api.getAllSpinParticipants();
                // Filter only approved or pending to show real activity
                setAllParticipants(participantsList.filter(p => p.status !== 'Rejected'));

            } catch (error) {
                console.error('Failed to load spin wheel data', error);
            } finally {
                setLoading(false);
            }
        };
        init();

        // Initialize sounds
        spinSoundRef.current = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3');
        spinSoundRef.current.loop = true;
        winSoundRef.current = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3');
    }, [user]);

    // --- Handlers ---
    const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoUploadProgress(0);
            try {
                const url = await api.uploadImage(file, 'spin-participants', (pct) => {
                    setPhotoUploadProgress(Math.round(pct));
                });
                setPhotoPreview(url);
            } catch (err: any) {
                console.error("Profile photo upload failed:", err);
                addNotification("Failed to upload image to Cloudinary: " + (err.message || err), "error");
            } finally {
                setPhotoUploadProgress(null);
            }
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!formData.phone || !formData.address || !formData.productBought) {
            addNotification("Please fill in all details.", "error");
            return;
        }

        if (!photoPreview) {
            addNotification("Please upload a profile/passport photo.", "error");
            return;
        }

        if (photoUploadProgress !== null) {
            addNotification("Please wait for your photo to finish uploading.", "info");
            return;
        }

        setIsSubmitting(true);
        try {
            // Save the Cloudinary URL in the database document.

            await api.registerForSpin({
                userId: user.id,
                name: user.name,
                email: user.email,
                photoURL: photoPreview, // Save the compressed string directly
                phone: formData.phone,
                address: formData.address,
                productBought: formData.productBought,
                purchasePlan: formData.purchasePlan
            });

            // Refresh participant status immediately
            const p = await api.getSpinParticipant(user.id);
            setParticipant(p);
            // Refresh list to include self
            const updatedList = await api.getAllSpinParticipants();
            setAllParticipants(updatedList);

            addNotification("Registration submitted! Waiting for approval.", "success");
        } catch (e) {
            console.error(e);
            addNotification("Registration failed. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSpin = async () => {
        if (!user || !config || isSpinning || !participant) return;

        if (participant.status !== 'Approved') {
            addNotification("Your participation is not approved yet.", "info");
            return;
        }

        const spinsLeft = participant.spinsAllocated - participant.spinsUsed;
        if (spinsLeft <= 0) {
            addNotification("You have no spins remaining. Ask Admin for more!", "error");
            return;
        }

        // 1. Determine Winner based on probability
        const random = Math.random() * 100;
        let accumulatedProb = 0;
        let winningSegment = config.segments[0];
        let winningIndex = 0;

        for (let i = 0; i < config.segments.length; i++) {
            accumulatedProb += Number(config.segments[i].probability);
            if (random <= accumulatedProb) {
                winningSegment = config.segments[i];
                winningIndex = i;
                break;
            }
        }

        // 2. Start Animation
        setIsSpinning(true);
        setShowPrizeModal(false);
        if (soundEnabled) spinSoundRef.current?.play().catch(() => { });

        // 3. Calculate Rotation (Math for landing on the segment)
        const segmentCount = config.segments.length;
        const segmentArc = 360 / segmentCount;
        // Align the winning segment to the top (pointer is usually at top/270deg or 90deg depending on CSS)
        // We add extra spins for effect
        const winningSegmentCenterAngle = winningIndex * segmentArc + segmentArc / 2;
        const extraSpins = 360 * 5;
        const targetRotation = 360 - winningSegmentCenterAngle;
        const newRotation = rotation + extraSpins + targetRotation;

        setRotation(newRotation);

        // 4. Update Server (Optimistic UI handled in step 5)
        try {
            await api.incrementSpinUsage(user.id);

            // Record result
            api.recordSpinResult(user.id, winningSegment.label);

            // Add Points if applicable
            if (winningSegment.type === 'points' && Number(winningSegment.value) > 0) {
                api.addPoints(user.id, Number(winningSegment.value));
            }
        } catch (e) {
            console.error("Spin record failed", e);
        }

        // 5. End Spin & Show Prize
        setTimeout(() => {
            setIsSpinning(false);
            if (soundEnabled) {
                spinSoundRef.current?.pause();
                winSoundRef.current?.play().catch(() => { });
            }
            setPrizeSegment(winningSegment);
            setShowPrizeModal(true);

            // Update local state reflectively
            setParticipant(prev => prev ? ({ ...prev, spinsUsed: prev.spinsUsed + 1 }) : null);
        }, 5000);
    };

    const toggleSound = () => setSoundEnabled(!soundEnabled);

    // --- RENDERERS ---

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-slate-50"><Spinner /></div>;
    }

    // 1. Not Logged In
    if (!user) {
        return (
            <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center text-center p-6 text-slate-800 pb-20 relative overflow-hidden">
                {/* Powerful BG Graphic */}
                <div className="absolute inset-0 z-0 opacity-10">
                    <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                        </defs>
                        <path fill="url(#g1)" d="M400,0L800,400L400,800L0,400Z" />
                        <circle cx="400" cy="400" r="350" fill="none" stroke="#f59e0b" strokeWidth="20" opacity="0.5" />
                        <circle cx="400" cy="400" r="250" fill="none" stroke="#d97706" strokeWidth="40" opacity="0.3" />
                    </svg>
                </div>

                <MobileSkyHeader title="Spin & Win" Icon={SparklesIcon} hasSpacer={false} />
                <div className="mt-20 relative z-10 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white">
                    <SparklesIcon className="w-16 h-16 text-amber-500 mb-6 mx-auto animate-pulse" />
                    <h1 className="text-3xl font-black mb-4 text-slate-900">Login Required</h1>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">Please login to participate in the Spin & Win contest and win exclusive prizes.</p>
                    <a href="/login" className="bg-amber-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-amber-700 transition-colors shadow-lg shadow-amber-500/20">Login Now</a>
                </div>
            </div>
        );
    }

    // 2. Not Registered (Show Form)
    if (!participant) {
        return (
            <div className="bg-slate-50 min-h-screen flex flex-col items-center p-4 text-slate-800 pb-20 relative overflow-hidden">
                {/* Graphic Background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 0 L100 0 L100 100 Z" fill="#fff7ed" />
                        <path d="M0 100 L100 0 L0 0 Z" fill="#fef3c7" opacity="0.5" />
                        <circle cx="50" cy="20" r="40" fill="url(#grad1)" opacity="0.1" />
                        <defs>
                            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" style={{ stopColor: 'rgb(251,191,36)', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: 'rgb(255,255,255)', stopOpacity: 0 }} />
                            </radialGradient>
                        </defs>
                    </svg>
                </div>

                <MobileSkyHeader title="Join Spin & Win" Icon={SparklesIcon} hasSpacer={false} />

                <div className="w-full max-w-lg mt-24 animate-fade-in-up relative z-10">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/20 transform -rotate-6">
                            <SparklesIcon className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">Unlock Your Luck!</h2>
                        <p className="text-slate-500 text-sm mt-2 px-4">Register as a verified customer to spin the wheel and win gadgets.</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-2xl">
                        <form onSubmit={handleRegister} className="space-y-5">

                            {/* Photo Upload - Special Requirement */}
                            <div className="flex flex-col items-center justify-center mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Profile / Passport Photo</label>
                                <div className="relative group cursor-pointer w-32 h-32">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 shadow-inner flex items-center justify-center relative">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircleIcon className="w-16 h-16 text-slate-300" />
                                        )}
                                        {photoUploadProgress !== null && (
                                            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-2 z-10 gap-1">
                                                <Spinner size="w-6 h-6" />
                                                <span className="text-[10px] font-bold text-amber-600">{photoUploadProgress}%</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoSelect}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-amber-500 p-2 rounded-full text-white shadow-md z-10 pointer-events-none">
                                        <PhotoIcon className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 text-center">Required for verification.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Phone Number</label>
                                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-800 placeholder-slate-400 font-medium transition-all" placeholder="98XXXXXXXX" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Product Bought</label>
                                    <input type="text" value={formData.productBought} onChange={e => setFormData({ ...formData, productBought: e.target.value })} required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-800 placeholder-slate-400 font-medium transition-all" placeholder="e.g. iPhone 13" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Full Address</label>
                                <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-800 placeholder-slate-400 font-medium transition-all" placeholder="City, Street" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Purchase Plan</label>
                                <select value={formData.purchasePlan} onChange={e => setFormData({ ...formData, purchasePlan: e.target.value })} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-800 font-medium transition-all">
                                    <option value="Standard">Standard Purchase</option>
                                    <option value="Premium">Premium Bundle</option>
                                    <option value="VIP">VIP Membership</option>
                                </select>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] transition-all active:scale-95 mt-4 disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                                {isSubmitting ? 'Registering...' : 'Register to Play'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Approved - THE GAME
    const spinsLeft = Math.max(0, participant.spinsAllocated - participant.spinsUsed);
    const numSegments = config?.segments.length || 0;
    const gradientParts = config?.segments.map((seg, i) => {
        const start = (i / numSegments) * 100;
        const end = ((i + 1) / numSegments) * 100;
        return `${seg.color} ${start}% ${end}%`;
    }).join(', ');

    return (
        <div className="bg-slate-50 min-h-screen overflow-hidden relative flex flex-col pb-20">
            <MobileSkyHeader title="Spin & Win" Icon={SparklesIcon} hasSpacer={false} />

            {/* POWERFUL LIGHT GRAPHIC BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <svg className="absolute w-[150%] h-[150%] -top-[25%] -left-[25%] animate-spin-slow opacity-10" viewBox="0 0 100 100">
                    <defs>
                        <radialGradient id="sunburst" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
                            <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
                        </radialGradient>
                    </defs>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <path key={i} d="M50 50 L100 40 L100 60 Z" fill="url(#sunburst)" transform={`rotate(${i * 30} 50 50)`} />
                    ))}
                </svg>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-transparent to-slate-100"></div>
            </div>

            {/* Main Content Area: Grid Layout for Desktop */}
            <div className="flex-grow flex flex-col items-center justify-center relative z-10 py-4 px-4 pt-44 md:pt-8 max-w-7xl mx-auto w-full">

                {/* User Stats Pill (Repositioned to Flow for Mobile to avoid overlap) */}
                <div className="w-full flex justify-end md:hidden mb-4">
                    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-100 shadow-md">
                        {participant.photoURL ? (
                            <img src={participant.photoURL} className="w-8 h-8 rounded-full border-2 border-amber-500 object-cover" alt="Me" />
                        ) : (
                            <UserCircleIcon className="w-8 h-8 text-slate-300" />
                        )}
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase leading-none mb-0.5">Spins Left</p>
                            <p className="text-lg font-black text-amber-500 leading-none">{spinsLeft}</p>
                        </div>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="text-center mb-8 hidden md:block">
                    <h1 className="text-5xl font-black text-slate-900 drop-shadow-sm italic tracking-tight">
                        SPIN <span className="text-amber-500">&</span> WIN
                    </h1>
                    <p className="text-slate-500 text-base mt-2">Exclusive rewards for our verified buyers</p>
                </div>

                <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT COLUMN: THE WHEEL (Takes 2/3 on desktop) */}
                    <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[450px] relative">

                        {/* --- TOP CONTROLS --- */}
                        {/* Sound: Top Left */}
                        <button
                            onClick={toggleSound}
                            className="absolute top-0 left-0 md:top-4 md:left-4 z-30 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-white text-slate-600 hover:text-amber-600 transition-all hover:scale-105 active:scale-95"
                            title={soundEnabled ? 'Mute' : 'Unmute'}
                        >
                            {soundEnabled ? <SpeakerWaveIcon className="w-5 h-5" /> : <div className="w-5 h-5 flex items-center justify-center opacity-50">🔇</div>}
                        </button>

                        {/* Spin Button: Top Right (Desktop Only) */}
                        <button
                            onClick={handleSpin}
                            disabled={isSpinning || spinsLeft <= 0}
                            className={`
                        hidden md:flex
                        absolute top-4 right-4 z-30
                        items-center gap-2 px-5 py-3 
                        bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-full shadow-xl border-2 border-white/50 backdrop-blur-sm
                        transition-all transform
                        ${isSpinning || spinsLeft <= 0 ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:scale-105 hover:shadow-2xl active:scale-95 cursor-pointer'}
                    `}
                        >
                            <span className="uppercase tracking-wider text-xs font-black">{isSpinning ? 'SPINNING...' : 'SPIN NOW'}</span>
                            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-inner">
                                <BoltIcon className="w-3.5 h-3.5" />
                            </div>
                        </button>


                        <div className="relative group transform transition-transform scale-90 md:scale-100 mt-8 md:mt-0">
                            {/* Pointer */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40 drop-shadow-xl pointer-events-none">
                                <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[40px] border-t-slate-800 filter drop-shadow-md"></div>
                            </div>

                            {/* The Wheel */}
                            <div className="rounded-full p-3 bg-gradient-to-b from-yellow-300 via-amber-500 to-orange-600 shadow-[0_20px_50px_rgba(245,158,11,0.5)] border-4 border-white">
                                <div className="rounded-full p-1 bg-white">
                                    <div
                                        className="w-[80vw] h-[80vw] max-w-[380px] max-h-[380px] rounded-full relative overflow-hidden transition-transform duration-[5000ms] cubic-bezier(0.15, 0.9, 0.2, 1.0) border-4 border-slate-100"
                                        style={{
                                            background: `conic-gradient(${gradientParts})`,
                                            transform: `rotate(${rotation}deg)`,
                                        }}
                                    >
                                        {/* Grid Lines */}
                                        {config?.segments.map((_, i) => (
                                            <div
                                                key={`line-${i}`}
                                                className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-white/30 origin-bottom -ml-[1px] z-20"
                                                style={{ transform: `rotate(${(360 / numSegments) * i}deg)` }}
                                            />
                                        ))}
                                        {/* Segment Content */}
                                        {config?.segments.map((seg, i) => {
                                            const angle = (360 / numSegments) * i + (360 / numSegments) / 2;
                                            return (
                                                <div
                                                    key={seg.id}
                                                    className="absolute w-full h-full top-0 left-0 pointer-events-none"
                                                    style={{ transform: `rotate(${angle}deg)` }}
                                                >
                                                    <div className="absolute top-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-start w-16 text-center origin-top">
                                                        {seg.imageUrl ? (
                                                            <img src={seg.imageUrl} alt={seg.label} className="w-10 h-10 object-contain drop-shadow-lg mb-1" />
                                                        ) : (
                                                            <div className="text-2xl drop-shadow-md mb-1">🎁</div>
                                                        )}
                                                        <span className="text-[10px] font-bold text-white drop-shadow-md line-clamp-2 leading-tight uppercase tracking-tight">{seg.label}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Center Hub */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.15)] flex items-center justify-center z-30 border-4 border-slate-100">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner">★</div>
                            </div>
                        </div>

                        {/* Mobile BIG Spin Button (Below Wheel) */}
                        <div className="mt-8 md:hidden w-full flex justify-center">
                            <button
                                onClick={handleSpin}
                                disabled={isSpinning || spinsLeft <= 0}
                                className={`
                            flex items-center justify-center gap-3 px-10 py-4 w-full max-w-xs
                            bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-2xl shadow-xl border-t border-white/20
                            transition-all transform
                            ${isSpinning || spinsLeft <= 0 ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95 cursor-pointer'}
                        `}
                            >
                                <span className="uppercase tracking-widest text-lg font-black">{isSpinning ? 'SPINNING...' : 'SPIN NOW'}</span>
                                <BoltIcon className="w-6 h-6 text-amber-500 animate-pulse" />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PARTICIPANTS LIST (Takes 1/3 on desktop) */}
                    <div className="lg:col-span-1 bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-6 h-fit max-h-[600px] flex flex-col shadow-xl">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <UserCircleIcon className="w-6 h-6 text-amber-500" />
                                Participants
                            </h3>
                            <div className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200 animate-pulse">
                                Live
                            </div>
                        </div>

                        {/* Scrollable List */}
                        <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3 pr-2">
                            {/* Logged in user info card (if on desktop) */}
                            <div className="hidden md:flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-4 shadow-sm">
                                {participant.photoURL ? (
                                    <img src={participant.photoURL} className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" alt="Me" />
                                ) : (
                                    <UserCircleIcon className="w-10 h-10 text-slate-300" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">You ({user.name.split(' ')[0]})</p>
                                    <p className="text-xs text-amber-600 font-bold">{spinsLeft} Spins Left</p>
                                </div>
                            </div>

                            {allParticipants.length > 0 ? allParticipants.map((p, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-slate-50 transition-colors border border-slate-100 shadow-sm">
                                    {p.photoURL ? (
                                        <img src={p.photoURL} className="w-9 h-9 rounded-full object-cover border border-slate-200" alt={p.name} />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-200">
                                            {p.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-700 truncate">{p.name}</p>
                                        <p className="text-[10px] text-slate-400 truncate">{p.productBought}</p>
                                    </div>
                                    {p.status === 'Approved' ? (
                                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    No active participants yet.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* PRIZE MODAL */}
            {showPrizeModal && prizeSegment && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setShowPrizeModal(false)}>
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl w-full max-w-sm text-center p-8 relative animate-bounce-in border-4 border-amber-400" onClick={e => e.stopPropagation()}>

                        {/* Sunburst Effect */}
                        {prizeSegment.type !== 'loss' && (
                            <div className="absolute inset-0 bg-yellow-50 opacity-50 z-0">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                            </div>
                        )}

                        <div className="relative z-10">
                            <div className="text-7xl mb-4 animate-bounce filter drop-shadow-md">
                                {prizeSegment.type === 'loss' ? '😢' : '🎉'}
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
                                {prizeSegment.type === 'loss' ? 'Oh Snap!' : 'You Won!'}
                            </h2>
                            <div className="my-6">
                                {prizeSegment.imageUrl && (
                                    <img src={prizeSegment.imageUrl} className="h-24 mx-auto object-contain mb-4 drop-shadow-xl" alt="" />
                                )}
                                <p className="text-xl font-bold text-amber-600 leading-tight">{prizeSegment.label}</p>
                            </div>

                            <button onClick={() => setShowPrizeModal(false)} className="bg-slate-900 text-white font-bold py-4 px-8 rounded-xl w-full hover:bg-slate-800 transition-all shadow-xl active:scale-95 text-lg">
                                {prizeSegment.type === 'loss' ? 'Try Again' : 'Claim Reward'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 60s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default SpinWinPage;
