import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Linkedin, Instagram, Twitter, Facebook, Leaf } from 'lucide-react';

export default function TemplateForestGreen({ card, isRTL, onLinkClick }) {
  const socialIcons = {
    linkedin: Linkedin,
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Organic patterns */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="leaves" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="15" fill="currentColor" className="text-green-600" />
            <circle cx="70" cy="60" r="20" fill="currentColor" className="text-emerald-600" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#leaves)" />
        </svg>
      </div>

      {/* Leaf decorations */}
      <Leaf className="absolute top-10 right-10 h-16 w-16 text-green-300 opacity-30 rotate-45" />
      <Leaf className="absolute bottom-20 left-10 h-20 w-20 text-emerald-300 opacity-30 -rotate-12" />

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-green-500" />
            <Leaf className="h-5 w-5 text-green-600" />
            <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-green-500" />
          </div>

          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-xl opacity-30" />
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 shadow-2xl">
              {card.profile_image ? (
                <img src={card.profile_image} alt={card.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{(card.name || 'U')[0]}</span>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-green-900 mb-2">
            {isRTL && card.name_ar ? card.name_ar : card.name}
          </h1>
          
          {(card.title || card.title_ar) && (
            <p className="text-lg text-green-700 mb-2">
              {isRTL && card.title_ar ? card.title_ar : card.title}
            </p>
          )}

          {(card.company || card.company_ar) && (
            <p className="text-sm text-emerald-600 font-medium">
              {isRTL && card.company_ar ? card.company_ar : card.company}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-green-500" />
            <Leaf className="h-5 w-5 text-green-600" />
            <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-green-500" />
          </div>
        </div>

        {/* Bio */}
        {(card.bio || card.bio_ar) && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border-2 border-green-200">
            <p className="text-slate-700 leading-relaxed text-center">
              {isRTL && card.bio_ar ? card.bio_ar : card.bio}
            </p>
          </div>
        )}

        {/* Contact Buttons */}
        <div className="space-y-3 mb-6">
          {card.email && (
            <a
              href={`mailto:${card.email}`}
              onClick={() => onLinkClick?.('email')}
              className="flex items-center justify-between bg-white/80 backdrop-blur-sm border-2 border-green-300 rounded-xl p-4 shadow-md hover:shadow-lg hover:border-green-500 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <Mail className="h-5 w-5 text-green-600 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-green-600 font-medium">Email</p>
                  <p className="text-slate-700 font-medium text-sm">{card.email}</p>
                </div>
              </div>
            </a>
          )}

          {card.phone && (
            <a
              href={`tel:${card.phone}`}
              onClick={() => onLinkClick?.('phone')}
              className="flex items-center justify-between bg-white/80 backdrop-blur-sm border-2 border-emerald-300 rounded-xl p-4 shadow-md hover:shadow-lg hover:border-emerald-500 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                  <Phone className="h-5 w-5 text-emerald-600 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-emerald-600 font-medium">Phone</p>
                  <p className="text-slate-700 font-medium text-sm">{card.phone}</p>
                </div>
              </div>
            </a>
          )}

          {card.whatsapp && (
            <a
              href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`}
              onClick={() => onLinkClick?.('whatsapp')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-white/80 backdrop-blur-sm border-2 border-green-300 rounded-xl p-4 shadow-md hover:shadow-lg hover:border-green-500 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <MessageCircle className="h-5 w-5 text-green-600 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-green-600 font-medium">WhatsApp</p>
                  <p className="text-slate-700 font-medium text-sm">Send Message</p>
                </div>
              </div>
            </a>
          )}

          {card.location && (
            <div className="flex items-center justify-center gap-2 text-green-700 py-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{isRTL && card.location_ar ? card.location_ar : card.location}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {card.social_links && Object.keys(card.social_links).some(key => card.social_links[key]) && (
          <div className="flex justify-center gap-3">
            {Object.entries(card.social_links).map(([platform, url]) => {
              if (!url) return null;
              const Icon = socialIcons[platform];
              if (!Icon) return null;

              return (
                <a
                  key={platform}
                  href={url}
                  onClick={() => onLinkClick?.(platform)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border-2 border-green-300 flex items-center justify-center hover:bg-green-500 hover:border-green-500 transition-all group shadow-md"
                >
                  <Icon className="h-5 w-5 text-green-600 group-hover:text-white" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}