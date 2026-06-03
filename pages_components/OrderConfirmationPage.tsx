

import React, { useState, useEffect } from 'react';
import { CheckIcon } from '../components/icons/CheckIcon';

export interface OrderConfirmationPageProps {
  navigate: (path: string) => void;
}

const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ navigate }) => {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderId(params.get('id'));
  }, []);

  return (
    <div className="text-center py-20 min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <CheckIcon className="w-16 h-16"/>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 mt-8">Thank you for your order!</h1>
        <p className="text-slate-600 mt-4 max-w-lg mx-auto"> {/* Re-introduced max-w-lg */}
            Your order has been placed successfully. You will receive an email confirmation shortly with your order details and tracking information.
        </p>
        {orderId && (
            <p className="mt-4 font-semibold text-lg">Your Order ID is: <span className="text-amber-600">{orderId}</span></p>
        )}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate('/buy')} className="w-full sm:w-auto bg-amber-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors">
              Continue Shopping
          </button>
           <button onClick={() => navigate('/track')} className="w-full sm:w-auto bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors">
              Track Your Order
          </button>
        </div>
    </div>
  );
};

export default OrderConfirmationPage;
