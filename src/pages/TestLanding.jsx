import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/landing/Navbar';
import GetStartedSteps from '@/components/landing/GetStartedSteps';
import ProductPreviewModal from '@/components/store/ProductPreviewModal';
import LoginModal from '@/components/auth/LoginModal';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/components/shared/LanguageContext';
import {
  Wifi, Star, ShoppingCart, ChevronLeft, ChevronRight,
  Phone, Mail, MessageCircle, MapPin, ArrowLeft, Check,
  Zap, Smartphone, RefreshCw, Shield, Award, Users
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── data ─────────────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: 1,
    nameAr: 'بطاقة الأعمال الاجتماعية NFC',
    nameEn: 'NFC Social Business Card',
    price: 35,
    originalPrice: 60,
    discount: 42,
    rating: 5,
    reviews: 29,
    image: 'https://rawaj.click/wp-content/uploads/2024/12/Google-NFC-Instagam-Facebook-WhatsApp-Youtube-Snapchat-Android-iPhone-450x450.webp',
    badgeAr: 'الأكثر مبيعاً', badgeEn: 'Best Seller',
    badgeColor: 'bg-teal-600',
  },
  {
    id: 2,
    nameAr: 'بطاقة تعارف NFC – خشبي',
    nameEn: 'NFC Business Card – Wood',
    price: 100,
    originalPrice: null,
    discount: null,
    rating: 5,
    reviews: 14,
    image: 'https://rawaj.click/wp-content/uploads/2024/10/%D8%B9%D9%85%D8%A7%D8%AF-%D8%B1%D8%AF%D9%85%D8%A7%D9%86-3-450x450.png',
    badgeAr: 'فاخر', badgeEn: 'Luxury',
    badgeColor: 'bg-amber-500',
  },
  {
    id: 3,
    nameAr: 'بطاقة تعارف ممغنطة NFC – بلاستيك',
    nameEn: 'Magnetic NFC Card – Plastic',
    price: 50,
    originalPrice: null,
    discount: null,
    rating: 5,
    reviews: 8,
    image: 'https://rawaj.click/wp-content/uploads/2024/10/6-450x450.png',
    badgeAr: null, badgeEn: null,
    badgeColor: null,
  },
  {
    id: 4,
    nameAr: 'بطاقة تعارف معدنية NFC',
    nameEn: 'Metal NFC Business Card',
    price: 130,
    originalPrice: null,
    discount: null,
    rating: 5,
    reviews: 21,
    image: 'https://rawaj.click/wp-content/uploads/2024/12/Frame_44_1b99c720-5d9b-492e-b5fa-ea176d50a2ad-450x450.webp',
    badgeAr: 'بريميوم', badgeEn: 'Premium',
    badgeColor: 'bg-slate-700',
  },
  {
    id: 5,
    nameAr: 'بطاقة قيمنا على جوجل – NFC',
    nameEn: 'Google Review NFC Card',
    price: 35,
    originalPrice: 60,
    discount: 42,
    rating: 5,
    reviews: 47,
    image: 'https://rawaj.click/wp-content/uploads/2024/12/Google-NFC-Instagam-Facebook-WhatsApp-Youtube-Snapchat-Android-iPhone-450x450.webp',
    badgeAr: 'خصم 42%', badgeEn: '42% Off',
    badgeColor: 'bg-red-500',
  },
  {
    id: 6,
    nameAr: 'تعليقة مفاتيح NFC لزيادة المراجعات',
    nameEn: 'NFC Keychain – Boost Reviews',
    price: 35,
    originalPrice: null,
    discount: null,
    rating: 5,
    reviews: 69,
    image: 'https://rawaj.click/wp-content/uploads/2024/12/NFC-Epoxy-Keychain-NFC-Google-450x450.webp',
    badgeAr: null, badgeEn: null,
    badgeColor: null,
  },
  {
    id: 7,
    nameAr: 'ستاند طاولة فخامة – جوجل NFC',
    nameEn: 'Premium Table Stand – Google NFC',
    price: 149,
    originalPrice: 190,
    discount: 22,
    rating: 5,
    reviews: 33,
    image: 'https://rawaj.click/wp-content/uploads/2024/12/unnamed-file-12-450x450.webp',
    badgeAr: 'للمحلات', badgeEn: 'For Shops',
    badgeColor: 'bg-indigo-600',
  },
  {
    id: 8,
    nameAr: 'ستاند طاولة للمشاركة السريعة',
    nameEn: 'Quick-Share Table Stand',
    price: 129,
    originalPrice: 159,
    discount: 19,
    rating: 5,
    reviews: 18,
    image: 'https://rawaj.click/wp-content/uploads/2024/10/InstagramStandwhite_1800x1800-450x450.webp',
    badgeAr: null, badgeEn: null,
    badgeColor: null,
  },
];

