-- Migration 0015: Refine Storage Policies
-- This migration adds UPDATE permissions for authenticated users to the product-images bucket.

-- Allow authenticated users to update their files (overwrite/upsert handle)
CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'product-images' )
WITH CHECK ( bucket_id = 'product-images' );
