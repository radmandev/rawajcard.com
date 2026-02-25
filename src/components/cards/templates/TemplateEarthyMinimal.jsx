import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Phone, Mail, MapPin, Globe, MessageCircle,
  Facebook, Instagram, Twitter, Linkedin, Youtube, Github,
  Share2, UserPlus, Calendar, ExternalLink, ChevronRight,
  Navigation
} from 'lucide-react';

const XIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
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

export default function TemplateEarthyMinimal({ card, isRTL, onLinkClick }) {
  const primaryColor = '#92400E'; // Earthy brown
  const bgColor = '#FEF7ED'; // Warm cream

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
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <div className="relative">
        <div className="h-32 relative overflow-hidden">
          {card.cover_image ? (
            <img src={card.cover_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-amber-100 via-orange-50 to-rose-100" />
          )}
          {/* Torn paper effect */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 30" preserveAspectRatio="none">
            <path 
              d="M0,30 L0,15 Q20,5 40,15 T80,15 T120,15 T160,15 T200,15 T240,15 T280,15 T320,15 T360,15 T400,15 L400,30 Z" 
              fill={bgColor}
            />
          </svg>
        </div>

        {/* Profile */}
        <div className="px-6 -mt-12 relative z-10">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
              {card.profile_image ? (
                <img src={card.profile_image} alt={card.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-300 to-orange-400 text-white text-2xl font-bold">
                  {card.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="pb-1 flex-1">
              <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
                {isRTL && card.name_ar ? card.name_ar : card.name || 'Your Name'}
              </h1>
              <p className="text-slate-500 text-sm">
                {isRTL && card.title_ar ? card.title_ar : card.title}
              </p>
              {(card.company_logo || card.company) && (
                <div className="flex items-center gap-2 mt-1">
                  {card.company_logo ? (
                    <div className="h-5 w-5 rounded overflow-hidden bg-white p-0.5">
                      <img src={card.company_logo} alt={card.company} className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded bg-amber-500 flex items-center justify-center text-xs font-bold text-white">
                      {card.company?.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs text-slate-400">{isRTL && card.company_ar ? card.company_ar : card.company}</span>
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
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow"
                style={{ backgroundColor: primaryColor }}
              >
                <Phone className="h-5 w-5" />
              </a>
            )}
            {card.email && (
              <a 
                href={`mailto:${card.email}`}
                onClick={() => onLinkClick?.('email')}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow"
                style={{ backgroundColor: primaryColor }}
              >
                <Mail className="h-5 w-5" />
              </a>
            )}
            {card.whatsapp && (
              <a 
                href={`https://wa.me/${card.whatsapp.replace(/\D/g, '')}`}
                onClick={() => onLinkClick?.('whatsapp')}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow"
                style={{ backgroundColor: primaryColor }}
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
            <h2 className="text-center font-semibold mb-2" style={{ color: primaryColor }}>
              {isRTL ? 'نبذة عني' : 'About Me'}
            </h2>
            <p className="text-sm text-slate-600 text-center">
              {isRTL && card.bio_ar ? card.bio_ar : card.bio}
            </p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
              <Phone className="h-4 w-4" style={{ color: primaryColor }} />
            </div>
            <span className="font-medium" style={{ color: primaryColor }}>
              {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </span>
          </div>
          
          <div className="space-y-3 text-sm">
            {card.phone && (
              <a href={`tel:${card.phone}`} onClick={() => onLinkClick?.('phone')} className="block">
                <p className="font-medium" style={{ color: primaryColor }}>{isRTL ? 'اتصل بنا' : 'Call Us'}</p>
                <p className="text-slate-500">{card.phone}</p>
              </a>
            )}
            {card.email && (
              <a href={`mailto:${card.email}`} onClick={() => onLinkClick?.('email')} className="block">
                <p className="font-medium" style={{ color: primaryColor }}>{isRTL ? 'البريد' : 'Email'}</p>
                <p className="text-slate-500">{card.email}</p>
              </a>
            )}
            {card.location && (
              <div>
                <p className="font-medium" style={{ color: primaryColor }}>{isRTL ? 'العنوان' : 'Address'}</p>
                <p className="text-slate-500">{isRTL && card.location_ar ? card.location_ar : card.location}</p>
              </div>
            )}
            {card.location && (
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(card.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClick?.('directions')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <Navigation className="h-4 w-4" />
                {isRTL ? 'الاتجاهات' : 'Direction'}
              </a>
            )}
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
            <h2 className="text-center font-semibold mb-4" style={{ color: primaryColor }}>
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
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SocialIcon platform={platform} className="h-6 w-6" style={{ color: primaryColor }} />
                    <span className="capitalize font-medium text-slate-700">{platform}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleSaveContact}
            className="w-full h-12 rounded-xl text-white font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            <UserPlus className="h-5 w-5 mr-2" />
            {isRTL ? 'حفظ جهة الاتصال' : 'Add to Contact'}
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full h-12 rounded-xl font-medium border-2"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            <Share2 className="h-5 w-5 mr-2" />
            {isRTL ? 'مشاركة البطاقة' : 'Share Contact details'}
          </Button>
        </div>
      </div>
    </div>
  );
}