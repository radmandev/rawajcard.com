import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Linkedin, Instagram, Twitter, Facebook } from 'lucide-react';

export default function TemplateModernGradient({ card, isRTL, onLinkClick }) {
  const design = card.design || {};
  const primaryColor = design.primary_color || '#6366F1';
  const secondaryColor = design.secondary_color || '#8B5CF6';
  const accentColor = design.accent_color || '#EC4899';

  const socialIcons = {
    linkedin: Linkedin,
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
      {/* Floating gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-purple-400/20 rounded-full blur-3xl" />

      <div className="relative z-10 p-8">
        {/* Profile Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-50" />
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              {card.profile_image ? (
                <img src={card.profile_image} alt={card.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{(card.name || 'U')[0]}</span>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {isRTL && card.name_ar ? card.name_ar : card.name}
          </h1>
          
          {(card.title || card.title_ar) && (
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
              {isRTL && card.title_ar ? card.title_ar : card.title}
            </p>
          )}

          {(card.company || card.company_ar) && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {isRTL && card.company_ar ? card.company_ar : card.company}
            </p>
          )}
        </div>

        {/* Bio */}
        {(card.bio || card.bio_ar) && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 mb-6 shadow-xl border border-white/20">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-center">
              {isRTL && card.bio_ar ? card.bio_ar : card.bio}
            </p>
          </div>
        )}

        {/* Contact Actions */}
        <div className="space-y-3 mb-6">
          {card.email && (
            <a
              href={`mailto:${card.email}`}
              onClick={() => onLinkClick?.('email')}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Mail className="h-5 w-5" />
              <span className="font-medium">{card.email}</span>
            </a>
          )}

          {card.phone && (
            <a
              href={`tel:${card.phone}`}
              onClick={() => onLinkClick?.('phone')}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Phone className="h-5 w-5" />
              <span className="font-medium">{card.phone}</span>
            </a>
          )}

          {card.whatsapp && (
            <a
              href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`}
              onClick={() => onLinkClick?.('whatsapp')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">WhatsApp</span>
            </a>
          )}

          {card.location && (
            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{isRTL && card.location_ar ? card.location_ar : card.location}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {card.social_links && Object.keys(card.social_links).some(key => card.social_links[key]) && (
          <div className="flex justify-center gap-3 flex-wrap">
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
                  className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-white/20"
                >
                  <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}