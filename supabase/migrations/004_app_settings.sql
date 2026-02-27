-- App-wide key-value settings table (admin write, public read)
create table if not exists public.app_settings (
  key   text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create trigger set_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

-- Seed the default template_tiers row (free templates only; premium ones default via app code)
insert into public.app_settings (key, value)
values (
  'template_tiers',
  '{
    "navy_gold": "free",
    "dark_minimal": "free",
    "purple_coral": "free",
    "earthy_minimal": "free",
    "pink_modern": "free",
    "orange_pro": "free",
    "noqtatain1": "free",
    "noqtatain2": "free",
    "noqtatain3": "free",
    "noqtatain4": "free",
    "noqtatain6": "free",
    "modern_gradient": "premium",
    "luxury_gold": "premium",
    "tech_blue": "premium",
    "sunset_warm": "premium",
    "forest_green": "premium",
    "aurora_glass": "premium"
  }'::jsonb
)
on conflict (key) do nothing;

-- RLS: anyone can read; only service-role / admin can write (enforced in app layer)
alter table public.app_settings enable row level security;

create policy "app_settings_read_all"
  on public.app_settings for select using (true);

create policy "app_settings_admin_write"
  on public.app_settings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
