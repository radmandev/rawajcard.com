import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Linkedin, Instagram, Twitter, Facebook, Heart } from 'lucide-react';

export default function TemplateSunsetWarm({ card, isRTL, onLinkClick }) {
  const socialIcons = {
    linkedin: Linkedin,
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-red-100">
      {/* Sunset gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-300/30 via-pink-300/20 to-transparent" />

      {/* Soft circles */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-red-300/30 to-orange-300/30 rounded-full blur-3xl" />

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-xl opacity-40" />
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              {card.profile_image ? (
                <img src={card.profile_image} alt={card.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 via-pink-400 to-red-400 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">{(card.name || 'U')[0]}</span>
                </div>
              )}
            </div>
            <Heart className="absolute -bottom-2 -right-2 h-8 w-8 text-pink-500 fill-pink-500" />
          </div>

          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-red-600 mb-3">
            {isRTL && card.name_ar ? card.name_ar : card.name}
          </h1>
          
          {(card.title || card.title_ar) && (
            <p className="text-xl text-orange-700 mb-2 font-medium">
              {isRTL && card.title_ar ? card.title_ar : card.title}
            </p>
          )}

          {(card.company || card.company_ar) && (
            <p className="text-sm text-pink-600 font-medium">
              {isRTL && card.company_ar ? card.company_ar : card.company}
            </p>
          )}
        </div>

        {/* Bio */}
        {(card.bio || card.bio_ar) && (
          <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 mb-6 shadow-lg border border-white/40">
            <p className="text-slate-700 leading-relaxed text-center">
              {isRTL && card.bio_ar ? card.bio_ar : card.bio}
            </p>
          </div>
        )}

        {/* Contact Actions */}
        <div className="space-y-4 mb-6">
          {card.email && (
            <a
              href={`mailto:${card.email}`}
              onClick={() => onLinkClick?.('email')}
              className="block bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3">
                <Mail className="h-5 w-5" />
                <span className="font-medium">{card.email}</span>
              </div>
            </a>
          )}

          {card.phone && (
            <a
              href={`tel:${card.phone}`}
              onClick={() => onLinkClick?.('phone')}
              className="block bg-gradient-to-r from-pink-400 to-red-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3">
                <Phone className="h-5 w-5" />
                <span className="font-medium">{card.phone}</span>
              </div>
            </a>
          )}

          {card.whatsapp && (
            <a
              href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`}
              onClick={() => onLinkClick?.('whatsapp')}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">WhatsApp</span>
              </div>
            </a>
          )}

          {card.location && (
            <div className="flex items-center justify-center gap-2 text-orange-700 py-2">
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
                  className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-white/40"
                >
                  <Icon className="h-6 w-6 text-orange-600" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}