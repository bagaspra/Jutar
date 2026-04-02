-- 1. CLEANUP: Delete orphaned recipe rows (where product no longer exists)
DELETE FROM public.recipes 
WHERE product_id NOT IN (SELECT id FROM public.products);

-- 2. SCHEMA UPDATE: Add is_archived column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='raw_materials' AND column_name='is_archived') THEN
        ALTER TABLE public.raw_materials ADD COLUMN is_archived BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;
END $$;

-- 3. CONSTRAINT FIX: Ensure CASCADE on recipes (Just in case dev environment differed from initial schema)
-- Drops and recreates the foreign key constraints to ensure ON DELETE CASCADE is present

DO $$
BEGIN
    -- Drop existing if they exist
    ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipes_product_id_fkey;
    ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipes_raw_material_id_fkey;
    
    -- Re-add with CASCADE
    ALTER TABLE public.recipes 
        ADD CONSTRAINT recipes_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
        
    ALTER TABLE public.recipes 
        ADD CONSTRAINT recipes_raw_material_id_fkey 
        FOREIGN KEY (raw_material_id) REFERENCES public.raw_materials(id) ON DELETE CASCADE;
END $$;

-- NOTE: We explicitly DO NOT ADD CASCADE to inventory_logs as per user request to protect financial history.
