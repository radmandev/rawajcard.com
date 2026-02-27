import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/supabaseAPI';
import { Store, ShoppingCart, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PublicMobileBar — a phone-only fixed bottom bar shown on public pages
 * (TestLanding, Home, Products, Pricing, Store).
 * Shows: Store link | Cart (with count) | Login / Dashboard+Logout
 */
export default function PublicMobileBar() {
  const { isRTL, t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Cart count (authenticated only)
  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.entities.CartItem.list(),
    enabled: isAuthenticated,
  });
  const cartCount = cartItems.length;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  return (
    // Only visible on mobile (md and below)
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="flex items-stretch justify-around h-16">

          {/* ── Store ─────────────────────────────────── */}
          <Link
            to={createPageUrl('Store')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 flex-1 transition-colors',
              isActive(createPageUrl('Store'))
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            <Store className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{isRTL ? 'المتجر' : 'Store'}</span>
          </Link>

          {/* ── Cart ──────────────────────────────────── */}
          <Link
            to={createPageUrl('Store')}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 flex-1 transition-colors',
              isActive(createPageUrl('Checkout'))
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center shadow"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="text-[10px] font-semibold">{isRTL ? 'السلة' : 'Cart'}</span>
          </Link>

          {/* ── Auth ──────────────────────────────────── */}
          {isAuthenticated ? (
            <>
              {/* Dashboard shortcut */}
              <button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{isRTL ? 'لوحتي' : 'Dashboard'}</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => logout()}
                className="flex flex-col items-center justify-center gap-1 flex-1 text-red-400 dark:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{isRTL ? 'خروج' : 'Logout'}</span>
              </button>
            </>
          ) : (
            /* Login — full-width accent pill */
            <button
              onClick={() => navigate(createPageUrl('Login'))}
              className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <LogIn className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{isRTL ? 'تسجيل الدخول' : 'Login'}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
