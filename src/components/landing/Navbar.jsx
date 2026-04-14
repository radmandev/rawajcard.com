import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Menu, X, ShoppingCart, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { productsData, productCategories } from '@/components/shared/productsData';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/supabaseAPI';
import { ALL_TEMPLATES } from '@/lib/templateConfig';
import { createTemplateSampleUrl, SAMPLE_CARD_DATA } from '@/lib/templateSampleCards';
import CardPreview from '@/components/cards/CardPreview';


const productItems = {
  categories: productCategories.map(cat => ({
    icon: cat.icon,
    label: cat.label_en,
    labelAr: cat.label_ar,
    value: cat.value
  })).filter(cat => cat.value !== 'all'),
  freeTools: [
    {
      icon: "�",
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
  { label: "NFC Physical Cards", labelAr: "بطاقات NFC الملموسة", hasDropdown: true, type: 'nfc-physical', path: '/Products', mobileHidden: true },
  { label: "Digital Card Samples", labelAr: "نماذج البطاقات الرقمية", hasDropdown: true, type: 'card-samples', path: createPageUrl('CardSamples') },
  { label: "How It Works?", labelAr: "كيف يعمل؟", hasDropdown: true, type: 'how-it-works', path: '/#how-it-works' },
  { label: "Pricing", labelAr: "الأسعار", hasDropdown: true, type: 'pricing', path: createPageUrl('Pricing') },
  // { label: "NFC Cards", labelAr: "بطاقات NFC", hasDropdown: false, path: '/Products' },
];

const productQuickLinks = [
  {
    icon: '📱',
    label: 'Digital Business Card',
    labelAr: 'بطاقة الأعمال الرقمية',
    path: createPageUrl('Dashboard')
  },
  {
    icon: '🌐',
    label: 'Digital business landing pages',
    labelAr: 'صفحات هبوط رقمية للأعمال',
    path: createPageUrl('Dashboard')
  }
];

const howItWorksSteps = {
  en: [
    { step: 1, icon: '💳', title: 'Order Your Card', desc: 'Choose your favorite NFC card design and customize it with your branding.' },
    { step: 2, icon: '⚙️', title: 'Set Up Your Profile', desc: 'Add your contact info, social links, and bio using our free platform.' },
    { step: 3, icon: '📲', title: 'Tap & Connect', desc: 'Tap your card or share your QR code to exchange info instantly.' },
    { step: 4, icon: '📊', title: 'Track What Works', desc: 'See who viewed your profile, what they clicked, and follow up smart.' },
  ],
  ar: [
    { step: 1, icon: '💳', title: 'اطلب بطاقتك', desc: 'اختر تصميم بطاقة NFC المفضل لديك وخصصه بعلامتك التجارية.' },
    { step: 2, icon: '⚙️', title: 'أعد ملفك الشخصي', desc: 'أضف معلومات التواصل والروابط والنبذة عبر منصتنا المجانية.' },
    { step: 3, icon: '📲', title: 'اضغط واتصل', desc: 'اضغط على بطاقتك أو شارك رمز QR لتبادل المعلومات فوراً.' },
    { step: 4, icon: '📊', title: 'تتبّع ما يُجدي', desc: 'اعرف من شاهد ملفك، ماذا نقروا، وتابع بذكاء.' },
  ],
};

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

export default function Navbar({ hideFreeTools = false, logoPath = '/' } = {}) {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [pinnedDropdown, setPinnedDropdown] = useState(null);
  const closeTimeoutRef = useRef(null);
  const navRef = useRef(null);
  const navContainerRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredQuickLink, setHoveredQuickLink] = useState(null);

  // ── Shared app contexts ────────────────────────────────────
  const { isAuthenticated } = useAuth();
  const { lang, setLang } = useLanguage();
  const navigate = useNavigate();

  // Use lang from shared context (maps 'en'/'ar' to component labels)
  const language = lang;

  // Cart from global context (works for guests & authenticated users)
  const { totalCount: cartCount, setIsCartOpen } = useCart();
  const { data: me } = useQuery({ queryKey: ['current-user'], queryFn: () => api.auth.me(), enabled: isAuthenticated });
  const mainAppPage = me?.role === 'admin' ? 'Admin' : 'Dashboard';
  const visibleNavItems = hideFreeTools ? navItems.filter(item => item.type !== 'freetools') : navItems;

  // Use local products data
  const displayedProducts = selectedCategory
    ? productsData
        .filter(p => p.category === selectedCategory)
        .slice(0, 6)
    : productsData
        .filter(p => p.discount_percentage > 0)
        .sort((a, b) => b.discount_percentage - a.discount_percentage)
        .slice(0, 6);

  // Clear any pending close timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (activeDropdown === null) return;
    const handleClickOutside = (e) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target)) {
        setPinnedDropdown(null);
        setActiveDropdown(null);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setPinnedDropdown(null);
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeDropdown]);

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
      ref={navContainerRef}
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg shadow-slate-900/5' 
          : 'bg-transparent'
      }`}
      style={{ top: `${navTop}px` }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between min-h-20 py-3 gap-3" dir="ltr">

          {/* Side A: actions (language, cart) */}
          <div className="flex flex-1 items-center gap-2 md:gap-3 justify-end lg:order-3">
            {/* Cart icon with badge */}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
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
          </div>

          {/* Center: Logo */}
          <div className="flex items-center justify-center shrink-0 px-2 lg:order-2">
            <Link to={logoPath} className="flex items-center gap-3">
              <img
                src="/rawajcard-logo.png"
                alt="Rawajcard"
                className="h-10 w-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]"
              />
            </Link>
          </div>

          {/* Side B: CTA buttons */}
          <div className="flex flex-1 items-center gap-2 md:gap-3 justify-start lg:order-1">
            {/* Auth CTAs */}
            <div className="hidden md:flex items-center gap-2">
              <button
                className="group h-10 rounded-full px-5 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-500 hover:via-cyan-500 hover:to-teal-600 border border-white/20 shadow-[0_8px_28px_-10px_rgba(13,148,136,0.85)] hover:shadow-[0_14px_36px_-12px_rgba(6,182,212,0.85)] transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => navigate('/Products')}
              >
                <span className="flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4" />
                  {language === 'ar' ? 'اشتر بطاقة NFC' : 'Buy NFC Card'}
                </span>
              </button>
              <button
                className="group h-10 rounded-full px-5 text-sm font-semibold text-white bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 dark:from-slate-100 dark:to-white dark:text-slate-900 dark:hover:from-white dark:hover:to-slate-100 border border-slate-700/40 dark:border-slate-200 shadow-[0_8px_28px_-10px_rgba(15,23,42,0.78)] transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => navigate(createPageUrl('Dashboard'))}
              >
                <span className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  {language === 'ar' ? 'أنشئ بطاقة رقمية' : 'Create Digital Card'}
                </span>
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation - moved below top setup */}
        <div ref={navRef} className="hidden lg:flex items-center justify-center gap-1 pb-3">
            {visibleNavItems.map((item, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => {
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current);
                    closeTimeoutRef.current = null;
                  }
                  if (item.hasDropdown) setActiveDropdown(index);
                }}
                onMouseLeave={() => {
                  if (item.hasDropdown && pinnedDropdown !== index) {
                    closeTimeoutRef.current = setTimeout(() => {
                      setActiveDropdown((cur) => (cur === index ? null : cur));
                    }, 400);
                  }
                }}
              >
                <button
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    activeDropdown === index
                      ? 'text-teal-600 dark:text-teal-400 bg-slate-50 dark:bg-slate-800'
                      : 'text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => {
                    if (item.hasDropdown) {
                      if (pinnedDropdown === index) {
                        // Unpin and close
                        setPinnedDropdown(null);
                        setActiveDropdown(null);
                      } else {
                        // Pin open (keep dropdown visible)
                        setPinnedDropdown(index);
                        setActiveDropdown(index);
                      }
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
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
                          onMouseEnter={() => { setSelectedCategory(null); setHoveredQuickLink(null); }}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-bold hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors mb-4 ${language === 'ar' ? 'flex-row-reverse text-right' : ''} ${
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
                            onMouseEnter={() => { setSelectedCategory(category.value); setHoveredQuickLink(null); }}
                            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors mb-2 ${language === 'ar' ? 'flex-row-reverse text-right' : ''} ${
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
                        {productQuickLinks.map((link, idx) => (
                          <button
                            key={`quick-${idx}`}
                            onClick={() => { navigate(link.path); setActiveDropdown(null); }}
                            onMouseEnter={() => {
                              if (link.icon === '📱') {
                                setHoveredQuickLink('digital-card');
                                setSelectedCategory(null);
                              } else {
                                setHoveredQuickLink(null);
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors mb-2 ${language === 'ar' ? 'flex-row-reverse text-right' : ''} ${
                              hoveredQuickLink === 'digital-card' && link.icon === '📱'
                                ? 'text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-700'
                                : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span className="text-xl">{link.icon}</span>
                            {language === 'ar' ? link.labelAr : link.label}
                          </button>
                        ))}
                        </div>

                        {/* Right Grid - Products or Digital Card Samples */}
                        <div className="flex-1 p-6 overflow-y-auto max-h-[600px]">
                          {hoveredQuickLink === 'digital-card' ? (
                            /* ── Digital Card Samples Panel ── */
                            <div>
                              <div className="mb-4">
                                <h3 className={`text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                  {language === 'ar' ? 'نماذج البطاقات الرقمية' : 'Digital Card Samples'}
                                </h3>
                                <p className={`text-xs text-slate-400 dark:text-slate-500 mt-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                  {language === 'ar' ? 'مرر على القالب لمعاينته، واضغط لفتح النموذج' : 'Hover to preview, click to open sample'}
                                </p>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                {ALL_TEMPLATES.slice(0, 9).map((tmpl) => (
                                  <Link
                                    key={tmpl.id}
                                    to={createTemplateSampleUrl(tmpl, language)}
                                    onClick={() => setActiveDropdown(null)}
                                    className="group block rounded-xl overflow-hidden hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:ring-2 hover:ring-teal-400/30"
                                  >
                                    {/* Miniature Card Preview */}
                                    <div className="aspect-[3/4] overflow-hidden relative" dir="ltr">
                                      <div className="w-full h-full transform scale-[0.25] origin-top-left" style={{ width: '400%', height: '400%' }}>
                                        <CardPreview
                                          card={SAMPLE_CARD_DATA}
                                          template={tmpl.id}
                                          showPlaceholder={false}
                                          onLinkClick={() => {}}
                                          onCardChange={() => {}}
                                        />
                                      </div>
                                      {/* Hover overlay */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3">
                                        <span className="text-white text-xs font-semibold bg-teal-600/90 px-2.5 py-1 rounded-full">
                                          {language === 'ar' ? 'معاينة ←' : 'Preview →'}
                                        </span>
                                      </div>
                                      {/* Tier badge */}
                                      {tmpl.defaultTier === 'premium' && (
                                        <div className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                                          PRO
                                        </div>
                                      )}
                                    </div>
                                    <div className={`px-2 py-2 bg-white dark:bg-slate-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                                        {language === 'ar' ? tmpl.nameAr : tmpl.name}
                                      </p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                              {/* View all link */}
                              <div className={`mt-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                <Link
                                  to={createPageUrl('CardSamples')}
                                  onClick={() => setActiveDropdown(null)}
                                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                                >
                                  {language === 'ar' ? 'عرض جميع النماذج' : 'View all samples'}
                                  <span className="text-lg">{language === 'ar' ? '←' : '→'}</span>
                                </Link>
                              </div>
                            </div>
                          ) : (
                            /* ── Products Grid (default) ── */
                            <div className="mb-8">
                              <div className="mb-4">
                                <h3 className={`text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
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
                                  to={`/products/${encodeURIComponent(product.slug || product.id)}`}
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
                                      <div className={`absolute top-2 ${language === 'ar' ? 'left-2' : 'right-2'} bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold`}>
                                        -{product.discount_percentage}%
                                      </div>
                                    )}
                                  </div>
                                  <div className={`p-3 bg-white dark:bg-slate-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1 line-clamp-1">
                                      {language === 'ar' ? product.name_ar : product.name_en}
                                    </h3>
                                    <div className={`flex items-center gap-2 ${language === 'ar' ? 'justify-end flex-row-reverse' : ''}`}>
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
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NFC Physical Cards Dropdown */}
                {item.hasDropdown && activeDropdown === index && item.type === 'nfc-physical' && (
                  <div className="absolute top-full ltr:left-0 rtl:right-0 mt-0 pt-2 w-[900px]">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="flex rtl:flex-row-reverse" dir="ltr">
                        {/* Left Sidebar - Categories only (no digital links) */}
                        <div className="w-48 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4">
                          <button
                            onClick={() => { navigate('/Products'); setActiveDropdown(null); }}
                            onMouseEnter={() => setSelectedCategory(null)}
                            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-bold hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors mb-4 ${language === 'ar' ? 'flex-row-reverse text-right' : ''} ${
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
                              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors mb-2 ${language === 'ar' ? 'flex-row-reverse text-right' : ''} ${
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

                        {/* Right Grid - Products */}
                        <div className="flex-1 p-6 overflow-y-auto max-h-[600px]">
                          <div className="mb-8">
                            <div className="mb-4">
                              <h3 className={`text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
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
                                  to={`/products/${encodeURIComponent(product.slug || product.id)}`}
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
                                      <div className={`absolute top-2 ${language === 'ar' ? 'left-2' : 'right-2'} bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold`}>
                                        -{product.discount_percentage}%
                                      </div>
                                    )}
                                  </div>
                                  <div className={`p-3 bg-white dark:bg-slate-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1 line-clamp-1">
                                      {language === 'ar' ? product.name_ar : product.name_en}
                                    </h3>
                                    <div className={`flex items-center gap-2 ${language === 'ar' ? 'justify-end flex-row-reverse' : ''}`}>
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

                {/* Card Samples Dropdown */}
                {item.hasDropdown && activeDropdown === index && item.type === 'card-samples' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 w-[680px]">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden p-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {language === 'ar' ? 'نماذج البطاقات الرقمية' : 'Digital Card Samples'}
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {language === 'ar' ? 'اضغط على أي نموذج لمعاينته' : 'Click any sample to preview it'}
                          </p>
                        </div>
                        <Link
                          to={createPageUrl('CardSamples')}
                          onClick={() => setActiveDropdown(null)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors whitespace-nowrap"
                        >
                          {language === 'ar' ? 'عرض الكل' : 'View all'}
                          <span>{language === 'ar' ? '←' : '→'}</span>
                        </Link>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {ALL_TEMPLATES.slice(0, 8).map((tmpl) => (
                          <Link
                            key={tmpl.id}
                            to={createTemplateSampleUrl(tmpl, language)}
                            onClick={() => setActiveDropdown(null)}
                            className="group block rounded-xl overflow-hidden hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:ring-2 hover:ring-teal-400/30"
                          >
                            <div className="aspect-[3/4] overflow-hidden relative bg-slate-50 dark:bg-slate-800" dir="ltr">
                              <div className="w-full h-full transform scale-[0.25] origin-top-left" style={{ width: '400%', height: '400%' }}>
                                <CardPreview
                                  card={SAMPLE_CARD_DATA}
                                  template={tmpl.id}
                                  showPlaceholder={false}
                                  onLinkClick={() => {}}
                                  onCardChange={() => {}}
                                />
                              </div>
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3">
                                <span className="text-white text-[11px] font-semibold bg-teal-600/90 px-2.5 py-1 rounded-full">
                                  {language === 'ar' ? 'معاينة' : 'Preview'}
                                </span>
                              </div>
                              {tmpl.defaultTier === 'premium' && (
                                <div className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                                  PRO
                                </div>
                              )}
                            </div>
                            <div className={`px-2 py-1.5 bg-white dark:bg-slate-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {language === 'ar' ? tmpl.nameAr : tmpl.name}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* How It Works Dropdown */}
                {item.hasDropdown && activeDropdown === index && item.type === 'how-it-works' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 w-[600px]">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className={`text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {language === 'ar' ? 'ابدأ' : 'Get Started'}
                          </p>
                          <h3 className={`text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {language === 'ar' ? '4 خطوات بسيطة للبداية' : '4 Simple Steps to Get Started'}
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            setActiveDropdown(null);
                            navigate('/');
                            setTimeout(() => {
                              const el = document.getElementById('how-it-works');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }, 300);
                          }}
                          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors whitespace-nowrap"
                        >
                          {language === 'ar' ? 'عرض الكل' : 'See full section'} {language === 'ar' ? '←' : '→'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {(language === 'ar' ? howItWorksSteps.ar : howItWorksSteps.en).map((s) => (
                          <div
                            key={s.step}
                            className={`flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
                              <span className="text-lg">{s.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`flex items-center gap-1.5 mb-0.5 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/40 px-1.5 py-0.5 rounded">
                                  {s.step}
                                </span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                  {s.title}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                {s.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* CTA row */}
                      <div className={`mt-4 flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <button
                          onClick={() => { navigate('/Products'); setActiveDropdown(null); }}
                          className="flex-1 h-9 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-md transition-all"
                        >
                          {language === 'ar' ? 'اطلب بطاقتك الآن' : 'Order Your Card Now'}
                        </button>
                        <button
                          onClick={() => { navigate(createPageUrl('Dashboard')); setActiveDropdown(null); }}
                          className="flex-1 h-9 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all"
                        >
                          {language === 'ar' ? 'أنشئ بطاقة رقمية مجاناً' : 'Create Free Digital Card'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Dropdown */}
                {item.hasDropdown && activeDropdown === index && item.type === 'pricing' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 w-[540px]">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {/* Header */}
                      <div className="p-5 pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className={`text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              {language === 'ar' ? 'أسعار المنصة الرقمية' : 'Digital Platform Pricing'}
                            </p>
                            <h3 className={`text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              {language === 'ar' ? 'خطط اشتراك البطاقة الرقمية' : 'Digital Card Subscription Plans'}
                            </h3>
                          </div>
                          <button
                            onClick={() => { navigate(createPageUrl('Pricing')); setActiveDropdown(null); }}
                            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors whitespace-nowrap"
                          >
                            {language === 'ar' ? 'عرض التفاصيل' : 'View details'} {language === 'ar' ? '←' : '→'}
                          </button>
                        </div>
                      </div>

                      {/* Plans grid */}
                      <div className="p-5 pt-4">
                        <div className={`grid grid-cols-3 gap-3 ${language === 'ar' ? 'direction-rtl' : ''}`}>
                          {/* Free */}
                          <div className={`rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div className="text-lg mb-1">🆓</div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'مجاني' : 'Free'}</p>
                            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                              {language === 'ar' ? '0 ر.س' : 'SAR 0'}
                              <span className="text-[10px] font-medium text-slate-400">/{language === 'ar' ? 'شهر' : 'mo'}</span>
                            </p>
                            <ul className={`mt-2 space-y-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              <li className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : ''}">
                                <span className="text-teal-500 text-xs">✓</span> {language === 'ar' ? 'بطاقتين رقميتين' : '2 Digital Cards'}
                              </li>
                              <li className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : ''}">
                                <span className="text-teal-500 text-xs">✓</span> {language === 'ar' ? 'قوالب أساسية' : 'Basic Templates'}
                              </li>
                              <li className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : ''}">
                                <span className="text-teal-500 text-xs">✓</span> {language === 'ar' ? 'رمز QR' : 'QR Code'}
                              </li>
                            </ul>
                          </div>
                          {/* Premium */}
                          <div className={`rounded-xl border-2 border-teal-500 dark:border-teal-400 p-3.5 relative bg-teal-50/50 dark:bg-teal-900/20 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                              <span className="text-[9px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                                {language === 'ar' ? 'الأكثر شعبية' : 'POPULAR'}
                              </span>
                            </div>
                            <div className="text-lg mb-1">⭐</div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'بريميوم' : 'Premium'}</p>
                            <p className="text-lg font-extrabold text-teal-600 dark:text-teal-400 mt-1">
                              {language === 'ar' ? '19 ر.س' : 'SAR 19'}
                              <span className="text-[10px] font-medium text-slate-400">/{language === 'ar' ? 'شهر' : 'mo'}</span>
                            </p>
                            <ul className={`mt-2 space-y-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              <li className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : ''}">
                                <span className="text-teal-500 text-xs">✓</span> {language === 'ar' ? '5 بطاقات رقمية' : '5 Digital Cards'}
                              </li>
                              <li className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : ''}">
                                <span className="text-teal-500 text-xs">✓</span> {language === 'ar' ? 'جميع القوالب' : 'All Templates'}
                              </li>
                              <li className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : ''}">
                                <span className="text-teal-500 text-xs">✓</span> {language === 'ar' ? 'تحليلات متقدمة' : 'Analytics + CRM'}
                              </li>
                            </ul>
                          </div>
                          {/* Teams */}
                          <div className={`rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div className="text-lg mb-1">🏢</div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'الفرق' : 'Teams'}</p>
                            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                              {language === 'ar' ? '49 ر.س' : 'SAR 49'}
                              <span className="text-[10px] font-medium text-slate-400">/{language === 'ar' ? 'شهر' : 'mo'}</span>
                            </p>
                            <ul className={`mt-2 space-y-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              <li className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : ''}">
                                <span className="text-teal-500 text-xs">✓</span> {language === 'ar' ? '10 بطاقات رقمية' : '10 Digital Cards'}
                              </li>
                              <li className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : ''}">
                                <span className="text-teal-500 text-xs">✓</span> {language === 'ar' ? 'إدارة الفريق' : 'Team Management'}
                              </li>
                              <li className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : ''}">
                                <span className="text-teal-500 text-xs">✓</span> {language === 'ar' ? 'تخصيص كامل' : 'Full Customization'}
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Compare all plans CTA */}
                        <button
                          onClick={() => { navigate(createPageUrl('Pricing')); setActiveDropdown(null); }}
                          className="w-full mt-3 h-9 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-md transition-all"
                        >
                          {language === 'ar' ? 'قارن جميع الخطط' : 'Compare All Plans'}
                        </button>
                      </div>

                      {/* NFC Store Banner */}
                      <div
                        onClick={() => { navigate('/Products'); setActiveDropdown(null); }}
                        className={`mx-5 mb-5 p-3.5 rounded-xl bg-gradient-to-r ${language === 'ar' ? 'from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20' : 'from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20'} border-2 border-dashed border-amber-300 dark:border-amber-600/50 cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-colors group`}
                      >
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                            <span className="text-lg">🛍️</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                              {language === 'ar' ? 'تبحث عن أسعار بطاقات NFC الملموسة؟' : 'Looking for NFC card prices?'}
                            </p>
                            <p className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-0.5">
                              {language === 'ar' ? 'الأسعار أعلاه للمنصة الرقمية فقط. اذهب للمتجر لعرض أسعار البطاقات.' : 'The prices above are for the digital platform only. Visit the store for NFC card pricing.'}
                            </p>  
                          </div>
                          <div className={`flex-shrink-0 ${language === 'ar' ? '' : ''}`}>
                            <span className="text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform inline-block">
                              {language === 'ar' ? '← المتجر' : 'Store →'}
                            </span>
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
                {item.hasDropdown && activeDropdown === index && item.type !== 'product' && item.type !== 'freetools' && item.type !== 'card-samples' && item.type !== 'how-it-works' && item.type !== 'pricing' && item.type !== 'nfc-physical' && (
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
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {visibleNavItems.map((item, index) => (
              item.mobileHidden ? null : item.type === 'product' ? (
                <div key={index}>
                  <button
                    className="w-full text-left py-3 px-3 text-slate-700 dark:text-slate-200 font-medium hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between"
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(prev => prev === index ? null : index); }}
                  >
                    {language === 'ar' ? item.labelAr : item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === index ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === index && (
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
                    {productQuickLinks.map((link, li) => (
                      <button
                        key={`mobile-quick-${li}`}
                        className="w-full text-left py-2 px-3 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg flex items-center gap-2"
                        onClick={() => { navigate(link.path); setMobileMenuOpen(false); setActiveDropdown(null); }}
                      >
                        <span>{link.icon}</span>
                        {language === 'ar' ? link.labelAr : link.label}
                      </button>
                    ))}
                  </div>
                  )}
                </div>
              ) : item.type === 'nfc-physical' ? (
                <div key={index}>
                  <button
                    className="w-full text-left py-3 px-3 text-slate-700 dark:text-slate-200 font-medium hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between"
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(prev => prev === index ? null : index); }}
                  >
                    {language === 'ar' ? item.labelAr : item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === index ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === index && (
                    <div className="ml-4 mt-1 space-y-1">
                      <button
                        className="w-full text-left py-2 px-3 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg flex items-center gap-2"
                        onClick={() => { navigate('/Products'); setMobileMenuOpen(false); setActiveDropdown(null); }}
                      >
                        <span>🛍️</span>
                        {language === 'ar' ? 'جميع المنتجات' : 'All Products'}
                      </button>
                      {productItems.categories.map((cat, ci) => (
                        <button
                          key={ci}
                          className="w-full text-left py-2 px-3 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg flex items-center gap-2"
                          onClick={() => { navigate(`/Products?category=${cat.value}`); setMobileMenuOpen(false); setActiveDropdown(null); }}
                        >
                          <span>{cat.icon}</span>
                          {language === 'ar' ? cat.labelAr : cat.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={index}
                  href="#"
                  className="block py-3 px-3 text-slate-700 dark:text-slate-200 font-medium hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    if (item.path) {
                      if (item.path.includes('#')) {
                        const [basePath, hash] = item.path.split('#');
                        const target = basePath || '/';
                        navigate(target);
                        setTimeout(() => {
                          const el = document.getElementById(hash);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
                      } else {
                        navigate(item.path);
                      }
                    }
                  }}
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

            {/* Auth CTAs */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                className="w-full h-11 rounded-full font-semibold text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-500 hover:via-cyan-500 hover:to-teal-600 border border-white/20 shadow-[0_8px_24px_-12px_rgba(13,148,136,0.85)] transition-all duration-300"
                onClick={() => { navigate('/Products'); setMobileMenuOpen(false); }}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <ShoppingCart className="w-4 h-4" />
                  {language === 'ar' ? 'اشتر بطاقة NFC' : 'Buy NFC Card'}
                </span>
              </button>
              <button
                className="w-full h-11 rounded-full font-semibold text-white bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 dark:from-slate-100 dark:to-white dark:text-slate-900 border border-slate-700/40 dark:border-slate-200 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.78)] transition-all duration-300"
                onClick={() => { navigate(createPageUrl('Dashboard')); setMobileMenuOpen(false); }}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  {language === 'ar' ? 'أنشئ بطاقة رقمية' : 'Create Digital Card'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}