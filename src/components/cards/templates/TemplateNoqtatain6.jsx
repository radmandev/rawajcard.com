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

export default function TemplateNoqtatain6({ card, isRTL, onLinkClick }) {
  const primaryColor = card.design?.primary_color || '#608FFF';
  const accentColor = card.design?.accent_color || '#FF6B9D';
  const textColor = card.design?.text_color || '#212121';
  const backgroundColor = card.design?.background_color || '#F8F9FA';
  const borderRadius = card.design?.border_radius || '20px';
  const fontFamily = card.design?.font_family || 'Inter';

  const socialLinks = Object.entries(card.social_links || {}).filter(([, value]) => value);

  return (
    <div
      className={cn("min-h-screen relative", isRTL ? "rtl" : "ltr")}
      style={{
        backgroundColor: primaryColor,
        fontFamily: fontFamily
      }}
    >
      {/* Background Pattern */}
      {card.cover_image && (
        <div className="absolute inset-0 opacity-10">
          <img src={card.cover_image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content Container */}
      <div className="relative">
        {/* Profile Header */}
        <div className="px-6 pt-12 pb-8 text-white text-center">
          {card.profile_image && (
            <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white/30 shadow-xl">
              <img src={card.profile_image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          
          <h2 className="text-2xl font-bold mb-1">{isRTL && card.name_ar ? card.name_ar : card.name}</h2>
          {card.title && <p className="text-base opacity-90 mb-1">{isRTL && card.title_ar ? card.title_ar : card.title}</p>}
          {card.company && <p className="font-semibold text-lg">{isRTL && card.company_ar ? card.company_ar : card.company}</p>}

          {/* Quick Action Buttons */}
          <div className="flex justify-center gap-3 mt-6">
            {card.phone && (
              <a href={`tel:${card.phone}`} onClick={() => onLinkClick?.('phone')}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors border border-white/30">
                <Phone className="h-5 w-5" />
              </a>
            )}
            {card.email && (
              <a href={`mailto:${card.email}`} onClick={() => onLinkClick?.('email')}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors border border-white/30">
                <Mail className="h-5 w-5" />
              </a>
            )}
            {card.whatsapp && (
              <a href={`https://wa.me/${card.whatsapp}`} onClick={() => onLinkClick?.('whatsapp')}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors border border-white/30">
                <MessageSquare className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div 
          className="rounded-t-3xl overflow-hidden" 
          style={{ backgroundColor: backgroundColor, color: textColor }}
        >
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

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                  <Phone className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold">{isRTL ? 'تواصل معنا' : 'Contact Us'}</h2>
              </div>

              <div className="space-y-4">
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
                    <a href={`mailto:${card.email}`} className="text-base font-medium break-all" style={{ color: primaryColor }}>
                      {card.email}
                    </a>
                  </div>
                )}
                {card.location && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{isRTL ? 'العنوان' : 'Address'}</p>
                    <p className="text-sm mb-2">{isRTL && card.location_ar ? card.location_ar : card.location}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(isRTL && card.location_ar ? card.location_ar : card.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm hover:underline"
                      style={{ color: accentColor }}
                    >
                      <MapPin className="h-4 w-4" />
                      {isRTL ? 'الاتجاهات' : 'Direction'}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery */}
            {card.gallery_images && card.gallery_images.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4 text-center">{isRTL ? 'معرض الصور' : 'Gallery'}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {card.gallery_images.slice(0, 4).map((img, idx) => (
                    <img key={idx} src={img} alt="" className="w-full h-32 object-cover rounded-xl" />
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-center mb-4">{isRTL ? 'روابط التواصل الاجتماعي' : 'Social Links'}</h2>
                <div className="space-y-3">
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
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
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
                className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                    <Globe className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">{isRTL ? 'زيارة الموقع الإلكتروني' : 'Visit Website'}</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}