import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { supabase } from '@/lib/supabaseClient';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/landing/Navbar';
import {
  ArrowLeft,
  ArrowRight,
  Truck,
  Loader2,
  ShoppingBag,
  CreditCard,
  Shield,
  Check,
  ChevronRight,
  Building2,
  Upload,
  X,
  ImageIcon,
  Copy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/lib/AuthContext';

// ── Bank details — edit these to match your account ─────────
const BANK_DETAILS = {
  bankName:    'البنك الأهلي السعودي',
  bankNameEn:  'Saudi National Bank (SNB)',
    accountName: 'العلامة الثلاثية',
    accountNameEn: 'Triple Mark',
    iban:        'SA4310000001400005984607',
    accountNo:   '01400005984607',
};

// ── Payment method options ───────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'stripe',
      label: 'Card',
      labelAr: 'بطاقة',
    color: 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/20',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    labelAr: 'PayPal',
    color: 'border-slate-200 dark:border-slate-700',
  },
  {
    id: 'bank_transfer',
      label: 'Bank',
      labelAr: 'تحويل',
    color: 'border-slate-200 dark:border-slate-700',
  },
];

const COUNTRY_CODES = [
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE', nameAr: 'الإمارات' },
  { code: 'KW', dial: '+965', flag: '🇰🇼', name: 'Kuwait', nameAr: 'الكويت' },
  { code: 'QA', dial: '+974', flag: '🇶🇦', name: 'Qatar', nameAr: 'قطر' },
  { code: 'BH', dial: '+973', flag: '🇧🇭', name: 'Bahrain', nameAr: 'البحرين' },
  { code: 'OM', dial: '+968', flag: '🇴🇲', name: 'Oman', nameAr: 'عُمان' },
  { code: 'EG', dial: '+20', flag: '🇪🇬', name: 'Egypt', nameAr: 'مصر' },
];

const SAUDI_CITIES = [
  'Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'Dammam', 'Khobar', 'Dhahran', 'Taif',
  'Tabuk', 'Abha', 'Khamis Mushait', 'Najran', 'Jazan', 'Hail', 'Qassim', 'Buraidah',
  'Al Ahsa', 'Jubail', 'Yanbu', 'Al Khafji',
];

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const normalizePhone = (countryCode, input) => {
  let digits = String(input || '').replace(/\D/g, '');

  if (countryCode === '+966') {
    if (digits.startsWith('966')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);
    const valid = /^5\d{8}$/.test(digits);
    return {
      valid,
      formatted: valid ? `+966${digits}` : '',
      local: digits,
    };
  }

  if (digits.startsWith('0')) digits = digits.slice(1);
  const valid = digits.length >= 6 && digits.length <= 14;
  return {
    valid,
    formatted: valid ? `${countryCode}${digits}` : '',
    local: digits,
  };
};

