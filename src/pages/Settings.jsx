import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useUpgrade } from '@/lib/UpgradeContext';
import { useTheme } from '@/components/shared/ThemeContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Settings as SettingsIcon, 
  Trash2, 
  AlertTriangle,
  User,
  CreditCard,
  Receipt,
  Bell,
  Shield,
  Globe,
  Sparkles,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Settings() {
  const { t, lang, setLang, isRTL } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: '' });
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    contact_alerts: true,
    marketing: false
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.me()
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const subs = await api.entities.Subscription.list();
      return subs[0] || { plan: 'free', card_limit: 1, status: 'active' };
    }
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.entities.Order.list('-created_date', 10)
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return api.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setEditProfile(false);
      toast.success(isRTL ? 'تم تحديث الملف الشخصي' : 'Profile updated');
    }
  });

  React.useEffect(() => {
    if (user) {
      setProfileData({ full_name: user.full_name || '' });
      setNotifications({
        email_notifications: user.email_notifications ?? true,
        contact_alerts: user.contact_alerts ?? true,
        marketing: user.marketing ?? false
      });
    }
  }, [user]);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const cards = await api.entities.BusinessCard.list();
      for (const card of cards) {
        await api.entities.BusinessCard.delete(card.id);
      }

      const contacts = await api.entities.ContactSubmission.list();
      for (const contact of contacts) {
        await api.entities.ContactSubmission.delete(contact.id);
      }

      toast.success(isRTL ? 'تم حذف حسابك' : 'Your account has been deleted');
      await api.auth.logout();
    } catch (error) {
      toast.error(isRTL ? 'فشل حذف الحساب' : 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleNotificationChange = async (key, value) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    try {
      await api.auth.updateMe(newNotifications);
      toast.success(isRTL ? 'تم التحديث' : 'Updated');
    } catch (error) {
      toast.error(isRTL ? 'فشل التحديث' : 'Update failed');
    }
  };

  const { openUpgradeDialog } = useUpgrade();
  const isPremium = subscription?.plan === 'premium';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {t('settings')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {isRTL ? 'إدارة حسابك وإعداداتك' : 'Manage your account and preferences'}
        </p>
      </div>

      {/* Personal Profile */}
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {isRTL ? 'الملف الشخصي' : 'Personal Profile'}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setEditProfile(true)}>
              {isRTL ? 'تعديل' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-500">{isRTL ? 'الاسم' : 'Name'}</label>
            <p className="text-lg font-medium mt-1">{user?.full_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
            <p className="text-lg font-medium mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500">{isRTL ? 'الدور' : 'Role'}</label>
            <Badge variant="secondary" className="mt-1 capitalize">{user?.role}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {isRTL ? 'الاشتراك' : 'Subscription'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'إدارة خطة الاشتراك الخاصة بك' : 'Manage your subscription plan'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl">
            <div className="flex items-center gap-3">
              {isPremium ? (
                <Crown className="h-8 w-8 text-amber-500" />
              ) : (
                <Sparkles className="h-8 w-8 text-slate-400" />
              )}
              <div>
                <p className="font-semibold text-lg capitalize">
                  {subscription?.plan === 'premium' ? (isRTL ? 'بريميوم' : 'Premium') : (isRTL ? 'مجاني' : 'Free')}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isPremium 
                    ? (isRTL ? 'بطاقات غير محدودة' : 'Unlimited cards')
                    : (isRTL ? `${subscription?.card_limit || 1} بطاقة` : `${subscription?.card_limit || 1} card`)
                  }
                </p>
              </div>
            </div>
            <Badge className={isPremium ? 'bg-amber-500' : 'bg-slate-500'}>
              {subscription?.status === 'active' ? (isRTL ? 'نشط' : 'Active') : subscription?.status}
            </Badge>
          </div>

          {subscription?.expires_at && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {isRTL ? 'تنتهي في:' : 'Expires on:'} {format(new Date(subscription.expires_at), 'MMM dd, yyyy')}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={openUpgradeDialog}>
              {isPremium 
                ? (isRTL ? 'إدارة الاشتراك' : 'Manage Plan') 
                : (isRTL ? 'الترقية إلى بريميوم' : 'Upgrade to Premium')
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {isRTL ? 'سجل الفواتير' : 'Billing History'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'عرض المعاملات والطلبات السابقة' : 'View your past transactions and orders'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {isRTL ? 'لا توجد طلبات' : 'No orders yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {isRTL ? 'طلب رقم' : 'Order'} #{order.order_number}
                    </p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(order.created_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">SAR {order.total?.toFixed(2)}</p>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {isRTL ? 'الإشعارات' : 'Notifications'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'إدارة تفضيلات الإشعارات' : 'Manage your notification preferences'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</p>
              <p className="text-sm text-slate-500">{isRTL ? 'تلقي التحديثات عبر البريد الإلكتروني' : 'Receive updates via email'}</p>
            </div>
            <Switch
              checked={notifications.email_notifications}
              onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{isRTL ? 'تنبيهات جهات الاتصال' : 'Contact Alerts'}</p>
              <p className="text-sm text-slate-500">{isRTL ? 'إشعار عند تلقي جهة اتصال جديدة' : 'Get notified on new contact submissions'}</p>
            </div>
            <Switch
              checked={notifications.contact_alerts}
              onCheckedChange={(checked) => handleNotificationChange('contact_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{isRTL ? 'التسويق' : 'Marketing'}</p>
              <p className="text-sm text-slate-500">{isRTL ? 'تلقي أخبار ونصائح' : 'Receive news and tips'}</p>
            </div>
            <Switch
              checked={notifications.marketing}
              onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {isRTL ? 'التفضيلات' : 'Preferences'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{isRTL ? 'اللغة' : 'Language'}</p>
              <p className="text-sm text-slate-500">{isRTL ? 'اختر لغتك المفضلة' : 'Choose your preferred language'}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            >
              {lang === 'en' ? '🇺🇸 English' : '🇸🇦 العربية'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{isRTL ? 'المظهر' : 'Theme'}</p>
              <p className="text-sm text-slate-500">{isRTL ? 'فاتح أو داكن' : 'Light or dark mode'}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
            >
              {isDark ? (isRTL ? 'داكن' : 'Dark') : (isRTL ? 'فاتح' : 'Light')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {isRTL ? 'الخصوصية والأمان' : 'Privacy & Security'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
          </Button>
          <Button variant="outline" className="w-full justify-start">
            {isRTL ? 'تفعيل المصادقة الثنائية' : 'Enable Two-Factor Authentication'}
          </Button>
          <Button variant="outline" className="w-full justify-start">
            {isRTL ? 'تنزيل بياناتي' : 'Download My Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            {isRTL ? 'منطقة الخطر' : 'Danger Zone'}
          </CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            {isRTL 
              ? 'هذه الإجراءات لا يمكن التراجع عنها'
              : 'These actions cannot be undone'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isRTL ? 'حذف الحساب' : 'Delete Account'}
          </Button>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfile} onOpenChange={setEditProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile'}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'قم بتحديث معلومات ملفك الشخصي' : 'Update your profile information'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isRTL ? 'الاسم الكامل' : 'Full Name'}</Label>
              <Input
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                value={user?.email}
                disabled
                className="mt-2 bg-slate-50 dark:bg-slate-800"
              />
              <p className="text-xs text-slate-500 mt-1">
                {isRTL ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfile(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={updateProfileMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {updateProfileMutation.isPending 
                ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                : (isRTL ? 'حفظ' : 'Save')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {isRTL ? 'حذف الحساب نهائياً' : 'Delete Account Permanently'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {isRTL 
                  ? 'هل أنت متأكد من حذف حسابك؟ سيتم حذف:'
                  : 'Are you sure you want to delete your account? This will delete:'
                }
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{isRTL ? 'جميع بطاقاتك الرقمية' : 'All your digital cards'}</li>
                <li>{isRTL ? 'جميع جهات الاتصال' : 'All your contacts'}</li>
                <li>{isRTL ? 'جميع الإحصائيات' : 'All your analytics'}</li>
                <li>{isRTL ? 'جميع البيانات المرتبطة بحسابك' : 'All data associated with your account'}</li>
              </ul>
              <p className="font-semibold text-red-600 mt-4">
                {isRTL 
                  ? 'هذا الإجراء لا يمكن التراجع عنه!'
                  : 'This action cannot be undone!'
                }
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting 
                ? (isRTL ? 'جاري الحذف...' : 'Deleting...') 
                : (isRTL ? 'نعم، احذف حسابي' : 'Yes, delete my account')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}