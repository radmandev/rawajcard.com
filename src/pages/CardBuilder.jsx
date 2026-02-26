import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TemplateCarousel from '@/components/cards/TemplateCarousel';
import SimpleForm from '@/components/cards/SimpleForm';
import CardPreview from '@/components/cards/CardPreview';
import SlugInput from '@/components/cards/SlugInput';
import QRCodeDisplay from '@/components/cards/QRCodeDisplay';
import QRCodeCustomizer from '@/components/cards/QRCodeCustomizer';
import NFCCardAd from '@/components/cards/NFCCardAd';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';
import FloatingActions from '@/components/cards/FloatingActions';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader2, 
  Sparkles,
  Palette,
  Link2,
  PartyPopper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const STEPS = [
  { key: 'template', icon: Palette, labelEn: 'Choose Template', labelAr: 'اختر القالب' },
  { key: 'customize', icon: Sparkles, labelEn: 'Customize', labelAr: 'تخصيص' },
  { key: 'link', icon: Link2, labelEn: 'Custom Link', labelAr: 'الرابط المخصص' },
  { key: 'publish', icon: PartyPopper, labelEn: 'Publish', labelAr: 'نشر' },
];

export default function CardBuilder() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const cardId = urlParams.get('id');

  const [currentStep, setCurrentStep] = useState(0);
  const [focusedTemplate, setFocusedTemplate] = useState('navy_gold');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [limitChecked, setLimitChecked] = useState(false);
  const [previewEditMode, setPreviewEditMode] = useState(false);
  const [slugValid, setSlugValid] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [card, setCard] = useState({
    template: 'modern',
    status: 'draft',
    design: {
      primary_color: '#0D7377',
      secondary_color: '#14274E',
      accent_color: '#00B4D8'
    },
    social_links: {}
  });

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me()
  });
  // Get user's subscription and existing cards
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const subs = await api.entities.Subscription.list();
      return subs[0] || { plan: 'free', card_limit: 1 };
    }
  });

  const { data: existingCards = [] } = useQuery({
    queryKey: ['my-cards'],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      // Only count published cards toward the limit — drafts never block creation
      return api.entities.BusinessCard.filter({ created_by: currentUser.email, status: 'published' });
    },
    enabled: !cardId && !!currentUser
  });

  // Load existing card if editing
  const { data: existingCard, isLoading: loadingCard } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => api.entities.BusinessCard.get(cardId),
    enabled: !!cardId
  });

  useEffect(() => {
    if (existingCard && existingCard.id) {
      setCard(existingCard);
      // If card already has a slug, mark it as valid (it was saved before)
      if (existingCard.slug) {
        setSlugValid(true);
      }
      // If already published, go to last step
      if (existingCard.status === 'published') {
        setCurrentStep(STEPS.length - 1);
      }
    }
  }, [existingCard]);

  // Check card limit on mount for new cards
  useEffect(() => {
    if (!cardId && !limitChecked && subscription && existingCards) {
      if (!canCreateNewCard()) {
        setShowUpgradeDialog(true);
      }
      setLimitChecked(true);
    }
  }, [cardId, subscription, existingCards, limitChecked]);

  // Celebration effect when card is published
  useEffect(() => {
    if (currentStep === STEPS.length - 1 && card.status === 'published') {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#0D7377', '#14274E', '#00B4D8', '#F4B400']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#0D7377', '#14274E', '#00B4D8', '#F4B400']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [currentStep, card.status]);

  // Check card limit before creating new card
  const canCreateNewCard = () => {
    if (cardId) return true; // Editing existing card
    if (!subscription) return true; // Loading
    if (subscription.plan === 'premium') return true;
    return existingCards.length < subscription.card_limit;
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Strip id and DB-managed/read-only fields before sending to DB
      const { id, created_at, updated_at, created_by_user_id, user_id: _uid, ...cleanData } = data;
      // Always set created_by and user_id from current user
      if (currentUser?.email) cleanData.created_by = currentUser.email;
      if (currentUser?.id) cleanData.user_id = currentUser.id;
      if (id) {
        // On updates, don't overwrite user_id
        const { user_id: _drop, ...updateData } = cleanData;
        return api.entities.BusinessCard.update(id, updateData);
      } else {
        return api.entities.BusinessCard.create(cleanData);
      }
    },
    onSuccess: (result) => {
      setCard(result);
      queryClient.invalidateQueries({ queryKey: ['my-cards'] });
    }
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      const { id, created_at, updated_at, created_by_user_id, user_id: _uid, ...cleanData } = card;
      const publishData = {
        ...cleanData,
        status: 'published',
        published_at: new Date().toISOString(),
        ...(currentUser?.email ? { created_by: currentUser.email } : {})
      };
      if (card.id) {
        // On updates, don't overwrite user_id
        const { user_id: _drop, ...updateData } = publishData;
        return api.entities.BusinessCard.update(card.id, updateData);
      } else {
        if (currentUser?.id) publishData.user_id = currentUser.id;
        return api.entities.BusinessCard.create(publishData);
      }
    },
    onSuccess: (result) => {
      setCard(result);
      queryClient.invalidateQueries({ queryKey: ['my-cards'] });
      toast.success(isRTL ? 'تم النشر بنجاح!' : 'Published successfully!');
    },
    onError: (error) => {
      console.error('Publish card failed:', error);
      toast.error(isRTL ? 'فشل النشر' : 'Publish failed');
    }
  });

  const handleNext = async () => {
    if (currentStep === 1) {
      // Auto-save on Customize → Link transition so data is persisted early
      try {
        const { id, created_at, updated_at, created_by_user_id, user_id: _uid, ...cleanData } = card;
        if (currentUser?.email) cleanData.created_by = currentUser.email;
        let saved;
        if (card.id) {
          // On updates, don't overwrite user_id
          const { user_id: _drop, ...updateData } = cleanData;
          saved = await api.entities.BusinessCard.update(card.id, updateData);
        } else {
          if (currentUser?.id) cleanData.user_id = currentUser.id;
          saved = await api.entities.BusinessCard.create(cleanData);
        }
        setCard(saved);
        queryClient.invalidateQueries({ queryKey: ['my-cards'] });
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't block navigation — we'll retry the save on the slug step
        toast.error(isRTL ? 'تحذير: فشل الحفظ التلقائي' : 'Warning: Auto-save failed. You can still continue.');
      }
    }

    if (currentStep === 2) {
      setSaveError(null);
      // Save slug before publishing step
      try {
        await saveMutation.mutateAsync(card);
      } catch (error) {
        console.error('Save failed at step 2:', error);
        const msg = error?.message || (isRTL ? 'فشل الحفظ، تحقق من الاتصال' : 'Save failed. Please check your connection and try again.');
        setSaveError(msg);
        toast.error(msg);
        return;
      }
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraftAndOpenPricing = async () => {
    try {
      const draftData = { ...card, status: 'draft' };
      const { id, created_at, updated_at, created_by_user_id, user_id: _uid, ...cleanData } = draftData;
      if (currentUser?.email) cleanData.created_by = currentUser.email;
      let saved;
      if (card.id) {
        const { user_id: _drop, ...updateData } = cleanData;
        saved = await api.entities.BusinessCard.update(card.id, updateData);
      } else {
        if (currentUser?.id) cleanData.user_id = currentUser.id;
        saved = await api.entities.BusinessCard.create(cleanData);
      }
      setCard(saved);
      queryClient.invalidateQueries({ queryKey: ['my-cards'] });
      toast.success(isRTL ? 'تم حفظ المسودة' : 'Draft saved!');
    } catch (err) {
      console.error('Save draft failed:', err);
      toast.error(isRTL ? 'تعذّر حفظ المسودة' : 'Could not save draft');
    }
    setShowUpgradeDialog(true);
  };

  const handlePublish = async () => {
    // Check limit before publishing new card
    if (!card.id && !canCreateNewCard()) {
      setShowUpgradeDialog(true);
      toast.error(isRTL ? 'الرجاء الترقية للحصول على بطاقات غير محدودة' : 'Please upgrade for unlimited cards');
      return;
    }
    try {
      await publishMutation.mutateAsync();
    } catch (error) {
      toast.error(error?.message || (isRTL ? 'فشل النشر' : 'Publish failed'));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!card.template;
      case 1:
        return !!card.name;
      case 2:
        return !!card.slug && slugValid;
      default:
        return true;
    }
  };

  if (loadingCard && cardId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <SubscriptionDialog 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog}
        reason="unlimited_cards"
      />
      
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.key}>
              <button
                onClick={() => index <= currentStep && setCurrentStep(index)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  currentStep === index
                    ? "bg-teal-600 text-white"
                    : currentStep > index
                    ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 cursor-pointer hover:bg-teal-200"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                )}
                disabled={index > currentStep}
              >
                <step.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  {isRTL ? step.labelAr : step.labelEn}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "w-8 md:w-16 h-0.5 mx-2",
                  currentStep > index ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Area */}
        <div>
          <AnimatePresence mode="wait">
            {/* Step 1: Template Selection */}
            {currentStep === 0 && (
              <motion.div
                key="template"
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
              >
                <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
                  <CardHeader>
                    <CardTitle>{t('selectTemplate')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TemplateCarousel
                     selectedTemplate={card.template}
                     onSelect={(template, moveNext) => {
                       if (!cardId && !canCreateNewCard()) {
                         setShowUpgradeDialog(true);
                         return;
                       }
                       setCard({ ...card, template });
                       if (moveNext) {
                         setCurrentStep(1);
                       }
                     }}
                     onFocusChange={(template) => setFocusedTemplate(template)}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Customize */}
            {currentStep === 1 && (
              <motion.div
                key="customize"
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
              >
                <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
                  <CardHeader>
                    <CardTitle>{t('customize')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SimpleForm card={card} onChange={setCard} onSaveDraft={handleSaveDraftAndOpenPricing} />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Custom Link */}
            {currentStep === 2 && (
              <motion.div
                key="link"
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
              >
                <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
                  <CardHeader>
                    <CardTitle>{t('customLink')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SlugInput
                      value={card.slug}
                      onChange={(slug) => {
                        setCard({ ...card, slug });
                        setSlugValid(false); // reset while user types
                      }}
                      currentCardId={card.id}
                      onValidation={setSlugValid}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Publish */}
            {currentStep === 3 && (
              <motion.div
                key="publish"
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
              >
                <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {card.status === 'published' ? (
                        <>
                          <Check className="h-5 w-5 text-green-500" />
                          {isRTL ? 'تم النشر!' : 'Published!'}
                        </>
                      ) : (
                        <>
                          <PartyPopper className="h-5 w-5" />
                          {t('publishCard')}
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {card.status === 'published' ? (
                      <div className="space-y-6">
                        <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                          <PartyPopper className="h-12 w-12 mx-auto text-green-500 mb-3" />
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            {isRTL ? 'بطاقتك جاهزة!' : 'Your card is live!'}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400">
                            {isRTL 
                              ? 'يمكنك الآن مشاركة بطاقتك مع العالم'
                              : 'You can now share your card with the world'
                            }
                          </p>
                        </div>

                        <QRCodeCustomizer
                          qrSettings={card.qr_settings || {}}
                          onChange={(qr_settings) => {
                            setCard({ ...card, qr_settings });
                            saveMutation.mutate({ qr_settings });
                          }}
                          slug={card.slug}
                        />

                        <QRCodeDisplay slug={card.slug} qrSettings={card.qr_settings} size={200} />

                        {/* NFC Card Advertisement */}
                        <NFCCardAd 
                          cardName={card.name || card.name_ar}
                          cardUrl={card.slug ? `${window.location.origin}/c/${card.slug}` : ''}
                        />

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setCurrentStep(1)}
                          >
                            {t('edit')}
                          </Button>
                          <Button
                            className="flex-1 bg-teal-600 hover:bg-teal-700"
                            asChild
                          >
                            <a 
                              href={`/c/${card.slug}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {t('viewCard')}
                            </a>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                            {isRTL ? 'ملخص البطاقة' : 'Card Summary'}
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">{t('name')}:</span>
                              <span className="font-medium text-slate-900 dark:text-white">{card.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">{t('customLink')}:</span>
                              <span className="font-mono text-teal-600">my.rawajcard.com/c/{card.slug}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">{isRTL ? 'القالب' : 'Template'}:</span>
                              <span className="capitalize">{card.template}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handlePublish}
                          disabled={publishMutation.isPending}
                          className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                          size="lg"
                        >
                          {publishMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {isRTL ? 'جاري النشر...' : 'Publishing...'}
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              {t('publish')}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 3 && (
            <>
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  {isRTL ? <ChevronRight className="h-4 w-4 mr-2" /> : <ChevronLeft className="h-4 w-4 mr-2" />}
                  {t('back')}
                </Button>
                <Button
                  onClick={() => {
                    if (!cardId && !canCreateNewCard() && currentStep === 0) {
                      setShowUpgradeDialog(true);
                      return;
                    }
                    handleNext();
                  }}
                  disabled={!canProceed() || saveMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      {t('next')}
                      {isRTL ? <ChevronLeft className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
                    </>
                  )}
                </Button>
              </div>
              {/* Persistent error display for step 2 save failure */}
              {currentStep === 2 && saveError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                  ⚠️ {saveError}
                </div>
              )}
            </>
          )}
        </div>

        {/* Preview Area */}
        <div className="lg:sticky lg:top-24 h-fit" data-preview-section>
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {t('preview')}
                </div>
                {currentStep === 1 && (
                  <Button
                    variant={previewEditMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewEditMode(!previewEditMode)}
                    className={previewEditMode ? "bg-teal-600 hover:bg-teal-700" : ""}
                  >
                    {previewEditMode 
                      ? (isRTL ? 'تعطيل التعديل' : 'Exit Edit') 
                      : (isRTL ? 'تعديل مباشر' : 'Quick Edit')
                    }
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 relative overflow-hidden">
                {/* Template Switch Arrows for Customize Step */}
                {currentStep === 1 && (
                  <>
                    <button
                      onClick={() => {
                        const templates = ['navy_gold', 'dark_minimal', 'purple_coral', 'earthy_minimal', 'pink_modern', 'orange_pro', 'noqtatain1', 'noqtatain2', 'noqtatain3', 'noqtatain4', 'noqtatain6', 'modern_gradient', 'luxury_gold', 'tech_blue', 'sunset_warm', 'forest_green'];
                        const currentIndex = templates.indexOf(card.template);
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : templates.length - 1;
                        setCard({ ...card, template: templates[prevIndex] });
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <ChevronLeft className="h-5 w-5 text-teal-600" />
                    </button>
                    <button
                      onClick={() => {
                        const templates = ['navy_gold', 'dark_minimal', 'purple_coral', 'earthy_minimal', 'pink_modern', 'orange_pro', 'noqtatain1', 'noqtatain2', 'noqtatain3', 'noqtatain4', 'noqtatain6', 'modern_gradient', 'luxury_gold', 'tech_blue', 'sunset_warm', 'forest_green'];
                        const currentIndex = templates.indexOf(card.template);
                        const nextIndex = currentIndex < templates.length - 1 ? currentIndex + 1 : 0;
                        setCard({ ...card, template: templates[nextIndex] });
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <ChevronRight className="h-5 w-5 text-teal-600" />
                    </button>
                  </>
                )}
                
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto">
                  {currentStep === 0 ? (
                    <CardPreview 
                      card={{ 
                        name: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
                        title: isRTL ? 'مدير التسويق' : 'Marketing Director',
                        company: isRTL ? 'شركة رواج' : 'Rawaj Co.',
                        bio: isRTL ? 'متخصص في التسويق الرقمي والاستراتيجية' : 'Digital marketing and strategy specialist',
                        email: 'ahmed@rawaj.com',
                        phone: '+966 50 123 4567',
                        location: isRTL ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia',
                        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                        company_logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
                        cover_image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop'
                      }} 
                      template={focusedTemplate}
                      showPlaceholder={false}
                    />
                  ) : (
                    <>
                      <CardPreview 
                        card={{
                          ...card,
                          profile_image: card.profile_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                          company_logo: card.company_logo || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
                          cover_image: card.cover_image || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop'
                        }} 
                        template={card.template}
                        showPlaceholder={!card.name}
                        editMode={previewEditMode}
                        onCardChange={(field, value) => {
                          setCard({ ...card, [field]: value });
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Floating Actions Preview */}
                {currentStep > 0 && (
                  <FloatingActions 
                    card={card} 
                    isRTL={isRTL}
                    cardUrl={card.slug ? `${window.location.origin}/c/${card.slug}` : window.location.href}
                  />
                )}

                {/* Contact Form Preview Note */}
                {currentStep > 0 && card.contact_form?.enabled && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
                    {isRTL ? 'نموذج جمع جهات الاتصال سيظهر تلقائياً' : 'Contact form will show automatically'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}