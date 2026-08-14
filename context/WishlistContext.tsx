import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { WishlistItem } from '../types';
import { useNotification } from './NotificationContext';

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (sku: string) => void;
  isInWishlist: (sku: string) => boolean;
}

const WISHLIST_STORAGE_KEY = 'mobistore_wishlist';

export const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
});

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const item = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });
  
  const { addNotification } = useNotification();

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (item: WishlistItem) => {
    setWishlist(prevWishlist => {
      if (prevWishlist.some(i => i.sku === item.sku)) {
        return prevWishlist;
      }
      addNotification(`${item.title} added to wishlist!`, 'info');
      return [...prevWishlist, item];
    });
  };

  const removeFromWishlist = (sku: string) => {
    setWishlist(prevWishlist => prevWishlist.filter(item => item.sku !== sku));
    addNotification('Item removed from wishlist.', 'info');
  };

  const isInWishlist = (sku: string) => {
    return wishlist.some(item => item.sku === sku);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
