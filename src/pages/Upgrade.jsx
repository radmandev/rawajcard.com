import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Building2, Users, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getUserSubscriptions, isEligibleForIntroTrial } from '@/lib/subscriptionEligibility';

const PLANS = [
  {
    key: 'free',
    icon: Zap,
    name_en: 'Free',
    name_ar: 'مجاني',
    price_en: 'SAR 0',
    price_ar: '0 ريال',
    period_en: '/month',
    period_ar: '/شهر',
    features_en: [
      'Up to 2 Digital Cards',
      'Basic Templates',
      'QR Code',
      'Limited Analytics',
      'Email Support',
    ],
    features_ar: [
      'حتى بطاقتين رقميتين',
      'قوالب أساسية',
      'رمز QR',
      'تحليلات محدودة',
      'دعم البريد الإلكتروني',
    ],
  },
  {
    key: 'premium',
    icon: Sparkles,
    name_en: 'Premium',
    name_ar: 'بريميوم',
    price_en: 'SAR 19',
    price_ar: '19 ريال',
    period_en: '/month',
    period_ar: '/شهر',
    features_en: [
      'Up to 5 Digital Cards',
      'All Templates',
      'Advanced Analytics',
      'Lead Capture',
      'Custom Branding',
      'Priority Support',
      'Export Data',
    ],
    features_ar: [
      'حتى 5 بطاقات رقمية',
      'جميع القوالب',
      'تحليلات متقدمة',
      'التقاط المتابعة',
      'علامة تجارية مخصصة',
      'دعم أولوي',
      'تصدير البيانات',
    ],
  },
  {
    key: 'teams',
    icon: Users,
    name_en: 'Teams',
    name_ar: 'الفرق',
    price_en: 'SAR 49',
    price_ar: '49 ريال',
    period_en: '/month',
    period_ar: '/شهر',
    popular: true,
    features_en: [
      'Up to 10 Digital Cards',
      'Everything in Premium',
      'Team Collaboration',
      'Shared Analytics',
      'Priority Support',
    ],
    features_ar: [
      'حتى 10 بطاقات رقمية',
      'كل شيء في بريميوم',
      'تعاون الفريق',
      'تحليلات مشتركة',
      'دعم أولوي',
    ],
  },
  {
    key: 'enterprise',
    icon: Building2,
    name_en: 'Enterprise',
    name_ar: 'مؤسسي',
    price_en: 'SAR 99',
    price_ar: '99 ريال',
    period_en: '/month',
    period_ar: '/شهر',
    features_en: [
      'Up to 30 Digital Cards',
      'Everything in Teams',
      'Unlimited Team Members',
      'CRM Integration',
      'API Access',
      'Dedicated Support',
      'Custom Integrations',
      'SLA Agreement',
    ],
    features_ar: [
      'حتى 30 بطاقة رقمية',
      'كل شيء في خطة الفرق',
      'أعضاء فريق غير محدودين',
      'تكامل CRM',
      'وصول API',
      'دعم مخصص',
      'تكاملات مخصصة',
      'اتفاقية مستوى الخدمة',
    ],
  },
];

