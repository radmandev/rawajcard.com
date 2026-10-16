import React, { useState } from 'react';
import { getContactArrays, buildVCard, getSocialEntries } from '@/lib/cardContactFields';
import {
  Phone, Mail, MapPin, Globe, MessageCircle,
  Linkedin, Instagram, Facebook, Youtube, Github,
  UserPlus, Share2, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SOCIAL_ICONS = {
  linkedin: Linkedin, instagram: Instagram, facebook: Facebook,
  youtube: Youtube, github: Github, twitter: XIcon,
};

/* ── Geometric mandala ornament ── */
const Mandala = ({ size = 48, gold = '#c8a96e', bg = '#0c0c0c' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="49" fill={bg} stroke={gold} strokeWidth="1.2" />
    <circle cx="50" cy="50" r="38" fill="none" stroke={gold} strokeWidth="0.7" opacity="0.5" />
    <circle cx="50" cy="50" r="24" fill="none" stroke={gold} strokeWidth="0.7" opacity="0.7" />
    <circle cx="50" cy="50" r="10" fill="none" stroke={gold} strokeWidth="0.6" opacity="0.8" />
    <circle cx="50" cy="50" r="4"  fill={gold} opacity="0.9" />
    {[0,45,90,135,180,225,270,315].map(a => {
      const r = (a * Math.PI) / 180;
      return (
        <line key={a}
          x1={50 + 10 * Math.cos(r)} y1={50 + 10 * Math.sin(r)}
          x2={50 + 38 * Math.cos(r)} y2={50 + 38 * Math.sin(r)}
          stroke={gold} strokeWidth="0.7" opacity="0.55"
        />
      );
    })}
    {[0,45,90,135,180,225,270,315].map(a => {
      const r = (a * Math.PI) / 180;
      return <circle key={a} cx={50 + 24 * Math.cos(r)} cy={50 + 24 * Math.sin(r)} r="2.5" fill={gold} opacity="0.75" />;
    })}
    {[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map(a => {
      const r = (a * Math.PI) / 180;
      return <circle key={a} cx={50 + 38 * Math.cos(r)} cy={50 + 38 * Math.sin(r)} r="1.8" fill={gold} opacity="0.5" />;
    })}
  </svg>
);

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Montserrat:wght@200;300;400;500;600&display=swap');

@keyframes ec-shimmer {
  0%   { background-position: -300% center; }
  100% { background-position:  300% center; }
}
@keyframes ec-fade-up {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes ec-ring-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes ec-mandala-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.ec-name-shimmer {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  background: linear-gradient(90deg, #8a6520 0%, #c8a96e 25%, #f5e6c8 50%, #c8a96e 75%, #8a6520 100%);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ec-shimmer 5s linear infinite;
}
.ec-serif  { font-family: 'Cormorant Garamond', serif; }
.ec-sans   { font-family: 'Montserrat', sans-serif; }

.ec-marble {
  background:
    linear-gradient(108deg, rgba(200,169,110,0.035) 0%, transparent 45%),
    linear-gradient(192deg, transparent 35%, rgba(180,150,90,0.025) 75%, transparent 100%),
    linear-gradient(135deg, #faf5ec 0%, #f2e9d8 25%, #faf5ec 55%, #ede2cc 100%);
  position: relative;
}
.ec-dark   { background: #0c0c0c; }
.ec-forest { background: linear-gradient(155deg, #1d3828 0%, #152a1e 60%, #0f2018 100%); }

.ec-gold-row {
  background: rgba(200,169,110,0.05);
  border: 1px solid rgba(200,169,110,0.18);
  border-radius: 8px;
  transition: background 0.2s, border-color 0.2s;
}
.ec-gold-row:hover { background: rgba(200,169,110,0.1); border-color: rgba(200,169,110,0.35); }

.ec-forest-row {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 8px;
  transition: background 0.2s;
}
.ec-forest-row:hover { background: rgba(255,255,255,0.09); }

.ec-su-1 { animation: ec-fade-up .6s ease both .05s; }
.ec-su-2 { animation: ec-fade-up .6s ease both .15s; }
.ec-su-3 { animation: ec-fade-up .6s ease both .28s; }
.ec-su-4 { animation: ec-fade-up .6s ease both .40s; }
.ec-su-5 { animation: ec-fade-up .6s ease both .52s; }
`;

const GOLD   = '#c8a96e';
const DARK   = '#0c0c0c';
const FOREST = '#1d3828';

const GoldDivider = ({ w = '80px', opacity = 0.6 }) => (
  <div style={{
    width: w, height: '1px', margin: '0 auto',
    background: 'linear-gradient(90deg, transparent, #c8a96e, transparent)',
    opacity,
  }} />
);

const FieldLabel = ({ children }) => (
  <p style={{
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '0.5rem', fontWeight: 500,
    letterSpacing: '0.24em', textTransform: 'uppercase',
    color: GOLD, marginBottom: '2px',
  }}>{children}</p>
);

const SectionHeading = ({ children, light = false }) => (
  <p style={{
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '0.58rem', fontWeight: 500,
    letterSpacing: '0.28em', textTransform: 'uppercase',
    color: light ? `${GOLD}99` : GOLD,
    textAlign: 'center',
  }}>{children}</p>
);

export default function TemplateEliteCrystal({ card, isRTL, onLinkClick }) {
  const [saved,  setSaved]  = useState(false);
  const [copied, setCopied] = useState(false);

  const { phones, emails, whatsapps, websites, locations } = getContactArrays(card);

  const name    = isRTL && card.name_ar    ? card.name_ar    : card.name;
  const title   = isRTL && card.title_ar   ? card.title_ar   : card.title;
  const company = isRTL && card.company_ar ? card.company_ar : card.company;
  const bio     = isRTL && card.bio_ar     ? card.bio_ar     : card.bio;
  const initials = (name || 'E').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const socialEntries = getSocialEntries(card.social_links);

  const handleSave = () => {
    const vcard = buildVCard(card);
    const blob  = new Blob([vcard], { type: 'text/vcard' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href = url; a.download = `${card.name || 'contact'}.vcf`; a.click();
    setSaved(true); setTimeout(() => setSaved(false), 2200);
    onLinkClick?.('save_contact');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: name, url }); }
    else { navigator.clipboard.writeText(url); }
    setCopied(true); setTimeout(() => setCopied(false), 2200);
    onLinkClick?.('share');
  };

  const iconCircle = (bg, icon) => (
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{icon}</div>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div className={cn('min-h-screen ec-dark', isRTL ? 'rtl' : 'ltr')}>

        {/* ── TOP BAR — dark with slow-spinning mandala ── */}
        <div className="ec-dark" style={{ borderBottom: `1px solid rgba(200,169,110,0.14)` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px 24px', gap: '18px' }}>
            <div style={{ flex: 1, maxWidth: '56px', height: '1px', background: `linear-gradient(90deg, transparent, ${GOLD}55)` }} />
            <div style={{ animation: 'ec-mandala-spin 40s linear infinite' }}>
              <Mandala size={46} gold={GOLD} bg={DARK} />
            </div>
            <div style={{ flex: 1, maxWidth: '56px', height: '1px', background: `linear-gradient(90deg, ${GOLD}55, transparent)` }} />
          </div>
        </div>

        {/* ── PROFILE — marble / ivory ── */}
        <div className="ec-marble ec-su-1">
          {/* Cover image */}
          {card.cover_image && (
            <div style={{ position: 'relative', height: '150px', overflow: 'hidden' }}>
              <img src={card.cover_image} alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(250,245,236,0.2), rgba(250,245,236,0.96))',
              }} />
            </div>
          )}

          <div style={{
            padding: card.cover_image ? '0 24px 32px' : '36px 24px 32px',
            textAlign: 'center',
          }}>
            {/* Profile image with rotating gold ring */}
            {card.profile_image ? (
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '18px' }}>
                <div style={{
                  position: 'absolute', inset: '-5px', borderRadius: '50%',
                  background: `conic-gradient(from 0deg, transparent 15%, ${GOLD}90 35%, transparent 55%, ${GOLD}60 75%, transparent 95%)`,
                  animation: 'ec-ring-spin 14s linear infinite',
                }} />
                <div style={{
                  position: 'relative', width: '108px', height: '108px', borderRadius: '50%',
                  overflow: 'hidden', border: `2px solid ${GOLD}40`, margin: '0 auto',
                }}>
                  <img src={card.profile_image} alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '18px' }}>
                <div style={{
                  width: '108px', height: '108px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${FOREST} 0%, #2d5a40 100%)`,
                  border: `2px solid ${GOLD}45`, margin: '0 auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', fontWeight: 400, color: GOLD }}>
                    {initials}
                  </span>
                </div>
              </div>
            )}

            {/* Company label — "WHY ELITE CRYSTAL" style */}
            {company && (
              <div style={{ marginBottom: '8px' }}>
                <SectionHeading>{company}</SectionHeading>
              </div>
            )}

            {/* Name — large Cormorant serif, dark on marble */}
            <h1 className="ec-serif" style={{
              fontSize: '2.6rem', fontWeight: 400, lineHeight: 1.1,
              color: '#1a1205', letterSpacing: '0.03em',
              margin: '0 0 6px',
            }}>
              {name}
            </h1>

            {/* Title — italic */}
            {title && (
              <p className="ec-serif" style={{
                fontSize: '1.05rem', fontWeight: 300, fontStyle: 'italic',
                color: '#5a4830', marginBottom: '0',
              }}>
                {title}
              </p>
            )}

            <div style={{ marginTop: '18px' }}>
              <GoldDivider w="100px" opacity={0.65} />
            </div>
          </div>
        </div>

        {/* ── QUICK ACTIONS — dark strip ── */}
        {(phones.length > 0 || emails.length > 0 || whatsapps.length > 0) && (
          <div className="ec-dark ec-su-2" style={{
            padding: '16px 24px',
            borderTop: `1px solid rgba(200,169,110,0.1)`,
            borderBottom: `1px solid rgba(200,169,110,0.1)`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '22px', flexWrap: 'wrap' }}>
              {phones.map((p, i) => (
                <a key={`p${i}`} href={`tel:${p}`} onClick={() => onLinkClick?.('phone')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'rgba(200,169,110,0.1)', border: `1px solid rgba(200,169,110,0.28)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Phone style={{ width: '18px', height: '18px', color: GOLD }} />
                  </div>
                  <span style={{
                    fontFamily: "'Montserrat', sans-serif", fontSize: '0.45rem',
                    letterSpacing: '0.2em', textTransform: 'uppercase', color: `${GOLD}80`,
                  }}>{isRTL ? 'اتصال' : 'CALL'}</span>
                </a>
              ))}
              {emails.map((e, i) => (
                <a key={`e${i}`} href={`mailto:${e}`} onClick={() => onLinkClick?.('email')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'rgba(200,169,110,0.1)', border: `1px solid rgba(200,169,110,0.28)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Mail style={{ width: '18px', height: '18px', color: GOLD }} />
                  </div>
                  <span style={{
                    fontFamily: "'Montserrat', sans-serif", fontSize: '0.45rem',
                    letterSpacing: '0.2em', textTransform: 'uppercase', color: `${GOLD}80`,
                  }}>{isRTL ? 'بريد' : 'EMAIL'}</span>
                </a>
              ))}
              {whatsapps.map((w, i) => (
                <a key={`w${i}`} href={`https://wa.me/${w.replace(/\D/g,'')}`} onClick={() => onLinkClick?.('whatsapp')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'rgba(200,169,110,0.1)', border: `1px solid rgba(200,169,110,0.28)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MessageCircle style={{ width: '18px', height: '18px', color: GOLD }} />
                  </div>
                  <span style={{
                    fontFamily: "'Montserrat', sans-serif", fontSize: '0.45rem',
                    letterSpacing: '0.2em', textTransform: 'uppercase', color: `${GOLD}80`,
                  }}>{isRTL ? 'واتساب' : 'WHATSAPP'}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── BIO — forest green ── */}
        {bio && (
          <div className="ec-forest ec-su-2" style={{ padding: '30px 24px' }}>
            <SectionHeading light>{isRTL ? 'نبذة عني' : 'ABOUT'}</SectionHeading>
            <div style={{ margin: '12px 0 16px' }}>
              <GoldDivider w="50px" opacity={0.4} />
            </div>
            <p className="ec-serif" style={{
              fontSize: '1.15rem', fontWeight: 300, fontStyle: 'italic',
              color: 'rgba(250,245,236,0.82)', lineHeight: 1.75,
              textAlign: 'center',
            }}>
              "{bio}"
            </p>
          </div>
        )}

        {/* ── CONTACT — marble ── */}
        {(phones.length > 0 || emails.length > 0 || locations.length > 0) && (
          <div className="ec-marble ec-su-3" style={{ padding: '30px 18px' }}>
            <SectionHeading>{isRTL ? 'تواصل معنا' : 'CONTACT'}</SectionHeading>
            <div style={{ margin: '12px 0 18px' }}>
              <GoldDivider w="50px" opacity={0.55} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {phones.map((p, i) => (
                <a key={`p${i}`} href={`tel:${p}`} onClick={() => onLinkClick?.('phone')}
                  className="ec-gold-row"
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 15px', textDecoration: 'none' }}>
                  {iconCircle(FOREST, <Phone style={{ width: '14px', height: '14px', color: GOLD }} />)}
                  <div>
                    {i === 0 && <FieldLabel>{isRTL ? 'هاتف' : 'TELEPHONE'}</FieldLabel>}
                    <p className="ec-sans" style={{ fontSize: '0.88rem', fontWeight: 500, color: '#1a1205' }}>{p}</p>
                  </div>
                </a>
              ))}

              {emails.map((e, i) => (
                <a key={`e${i}`} href={`mailto:${e}`} onClick={() => onLinkClick?.('email')}
                  className="ec-gold-row"
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 15px', textDecoration: 'none' }}>
                  {iconCircle(FOREST, <Mail style={{ width: '14px', height: '14px', color: GOLD }} />)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {i === 0 && <FieldLabel>{isRTL ? 'البريد الإلكتروني' : 'EMAIL'}</FieldLabel>}
                    <p className="ec-sans" style={{
                      fontSize: '0.88rem', fontWeight: 500, color: '#1a1205',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{e}</p>
                  </div>
                </a>
              ))}

              {locations.map((loc, i) => {
                const displayLoc = i === 0 && isRTL && card.location_ar ? card.location_ar : loc;
                return (
                  <div key={`loc${i}`} className="ec-gold-row" style={{ padding: '13px 15px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      {iconCircle(FOREST, <MapPin style={{ width: '14px', height: '14px', color: GOLD }} />)}
                      <div style={{ flex: 1 }}>
                        {i === 0 && <FieldLabel>{isRTL ? 'العنوان' : 'ADDRESS'}</FieldLabel>}
                        <p className="ec-sans" style={{ fontSize: '0.88rem', fontWeight: 500, color: '#1a1205' }}>
                          {displayLoc}
                        </p>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayLoc)}`}
                          target="_blank" rel="noopener noreferrer"
                          onClick={() => onLinkClick?.('directions')}
                          style={{
                            fontFamily: "'Montserrat', sans-serif", fontSize: '0.48rem',
                            letterSpacing: '0.2em', textTransform: 'uppercase',
                            color: GOLD, textDecoration: 'none', marginTop: '4px', display: 'inline-block',
                          }}>
                          {isRTL ? 'احصل على الاتجاهات ←' : 'GET DIRECTIONS →'}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── GALLERY — forest green ── */}
        {card.gallery_images && card.gallery_images.length > 0 && (
          <div className="ec-forest ec-su-4" style={{ padding: '28px 18px' }}>
            <SectionHeading light>{isRTL ? 'معرض الأعمال' : 'PORTFOLIO'}</SectionHeading>
            <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              {card.gallery_images.slice(0, 4).map((img, idx) => (
                <img key={idx} src={img} alt="" style={{
                  width: '100%', height: '128px', objectFit: 'cover', borderRadius: '3px',
                  border: `1px solid rgba(200,169,110,0.12)`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* ── WEBSITES — dark ── */}
        {websites.length > 0 && (
          <div className="ec-dark ec-su-4" style={{
            padding: '22px 18px',
            borderTop: `1px solid rgba(200,169,110,0.1)`,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {websites.map((w, i) => (
                <a key={`ws${i}`}
                  href={w.startsWith('http') ? w : `https://${w}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => onLinkClick?.('website')}
                  className="ec-forest-row"
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 15px', textDecoration: 'none' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(200,169,110,0.1)', border: `1px solid rgba(200,169,110,0.22)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Globe style={{ width: '14px', height: '14px', color: GOLD }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <FieldLabel>{isRTL ? 'الموقع الإلكتروني' : 'WEBSITE'}</FieldLabel>
                    <p className="ec-sans" style={{
                      fontSize: '0.85rem', fontWeight: 300, color: 'rgba(250,245,236,0.65)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{w}</p>
                  </div>
                  <ExternalLink style={{ width: '13px', height: '13px', color: `${GOLD}40`, flexShrink: 0 }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── SOCIAL ── */}
        {socialEntries.length > 0 && (
          <div className="ec-forest ec-su-4" style={{
            padding: '26px 18px',
            borderTop: `1px solid rgba(200,169,110,0.12)`,
          }}>
            <SectionHeading light>{isRTL ? 'تابعنا' : 'FOLLOW'}</SectionHeading>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
              {socialEntries.map(([platform, url], i) => {
                const Icon = SOCIAL_ICONS[platform] || Globe;
                return (
                  <a key={`${platform}-${i}`}
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank" rel="noreferrer"
                    onClick={() => onLinkClick?.(platform)}
                    style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: 'rgba(200,169,110,0.08)',
                      border: `1px solid rgba(200,169,110,0.28)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: GOLD, textDecoration: 'none',
                    }}>
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CTA BUTTONS ── */}
        <div className="ec-dark ec-su-5" style={{
          padding: '22px 18px',
          borderTop: `1px solid rgba(200,169,110,0.1)`,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={handleSave} style={{
              padding: '13px 10px', cursor: 'pointer', border: 'none',
              background: saved
                ? 'linear-gradient(135deg,#16a34a,#15803d)'
                : `linear-gradient(135deg, #9c6d26, ${GOLD})`,
              color: saved ? '#fff' : DARK,
              borderRadius: '5px',
              fontFamily: "'Montserrat', sans-serif", fontSize: '0.58rem',
              fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <UserPlus style={{ width: '13px', height: '13px' }} />
              {saved ? (isRTL ? 'تم!' : 'SAVED!') : (isRTL ? 'حفظ' : 'SAVE')}
            </button>
            <button onClick={handleShare} style={{
              padding: '13px 10px', cursor: 'pointer',
              background: copied ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'transparent',
              color: copied ? '#fff' : GOLD,
              border: `1px solid rgba(200,169,110,0.32)`,
              borderRadius: '5px',
              fontFamily: "'Montserrat', sans-serif", fontSize: '0.58rem',
              fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <Share2 style={{ width: '13px', height: '13px' }} />
              {copied ? (isRTL ? 'تم!' : 'COPIED!') : (isRTL ? 'مشاركة' : 'SHARE')}
            </button>
          </div>
        </div>

        {/* ── FOOTER ORNAMENT ── */}
        <div className="ec-dark" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '18px 24px 26px', gap: '14px',
          borderTop: `1px solid rgba(200,169,110,0.07)`,
        }}>
          <div style={{ width: '28px', height: '1px', background: `linear-gradient(90deg, transparent, ${GOLD}45)` }} />
          <Mandala size={26} gold={GOLD} bg={DARK} />
          <div style={{ width: '28px', height: '1px', background: `linear-gradient(90deg, ${GOLD}45, transparent)` }} />
        </div>

      </div>
    </>
  );
}
