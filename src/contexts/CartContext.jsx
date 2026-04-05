import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const trackAddToCart = (product) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const price = Number(product?.price ?? 0) || 0;
  const itemId = product?.id?.toString?.() || '';
  const itemName = product?.name || product?.name_en || product?.title || product?.name_ar || 'Rawaj Card Item';

  window.gtag('event', 'add_to_cart', {
    currency: 'SAR',
    value: price,
    items: [
      {
        item_id: itemId,
        item_name: itemName,
        price,
        quantity: 1,
      },
    ],
  });
};

const trackGoogleAdsAddToCartConversion = () => {
  if (typeof window === 'undefined' || typeof window.gtag_report_conversion !== 'function') return;
  window.gtag_report_conversion();
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rawaj_cart') || '[]');
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem('rawaj_cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product) => {
    trackAddToCart(product);
    trackGoogleAdsAddToCartConversion();

    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        id: `${product.id}_${Date.now()}`,
        product_id: product.id,
        // Store both language variants for display
        product_name:    product.name || product.name_en || product.title || product.name_ar || 'Rawaj Card Item',
        product_name_ar: product.name_ar || product.name || product.name_en || product.title || 'منتج رواج كارد',
        product_price:   product.price,
        product_image:   product.image   || product.image_url || '',
        quantity: 1,
      }];
    });
    setLastAdded(product);
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('rawaj_cart');
  }, []);

  const dismissMiniPopup = useCallback(() => setLastAdded(null), []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product_price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalCount,
      totalPrice,
      isCartOpen,
      setIsCartOpen,
      lastAdded,
      dismissMiniPopup,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
