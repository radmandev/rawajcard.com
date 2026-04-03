import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabaseClient';
import { api } from '@/api/supabaseAPI';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ArrowRight,
  CreditCard,
  ImagePlus,
  Link2,
  Loader2,
  Package,
  Palette,
  Save,
  ShoppingBag,
  Wifi,
} from 'lucide-react';
import { PREMADE_TEMPLATES, PhysicalCardPreview } from '@/components/store/PhysicalCardCustomizationModule';

const CARD_TYPE_OPTIONS = [
  {
    id: 'business_cards',
    nameEn: 'Business Cards',
    nameAr: 'بطاقات الأعمال',
    variants: ['gold-metal', 'silver-metal', 'black-metal', 'bright-wood', 'dark-wood'],
  },
  {
    id: 'mobile_sticker_keychains',
    nameEn: 'Mobile Sticker & Key Chains',
    nameAr: 'ملصق الجوال والميداليات',
    variants: ['white-circle', 'black-circle'],
  },
  {
    id: 'table_stand',
    nameEn: 'Table Stand',
    nameAr: 'ستاند طاولة',
    variants: ['table-stand'],
  },
];

const parseNotes = (notes) => {
  try {
    return typeof notes === 'string' ? JSON.parse(notes || '{}') : (notes || {});
  } catch {
    return {};
  }
};

const getOrderNumber = (order) => {
  const meta = order?.metadata || {};
  return (meta.order_number || order?.id?.slice(0, 8) || '').toUpperCase();
};

const getShipping = (order) => {
  const meta = order?.metadata || {};
  return meta.shippingInfo || meta.shipping || meta.shipping_address || {};
};

const getOrderItems = (order) => {
  const meta = order?.metadata || {};
  const items = meta.cartItems || meta.items || [];
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => ({
    key: `${order.id}:${index}`,
    index,
    product_id: item.product_id || `${index}`,
    product_name: item.product_name || item.name || `Item ${index + 1}`,
    product_price: Number(item.product_price ?? item.price ?? 0) || 0,
    quantity: Math.max(1, Number(item.quantity) || 1),
    product_image: item.product_image || item.image || '',
  }));
};

const guessCardType = (name = '') => {
  const lower = String(name).toLowerCase();
  if (lower.includes('sticker') || lower.includes('keychain') || lower.includes('key chain')) return 'mobile_sticker_keychains';
  if (lower.includes('stand')) return 'table_stand';
  return 'business_cards';
};

function useQrDataUrl(value) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let mounted = true;
    if (!value?.trim()) {
      setDataUrl('');
      return;
    }
    QRCode.toDataURL(value, { width: 220, margin: 1 })
      .then((url) => {
        if (mounted) setDataUrl(url);
      })
      .catch(() => {
        if (mounted) setDataUrl('');
      });
    return () => {
      mounted = false;
    };
  }, [value]);

  return dataUrl;
}

