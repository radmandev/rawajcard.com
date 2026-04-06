import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, Moon, Sun, ShoppingCart, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useTheme } from '@/components/shared/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { productsData, productCategories } from '@/components/shared/productsData';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/supabaseAPI';

const productItems = {
  categories: productCategories.map(cat => ({
    icon: cat.icon,
    label: cat.label_en,
    labelAr: cat.label_ar,
    value: cat.value
  })).filter(cat => cat.value !== 'all'),
  freeTools: [
    {
      icon: "🔗",
      label: "QR Code Generator",
      labelAr: "مولد رمز QR",
      description: "Generate custom QR codes for free",
      descriptionAr: "إنشاء رموز QR مخصصة مجاناً",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6976201166a3bf5a05c8ac09/0e43eb66a_2026-01-2694340.png"
    },
    {
      icon: "✉️",
      label: "Email Signature Generator",
      labelAr: "مولد توقيع البريد الإلكتروني",
      description: "Generate custom email signatures for free",
      descriptionAr: "إنشاء توقيعات بريد إلكتروني مخصصة مجاناً",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6976201166a3bf5a05c8ac09/0e43eb66a_2026-01-2694340.png"
    },
    {
      icon: "🎨",
      label: "Virtual Background Generator",
      labelAr: "مولد الخلفية الافتراضية",
      description: "Generate custom virtual backgrounds for free",
      descriptionAr: "إنشاء خلفيات افتراضية مخصصة مجاناً",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6976201166a3bf5a05c8ac09/0e43eb66a_2026-01-2694340.png"
    }
  ]
};

const navItems = [
  { 
    label: "Products", 
    labelAr: "المنتجات",
    hasDropdown: true,
    type: "product"
  },
  {
    label: "Free Tools",
    labelAr: "أدوات مجانية",
    hasDropdown: true,
    type: "freetools"
  },
  { label: "Card Samples", labelAr: "نماذج البطاقات", hasDropdown: false, path: createPageUrl('CardSamples') },
  { label: "NFC Cards", labelAr: "بطاقات NFC", hasDropdown: false, path: '/Products' },
];

const translations = {
  en: {
    logoSubtext1: "Your digital",
    logoSubtext2: "business card",
    logoSubtext3: "platform.",
    createCard: "Create your card"
  },
  ar: {
    logoSubtext1: "منصة بطاقة",
    logoSubtext2: "الأعمال",
    logoSubtext3: "الرقمية الخاصة بك.",
    createCard: "أنشئ بطاقتك"
  }
};

