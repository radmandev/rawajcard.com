import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Phone, Mail, MapPin, Globe, MessageCircle,
  Facebook, Instagram, Twitter, Linkedin, Youtube, Github,
  Share2, UserPlus, Calendar, ExternalLink, ChevronRight,
  Navigation
} from 'lucide-react';

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const SocialIcon = ({ platform, className, style }) => {
  const icons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: XIcon,
    linkedin: Linkedin,
    youtube: Youtube,
    github: Github,
  };
  const Icon = icons[platform] || Globe;
  return <Icon className={className} style={style} />;
};

export default function TemplateDarkMinimal({ card, isRTL, onLinkClick }) {
  const handleSaveContact = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${card.name || ''}
TITLE:${card.title || ''}
ORG:${card.company || ''}
TEL:${card.phone || ''}
EMAIL:${card.email || ''}
URL:${card.website || ''}
END:VCARD`;
    
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.name || 'contact'}.vcf`;
    a.click();
    onLinkClick?.('save_contact');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: card.name, url });
    } else {
      navigator.clipboard.writeText(url);
    }
    onLinkClick?.('share');
  };

  const socialLinks = Object.entries(card.social_links || {}).filter(([_, v]) => v);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative">
        <div className="h-36 relative overflow-hidden bg-gradient-to-b from-slate-800 to-black">
          {card.cover_image ? (
            <img 
              src={card.cover_image} 
              alt="" 
              className="w-full h-full object-cover opacity-60 grayscale"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-slate-800 to-black" />
          )}
        </div>

        {/* Profile */}
        <div className="px-6 -mt-16 relative z-10">
          <div className="flex items-end gap-4">
            <div className="h-24 w-24 rounded-xl overflow-hidden bg-slate-700 border-2 border-slate-600">
              {card.profile_image ? (
                <img src={card.profile_image} alt={card.name} className="h-full w-full object-cover grayscale" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-slate-400">
                  {card.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="pb-2 flex-1">
              <h1 className="text-xl font-bold">
                {isRTL && card.name_ar ? card.name_ar : card.name || 'Your Name'}
              </h1>
              <p className="text-slate-400 text-sm">
                {isRTL && card.title_ar ? card.title_ar : card.title}
              </p>
              {(card.company_logo || card.company) && (
                <div className="flex items-center gap-2 mt-1">
                  {card.company_logo ? (
                    <div className="h-5 w-5 rounded bg-white flex items-center justify-center p-0.5">
                      <img src={card.company_logo} alt={card.company} className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded bg-yellow-500 flex items-center justify-center text-xs font-bold text-black">
                      {card.company.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm text-slate-300">{card.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            {card.phone && (
              <a 
                href={`tel:${card.phone}`}
                onClick={() => onLinkClick?.('phone')}
                className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <Phone className="h-5 w-5" />
              </a>
            )}
            {card.email && (
              <a 
                href={`mailto:${card.email}`}
                onClick={() => onLinkClick?.('email')}
                className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            )}
            {card.whatsapp && (
              <a 
                href={`https://wa.me/${card.whatsapp.replace(/\D/g, '')}`}
                onClick={() => onLinkClick?.('whatsapp')}
                className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {/* About */}
        {card.bio && (
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <h2 className="text-center font-semibold text-white mb-2">
              {isRTL ? 'نبذة عني' : 'About Me'}
            </h2>
            <p className="text-sm text-slate-400 text-center">
              {isRTL && card.bio_ar ? card.bio_ar : card.bio}
            </p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <Phone className="h-4 w-4" />
            </div>
            <span className="font-medium">{isRTL ? 'تواصل معنا' : 'Contact Us'}</span>
          </div>
          
          <div className="space-y-3 text-sm">
            {card.phone && (
              <a href={`tel:${card.phone}`} onClick={() => onLinkClick?.('phone')} className="block">
                <p className="font-medium text-white">{isRTL ? 'اتصل بنا' : 'Call Us'}</p>
                <p className="text-slate-500">{card.phone}</p>
              </a>
            )}
            {card.email && (
              <a href={`mailto:${card.email}`} onClick={() => onLinkClick?.('email')} className="block">
                <p className="font-medium text-white">{isRTL ? 'البريد' : 'Email'}</p>
                <p className="text-slate-500">{card.email}</p>
              </a>
            )}
            {card.location && (
              <div>
                <p className="font-medium text-white">{isRTL ? 'العنوان' : 'Address'}</p>
                <p className="text-slate-500">{isRTL && card.location_ar ? card.location_ar : card.location}</p>
              </div>
            )}
            {card.location && (
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(card.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClick?.('directions')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-sm hover:bg-slate-700 transition-colors"
              >
                <Navigation className="h-4 w-4" />
                {isRTL ? 'الاتجاهات' : 'Direction'}
              </a>
            )}
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <h2 className="text-center font-semibold mb-4">
              {isRTL ? 'روابط التواصل' : 'Social Links'}
            </h2>
            <div className="space-y-2">
              {socialLinks.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url.startsWith('http') ? url : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLinkClick?.(platform)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SocialIcon platform={platform} className="h-6 w-6 text-white" />
                    <span className="capitalize">{platform}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleSaveContact}
            className="w-full h-12 rounded-xl bg-white text-black hover:bg-slate-200 font-medium"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            {isRTL ? 'حفظ جهة الاتصال' : 'Add to Contact'}
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full h-12 rounded-xl border-slate-700 text-white hover:bg-slate-800 font-medium"
          >
            <Share2 className="h-5 w-5 mr-2" />
            {isRTL ? 'مشاركة البطاقة' : 'Share Contact details'}
          </Button>
        </div>
      </div>
    </div>
  );
}