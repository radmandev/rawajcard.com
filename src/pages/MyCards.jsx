import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import QRCodeDisplay from '@/components/cards/QRCodeDisplay';
import CustomizationRequestDialog from '@/components/shared/CustomizationRequestDialog';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  QrCode, 
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function MyCards() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [qrDialog, setQrDialog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['my-cards'],
    queryFn: async () => {
      const me = await api.auth.me();
      if (!me) return [];

      const [byEmail, byUserId] = await Promise.all([
        me.email
          ? api.entities.BusinessCard.filter({ created_by: me.email }, '-created_at')
          : Promise.resolve([]),
        me.id
          ? api.entities.BusinessCard.filter({ created_by_user_id: me.id }, '-created_at')
          : Promise.resolve([])
      ]);

      const uniqueCards = new Map();
      [...byEmail, ...byUserId].forEach((card) => {
        if (card?.id) {
          uniqueCards.set(card.id, card);
        }
      });

      return Array.from(uniqueCards.values()).sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    },
    initialData: [],
    staleTime: 0
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.BusinessCard.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-cards'] });
      setDeleteDialog(null);
      toast.success(isRTL ? 'تم حذف البطاقة' : 'Card deleted');
    }
  });

  const handleCopyLink = async (card) => {
    const url = `https://rawajcard.com/c/${card.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(t('linkCopied'));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {t('myCards')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isRTL 
              ? `لديك ${cards.length} بطاقة`
              : `You have ${cards.length} card${cards.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRequestDialog(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            {isRTL ? 'طلب تخصيص' : 'Request'}
          </Button>
          <Link to={createPageUrl('CardBuilder')}>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              {t('newCard')}
            </Button>
          </Link>
        </div>
      </div>

      <CustomizationRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        page="my_cards"
        pageName={t('myCards')}
      />

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CreditCard className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {t('noCards')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-sm">
              {t('createFirstCard')}
            </p>
            <Link to={createPageUrl('CardBuilder')}>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />
                {t('createCard')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "overflow-hidden bg-white dark:bg-slate-800/50",
                  "border-slate-200/50 dark:border-slate-700/50",
                  "hover:shadow-xl transition-all group"
                )}>
                  {/* Enhanced Card Preview - Similar to actual card */}
                  <div className="relative">
                    {/* Cover/Header */}
                    <div 
                      className="h-32 relative"
                      style={{ 
                        background: card.cover_image 
                          ? `url(${card.cover_image}) center/cover` 
                          : `linear-gradient(135deg, ${card.design?.primary_color || '#0D7377'}, ${card.design?.secondary_color || '#14274E'})`
                      }}
                    >
                      {/* Status Badge */}
                      <Badge 
                        className={cn(
                          "absolute top-3 left-3 z-10",
                          card.status === 'published' 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "bg-slate-500 hover:bg-slate-600"
                        )}
                      >
                        {card.status === 'published' ? t('published') : t('draft')}
                      </Badge>

                      {/* Decorative Wave */}
                      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 40" preserveAspectRatio="none">
                        <path d="M0,40 L0,20 Q100,0 200,20 T400,20 L400,40 Z" fill={card.design?.accent_color || '#F4B400'} />
                      </svg>
                    </div>

                    {/* Profile Section */}
                    <div className="px-5 -mt-12 relative z-10">
                      {/* Company Logo (if exists) */}
                      {card.company_logo && (
                        <div 
                          className="absolute top-0 left-5 h-10 w-10 rounded-lg overflow-hidden border-2 border-white dark:border-slate-800 bg-white"
                        >
                          <img src={card.company_logo} alt="Logo" className="h-full w-full object-contain p-1" />
                        </div>
                      )}

                      {/* Profile Image */}
                      <div className="flex justify-center">
                        <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700">
                          {card.profile_image ? (
                            <img 
                              src={card.profile_image} 
                              alt={card.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-blue-600 text-white text-xl font-bold">
                              {card.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Name & Title */}
                      <div className="text-center mt-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                          {isRTL && card.name_ar ? card.name_ar : card.name}
                        </h3>
                        {card.title && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {isRTL && card.title_ar ? card.title_ar : card.title}
                          </p>
                        )}
                        {card.company && (
                          <p className="text-xs mt-1" style={{ color: card.design?.accent_color || '#F4B400' }}>
                            {isRTL && card.company_ar ? card.company_ar : card.company}
                          </p>
                        )}
                      </div>

                      {/* Bio Preview */}
                      {card.bio && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-3 line-clamp-2">
                          {isRTL && card.bio_ar ? card.bio_ar : card.bio}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400 mt-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{card.view_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <QrCode className="h-4 w-4" />
                          <span>{card.scan_count || 0}</span>
                        </div>
                      </div>

                      {/* Link */}
                      {card.slug && (
                        <div className="text-center mt-3">
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">
                            rawajcard.com/c/{card.slug}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons at Bottom - Visible on Hover */}
                  <div className="px-3 pb-3 pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-4">
                    <div className="grid grid-cols-4 gap-2">
                      <Link to={createPageUrl(`CardBuilder?id=${card.id}`)}>
                        <Button variant="ghost" size="sm" className="w-full flex flex-col items-center gap-1 h-auto py-2">
                          <Edit className="h-4 w-4 text-blue-600" />
                          <span className="text-xs">{isRTL ? 'تعديل' : 'Edit'}</span>
                        </Button>
                      </Link>

                      {card.status === 'published' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full flex flex-col items-center gap-1 h-auto py-2"
                            onClick={() => handleCopyLink(card)}
                          >
                            {copiedId === card.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-teal-600" />
                            )}
                            <span className="text-xs">{isRTL ? 'نسخ' : 'Copy'}</span>
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full flex flex-col items-center gap-1 h-auto py-2"
                            onClick={() => setQrDialog(card)}
                          >
                            <QrCode className="h-4 w-4 text-purple-600" />
                            <span className="text-xs">QR</span>
                          </Button>

                          <a href={`/c/${card.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="w-full flex flex-col items-center gap-1 h-auto py-2">
                              <ExternalLink className="h-4 w-4 text-slate-600" />
                              <span className="text-xs">{isRTL ? 'عرض' : 'View'}</span>
                            </Button>
                          </a>
                        </>
                      )}

                      {card.status !== 'published' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full flex flex-col items-center gap-1 h-auto py-2 col-span-3"
                          onClick={() => setDeleteDialog(card)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="text-xs">{isRTL ? 'حذف' : 'Delete'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'حذف البطاقة' : 'Delete Card'}</DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'هل أنت متأكد من حذف هذه البطاقة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this card? This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              {t('cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate(deleteDialog?.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending 
                ? (isRTL ? 'جاري الحذف...' : 'Deleting...') 
                : t('delete')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!qrDialog} onOpenChange={() => setQrDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {t('qrCode')}
            </DialogTitle>
          </DialogHeader>
          {qrDialog && (
            <QRCodeDisplay 
              slug={qrDialog.slug} 
              qrSettings={qrDialog.qr_settings} 
              size={250}
              trackable={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
