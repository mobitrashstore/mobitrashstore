
import React, { useState, useEffect } from 'react';
import { DeclaredCondition, QuoteInput, QuoteRejection, QuoteResponse } from '../../types';
import { computeQuote } from '../../services/quoteService';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import PriceDisplaySkeleton from '../PriceDisplaySkeleton';

// Define global confetti function from CDN
import confetti from 'canvas-confetti';

interface PriceDisplayStepProps {
    deviceDetails: {
        brand: string;
        model: string;
        ram_gb: number;
        storage_gb: number;
        imageUrl: string;
    };
    features: {
        variant: string;
        imei: string;
        age: string;
        powersOn: boolean;
    };
    qnaAnswers: any;
    customerDetails: any;
    onStartOver: () => void;
    onAcceptAndSubmit: (quote: QuoteResponse, condition: DeclaredCondition) => void;
    onDecline: (quote: QuoteResponse, condition: DeclaredCondition) => void;
    isSubmitting?: boolean;
    submissionProgress?: number;
}

const mapAnswersToCondition = (features: PriceDisplayStepProps['features'], qna: any): DeclaredCondition => {
    const getBatteryHealth = (answer: string) => {
        if (answer.includes('> 93%')) return 95;
        if (answer.includes('85%')) return 90;
        if (answer.includes('78%')) return 80;
        if (answer.includes('< 78%')) return 75;
        return 85;
    }
    const getAgeInMonths = (ageStr: string) => {
        // Strict mapping based on user selection
        if (ageStr.includes('0-3')) return 0; // 0 penalty
        if (ageStr.includes('3-6')) return 4; // Slight penalty
        if (ageStr.includes('6-12')) return 9; // Medium penalty
        return 18; // > 1 year
    }

    return {
        powers_on: features.powersOn,
        screen_cracks: (qna.glassCondition === 'Like New' || qna.glassCondition === 'Flawless') ? 'none' : qna.glassCondition.includes('Minor') ? 'hairline' : 'major',
        lcd_damage: (qna.displayCondition === 'Like New' || qna.displayCondition === 'Flawless') ? 'none' : qna.displayCondition.includes('Lines') ? 'lines' : 'black_spots',
        water_damage: qna.waterDamage === 'Yes' ? 'indicator_tripped' : 'none',
        battery_health_pct: getBatteryHealth(qna.batteryHealth),
        face_id_touch_id: qna.faceIdTouchId === 'Yes' ? 'ok' : 'faulty',
        back_glass: qna.outerShell.includes('Cracked') ? 'cracked' : 'ok',
        buttons: 'ok',
        camera: qna.cameraProblem === 'No' ? 'ok' : 'faulty',
        imei_status: 'clean',
        factory_unlocked_mdms_free: true,
        age_months: getAgeInMonths(features.age),
        minor_scratches: qna.outerShell.includes('Minor') || qna.sideEdges.includes('Minor'),
    };
}

const PriceDisplayStep: React.FC<PriceDisplayStepProps> = ({ deviceDetails, features, qnaAnswers, customerDetails, onStartOver, onAcceptAndSubmit, onDecline, isSubmitting, submissionProgress }) => {
    const [quote, setQuote] = useState<QuoteResponse | QuoteRejection | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [condition, setCondition] = useState<DeclaredCondition | null>(null);

    useEffect(() => {
        let isMounted = true;

        const getQuote = async () => {
            setIsLoading(true);
            try {
                const declared_condition = mapAnswersToCondition(features, qnaAnswers);
                setCondition(declared_condition);
                const quoteInput: QuoteInput = { ...deviceDetails, declared_condition };
                const result = await computeQuote(quoteInput);

                if (isMounted) {
                    setQuote(result);

                    if (!('rejection' in result) && typeof confetti === 'function') {
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#f59e0b', '#ff5722', '#ffffff']
                        });
                    }
                }
            } catch (err) {
                console.error("Quote error", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        getQuote();
        return () => { isMounted = false; };
    }, [deviceDetails, features, qnaAnswers]);

    if (isLoading) {
        return <PriceDisplaySkeleton />;
    }

    if (!quote) {
        return (
            <div className="text-center py-10">
                <p className="text-rose-600 mb-4">Unable to calculate quote at this time.</p>
                <button onClick={onStartOver} className="px-6 py-2 bg-slate-200 rounded-full font-bold text-slate-700 hover:bg-slate-300 transition-colors">Start Over</button>
            </div>
        );
    }

    if ('rejection' in quote) {
        return (
            <div className="text-center py-12 max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-rose-100 p-8">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">😢</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Quote Unavailable</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{quote.message}</p>
                <button onClick={onStartOver} className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Start Over</button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900">Your Instant Offer</h2>
                <p className="text-slate-500">Based on the condition you reported.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden mb-8 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>

                <div className="p-8 md:p-12 text-center">
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Estimated Cash Value</p>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-2 tracking-tighter">
                        <span className="text-2xl align-top text-slate-400 mr-1 font-bold">NPR</span>
                        {quote.calc.calculated_value.toLocaleString()}
                    </h1>
                    <div className="inline-flex items-center justify-center gap-1.5 bg-green-50 text-green-700 px-4 py-1.5 rounded-full mt-2 border border-green-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold">Price Locked for 7 Days</span>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 border-t border-slate-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-left flex items-center gap-4">
                            <div className="hidden md:block w-12 h-12 bg-white rounded-xl border border-slate-200 p-1">
                                <img src={deviceDetails.imageUrl || 'https://placehold.co/100'} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">{deviceDetails.brand} {deviceDetails.model}</h4>
                                <p className="text-sm text-slate-500 font-mono">{deviceDetails.storage_gb}GB • {features.variant}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={() => !isSubmitting && condition && !('rejection' in quote) && onDecline(quote, condition)}
                                disabled={isSubmitting}
                                className="flex-1 md:flex-none px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-white transition-colors disabled:opacity-50"
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => !isSubmitting && condition && !('rejection' in quote) && onAcceptAndSubmit(quote, condition)}
                                disabled={isSubmitting}
                                className="flex-1 md:flex-none px-8 py-3 bg-amber-600 text-white rounded-xl font-bold shadow-lg hover:bg-amber-700 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-80 disabled:scale-100"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        {submissionProgress !== undefined ? `Processing ${submissionProgress}%` : 'Processing...'}
                                    </>
                                ) : (
                                    'Accept Offer'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h5 className="font-bold text-blue-800">What happens next?</h5>
                    <p className="text-sm text-blue-600">Our agent will call you at <span className="font-bold">{customerDetails.phone}</span> to schedule a free pickup.</p>
                </div>
                <a
                    href="https://wa.me/+9779812141777"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 bg-green-100 px-4 py-2 rounded-lg transition-colors"
                >
                    <WhatsAppIcon className="w-4 h-4" /> Contact Support
                </a>
            </div>
        </div>
    );
};

export default PriceDisplayStep;
