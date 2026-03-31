-- Add the order_type column to the orders table
-- order_type should be 'dine_in' or 'take_away'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'dine_in';
