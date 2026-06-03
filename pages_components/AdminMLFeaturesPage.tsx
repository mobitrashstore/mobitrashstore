import React, { useState } from 'react';
import {
    labelImage,
    recognizeText,
    extractIMEI,
    scanBarcode,
    detectFaces,
    blurFaces,
    suggestCategory,
    detectLanguage
} from '../services/mlService';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { CameraIcon } from '../components/icons/CameraIcon';

interface AdminMLFeaturesPageProps {
    navigate: (path: string) => void;
}

const AdminMLFeaturesPage: React.FC<AdminMLFeaturesPageProps> = ({ navigate }) => {
    const [selectedFeature, setSelectedFeature] = useState<string>('image-labeling');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<any>(null);

    const features = [
        {
            id: 'image-labeling',
            name: 'Image Labeling',
            description: 'Detect objects, locations, and activities in images',
            icon: '🏷️',
            color: 'from-purple-500 to-pink-600'
        },
        {
            id: 'text-recognition',
            name: 'Text Recognition (OCR)',
            description: 'Extract text from images',
            icon: '📝',
            color: 'from-blue-500 to-cyan-600'
        },
        {
            id: 'imei-extraction',
            name: 'IMEI Extraction',
            description: 'Automatically extract IMEI numbers from photos',
            icon: '📱',
            color: 'from-emerald-500 to-green-600'
        },
        {
            id: 'barcode-scanning',
            name: 'Barcode Scanning',
            description: 'Scan product barcodes for quick lookup',
            icon: '📊',
            color: 'from-indigo-500 to-purple-600'
        },
        {
            id: 'face-detection',
            name: 'Face Detection',
            description: 'Detect faces in images for privacy protection',
            icon: '👤',
            color: 'from-amber-500 to-orange-600'
        },
        {
            id: 'category-suggestion',
            name: 'Smart Categorization',
            description: 'AI-powered product category suggestions',
            icon: '🎯',
            color: 'from-rose-500 to-red-600'
        },
        {
            id: 'language-detection',
            name: 'Language Detection',
            description: 'Detect language in image text',
            icon: '🌐',
            color: 'from-teal-500 to-cyan-600'
        }
    ];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResults(null);
    };

    const processImage = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        setResults(null);

        try {
            switch (selectedFeature) {
                case 'image-labeling':
                    const labels = await labelImage(selectedFile);
                    setResults({ type: 'labels', data: labels });
                    break;

                case 'text-recognition':
                    const textBlocks = await recognizeText(selectedFile);
                    setResults({ type: 'text', data: textBlocks });
                    break;

                case 'imei-extraction':
                    const imei = await extractIMEI(selectedFile);
                    setResults({ type: 'imei', data: imei });
                    break;

                case 'barcode-scanning':
                    const barcode = await scanBarcode(selectedFile);
                    setResults({ type: 'barcode', data: barcode });
                    break;

                case 'face-detection':
                    const faces = await detectFaces(selectedFile);
                    const blurredImage = await blurFaces(selectedFile);
                    setResults({ type: 'faces', data: { faces, blurredImage } });
                    break;

                case 'category-suggestion':
                    const category = await suggestCategory(selectedFile);
                    setResults({ type: 'category', data: category });
                    break;

                case 'language-detection':
                    const language = await detectLanguage(selectedFile);
                    setResults({ type: 'language', data: language });
                    break;
            }
        } catch (error) {
            console.error('Processing error:', error);
            setResults({ type: 'error', data: 'Failed to process image' });
        } finally {
            setIsProcessing(false);
        }
    };

    const renderResults = () => {
        if (!results) return null;

        switch (results.type) {
            case 'labels':
                return (
                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-900">Detected Labels:</h3>
                        {results.data.map((label: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <span className="font-semibold text-purple-900">{label.text}</span>
                                <span className="text-sm text-purple-600">{Math.round(label.confidence * 100)}%</span>
                            </div>
                        ))}
                    </div>
                );

            case 'text':
                return (
                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-900">Extracted Text:</h3>
                        {results.data.map((block: any, index: number) => (
                            <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-slate-900">{block.text}</p>
                                <p className="text-xs text-blue-600 mt-1">Confidence: {Math.round(block.confidence * 100)}%</p>
                            </div>
                        ))}
                    </div>
                );

            case 'imei':
                return (
                    <div className="p-4 bg-emerald-50 rounded-lg">
                        <h3 className="font-bold text-emerald-900 mb-2">IMEI Number:</h3>
                        <p className="text-2xl font-mono font-bold text-emerald-700">{results.data || 'Not found'}</p>
                    </div>
                );

            case 'barcode':
                return (
                    <div className="p-4 bg-indigo-50 rounded-lg">
                        <h3 className="font-bold text-indigo-900 mb-2">Barcode Result:</h3>
                        {results.data ? (
                            <>
                                <p className="text-xl font-mono font-bold text-indigo-700">{results.data.rawValue}</p>
                                <p className="text-sm text-indigo-600 mt-1">Format: {results.data.format}</p>
                            </>
                        ) : (
                            <p className="text-indigo-700">No barcode detected</p>
                        )}
                    </div>
                );

            case 'faces':
                return (
                    <div className="space-y-3">
                        <div className="p-4 bg-amber-50 rounded-lg">
                            <h3 className="font-bold text-amber-900 mb-2">Faces Detected:</h3>
                            <p className="text-2xl font-bold text-amber-700">{results.data.faces.length}</p>
                        </div>
                        {results.data.blurredImage && (
                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">Blurred Image:</h3>
                                <img
                                    src={URL.createObjectURL(results.data.blurredImage)}
                                    alt="Blurred"
                                    className="w-full rounded-lg border-2 border-amber-200"
                                />
                            </div>
                        )}
                    </div>
                );

            case 'category':
                return (
                    <div className="p-4 bg-rose-50 rounded-lg">
                        <h3 className="font-bold text-rose-900 mb-2">Suggested Category:</h3>
                        <p className="text-2xl font-bold text-rose-700">{results.data}</p>
                    </div>
                );

            case 'language':
                return (
                    <div className="p-4 bg-teal-50 rounded-lg">
                        <h3 className="font-bold text-teal-900 mb-2">Detected Language:</h3>
                        <p className="text-2xl font-bold text-teal-700">{results.data === 'ne' ? 'Nepali' : 'English'}</p>
                    </div>
                );

            case 'error':
                return (
                    <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-red-700 font-semibold">{results.data}</p>
                    </div>
                );

            default:
                return null;
        }
    };

    const selectedFeatureData = features.find(f => f.id === selectedFeature);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <SparklesIcon className="w-8 h-8 text-purple-600" />
                        <h1 className="text-3xl font-black text-slate-900">ML Features Dashboard</h1>
                    </div>
                    <p className="text-slate-600">Test and manage Firebase Machine Learning features (Free Spark Plan)</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Feature Selection */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Select Feature</h2>
                            <div className="space-y-2">
                                {features.map((feature) => (
                                    <button
                                        key={feature.id}
                                        onClick={() => {
                                            setSelectedFeature(feature.id);
                                            setResults(null);
                                        }}
                                        className={`w-full text-left p-4 rounded-xl transition-all ${selectedFeature === feature.id
                                            ? `bg-gradient-to-r ${feature.color} text-white shadow-lg`
                                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{feature.icon}</span>
                                            <div>
                                                <p className="font-bold text-sm">{feature.name}</p>
                                                <p className={`text-xs ${selectedFeature === feature.id ? 'text-white/80' : 'text-slate-500'}`}>
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Upload Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">
                                {selectedFeatureData?.name}
                            </h2>
                            <p className="text-sm text-slate-600 mb-6">{selectedFeatureData?.description}</p>

                            {/* File Upload */}
                            <div className="mb-6">
                                <label className="block w-full">
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                                        <CameraIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                        <p className="text-slate-700 font-semibold mb-1">Click to upload image</p>
                                        <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Preview */}
                            {previewUrl && (
                                <div className="mb-6">
                                    <h3 className="font-bold text-slate-900 mb-2">Preview:</h3>
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full max-h-64 object-contain bg-slate-100 rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Process Button */}
                            {selectedFile && (
                                <button
                                    onClick={processImage}
                                    disabled={isProcessing}
                                    className={`w-full bg-gradient-to-r ${selectedFeatureData?.color} text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isProcessing ? 'Processing...' : `Run ${selectedFeatureData?.name}`}
                                </button>
                            )}
                        </div>

                        {/* Results Section */}
                        {results && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Results</h2>
                                {renderResults()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMLFeaturesPage;
