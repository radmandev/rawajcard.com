-- Add missing columns to subscriptions table
alter table public.subscriptions add column if not exists created_by text;
alter table public.subscriptions add column if not exists card_limit integer default 2;

-- Backfill created_by email from profiles where we have the UUID link
update public.subscriptions s
set created_by = p.email
from public.profiles p
where s.created_by_user_id = p.id
  and s.created_by is null;

-- Index for fast lookup by email
create index if not exists subscriptions_created_by_idx on public.subscriptions(created_by);
