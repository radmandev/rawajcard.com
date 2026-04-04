import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import { useUpgrade } from '@/lib/UpgradeContext';
import CustomizationRequestDialog from '@/components/shared/CustomizationRequestDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
import { format, subDays, startOfWeek } from 'date-fns';
import { motion } from 'framer-motion';

export default function Analytics() {
  const { t, isRTL } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedCard = urlParams.get('card');

  const [selectedCard, setSelectedCard] = useState(preselectedCard || 'all');
  const [timeRange, setTimeRange] = useState('week');
  const [qrMetricMode, setQrMetricMode] = useState('total'); // total | unique
  const [qrGroupBy, setQrGroupBy] = useState('day'); // day | week
  const [excludeBots, setExcludeBots] = useState(true);
  const { openUpgradeDialog } = useUpgrade();
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const subs = await api.entities.Subscription.list();
      return subs[0] || { plan: 'free', card_limit: 2 };
    }
  });

  const isPremium = subscription?.plan === 'premium';

  const getEventDateValue = (row) => row?.created_at || row?.created_date || null;
  const getEventDate = (row) => {
    const raw = getEventDateValue(row);
    if (!raw) return null;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const isBotEvent = (row) => {
    const ua = (row?.user_agent || '').toLowerCase();
    if (!ua) return false;
    return /(bot|spider|crawl|slurp|preview|whatsapp|telegram|facebookexternalhit|headless)/.test(ua);
  };

  const getReferrerHost = (row) => {
    const ref = row?.referrer;
    if (!ref) return isRTL ? 'مباشر' : 'Direct';
    try {
      return new URL(ref).hostname.replace(/^www\./, '');
    } catch {
      return isRTL ? 'غير معروف' : 'Unknown';
    }
  };

  const getDeviceType = (row) => {
    const ua = (row?.user_agent || '').toLowerCase();
    if (!ua) return isRTL ? 'غير معروف' : 'Unknown';
    if (/tablet|ipad/.test(ua)) return isRTL ? 'تابلت' : 'Tablet';
    if (/mobile|iphone|android/.test(ua)) return isRTL ? 'جوال' : 'Mobile';
    return isRTL ? 'كمبيوتر' : 'Desktop';
  };

  const getVisitorKey = (row) => {
    if (row?.visitor_id) return row.visitor_id;
    const ua = row?.user_agent || '';
    const ref = row?.referrer || '';
    return ua || ref ? `anon:${ua}|${ref}` : null;
  };

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
      const rows = await api.entities.CardView.filter({ card_owner: me.email });
      return [...rows].sort((a, b) => {
        const ad = getEventDate(a)?.getTime() || 0;
        const bd = getEventDate(b)?.getTime() || 0;
        return bd - ad;
      });
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
      views = views.filter(v => {
        const d = getEventDate(v);
        return d ? d >= startDate : false;
      });
    }

    return views;
  };

  const filteredViews = getFilteredViews();
  const cleanViews = useMemo(
    () => (excludeBots ? filteredViews.filter((v) => !isBotEvent(v)) : filteredViews),
    [filteredViews, excludeBots]
  );

  // Calculate stats
  const pageViews = cleanViews.filter(v => v.view_type === 'page_view');
  const qrScans = cleanViews.filter(v => v.view_type === 'qr_scan');
  const linkClicks = cleanViews.filter(v => v.view_type === 'link_click');
  const uniqueVisitors = new Set(cleanViews.map(getVisitorKey).filter(Boolean)).size;
  const uniqueQrScans = new Set(qrScans.map(getVisitorKey).filter(Boolean)).size;
  const scanRate = pageViews.length > 0 ? Math.round((qrScans.length / pageViews.length) * 100) : 0;

  // Prepare chart data
  const getChartData = (viewType) => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayViews = cleanViews.filter(v => {
        const isViewType = viewType === 'all' || v.view_type === viewType;
        const eventDate = getEventDate(v);
        return isViewType && eventDate && format(eventDate, 'yyyy-MM-dd') === dateStr;
      }).length;
      return {
        date: format(date, 'MMM dd'),
        value: dayViews
      };
    });
  };

  const getQrTimelineData = () => {
    if (qrGroupBy === 'week') {
      const weeks = timeRange === 'week' ? 2 : timeRange === 'month' ? 6 : 12;
      return Array.from({ length: weeks }, (_, i) => {
        const current = subDays(new Date(), (weeks - 1 - i) * 7);
        const bucketStart = startOfWeek(current, { weekStartsOn: 1 });
        const bucketKey = format(bucketStart, 'yyyy-MM-dd');
        const bucket = qrScans.filter((v) => {
          const d = getEventDate(v);
          return d && format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd') === bucketKey;
        });

        const value = qrMetricMode === 'unique'
          ? new Set(bucket.map(getVisitorKey).filter(Boolean)).size
          : bucket.length;

        return {
          date: format(bucketStart, 'MMM dd'),
          value,
        };
      });
    }

    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const key = format(date, 'yyyy-MM-dd');
      const bucket = qrScans.filter((v) => {
        const d = getEventDate(v);
        return d && format(d, 'yyyy-MM-dd') === key;
      });
      const value = qrMetricMode === 'unique'
        ? new Set(bucket.map(getVisitorKey).filter(Boolean)).size
        : bucket.length;

      return {
        date: format(date, 'MMM dd'),
        value,
      };
    });
  };

  const topReferrers = useMemo(() => {
    const map = {};
    qrScans.forEach((scan) => {
      const key = getReferrerHost(scan);
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [qrScans]);

  const topDevices = useMemo(() => {
    const map = {};
    qrScans.forEach((scan) => {
      const key = getDeviceType(scan);
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [qrScans]);

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

  const getCardPerformance = () => {
    const byCard = {};

    filteredViews.forEach((event) => {
      const id = event.card_id;
      if (!id) return;
      if (!byCard[id]) {
        byCard[id] = {
          card_id: id,
          pageViews: 0,
          qrScans: 0,
          clicks: 0,
          uniqueVisitorSet: new Set(),
        };
      }

      if (event.view_type === 'page_view') byCard[id].pageViews += 1;
      if (event.view_type === 'qr_scan') byCard[id].qrScans += 1;
      if (event.view_type === 'link_click') byCard[id].clicks += 1;

      const visitorKey = getVisitorKey(event);
      if (visitorKey) byCard[id].uniqueVisitorSet.add(visitorKey);
    });

    return Object.values(byCard)
      .map((row) => {
        const cardMeta = cards.find((c) => c.id === row.card_id) || {};
        return {
          ...cardMeta,
          ...row,
          uniqueVisitors: row.uniqueVisitorSet.size,
          totalEngagement: row.pageViews + row.qrScans + row.clicks,
        };
      })
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 5);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      
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

      {/* Advanced QR Settings */}
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-base">{isRTL ? 'إعدادات تحليل QR المتقدمة' : 'Advanced QR Analytics Settings'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm mb-2 text-slate-500 dark:text-slate-400">{isRTL ? 'نوع القياس' : 'Metric Type'}</p>
            <Select value={qrMetricMode} onValueChange={setQrMetricMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">{isRTL ? 'إجمالي المسح' : 'Total Scans'}</SelectItem>
                <SelectItem value="unique">{isRTL ? 'مسح فريد' : 'Unique Scans'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm mb-2 text-slate-500 dark:text-slate-400">{isRTL ? 'تجميع الخط الزمني' : 'Timeline Grouping'}</p>
            <Select value={qrGroupBy} onValueChange={setQrGroupBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">{isRTL ? 'يومي' : 'Daily'}</SelectItem>
                <SelectItem value="week">{isRTL ? 'أسبوعي' : 'Weekly'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <div className="flex items-center justify-between w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">{isRTL ? 'استبعاد البوتات' : 'Exclude Bots'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{isRTL ? 'تنقية الزيارات غير البشرية' : 'Filter non-human scans'}</p>
              </div>
              <Switch checked={excludeBots} onCheckedChange={setExcludeBots} />
            </div>
          </div>
        </CardContent>
      </Card>

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
          value={qrMetricMode === 'unique' ? uniqueQrScans : qrScans.length}
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

      {/* QR Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>{isRTL ? 'أعلى مصادر المسح' : 'Top Scan Referrers'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topReferrers.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">{isRTL ? 'لا توجد بيانات بعد' : 'No data yet'}</p>
            ) : topReferrers.map(([source, count]) => (
              <div key={source} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[70%]">{source}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>{isRTL ? 'الأجهزة' : 'Scan Devices'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topDevices.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">{isRTL ? 'لا توجد بيانات بعد' : 'No data yet'}</p>
            ) : topDevices.map(([device, count]) => (
              <div key={device} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{device}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>{isRTL ? 'مؤشرات QR' : 'QR KPIs'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{isRTL ? 'إجمالي المسح' : 'Total Scans'}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{qrScans.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{isRTL ? 'المسح الفريد' : 'Unique Scans'}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{uniqueQrScans}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{isRTL ? 'معدل المسح/المشاهدة' : 'Scan/View Rate'}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{scanRate}%</span>
            </div>
          </CardContent>
        </Card>
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
                    onClick={openUpgradeDialog}
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
                    onClick={openUpgradeDialog}
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
                  })) : getQrTimelineData()} 
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
                  onClick={openUpgradeDialog}
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
                    onClick={openUpgradeDialog}
                    size="sm"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isRTL ? 'الترقية لفتح' : 'Upgrade to unlock'}
                  </Button>
                </div>
              )}
              <div className={cn(!isPremium && "blur-sm opacity-50", "space-y-4")}>
                {(!isPremium ? ['Business Card', 'Personal Card', 'Portfolio'] : getCardPerformance())
                  .slice(0, 5)
                  .map((card, index) => {
                    const mockCard = typeof card === 'string' ? {
                      name: card,
                      status: 'published',
                      pageViews: Math.floor(Math.random() * 100) + 20,
                      qrScans: Math.floor(Math.random() * 50) + 10,
                      clicks: Math.floor(Math.random() * 30) + 6,
                      uniqueVisitors: Math.floor(Math.random() * 70) + 12,
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
                            <p className="font-bold text-slate-900 dark:text-white">{mockCard.pageViews || 0}</p>
                            <p className="text-slate-500 dark:text-slate-400">{isRTL ? 'مشاهدات' : 'Views'}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-slate-900 dark:text-white">{mockCard.qrScans || 0}</p>
                            <p className="text-slate-500 dark:text-slate-400">{isRTL ? 'مسح QR' : 'QR'}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-slate-900 dark:text-white">{mockCard.clicks || 0}</p>
                            <p className="text-slate-500 dark:text-slate-400">{isRTL ? 'نقرات' : 'Clicks'}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-slate-900 dark:text-white">{mockCard.uniqueVisitors || 0}</p>
                            <p className="text-slate-500 dark:text-slate-400">{isRTL ? 'فريدون' : 'Unique'}</p>
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