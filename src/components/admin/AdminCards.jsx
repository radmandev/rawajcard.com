import React, { useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ExternalLink, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function AdminCards() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['admin-cards'],
    queryFn: () => api.entities.BusinessCard.list('-updated_date')
  });

  const deleteCardMutation = useMutation({
    mutationFn: (cardId) => api.entities.BusinessCard.delete(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-cards']);
      toast.success(isRTL ? 'تم حذف البطاقة' : 'Card deleted');
    }
  });

  const filteredCards = cards.filter(card =>
    card.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.created_by?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (card) => {
    if (confirm(isRTL ? `هل تريد حذف البطاقة "${card.name}"?` : `Delete card "${card.name}"?`)) {
      deleteCardMutation.mutate(card.id);
    }
  };

  const handleEdit = (card) => {
    navigate(`/card-builder?id=${card.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isRTL ? 'إدارة البطاقات' : 'Card Management'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={isRTL ? 'البحث عن بطاقة...' : 'Search cards...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2">
          {filteredCards.map((card) => (
            <Card key={card.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {card.name}
                    </h3>
                    <Badge variant={card.status === 'published' ? 'default' : 'secondary'}>
                      {card.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        /{card.slug}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs">{isRTL ? 'المالك:' : 'Owner:'} {card.created_by}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{card.view_count || 0} {isRTL ? 'مشاهدة' : 'views'}</span>
                      <span>{card.scan_count || 0} {isRTL ? 'مسح' : 'scans'}</span>
                    </div>
                    <div className="text-xs">
                      {isRTL ? 'آخر تحديث' : 'Updated'} {moment(card.updated_date).fromNow()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {card.status === 'published' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/c/${card.slug}`, '_blank')}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(card)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(card)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filteredCards.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              {isRTL ? 'لم يتم العثور على بطاقات' : 'No cards found'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}