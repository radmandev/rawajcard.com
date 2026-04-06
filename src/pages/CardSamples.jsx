import React, { useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import CardPreview from '@/components/cards/CardPreview';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ALL_TEMPLATES } from '@/lib/templateConfig';
import { createTemplateSampleUrl } from '@/lib/templateSampleCards';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_CARD_DATA } from '@/lib/templateSampleCards';

export default function CardSamples() {
  const { lang, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Get translated template list
  const templates = useMemo(() => {
    return ALL_TEMPLATES.map(template => ({
      ...template,
      displayName: lang === 'ar' ? template.nameAr : template.name,
      displayDesc: lang === 'ar' ? template.descriptionAr : template.description
    }));
  }, [lang]);

  const currentTemplate = templates[currentIndex];
  const totalTemplates = templates.length;

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : totalTemplates - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < totalTemplates - 1 ? prev + 1 : 0));
  };

  const handleCreateCard = () => {
    navigate(`/CardBuilder?template=${currentTemplate.id}`);
  };

  const handlePreviewCard = () => {
    navigate(createTemplateSampleUrl(currentTemplate, lang));
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    touchEndX.current = event.changedTouches[0].clientX;

    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (distance > threshold) {
      handleNext();
    } else if (distance < -threshold) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const translations = {
    en: {
      title: 'Digital Card Samples',
      subtitle: 'Explore our beautiful collection of digital business card templates',
      explore: 'Create Your Card',
      preview: 'Preview Sample Card',
      selectTemplate: 'Choose This Template',
      premiumBadge: 'Premium',
      freeBadge: 'Free',
      swipeHint: 'Swipe left or right to browse the samples'
    },
    ar: {
      title: 'نماذج البطاقات الرقمية',
      subtitle: 'اكتشف مجموعتنا الرائعة من قوالب بطاقات العمل الرقمية',
      explore: 'أنشئ بطاقتك',
      preview: 'معاينة البطاقة',
      selectTemplate: 'اختر هذا القالب',
      premiumBadge: 'ممتاز',
      freeBadge: 'مجاني',
      swipeHint: 'اسحب يميناً أو يساراً للتنقل بين النماذج'
    }
  };

  const t = translations[lang] || translations.en;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-white dark:bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-teal-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -z-10" />
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 px-2 leading-relaxed">
            {t.subtitle}
          </p>
          <button
            onClick={() => navigate('/CardBuilder')}
            className="bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600 text-white rounded-full px-10 py-4 text-lg font-semibold shadow-lg shadow-teal-500/25 transition-all duration-300"
          >
            {t.explore}
          </button>
        </div>
      </section>

      {/* Slider Section */}
      <section className="py-16 md:py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {currentTemplate && (
          <div className="flex items-center justify-center">
            {/* Card Container */}
            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg flex flex-col items-center">
              {/* Template Card */}
              <div
                className="group bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 md:p-8 w-full"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Badge */}
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentTemplate.defaultTier === 'premium'
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                  }`}>
                    {currentTemplate.defaultTier === 'premium' ? t.premiumBadge : t.freeBadge}
                  </span>
                </div>

                <div className="mb-4 space-y-3">
                  <div
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/25 bg-white/20 dark:bg-slate-900/30 backdrop-blur-xl px-3 py-2 shadow-lg"
                    dir="ltr"
                  >
                    <button
                      onClick={handlePrev}
                      className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-slate-900/70 text-white border border-white/15 hover:bg-teal-600 transition-colors"
                      aria-label="Previous template"
                    >
                      <ChevronLeft className={`w-5 h-5 ${isRTL ? 'transform rotate-180' : ''}`} />
                    </button>
                    <div className="flex-1 text-center text-sm sm:text-base font-semibold text-white tracking-wide">
                      {currentIndex + 1} / {totalTemplates}
                    </div>
                    <button
                      onClick={handleNext}
                      className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-slate-900/70 text-white border border-white/15 hover:bg-teal-600 transition-colors"
                      aria-label="Next template"
                    >
                      <ChevronRight className={`w-5 h-5 ${isRTL ? 'transform rotate-180' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handlePreviewCard}
                      className="w-full rounded-xl border border-white/25 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-900 font-semibold py-3 transition-colors shadow-lg"
                    >
                      {t.preview}
                    </button>
                    <button
                      onClick={handleCreateCard}
                      className="w-full rounded-xl border border-teal-500/30 bg-teal-600/95 backdrop-blur-xl text-white hover:bg-teal-700 font-semibold py-3 transition-colors shadow-lg"
                    >
                      {t.selectTemplate}
                    </button>
                  </div>
                </div>

                {/* Card Preview */}
                <div className="relative bg-gradient-to-b from-slate-100 dark:from-slate-900 to-slate-50 dark:to-slate-800 rounded-xl p-3 sm:p-4 md:p-6 flex items-center justify-center min-h-[290px] sm:min-h-[330px] md:min-h-[350px] overflow-hidden mb-6">
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-900/70 text-white border border-white/20 hover:bg-teal-600 transition-colors"
                    aria-label="Previous template"
                  >
                    <ChevronLeft className={`w-5 h-5 ${isRTL ? 'transform rotate-180' : ''}`} />
                  </button>

                  <div className="w-full max-w-[220px] sm:max-w-[260px] md:max-w-xs">
                    <CardPreview
                      card={SAMPLE_CARD_DATA}
                      template={currentTemplate.id}
                      showPlaceholder={true}
                      onLinkClick={() => {}}
                      onCardChange={() => {}}
                    />
                  </div>

                  <button
                    onClick={handleNext}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-900/70 text-white border border-white/20 hover:bg-teal-600 transition-colors"
                    aria-label="Next template"
                  >
                    <ChevronRight className={`w-5 h-5 ${isRTL ? 'transform rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Template Info */}
                <div className="mb-6">
                  <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mb-2">
                    {currentTemplate.displayName}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 leading-6">
                    {currentTemplate.displayDesc}
                  </p>

                  {/* Color Preview */}
                  <div className="flex gap-3 mb-6">
                    {currentTemplate.colors.slice(0, 3).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 shadow-md"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-center md:hidden text-xs text-slate-500 dark:text-slate-400">
                  {t.swipeHint}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-teal-600 dark:text-teal-400 text-sm font-semibold tracking-wider uppercase mb-4 block">
            {lang === 'ar' ? 'ابدأ الآن' : 'Start now'}
          </span>
          <Zap className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {lang === 'ar' ? 'جاهز لإنشاء بطاقتك؟' : 'Ready to Create Your Digital Card?'}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            {lang === 'ar' 
              ? 'اختر قالباً وابدأ في بناء هويتك الرقمية اليوم'
              : 'Pick a template and start building your digital identity today'}
          </p>
          <button
            onClick={() => navigate('/CardBuilder')}
            className="bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600 text-white rounded-full px-10 py-4 text-lg font-semibold shadow-lg shadow-teal-500/25"
          >
            {t.explore}
          </button>
        </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
