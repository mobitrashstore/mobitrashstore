
import React, { useState, useEffect, useRef, useMemo } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { CalculatorIcon } from '../components/icons/CalculatorIcon';
import SEO from '../components/SEO';
import Chart from 'chart.js/auto';
import { BanknotesIcon } from '../components/icons/BanknotesIcon';
import { ChartBarIcon } from '../components/icons/ChartBarIcon';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { InformationCircleIcon } from '../components/icons/InformationCircleIcon';
import { ArrowTrendingUpIcon } from '../components/icons/ArrowTrendingUpIcon';

interface AdminEmiPageProps {
    navigate: (path: string) => void;
}

const NEPAL_BANK_RATES = [
    { bank: 'Nabil Bank', rate: 10.5, range: '9.5% - 13%' },
    { bank: 'Global IME', rate: 11.5, range: '10% - 14%' },
    { bank: 'NIC Asia', rate: 12.0, range: '10.5% - 14.5%' },
    { bank: 'Himalayan Bank', rate: 10.99, range: '9.99% - 13.5%' },
    { bank: 'Standard Chartered', rate: 10.0, range: '9.5% - 12.5%' },
];

const EmiCalculatorPage: React.FC<AdminEmiPageProps> = ({ navigate }) => {
    // State
    const [totalPrice, setTotalPrice] = useState<number>(150000);
    const [downPayment, setDownPayment] = useState<number>(30000);
    const [processingFee, setProcessingFee] = useState<number>(1); // in percentage
    const [rate, setRate] = useState<number>(12);
    const [tenure, setTenure] = useState<number>(12); // In months
    const [tenureType, setTenureType] = useState<'Months' | 'Years'>('Months');
    const [monthlyIncome, setMonthlyIncome] = useState<number>(50000);

    // Reset function
    const handleReset = () => {
        setTotalPrice(150000);
        setDownPayment(30000);
        setProcessingFee(1);
        setRate(12);
        setTenure(12);
        setTenureType('Months');
        setMonthlyIncome(50000);
    };

    // Best Bank logic
    const bestBank = useMemo(() => {
        return [...NEPAL_BANK_RATES].sort((a, b) => a.rate - b.rate)[0];
    }, []);

    // Chart Ref
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    // --- Calculation Logic ---
    const results = useMemo(() => {
        const principal = Math.max(0, totalPrice - downPayment);
        const r = rate / 12 / 100; // Monthly interest rate
        const n = tenureType === 'Years' ? tenure * 12 : tenure; // Total months

        let emi = 0;
        let totalInterest = 0;
        const feeAmount = (totalPrice * processingFee) / 100;

        if (principal > 0 && r > 0 && n > 0) {
            emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            totalInterest = (emi * n) - principal;
        } else if (principal > 0 && r === 0 && n > 0) {
            emi = principal / n;
            totalInterest = 0;
        }

        const totalPayable = principal + totalInterest + feeAmount;

        return {
            principal,
            emi: Math.round(emi),
            totalInterest: Math.round(totalInterest),
            totalPayable: Math.round(totalPayable),
            totalMonths: n,
            feeAmount: Math.round(feeAmount)
        };
    }, [totalPrice, downPayment, rate, tenure, tenureType, processingFee]);

    // Affordability Logic
    const affordability = useMemo(() => {
        if (!monthlyIncome || monthlyIncome === 0) return { score: 0, status: 'Unknown', color: 'text-gray-400' };
        const ratio = (results.emi / monthlyIncome) * 100;

        if (ratio <= 20) return { score: ratio, status: 'Excellent', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', note: 'Easily affordable for your budget.' };
        if (ratio <= 40) return { score: ratio, status: 'Good', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', note: 'Reasonable within typical financial limits.' };
        if (ratio <= 50) return { score: ratio, status: 'Warning', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', note: 'Higher than recommended. Consider increasing tenure to reduce EMI.' };
        return { score: ratio, status: 'Risky', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', note: 'May strain your monthly finances significantly. We recommend a longer tenure.' };
    }, [results.emi, monthlyIncome]);

    // --- Chart Rendering ---
    useEffect(() => {
        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstance.current = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Principal', 'Interest', 'Fees'],
                        datasets: [{
                            data: [results.principal, results.totalInterest, results.feeAmount],
                            backgroundColor: ['#f97316', '#f59e0b', '#6366f1'], // Emerald, Amber, Indigo
                            hoverOffset: 10,
                            borderWidth: 0,
                            borderRadius: 5
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    usePointStyle: true,
                                    padding: 20,
                                    font: { family: "'Inter', sans-serif", size: 12, weight: 'bold' }
                                }
                            },
                        }
                    }
                });
            }
        }
    }, [results]);

    // --- Amortization Schedule ---
    const schedule = useMemo(() => {
        const data = [];
        let balance = results.principal;
        const r = rate / 12 / 100;

        for (let i = 1; i <= results.totalMonths; i++) {
            const interest = balance * r;
            const principalComponent = results.emi - interest;
            balance = balance - principalComponent;

            if (balance < 0) balance = 0;

            data.push({
                month: i,
                principal: principalComponent,
                interest: interest,
                balance: balance
            });
        }
        return data;
    }, [results, rate]);


    // SEO Schema
    const calculatorSchema = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": "Mobi Store Smart EMI Calculator",
        "description": "Powerful & smart EMI calculator for mobile loans with down payment and affordability check.",
        "brand": "Mobi Store",
        "potentialAction": {
            "@type": "Action",
            "name": "Calculate EMI"
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <SEO
                title="Smart EMI Calculator - Professional Loan Planning"
                description="Use our smart EMI calculator with down payment support, processing fees, and affordability scoring. Best tool for mobile financing in Nepal."
                keywords="smart emi calculator, mobile loan nepal, loan affordability calculator, down payment calculator"
                canonicalUrl="https://mobitrashstore.com/emi-calculator"
                schema={calculatorSchema}
            />

            <MobileSkyHeader title="Smart EMI Calculator" Icon={CalculatorIcon} hasSpacer={true} />

            <div className="w-full px-4 sm:px-6 lg:px-10 py-8 pt-10 md:pt-20">

                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="flex justify-center flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 uppercase tracking-widest shadow-sm">
                            <SparklesIcon className="w-3 h-3 mr-1" /> Powered by Mobi Store Team
                        </span>
                        <button
                            onClick={handleReset}
                            className="inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-rose-500 transition-all uppercase tracking-widest shadow-sm"
                        >
                            Reset Form
                        </button>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
                        Calculate with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-teal-500">Precision.</span>
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
                        Go beyond simple math. Professional financing tool for clear and smart investment decisions.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left: Controls */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">

                            {/* Input Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Total Price */}
                                <div>
                                    <div className="flex justify-between mb-3 items-center">
                                        <label className="font-bold text-slate-700 flex items-center">
                                            Total Phone Price
                                        </label>
                                        <div className="bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                                            <span className="text-orange-700 font-black text-sm">NPR {totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="5000"
                                        max="500000"
                                        step="5000"
                                        value={totalPrice}
                                        onChange={(e) => setTotalPrice(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                        <span>5K</span>
                                        <span>500K</span>
                                    </div>
                                </div>

                                {/* Down Payment */}
                                <div>
                                    <div className="flex justify-between mb-3 items-center">
                                        <label className="font-bold text-slate-700">Down Payment</label>
                                        <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                                            <span className="text-blue-700 font-black text-sm">NPR {downPayment.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={totalPrice}
                                        step="1000"
                                        value={downPayment}
                                        onChange={(e) => setDownPayment(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                        <span>0</span>
                                        <span>{Math.round((downPayment / totalPrice) * 100)}% of total</span>
                                    </div>
                                </div>

                                {/* Interest Rate */}
                                <div>
                                    <div className="flex justify-between mb-3 items-center">
                                        <label className="font-bold text-slate-700">Interest Rate (p.a)</label>
                                        <div className="bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                                            <span className="text-amber-700 font-black text-sm">{rate}%</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="30"
                                        step="0.1"
                                        value={rate}
                                        onChange={(e) => setRate(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                </div>

                                {/* Tenure */}
                                <div>
                                    <div className="flex justify-between mb-3 items-center">
                                        <div className="flex items-center gap-2">
                                            <label className="font-bold text-slate-700">Tenure</label>
                                            <button
                                                onClick={() => {
                                                    if (tenureType === 'Months') {
                                                        setTenureType('Years');
                                                        setTenure(Math.max(1, Math.round(tenure / 12)));
                                                    } else {
                                                        setTenureType('Months');
                                                        setTenure(tenure * 12);
                                                    }
                                                }}
                                                className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase hover:bg-slate-200 transition-colors"
                                            >
                                                {tenureType} ⇄
                                            </button>
                                        </div>
                                        <div className="bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                            <span className="text-indigo-700 font-black text-sm">{tenure} {tenureType}</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max={tenureType === 'Months' ? 60 : 5}
                                        step="1"
                                        value={tenure}
                                        onChange={(e) => setTenure(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Advanced Section */}
                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                    <ArrowTrendingUpIcon className="w-4 h-4 mr-2" /> Advanced Parameters
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-2">Processing Fee (%)</label>
                                        <input
                                            type="number"
                                            value={processingFee}
                                            onChange={(e) => setProcessingFee(Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-2 flex justify-between">
                                            Monthly Income (Plan Smart)
                                            <span className="text-[10px] text-slate-400">Optional</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={monthlyIncome}
                                            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                                            placeholder="Your monthly salary"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Table */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Amortization <span className="text-slate-400 font-normal">Schedule</span></h3>
                                </div>
                                <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-full border border-slate-200 text-slate-500 uppercase">Yearly Summary</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-[10px] text-slate-400 uppercase font-black bg-white border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Year</th>
                                            <th className="px-6 py-4 text-right">Principal Paid</th>
                                            <th className="px-6 py-4 text-right">Interest Paid</th>
                                            <th className="px-6 py-4 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {Array.from({ length: Math.ceil(results.totalMonths / 12) }).map((_, yearIdx) => {
                                            const startMonth = yearIdx * 12;
                                            const endMonth = Math.min((yearIdx + 1) * 12, results.totalMonths);
                                            const yearData = schedule.slice(startMonth, endMonth);

                                            const yearlyPrincipal = yearData.reduce((acc, curr) => acc + curr.principal, 0);
                                            const yearlyInterest = yearData.reduce((acc, curr) => acc + curr.interest, 0);
                                            const yearEndBalance = yearData[yearData.length - 1].balance;

                                            return (
                                                <tr key={yearIdx} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-black text-slate-900 italic">Year {yearIdx + 1}</td>
                                                    <td className="px-6 py-4 text-right text-orange-600 font-bold">{Math.round(yearlyPrincipal).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right text-amber-500 font-bold">{Math.round(yearlyInterest).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right font-black text-slate-800">NPR {Math.round(yearEndBalance).toLocaleString()}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right: Results & Chart */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Main Result */}
                        <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-orange-500/20 opacity-50"></div>
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>

                            <div className="relative z-10">
                                <p className="text-amber-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4 flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2 animate-pulse"></span>
                                    Your Monthly Commitment
                                </p>
                                <h2 className="text-6xl font-black mb-8 flex items-end gap-2">
                                    <span className="text-2xl font-bold text-slate-500 pb-2">NPR</span>
                                    {results.emi.toLocaleString()}
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loan Principal</span>
                                        <span className="font-bold text-white">NPR {results.principal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Interest</span>
                                        <span className="font-bold text-amber-400">NPR {results.totalInterest.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Fees</span>
                                        <span className="font-bold text-indigo-400">NPR {results.feeAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4">
                                        <span className="text-slate-300 font-black uppercase text-sm">Grand Total</span>
                                        <span className="text-xl font-black text-orange-400">NPR {results.totalPayable.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Smart Affordability Score */}
                        <div className={`${affordability.bg} ${affordability.border} border rounded-[2.5rem] p-8 relative overflow-hidden`}>
                            <div className="relative z-10 flex items-start gap-6">
                                <div className={`p-4 rounded-3xl bg-white shadow-sm border ${affordability.border}`}>
                                    <SparklesIcon className={`w-10 h-10 ${affordability.color}`} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-xl mb-1 flex items-center gap-2">
                                        Affordability Check: <span className={affordability.color}>{affordability.status}</span>
                                    </h3>
                                    <p className="text-sm text-slate-600 mb-4">{affordability.note}</p>

                                    {monthlyIncome > 0 ? (
                                        <div className="w-full bg-white/50 rounded-full h-3 p-0.5 border border-slate-200">
                                            <div
                                                className={`h-full rounded-full ${affordability.score > 50 ? 'bg-rose-500' : 'bg-orange-500'} transition-all duration-1000`}
                                                style={{ width: `${Math.min(100, affordability.score)}%` }}
                                            ></div>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase italic">Enter income to unlock smart analysis</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Chart Card */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                            <h3 className="font-black text-slate-800 mb-8 flex items-center gap-2 uppercase tracking-tight">
                                <ChartBarIcon className="w-5 h-5 text-indigo-500" /> Payment <span className="text-slate-400">Structure</span>
                            </h3>
                            <div className="h-64 w-full relative">
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Principal vs Interest</span>
                                    <span className="text-xl font-black text-slate-900">
                                        {Math.round((results.principal / results.totalPayable) * 100)}%
                                    </span>
                                </div>
                                <canvas ref={chartRef}></canvas>
                            </div>
                        </div>

                        {/* Interactive Bank Selection */}
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                                    <BanknotesIcon className="w-5 h-5 text-orange-500" /> Apply <span className="text-slate-400">Bank Rates</span>
                                </h3>
                                <InformationCircleIcon className="w-4 h-4 text-slate-300" />
                            </div>
                            <div className="space-y-2">
                                {NEPAL_BANK_RATES.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setRate(item.rate)}
                                        className="w-full flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                                    >
                                        <div className="text-left flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-black text-slate-700 group-hover:text-orange-600 transition-colors uppercase">{item.bank}</p>
                                                {item.bank === bestBank.bank && (
                                                    <span className="text-[8px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Best Rate</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold">{item.range}</p>
                                        </div>
                                        <div className="bg-slate-100 group-hover:bg-orange-100 px-3 py-1 rounded-full transition-colors">
                                            <span className="text-xs font-black text-slate-600 group-hover:text-orange-700">{item.rate}%</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-6 text-center font-bold italic">* Rates are updated regularly based on NRB guidelines.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EmiCalculatorPage;
