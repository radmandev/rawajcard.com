import React, { useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Sparkles, Crown, TrendingUp, CreditCard, Layers } from 'lucide-react';
import { ALL_TEMPLATES, DEFAULT_TIERS } from '@/lib/templateConfig';

export default function AdminSettings() {
  const { isRTL } = useLanguage();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: () => api.entities.User.list() });
  const { data: subscriptions = [] } = useQuery({ queryKey: ['admin-subscriptions'], queryFn: () => api.entities.Subscription.list() });

  const { data: savedTiers = {} } = useQuery({
    queryKey: ['template-tiers'],
    queryFn: () => api.appSettings.get('template_tiers'),
  });
  const effectiveTiers = { ...DEFAULT_TIERS, ...savedTiers };

  const saveTiersMutation = useMutation({
    mutationFn: (newTiers) => api.appSettings.set('template_tiers', newTiers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-tiers'] });
      toast.success(isRTL ? 'تم حفظ إعدادات القوالب' : 'Template tiers saved');
    },
    onError: () => toast.error(isRTL ? 'فشل الحفظ' : 'Save failed'),
  });

  const toggleTemplateTier = (templateId) => {
    const current = effectiveTiers[templateId] || 'free';
    const updated = { ...effectiveTiers, [templateId]: current === 'premium' ? 'free' : 'premium' };
    saveTiersMutation.mutate(updated);
  };

  const subMap = React.useMemo(() => {
    const m = {}; subscriptions.forEach(s => { if (s.created_by) m[s.created_by] = s; }); return m;
  }, [subscriptions]);

  const subStats = React.useMemo(() => {
    const premium    = subscriptions.filter(s => s.plan === 'premium').length;
    const teams      = subscriptions.filter(s => s.plan === 'teams').length;
    const enterprise = subscriptions.filter(s => s.plan === 'enterprise').length;
    const active     = subscriptions.filter(s => s.status === 'active').length;
    return { total: users.length, premium, teams, enterprise, active, mrr: premium * 19 + teams * 49 + enterprise * 99 };
  }, [users, subscriptions]);

  const [settings, setSettings] = useState({
    siteName: 'Rawajcard',
    siteNameAr: 'بطاقة رواج',
    supportEmail: 'support@rawajcard.com',
    maxCardsPerUser: 10,
    allowPublicRegistration: true,
    requireEmailVerification: false,
    enableAnalytics: true,
    maintenanceMode: false
  });

  const handleSave = () => {
    // TODO: Save settings to database or config file
    toast.success(isRTL ? 'تم حفظ الإعدادات' : 'Settings saved');
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            {isRTL ? 'نظرة عامة على الاشتراكات' : 'Subscription Overview'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'ملخص خطط المستخدمين' : "Summary of users' subscription plans"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <Users className="h-6 w-6 mx-auto mb-2 text-slate-500" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{subStats.total}</p>
              <p className="text-xs text-slate-500 mt-1">{isRTL ? 'إجمالي المستخدمين' : 'Total Users'}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20">
              <Sparkles className="h-6 w-6 mx-auto mb-2 text-teal-600" />
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{subStats.premium}</p>
              <p className="text-xs text-teal-600 mt-1">{isRTL ? 'بريميوم' : 'Premium'}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Crown className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{subStats.enterprise}</p>
              <p className="text-xs text-purple-600 mt-1">{isRTL ? 'مؤسسي' : 'Enterprise'}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <CreditCard className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">SAR {subStats.mrr.toLocaleString()}</p>
              <p className="text-xs text-amber-600 mt-1">{isRTL ? 'إيرادات شهرية (تقدير)' : 'Est. MRR'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'الإعدادات العامة' : 'General Settings'}</CardTitle>
          <CardDescription>
            {isRTL ? 'إدارة إعدادات التطبيق الأساسية' : 'Manage core application settings'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'اسم الموقع (إنجليزي)' : 'Site Name (English)'}</Label>
              <Input
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'اسم الموقع (عربي)' : 'Site Name (Arabic)'}</Label>
              <Input
                value={settings.siteNameAr}
                onChange={(e) => handleChange('siteNameAr', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? 'بريد الدعم' : 'Support Email'}</Label>
            <Input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? 'الحد الأقصى للبطاقات لكل مستخدم' : 'Max Cards Per User'}</Label>
            <Input
              type="number"
              value={settings.maxCardsPerUser}
              onChange={(e) => handleChange('maxCardsPerUser', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'إعدادات المستخدمين' : 'User Settings'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{isRTL ? 'السماح بالتسجيل العام' : 'Allow Public Registration'}</Label>
              <p className="text-sm text-slate-500">
                {isRTL ? 'السماح للمستخدمين الجدد بإنشاء حسابات' : 'Allow new users to create accounts'}
              </p>
            </div>
            <Switch
              checked={settings.allowPublicRegistration}
              onCheckedChange={(checked) => handleChange('allowPublicRegistration', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{isRTL ? 'التحقق من البريد الإلكتروني' : 'Email Verification'}</Label>
              <p className="text-sm text-slate-500">
                {isRTL ? 'طلب التحقق من البريد الإلكتروني عند التسجيل' : 'Require email verification on signup'}
              </p>
            </div>
            <Switch
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) => handleChange('requireEmailVerification', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'إعدادات النظام' : 'System Settings'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{isRTL ? 'تمكين التحليلات' : 'Enable Analytics'}</Label>
              <p className="text-sm text-slate-500">
                {isRTL ? 'تتبع المشاهدات والمسحات' : 'Track views and scans'}
              </p>
            </div>
            <Switch
              checked={settings.enableAnalytics}
              onCheckedChange={(checked) => handleChange('enableAnalytics', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-orange-600">{isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}</Label>
              <p className="text-sm text-slate-500">
                {isRTL ? 'تعطيل الوصول للمستخدمين العاديين' : 'Disable access for regular users'}
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleChange('maintenanceMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Template Tiers Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-teal-600" />
            {isRTL ? 'إعدادات مستويات القوالب' : 'Template Tier Settings'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'حدد القوالب المجانية والمميزة (PRO)' : 'Set which templates are free and which require a Pro plan'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ALL_TEMPLATES.map(template => {
              const isPremium = effectiveTiers[template.id] === 'premium';
              return (
                <div
                  key={template.id}
                  className={`relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    isPremium
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                  onClick={() => toggleTemplateTier(template.id)}
                >
                  <div
                    className="h-8 w-full rounded mb-2"
                    style={{
                      background: template.colors?.length > 1
                        ? `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})`
                        : template.colors?.[0] || '#ccc'
                    }}
                  />
                  <p className="text-xs font-medium truncate text-slate-800 dark:text-white">
                    {isRTL ? template.nameAr : template.name}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    {isPremium ? (
                      <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0 h-4 gap-0.5">
                        <Crown className="h-2.5 w-2.5" /> PRO
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                        FREE
                      </Badge>
                    )}
                    <Switch
                      checked={isPremium}
                      onCheckedChange={() => toggleTemplateTier(template.id)}
                      onClick={e => e.stopPropagation()}
                      className="scale-75 origin-right"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            {isRTL
              ? `${ALL_TEMPLATES.filter(t => effectiveTiers[t.id] === 'premium').length} قالب مميز · ${ALL_TEMPLATES.filter(t => effectiveTiers[t.id] !== 'premium').length} قالب مجاني`
              : `${ALL_TEMPLATES.filter(t => effectiveTiers[t.id] === 'premium').length} Pro templates · ${ALL_TEMPLATES.filter(t => effectiveTiers[t.id] !== 'premium').length} Free templates`
            }
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
          {isRTL ? 'حفظ جميع الإعدادات' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}