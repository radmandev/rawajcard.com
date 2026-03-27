import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CartMiniPopup() {
  const { lastAdded, dismissMiniPopup, setIsCartOpen } = useCart();
  const { isRTL } = useLanguage();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!lastAdded) {
      setProgress(100);
      return;
    }
    setProgress(100);
    const duration = 3500;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct <= 0) {
        clearInterval(tick);
        dismissMiniPopup();
      }
    }, 40);
    return () => clearInterval(tick);
  }, [lastAdded, dismissMiniPopup]);

  const name  = lastAdded
    ? (isRTL
        ? (lastAdded.name_ar || lastAdded.name || lastAdded.name_en || '')
        : (lastAdded.name    || lastAdded.name_en || lastAdded.name_ar || ''))
    : '';
  const image = lastAdded?.image || lastAdded?.image_url;

  return (
    <AnimatePresence>
      {lastAdded && (
        <motion.div
          key="cart-mini-popup"
          initial={{ opacity: 0, y: 72, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={  { opacity: 0, y: 72, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className={cn(
            'fixed bottom-20 md:bottom-6 z-[999] w-[calc(100%-2rem)] max-w-xs',
            isRTL ? 'left-4' : 'right-4'
          )}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* shrinking progress bar */}
            <div
              className="h-1 bg-teal-500 transition-none"
              style={{ width: `${progress}%` }}
            />
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* thumbnail */}
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                  {image ? (
                    <img src={image} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xl font-bold text-slate-400">
                      {name?.charAt(0)}
                    </div>
                  )}
                </div>

                {/* text */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-0.5">
                    {isRTL ? '✓ تمت الإضافة إلى السلة' : '✓ Added to cart'}
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {name}
                  </p>
                </div>

                {/* dismiss */}
                <button
                  onClick={dismissMiniPopup}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0 mt-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Button
                size="sm"
                className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => { dismissMiniPopup(); setIsCartOpen(true); }}
              >
                <ShoppingCart className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'عرض السلة' : 'View Cart'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
