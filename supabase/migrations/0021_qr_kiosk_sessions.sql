-- Create dining_sessions table for QR Kiosk self-order system
CREATE TABLE IF NOT EXISTS public.dining_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add session_id FK to orders table (nullable, SET NULL on session delete)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.dining_sessions(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.dining_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone (unauthenticated customers) to create a session
CREATE POLICY "Allow public session creation"
  ON public.dining_sessions FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read any session (needed for token verification)
CREATE POLICY "Allow public session read"
  ON public.dining_sessions FOR SELECT
  USING (true);
