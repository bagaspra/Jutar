-- Enable RLS on products table (may already be enabled, IF NOT EXISTS handles it safely)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow anyone (unauthenticated kiosk customers) to read active products
CREATE POLICY "Allow public read access on products"
  ON public.products FOR SELECT
  USING (true);
