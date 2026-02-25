import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import InlineEditableField from '@/components/cards/InlineEditableField';
import InlineImageUpload from '@/components/cards/InlineImageUpload';
import AppointmentSection from '@/components/cards/AppointmentSection';
import CustomFormEmbed from '@/components/cards/CustomFormEmbed';
import ContactCollectionForm from '@/components/cards/ContactCollectionForm';
import { 
  Phone, Mail, MapPin, Globe, MessageCircle,
  Facebook, Instagram, Twitter, Linkedin, Youtube, Github,
  Share2, UserPlus, Calendar, ExternalLink, ChevronRight,
  Navigation
} from 'lucide-react';

// Custom X (Twitter) icon
const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const SocialIcon = ({ platform, className }) => {
  const icons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: XIcon,
    linkedin: Linkedin,
    youtube: Youtube,
    github: Github,
    tiktok: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
    snapchat: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/>
      </svg>
    ),
  };
  const Icon = icons[platform] || Globe;
  return <Icon className={className} />;
};

export default function TemplateNavyGold({ card, isRTL, onLinkClick, editMode = false, onCardChange }) {
  const isDarkMode = card.design?.dark_mode || false;
  
  // Adjust colors for dark mode
  const primaryColor = isDarkMode 
    ? '#0F172A' // Darker navy
    : card.design?.primary_color || '#14274E';
  const secondaryColor = isDarkMode
    ? '#1E293B' // Dark slate
    : card.design?.secondary_color || '#0D1B3E';
  const accentColor = isDarkMode
    ? '#FCD34D' // Brighter gold for contrast
    : card.design?.accent_color || '#F4B400';
  const backgroundColor = isDarkMode ? '#0F172A' : '#FFFFFF';
  const textColor = isDarkMode ? '#F1F5F9' : '#1F2937';
  const mutedTextColor = isDarkMode ? '#94A3B8' : '#6B7280';
  const cardBgColor = isDarkMode ? '#1E293B' : '#FFFFFF';
  
  const borderRadius = card.design?.border_radius || '12px';
  const cardPadding = card.design?.card_padding || '24px';
  const fontFamily = card.design?.font_family || 'Inter';

  const handleSaveContact = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${card.name || ''}
TITLE:${card.title || ''}
ORG:${card.company || ''}
TEL:${card.phone || ''}
EMAIL:${card.email || ''}
URL:${card.website || ''}
ADR:;;${card.location || ''}
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
    <div className="min-h-screen" style={{ 
      backgroundColor: primaryColor,
      fontFamily: fontFamily,
      color: textColor
    }}>
      {/* Header with Cover & Profile */}
      <div className="relative">
        {/* Cover Image */}
        <InlineImageUpload
          value={card.cover_image}
          onChange={onCardChange}
          fieldName="cover_image"
          editMode={editMode}
          isRTL={isRTL}
          displayComponent={
            <div className="h-40 relative overflow-hidden">
              {card.cover_image ? (
                <img src={card.cover_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
              )}
              {/* Decorative Wave */}
              <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 40" preserveAspectRatio="none">
                <path d="M0,40 L0,20 Q100,0 200,20 T400,20 L400,40 Z" fill={accentColor} />
              </svg>
            </div>
          }
        />

        {/* Profile Section */}
        <div className="px-6 -mt-16 relative z-10">
          {/* Company Logo */}
          <InlineImageUpload
            value={card.company_logo}
            onChange={onCardChange}
            fieldName="company_logo"
            editMode={editMode}
            isRTL={isRTL}
            className="absolute top-0 left-6 h-14 w-14"
            displayComponent={
              card.company_logo ? (
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-white shadow-lg p-2">
                  <img src={card.company_logo} alt={card.company} className="h-full w-full object-contain" />
                </div>
              ) : card.company ? (
                <div 
                  className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  {card.company.charAt(0)}
                </div>
              ) : null
            }
          />
          
          {/* Profile Image */}
          <div className="flex justify-center">
            <InlineImageUpload
              value={card.profile_image}
              onChange={onCardChange}
              fieldName="profile_image"
              editMode={editMode}
              isRTL={isRTL}
              showCameraOption={true}
              className="h-28 w-28 rounded-full"
              displayComponent={
                <div className="h-28 w-28 rounded-full border-4 border-white overflow-hidden bg-slate-300 shadow-xl">
                  {card.profile_image ? (
                    <img src={card.profile_image} alt={card.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800 text-white text-3xl font-bold">
                      {card.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              }
            />
          </div>

          {/* Name & Title */}
          <div className="text-center mt-4">
            <InlineEditableField
              value={isRTL && card.name_ar ? card.name_ar : card.name}
              onChange={(field, value) => onCardChange?.(isRTL ? 'name_ar' : 'name', value)}
              fieldName={isRTL ? 'name_ar' : 'name'}
              editMode={editMode}
              isRTL={isRTL}
              placeholder={isRTL ? 'اسمك' : 'Your Name'}
              displayComponent={
                <h1 className="text-2xl font-bold text-white">
                  {isRTL && card.name_ar ? card.name_ar : card.name || 'Your Name'}
                </h1>
              }
            />
            <InlineEditableField
              value={isRTL && card.title_ar ? card.title_ar : card.title}
              onChange={(field, value) => onCardChange?.(isRTL ? 'title_ar' : 'title', value)}
              fieldName={isRTL ? 'title_ar' : 'title'}
              editMode={editMode}
              isRTL={isRTL}
              placeholder={isRTL ? 'المسمى الوظيفي' : 'Your Title'}
              displayComponent={
                <p className="text-slate-300 mt-1">
                  {isRTL && card.title_ar ? card.title_ar : card.title || 'Your Title'}
                </p>
              }
            />
            <InlineEditableField
              value={isRTL && card.company_ar ? card.company_ar : card.company}
              onChange={(field, value) => onCardChange?.(isRTL ? 'company_ar' : 'company', value)}
              fieldName={isRTL ? 'company_ar' : 'company'}
              editMode={editMode}
              isRTL={isRTL}
              placeholder={isRTL ? 'الشركة' : 'Company'}
              displayComponent={
                <p className="text-sm mt-1" style={{ color: accentColor }}>
                  {isRTL && card.company_ar ? card.company_ar : card.company || 'Company'}
                </p>
              }
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex justify-center gap-3 mt-4">
            {card.phone && (
              <a 
                href={`tel:${card.phone}`}
                onClick={() => onLinkClick?.('phone')}
                className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: accentColor }}
              >
                <Phone className="h-5 w-5" />
              </a>
            )}
            {card.email && (
              <a 
                href={`mailto:${card.email}`}
                onClick={() => onLinkClick?.('email')}
                className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: accentColor }}
              >
                <Mail className="h-5 w-5" />
              </a>
            )}
            {card.whatsapp && (
              <a 
                href={`https://wa.me/${card.whatsapp.replace(/\D/g, '')}`}
                onClick={() => onLinkClick?.('whatsapp')}
                className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: accentColor }}
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-4 py-6 space-y-4">
        {/* About Me */}
        {(card.bio || card.bio_ar || editMode) && (
          <div className="shadow-lg" style={{ 
            backgroundColor: cardBgColor,
            borderRadius: borderRadius,
            padding: cardPadding
          }}>
            <InlineEditableField
              value={isRTL ? 'نبذة عني' : 'About Me'}
              onChange={() => {}}
              fieldName="section_heading_bio"
              editMode={false}
              displayComponent={
                <h2 className="text-center font-semibold mb-2" style={{ color: accentColor }}>
                  {isRTL ? 'نبذة عني' : 'About Me'}
                </h2>
              }
            />
            <InlineEditableField
              value={isRTL && card.bio_ar ? card.bio_ar : card.bio}
              onChange={(field, value) => onCardChange?.(isRTL ? 'bio_ar' : 'bio', value)}
              fieldName={isRTL ? 'bio_ar' : 'bio'}
              editMode={editMode}
              isRTL={isRTL}
              multiline={true}
              placeholder={isRTL ? 'نبذة عنك...' : 'About yourself...'}
              displayComponent={
                <p className="text-sm text-center whitespace-pre-wrap" style={{ color: mutedTextColor }}>
                  {isRTL && card.bio_ar ? card.bio_ar : card.bio || (editMode ? (isRTL ? 'انقر للتعديل' : 'Click to edit') : '')}
                </p>
              }
            />
          </div>
        )}

        {/* Contact Us */}
        <div className="shadow-lg" style={{ 
          backgroundColor: cardBgColor,
          borderRadius: borderRadius,
          padding: cardPadding
        }}>
          <InlineEditableField
            value={isRTL ? 'تواصل معنا' : 'Contact Us'}
            onChange={() => {}}
            fieldName="section_heading_contact"
            editMode={false}
            displayComponent={
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium" style={{ color: accentColor }}>
                  {isRTL ? 'تواصل معنا' : 'Contact Us'}
                </span>
              </div>
            }
          />
          
          <div className="space-y-3 text-sm">
            {(card.phone || editMode) && (
              <div className="block">
                <InlineEditableField
                  value={isRTL ? 'اتصل بنا' : 'Call Us'}
                  onChange={() => {}}
                  fieldName="label_phone"
                  editMode={false}
                  displayComponent={
                    <p className="font-medium" style={{ color: accentColor }}>{isRTL ? 'اتصل بنا' : 'Call Us'}</p>
                  }
                />
                <InlineEditableField
                  value={card.phone}
                  onChange={(field, value) => onCardChange?.('phone', value)}
                  fieldName="phone"
                  editMode={editMode}
                  inputType="tel"
                  placeholder="+966 5X XXX XXXX"
                  displayComponent={
                    <a href={`tel:${card.phone}`} onClick={() => onLinkClick?.('phone')}>
                      <p style={{ color: mutedTextColor }}>{card.phone || (editMode ? (isRTL ? 'انقر للتعديل' : 'Click to edit') : '')}</p>
                    </a>
                  }
                />
              </div>
            )}
            {(card.email || editMode) && (
              <div className="block">
                <InlineEditableField
                  value={isRTL ? 'البريد الإلكتروني' : 'Email'}
                  onChange={() => {}}
                  fieldName="label_email"
                  editMode={false}
                  displayComponent={
                    <p className="font-medium" style={{ color: accentColor }}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</p>
                  }
                />
                <InlineEditableField
                  value={card.email}
                  onChange={(field, value) => onCardChange?.('email', value)}
                  fieldName="email"
                  editMode={editMode}
                  inputType="email"
                  placeholder="email@example.com"
                  displayComponent={
                    <a href={`mailto:${card.email}`} onClick={() => onLinkClick?.('email')}>
                      <p style={{ color: mutedTextColor }}>{card.email || (editMode ? (isRTL ? 'انقر للتعديل' : 'Click to edit') : '')}</p>
                    </a>
                  }
                />
              </div>
            )}
            {(card.location || editMode) && (
              <div>
                <InlineEditableField
                  value={isRTL ? 'العنوان' : 'Address'}
                  onChange={() => {}}
                  fieldName="label_address"
                  editMode={false}
                  displayComponent={
                    <p className="font-medium" style={{ color: accentColor }}>{isRTL ? 'العنوان' : 'Address'}</p>
                  }
                />
                <InlineEditableField
                  value={isRTL && card.location_ar ? card.location_ar : card.location}
                  onChange={(field, value) => onCardChange?.(isRTL ? 'location_ar' : 'location', value)}
                  fieldName={isRTL ? 'location_ar' : 'location'}
                  editMode={editMode}
                  isRTL={isRTL}
                  placeholder={isRTL ? 'العنوان' : 'Address'}
                  displayComponent={
                    <p style={{ color: mutedTextColor }}>{isRTL && card.location_ar ? card.location_ar : card.location || (editMode ? (isRTL ? 'انقر للتعديل' : 'Click to edit') : '')}</p>
                  }
                />
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
          <div className="shadow-lg" style={{ 
            backgroundColor: cardBgColor,
            borderRadius: borderRadius,
            padding: cardPadding
          }}>
            <InlineEditableField
              value={isRTL ? 'روابط التواصل' : 'Social Links'}
              onChange={() => {}}
              fieldName="section_heading_social"
              editMode={false}
              displayComponent={
                <h2 className="text-center font-semibold mb-4" style={{ color: accentColor }}>
                  {isRTL ? 'روابط التواصل' : 'Social Links'}
                </h2>
              }
            />
            <div className="space-y-2">
              {socialLinks.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url.startsWith('http') ? url : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLinkClick?.(platform)}
                  className="flex items-center justify-between p-3 transition-colors"
                  style={{ 
                    borderRadius: `calc(${borderRadius} * 0.75)`,
                    backgroundColor: isDarkMode ? '#334155' : '#F8FAFC'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <SocialIcon platform={platform} className="h-6 w-6" style={{ color: accentColor }} />
                    <span className="capitalize font-medium" style={{ color: textColor }}>{platform}</span>
                  </div>
                  <ChevronRight className="h-5 w-5" style={{ color: mutedTextColor }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Website Link */}
        {card.website && (
          <div className="shadow-lg" style={{ 
            backgroundColor: cardBgColor,
            borderRadius: borderRadius,
            padding: cardPadding
          }}>
            <InlineEditableField
              value={isRTL ? 'روابط الويب' : 'Web Links'}
              onChange={() => {}}
              fieldName="section_heading_web"
              editMode={false}
              displayComponent={
                <h2 className="text-center font-semibold mb-4" style={{ color: accentColor }}>
                  {isRTL ? 'روابط الويب' : 'Web Links'}
                </h2>
              }
            />
            <a
              href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onLinkClick?.('website')}
              className="flex items-center justify-between p-3 transition-colors"
              style={{ 
                borderRadius: `calc(${borderRadius} * 0.75)`,
                backgroundColor: isDarkMode ? '#334155' : '#F8FAFC'
              }}
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5" style={{ color: accentColor }} />
                <div>
                  <p className="font-medium" style={{ color: accentColor }}>{isRTL ? 'الموقع الإلكتروني' : 'Website'}</p>
                  <p className="text-xs" style={{ color: mutedTextColor }}>{card.website}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5" style={{ color: mutedTextColor }} />
            </a>
          </div>
        )}

        {/* Appointments Section */}
        {card.appointment_settings?.enabled && (
          <AppointmentSection card={card} isRTL={isRTL} />
        )}

        {/* Custom Form Embed */}
        {card.custom_form_embed?.enabled && (
          <CustomFormEmbed card={card} isRTL={isRTL} />
        )}

        {/* Contact Collection Form */}
        {card.contact_form?.enabled && card.contact_form?.form_type === 'inline' && (
          <ContactCollectionForm card={card} isRTL={isRTL} />
        )}

        {/* Action Buttons */}
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
            className="w-full h-12 rounded-full font-medium border-2"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            <Share2 className="h-5 w-5 mr-2" />
            {isRTL ? 'شارك معلوماتك' : 'Share Your Details'}
          </Button>
        </div>
      </div>
    </div>
  );
}