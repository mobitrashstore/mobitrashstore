
import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import { STORAGE_OPTIONS } from '../../constants';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import IMEIScanner from '../IMEIScanner';
import { CameraIcon } from '../icons/CameraIcon';

interface FeaturesStepProps {
    deviceDetails: {
        brand: string;
        model: string;
        imageUrl: string;
        storageOptions?: string[];
    };
    onBack: () => void;
    onNext: (features: any) => void;
}

const FeaturesStep: React.FC<FeaturesStepProps> = ({ deviceDetails, onBack, onNext }) => {
    const [variant, setVariant] = useState<string | null>(null);
    const [imei, setImei] = useState('');
    const [age, setAge] = useState<string | null>(null);
    const [powersOn, setPowersOn] = useState<boolean | null>(null);
    const [showIMEIScanner, setShowIMEIScanner] = useState(false);

    const deviceImage = deviceDetails.imageUrl || 'https://placehold.co/150x300';

    const storageVariants = useMemo(() => {
        if (deviceDetails.storageOptions && deviceDetails.storageOptions.length > 0) {
            return deviceDetails.storageOptions;
        }
        const options = STORAGE_OPTIONS[deviceDetails.model];
        if (options) {
            // Updated: Do not force "8/" prefix. Use bare storage size to allow generic lookup if needed.
            return options.map(s => `${s}GB`);
        }
        if (deviceDetails.model.includes('Pro') || deviceDetails.model.includes('Max')) {
            return ['128GB', '256GB', '512GB', '1024GB'];
        }
        return ['64GB', '128GB', '256GB'];
    }, [deviceDetails.model, deviceDetails.storageOptions]);

    const isNextDisabled = !variant || !imei || !age || powersOn === null;

    const handleSubmit = () => {
        if (!isNextDisabled) {
            onNext({ variant, imei, age, powersOn });
        }
    };

    const ageOptions = ['0-3 months', '3-6 months', '6-12 months', '> 1 year'];

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">Device Details</h2>
                <p className="text-slate-500">Specify the variant and basic condition.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm mb-8 flex flex-col md:flex-row gap-8 items-center">
                {/* Product Preview */}
                <div className="flex-shrink-0 text-center md:text-left md:w-1/3 flex flex-col items-center">
                    <div className="w-32 h-40 mb-4 flex items-center justify-center">
                        <img src={deviceImage} alt={deviceDetails.model} className="max-h-full object-contain drop-shadow-xl" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{deviceDetails.model}</h3>
                    <p className="text-slate-500 text-sm">{deviceDetails.brand}</p>
                </div>

                {/* Form Fields */}
                <div className="flex-grow w-full space-y-8">
                    {/* Variant Selector */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Select Variant</label>
                        <div className="flex flex-wrap gap-3">
                            {storageVariants.map(v => (
                                <button
                                    key={v}
                                    onClick={() => setVariant(v)}
                                    className={`
                                        px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200
                                        ${variant === v
                                            ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'
                                        }
                                     `}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* IMEI Input */}
                    <div>
                        <label htmlFor="imei" className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">IMEI Number</label>
                        <div className="relative">
                            <input
                                type="tel"
                                id="imei"
                                value={imei}
                                onChange={(e) => setImei(e.target.value.replace(/[^0-9]/g, ''))}
                                maxLength={17}
                                placeholder="Dial *#06# to find IMEI"
                                className="w-full p-4 pr-14 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowIMEIScanner(true)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                                title="Scan IMEI with Camera"
                            >
                                <CameraIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Or tap the camera icon to scan IMEI</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <div>
                    <p className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Device Age</p>
                    <div className="grid grid-cols-2 gap-3">
                        {ageOptions.map(option => (
                            <button
                                key={option}
                                onClick={() => setAge(option)}
                                className={`
                                    flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all
                                    ${age === option
                                        ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }
                                `}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Device Powers On?</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setPowersOn(true)}
                            className={`
                                flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all
                                ${powersOn === true
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                                }
                            `}
                        >
                            <CheckCircleIcon className="w-5 h-5" /> Yes
                        </button>
                        <button
                            onClick={() => setPowersOn(false)}
                            className={`
                                flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all
                                ${powersOn === false
                                    ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-rose-200'
                                }
                            `}
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" /> Back
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isNextDisabled}
                    className="
                        flex items-center gap-2 px-10 py-4 rounded-full font-bold text-white shadow-lg transition-all transform
                        disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed
                        enabled:bg-gradient-to-r enabled:from-amber-500 enabled:to-orange-600 enabled:hover:scale-105 enabled:active:scale-95
                    "
                >
                    Next Step <ArrowRightIcon className="w-5 h-5" />
                </button>
            </div>

            {/* IMEI Scanner Modal */}
            {showIMEIScanner && (
                <IMEIScanner
                    onIMEIDetected={(detectedIMEI) => {
                        setImei(detectedIMEI);
                        setShowIMEIScanner(false);
                    }}
                    onClose={() => setShowIMEIScanner(false)}
                />
            )}
        </div>
    );
};

export default FeaturesStep;
