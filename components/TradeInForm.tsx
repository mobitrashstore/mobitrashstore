import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface TradeInFormProps {
  onBack: () => void;
  onSubmit: (details: { name: string; address: string; phone: string; payout_method: string }) => void;
}

const TradeInForm: React.FC<TradeInFormProps> = ({ onBack, onSubmit }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, address, phone, payout_method: payoutMethod });
  };
  
  if (!user) {
      return (
          <div className="text-center">
              <h2 className="text-2xl font-bold text-center text-white mb-2">Please Log In</h2>
              <p className="text-slate-500">You need to be logged in to complete your trade-in.</p>
              {/* This component doesn't have navigate prop, so it relies on the parent page to handle login navigation */}
          </div>
      )
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-white mb-2">Complete Your Trade-in</h2>
      <p className="text-center text-slate-500 mb-8">Provide your details for pickup and payment.</p>
      
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-300">Pickup Address</label>
          <textarea
            id="address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-300">Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Payout Method</label>
          <select 
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-800 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
          >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
          </select>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row-reverse gap-4">
          <button
            type="submit"
            className="w-full sm:flex-grow bg-amber-600 text-white font-bold py-3 px-4 rounded-md hover:bg-amber-700 transition-colors"
          >
            Submit Trade-in
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-600 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeInForm;
