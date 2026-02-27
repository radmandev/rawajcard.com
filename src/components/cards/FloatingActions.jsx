import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, QrCode, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { toast } from 'sonner';

// Derive readable foreground color from a hex bg
function contrastColor(hex = '#000000') {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1e293b' : '#ffffff';
}

export default function FloatingActions({ card, isRTL, cardUrl }) {
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const design = card.design || {};
  const primary   = design.primary_color   || '#0D7377';
  const secondary = design.secondary_color || '#14274E';
  const accent    = design.accent_color    || '#00B4D8';

  const settings = card.floating_actions || { save_contact: true, show_qr: true, share_card: true };

  const generateVCard = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${card.name || ''}\nTEL:${card.phone || ''}\nEMAIL:${card.email || ''}\nORG:${card.company || ''}\nTITLE:${card.title || ''}\nURL:${cardUrl}\n${card.location ? `ADR:;;${card.location};;;;` : ''}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${card.name || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(isRTL ? 'تم تحميل جهة الاتصال' : 'Contact downloaded');
  };

  const openQR = async () => {
    const url = await QRCode.toDataURL(cardUrl, {
      width: 300, margin: 2,
      color: {
        dark: card.qr_settings?.dot_color || '#000000',
        light: card.qr_settings?.background_color || '#FFFFFF'
      }
    });
    setQrDataUrl(url);
    setShowQR(true);
  };

  const shareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: card.name, text: `Check out ${card.name}'s digital card`, url: cardUrl });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    navigator.clipboard.writeText(cardUrl);
    toast.success(isRTL ? 'تم نسخ الرابط' : 'Link copied');
  };

  // Shared button style builder
  const btnStyle = (bg) => ({
    background: bg,
    color: contrastColor(bg),
    boxShadow: `0 8px 24px ${bg}55`,
  });

  // Animation variants
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } }
  };
  const item = {
    hidden: { opacity: 0, y: 32, scale: 0.7 },
    show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 380, damping: 22 } }
  };

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-50 flex items-end justify-between px-6 pointer-events-none">

        {/* Left side: QR + Share (or right side for RTL) */}
        <motion.div
          className={`flex gap-2 pointer-events-auto ${isRTL ? 'order-2' : 'order-1'}`}
          variants={container} initial="hidden" animate="show"
        >
          {settings.show_qr && (
            <motion.div variants={item}>
              <button
                onClick={openQR}
                title={isRTL ? 'رمز QR' : 'QR Code'}
                className="flex flex-col items-center gap-1 group"
              >
                <span
                  className="h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 border border-white/20"
                  style={btnStyle(accent)}
                >
                  <QrCode className="h-6 w-6" />
                </span>
                <span className="text-[10px] font-semibold text-white/80 drop-shadow">
                  {isRTL ? 'QR' : 'QR'}
                </span>
              </button>
            </motion.div>
          )}

          {settings.share_card && (
            <motion.div variants={item}>
              <button
                onClick={shareCard}
                title={isRTL ? 'مشاركة' : 'Share'}
                className="flex flex-col items-center gap-1 group"
              >
                <span
                  className="h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 border border-white/20"
                  style={btnStyle(primary)}
                >
                  <Share2 className="h-6 w-6" />
                </span>
                <span className="text-[10px] font-semibold text-white/80 drop-shadow">
                  {isRTL ? 'شارك' : 'Share'}
                </span>
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Right side: Save contact (or left side for RTL) */}
        <motion.div
          className={`pointer-events-auto ${isRTL ? 'order-1' : 'order-2'}`}
          variants={container} initial="hidden" animate="show"
        >
          {settings.save_contact && (
            <motion.div variants={item}>
              <button
                onClick={generateVCard}
                title={isRTL ? 'حفظ جهة الاتصال' : 'Save Contact'}
                className="flex flex-col items-center gap-1 group"
              >
                <span
                  className="h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 border border-white/20"
                  style={btnStyle(secondary)}
                >
                  <Download className="h-6 w-6" />
                </span>
                <span className="text-[10px] font-semibold text-white/80 drop-shadow">
                  {isRTL ? 'حفظ' : 'Save'}
                </span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">{isRTL ? 'رمز QR' : 'QR Code'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrDataUrl && (
              <div className="p-4 bg-white rounded-2xl shadow-lg">
                <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
              </div>
            )}
            <p className="text-sm text-slate-500 text-center px-4">
              {isRTL ? 'امسح هذا الرمز لفتح البطاقة' : 'Scan to open card'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}