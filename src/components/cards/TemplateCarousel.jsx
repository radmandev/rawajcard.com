import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import CardPreview from './CardPreview';
import TemplateNoqtatain1 from './templates/TemplateNoqtatain1';
import TemplateNoqtatain2 from './templates/TemplateNoqtatain2';
import TemplateNoqtatain3 from './templates/TemplateNoqtatain3';
import TemplateNoqtatain4 from './templates/TemplateNoqtatain4';
import TemplateNoqtatain6 from './templates/TemplateNoqtatain6';

const templates = [
  {
    id: 'navy_gold',
    name: 'Navy Gold',
    nameAr: 'الأزرق الذهبي',
    description: 'Professional navy with gold accents',
    descriptionAr: 'أزرق داكن احترافي مع لمسات ذهبية'
  },
  {
    id: 'dark_minimal',
    name: 'Dark Minimal',
    nameAr: 'الداكن البسيط',
    description: 'Sleek black and white design',
    descriptionAr: 'تصميم أسود وأبيض أنيق'
  },
  {
    id: 'purple_coral',
    name: 'Purple Coral',
    nameAr: 'البنفسجي المرجاني',
    description: 'Vibrant purple with coral highlights',
    descriptionAr: 'بنفسجي نابض مع لمسات مرجانية'
  },
  {
    id: 'earthy_minimal',
    name: 'Earthy',
    nameAr: 'الترابي',
    description: 'Warm earthy tones with organic feel',
    descriptionAr: 'ألوان ترابية دافئة بإحساس طبيعي'
  },
  {
    id: 'pink_modern',
    name: 'Rose Modern',
    nameAr: 'الوردي العصري',
    description: 'Fresh pink modern aesthetic',
    descriptionAr: 'جمالية وردية عصرية منعشة'
  },
  {
    id: 'orange_pro',
    name: 'Pro Business',
    nameAr: 'الأعمال الاحترافي',
    description: 'Corporate indigo with orange accent',
    descriptionAr: 'نيلي احترافي مع لمسة برتقالية'
  },
  {
    id: 'noqtatain1',
    name: 'Wave Blue',
    nameAr: 'موجة زرقاء',
    description: 'Elegant wave design with profile focus',
    descriptionAr: 'تصميم موجي أنيق مع تركيز على الملف الشخصي'
  },
  {
    id: 'noqtatain2',
    name: 'Gradient Pro',
    nameAr: 'متدرج احترافي',
    description: 'Modern gradient with clean layout',
    descriptionAr: 'تدرج حديث مع تخطيط نظيف'
  },
  {
    id: 'noqtatain3',
    name: 'Cover Style',
    nameAr: 'نمط الغلاف',
    description: 'Cover image with overlaid profile',
    descriptionAr: 'صورة غلاف مع ملف شخصي متراكب'
  },
  {
    id: 'noqtatain4',
    name: 'Wave Pro',
    nameAr: 'موجة احترافية',
    description: 'Professional wave background design',
    descriptionAr: 'تصميم خلفية موجية احترافية'
  },
  {
    id: 'noqtatain6',
    name: 'Color Pop',
    nameAr: 'انفجار الألوان',
    description: 'Vibrant colored background with modern feel',
    descriptionAr: 'خلفية ملونة نابضة بالحياة مع إحساس عصري'
  },
];

export default function TemplateCarousel({ selectedTemplate, onSelect, onFocusChange }) {
  const { isRTL } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const sampleCard = {
    name: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
    title: isRTL ? 'مدير التسويق' : 'Marketing Director',
    company: isRTL ? 'شركة رواج' : 'Rawaj Co.',
    bio: isRTL ? 'متخصص في التسويق الرقمي والاستراتيجية' : 'Digital marketing and strategy specialist',
    email: 'ahmed@rawaj.com',
    phone: '+966 50 123 4567',
    location: isRTL ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia'
  };

  const visibleTemplates = [
    templates[(currentIndex - 1 + templates.length) % templates.length],
    templates[currentIndex],
    templates[(currentIndex + 1) % templates.length]
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const newIndex = (prev - 1 + templates.length) % templates.length;
      onFocusChange?.(templates[newIndex].id);
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = (prev + 1) % templates.length;
      onFocusChange?.(templates[newIndex].id);
      return newIndex;
    });
  };

  // Notify parent of initial focused template
  React.useEffect(() => {
    onFocusChange?.(templates[currentIndex].id);
  }, []);

  return (
    <div className="relative px-12">
      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Carousel */}
      <div className="flex items-center justify-center gap-4">
        {visibleTemplates.map((template, index) => {
          const isCenter = index === 1;
          const isSelected = template.id === selectedTemplate;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={`${template.id}-${index}`}
              className={cn(
                "transition-all duration-300 relative",
                isCenter ? "scale-100 z-10" : "scale-75 opacity-50"
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={cn(
                  "w-64 rounded-xl overflow-hidden border-2 transition-all",
                  isSelected
                    ? "border-teal-500 ring-2 ring-teal-500/20"
                    : "border-slate-200 dark:border-slate-700"
                )}
              >
                {/* Template Preview */}
                <div className="aspect-[3/4] bg-white dark:bg-slate-900 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-start justify-center">
                    <div className="transform scale-[0.98] origin-top w-[417%]">
                      <CardPreview 
                        card={sampleCard} 
                        template={template.id}
                      />
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {isRTL ? template.nameAr : template.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isRTL ? template.descriptionAr : template.description}
                  </p>
                </div>

                {/* Hover Actions */}
                {isCenter && isHovered && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 backdrop-blur-sm transition-all">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(template.id, true);
                      }}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      {isRTL ? 'استخدام القالب' : 'Use Template'}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        // On mobile, scroll to preview section
                        if (window.innerWidth < 1024) {
                          onFocusChange?.(template.id);
                          onSelect(template.id, false);
                          setTimeout(() => {
                            const previewSection = document.querySelector('[data-preview-section]');
                            previewSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        } else {
                          setPreviewTemplate(template.id);
                        }
                      }}
                      variant="outline"
                      className="bg-white/90 hover:bg-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {isRTL ? 'معاينة' : 'Preview'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {templates.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-2 rounded-full transition-all",
              index === currentIndex
                ? "w-8 bg-teal-600"
                : "w-2 bg-slate-300 dark:bg-slate-600"
            )}
          />
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {isRTL ? 'معاينة القالب' : 'Template Preview'}
            </DialogTitle>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <CardPreview 
                card={sampleCard} 
                template={previewTemplate}
              />
              
              <Button
                onClick={() => {
                  onSelect(previewTemplate, true);
                  setPreviewTemplate(null);
                }}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {isRTL ? 'اختيار هذا القالب' : 'Select This Template'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}