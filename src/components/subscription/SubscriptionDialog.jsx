import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Building2, Users } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/supabaseAPI';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';

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
      '2 Digital Cards',
      'Basic Templates',
      'QR Code',
      'Limited Analytics',
      'Email Support',
    ],
    features_ar: [
      'بطاقتان رقميتان',
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
      '2 Digital Cards',
      'All Templates',
      'Advanced Analytics',
      'Lead Capture',
      'Custom Branding',
      'Priority Support',
      'Export Data',
    ],
    features_ar: [
      'بطاقتان رقميتان',
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

export default function SubscriptionDialog({ open, onOpenChange }) {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const subs = await api.entities.Subscription.list();
      return subs[0] || { plan: 'free' };
    },
    enabled: open,
  });

  const currentPlan = subscription?.plan || 'free';

  const handleUpgrade = (planKey) => {
    onOpenChange(false);
    navigate(createPageUrl('Upgrade'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden
        top-auto bottom-0 translate-y-0 translate-x-[-50%] rounded-t-2xl rounded-b-none
        sm:top-[50%] sm:bottom-auto sm:translate-y-[-50%] sm:rounded-2xl">
        <div className="flex flex-col max-h-[92dvh] sm:max-h-[88dvh]">

          {/* Sticky Header */}
          <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-slate-100 dark:border-slate-800">
            {/* Drag handle for mobile */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mb-4" />
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-teal-500" />
                {isRTL ? 'اختر خطتك' : 'Choose Your Plan'}
              </DialogTitle>
              <DialogDescription>
                {isRTL
                  ? 'قم بالترقية للحصول على مزيد من الميزات والإمكانيات'
                  : 'Upgrade for more features and capabilities'}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Plans Grid */}
          <div className="px-4 sm:px-6 py-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 overflow-y-auto flex-1 min-h-0">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.key;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.key}
                className={cn(
                  'relative rounded-2xl border p-5 flex flex-col gap-4 transition-all',
                  isPopular
                    ? 'border-teal-500 ring-2 ring-teal-500/30 bg-gradient-to-b from-teal-50/60 to-white dark:from-teal-950/20 dark:to-slate-900'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
                  plan.key === 'enterprise' && 'border-purple-200 dark:border-purple-800/50'
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-teal-600 text-white text-xs px-3 shadow">
                      {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                    </Badge>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="outline" className="text-xs border-slate-400 bg-white dark:bg-slate-900">
                      {isRTL ? 'خطتك الحالية' : 'Current Plan'}
                    </Badge>
                  </div>
                )}

                {/* Plan Header */}
                <div>
                  <div className={cn(
                    'inline-flex p-2 rounded-lg mb-3',
                    plan.key === 'free' && 'bg-slate-100 dark:bg-slate-800',
                    plan.key === 'premium' && 'bg-teal-100 dark:bg-teal-900/30',
                    plan.key === 'teams' && 'bg-cyan-100 dark:bg-cyan-900/30',
                    plan.key === 'enterprise' && 'bg-purple-100 dark:bg-purple-900/30',
                  )}>
                    <Icon className={cn(
                      'h-5 w-5',
                      plan.key === 'free' && 'text-slate-500',
                      plan.key === 'premium' && 'text-teal-600',
                      plan.key === 'teams' && 'text-cyan-700 dark:text-cyan-400',
                      plan.key === 'enterprise' && 'text-purple-600',
                    )} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isRTL ? plan.name_ar : plan.name_en}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {isRTL ? plan.price_ar : plan.price_en}
                    </span>
                    {plan.period_en && (
                      <span className="text-sm text-slate-500">
                        {isRTL ? plan.period_ar : plan.period_en}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-2">
                  {(isRTL ? plan.features_ar : plan.features_en).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Check className={cn(
                        'h-4 w-4 flex-shrink-0',
                        plan.key === 'premium' ? 'text-teal-600' :
                        plan.key === 'enterprise' ? 'text-purple-600' :
                        'text-slate-400'
                      )} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {isCurrent ? (
                  <Button disabled variant="outline" className="w-full">
                    {isRTL ? 'خطتك الحالية' : 'Current Plan'}
                  </Button>
                ) : plan.key === 'free' ? (
                  <Button disabled variant="outline" className="w-full opacity-50">
                    {isRTL ? 'مجاني دائماً' : 'Always Free'}
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      'w-full text-white',
                      plan.key === 'enterprise'
                        ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
                        : plan.key === 'teams'
                        ? 'bg-cyan-700 hover:bg-cyan-800 dark:bg-cyan-600 dark:hover:bg-cyan-700'
                        : 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600'
                    )}
                    onClick={() => handleUpgrade(plan.key)}
                  >
                    {plan.key === 'enterprise'
                      ? <Building2 className="h-4 w-4 mr-2" />
                      : plan.key === 'teams'
                      ? <Users className="h-4 w-4 mr-2" />
                      : <Sparkles className="h-4 w-4 mr-2" />
                    }
                    {isRTL
                      ? `الترقية إلى ${plan.name_ar}`
                      : `Upgrade to ${plan.name_en}`
                    }
                  </Button>
                )}
              </div>
            );
          })}
          </div>{/* end plans grid */}

          {/* Sticky Footer */}
          <div className="px-6 py-3 text-center flex-shrink-0 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {isRTL
                ? '🔒 المدفوعات آمنة ومشفرة عبر Stripe • يمكنك الإلغاء في أي وقت'
                : '🔒 Payments are secure & encrypted via Stripe • Cancel anytime'}
            </p>
          </div>

        </div>{/* end inner flex wrapper */}
      </DialogContent>
    </Dialog>
  );
}