export default function Upgrade() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const { data: me } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me(),
  });

  const { data: earlyBirdOffer } = useQuery({
    queryKey: ['premium-early-bird-offer-public'],
    queryFn: () => api.appSettings.get('premium_early_bird_offer'),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription-trial-eligibility', me?.id || me?.email || 'guest'],
    queryFn: async () => getUserSubscriptions(api, me || await api.auth.me()),
    enabled: !!me,
  });

  const subscription = subscriptions[0] || { plan: 'free' };
  const currentPlan = subscription?.plan || 'free';
  const newUserWindowDays = Number(earlyBirdOffer?.new_user_window_days || 30);
  const isTrialEligible = isEligibleForIntroTrial({ me, subscriptions, newUserWindowDays });

  const getPlanCta = (plan) => {
    if (isTrialEligible) {
      if (plan.key === 'premium') return isRTL ? 'تجربة 90 يوم على بريميوم' : '90 days Trial on Premium';
      if (plan.key === 'teams') return isRTL ? 'تجربة 14 يوم على الفرق' : '14 days Trial on Teams';
      if (plan.key === 'enterprise') return isRTL ? 'تجربة 14 يوم على المؤسسي' : '14 days Trial on Enterprise';
    }
    return isRTL ? `الترقية إلى ${plan.name_ar}` : `Upgrade to ${plan.name_en}`;
  };

  const handleUpgrade = async (planKey) => {
    if (planKey === 'free') return;
    setLoadingPlan(planKey);
    try {
      const result = await api.functions.invoke('createStripeCheckout', { plan: planKey });
      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      const msg = err?.message || '';
      // Show the real server error if available, otherwise a helpful hint
      let display = isRTL ? 'حدث خطأ في الدفع، حاول مرة أخرى' : 'Payment error, please try again';
      if (msg.toLowerCase().includes('not configured') || msg.toLowerCase().includes('stripe')) {
        display = isRTL ? 'Stripe غير مهيأ على الخادم — تحقق من الإعدادات' : `Server error: ${msg}`;
      } else if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('401')) {
        display = isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please log in and try again';
      } else if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('404')) {
        display = isRTL ? 'وظيفة الدفع غير موجودة — يجب نشرها على Supabase' : 'Payment function not deployed — deploy it on Supabase first';
      } else if (msg) {
        display = msg;
      }
      toast.error(display, { duration: 6000 });
      setLoadingPlan(null);
    }
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <BackArrow className="h-4 w-4 mr-1" />
          {isRTL ? 'رجوع' : 'Back'}
        </Button>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-sm font-medium mb-2">
          <Sparkles className="h-4 w-4" />
          {isRTL ? 'ترقية الاشتراك' : 'Upgrade Your Plan'}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          {isRTL ? 'اختر الخطة المثالية لك' : 'Choose the Perfect Plan'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {isRTL
            ? 'قم بالترقية للحصول على مزيد من الميزات والإمكانيات. يمكنك الإلغاء في أي وقت.'
            : 'Unlock more features and capabilities. Cancel anytime, no hidden fees.'}
        </p>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, idx) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.key;
          const isPopular = plan.popular;

          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={cn(
                'relative rounded-2xl border p-6 flex flex-col gap-5 transition-all',
                isPopular
                  ? 'border-teal-500 ring-2 ring-teal-500/30 shadow-xl shadow-teal-500/10 bg-gradient-to-b from-teal-50/60 to-white dark:from-teal-950/20 dark:to-slate-900'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
                plan.key === 'enterprise' && 'border-purple-200 dark:border-purple-800/50',
                isCurrent && 'opacity-80'
              )}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-teal-600 text-white px-4 shadow-md">
                    {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3.5 right-5">
                  <Badge variant="outline" className="border-slate-400 bg-white dark:bg-slate-900 text-xs">
                    {isRTL ? 'خطتك الحالية' : 'Current Plan'}
                  </Badge>
                </div>
              )}

              {/* Plan header */}
              <div>
                <div className={cn(
                  'inline-flex p-2.5 rounded-xl mb-4',
                  plan.key === 'free' && 'bg-slate-100 dark:bg-slate-800',
                  plan.key === 'premium' && 'bg-teal-100 dark:bg-teal-900/30',
                  plan.key === 'enterprise' && 'bg-purple-100 dark:bg-purple-900/30',
                )}>
                  <Icon className={cn(
                    'h-6 w-6',
                    plan.key === 'free' && 'text-slate-500',
                    plan.key === 'premium' && 'text-teal-600',
                    plan.key === 'enterprise' && 'text-purple-600',
                  )} />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isRTL ? plan.name_ar : plan.name_en}
                </h2>

                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {isRTL ? plan.price_ar : plan.price_en}
                  </span>
                  {plan.period_en && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {isRTL ? plan.period_ar : plan.period_en}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2.5">
                {(isRTL ? plan.features_ar : plan.features_en).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <Check className={cn(
                      'h-4 w-4 flex-shrink-0',
                      plan.key === 'premium' && 'text-teal-600',
                      plan.key === 'enterprise' && 'text-purple-600',
                      plan.key === 'free' && 'text-slate-400',
                    )} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <Button disabled variant="outline" className="w-full h-11">
                  {isRTL ? '✓ خطتك الحالية' : '✓ Current Plan'}
                </Button>
              ) : plan.key === 'free' ? (
                <Button disabled variant="outline" className="w-full h-11 opacity-50 cursor-not-allowed">
                  {isRTL ? 'مجاني دائماً' : 'Always Free'}
                </Button>
              ) : (
                <Button
                  className={cn(
                    'w-full h-11 font-semibold text-white',
                    plan.key === 'premium'    && 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600',
                    plan.key === 'teams'      && 'bg-cyan-700 hover:bg-cyan-800 dark:bg-cyan-600 dark:hover:bg-cyan-700',
                    plan.key === 'enterprise' && 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600',
                  )}
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={loadingPlan === plan.key}
                >
                  {loadingPlan === plan.key ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isRTL ? 'جاري التحميل...' : 'Loading...'}
                    </>
                  ) : (
                    <>
                      {plan.key === 'premium'
                        ? <Sparkles className="h-4 w-4 mr-2" />
                        : plan.key === 'teams'
                        ? <Users className="h-4 w-4 mr-2" />
                        : <Building2 className="h-4 w-4 mr-2" />
                      }
                      {getPlanCta(plan)}
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-slate-400 dark:text-slate-500 pb-4">
        🔒 {isRTL
          ? 'المدفوعات آمنة ومشفرة عبر Stripe • يمكنك الإلغاء في أي وقت • لا رسوم خفية'
          : 'Payments are secure & encrypted via Stripe • Cancel anytime • No hidden fees'}
      </p>
    </div>
  );
}
