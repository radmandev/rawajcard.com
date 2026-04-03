import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api/supabaseAPI';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ImagePlus,
  LogIn,
  QrCode,
  Save,
  Wifi,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'pending_physical_cards';
const STORAGE_KEY_FALLBACK = 'pending_physical_cards_persisted';
const POST_AUTH_REDIRECT_KEY = 'post_auth_redirect';

const dedupePendingCards = (cards) => {
  const map = new Map();
  cards.forEach((card, index) => {
    const key = card?.order_number || `${card?.template_id || 'card'}_${index}`;
    if (card) map.set(key, card);
  });
  return Array.from(map.values());
};

export function getPendingPhysicalCards() {
  try {
    const sessionRaw = sessionStorage.getItem(STORAGE_KEY);
    const localRaw = localStorage.getItem(STORAGE_KEY_FALLBACK);
    const sessionCards = sessionRaw ? JSON.parse(sessionRaw) : [];
    const localCards = localRaw ? JSON.parse(localRaw) : [];
    return dedupePendingCards([...sessionCards, ...localCards]);
  } catch {
    return [];
  }
}

export function savePendingPhysicalCard(card) {
  try {
    const existing = getPendingPhysicalCards();
    const merged = dedupePendingCards([...existing, card]);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    localStorage.setItem(STORAGE_KEY_FALLBACK, JSON.stringify(merged));
  } catch { /* ignore */ }
}

export function clearPendingPhysicalCards() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_FALLBACK);
  } catch { /* ignore */ }
}

export function setPostAuthRedirect(path) {
  try { localStorage.setItem(POST_AUTH_REDIRECT_KEY, path); } catch { /* ignore */ }
}

export function getPostAuthRedirect() {
  try { return localStorage.getItem(POST_AUTH_REDIRECT_KEY) || ''; } catch { return ''; }
}

export function clearPostAuthRedirect() {
  try { localStorage.removeItem(POST_AUTH_REDIRECT_KEY); } catch { /* ignore */ }
}

// ─── Templates ────────────────────────────────────────────────────────────────

export const PREMADE_TEMPLATES = [
  {
    id: 'gold-metal',
    nameEn: 'Gold Metal',
    nameAr: 'معدن ذهبي',
    background: 'linear-gradient(135deg, #7a5a18 0%, #f2cf7a 100%)',
    textColor: '#fff9e8',
    chipClass: 'bg-white/25 text-white border-white/40',
  },
  {
    id: 'silver-metal',
    nameEn: 'Silver Metal',
    nameAr: 'معدن فضي',
    background: 'linear-gradient(135deg, #4b5563 0%, #d1d5db 100%)',
    textColor: '#f9fafb',
    chipClass: 'bg-white/25 text-white border-white/40',
  },
  {
    id: 'black-metal',
    nameEn: 'Black Metal',
    nameAr: 'معدن أسود',
    background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
    textColor: '#f9fafb',
    chipClass: 'bg-slate-100/20 text-slate-50 border-slate-200/30',
  },
  {
    id: 'bright-wood',
    nameEn: 'Bright Wood',
    nameAr: 'خشب فاتح',
    background: 'linear-gradient(135deg, #8b5a2b 0%, #d2b48c 100%)',
    textColor: '#fff8f0',
    chipClass: 'bg-white/20 text-white border-white/30',
  },
  {
    id: 'dark-wood',
    nameEn: 'Dark Wood',
    nameAr: 'خشب داكن',
    background: 'linear-gradient(135deg, #3f2a1f 0%, #6b3f2a 100%)',
    textColor: '#fff7ed',
    chipClass: 'bg-white/20 text-white border-white/30',
  },
  {
    id: 'white-circle',
    nameEn: 'White',
    nameAr: 'أبيض',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%)',
    textColor: '#0f172a',
    chipClass: 'bg-slate-900/10 text-slate-700 border-slate-300',
  },
  {
    id: 'black-circle',
    nameEn: 'Black',
    nameAr: 'أسود',
    background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    textColor: '#f8fafc',
    chipClass: 'bg-white/20 text-white border-white/30',
  },
  {
    id: 'table-stand',
    nameEn: 'Table Stand',
    nameAr: 'ستاند طاولة',
    background: 'linear-gradient(135deg, #0b3b53 0%, #1f2937 100%)',
    textColor: '#e0f2fe',
    chipClass: 'bg-sky-100/20 text-sky-50 border-sky-200/30',
  },
];

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

// ─── Card Preview (reusable) ───────────────────────────────────────────────────

