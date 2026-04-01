-- Migration 0014: Fix Product Deletion Foreign Key Constraint
-- This migration updates the order_items table to allow product deletion while preserving order history.

-- 1. Drop the existing restrictive constraint
-- Standard naming convention is order_items_product_id_fkey
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- 2. Re-add the constraint with ON DELETE SET NULL
-- This ensures that if a product is deleted, historical orders simply have a NULL product_id
-- instead of preventing the deletion or cascading (deleting) the order record.
ALTER TABLE order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE SET NULL;

-- 3. Ensure the column is explicitly nullable (it already is by default from 0001)
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;
