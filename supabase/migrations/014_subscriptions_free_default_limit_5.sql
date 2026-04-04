-- Ensure new users default to free plan and 5-card limit

alter table public.subscriptions
  alter column plan set default 'free';

alter table public.subscriptions
  alter column card_limit set default 5;

-- Backfill existing rows missing plan/card_limit values
update public.subscriptions
set plan = coalesce(nullif(plan, ''), 'free')
where plan is null or plan = '';

update public.subscriptions
set card_limit = 5
where (plan = 'free' and (card_limit is null or card_limit < 5))
   or (plan = 'premium' and (card_limit is null or card_limit < 5));
