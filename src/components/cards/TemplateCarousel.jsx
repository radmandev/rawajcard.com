import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye, Crown, Lock } from 'lucide-react';
import CardPreview from './CardPreview';
import { ALL_TEMPLATES, DEFAULT_TIERS, canUseTemplate } from '@/lib/templateConfig';
import { api } from '@/api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';

export default function TemplateCarousel({ selectedTemplate, onSelect, onFocusChange, userPlan = 'free', onUpgrade }) {
  const { isRTL } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = ALL_TEMPLATES.findIndex(t => t.id === selectedTemplate);
    return idx >= 0 ? idx : 0;
  });
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const { data: tiersOverride = {} } = useQuery({
    queryKey: ['template-tiers'],
    queryFn: () => api.appSettings.get('template_tiers'),
    staleTime: 5 * 60 * 1000,
  });

  const effectiveTiers = { ...DEFAULT_TIERS, ...tiersOverride };

  const sampleCard = {
    name: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
    title: isRTL ? 'مدير التسويق' : 'Marketing Director',
    company: isRTL ? 'شركة رواج' : 'Rawaj Co.',
    bio: isRTL ? 'متخصص في التسويق الرقمي والاستراتيجية' : 'Digital marketing and strategy specialist',
    email: 'ahmed@rawaj.com',
    phone: '+966 50 123 4567',
    location: isRTL ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop',
  };

  const visibleTemplates = [
    ALL_TEMPLATES[(currentIndex - 1 + ALL_TEMPLATES.length) % ALL_TEMPLATES.length],
    ALL_TEMPLATES[currentIndex],
    ALL_TEMPLATES[(currentIndex + 1) % ALL_TEMPLATES.length],
  ];

  const handlePrev = () => {
    setCurrentIndex(prev => {
      const next = (prev - 1 + ALL_TEMPLATES.length) % ALL_TEMPLATES.length;
      onFocusChange?.(ALL_TEMPLATES[next].id);
      return next;
    });
  };

  const handleNext = () => {
    setCurrentIndex(prev => {
      const next = (prev + 1) % ALL_TEMPLATES.length;
      onFocusChange?.(ALL_TEMPLATES[next].id);
      return next;
    });
  };

  React.useEffect(() => {
    onFocusChange?.(ALL_TEMPLATES[currentIndex].id);
  }, []);

  const previewTpl = ALL_TEMPLATES.find(t => t.id === previewTemplate);
  const previewIsFree = previewTemplate ? canUseTemplate(previewTemplate, userPlan, tiersOverride) : true;

  return (
    <div className="relative px-12">
      <button onClick={handlePrev}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={handleNext}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="flex items-center justify-center gap-4">
        {visibleTemplates.map((template, index) => {
          const isCenter = index === 1;
          const isSelected = template.id === selectedTemplate;
          const isPremium = effectiveTiers[template.id] === 'premium';
          const accessible = canUseTemplate(template.id, userPlan, tiersOverride);

          return (
            <div
              key={`${template.id}-${index}`}
              className={cn(
                'transition-all duration-300 relative',
                isCenter ? 'scale-100 z-10' : 'scale-75 opacity-50'
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={cn(
                'w-64 rounded-xl overflow-hidden border-2 transition-all',
                isSelected
                  ? 'border-teal-500 ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-700'
              )}>
                <div className="aspect-[3/4] bg-white dark:bg-slate-900 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-start justify-center">
                    <div className="transform scale-[0.98] origin-top w-[417%]">
                      <CardPreview card={sampleCard} template={template.id} />
                    </div>
                  </div>

                  {isPremium && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg z-10">
                      <Crown className="h-3 w-3" />
                      PRO
                    </div>
                  )}

                  {isCenter && hoveredIndex === 1 && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                      {accessible ? (
                        <Button
                          onClick={() => onSelect(template.id, true)}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                          size="sm"
                        >
                          {isRTL ? 'استخدام القالب' : 'Use Template'}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => onUpgrade?.()}
                          className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white hover:from-amber-600"
                          size="sm"
                        >
                          <Lock className="h-3.5 w-3.5 mr-1.5" />
                          {isRTL ? 'ترقية للاستخدام' : 'Upgrade to Use'}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/90 hover:bg-white text-slate-800"
                        onClick={() => setPreviewTemplate(template.id)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        {isRTL ? 'معاينة' : 'Preview'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {isRTL ? template.nameAr : template.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {isRTL ? template.descriptionAr : template.description}
                    </p>
                  </div>
                  {!accessible && (
                    <Crown className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {ALL_TEMPLATES.map((t, index) => {
          const isPremium = effectiveTiers[t.id] === 'premium';
          return (
            <button
              key={index}
              onClick={() => { setCurrentIndex(index); onFocusChange?.(t.id); }}
              className={cn(
                'h-2 rounded-full transition-all',
                index === currentIndex
                  ? isPremium ? 'w-8 bg-amber-500' : 'w-8 bg-teal-600'
                  : 'w-2 bg-slate-300 dark:bg-slate-600'
              )}
            />
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400 mt-2">
        {currentIndex + 1} / {ALL_TEMPLATES.length} &nbsp;
        {isRTL
          ? `(${ALL_TEMPLATES.filter(t => effectiveTiers[t.id] === 'premium').length} مميز)`
          : `(${ALL_TEMPLATES.filter(t => effectiveTiers[t.id] === 'premium').length} Pro)`}
      </p>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {previewTpl && (isRTL ? previewTpl.nameAr : previewTpl.name)}
              {previewTpl && effectiveTiers[previewTpl.id] === 'premium' && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  <Crown className="h-3 w-3" />PRO
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <CardPreview card={sampleCard} template={previewTemplate} />
              {previewIsFree ? (
                <Button
                  onClick={() => { onSelect(previewTemplate, true); setPreviewTemplate(null); }}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {isRTL ? 'اختيار هذا القالب' : 'Select This Template'}
                </Button>
              ) : (
                <Button
                  onClick={() => { onUpgrade?.(); setPreviewTemplate(null); }}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {isRTL ? 'ترقية للوصول إلى هذا القالب' : 'Upgrade to Access This Template'}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
