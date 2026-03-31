-- Migration 0003: Remove Product-Level Emoji
-- Products will now inherit their visual identity from their parent categories.

ALTER TABLE products DROP COLUMN IF EXISTS emoji;
