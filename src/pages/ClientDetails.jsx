import React, { useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, probeTableColumns, safePayload } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  CreditCard, 
  Eye, 
  QrCode, 
  MousePointerClick,
  TrendingUp,
  Users,
  Crown,
  Ban,
  CheckCircle,
  ExternalLink,
  Edit,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import moment from 'moment';
import { toast } from 'sonner';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';

export default function ClientDetails() {
  const { isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    plan: 'free',
    status: 'active',
    card_limit: 2  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['client-details', userId],
    queryFn: async () => {
      const users = await api.entities.User.list();
      return users.find(u => u.id === userId);
    },
    enabled: !!userId
  });

  const { data: userCards = [] } = useQuery({
    queryKey: ['client-cards', user?.email],
    queryFn: () => api.entities.BusinessCard.filter({ created_by: user.email }),
    enabled: !!user?.email
  });

  const { data: cardViews = [] } = useQuery({
    queryKey: ['client-card-views', user?.email],
    queryFn: async () => {
      const views = await api.entities.CardView.filter({ card_owner: user.email });
      return views;
    },
    enabled: !!user?.email
  });

  const { data: subscription } = useQuery({
    queryKey: ['client-subscription', user?.id || user?.email],
    queryFn: async () => {
      // Try UUID first (works even if created_by column is missing)
      if (user?.id) {
        const subs = await api.entities.Subscription.filter({ created_by_user_id: user.id });
        if (subs.length) return subs[0];
      }
      // Fall back to email if UUID lookup returned nothing
      if (user?.email) {
        try {
          const subs = await api.entities.Subscription.filter({ created_by: user.email });
          return subs[0] || null;
        } catch { return null; }
      }
      return null;
    },
    enabled: !!user
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['client-orders', user?.email],
    queryFn: async () => {
      const orders = await api.entities.Order.filter({ created_by: user.email }, '-created_date');
      return orders;
    },
    enabled: !!user?.email
  });

  const toggleUserRoleMutation = useMutation({
    mutationFn: async () => {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await api.entities.User.update(userId, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['client-details', userId]);
      toast.success(isRTL ? 'تم تحديث دور المستخدم' : 'User role updated');
    }
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data) => {
      const DESIRED = ['plan', 'status', 'metadata', 'user_id', 'user_email', 'created_by', 'created_by_user_id', 'card_limit'];
      const validCols = await probeTableColumns('subscriptions', DESIRED);

      if (!validCols.includes('plan')) {
        throw new Error(
          isRTL
            ? 'جدول الاشتراكات لا يحتوي على عمود plan — يرجى تشغيل migrations من Supabase'
            : "'plan' column missing — run SQL migrations in Supabase dashboard"
        );
      }

      const full = {
        plan: data.plan,
        status: data.status,
        metadata: { user_email: user?.email, user_id: user?.id },
        user_id: user?.id,
        user_email: user?.email,
        created_by: user?.email,
        created_by_user_id: user?.id,
        card_limit: data.card_limit,
      };
      const payload = safePayload(full, validCols);

      if (subscription) {
        return await api.entities.Subscription.update(subscription.id, payload);
      } else {
        return await api.entities.Subscription.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['client-subscription', user?.id || user?.email]);
      setShowSubscriptionDialog(false);
      toast.success(isRTL ? 'تم تحديث الاشتراك' : 'Subscription updated');
    }
  });

  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalViews = cardViews.filter(v => v.view_type === 'page_view').length;
  const totalScans = cardViews.filter(v => v.view_type === 'qr_scan').length;
  const totalClicks = cardViews.filter(v => v.view_type === 'link_click').length;
  const publishedCards = userCards.filter(c => c.status === 'published').length;

  // Prepare chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = moment().subtract(6 - i, 'days');
    const dateStr = date.format('YYYY-MM-DD');
    const dayViews = cardViews.filter(v => 
      moment(v.created_date).format('YYYY-MM-DD') === dateStr
    ).length;
    return {
      date: date.format('MMM D'),
      views: dayViews
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Admin')}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.full_name || user.email}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isRTL ? 'تفاصيل العميل' : 'Client Details'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => toggleUserRoleMutation.mutate()}
          variant={user.role === 'admin' ? 'destructive' : 'default'}
          disabled={toggleUserRoleMutation.isPending}
        >
          {user.role === 'admin' ? (
            <>
              <Ban className="h-4 w-4 mr-2" />
              {isRTL ? 'إزالة صلاحيات المسؤول' : 'Remove Admin'}
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              {isRTL ? 'منح صلاحيات المسؤول' : 'Grant Admin'}
            </>
          )}
        </Button>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'معلومات المستخدم' : 'User Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">{isRTL ? 'البريد الإلكتروني' : 'Email'}</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">{isRTL ? 'تاريخ التسجيل' : 'Joined Date'}</p>
                  <p className="font-medium">{moment(user.created_date).format('MMMM D, YYYY')}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">{isRTL ? 'الدور' : 'Role'}</p>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">{isRTL ? 'الحالة' : 'Status'}</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {isRTL ? 'نشط' : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {isRTL ? 'إجمالي البطاقات' : 'Total Cards'}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userCards.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {isRTL ? 'البطاقات المنشورة' : 'Published'}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {publishedCards}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {isRTL ? 'إجمالي المشاهدات' : 'Total Views'}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalViews}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {isRTL ? 'مسح QR' : 'QR Scans'}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalScans}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'النشاط الأخير (7 أيام)' : 'Recent Activity (7 Days)'}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsChart data={last7Days} dataKey="views" color="#0D7377" />
        </CardContent>
      </Card>

      {/* Published Cards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isRTL ? 'البطاقات المنشورة' : 'Published Cards'}</CardTitle>
            <Badge>{publishedCards} {isRTL ? 'بطاقة' : 'cards'}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {userCards.filter(c => c.status === 'published').length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {isRTL ? 'لا توجد بطاقات منشورة' : 'No published cards'}
            </div>
          ) : (
            <div className="space-y-3">
              {userCards.filter(c => c.status === 'published').map((card) => {
                const cardViewCount = cardViews.filter(v => v.card_id === card.id).length;
                return (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {card.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{card.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {cardViewCount} {isRTL ? 'مشاهدة' : 'views'}
                        </span>
                        <span>
                          {isRTL ? 'نُشر في' : 'Published'} {moment(card.published_at).format('MMM D, YYYY')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                     <a
                       href={`/card-builder?id=${card.id}`}
                       target="_blank"
                       rel="noopener noreferrer"
                     >
                       <Button size="sm" variant="outline">
                         <Edit className="h-3 w-3 mr-1" />
                         {isRTL ? 'تعديل' : 'Edit'}
                       </Button>
                     </a>
                     <a
                       href={`${window.location.origin}/c/${card.slug}`}
                       target="_blank"
                       rel="noopener noreferrer"
                     >
                       <Button size="sm" variant="outline">
                         <ExternalLink className="h-3 w-3 mr-1" />
                         {isRTL ? 'عرض' : 'View'}
                       </Button>
                     </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'إدارة الاشتراك' : 'Subscription Management'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {isRTL ? 'الخطة الحالية' : 'Current Plan'}
                  </p>
                  {subscription?.plan === 'premium' && (
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {subscription?.plan === 'premium' 
                    ? (isRTL ? 'خطة بريميوم' : 'Premium Plan')
                    : (isRTL ? 'خطة مجانية' : 'Free Plan')
                  }
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {isRTL ? 'حد البطاقات:' : 'Card limit:'} {subscription?.card_limit || 1}
                </p>
              </div>
              <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                {subscription?.status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'ملغي' : 'Cancelled')}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setSubscriptionData({
                    plan: subscription?.plan || 'free',
                    status: subscription?.status || 'active',
                    card_limit: subscription?.card_limit || 2
                  });
                  setShowSubscriptionDialog(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isRTL ? 'تعديل الاشتراك' : 'Edit Subscription'}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowBillingDialog(true)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {isRTL ? 'سجل الفواتير' : 'Billing History'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تعديل الاشتراك' : 'Edit Subscription'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isRTL ? 'الخطة' : 'Plan'}</Label>
              <Select value={subscriptionData.plan} onValueChange={(val) => {
                const limits = { free: 2, premium: 2, teams: 10, enterprise: 30 };
                setSubscriptionData({...subscriptionData, plan: val, card_limit: limits[val] ?? 2});
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">{isRTL ? 'مجاني' : 'Free'}</SelectItem>
                  <SelectItem value="premium">{isRTL ? 'بريميوم' : 'Premium'}</SelectItem>
                  <SelectItem value="teams">{isRTL ? 'الفرق' : 'Teams'}</SelectItem>
                  <SelectItem value="enterprise">{isRTL ? 'مؤسسي' : 'Enterprise'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{isRTL ? 'الحالة' : 'Status'}</Label>
              <Select value={subscriptionData.status} onValueChange={(val) => setSubscriptionData({...subscriptionData, status: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{isRTL ? 'نشط' : 'Active'}</SelectItem>
                  <SelectItem value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</SelectItem>
                  <SelectItem value="expired">{isRTL ? 'منتهي' : 'Expired'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{isRTL ? 'حد البطاقات' : 'Card Limit'}</Label>
              <Input
                type="number"
                value={subscriptionData.card_limit}
                onChange={(e) => setSubscriptionData({...subscriptionData, card_limit: parseInt(e.target.value)})}
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={() => updateSubscriptionMutation.mutate(subscriptionData)}
              disabled={updateSubscriptionMutation.isPending}
            >
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'سجل الفواتير' : 'Billing History'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {isRTL ? 'لا توجد فواتير' : 'No billing history'}
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {isRTL ? 'طلب رقم' : 'Order'} #{order.order_number}
                      </p>
                      <p className="text-xs text-slate-500">
                        {moment(order.created_date).format('MMMM D, YYYY')}
                      </p>
                    </div>
                    <Badge variant={
                      order.status === 'delivered' ? 'default' :
                      order.status === 'cancelled' ? 'destructive' : 'secondary'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isRTL ? 'المبلغ:' : 'Total:'}</span>
                      <span className="font-medium">{order.total} {isRTL ? 'ريال' : 'SAR'}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {order.items?.length} {isRTL ? 'عنصر' : 'items'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}