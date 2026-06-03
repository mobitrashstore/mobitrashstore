


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { Order } from '../types';
import Spinner from '../components/Spinner';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { ArchiveBoxIcon } from '../components/icons/ArchiveBoxIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';
import { useNotification } from '../context/NotificationContext';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';

export interface OrderHistoryPageProps {
  navigate: (path: string) => void;
}

// FIX: Changed to a named export to resolve module resolution issues with React.lazy in App.tsx.
const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ navigate }) => {
  const { user, loading } = useAuth();
  const { addNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
        if (user) {
            setOrdersLoading(true);
            try {
                const userOrders = await api.getOrdersByUserId(user.id);
                userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setOrders(userOrders);
            } catch (error) {
                console.error("Failed to fetch user orders:", error);
            } finally {
                setOrdersLoading(false);
            }
        } else if (!loading) {
            setOrdersLoading(false);
        }
    };
    fetchOrders();
  }, [user, loading]);
  
  const handleCancelOrder = async (orderId: string) => {
      if (!window.confirm("Are you sure you want to cancel this order?")) return;
      
      setProcessingId(orderId);
      try {
          await api.cancelOrder(orderId);
          // Update local state
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
          addNotification("Order cancelled successfully.", "success");
      } catch (error) {
          console.error("Cancel failed", error);
          addNotification("Failed to cancel order.", "error");
      } finally {
          setProcessingId(null);
      }
  };

  const handleCopy = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      addNotification("Copied to clipboard!", "success");
      setTimeout(() => setCopiedId(null), 2000);
  };
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
        case 'Processing': return 'bg-blue-100 text-blue-800';
        case 'Shipped': return 'bg-yellow-100 text-yellow-800';
        case 'Delivered': return 'bg-green-100 text-green-800';
        case 'Cancelled': return 'bg-rose-100 text-rose-800';
        default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
      return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  if (!user) {
    return (
        <div className="text-center py-20 min-h-[60vh] flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-900">Please log in</h1>
            <p className="mt-2 text-gray-600">You need to be logged in to view your order history.</p>
            <button onClick={() => navigate('/login')} className="mt-6 bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-700">
              Go to Login
            </button>
        </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen md:py-8 pb-20">
      <MobileSkyHeader title="Order History" Icon={ArchiveBoxIcon} onBack={() => navigate('/profile')} hasSpacer={false} />
      
      <div className="w-full max-w-4xl mx-auto md:px-6 lg:px-8 pt-40 md:pt-0">
        <h1 className="text-3xl font-bold text-gray-900 hidden md:block mb-6">Order History</h1>
        
        <div className="px-4 md:px-0">
            {ordersLoading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 pb-3 border-b border-gray-200 gap-2">
                      <div>
                          <p className="text-xs text-gray-500 font-medium">Order ID</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-gray-700 font-semibold">{order.id}</span>
                            <button onClick={() => handleCopy(order.id, order.id)} className="text-gray-400 hover:text-amber-600 transition-colors">
                                {copiedId === order.id ? <CheckCircleIcon className="w-4 h-4 text-green-500"/> : <ClipboardIcon className="w-4 h-4"/>}
                            </button>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-500 font-medium">Date</p>
                            <p className="text-sm font-semibold text-gray-700">{order.date}</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-500 font-medium">Total</p>
                            <p className="text-sm font-bold text-amber-600">NPR {order.total.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-500 bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full">{item.quantity}x</span>
                                <p className="text-sm text-gray-800 flex-grow">{item.title}</p>
                                <p className="text-sm text-gray-600 font-medium">NPR {(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-gray-100 mt-3 gap-3">
                        <div className="flex items-center gap-2">
                             <p className="text-xs font-semibold text-gray-500">Status:</p>
                             <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                             </span>
                        </div>
                        
                         {(order.status === 'Processing' || order.status === 'Payment Pending') && (
                             <button 
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={processingId === order.id}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 font-bold rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors text-xs"
                             >
                                 {processingId === order.id ? <Spinner size="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                                 {processingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                             </button>
                         )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                  <ArchiveBoxIcon className="w-12 h-12 text-gray-300 mx-auto" />
                  <h2 className="mt-4 text-xl font-semibold text-gray-900">No orders yet</h2>
                  <p className="mt-1 text-gray-500">Your past orders will appear here.</p>
                  <button onClick={() => navigate('/buy')} className="mt-6 bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-700">
                    Start Shopping
                  </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
