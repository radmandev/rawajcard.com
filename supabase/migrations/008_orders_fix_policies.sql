-- Migration 008: Ensure correct RLS policies on orders table.
-- The SELECT policy for authenticated users (admin) may not have been applied
-- if migration 001 was not fully run against this Supabase project.

-- Drop and re-create all orders policies to guarantee a clean state
drop policy if exists "orders_authenticated_all"   on public.orders;
drop policy if exists "orders_public_insert"       on public.orders;

-- Authenticated users (admins, logged-in buyers) can do everything
create policy "orders_authenticated_all" on public.orders
  for all
  to authenticated
  using (true)
  with check (true);

-- Anonymous/guest users can only insert (for guest checkout)
create policy "orders_public_insert" on public.orders
  for insert
  with check (true);

notify pgrst, 'reload schema';
