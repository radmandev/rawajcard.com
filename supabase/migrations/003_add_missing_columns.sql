-- Migration 003: Add all missing columns to business_cards
-- Run this in the Supabase SQL Editor if the table was created before 001_init.sql was fully applied.
-- All statements use ADD COLUMN IF NOT EXISTS so they are safe to re-run.

-- Text fields
alter table public.business_cards add column if not exists name_ar text;
alter table public.business_cards add column if not exists title text;
alter table public.business_cards add column if not exists title_ar text;
alter table public.business_cards add column if not exists company text;
alter table public.business_cards add column if not exists company_ar text;
alter table public.business_cards add column if not exists bio text;
alter table public.business_cards add column if not exists bio_ar text;
alter table public.business_cards add column if not exists email text;
alter table public.business_cards add column if not exists phone text;
alter table public.business_cards add column if not exists whatsapp text;
alter table public.business_cards add column if not exists website text;
alter table public.business_cards add column if not exists location text;
alter table public.business_cards add column if not exists location_ar text;
alter table public.business_cards add column if not exists profile_image text;
alter table public.business_cards add column if not exists company_logo text;
alter table public.business_cards add column if not exists cover_image text;
alter table public.business_cards add column if not exists slug text;
alter table public.business_cards add column if not exists created_by_user_id uuid;
-- user_id is the NOT NULL FK to auth.users — make it nullable so saves without a session still work
-- (If it already exists as NOT NULL, this drops the constraint)
alter table public.business_cards alter column user_id drop not null;

-- Numeric fields
alter table public.business_cards add column if not exists view_count int default 0;
alter table public.business_cards add column if not exists scan_count int default 0;

-- JSONB fields (the ones that were missing)
alter table public.business_cards add column if not exists design jsonb default '{}'::jsonb;
alter table public.business_cards add column if not exists social_links jsonb default '{}'::jsonb;
alter table public.business_cards add column if not exists qr_settings jsonb default '{}'::jsonb;
alter table public.business_cards add column if not exists contact_form jsonb default '{}'::jsonb;
alter table public.business_cards add column if not exists custom_form jsonb default '{}'::jsonb;
alter table public.business_cards add column if not exists appointment_settings jsonb default '{}'::jsonb;
alter table public.business_cards add column if not exists nfc_settings jsonb default '{}'::jsonb;

-- Timestamp fields
alter table public.business_cards add column if not exists published_at timestamptz;

-- Add unique constraint on slug if not already present (safe: will error if exists, that's OK)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'business_cards_slug_key'
    and conrelid = 'public.business_cards'::regclass
  ) then
    alter table public.business_cards add constraint business_cards_slug_key unique (slug);
  end if;
end $$;

-- Add index on slug if not already present
create index if not exists business_cards_slug_idx on public.business_cards(slug);

-- Reload PostgREST schema cache so the new columns are immediately visible
notify pgrst, 'reload schema';
