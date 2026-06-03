
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { BoltIcon } from './icons/BoltIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import Spinner from './Spinner';

interface QrScannerModalProps {
    onClose: () => void;
    onScan: (data: string) => void;
}

import { Html5Qrcode } from 'html5-qrcode';

const QrScannerModal: React.FC<QrScannerModalProps> = ({ onClose, onScan }) => {
    const [status, setStatus] = useState<'idle' | 'initializing' | 'scanning' | 'processing' | 'error'>('initializing');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [torchOn, setTorchOn] = useState(false);
    const [hasFlash, setHasFlash] = useState(false);
    const [cameras, setCameras] = useState<any[]>([]);
    const [activeCameraId, setActiveCameraId] = useState<string | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMountedRef = useRef(true);
    const scannerRegionId = "html5qr-code-full-region";

    // Cleanup function to stop scanning
    const safeStop = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (e) {
                console.warn("Error stopping scanner:", e);
            }
        }
    };

    // Initialize Scanner
    const initScanner = useCallback(async () => {
        if (!isMountedRef.current) return;

        try {
            await safeStop(); // Ensure clean slate

            // Initialize
            scannerRef.current = new Html5Qrcode(scannerRegionId);

            // Get Cameras
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                setCameras(devices);
                const backCamera = devices.find((d: any) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
                const targetId = backCamera ? backCamera.id : devices[0].id;
                setActiveCameraId(targetId);
                startCamera(targetId);
            } else {
                setStatus('idle');
                setErrorMessage("No cameras found. You can use Image Upload.");
            }
        } catch (err: any) {
            console.error("Init Error:", err);
            setStatus('error');
            setErrorMessage("Camera access denied or unavailable.");
        }
    }, []);

    const startCamera = async (cameraId: string) => {
        if (!scannerRef.current) return;

        try {
            setStatus('scanning');
            setErrorMessage(null);

            await scannerRef.current.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText: string) => {
                    handleScanSuccess(decodedText);
                },
                () => { }
            );

            // Check flash
            try {
                const capabilities = scannerRef.current.getRunningTrackCameraCapabilities() as any;
                if (capabilities && (capabilities.torch || capabilities.fillLightMode)) {
                    setHasFlash(true);
                }
            } catch (e) { }

        } catch (err) {
            console.error("Start Camera Error:", err);
            setStatus('error');
            setErrorMessage("Failed to start camera. Please try uploading an image.");
        }
    };

    const handleScanSuccess = (decodedText: string) => {
        if (!isMountedRef.current) return;

        // Haptic
        try {
            if (navigator.vibrate) navigator.vibrate(200);
            const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => { });
        } catch (e) { }

        // Stop and close
        safeStop().then(() => {
            onScan(decodedText);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus('processing');
        setErrorMessage(null);

        try {
            await safeStop(); // Stop camera before file scan

            // Re-instantiate if needed (sometimes clear() removes the instance binding)
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(scannerRegionId);
            }

            // scanFile(file, showImage) - set showImage to false to prevent rendering issues
            const result = await scannerRef.current.scanFile(file, false);
            handleScanSuccess(result);
        } catch (err: any) {
            console.error("File Scan Error:", err);
            setStatus('error');
            setErrorMessage("Could not read barcode/QR from this image. Please try a clearer photo.");
        } finally {
            // Reset input so same file can be selected again
            e.target.value = '';
        }
    };

    const toggleTorch = async () => {
        if (!scannerRef.current || !hasFlash) return;
        try {
            await scannerRef.current.applyVideoConstraints({
                advanced: [{ torch: !torchOn }]
            } as any);
            setTorchOn(!torchOn);
        } catch (err) {
            console.error("Torch Error", err);
        }
    };

    const switchCamera = async () => {
        if (cameras.length < 2 || !activeCameraId) return;
        await safeStop();

        const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
        const nextIndex = (currentIndex + 1) % cameras.length;
        const nextId = cameras[nextIndex].id;

        setActiveCameraId(nextId);
        startCamera(nextId);
    };

    // Lifecycle
    useEffect(() => {
        isMountedRef.current = true;
        setTimeout(initScanner, 100); // Small delay for DOM

        return () => {
            isMountedRef.current = false;
            safeStop();
        };
    }, [initScanner]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-30 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <h2 className="text-white font-bold text-lg tracking-wide drop-shadow-md">Scan Product</h2>
                <button
                    onClick={onClose}
                    className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-all shadow-lg"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Main Scanner Area */}
            <div className="flex-1 relative flex flex-col justify-center items-center overflow-hidden bg-black">

                {/* The scanner container */}
                <div id={scannerRegionId} className="w-full h-full object-cover" />

                {/* Status Overlays */}
                {status === 'initializing' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white z-20">
                        <Spinner size="w-12 h-12" />
                        <p className="mt-4 font-medium text-gray-300">Starting Camera...</p>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white z-20">
                        <Spinner size="w-12 h-12" />
                        <p className="mt-4 font-bold text-amber-400 animate-pulse">Analyzing Image...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-20 px-6 text-center">
                        <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-2xl max-w-xs">
                            <p className="text-rose-500 font-bold text-lg mb-2">Scanner Issue</p>
                            <p className="text-gray-300 text-sm mb-6">{errorMessage || "An unknown error occurred."}</p>
                            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white text-black font-bold py-3 rounded-lg mb-3 hover:bg-gray-200">
                                Upload Image Instead
                            </button>
                            {activeCameraId && cameras.length > 0 && (
                                <button onClick={() => startCamera(activeCameraId!)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
                                    Retry Camera
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Scanning Overlay (Only show when camera is running) */}
                {status === 'scanning' && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                        <div className="relative w-64 h-64 border-2 border-[#00bfff]/50 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#00bfff] rounded-tl-lg -mt-[2px] -ml-[2px]"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#00bfff] rounded-tr-lg -mt-[2px] -mr-[2px]"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#00bfff] rounded-bl-lg -mb-[2px] -ml-[2px]"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#00bfff] rounded-br-lg -mb-[2px] -mr-[2px]"></div>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00bfff] to-transparent opacity-70 animate-scan-down"></div>
                        </div>
                        <p className="absolute mt-80 text-white/80 text-sm font-medium bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm">
                            Point at barcode or upload image
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="p-6 pb-10 bg-black/80 backdrop-blur-md flex justify-around items-center gap-4 z-30 border-t border-white/10">
                {/* Image Upload */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-14 h-14 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-600 active:scale-95"
                    >
                        <PhotoIcon className="w-6 h-6" />
                    </button>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Image</span>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                </div>

                {/* Torch Toggle */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={toggleTorch}
                        disabled={!hasFlash || status !== 'scanning'}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg border-4 active:scale-95 
                            ${torchOn
                                ? 'bg-yellow-500 border-yellow-600 text-white shadow-yellow-500/50 scale-110'
                                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                            } ${(!hasFlash || status !== 'scanning') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <BoltIcon className={`w-8 h-8 ${torchOn ? 'fill-current' : ''}`} />
                    </button>
                    <span className={`text-[10px] font-bold uppercase ${torchOn ? 'text-yellow-500' : 'text-gray-400'}`}>
                        {torchOn ? 'On' : 'Flash'}
                    </span>
                </div>

                {/* Switch Camera */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={switchCamera}
                        disabled={cameras.length < 2 || status !== 'scanning'}
                        className={`w-14 h-14 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-600 active:scale-95 ${cameras.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <ArrowPathIcon className="w-6 h-6" />
                    </button>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Flip</span>
                </div>
            </div>

            <style>{`
                @keyframes scan-down {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan-down {
                    animation: scan-down 2.5s linear infinite;
                }
                /* Force video to cover container */
                #html5qr-code-full-region video {
                    object-fit: cover;
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default QrScannerModal;
