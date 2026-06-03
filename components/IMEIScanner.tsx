import React, { useState, useRef } from 'react';
import { extractIMEI, recognizeText } from '../services/mlService';
import { CameraIcon } from './icons/CameraIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface IMEIScannerProps {
    onIMEIDetected: (imei: string) => void;
    onClose: () => void;
}

const IMEIScanner: React.FC<IMEIScannerProps> = ({ onIMEIDetected, onClose }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [detectedText, setDetectedText] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setError('');
        setDetectedText('');

        // Show preview
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);

        try {
            // Try to extract IMEI
            const imei = await extractIMEI(file);

            if (imei) {
                setDetectedText(`IMEI detected: ${imei}`);
                setTimeout(() => {
                    onIMEIDetected(imei);
                    onClose();
                }, 1500);
            } else {
                // If no IMEI found, show all detected text
                const textBlocks = await recognizeText(file);
                const allText = textBlocks.map(b => b.text).join('\n');

                if (allText) {
                    setDetectedText(`Text detected:\n${allText}`);
                    setError('No IMEI number found. Please try a clearer image or enter manually.');
                } else {
                    setError('No text detected. Please ensure the image is clear and well-lit.');
                }
            }
        } catch (err) {
            console.error('IMEI scanning error:', err);
            setError('Failed to process image. Please try again or enter IMEI manually.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <XMarkIcon className="w-6 h-6 text-slate-600" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CameraIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Scan IMEI</h2>
                    <p className="text-sm text-slate-600 mt-2">
                        Take a photo of your IMEI number or dial *#06# to display it
                    </p>
                </div>

                {/* Preview */}
                {previewUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden border-2 border-slate-200">
                        <img src={previewUrl} alt="Preview" className="w-full h-48 object-contain bg-slate-50" />
                    </div>
                )}

                {/* Processing indicator */}
                {isProcessing && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-semibold text-blue-700">Processing image...</span>
                        </div>
                    </div>
                )}

                {/* Detected text */}
                {detectedText && !isProcessing && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-green-700 whitespace-pre-wrap">{detectedText}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm font-semibold text-red-700">{error}</p>
                    </div>
                )}

                {/* Instructions */}
                <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Tips for best results:</h3>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Ensure good lighting</li>
                        <li>• Keep the camera steady</li>
                        <li>• Make sure IMEI is clearly visible</li>
                        <li>• Avoid glare and shadows</li>
                    </ul>
                </div>

                {/* Camera button */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <button
                    onClick={handleCameraClick}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <CameraIcon className="w-5 h-5" />
                    {isProcessing ? 'Processing...' : 'Take Photo'}
                </button>

                <button
                    onClick={onClose}
                    className="w-full mt-3 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-100 transition-colors"
                >
                    Enter Manually Instead
                </button>
            </div>
        </div>
    );
};

export default IMEIScanner;
