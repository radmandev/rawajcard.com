import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, Settings, Share2, BarChart3 } from 'lucide-react';
import { normalizeImageUrl } from '@/lib/normalizeImageUrl';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoginModal from '@/components/auth/LoginModal';

const translations = {
  en: {
    subtitle: "Get Started",
    title: "4 Simple Steps to Share Your Info Instantly",
    steps: [
      {
        step: 1,
        title: "Order Your Card",
        description: "Choose your favorite design. Customize it with your logo, colors, and personal branding.",
        icon: CreditCard,
        cta: "Get Yours Now",
        image: "https://rawajcard.com/rawajcard-items.png"
      },
      {
        step: 2,
        title: "Set Up Your Profile",
        description: "Use our free Rawajcard platform to add your contact info, links, and pitch. Soon (available as mobile app).",
        icon: Settings,
        cta: "Get Started",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F8a488a50cf0dba91666dac8c51a3c192c04b0744c6c07f7a4d2e5ff28a014b45.png&w=1080&q=75"
      },
      {
        step: 3,
        title: "Tap & Connect",
        description: "Tap your card or share your QR code to exchange info instantly.",
        icon: Share2,
        cta: "Learn More",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2Ffca7157bef72e4e06f8503640abe6bde1f713c935168095202867d635f7725a5.png&w=3840&q=75"
      },
      {
        step: 4,
        title: "Track What Works",
        description: "Analytics on who viewed, clicked, and converted.",
        icon: BarChart3,
        cta: "View Analytics",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F6cbc680ac33fdcf5b7ccaa1ab66135c99aefb7b8c2b34b6a17fd4df58ffa11a3.png&w=3840&q=75"
      }
    ]
  },
  ar: {
    subtitle: "ابدأ",
    title: "4 خطوات بسيطة لمشاركة معلوماتك فوراً",
    steps: [
      {
        step: 1,
        title: "اطلب بطاقتك",
        description: "اختر تصميمك المفضل. خصصه بشعارك وألوانك وعلامتك التجارية الشخصية.",
        icon: CreditCard,
        cta: "احصل عليها الآن",
        image: "https://rawajcard.com/rawajcard-items.png"
      },
      {
        step: 2,
        title: "أعد ملفك الشخصي",
        description: "استخدم منصة روائج كارد المجانية لإضافة معلومات الاتصال والروابط والعرض التقديمي. قريباً (متاح كتطبيق جوال).",
        icon: Settings,
        cta: "ابدأ الآن",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F8a488a50cf0dba91666dac8c51a3c192c04b0744c6c07f7a4d2e5ff28a014b45.png&w=1080&q=75"
      },
      {
        step: 3,
        title: "اضغط واتصل",
        description: "اضغط على بطاقتك أو شارك رمز QR لتبادل المعلومات فوراً.",
        icon: Share2,
        cta: "تعلم المزيد",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2Ffca7157bef72e4e06f8503640abe6bde1f713c935168095202867d635f7725a5.png&w=3840&q=75"
      },
      {
        step: 4,
        title: "تتبّع ما يُجدي",
        description: "تحليلات حول من شاهد البطاقة، ونقر عليها، وتحوّل إلى عميل.",
        icon: BarChart3,
        cta: "عرض التحليلات",
        image: "https://tapni.com/_next/image?url=https%3A%2F%2Fcdn.tapni.co%2Fcompany-media%2Fe411a6e5-e8c1-40b3-aa4c-1214cfb43e8a%2Fgallery%2Fimage%2F6cbc680ac33fdcf5b7ccaa1ab66135c99aefb7b8c2b34b6a17fd4df58ffa11a3.png&w=3840&q=75"
      }
    ]
  }
};

export default function GetStartedSteps() {
  const [language, setLanguage] = useState('ar');
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleStepAction = (stepNumber) => {
    if (stepNumber === 1) {
      navigate(createPageUrl('Products'));
      return;
    }

    if (stepNumber === 2) {
      setLoginOpen(true);
    }
  };

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-800">
      <div className="container mx-auto px-4 md:px-6">
        <span className="text-teal-600 dark:text-teal-400 text-sm font-semibold tracking-wider uppercase mb-4 block text-center">
          {t.subtitle}
        </span>
        
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center mb-16">
          {t.title}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-teal-200 to-transparent -translate-x-1/2 z-0" />
              )}
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg shadow-slate-100 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 relative z-10 h-full">
                {/* Step badge */}
                <div className="absolute -top-4 left-8">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-teal-600 to-blue-500 text-white text-sm font-bold rounded-full">
                    {item.step}
                  </span>
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 flex items-center justify-center mb-6 mt-4">
                  <item.icon className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{item.description}</p>
                
                {/* Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl mb-6 overflow-hidden">
                  <img src={normalizeImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleStepAction(item.step)}
                  className="w-full rounded-full border-2 hover:bg-teal-600 hover:border-teal-600 hover:text-white"
                >
                  {item.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </section>
  );
}