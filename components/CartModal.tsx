
import React from 'react';
import { useCart } from '../context/CartContext';
import { XMarkIcon } from './icons/XMarkIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import MobileSkyHeader from './MobileSkyHeader';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, navigate }) => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[110] animate-fade-in" onClick={onClose}>
      <div 
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right md:pt-[calc(env(safe-area-inset-top)+20px)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Header - Added onBack to show arrow */}
        <div className="md:hidden">
            <MobileSkyHeader title="Your Cart" Icon={ShoppingCartIcon} onBack={onClose} />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <ShoppingCartIcon className="w-16 h-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-gray-500">Looks like you haven't added anything yet.</p>
            <button
              onClick={() => { onClose(); navigate('/product'); }}
              className="mt-6 bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto p-6 scrollbar-hide">
              <ul className="space-y-4">
                {cart.map((item, index) => (
                  <li key={`${item.sku}-${item.selectedColor || index}`} className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0">
                    <img src={item.media[0]} alt={item.title} className="w-20 h-20 object-cover rounded-md border border-gray-200" />
                    <div className="flex-grow">
                      <h4 className="font-semibold text-sm text-gray-800 line-clamp-2">{item.title}</h4>
                      <p className="text-sm text-gray-500 font-medium mt-0.5">NPR {item.price.toLocaleString()}</p>
                      {item.selectedColor && (
                          <p className="text-xs text-gray-500 mt-0.5">Color: <span className="font-semibold">{item.selectedColor}</span></p>
                      )}
                      <div className="mt-2 flex items-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.sku, parseInt(e.target.value), item.selectedColor)}
                          className="w-16 p-1 border border-gray-300 bg-gray-50 rounded-md text-center text-sm"
                        />
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.sku, item.selectedColor)} className="p-2 text-gray-400 hover:text-rose-500">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 border-t border-gray-200 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900">Subtotal</span>
                <span className="text-gray-900">NPR {subtotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout.</p>
              <button
                onClick={handleCheckout}
                className="w-full bg-amber-600 text-white font-bold py-3 rounded-lg hover:bg-amber-700"
              >
                Proceed to Checkout
              </button>
              <button onClick={clearCart} className="w-full text-sm text-rose-500 hover:underline">
                  Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CartModal;
