import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { api } from '@/api/supabaseAPI';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  CreditCard,
  Edit2,
  ImagePlus,
  Link2,
  Loader2,
  Package,
  Plus,
  QrCode,
  Save,
  Trash2,
  Wifi,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getPendingPhysicalCards,
  clearPendingPhysicalCards,
  PREMADE_TEMPLATES,
  PhysicalCardPreview,
} from '@/components/store/PhysicalCardCustomizationModule';

// ─── Status badge helper ───────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:      { en: 'Pending Review',  ar: 'قيد المراجعة',    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  in_review:    { en: 'In Review',       ar: 'يُراجع',           color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  in_production:{ en: 'In Production',   ar: 'قيد الإنتاج',      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  shipped:      { en: 'Shipped',         ar: 'تم الشحن',         color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' },
  delivered:    { en: 'Delivered',       ar: 'تم التسليم',       color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
};

function StatusBadge({ status, isRTL }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {isRTL ? cfg.ar : cfg.en}
    </span>
  );
}

// ─── QR hook ──────────────────────────────────────────────────────────────────

function useQrDataUrl(value) {
  const [dataUrl, setDataUrl] = useState('');
  useEffect(() => {
    let mounted = true;
    if (!value?.trim()) { setDataUrl(''); return; }
    QRCode.toDataURL(value, { width: 220, margin: 1 })
      .then((url) => { if (mounted) setDataUrl(url); })
      .catch(() => { if (mounted) setDataUrl(''); });
    return () => { mounted = false; };
  }, [value]);
  return dataUrl;
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────

function EditCardDialog({ card, digitalCards, isOpen, onClose, onSaved, isRTL }) {
  const queryClient = useQueryClient();
  const [templateId, setTemplateId] = useState(card?.template_id || PREMADE_TEMPLATES[0].id);
  const [name, setName] = useState(card?.name || '');
  const [signature, setSignature] = useState(card?.signature || '');
  const [qrValue, setQrValue] = useState(card?.qr_value || '');
  const [picture, setPicture] = useState(card?.picture || '');
  const [linkedCardId, setLinkedCardId] = useState(card?.linked_card_id || '');

  const template = useMemo(
    () => PREMADE_TEMPLATES.find((t) => t.id === templateId) || PREMADE_TEMPLATES[0],
    [templateId]
  );
  const qrDataUrl = useQrDataUrl(qrValue);

  // When linked digital card changes, auto-fill QR URL from that card's public URL
  useEffect(() => {
    if (linkedCardId && linkedCardId !== 'none') {
      const linked = digitalCards?.find((c) => c.id === linkedCardId);
      if (linked?.slug) {
        const base = typeof window !== 'undefined' ? window.location.origin : 'https://rawajcard.com';
        setQrValue(`${base}/c/${linked.slug}`);
      }
    }
  }, [linkedCardId, digitalCards]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await api.entities.PhysicalCard.update(card.id, {
        template_id: templateId,
        name,
        signature: signature || name,
        qr_value: qrValue,
        picture: picture || null,
        linked_card_id: (linkedCardId && linkedCardId !== 'none') ? linkedCardId : null,
      });
    },
    onSuccess: () => {
      toast.success(isRTL ? 'تم تحديث البطاقة بنجاح' : 'Card updated successfully');
      queryClient.invalidateQueries({ queryKey: ['physical-cards'] });
      onSaved?.();
      onClose();
    },
    onError: () => {
      toast.error(isRTL ? 'تعذر التحديث' : 'Update failed');
    },
  });

  const onPictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPicture(e.target?.result || '');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&display=swap');`}</style>
        <DialogHeader>
          <DialogTitle>{isRTL ? 'تعديل البطاقة الفيزيائية' : 'Edit Physical Card'}</DialogTitle>
          <DialogDescription>
            {isRTL
              ? 'عدّل تصميم بطاقتك قبل إرسالها للطباعة'
              : 'Modify your card design before it goes to print'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Template picker */}
          <div className="space-y-2">
            <Label>{isRTL ? 'القالب' : 'Template'}</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PREMADE_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={`rounded-xl border px-2 py-1.5 text-xs font-semibold transition-all ${
                    templateId === t.id
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isRTL ? t.nameAr : t.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'الاسم *' : 'Name *'}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'التوقيع' : 'Signature'}</Label>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                style={{ fontFamily: "'Alexandria', 'Tajawal', sans-serif", fontStyle: 'italic' }}
              />
            </div>
          </div>

          {/* Link to digital card */}
          {digitalCards?.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                {isRTL ? 'ربط ببطاقة رقمية' : 'Link to Digital Card'}
              </Label>
              <Select value={linkedCardId || 'none'} onValueChange={setLinkedCardId}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر بطاقة رقمية...' : 'Select a digital card...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{isRTL ? 'بدون ربط' : 'No link'}</SelectItem>
                  {digitalCards.map((dc) => (
                    <SelectItem key={dc.id} value={dc.id}>
                      {dc.name || dc.full_name || dc.slug || dc.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">
                {isRTL
                  ? 'سيتم استخدام رابط البطاقة الرقمية تلقائياً في QR'
                  : 'The digital card URL will be used automatically in the QR code'}
              </p>
            </div>
          )}

          {/* QR value */}
          <div className="space-y-2">
            <Label>{isRTL ? 'رابط QR' : 'QR Link'}</Label>
            <Input value={qrValue} onChange={(e) => setQrValue(e.target.value)} dir="ltr" />
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <Label>{isRTL ? 'الصورة (اختياري)' : 'Photo (Optional)'}</Label>
            <label className="w-full cursor-pointer rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-3 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:border-teal-500 transition-colors">
              {picture
                ? <span className="text-teal-600 font-medium">{isRTL ? '✓ صورة موجودة — اضغط لتغييرها' : '✓ Photo set — click to change'}</span>
                : <><ImagePlus className="h-4 w-4" />{isRTL ? 'رفع صورة' : 'Upload photo'}</>
              }
              <input type="file" accept="image/*" className="hidden" onChange={onPictureChange} />
            </label>
          </div>

          {/* Card Preview */}
          <div className="space-y-2">
            <Label>{isRTL ? 'معاينة' : 'Preview'}</Label>
            <PhysicalCardPreview
              template={template}
              name={name}
              signature={signature || name}
              picture={picture}
              qrDataUrl={qrDataUrl}
              isRTL={isRTL}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !name.trim()}
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PhysicalCards() {
  const { isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [editCard, setEditCard] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me(),
    retry: false,
  });

  // Fetch physical cards
  const { data: physicalCards = [], isLoading } = useQuery({
    queryKey: ['physical-cards'],
    queryFn: async () => {
      const cards = await api.entities.PhysicalCard.list('-created_at');
      return cards;
    },
    enabled: Boolean(user?.id),
  });

  // Fetch user's digital cards for linking
  const { data: digitalCards = [] } = useQuery({
    queryKey: ['my-cards'],
    queryFn: async () => {
      const me = await api.auth.me();
      if (!me) return [];
      return api.entities.BusinessCard.filter({ created_by: me.email });
    },
    enabled: Boolean(user?.id),
  });

  // ── Claim pending cards from sessionStorage on mount / login ─────────────────
  useEffect(() => {
    if (!user?.id) return;
    const pending = getPendingPhysicalCards();
    if (!pending.length) return;

    const claimAll = async () => {
      setIsClaiming(true);
      try {
        for (const card of pending) {
          await api.entities.PhysicalCard.create({
            user_id: user.id,
            order_number: card.order_number || null,
            template_id: card.template_id,
            name: card.name,
            signature: card.signature || card.name,
            qr_value: card.qr_value || null,
            picture: card.picture || null,
            status: 'pending',
          });
        }
        clearPendingPhysicalCards();
        queryClient.invalidateQueries({ queryKey: ['physical-cards'] });
        toast.success(
          isRTL
            ? `تم استرداد ${pending.length} بطاقة فيزيائية إلى حسابك`
            : `${pending.length} physical card${pending.length > 1 ? 's' : ''} claimed to your account`
        );
      } catch (err) {
        console.error('Failed to claim pending physical cards:', err);
      } finally {
        setIsClaiming(false);
      }
    };

    claimAll();
  }, [user?.id]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.PhysicalCard.delete(id),
    onSuccess: () => {
      toast.success(isRTL ? 'تم حذف البطاقة' : 'Card deleted');
      queryClient.invalidateQueries({ queryKey: ['physical-cards'] });
      setDeleteId(null);
    },
    onError: () => toast.error(isRTL ? 'تعذر الحذف' : 'Delete failed'),
  });

  if (isLoading || isClaiming) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&display=swap');`}</style>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-teal-600" />
            {isRTL ? 'البطاقات الفيزيائية' : 'Physical Cards'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isRTL
              ? 'راجع وعدّل تصاميم بطاقات NFC الفيزيائية قبل الطباعة والشحن'
              : 'Review and edit your NFC physical card designs before printing and shipping'}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {physicalCards.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700">
          <CardContent className="py-16 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
              <Package className="h-7 w-7 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {isRTL ? 'لا توجد بطاقات فيزيائية بعد' : 'No physical cards yet'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isRTL
                  ? 'بعد إتمام طلب شراء بطاقة NFC ستجد تصاميمك هنا'
                  : 'After placing an NFC card order, your designs will appear here'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards grid */}
      <AnimatePresence>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {physicalCards.map((card) => (
            <PhysicalCardItem
              key={card.id}
              card={card}
              digitalCards={digitalCards}
              isRTL={isRTL}
              onEdit={() => setEditCard(card)}
              onDelete={() => setDeleteId(card.id)}
            />
          ))}
        </div>
      </AnimatePresence>

      {/* Edit dialog */}
      {editCard && (
        <EditCardDialog
          card={editCard}
          digitalCards={digitalCards}
          isOpen={Boolean(editCard)}
          onClose={() => setEditCard(null)}
          onSaved={() => setEditCard(null)}
          isRTL={isRTL}
        />
      )}

      {/* Delete confirm dialog */}
      <Dialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'حذف البطاقة' : 'Delete Card'}</DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'هل أنت متأكد من حذف هذه البطاقة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this card? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isRTL ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Card Item ─────────────────────────────────────────────────────────────────

