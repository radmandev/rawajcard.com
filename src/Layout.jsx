import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LanguageProvider, useLanguage } from '@/components/shared/LanguageContext';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import MobileBottomNav from '@/components/shared/MobileBottomNav';
import PublicMobileBar from '@/components/shared/PublicMobileBar';
import CartSidebar from '@/components/store/CartSidebar';
import CartMiniPopup from '@/components/store/CartMiniPopup';
import { useCart } from '@/contexts/CartContext';
import WhatsAppButton from '@/components/shared/WhatsAppButton';

function LayoutContent({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isRTL } = useLanguage();

  // Public pages that don't need sidebar
  const publicPages = ['PublicCard', 'CheckoutSuccess', 'Home', 'Products', 'ProductDetail', 'Pricing', 'TestLanding', 'Store', 'Checkout', 'Demo3D', 'PhysicalCards'];
  const isPublicPage = publicPages.includes(currentPageName);



  // Cart state from global context (localStorage – works for auth & guest)
  const { items: cartItems, removeItem, updateQuantity, isCartOpen, setIsCartOpen, totalCount } = useCart();

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950" style={{ overscrollBehavior: 'none' }}>
        {children}
        <PublicMobileBar />
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemove={removeItem}
        />
        <CartMiniPopup />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-slate-50 dark:bg-slate-950", isRTL && "rtl")} style={{ overscrollBehavior: 'none' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap');
        
        :root {
          --color-primary: #0D7377;
          --color-secondary: #14274E;
          --color-accent: #00B4D8;
        }
        
        body {
          font-family: ${isRTL ? "'Tajawal', sans-serif" : "'Inter', sans-serif"};
          overscroll-behavior: none;
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        .rtl {
          direction: rtl;
        }
        
        .ltr {
          direction: ltr;
        }

        /* Disable text selection on buttons and icons */
        button, a, .cursor-pointer, svg, [role="button"] {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 3px;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>

      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        cartCount={totalCount}
      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={cn(
        "pt-16 min-h-screen transition-all duration-300 pb-20 md:pb-0",
        isRTL 
          ? sidebarCollapsed ? "md:mr-20" : "md:mr-64"
          : sidebarCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      <MobileBottomNav />
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />
      <CartMiniPopup />
      <WhatsAppButton />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LayoutContent currentPageName={currentPageName}>
      {children}
    </LayoutContent>
  );
}