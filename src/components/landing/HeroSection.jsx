import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Linkedin, MessageCircle, Mail, Calendar } from 'lucide-react';

const translations = {
  en: {
    badge1: "Digital Business Cards",
    badge2: " Built for ",
    badge3: "Sales Pros",
    title: "Never Lose a Lead Again",
    description1: "Capture contacts instantly. Sync to your CRM. Follow up 10x faster.",
    description2: "Rawajcard helps you turn real-life meetings into real revenue.",
    cta: "Start Closing Smarter",
    featuredProductsLabel: "Featured NFC Products",
    featuredProducts: [
      "Digital NFC Metal Card",
      "Digital NFC Wooden Card",
      "NFC Key Chain",
      "NFC Table Stand"
    ],
    profileName: "Ahmed Al-Shamri",
    profileTitle: "CEO @ Rawaj Business Solutions",
    profileStatus: "Let's connect!",
    saveContact: "Save Contact",
    shareProfile: "Share Profile"
  },
  ar: {
    badge1: "بطاقات الأعمال الرقمية",
    badge2: " مصممة لـ ",
    badge3: "محترفي المبيعات",
    title: "لا تفقد عميلاً محتملاً مرة أخرى",
    description1: "التقط جهات الاتصال فوراً. مزامنة مع نظام إدارة علاقات العملاء. متابعة أسرع بـ 10 مرات.",
    description2: "يساعدك روائج كارد على تحويل اللقاءات الحقيقية إلى إيرادات حقيقية.",
    cta: "ابدأ الإغلاق بذكاء",
    featuredProductsLabel: "منتجات NFC المميزة",
    featuredProducts: [
      "البطاقة المعدنية الرقمية NFC",
      "البطاقة الخشبية الرقمية NFC",
      "ميدالية مفاتيح NFC",
      "ستاند طاولة NFC"
    ],
    profileName: "أحمد الشمري",
    profileTitle: "الرئيس التنفيذي @ روائج للحلول التقنية",
    profileStatus: "لنتواصل!",
    saveContact: "حفظ جهة الاتصال",
    shareProfile: "مشاركة الملف الشخصي"
  }
};

export default function HeroSection() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const dir = document.documentElement.getAttribute('dir');
    setLanguage(dir === 'rtl' ? 'ar' : 'en');

    const observer = new MutationObserver(() => {
      const currentDir = document.documentElement.getAttribute('dir');
      setLanguage(currentDir === 'rtl' ? 'ar' : 'en');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir']
    });

    return () => observer.disconnect();
  }, []);

  const t = translations[language];

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white dark:bg-slate-900">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-teal-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-xl">
            <span className="inline-block text-sm font-semibold tracking-wider uppercase mb-4">
              <span className="text-teal-600 dark:text-teal-400">{t.badge1}</span>
              <span className="text-slate-400 dark:text-slate-500">{t.badge2}</span>
              <span className="text-blue-500 dark:text-blue-400">{t.badge3}</span>
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
              {t.title}
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              {t.description1}
              <br />
              {t.description2}
            </p>
            
            <div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-teal-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30"
              >
                {t.cta}
              </Button>
            </div>
            
            {/* Featured products */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                {t.featuredProductsLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {t.featuredProducts.map((product) => (
                  <span
                    key={product}
                    className="inline-flex items-center rounded-full bg-teal-50 dark:bg-slate-800 text-teal-700 dark:text-teal-300 px-3 py-1.5 text-sm border border-teal-100 dark:border-slate-700"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Content - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Floating cards decoration */}
            <div className="absolute -top-8 -right-4 md:right-8 w-48 h-32 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-2xl shadow-2xl transform rotate-12 z-10">
              <div className="p-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg mb-2" />
                <div className="h-2 w-24 bg-slate-700 rounded" />
                <div className="h-2 w-16 bg-slate-700 rounded mt-2" />
              </div>
            </div>
            
            {/* Main phone mockup */}
            <div className="relative">
              <div className="relative z-20">
                <div className="w-64 md:w-80 h-[500px] md:h-[580px] bg-slate-900 dark:bg-slate-700 rounded-[3rem] p-3 shadow-2xl shadow-slate-900/30 dark:shadow-black/50">
                  <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden relative">
                    {/* Phone notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-10" />
                    
                    {/* Phone content */}
                    <div className="pt-10 px-4 pb-4 h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                      <div className="flex flex-col items-center pt-6">
                        {/* Profile image */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 p-1 mb-4">
                          <div className="w-full h-full rounded-full bg-slate-200" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.profileName}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t.profileTitle}</p>
                        <span className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
                          <span className="w-2 h-2 bg-teal-500 rounded-full" />
                          {t.profileStatus}
                        </span>
                        
                        {/* Social icons */}
                        <div className="flex gap-3 mt-6">
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                            <Linkedin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center hover:bg-green-50 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                            <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                            <Mail className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center hover:bg-teal-50 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                            <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="w-full mt-6 space-y-3">
                          <div className="w-full h-12 bg-gradient-to-r from-teal-600 to-blue-500 dark:from-teal-600 dark:to-blue-600 rounded-xl" />
                          <div className="w-full h-12 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -left-8 w-40 h-28 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 z-30">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500" />
                  <div>
                    <div className="h-2 w-20 bg-slate-200 dark:bg-slate-600 rounded" />
                    <div className="h-2 w-14 bg-slate-100 dark:bg-slate-700 rounded mt-1" />
                  </div>
                </div>
                <div className="mt-3 flex gap-1">
                  <div className="flex-1 h-8 bg-teal-500 dark:bg-teal-600 rounded-lg" />
                  <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}