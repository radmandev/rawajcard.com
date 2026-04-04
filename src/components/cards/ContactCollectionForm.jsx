import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/supabaseAPI';
import { toast } from 'sonner';

export default function ContactCollectionForm({ card, isRTL }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const settings = card.contact_form;
  const design = card.design || {};
  const primaryColor = design.primary_color || '#0D7377';
  const accentColor = design.accent_color || '#00B4D8';
  const borderRadius = design.border_radius || '12px';
  const fontFamily = design.font_family || 'Inter';

  const normalizeKey = (label = '') => label.toLowerCase().trim().replace(/\s+/g, '_');

  const extractMappedFields = () => {
    const fields = settings?.fields || [];
    const entries = fields.map((field) => {
      const key = normalizeKey(field.label);
      return { field, key, value: formData[key] || '' };
    });

    const findValue = (matcher) => entries.find(({ field }) => matcher(field))?.value || '';

    const name =
      findValue((f) => /name|اسم/i.test(f.label || '')) ||
      findValue((f) => (f.type || '').toLowerCase() === 'text') ||
      '';

    const email =
      findValue((f) => (f.type || '').toLowerCase() === 'email') ||
      findValue((f) => /email|بريد/i.test(f.label || '')) ||
      '';

    const phone =
      findValue((f) => ['phone', 'tel'].includes((f.type || '').toLowerCase())) ||
      findValue((f) => /phone|mobile|tel|هاتف|جوال/i.test(f.label || '')) ||
      '';

    const message =
      findValue((f) => (f.type || '').toLowerCase() === 'textarea') ||
      findValue((f) => /message|notes|comment|ملاحظة|رسالة/i.test(f.label || '')) ||
      '';

    return { name, email, phone, message };
  };

  useEffect(() => {
    if (!settings?.enabled || hasShown) return;

    const storageKey = `contact_form_shown_${card.id}`;
    
    if (settings.show_once) {
      const shown = localStorage.getItem(storageKey);
      if (shown) return;
    }

    const showForm = () => {
      setIsOpen(true);
      setHasShown(true);
      if (settings.show_once) {
        localStorage.setItem(storageKey, 'true');
      }
    };

    if (settings.show_trigger === 'after_delay') {
      const timer = setTimeout(() => {
        showForm();
      }, (settings.delay_seconds || 3) * 1000);
      return () => clearTimeout(timer);
    } else if (settings.show_trigger === 'on_scroll') {
      const handleScroll = () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > 50) {
          showForm();
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [settings, card.id, hasShown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Map dynamic form fields to Supabase contact_submissions schema
      const mapped = extractMappedFields();
      const submission = {
        card_id: card.id,
        card_owner: card.created_by || '',
        name: mapped.name,
        email: mapped.email,
        phone: mapped.phone,
        message: mapped.message,
        data: formData
      };

      const createdSubmission = await api.entities.ContactSubmission.create(submission);
      
      // Send to CRM webhook if configured
      try {
        await api.functions.invoke('sendContactToCRM', { 
          contactData: createdSubmission 
        });
      } catch (error) {
        console.error('CRM webhook failed:', error);
      }
      
      setIsSuccess(true);
      toast.success(isRTL ? 'تم إرسال النموذج بنجاح' : 'Form submitted successfully');

      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({});
      }, 2000);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(isRTL ? 'فشل إرسال النموذج' : 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settings?.enabled) return null;

  const isFullScreen = settings.display_type === 'full_screen';
  const isInline = settings.form_type === 'inline';

  if (isInline) {
    return (
      <div className="px-6 pb-6" style={{ fontFamily }}>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 border border-slate-200 dark:border-slate-700" style={{ borderRadius }}>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {isRTL && settings.title_ar ? settings.title_ar : settings.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            {isRTL && settings.description_ar ? settings.description_ar : settings.description}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {settings.fields?.map((field, index) => (
              <div key={index} className="space-y-2">
                <Label>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.label.toLowerCase().replace(/\s+/g, '_')] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [field.label.toLowerCase().replace(/\s+/g, '_')]: e.target.value
                    })}
                    rows={3}
                  />
                ) : (
                  <Input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.label.toLowerCase().replace(/\s+/g, '_')] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [field.label.toLowerCase().replace(/\s+/g, '_')]: e.target.value
                    })}
                  />
                )}
              </div>
            ))}
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full text-white"
              style={{ backgroundColor: accentColor, borderRadius }}
            >
              {isSubmitting 
                ? (isRTL ? 'جاري الإرسال...' : 'Submitting...') 
                : (isRTL && settings.button_label_ar ? settings.button_label_ar : settings.button_label)
              }
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={settings.allow_dismiss ? setIsOpen : undefined}>
      <DialogContent 
        className={isFullScreen ? "max-w-full h-screen m-0 rounded-none" : "max-w-md"}
        hideClose={!settings.allow_dismiss}
        style={{ fontFamily }}
      >
        {settings.allow_dismiss && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {isRTL ? 'شكراً!' : 'Thank You!'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center">
                {isRTL && settings.success_message_ar ? settings.success_message_ar : settings.success_message}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {isRTL && settings.title_ar ? settings.title_ar : settings.title}
                </DialogTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isRTL && settings.description_ar ? settings.description_ar : settings.description}
                </p>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {settings.fields?.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.label.toLowerCase().replace(/\s+/g, '_')] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [field.label.toLowerCase().replace(/\s+/g, '_')]: e.target.value
                        })}
                        rows={3}
                      />
                    ) : (
                      <Input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.label.toLowerCase().replace(/\s+/g, '_')] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [field.label.toLowerCase().replace(/\s+/g, '_')]: e.target.value
                        })}
                      />
                    )}
                  </div>
                ))}
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full text-white"
                  style={{ backgroundColor: accentColor, borderRadius }}
                >
                  {isSubmitting 
                    ? (isRTL ? 'جاري الإرسال...' : 'Submitting...') 
                    : (isRTL && settings.button_label_ar ? settings.button_label_ar : settings.button_label)
                  }
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}