import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Upload, X, ShoppingCart, Check, RotateCcw, Type, Image, Palette, Phone, Mail, Globe, MapPin } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { productsData } from '@/components/shared/productsData';
import { createPageUrl } from '@/utils';
import Navbar from '@/components/landing/Navbar';
import LoginModal from '@/components/auth/LoginModal';
import Footer from '@/components/landing/Footer';

/* ─── Constants ──────────────────────────────────────────────── */

const PRODUCT_TYPES = [
  { key: 'card', icon: '💳', labelEn: 'NFC Card', labelAr: 'بطاقة NFC' },
  { key: 'sticker', icon: '🏷️', labelEn: 'NFC Sticker', labelAr: 'ملصق NFC' },
  { key: 'keychain', icon: '🔑', labelEn: 'Keychain', labelAr: 'تعليقة مفاتيح' },
  { key: 'stand', icon: '🪧', labelEn: 'Table Stand', labelAr: 'ستاند طاولة' },
];

const CARD_MATERIALS = [
  { key: 'metal', labelEn: 'Metal', labelAr: 'معدني', price: 130, productId: 'metal-nfc-card' },
  { key: 'wood', labelEn: 'Wood', labelAr: 'خشبي', price: 100, productId: 'wooden-nfc-card' },
  { key: 'pvc', labelEn: 'PVC (Plastic)', labelAr: 'بلاستيك PVC', price: 50, productId: 'magnetic-nfc-card' },
];

const METAL_COLORS = [
  { key: 'gold', labelEn: 'Gold', labelAr: 'ذهبي', hex: '#D4AF37', ring: '#B8960F' },
  { key: 'silver', labelEn: 'Silver', labelAr: 'فضي', hex: '#C0C0C0', ring: '#8E8E8E' },
  { key: 'black', labelEn: 'Black', labelAr: 'أسود', hex: '#1a1a1a', ring: '#000' },
];

const WOOD_COLORS = [
  { key: 'light', labelEn: 'Light Wood', labelAr: 'خشب فاتح', hex: '#D2B48C', ring: '#A0845C' },
  { key: 'dark', labelEn: 'Dark Wood', labelAr: 'خشب غامق', hex: '#5C3A1E', ring: '#3E2510' },
];

const STEPS = {
  en: ['Product Type', 'Options', 'Design', 'Preview'],
  ar: ['نوع المنتج', 'الخيارات', 'التصميم', 'المعاينة'],
};

/* ─── Helper: map product type to productsData id ──────────── */
function resolveProductId(type, material) {
  if (type === 'card') {
    const m = CARD_MATERIALS.find(cm => cm.key === material);
    return m?.productId || 'metal-nfc-card';
  }
  if (type === 'sticker') return 'google-review-card';
  if (type === 'keychain') return 'review-keychain';
  if (type === 'stand') return 'quick-share-stand';
  return 'metal-nfc-card';
}

