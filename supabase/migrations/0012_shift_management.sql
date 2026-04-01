-- 1. Create shifts table for reconciliation
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    closed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    starting_cash NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    expected_cash NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    actual_cash NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    difference NUMERIC(15, 2) GENERATED ALWAYS AS (actual_cash - expected_cash) STORED,
    total_digital NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update orders table to link with shifts
ALTER TABLE orders ADD COLUMN shift_id UUID REFERENCES shifts(id);

-- 3. Enable RLS
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- 4. Define RLS Policies for shifts
-- Everyone (Authenticated) can create shifts
CREATE POLICY "Anyone can create a shift" ON shifts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Only Super Admins can view shift logs
CREATE POLICY "Only super_admin can view shifts" ON shifts
    FOR SELECT TO authenticated
    USING ( public.get_user_role() = 'super_admin' );

-- 5. Add trigger for updated_at
CREATE TRIGGER on_shift_update
    BEFORE UPDATE ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
