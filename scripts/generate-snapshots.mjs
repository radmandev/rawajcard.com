// Writes a static index.html per public route into dist/<route>/index.html, each with
// route-specific <title>/description/canonical/OG/Twitter/JSON-LD baked into the raw HTML.
//
// Why: the app is 100% client-rendered (see vite.config.js — no SSR/prerender). Googlebot
// eventually executes JS and picks up react-helmet-async's tags, but link-preview bots
// (WhatsApp, Facebook, LinkedIn, X, Slack) never run JS — they only ever see the first HTTP
// response. Apache already serves any real file/directory before falling back to the SPA
// shell (see public/.htaccess), so dropping a real index.html at e.g. dist/Pricing/index.html
// makes that route's tags visible to those bots with zero server changes. The file still boots
// the exact same JS bundle, so real visitors get the full interactive app as before.
//
// Scope: static routes + published products only. /c/:slug (public cards) is intentionally
// excluded — the `business_cards` table blocks anonymous bulk SELECT via RLS (by design, to
// stop card enumeration/scraping), and only a single-slug lookup RPC is exposed. Instead,
// public/card-og.php renders card tags per request for link-preview bots (routed there by
// public/.htaccess); this script just writes the Supabase config it needs into dist/.
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const SITE_URL = 'https://rawajcard.com';
const DEFAULT_IMAGE = `${SITE_URL}/rawajcard-logo1.png`;

function loadEnv() {
  const envPath = resolve(rootDir, '.env');
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHeadBlock({ title, description, path, image = DEFAULT_IMAGE, type = 'website', jsonLd = [] }) {
  const url = `${SITE_URL}${path}`;
  const t = escapeHtml(title);
  const d = escapeHtml(description || '');
  const img = escapeHtml(image);

  const jsonLdBlocks = jsonLd
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n    ');

  return `<!-- seo:start — replaced per-route by scripts/generate-snapshots.mjs, keep this exact block shape -->
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="Rawajcard" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    ${jsonLdBlocks}
    <!-- seo:end -->`;
}

function writeSnapshot(template, routePath, headBlock) {
  const marker = /<!-- seo:start[\s\S]*?<!-- seo:end -->/;
  if (!marker.test(template)) {
    throw new Error('seo:start/seo:end markers not found in dist/index.html — did index.html change shape?');
  }
  const html = template.replace(marker, headBlock);
  const outDir = routePath === '/' ? distDir : resolve(distDir, `.${routePath}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), html, 'utf8');
}

function articleJsonLd({ title, description, path, date }) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      datePublished: date,
      author: { '@type': 'Organization', name: 'Rawajcard' },
      publisher: { '@type': 'Organization', name: 'Rawajcard' },
      mainEntityOfPage: `${SITE_URL}${path}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
        { '@type': 'ListItem', position: 3, name: title, item: `${SITE_URL}${path}` },
      ],
    },
  ];
}

