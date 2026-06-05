
import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

interface QnAStepProps {
    deviceDetails: {
        brand: string;
        model: string;
        imageUrl: string;
    };
    onBack: () => void;
    onNext: (answers: any) => void;
}

const questionsData = [
    {
        category: "Basic Details",
        questions: [
            { id: 'calls', text: 'Can you make and receive calls?', options: ['Yes', 'No'] },
            { id: 'warranty', text: 'Remaining Warranty', options: ['0-3 months', '3-10 months', '> 10 months', 'None'] },
            { id: 'batteryHealth', text: 'Battery Health %', options: ['> 93%', '85% - 93%', '78% - 84%', '< 78%', 'Replaced'] },
            { id: 'mainboardRepaired', text: 'Mainboard Repaired?', options: ['Yes', 'No'] },
            { id: 'waterDamage', text: 'Water Damage?', options: ['Yes', 'No'] },
        ]
    },
    {
        category: "Display & Screen",
        questions: [
            { id: 'screenOn', text: 'Is the screen original?', options: ['Yes', 'No'] },
            { id: 'glassCondition', text: 'Front Glass Condition', options: ['Like New', 'Minor Scratches', 'Major Cracks'] },
            { id: 'displayCondition', text: 'Display (LCD/OLED) Condition', options: ['Like New', 'Lines/Spots', 'Dead'] },
        ]
    },
    {
        category: "Physical Condition",
        questions: [
            { id: 'outerShell', text: 'Body/Back Condition', options: ['Like New', 'Minor Dents', 'Major Dents', 'Cracked'] },
            { id: 'sideEdges', text: 'Frame Condition', options: ['Like New', 'Minor Scratches', 'Major Dents'] },
        ]
    },
    {
        category: "Functionality",
        questions: [
            { id: 'cameraProblem', text: 'Camera Issues?', options: ['Yes', 'No'] },
            { id: 'faceIdTouchId', text: 'FaceID / TouchID Working?', options: ['Yes', 'No'] },
            { id: 'wifiBluetooth', text: 'WiFi & Bluetooth Working?', options: ['Yes', 'No'] },
        ]
    },
    {
        category: "Accessories",
        questions: [
            { id: 'originalCharger', text: 'Original Charger?', options: ['Yes', 'No'] },
            { id: 'originalBox', text: 'Original Box?', options: ['Yes', 'No'] },
        ]
    }
];

const allQuestions = questionsData.flatMap(cat => cat.questions);

const QnAStep: React.FC<QnAStepProps> = ({ deviceDetails, onBack, onNext }) => {
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    
    // Auto-scroll to next question logic
    const handleAnswer = (questionId: string, option: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / allQuestions.length) * 100;
    const isComplete = answeredCount === allQuestions.length;

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Side: Questions */}
                <div className="lg:col-span-8">
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Assess Condition</h2>
                        <p className="text-slate-500 mb-6">Please answer honestly for an accurate quote.</p>
                        
                        {/* Progress Bar */}
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 ease-out" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-right text-xs font-bold text-amber-600 mt-2">{Math.round(progress)}% Complete</p>
                    </div>

                    <div className="space-y-10">
                        {questionsData.map(category => (
                            <div key={category.category} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                                    {category.category}
                                </h3>
                                <div className="space-y-6">
                                    {category.questions.map(q => (
                                        <div key={q.id}>
                                            <p className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">{q.text}</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {q.options.map(option => (
                                                    <button
                                                        key={option}
                                                        onClick={() => handleAnswer(q.id, option)}
                                                        className={`
                                                            relative px-4 py-3 rounded-xl text-sm font-medium text-center transition-all duration-200 border-2
                                                            ${answers[q.id] === option 
                                                                ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm' 
                                                                : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-amber-200 hover:bg-white'
                                                            }
                                                        `}
                                                    >
                                                        {option}
                                                        {answers[q.id] === option && (
                                                            <div className="absolute top-[-6px] right-[-6px] bg-amber-500 rounded-full text-white p-0.5 shadow-sm">
                                                                <CheckCircleIcon className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Sticky Summary Card */}
                <div className="lg:col-span-4 w-full">
                    <div className="lg:sticky lg:top-24 bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 overflow-hidden w-full">
                        <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
                        
                        <h3 className="text-xl font-bold text-white mb-6 text-center border-b border-slate-800 pb-4">Your Device</h3>
                        
                        <div className="bg-white/10 rounded-2xl p-6 mb-6 backdrop-blur-sm border border-white/5">
                            <img src={deviceDetails.imageUrl || 'https://placehold.co/150x300'} alt={deviceDetails.model} className="w-32 h-auto mx-auto object-contain drop-shadow-lg"/>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">{deviceDetails.brand}</p>
                            <h4 className="text-xl font-black leading-tight mb-4">{deviceDetails.model}</h4>
                            
                            {/* Missing Answers Warning */}
                            {!isComplete && (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-left">
                                    <p className="text-xs text-amber-200 font-medium">
                                        ⚠ Please answer {allQuestions.length - answeredCount} more questions to get your quote.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-between items-center border-t border-slate-100 pt-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" /> Back
                </button>
                <button
                    onClick={() => onNext(answers)}
                    disabled={!isComplete}
                    className="
                        flex items-center gap-2 px-10 py-4 rounded-full font-bold text-white shadow-lg transition-all transform
                        disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed
                        enabled:bg-gradient-to-r enabled:from-amber-500 enabled:to-orange-600 enabled:hover:scale-105 enabled:active:scale-95
                    "
                >
                    Calculate Price <ArrowRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default QnAStep;
