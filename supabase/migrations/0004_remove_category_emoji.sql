-- Migration 0004: Remove Category-Level Emoji
-- This final cleanup removes the emoji column from categories, completing the transition to a text-based minimalist UI.

ALTER TABLE categories DROP COLUMN IF EXISTS emoji;
