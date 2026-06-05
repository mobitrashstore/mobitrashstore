
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as api from '../services/api';
import { SpinWheelConfig, SpinSegment, SpinParticipant } from '../types';
import Spinner from '../components/Spinner';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { BoltIcon } from '../components/icons/BoltIcon';
import Chart from 'chart.js/auto';
import { ArrowPathIcon } from '../components/icons/ArrowPathIcon';

interface SpinDailyStat {
  date: string;
  totalSpins: number;
  uniqueUsers: number;
}

interface SpinRewardStat {
  label: string;
  type: 'points' | 'coupon' | 'loss';
  timesWon: number;
}

interface SpinStatsResponse {
  daily: SpinDailyStat[];
  rewards: SpinRewardStat[];
}

interface AdminSpinWheelPageProps {
  navigate: (path: string) => void;
}

const AdminSpinWheelPage: React.FC<AdminSpinWheelPageProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'participants' | 'config' | 'analytics'>('participants');

  const [config, setConfig] = useState<SpinWheelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Analytics
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<SpinStatsResponse | null>(null);
  
  // Chart Refs
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartInstance = useRef<Chart | null>(null);
  const barChartInstance = useRef<Chart | null>(null);

  // Participants
  const [participants, setParticipants] = useState<SpinParticipant[]>([]);
  const [partLoading, setPartLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Wheel Simulation State
  const [simRotation, setSimRotation] = useState(0);
  const [isSimSpinning, setIsSimSpinning] = useState(false);
  const [simWinner, setSimWinner] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const data = await api.getSpinWheelConfig();
        if (data) {
          setConfig({
            dailySpinLimit: data.dailySpinLimit ?? 3,
            cooldownSeconds: data.cooldownSeconds ?? 60,
            ...data,
          });
        } else {
          setConfig({
            isEnabled: false,
            segments: [],
            rules: '',
            backgroundImageUrl: '',
            dailySpinLimit: 3,
            cooldownSeconds: 60,
          });
        }
      } catch (error) {
        console.error('Failed to load config', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
    fetchParticipants(); // Load participants immediately
  }, []);

  // Fetch Participants
  const fetchParticipants = async () => {
      setPartLoading(true);
      try {
          const data = await api.getAllSpinParticipants();
          setParticipants(data);
      } catch (e) {
          console.error(e);
      } finally {
          setPartLoading(false);
      }
  };

  // Load Stats when tab changes
  useEffect(() => {
      if (activeTab === 'analytics') {
          loadStats();
      }
  }, [activeTab]);

  // Chart Rendering Effect
  useEffect(() => {
    if (activeTab === 'analytics' && stats && !statsLoading) {
        // 1. Line Chart (Daily Activity)
        if (lineChartRef.current) {
            if (lineChartInstance.current) lineChartInstance.current.destroy();
            const ctx = lineChartRef.current.getContext('2d');
            if (ctx) {
                lineChartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: stats.daily.map(d => d.date),
                        datasets: [{
                            label: 'Total Spins',
                            data: stats.daily.map(d => d.totalSpins),
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderWidth: 2,
                            tension: 0.3,
                            fill: true,
                            pointRadius: 4
                        }, {
                            label: 'Unique Users',
                            data: stats.daily.map(d => d.uniqueUsers),
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.0)',
                            borderWidth: 2,
                            tension: 0.3,
                            pointRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'top', align: 'end' } },
                        scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
                    }
                });
            }
        }
        // 2. Bar Chart (Rewards)
        if (barChartRef.current) {
            if (barChartInstance.current) barChartInstance.current.destroy();
            const ctx = barChartRef.current.getContext('2d');
            if (ctx) {
                barChartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: stats.rewards.map(r => r.label),
                        datasets: [{
                            label: 'Times Won',
                            data: stats.rewards.map(r => r.timesWon),
                            backgroundColor: stats.rewards.map(r => r.type === 'loss' ? '#f43f5e' : r.type === 'points' ? '#10b981' : '#3b82f6'),
                            borderRadius: 6,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: { legend: { display: false } },
                         scales: { x: { beginAtZero: true }, y: { grid: { display: false } } }
                    }
                });
            }
        }
    }
    return () => {
        if (lineChartInstance.current) lineChartInstance.current.destroy();
        if (barChartInstance.current) barChartInstance.current.destroy();
    };
  }, [activeTab, stats, statsLoading]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const data = (await (api as any).getSpinWheelStats()) as SpinStatsResponse;
      data.daily.sort((a, b) => (a.date > b.date ? 1 : -1));
      data.rewards.sort((a, b) => b.timesWon - a.timesWon);
      setStats(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  // --- Handlers ---
  const handleApprove = async (id: string) => {
      if(!confirm("Approve this user? They will get 3 spins immediately.")) return;
      await api.updateSpinParticipantStatus(id, { status: 'Approved', spinsAllocated: 3 });
      fetchParticipants();
  };

  const handleReject = async (id: string) => {
      if(!confirm("Reject this user?")) return;
      await api.updateSpinParticipantStatus(id, { status: 'Rejected', spinsAllocated: 0 });
      fetchParticipants();
  };
  
  const handleAddSpins = async (id: string, current: number) => {
      const amount = prompt("How many spins to add?", "3");
      if (amount) {
          await api.updateSpinParticipantStatus(id, { spinsAllocated: current + parseInt(amount) });
          fetchParticipants();
      }
  }

  // Config Handlers
  const handleAddSegment = () => {
    if (!config) return;
    const newSegment: SpinSegment = {
      id: Date.now().toString(),
      label: 'New Reward',
      color: '#ff5722',
      probability: 10,
      type: 'points',
      value: 0,
      imageUrl: '',
    };
    setConfig({ ...config, segments: [...config.segments, newSegment] });
  };

  const handleRemoveSegment = (id: string) => {
    if (!config) return;
    setConfig({ ...config, segments: config.segments.filter(s => s.id !== id) });
  };

  const handleSegmentChange = (id: string, field: keyof SpinSegment, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      segments: config.segments.map(seg =>
        seg.id === id ? { ...seg, [field]: value } : seg
      ),
    });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.updateSpinWheelConfig(config);
      alert('Config saved successfully!');
    } catch (error) {
      alert('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  // Wheel Simulation Logic
  const simulateSpin = () => {
      if(!config || isSimSpinning) return;
      setIsSimSpinning(true);
      setSimWinner(null);

      // Random logic
      const random = Math.random() * 100;
      let accumulatedProb = 0;
      let winningIndex = 0;

      for (let i = 0; i < config.segments.length; i++) {
        accumulatedProb += Number(config.segments[i].probability);
        if (random <= accumulatedProb) {
            winningIndex = i;
            break;
        }
      }

      const segmentCount = config.segments.length;
      const segmentArc = 360 / segmentCount;
      const winningSegmentCenterAngle = winningIndex * segmentArc + segmentArc / 2;
      const extraSpins = 360 * 5; 
      const targetRotation = 360 - winningSegmentCenterAngle; 
      const newRotation = simRotation + extraSpins + targetRotation;

      setSimRotation(newRotation);

      setTimeout(() => {
          setIsSimSpinning(false);
          setSimWinner(config.segments[winningIndex].label);
      }, 5000);
  };

  const filteredParticipants = participants.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.phone.includes(searchQuery) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productBought.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !config) return <div className="flex justify-center py-20"><Spinner /></div>;

  // Calculate Gradient for Wheel
  const numSegments = config.segments.length;
  const gradientParts = config.segments.map((seg, i) => {
      const start = (i / numSegments) * 100;
      const end = ((i + 1) / numSegments) * 100;
      return `${seg.color} ${start}% ${end}%`;
  }).join(', ');

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-slate-50 overflow-hidden">
        
        {/* LEFT COLUMN: LIVE WHEEL SIMULATOR (Dark Mode) */}
        <div className="xl:w-1/3 bg-slate-900 border-b xl:border-b-0 xl:border-r border-slate-800 p-8 flex flex-col items-center justify-center relative overflow-hidden shrink-0 min-h-[500px] xl:min-h-auto">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500"></div>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)] pointer-events-none"></div>

             <div className="relative z-10 text-center mb-8">
                 <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center justify-center gap-2">
                     <SparklesIcon className="w-6 h-6 text-amber-500" />
                     Live Preview
                 </h2>
                 <p className="text-slate-400 text-xs mt-2">Simulate the user experience. Click 'Test Spin'.</p>
             </div>

             {/* WHEEL UI */}
             <div className="relative mb-8">
                {/* Pointer */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-40 drop-shadow-xl pointer-events-none">
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[35px] border-t-white filter drop-shadow-md"></div>
                </div>

                <div className="rounded-full p-2 bg-gradient-to-b from-yellow-400 via-amber-600 to-yellow-700 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                  <div className="rounded-full p-1 bg-slate-900">
                    <div
                      className="w-[280px] h-[280px] rounded-full relative overflow-hidden transition-transform duration-[5000ms] cubic-bezier(0.15, 0.9, 0.2, 1.0)"
                      style={{
                        background: `conic-gradient(${gradientParts})`,
                        transform: `rotate(${simRotation}deg)`,
                      }}
                    >
                      {config.segments.map((_, i) => (
                        <div
                          key={`line-${i}`}
                          className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-white/30 origin-bottom -ml-[1px] z-20"
                          style={{ transform: `rotate(${(360 / numSegments) * i}deg)` }}
                        />
                      ))}
                      {config.segments.map((seg, i) => {
                        const angle = (360 / numSegments) * i + (360 / numSegments) / 2;
                        return (
                          <div
                            key={seg.id}
                            className="absolute w-full h-full top-0 left-0 pointer-events-none"
                            style={{ transform: `rotate(${angle}deg)` }}
                          >
                            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-start w-16 text-center origin-top">
                              {seg.imageUrl ? (
                                <img src={seg.imageUrl} alt={seg.label} className="w-8 h-8 object-contain drop-shadow-lg" />
                              ) : (
                                <div className="text-xl drop-shadow-md">🎁</div>
                              )}
                              <span className="mt-1 text-[10px] font-bold text-white drop-shadow-sm line-clamp-2">{seg.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center z-30 border-4 border-slate-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center text-white font-black text-lg">★</div>
                </div>
             </div>
             
             {simWinner && (
                 <div className="absolute bottom-20 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce-in">
                     Result: {simWinner}
                 </div>
             )}

             <button 
                onClick={simulateSpin}
                disabled={isSimSpinning}
                className="bg-white text-slate-900 font-black py-3 px-10 rounded-full shadow-xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
             >
                 {isSimSpinning ? 'Spinning...' : 'TEST SPIN'}
             </button>
        </div>

        {/* RIGHT COLUMN: MANAGEMENT TABS */}
        <div className="xl:w-2/3 flex flex-col h-full overflow-hidden bg-slate-50">
            {/* Header / Tabs */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                    <button onClick={() => setActiveTab('participants')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'participants' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Participants</button>
                    <button onClick={() => setActiveTab('config')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Config</button>
                    <button onClick={() => setActiveTab('analytics')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Analytics</button>
                </div>
                
                {activeTab === 'config' && (
                    <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-green-700 shadow-md transition-colors disabled:bg-slate-300 w-full sm:w-auto">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
                {activeTab === 'participants' && (
                    <button onClick={fetchParticipants} className="bg-white border border-slate-200 text-slate-600 font-bold p-2.5 rounded-xl hover:bg-slate-50 shadow-sm transition-colors" title="Refresh">
                        <ArrowPathIcon className={`w-5 h-5 ${partLoading ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                
                {/* 1. PARTICIPANTS TAB */}
                {activeTab === 'participants' && (
                    <div className="space-y-6">
                        {/* Summary & Search */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                             <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
                                 <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center min-w-[100px]">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
                                     <p className="text-xl font-black text-amber-500">{participants.filter(p => p.status === 'Pending').length}</p>
                                 </div>
                                 <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center min-w-[100px]">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase">Approved</p>
                                     <p className="text-xl font-black text-green-500">{participants.filter(p => p.status === 'Approved').length}</p>
                                 </div>
                                 <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center min-w-[100px]">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                                     <p className="text-xl font-black text-slate-700">{participants.length}</p>
                                 </div>
                             </div>
                             
                             <div className="relative flex-grow max-w-md">
                                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                 <input 
                                    type="text" 
                                    placeholder="Search user, phone or product..." 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-sm"
                                 />
                             </div>
                        </div>

                        {/* List */}
                        <div className="grid grid-cols-1 gap-4">
                            {filteredParticipants.length > 0 ? filteredParticipants.map(p => (
                                <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {p.photoURL ? <img src={p.photoURL} className="w-12 h-12 rounded-full object-cover border border-slate-200" /> : <UserCircleIcon className="w-12 h-12 text-slate-300" />}
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${p.status === 'Approved' ? 'bg-green-500' : p.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{p.name}</h3>
                                            <p className="text-xs text-slate-500">{p.phone} • {p.email}</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold uppercase tracking-wide border border-slate-200">{p.productBought}</span>
                                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase border border-indigo-100">{p.purchasePlan}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                                        <div className="text-center px-2">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Spins</p>
                                            <p className="font-black text-lg text-slate-800">{p.spinsAllocated - p.spinsUsed}</p>
                                            <button onClick={() => handleAddSpins(p.id, p.spinsAllocated)} className="text-[10px] text-blue-600 font-bold hover:underline">+ Add</button>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {p.status !== 'Approved' && (
                                                <button onClick={() => handleApprove(p.id)} className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg font-bold text-xs hover:bg-green-100 border border-green-200 transition-colors">
                                                    <CheckCircleIcon className="w-4 h-4" /> Approve
                                                </button>
                                            )}
                                            {p.status !== 'Rejected' && (
                                                <button onClick={() => handleReject(p.id)} className="flex items-center gap-1 px-3 py-2 bg-rose-50 text-rose-700 rounded-lg font-bold text-xs hover:bg-rose-100 border border-rose-200 transition-colors">
                                                    <XCircleIcon className="w-4 h-4" /> Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                                    No participants found matching your search.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. CONFIG TAB */}
                {activeTab === 'config' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-lg text-slate-800 mb-4">Global Settings</h3>
                            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <input type="checkbox" checked={config.isEnabled} onChange={e => setConfig({...config, isEnabled: e.target.checked})} className="h-5 w-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"/>
                                <label className="font-bold text-slate-700">Enable Spin & Win Game</label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Cooldown (Seconds)</label>
                                    <input type="number" value={config.cooldownSeconds || ''} onChange={e => setConfig({...config, cooldownSeconds: Number(e.target.value)})} className="w-full p-3 border border-slate-300 rounded-lg"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Daily Limit (Global)</label>
                                    <input type="number" value={config.dailySpinLimit || ''} onChange={e => setConfig({...config, dailySpinLimit: Number(e.target.value)})} className="w-full p-3 border border-slate-300 rounded-lg"/>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-slate-800">Wheel Segments</h3>
                                <button onClick={handleAddSegment} className="bg-blue-50 text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-blue-100 flex items-center gap-2 text-sm transition-colors">
                                    <PlusCircleIcon className="w-4 h-4" /> Add Segment
                                </button>
                            </div>
                            <div className="space-y-3">
                                {config.segments.map((seg, i) => (
                                    <div key={seg.id} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
                                        <span className="w-6 text-center font-bold text-slate-400">{i+1}</span>
                                        <input type="text" value={seg.label} onChange={e => handleSegmentChange(seg.id, 'label', e.target.value)} className="flex-grow p-2 border border-slate-300 rounded-lg text-sm min-w-[120px]" placeholder="Label"/>
                                        <input type="color" value={seg.color} onChange={e => handleSegmentChange(seg.id, 'color', e.target.value)} className="w-10 h-10 p-0 border border-slate-300 rounded-lg cursor-pointer"/>
                                        <input type="number" value={seg.probability || ''} onChange={e => handleSegmentChange(seg.id, 'probability', Number(e.target.value))} className="w-16 p-2 border border-slate-300 rounded-lg text-sm" placeholder="%"/>
                                        <select value={seg.type} onChange={e => handleSegmentChange(seg.id, 'type', e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm bg-white">
                                            <option value="points">Points</option>
                                            <option value="coupon">Coupon</option>
                                            <option value="loss">Loss</option>
                                        </select>
                                        {seg.type === 'points' && (
                                            <input type="number" value={seg.value || ''} onChange={e => handleSegmentChange(seg.id, 'value', Number(e.target.value))} className="w-20 p-2 border border-slate-300 rounded-lg text-sm" placeholder="Pts"/>
                                        )}
                                        <button onClick={() => handleRemoveSegment(seg.id)} className="text-rose-500 hover:bg-rose-100 p-2 rounded-lg transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. ANALYTICS TAB */}
                {activeTab === 'analytics' && stats && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold mb-4 text-slate-800 flex items-center gap-2">
                                <BoltIcon className="w-5 h-5 text-amber-500" /> Daily Spin Activity
                            </h3>
                            <div className="h-64 w-full relative">
                                {statsLoading ? <div className="flex items-center justify-center h-full"><Spinner /></div> : <canvas ref={lineChartRef}></canvas>}
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold mb-4 text-slate-800 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-purple-500" /> Reward Distribution
                            </h3>
                            <div className="h-64 w-full relative">
                                {statsLoading ? <div className="flex items-center justify-center h-full"><Spinner /></div> : <canvas ref={barChartRef}></canvas>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default AdminSpinWheelPage;
