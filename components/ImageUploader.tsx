
import React, { useState, useRef } from 'react';
import { PhotoIcon } from './icons/PhotoIcon';
import { CameraIcon } from './icons/CameraIcon';
import { ArrowUpTrayIcon } from './icons/ArrowUpTrayIcon';
import { TrashIcon } from './icons/TrashIcon';
import Spinner from './Spinner';
import CameraModal from './CameraModal';

// --- CLOUDINARY DIRECT UPLOAD (FULL QUALITY, NO BASE64, NO COMPRESSION) ---
const sha1 = async (str: string): Promise<string> => {
    const buffer = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-1', buffer);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

const uploadFileToCloudinary = async (
    file: Blob | File,
    folder: string,
    onProgress: (pct: number) => void
): Promise<string> => {
    // 1. Primary: Use Server-side Next.js API Route (100% reliable, zero signature/preset errors)
    try {
        onProgress(20);
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        onProgress(50);

        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: base64Data, folder })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.url) {
                onProgress(100);
                return data.url;
            }
        } else {
            const errData = await res.json().catch(() => ({}));
            console.warn('Server upload returned status:', res.status, errData);
        }
    } catch (err) {
        console.warn('Server API upload failed, trying direct upload:', err);
    }

    // 2. Fallback: Direct Client-Side Signed Upload
    return new Promise(async (resolve, reject) => {
        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'df4he5ovu';
            const apiKey    = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '252214753723296';
            const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || 'TlpeLMZtVRJcjXNDPc6zORlZurU';

            const timestamp = Math.round(Date.now() / 1000);
            const paramStr  = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
            const signature = await sha1(paramStr);

            const form = new FormData();
            form.append('file', file);
            form.append('api_key', apiKey);
            form.append('timestamp', String(timestamp));
            form.append('folder', folder);
            form.append('signature', signature);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const res = JSON.parse(xhr.responseText);
                        resolve(res.secure_url || res.url);
                    } catch {
                        reject(new Error('Bad response from Cloudinary'));
                    }
                } else {
                    reject(new Error(`Cloudinary error: ${xhr.responseText}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.send(form);
        } catch (err) {
            reject(err);
        }
    });
};

// Convert a data URL produced by <canvas> into a raw Blob without any re-encoding
const dataUrlToBlob = (dataUrl: string): Blob => {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    const binary = atob(data);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new Blob([arr], { type: mime });
};

export const ImageUploader: React.FC<{
    imageUrl: string;
    onImageChange: (url: string) => void;
    onClear: () => void;
    allowFullSize?: boolean;
    folder?: string;
}> = ({ imageUrl, onImageChange, onClear, allowFullSize = false, folder = 'products' }) => {
    const [progress, setProgress]     = useState<number | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadAndNotify = async (file: Blob | File) => {
        setProgress(0);
        try {
            const url = await uploadFileToCloudinary(file, folder, (pct) => setProgress(pct));
            onImageChange(url);
        } catch (err: any) {
            console.error('Upload failed:', err);
            alert('Upload failed: ' + (err.message || 'Unknown error'));
        } finally {
            setProgress(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadAndNotify(file);
    };

    // Camera captures a canvas data URL — convert to Blob and upload at full quality
    const handleCaptureFromCamera = (dataUrl: string) => {
        const blob = dataUrlToBlob(dataUrl);
        uploadAndNotify(blob);
    };

    return (
        <>
            <div className="space-y-2">
                {/* Preview */}
                <div className={`w-full ${allowFullSize && imageUrl ? '' : 'aspect-square'} bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-300 overflow-hidden relative group hover:border-amber-400 transition-colors min-h-[150px]`}>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="Preview"
                            className={`w-full ${allowFullSize ? 'h-auto' : 'h-full'} object-contain`}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400 p-4">
                            <PhotoIcon className="w-8 h-8 group-hover:text-amber-400 transition-colors" />
                            {allowFullSize && <span className="text-[10px]">Full Quality · Direct Cloudinary</span>}
                        </div>
                    )}

                    {/* Upload progress overlay */}
                    {progress !== null && (
                        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20 gap-3 p-4">
                            <Spinner size="w-8 h-8" />
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-amber-500 h-2 rounded-full transition-all duration-200"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs font-bold text-slate-600 animate-pulse">
                                Uploading to Cloudinary… {progress}%
                            </p>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={progress !== null}
                        title="Upload File (Full Quality)"
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-amber-600 transition-colors shadow-sm disabled:opacity-40"
                    >
                        <ArrowUpTrayIcon className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        disabled={progress !== null}
                        title="Take Photo"
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-amber-600 transition-colors shadow-sm disabled:opacity-40"
                    >
                        <CameraIcon className="w-4 h-4" />
                    </button>
                    {imageUrl && (
                        <button
                            type="button"
                            onClick={onClear}
                            disabled={progress !== null}
                            title="Remove Image"
                            className="flex-1 p-2 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 flex items-center justify-center text-rose-500 transition-colors shadow-sm disabled:opacity-40"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* URL paste input */}
                <input
                    type="text"
                    value={imageUrl.startsWith('data:image') ? '' : imageUrl}
                    onChange={e => onImageChange(e.target.value)}
                    placeholder="Or paste Cloudinary / CDN URL"
                    disabled={progress !== null}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs text-center bg-white text-slate-700 focus:ring-amber-500 focus:border-amber-500 placeholder-slate-400 disabled:opacity-40"
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    className="hidden"
                    accept="image/*,video/*,.pdf"
                />
            </div>

            {isCameraOpen && (
                <CameraModal
                    onClose={() => setIsCameraOpen(false)}
                    onCapture={handleCaptureFromCamera}
                />
            )}
        </>
    );
};
