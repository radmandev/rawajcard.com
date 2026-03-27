import React, { useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactFormDialog({ isOpen, onClose, cardId, cardOwner, cardName }) {
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_email: '',
    visitor_phone: '',
    visitor_company: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.visitor_name) {
      toast.error(isRTL ? 'الرجاء إدخال الاسم' : 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await api.entities.ContactSubmission.create({
        card_id: cardId,
        card_owner: cardOwner,
        ...formData
      });
      toast.success(isRTL ? 'تم إرسال معلوماتك بنجاح!' : 'Your details have been shared!');
      setFormData({
        visitor_name: '',
        visitor_email: '',
        visitor_phone: '',
        visitor_company: '',
        notes: ''
      });
      onClose();
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ' : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-teal-600" />
            {isRTL ? 'شارك معلوماتك' : 'Share Your Details'}
          </DialogTitle>
          <DialogDescription>
            {isRTL 
              ? `شارك معلوماتك مع ${cardName}`
              : `Share your details with ${cardName}`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{isRTL ? 'الاسم' : 'Name'} *</Label>
            <Input
              value={formData.visitor_name}
              onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
              placeholder={isRTL ? 'اسمك' : 'Your name'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
            <Input
              type="email"
              value={formData.visitor_email}
              onChange={(e) => setFormData({ ...formData, visitor_email: e.target.value })}
              placeholder={isRTL ? 'بريدك الإلكتروني' : 'your@email.com'}
            />
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? 'رقم الهاتف' : 'Phone'}</Label>
            <Input
              type="tel"
              value={formData.visitor_phone}
              onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
              placeholder={isRTL ? 'رقم هاتفك' : 'Your phone number'}
            />
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? 'الشركة' : 'Company'}</Label>
            <Input
              value={formData.visitor_company}
              onChange={(e) => setFormData({ ...formData, visitor_company: e.target.value })}
              placeholder={isRTL ? 'اسم الشركة' : 'Company name'}
            />
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={isRTL ? 'ملاحظات إضافية' : 'Additional notes'}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isRTL ? 'إرسال' : 'Share'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}