import React from 'react';
import { Phone, Mail, MapPin, Globe, Linkedin, Facebook, Instagram, Twitter, Youtube, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const getSocialIcon = (platform) => {
  switch (platform) {
    case 'linkedin': return <Linkedin className="h-5 w-5" />;
    case 'facebook': return <Facebook className="h-5 w-5" />;
    case 'instagram': return <Instagram className="h-5 w-5" />;
    case 'twitter': return <Twitter className="h-5 w-5" />;
    case 'youtube': return <Youtube className="h-5 w-5" />;
    default: return null;
  }
};

export default function TemplateNoqtatain1({ card, isRTL, onLinkClick }) {
  const primaryColor = card.design?.primary_color || '#14274E';
  const accentColor = card.design?.accent_color || '#F4B400';
  const textColor = card.design?.text_color || '#1F2937';
  const backgroundColor = card.design?.background_color || '#F9FAFB';
  const borderRadius = card.design?.border_radius || '16px';
  const fontFamily = card.design?.font_family || 'Inter';

  const socialLinks = Object.entries(card.social_links || {}).filter(([, value]) => value);

  return (
    <div
      className={cn("min-h-screen", isRTL ? "rtl" : "ltr")}
      style={{
        backgroundColor: backgroundColor,
        fontFamily: fontFamily,
        color: textColor
      }}
    >
      {/* Profile Section with Decorative Shapes */}
      <div className="relative w-full" style={{ backgroundColor: primaryColor, paddingBottom: '60px' }}>
        {/* Profile Image with Overlay */}
        <div className="relative h-64 overflow-hidden">
          {card.profile_image && (
            <img src={card.profile_image} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-current" style={{ color: primaryColor }} />
        </div>
        
        {/* Decorative Wave Shape */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 375 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 40C83 10 150 50 210 30C270 10 330 40 375 20V80H0V40Z" fill={backgroundColor} />
        </svg>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-20 text-white text-center">
          <h2 className="text-2xl font-bold mb-1">{isRTL && card.name_ar ? card.name_ar : card.name}</h2>
          {card.title && <p className="text-lg mb-1 opacity-90">{isRTL && card.title_ar ? card.title_ar : card.title}</p>}
          {card.company && <p className="font-semibold">{isRTL && card.company_ar ? card.company_ar : card.company}</p>}
          {card.company_logo && (
            <img src={card.company_logo} alt="" className="h-10 mx-auto mt-3 brightness-200" />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4 -mt-8 px-6 relative z-10">
        {card.phone && (
          <a href={`tel:${card.phone}`} onClick={() => onLinkClick?.('phone')} 
            className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            style={{ color: primaryColor }}>
            <Phone className="h-6 w-6" />
          </a>
        )}
        {card.email && (
          <a href={`mailto:${card.email}`} onClick={() => onLinkClick?.('email')}
            className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            style={{ color: primaryColor }}>
            <Mail className="h-6 w-6" />
          </a>
        )}
        {card.whatsapp && (
          <a href={`https://wa.me/${card.whatsapp}`} onClick={() => onLinkClick?.('whatsapp')}
            className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            style={{ color: primaryColor }}>
            <MessageSquare className="h-6 w-6" />
          </a>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* About Me */}
        {card.bio && (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <h2 className="text-xl font-bold mb-3" style={{ color: accentColor }}>
              {isRTL ? 'نبذة عني' : 'About Me'}
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {isRTL && card.bio_ar ? card.bio_ar : card.bio}
            </p>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
              <Phone className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">{isRTL ? 'تواصل معنا' : 'Contact Us'}</h2>
          </div>
          
          <div className="space-y-3">
            {card.phone && (
              <div>
                <p className="text-xs text-gray-500 mb-1">{isRTL ? 'اتصل بنا' : 'Call Us'}</p>
                <a href={`tel:${card.phone}`} className="text-base font-medium" style={{ color: primaryColor }}>
                  {card.phone}
                </a>
              </div>
            )}
            {card.email && (
              <div>
                <p className="text-xs text-gray-500 mb-1">{isRTL ? 'البريد الإلكتروني' : 'Email'}</p>
                <a href={`mailto:${card.email}`} className="text-base font-medium" style={{ color: primaryColor }}>
                  {card.email}
                </a>
              </div>
            )}
            {card.location && (
              <div>
                <p className="text-xs text-gray-500 mb-1">{isRTL ? 'العنوان' : 'Address'}</p>
                <p className="text-sm">{isRTL && card.location_ar ? card.location_ar : card.location}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(isRTL && card.location_ar ? card.location_ar : card.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm mt-1 hover:underline"
                  style={{ color: accentColor }}
                >
                  <MapPin className="h-4 w-4" />
                  {isRTL ? 'احصل على الاتجاهات' : 'Get Directions'}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-center">{isRTL ? 'روابط التواصل' : 'Social Links'}</h2>
            {socialLinks.map(([platform, url]) => (
              <a
                key={platform}
                href={url.startsWith('http') ? url : `https://${platform}.com/${url}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClick?.(platform)}
                className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                    {getSocialIcon(platform)}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{platform}</p>
                    <p className="text-xs text-gray-500">{isRTL ? `تابعنا على ${platform}` : `Follow us on ${platform}`}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        )}

        {/* Website */}
        {card.website && (
          <a
            href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onLinkClick?.('website')}
            className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{isRTL ? 'موقعنا الإلكتروني' : 'Our Website'}</p>
                <p className="text-xs text-gray-500">{card.website}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}