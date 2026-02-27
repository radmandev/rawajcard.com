import React, { useState, useEffect } from 'react';
import {
  Phone, Mail, MapPin, Globe, MessageCircle,
  Linkedin, Instagram, Facebook, Youtube, Github,
  UserPlus, Share2, ExternalLink, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── tiny X/Twitter svg ─── */
const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SOCIAL_ICONS = {
  linkedin: Linkedin, instagram: Instagram, facebook: Facebook,
  youtube: Youtube, github: Github, twitter: XIcon,
};

/* ─── animated aurora keyframes injected once ─── */
const STYLES = `
@keyframes aurora-shift {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes float-up {
  0%   { transform: translateY(0)   scale(1);   opacity:.6; }
  100% { transform: translateY(-120px) scale(1.4); opacity:0; }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes pulse-ring {
  0%,100% { transform: scale(1);   opacity:.6; }
  50%     { transform: scale(1.12); opacity:.2; }
}
@keyframes slide-up {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0);    }
}
.aurora-bg {
  background: linear-gradient(135deg,#0f0c29,#1a0533,#0d1b6e,#0a2744,#041524);
  background-size: 400% 400%;
  animation: aurora-shift 8s ease infinite;
}
.shimmer-text {
  background: linear-gradient(90deg, #e2e8f0 0%, #a78bfa 30%, #38bdf8 60%, #e2e8f0 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}
.glass-card {
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.12);
}
.glass-card-light {
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.15);
}
.slide-up-1 { animation: slide-up .5s ease both .05s; }
.slide-up-2 { animation: slide-up .5s ease both .15s; }
.slide-up-3 { animation: slide-up .5s ease both .25s; }
.slide-up-4 { animation: slide-up .5s ease both .35s; }
.slide-up-5 { animation: slide-up .5s ease both .45s; }
`;

/* ─── one floating particle ─── */
const Particle = ({ style }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      animation: `float-up ${style.dur}s ease-in infinite`,
      animationDelay: `${style.delay}s`,
      width: style.size, height: style.size,
      left: style.left, bottom: style.bottom,
      background: style.color,
      filter: 'blur(1px)',
    }}
  />
);

const PARTICLES = [
  { dur:4, delay:0,   size:'6px',  left:'12%',  bottom:'5%',  color:'rgba(167,139,250,.7)' },
  { dur:5, delay:1.2, size:'4px',  left:'28%',  bottom:'8%',  color:'rgba(56,189,248,.7)' },
  { dur:3.5,delay:.5, size:'8px',  left:'45%',  bottom:'3%',  color:'rgba(244,114,182,.6)' },
  { dur:6, delay:2,   size:'5px',  left:'60%',  bottom:'10%', color:'rgba(167,139,250,.5)' },
  { dur:4.5,delay:.8, size:'4px',  left:'75%',  bottom:'6%',  color:'rgba(56,189,248,.6)' },
  { dur:5.5,delay:1.8,size:'7px',  left:'88%',  bottom:'4%',  color:'rgba(244,114,182,.5)' },
  { dur:3.8,delay:3,  size:'5px',  left:'20%',  bottom:'15%', color:'rgba(167,139,250,.4)' },
  { dur:4.2,delay:2.5,size:'6px',  left:'55%',  bottom:'20%', color:'rgba(56,189,248,.4)' },
];

