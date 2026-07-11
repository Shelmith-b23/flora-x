import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface AppContextType {
  cart: CartItem[];
  wishlist: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setWishlistOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: 'Standard' | 'Deluxe' | 'Grandee') => void;
  updateCartQuantity: (productId: string, size: 'Standard' | 'Deluxe' | 'Grandee', qty: number) => void;
  toggleWishlist: (productId: string) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('florax_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('florax_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Nairobi');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isWishlistOpen, setWishlistOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('florax_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('florax_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === newItem.product.id && item.size === newItem.size
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
    setCartOpen(true); // Automatically open cart to show immediate visual feedback
  };

  const removeFromCart = (productId: string, size: 'Standard' | 'Deluxe' | 'Grandee') => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size)));
  };

  const updateCartQuantity = (productId: string, size: 'Standard' | 'Deluxe' | 'Grandee', qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size ? { ...item, quantity: qty } : item
      )
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        searchQuery,
        setSearchQuery,
        selectedLocation,
        setSelectedLocation,
        quickViewProduct,
        setQuickViewProduct,
        isCartOpen,
        setCartOpen,
        isWishlistOpen,
        setWishlistOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
