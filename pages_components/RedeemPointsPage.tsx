import React, { useState, useEffect } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { StarIcon } from '../components/icons/StarIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';
import { FacebookIcon } from '../components/icons/FacebookIcon';
import { TikTokIcon } from '../components/icons/TikTokIcon';
import { WhatsAppIcon } from '../components/icons/WhatsAppIcon';
import { InstagramIcon } from '../components/icons/InstagramIcon';
import { YouTubeIcon } from '../components/icons/YouTubeIcon';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { Referral } from '../types';
import Spinner from '../components/Spinner';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { useNotification } from '../context/NotificationContext';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { BanknotesIcon } from '../components/icons/BanknotesIcon';

/**
 * Fix: Added interface to define props for RedeemPointsPage, 
 * resolving "Property 'navigate' does not exist on type 'IntrinsicAttributes'" error in App.tsx.
 */
export interface RedeemPointsPageProps {
    navigate: (path: string) => void;
}

/**
 * Fix: Updated component definition to accept navigate prop.
 */
const RedeemPointsPage: React.FC<RedeemPointsPageProps> = ({ navigate }) => {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const { addNotification } = useNotification();
    const [isRedeeming, setIsRedeeming] = useState(false);
    
    // Local state to show instant updates for claimed rewards since user context might lag
    const [claimedLocal, setClaimedLocal] = useState<{ [key: string]: boolean }>({});
    const [localPoints, setLocalPoints] = useState(0);

    const points = (user?.points || 0) + localPoints;
    const nprValue = points * 3; // 1 Point = 3 NPR
    const referralLink = user?.referralCode 
        ? `${window.location.origin}/signup?ref=${user.referralCode}` 
        : '';

    useEffect(() => {
        const fetchReferrals = async () => {
            if (user) {
                try {
                    const refs = await api.getUserReferrals(user.id);
                    setReferrals(refs);
                    // Sync local claim state with user profile
                    if (user.claimedRewards) {
                        setClaimedLocal(prev => ({ ...prev, ...user.claimedRewards }));
                    }
                } catch (error) {
                    console.error("Error fetching referrals", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchReferrals();
    }, [user]);

    const handleCopy = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            addNotification("Referral link copied to clipboard!", "success");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (!referralLink) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Mobi Store',
                    text: `Use my code ${user?.referralCode} to sign up and get 10 points bonus!`,
                    url: referralLink,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            handleCopy();
        }
    };

    const handleSocialClick = async (platform: string, url: string) => {
        if (!user) return;
        
        // 1. Open Link
        window.open(url, '_blank');

        // 2. Check if already claimed locally or in user profile
        if (claimedLocal[platform] || user.claimedRewards?.[platform]) {
            return; 
        }

        // 3. Claim Reward
        const pointsToAdd = 5;
        const success = await api.claimSocialReward(user.id, platform, pointsToAdd);
        
        if (success) {
            setClaimedLocal(prev => ({ ...prev, [platform]: true }));
            setLocalPoints(prev => prev + pointsToAdd);
            addNotification(`You earned ${pointsToAdd} points!`, 'success');
        }
    };
    
    const handleRedeemRequest = async () => {
        if (!user) return;

        if (points < 500) {
            addNotification(`You need ${500 - points} more points to reach the minimum of 500.`, "error");
            return;
        }

        if (!confirm(`Are you sure you want to redeem ${points} points for NPR ${nprValue.toLocaleString()}?`)) return;
        
        setIsRedeeming(true);
        try {
            await api.addRedemptionRequest({
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                points: points,
                cashValue: nprValue,
                paymentDetails: user.email // Default to email, admin can contact
            });
            addNotification("Redemption request submitted! Admin will process shortly.", "success");
        } catch (error) {
            console.error("Redemption failed", error);
            addNotification("Failed to submit request. Please try again.", "error");
        } finally {
            setIsRedeeming(false);
        }
    };

    const socialTasks = [
        { id: 'facebook', name: 'Facebook', icon: <FacebookIcon className="w-6 h-6 text-[#1877F2]" />, url: 'https://www.facebook.com/share/17SwmmmU6f/?mibextid=wwXIfr' },
        { id: 'tiktok', name: 'TikTok', icon: <TikTokIcon className="w-6 h-6" />, url: 'https://www.tiktok.com/@mobistoreapp?_r=1&_t=ZS-91M9tAbNqqK' },
        { id: 'whatsapp', name: 'WhatsApp', icon: <WhatsAppIcon className="w-6 h-6 text-[#25D366]" />, url: 'https://wa.me/+9779812141777' },
        { id: 'instagram', name: 'Instagram', icon: <InstagramIcon className="w-6 h-6 text-[#E4405F]" />, url: 'https://instagram.com' },
        { id: 'youtube', name: 'YouTube', icon: <YouTubeIcon className="w-6 h-6 text-[#FF0000]" />, url: 'https://youtube.com/@mobistoreapp' },
    ];

    if (!user) {
        return (
             <div className="text-center py-20 min-h-[60vh] flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-900">Please log in</h1>
                <p className="mt-2 text-gray-600">You need to be logged in to access your points.</p>
            </div>
        );
    }

    const canRedeem = points >= 500;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Disable default spacer and handle padding manually */}
            <MobileSkyHeader title="Redeem Points" Icon={StarIcon} hasSpacer={false} />
            
            {/* Add padding top to account for header + pull content up */}
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-32 pb-6 space-y-4 relative z-10">
                
                {/* Points Balance Card - Negative top margin to tuck under header */}
                <div className="-mt-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden ring-4 ring-white/30 backdrop-blur-sm">
                     <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                     <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 bg-black/10 rounded-full blur-lg"></div>
                     
                     <div className="flex items-end justify-between relative z-10 mb-6">
                         <div>
                             <p className="text-amber-100 text-xs font-bold uppercase tracking-wider mb-1">Available Points</p>
                             <h1 className="text-5xl font-black tracking-tighter">{points}</h1>
                         </div>
                         <div className="text-right bg-black/20 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                             <p className="text-amber-100 text-xs font-medium uppercase tracking-wide">Cash Value</p>
                             <p className="text-xl font-bold text-white flex items-center justify-end gap-1">
                                 <BanknotesIcon className="w-5 h-5 text-green-300" />
                                 NPR {nprValue.toLocaleString()}
                             </p>
                         </div>
                     </div>

                     <div className="border-t border-white/20 pt-4">
                         <button 
                            onClick={handleRedeemRequest}
                            disabled={!canRedeem || isRedeeming}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                                canRedeem && !isRedeeming
                                ? 'bg-white text-orange-600 hover:bg-orange-50' 
                                : 'bg-black/20 text-white/80 cursor-not-allowed border border-white/10'
                            }`}
                         >
                             {isRedeeming ? (
                                 <span>Processing...</span>
                             ) : canRedeem ? (
                                 <>
                                    <CheckCircleIcon className="w-5 h-5" />
                                    Request Redemption
                                 </>
                             ) : (
                                 <>
                                    <span>Locked</span>
                                    <span className="opacity-75 font-normal">(Min 500 Pts)</span>
                                 </>
                             )}
                         </button>
                         {!canRedeem && (
                             <p className="text-center text-[10px] text-amber-100 mt-2">
                                 Earn {500 - points} more points to unlock cash redemption.
                             </p>
                         )}
                     </div>
                </div>
                
                {/* Follow & Earn Section */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-base font-bold text-gray-900 mb-3">Follow & Earn</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {socialTasks.map(task => {
                            const isClaimed = claimedLocal[task.id] || user.claimedRewards?.[task.id];
                            return (
                                <button
                                    key={task.id}
                                    onClick={() => handleSocialClick(task.id, task.url)}
                                    disabled={!!isClaimed}
                                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                                        isClaimed 
                                        ? 'bg-green-50 border-green-200 cursor-default' 
                                        : 'bg-white border-gray-200 hover:border-amber-400 hover:shadow-sm active:scale-95'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {task.icon}
                                        <span className={`font-medium text-sm ${isClaimed ? 'text-green-800' : 'text-gray-700'}`}>{task.name}</span>
                                    </div>
                                    {isClaimed ? (
                                        <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Earned
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                                            <PlusCircleIcon className="w-3 h-3" />
                                            5 Pts
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Refer & Earn Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Refer & Earn</h2>
                    <p className="text-xs text-gray-500 mb-3">Share your code. You get 20 points when friends sign up!</p>
                    
                    <div className="flex flex-col gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Your Code</p>
                                <p className="text-lg font-mono font-bold text-gray-800 tracking-wider">{user.referralCode || 'Generating...'}</p>
                            </div>
                            <button onClick={handleCopy} className="p-2 text-gray-500 hover:text-amber-600 transition-colors">
                                {copied ? <CheckCircleIcon className="w-6 h-6 text-green-500"/> : <ClipboardIcon className="w-6 h-6"/>}
                            </button>
                        </div>
                        
                        <button 
                            onClick={handleShare}
                            disabled={!user.referralCode}
                            className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md transition-colors disabled:bg-indigo-300 text-sm"
                        >
                            <ShareIcon className="w-5 h-5" />
                            Share Link
                        </button>
                    </div>
                </div>

                {/* Referral History */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                     <h2 className="text-base font-bold text-gray-900 mb-3">Referral History</h2>
                     {loading ? <div className="text-center py-2"><Spinner size="w-6 h-6" /></div> : referrals.length > 0 ? (
                         <div className="space-y-3">
                             {referrals.map(ref => (
                                 <div key={ref.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                     <div>
                                         <p className="font-medium text-sm text-gray-800">{ref.referredUserName}</p>
                                         <p className="text-[10px] text-gray-500">{ref.date}</p>
                                     </div>
                                     <div className="text-right">
                                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold 
                                            ${ref.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                              ref.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 
                                              'bg-yellow-100 text-yellow-700'}`}>
                                             {ref.status}
                                         </span>
                                         {ref.status === 'Approved' && (
                                             <p className="text-[10px] text-green-600 font-bold mt-0.5">+ {ref.points} Pts</p>
                                         )}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <p className="text-center text-gray-400 text-xs py-2">No referrals yet.</p>
                     )}
                </div>

            </div>
        </div>
    );
};

export default RedeemPointsPage;
