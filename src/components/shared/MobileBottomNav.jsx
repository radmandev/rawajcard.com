import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LayoutDashboard, CreditCard, Store, Users, LogOut, Shield } from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();
  const { t, isRTL } = useLanguage();

  const handleLogout = () => {
    api.auth.logout(createPageUrl('Home'));
  };

  const { data: cards = [] } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const me = await api.auth.me();
      return api.entities.BusinessCard.filter({ created_by: me.email });
    }
  });

  const hasNoCards = cards.filter(c => c.status === 'published').length === 0;

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me()
  });
  const isAdmin = user?.role === 'admin';

  const handleLockedClick = () => {
    toast.error(
      isRTL
        ? 'أنشئ بطاقة واحدة على الأقل لعرض الميزات الأخرى'
        : 'Create at least one card to view other features'
    );
  };

  const navItems = [
    { 
      key: 'dashboard', 
      icon: isAdmin ? Shield : LayoutDashboard,
      label: isAdmin ? (isRTL ? 'المسؤول' : 'Admin') : t('dashboard'),
      path: createPageUrl(isAdmin ? 'Admin' : 'Dashboard')
    },
    { 
      key: 'cards', 
      icon: CreditCard, 
      label: t('myCards'),
      path: createPageUrl('MyCards')
    },
    { 
      key: 'store', 
      icon: Store, 
      label: t('store'),
      path: createPageUrl('Store')
    },
    { 
      key: 'contacts', 
      icon: Users, 
      label: t('myContacts'),
      path: createPageUrl('MyContacts')
    }
  ];

  const isActive = (path) => {
    const currentPath = location.pathname;
    return currentPath === path || currentPath.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around">
        {navItems.map(({ key, icon: Icon, label, path }) => {
          if (!isAdmin && hasNoCards && key !== 'store') {
            return (
              <button
                key={key}
                onClick={handleLockedClick}
                className="flex flex-col items-center gap-1 py-3 px-4 flex-1 transition-colors text-slate-400 dark:text-slate-500 opacity-40 cursor-not-allowed"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          }
          return (
            <Link
              key={key}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-4 flex-1 transition-colors",
                "user-select-none -webkit-user-select-none",
                isActive(path)
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-3 px-4 flex-1 transition-colors text-red-500 dark:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-medium">{t('logout')}</span>
        </button>
      </div>
    </nav>
  );
}