const PRODUCT_TABS = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'card', labelAr: 'سمارت بزنس كارد', labelEn: 'Business Card' },
  { id: 'stand', labelAr: 'ستاند طاولة', labelEn: 'Table Stand' },
  { id: 'sticker', labelAr: 'ملصق', labelEn: 'Sticker' },
  { id: 'keychain', labelAr: 'تعليقة مفاتيح', labelEn: 'Keychain' },
];

const PRODUCT_CATEGORY_MAP = {
  card: [1, 2, 3, 4],
  stand: [7, 8],
  sticker: [],
  keychain: [6],
  all: [1, 2, 3, 4, 5, 6, 7, 8],
};

const FEATURES = [
  {
    icon: Zap,
    titleAr: 'وصول فوري', titleEn: 'Instant Access',
    descAr: 'مشاركة ملفك الشخصي بنقرة واحدة بدون تطبيق',
    descEn: 'Share your profile with one tap — no app needed',
    color: 'text-teal-500', bg: 'bg-teal-50',
  },
  {
    icon: Smartphone,
    titleAr: 'متوافق مع كل الأجهزة', titleEn: 'Works on All Devices',
    descAr: 'يعمل مع iPhone وAndroid بدون أي إعداد',
    descEn: 'Compatible with iPhone and Android without any setup',
    color: 'text-blue-500', bg: 'bg-blue-50',
  },
  {
    icon: RefreshCw,
    titleAr: 'تحديث فوري', titleEn: 'Instant Updates',
    descAr: 'عدّل معلوماتك في أي وقت دون إعادة الطباعة',
    descEn: 'Update your info anytime without reprinting',
    color: 'text-purple-500', bg: 'bg-purple-50',
  },
  {
    icon: Shield,
    titleAr: 'بيانات آمنة', titleEn: 'Secure Data',
    descAr: 'تحكم كامل في ما تشاركه ومع من',
    descEn: 'Full control over what you share and with whom',
    color: 'text-amber-500', bg: 'bg-amber-50',
  },
];

/* ─── Hero animated words ──────────────────────────────────────────── */
const CYCLING_WORDS_AR = ['بنفسك', 'بشركتك', 'بفكرتك'];
const CYCLING_WORDS_EN = ['yourself', 'your business', 'your idea'];

/* ─── Product type → hero image + product mapping ──────────────────── */
const HERO_PRODUCT_TYPES = [
  {
    labelAr: 'سمارت بزنس كارد',
    labelEn: 'Smart Business Card',
    icon: '💳',
    productId: 1,
    image: 'https://rawaj.click/wp-content/uploads/2024/12/Google-NFC-Instagam-Facebook-WhatsApp-Youtube-Snapchat-Android-iPhone-450x450.webp',
  },
  {
    labelAr: 'ستاند طاولة',
    labelEn: 'Table Stand',
    icon: '🪧',
    productId: 7,
    image: 'https://rawaj.click/wp-content/uploads/2024/12/unnamed-file-12-450x450.webp',
  },
  {
    labelAr: 'ملصق',
    labelEn: 'NFC Sticker',
    icon: '🏷️',
    productId: 5,
    image: 'https://rawaj.click/wp-content/uploads/2024/12/Google-NFC-Instagam-Facebook-WhatsApp-Youtube-Snapchat-Android-iPhone-450x450.webp',
  },
  {
    labelAr: 'تعليقة مفاتيح',
    labelEn: 'NFC Keychain',
    icon: '🔑',
    productId: 6,
    image: 'https://rawaj.click/wp-content/uploads/2024/12/NFC-Epoxy-Keychain-NFC-Google-450x450.webp',
  },
];

