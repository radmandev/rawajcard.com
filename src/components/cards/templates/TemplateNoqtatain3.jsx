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

export default function TemplateNoqtatain3({ card, isRTL, onLinkClick }) {
  const primaryColor = card.design?.primary_color || '#070708';
  const accentColor = card.design?.accent_color || '#F97316';
  const textColor = card.design?.text_color || '#1F2937';
  const backgroundColor = card.design?.background_color || '#F3F4F6';
  const borderRadius = card.design?.border_radius || '20px';
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
      {/* Cover + Profile Section */}
      <div className="relative w-full">
        {/* Cover Image */}
        <div className="relative h-40 overflow-hidden" style={{ backgroundColor: primaryColor }}>
          {card.cover_image && (
            <>
              <img src={card.cover_image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
            </>
          )}
          
          {/* Decorative Wave */}
          <svg className="absolute bottom-0 w-full h-20" viewBox="0 0 375 80" fill="none" preserveAspectRatio="none">
            <path d="M0 30C100 10 200 50 300 30C350 20 375 25 375 25V80H0V30Z" fill={backgroundColor} />
            <path d="M0 35C100 15 200 55 300 35C350 25 375 30 375 30V80H0V35Z" fill={backgroundColor} opacity="0.5" />
          </svg>
        </div>

        {/* Profile Circle Overlapping */}
        <div className="relative -mt-16 flex flex-col items-center px-6">
          {card.profile_image ? (
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
              <img src={card.profile_image} alt="" className="w-full h-full object-cover" />
            </div>
          ) : card.company_logo && (
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white p-4 flex items-center justify-center">
              <img src={card.company_logo} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          )}

          <h2 className="text-2xl font-bold mt-3 text-center">{isRTL && card.name_ar ? card.name_ar : card.name}</h2>
          {card.title && <p className="text-base text-gray-600 mt-1">{isRTL && card.title_ar ? card.title_ar : card.title}</p>}
          {card.company && <p className="font-semibold mt-1" style={{ color: primaryColor }}>{isRTL && card.company_ar ? card.company_ar : card.company}</p>}

          {/* Quick Actions */}
          <div className="flex gap-3 mt-4">
            {card.phone && (
              <a href={`tel:${card.phone}`} onClick={() => onLinkClick?.('phone')}
                className="w-12 h-12 rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
                style={{ backgroundColor: accentColor, color: 'white' }}>
                <Phone className="h-5 w-5" />
              </a>
            )}
            {card.email && (
              <a href={`mailto:${card.email}`} onClick={() => onLinkClick?.('email')}
                className="w-12 h-12 rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
                style={{ backgroundColor: accentColor, color: 'white' }}>
                <Mail className="h-5 w-5" />
              </a>
            )}
            {card.whatsapp && (
              <a href={`https://wa.me/${card.whatsapp}`} onClick={() => onLinkClick?.('whatsapp')}
                className="w-12 h-12 rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
                style={{ backgroundColor: accentColor, color: 'white' }}>
                <MessageSquare className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
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

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
              <Phone className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">{isRTL ? 'تواصل معنا' : 'Contact Us'}</h2>
          </div>

          <div className="space-y-4">
            {card.phone && (
              <div className="flex items-start gap-3">
                <div className="text-xs text-gray-500 w-20 flex-shrink-0">{isRTL ? 'الهاتف' : 'Call Us'}</div>
                <a href={`tel:${card.phone}`} className="font-medium flex-1" style={{ color: primaryColor }}>{card.phone}</a>
              </div>
            )}
            {card.email && (
              <div className="flex items-start gap-3">
                <div className="text-xs text-gray-500 w-20 flex-shrink-0">{isRTL ? 'البريد' : 'Email'}</div>
                <a href={`mailto:${card.email}`} className="font-medium flex-1 break-all" style={{ color: primaryColor }}>{card.email}</a>
              </div>
            )}
            {card.location && (
              <div className="flex items-start gap-3">
                <div className="text-xs text-gray-500 w-20 flex-shrink-0">{isRTL ? 'العنوان' : 'Address'}</div>
                <div className="flex-1">
                  <p className="text-sm mb-1">{isRTL && card.location_ar ? card.location_ar : card.location}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(isRTL && card.location_ar ? card.location_ar : card.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs hover:underline"
                    style={{ color: accentColor }}
                  >
                    <MapPin className="h-3 w-3" />
                    {isRTL ? 'الاتجاهات' : 'Direction'}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-center mb-4">{isRTL ? 'روابط التواصل' : 'Social Links'}</h2>
            <div className="space-y-3">
              {socialLinks.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url.startsWith('http') ? url : `https://${platform}.com/${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLinkClick?.(platform)}
                  className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}08`, color: primaryColor }}>
                      {getSocialIcon(platform)}
                    </div>
                    <div>
                      <p className="font-semibold capitalize">{platform}</p>
                      <p className="text-xs text-gray-500">{isRTL ? 'تابعنا' : 'Follow us'}</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Website */}
        {card.website && (
          <a
            href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onLinkClick?.('website')}
            className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all"
            style={{ borderLeft: `4px solid ${accentColor}` }}
          >
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6" style={{ color: accentColor }} />
              <span className="font-semibold">{isRTL ? 'موقعنا الإلكتروني' : 'Visit Our Website'}</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}