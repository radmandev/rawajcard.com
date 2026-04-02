-- 010_physical_cards.sql
-- Physical NFC business cards table — stores post-purchase card customization data

CREATE TABLE IF NOT EXISTS physical_cards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number    TEXT,
    template_id     TEXT NOT NULL DEFAULT 'midnight-teal',
    name            TEXT NOT NULL DEFAULT '',
    signature       TEXT,
    qr_value        TEXT,
    picture         TEXT,                 -- base64 data URL or storage URL
    linked_card_id  UUID,                 -- FK to business_cards.id (soft ref)
    status          TEXT NOT NULL DEFAULT 'pending',
                                          -- pending | in_review | in_production | shipped | delivered
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_physical_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_physical_cards_updated_at ON physical_cards;
CREATE TRIGGER trg_physical_cards_updated_at
    BEFORE UPDATE ON physical_cards
    FOR EACH ROW EXECUTE FUNCTION update_physical_cards_updated_at();

-- Enable Row Level Security
ALTER TABLE physical_cards ENABLE ROW LEVEL SECURITY;

-- Users can view their own physical cards
CREATE POLICY "physical_cards_select_own"
    ON physical_cards FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own physical cards
CREATE POLICY "physical_cards_insert_own"
    ON physical_cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own physical cards
CREATE POLICY "physical_cards_update_own"
    ON physical_cards FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own physical cards
CREATE POLICY "physical_cards_delete_own"
    ON physical_cards FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can manage all physical cards
CREATE POLICY "physical_cards_admin_all"
    ON physical_cards FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );
