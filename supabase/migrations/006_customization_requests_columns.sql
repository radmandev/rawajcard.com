-- Add admin_notes column to customization_requests table
alter table public.customization_requests add column if not exists admin_notes text;
