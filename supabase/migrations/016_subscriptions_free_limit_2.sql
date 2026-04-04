-- Set Free plan card limit to 2 while keeping Premium at 5

-- Ensure new rows default to Free plan with 2 cards
alter table public.subscriptions
  alter column plan set default 'free',
  alter column card_limit set default 2;

-- Backfill only Free plan rows to match new limit
update public.subscriptions
set card_limit = 2
where coalesce(plan, 'free') = 'free'
  and coalesce(card_limit, 0) <> 2;
