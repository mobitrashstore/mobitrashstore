import React, { useState, useEffect } from 'react';
import { labelImage, suggestCategory, blurFaces, detectFaces } from '../services/mlService';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SmartImageAnalyzerProps {
    imageFile: File;
    onLabelsDetected?: (labels: Array<{ text: string; confidence: number }>) => void;
    onCategoryDetected?: (category: string) => void;
    onFacesDetected?: (faceCount: number) => void;
    onProcessedImage?: (processedFile: Blob) => void;
    autoBlurFaces?: boolean;
}

const SmartImageAnalyzer: React.FC<SmartImageAnalyzerProps> = ({
    imageFile,
    onLabelsDetected,
    onCategoryDetected,
    onFacesDetected,
    onProcessedImage,
    autoBlurFaces = false
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [labels, setLabels] = useState<Array<{ text: string; confidence: number }>>([]);
    const [suggestedCategory, setSuggestedCategory] = useState<string>('');
    const [faceCount, setFaceCount] = useState<number>(0);
    const [processingStage, setProcessingStage] = useState<string>('');

    useEffect(() => {
        analyzeImage();
    }, [imageFile]);

    const analyzeImage = async () => {
        setIsProcessing(true);

        try {
            // Stage 1: Detect labels
            setProcessingStage('Analyzing image content...');
            const detectedLabels = await labelImage(imageFile);
            setLabels(detectedLabels);
            onLabelsDetected?.(detectedLabels);

            // Stage 2: Suggest category
            setProcessingStage('Suggesting category...');
            const category = await suggestCategory(imageFile);
            setSuggestedCategory(category);
            onCategoryDetected?.(category);

            // Stage 3: Detect faces
            setProcessingStage('Checking for faces...');
            const faces = await detectFaces(imageFile);
            setFaceCount(faces.length);
            onFacesDetected?.(faces.length);

            // Stage 4: Blur faces if needed
            if (autoBlurFaces && faces.length > 0) {
                setProcessingStage('Blurring faces for privacy...');
                const blurredImage = await blurFaces(imageFile);
                if (blurredImage) {
                    onProcessedImage?.(blurredImage);
                }
            }

            setProcessingStage('Analysis complete!');
        } catch (error) {
            console.error('Image analysis error:', error);
            setProcessingStage('Analysis failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-purple-900">AI Image Analysis</h3>
            </div>

            {/* Processing indicator */}
            {isProcessing && (
                <div className="mb-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-purple-700">{processingStage}</span>
                    </div>
                </div>
            )}

            {/* Labels */}
            {labels.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs font-semibold text-purple-900 mb-2">Detected Objects:</p>
                    <div className="flex flex-wrap gap-2">
                        {labels.slice(0, 5).map((label, index) => (
                            <div
                                key={index}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-purple-200 shadow-sm"
                            >
                                <span className="text-xs font-semibold text-purple-700">{label.text}</span>
                                <span className="text-[10px] text-purple-500">
                                    {Math.round(label.confidence * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggested Category */}
            {suggestedCategory && (
                <div className="mb-3 p-3 bg-white/80 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-orange-600" />
                        <div>
                            <p className="text-xs font-semibold text-purple-900">Suggested Category:</p>
                            <p className="text-sm font-bold text-purple-700">{suggestedCategory}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Face detection warning */}
            {faceCount > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-xs font-semibold text-amber-900">
                                {faceCount} face{faceCount > 1 ? 's' : ''} detected
                            </p>
                            <p className="text-[10px] text-amber-700 mt-0.5">
                                {autoBlurFaces ? 'Faces will be blurred for privacy' : 'Consider blurring for privacy'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success state */}
            {!isProcessing && processingStage === 'Analysis complete!' && (
                <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-semibold text-orange-700">Analysis complete!</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartImageAnalyzer;
