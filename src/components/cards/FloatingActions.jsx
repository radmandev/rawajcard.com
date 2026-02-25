import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, QrCode, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { toast } from 'sonner';

export default function FloatingActions({ card, isRTL, cardUrl }) {
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const design = card.design || {};
  const primaryColor = design.primary_color || '#0D7377';
  const accentColor = design.accent_color || '#00B4D8';

  const settings = card.floating_actions || {
    save_contact: true,
    show_qr: true,
    share_card: true
  };

  const actions = [];

  // Save Contact
  if (settings.save_contact) {
    actions.push({
      icon: Download,
      label: isRTL ? 'حفظ' : 'Save',
      onClick: () => generateVCard(),
    });
  }

  // Show QR
  if (settings.show_qr) {
    actions.push({
      icon: QrCode,
      label: isRTL ? 'QR' : 'QR',
      onClick: async () => {
        const url = await QRCode.toDataURL(cardUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: card.qr_settings?.dot_color || '#000000',
            light: card.qr_settings?.background_color || '#FFFFFF'
          }
        });
        setQrDataUrl(url);
        setShowQR(true);
      },
    });
  }

  // Share Card
  if (settings.share_card) {
    actions.push({
      icon: Share2,
      label: isRTL ? 'مشاركة' : 'Share',
      onClick: () => shareCard(),
    });
  }

  const generateVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${card.name || ''}
TEL:${card.phone || ''}
EMAIL:${card.email || ''}
ORG:${card.company || ''}
TITLE:${card.title || ''}
URL:${cardUrl}
${card.location ? `ADR:;;${card.location};;;;` : ''}
END:VCARD`;

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

  const shareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.name,
          text: `Check out ${card.name}'s digital card`,
          url: cardUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    navigator.clipboard.writeText(cardUrl);
    toast.success(isRTL ? 'تم نسخ الرابط' : 'Link copied to clipboard');
  };

  if (actions.length === 0) return null;

  return (
    <>
      <div className={`fixed bottom-6 z-50 flex flex-col gap-2 ${isRTL ? 'left-6' : 'right-6'}`}>
        <AnimatePresence>
          {isOpen && actions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: isRTL ? -20 : 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isRTL ? -20 : 20, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                onClick={action.onClick}
                className="text-white shadow-lg backdrop-blur-lg rounded-full h-12 w-12 flex items-center justify-center hover:scale-110 transition-all"
                style={{ 
                  backgroundColor: `${accentColor}`,
                }}
              >
                <action.icon className="h-5 w-5" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white shadow-2xl backdrop-blur-xl rounded-full h-16 w-16 flex items-center justify-center border-2 border-white/20"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            }}
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>

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
              {isRTL 
                ? 'امسح هذا الرمز لفتح البطاقة'
                : 'Scan to open card'
              }
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}