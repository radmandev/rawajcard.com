import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/supabaseAPI';
import { getUserSubscriptions, isEligibleForIntroTrial } from '@/lib/subscriptionEligibility';
import LoginModal from '@/components/auth/LoginModal';

export default function PromotionPopup({ open, onOpenChange, isRTL }) {
  const [loginOpen, setLoginOpen] = useState(false);

  const { data: me } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me(),
  });

  const { data: earlyBirdOffer } = useQuery({
    queryKey: ['premium-early-bird-offer-public'],
    queryFn: () => api.appSettings.get('premium_early_bird_offer'),
  });

  const { data: subscriptionHistory = [] } = useQuery({
    queryKey: ['subscription-trial-eligibility', me?.id || me?.email || 'guest'],
    queryFn: async () => getUserSubscriptions(api, me),
    enabled: !!me,
  });

  const isTrialEligible = isEligibleForIntroTrial({
    me,
    subscriptions: subscriptionHistory,
    newUserWindowDays: Number(earlyBirdOffer?.new_user_window_days || 30),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border border-amber-200/70 dark:border-amber-800/40 bg-white dark:bg-slate-900">
        <div className="p-6 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            {isRTL ? 'عرض حصري' : 'Exclusive Drop'}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isRTL ? '🚀 انطلق معنا مع رواج' : '🚀 Launch with Rawaj'}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {isRTL
                ? 'فعّل بطاقتك الرقمية بلمسة إبداعية واحصل على تجربة بريميوم لمدة 3 أشهر'
                : 'Build your smart card with style and unlock 3 months of Premium access'}
              <br />
              {isRTL
                ? 'عرض محدود للمستخدمين الجدد — لا تفوّت الفرصة'
                : 'Limited-time offer for new users — don’t miss it'}
            </p>
            <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
              {isRTL ? 'لفترة محدودة وبعدد مقاعد محدود' : 'Limited quantity available'}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 hover:from-fuchsia-700 hover:via-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/30 border border-violet-300/40"
              onClick={() => {
                onOpenChange(false);
                setLoginOpen(true);
              }}
            >
              {isTrialEligible
                ? (isRTL ? 'ابدأ تجربة 90 يوم' : 'Start 90-day trial')
                : (isRTL ? 'الترقية الآن' : 'Upgrade now')}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isRTL ? 'لاحقاً' : 'Later'}
            </Button>
          </div>
        </div>
      </DialogContent>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Dialog>
  );
}
