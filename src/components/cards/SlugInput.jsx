import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Loader2, Link2 } from 'lucide-react';

export default function SlugInput({ value, onChange, currentCardId, onValidation }) {
  const { t, isRTL } = useLanguage();
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState('');

  const baseUrl = 'rawajcard.com/c/';

  useEffect(() => {
    if (!value) {
      setIsAvailable(null);
      setError('');
      onValidation?.(false);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      setError('');
      onValidation?.(false);

      // Validate slug format
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(value)) {
        setIsAvailable(false);
        setError(isRTL ? 'يُسمح فقط بالأحرف الصغيرة والأرقام والشرطات' : 'Only lowercase letters, numbers, and hyphens allowed');
        setChecking(false);
        onValidation?.(false);
        return;
      }

      // Check if slug is taken
      try {
        const existingCards = await api.entities.BusinessCard.filter({ slug: value });
        const isTaken = existingCards.some(card => card.id !== currentCardId);

        setIsAvailable(!isTaken);
        if (isTaken) {
          setError(t('slugTaken'));
          onValidation?.(false);
        } else {
          onValidation?.(true);
        }
      } catch (err) {
        console.error('Slug availability check failed:', err);
        // Assume available on error so the user is not blocked
        setIsAvailable(true);
        onValidation?.(true);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, currentCardId, isRTL, t]);

  const handleChange = (e) => {
    const newValue = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          {t('customLink')}
        </Label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('yourCardLink')}
        </p>
      </div>

      <div className={cn(
        "flex items-center rounded-xl overflow-hidden border-2 transition-colors",
        isAvailable === true && "border-green-500 bg-green-50 dark:bg-green-900/20",
        isAvailable === false && "border-red-500 bg-red-50 dark:bg-red-900/20",
        isAvailable === null && "border-slate-200 dark:border-slate-700"
      )}>
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium whitespace-nowrap">
          {baseUrl}
        </div>
        <Input
          value={value || ''}
          onChange={handleChange}
          placeholder={t('slugPlaceholder')}
          className="border-0 focus-visible:ring-0 text-lg"
        />
        <div className="px-4">
          {checking && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
          {!checking && isAvailable === true && <Check className="h-5 w-5 text-green-500" />}
          {!checking && isAvailable === false && <X className="h-5 w-5 text-red-500" />}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {isAvailable && !error && (
        <p className="text-sm text-green-500">{t('slugAvailable')}</p>
      )}

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isRTL 
            ? 'سيتمكن الأشخاص من الوصول إلى بطاقتك عبر هذا الرابط الدائم. اختر رابطاً سهل التذكر!'
            : 'People will access your card through this permanent link. Choose something memorable!'
          }
        </p>
      </div>
    </div>
  );
}