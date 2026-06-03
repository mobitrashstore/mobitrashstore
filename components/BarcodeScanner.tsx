import React, { useState, useRef } from 'react';
import { scanBarcode } from '../services/mlService';
import { CameraIcon } from './icons/CameraIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface BarcodeScannerProps {
    onBarcodeDetected: (barcode: string, format: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeDetected, onClose }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [detectedBarcode, setDetectedBarcode] = useState<string>('');
    const [barcodeFormat, setBarcodeFormat] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setError('');
        setDetectedBarcode('');

        // Show preview
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);

        try {
            const result = await scanBarcode(file);

            if (result) {
                setDetectedBarcode(result.rawValue);
                setBarcodeFormat(result.format);

                setTimeout(() => {
                    onBarcodeDetected(result.rawValue, result.format);
                    onClose();
                }, 1500);
            } else {
                setError('No barcode detected. Please try a clearer image with better lighting.');
            }
        } catch (err) {
            console.error('Barcode scanning error:', err);
            setError('Failed to process image. Please try again.');
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
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Scan Barcode</h2>
                    <p className="text-sm text-slate-600 mt-2">
                        Scan product barcode for quick lookup
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
                            <span className="text-sm font-semibold text-blue-700">Scanning barcode...</span>
                        </div>
                    </div>
                )}

                {/* Detected barcode */}
                {detectedBarcode && !isProcessing && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-green-700">Barcode detected!</p>
                                <p className="text-xs text-green-600 mt-1 font-mono">{detectedBarcode}</p>
                                <p className="text-xs text-green-600 mt-1">Format: {barcodeFormat}</p>
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
                        <li>• Center the barcode in the frame</li>
                        <li>• Ensure good lighting</li>
                        <li>• Hold camera steady</li>
                        <li>• Avoid glare on barcode</li>
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
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <CameraIcon className="w-5 h-5" />
                    {isProcessing ? 'Processing...' : 'Scan Barcode'}
                </button>

                <button
                    onClick={onClose}
                    className="w-full mt-3 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-100 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default BarcodeScanner;
