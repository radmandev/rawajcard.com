import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search, Pencil, Trash2, Eye, EyeOff, Globe, QrCode,
  Sparkles, Crown, Users
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const PLAN_CONFIG = {
  premium:    { label: 'Premium',    color: 'bg-teal-100 text-teal-700 border-teal-200',   icon: Sparkles },
  teams:      { label: 'Teams',      color: 'bg-blue-100 text-blue-700 border-blue-200',    icon: Users },
  enterprise: { label: 'Enterprise', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Crown },
  free:       { label: 'Free',       color: 'bg-slate-100 text-slate-500 border-slate-200', icon: Users },
};

export default function AdminCards() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['admin-cards'],
    queryFn: () => api.entities.BusinessCard.list('-updated_at'),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => api.entities.Subscription.list(),
  });

  const subscriptionMap = useMemo(() => {
    const map = {};
    subscriptions.forEach(s => { if (s.created_by) map[s.created_by] = s; });
    return map;
  }, [subscriptions]);

  const getPlanCfg = (email) => {
    const plan = subscriptionMap[email]?.plan || 'free';
    return PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     cards.length,
    published: cards.filter(c => c.status === 'published').length,
    draft:     cards.filter(c => c.status !== 'published').length,
  }), [cards]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const deleteCardMutation = useMutation({
    mutationFn: (cardId) => api.entities.BusinessCard.delete(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-cards']);
      toast.success(isRTL ? 'تم حذف البطاقة' : 'Card deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ cardId, currentStatus }) =>
      api.entities.BusinessCard.update(cardId, {
        status: currentStatus === 'published' ? 'draft' : 'published',
      }),
    onSuccess: (_, { currentStatus }) => {
      queryClient.invalidateQueries(['admin-cards']);
      toast.success(currentStatus === 'published'
        ? (isRTL ? 'تم إلغاء النشر' : 'Card unpublished')
        : (isRTL ? 'تم نشر البطاقة' : 'Card published'));
    },
    onError: (e) => toast.error(e.message),
  });

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredCards = cards.filter(card => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      card.name?.toLowerCase().includes(q) ||
      card.slug?.toLowerCase().includes(q) ||
      card.created_by?.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (statusFilter === 'all')       return true;
    if (statusFilter === 'published') return card.status === 'published';
    return card.status !== 'published';
  });

  const handleDelete = (card) => {
    if (confirm(isRTL
      ? `هل تريد حذف البطاقة "${card.name}"?`
      : `Delete card "${card.name}"?`)) {
      deleteCardMutation.mutate(card.id);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'all',       label: isRTL ? 'إجمالي البطاقات' : 'Total Cards', value: stats.total,     color: 'text-slate-800 dark:text-white' },
          { key: 'published', label: isRTL ? 'منشورة'          : 'Published',   value: stats.published, color: 'text-teal-600' },
          { key: 'draft',     label: isRTL ? 'مسودات'          : 'Drafts',      value: stats.draft,     color: 'text-amber-600' },
        ].map(s => (
          <Card
            key={s.key}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${statusFilter === s.key ? 'ring-2 ring-teal-500' : ''}`}
            onClick={() => setStatusFilter(s.key)}
          >
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Card list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>
              {isRTL ? 'إدارة البطاقات' : 'Card Management'}
              <span className="text-sm font-normal text-slate-400 ml-2">({filteredCards.length})</span>
            </CardTitle>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                {isRTL ? 'مسح الفلتر' : 'Clear filter'}
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={isRTL ? 'البحث عن بطاقة أو مستخدم...' : 'Search cards or users...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            {filteredCards.map((card) => {
              const planCfg    = getPlanCfg(card.created_by);
              const PlanIcon   = planCfg.icon;
              const isPublished = card.status === 'published';

              return (
                <Card key={card.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {card.name || (isRTL ? 'بدون اسم' : 'Unnamed')}
                        </h3>
                        <Badge
                          variant={isPublished ? 'default' : 'secondary'}
                          className={isPublished ? 'bg-teal-600 text-white text-xs' : 'text-xs'}
                        >
                          {isPublished ? (isRTL ? 'منشور' : 'Published') : (isRTL ? 'مسودة' : 'Draft')}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500">
                        {/* Owner */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-400">{isRTL ? 'المالك:' : 'Owner:'}</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                            {card.created_by || '—'}
                          </span>
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border ${planCfg.color}`}>
                            <PlanIcon className="h-2.5 w-2.5" />
                            {planCfg.label}
                          </span>
                        </div>

                        {/* Slug + stats */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            /{card.slug || '—'}
                          </span>
                          <span>{card.view_count || 0} {isRTL ? 'مشاهدة' : 'views'}</span>
                          <span>{card.scan_count || 0} {isRTL ? 'مسح' : 'scans'}</span>
                        </div>

                        <div>
                          {isRTL ? 'آخر تحديث:' : 'Updated:'}{' '}
                          {card.updated_at ? new Date(card.updated_at).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0 min-w-[96px]">
                      {isPublished && card.slug && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2 w-full justify-start"
                          onClick={() => window.open('/c/' + card.slug, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1.5" />
                          {isRTL ? 'عرض' : 'View'}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2 w-full justify-start"
                        onClick={() => navigate(createPageUrl('CardBuilder') + '?id=' + card.id)}
                      >
                        <Pencil className="h-3 w-3 mr-1.5" />
                        {isRTL ? 'تعديل' : 'Edit'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2 w-full justify-start"
                        onClick={() => navigate(createPageUrl('CardBuilder') + '?id=' + card.id + '&tab=qr')}
                      >
                        <QrCode className="h-3 w-3 mr-1.5" />
                        QR
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={togglePublishMutation.isPending}
                        className={`text-xs h-7 px-2 w-full justify-start ${
                          isPublished
                            ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                            : 'text-teal-600 border-teal-200 hover:bg-teal-50'
                        }`}
                        onClick={() =>
                          togglePublishMutation.mutate({ cardId: card.id, currentStatus: card.status })
                        }
                      >
                        {isPublished ? (
                          <><EyeOff className="h-3 w-3 mr-1.5" />{isRTL ? 'إلغاء' : 'Unpublish'}</>
                        ) : (
                          <><Globe className="h-3 w-3 mr-1.5" />{isRTL ? 'نشر' : 'Publish'}</>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deleteCardMutation.isPending}
                        className="text-xs h-7 px-2 w-full justify-start text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(card)}
                      >
                        <Trash2 className="h-3 w-3 mr-1.5" />
                        {isRTL ? 'حذف' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}

            {filteredCards.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                {isRTL ? 'لم يتم العثور على بطاقات' : 'No cards found'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
