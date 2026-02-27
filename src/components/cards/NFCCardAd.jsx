import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Button } from '@/components/ui/button';
import { Gem, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';

export default function NFCCardAd({ cardName, cardUrl }) {
  const { isRTL } = useLanguage();
  const [qrCodeUrl, setQrCodeUrl] = React.useState('');

  React.useEffect(() => {
    if (cardUrl) {
      QRCode.toDataURL(cardUrl, { width: 240, margin: 1 }).then(setQrCodeUrl);
    }
  }, [cardUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50"
    >
      {/* Subtle shimmer overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.4) 45%, transparent 55%)' }} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2 rounded-xl bg-slate-700/60 border border-slate-500/40">
            <Gem className="h-5 w-5 text-slate-200" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-0.5">
              {isRTL ? '✦ خصم خاص على البطاقة المعدنية' : '✦ Special Offer — Metal Card'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRTL
                ? 'بطاقة معدنية فاخرة بتشطيب مصقول مع اسمك ورمز QR'
                : 'Premium brushed-metal card engraved with your name & QR code'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ── Metal Card Visual ── */}
          <div className="relative">
            <div
              className="aspect-[1.586/1] rounded-xl shadow-2xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #64748b 0%, #334155 30%, #1e293b 55%, #475569 80%, #94a3b8 100%)',
              }}
            >
              {/* Brushed-metal grain */}
              <div className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)' }} />
              {/* Diagonal shine */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0) 60%)' }} />

              {/* Card content */}
              <div className="relative h-full flex flex-col justify-between p-4">
                {/* Top: brand + name */}
                <div>
                  <p className="text-slate-300/70 text-[9px] tracking-[0.25em] font-semibold uppercase mb-2">
                    RAWAJCARD
                  </p>
                  {/* Beautiful styled name */}
                  <p
                    className="font-black tracking-widest uppercase leading-tight"
                    style={{
                      fontSize: 'clamp(13px, 3.5vw, 18px)',
                      background: 'linear-gradient(135deg, #e2e8f0, #94a3b8, #f1f5f9)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: 'none',
                      maxWidth: '65%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {cardName || (isRTL ? 'اسمك هنا' : 'YOUR NAME')}
                  </p>
                </div>

                {/* Bottom: chip left, QR right */}
                <div className="flex items-end justify-between">
                  {/* Metal chip */}
                  <div className="w-9 h-7 rounded-md border border-slate-400/40 flex items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b, #94a3b8)' }}>
                    <div className="w-full h-px bg-slate-400/50" />
                  </div>

                  {/* QR code */}
                  {qrCodeUrl && (
                    <div className="p-1.5 rounded-lg bg-white/95 shadow-inner">
                      <img src={qrCodeUrl} alt="QR" className="w-16 h-16 block" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Discount badge */}
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg ring-2 ring-slate-900">
              {isRTL ? 'خصم 23%' : '23% OFF'}
            </div>
          </div>

          {/* ── Features & CTA ── */}
          <div className="flex flex-col justify-between">
            <div className="space-y-2.5 mb-4">
              {[
                isRTL ? '🔩 تشطيب معدني مصقول فاخر' : '🔩 Premium brushed-metal finish',
                isRTL ? '📱 مرتبطة ببطاقتك الرقمية' : '📱 Linked to your digital card',
                isRTL ? '✍️ اسمك ورمز QR محفور' : '✍️ Name & QR code engraved',
                isRTL ? '🚀 شحن سريع مجاناً' : '🚀 Fast free shipping',
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                  <span className="text-slate-300">{feat}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {isRTL ? '١٠٠ ر.س' : '100 SAR'}
                </span>
                <span className="text-base text-slate-500 line-through">
                  {isRTL ? '١٣٠ ر.س' : '130 SAR'}
                </span>
              </div>

              <Link to={createPageUrl('Store')}>
                <Button className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white shadow-lg border border-slate-400/30">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {isRTL ? 'اطلب بطاقتك المعدنية' : 'Order Your Metal Card'}
                  {!isRTL && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </Link>

              <p className="text-[11px] text-center text-slate-500">
                {isRTL ? 'عرض محدود • كميات محدودة' : 'Limited offer • While stocks last'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}