import React, { useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Shield, Layout, Users, CreditCard, Settings, Sparkles, Package, ShoppingBag } from 'lucide-react';
import AdminTemplates from '@/components/admin/AdminTemplates';
import AdminClients from '@/components/admin/AdminClients';
import AdminCards from '@/components/admin/AdminCards';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminCustomizationRequests from '@/components/admin/AdminCustomizationRequests';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminOrders from '@/components/admin/AdminOrders';
import { api } from '@/api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAILS = ['emadradman.dev@gmail.com', 'admin@rawajcard.com'];

export default function Admin() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');

  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const authenticated = await api.auth.isAuthenticated();
      if (!authenticated) {
        navigate('/login');
        return null;
      }
      return api.auth.me();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === 'admin' || ADMIN_EMAILS.includes(user.email);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {isRTL ? 'وصول مرفوض' : 'Access Denied'}
          </h1>
          <p className="text-slate-500 mb-4">
            {isRTL ? 'يتطلب هذا القسم صلاحيات المسؤول' : 'This section requires admin privileges'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {isRTL ? 'لوحة تحكم المسؤول' : 'Admin Dashboard'}
          </h1>
        </div>
        <p className="text-slate-500">
          {isRTL ? 'إدارة القوالب والعملاء والإعدادات' : 'Manage templates, clients, and settings'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الطلبات' : 'Orders'}</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'المنتجات' : 'Products'}</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'القوالب' : 'Templates'}</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'العملاء' : 'Clients'}</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'البطاقات' : 'Cards'}</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الطلبات' : 'Requests'}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الإعدادات' : 'Settings'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <AdminOrders />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <AdminProducts />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <AdminTemplates />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <AdminClients />
        </TabsContent>

        <TabsContent value="cards" className="space-y-6">
          <AdminCards />
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <AdminCustomizationRequests />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}