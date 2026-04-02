-- ============================================================
-- FIX: Restore authenticated CRUD access after RLS was enabled
-- on products (0023) without write policies.
-- Also ensure categories has the same pattern.
-- ============================================================

-- PRODUCTS: Allow authenticated users (admin/cashier) full CRUD
CREATE POLICY "Allow authenticated full access on products"
  ON public.products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- CATEGORIES: Allow authenticated users full CRUD
-- (A public SELECT policy already exists from migration 0002,
--  but no write policy was ever added for authenticated users.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'categories'
      AND policyname = 'Allow authenticated full access on categories'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow authenticated full access on categories"
      ON public.categories FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;
