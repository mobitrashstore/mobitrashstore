

import React, { useState, useEffect } from 'react';
import { PhoneDetails, Brand, SellModel } from '../types';
import { STORAGE_OPTIONS } from '../constants';
import * as api from '../services/api';
import { AppleIcon } from './icons/AppleIcon';
import { SamsungIcon } from './icons/SamsungIcon';
import Spinner from './Spinner';

interface PhoneSelectorProps {
  onNext: (details: PhoneDetails) => void;
}

const ITEMS_PER_PAGE = 18;

const PhoneSelector: React.FC<PhoneSelectorProps> = ({ onNext }) => {
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [storage_gb, setStorageGb] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(0);
  
  // Data State
  const [brandsList, setBrandsList] = useState<Brand[]>([]);
  const [dynamicModels, setDynamicModels] = useState<SellModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Load Brands
  useEffect(() => {
      const fetchBrands = async () => {
          try {
              const data = await api.getBrands();
              setBrandsList(data);
          } catch (e) {
              console.error("Failed to fetch brands", e);
          }
      }
      fetchBrands();
  }, []);

  // Load Models when Brand changes
  useEffect(() => {
      const fetchModels = async () => {
          if (!brand) return;
          setIsLoadingModels(true);
          try {
              // Fetch from DB - This now applies to ALL brands, including Apple.
              // No more static fallbacks.
              const dbModels = await api.getSellModelsByBrand(brand);
              setDynamicModels(dbModels);
          } catch (e) {
              console.error("Failed to fetch models", e);
          } finally {
              setIsLoadingModels(false);
          }
      };

      fetchModels();
      setModel('');
      setStorageGb('');
      setCurrentPage(0);
  }, [brand]);

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    setStorageGb('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brand && model && storage_gb) {
      onNext({ brand, model, ram_gb: 0, storage_gb: Number(storage_gb) });
    }
  };
  
  // Logic to determine storage options for the selected model
  const getStorageOptions = () => {
      const selectedModelData = dynamicModels.find(m => m.name === model);
      
      // 1. Try options from DB Model
      if (selectedModelData && selectedModelData.storageOptions && selectedModelData.storageOptions.length > 0) {
          // Parse "8/128GB" to just "128"
          return selectedModelData.storageOptions.map(opt => {
              const match = opt.match(/(\d+)GB$/i) || opt.match(/\/(\d+)GB$/i) || opt.match(/^(\d+)$/);
              return match ? parseInt(match[1]) : 0;
          }).filter(n => n > 0).sort((a, b) => a - b);
      }
      
      // 2. Fallback to Constants (Generic fallback if model name matches standard pattern)
      return STORAGE_OPTIONS[model] || [64, 128, 256];
  };

  const storageList = model ? getStorageOptions() : [];

  // Pagination for Apple (or large lists)
  const pageCount = Math.ceil(dynamicModels.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentModels = dynamicModels.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNextPage = () => setCurrentPage(p => Math.min(p + 1, pageCount - 1));
  const handlePrevPage = () => setCurrentPage(p => Math.max(p - 1, 0));

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-white mb-2">Select Your Device</h2>
      <p className="text-center text-slate-500 mb-8">Tell us what you're selling to get an instant quote.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Brand</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button type="button" onClick={() => handleBrandChange('Apple')} className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${brand === 'Apple' ? 'border-amber-600 bg-amber-900/50' : 'border-gray-600 hover:border-amber-500'}`}>
                <AppleIcon className="w-8 h-8"/> <span className="mt-2 font-semibold">Apple</span>
              </button>
              <button type="button" onClick={() => handleBrandChange('Samsung')} className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${brand === 'Samsung' ? 'border-amber-600 bg-amber-900/50' : 'border-gray-600 hover:border-amber-500'}`}>
                <SamsungIcon className="w-8 h-8"/> <span className="mt-2 font-semibold">Samsung</span>
              </button>
          </div>
          <select
            value={brand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="mt-4 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
          >
            <option value="">Select other brand...</option>
            {brandsList.filter(b => b.name !== 'Apple' && b.name !== 'Samsung').map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
          </select>
        </div>

        {/* Models Grid (Apple style for all brands to look nice) */}
        {brand && (
          <div className="animate-fade-in-down">
            <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
            
            {isLoadingModels ? (
                <div className="flex justify-center py-8"><Spinner /></div>
            ) : dynamicModels.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {currentModels.map(m => (
                        <button 
                            key={m.id || m.name}
                            type="button"
                            onClick={() => handleModelChange(m.name)}
                            className={`p-2 border-2 rounded-lg flex flex-col items-center justify-between transition-colors text-center ${model === m.name ? 'border-amber-500 bg-amber-900/50' : 'bg-black border-gray-700 hover:border-amber-500'}`}>
                            <img src={m.imageUrl || 'https://placehold.co/100x120/000000/FFFFFF?text=Phone'} alt={m.name} className="h-32 w-auto object-contain mb-2" />
                            <span className="font-semibold text-xs h-8 flex items-center justify-center w-full">{m.name}</span>
                        </button>
                    ))}
                    </div>
                    {pageCount > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button type="button" onClick={handlePrevPage} disabled={currentPage === 0} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                        &larr; Previous
                        </button>
                        <span className="text-slate-400">Page {currentPage + 1} of {pageCount}</span>
                        <button type="button" onClick={handleNextPage} disabled={currentPage >= pageCount - 1} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                        Next &rarr;
                        </button>
                    </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8 text-slate-500 bg-gray-900 rounded-lg border border-gray-700">
                    No models found for {brand}. Please add them in the Admin Panel.
                </div>
            )}
          </div>
        )}

        {model && (
          <div className="animate-fade-in-down pt-4 border-t border-gray-800 mt-6">
            <label htmlFor="storage" className="block text-sm font-medium text-slate-300 mb-2">Storage</label>
            <div className="flex flex-wrap gap-2">
              {storageList.length > 0 ? storageList.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStorageGb(s)}
                  className={`px-4 py-2 rounded-md border-2 text-sm font-medium ${storage_gb === s ? 'bg-amber-600 text-white border-amber-600' : 'bg-black border-gray-600 hover:border-amber-500'}`}
                >
                  {s} GB
                </button>
              )) : (
                  <p className="text-rose-500 text-sm">No storage options found for this model. Please contact support.</p>
              )}
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={!brand || !model || !storage_gb}
            className="w-full bg-amber-600 text-white font-bold py-3 px-4 rounded-md hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            Next: Condition
          </button>
        </div>
      </form>
    </div>
  );
};

export default PhoneSelector;
