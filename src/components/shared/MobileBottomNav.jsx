import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { LayoutDashboard, CreditCard, Store, Users } from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();
  const { t, isRTL } = useLanguage();

  const navItems = [
    { 
      key: 'dashboard', 
      icon: LayoutDashboard, 
      label: t('dashboard'),
      path: createPageUrl('Dashboard')
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
        {navItems.map(({ key, icon: Icon, label, path }) => (
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
        ))}
      </div>
    </nav>
  );
}