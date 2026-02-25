import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function CheckoutSuccess() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Check for PayPal return
    const urlParams = new URLSearchParams(window.location.search);
    const paypalOrderId = urlParams.get('token');
    const order = urlParams.get('order');
    
    if (paypalOrderId && !order) {
      capturePayPalPayment(paypalOrderId);
    } else if (order) {
      setOrderNumber(order);
    }
  }, []);

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
        totalSAR: parseFloat(totalSAR)
      });

      if (response.data.success) {
        setOrderNumber(response.data.order_number);
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
            {isRTL ? 'جاري معالجة الدفع...' : 'Processing your payment...'}
          </p>
        </div>
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-300">
              {isRTL 
                ? 'سنرسل لك تفاصيل الطلب عبر البريد الإلكتروني. تحقق من صندوق الوارد الخاص بك.'
                : "We'll send you order details via email. Check your inbox."
              }
            </div>

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