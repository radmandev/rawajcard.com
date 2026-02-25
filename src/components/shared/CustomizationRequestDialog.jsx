import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { api } from '@/api/supabaseAPI';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from './LanguageContext';

export default function CustomizationRequestDialog({ open, onOpenChange, page, pageName }) {
  const { isRTL } = useLanguage();
  const [requestContent, setRequestContent] = useState('');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me()
  });

  const submitRequestMutation = useMutation({
    mutationFn: async () => {
      await api.entities.CustomizationRequest.create({
        customer_email: user.email,
        customer_name: user.full_name,
        page,
        request_content: requestContent,
        status: 'pending'
      });
    },
    onSuccess: () => {
      toast.success(isRTL ? 'تم إرسال طلبك بنجاح!' : 'Request submitted successfully!');
      setRequestContent('');
      onOpenChange(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requestContent.trim()) {
      toast.error(isRTL ? 'الرجاء إدخال وصف الطلب' : 'Please enter request details');
      return;
    }
    submitRequestMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            {isRTL ? 'طلب تخصيص' : 'Request Customization'}
          </DialogTitle>
          <DialogDescription>
            {isRTL 
              ? `أخبرنا بما تريد تحسينه في ${pageName}`
              : `Tell us what you'd like to improve in ${pageName}`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request">
              {isRTL ? 'وصف الطلب' : 'Request Details'}
            </Label>
            <Textarea
              id="request"
              placeholder={isRTL 
                ? 'مثال: أود إضافة ميزة تصدير البيانات إلى Excel...'
                : 'Example: I would like to add data export to Excel feature...'
              }
              value={requestContent}
              onChange={(e) => setRequestContent(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              {isRTL
                ? 'سيتم مراجعة طلبك من قبل فريقنا وسنعمل على تنفيذه في أقرب وقت ممكن'
                : 'Your request will be reviewed by our team and we\'ll work on it as soon as possible'
              }
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitRequestMutation.isPending}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={submitRequestMutation.isPending}
            >
              {submitRequestMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isRTL ? 'جاري الإرسال...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isRTL ? 'إرسال الطلب' : 'Submit Request'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}