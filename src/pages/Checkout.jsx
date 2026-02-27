import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

// ── Payment method options ───────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'stripe',
    label: 'Credit / Debit Card',
    labelAr: 'بطاقة ائتمان / خصم',
    desc: 'Visa, Mastercard, Mada — secured by Stripe',
    descAr: 'فيزا، ماستركارد، مدى — مؤمَّن بـ Stripe',
    badge: 'Recommended',
    badgeAr: 'موصى به',
    color: 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/20',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    labelAr: 'PayPal',
    desc: 'Pay securely with your PayPal account',
    descAr: 'ادفع بأمان عبر حساب PayPal',
    badge: null,
    color: 'border-slate-200 dark:border-slate-700',
  },
];

export default function Checkout() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: 'Saudi Arabia',
  });

  // Cart from global context (localStorage)
  const { items: cartItems, clearCart } = useCart();
  const isLoading = false;

  const total = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const totalUSD = (total * 0.27).toFixed(2);
  const freeShipping = total >= 250;

  const formatPrice = (price, currency = 'SAR') =>
    new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', { style: 'currency', currency }).format(price);

  // ── Stripe: one-time card payment ─────────────────────────
  const stripeOrderMutation = useMutation({
    mutationFn: async () => {
      const result = await api.functions.invoke('createStripeOrderCheckout', {
        cartItems: cartItems.map((i) => ({
          product_name: i.product_name,
          product_price: i.product_price,
          quantity: i.quantity,
          product_image: i.product_image,
        })),
        shippingInfo,
      });
      return result.data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error(data?.error || (isRTL ? 'خطأ في رابط الدفع' : 'Payment link error'));
      }
    },
    onError: () => toast.error(isRTL ? 'حدث خطأ في الدفع' : 'Payment error'),
  });

  // ── PayPal order ───────────────────────────────────────────
  const createPayPalOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await api.functions.invoke('createPayPalOrder', {
        amount: total,
        orderData: { cartItems, shippingInfo },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.approvalUrl) {
        localStorage.setItem('checkout_cart', JSON.stringify(cartItems));
        localStorage.setItem('checkout_shipping', JSON.stringify(shippingInfo));
        localStorage.setItem('checkout_total', total.toString());
        window.location.href = data.approvalUrl;
      } else {
        toast.error(isRTL ? 'خطأ في رابط الدفع' : 'Payment link error');
      }
    },
    onError: () => toast.error(isRTL ? 'حدث خطأ في الدفع' : 'Payment error'),
  });

  const isPending = stripeOrderMutation.isPending || createPayPalOrderMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    if (paymentMethod === 'stripe') {
      stripeOrderMutation.mutate();
    } else {
      createPayPalOrderMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-32 px-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {t('emptyCart')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {isRTL ? 'أضف بعض المنتجات للمتابعة' : 'Add some products to continue'}
          </p>
          <Link to={createPageUrl('Store')}>
            <Button>
              {t('continueShopping')}
            </Button>
          </Link>
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
                    <Input
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'رقم الهاتف' : 'Phone Number'} *</Label>
                    <Input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'العنوان' : 'Address'} *</Label>
                  <Textarea
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'المدينة' : 'City'} *</Label>
                    <Input
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'البلد' : 'Country'}</Label>
                    <Input
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                    />
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
                {PAYMENT_METHODS.map((method) => (
                  <motion.div
                    key={method.id}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      'relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                      paymentMethod === method.id
                        ? method.color
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    )}
                  >
                    {/* Radio indicator */}
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        paymentMethod === method.id
                          ? 'border-teal-600 bg-teal-600'
                          : 'border-slate-300 dark:border-slate-600'
                      )}
                    >
                      {paymentMethod === method.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Text info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">
                          {isRTL ? method.labelAr : method.label}
                        </span>
                        {method.badge && (
                          <Badge className="bg-teal-600 text-white text-[10px] px-1.5 py-0 h-4">
                            {isRTL ? method.badgeAr : method.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isRTL ? method.descAr : method.desc}
                      </p>
                    </div>

                    {/* Logo */}
                    {method.id === 'stripe' ? (
                      <div className="flex items-center gap-1 flex-shrink-0">
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
                    ) : (
                      <div className="h-6 px-2 bg-[#003087] rounded flex items-center flex-shrink-0">
                        <span className="text-white text-[10px] font-black">Pay</span>
                        <span className="text-[#009cde] text-[10px] font-black">Pal</span>
                      </div>
                    )}
                  </motion.div>
                ))}

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
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
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
                    {freeShipping ? (
                      <span className="text-green-600 font-medium">{isRTL ? 'مجاني' : 'Free'}</span>
                    ) : (
                      <span className="text-slate-500">{isRTL ? 'سيتم تحديده' : 'Calculated at next step'}</span>
                    )}
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
                    paymentMethod === 'stripe'
                      ? 'bg-teal-600 hover:bg-teal-700'
                      : 'bg-[#003087] hover:bg-[#002070]'
                  )}
                  size="lg"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isRTL ? 'جاري التوجيه للدفع...' : 'Redirecting to payment...'}
                    </>
                  ) : paymentMethod === 'stripe' ? (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isRTL ? 'الدفع بالبطاقة' : 'Pay with Card'}
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </>
                  ) : (
                    <>
                      {isRTL ? 'الدفع عبر PayPal' : 'Pay with PayPal'}
                      {isRTL ? <ArrowLeft className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 ml-2" />}
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
                  <Button variant="ghost" size="sm">
                    {t('continueShopping')}
                  </Button>
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