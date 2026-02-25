import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';
import CustomizationRequestDialog from '@/components/shared/CustomizationRequestDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  QrCode, 
  MousePointerClick, 
  TrendingUp,
  Calendar,
  CreditCard,
  Lock,
  Sparkles
} from 'lucide-react';
import { format, subDays, startOfWeek, startOfMonth, isAfter } from 'date-fns';
import { motion } from 'framer-motion';

export default function Analytics() {
  const { t, isRTL } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedCard = urlParams.get('card');

  const [selectedCard, setSelectedCard] = useState(preselectedCard || 'all');
  const [timeRange, setTimeRange] = useState('week');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const subs = await api.entities.Subscription.list();
      return subs[0] || { plan: 'free', card_limit: 1 };
    }
  });

  const isPremium = subscription?.plan === 'premium';

  // Fetch user's cards
  const { data: cards = [] } = useQuery({
    queryKey: ['analytics-cards'],
    queryFn: async () => {
      const me = await api.auth.me();
      return api.entities.BusinessCard.filter({ created_by: me.email });
    }
  });

  // Fetch all views
  const { data: allViews = [], isLoading } = useQuery({
    queryKey: ['analytics-views'],
    queryFn: async () => {
      const me = await api.auth.me();
      return api.entities.CardView.filter({ card_owner: me.email }, '-created_date');
    }
  });

  // Filter views based on selection
  const getFilteredViews = () => {
    let views = allViews;

    // Filter by card
    if (selectedCard !== 'all') {
      views = views.filter(v => v.card_id === selectedCard);
    }

    // Filter by time range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      views = views.filter(v => v.created_date && isAfter(new Date(v.created_date), startDate));
    }

    return views;
  };

  const filteredViews = getFilteredViews();

  // Calculate stats
  const pageViews = filteredViews.filter(v => v.view_type === 'page_view');
  const qrScans = filteredViews.filter(v => v.view_type === 'qr_scan');
  const linkClicks = filteredViews.filter(v => v.view_type === 'link_click');
  const uniqueVisitors = new Set(filteredViews.map(v => v.visitor_id)).size;

  // Prepare chart data
  const getChartData = (viewType) => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    return Array.from({ length: Math.min(days, 14) }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayViews = filteredViews.filter(v => {
        const isViewType = viewType === 'all' || v.view_type === viewType;
        return isViewType && v.created_date?.startsWith(dateStr);
      }).length;
      return {
        date: format(date, 'MMM dd'),
        value: dayViews
      };
    });
  };

  // Click breakdown
  const getClickBreakdown = () => {
    const breakdown = {};
    linkClicks.forEach(click => {
      const link = click.clicked_link || 'other';
      breakdown[link] = (breakdown[link] || 0) + 1;
    });
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SubscriptionDialog 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog}
        reason="advanced_analytics"
      />
      
      <CustomizationRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        page="analytics"
        pageName={t('analytics')}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {t('analytics')}
            <Button variant="ghost" size="sm" onClick={() => setShowRequestDialog(true)}>
              <Sparkles className="h-4 w-4 text-teal-600" />
            </Button>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isRTL 
              ? 'تتبع أداء بطاقاتك الرقمية'
              : 'Track your digital cards performance'
            }
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={selectedCard} onValueChange={setSelectedCard}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={isRTL ? 'اختر بطاقة' : 'Select card'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')} {t('cards')}</SelectItem>
              {cards.map(card => (
                <SelectItem key={card.id} value={card.id}>
                  {isRTL && card.name_ar ? card.name_ar : card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t('thisWeek')}</SelectItem>
              <SelectItem value="month">{t('thisMonth')}</SelectItem>
              <SelectItem value="all">{t('allTime')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('views')}
          value={pageViews.length}
          icon={Eye}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={0.1}
        />
        <StatsCard
          title={t('scans')}
          value={qrScans.length}
          icon={QrCode}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          delay={0.2}
        />
        <StatsCard
          title={t('clicks')}
          value={linkClicks.length}
          icon={MousePointerClick}
          gradient="bg-gradient-to-br from-pink-500 to-pink-600"
          delay={0.3}
        />
        <StatsCard
          title={isRTL ? 'زوار فريدون' : 'Unique Visitors'}
          value={uniqueVisitors}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-teal-500 to-teal-600"
          delay={0.4}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {isRTL ? 'المشاهدات' : 'Page Views'}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="relative">
              {!isPremium && (
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 z-10 rounded-lg flex items-center justify-center">
                  <Button
                    onClick={() => setShowUpgradeDialog(true)}
                    size="sm"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isRTL ? 'الترقية لفتح' : 'Upgrade to unlock'}
                  </Button>
                </div>
              )}
              <div className={cn(!isPremium && "blur-sm opacity-50")}>
                <AnalyticsChart 
                  data={!isPremium ? Array.from({ length: 7 }, (_, i) => ({
                    date: format(subDays(new Date(), 6 - i), 'MMM dd'),
                    value: Math.floor(Math.random() * 25) + 8
                  })) : getChartData('page_view')} 
                  color="#3B82F6" 
                  type="area"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Scans Chart */}
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {isRTL ? 'مسح QR' : 'QR Scans'}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="relative">
              {!isPremium && (
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 z-10 rounded-lg flex items-center justify-center">
                  <Button
                    onClick={() => setShowUpgradeDialog(true)}
                    size="sm"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isRTL ? 'الترقية لفتح' : 'Upgrade to unlock'}
                  </Button>
                </div>
              )}
              <div className={cn(!isPremium && "blur-sm opacity-50")}>
                <AnalyticsChart 
                  data={!isPremium ? Array.from({ length: 7 }, (_, i) => ({
                    date: format(subDays(new Date(), 6 - i), 'MMM dd'),
                    value: Math.floor(Math.random() * 15) + 3
                  })) : getChartData('qr_scan')} 
                  color="#8B5CF6" 
                  type="bar"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Click Breakdown */}
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5" />
            {isRTL ? 'تفاصيل النقرات' : 'Click Breakdown'}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="relative">
            {!isPremium && (
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 z-10 rounded-lg flex items-center justify-center">
                <Button
                  onClick={() => setShowUpgradeDialog(true)}
                  size="sm"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {isRTL ? 'الترقية لفتح' : 'Upgrade to unlock'}
                </Button>
              </div>
            )}
            <div className={cn(!isPremium && "blur-sm opacity-50")}>
              {!isPremium ? (
                <div className="space-y-4">
                  {['Email', 'Phone', 'WhatsApp', 'LinkedIn', 'Website'].map((link, index) => (
                    <div key={link} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
                          ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-teal-500", "bg-orange-500"][index]
                        )}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{link}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${Math.random() * 60 + 40}%` }}
                          />
                        </div>
                        <span className="font-bold w-12 text-right">{Math.floor(Math.random() * 20) + 5}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : linkClicks.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  {isRTL ? 'لا توجد نقرات بعد' : 'No clicks yet'}
                </div>
              ) : (
                <div className="space-y-4">
                  {getClickBreakdown().map(([link, count], index) => (
                    <motion.div
                      key={link}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
                          [
                            "bg-blue-500",
                            "bg-purple-500",
                            "bg-pink-500",
                            "bg-teal-500",
                            "bg-orange-500"
                          ][index % 5]
                        )}>
                          {index + 1}
                        </div>
                        <span className="font-medium capitalize">
                          {link.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${(count / linkClicks.length) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold w-12 text-right">{count}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Performance */}
      {selectedCard === 'all' && cards.length > 0 && (
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {isRTL ? 'أداء البطاقات' : 'Cards Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="relative">
              {!isPremium && (
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 z-10 rounded-lg flex items-center justify-center">
                  <Button
                    onClick={() => setShowUpgradeDialog(true)}
                    size="sm"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isRTL ? 'الترقية لفتح' : 'Upgrade to unlock'}
                  </Button>
                </div>
              )}
              <div className={cn(!isPremium && "blur-sm opacity-50", "space-y-4")}>
                {(!isPremium ? ['Business Card', 'Personal Card', 'Portfolio'] : cards
                  .sort((a, b) => (b.view_count || 0) - (a.view_count || 0)))
                  .slice(0, 3)
                  .map((card, index) => {
                    const mockCard = typeof card === 'string' ? {
                      name: card,
                      status: 'published',
                      view_count: Math.floor(Math.random() * 100) + 20,
                      scan_count: Math.floor(Math.random() * 50) + 10
                    } : card;
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                      >
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {mockCard.profile_image ? (
                            <img src={mockCard.profile_image} alt={mockCard.name} className="h-full w-full object-cover" />
                          ) : (
                            mockCard.name?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {isRTL && mockCard.name_ar ? mockCard.name_ar : mockCard.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {mockCard.status === 'published' ? t('published') : t('draft')}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-slate-900 dark:text-white">{mockCard.view_count || 0}</p>
                            <p className="text-slate-500 dark:text-slate-400">{t('views')}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-slate-900 dark:text-white">{mockCard.scan_count || 0}</p>
                            <p className="text-slate-500 dark:text-slate-400">{t('scans')}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}