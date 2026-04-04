-- Robust QR tracking via SECURITY DEFINER RPC
-- Allows anonymous QR scanners to log scans without exposing table write/update permissions.

create or replace function public.track_qr_scan(
  p_card_id uuid,
  p_visitor_id text default null,
  p_user_agent text default null,
  p_referrer text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card record;
begin
  -- Only track scans for published cards
  select id, created_by
  into v_card
  from public.business_cards
  where id = p_card_id
    and status = 'published'
  limit 1;

  if not found then
    return;
  end if;

  insert into public.card_views (
    card_id,
    card_owner,
    view_type,
    visitor_id,
    user_agent,
    referrer
  ) values (
    v_card.id,
    v_card.created_by,
    'qr_scan',
    p_visitor_id,
    p_user_agent,
    p_referrer
  );

  update public.business_cards
  set scan_count = coalesce(scan_count, 0) + 1
  where id = v_card.id;
end;
$$;

grant execute on function public.track_qr_scan(uuid, text, text, text) to anon;
grant execute on function public.track_qr_scan(uuid, text, text, text) to authenticated;
