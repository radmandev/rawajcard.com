import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';
import { api, probeTableColumns, safePayload } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Mail, CreditCard, Calendar, Ban, CheckCircle,
  Crown, Sparkles, Users, TrendingUp, Settings, Eye, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const PLAN_CONFIG = {
  premium: {
    label: 'Premium', labelAr: 'بريميوم',
    color: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
    icon: Sparkles,
  },
  teams: {
    label: 'Teams', labelAr: 'الفرق',
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    icon: Users,
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
  { key: 'all',        en: 'All',        ar: 'الكل' },
  { key: 'subscribed', en: 'Subscribed', ar: 'مشتركون' },
  { key: 'premium',    en: 'Premium',    ar: 'بريميوم' },
  { key: 'teams',      en: 'Teams',      ar: 'الفرق' },
  { key: 'enterprise', en: 'Enterprise', ar: 'مؤسسي' },
  { key: 'free',       en: 'Free',       ar: 'مجاني' },
];

export default function AdminClients() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [subDialog, setSubDialog] = useState(null);
  const [savingPlan, setSavingPlan] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: () => api.entities.User.list('-created_at'),
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
    const uuidMap = {};

    subscriptions.forEach(s => {
      // Primary: created_by email column (if it exists)
      if (s.created_by)            map[s.created_by] = s;
      // Fallback: metadata.user_email (set by admin mutation)
      if (s.metadata?.user_email)  map[s.metadata.user_email] = s;
      // UUID lookups
      if (s.created_by_user_id)    uuidMap[s.created_by_user_id] = s;
      if (s.metadata?.user_id)     uuidMap[s.metadata.user_id] = s;
    });

    // For profiles not matched by email, try UUID
    users.forEach(u => {
      if (!map[u.email] && u.id && uuidMap[u.id]) {
        map[u.email] = uuidMap[u.id];
      }
    });
    return map;
  }, [subscriptions, users]);

  const getUserPlan  = (email) => subscriptionMap[email]?.plan || 'free';
  const getUserSub   = (email) => subscriptionMap[email];
  const getUserCards = (email) => allCards.filter(c => c.created_by === email).length;

  const stats = useMemo(() => {
    const premium    = users.filter(u => getUserPlan(u.email) === 'premium').length;
    const teams      = users.filter(u => getUserPlan(u.email) === 'teams').length;
    const enterprise = users.filter(u => getUserPlan(u.email) === 'enterprise').length;
    return {
      total:      users.length,
      subscribed: premium + teams + enterprise,
      premium,
      teams,
      enterprise,
      mrr: premium * 19 + teams * 49 + enterprise * 99,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, subscriptionMap]);

  const deactivateMutation = useMutation({
    mutationFn: ({ userId, suspend }) =>
      api.entities.User.update(userId, { role: suspend ? 'suspended' : 'user' }),
    onSuccess: (_, { suspend }) => {
      queryClient.invalidateQueries(['admin-profiles']);
      toast.success(suspend
        ? (isRTL ? 'تم إيقاف المستخدم' : 'User deactivated')
        : (isRTL ? 'تم تفعيل المستخدم' : 'User activated'));
    },
    onError: (e) => toast.error(e.message),
  });

  const manageSubMutation = useMutation({
    mutationFn: async ({ userEmail, plan, existingSub }) => {
      const LIMITS = { free: 2, premium: 2, teams: 10, enterprise: 30 };
      const userProfile = users.find(u => u.email === userEmail);
      const userUuid = userProfile?.id;

      if (plan === 'free') {
        if (existingSub) await api.entities.Subscription.delete(existingSub.id);
        return;
      }

      // Discover which columns actually exist in the live DB (cached after first call)
      const DESIRED = ['plan', 'plan_type', 'status', 'metadata', 'user_id', 'created_by', 'created_by_user_id', 'card_limit'];
      const validCols = await probeTableColumns('subscriptions', DESIRED);

      if (!validCols.includes('plan') && !validCols.includes('plan_type')) {
        throw new Error(
          isRTL
            ? 'جدول الاشتراكات لا يحتوي على عمود plan — يرجى تشغيل الـ migrations من لوحة Supabase'
            : "No plan column found in subscriptions table — please run the SQL migrations in your Supabase dashboard"
        );
      }

      const metadata = { user_email: userEmail, user_id: userUuid };
      const full = {
        plan,
        plan_type: plan,
        status: 'active',
        metadata,
        user_id: userUuid,
        created_by: userEmail,
        created_by_user_id: userUuid,
        card_limit: LIMITS[plan] ?? 2,
      };
      const payload = safePayload(full, validCols);

      if (existingSub) {
        return await api.entities.Subscription.update(existingSub.id, payload);
      } else {
        return await api.entities.Subscription.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-subscriptions']);
      toast.success(isRTL ? 'تم تحديث الاشتراك' : 'Subscription updated');
      setSavingPlan(null);
      setSubDialog(null);
    },
    onError: (e) => { setSavingPlan(null); toast.error(e.message); },
  });

  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      user.email?.toLowerCase().includes(q) ||
      user.full_name?.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (planFilter === 'all')        return true;
    if (planFilter === 'subscribed') return ['premium', 'teams', 'enterprise'].includes(getUserPlan(user.email));
    return getUserPlan(user.email) === planFilter;
  });

  const openSubDialog = (user) => setSubDialog(user);

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
          { key: 'all',        label: isRTL ? 'إجمالي المستخدمين' : 'Total Users',  value: stats.total,      color: 'text-slate-800 dark:text-white' },
          { key: 'subscribed', label: isRTL ? 'المشتركون'         : 'Subscribed',    value: stats.subscribed, color: 'text-teal-600' },
          { key: 'premium',    label: isRTL ? 'بريميوم'           : 'Premium',       value: stats.premium,    color: 'text-teal-600' },
          { key: 'enterprise', label: isRTL ? 'مؤسسي'             : 'Enterprise',    value: stats.enterprise, color: 'text-purple-600' },
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

      {/* Client list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>
              {isRTL ? 'إدارة العملاء' : 'Client Management'}
              <span className="text-sm font-normal text-slate-400 ml-2">({filteredUsers.length})</span>
            </CardTitle>
            {planFilter !== 'all' && (
              <button
                onClick={() => setPlanFilter('all')}
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
              const plan        = getUserPlan(user.email);
              const sub         = getUserSub(user.email);
              const cardCount   = getUserCards(user.email);
              const cfg         = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
              const PlanIcon    = cfg.icon;
              const isSuspended = user.role === 'suspended';
              const isAdmin     = user.role === 'admin';

              return (
                <Card key={user.id} className={`p-4 transition-opacity ${isSuspended ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {user.full_name || user.email?.split('@')[0]}
                        </h3>
                        {isAdmin && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                            <Shield className="h-3 w-3 mr-1" />Admin
                          </Badge>
                        )}
                        {isSuspended && (
                          <Badge variant="destructive" className="text-xs">
                            {isRTL ? 'موقوف' : 'Suspended'}
                          </Badge>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                          <PlanIcon className="h-3 w-3" />
                          {isRTL ? cfg.labelAr : cfg.label}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            <span>{cardCount} {isRTL ? 'بطاقة' : cardCount === 1 ? 'card' : 'cards'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {isRTL ? 'انضم' : 'Joined'}{' '}
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                            </span>
                          </div>
                        </div>
                        {sub && plan !== 'free' && (
                          <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                            <Sparkles className="h-3 w-3 inline mr-1" />
                            {isRTL ? 'اشترك في' : 'Subscribed'}{' '}
                            {new Date(sub.created_at).toLocaleDateString()} · {sub.status}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0 min-w-[100px]">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2 w-full justify-start"
                        onClick={() => navigate(createPageUrl('ClientDetails') + '?userId=' + user.id)}
                      >
                        <Eye className="h-3 w-3 mr-1.5" />
                        {isRTL ? 'عرض' : 'View'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2 w-full justify-start"
                        onClick={() => openSubDialog(user)}
                      >
                        <Settings className="h-3 w-3 mr-1.5" />
                        {isRTL ? 'الاشتراك' : 'Subscription'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isAdmin || deactivateMutation.isPending}
                        className={`text-xs h-7 px-2 w-full justify-start ${
                          isSuspended
                            ? 'border-green-400 text-green-600 hover:bg-green-50'
                            : 'border-red-200 text-red-500 hover:bg-red-50'
                        }`}
                        onClick={() =>
                          deactivateMutation.mutate({ userId: user.id, suspend: !isSuspended })
                        }
                      >
                        {isSuspended ? (
                          <><CheckCircle className="h-3 w-3 mr-1.5" />{isRTL ? 'تفعيل' : 'Activate'}</>
                        ) : (
                          <><Ban className="h-3 w-3 mr-1.5" />{isRTL ? 'إيقاف' : 'Deactivate'}</>
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

      {/* Manage Subscription Dialog — reuses the same rich plan picker */}
      <SubscriptionDialog
        open={!!subDialog}
        onOpenChange={(v) => { if (!v) setSubDialog(null); }}
        title={subDialog ? (isRTL ? `اشتراك: ${subDialog.full_name || subDialog.email}` : `Subscription: ${subDialog.full_name || subDialog.email}`) : ''}
        forcedCurrentPlan={subDialog ? getUserPlan(subDialog.email) : 'free'}
        savingPlan={savingPlan}
        onSelectPlan={(planKey) => {
          if (!subDialog) return;
          setSavingPlan(planKey);
          manageSubMutation.mutate({
            userEmail: subDialog.email,
            plan: planKey,
            existingSub: getUserSub(subDialog.email),
          });
        }}
      />
    </div>
  );
}
