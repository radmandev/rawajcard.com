import React, { useState, useEffect } from 'react';
import { Smartphone, User, Bell, BarChart3 } from 'lucide-react';

const translations = {
  en: {
    subtitle: "Get Started",
    title: "4 Steps to Closing More Deals with Rawajcard",
    stepLabel: "Step",
    steps: [
      {
        step: 1,
        title: "Tap to Capture",
        description: "One tap, all contact info saved.\nNo lost leads.",
        icon: Smartphone,
        gradient: "from-teal-400 to-teal-600",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F5a691cb06c0b6d3cc6be4afa8937a8ef1bbc97553b9592c8881f6e5802a9342f.png&w=3840&q=75"
      },
      {
        step: 2,
        title: "Profile That Sells",
        description: "Your digital card,\nplus a full pitch-ready profile.",
        icon: User,
        gradient: "from-blue-400 to-blue-600",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2Fbce1f6e61ca1f094458b490c1fb231ceff89da72a54090055e47e12dad80e128.png&w=3840&q=75"
      },
      {
        step: 3,
        title: "Follow-Up In Seconds",
        description: "Auto-reminders + CRM sync\n= zero delays.",
        icon: Bell,
        gradient: "from-purple-400 to-purple-600",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2Fcc1ce31656c7f301c51c2f1cf056544f2777156046e8924e1b88c1d8da6ee622.png&w=3840&q=75"
      },
      {
        step: 4,
        title: "Track What Works",
        description: "Analytics on who viewed,\nclicked, and converted.",
        icon: BarChart3,
        gradient: "from-orange-400 to-orange-600",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F6cbc680ac33fdcf5b7ccaa1ab66135c99aefb7b8c2b34b6a17fd4df58ffa11a3.png&w=3840&q=75"
      }
    ]
  },
  ar: {
    subtitle: "ابدأ",
    title: "4 خطوات لإغلاق المزيد من الصفقات مع روائج كارد",
    stepLabel: "الخطوة",
    steps: [
      {
        step: 1,
        title: "اضغط للالتقاط",
        description: "نقرة واحدة، جميع معلومات الاتصال محفوظة.\nلا عملاء محتملين ضائعين.",
        icon: Smartphone,
        gradient: "from-teal-400 to-teal-600",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F5a691cb06c0b6d3cc6be4afa8937a8ef1bbc97553b9592c8881f6e5802a9342f.png&w=3840&q=75"
      },
      {
        step: 2,
        title: "ملف شخصي يبيع",
        description: "بطاقتك الرقمية،\nبالإضافة إلى ملف شخصي جاهز للعرض.",
        icon: User,
        gradient: "from-blue-400 to-blue-600",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2Fbce1f6e61ca1f094458b490c1fb231ceff89da72a54090055e47e12dad80e128.png&w=3840&q=75"
      },
      {
        step: 3,
        title: "متابعة في ثوانٍ",
        description: "تذكيرات تلقائية + مزامنة CRM\n= صفر تأخير.",
        icon: Bell,
        gradient: "from-purple-400 to-purple-600",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2Fcc1ce31656c7f301c51c2f1cf056544f2777156046e8924e1b88c1d8da6ee622.png&w=3840&q=75"
      },
      {
        step: 4,
        title: "تتبع ما يعمل",
        description: "تحليلات حول من شاهد،\nنقر، وتحول.",
        icon: BarChart3,
        gradient: "from-orange-400 to-orange-600",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F6cbc680ac33fdcf5b7ccaa1ab66135c99aefb7b8c2b34b6a17fd4df58ffa11a3.png&w=3840&q=75"
      }
    ]
  }
};

export default function StepsSection() {
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
  const steps = t.steps;

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-4">
          <span className="text-teal-600 dark:text-teal-400 text-sm font-semibold tracking-wider uppercase">{t.subtitle}</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center mb-16">
          {t.title}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative group">
              {/* Step number badge */}
              <div className="absolute -top-3 left-6 z-10">
                <span className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-full">
                  {t.stepLabel} {item.step}
                </span>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 pt-8 h-full hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 group-hover:border-slate-200 dark:group-hover:border-slate-600">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{item.description}</p>
                
                {/* Image preview */}
                <div className="mt-6 relative">
                  <div className="w-full aspect-[3/4] bg-white dark:bg-slate-900 rounded-xl shadow-inner overflow-hidden border border-slate-100 dark:border-slate-700">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}