export function PhysicalCardPreview({ template, name, signature, picture, qrDataUrl, isRTL }) {
  return (
    <div
      className="rounded-2xl p-4 min-h-[220px] border border-black/10 shadow-sm relative overflow-hidden w-full"
      style={{ background: template.background, color: template.textColor }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs opacity-70">{isRTL ? 'الاسم' : 'Name'}</p>
          <p className="font-semibold text-base">{name || (isRTL ? 'اسم العميل' : 'Customer Name')}</p>
          <p
            className="text-sm opacity-90"
            style={{ fontFamily: isRTL ? "'Alexandria', 'Tajawal', sans-serif" : "'Amsterdam Four', 'Alexandria', sans-serif", fontStyle: 'italic' }}
          >
            {signature || name || (isRTL ? 'التوقيع' : 'Signature')}
          </p>
        </div>
        {picture ? (
          <img src={picture} alt="Profile" className="h-14 w-14 rounded-full object-cover border-2 border-white/40 shadow" />
        ) : (
          <div className="h-14 w-14 rounded-full border-2 border-white/40 bg-white/10 flex items-center justify-center text-xs opacity-70">
            {isRTL ? 'صورة' : 'Photo'}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] border ${template.chipClass}`}>
          <Wifi className="h-3.5 w-3.5" />
          <span>{isRTL ? 'وسم NFC' : 'NFC Tag'}</span>
        </div>

        <div className="h-16 w-16 rounded-md bg-white p-1.5 flex items-center justify-center shadow-sm">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR" className="h-full w-full object-contain" />
          ) : (
            <QrCode className="h-8 w-8 text-slate-400" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Module ──────────────────────────────────────────────────────────────

export default function PhysicalCardCustomizationModule({ orderNumber }) {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  // Steps: 'customize' | 'saved'
  const [step, setStep] = useState('customize');

  const [cardType, setCardType] = useState(CARD_TYPE_OPTIONS[0].id);
  const [selectedTemplateId, setSelectedTemplateId] = useState(CARD_TYPE_OPTIONS[0].variants[0]);
  const [stickerContent, setStickerContent] = useState('qr');
  const [tableStandDetails, setTableStandDetails] = useState('');
  const [name, setName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [signature, setSignature] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [picture, setPicture] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [prefill, setPrefill] = useState({ name: '', phone: '' });

  const selectedTemplate = useMemo(
    () => PREMADE_TEMPLATES.find((t) => t.id === selectedTemplateId) || PREMADE_TEMPLATES[0],
    [selectedTemplateId]
  );

  const selectedCardType = useMemo(
    () => CARD_TYPE_OPTIONS.find((t) => t.id === cardType) || CARD_TYPE_OPTIONS[0],
    [cardType]
  );

  const availableVariants = useMemo(
    () => PREMADE_TEMPLATES.filter((t) => selectedCardType.variants.includes(t.id)),
    [selectedCardType]
  );

  // Seed QR value from order number
  useEffect(() => {
    const defaultQr =
      typeof window !== 'undefined'
        ? `${window.location.origin}/order/${orderNumber || 'new'}`
        : `https://rawajcard.com/order/${orderNumber || 'new'}`;
    setQrValue(defaultQr);
  }, [orderNumber]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('checkout_prefill');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.name) {
        setName(parsed.name);
        setSignature(parsed.name);
      }
      if (parsed?.phone) setContactPhone(parsed.phone);
      setPrefill({
        name: parsed?.name || '',
        phone: parsed?.phone || '',
      });
    } catch {
      setPrefill({ name: '', phone: '' });
    }
  }, []);

  useEffect(() => {
    const type = CARD_TYPE_OPTIONS.find((t) => t.id === cardType) || CARD_TYPE_OPTIONS[0];
    if (!type.variants.includes(selectedTemplateId)) {
      setSelectedTemplateId(type.variants[0]);
    }
  }, [cardType, selectedTemplateId]);

  // Generate QR data URL
  useEffect(() => {
    let mounted = true;
    if (!qrValue?.trim()) { setQrDataUrl(''); return; }
    QRCode.toDataURL(qrValue, { width: 220, margin: 1 })
      .then((url) => { if (mounted) setQrDataUrl(url); })
      .catch(() => { if (mounted) setQrDataUrl(''); });
    return () => { mounted = false; };
  }, [qrValue]);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me(),
    retry: false,
  });
  const isLoggedIn = Boolean(user?.id);

  // ── Save mutation (used when already logged in) ──────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const notes = JSON.stringify({
        card_type: cardType,
        card_variant: selectedTemplate.id,
        sticker_content: cardType === 'mobile_sticker_keychains' ? stickerContent : null,
        table_stand_details: cardType === 'table_stand' ? tableStandDetails : null,
      });

      const payload = {
        user_id: user.id,
        order_number: orderNumber || null,
        template_id: selectedTemplate.id,
        name,
        contact_phone: contactPhone || null,
        signature: signature || name,
        qr_value: qrValue,
        picture: picture || null,
        notes,
        status: 'pending',
      };
      await api.entities.PhysicalCard.create(payload);
    },
    onSuccess: () => {
      toast.success(isRTL ? 'تم حفظ تصميم البطاقة!' : 'Card design saved!');
      setStep('saved');
    },
    onError: () => {
      toast.error(isRTL ? 'تعذر الحفظ، يرجى المحاولة مرة أخرى' : 'Save failed, please try again');
    },
  });

  const handleSave = () => {
    const notes = JSON.stringify({
      card_type: cardType,
      card_variant: selectedTemplate.id,
      sticker_content: cardType === 'mobile_sticker_keychains' ? stickerContent : null,
      table_stand_details: cardType === 'table_stand' ? tableStandDetails : null,
    });

    const cardData = {
      order_number: orderNumber || null,
      template_id: selectedTemplate.id,
      name,
      contact_phone: contactPhone || null,
      signature: signature || name,
      qr_value: qrValue,
      picture: picture || null,
      notes,
    };

    if (isLoggedIn) {
      // Save directly to DB
      saveMutation.mutate();
    } else {
      // Save to sessionStorage and show login prompt
      savePendingPhysicalCard(cardData);
      setStep('saved');
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      setPostAuthRedirect(createPageUrl('PhysicalCards'));
      const base = import.meta.env.VITE_APP_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${base}${createPageUrl('PhysicalCards')}`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch {
      toast.error(isRTL ? 'تعذر تسجيل الدخول بجوجل' : 'Google sign-in failed');
      setIsGoogleLoading(false);
    }
  };

  const onPictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPicture(typeof e.target?.result === 'string' ? e.target.result : '');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // ── Saved step (success + login prompt) ──────────────────────────────────────
  if (step === 'saved') {
    return (
      <Card className="bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-800 text-start">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&display=swap'); @import url('https://fonts.cdnfonts.com/css/amsterdam-four');`}</style>
        <CardContent className="p-6 space-y-5">
          {/* Success header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {isRTL ? '✅ تم حفظ تصميم بطاقتك!' : '✅ Card design saved!'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isRTL
                  ? 'سيتم طباعة بطاقتك بناءً على هذا التصميم وشحنها إليك.'
                  : 'Your card will be printed based on this design and shipped to you.'}
              </p>
            </div>
          </div>

          {/* Mini card preview */}
          <div className="max-w-xs">
            <PhysicalCardPreview
              template={selectedTemplate}
              name={name}
              signature={signature || name}
              picture={picture}
              qrDataUrl={qrDataUrl}
              isRTL={isRTL}
            />
          </div>

          {/* CTA section */}
          {isLoggedIn ? (
            // Already logged in — go to My Physical Cards
            <div className="space-y-3 pt-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isRTL
                  ? 'يمكنك مراجعة وتعديل تصميم بطاقتك في قسم البطاقات الفيزيائية.'
                  : 'You can review and edit your card design in the Physical Cards section.'}
              </p>
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700"
                onClick={() => navigate(createPageUrl('PhysicalCards'))}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isRTL ? 'بطاقاتي الفيزيائية' : 'My Physical Cards'}
                {!isRTL && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          ) : (
            // Not logged in — encourage account creation
            <div className="rounded-xl border border-teal-100 dark:border-teal-800/60 bg-teal-50/50 dark:bg-teal-900/10 p-4 space-y-4">
              <div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm">
                  {isRTL ? '🎉 أنشئ حسابك لإدارة بطاقتك' : '🎉 Create an account to manage your card'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRTL
                    ? 'بإنشاء حساب ستتمكن من معاينة بطاقتك وتعديلها وربطها ببطاقتك الرقمية قبل الطباعة.'
                    : 'With an account you can preview, edit, and link your physical card to a digital card before printing.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-300 dark:border-slate-600"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                >
                  {/* Google SVG icon */}
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {isGoogleLoading
                    ? (isRTL ? 'جاري التحويل...' : 'Redirecting...')
                    : (isRTL ? 'متابعة بجوجل' : 'Continue with Google')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-slate-300 dark:border-slate-600"
                  onClick={() => {
                    setPostAuthRedirect(createPageUrl('PhysicalCards'));
                    navigate(`${createPageUrl('Login')}?next=${encodeURIComponent(createPageUrl('PhysicalCards'))}`);
                  }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {isRTL ? 'تسجيل الدخول / إنشاء حساب' : 'Sign in / Create account'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ── Customize step ────────────────────────────────────────────────────────────
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-start">
      <CardHeader>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&display=swap'); @import url('https://fonts.cdnfonts.com/css/amsterdam-four');`}</style>
        <CardTitle className="text-lg md:text-xl">
          {isRTL ? '🪪 خصّص بطاقة NFC الفيزيائية' : '🪪 Customize Your Physical NFC Card'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'اختر نوع المنتج وخامته ثم عدّل الاسم، التوقيع، QR والصورة.'
            : 'Choose product type and material, then edit name, signature, QR, and photo.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Card type picker */}
        <div className="space-y-2">
          <Label>{isRTL ? 'نوع المنتج' : 'Product Type'}</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CARD_TYPE_OPTIONS.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setCardType(type.id)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                  cardType === type.id
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isRTL ? type.nameAr : type.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Template picker */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {availableVariants.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedTemplateId(template.id)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                selectedTemplateId === template.id
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isRTL ? template.nameAr : template.nameEn}
            </button>
          ))}
        </div>

        {/* Extra options per type */}
        {cardType === 'mobile_sticker_keychains' && (
          <div className="space-y-2">
            <Label>{isRTL ? 'محتوى الدائرة الصغيرة' : 'Small Circle Content'}</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'logo', en: 'Logo', ar: 'شعار' },
                { id: 'qr', en: 'QR', ar: 'QR' },
                { id: 'nfc', en: 'NFC Icon', ar: 'أيقونة NFC' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStickerContent(opt.id)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    stickerContent === opt.id
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isRTL ? opt.ar : opt.en}
                </button>
              ))}
            </div>
          </div>
        )}

        {cardType === 'table_stand' && (
          <div className="space-y-2">
            <Label>{isRTL ? 'تفاصيل الستاند (شعار/اسم/روابط...)' : 'Table Stand Details (logo/store/url/social...)'}</Label>
            <Textarea
              value={tableStandDetails}
              onChange={(e) => setTableStandDetails(e.target.value)}
              rows={3}
              placeholder={isRTL ? 'مثال: اسم المتجر + رابط Google + السوشال ميديا + أي تصميم مخصص' : 'Example: store name + Google URL + social links + custom design notes'}
            />
          </div>
        )}

        {/* Form + Preview */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'الاسم *' : 'Name *'}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={prefill.name || (isRTL ? 'مثال: أحمد علي' : 'e.g. John Doe')}
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'رقم الجوال (اختياري)' : 'Phone (Optional)'}</Label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder={prefill.phone || (isRTL ? '+9665XXXXXXXX' : '+9665XXXXXXXX')}
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'التوقيع (Alexandria)' : 'Signature (Amsterdam Four)'}</Label>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder={isRTL ? 'نص التوقيع على البطاقة' : 'Signature text on card'}
                style={{ fontFamily: isRTL ? "'Alexandria', 'Tajawal', sans-serif" : "'Amsterdam Four', 'Alexandria', sans-serif", fontStyle: 'italic' }}
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'رابط QR *' : 'QR Link *'}</Label>
              <Input
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
                placeholder="https://rawajcard.com/c/yourcard"
                dir="ltr"
              />
              <p className="text-xs text-slate-400">
                {isRTL
                  ? 'يمكنك ربطه ببطاقتك الرقمية لاحقاً'
                  : 'You can link this to your digital card later'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'الصورة (اختياري)' : 'Photo (Optional)'}</Label>
              <label className="w-full cursor-pointer rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-4 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:border-teal-500 transition-colors">
                {picture ? (
                  <span className="text-teal-600 dark:text-teal-400 font-medium">
                    {isRTL ? '✓ تم رفع الصورة — اضغط لتغييرها' : '✓ Photo uploaded — click to change'}
                  </span>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" />
                    {isRTL ? 'رفع صورة' : 'Upload photo'}
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={onPictureChange} />
              </label>
            </div>
          </div>

          {/* Card Preview */}
          <div className="space-y-2">
            <Label>{isRTL ? 'معاينة البطاقة' : 'Card Preview'}</Label>
            <PhysicalCardPreview
              template={selectedTemplate}
              name={name}
              signature={signature || name}
              picture={picture}
              qrDataUrl={qrDataUrl}
              isRTL={isRTL}
            />
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <Button
            type="button"
            size="lg"
            className="bg-teal-600 hover:bg-teal-700"
            onClick={handleSave}
            disabled={saveMutation.isPending || !name.trim() || !qrValue.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending
              ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
              : (isRTL ? 'حفظ التصميم' : 'Save Design')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
