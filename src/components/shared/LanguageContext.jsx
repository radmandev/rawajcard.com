import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    home: "Home",
    myCards: "My Cards",
    createCard: "Create Card",
    myContacts: "My Contacts",
    store: "Store",
    analytics: "Analytics",
    settings: "Settings",
    team: "Team",
    logout: "Logout",
    
    // Dashboard
    dashboard: "Dashboard",
    totalCards: "Total Cards",
    publishedCards: "Published Cards",
    totalViews: "Total Views",
    totalScans: "QR Scans",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",
    
    // Cards
    cards: "Cards",
    newCard: "New Card",
    edit: "Edit",
    delete: "Delete",
    publish: "Publish",
    unpublish: "Unpublish",
    viewCard: "View Card",
    qrCode: "QR Code",
    downloadQR: "Download QR",
    copyLink: "Copy Link",
    linkCopied: "Link copied!",
    draft: "Draft",
    published: "Published",
    noCards: "No cards yet",
    createFirstCard: "Create your first digital card",
    
    // Card Builder
    chooseTemplate: "Choose Template",
    customize: "Customize",
    publishCard: "Publish",
    selectTemplate: "Select a template for your card",
    preview: "Preview",
    next: "Next",
    back: "Back",
    save: "Save",
    saving: "Saving...",
    
    // Personal Info
    personalInfo: "Personal Information",
    name: "Name",
    nameAr: "Name (Arabic)",
    jobTitle: "Job Title",
    jobTitleAr: "Job Title (Arabic)",
    company: "Company",
    companyAr: "Company (Arabic)",
    bio: "Bio",
    bioAr: "Bio (Arabic)",
    email: "Email",
    phone: "Phone",
    whatsapp: "WhatsApp",
    website: "Website",
    location: "Location",
    locationAr: "Location (Arabic)",
    
    // Social Links
    socialLinks: "Social Links",
    
    // Design
    design: "Design",
    primaryColor: "Primary Color",
    secondaryColor: "Secondary Color",
    accentColor: "Accent Color",
    textColor: "Text Color",
    backgroundColor: "Background Color",
    
    // Custom Link
    customLink: "Custom Link",
    yourCardLink: "Your card will be available at:",
    slugPlaceholder: "your-name",
    slugTaken: "This link is already taken",
    slugAvailable: "Link is available!",
    
    // Store
    onlineStore: "Online Store",
    addToCart: "Add to Cart",
    cart: "Cart",
    checkout: "Checkout",
    emptyCart: "Your cart is empty",
    total: "Total",
    continueShopping: "Continue Shopping",
    orderSuccess: "Order Successful!",
    orderConfirmation: "Thank you for your order",
    
    // Analytics
    views: "Views",
    scans: "Scans",
    clicks: "Clicks",
    thisWeek: "This Week",
    thisMonth: "This Month",
    allTime: "All Time",
    
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    search: "Search",
    filter: "Filter",
    all: "All",
    
    // Theme
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    arabic: "العربية",
    english: "English"
  },
  ar: {
    // Navigation
    home: "الرئيسية",
    myCards: "بطاقاتي",
    createCard: "إنشاء بطاقة",
    myContacts: "جهات الاتصال",
    store: "المتجر",
    analytics: "الإحصائيات",
    settings: "الإعدادات",
    team: "الفريق",
    logout: "تسجيل الخروج",
    
    // Dashboard
    dashboard: "لوحة التحكم",
    totalCards: "إجمالي البطاقات",
    publishedCards: "البطاقات المنشورة",
    totalViews: "إجمالي المشاهدات",
    totalScans: "مسح QR",
    recentActivity: "النشاط الأخير",
    quickActions: "إجراءات سريعة",
    
    // Cards
    cards: "البطاقات",
    newCard: "بطاقة جديدة",
    edit: "تعديل",
    delete: "حذف",
    publish: "نشر",
    unpublish: "إلغاء النشر",
    viewCard: "عرض البطاقة",
    qrCode: "رمز QR",
    downloadQR: "تحميل QR",
    copyLink: "نسخ الرابط",
    linkCopied: "تم نسخ الرابط!",
    draft: "مسودة",
    published: "منشورة",
    noCards: "لا توجد بطاقات",
    createFirstCard: "أنشئ بطاقتك الرقمية الأولى",
    
    // Card Builder
    chooseTemplate: "اختر القالب",
    customize: "تخصيص",
    publishCard: "نشر",
    selectTemplate: "اختر قالباً لبطاقتك",
    preview: "معاينة",
    next: "التالي",
    back: "رجوع",
    save: "حفظ",
    saving: "جاري الحفظ...",
    
    // Personal Info
    personalInfo: "المعلومات الشخصية",
    name: "الاسم",
    nameAr: "الاسم (بالعربية)",
    jobTitle: "المسمى الوظيفي",
    jobTitleAr: "المسمى الوظيفي (بالعربية)",
    company: "الشركة",
    companyAr: "الشركة (بالعربية)",
    bio: "نبذة",
    bioAr: "نبذة (بالعربية)",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    whatsapp: "واتساب",
    website: "الموقع الإلكتروني",
    location: "الموقع",
    locationAr: "الموقع (بالعربية)",
    
    // Social Links
    socialLinks: "روابط التواصل الاجتماعي",
    
    // Design
    design: "التصميم",
    primaryColor: "اللون الأساسي",
    secondaryColor: "اللون الثانوي",
    accentColor: "لون التمييز",
    textColor: "لون النص",
    backgroundColor: "لون الخلفية",
    
    // Custom Link
    customLink: "الرابط المخصص",
    yourCardLink: "ستكون بطاقتك متاحة على:",
    slugPlaceholder: "اسمك",
    slugTaken: "هذا الرابط مستخدم مسبقاً",
    slugAvailable: "الرابط متاح!",
    
    // Store
    onlineStore: "المتجر الإلكتروني",
    addToCart: "أضف للسلة",
    cart: "السلة",
    checkout: "الدفع",
    emptyCart: "سلة التسوق فارغة",
    total: "المجموع",
    continueShopping: "متابعة التسوق",
    orderSuccess: "تم الطلب بنجاح!",
    orderConfirmation: "شكراً لطلبك",
    
    // Analytics
    views: "المشاهدات",
    scans: "المسحات",
    clicks: "النقرات",
    thisWeek: "هذا الأسبوع",
    thisMonth: "هذا الشهر",
    allTime: "كل الوقت",
    
    // Common
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجاح",
    cancel: "إلغاء",
    confirm: "تأكيد",
    search: "بحث",
    filter: "تصفية",
    all: "الكل",
    
    // Theme
    lightMode: "الوضع الفاتح",
    darkMode: "الوضع الداكن",
    language: "اللغة",
    arabic: "العربية",
    english: "English"
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rawajcard_lang') || 'ar';
    }
    return 'ar';
  });

  useEffect(() => {
    localStorage.setItem('rawajcard_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;
  const isRTL = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;