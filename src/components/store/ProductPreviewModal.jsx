import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Check, Star, X } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

export default function ProductPreviewModal({ product, onClose }) {
  const { isRTL } = useLanguage();
  const { addItem } = useCart();

  if (!product) return null;

  const name        = isRTL ? (product.name_ar || product.name || product.name_en || '') : (product.name || product.name_en || product.name_ar || '');
  const description = isRTL ? (product.description_ar || product.description_en || '') : (product.description_en || product.description_ar || '');
  const features    = isRTL ? (product.features_ar || product.features || []) : (product.features || product.features_en || product.features_ar || []);
  const image       = product.image || product.image_url;
  const origPrice   = product.originalPrice || product.original_price;
  const discountPct = origPrice && origPrice > product.price
    ? Math.round((1 - product.price / origPrice) * 100)
    : product.discount_percentage || null;

  const fmt = (p) =>
    new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', { style: 'currency', currency: 'SAR' }).format(p);

  const handleAdd = () => {
    addItem(product);
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <div className={cn('grid grid-cols-1 md:grid-cols-2', isRTL && 'rtl')}>
          {/* Image panel */}
          <div className="relative bg-slate-100 dark:bg-slate-800 aspect-square md:aspect-auto md:min-h-[400px]">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl font-bold text-slate-300 dark:text-slate-600">
                {name?.charAt(0)}
              </div>
            )}
            {discountPct > 0 && (
              <Badge className="absolute top-3 end-3 bg-red-500 text-white text-sm px-3 py-1">
                {discountPct}% {isRTL ? 'خصم' : 'OFF'}
              </Badge>
            )}
          </div>

          {/* Details panel */}
          <div className="p-6 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              {/* Title + stars */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug mb-2">
                  {name}
                </h2>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  {product.reviews && (
                    <span className="text-xs text-slate-400 ms-1.5">({product.reviews})</span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="text-3xl font-black text-teal-600 dark:text-teal-400">
                  {fmt(product.price)}
                </p>
                {origPrice && origPrice > product.price && (
                  <p className="text-sm text-slate-400 line-through mt-0.5">{fmt(origPrice)}</p>
                )}
              </div>

              {/* Description */}
              {description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Features */}
              {features && features.length > 0 && (
                <ul className="space-y-1.5">
                  {features.slice(0, 5).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button
              onClick={handleAdd}
              size="lg"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              <ShoppingCart className={cn('h-5 w-5', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'أضف إلى السلة' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
