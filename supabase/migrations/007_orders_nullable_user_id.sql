-- Migration 007: Make user_id nullable on orders so guest users can place orders.
-- Checkout is a public page — not all buyers are authenticated.

alter table public.orders alter column user_id drop not null;

-- Also ensure created_by_user_id exists (added in 006 but belt-and-suspenders)
alter table public.orders add column if not exists created_by_user_id uuid;

notify pgrst, 'reload schema';
