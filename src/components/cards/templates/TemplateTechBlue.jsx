import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Linkedin, Instagram, Twitter, Facebook, Globe } from 'lucide-react';

export default function TemplateTechBlue({ card, isRTL, onLinkClick }) {
  const socialIcons = {
    linkedin: Linkedin,
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Geometric patterns */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 border-2 border-blue-400 rotate-45 -translate-x-32 -translate-y-32" />
        <div className="absolute top-1/4 right-0 w-48 h-48 border-2 border-cyan-400 -rotate-12 translate-x-24" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 border-2 border-blue-400 rotate-12 translate-y-28" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      <div className="relative z-10 p-8">
        {/* Tech Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-cyan-400 to-blue-500" />
            <Globe className="h-5 w-5 text-cyan-400" />
            <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-cyan-400 to-blue-500" />
          </div>

          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg blur-xl opacity-50 animate-pulse" />
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-cyan-400 shadow-2xl shadow-cyan-500/50">
                {card.profile_image ? (
                  <img src={card.profile_image} alt={card.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">{(card.name || 'U')[0]}</span>
                  </div>
                )}
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-ping" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {isRTL && card.name_ar ? card.name_ar : card.name}
            </h1>
            
            {(card.title || card.title_ar) && (
              <p className="text-cyan-400 font-mono text-sm mb-2">
                {'{'}  {isRTL && card.title_ar ? card.title_ar : card.title}  {'}'}
              </p>
            )}

            {(card.company || card.company_ar) && (
              <div className="inline-block px-4 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
                <p className="text-sm text-blue-300 font-medium">
                  {isRTL && card.company_ar ? card.company_ar : card.company}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bio Card */}
        {(card.bio || card.bio_ar) && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-500 rounded" />
              <p className="text-gray-300 leading-relaxed text-sm">
                {isRTL && card.bio_ar ? card.bio_ar : card.bio}
              </p>
            </div>
          </div>
        )}

        {/* Contact Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {card.email && (
            <a
              href={`mailto:${card.email}`}
              onClick={() => onLinkClick?.('email')}
              className="col-span-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-4 hover:scale-105 transition-transform shadow-lg hover:shadow-cyan-500/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs text-cyan-200 font-mono">EMAIL</p>
                  <p className="text-white font-medium text-sm truncate">{card.email}</p>
                </div>
              </div>
            </a>
          )}

          {card.phone && (
            <a
              href={`tel:${card.phone}`}
              onClick={() => onLinkClick?.('phone')}
              className="bg-slate-800/70 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4 hover:border-blue-400 hover:bg-slate-800 transition-all"
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                  <Phone className="h-5 w-5 text-cyan-400" />
                </div>
                <p className="text-xs text-cyan-400 font-mono mb-1">CALL</p>
                <p className="text-white text-xs font-medium">{card.phone.slice(0, 12)}...</p>
              </div>
            </a>
          )}

          {card.whatsapp && (
            <a
              href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`}
              onClick={() => onLinkClick?.('whatsapp')}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800/70 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4 hover:border-cyan-400 hover:bg-slate-800 transition-all"
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mx-auto mb-2">
                  <MessageCircle className="h-5 w-5 text-cyan-400" />
                </div>
                <p className="text-xs text-cyan-400 font-mono mb-1">CHAT</p>
                <p className="text-white text-xs font-medium">WhatsApp</p>
              </div>
            </a>
          )}

          {card.location && (
            <div className="col-span-2 flex items-center justify-center gap-2 text-gray-400 py-2">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-mono">{isRTL && card.location_ar ? card.location_ar : card.location}</span>
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
                  className="w-11 h-11 rounded-lg bg-slate-800/50 border border-blue-400/30 flex items-center justify-center hover:bg-blue-500 hover:border-blue-400 transition-all"
                >
                  <Icon className="h-5 w-5 text-cyan-400" />
                </a>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-blue-500/50" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-cyan-400/50 to-blue-500/50" />
        </div>
      </div>
    </div>
  );
}