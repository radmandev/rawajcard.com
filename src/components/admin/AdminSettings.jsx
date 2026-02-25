import React, { useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { isRTL } = useLanguage();
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