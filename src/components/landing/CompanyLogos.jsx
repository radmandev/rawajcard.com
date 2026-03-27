import React, { useState, useEffect } from 'react';

const companies = [
  "Calltower",
  "GE HealthCare",
  "Miele",
  "P&G",
  "Novo Nordisk",
  "Pernod Ricard"
];

const translations = {
  en: {
    text1: "Trusted by ",
    text2: "10k Sales Professionals",
    text3: " Who Hate Manual Follow-Ups"
  },
  ar: {
    text1: "موثوق به من قبل ",
    text2: "10 آلاف محترف مبيعات",
    text3: " الذين يكرهون المتابعات اليدوية"
  }
};

export default function CompanyLogos() {
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
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-slate-500 dark:text-slate-400 mb-10">
          {t.text1}<span className="font-semibold text-slate-700 dark:text-slate-300">{t.text2}</span>{t.text3}
        </p>
        
        <div className="relative overflow-hidden">
          <div className="flex gap-12 items-center justify-center flex-wrap">
            {companies.map((company, index) => (
              <div
                key={index}
                className="text-xl md:text-2xl font-bold text-slate-300 hover:text-slate-400 transition-colors cursor-default"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}