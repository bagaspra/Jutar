-- ============================================================
-- KDS: Allow authenticated users to UPDATE orders
-- (mark pending_kitchen → ready via kitchen display)
-- and allow SELECT on pending_kitchen/ready orders.
-- ============================================================

-- Allow authenticated staff to read all orders (for KDS and cashier tabs)
-- A broad SELECT policy may already exist; use IF NOT EXISTS pattern.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders'
      AND policyname = 'Allow authenticated full access on orders'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow authenticated full access on orders"
      ON public.orders FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;

-- Allow authenticated staff full access on order_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'order_items'
      AND policyname = 'Allow authenticated full access on order_items'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow authenticated full access on order_items"
      ON public.order_items FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;

-- Allow authenticated staff to read and update dining_sessions
-- (needed for getActiveSessions and closeSession)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'dining_sessions'
      AND policyname = 'Allow authenticated full access on dining_sessions'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow authenticated full access on dining_sessions"
      ON public.dining_sessions FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;
