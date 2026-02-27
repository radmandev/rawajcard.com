import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductCard from '@/components/store/ProductCard';
import ProductPreviewModal from '@/components/store/ProductPreviewModal';
import Navbar from '@/components/landing/Navbar';
import { 
  ShoppingCart, 
  CreditCard as NFCIcon, 
  Sparkles, 
  Package,
  Star,
  Check,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { productsData, productCategories } from '@/components/shared/productsData';
import { useCart } from '@/contexts/CartContext';

// Use shared products data
const sampleProducts = productsData.map(p => ({
  ...p,
  image: p.image_url,
  originalPrice: p.original_price,
  category: p.category === 'business_cards' ? 'nfc_card' : p.category,
  features: p.features_en,
  features_ar: p.features_ar
}));

export default function Store() {
  const { t, isRTL } = useLanguage();
  const [category, setCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Global cart context (localStorage-based, works for all users)
  const { items: cartItems, addItem, updateQuantity, removeItem, isCartOpen, setIsCartOpen, totalCount } = useCart();

  const filteredProducts = category === 'all' 
    ? sampleProducts 
    : sampleProducts.filter(p => p.category === category);

  const formatPrice = (price) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  };

  const hasDiscount = (product) => product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-28 pb-16 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {t('onlineStore')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isRTL 
              ? 'اكتشف بطاقات NFC الفاخرة والاشتراكات المميزة'
              : 'Discover premium NFC cards and subscriptions'
            }
          </p>
        </div>

        <Button 
          onClick={() => setIsCartOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 relative"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {t('cart')}
          {totalCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </Button>
      </div>

      {/* Categories */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
          {productCategories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value === 'business_cards' ? 'nfc_card' : cat.value} className="flex items-center gap-2">
              <span>{cat.icon}</span>
              {isRTL ? cat.label_ar : cat.label_en}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard
              product={product}
              onAddToCart={() => addItem(product)}
              onView={() => setSelectedProduct(product)}
            />
          </motion.div>
        ))}
      </div>

      {/* Product Preview Modal (reusable) */}
      <ProductPreviewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      </div>
    </div>
  );
}