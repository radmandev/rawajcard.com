import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowRight, 
  Truck,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Checkout() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: 'Saudi Arabia'
  });

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.entities.CartItem.list()
  });

  const total = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const totalUSD = (total * 0.27).toFixed(2);

  // Create PayPal order mutation
  const createPayPalOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await api.functions.invoke('createPayPalOrder', {
        amount: total,
        orderData: { cartItems, shippingInfo }
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('PayPal order created:', data);
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        toast.error(isRTL ? 'خطأ في رابط الدفع' : 'Payment link error');
      }
    },
    onError: (error) => {
      console.error('PayPal error:', error);
      toast.error(isRTL ? 'حدث خطأ في الدفع' : 'Payment error');
    }
  });

  const formatPrice = (price, currency = 'SAR') => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    
    // Store checkout data in localStorage for PayPal callback
    localStorage.setItem('checkout_cart', JSON.stringify(cartItems));
    localStorage.setItem('checkout_shipping', JSON.stringify(shippingInfo));
    localStorage.setItem('checkout_total', total.toString());
    createPayPalOrderMutation.mutate();
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
      <div className="max-w-md mx-auto text-center py-16">
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
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>{formatPrice(total, 'SAR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{isRTL ? 'الشحن' : 'Shipping'}</span>
                    <span className="text-green-600">{isRTL ? 'مجاني' : 'Free'}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>{t('total')} (SAR)</span>
                    <span>{formatPrice(total, 'SAR')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('total')} (USD)</span>
                    <span className="text-teal-600">{formatPrice(totalUSD, 'USD')}</span>
                  </div>
                </div>

                {/* Submit */}
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  disabled={createPayPalOrderMutation.isPending}
                >
                  {createPayPalOrderMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      {isRTL ? 'الدفع عبر PayPal' : 'Pay with PayPal'}
                      {isRTL ? <ArrowLeft className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 ml-2" />}
                    </>
                  )}
                </Button>

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
  );
}