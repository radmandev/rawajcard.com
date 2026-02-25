import React, { useState, useEffect } from 'react';
import { Smartphone, User, RefreshCw } from 'lucide-react';

const translations = {
  en: {
    subtitle: "Smart NFC Cards Built for Sales Pros Who Close",
    title: "Share Your Contact Info, Socials & Pitch In One Tap",
    description: "Make a killer first impression. Never lose a lead again.",
    features: [
      {
        icon: Smartphone,
        title: "No Apps Needed",
        description: "Just tap or scan.",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F21c2f084c76cf597bd9916487d200021206c3749a79f09545c05944bf3054c6f.png&w=1080&q=75"
      },
      {
        icon: User,
        title: "Personalized Profiles",
        description: "Showcase your brand, pitch, links & calendar.",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2Ff1e2210806151f8afaff9ec9637d3bb4a84e83bbdc7d2a990e832f26c7f76c38.png&w=1080&q=75"
      },
      {
        icon: RefreshCw,
        title: "Always Up-to-Date",
        description: "Change info anytime—no reprints.",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F9416632308b231e7a9fb4d57b7628ff4690131c4317fc5ce534fc82a39dcdeae.png&w=1080&q=75"
      }
    ]
  },
  ar: {
    subtitle: "بطاقات NFC الذكية المصممة لمحترفي المبيعات الذين يغلقون",
    title: "شارك معلومات الاتصال والحسابات الاجتماعية والعرض التقديمي بنقرة واحدة",
    description: "اترك انطباعاً أولياً رائعاً. لا تفقد عميلاً محتملاً مرة أخرى.",
    features: [
      {
        icon: Smartphone,
        title: "لا حاجة للتطبيقات",
        description: "فقط اضغط أو امسح.",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F21c2f084c76cf597bd9916487d200021206c3749a79f09545c05944bf3054c6f.png&w=1080&q=75"
      },
      {
        icon: User,
        title: "ملفات شخصية مخصصة",
        description: "اعرض علامتك التجارية وعرضك التقديمي وروابطك وتقويمك.",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2Ff1e2210806151f8afaff9ec9637d3bb4a84e83bbdc7d2a990e832f26c7f76c38.png&w=1080&q=75"
      },
      {
        icon: RefreshCw,
        title: "محدثة دائماً",
        description: "غيّر المعلومات في أي وقت - لا إعادة طباعة.",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F9416632308b231e7a9fb4d57b7628ff4690131c4317fc5ce534fc82a39dcdeae.png&w=1080&q=75"
      }
    ]
  }
};

export default function NFCCardsSection() {
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
    <section className="py-20 bg-gradient-to-br from-teal-900 via-slate-900 to-blue-900 dark:from-black dark:via-slate-950 dark:to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-4">
          <span className="text-teal-400 dark:text-teal-300 text-sm font-semibold tracking-wider uppercase">
            {t.subtitle}
            </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          {t.title}
          </h2>

          <p className="text-slate-400 dark:text-slate-500 text-center text-lg mb-16">
          {t.description}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
          {t.features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 h-full border border-white/10 dark:border-white/5 hover:border-white/20 dark:hover:border-white/10 transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5">
                {/* Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-white/10 rounded-xl mb-6 overflow-hidden">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 dark:text-slate-500">{feature.description}</p>
                </div>
                </div>
                ))}
        </div>
      </div>
    </section>
  );
}