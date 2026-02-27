import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { useCart } from '@/contexts/CartContext';

export default function ProductCard({ product, onAddToCart, onView }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isRTL } = useLanguage();

  const formatPrice = (price) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: product.currency || 'SAR'
    }).format(price);
  };

  const categoryLabels = {
    nfc_card: { en: 'NFC Card', ar: 'بطاقة NFC' },
    subscription: { en: 'Subscription', ar: 'اشتراك' },
    accessory: { en: 'Accessory', ar: 'ملحقات' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden",
        "border border-slate-200/50 dark:border-slate-700/50",
        "shadow-lg shadow-slate-200/20 dark:shadow-none",
        "hover:shadow-xl hover:shadow-slate-200/30 dark:hover:shadow-none",
        "transition-all duration-300"
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        {product.image ? (
          <img
            src={product.image}
            alt={isRTL ? product.name_ar : product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl font-bold text-slate-300 dark:text-slate-600">
              {(isRTL ? product.name_ar : product.name)?.charAt(0)}
            </div>
          </div>
        )}

        {/* Discount Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% {isRTL ? 'خصم' : 'OFF'}
          </Badge>
        )}

        {/* Category Badge */}
        <Badge className="absolute top-3 left-3 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 backdrop-blur-sm">
          {isRTL 
            ? categoryLabels[product.category]?.ar 
            : categoryLabels[product.category]?.en
          }
        </Badge>

        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onView(product)}
            className="bg-white/90 hover:bg-white"
          >
            <Eye className="h-4 w-4 mr-1" />
            {isRTL ? 'عرض' : 'View'}
          </Button>
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); addItem(product); onAddToCart && onAddToCart(product); }}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isRTL ? 'أضف' : 'Add'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
          {isRTL ? product.name_ar : product.name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
          {isRTL ? product.description_ar : product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            {product.originalPrice && product.originalPrice > product.price ? (
              <div>
                <p className="text-sm text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </p>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                  {formatPrice(product.price)}
                </p>
              </div>
            ) : (
              <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                {formatPrice(product.price)}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Button
              size="sm"
              onClick={() => onAddToCart(product)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              {isRTL ? 'أضف' : 'Add'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { addItem(product); navigate(createPageUrl('Checkout')); }}
              className="border-slate-300 dark:border-slate-600 text-xs"
            >
              <Zap className="h-3.5 w-3.5 mr-1 text-amber-500" />
              {isRTL ? 'اشتر الآن' : 'Buy Now'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}