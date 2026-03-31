-- Migration 0002: Dynamic Categories Support
-- This script introduces a dedicated categories table and migrates products to a relational structure.

-- 1. Create the categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert the initial default categories
INSERT INTO categories (name, slug, emoji) VALUES 
('Burgers', 'burgers', '🍔'),
('Sides', 'sides', '🍟'),
('Drinks', 'drinks', '🥤'),
('Desserts', 'desserts', '🍦')
ON CONFLICT (slug) DO NOTHING;

-- 3. Add category_id column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE RESTRICT;

-- 4. Migrate existing data from the 'category' text column to 'category_id'
-- We map by slug (lowercase original category name)
UPDATE products 
SET category_id = categories.id 
FROM categories 
WHERE LOWER(products.category) = categories.slug;

-- 5. Set category_id NOT NULL after migration (to ensure integrity)
-- Note: If you have custom categories before this, make sure they exist in the categories table first.
ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;

-- 6. Drop the old text-based category column
ALTER TABLE products DROP COLUMN IF EXISTS category;

-- 7. Add a RLS Policy for Categories (Full access for authenticated, Read-only for public)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on categories"
ON categories FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated full access on categories"
ON categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
