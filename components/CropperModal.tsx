import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';

interface CropperModalProps {
    imageUrl: string;
    onCropComplete: (croppedDataUrl: string) => void;
    onCancel: () => void;
}

const CropperModal: React.FC<CropperModalProps> = ({ imageUrl, onCropComplete, onCancel }) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [crop, setCrop] = useState({ x: 50, y: 50, width: 200, height: 200 });
    const [dragInfo, setDragInfo] = useState<{ type: string, startX: number, startY: number, startCrop: typeof crop } | null>(null);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, type: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDragInfo({
            type,
            startX: e.clientX,
            startY: e.clientY,
            startCrop: { ...crop }
        });
    };

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (!dragInfo || !containerRef.current) return;
            e.preventDefault();

            const dx = e.clientX - dragInfo.startX;
            const dy = e.clientY - dragInfo.startY;
            let newCrop = { ...dragInfo.startCrop };

            if (dragInfo.type === 'move') {
                newCrop.x += dx;
                newCrop.y += dy;
            } else { // Resize
                newCrop.width += dx;
                newCrop.height += dy;
            }
            
            // Boundary checks
            const containerRect = containerRef.current.getBoundingClientRect();
            newCrop.x = Math.max(0, Math.min(newCrop.x, containerRect.width - newCrop.width));
            newCrop.y = Math.max(0, Math.min(newCrop.y, containerRect.height - newCrop.height));
            newCrop.width = Math.max(20, Math.min(newCrop.width, containerRect.width - newCrop.x));
            newCrop.height = Math.max(20, Math.min(newCrop.height, containerRect.height - newCrop.y));

            setCrop(newCrop);
        };

        const handlePointerUp = () => {
            setDragInfo(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [dragInfo]);

    const handleCrop = () => {
        if (!imageRef.current) return;

        const image = imageRef.current;
        const canvas = document.createElement('canvas');
        
        // Calculate scale factor between rendered image and natural image size
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        // The crop dimensions are relative to the displayed image, so scale them
        const sourceX = crop.x * scaleX;
        const sourceY = crop.y * scaleY;
        const sourceWidth = crop.width * scaleX;
        const sourceHeight = crop.height * scaleY;

        canvas.width = sourceWidth;
        canvas.height = sourceHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(
            image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            sourceWidth,
            sourceHeight
        );
        
        const croppedDataUrl = canvas.toDataURL('image/png');
        onCropComplete(croppedDataUrl);
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[120] flex flex-col items-center justify-center text-white">
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={onCancel} className="bg-black/50 p-3 rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            <div ref={containerRef} className="relative w-[90vw] h-[70vh] max-w-full max-h-full touch-none select-none">
                <img ref={imageRef} src={imageUrl} alt="Crop preview" className="w-full h-full object-contain" />
                
                <div 
                    className="absolute border-2 border-dashed border-white cursor-move"
                    style={{
                        left: `${crop.x}px`,
                        top: `${crop.y}px`,
                        width: `${crop.width}px`,
                        height: `${crop.height}px`,
                    }}
                    onPointerDown={(e) => handlePointerDown(e, 'move')}
                >
                    <div 
                        className="absolute -right-2 -bottom-2 w-4 h-4 bg-white rounded-full cursor-se-resize"
                        onPointerDown={(e) => handlePointerDown(e, 'resize-br')}
                    />
                </div>
            </div>

            <div className="absolute bottom-8">
                <button
                    onClick={handleCrop}
                    className="bg-amber-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-amber-700 transition-colors"
                >
                    Crop & Save
                </button>
            </div>
        </div>
    );
};

export default CropperModal;