function PhysicalCardItem({ card, digitalCards, isRTL, onEdit, onDelete }) {
  const qrDataUrl = useQrDataUrl(card.qr_value);

  const template = useMemo(
    () => PREMADE_TEMPLATES.find((t) => t.id === card.template_id) || PREMADE_TEMPLATES[0],
    [card.template_id]
  );

  const linkedDigital = digitalCards?.find((dc) => dc.id === card.linked_card_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="overflow-hidden border-slate-200 dark:border-slate-700">
        {/* Card preview */}
        <div className="p-3">
          <PhysicalCardPreview
            template={template}
            name={card.name}
            signature={card.signature || card.name}
            picture={card.picture}
            qrDataUrl={qrDataUrl}
            isRTL={isRTL}
          />
        </div>

        <CardContent className="px-4 pb-4 space-y-3">
          {/* Name + status */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">{card.name}</p>
              {card.order_number && (
                <p className="text-xs text-slate-400 font-mono mt-0.5">#{card.order_number}</p>
              )}
            </div>
            <StatusBadge status={card.status} isRTL={isRTL} />
          </div>

          {/* Linked digital card */}
          {linkedDigital && (
            <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-lg px-2.5 py-1.5">
              <Link2 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {isRTL ? 'مرتبطة بـ: ' : 'Linked to: '}
                {linkedDigital.name || linkedDigital.full_name || linkedDigital.slug}
              </span>
            </div>
          )}

          {/* Template name */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Wifi className="h-3 w-3" />
            {isRTL ? template.nameAr : template.nameEn}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={onEdit}
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              {isRTL ? 'تعديل' : 'Edit'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-slate-200 dark:border-slate-700"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
