
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Referral, RedemptionRequest } from '../types';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';
import Spinner from '../components/Spinner';
import { GiftIcon } from '../components/icons/GiftIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { BanknotesIcon } from '../components/icons/BanknotesIcon';

interface AdminPointsPageProps {
    navigate: (path: string) => void;
}

const AdminPointsPage: React.FC<AdminPointsPageProps> = ({ navigate }) => {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Manual Point Injection State
    const [targetEmail, setTargetEmail] = useState('');
    const [pointsAmount, setPointsAmount] = useState('');
    const [isSubmittingPoints, setIsSubmittingPoints] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allRefs, allRedemptions] = await Promise.all([
                api.getPendingReferrals(),
                api.getRedemptionRequests()
            ]);
            setReferrals(allRefs);
            
            // Filter out completed/rejected for the main list, or show all? 
            // Let's show pending at top
            const pendingRedemptions = allRedemptions.filter(r => r.status === 'Pending');
            setRedemptions(pendingRedemptions);

        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproveReferral = async (ref: Referral) => {
        if (!confirm(`Approve referral from ${ref.referrerName}? This will add ${ref.points} points to their account.`)) return;
        try {
            await api.addPoints(ref.referrerId, ref.points);
            await api.updateReferralStatus(ref.id, 'Approved');
            setReferrals(prev => prev.filter(r => r.id !== ref.id));
            alert("Approved and points added.");
        } catch (error) {
            console.error("Failed to approve", error);
            alert("Failed to approve.");
        }
    };

    const handleRejectReferral = async (ref: Referral) => {
        if (!confirm("Reject this referral?")) return;
        try {
            await api.updateReferralStatus(ref.id, 'Rejected');
             setReferrals(prev => prev.filter(r => r.id !== ref.id));
        } catch (error) {
            console.error("Failed to reject", error);
            alert("Failed to reject.");
        }
    };

    const handleProcessRedemption = async (req: RedemptionRequest) => {
        if (!confirm(`Process redemption for ${req.userName}? This will RESET their points to 0 and mark this request as completed.`)) return;
        try {
            await api.processRedemption(req.id, req.userId);
            setRedemptions(prev => prev.filter(r => r.id !== req.id));
            alert("User points reset and request completed.");
        } catch (error) {
            console.error("Failed to process redemption", error);
            alert("Failed to process redemption.");
        }
    };
    
    const handleSendPoints = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(pointsAmount);
        if (!targetEmail || !amount || amount <= 0) {
            alert("Please enter a valid email and points amount.");
            return;
        }

        setIsSubmittingPoints(true);
        try {
            await api.addPointsByEmail(targetEmail, amount);
            alert(`Successfully added ${amount} points to ${targetEmail}`);
            setTargetEmail('');
            setPointsAmount('');
        } catch (error: any) {
            console.error("Failed to add points:", error);
            alert(`Failed to add points: ${error.message || "Unknown error"}`);
        } finally {
            setIsSubmittingPoints(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Points & Rewards</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                 {/* 0. Redemption Requests (Priority) */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <BanknotesIcon className="w-6 h-6 text-orange-500" /> Redemption Requests
                    </h2>
                    
                    {loading ? (
                        <div className="flex justify-center py-6"><Spinner size="w-8 h-8"/></div>
                    ) : redemptions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {redemptions.map(req => (
                                <div key={req.id} className="bg-orange-50 p-4 rounded-xl border border-orange-100 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-slate-800">{req.userName}</p>
                                            <p className="text-xs text-slate-500">{req.userEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-orange-700 uppercase">Cash Value</p>
                                            <p className="text-lg font-black text-slate-900">NPR {req.cashValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs font-medium bg-white px-2 py-0.5 rounded border border-orange-200 text-orange-800">
                                            {req.points} Points
                                        </span>
                                        <span className="text-[10px] text-slate-400">{new Date(req.date).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleProcessRedemption(req)}
                                        className="w-full py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" /> Process & Reset Points
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                            No pending redemption requests.
                        </div>
                    )}
                </div>

                {/* 1. Manual Reward Injection */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <GiftIcon className="w-6 h-6 text-amber-500" /> Send Points
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">Manually reward specific users with points for special occasions or compensation.</p>
                    
                    <form onSubmit={handleSendPoints} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">User Email</label>
                            <div className="relative">
                                <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="email" 
                                    value={targetEmail}
                                    onChange={(e) => setTargetEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Points Amount</label>
                            <input 
                                type="number" 
                                value={pointsAmount}
                                onChange={(e) => setPointsAmount(e.target.value)}
                                placeholder="e.g. 50"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 outline-none font-bold text-slate-800"
                                required
                                min="1"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmittingPoints}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl hover:from-amber-600 hover:to-orange-700 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmittingPoints ? <Spinner size="w-5 h-5" /> : <><PlusCircleIcon className="w-5 h-5"/> Add Points</>}
                        </button>
                    </form>
                </div>

                {/* 2. Referral Approvals */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <CheckCircleIcon className="w-6 h-6 text-blue-500" /> Pending Referrals
                    </h2>
                    
                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner /></div>
                    ) : referrals.length > 0 ? (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {referrals.map(ref => (
                                <div key={ref.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Referrer</p>
                                            <p className="font-bold text-slate-800">{ref.referrerName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400 font-bold uppercase">New User</p>
                                            <p className="font-medium text-slate-700">{ref.referredUserName}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                                        <span className="font-bold text-amber-600">+{ref.points} Points</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApproveReferral(ref)} className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors" title="Approve">
                                                <CheckCircleIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleRejectReferral(ref)} className="p-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors" title="Reject">
                                                <XCircleIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p>No pending referrals.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPointsPage;