export default function MyOrders() {
  const { isRTL } = useLanguage();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedItemKey, setSelectedItemKey] = useState(null);

  const [cardType, setCardType] = useState(CARD_TYPE_OPTIONS[0].id);
  const [selectedTemplateId, setSelectedTemplateId] = useState(CARD_TYPE_OPTIONS[0].variants[0]);
  const [stickerContent, setStickerContent] = useState('qr');
  const [tableStandDetails, setTableStandDetails] = useState('');
  const [name, setName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [signature, setSignature] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [picture, setPicture] = useState('');
  const [linkedCardId, setLinkedCardId] = useState('none');

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['my-orders', user?.id, user?.email],
    enabled: Boolean(user?.email || user?.id),
    queryFn: async () => {
      const filters = [];
      if (user?.email) filters.push(`created_by.eq.${user.email}`);
      if (user?.id) filters.push(`created_by_user_id.eq.${user.id}`);
      if (!filters.length) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(filters.join(','))
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: customizations = [] } = useQuery({
    queryKey: ['order-customizations', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('physical_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: digitalCards = [] } = useQuery({
    queryKey: ['my-digital-cards', user?.email],
    enabled: Boolean(user?.email),
    queryFn: async () => api.entities.BusinessCard.filter({ created_by: user.email }),
  });

  useEffect(() => {
    if (!selectedOrderId && orders.length > 0) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || orders[0] || null,
    [orders, selectedOrderId]
  );

  const selectedOrderItems = useMemo(
    () => (selectedOrder ? getOrderItems(selectedOrder) : []),
    [selectedOrder]
  );

  useEffect(() => {
    if (!selectedItemKey && selectedOrderItems.length > 0) {
      setSelectedItemKey(selectedOrderItems[0].key);
    }
  }, [selectedOrderItems, selectedItemKey]);

  const selectedItem = useMemo(
    () => selectedOrderItems.find((item) => item.key === selectedItemKey) || selectedOrderItems[0] || null,
    [selectedOrderItems, selectedItemKey]
  );

  const currentCustomization = useMemo(() => {
    if (!selectedOrder || !selectedItem) return null;
    const orderNumber = getOrderNumber(selectedOrder);
    return customizations.find((record) => {
      const notes = parseNotes(record.notes);
      return record.order_number === orderNumber && notes.item_key === selectedItem.key;
    }) || null;
  }, [customizations, selectedItem, selectedOrder]);

  const selectedCardType = useMemo(
    () => CARD_TYPE_OPTIONS.find((type) => type.id === cardType) || CARD_TYPE_OPTIONS[0],
    [cardType]
  );

  const availableVariants = useMemo(
    () => PREMADE_TEMPLATES.filter((template) => selectedCardType.variants.includes(template.id)),
    [selectedCardType]
  );

  const selectedTemplate = useMemo(
    () => PREMADE_TEMPLATES.find((template) => template.id === selectedTemplateId) || availableVariants[0] || PREMADE_TEMPLATES[0],
    [availableVariants, selectedTemplateId]
  );

  useEffect(() => {
    if (!selectedCardType.variants.includes(selectedTemplateId)) {
      setSelectedTemplateId(selectedCardType.variants[0]);
    }
  }, [selectedCardType, selectedTemplateId]);

  useEffect(() => {
    if (!selectedOrder || !selectedItem) return;

    const shipping = getShipping(selectedOrder);
    const notes = parseNotes(currentCustomization?.notes);
    const guessedType = notes.card_type || guessCardType(selectedItem.product_name);
    const typeConfig = CARD_TYPE_OPTIONS.find((type) => type.id === guessedType) || CARD_TYPE_OPTIONS[0];
    const defaultQr = typeof window !== 'undefined'
      ? `${window.location.origin}/order/${getOrderNumber(selectedOrder)}`
      : `https://rawajcard.com/order/${getOrderNumber(selectedOrder)}`;

    setCardType(guessedType);
    setSelectedTemplateId(notes.card_variant || currentCustomization?.template_id || typeConfig.variants[0]);
    setStickerContent(notes.sticker_content || 'qr');
    setTableStandDetails(notes.table_stand_details || '');
    setName(currentCustomization?.name || shipping.name || '');
    setContactPhone(currentCustomization?.contact_phone || shipping.phone || '');
    setSignature(currentCustomization?.signature || shipping.name || '');
    setQrValue(currentCustomization?.qr_value || defaultQr);
    setPicture(currentCustomization?.picture || '');
    setLinkedCardId(currentCustomization?.linked_card_id || 'none');
  }, [selectedOrder, selectedItem, currentCustomization]);

  const qrDataUrl = useQrDataUrl(qrValue);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrder || !selectedItem) throw new Error('No order item selected');
      const orderNumber = getOrderNumber(selectedOrder);
      const notes = JSON.stringify({
        order_id: selectedOrder.id,
        item_key: selectedItem.key,
        item_index: selectedItem.index,
        item_name: selectedItem.product_name,
        item_quantity: selectedItem.quantity,
        item_price: selectedItem.product_price,
        card_type: cardType,
        card_variant: selectedTemplate.id,
        sticker_content: cardType === 'mobile_sticker_keychains' ? stickerContent : null,
        table_stand_details: cardType === 'table_stand' ? tableStandDetails : null,
      });

      const payload = {
        user_id: user.id,
        order_number: orderNumber,
        template_id: selectedTemplate.id,
        name,
        contact_phone: contactPhone || null,
        signature: signature || name,
        qr_value: qrValue,
        picture: picture || null,
        linked_card_id: linkedCardId !== 'none' ? linkedCardId : null,
        notes,
        status: 'pending',
      };

      if (currentCustomization?.id) {
        return api.entities.PhysicalCard.update(currentCustomization.id, payload);
      }
      return api.entities.PhysicalCard.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-customizations'] });
      toast.success(isRTL ? 'تم حفظ تخصيص المنتج' : 'Item customization saved');
      if (digitalCards.length === 0) {
        toast.message(isRTL ? 'الخطوة التالية: أنشئ بطاقتك الرقمية لربطها بالطلب' : 'Next step: create your digital card to link it to this order');
        navigate(createPageUrl('CardBuilder'));
      }
    },
    onError: (error) => {
      toast.error(error?.message || (isRTL ? 'تعذر حفظ التخصيص' : 'Unable to save customization'));
    },
  });

  const onPictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPicture(typeof e.target?.result === 'string' ? e.target.result : '');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  if (isLoadingAuth || isLoadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <ShoppingBag className="h-12 w-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {isRTL ? 'سجّل الدخول لإدارة طلباتك' : 'Sign in to manage your orders'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {isRTL
                  ? 'بعد تسجيل الدخول ستتمكن من مشاهدة طلبات المتجر وتخصيص كل منتج وربطه ببطاقتك الرقمية.'
                  : 'After signing in, you can view store orders, customize each item, and link it to your digital card.'}
              </p>
            </div>
            <Link to={`${createPageUrl('Login')}?next=${encodeURIComponent(createPageUrl('MyOrders'))}`}>
              <Button className="bg-teal-600 hover:bg-teal-700">
                {isRTL ? 'تسجيل الدخول' : 'Sign in'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&display=swap'); @import url('https://fonts.cdnfonts.com/css/amsterdam-four');`}</style>

      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-teal-600" />
          {isRTL ? 'طلباتي' : 'My Orders'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isRTL
            ? 'اعرض طلبات المتجر، اختر المنتج الذي طلبته، ثم خصّصه واربطه ببطاقتك الرقمية.'
            : 'View store orders, select the item you purchased, then customize and link it to your digital card.'}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <Package className="h-12 w-12 text-slate-400 mx-auto" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {isRTL ? 'لا توجد طلبات حتى الآن' : 'No orders yet'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isRTL ? 'ابدأ من المتجر ثم عد هنا لإدارة عناصر الطلب.' : 'Start from the store, then come back here to manage your order items.'}
              </p>
            </div>
            <Link to={createPageUrl('Store')}>
              <Button variant="outline">{isRTL ? 'اذهب إلى المتجر' : 'Go to Store'}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>{isRTL ? 'الطلبات' : 'Orders'}</CardTitle>
              <CardDescription>{isRTL ? 'اختر طلباً لعرض عناصره' : 'Select an order to view its items'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.map((order) => {
                const number = getOrderNumber(order);
                const items = getOrderItems(order);
                const shipping = getShipping(order);
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setSelectedItemKey(null);
                    }}
                    className={`w-full rounded-xl border p-4 text-start transition ${selectedOrder?.id === order.id
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-teal-400'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">#{number}</span>
                      <span className="text-xs text-slate-400">{items.length} {isRTL ? 'منتج' : 'items'}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                      {shipping.name || order.created_by || (isRTL ? 'طلب متجر' : 'Store order')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {items.map((item) => item.product_name).join(' • ')}
                    </p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {selectedOrder && (
              <Card>
                <CardHeader>
                  <CardTitle>{isRTL ? 'عناصر الطلب' : 'Order Items'}</CardTitle>
                  <CardDescription>
                    {isRTL ? `اختر المنتج الذي تريد تخصيصه من الطلب #${getOrderNumber(selectedOrder)}` : `Choose the item you want to customize from order #${getOrderNumber(selectedOrder)}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {selectedOrderItems.map((item) => {
                      const hasCustomization = customizations.some((record) => {
                        const notes = parseNotes(record.notes);
                        return record.order_number === getOrderNumber(selectedOrder) && notes.item_key === item.key;
                      });
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedItemKey(item.key)}
                          className={`rounded-xl border p-4 text-start transition ${selectedItem?.key === item.key
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-teal-400'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-14 w-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                              {item.product_image ? (
                                <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                              ) : (
                                <Package className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 dark:text-white line-clamp-2">{item.product_name}</p>
                              <p className="text-xs text-slate-400 mt-1">{isRTL ? 'الكمية' : 'Qty'}: {item.quantity}</p>
                              {hasCustomization && (
                                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">{isRTL ? 'تم الحفظ' : 'Saved'}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedOrder && selectedItem && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-teal-600" />
                    {isRTL ? 'تخصيص المنتج' : 'Customize Item'}
                  </CardTitle>
                  <CardDescription>
                    {selectedItem.product_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'نوع المنتج' : 'Product Type'}</Label>
                        <div className="grid gap-2">
                          {CARD_TYPE_OPTIONS.map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setCardType(type.id)}
                              className={`rounded-xl border px-3 py-2 text-sm text-start transition ${cardType === type.id
                                ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                                : 'border-slate-200 dark:border-slate-700 hover:border-teal-400'}`}
                            >
                              {isRTL ? type.nameAr : type.nameEn}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{isRTL ? 'الخامة / الشكل' : 'Material / Variant'}</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableVariants.map((template) => (
                            <button
                              key={template.id}
                              type="button"
                              onClick={() => setSelectedTemplateId(template.id)}
                              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${selectedTemplateId === template.id
                                ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                                : 'border-slate-200 dark:border-slate-700 hover:border-teal-400'}`}
                            >
                              {isRTL ? template.nameAr : template.nameEn}
                            </button>
                          ))}
                        </div>
                      </div>

                      {cardType === 'mobile_sticker_keychains' && (
                        <div className="space-y-2">
                          <Label>{isRTL ? 'محتوى الشكل الصغير' : 'Small Shape Content'}</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'logo', en: 'Logo', ar: 'شعار' },
                              { id: 'qr', en: 'QR', ar: 'QR' },
                              { id: 'nfc', en: 'NFC', ar: 'NFC' },
                            ].map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setStickerContent(option.id)}
                                className={`rounded-lg border px-3 py-2 text-xs transition ${stickerContent === option.id
                                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                                  : 'border-slate-200 dark:border-slate-700'}`}
                              >
                                {isRTL ? option.ar : option.en}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {cardType === 'table_stand' && (
                        <div className="space-y-2">
                          <Label>{isRTL ? 'تفاصيل التصميم' : 'Design Details'}</Label>
                          <Textarea
                            value={tableStandDetails}
                            onChange={(e) => setTableStandDetails(e.target.value)}
                            rows={3}
                            placeholder={isRTL ? 'شعار، اسم المتجر، رابط جوجل، سوشال ميديا، الموقع...' : 'Logo, store name, Google/social/website URL, custom design notes...'}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>{isRTL ? 'الاسم' : 'Name'}</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <Label>{isRTL ? 'رقم الجوال' : 'Phone'}</Label>
                        <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} dir="ltr" />
                      </div>

                      <div className="space-y-2">
                        <Label>{isRTL ? 'التوقيع' : 'Signature'}</Label>
                        <Input
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          style={{ fontFamily: isRTL ? "'Alexandria', 'Tajawal', sans-serif" : "'Amsterdam Four', 'Alexandria', sans-serif", fontStyle: 'italic' }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{isRTL ? 'رابط QR' : 'QR Link'}</Label>
                        <Input value={qrValue} onChange={(e) => setQrValue(e.target.value)} dir="ltr" />
                      </div>

                      <div className="space-y-2">
                        <Label>{isRTL ? 'ربط ببطاقة رقمية' : 'Link to a Digital Card'}</Label>
                        {digitalCards.length > 0 ? (
                          <Select value={linkedCardId} onValueChange={setLinkedCardId}>
                            <SelectTrigger>
                              <SelectValue placeholder={isRTL ? 'اختر بطاقة رقمية' : 'Select a digital card'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">{isRTL ? 'بدون ربط الآن' : 'No link for now'}</SelectItem>
                              {digitalCards.map((card) => (
                                <SelectItem key={card.id} value={card.id}>
                                  {card.name || card.full_name || card.slug || card.id}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-3 text-sm text-amber-800 dark:text-amber-300">
                            {isRTL
                              ? 'لا توجد لديك بطاقة رقمية بعد. سنحفظ التخصيص ثم نوجّهك لإنشاء بطاقة رقمية.'
                              : 'You do not have a digital card yet. We will save this customization, then move you to create a digital card.'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>{isRTL ? 'الصورة (اختياري)' : 'Photo (Optional)'}</Label>
                        <label className="w-full cursor-pointer rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-4 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:border-teal-500 transition-colors">
                          {picture ? (
                            <span className="text-teal-600 dark:text-teal-400 font-medium">{isRTL ? '✓ تم رفع الصورة — اضغط لتغييرها' : '✓ Photo uploaded — click to change'}</span>
                          ) : (
                            <>
                              <ImagePlus className="h-4 w-4" />
                              {isRTL ? 'رفع صورة' : 'Upload photo'}
                            </>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={onPictureChange} />
                        </label>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => saveMutation.mutate()}
                          disabled={saveMutation.isPending || !name.trim() || !qrValue.trim()}
                        >
                          {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                          {isRTL ? 'حفظ تخصيص المنتج' : 'Save Item Customization'}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>{isRTL ? 'المعاينة' : 'Preview'}</Label>
                      <PhysicalCardPreview
                        template={selectedTemplate}
                        name={name}
                        signature={signature || name}
                        picture={picture}
                        qrDataUrl={qrDataUrl}
                        isRTL={isRTL}
                      />

                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-teal-600" />
                          {isRTL ? 'سير العمل' : 'Workflow'}
                        </p>
                        <p>
                          {isRTL
                            ? 'طلباتي > عناصر الطلب > اختر المنتج > خصّصه > اربطه ببطاقة رقمية أو أنشئ بطاقة رقمية أولاً.'
                            : 'My Orders > Order Items > Select Item > Customize > Link to a digital card or create one first.'}
                        </p>
                        {digitalCards.length === 0 && (
                          <Button variant="outline" className="w-full" onClick={() => navigate(createPageUrl('CardBuilder'))}>
                            {isRTL ? 'إنشاء بطاقة رقمية الآن' : 'Create Digital Card Now'}
                            {!isRTL && <ArrowRight className="h-4 w-4 ml-2" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
