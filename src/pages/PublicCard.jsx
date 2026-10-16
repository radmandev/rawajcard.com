import React, { useEffect, useState, lazy, Suspense } from'react';
import { useParams } from'react-router-dom';
import { cn } from'@/lib/utils';
import { api, getPublicCardBySlug } from'@/api/supabaseAPI';
import { supabase } from'@/lib/supabaseClient';
import { useQuery } from'@tanstack/react-query';
import ContactFormDialog from'@/components/cards/ContactFormDialog';
import FloatingActions from'@/components/cards/FloatingActions';
import { Loader2, AlertCircle } from'lucide-react';
import { buildTemplateSampleCard, getTemplateSampleBySlug } from'@/lib/templateSampleCards';
import Seo from'@/components/shared/Seo';

// Template map: lazy-loaded so only the 1 template used by this card is downloaded
const templateComponents = {
 navy_gold: lazy(() => import('@/components/cards/templates/TemplateNavyGold')),
 dark_minimal: lazy(() => import('@/components/cards/templates/TemplateDarkMinimal')),
 purple_coral: lazy(() => import('@/components/cards/templates/TemplatePurpleCoral')),
 earthy_minimal: lazy(() => import('@/components/cards/templates/TemplateEarthyMinimal')),
 pink_modern: lazy(() => import('@/components/cards/templates/TemplatePinkModern')),
 orange_pro: lazy(() => import('@/components/cards/templates/TemplateOrangePro')),
 noqtatain1: lazy(() => import('@/components/cards/templates/TemplateNoqtatain1')),
 noqtatain2: lazy(() => import('@/components/cards/templates/TemplateNoqtatain2')),
 noqtatain3: lazy(() => import('@/components/cards/templates/TemplateNoqtatain3')),
 noqtatain4: lazy(() => import('@/components/cards/templates/TemplateNoqtatain4')),
 noqtatain6: lazy(() => import('@/components/cards/templates/TemplateNoqtatain6')),
 modern_gradient: lazy(() => import('@/components/cards/templates/TemplateModernGradient')),
 luxury_gold: lazy(() => import('@/components/cards/templates/TemplateLuxuryGold')),
 tech_blue: lazy(() => import('@/components/cards/templates/TemplateTechBlue')),
 sunset_warm: lazy(() => import('@/components/cards/templates/TemplateSunsetWarm')),
 forest_green: lazy(() => import('@/components/cards/templates/TemplateForestGreen')),
 aurora_glass: lazy(() => import('@/components/cards/templates/TemplateAuroraGlass')),
 elite_crystal: lazy(() => import('@/components/cards/templates/TemplateEliteCrystal')),
 // legacy aliases
 modern: lazy(() => import('@/components/cards/templates/TemplateNavyGold')),
 classic: lazy(() => import('@/components/cards/templates/TemplateDarkMinimal')),
 minimal: lazy(() => import('@/components/cards/templates/TemplateEarthyMinimal')),
 bold: lazy(() => import('@/components/cards/templates/TemplatePurpleCoral')),
 gradient: lazy(() => import('@/components/cards/templates/TemplatePinkModern')),
 elegant: lazy(() => import('@/components/cards/templates/TemplateOrangePro')),
 creative: lazy(() => import('@/components/cards/templates/TemplatePurpleCoral')),
};

// Lazy-load appointment + custom form only when the card actually uses them
const AppointmentSection = lazy(() => import('@/components/cards/AppointmentSection'));
const CustomFormEmbed = lazy(() => import('@/components/cards/CustomFormEmbed'));
const ContactCollectionForm = lazy(() => import('@/components/cards/ContactCollectionForm'));

const TemplateFallback = () => (
 <div className="min-h-64 flex items-center justify-center">
 <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
 </div>
);

