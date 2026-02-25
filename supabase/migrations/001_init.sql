-- Core schema for Rawaj Card (fresh start)

create extension if not exists "uuid-ossp";

-- Utility: updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text default 'user',
  crm_config jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Business cards
create table if not exists public.business_cards (
  id uuid primary key default gen_random_uuid(),
  created_by text,
  created_by_user_id uuid default auth.uid(),
  name text,
  name_ar text,
  title text,
  title_ar text,
  company text,
  company_ar text,
  bio text,
  bio_ar text,
  email text,
  phone text,
  whatsapp text,
  website text,
  location text,
  location_ar text,
  profile_image text,
  company_logo text,
  cover_image text,
  template text,
  status text default 'draft',
  slug text unique,
  view_count int default 0,
  scan_count int default 0,
  design jsonb default '{}'::jsonb,
  social_links jsonb default '{}'::jsonb,
  qr_settings jsonb default '{}'::jsonb,
  contact_form jsonb default '{}'::jsonb,
  custom_form jsonb default '{}'::jsonb,
  appointment_settings jsonb default '{}'::jsonb,
  nfc_settings jsonb default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists business_cards_slug_idx on public.business_cards(slug);

create trigger set_business_cards_updated_at
before update on public.business_cards
for each row execute function public.set_updated_at();

-- Card views / scans
create table if not exists public.card_views (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.business_cards(id) on delete cascade,
  card_owner text,
  view_type text,
  clicked_link text,
  visitor_id text,
  user_agent text,
  referrer text,
  created_at timestamptz default now()
);

-- Contact submissions
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.business_cards(id) on delete cascade,
  card_owner text,
  name text,
  email text,
  phone text,
  message text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Custom templates
create table if not exists public.custom_templates (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  created_by text,
  created_by_user_id uuid default auth.uid(),
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_custom_templates_updated_at
before update on public.custom_templates
for each row execute function public.set_updated_at();

-- Customization requests
create table if not exists public.customization_requests (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.business_cards(id) on delete set null,
  created_by text,
  created_by_user_id uuid default auth.uid(),
  status text default 'pending',
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_customization_requests_updated_at
before update on public.customization_requests
for each row execute function public.set_updated_at();

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_by text,
  created_by_user_id uuid default auth.uid(),
  plan text,
  status text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_by text,
  created_by_user_id uuid default auth.uid(),
  amount numeric,
  currency text,
  status text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- Cart items
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  created_by text,
  created_by_user_id uuid default auth.uid(),
  product_id text,
  name text,
  price numeric,
  quantity int default 1,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_cart_items_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- Teams
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  created_by text,
  created_by_user_id uuid default auth.uid(),
  name text,
  company_info jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

-- Team members
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  email text,
  role text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_team_members_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

-- Activity logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  action text,
  created_by text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- RLS
-- Ensure columns exist if tables were pre-created
alter table if exists public.business_cards add column if not exists status text default 'draft';
alter table if exists public.business_cards add column if not exists template text;
alter table if exists public.business_cards add column if not exists created_by text;
alter table if exists public.business_cards add column if not exists created_at timestamptz default now();
alter table if exists public.business_cards add column if not exists updated_at timestamptz default now();

alter table public.profiles enable row level security;
alter table public.business_cards enable row level security;
alter table public.card_views enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.custom_templates enable row level security;
alter table public.customization_requests enable row level security;
alter table public.subscriptions enable row level security;
alter table public.orders enable row level security;
alter table public.cart_items enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_upsert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

-- Business cards policies
create policy "business_cards_public_read" on public.business_cards
for select using (status = 'published');

create policy "business_cards_authenticated_read" on public.business_cards
for select to authenticated using (true);

create policy "business_cards_authenticated_write" on public.business_cards
for insert to authenticated with check (true);

create policy "business_cards_authenticated_update" on public.business_cards
for update to authenticated using (true) with check (true);

create policy "business_cards_authenticated_delete" on public.business_cards
for delete to authenticated using (true);

-- Card views policies (public insert, authenticated read)
create policy "card_views_public_insert" on public.card_views
for insert with check (true);

create policy "card_views_authenticated_read" on public.card_views
for select to authenticated using (true);

-- Contact submissions policies (public insert, authenticated read)
create policy "contact_submissions_public_insert" on public.contact_submissions
for insert with check (true);

create policy "contact_submissions_authenticated_read" on public.contact_submissions
for select to authenticated using (true);

-- Generic authenticated access policies
create policy "custom_templates_authenticated_all" on public.custom_templates
for all to authenticated using (true) with check (true);

create policy "customization_requests_authenticated_all" on public.customization_requests
for all to authenticated using (true) with check (true);

create policy "subscriptions_authenticated_all" on public.subscriptions
for all to authenticated using (true) with check (true);

create policy "orders_authenticated_all" on public.orders
for all to authenticated using (true) with check (true);

create policy "cart_items_authenticated_all" on public.cart_items
for all to authenticated using (true) with check (true);

create policy "teams_authenticated_all" on public.teams
for all to authenticated using (true) with check (true);

create policy "team_members_authenticated_all" on public.team_members
for all to authenticated using (true) with check (true);

create policy "activity_logs_authenticated_all" on public.activity_logs
for all to authenticated using (true) with check (true);

-- Optional: seed a demo published card
-- (Removed because existing schemas may enforce NOT NULL on user_id.)
