import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import Spinner from './Spinner';
import { ArrowPathIcon } from './icons/ArrowPathIcon';

interface CameraModalProps {
    onClose: () => void;
    onCapture: (dataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment', 
                    width: { ideal: 1920 }, 
                    height: { ideal: 1080 } 
                },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Could not access camera. Please check permissions and try again.");
            return null;
        }
    };

    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const init = async () => {
            stream = await startCamera();
        };

        init();

        return () => {
            // Cleanup on unmount
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        setError(null);
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 1.0);
        
        onCapture(imageData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black z-[110] flex flex-col items-center justify-center text-white">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Gradient Overlays for UI contrast */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent"></div>

            {/* Top Close Button */}
            <button onClick={onClose} className="absolute top-6 right-6 z-20 bg-black/50 p-3 rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm">
                <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Error Message */}
            {error && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-900/80 border border-rose-500/50 p-4 rounded-lg text-center backdrop-blur-sm shadow-xl z-30">
                    <p className="font-bold">An Error Occurred</p>
                    <p className="text-sm mt-1">{error}</p>
                    <button onClick={startCamera} className="mt-4 text-sm font-bold flex items-center gap-1 mx-auto bg-slate-700 px-3 py-1 rounded-md"><ArrowPathIcon className="w-4 h-4" /> Retry</button>
                </div>
            )}
            
            {/* Bottom Capture Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                <button
                    onClick={handleCapture}
                    disabled={!!error}
                    className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-white/30 ring-offset-4 ring-offset-black/20 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Capture photo"
                >
                    <div className="w-16 h-16 rounded-full bg-white border-4 border-black"></div>
                </button>
            </div>
        </div>
    );
};

export default CameraModal;
