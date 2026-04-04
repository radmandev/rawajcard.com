import { toast } from 'sonner';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from './LanguageContext';
import { api } from '@/api/supabaseAPI';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CreditCard, 
  Plus, 
  Store, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  Database,
  UsersRound,
  Sparkles,
  Lock,
  Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, page: 'Dashboard', label: 'home' },
  { key: 'cards', icon: CreditCard, page: 'MyCards', label: 'myCards' },
  { key: 'create', icon: Plus, page: 'CardBuilder', label: 'createCard' },
  { key: 'contacts', icon: Users, page: 'MyContacts', label: 'myContacts' },
  { key: 'store', icon: Store, page: 'Store', label: 'store' },
  { key: 'myOrders', icon: Wifi, page: 'MyOrders', label: 'myOrders' },
  { key: 'analytics', icon: BarChart3, page: 'Analytics', label: 'analytics' },
];

const advancedItems = [
  { key: 'team', icon: UsersRound, page: 'TeamManagement', label: 'team', premium: true },
  { key: 'crm', icon: Database, page: 'CRMSettings', label: 'CRM' },
  { key: 'settings', icon: Settings, page: 'Settings', label: 'settings' },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { t, isRTL } = useLanguage();
  const location = useLocation();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me()
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const me = await api.auth.me();
      if (!me?.id && !me?.email) return { plan: 'free', card_limit: 2, status: 'active' };

      const subsByUserId = me?.id
        ? await api.entities.Subscription.filter({ created_by_user_id: me.id }, '-created_at')
        : [];

      if (subsByUserId[0]) return subsByUserId[0];

      const subsByEmail = me?.email
        ? await api.entities.Subscription.filter({ created_by: me.email }, '-created_at')
        : [];

      return subsByEmail[0] || { plan: 'free', card_limit: 2, status: 'active' };
    }
  });

  const isAdmin = user?.role === 'admin';
  const isPremium = subscription?.plan === 'premium';

  const { data: cards = [] } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const me = await api.auth.me();
      return api.entities.BusinessCard.filter({ created_by: me.email });
    }
  });

  const hasNoCards = cards.filter(c => c.status === 'published').length === 0;

  const handleLockedClick = () => {
    toast.error(
      isRTL
        ? 'أنشئ بطاقة واحدة على الأقل لعرض الميزات الأخرى'
        : 'Create at least one card to view other features'
    );
  };

  const isActive = (page) => {
    return location.pathname.includes(page);
  };

  const handleLogout = () => {
    api.auth.logout(createPageUrl('Home'));
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-16 bottom-0 z-40 flex flex-col",
        "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
        "transition-all duration-300 ease-in-out",
        isRTL ? "right-0 border-l" : "left-0 border-r",
        collapsed ? "w-20" : "w-64",
        isOpen ? "translate-x-0" : isRTL ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Nav Items — scrollable so logout is always visible */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {isAdmin && (
            <Link
              to={createPageUrl('Admin')}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "border border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20",
                "hover:shadow-md hover:scale-[1.01]",
                isActive('Admin') && "ring-2 ring-violet-300/70 dark:ring-violet-700/60",
                collapsed && "justify-center px-2"
              )}
            >
              <Shield className={cn("h-5 w-5 flex-shrink-0 text-violet-600 dark:text-violet-400", isActive('Admin') && "text-violet-700 dark:text-violet-300")} />
              {!collapsed && <span className="font-semibold text-violet-700 dark:text-violet-300">{isRTL ? 'لوحة المسؤول' : 'Admin Panel'}</span>}
            </Link>
          )}

          {navItems.map((item) => {
            const targetPage = isAdmin && item.key === 'dashboard' ? 'Admin' : item.page;
            const isLocked = !isAdmin && hasNoCards && !['CardBuilder', 'Store', 'MyOrders'].includes(item.page);
            const itemClass = cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              isLocked
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-slate-100 dark:hover:bg-slate-800",
              !isLocked && isActive(targetPage) && "bg-gradient-to-r from-teal-500/10 to-blue-500/10 text-teal-600 dark:text-teal-400 font-medium",
              collapsed && "justify-center px-2"
            );
            const itemContent = (
              <>
                <item.icon className={cn("h-5 w-5 flex-shrink-0", !isLocked && isActive(targetPage) && "text-teal-600 dark:text-teal-400")} />
                {!collapsed && <span>{t(item.label)}</span>}
                {isLocked && !collapsed && <Lock className="h-3 w-3 ml-auto opacity-60" />}
              </>
            );
            if (isLocked) {
              return (
                <button key={item.key} onClick={handleLockedClick} className={itemClass}>
                  {itemContent}
                </button>
              );
            }
            return (
              <Link
                key={item.key}
                to={createPageUrl(targetPage)}
                onClick={onClose}
                className={itemClass}
              >
                {itemContent}
              </Link>
            );
          })}

          {/* Advanced Section */}
          {!collapsed && (
            <Collapsible open={hasNoCards ? false : advancedOpen} onOpenChange={hasNoCards ? undefined : setAdvancedOpen}>
              <CollapsibleTrigger
                onClick={hasNoCards ? handleLockedClick : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200",
                  hasNoCards
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Sparkles className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-left">{isRTL ? 'متقدم' : 'Advanced'}</span>
                {hasNoCards
                  ? <Lock className="h-3 w-3 opacity-60" />
                  : <ChevronRight className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-90")} />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {advancedItems.map((item) => (
                  <Link
                    key={item.key}
                    to={createPageUrl(item.page)}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200",
                      "hover:bg-slate-100 dark:hover:bg-slate-800",
                      isRTL ? "mr-6" : "ml-6",
                      isActive(item.page) && "bg-gradient-to-r from-teal-500/10 to-blue-500/10 text-teal-600 dark:text-teal-400 font-medium"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive(item.page) && "text-teal-600 dark:text-teal-400")} />
                    <span className="text-sm">{t(item.label)}</span>
                    {item.premium && !isPremium && (
                      <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">PRO</span>
                    )}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {collapsed && advancedItems.map((item) => {
            if (hasNoCards) {
              return (
                <button
                  key={item.key}
                  onClick={handleLockedClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    "opacity-40 cursor-not-allowed justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                </button>
              );
            }
            return (
              <Link
                key={item.key}
                to={createPageUrl(item.page)}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  "hover:bg-slate-100 dark:hover:bg-slate-800",
                  isActive(item.page) && "bg-gradient-to-r from-teal-500/10 to-blue-500/10 text-teal-600 dark:text-teal-400 font-medium",
                  "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive(item.page) && "text-teal-600 dark:text-teal-400")} />
              </Link>
            );
          })}

        </nav>

        {/* Collapse Toggle (Desktop only) */}
        <div className="hidden md:block p-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center"
          >
            {collapsed ? (
              isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl w-full",
              "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{t('logout')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}