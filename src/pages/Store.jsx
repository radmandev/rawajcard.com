import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/store/ProductCard';
import ProductPreviewModal from '@/components/store/ProductPreviewModal';
import Navbar from '@/components/landing/Navbar';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { productsData, productCategories } from '@/components/shared/productsData';
import { useCart } from '@/contexts/CartContext';

// Map a Supabase products row → shape that ProductCard expects
const normalizeProduct = (p) => ({
  ...p,
  image: p.main_image,
  // sale_price is the discounted price; price is the regular/base price
  price: p.sale_price ?? p.price,
  originalPrice: p.sale_price ? p.price : null,
  product_name: p.name,
  product_price: p.sale_price ?? p.price,
  product_image: p.main_image,
  features: Array.isArray(p.features_en) ? p.features_en : [],
  features_ar: Array.isArray(p.features_ar) ? p.features_ar : [],
});

// Static fallback (shown while loading or if table is empty)
const staticProducts = productsData.map((p) => ({
  ...p,
  image: p.image_url,
  originalPrice: p.original_price,
  product_name: p.name_en,
  product_price: p.price,
  product_image: p.image_url,
  features: p.features_en,
  name: p.name_en,
}));

const CATEGORY_TABS = [
  { value: 'all',            en: '🛍️ All',            ar: '🛍️ الكل' },
  { value: 'business_cards', en: '📱 Business Cards',  ar: '📱 بطاقات الأعمال' },
  { value: 'keychains',      en: '🔑 Keychains',       ar: '🔑 تعليقات المفاتيح' },
  { value: 'stands',         en: '📊 Table Stands',    ar: '📊 ستاندات الطاولة' },
];

export default function Store() {
  const { t, isRTL } = useLanguage();
  const [category, setCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { items: cartItems, addItem, setIsCartOpen, totalCount } = useCart();

  // Fetch from Supabase; fall back to static data while loading
  const { data: dbProducts, isLoading } = useQuery({
    queryKey: ['store-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []).map(normalizeProduct);
    },
    staleTime: 1000 * 60 * 5,
  });

  const products = dbProducts?.length ? dbProducts : staticProducts;

  const filteredProducts = category === 'all'
    ? products
    : products.filter((p) => p.category === category);

  const formatPrice = (price) =>
    new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', { style: 'currency', currency: 'SAR' }).format(price);

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
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 flex-wrap h-auto">
          {CATEGORY_TABS.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {isRTL ? cat.ar : cat.en}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Products Grid */}
      {isLoading && !dbProducts ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : (
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
      )}

      {/* Product Preview Modal (reusable) */}
      <ProductPreviewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      </div>
    </div>
  );
}