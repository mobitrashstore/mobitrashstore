

import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { TrashIcon } from '../components/icons/TrashIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import MobileSkyHeader from '../components/MobileSkyHeader';

export interface WishlistPageProps {
  navigate: (path: string) => void;
}

// Helper to generate slug
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const WishlistPage: React.FC<WishlistPageProps> = ({ navigate }) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart(item);
    removeFromWishlist(item.sku);
  };

  const handleItemClick = (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    navigate(`/buy/${slugify(title)}`);
  }

  return (
    <div className="bg-transparent min-h-screen pb-20">
      <MobileSkyHeader title="My Wishlist" Icon={HeartIcon} hasSpacer={false} />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-24">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 hidden md:block">My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md border border-gray-200">
            <HeartIcon className="w-16 h-16 text-gray-300 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
            <p className="mt-1 text-gray-500">Add items you love to your wishlist to keep track of them.</p>
            <button onClick={() => navigate('/buy')} className="mt-6 bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-700">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlist.map(item => (
              <div key={item.sku} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 border border-gray-200">
                <img src={item.media[0]} alt={item.title} className="w-24 h-24 object-cover rounded-md border border-gray-200" />
                <div className="flex-grow">
                  <a href={`/buy/${slugify(item.title)}`} onClick={(e) => handleItemClick(e, item.title)} className="font-semibold text-gray-900 hover:text-amber-600">{item.title}</a>
                  <p className="text-lg font-bold text-amber-600 mt-1">NPR {item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                    className="w-full sm:w-auto bg-amber-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-amber-700 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {item.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <button onClick={() => removeFromWishlist(item.sku)} className="p-2 text-gray-400 hover:text-rose-500">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
