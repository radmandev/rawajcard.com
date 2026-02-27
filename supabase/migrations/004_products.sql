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
