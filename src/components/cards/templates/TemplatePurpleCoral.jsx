import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Phone, Mail, Globe, MessageCircle,
  Facebook, Instagram, Linkedin, Youtube, Github,
  Share2, UserPlus, ChevronRight,
  Navigation
} from 'lucide-react';
import { getContactArrays, getSocialEntries } from '@/lib/cardContactFields';

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

export default function TemplatePurpleCoral({ card, isRTL, onLinkClick }) {
  const { phones, emails, whatsapps, websites, locations } = getContactArrays(card);
  const primaryColor = '#7C3AED'; // Purple
  const accentColor = '#F87171'; // Coral

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

  const socialLinks = getSocialEntries(card.social_links);

  return (
    <div className="min-h-screen" style={{ backgroundColor: primaryColor }}>
      {/* Header */}
      <div className="relative">
        <div className="h-44 relative overflow-hidden">
          {card.cover_image ? (
            <img src={card.cover_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-violet-800" />
          )}
          {/* Company Logo Overlay */}
          {card.company_logo && (
            <div className="absolute top-4 left-4 h-12 w-12 rounded-lg overflow-hidden bg-indigo-950/60 shadow-lg p-1.5">
              <img src={card.company_logo} alt={card.company} className="h-full w-full object-contain" />
            </div>
          )}
          {/* Diagonal cut */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-12"
            style={{ 
              background: `linear-gradient(to bottom right, transparent 49%, ${primaryColor} 50%)`
            }}
          />
        </div>

        {/* Profile with floating icons */}
        <div className="px-6 -mt-20 relative z-10">
          <div className="relative flex justify-center">
            {/* Profile Image */}
            <div className="h-32 w-32 rounded-full overflow-hidden bg-indigo-950/60 p-1 shadow-xl">
              <div className="h-full w-full rounded-full overflow-hidden bg-slate-200">
                {card.profile_image ? (
                  <img src={card.profile_image} alt={card.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-violet-600 text-white text-3xl font-bold">
                    {card.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>

            {/* Floating action icons */}
            <div className="absolute -right-2 top-4 flex flex-col gap-1">
              {phones.map((p, i) => (
                <a
                  key={i}
                  href={`tel:${p}`}
                  onClick={() => onLinkClick?.('phone')}
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  <Phone className="h-5 w-5" />
                </a>
              ))}
              {emails.map((e, i) => (
                <a
                  key={i}
                  href={`mailto:${e}`}
                  onClick={() => onLinkClick?.('email')}
                  className="h-9 w-9 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  <Mail className="h-4 w-4" />
                </a>
              ))}
              {whatsapps.map((w, i) => (
                <a
                  key={i}
                  href={`https://wa.me/${w.replace(/\D/g, '')}`}
                  onClick={() => onLinkClick?.('whatsapp')}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Name & Title */}
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-white">
              {isRTL && card.name_ar ? card.name_ar : card.name || 'Your Name'}
            </h1>
            <p className="text-purple-200 mt-1">
              {isRTL && card.title_ar ? card.title_ar : card.title}
            </p>
            <p className="text-sm text-purple-300 mt-1">
              {isRTL && card.company_ar ? card.company_ar : card.company}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {/* About */}
        {card.bio && (
          <div className="bg-indigo-950/60 rounded-2xl p-5 shadow-lg">
            <h2 className="text-center font-semibold mb-2" style={{ color: accentColor }}>
              {isRTL ? 'نبذة عني' : 'About Me'}
            </h2>
            <p className="text-sm text-slate-600 text-center">
              {isRTL && card.bio_ar ? card.bio_ar : card.bio}
            </p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-indigo-950/60 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
              <Phone className="h-4 w-4" style={{ color: accentColor }} />
            </div>
            <span className="font-medium" style={{ color: accentColor }}>
              {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </span>
          </div>
          
          <div className="space-y-3 text-sm">
            {phones.map((p, i) => (
              <a key={i} href={`tel:${p}`} onClick={() => onLinkClick?.('phone')} className="block">
                {i === 0 && <p className="font-medium" style={{ color: accentColor }}>{isRTL ? 'اتصل بنا' : 'Call Us'}</p>}
                <p className="text-slate-600">{p}</p>
              </a>
            ))}
            {emails.map((e, i) => (
              <a key={i} href={`mailto:${e}`} onClick={() => onLinkClick?.('email')} className="block">
                {i === 0 && <p className="font-medium" style={{ color: accentColor }}>{isRTL ? 'البريد' : 'Email'}</p>}
                <p className="text-slate-600">{e}</p>
              </a>
            ))}
            {locations.map((loc, i) => {
              const displayLoc = i === 0 && isRTL && card.location_ar ? card.location_ar : loc;
              return (
                <div key={i}>
                  {i === 0 && <p className="font-medium" style={{ color: accentColor }}>{isRTL ? 'العنوان' : 'Address'}</p>}
                  <p className="text-slate-600">{displayLoc}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(displayLoc)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onLinkClick?.('directions')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Navigation className="h-4 w-4" />
                    {isRTL ? 'الاتجاهات' : 'Direction'}
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="bg-indigo-950/60 rounded-2xl p-5 shadow-lg">
            <h2 className="text-center font-semibold mb-4" style={{ color: accentColor }}>
              {isRTL ? 'روابط التواصل' : 'Social Links'}
            </h2>
            <div className="space-y-2">
              {socialLinks.map(([platform, url], i) => (
                <a
                  key={`${platform}-${i}`}
                  href={url.startsWith('http') ? url : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLinkClick?.(platform)}
                  className="flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SocialIcon platform={platform} className="h-6 w-6" style={{ color: accentColor }} />
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
            className="w-full h-12 rounded-full text-white font-medium"
            style={{ backgroundColor: accentColor }}
          >
            <UserPlus className="h-5 w-5 mr-2" />
            {isRTL ? 'حفظ جهة الاتصال' : 'Add to Contact'}
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full h-12 rounded-full font-medium border-2 bg-indigo-950/60/10"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            <Share2 className="h-5 w-5 mr-2" />
            {isRTL ? 'مشاركة البطاقة' : 'Share Contact details'}
          </Button>
        </div>
      </div>
    </div>
  );
}