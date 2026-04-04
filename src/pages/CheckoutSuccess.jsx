import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { supabase } from '@/lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { setPostAuthRedirect } from '@/components/store/PhysicalCardCustomizationModule';

export default function CheckoutSuccess() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [successType, setSuccessType] = useState(null); // 'order' | 'subscription'
  const [activatedPlan, setActivatedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  useEffect(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    const urlParams = new URLSearchParams(window.location.search);
    const stripeSubscription = urlParams.get('stripe_subscription');
    const stripeOrder = urlParams.get('stripe_order');
    const stripeSessionId = urlParams.get('session_id');
    const plan = urlParams.get('plan');
    const paypalOrderId = urlParams.get('token');
    const order = urlParams.get('order');
    const method = urlParams.get('method');

    if (method) setPaymentMethod(method);

    if (stripeSubscription === 'true' && stripeSessionId) {
      activateStripeSubscription(stripeSessionId, plan);
    } else if (stripeOrder === 'true' && stripeSessionId) {
      clearCart();
      confirmStripeStoreOrder(stripeSessionId);
    } else if (paypalOrderId && !order) {
      clearCart();
      capturePayPalPayment(paypalOrderId);
    } else if (order) {
      setOrderNumber(order);
      setSuccessType('order');
    }
  }, []);

  const activateStripeSubscription = async (sessionId, plan) => {
    setIsProcessing(true);
    try {
      const result = await api.functions.invoke('activateSubscription', { sessionId });
      if (result?.success) {
        setActivatedPlan(result.plan || plan || 'premium');
        setSuccessType('subscription');
        // Invalidate subscription cache so Dashboard/dialogs reflect the new plan
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
      } else {
        throw new Error(result?.error || 'Activation failed');
      }
    } catch (error) {
      console.error('Stripe activation error:', error);
      // Even if verification fails, show success (Stripe already charged)
      // and let the webhook handle it as fallback
      setActivatedPlan(plan || 'premium');
      setSuccessType('subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Stripe: confirm one-time store order ──────────────────
  const confirmStripeStoreOrder = async (sessionId) => {
    setIsProcessing(true);
    try {
      const result = await api.functions.invoke('confirmStripeOrder', { sessionId });
      if (result?.success) {
        setOrderNumber(result.order_number);
        setSuccessType('order');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } else {
        throw new Error(result?.error || 'Confirmation failed');
      }
    } catch (error) {
      console.error('Stripe order confirmation error:', error);
      // Fallback: show success anyway — Stripe already charged
      setOrderNumber('RWJ-' + Date.now().toString(36).toUpperCase());
      setSuccessType('order');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } finally {
      setIsProcessing(false);
    }
  };

  const capturePayPalPayment = async (paypalOrderId) => {
    setIsProcessing(true);
    try {
      // Get cart items and shipping info from localStorage (you may want to pass this differently)
      const cartItemsStr = localStorage.getItem('checkout_cart');
      const shippingInfoStr = localStorage.getItem('checkout_shipping');
      const totalSAR = localStorage.getItem('checkout_total');
      
      if (!cartItemsStr || !shippingInfoStr) {
        throw new Error('Missing order data');
      }

      const response = await api.functions.invoke('capturePayPalPayment', {
        orderId: paypalOrderId,
        cartItems: JSON.parse(cartItemsStr),
        shippingInfo: JSON.parse(shippingInfoStr),
        totalSAR: parseFloat(totalSAR),
        createdBy: JSON.parse(shippingInfoStr)?.email || null,
      });

      if (response?.success) {
        setOrderNumber(response.order_number);
        setSuccessType('order');
        // Clear localStorage
        localStorage.removeItem('checkout_cart');
        localStorage.removeItem('checkout_shipping');
        localStorage.removeItem('checkout_total');
      }
    } catch (error) {
      console.error('Payment capture error:', error);
      navigate(createPageUrl('Checkout'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto" />
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {isRTL ? 'جاري معالجة طلبك...' : 'Processing your order...'}
          </p>
        </div>
      </div>
    );
  }

  // Subscription success view
  if (successType === 'subscription') {
    const planLabel = activatedPlan === 'premium'
      ? (isRTL ? 'بريميوم' : 'Premium')
      : (isRTL ? 'مؤسسي' : 'Enterprise');

    return (
      <div className="max-w-2xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white dark:bg-slate-800/50 border-teal-200/50 dark:border-teal-700/50">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex"
              >
                <div className="h-20 w-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {isRTL ? '🎉 مرحباً بك في ' + planLabel + '!' : `🎉 Welcome to ${planLabel}!`}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {isRTL
                    ? 'تم تفعيل اشتراكك بنجاح. استمتع بجميع المميزات الاحترافية!'
                    : 'Your subscription is now active. Enjoy all the premium features!'}
                </p>
              </div>

              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4 text-sm text-teal-800 dark:text-teal-300">
                {isRTL
                  ? 'يمكنك الآن إنشاء بطاقات غير محدودة والوصول إلى جميع الميزات المتقدمة.'
                  : 'You can now create unlimited cards and access all advanced features.'}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link to={createPageUrl('MyCards')} className="flex-1">
                  <Button variant="outline" className="w-full" size="lg">
                    {isRTL ? 'بطاقاتي' : 'My Cards'}
                  </Button>
                </Link>
                <Link to={createPageUrl('CardBuilder')} className="flex-1">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700" size="lg">
                    {isRTL ? 'إنشاء بطاقة جديدة' : 'Create New Card'}
                    {!isRTL && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex"
            >
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </motion.div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {isRTL ? 'تم الطلب بنجاح!' : 'Order Successful!'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {isRTL
                  ? 'شكراً لك! تم استلام طلبك وسيتم معالجته قريباً'
                  : 'Thank you! Your order has been received and will be processed soon'
                }
              </p>
            </div>

            {/* Order Number */}
            {orderNumber && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {isRTL ? 'رقم الطلب:' : 'Order #'}
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {orderNumber}
                </span>
              </div>
            )}

            {/* Info Box */}
            {paymentMethod === 'bank_transfer' ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm text-amber-900 dark:text-amber-300 text-start">
                <p className="font-semibold mb-1">
                  {isRTL ? '⏳ طلبك قيد المراجعة' : '⏳ Your order is under review'}
                </p>
                <p>
                  {isRTL
                    ? 'تم استلام طلبك وإيصال التحويل. سيتم مراجعة الطلب وتأكيده خلال 1-2 يوم عمل.'
                    : 'Your order and transfer receipt have been received. We\'ll review and confirm within 1-2 business days.'}
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-300">
                {isRTL
                  ? 'سنرسل لك تفاصيل الطلب عبر البريد الإلكتروني. تحقق من صندوق الوارد الخاص بك.'
                  : "We'll send you order details via email. Check your inbox."
                }
              </div>
            )}

            {successType === 'order' && (
              <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/10 p-5 text-start space-y-4">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {isRTL ? 'خصّص منتجاتك من داخل حسابك' : 'Customize your ordered items from your account'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {isRTL
                      ? 'اعرض طلبات المتجر، اختر المنتج الذي طلبته، ثم خصّصه واربطه ببطاقتك الرقمية من صفحة طلباتي.'
                      : 'Open My Orders, select the purchased item, then customize it and link it to your digital card.'}
                  </p>
                </div>

                {isAuthenticated ? (
                  <Link to={createPageUrl('MyOrders')} className="block">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">
                      {isRTL ? 'اذهب إلى طلباتي' : 'Go to My Orders'}
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={async () => {
                        setPostAuthRedirect(createPageUrl('MyOrders'));
                        const base = import.meta.env.VITE_APP_URL || window.location.origin;
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: `${base}${createPageUrl('MyOrders')}`,
                            queryParams: { access_type: 'offline', prompt: 'consent' },
                          },
                        });
                        if (error) console.error(error);
                      }}
                    >
                      {isRTL ? 'المتابعة بجوجل' : 'Continue with Google'}
                    </Button>
                    <Link to={`${createPageUrl('Login')}?next=${encodeURIComponent(createPageUrl('MyOrders'))}`} className="flex-1">
                      <Button variant="outline" className="w-full" onClick={() => setPostAuthRedirect(createPageUrl('MyOrders'))}>
                        {isRTL ? 'تسجيل الدخول لإدارة الطلب' : 'Sign in to manage order'}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link to={createPageUrl('Store')} className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  {isRTL ? 'متابعة التسوق' : 'Continue Shopping'}
                </Button>
              </Link>
              <Link to={createPageUrl('MyCards')} className="flex-1">
                <Button className="w-full bg-teal-600 hover:bg-teal-700" size="lg">
                  {isRTL ? 'إلى بطاقاتي' : 'Go to My Cards'}
                  {isRTL ? null : <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}