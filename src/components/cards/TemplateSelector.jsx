import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Eye, Grid3X3, List, Sparkles } from 'lucide-react';
import CardPreview from './CardPreview';

const templates = [
  {
    id: 'navy_gold',
    name: 'Navy Gold',
    nameAr: 'الأزرق الذهبي',
    description: 'Professional navy with gold accents',
    descriptionAr: 'أزرق داكن احترافي مع لمسات ذهبية',
    colors: ['#14274E', '#F4B400', '#FFFFFF'],
    preview: 'bg-gradient-to-br from-[#14274E] to-[#0D1B3E]'
  },
  {
    id: 'dark_minimal',
    name: 'Dark Minimal',
    nameAr: 'الداكن البسيط',
    description: 'Sleek black and white design',
    descriptionAr: 'تصميم أسود وأبيض أنيق',
    colors: ['#000000', '#1F2937', '#FFFFFF'],
    preview: 'bg-gradient-to-br from-black to-slate-900'
  },
  {
    id: 'purple_coral',
    name: 'Purple Coral',
    nameAr: 'البنفسجي المرجاني',
    description: 'Vibrant purple with coral highlights',
    descriptionAr: 'بنفسجي نابض مع لمسات مرجانية',
    colors: ['#7C3AED', '#F87171', '#FFFFFF'],
    preview: 'bg-gradient-to-br from-purple-600 to-violet-800'
  },
  {
    id: 'earthy_minimal',
    name: 'Earthy',
    nameAr: 'الترابي',
    description: 'Warm earthy tones with organic feel',
    descriptionAr: 'ألوان ترابية دافئة بإحساس طبيعي',
    colors: ['#92400E', '#FEF7ED', '#D97706'],
    preview: 'bg-gradient-to-br from-amber-100 to-orange-100'
  },
  {
    id: 'pink_modern',
    name: 'Rose Modern',
    nameAr: 'الوردي العصري',
    description: 'Fresh pink modern aesthetic',
    descriptionAr: 'جمالية وردية عصرية منعشة',
    colors: ['#F43F5E', '#FFF1F2', '#FB7185'],
    preview: 'bg-gradient-to-br from-pink-100 to-rose-200'
  },
  {
    id: 'orange_pro',
    name: 'Pro Business',
    nameAr: 'الأعمال الاحترافي',
    description: 'Corporate indigo with orange accent',
    descriptionAr: 'نيلي احترافي مع لمسة برتقالية',
    colors: ['#3730A3', '#F97316', '#F8FAFC'],
    preview: 'bg-gradient-to-br from-indigo-700 to-purple-800'
  },
];

export default function TemplateSelector({ selectedTemplate, onSelect }) {
  const { isRTL } = useLanguage();
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const sampleCard = {
    name: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
    title: isRTL ? 'مدير التسويق' : 'Marketing Director',
    company: isRTL ? 'شركة رواج' : 'Rawaj Co.',
    bio: isRTL ? 'متخصص في التسويق الرقمي والاستراتيجية' : 'Digital marketing and strategy specialist',
    email: 'ahmed@rawaj.com',
    phone: '+966 50 123 4567',
    whatsapp: '+966501234567',
    location: isRTL ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia',
    social_links: {
      linkedin: 'linkedin.com/in/ahmed',
      twitter: 'twitter.com/ahmed',
      instagram: 'instagram.com/ahmed'
    }
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'grid' 
                ? "bg-white dark:bg-slate-700 shadow-sm" 
                : "hover:bg-white/50 dark:hover:bg-slate-600"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'list' 
                ? "bg-white dark:bg-slate-700 shadow-sm" 
                : "hover:bg-white/50 dark:hover:bg-slate-600"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
      )}>
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={cn(
              "relative rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg",
              selectedTemplate === template.id
                ? "border-teal-500 ring-2 ring-teal-500/20"
                : "border-slate-200 dark:border-slate-700 hover:border-teal-300"
            )}
          >
            {/* Preview */}
            <div className={cn("aspect-[3/4] relative", template.preview)}>
              {/* Color Bar */}
              <div className="absolute bottom-0 left-0 right-0 flex">
                {template.colors.map((color, i) => (
                  <div 
                    key={i}
                    className="h-2 flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* Preview Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewTemplate(template.id);
                }}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>

              {/* Selected Badge */}
              {selectedTemplate === template.id && (
                <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-teal-500 flex items-center justify-center text-white">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {/* Template Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-white dark:bg-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                {isRTL ? template.nameAr : template.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {isRTL ? template.descriptionAr : template.description}
              </p>
            </div>
          </button>
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
                  onSelect(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {isRTL ? 'اختيار هذا القالب' : 'Select This Template'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}