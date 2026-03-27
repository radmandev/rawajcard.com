-- Migration 005: Allow public (unauthenticated) insert on orders
-- Checkout is a public page so guest users must be able to place orders.
-- Select / Update / Delete remain restricted to authenticated users via
-- the existing "orders_authenticated_all" policy.

drop policy if exists "orders_public_insert" on public.orders;

create policy "orders_public_insert" on public.orders
  for insert
  with check (true);

notify pgrst, 'reload schema';
