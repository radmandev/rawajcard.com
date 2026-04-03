/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
    "Home": Home,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "TestLanding",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import { lazy } from 'react';
import __Layout from './Layout.jsx';

const Admin           = lazy(() => import('./pages/Admin'));
const Analytics       = lazy(() => import('./pages/Analytics'));
const CRMSettings     = lazy(() => import('./pages/CRMSettings'));
const CardBuilder     = lazy(() => import('./pages/CardBuilder'));
const Checkout        = lazy(() => import('./pages/Checkout'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const ClientDetails   = lazy(() => import('./pages/ClientDetails'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const Login           = lazy(() => import('./pages/Login'));
const MyCards         = lazy(() => import('./pages/MyCards'));
const MyContacts      = lazy(() => import('./pages/MyContacts'));
const Pricing         = lazy(() => import('./pages/Pricing'));
const ProductDetail   = lazy(() => import('./pages/ProductDetail'));
const Products        = lazy(() => import('./pages/Products'));
const PublicCard      = lazy(() => import('./pages/PublicCard'));
const Settings        = lazy(() => import('./pages/Settings'));
const Store           = lazy(() => import('./pages/Store'));
const TeamManagement  = lazy(() => import('./pages/TeamManagement'));
const TemplateAnalytics = lazy(() => import('./pages/TemplateAnalytics'));
const TemplateEditor  = lazy(() => import('./pages/TemplateEditor'));
const Upgrade         = lazy(() => import('./pages/Upgrade'));
const TestLanding     = lazy(() => import('./pages/TestLanding'));
const Demo3D          = lazy(() => import('./pages/Demo3D'));
const MyOrders        = lazy(() => import('./pages/MyOrders'));
const PhysicalCards   = lazy(() => import('./pages/PhysicalCards'));


export const PAGES = {
    "Admin": Admin,
    "Analytics": Analytics,
    "CRMSettings": CRMSettings,
    "CardBuilder": CardBuilder,
    "Checkout": Checkout,
    "CheckoutSuccess": CheckoutSuccess,
    "ClientDetails": ClientDetails,
    "Dashboard": Dashboard,
    "Login": Login,
    "MyCards": MyCards,
    "MyContacts": MyContacts,
    "Pricing": Pricing,
    "ProductDetail": ProductDetail,
    "Products": Products,
    "PublicCard": PublicCard,
    "Settings": Settings,
    "Store": Store,
    "TeamManagement": TeamManagement,
    "TemplateAnalytics": TemplateAnalytics,
    "TemplateEditor": TemplateEditor,
    "Upgrade": Upgrade,
    "TestLanding": TestLanding,
    "Demo3D": Demo3D,
    "MyOrders": MyOrders,
    "PhysicalCards": PhysicalCards,
}

export const pagesConfig = {
    mainPage: "TestLanding",
    Pages: PAGES,
    Layout: __Layout,
};