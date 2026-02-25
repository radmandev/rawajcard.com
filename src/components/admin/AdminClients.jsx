import React, { useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Mail, CreditCard, Calendar, Ban, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import moment from 'moment';

export default function AdminClients() {
  const { isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const allUsers = await api.entities.User.list();
      return allUsers;
    }
  });

  const { data: allCards = [] } = useQuery({
    queryKey: ['admin-all-cards'],
    queryFn: () => api.entities.BusinessCard.list()
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, currentRole }) => {
      const newRole = currentRole === 'user' ? 'admin' : 'user';
      await api.entities.User.update(userId, { role: newRole });
      return { userId, newRole };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success(isRTL ? 'تم تحديث حالة المستخدم' : 'User status updated');
    }
  });

  const getUserCardCount = (userEmail) => {
    return allCards.filter(card => card.created_by === userEmail).length;
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <CardTitle>{isRTL ? 'إدارة العملاء' : 'Client Management'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={isRTL ? 'البحث عن عميل...' : 'Search clients...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2">
          {filteredUsers.map((user) => {
            const cardCount = getUserCardCount(user.email);
            return (
              <Card key={user.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {user.full_name || user.email}
                      </h3>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3 w-3" />
                        <span>{cardCount} {isRTL ? 'بطاقة' : 'cards'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {isRTL ? 'انضم' : 'Joined'} {moment(user.created_date).format('MMM D, YYYY')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={createPageUrl(`ClientDetails?userId=${user.id}`)}>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {isRTL ? 'التفاصيل' : 'Details'}
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleUserStatusMutation.mutate({ 
                        userId: user.id, 
                        currentRole: user.role 
                      })}
                    >
                      {user.role === 'admin' ? (
                        <>
                          <Ban className="h-3 w-3 mr-1" />
                          {isRTL ? 'إزالة المسؤول' : 'Remove Admin'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {isRTL ? 'جعله مسؤول' : 'Make Admin'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              {isRTL ? 'لم يتم العثور على عملاء' : 'No clients found'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}