const staticPages = [
  {
    path: '/',
    title: 'Rawajcard | بطاقات أعمال ذكية NFC – Smart NFC Business Cards',
    description: 'بطاقات أعمال ذكية بتقنية NFC من رواج كارد — شارك بياناتك ومنصاتك الاجتماعية بلمسة واحدة، واجمع تقييمات جوجل بسهولة. اطلب بطاقتك المخصصة الآن في السعودية.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Rawajcard',
        url: SITE_URL,
        logo: DEFAULT_IMAGE,
        sameAs: [
          'https://www.facebook.com/rawajcard',
          'https://twitter.com/rawajcard',
          'https://www.instagram.com/rawajcard',
        ],
      },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Rawajcard', url: SITE_URL },
    ],
  },
  {
    path: '/products',
    title: 'منتجاتنا | بطاقات أعمال ذكية NFC، تعليقات مفاتيح وستاندات – Rawajcard',
    description: 'تسوّق بطاقات الأعمال الذكية NFC، بطاقات تقييم جوجل، تعليقات المفاتيح وستاندات الطاولة من رواج كارد. تصميم مخصص وتوصيل سريع في السعودية.',
  },
  {
    path: '/Pricing',
    title: 'الأسعار | خطط بطاقات NFC الذكية – Rawajcard Pricing',
    description: 'خطط تسعير بسيطة وشفافة لبطاقات الأعمال الذكية NFC من رواج كارد. اختر الخطة المناسبة لك أو لفريقك وابدأ اليوم.',
  },
  {
    path: '/CardSamples',
    title: 'نماذج البطاقات الرقمية | قوالب Rawajcard NFC',
    description: 'استعرض جميع قوالب البطاقات الرقمية من رواج كارد واختر التصميم المناسب لهويتك أو علامتك التجارية.',
  },
  {
    path: '/guides',
    title: 'دليل بطاقات الأعمال الذكية NFC | مقالات رواج كارد',
    description: 'مقالات ودلائل عملية عن بطاقات الأعمال الذكية NFC: كيف تعمل، كيف تصنع بطاقة رقمية، والفرق بينها وبين رمز QR.',
  },
  // Kept in sync manually with src/components/shared/guidesData.jsx (see note in generate-sitemap.mjs).
  (() => {
    const p = {
      path: '/guides/what-is-nfc-business-card',
      title: 'ما هي بطاقة الأعمال NFC وكيف تعمل؟ | Rawajcard',
      description: 'دليل مبسّط لتقنية NFC في بطاقات الأعمال الذكية: كيف تنقل بياناتك بلمسة واحدة، وماذا يمكنك مشاركته، ولماذا تُعد بديلاً أذكى من البطاقة الورقية.',
      type: 'article',
      date: '2026-06-02',
    };
    return { ...p, jsonLd: articleJsonLd(p) };
  })(),
  (() => {
    const p = {
      path: '/guides/how-to-make-digital-business-card',
      title: 'كيف تصنع بطاقة أعمال رقمية خطوة بخطوة | Rawajcard',
      description: 'دليل عملي لإنشاء بطاقة أعمال رقمية احترافية في دقائق: من اختيار التصميم إلى إضافة بياناتك ومشاركتها بلمسة واحدة.',
      type: 'article',
      date: '2026-06-16',
    };
    return { ...p, jsonLd: articleJsonLd(p) };
  })(),
  (() => {
    const p = {
      path: '/guides/nfc-vs-qr-business-card',
      title: 'بطاقة NFC أم رمز QR: أيهما أفضل لبطاقة أعمالك؟ | Rawajcard',
      description: 'مقارنة عملية بين بطاقات الأعمال بتقنية NFC ورموز QR: الفرق في السرعة، الموثوقية، والانطباع الذي يتركه كل خيار.',
      type: 'article',
      date: '2026-07-05',
    };
    return { ...p, jsonLd: articleJsonLd(p) };
  })(),
  {
    path: '/PrivacyPolicy',
    title: 'Privacy Policy | Rawajcard',
    description: "How Rawajcard collects, uses, and protects your data across our smart NFC business cards and digital profiles.",
  },
  {
    path: '/PaymentsPolicy',
    title: 'Payments Policy | Rawajcard',
    description: "Accepted payment methods, billing timing, and payment terms for Rawajcard's smart NFC business cards.",
  },
  {
    path: '/Return',
    title: 'Return Policy | Rawajcard',
    description: "Exchange and return terms for Rawajcard's smart NFC business cards and physical products.",
  },
];

async function getProductPages() {
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[snapshots] Supabase env vars missing — skipping product pages.');
    return [];
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, name_ar, description, description_ar, price, main_image')
    .eq('status', 'published');

  if (error) {
    console.warn('[snapshots] Could not fetch products:', error.message);
    return [];
  }

  return (data || [])
    .filter((p) => p.slug || p.id)
    .map((p) => {
      const slug = p.slug || p.id;
      const name = p.name_ar || p.name;
      const description = p.description_ar || p.description || `اطلب ${name} من رواج كارد بسعر ${p.price} ر.س.`;
      const path = `/products/${encodeURIComponent(slug)}`;
      return {
        path,
        title: `${name} | Rawajcard`,
        description,
        image: p.main_image || DEFAULT_IMAGE,
        type: 'product',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name,
            description,
            image: p.main_image ? [p.main_image] : undefined,
            sku: String(p.id),
            offers: {
              '@type': 'Offer',
              url: `${SITE_URL}${path}`,
              priceCurrency: 'SAR',
              price: String(p.price),
              availability: 'https://schema.org/InStock',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
              { '@type': 'ListItem', position: 3, name, item: `${SITE_URL}${path}` },
            ],
          },
        ],
      };
    });
}

if (!existsSync(resolve(distDir, 'index.html'))) {
  console.warn('[snapshots] dist/index.html not found — run `vite build` first. Skipping.');
  process.exit(0);
}

const template = readFileSync(resolve(distDir, 'index.html'), 'utf8');
const productPages = await getProductPages();
const pages = [...staticPages, ...productPages];

for (const page of pages) {
  const headBlock = buildHeadBlock(page);
  writeSnapshot(template, page.path, headBlock);
}

console.log(`[snapshots] Wrote ${pages.length} static route snapshots into dist/`);

// card-og.php calls the public get_public_card_by_slug RPC with the same URL + anon key the
// SPA bundle already ships, so they're not secrets — PHP just can't read Vite's env.
if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
  const phpString = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  writeFileSync(
    resolve(distDir, 'card-og-config.php'),
    `<?php\nreturn ['url' => ${phpString(env.VITE_SUPABASE_URL)}, 'key' => ${phpString(env.VITE_SUPABASE_ANON_KEY)}];\n`,
    'utf8'
  );
  console.log('[snapshots] Wrote dist/card-og-config.php for card link previews');
} else {
  console.warn('[snapshots] Supabase env vars missing — card link previews will fall back to the default tags.');
}
