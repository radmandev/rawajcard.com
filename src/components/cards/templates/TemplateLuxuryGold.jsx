import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Linkedin, Instagram, Twitter, Facebook, Briefcase } from 'lucide-react';
import { getContactArrays, getSocialEntries } from '@/lib/cardContactFields';

export default function TemplateLuxuryGold({ card, isRTL, onLinkClick }) {
  const { phones, emails, whatsapps, websites, locations } = getContactArrays(card);
  const socialIcons = {
    linkedin: Linkedin,
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

      {/* Decorative gold pattern */}
      <div className="absolute top-20 right-0 w-64 h-64 opacity-5">
        <div className="w-full h-full border-4 border-yellow-500 rounded-full" />
        <div className="absolute top-8 left-8 w-48 h-48 border-4 border-yellow-500 rounded-full" />
      </div>

      <div className="relative z-10 p-10">
        {/* Header with Gold Accent */}
        <div className="text-center mb-8 relative">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-8" />
          
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-full blur-2xl" />
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-yellow-500 shadow-2xl shadow-yellow-500/20">
              {card.profile_image ? (
                <img src={card.profile_image} alt={card.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-900 to-yellow-700 flex items-center justify-center">
                  <span className="text-5xl font-bold text-yellow-500">{(card.name || 'U')[0]}</span>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2 tracking-wide">
            <span className="text-yellow-500">{isRTL && card.name_ar ? card.name_ar : card.name}</span>
          </h1>
          
          {(card.title || card.title_ar) && (
            <div className="flex items-center justify-center gap-2 text-gray-300 mb-2">
              <Briefcase className="h-4 w-4 text-yellow-500" />
              <p className="text-lg font-light tracking-wide">
                {isRTL && card.title_ar ? card.title_ar : card.title}
              </p>
            </div>
          )}

          {(card.company || card.company_ar) && (
            <p className="text-sm text-slate-400 font-light uppercase tracking-widest">
              {isRTL && card.company_ar ? card.company_ar : card.company}
            </p>
          )}

          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mt-8" />
        </div>

        {/* Bio */}
        {(card.bio || card.bio_ar) && (
          <div className="max-w-md mx-auto mb-8 p-6 bg-gradient-to-br from-yellow-900/10 to-yellow-800/5 border border-yellow-500/20 rounded-2xl backdrop-blur-sm">
            <p className="text-gray-300 leading-relaxed text-center text-sm font-light italic">
              "{isRTL && card.bio_ar ? card.bio_ar : card.bio}"
            </p>
          </div>
        )}

        {/* Contact Cards */}
        <div className="max-w-md mx-auto space-y-4 mb-8">
          {emails.map((e, i) => (
            <a
              key={i}
              href={`mailto:${e}`}
              onClick={() => onLinkClick?.('email')}
              className="block bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-2 border-yellow-500/30 rounded-xl p-4 hover:border-yellow-500 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                  <Mail className="h-5 w-5 text-yellow-500 group-hover:text-black" />
                </div>
                <div className="flex-1 text-left">
                  {i === 0 && <p className="text-xs text-slate-400 uppercase tracking-wide">Email</p>}
                  <p className="text-white font-medium">{e}</p>
                </div>
              </div>
            </a>
          ))}

          {phones.map((p, i) => (
            <a
              key={i}
              href={`tel:${p}`}
              onClick={() => onLinkClick?.('phone')}
              className="block bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-2 border-yellow-500/30 rounded-xl p-4 hover:border-yellow-500 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                  <Phone className="h-5 w-5 text-yellow-500 group-hover:text-black" />
                </div>
                <div className="flex-1 text-left">
                  {i === 0 && <p className="text-xs text-slate-400 uppercase tracking-wide">Phone</p>}
                  <p className="text-white font-medium">{p}</p>
                </div>
              </div>
            </a>
          ))}

          {whatsapps.map((w, i) => (
            <a
              key={i}
              href={`https://wa.me/${w.replace(/[^0-9]/g, '')}`}
              onClick={() => onLinkClick?.('whatsapp')}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-2 border-yellow-500/30 rounded-xl p-4 hover:border-yellow-500 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                  <MessageCircle className="h-5 w-5 text-yellow-500 group-hover:text-black" />
                </div>
                <div className="flex-1 text-left">
                  {i === 0 && <p className="text-xs text-slate-400 uppercase tracking-wide">WhatsApp</p>}
                  <p className="text-white font-medium">Message Me</p>
                </div>
              </div>
            </a>
          ))}

          {locations.map((loc, i) => (
            <div key={i} className="flex items-center justify-center gap-2 text-slate-400 pt-4">
              <MapPin className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{i === 0 && isRTL && card.location_ar ? card.location_ar : loc}</span>
            </div>
          ))}
        </div>

        {/* Social Links */}
        {getSocialEntries(card.social_links).length > 0 && (
          <div className="flex justify-center gap-4 flex-wrap">
            {getSocialEntries(card.social_links).map(([platform, url, label], i) => {
              if (!url) return null;
              const Icon = socialIcons[platform];
              if (!Icon) return null;

              return (
                <a
                  key={`${platform}-${i}`}
                  href={url}
                  onClick={() => onLinkClick?.(platform)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1"
                >
                  <span className="w-12 h-12 rounded-full border-2 border-yellow-500/30 flex items-center justify-center hover:bg-yellow-500 hover:border-yellow-500 transition-all group">
                    <Icon className="h-5 w-5 text-yellow-500 group-hover:text-black" />
                  </span>
                  {label && <span className="max-w-[96px] truncate text-xs text-slate-400">{label}</span>}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}