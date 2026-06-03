
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PhoneDetails } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';

interface AiPhoneIdentifierProps {
  onIdentified: (details: PhoneDetails) => void;
}

const AiPhoneIdentifier: React.FC<AiPhoneIdentifierProps> = ({ onIdentified }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleIdentify = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    if (!process.env.API_KEY) {
        setError("API Key is not configured. Cannot use AI features.");
        return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    setIsLoading(true);
    setError(null);

    try {
      const imagePart = await fileToGenerativePart(file);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [
            imagePart,
            { text: `Identify the phone in the image. Return ONLY a raw JSON object with keys "brand", "model", and "storage_gb" (integer). Example: {"brand": "Apple", "model": "iPhone 15 Pro", "storage_gb": 256}. If not a phone, return {"brand": "Unknown", "model": "Not a phone", "storage_gb": 0}.` }
        ]}
      });
      
      const resultText = response.text || '';
      // Clean possible markdown wrappers if model includes them
      const jsonStr = resultText.replace(/```json|```/g, '').trim();
      const jsonResult: PhoneDetails = JSON.parse(jsonStr);

      if (jsonResult.brand === 'Unknown') {
        setError("Could not identify a phone in the image. Please try another one.");
        return;
      }
      
      onIdentified(jsonResult);

    } catch (e) {
      console.error("Error identifying phone:", e);
      setError("Failed to identify the phone. Please try again with a clearer photo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
      setFile(null);
      setPreviewUrl(null);
      setError(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  return (
    <div className="bg-black p-8 rounded-lg shadow-lg border border-gray-800 flex flex-col items-center justify-center text-center">
      <h3 className="text-2xl font-bold text-white">Identify with AI</h3>
      <p className="text-slate-400 mt-2">Upload a photo of your phone and let our AI do the work.</p>
      
      <div className="mt-6 w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center relative">
        {!previewUrl ? (
          <div className="text-center">
            <CameraIcon className="w-10 h-10 text-slate-400 mx-auto"/>
            <p className="mt-2 text-sm text-slate-500">Click to upload image</p>
          </div>
        ) : (
          <img src={previewUrl} alt="Phone preview" className="w-full h-full object-contain rounded-lg p-2" />
        )}
        <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        />
      </div>

      {error && <p className="mt-2 text-sm text-rose-500 font-medium">{error}</p>}
      
      {file && !isLoading && (
        <div className="mt-4 flex gap-2">
          <button onClick={handleReset} className="text-sm flex items-center gap-1 text-slate-500 hover:text-slate-300"><ArrowPathIcon className="w-4 h-4" /> Try another</button>
        </div>
      )}

      <button
        onClick={handleIdentify}
        disabled={!file || isLoading}
        className="mt-6 bg-amber-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-slate-400 disabled:cursor-wait w-full shadow-lg"
      >
        {isLoading ? 'Identifying...' : 'Identify My Phone'}
      </button>
    </div>
  );
};

export default AiPhoneIdentifier;

