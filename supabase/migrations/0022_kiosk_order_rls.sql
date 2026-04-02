-- Allow unauthenticated kiosk customers to insert orders with a valid active session
CREATE POLICY "Allow kiosk order insert"
  ON public.orders FOR INSERT
  WITH CHECK (
    session_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.dining_sessions
      WHERE id = session_id AND status = 'active'
    )
  );

-- Allow unauthenticated kiosk customers to insert order_items linked to a valid session
CREATE POLICY "Allow kiosk order_items insert"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.dining_sessions ds ON ds.id = o.session_id
      WHERE o.id = order_id AND ds.status = 'active'
    )
  );

-- Allow kiosk customers to read their own orders by session_id
CREATE POLICY "Allow kiosk order read"
  ON public.orders FOR SELECT
  USING (
    session_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.dining_sessions
      WHERE id = session_id AND status = 'active'
    )
  );

-- Allow kiosk customers to read order_items for their own orders
CREATE POLICY "Allow kiosk order_items read"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.dining_sessions ds ON ds.id = o.session_id
      WHERE o.id = order_id AND ds.status = 'active'
    )
  );
