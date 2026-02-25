import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductCard from '@/components/store/ProductCard';
import CartSidebar from '@/components/store/CartSidebar';
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
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch cart items
  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.entities.CartItem.list()
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (product) => {
      const existing = cartItems.find(item => item.product_id === product.id);
      if (existing) {
        return api.entities.CartItem.update(existing.id, {
          quantity: existing.quantity + 1
        });
      }
      return api.entities.CartItem.create({
        product_id: product.id,
        product_name: isRTL ? product.name_ar : product.name,
        product_price: product.price,
        product_image: product.image,
        quantity: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(isRTL ? 'تمت الإضافة للسلة' : 'Added to cart');
      setCartOpen(true);
    }
  });

  // Update cart item
  const updateCartMutation = useMutation({
    mutationFn: ({ id, quantity }) => {
      if (quantity <= 0) {
        return api.entities.CartItem.delete(id);
      }
      return api.entities.CartItem.update(id, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  // Remove from cart
  const removeFromCartMutation = useMutation({
    mutationFn: (id) => api.entities.CartItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

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
    <div className="max-w-7xl mx-auto space-y-8">
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
          onClick={() => setCartOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 relative"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {t('cart')}
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
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
              onAddToCart={() => addToCartMutation.mutate(product)}
              onView={() => setSelectedProduct(product)}
            />
          </motion.div>
        ))}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) => updateCartMutation.mutate({ id, quantity })}
        onRemove={(id) => removeFromCartMutation.mutate(id)}
      />

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? selectedProduct?.name_ar : selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400">
                  {isRTL ? selectedProduct.description_ar : selectedProduct.description}
                </p>

                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  {formatPrice(selectedProduct.price)}
                  {selectedProduct.category === 'subscription' && (
                    <span className="text-sm text-slate-500 font-normal">
                      {isRTL ? '/شهرياً' : '/month'}
                    </span>
                  )}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold">
                    {isRTL ? 'المميزات' : 'Features'}
                  </h4>
                  <ul className="space-y-2">
                    {(isRTL ? selectedProduct.features_ar : selectedProduct.features)?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => {
                    addToCartMutation.mutate(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t('addToCart')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}