export default function TemplateAuroraGlass({ card, isRTL, onLinkClick }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const name      = isRTL && card.name_ar    ? card.name_ar    : card.name;
  const title     = isRTL && card.title_ar   ? card.title_ar   : card.title;
  const company   = isRTL && card.company_ar ? card.company_ar : card.company;
  const bio       = isRTL && card.bio_ar     ? card.bio_ar     : card.bio;
  const initials  = (name || 'R').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const socialEntries = Object.entries(card.social_links || {}).filter(([, v]) => v);

  const handleSave = () => {
    const vcard = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `FN:${card.name || ''}`,
      `TITLE:${card.title || ''}`,
      `ORG:${card.company || ''}`,
      `TEL:${card.phone || ''}`,
      `EMAIL:${card.email || ''}`,
      `URL:${card.website || ''}`,
      'END:VCARD'
    ].join('\n');
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${card.name || 'contact'}.vcf`; a.click();
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    onLinkClick?.('save_contact');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: name, url }); }
    else { navigator.clipboard.writeText(url); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    onLinkClick?.('share');
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className={cn('relative min-h-screen aurora-bg overflow-hidden', isRTL ? 'rtl' : 'ltr')}>

        {/* ── Background aurora blobs ── */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(139,92,246,.35) 0%, transparent 70%)', filter:'blur(40px)' }} />
        <div className="absolute top-[20%] right-[-60px] w-64 h-64 rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(56,189,248,.3) 0%, transparent 70%)', filter:'blur(40px)' }} />
        <div className="absolute bottom-[10%] left-[20%] w-72 h-72 rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(244,114,182,.25) 0%, transparent 70%)', filter:'blur(40px)' }} />

        {/* ── Floating particles ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((p, i) => <Particle key={i} style={p} />)}
        </div>

        <div className="relative z-10 px-5 py-10 flex flex-col items-center max-w-md mx-auto">

          {/* ── Avatar ── */}
          <div className="slide-up-1 relative mb-6">
            {/* pulse ring */}
            <div className="absolute inset-[-6px] rounded-full pointer-events-none"
              style={{
                background:'conic-gradient(from 0deg, #a78bfa, #38bdf8, #f472b6, #a78bfa)',
                animation:'pulse-ring 3s ease-in-out infinite',
              }} />
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-[3px] border-white/20 shadow-2xl">
              {card.profile_image ? (
                <img src={card.profile_image} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb,#0891b2)' }}>
                  <span className="text-3xl font-bold text-white">{initials}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Name & title ── */}
          <div className="slide-up-2 text-center mb-8 w-full">
            <h1 className="shimmer-text text-3xl font-extrabold tracking-tight mb-1">{name}</h1>
            {title   && <p className="text-violet-200 font-medium text-base mb-0.5">{title}</p>}
            {company && (
              <p className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold text-sky-300 mt-1"
                style={{ background:'rgba(56,189,248,.12)', border:'1px solid rgba(56,189,248,.25)' }}>
                {company}
              </p>
            )}
          </div>

          {/* ── Bio ── */}
          {bio && (
            <div className="slide-up-2 glass-card rounded-2xl p-5 mb-6 w-full text-center">
              <p className="text-slate-300 text-sm leading-relaxed">{bio}</p>
            </div>
          )}

          {/* ── Contact buttons ── */}
          <div className="slide-up-3 w-full space-y-3 mb-6">
            {card.phone && (
              <a href={`tel:${card.phone}`} onClick={() => onLinkClick?.('phone')}
                className="flex items-center gap-3 glass-card-light rounded-2xl px-5 py-4 text-white transition-all hover:scale-[1.02] active:scale-[.98] group">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'linear-gradient(135deg,#6d28d9,#4f46e5)' }}>
                  <Phone className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-medium">{card.phone}</span>
                <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" />
              </a>
            )}

            {card.whatsapp && (
              <a href={`https://wa.me/${card.whatsapp.replace(/\D/g,'')}`} onClick={() => onLinkClick?.('whatsapp')}
                className="flex items-center gap-3 glass-card-light rounded-2xl px-5 py-4 text-white transition-all hover:scale-[1.02] active:scale-[.98] group">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'linear-gradient(135deg,#16a34a,#15803d)' }}>
                  <MessageCircle className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-medium">WhatsApp</span>
                <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" />
              </a>
            )}

            {card.email && (
              <a href={`mailto:${card.email}`} onClick={() => onLinkClick?.('email')}
                className="flex items-center gap-3 glass-card-light rounded-2xl px-5 py-4 text-white transition-all hover:scale-[1.02] active:scale-[.98] group">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'linear-gradient(135deg,#0369a1,#0284c7)' }}>
                  <Mail className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-medium truncate">{card.email}</span>
                <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" />
              </a>
            )}

            {card.website && (
              <a href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
                target="_blank" rel="noreferrer" onClick={() => onLinkClick?.('website')}
                className="flex items-center gap-3 glass-card-light rounded-2xl px-5 py-4 text-white transition-all hover:scale-[1.02] active:scale-[.98] group">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
                  <Globe className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-medium truncate">{card.website}</span>
                <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" />
              </a>
            )}

            {card.location && (
              <div className="flex items-center gap-3 glass-card-light rounded-2xl px-5 py-4 text-white">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'linear-gradient(135deg,#be185d,#db2777)' }}>
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">
                  {isRTL && card.location_ar ? card.location_ar : card.location}
                </span>
              </div>
            )}
          </div>

          {/* ── Social links ── */}
          {socialEntries.length > 0 && (
            <div className="slide-up-4 w-full mb-6">
              <p className="text-center text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
                {isRTL ? 'تواصل معي' : 'Connect'}
              </p>
              <div className="flex justify-center flex-wrap gap-3">
                {socialEntries.map(([platform, url]) => {
                  const Icon = SOCIAL_ICONS[platform] || Globe;
                  const href = url.startsWith('http') ? url : `https://${url}`;
                  return (
                    <a key={platform} href={href} target="_blank" rel="noreferrer"
                      onClick={() => onLinkClick?.(platform)}
                      className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all"
                      style={{ border:'1px solid rgba(255,255,255,.15)' }}>
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CTA row ── */}
          <div className="slide-up-5 w-full grid grid-cols-2 gap-3">
            <button onClick={handleSave}
              className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.03] active:scale-[.97]"
              style={{
                background: saved
                  ? 'linear-gradient(135deg,#16a34a,#15803d)'
                  : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                boxShadow: '0 4px 24px rgba(124,58,237,.4)',
              }}>
              <UserPlus className="h-4 w-4" />
              {saved ? (isRTL ? 'تم!' : 'Saved!') : (isRTL ? 'حفظ جهة الاتصال' : 'Save Contact')}
            </button>

            <button onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.03] active:scale-[.97]"
              style={{
                background: copied
                  ? 'linear-gradient(135deg,#16a34a,#15803d)'
                  : 'linear-gradient(135deg,#0369a1,#0284c7)',
                boxShadow: '0 4px 24px rgba(3,105,161,.4)',
              }}>
              <Share2 className="h-4 w-4" />
              {copied ? (isRTL ? 'تم النسخ!' : 'Copied!') : (isRTL ? 'مشاركة' : 'Share')}
            </button>
          </div>

          {/* ── Rawaj footer ── */}
          <p className="mt-8 text-center text-[11px] text-white/25">
            {isRTL ? 'مدعوم من رواج كارد' : 'Powered by Rawaj Card'}
          </p>
        </div>
      </div>
    </>
  );
}