/* ─── Preview Mockup Component ───────────────────────────────── */
function CardPreview({ config, isRTL }) {
  const { productType, material, color, name, title, phone, email, website, logoFile, logoPreview } = config;

  // Determine preview shape
  const isCircle = productType === 'sticker' || productType === 'keychain';
  const isStand = productType === 'stand';
  const isCard = productType === 'card';

  // Background color/texture
  let bg = '#1a1a1a';
  let textColor = '#fff';
  if (isCard) {
    if (material === 'metal') {
      const mc = METAL_COLORS.find(c => c.key === color);
      bg = mc?.hex || '#D4AF37';
      textColor = color === 'gold' ? '#1a1a1a' : '#fff';
    } else if (material === 'wood') {
      const wc = WOOD_COLORS.find(c => c.key === color);
      bg = wc?.hex || '#D2B48C';
      textColor = color === 'light' ? '#1a1a1a' : '#fff';
    } else {
      bg = '#fff';
      textColor = '#1a1a1a';
    }
  } else if (isStand) {
    bg = '#0f172a';
    textColor = '#fff';
  }

  const containerClass = isCircle
    ? 'w-52 h-52 rounded-full'
    : isStand
    ? 'w-64 h-64 rounded-full'
    : 'w-80 h-48 rounded-2xl';

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`${containerClass} relative overflow-hidden shadow-2xl flex flex-col items-center justify-center transition-all duration-500`}
        style={{ backgroundColor: bg, color: textColor }}
      >
        {/* NFC icon watermark */}
        <div className="absolute top-3 right-3 opacity-20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
        </div>

        {/* Logo */}
        {logoPreview ? (
          <img src={logoPreview} alt="Logo" className={`${isCircle ? 'w-16 h-16' : isStand ? 'w-20 h-20' : 'w-14 h-14'} object-contain rounded-lg mb-2`} />
        ) : (
          <div className={`${isCircle ? 'w-16 h-16' : isStand ? 'w-20 h-20' : 'w-14 h-14'} rounded-lg mb-2 flex items-center justify-center border-2 border-dashed`} style={{ borderColor: textColor, opacity: 0.3 }}>
            <Image className="w-6 h-6" style={{ color: textColor }} />
          </div>
        )}

        {/* Text */}
        <p className="text-sm font-bold truncate max-w-[90%] leading-tight" style={{ color: textColor }}>
          {name || (isRTL ? 'اسمك هنا' : 'Your Name')}
        </p>
        {!isCircle && (
          <p className="text-xs opacity-70 truncate max-w-[90%]" style={{ color: textColor }}>
            {title || (isRTL ? 'المسمى الوظيفي' : 'Job Title')}
          </p>
        )}

        {/* Stand extras */}
        {isStand && (
          <div className="flex gap-3 mt-3 opacity-60">
            {phone && <Phone className="w-4 h-4" />}
            {email && <Mail className="w-4 h-4" />}
            {website && <Globe className="w-4 h-4" />}
            <MapPin className="w-4 h-4" />
          </div>
        )}

        {/* Card contact row */}
        {isCard && (phone || email) && (
          <div className="flex gap-2 mt-2 opacity-60">
            {phone && <Phone className="w-3 h-3" />}
            {email && <Mail className="w-3 h-3" />}
            {website && <Globe className="w-3 h-3" />}
          </div>
        )}
      </div>

      {/* Material label */}
      {isCard && (
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          {material === 'metal' ? (METAL_COLORS.find(c => c.key === color)?.labelEn || 'Gold') + ' Metal'
            : material === 'wood' ? (WOOD_COLORS.find(c => c.key === color)?.labelEn || 'Light') + ' Wood'
            : 'PVC — UV Print'}
        </span>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function NFCCustomizer() {
  const navigate = useNavigate();
  const { lang, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  // Config state
  const [productType, setProductType] = useState('card');
  const [material, setMaterial] = useState('metal');
  const [color, setColor] = useState('gold');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [notes, setNotes] = useState('');

  // After login redirect
  const [pendingSave, setPendingSave] = useState(false);

  const t = (en, ar) => isRTL ? ar : en;
  const stepsLabels = isRTL ? STEPS.ar : STEPS.en;

  // Determine available steps based on product type
  const totalSteps = 4;

  // Reset material/color when product type changes
  useEffect(() => {
    if (productType === 'card') {
      setMaterial('metal');
      setColor('gold');
    }
  }, [productType]);

  // Reset color when material changes
  useEffect(() => {
    if (material === 'metal') setColor('gold');
    else if (material === 'wood') setColor('light');
    else setColor('white');
  }, [material]);

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Resolve the matching product
  const productId = resolveProductId(productType, material);
  const matchedProduct = productsData.find(p => p.id === productId);
  const price = matchedProduct?.price || 99;

  // Handle save / add to cart
  const handleSave = () => {
    // Store customization in localStorage
    const customization = {
      productType, material, color, name, title, phone, email, website, notes,
      logoPreview, // base64 string
      productId,
      timestamp: Date.now(),
    };
    localStorage.setItem('rawaj_pending_customization', JSON.stringify(customization));

    if (!isAuthenticated) {
      setPendingSave(true);
      setLoginOpen(true);
      return;
    }

    addToCartAndRedirect();
  };

  const addToCartAndRedirect = () => {
    if (matchedProduct) {
      addItem({
        id: matchedProduct.id,
        name: matchedProduct.name_en,
        name_en: matchedProduct.name_en,
        name_ar: matchedProduct.name_ar,
        price: matchedProduct.price,
        image: matchedProduct.image_url,
        image_url: matchedProduct.image_url,
      });
    }
    navigate(createPageUrl('Checkout'));
  };

  // After successful login, add to cart
  useEffect(() => {
    if (isAuthenticated && pendingSave) {
      setPendingSave(false);
      setLoginOpen(false);
      addToCartAndRedirect();
    }
  }, [isAuthenticated, pendingSave]);

  // Step navigation
  const canGoNext = () => {
    if (step === 0) return !!productType;
    if (step === 1) return productType !== 'card' || !!material;
    if (step === 2) return !!name;
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar onLoginClick={() => setLoginOpen(true)} />

      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {t('Customize Your NFC Product', 'صمّم منتج NFC الخاص بك')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t('Choose your product, pick your style, and preview it live', 'اختر منتجك، حدد أسلوبك، وشاهد المعاينة مباشرة')}
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {stepsLabels.map((label, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className={`h-px w-8 md:w-16 transition-colors ${i <= step ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
              <button
                onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  i === step
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                    : i < step
                    ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Form */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8"
          >
            {/* STEP 0: Product Type */}
            {step === 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {t('Select Product Type', 'اختر نوع المنتج')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  {t('What would you like to customize?', 'ماذا تود أن تخصص؟')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {PRODUCT_TYPES.map(pt => (
                    <button
                      key={pt.key}
                      onClick={() => setProductType(pt.key)}
                      className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-center group hover:shadow-md ${
                        productType === pt.key
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'
                      }`}
                    >
                      {productType === pt.key && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <span className="text-3xl block mb-2">{pt.icon}</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isRTL ? pt.labelAr : pt.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1: Options */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {productType === 'card' ? t('Card Material & Color', 'خامة البطاقة واللون') : t('Product Options', 'خيارات المنتج')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  {productType === 'card'
                    ? t('Choose the material and finish for your card', 'اختر خامة البطاقة واللمسة النهائية')
                    : t('Your selection details', 'تفاصيل اختيارك')}
                </p>

                {productType === 'card' && (
                  <>
                    {/* Material */}
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                      {t('Material', 'الخامة')}
                    </label>
                    <div className="flex gap-2 mb-6">
                      {CARD_MATERIALS.map(m => (
                        <button
                          key={m.key}
                          onClick={() => setMaterial(m.key)}
                          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                            material === m.key
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300'
                          }`}
                        >
                          {isRTL ? m.labelAr : m.labelEn}
                          <span className="block text-xs text-slate-400 mt-0.5">{m.price} SAR</span>
                        </button>
                      ))}
                    </div>

                    {/* Color */}
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                      {t('Color', 'اللون')}
                    </label>
                    <div className="flex gap-3 mb-4">
                      {(material === 'metal' ? METAL_COLORS : material === 'wood' ? WOOD_COLORS : []).map(c => (
                        <button
                          key={c.key}
                          onClick={() => setColor(c.key)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                            color === c.key
                              ? 'border-teal-500 shadow-md'
                              : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-full border-2 shadow-inner"
                            style={{ backgroundColor: c.hex, borderColor: c.ring }}
                          />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {isRTL ? c.labelAr : c.labelEn}
                          </span>
                        </button>
                      ))}
                      {material === 'pvc' && (
                        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20 flex-1">
                          <Palette className="w-5 h-5 text-teal-600" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {t('UV Print — Any Design', 'طباعة UV — أي تصميم')}
                            </p>
                            <p className="text-xs text-slate-500">
                              {t('Upload your design or we\'ll create one for you', 'ارفع تصميمك أو سننشئ لك واحداً')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Non-card products info */}
                {productType !== 'card' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{PRODUCT_TYPES.find(p => p.key === productType)?.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {isRTL
                              ? PRODUCT_TYPES.find(p => p.key === productType)?.labelAr
                              : PRODUCT_TYPES.find(p => p.key === productType)?.labelEn}
                          </p>
                          <p className="text-sm text-teal-600 font-bold">{price} SAR</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {productType === 'sticker'
                          ? t('Small circle shape — perfect for branding with your logo + NFC chip', 'شكل دائري صغير — مثالي للعلامة التجارية مع شعارك + شريحة NFC')
                          : productType === 'keychain'
                          ? t('Compact circle design — fits your logo with NFC technology built-in', 'تصميم دائري مدمج — يناسب شعارك مع تقنية NFC مدمجة')
                          : t('Professional table stand with NFC — share your store info, menu, social links', 'ستاند طاولة احترافي مع NFC — شارك معلومات متجرك، المنيو، روابط التواصل')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Price summary */}
                <div className="mt-6 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {t('Price', 'السعر')}
                    </span>
                    <span className="text-lg font-bold text-teal-700 dark:text-teal-300">
                      {price} SAR
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Design Info */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {t('Your Information', 'معلوماتك')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  {t('This will appear on your product', 'ستظهر هذه على منتجك')}
                </p>

                <div className="space-y-4">
                  {/* Logo Upload */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      {t('Logo', 'الشعار')}
                    </label>
                    <div className="flex items-center gap-3">
                      {logoPreview ? (
                        <div className="relative">
                          <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-slate-200 dark:border-slate-700" />
                          <button
                            onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                          <span className="text-[10px] mt-0.5">{t('Upload', 'ارفع')}</span>
                        </button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <p className="text-xs text-slate-400">{t('PNG, JPG or SVG — max 2MB', 'PNG, JPG أو SVG — أقصى 2 ميجابايت')}</p>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      {t('Name / Business Name', 'الاسم / اسم النشاط')} *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('e.g. Ahmed Al-Shamri', 'مثال: أحمد الشمري')}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Title (not for sticker/keychain) */}
                  {productType !== 'sticker' && productType !== 'keychain' && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        {t('Job Title / Tagline', 'المسمى الوظيفي / الوصف')}
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('e.g. CEO @ Company', 'مثال: المدير التنفيذي @ الشركة')}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  )}

                  {/* Contact fields for card & stand */}
                  {(productType === 'card' || productType === 'stand') && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                            {t('Phone', 'الهاتف')}
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+966..."
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                            {t('Email', 'البريد')}
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          {t('Website', 'الموقع الإلكتروني')}
                        </label>
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://..."
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      {t('Additional Notes', 'ملاحظات إضافية')}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder={t('Any special instructions for the design team...', 'أي تعليمات خاصة لفريق التصميم...')}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Preview & Confirm */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {t('Review & Order', 'مراجعة وطلب')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  {t('Confirm your customization and add to cart', 'أكد التخصيص وأضفه إلى السلة')}
                </p>

                {/* Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t('Product', 'المنتج')}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {isRTL ? PRODUCT_TYPES.find(p => p.key === productType)?.labelAr : PRODUCT_TYPES.find(p => p.key === productType)?.labelEn}
                    </span>
                  </div>
                  {productType === 'card' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('Material', 'الخامة')}</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {isRTL ? CARD_MATERIALS.find(m => m.key === material)?.labelAr : CARD_MATERIALS.find(m => m.key === material)?.labelEn}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('Color', 'اللون')}</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {material === 'metal' ? (isRTL ? METAL_COLORS.find(c => c.key === color)?.labelAr : METAL_COLORS.find(c => c.key === color)?.labelEn)
                            : material === 'wood' ? (isRTL ? WOOD_COLORS.find(c => c.key === color)?.labelAr : WOOD_COLORS.find(c => c.key === color)?.labelEn)
                            : t('UV Print', 'طباعة UV')}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t('Name', 'الاسم')}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{name || '—'}</span>
                  </div>
                  {title && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('Title', 'المسمى')}</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{title}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{t('Total', 'الإجمالي')}</span>
                    <span className="text-lg font-bold text-teal-600">{price} SAR</span>
                  </div>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-600/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t('Add to Cart & Checkout', 'أضف إلى السلة وأكمل الشراء')}
                </button>

                {!isAuthenticated && (
                  <p className="text-xs text-slate-400 text-center mt-3">
                    {t('You will be asked to log in to save your design', 'سيُطلب منك تسجيل الدخول لحفظ تصميمك')}
                  </p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => step > 0 && setStep(step - 1)}
                disabled={step === 0}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  step === 0
                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                {t('Back', 'رجوع')}
              </button>

              {step < totalSteps - 1 ? (
                <button
                  onClick={() => canGoNext() && setStep(step + 1)}
                  disabled={!canGoNext()}
                  className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    canGoNext()
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {t('Next', 'التالي')}
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <button
                  onClick={() => setStep(0)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('Start Over', 'ابدأ من جديد')}
                </button>
              )}
            </div>
          </motion.div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-32">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 text-center">
                {t('Live Preview', 'معاينة مباشرة')}
              </h3>
              <div className="flex justify-center py-8">
                <CardPreview
                  config={{ productType, material, color, name, title, phone, email, website, logoFile, logoPreview }}
                  isRTL={isRTL}
                />
              </div>
              {/* Price tag */}
              <div className="mt-6 text-center">
                <span className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-bold text-lg px-5 py-2 rounded-full border border-teal-200 dark:border-teal-800">
                  {price} SAR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
