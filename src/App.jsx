import React, { Suspense, useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { createPageUrl } from '@/utils';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { UpgradeProvider } from '@/lib/UpgradeContext';
import { LanguageProvider } from '@/components/shared/LanguageContext';
import { ThemeProvider } from '@/components/shared/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Login from '@/pages/Login';
import PublicCard from '@/pages/PublicCard';
import TestLandingPage from '@/pages/TestLanding';
import AlternateLandingPage from '@/pages/AlternateLanding';
import { supabase } from '@/lib/supabaseClient';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          <div className="max-w-lg text-center space-y-3">
            <h1 className="text-2xl font-semibold">App error</h1>
            <p className="text-sm text-slate-400">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;
const ProductDetailPage = Pages.ProductDetail;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const TrackQRScanRedirect = () => {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const params = new URLSearchParams(search);
  const slug = params.get('slug');

  if (typeof window !== 'undefined') {
    if (slug) {
      window.location.replace(`/c/${encodeURIComponent(slug)}?source=qr`);
    } else {
      window.location.replace('/');
    }
  }

  return null;
};

const QRCardRedirect = () => {
  const { pathname } = useLocation();
  const cardId = (pathname.split('/q/')[1] || '').split('?')[0];
  const [state, setState] = useState('loading');

  useEffect(() => {
    const run = async () => {
      try {
        const cleanId = decodeURIComponent(cardId || '').trim();
        if (!cleanId) {
          setState('not_found');
          return;
        }

        const visitorKey = 'rawajcard_visitor_id';
        let visitorId = localStorage.getItem(visitorKey);
        if (!visitorId) {
          visitorId = 'v_' + Math.random().toString(36).slice(2, 11);
          localStorage.setItem(visitorKey, visitorId);
        }

        const { data: card, error: cardError } = await supabase
          .from('business_cards')
          .select('id, slug, status')
          .eq('id', cleanId)
          .eq('status', 'published')
          .maybeSingle();

        if (cardError || !card?.slug) {
          setState('not_found');
          return;
        }

        await supabase.rpc('track_qr_scan', {
          p_card_id: card.id,
          p_visitor_id: visitorId,
          p_user_agent: navigator.userAgent,
          p_referrer: document.referrer || ''
        });

        const target = `/c/${encodeURIComponent(card.slug)}?source=qr&trk=1`;
        window.location.replace(target);
      } catch {
        setState('not_found');
      }
    };

    run();
  }, [cardId]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return <PageNotFound />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isPublicRoute = [
    '/', '/login', '/Pricing', '/Products', '/ProductDetail', '/Store', '/TestLanding', '/NFC', '/Checkout', '/CheckoutSuccess', '/Demo3D', '/MyOrders', '/PhysicalCards', '/CardSamples', '/HeaderVariants',
    '/Return', '/PrivacyPolicy', '/Payments', '/returns', '/privacy-policy', '/payments', '/trackQRScan'
  ].includes(location.pathname) || location.pathname.startsWith('/c/') || location.pathname.startsWith('/q/') || location.pathname.startsWith('/products/');

  // Show loading spinner while checking app public settings or auth (skip for public routes)
  if (!isPublicRoute && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError?.type === 'config') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-semibold">Supabase not configured</h1>
          <p className="text-sm text-slate-400">
            Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.
          </p>
        </div>
      </div>
    );
  }

  if (authError && !isPublicRoute) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      return <Navigate to="/" replace />;
    }
  }

  if (!isPublicRoute && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render the main app
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    }>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/c/:slug" element={<PublicCard />} />
        <Route path="/q/:cardId" element={<QRCardRedirect />} />
        <Route path="/trackQRScan" element={<TrackQRScanRedirect />} />
        {ProductDetailPage && (
          <Route
            path="/products/:slug"
            element={
              <LayoutWrapper currentPageName="ProductDetail">
                <ProductDetailPage />
              </LayoutWrapper>
            }
          />
        )}
        <Route path="/" element={
          <LayoutWrapper currentPageName="TestLanding">
            <TestLandingPage />
          </LayoutWrapper>
        } />
        <Route path="/NFC" element={
          <AlternateLandingPage />
        } />
        <Route path="/AlternateLanding" element={<Navigate to="/NFC" replace />} />
        <Route path="/Home" element={<Navigate to="/" replace />} />
        <Route path="/PhysicalCards" element={<Navigate to={createPageUrl('MyOrders')} replace />} />
        <Route path="/returns" element={<Navigate to={createPageUrl('Return')} replace />} />
        <Route path="/privacy-policy" element={<Navigate to={createPageUrl('PrivacyPolicy')} replace />} />
        <Route path="/payments" element={<Navigate to={createPageUrl('Payments')} replace />} />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
              <Router>
                <CartProvider>
                  <UpgradeProvider>
                    <NavigationTracker />
                    <AuthenticatedApp />
                  </UpgradeProvider>
                </CartProvider>
              </Router>
              <Toaster />
              <SonnerToaster position="top-center" richColors />
            </QueryClientProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  )
}

export default App
