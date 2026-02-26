import React, { useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { api } from '@/api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';
import { Users, Sparkles, Crown, TrendingUp, CreditCard } from 'lucide-react';

export default function AdminSettings() {
  const { isRTL } = useLanguage();

  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: () => api.entities.User.list() });
  const { data: subscriptions = [] } = useQuery({ queryKey: ['admin-subscriptions'], queryFn: () => api.entities.Subscription.list() });

  const subMap = React.useMemo(() => {
    const m = {}; subscriptions.forEach(s => { if (s.created_by) m[s.created_by] = s; }); return m;
  }, [subscriptions]);

  const subStats = React.useMemo(() => {
    const premium = subscriptions.filter(s => s.plan === 'premium').length;
    const enterprise = subscriptions.filter(s => s.plan === 'enterprise').length;
    const active = subscriptions.filter(s => s.status === 'active').length;
    return { total: users.length, premium, enterprise, active, mrr: premium * 19 + enterprise * 99 };
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

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
          {isRTL ? 'حفظ جميع الإعدادات' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}