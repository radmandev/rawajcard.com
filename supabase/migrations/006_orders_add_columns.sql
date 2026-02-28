-- Migration 006: Ensure all required columns exist on the orders table.
-- The table may have been created before 001_init.sql ran fully,
-- so it might be missing amount, currency, status, and metadata.

alter table public.orders add column if not exists amount    numeric;
alter table public.orders add column if not exists currency  text;
alter table public.orders add column if not exists status    text;
alter table public.orders add column if not exists metadata  jsonb default '{}'::jsonb;
alter table public.orders add column if not exists created_by          text;
alter table public.orders add column if not exists created_by_user_id  uuid;
alter table public.orders add column if not exists updated_at          timestamptz default now();

-- Make sure the updated_at trigger exists
drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Reload PostgREST schema cache so new columns are immediately visible
notify pgrst, 'reload schema';
