-- Migration 009: Add all standard timestamp/audit columns to orders.
-- The table was created before 001_init.sql ran so it may be missing
-- created_at, updated_at, created_by, created_by_user_id.

alter table public.orders add column if not exists created_at         timestamptz default now();
alter table public.orders add column if not exists updated_at         timestamptz default now();
alter table public.orders add column if not exists created_by         text;
alter table public.orders add column if not exists created_by_user_id uuid;

-- Reload PostgREST schema cache
notify pgrst, 'reload schema';
