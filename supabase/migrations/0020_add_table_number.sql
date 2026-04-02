-- Add table_number column to orders table for dine_in orders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='table_number') THEN
        ALTER TABLE public.orders ADD COLUMN table_number TEXT;
    END IF;
END $$;

-- Comment for clarity
COMMENT ON COLUMN public.orders.table_number IS 'Table number for dine_in orders (nullable for take_away)';
