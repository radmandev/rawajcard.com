import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Button } from '@/components/ui/button';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';

export default function NFCCardAd({ cardName, cardUrl }) {
  const { isRTL } = useLanguage();
  const [qrCodeUrl, setQrCodeUrl] = React.useState('');

  React.useEffect(() => {
    if (cardUrl) {
      QRCode.toDataURL(cardUrl, { width: 200 }).then(setQrCodeUrl);
    }
  }, [cardUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-800"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-200/30 to-transparent rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-200/30 to-transparent rounded-full -ml-24 -mb-24" />

      <div className="relative p-8">
        <div className="flex items-start gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-amber-600" />
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {isRTL ? '🎉 خصم خاص على بطاقة NFC' : '🎉 Special Offer on NFC Cards'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isRTL 
                ? 'احصل على بطاقة NFC ذهبية فاخرة مع اسمك ورمز QR'
                : 'Get a premium golden NFC card with your name and QR code'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Preview */}
          <div className="relative">
            <div className="aspect-[1.586/1] bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-xl shadow-2xl p-6 relative overflow-hidden">
              {/* Golden texture overlay */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, transparent 0%, rgba(0,0,0,0.1) 100%)',
              }} />
              
              {/* Card Content */}
              <div className="relative h-full flex flex-col justify-between">
                <div>
                  <div className="text-white/80 text-xs font-semibold mb-1">
                    RAWAJCARD
                  </div>
                  <div className="text-white text-xl font-bold">
                    {cardName || (isRTL ? 'اسمك هنا' : 'Your Name')}
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className="self-end">
                    <div className="bg-white p-2 rounded-lg">
                      <img src={qrCodeUrl} alt="QR" className="w-16 h-16" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chip */}
              <div className="absolute bottom-6 left-6 w-10 h-8 bg-gradient-to-br from-yellow-200 to-amber-300 rounded opacity-60" />
            </div>

            <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {isRTL ? 'خصم 30%' : '30% OFF'}
            </div>
          </div>

          {/* Features & CTA */}
          <div className="flex flex-col justify-between">
            <div className="space-y-3 mb-6">
              {[
                isRTL ? '✨ تصميم ذهبي فاخر' : '✨ Premium golden design',
                isRTL ? '📱 مدمج مع بطاقتك الرقمية' : '📱 Linked to your digital card',
                isRTL ? '🎨 اسمك ورمز QR مطبوع' : '🎨 Your name & QR code printed',
                isRTL ? '🚀 شحن مجاني' : '🚀 Free shipping'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                  <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {isRTL ? '٣٥ ر.س' : '35 SAR'}
                </span>
                <span className="text-lg text-slate-500 line-through">
                  {isRTL ? '٦٠ ر.س' : '60 SAR'}
                </span>
              </div>

              <Link to={createPageUrl('Store')}>
                <Button className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-lg">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {isRTL ? 'اطلب بطاقتك الآن' : 'Order Your Card Now'}
                  {isRTL ? null : <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </Link>

              <p className="text-xs text-center text-slate-500">
                {isRTL 
                  ? 'عرض محدود • متاح لفترة قصيرة'
                  : 'Limited offer • Available for a short time'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}