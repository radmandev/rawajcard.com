import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/supabaseAPI';
import { getUserSubscriptions, isEligibleForIntroTrial } from '@/lib/subscriptionEligibility';

export default function PromotionPopup({ open, onOpenChange, isRTL }) {
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
        <div className="p-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            {isRTL ? 'عرض خاص' : 'Special Offer'}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hey you Early bird!</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Catch this chance of 3 months premium free subscription
              <br />
              limited-time promo for new users
            </p>
            <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
              offer valid for limited quantity.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 hover:from-fuchsia-700 hover:via-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/30 border border-violet-300/40"
              onClick={() => {
                onOpenChange(false);
                window.location.href = createPageUrl('Upgrade');
              }}
            >
              {isTrialEligible
                ? (isRTL ? 'تجربة 90 يوم على بريميوم' : '90 days Trial on Premium')
                : (isRTL ? 'الترقية إلى بريميوم' : 'Upgrade to Premium')}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isRTL ? 'لاحقاً' : 'Later'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
