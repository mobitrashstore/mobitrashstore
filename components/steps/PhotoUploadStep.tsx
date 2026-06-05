import React, { useState } from 'react';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { Camera, RefreshCw } from 'lucide-react';
import * as api from '../../services/api';
import Spinner from '../Spinner';

interface PhotoUploadStepProps {
    onBack: () => void;
    onNext: (images: string[]) => void;
}

interface UploadItem {
    id: string;
    file: File;
    url?: string;
    progress: number;
    error?: string;
}

const PhotoUploadStep: React.FC<PhotoUploadStepProps> = ({ onBack, onNext }) => {
    const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);

    const uploadSingleFile = async (item: UploadItem) => {
        try {
            // Start upload directly using the api.uploadImage helper (which uploads directly to Cloudinary)
            const url = await api.uploadImage(item.file, 'trade-ins', (progress) => {
                setUploadItems(prev => 
                    prev.map(u => u.id === item.id ? { ...u, progress: Math.round(progress) } : u)
                );
            });
            setUploadItems(prev => 
                prev.map(u => u.id === item.id ? { ...u, url, progress: 100, error: undefined } : u)
            );
        } catch (err: any) {
            console.error("Direct upload error for", item.file.name, err);
            setUploadItems(prev => 
                prev.map(u => u.id === item.id ? { ...u, error: err.message || 'Upload failed' } : u)
            );
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const fileList = Array.from(files);
        const remainingSlots = 4 - uploadItems.length;
        if (remainingSlots <= 0) return;

        const filesToUpload = fileList.slice(0, remainingSlots);

        const newItems: UploadItem[] = filesToUpload.map(file => ({
            id: Math.random().toString(36).substring(2, 9),
            file: file,
            progress: 0
        }));

        setUploadItems(prev => [...prev, ...newItems]);

        // Start uploading each file immediately
        newItems.forEach(item => {
            uploadSingleFile(item);
        });

        // Reset input element value to allow uploading same file again if removed
        e.target.value = '';
    };

    const removeImage = (id: string) => {
        setUploadItems(prev => prev.filter(item => item.id !== id));
    };

    const retryUpload = (item: UploadItem) => {
        setUploadItems(prev => 
            prev.map(u => u.id === item.id ? { ...u, progress: 0, error: undefined } : u)
        );
        uploadSingleFile(item);
    };

    const isAnyUploading = uploadItems.some(item => !item.url && !item.error);
    const uploadedUrls = uploadItems.map(item => item.url).filter(Boolean) as string[];

    const handleContinue = () => {
        onNext(uploadedUrls);
    };

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start" style={{alignItems: 'flex-start'}}>
                {/* Left Side: Form */}
                <div className="w-full" style={{position: 'relative', zIndex: 1}}>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Upload Device Photos</h2>
                    <p className="text-slate-500 mb-6 text-sm">Please upload photos of your device from different angles (Optional, but recommended for faster verification). All files will be uploaded directly at full original quality.</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                        {uploadItems.map((item) => {
                            const localPreviewUrl = URL.createObjectURL(item.file);
                            return (
                                <div key={item.id} className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden group shadow-sm bg-slate-50 flex items-center justify-center">
                                    <img src={localPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    
                                    {/* Upload Progress Overlay */}
                                    {!item.url && !item.error && (
                                        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-2 z-10 gap-2">
                                            <Spinner size="w-6 h-6" />
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-200"
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600">{item.progress}%</span>
                                        </div>
                                    )}

                                    {/* Error Overlay */}
                                    {item.error && (
                                        <div className="absolute inset-0 bg-rose-50/95 flex flex-col items-center justify-center p-2 z-10 text-center gap-1">
                                            <span className="text-[10px] font-bold text-rose-600 line-clamp-2">{item.error}</span>
                                            <button 
                                                onClick={() => retryUpload(item)}
                                                className="mt-1 p-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors flex items-center gap-1 text-[10px] font-bold shadow"
                                            >
                                                <RefreshCw className="w-3 h-3" /> Retry
                                            </button>
                                        </div>
                                    )}

                                    {/* Actions Overlay */}
                                    <button
                                        onClick={() => removeImage(item.id)}
                                        className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                    >
                                        <span className="text-white font-bold text-xs bg-rose-600 px-2.5 py-1.5 rounded-lg shadow-md hover:bg-rose-700 transition-colors">Remove</span>
                                    </button>
                                </div>
                            );
                        })}

                        {uploadItems.length < 4 && (
                            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all group">
                                <Camera className="w-8 h-8 text-slate-400 group-hover:text-amber-600" />
                                <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Add Photo</span>
                                <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} disabled={uploadItems.length >= 4} />
                            </label>
                        )}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-8">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-slate-500 uppercase font-mono">Cloudinary Direct Queue</span>
                            <span className={`text-xs font-black ${uploadedUrls.length >= 1 ? 'text-orange-600' : 'text-slate-400'}`}>
                                {uploadedUrls.length}/4 Uploaded
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ${uploadedUrls.length >= 1 ? 'bg-orange-500' : 'bg-slate-300'}`}
                                style={{ width: `${(uploadedUrls.length / 4) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <button
                        onClick={handleContinue}
                        disabled={isAnyUploading}
                        className="w-full bg-slate-900 text-white font-black py-4 px-6 rounded-2xl hover:bg-slate-800 transition-all disabled:bg-slate-200 shadow-lg active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        {isAnyUploading ? 'Uploading to Cloudinary...' : uploadedUrls.length === 0 ? 'SKIP & CONTINUE' : 'CONTINUE'}
                    </button>
                </div>

                {/* Right Side: Mascot — NO sticky, plain column */}
                <div className="hidden md:flex flex-col items-center justify-start pt-4" style={{position: 'relative', zIndex: 0}}>
                    <div className="relative mb-6">
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xl w-64 text-center relative">
                            <p className="text-sm font-bold text-slate-700">
                                Show us your device! 📸
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Upload clear photos so we can give you the best price for your device.
                            </p>
                            {/* Speech bubble tail pointer */}
                            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45"></div>
                        </div>
                    </div>
                    <img src="https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/Modal/features/img%20002.png?updatedAt=1762964474181" alt="Mascot" className="h-48 w-auto drop-shadow-2xl" />
                </div>
            </div>

            <div className="mt-12 flex justify-start">
                <button
                    onClick={onBack}
                    className="bg-slate-100 text-slate-600 font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors border border-slate-200"
                >
                    <ArrowLeftIcon className="w-5 h-5" /> PREVIOUS
                </button>
            </div>
        </div>
    );
};

export default PhotoUploadStep;