export default function PublicCard() {
 const { slug: slugParam } = useParams();
 const urlParams = new URLSearchParams(window.location.search);
 const rawSlug = slugParam || urlParams.get('slug') ||'';
 const slug = decodeURIComponent(String(rawSlug))
 .replace(/[\u200B-\u200D\uFEFF]/g,'') // zero-width chars from some QR scanners
 .replace(/^\/+|\/+$/g,'')
 .trim();
 const source = urlParams.get('source'); //'qr' if from QR scan
 const trackedByRedirect = urlParams.get('trk') ==='1';
 const sampleTemplate = getTemplateSampleBySlug(slug);

 const [visitorId] = useState(() => {
 let id = localStorage.getItem('rawajcard_visitor_id');
 if (!id) {
 id ='v_' + Math.random().toString(36).substr(2, 9);
 localStorage.setItem('rawajcard_visitor_id', id);
 }
 return id;
 });

 const [showContactForm, setShowContactForm] = useState(false);

 // Some mobile QR scanner apps append hidden characters/newlines to the URL.
 // Canonicalize the URL once so slug lookup works consistently.
 useEffect(() => {
 if (!slug || !rawSlug) return;
 if (slug === rawSlug) return;
 const next =`/c/${encodeURIComponent(slug)}${window.location.search ||''}`;
 window.history.replaceState({},'', next);
 }, [slug, rawSlug]);

 // Fetch card by slug — uses SECURITY DEFINER RPC so anon users never touch the table directly
 // @ts-ignore
 const { data: rawCard, isLoading, error } = useQuery({
 queryKey: ['public-card', slug],
 // @ts-ignore
 queryFn: () => getPublicCardBySlug(slug),
 enabled: !!slug,
 staleTime: 5 * 60 * 1000, // 5 minutes
 gcTime: 10 * 60 * 1000, // keep in memory 10 minutes
 });

 const card = rawCard || buildTemplateSampleCard(sampleTemplate, slug);
 const isSampleCard = !!card?.is_sample;

 // Detect RTL from browser language
 // @ts-ignore
 const userLang = typeof navigator !=='undefined' ? (navigator.language || navigator.userLanguage) :'en';
 const isRTL = userLang.startsWith('ar');
 const forcedLanguage = card?.default_language || card?.design?.default_language || 'auto';
 const cardIsRTL = forcedLanguage ==='ar' ? true : forcedLanguage ==='en' ? false : isRTL;

 // Track page view — deferred so it never delays render
 useEffect(() => {
 if (!card || isSampleCard) return;
 // trackedByRedirect=1 means /q/ already fired track_qr_scan; count as page_view here
 const viewType = source ==='qr' && !trackedByRedirect ?'qr_scan' :'page_view';
 const timer = setTimeout(() => {
 supabase.rpc('track_card_view', {
 p_card_id: card.id,
 p_view_type: viewType,
 p_visitor_id: visitorId,
 p_user_agent: navigator.userAgent,
 p_referrer: document.referrer ||''
 });
 }, 2000); // defer 2s — user sees card first
 return () => clearTimeout(timer);
 }, [card?.id, isSampleCard, source, trackedByRedirect, visitorId]);

 // Track link clicks
 const handleLinkClick = (linkType) => {
 if (card && !isSampleCard) {
 supabase.rpc('track_card_view', {
 p_card_id: card.id,
 p_view_type:'link_click',
 p_visitor_id: visitorId,
 p_clicked_link: linkType
 });
 }
 };

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
 <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
 </div>
 );
 }

 if (!card || error) {
 if (card && isSampleCard) {
 // handled below
 } else {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
 <Seo title="Card Not Found | Rawajcard" path={`/c/${encodeURIComponent(slug)}`} noindex />
 <div className="text-center p-8">
 <AlertCircle className="h-16 w-16 mx-auto text-slate-400 mb-4" />
 <h1 className="text-2xl font-bold text-slate-900 mb-2">Card Not Found</h1>
 <p className="text-slate-500">This card doesn&apos;t exist or is not published.</p>
 </div>
 </div>
 );
 }
 }

 const displayName = (cardIsRTL && card.name_ar) ? card.name_ar : card.name;
 const displayTitle = (cardIsRTL && card.title_ar) ? card.title_ar : card.title;
 const displayCompany = (cardIsRTL && card.company_ar) ? card.company_ar : card.company;
 const displayBio = (cardIsRTL && card.bio_ar) ? card.bio_ar : card.bio;
 const cardSeoTitle = [displayName, [displayTitle, displayCompany].filter(Boolean).join(cardIsRTL ? ' - ' : ' at ')]
 .filter(Boolean)
 .join(' | ') + ' | Rawajcard';

 const TemplateComponent = templateComponents[card.template] || templateComponents.navy_gold;

 const cardWithActions = {
 ...card,
 onShareDetails: () => {
 if (!isSampleCard) setShowContactForm(true);
 }
 };

 const shouldRenderExternalContactForm =
 !isSampleCard && !!card?.contact_form?.enabled && card?.contact_form?.form_type !=='inline';

 return (
 <div className={cn("min-h-screen bg-slate-100 flex items-center justify-center p-4", cardIsRTL &&"rtl")}>
 {!isSampleCard && (
 <Seo
 title={cardSeoTitle}
 description={displayBio || (cardIsRTL ? `تواصل مع ${displayName} عبر بطاقة رواج كارد الرقمية.` : `Connect with ${displayName}'s digital business card on Rawajcard.`)}
 path={`/c/${encodeURIComponent(slug)}`}
 image={card.company_logo || null}
 type="profile"
 />
 )}
 {/* Mobile-sized Container */}
 <div className="w-full max-w-md mx-auto relative">
 <div className="bg-indigo-950/60 rounded-3xl shadow-2xl overflow-hidden">
 <Suspense fallback={<TemplateFallback />}>
 <TemplateComponent
 card={cardWithActions}
 isRTL={cardIsRTL}
 onLinkClick={handleLinkClick}
 />
 </Suspense>
 <Suspense fallback={null}>
 {card.appointment_settings?.enabled && <AppointmentSection card={card} isRTL={cardIsRTL} />}
 {card.custom_form?.enabled && <CustomFormEmbed card={card} isRTL={cardIsRTL} />}
 </Suspense>
 </div>

 {/* Powered by Footer */}
 <div className="mt-4 text-center">
 <a
 href="https://rawajcard.com"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/60/90 backdrop-blur-sm shadow-lg text-sm text-slate-500 hover:text-cyan-600 transition-colors"
 >
 <img
 src="/rawajcard-logo.png"
 alt="Rawajcard"
 className="h-4 w-4"
 loading="lazy"
 />
 <span>Get your free card</span>
 </a>
 </div>
 </div>

 {!isSampleCard && (
 <ContactFormDialog
 isOpen={showContactForm}
 onClose={() => setShowContactForm(false)}
 cardId={card.id}
 cardOwner={card.created_by}
 cardName={cardIsRTL && card.name_ar ? card.name_ar : card.name}
 />
 )}

 <FloatingActions
 card={card}
 isRTL={cardIsRTL}
 cardUrl={window.location.href}
 />

 {shouldRenderExternalContactForm && (
 <Suspense fallback={null}>
 <ContactCollectionForm card={card} isRTL={cardIsRTL} />
 </Suspense>
 )}
 </div>
 );
}