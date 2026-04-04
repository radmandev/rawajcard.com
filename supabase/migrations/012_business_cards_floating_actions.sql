-- Add floating action settings to business cards
-- Used by the Card Builder "Floating Actions" section.

alter table public.business_cards
add column if not exists floating_actions jsonb
default '{"save_contact": true, "show_qr": true, "share_card": true}'::jsonb;

-- Backfill existing rows that may have null values
update public.business_cards
set floating_actions = '{"save_contact": true, "show_qr": true, "share_card": true}'::jsonb
where floating_actions is null;
