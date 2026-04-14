import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Menu, X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';

export default function Header({ onMenuToggle, isMenuOpen, cartCount = 0 }) {
  const { lang, setLang, t, isRTL } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => api.auth.me() });
  const homePage = user?.role === 'admin' ? 'Admin' : 'Dashboard';

  // Determine if we're on a child route
  const childRoutes = ['/card-builder', '/client-details', '/analytics', '/checkout'];
  const isChildRoute = childRoutes.some(route => location.pathname.includes(route)) || location.search.includes('id=');

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 h-16",
      "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl",
      "border-b border-slate-200/50 dark:border-slate-700/50"
    )}>
      <div className="h-full px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo or Back Button */}
        {isChildRoute ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        ) : (
          <Link to={createPageUrl(homePage)} className="flex items-center gap-3">
            <img 
              src="/rawajcard-logo.png"
              alt="Rawajcard"
              className="h-10 w-10 object-contain"
            />
            <span className={cn(
              "text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent",
              "hidden sm:block"
            )}>
              Rawajcard
            </span>
          </Link>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link to={createPageUrl('Store')}>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Language Toggle with Flags */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {lang === 'en' ? (
              <>
                <span className="text-xl">🇺🇸</span>
                <span className="text-sm font-medium hidden sm:inline">EN</span>
              </>
            ) : (
              <>
                <span className="text-xl">🇸🇦</span>
                <span className="text-sm font-medium hidden sm:inline">AR</span>
              </>
            )}
          </button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onMenuToggle}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}