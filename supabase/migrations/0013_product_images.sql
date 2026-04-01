-- 0013_product_images.sql
-- 1. Ensure the image_url column exists in the products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Storage Policies for product-images bucket
-- Note: You should have already created the bucket manually via the Supabase Dashboard.
-- These policies ensure that:
-- - Anyone (public) can read the images.
-- - Only authenticated users (admins/managers) can upload/delete images.

-- Allow public access to read files in the product-images bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Allow authenticated users to upload files to product-images
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'product-images' );

-- Allow authenticated users to update/delete their files
CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'product-images' );