export default function Navbar({ onLoginClick } = {}) {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showFreeTools, setShowFreeTools] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ── Shared app contexts ────────────────────────────────────
  const { isAuthenticated } = useAuth();
  const { lang, setLang, isRTL } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Use lang from shared context (maps 'en'/'ar' to component labels)
  const language = lang;

  // Cart from global context (works for guests & authenticated users)
  const { totalCount: cartCount, setIsCartOpen } = useCart();
  const { data: me } = useQuery({ queryKey: ['current-user'], queryFn: () => api.auth.me(), enabled: isAuthenticated });
  const mainAppPage = me?.role === 'admin' ? 'Admin' : 'Dashboard';

  // Use local products data
  const displayedProducts = selectedCategory
    ? productsData
        .filter(p => p.category === selectedCategory)
        .slice(0, 6)
    : productsData
        .filter(p => p.discount_percentage > 0)
        .sort((a, b) => b.discount_percentage - a.discount_percentage)
        .slice(0, 6);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ANNOUNCEMENT_H = 44; // approximate announcement bar height
  const navTop = Math.max(0, ANNOUNCEMENT_H - scrollY);
  const isScrolled = scrollY > 20;

  return (
    <nav
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg shadow-slate-900/5' 
          : 'bg-transparent'
      }`}
      style={{ top: `${navTop}px` }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_6962369d7645fd9abc56cb8f/9f16258e0_Rawajcard.png" 
              alt="Rawajcard" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => {
                  if (closeTimeout) clearTimeout(closeTimeout);
                  if (item.hasDropdown) setActiveDropdown(index);
                  setShowFreeTools(false);
                }}
                onMouseLeave={() => {
                  if (item.hasDropdown) {
                    const timeout = setTimeout(() => setActiveDropdown(null), 150);
                    setCloseTimeout(timeout);
                  }
                }}
              >
                <button
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => { if (!item.hasDropdown && item.path) navigate(item.path); }}
                >
                  {language === 'ar' ? item.labelAr : item.label}
                  {item.hasDropdown && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === index ? 'rotate-180' : ''}`} />
                  )}
                </button>
                
                {/* Product Dropdown with Images */}
                {item.hasDropdown && activeDropdown === index && item.type === 'product' && (
                  <div className="absolute top-full ltr:left-0 rtl:right-0 mt-0 pt-2 w-[900px]">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="flex rtl:flex-row-reverse" dir="ltr">
                        {/* Left Sidebar */}
                        <div className="w-48 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4">
                        <button
                          onClick={() => { navigate('/Products'); setActiveDropdown(null); }}
                          onMouseEnter={() => setSelectedCategory(null)}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-bold hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors mb-4 ${
                            selectedCategory === null 
                              ? 'text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-700' 
                              : 'text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <span className="text-xl">🛍️</span>
                          {language === 'ar' ? 'جميع المنتجات' : 'All Products'}
                        </button>
                        {productItems.categories.map((category, idx) => (
                          <button
                            key={idx}
                            onClick={() => { navigate(`/Products?category=${category.value}`); setActiveDropdown(null); }}
                            onMouseEnter={() => setSelectedCategory(category.value)}
                            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors mb-2 ${
                              selectedCategory === category.value 
                                ? 'text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-700' 
                                : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span className="text-xl">{category.icon}</span>
                            {language === 'ar' ? category.labelAr : category.label}
                            <ChevronDown className="w-4 h-4 ml-auto -rotate-90" />
                          </button>
                        ))}
                        </div>

                        {/* Right Grid - Top Products Only */}
                        <div className="flex-1 p-6 overflow-y-auto max-h-[600px]">
                          {/* Top Products Section */}
                          <div className="mb-8">
                            <div className="mb-4">
                              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {selectedCategory 
                                  ? (language === 'ar' 
                                      ? productItems.categories.find(c => c.value === selectedCategory)?.labelAr 
                                      : productItems.categories.find(c => c.value === selectedCategory)?.label)
                                  : (language === 'ar' ? 'المنتجات الأكثر طلباً' : 'Most Popular Products')}
                              </h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                            {displayedProducts.map((product, idx) => (
                              <Link
                                key={idx}
                                to={`/ProductDetail?id=${product.id}`}
                                onClick={() => setActiveDropdown(null)}
                                className="group block rounded-lg overflow-hidden hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700"
                              >
                                <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                                  <img 
                                    src={product.image_url} 
                                    alt={language === 'ar' ? product.name_ar : product.name_en}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  {product.discount_percentage > 0 && (
                                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                      -{product.discount_percentage}%
                                    </div>
                                  )}
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-900">
                                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1 line-clamp-1">
                                    {language === 'ar' ? product.name_ar : product.name_en}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                                      {product.price} {language === 'ar' ? 'ر.س' : 'SAR'}
                                    </span>
                                    {product.original_price && (
                                      <span className="text-xs text-slate-400 line-through">
                                        {product.original_price}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                            </div>
                            {displayedProducts.length === 0 && (
                              <div className="text-center py-8 text-slate-400">
                                {language === 'ar' ? 'لا توجد منتجات متاحة' : 'No products available'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Free Tools Dropdown */}
                {item.hasDropdown && activeDropdown === index && item.type === 'freetools' && (
                  <div className="absolute top-full ltr:left-0 rtl:right-0 mt-0 pt-2 w-[700px]">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
                      <div className="grid grid-cols-3 gap-4">
                        {productItems.freeTools.map((tool, idx) => (
                          <a
                            key={idx}
                            href="#"
                            className="group block rounded-lg overflow-hidden hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900"
                          >
                            <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                              <img
                                src={tool.image}
                                alt={language === 'ar' ? tool.labelAr : tool.label}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-3">
                              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                                {language === 'ar' ? tool.labelAr : tool.label}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {language === 'ar' ? tool.descriptionAr : tool.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular Dropdown */}
                {item.hasDropdown && activeDropdown === index && item.type !== 'product' && item.type !== 'freetools' && (
                  <div className="absolute top-full ltr:left-0 rtl:right-0 mt-0 pt-2 w-48">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-900/10 border border-slate-100 dark:border-slate-700 overflow-hidden">
                      {(language === 'ar' ? item.itemsAr : item.items).map((subItem, subIndex) => (
                      <a
                        key={subIndex}
                        href="#"
                        className="block px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        {subItem}
                      </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Cart icon with badge */}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>

            {/* Language selector (desktop) */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  language === 'en' 
                    ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ar')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  language === 'ar' 
                    ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                عربي
              </button>
            </div>

            {/* Auth CTA */}
            <Button 
              className="hidden md:inline-flex bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600 text-white rounded-full px-6 shadow-lg shadow-teal-500/20"
              onClick={() => isAuthenticated ? navigate(createPageUrl(mainAppPage)) : (onLoginClick ? onLoginClick() : navigate(createPageUrl('Login')))}
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              {isAuthenticated
                ? (me?.role === 'admin'
                    ? (language === 'ar' ? 'لوحة المسؤول' : 'Admin Panel')
                    : (language === 'ar' ? 'لوحة التحكم' : 'Dashboard'))
                : translations[language].createCard}
            </Button>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navItems.map((item, index) => (
              item.type === 'product' ? (
                <div key={index}>
                  <button
                    className="w-full text-left py-3 px-3 text-slate-700 dark:text-slate-200 font-medium hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between"
                    onClick={() => { navigate('/Products'); setMobileMenuOpen(false); }}
                  >
                    {language === 'ar' ? item.labelAr : item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="ml-4 mt-1 space-y-1">
                    {productItems.categories.map((cat, ci) => (
                      <button
                        key={ci}
                        className="w-full text-left py-2 px-3 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg flex items-center gap-2"
                        onClick={() => { navigate(`/Products?category=${cat.value}`); setMobileMenuOpen(false); }}
                      >
                        <span>{cat.icon}</span>
                        {language === 'ar' ? cat.labelAr : cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  key={index}
                  href="#"
                  className="block py-3 px-3 text-slate-700 dark:text-slate-200 font-medium hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  onClick={(e) => { e.preventDefault(); if (item.path) navigate(item.path); setMobileMenuOpen(false); }}
                >
                  {language === 'ar' ? item.labelAr : item.label}
                </a>
              )
            ))}

            {/* Language toggle row */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setLang('en')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  language === 'en'
                    ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >EN</button>
              <button
                onClick={() => setLang('ar')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  language === 'ar'
                    ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >عربي</button>
            </div>

            {/* Auth CTA */}
            <div className="pt-2">
              <Button
                className="w-full bg-gradient-to-r from-teal-600 to-blue-500 text-white rounded-full"
                onClick={() => { isAuthenticated ? navigate(createPageUrl(mainAppPage)) : (onLoginClick ? onLoginClick() : navigate(createPageUrl('Login'))); setMobileMenuOpen(false); }}
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                {isAuthenticated
                  ? (me?.role === 'admin'
                      ? (language === 'ar' ? 'لوحة المسؤول' : 'Admin Panel')
                      : (language === 'ar' ? 'لوحة التحكم' : 'Dashboard'))
                  : translations[language].createCard}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}