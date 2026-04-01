-- 1. Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'digital')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update orders table to include payment_method_id
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id);

-- 3. Seed Initial Data
INSERT INTO payment_methods (id, name, type) VALUES
('30000000-0000-0000-0000-000000000001', 'Cash', 'cash'),
('30000000-0000-0000-0000-000000000002', 'QRIS', 'digital'),
('30000000-0000-0000-0000-000000000003', 'Debit/Bank Transfer', 'digital')
ON CONFLICT (id) DO NOTHING;

-- 4. (Optional) Backfill existing orders if needed
-- This assumes we want to map old 'Cash' text to the new ID
UPDATE orders 
SET payment_method_id = '30000000-0000-0000-0000-000000000001'
WHERE payment_method = 'Cash' AND payment_method_id IS NULL;