// ── Helpers ───────────────────────────────────────────────────
async function uploadReceiptFile(file) {
  const bucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'avatars';
  const ext    = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path   = `receipts/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  try {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch {
    // fallback: base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

export default function Checkout() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  const submitShippingRef = useRef(null);
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [countryCode, setCountryCode] = useState('+966');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Saudi Arabia',
  });

  // Bank transfer state
  const [receiptFile, setReceiptFile]       = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [receiptUploading, setReceiptUploading] = useState(false);

  // Cart from global context (localStorage)
  const { items: cartItems, clearCart } = useCart();

  const normalizedCartItems = cartItems.map((i, idx) => ({
    product_name:
      i.product_name || i.product_name_ar || i.name || i.title || `Rawaj Item ${idx + 1}`,
    product_price: Number(i.product_price) || 0,
    quantity: Math.max(1, Number(i.quantity) || 1),
    product_image: i.product_image || i.image || i.image_url || '',
  }));

  const total = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const freeShipping = total >= 250;

  const formatPrice = (price, currency = 'SAR') =>
    new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', { style: 'currency', currency }).format(price);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() =>
      toast.success(isRTL ? 'تم النسخ!' : 'Copied!')
    );
  };

  const handleReceiptSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeReceipt = () => { setReceiptFile(null); setReceiptPreview(null); };

  // ── Stripe ────────────────────────────────────────────────
  const stripeOrderMutation = useMutation({
    mutationFn: async () => {
      return await api.functions.invoke('createStripeOrderCheckout', {
        cartItems: normalizedCartItems,
        shippingInfo: submitShippingRef.current || shippingInfo,
      });
    },
    onSuccess: (data) => {
      if (data?.url) { window.location.href = data.url; }
      else {
        const msg = data?.error || (isRTL ? 'خطأ في رابط الدفع' : 'Payment link error');
        console.error('[Stripe checkout] no URL in response:', data);
        toast.error(msg);
      }
    },
    onError: (err) => {
      console.error('[Stripe checkout error]', err);
      const msg = err?.message || '';
      // Show Stripe's own error if it came through, otherwise generic
      toast.error(msg || (isRTL ? 'حدث خطأ في الدفع' : 'Payment error. Please try again.'));
    },
  });

  // ── PayPal ────────────────────────────────────────────────
  const createPayPalOrderMutation = useMutation({
    mutationFn: async () => {
      return await api.functions.invoke('createPayPalOrder', {
        amount: total,
        orderData: { cartItems: normalizedCartItems, shippingInfo: submitShippingRef.current || shippingInfo },
      });
    },
    onSuccess: (data) => {
      if (data?.approvalUrl) {
        localStorage.setItem('checkout_cart', JSON.stringify(cartItems));
        localStorage.setItem('checkout_shipping', JSON.stringify(submitShippingRef.current || shippingInfo));
        localStorage.setItem('checkout_total', total.toString());
        window.location.href = data.approvalUrl;
      } else {
        toast.error(isRTL ? 'خطأ في رابط الدفع' : 'Payment link error');
      }
    },
    onError: () => toast.error(isRTL ? 'حدث خطأ في الدفع' : 'Payment error'),
  });

  // ── Bank Transfer ─────────────────────────────────────────
  const bankTransferMutation = useMutation({
    mutationFn: async () => {
      setReceiptUploading(true);
      let receiptUrl = null;
      if (receiptFile) {
        receiptUrl = await uploadReceiptFile(receiptFile);
      }
      setReceiptUploading(false);

      const orderNumber = 'RWJ-' + Date.now().toString(36).toUpperCase();
      const { error } = await supabase.from('orders').insert({
        amount: total,
        currency: 'SAR',
        status: 'pending',
        user_id: user?.id || null,
        created_by: user?.email || null,
        created_by_user_id: user?.id || null,
        metadata: {
          order_number: orderNumber,
          payment_method: 'bank_transfer',
          receipt_url: receiptUrl,
          shippingInfo: submitShippingRef.current || shippingInfo,
          cartItems: normalizedCartItems,
        },
      });
      if (error) throw error;
      return orderNumber;
    },
    onSuccess: (orderNumber) => {
      clearCart();
      navigate(`/CheckoutSuccess?order=${orderNumber}&method=bank_transfer`);
    },
    onError: (err) => {
      setReceiptUploading(false);
      const detail = err?.message || ((err && typeof err === 'object' && 'details' in err) ? String(err.details || '') : '');
      toast.error(
        isRTL
          ? `فشل تقديم الطلب${detail ? ': ' + detail : ''}`
          : `Failed to place order${detail ? ': ' + detail : '. Please try again.'}`
      );
      console.error('Bank transfer order error:', err);
    },
  });

  const isPending = stripeOrderMutation.isPending || createPayPalOrderMutation.isPending || bankTransferMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (!isValidEmail(shippingInfo.email)) {
      toast.error(isRTL ? 'البريد الإلكتروني غير صالح' : 'Please enter a valid email address');
      return;
    }

    const phone = normalizePhone(countryCode, shippingInfo.phone);
    if (!phone.valid) {
      toast.error(
        countryCode === '+966'
          ? (isRTL ? 'رقم السعودية غير صالح (مثال: 5XXXXXXXX)' : 'Invalid Saudi phone number (example: 5XXXXXXXX)')
          : (isRTL ? 'رقم الهاتف غير صالح' : 'Invalid phone number')
      );
      return;
    }

    const finalShippingInfo = {
      ...shippingInfo,
      email: shippingInfo.email.trim(),
      phone: phone.formatted,
      country: 'Saudi Arabia',
    };

    localStorage.setItem('checkout_prefill', JSON.stringify({
      name: finalShippingInfo.name,
      phone: finalShippingInfo.phone,
      email: finalShippingInfo.email,
    }));
    submitShippingRef.current = finalShippingInfo;

    if (paymentMethod === 'bank_transfer' && !receiptFile) {
      toast.error(isRTL ? 'يرجى رفع إيصال التحويل البنكي' : 'Please upload your bank transfer receipt');
      return;
    }
    if (paymentMethod === 'stripe') { stripeOrderMutation.mutate(); }
    else if (paymentMethod === 'paypal') { createPayPalOrderMutation.mutate(); }
    else { bankTransferMutation.mutate(); }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-32 px-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('emptyCart')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {isRTL ? 'أضف بعض المنتجات للمتابعة' : 'Add some products to continue'}
          </p>
          <Link to={createPageUrl('Store')}><Button>{t('continueShopping')}</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="max-w-5xl mx-auto pt-28 pb-16 px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">
          {t('checkout')}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Payment */}
            <div className="lg:col-span-2 space-y-6">

              {/* Shipping Info */}
              <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {isRTL ? 'معلومات الشحن' : 'Shipping Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الاسم الكامل' : 'Full Name'} *</Label>
                      <Input value={shippingInfo.name} onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'} *</Label>
                        <Input type="email" value={shippingInfo.email} onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })} required />
                    </div>
                  </div>

                    <div className="space-y-2">
                      <Label>{isRTL ? 'رقم الهاتف' : 'Phone Number'} *</Label>
                      <div className="flex gap-2">
                        <select
                          className="h-10 rounded-md border border-input bg-background px-2 text-sm"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.dial}>
                              {`${c.flag} ${c.dial}`}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          placeholder={countryCode === '+966' ? '5XXXXXXXX' : 'Phone number'}
                          required
                        />
                      </div>
                    </div>

                  <div className="space-y-2">
                    <Label>{isRTL ? 'العنوان' : 'Address'} *</Label>
                    <Textarea value={shippingInfo.address} onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} rows={2} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'المدينة' : 'City'} *</Label>
                        <Input list="sa-cities" value={shippingInfo.city} onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })} placeholder={isRTL ? 'ابدأ بكتابة اسم المدينة' : 'Start typing city name'} required />
                        <datalist id="sa-cities">
                          {SAUDI_CITIES.map((city) => <option key={city} value={city} />)}
                        </datalist>
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'البلد' : 'Country'}</Label>
                        <Input value={isRTL ? 'المملكة العربية السعودية' : 'Saudi Arabia'} readOnly className="bg-slate-50 dark:bg-slate-800" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-teal-600" />
                    {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <motion.div
                      key={method.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        'relative flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[54px]',
                        paymentMethod === method.id
                          ? method.color
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      )}
                    >
                      <div className={cn(
                        'w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors',
                        paymentMethod === method.id ? 'border-teal-600 bg-teal-600' : 'border-slate-300 dark:border-slate-600'
                      )}>
                        {paymentMethod === method.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm whitespace-nowrap">
                        {isRTL ? method.labelAr : method.label}
                      </span>
                      {/* Logo */}
                      {method.id === 'stripe' && (
                        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                          <div className="h-6 px-2 bg-[#1a1f71] rounded flex items-center">
                            <span className="text-white text-[10px] font-black italic">VISA</span>
                          </div>
                          <div className="h-6 w-9 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                            <div className="relative w-5 h-4">
                              <div className="absolute left-0 top-0 w-3 h-4 rounded-full bg-red-500 opacity-90" />
                              <div className="absolute right-0 top-0 w-3 h-4 rounded-full bg-yellow-400 opacity-90" />
                            </div>
                          </div>
                          <div className="h-6 px-1.5 bg-[#00a76f] rounded flex items-center">
                            <span className="text-white text-[10px] font-bold">mada</span>
                          </div>
                        </div>
                      )}
                      {method.id === 'paypal' && (
                        <div className="h-6 px-2 bg-[#003087] rounded flex items-center flex-shrink-0">
                          <span className="text-white text-[10px] font-black">Pay</span>
                          <span className="text-[#009cde] text-[10px] font-black">Pal</span>
                        </div>
                      )}
                      {method.id === 'bank_transfer' && (
                        <div className="h-6 px-2 bg-green-700 rounded flex items-center gap-1 flex-shrink-0">
                          <Building2 className="h-3 w-3 text-white" />
                          <span className="text-white text-[10px] font-bold">BANK</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  </div>

                  {/* Stripe security note */}
                  <AnimatePresence>
                    {paymentMethod === 'stripe' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-start gap-2 mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <Shield className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {isRTL
                              ? 'يتم معالجة مدفوعاتك بأمان عبر Stripe. لا نخزن أي بيانات بطاقتك مطلقاً.'
                              : 'Payments are processed securely via Stripe. We never store your card details.'}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Bank Transfer: details + receipt upload */}
                    {paymentMethod === 'bank_transfer' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 overflow-hidden">
                          {/* Bank account info */}
                          <div className="p-4 space-y-3">
                            <p className="text-sm font-semibold text-green-800 dark:text-green-300 flex items-center gap-1.5">
                              <Building2 className="h-4 w-4" />
                              {isRTL ? 'معلومات الحساب البنكي' : 'Bank Account Details'}
                            </p>

                            {[
                              { labelAr: 'البنك',             labelEn: 'Bank',              value: isRTL ? BANK_DETAILS.bankName    : BANK_DETAILS.bankNameEn },
                              { labelAr: 'رقم الحساب البنكي', labelEn: 'Account Holder',    value: isRTL ? BANK_DETAILS.accountName : BANK_DETAILS.accountNameEn },
                              { labelAr: 'رقم حساب',          labelEn: 'Account Number',    value: BANK_DETAILS.accountNo },
                              { labelAr: 'آيبان',             labelEn: 'IBAN',              value: BANK_DETAILS.iban },
                            ].map((row, i) => (
                              <div key={i} className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 rounded-lg px-3 py-2">
                                <div>
                                  <p className="text-xs text-slate-400 dark:text-slate-500">{isRTL ? row.labelAr : row.labelEn}</p>
                                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-mono tracking-wide">{row.value}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(row.value)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-teal-600 transition-colors flex-shrink-0"
                                  title={isRTL ? 'نسخ' : 'Copy'}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}

                            <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
                              {isRTL
                                ? `يرجى تحويل مبلغ ${formatPrice(total)} ثم رفع إيصال التحويل أدناه لتأكيد الطلب.`
                                : `Please transfer ${formatPrice(total)} to the above account, then upload your receipt below to confirm the order.`}
                            </p>
                          </div>

                          <Separator className="bg-green-200 dark:bg-green-800" />

                          {/* Receipt upload */}
                          <div className="p-4">
                            <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-1.5">
                              <Upload className="h-4 w-4" />
                              {isRTL ? 'رفع إيصال التحويل *' : 'Upload Transfer Receipt *'}
                            </p>

                            <input
                              ref={receiptRef}
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={handleReceiptSelect}
                            />

                            {receiptPreview ? (
                              <div className="relative rounded-xl overflow-hidden border-2 border-green-400 dark:border-green-600">
                                {receiptFile?.type?.startsWith('image/') ? (
                                  <img
                                    src={receiptPreview}
                                    alt="Receipt"
                                    className="w-full max-h-48 object-contain bg-slate-100 dark:bg-slate-800"
                                  />
                                ) : (
                                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800">
                                    <ImageIcon className="h-8 w-8 text-teal-600 flex-shrink-0" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                      {receiptFile?.name}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => receiptRef.current?.click()}
                                    className="p-1.5 bg-teal-600 text-white rounded-full shadow hover:bg-teal-700 transition-colors"
                                    title={isRTL ? 'استبدال' : 'Replace'}
                                  >
                                    <Upload className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={removeReceipt}
                                    className="p-1.5 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
                                    title={isRTL ? 'حذف' : 'Remove'}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                <div className="px-3 py-2 bg-green-100 dark:bg-green-900/20 flex items-center gap-1.5">
                                  <Check className="h-3.5 w-3.5 text-green-600" />
                                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                    {isRTL ? 'تم اختيار الإيصال' : 'Receipt selected'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => receiptRef.current?.click()}
                                className="w-full h-32 rounded-xl border-2 border-dashed border-green-300 dark:border-green-700 flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all"
                              >
                                <div className="p-2.5 rounded-full bg-green-100 dark:bg-green-900/20">
                                  <Upload className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                    {isRTL ? 'انقر لرفع الإيصال' : 'Click to upload receipt'}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {isRTL ? 'صورة أو PDF' : 'Image or PDF'}
                                  </p>
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 sticky top-24">
                <CardHeader>
                  <CardTitle>{isRTL ? 'ملخص الطلب' : 'Order Summary'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-lg font-bold text-slate-400">
                              {item.product_name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product_name}</p>
                          <p className="text-xs text-slate-500">x{item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.product_price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isRTL ? 'الشحن' : 'Shipping'}</span>
                      {freeShipping
                        ? <span className="text-green-600 font-medium">{isRTL ? 'مجاني' : 'Free'}</span>
                        : <span className="text-slate-500">{isRTL ? 'سيتم تحديده' : 'Calculated at next step'}</span>}
                    </div>
                    {!freeShipping && (
                      <p className="text-xs text-teal-600">
                        {isRTL
                          ? `أضف ${formatPrice(250 - total)} للحصول على شحن مجاني`
                          : `Add ${formatPrice(250 - total)} for free shipping`}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-base font-bold">
                    <span>{t('total')}</span>
                    <span className="text-teal-600 dark:text-teal-400">{formatPrice(total)}</span>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className={cn(
                      'w-full font-bold text-white',
                      paymentMethod === 'stripe'       ? 'bg-teal-600 hover:bg-teal-700'
                      : paymentMethod === 'paypal'     ? 'bg-[#003087] hover:bg-[#002070]'
                      :                                  'bg-green-700 hover:bg-green-800'
                    )}
                    size="lg"
                    disabled={isPending || receiptUploading}
                  >
                    {(isPending || receiptUploading) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {receiptUploading
                          ? (isRTL ? 'جاري رفع الإيصال...' : 'Uploading receipt...')
                          : (isRTL ? 'جاري المعالجة...' : 'Processing...')}
                      </>
                    ) : paymentMethod === 'stripe' ? (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {isRTL ? 'الدفع بالبطاقة' : 'Pay with Card'}
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </>
                    ) : paymentMethod === 'paypal' ? (
                      <>
                        {isRTL ? 'الدفع عبر PayPal' : 'Pay with PayPal'}
                        {isRTL ? <ArrowLeft className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 ml-2" />}
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4 mr-2" />
                        {isRTL ? 'تأكيد الطلب' : 'Confirm Order'}
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </>
                    )}
                  </Button>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-4 pt-1">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Shield className="h-3.5 w-3.5" />
                      {isRTL ? 'دفع آمن' : 'Secure checkout'}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Check className="h-3.5 w-3.5" />
                      {isRTL ? 'مشفر SSL' : 'SSL Encrypted'}
                    </div>
                  </div>

                  <Link to={createPageUrl('Store')} className="block text-center">
                    <Button variant="ghost" size="sm">{t('continueShopping')}</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
