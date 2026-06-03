

import React, { useState, useEffect } from 'react';
import { CheckIcon } from '../components/icons/CheckIcon';

export interface TradeInConfirmationPageProps {
  navigate: (path: string) => void;
}

const TradeInConfirmationPage: React.FC<TradeInConfirmationPageProps> = ({ navigate }) => {
  const [tradeInId, setTradeInId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTradeInId(params.get('id'));
  }, []);

  return (
    <div className="text-center py-20 min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <CheckIcon className="w-16 h-16"/>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mt-8">Trade-in Submitted!</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-4 max-w-lg mx-auto">Thank you for submitting your trade-in. We will contact you shortly to arrange for pickup and verification. You can check the status using your trade-in ID.</p>
        {tradeInId && (
            <p className="mt-4 font-semibold text-lg dark:text-white">Your Trade-in ID is: <span className="text-amber-600">{tradeInId}</span></p>
        )}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate('/track')} className="w-full sm:w-auto bg-amber-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors">
              Track Your Trade-in
          </button>
          <button onClick={() => navigate('/')} className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors">
              Back to Home
          </button>
        </div>
    </div>
  );
};

export default TradeInConfirmationPage;
