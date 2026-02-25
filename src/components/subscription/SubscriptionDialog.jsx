import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionDialog({ open, onOpenChange, reason = 'unlimited_cards' }) {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const reasons = {
    unlimited_cards: {
      title_en: 'Upgrade to Premium',
      title_ar: 'الترقية إلى بريميوم',
      description_en: 'Free users can only create 1 card. Upgrade to premium for unlimited cards and advanced analytics.',
      description_ar: 'يمكن للمستخدمين المجانيين إنشاء بطاقة واحدة فقط. قم بالترقية إلى بريميوم للحصول على بطاقات غير محدودة وتحليلات متقدمة.'
    },
    advanced_analytics: {
      title_en: 'Unlock Advanced Analytics',
      title_ar: 'فتح التحليلات المتقدمة',
      description_en: 'View detailed analytics including activity charts, visitor insights, and performance metrics.',
      description_ar: 'اعرض التحليلات التفصيلية بما في ذلك رسوم النشاط ورؤى الزوار ومقاييس الأداء.'
    }
  };

  const currentReason = reasons[reason] || reasons.unlimited_cards;

  const premiumFeatures = [
    { label_en: 'Unlimited Cards', label_ar: 'بطاقات غير محدودة' },
    { label_en: 'Advanced Analytics', label_ar: 'تحليلات متقدمة' },
    { label_en: 'Custom Branding', label_ar: 'علامة تجارية مخصصة' },
    { label_en: 'Priority Support', label_ar: 'دعم ذو أولوية' },
    { label_en: 'Export Data', label_ar: 'تصدير البيانات' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {isRTL ? currentReason.title_ar : currentReason.title_en}
          </DialogTitle>
          <DialogDescription>
            {isRTL ? currentReason.description_ar : currentReason.description_en}
          </DialogDescription>
        </DialogHeader>

        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{isRTL ? 'خطة بريميوم' : 'Premium Plan'}</span>
              <span className="text-2xl font-bold text-amber-600">
                {isRTL ? 'ريال' : 'SAR'} 20<span className="text-sm">/{isRTL ? 'شهر' : 'month'}</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{isRTL ? feature.label_ar : feature.label_en}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={() => {
              navigate(createPageUrl('Pricing'));
              onOpenChange(false);
            }}
            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isRTL ? 'الترقية الآن' : 'Upgrade Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}