/* ─── ProductCard ───────────────────────────────────────────────────── */
function ProductCard({ product, index, onAddToCart, onView, onBuyNow, isRTL }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={index * 0.07}>
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-slate-100"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onView}
      >
        <div className="relative overflow-hidden bg-slate-50 aspect-square">
          <motion.img
            src={product.image}
            alt={isRTL ? product.nameAr : product.nameEn}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.4 }}
            onError={(e) => { e.target.src = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Product'; }}
          />
          {(isRTL ? product.badgeAr : product.badgeEn) && (
            <span className={`absolute top-3 right-3 ${product.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow`}>
              {isRTL ? product.badgeAr : product.badgeEn}
            </span>
          )}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-x-3 bottom-3 flex flex-col gap-2"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart?.(); }}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              {isRTL ? 'أضف إلى السلة' : 'Add to Cart'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onBuyNow?.(); }}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Zap className="h-4 w-4" />
              {isRTL ? 'اشتر الآن' : 'Buy Now'}
            </button>
          </motion.div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
            {isRTL ? product.nameAr : product.nameEn}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-slate-400 mr-1">({product.reviews})</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-teal-700">
              {product.price.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} {isRTL ? 'ر.س' : 'SAR'}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-slate-400 line-through">
                {product.originalPrice} {isRTL ? 'ر.س' : 'SAR'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function TestLanding() {
  const [activeTab, setActiveTab] = useState('all');
  const [heroProduct, setHeroProduct] = useState(0);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [selectedProductTypeIdx, setSelectedProductTypeIdx] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { lang, isRTL } = useLanguage();

  const CYCLING_WORDS = isRTL ? CYCLING_WORDS_AR : CYCLING_WORDS_EN;

  // Cycle words every 2.5s
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % CYCLING_WORDS.length), 2500);
    return () => clearInterval(t);
  }, [CYCLING_WORDS.length]);

  const filteredIds = PRODUCT_CATEGORY_MAP[activeTab] || PRODUCT_CATEGORY_MAP.all;
  const filteredProducts = PRODUCTS.filter(p => filteredIds.includes(p.id));

  const heroImages = HERO_PRODUCT_TYPES.map(p => p.image);

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: isRTL ? "'Tajawal', 'Cairo', sans-serif" : "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Cairo:wght@400;600;700;800&display=swap');
      `}</style>

      {/* ── Announcement Bar ─────────────────────────────────────── */}
      <div className="bg-[#0f4c3a] text-white text-center py-2.5 text-sm font-medium tracking-wide">
        🚚&nbsp; توصيل مجاني لطلبات 250 ريال فأكثر &nbsp;|&nbsp; اطلب الآن واستلم خلال يومين
      </div>

      {/* ── Navbar (existing) ────────────────────────────────────── */}
      <Navbar onLoginClick={() => setLoginOpen(true)} />

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1b2a 40%, #0a3d2e 100%)' }}
      >
        {/* animated glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #14b8a6, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-100px] left-[-60px] w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-10 relative z-10 pt-28 pb-20">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <span className="inline-flex items-center gap-2 bg-teal-500/15 text-teal-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-teal-500/30 mb-6">
                  <Wifi className="h-4 w-4" />
                  {isRTL ? 'تقنية NFC الذكية' : 'Smart NFC Technology'}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black mb-6"
                style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif", color: '#fff', lineHeight: '1.55' }}
              >
                <span className="text-white">{isRTL ? 'استعد للتعريف ' : 'Ready to introduce '}</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIdx}
                    initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(to left, #5eead4, #14b8a6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {CYCLING_WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
                <br />
                <span
                  style={{
                    background: 'linear-gradient(to left, #5eead4, #14b8a6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {isRTL ? 'بطريقة عصرية' : 'the modern way'}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="text-slate-300 text-lg md:text-xl mb-8 leading-relaxed"
              >
                {isRTL ? 'الجيل الجديد من كروت التعارف في عالم الأعمال' : 'The next generation of business networking cards'}
              </motion.p>

              {/* Product Type Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="flex flex-wrap gap-2 mb-10"
              >
                {HERO_PRODUCT_TYPES.map((item, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedProductTypeIdx(i);
                      setHeroProduct(i);
                    }}
                    className={`flex items-center gap-1.5 text-white text-sm font-medium px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                      selectedProductTypeIdx === i
                        ? 'bg-teal-500/40 border-teal-400/60 ring-1 ring-teal-400/40'
                        : 'bg-white/10 hover:bg-teal-500/25 border-white/15'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {isRTL ? item.labelAr : item.labelEn}
                  </motion.span>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.65 }}
                className="flex flex-wrap gap-4"
              >
                <button onClick={() => setLoginOpen(true)}>
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-teal-600/30 transition-all text-base cursor-pointer"
                  >
                    {isRTL ? 'انشئ كرت رقمي مجاني' : 'Create Your Free Digital Card'}
                    <ArrowLeft className="h-5 w-5" />
                  </motion.span>
                </button>
                <Link to={createPageUrl('Store')}>
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl border border-white/20 transition-all text-base cursor-pointer"
                  >
                    {isRTL ? 'تسوق الآن' : 'Shop Now'}
                  </motion.span>
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="flex gap-8 mt-12"
              >
                {[
                  { value: '+5000', labelAr: 'عميل سعيد', labelEn: 'Happy Clients' },
                  { value: '+1000', labelAr: 'تقييم ⭐', labelEn: '5-Star Reviews' },
                  { value: '2 يوم', labelAr: 'توصيل سريع', labelEn: 'Fast Delivery' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-black text-teal-400">{stat.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{isRTL ? stat.labelAr : stat.labelEn}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero Image Carousel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex justify-center"
            >
              <div className="relative w-full max-w-md">
                {/* Glow ring */}
                <div className="absolute inset-0 m-8 rounded-3xl bg-teal-400/10 blur-2xl" />

                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-2xl overflow-hidden">
                  <motion.img
                    key={heroProduct}
                    src={heroImages[heroProduct]}
                    alt="منتج رواج كارد"
                    className="w-full aspect-square object-contain rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => {
                      const prod = PRODUCTS.find(p => p.id === HERO_PRODUCT_TYPES[heroProduct]?.productId);
                      if (prod) setPreviewProduct(prod);
                    }}
                    onError={(e) => { e.target.src = 'https://placehold.co/600x600/1e293b/94a3b8?text=Rawajcard'; }}
                  />

                  {/* Navigation dots */}
                  <div className="flex justify-center gap-2 mt-4">
                    {heroImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setHeroProduct(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${i === heroProduct ? 'w-6 bg-teal-400' : 'w-2 bg-white/30'}`}
                      />
                    ))}
                  </div>

                  {/* Nav arrows */}
                  <button
                    onClick={() => setHeroProduct(p => (p - 1 + heroImages.length) % heroImages.length)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setHeroProduct(p => (p + 1) % heroImages.length)}
                    className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </div>

                {/* Floating badge */}
                <motion.div
                  className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Wifi className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{isRTL ? 'NFC تقنية' : 'NFC Tech'}</div>
                    <div className="text-xs text-slate-400">{isRTL ? 'لمسة واحدة تكفي' : 'One tap is enough'}</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Shapes / Products Section ─────────────────────────────── */}
      <section className="py-24 bg-[#f8fafb]">
        <div className="container mx-auto px-4 md:px-10">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-block text-teal-600 text-sm font-bold tracking-widest uppercase mb-3">
                {isRTL ? 'مجموعتنا' : 'Our Collection'}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                {isRTL ? 'أشكال فاخرة تليق بك' : 'Premium Designs Just for You'}
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                {isRTL ? 'اختر من بين أفضل الأشكال والألوان — كروت بجودة وفخامة عالية' : 'Choose from the finest shapes and colors — premium quality cards'}
              </p>
            </div>
          </Reveal>

          {/* Tabs */}
          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {PRODUCT_TABS.map(tab => (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30'
                      : 'bg-white text-slate-600 hover:bg-teal-50 border border-slate-200'
                  }`}
                >
                  {isRTL ? tab.labelAr : tab.labelEn}
                </motion.button>
              ))}
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {(filteredProducts.length > 0 ? filteredProducts : PRODUCTS).map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                isRTL={isRTL}
                onAddToCart={() => addItem(product)}
                onView={() => setPreviewProduct(product)}
                onBuyNow={() => { addItem(product); navigate(createPageUrl('Checkout')); }}
              />
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="text-center mt-12">
              <Link
                to={createPageUrl('Store')}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-teal-500/25 transition-all text-base"
              >
                {isRTL ? 'عرض جميع المنتجات' : 'View All Products'}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Instant Access Feature ─────────────────────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Image */}
            <Reveal className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-slate-50 rounded-3xl" />
                <div className="relative p-8 md:p-12">
                  <motion.img
                    src="https://rawaj.click/wp-content/uploads/2024/10/InstagramStandwhite_1800x1800-450x450.webp"
                    alt="الوصول بلمح البصر"
                    className="w-full max-w-sm mx-auto drop-shadow-2xl"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.4 }}
                    onError={(e) => { e.target.src = 'https://placehold.co/500x500/f0fdf4/16a34a?text=NFC'; }}
                  />
                </div>
                {/* floating chip */}
                <motion.div
                  className="absolute top-6 left-6 bg-teal-600 text-white rounded-2xl px-4 py-2 shadow-xl text-sm font-bold"
                  animate={{ rotate: [-2, 2, -2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🔥 {isRTL ? 'الأكثر طلباً' : 'Best Seller'}
                </motion.div>
              </div>
            </Reveal>

            {/* Text */}
            <Reveal delay={0.15} className="order-1 lg:order-2">
              <span className="inline-block text-teal-600 text-sm font-bold tracking-widest uppercase mb-4">
                {isRTL ? 'سهل وسريع' : 'Easy & Fast'}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-snug">
                {isRTL ? (
                  <>الوصول بلمح{' '}<span className="text-teal-600">البصر</span></>
                ) : (
                  <>Access at the{' '}<span className="text-teal-600">Speed of Light</span></>
                )}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {isRTL
                  ? 'باستخدام هذا الكرت يمكنك الوصول إلى هاتف عميلك بلمح البصر بدون الحاجة إلى فتح الكاميرا أو واجهة حفظ الأرقام'
                  : 'With this card, you can reach your client instantly — no camera or contact-saving screen needed'}
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { titleAr: 'بدون تطبيق', titleEn: 'No App Required', descAr: 'يعمل مع أي هاتف حديث بدون تحميل أي تطبيق', descEn: 'Works with any modern phone without installing an app' },
                  { titleAr: 'مشاركة لحظية', titleEn: 'Instant Sharing', descAr: 'معلوماتك، حساباتك، وموقعك — كلها بنقرة واحدة', descEn: 'Your info, socials, and location — all with one tap' },
                  { titleAr: 'تحديث مباشر', titleEn: 'Live Updates', descAr: 'غيّر بياناتك متى تشاء، الكرت يُحدَّث فوراً', descEn: 'Change your details anytime, the card updates instantly' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.2 }}
                    className="flex items-start gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{isRTL ? item.titleAr : item.titleEn}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{isRTL ? item.descAr : item.descEn}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link
                to={createPageUrl('Store')}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl transition-colors"
              >
                {isRTL ? 'اختر كرتك الآن' : 'Choose Your Card'}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Features Row ─────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-10">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-14">
              {isRTL ? 'لماذا يختار الجميع رواج كارد؟' : 'Why Everyone Chooses Rawajcard'}
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-4`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{isRTL ? f.titleAr : f.titleEn}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{isRTL ? f.descAr : f.descEn}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Steps ───────────────────────────────────────── */}
      <GetStartedSteps />

      {/* ── CTA Section "مع رواج كارد" ──────────────────────────────── */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1b2a 50%, #0a3d2e 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, #14b8a6, transparent 70%)' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-10 relative z-10 text-center">
          <Reveal>
            <span className="inline-block text-teal-300 text-sm font-bold tracking-widest uppercase mb-4 border border-teal-400/30 rounded-full px-4 py-1.5">
              {isRTL ? 'مع رواج كارد' : 'With Rawajcard'}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              {isRTL ? (
                <>الوصول أصبح{' '}<span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-300 to-teal-500">أسرع</span></>
              ) : (
                <>Access is now{' '}<span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-300 to-teal-500">Faster</span></>
              )}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-slate-300 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
              {isRTL
                ? 'أنشئ كرتك الرقمي مجاناً — شارك معلوماتك، وسائل التواصل، وموقعك بنقرة واحدة مع أي شخص'
                : 'Create your digital card for free — share your info, socials, and location with one tap'}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={createPageUrl('Login')}>
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-black px-10 py-5 rounded-2xl shadow-2xl shadow-teal-500/40 transition-all text-lg cursor-pointer"
                  onClick={(e) => { e.preventDefault(); setLoginOpen(true); }}
                >
                  {isRTL ? 'انشئ كرتك مجاناً الآن' : 'Create Your Free Card Now'}
                  <ArrowLeft className="h-5 w-5" />
                </motion.span>
              </Link>
              <Link to={createPageUrl('Store')}>
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-5 rounded-2xl border border-white/20 transition-all text-lg cursor-pointer"
                >
                  {isRTL ? 'خصص كرتك المفضل' : 'Customize Your Favorite Card'}
                </motion.span>
              </Link>
            </div>
          </Reveal>

          {/* Trust badges */}
          <Reveal delay={0.45}>
            <div className="flex flex-wrap justify-center gap-8 mt-16">
              {[
                { icon: '🔒', textAr: 'مدفوعات آمنة 100%', textEn: '100% Secure Payments' },
                { icon: '🚚', textAr: 'توصيل سريع لجميع مناطق السعودية', textEn: 'Fast delivery across Saudi Arabia' },
                { icon: '📞', textAr: 'دعم على مدار الساعة', textEn: '24/7 customer support' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                  <span className="text-lg">{badge.icon}</span>
                  {isRTL ? badge.textAr : badge.textEn}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Table Stand Promo ────────────────────────────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <Reveal>
              <span className="inline-block text-teal-600 text-sm font-bold tracking-widest uppercase mb-4">
                {isRTL ? 'للمطاعم والمحلات' : 'For Restaurants & Shops'}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-snug">
                {isRTL ? (
                  <>خلّ عملاءك يتفاعلون{' '}<span className="text-teal-600">أسرع</span></>
                ) : (
                  <>Let customers engage{' '}<span className="text-teal-600">faster</span></>
                )}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {isRTL
                  ? 'مع ستاند تفاعلي يصل إليك العميل بواسطته بلمح البصر — يصلح لطلبات الطعام، المراجعات على جوجل، مشاركة وسائل التواصل، وأكثر'
                  : 'With an interactive stand, customers reach you instantly — perfect for food orders, Google reviews, social sharing, and more'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  { labelAr: 'مراجعات جوجل', labelEn: 'Google Reviews', icon: '⭐' },
                  { labelAr: 'مشاركة السوشيال', labelEn: 'Social Sharing', icon: '📱' },
                  { labelAr: 'منيو إلكتروني', labelEn: 'Digital Menu', icon: '🍽️' },
                  { labelAr: 'نموذج تواصل', labelEn: 'Contact Form', icon: '📋' },
                ].map((use, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100"
                  >
                    <span className="text-2xl">{use.icon}</span>
                    <span className="font-semibold text-slate-700 text-sm">{isRTL ? use.labelAr : use.labelEn}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={createPageUrl('Store')}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-teal-500/25 transition-all"
                >
                  {isRTL ? 'خل عملاءك يتفاعلون أسرع' : 'Boost Customer Engagement'}
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <Link
                  to={createPageUrl('Store')}
                  className="inline-flex items-center gap-2 border-2 border-slate-200 hover:border-teal-400 text-slate-700 font-semibold px-8 py-4 rounded-2xl transition-all"
                >
                  {isRTL ? 'عرض الكل' : 'View All'}
                </Link>
              </div>
            </Reveal>

            {/* Image */}
            <Reveal delay={0.15}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-teal-50 to-slate-100 rounded-3xl -z-10" />
                <motion.img
                  src="https://rawaj.click/wp-content/uploads/2024/12/unnamed-file-12-450x450.webp"
                  alt="ستاند طاولة NFC"
                  className="w-full max-w-md mx-auto rounded-2xl drop-shadow-2xl"
                  whileHover={{ scale: 1.02, rotate: -1 }}
                  transition={{ duration: 0.4 }}
                  onError={(e) => { e.target.src = 'https://placehold.co/500x500/f0fdf4/16a34a?text=Stand'; }}
                />
                {/* Price badge */}
                <motion.div
                  className="absolute bottom-4 left-4 bg-white rounded-2xl shadow-xl px-5 py-3 border border-slate-100"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <div className="text-xs text-slate-400 line-through mb-0.5">{isRTL ? '190 ر.س' : '190 SAR'}</div>
                  <div className="text-2xl font-black text-teal-700">{isRTL ? '149 ر.س' : '149 SAR'}</div>
                  <div className="text-xs text-red-500 font-bold">{isRTL ? 'وفّر 41 ر.س' : 'Save 41 SAR'}</div>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-10">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                {isRTL ? 'ماذا يقول عملاؤنا؟' : 'What Our Customers Say'}
              </h2>
              <p className="text-slate-500">{isRTL ? 'آراء حقيقية من عملاء رواج كارد' : 'Real reviews from Rawajcard customers'}</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                nameAr: 'عبدالله الشمري', nameEn: 'Abdullah Al-Shamri',
                roleAr: 'مدير مبيعات', roleEn: 'Sales Manager',
                textAr: 'منتج رائع! وفّر عليّ الكثير من الوقت. أعطيته لعملائي وكلهم انبهروا. التوصيل كان سريع جداً.',
                textEn: 'Amazing product! Saved me so much time. Shared it with my clients and they were all impressed. Delivery was super fast.',
                stars: 5, avatar: 'ع', avatarBg: 'bg-teal-600',
              },
              {
                nameAr: 'سارة الأحمدي', nameEn: 'Sara Al-Ahmadi',
                roleAr: 'صاحبة مطعم', roleEn: 'Restaurant Owner',
                textAr: 'الستاند الخاص بمطعمي ساعدنا كثيراً في زيادة المراجعات على جوجل. أنصح به كل صاحب محل.',
                textEn: 'The stand at my restaurant helped us get a lot more Google reviews. I recommend it to every business owner.',
                stars: 5, avatar: 'س', avatarBg: 'bg-purple-600',
              },
              {
                nameAr: 'محمد العتيبي', nameEn: 'Mohammed Al-Otaibi',
                roleAr: 'مستقل ومصمم', roleEn: 'Freelance Designer',
                textAr: 'جودة البطاقة ممتازة والكرت الرقمي احترافي جداً. الجميع يسألني عنه في الاجتماعات!',
                textEn: 'Excellent card quality and the digital card is very professional. Everyone asks me about it in meetings!',
                stars: 5, avatar: 'م', avatarBg: 'bg-blue-600',
              },
            ].map((review, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.stars)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-5 text-sm">"{isRTL ? review.textAr : review.textEn}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${review.avatarBg} flex items-center justify-center text-white font-bold text-sm`}>
                      {review.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{isRTL ? review.nameAr : review.nameEn}</div>
                      <div className="text-xs text-slate-400">{isRTL ? review.roleAr : review.roleEn}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ background: '#0a0a0a' }} className="text-white">
        {/* Top CTA strip */}
        <div className="border-b border-white/10 py-10">
          <div className="container mx-auto px-4 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-black mb-1">{isRTL ? 'جاهز تبدأ؟' : 'Ready to start?'}</h3>
              <p className="text-slate-400 text-sm">{isRTL ? 'انشئ كرتك الرقمي مجاناً الآن' : 'Create your digital card for free today'}</p>
            </div>
            <button
              onClick={() => setLoginOpen(true)}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-8 py-3.5 rounded-2xl transition-colors"
            >
              {isRTL ? 'ابدأ مجاناً' : 'Start for Free'}
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main footer */}
        <div className="container mx-auto px-4 md:px-10 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <img
                src="https://rawajcard.com/wp-content/uploads/2024/09/rawajcard-logo.webp"
                alt="Rawajcard"
                className="h-12 w-auto mb-4 brightness-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-2xl font-black text-teal-400 mb-4">Rawajcard</div>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                {isRTL ? 'الجيل الجديد من بطاقات التعارف الذكية في عالم الأعمال' : 'The next generation of smart business cards'}
              </p>
              <div className="flex gap-3">
                {[
                  { href: 'https://www.facebook.com/rawajcard', icon: '𝒻' },
                  { href: 'https://twitter.com/rawajcard', icon: '𝓍' },
                  { href: 'https://www.instagram.com/rawajcard', icon: '𝒾𝑔' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/10 hover:bg-teal-600 rounded-full flex items-center justify-center text-sm transition-colors">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                titleAr: 'روابط مهمة', titleEn: 'Quick Links',
                links: [
                  { labelAr: 'المتجر', labelEn: 'Shop', href: 'https://rawajcard.com/shop/' },
                  { labelAr: 'حسابي', labelEn: 'My Account', href: 'https://rawajcard.com/my-account/' },
                  { labelAr: 'طلبياتي', labelEn: 'My Orders', href: 'https://rawajcard.com/my-orders/' },
                  { labelAr: 'جميع المنتجات', labelEn: 'All Products', href: 'https://rawajcard.com/shop/' },
                ],
              },
              {
                titleAr: 'معلومات مهمة', titleEn: 'Info',
                links: [
                  { labelAr: 'الشحن والتوصيل', labelEn: 'Shipping & Delivery', href: 'https://rawajcard.com/shipping' },
                  { labelAr: 'سياسة التبديل والاسترجاع', labelEn: 'Returns Policy', href: 'https://rawajcard.com/returns' },
                  { labelAr: 'سياسة الخصوصية', labelEn: 'Privacy Policy', href: 'https://rawajcard.com/privacy-policy' },
                  { labelAr: 'وسائل الدفع', labelEn: 'Payment Methods', href: 'https://rawajcard.com/payments' },
                ],
              },
              {
                titleAr: 'تواصل معنا', titleEn: 'Contact Us',
                links: [],
                contact: true,
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-black text-white mb-5 text-base">{isRTL ? col.titleAr : col.titleEn}</h4>
                {col.contact ? (
                  <div className="space-y-4 text-sm text-slate-400">
                    <a href="mailto:info@rawajcard.com" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      info@rawajcard.com
                    </a>
                    <a href="https://wa.me/966551861022" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                      <MessageCircle className="h-4 w-4 flex-shrink-0" />
                      {isRTL ? 'واتساب: 966551861022+' : 'WhatsApp: +966551861022'}
                    </a>
                    <a href="tel:966551861022" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      {isRTL ? 'اتصل بنا: 966551861022+' : 'Call: +966551861022'}
                    </a>
                  </div>
                ) : (
                  <ul className="space-y-3 text-sm text-slate-400">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <a href={link.href} target="_blank" rel="noopener noreferrer"
                          className="hover:text-teal-400 transition-colors">
                          {isRTL ? link.labelAr : link.labelEn}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
          {isRTL
            ? `جميع الحقوق محفوظة © ${new Date().getFullYear()} رواج كارد — تقنية NFC الذكية`
            : `All rights reserved © ${new Date().getFullYear()} Rawajcard — Smart NFC Technology`}
        </div>
      </footer>
      {/* Product Preview Modal */}
      <ProductPreviewModal
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />

      {/* Login Modal */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

    </div>
  );
}
