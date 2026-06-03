
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { CartItem, InventoryItem, Coupon } from '../types';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: InventoryItem, quantity?: number, selectedColor?: string) => void;
  removeFromCart: (sku: string, selectedColor?: string) => void;
  updateQuantity: (sku: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
}

const CART_STORAGE_KEY = 'mobistore_cart';

export const CartContext = createContext<CartContextType>({
  cart: [],
  isCartOpen: false,
  appliedCoupon: null,
  discountAmount: 0,
  openCart: () => {},
  closeCart: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  applyCoupon: () => {},
  removeCoupon: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const item = window.localStorage.getItem(CART_STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const { addNotification } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    
    // Abandoned Cart Logic: Save only if user is logged in and cart is not empty
    if (user && cart.length > 0) {
        db.collection('abandonedCarts').doc(user.id).set({
            userId: user.id,
            email: user.email,
            name: user.name,
            items: cart.map(item => ({
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                image: item.media?.[0] || ''
            })),
            lastUpdated: new Date().toISOString(),
            status: 'pending',
            emailsSent: 0
        }, { merge: true }).catch(err => console.warn("Failed to save abandoned cart", err));
    }
  }, [cart, user]);

  const addToCart = (item: InventoryItem, quantity: number = 1, selectedColor?: string) => {
    setCart(prevCart => {
      // NOTE: `item.price` passed here should already be the VARIANT PRICE from ProductDetailPage logic
      const existingItemIndex = prevCart.findIndex(cartItem => 
          cartItem.sku === item.sku && cartItem.selectedColor === selectedColor && cartItem.price === item.price
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }
      return [...prevCart, { ...item, quantity, selectedColor }];
    });
    addNotification(`${item.title} ${selectedColor ? `(${selectedColor}) ` : ''}added to cart!`, 'success');
  };

  const removeFromCart = (sku: string, selectedColor?: string) => {
    setCart(prevCart => prevCart.filter(item => !(item.sku === sku && item.selectedColor === selectedColor)));
  };

  const updateQuantity = (sku: string, quantity: number, selectedColor?: string) => {
    if (quantity <= 0) {
      removeFromCart(sku, selectedColor);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        (item.sku === sku && item.selectedColor === selectedColor) 
            ? { ...item, quantity } 
            : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (coupon: Coupon) => {
      setAppliedCoupon(coupon);
  }

  const removeCoupon = () => {
      setAppliedCoupon(null);
  }
  
  const discountAmount = useMemo(() => {
      if (!appliedCoupon) return 0;
      
      const totalCartValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      // 1. Check Global Minimum Order Requirement (Applies to TOTAL cart value)
      if (appliedCoupon.minOrderAmount > 0 && totalCartValue < appliedCoupon.minOrderAmount) {
          return 0;
      }

      let eligibleAmount = 0;

      // 2. Calculate Eligible Amount based on targeting
      if (!appliedCoupon.applicableTo || appliedCoupon.applicableTo === 'all') {
          // All items are eligible
          eligibleAmount = totalCartValue;
      } else if (appliedCoupon.applicableTo === 'category') {
          // Filter items by category
          const targetCats = appliedCoupon.targetIds || [];
          eligibleAmount = cart.reduce((sum, item) => {
              if (targetCats.includes(item.category)) {
                  return sum + (item.price * item.quantity);
              }
              return sum;
          }, 0);
      } else if (appliedCoupon.applicableTo === 'product') {
           // Filter items by SKU
           const targetSkus = appliedCoupon.targetIds || [];
           eligibleAmount = cart.reduce((sum, item) => {
              if (targetSkus.includes(item.sku)) {
                  return sum + (item.price * item.quantity);
              }
              return sum;
          }, 0);
      }

      // If no eligible items found for specific coupon
      if (eligibleAmount === 0) return 0;

      let discount = 0;
      if (appliedCoupon.discountType === 'percentage') {
          discount = (eligibleAmount * appliedCoupon.value) / 100;
      } else {
          // Fixed amount: cap it at eligible amount (can't discount more than the items cost)
          discount = Math.min(appliedCoupon.value, eligibleAmount);
      }
      
      // Ensure discount doesn't exceed total (double check)
      return Math.min(discount, totalCartValue);

  }, [cart, appliedCoupon]);

  return (
    <CartContext.Provider value={{ cart, isCartOpen, appliedCoupon, discountAmount, openCart, closeCart, addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon }}>
      {children}
    </CartContext.Provider>
  );
};
