-- Set Premium early-bird trial period to 3 months (90 days)
-- Keeps existing offer settings and only updates trial_days.

insert into public.app_settings (key, value)
values (
  'premium_early_bird_offer',
  jsonb_build_object(
    'enabled', false,
    'trial_days', 90,
    'popup_delay_ms', 5000,
    'new_user_window_days', 30
  )
)
on conflict (key) do update
set value = jsonb_set(
  coalesce(public.app_settings.value, '{}'::jsonb),
  '{trial_days}',
  to_jsonb(90),
  true
);
