import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import { useUpgrade } from '@/lib/UpgradeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CreditCard, 
  Eye, 
  QrCode, 
  Plus, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Clock,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function Dashboard() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { openUpgradeDialog } = useUpgrade();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  // Pull to refresh handler
  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY && window.scrollY === 0) {
      const distance = e.touches[0].clientY - startY;
      if (distance > 0) {
        setPullDistance(Math.min(distance, 150));
      }
    }
  }, [startY]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 80) {
      setIsRefreshing(true);
      await queryClient.refetchQueries({ queryKey: ['cards'] });
      await queryClient.refetchQueries({ queryKey: ['views'] });
      setTimeout(() => setIsRefreshing(false), 500);
    }
    setPullDistance(0);
    setStartY(0);
  }, [pullDistance, queryClient]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.me()
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const subs = await api.entities.Subscription.list();
      return subs[0] || { plan: 'free', card_limit: 2 };
    }
  });

  const isPremium = subscription?.plan === 'premium';

  const navigate = useNavigate();

  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const me = await api.auth.me();
      return api.entities.BusinessCard.filter({ created_by: me.email });
    }
  });

  useEffect(() => {
    if (!cardsLoading && cards.length === 0) {
      navigate(createPageUrl('CardBuilder'));
    }
  }, [cards.length, cardsLoading]);

  const { data: views = [] } = useQuery({
    queryKey: ['views'],
    queryFn: async () => {
      const me = await api.auth.me();
      return api.entities.CardView.filter({ card_owner: me.email });
    }
  });

  const publishedCards = cards.filter(c => c.status === 'published');
  const totalViews = views.filter(v => v.view_type === 'page_view').length;
  const totalScans = views.filter(v => v.view_type === 'qr_scan').length;

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayViews = views.filter(v => 
      v.created_date && v.created_date.startsWith(dateStr)
    ).length;
    return {
      date: format(date, 'MMM dd'),
      value: dayViews
    };
  });

  const recentCards = [...cards]
    .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))
    .slice(0, 3);

  return (
    <div 
      className="max-w-7xl mx-auto space-y-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-16 left-0 right-0 flex justify-center transition-transform z-50"
          style={{ transform: `translateY(${Math.min(pullDistance - 50, 50)}px)` }}
        >
          <div className="bg-teal-600 text-white px-4 py-2 rounded-full shadow-lg">
            {isRefreshing ? (
              <Clock className="h-5 w-5 animate-spin" />
            ) : pullDistance > 80 ? (
              <span className="text-sm">{isRTL ? 'اترك للتحديث' : 'Release to refresh'}</span>
            ) : (
              <span className="text-sm">{isRTL ? 'اسحب للتحديث' : 'Pull to refresh'}</span>
            )}
          </div>
        </div>
      )}


      
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-teal-600 to-blue-700 p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-teal-100">{t('dashboard')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {isRTL ? `مرحباً، ${user?.full_name || 'مستخدم'}` : `Welcome, ${user?.full_name || 'User'}`}
          </h1>
          <p className="text-teal-100 max-w-lg">
            {isRTL 
              ? 'أنشئ بطاقاتك الرقمية وشاركها مع العالم. تتبع إحصائياتك وتواصل بشكل احترافي.'
              : 'Create your digital cards and share them with the world. Track your stats and connect professionally.'
            }
          </p>
          
          <Link to={createPageUrl('CardBuilder')}>
            <Button className="mt-6 bg-white text-teal-700 hover:bg-teal-50" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              {t('createCard')}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('totalCards')}
          value={cards.length}
          icon={CreditCard}
          gradient="bg-gradient-to-br from-teal-500 to-teal-600"
          delay={0.1}
        />
        <StatsCard
          title={t('publishedCards')}
          value={publishedCards.length}
          icon={Sparkles}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={0.2}
        />
        <StatsCard
          title={t('totalViews')}
          value={totalViews}
          icon={Eye}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          delay={0.3}
        />
        <StatsCard
          title={t('totalScans')}
          value={totalScans}
          icon={QrCode}
          gradient="bg-gradient-to-br from-pink-500 to-pink-600"
          delay={0.4}
        />
      </div>

      {/* Charts & Recent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 relative">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('recentActivity')}</span>
              <Link to={createPageUrl('Analytics')}>
                <Button variant="ghost" size="sm">
                  {isRTL ? <ArrowLeft className="h-4 w-4 mr-1" /> : null}
                  {isRTL ? 'عرض الكل' : 'View all'}
                  {!isRTL ? <ArrowRight className="h-4 w-4 ml-1" /> : null}
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="relative">
              {!isPremium && (
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 z-10 rounded-lg flex items-center justify-center">
                  <div className="text-center p-6">
                    <Lock className="h-12 w-12 mx-auto mb-3 text-amber-500" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-4">
                      {isRTL ? 'اشترك لعرض التحليلات المتقدمة' : 'Subscribe to view advanced analytics'}
                    </p>
                    <Button
                      onClick={openUpgradeDialog}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      size="sm"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isRTL ? 'الترقية الآن' : 'Upgrade Now'}
                    </Button>
                  </div>
                </div>
              )}
              <div className={cn(!isPremium && "blur-sm opacity-50")}>
                <AnalyticsChart 
                  data={!isPremium ? Array.from({ length: 7 }, (_, i) => ({
                    date: format(new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), 'MMM dd'),
                    value: Math.floor(Math.random() * 30) + 10
                  })) : last7Days}
                  color="#0D7377"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Cards */}
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('myCards')}</span>
              <Link to={createPageUrl('MyCards')}>
                <Button variant="ghost" size="sm">
                  {isRTL ? <ArrowLeft className="h-4 w-4 mr-1" /> : null}
                  {isRTL ? 'عرض الكل' : 'View all'}
                  {!isRTL ? <ArrowRight className="h-4 w-4 ml-1" /> : null}
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cardsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentCards.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">{t('noCards')}</p>
                <Link to={createPageUrl('CardBuilder')}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    {t('createCard')}
                  </Button>
                </Link>
              </div>
            ) : (
              recentCards.map((card) => (
                <Link 
                  key={card.id} 
                  to={createPageUrl(`CardBuilder?id=${card.id}`)}
                  className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {card.profile_image ? (
                      <img src={card.profile_image} alt={card.name} className="h-full w-full object-cover" />
                    ) : (
                      card.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {isRTL && card.name_ar ? card.name_ar : card.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        card.status === 'published' 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                      )}>
                        {card.status === 'published' ? t('published') : t('draft')}
                      </span>
                    </div>
                  </div>
                  {isRTL ? <ArrowLeft className="h-4 w-4 text-slate-400" /> : <ArrowRight className="h-4 w-4 text-slate-400" />}
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>{t('quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={createPageUrl('CardBuilder')}>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900/30">
                  <Plus className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <span>{t('createCard')}</span>
              </Button>
            </Link>
            <Link to={createPageUrl('MyCards')}>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span>{t('myCards')}</span>
              </Button>
            </Link>
            <Link to={createPageUrl('Analytics')}>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span>{t('analytics')}</span>
              </Button>
            </Link>
            <Link to={createPageUrl('Store')}>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900/30">
                  <Sparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <span>{t('store')}</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}