-- ══════════════════════════════════════════════════════════════════
-- Run this entire file in: Supabase Dashboard → SQL Editor → Run
-- ══════════════════════════════════════════════════════════════════

-- Products table for the Rawaj store
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  name_ar       text,
  slug          text unique not null,
  description   text,
  description_ar text,
  seo_keywords  text,          -- comma-separated keywords
  main_image    text,          -- primary image URL
  extra_images  jsonb default '[]'::jsonb,  -- array of additional image URLs
  price         numeric(10,2) not null default 0,
  sale_price    numeric(10,2),              -- null = no sale
  category      text default 'business_cards',
  status        text default 'draft',       -- 'draft' | 'published'
  sort_order    int default 0,
  is_customizable boolean default false,
  features_en   jsonb default '[]'::jsonb,
  features_ar   jsonb default '[]'::jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-update updated_at
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- RLS: anyone can read published products, only admin can write
alter table public.products enable row level security;

create policy "Public can read published products"
  on public.products for select
  using (status = 'published');

create policy "Admins can do everything with products"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    or auth.email() in ('emadradman.dev@gmail.com', 'admin@rawajcard.com')
  );

-- ══════════════════════════════════════════════════════════════════
-- Seed: initial products (skip if already exist)
-- price  = regular/base price
-- sale_price = discounted price (null if no discount)
-- ══════════════════════════════════════════════════════════════════
insert into public.products
  (name, name_ar, slug, description, description_ar, main_image,
   price, sale_price, category, status, sort_order,
   is_customizable, features_en, features_ar)
values
  (
    'Metal Magnetic NFC Card',
    'بطاقة تعارف ممغنطة معدني - نضع تصميمك',
    'metal-nfc-card',
    'Premium metal NFC card with custom design',
    'بطاقة معدنية فاخرة مع تصميمك الخاص',
    'https://rawaj.click/wp-content/uploads/2024/12/Frame_44_1b99c720-5d9b-492e-b5fa-ea176d50a2ad-450x450.webp',
    130, null, 'business_cards', 'published', 1, true,
    '["Metal material","Magnetic","Custom design","Premium finish"]',
    '["مادة معدنية","مغناطيسي","تصميم مخصص","لمسة نهائية فاخرة"]'
  ),
  (
    'Wooden NFC Business Card',
    'بطاقة تعارف إلكتروني للمشاركة السريعة NFC - خشبي (تصميم مخصص)',
    'wooden-nfc-card',
    'Elegant wooden NFC business card with custom design',
    'بطاقة خشبية أنيقة بتصميم مخصص',
    'https://rawaj.click/wp-content/uploads/2024/10/%D8%B9%D9%85%D8%A7%D8%AF-%D8%B1%D8%AF%D9%85%D8%A7%D9%86-3-450x450.png',
    100, null, 'business_cards', 'published', 2, true,
    '["Natural wood","Laser engraving","Eco-friendly","Custom design"]',
    '["خشب طبيعي","حفر بالليزر","صديق للبيئة","تصميم مخصص"]'
  ),
  (
    'Magnetic NFC Business Card',
    'بطاقة تعارف ممغنطة NFC (تصميم مخصص)',
    'magnetic-nfc-card',
    'Premium plastic NFC card with magnetic feature',
    'بطاقة بلاستيكية فاخرة مع ميزة مغناطيسية',
    'https://rawaj.click/wp-content/uploads/2024/10/6-450x450.png',
    50, null, 'business_cards', 'published', 3, true,
    '["Magnetic back","Custom design","Premium plastic","Quick sharing"]',
    '["ظهر مغناطيسي","تصميم مخصص","بلاستيك فاخر","مشاركة سريعة"]'
  ),
  (
    'Google Review NFC Card',
    'بطاقة قيمنا على جوجل - NFC',
    'google-review-card',
    'Collect Google reviews effortlessly',
    'اجمع تقييمات جوجل بسهولة',
    'https://rawaj.click/wp-content/uploads/2024/12/Google-NFC-Instagam-Facebook-WhatsApp-Youtube-Snapchat-Android-iPhone-450x450.webp',
    60, 35, 'business_cards', 'published', 4, true,
    '["Direct to Google","Instant reviews","Professional look","Easy to use"]',
    '["مباشرة لجوجل","تقييمات فورية","مظهر احترافي","سهل الاستخدام"]'
  ),
  (
    'NFC Review Keychain',
    'تعليقة مفاتيح NFC لزيادة مراجعات',
    'review-keychain',
    'Portable NFC keychain for collecting reviews',
    'تعليقة مفاتيح محمولة لجمع التقييمات',
    'https://rawaj.click/wp-content/uploads/2024/12/NFC-Epoxy-Keychain-NFC-Google-450x450.webp',
    75, 45, 'keychains', 'published', 5, true,
    '["Compact design","Durable","Multiple colors","Review collection"]',
    '["تصميم مدمج","متين","ألوان متعددة","جمع التقييمات"]'
  ),
  (
    'Social Media NFC Keychain',
    'تعليقة مفاتيح وسائل التواصل (NFC)',
    'social-keychain',
    'Share social media profiles instantly',
    'شارك حساباتك على وسائل التواصل فوراً',
    'https://rawaj.click/wp-content/uploads/2024/12/Instagram-NFC-Epoxy-Tag-NFC-Key-Card-13-56MHz-URL-Link-450x450.webp',
    35, null, 'keychains', 'published', 6, true,
    '["All platforms","Instant connect","Stylish design","Multiple options"]',
    '["جميع المنصات","اتصال فوري","تصميم أنيق","خيارات متعددة"]'
  ),
  (
    'Premium Google Review Table Stand - NFC',
    'ستاند طاولة فخامة لطلب التقييم على جوجل - NFC',
    'premium-table-stand',
    'Elegant table stand for collecting reviews',
    'ستاند طاولة أنيق لجمع التقييمات',
    'https://rawaj.click/wp-content/uploads/2024/12/unnamed-file-12-450x450.webp',
    120, null, 'stands', 'published', 7, false,
    '["Premium acrylic","Desk stand","Professional look","Easy placement"]',
    '["أكريليك فاخر","حامل مكتب","مظهر احترافي","وضع سهل"]'
  ),
  (
    'Quick Share Table Stand',
    'ستاند طاولة للمشاركة السريعة (معلومات التواصل الاجتماعي، منيو، الموقع..)',
    'quick-share-stand',
    'Share contacts, menu, location instantly',
    'شارك جهات الاتصال والمنيو والموقع فوراً',
    'https://rawaj.click/wp-content/uploads/2024/10/InstagramStandwhite_1800x1800-450x450.webp',
    159, 129, 'stands', 'published', 8, true,
    '["Multi-purpose","Acrylic stand","Custom info","Restaurant ready"]',
    '["متعدد الأغراض","حامل أكريليك","معلومات مخصصة","جاهز للمطاعم"]'
  )
on conflict (slug) do nothing;
