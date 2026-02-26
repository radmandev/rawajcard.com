import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Mail, CreditCard, Calendar, Ban, CheckCircle, ExternalLink, Crown, Sparkles, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import moment from 'moment';

const PLAN_CONFIG = {
  premium: {
    label: 'Premium', labelAr: 'بريميوم',
    color: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
    icon: Sparkles,
  },
  enterprise: {
    label: 'Enterprise', labelAr: 'مؤسسي',
    color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    icon: Crown,
  },
  free: {
    label: 'Free', labelAr: 'مجاني',
    color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    icon: Users,
  },
};

const FILTERS = [
  { key: 'all', en: 'All', ar: 'الكل' },
  { key: 'subscribed', en: 'Subscribed', ar: 'مشتركون' },
  { key: 'premium', en: 'Premium', ar: 'بريميوم' },
  { key: 'enterprise', en: 'Enterprise', ar: 'مؤسسي' },
  { key: 'free', en: 'Free', ar: 'مجاني' },
];

export default function AdminClients() {
  const { isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.entities.User.list(),
  });

  const { data: allCards = [] } = useQuery({
    queryKey: ['admin-all-cards'],
    queryFn: () => api.entities.BusinessCard.list(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => api.entities.Subscription.list(),
  });

  const subscriptionMap = useMemo(() => {
    const map = {};
    subscriptions.forEach(sub => { if (sub.created_by) map[sub.created_by] = sub; });
    return map;
  }, [subscriptions]);

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, currentRole }) => {
      const newRole = currentRole === 'user' ? 'admin' : 'user';
      await api.entities.User.update(userId, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success(isRTL ? 'تم تحديث حالة المستخدم' : 'User status updated');
    },
  });

  const getUserCardCount = (email) => allCards.filter(c => c.created_by === email).length;
  const getUserPlan = (email) => subscriptionMap[email]?.plan || 'free';
  const getUserSub = (email) => subscriptionMap[email];

  const stats = useMemo(() => {
    const premium = users.filter(u => getUserPlan(u.email) === 'premium').length;
    const enterprise = users.filter(u => getUserPlan(u.email) === 'enterprise').length;
    return {
      total: users.length,
      subscribed: premium + enterprise,
      premium,
      enterprise,
      mrr: premium * 19 + enterprise * 99,
    };
  }, [users, subscriptionMap]);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (planFilter === 'all') return true;
    if (planFilter === 'subscribed') return ['premium', 'enterprise'].includes(getUserPlan(user.email));
    return getUserPlan(user.email) === planFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: 'all', label: isRTL ? 'إجمالي المستخدمين' : 'Total Users', value: stats.total, color: 'text-slate-800 dark:text-white' },
          { key: 'subscribed', label: isRTL ? 'المشتركون' : 'Subscribed', value: stats.subscribed, color: 'text-teal-600' },
          { key: 'premium', label: isRTL ? 'بريميوم' : 'Premium', value: stats.premium, color: 'text-teal-600' },
          { key: 'enterprise', label: isRTL ? 'مؤسسي' : 'Enterprise', value: stats.enterprise, color: 'text-purple-600' },
        ].map(s => (
          <Card
            key={s.key}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${planFilter === s.key ? 'ring-2 ring-teal-500' : ''}`}
            onClick={() => setPlanFilter(s.key)}
          >
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* MRR */}
      <Card className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-700">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-teal-600" />
          <div>
            <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
              {isRTL ? 'الإيرادات الشهرية المتكررة (تقديرية)' : 'Estimated Monthly Recurring Revenue'}
            </p>
            <p className="text-xl font-bold text-teal-700 dark:text-teal-300">SAR {stats.mrr.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>{isRTL ? 'إدارة العملاء' : 'Client Management'}</CardTitle>
            {planFilter !== 'all' && (
              <button onClick={() => setPlanFilter('all')} className="text-xs text-slate-500 hover:text-slate-800 underline">
                {isRTL ? 'مسح الفلتر' : 'Clear filter'}
              </button>
            )}
          </div>
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

          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setPlanFilter(f.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  planFilter === f.key
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                }`}
              >
                {isRTL ? f.ar : f.en}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredUsers.map((user) => {
              const cardCount = getUserCardCount(user.email);
              const plan = getUserPlan(user.email);
              const sub = getUserSub(user.email);
              const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
              const PlanIcon = cfg.icon;

              return (
                <Card key={user.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {user.full_name || user.email}
                        </h3>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                          <PlanIcon className="h-3 w-3" />
                          {isRTL ? cfg.labelAr : cfg.label}
                          {sub?.status && sub.status !== 'active' && (
                            <span className="opacity-60 ml-1">· {sub.status}</span>
                          )}
                        </span>
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
                          <span>{isRTL ? 'انضم' : 'Joined'} {moment(user.created_date).format('MMM D, YYYY')}</span>
                        </div>
                        {sub && plan !== 'free' && (
                          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-medium">
                            <Sparkles className="h-3 w-3" />
                            <span>{isRTL ? 'اشترك في' : 'Subscribed'} {moment(sub.created_at).format('MMM D, YYYY')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={createPageUrl(`ClientDetails?userId=${user.id}`)}>
                        <Button size="sm" variant="outline" className="w-full">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {isRTL ? 'التفاصيل' : 'Details'}
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleUserStatusMutation.mutate({ userId: user.id, currentRole: user.role })}
                      >
                        {user.role === 'admin' ? (
                          <><Ban className="h-3 w-3 mr-1" />{isRTL ? 'إزالة الصلاحية' : 'Remove Admin'}</>
                        ) : (
                          <><CheckCircle className="h-3 w-3 mr-1" />{isRTL ? 'جعله مسؤولاً' : 'Make Admin'}</>
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
    </div>
  );
}