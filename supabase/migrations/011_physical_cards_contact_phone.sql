-- 011_physical_cards_contact_phone.sql
-- Add optional contact phone to physical cards customization

ALTER TABLE physical_cards
ADD COLUMN IF NOT EXISTS contact_phone TEXT;
