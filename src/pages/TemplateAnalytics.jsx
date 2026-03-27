import React, { useMemo } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Eye, MousePointerClick, Users, Award, Calendar, Mail, Share2 } from 'lucide-react';

const COLORS = ['#0D7377', '#14274E', '#7C3AED', '#059669', '#DC2626', '#0EA5E9', '#D97706', '#EC4899', '#10B981', '#F59E0B'];

export default function TemplateAnalytics() {
  const { isRTL } = useLanguage();
  const [user, setUser] = React.useState(null);

  // Check if user is admin
  React.useEffect(() => {
    api.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['all-cards'],
    queryFn: () => api.asServiceRole.entities.BusinessCard.list('-created_date', 10000)
  });

  const { data: views = [], isLoading: viewsLoading } = useQuery({
    queryKey: ['all-views'],
    queryFn: () => api.asServiceRole.entities.CardView.list('-created_date', 10000)
  });

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['all-submissions'],
    queryFn: () => api.asServiceRole.entities.ContactSubmission.list('-created_date', 10000)
  });

  // Template analytics
  const templateAnalytics = useMemo(() => {
    const analytics = {};
    
    cards.forEach(card => {
      const template = card.template || 'unknown';
      if (!analytics[template]) {
        analytics[template] = {
          template,
          cards: 0,
          views: 0,
          clickTypes: {},
          submissions: 0,
          conversions: 0
        };
      }
      analytics[template].cards++;
    });

    views.forEach(view => {
      const card = cards.find(c => c.id === view.card_id);
      if (card) {
        const template = card.template || 'unknown';
        if (analytics[template]) {
          analytics[template].views++;
          if (view.clicked_link) {
            analytics[template].clickTypes[view.clicked_link] = 
              (analytics[template].clickTypes[view.clicked_link] || 0) + 1;
          }
        }
      }
    });

    submissions.forEach(sub => {
      const card = cards.find(c => c.id === sub.card_id);
      if (card) {
        const template = card.template || 'unknown';
        if (analytics[template]) {
          analytics[template].submissions++;
          analytics[template].conversions = analytics[template].views > 0 
            ? ((analytics[template].submissions / analytics[template].views) * 100).toFixed(2)
            : 0;
        }
      }
    });

    return Object.values(analytics).sort((a, b) => b.views - a.views);
  }, [cards, views, submissions]);

  // Popular templates
  const popularTemplates = templateAnalytics.slice(0, 5);

  // Click distribution
  const clickDistribution = useMemo(() => {
    const distribution = {};
    views.forEach(view => {
      if (view.clicked_link) {
        distribution[view.clicked_link] = (distribution[view.clicked_link] || 0) + 1;
      }
    });
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [views]);

  // Conversion funnel
  const conversionFunnel = useMemo(() => {
    const totalViews = views.length;
    const uniqueClicks = new Set(views.filter(v => v.clicked_link).map(v => v.card_id)).size;
    const totalSubmissions = submissions.length;

    return [
      { stage: isRTL ? 'المشاهدات' : 'Views', count: totalViews, percentage: 100 },
      { stage: isRTL ? 'النقرات' : 'Clicks', count: views.filter(v => v.clicked_link).length, percentage: totalViews > 0 ? ((views.filter(v => v.clicked_link).length / totalViews) * 100).toFixed(1) : 0 },
      { stage: isRTL ? 'التحويلات' : 'Conversions', count: totalSubmissions, percentage: totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : 0 }
    ];
  }, [views, submissions, isRTL]);

  // Template engagement over time
  const engagementTrend = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayViews = views.filter(v => v.created_date?.split('T')[0] === dateStr).length;
      const dayClicks = views.filter(v => v.created_date?.split('T')[0] === dateStr && v.clicked_link).length;
      const daySubmissions = submissions.filter(s => s.created_date?.split('T')[0] === dateStr).length;
      
      last7Days.push({
        date: dateStr,
        views: dayViews,
        clicks: dayClicks,
        submissions: daySubmissions
      });
    }
    return last7Days;
  }, [views, submissions]);

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Award className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {isRTL ? 'الوصول محظور' : 'Access Denied'}
          </h2>
          <p className="text-slate-500">
            {isRTL ? 'هذه الصفحة متاحة للمسؤولين فقط' : 'This page is only available to administrators'}
          </p>
        </div>
      </div>
    );
  }

  if (cardsLoading || viewsLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
          <p className="text-slate-500">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const totalViews = views.length;
  const totalClicks = views.filter(v => v.clicked_link).length;
  const totalSubmissions = submissions.length;
  const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0;
  const avgConversion = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(2) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {isRTL ? 'تحليلات القوالب' : 'Template Analytics'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {isRTL ? 'رؤى مفصلة حول أداء القوالب وتفاعل المستخدمين' : 'Detailed insights on template performance and user engagement'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'إجمالي المشاهدات' : 'Total Views'}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'النقرات' : 'Total Clicks'}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalClicks.toLocaleString()}</p>
              </div>
              <MousePointerClick className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'التحويلات' : 'Conversions'}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalSubmissions.toLocaleString()}</p>
              </div>
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'معدل النقر' : 'Avg CTR'}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{avgCTR}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'معدل التحويل' : 'Conversion Rate'}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{avgConversion}%</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">{isRTL ? 'القوالب' : 'Templates'}</TabsTrigger>
          <TabsTrigger value="engagement">{isRTL ? 'التفاعل' : 'Engagement'}</TabsTrigger>
          <TabsTrigger value="conversions">{isRTL ? 'التحويلات' : 'Conversions'}</TabsTrigger>
          <TabsTrigger value="trends">{isRTL ? 'الاتجاهات' : 'Trends'}</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Views per Template */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'المشاهدات حسب القالب' : 'Views per Template'}</CardTitle>
                <CardDescription>{isRTL ? 'إجمالي المشاهدات لكل قالب' : 'Total views for each template'}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={popularTemplates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="template" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#0D7377" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Popular Templates */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'أشهر القوالب' : 'Popular Templates'}</CardTitle>
                <CardDescription>{isRTL ? 'القوالب الأكثر استخداماً' : 'Most used templates'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularTemplates.map((template, index) => (
                    <div key={template.template} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 text-white font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{template.template.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-slate-500">{template.cards} {isRTL ? 'بطاقة' : 'cards'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-teal-600">{template.views.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{isRTL ? 'مشاهدة' : 'views'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'أداء القوالب' : 'Template Performance'}</CardTitle>
              <CardDescription>{isRTL ? 'مقاييس مفصلة لكل قالب' : 'Detailed metrics for each template'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left p-3 text-sm font-semibold">{isRTL ? 'القالب' : 'Template'}</th>
                      <th className="text-left p-3 text-sm font-semibold">{isRTL ? 'البطاقات' : 'Cards'}</th>
                      <th className="text-left p-3 text-sm font-semibold">{isRTL ? 'المشاهدات' : 'Views'}</th>
                      <th className="text-left p-3 text-sm font-semibold">{isRTL ? 'النقرات' : 'Clicks'}</th>
                      <th className="text-left p-3 text-sm font-semibold">{isRTL ? 'التحويلات' : 'Conversions'}</th>
                      <th className="text-left p-3 text-sm font-semibold">{isRTL ? 'معدل التحويل' : 'Conv. Rate'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templateAnalytics.map(template => (
                      <tr key={template.template} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="p-3">
                          <span className="font-medium capitalize">{template.template.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="p-3">{template.cards}</td>
                        <td className="p-3">{template.views.toLocaleString()}</td>
                        <td className="p-3">{Object.values(template.clickTypes).reduce((a, b) => a + b, 0).toLocaleString()}</td>
                        <td className="p-3">{template.submissions}</td>
                        <td className="p-3">
                          <Badge variant={template.conversions > 5 ? 'default' : 'secondary'}>
                            {template.conversions}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Click Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'توزيع النقرات' : 'Click Distribution'}</CardTitle>
                <CardDescription>{isRTL ? 'الأقسام الأكثر نقراً' : 'Most clicked sections'}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={clickDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {clickDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Click Types List */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'أنواع النقرات' : 'Click Types'}</CardTitle>
                <CardDescription>{isRTL ? 'تفاصيل النقرات حسب النوع' : 'Click details by type'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clickDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium capitalize">{item.name.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="font-bold text-teal-600">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'قمع التحويل' : 'Conversion Funnel'}</CardTitle>
              <CardDescription>{isRTL ? 'رحلة المستخدم من المشاهدة إلى التحويل' : 'User journey from view to conversion'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="text-right">
                        <span className="font-bold text-lg">{stage.count.toLocaleString()}</span>
                        <span className="text-sm text-slate-500 ml-2">({stage.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                      <div 
                        className="h-full flex items-center px-4 text-white font-semibold transition-all duration-500"
                        style={{ 
                          width: `${stage.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      >
                        {stage.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'اتجاهات التفاعل (آخر 7 أيام)' : 'Engagement Trends (Last 7 Days)'}</CardTitle>
              <CardDescription>{isRTL ? 'المشاهدات والنقرات والتحويلات اليومية' : 'Daily views, clicks, and conversions'}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={engagementTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#0D7377" name={isRTL ? 'المشاهدات' : 'Views'} strokeWidth={2} />
                  <Line type="monotone" dataKey="clicks" stroke="#7C3AED" name={isRTL ? 'النقرات' : 'Clicks'} strokeWidth={2} />
                  <Line type="monotone" dataKey="submissions" stroke="#059669" name={isRTL ? 'التحويلات' : 'Conversions'} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                {isRTL ? 'رؤى رئيسية' : 'Key Insights'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                  <p className="text-sm font-semibold text-teal-900 dark:text-teal-100 mb-2">
                    {isRTL ? '🏆 القالب الأكثر شعبية' : '🏆 Most Popular Template'}
                  </p>
                  <p className="text-lg font-bold text-teal-700 dark:text-teal-300 capitalize">
                    {popularTemplates[0]?.template.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-teal-600 dark:text-teal-400">
                    {popularTemplates[0]?.views.toLocaleString()} {isRTL ? 'مشاهدة' : 'views'}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    {isRTL ? '🎯 أعلى معدل تحويل' : '🎯 Best Conversion Rate'}
                  </p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300 capitalize">
                    {[...templateAnalytics].sort((a, b) => b.conversions - a.conversions)[0]?.template.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    {[...templateAnalytics].sort((a, b) => b.conversions - a.conversions)[0]?.conversions}% {isRTL ? 'معدل تحويل' : 'conversion rate'}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {isRTL ? '👆 القسم الأكثر نقراً' : '👆 Most Clicked Section'}
                  </p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300 capitalize">
                    {clickDistribution[0]?.name.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {clickDistribution[0]?.value.toLocaleString()} {isRTL ? 'نقرة' : 'clicks'}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    {isRTL ? '📈 إجمالي التفاعل' : '📈 Total Engagement'}
                  </p>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                    {((totalClicks + totalSubmissions) / totalViews * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    {isRTL ? 'معدل التفاعل الكلي' : 'Overall engagement rate'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}