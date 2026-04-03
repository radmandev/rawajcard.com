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

export function getPendingPhysicalCards() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePendingPhysicalCard(card) {
  try {
    const existing = getPendingPhysicalCards();
    // Deduplicate by order_number
    const filtered = existing.filter((c) => c.order_number !== card.order_number);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, card]));
  } catch { /* ignore */ }
}

export function clearPendingPhysicalCards() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// ─── Templates ────────────────────────────────────────────────────────────────

export const PREMADE_TEMPLATES = [
  {
    id: 'midnight-teal',
    nameEn: 'Midnight Teal',
    nameAr: 'تيـل ليلي',
    background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 100%)',
    textColor: '#ecfeff',
    chipClass: 'bg-white/20 text-white border-white/30',
  },
  {
    id: 'royal-navy',
    nameEn: 'Royal Navy',
    nameAr: 'كحلي ملكي',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%)',
    textColor: '#eff6ff',
    chipClass: 'bg-blue-100/20 text-blue-50 border-blue-200/30',
  },
  {
    id: 'emerald-glass',
    nameEn: 'Emerald Glass',
    nameAr: 'زمردي زجاجي',
    background: 'linear-gradient(135deg, #065f46 0%, #14b8a6 100%)',
    textColor: '#f0fdfa',
    chipClass: 'bg-emerald-100/20 text-emerald-50 border-emerald-200/30',
  },
  {
    id: 'sunset-gold',
    nameEn: 'Sunset Gold',
    nameAr: 'غروب ذهبي',
    background: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)',
    textColor: '#fffbeb',
    chipClass: 'bg-amber-100/20 text-amber-50 border-amber-200/30',
  },
  {
    id: 'mono-carbon',
    nameEn: 'Mono Carbon',
    nameAr: 'كاربون أحادي',
    background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
    textColor: '#f9fafb',
    chipClass: 'bg-slate-100/20 text-slate-50 border-slate-200/30',
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
            style={{ fontFamily: "'Alexandria', 'Tajawal', sans-serif", fontStyle: 'italic' }}
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

  const [selectedTemplateId, setSelectedTemplateId] = useState(PREMADE_TEMPLATES[0].id);
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
      setPrefill({
        name: parsed?.name || '',
        phone: parsed?.phone || '',
      });
    } catch {
      setPrefill({ name: '', phone: '' });
    }
  }, []);

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
      const payload = {
        user_id: user.id,
        order_number: orderNumber || null,
        template_id: selectedTemplate.id,
        name,
        contact_phone: contactPhone || null,
        signature: signature || name,
        qr_value: qrValue,
        picture: picture || null,
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
    const cardData = {
      order_number: orderNumber || null,
      template_id: selectedTemplate.id,
      name,
      contact_phone: contactPhone || null,
      signature: signature || name,
      qr_value: qrValue,
      picture: picture || null,
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
    reader.onload = (e) => setPicture(e.target?.result || '');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // ── Saved step (success + login prompt) ──────────────────────────────────────
  if (step === 'saved') {
    return (
      <Card className="bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-800 text-start">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&display=swap');`}</style>
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
                  onClick={() => navigate(createPageUrl('Login'))}
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
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&display=swap');`}</style>
        <CardTitle className="text-lg md:text-xl">
          {isRTL ? '🪪 خصّص بطاقة NFC الفيزيائية' : '🪪 Customize Your Physical NFC Card'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'ابدأ بأحد القوالب الجاهزة ثم عدّل الاسم، التوقيع، رمز QR، وأضف صورة اختيارية.'
            : 'Start from a premade template, then edit name, signature, QR code, and optional picture.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Template picker */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PREMADE_TEMPLATES.map((template) => (
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
              <Label>{isRTL ? 'التوقيع (Alexandria)' : 'Signature (Alexandria font)'}</Label>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder={isRTL ? 'نص التوقيع على البطاقة' : 'Signature text on card'}
                style={{ fontFamily: "'Alexandria', 'Tajawal', sans-serif", fontStyle: 'italic' }}
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
