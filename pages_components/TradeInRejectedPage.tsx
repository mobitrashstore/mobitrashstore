

import React, { useEffect, useState } from 'react';
import { XCircleIcon } from '../components/icons/XCircleIcon';

export interface TradeInRejectedPageProps {
  navigate: (path: string) => void;
}

const TradeInRejectedPage: React.FC<TradeInRejectedPageProps> = ({ navigate }) => {
  const [message, setMessage] = useState('There was an unexpected error. Please try again or contact support.');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get('message');
    if (msg) {
      setMessage(msg);
    }
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
      <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <XCircleIcon className="w-16 h-16"/>
      </div>
      <h1 className="text-4xl font-extrabold text-slate-800 mt-8">Trade-in Not Possible</h1>
      <p className="text-slate-600 mt-4 mx-auto">{message}</p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          onClick={() => navigate('/sell')}
          className="w-full sm:w-auto bg-amber-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors"
        >
          Start a New Quote
        </button>
        <button 
          onClick={() => navigate('/')}
          className="w-full sm:w-auto bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default TradeInRejectedPage;
