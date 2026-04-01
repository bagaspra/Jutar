-- 1. Safely Create Enum only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equity_transaction_type') THEN
        CREATE TYPE equity_transaction_type AS ENUM ('INVESTMENT', 'WITHDRAWAL');
    END IF;
END$$;

-- 2. Equity Transactions Table
CREATE TABLE IF NOT EXISTS public.equity_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type equity_transaction_type NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT,
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.equity_transactions ENABLE ROW LEVEL SECURITY;

-- 4. RBAC-aware Policy for Super Admins
-- Note: Fixed recursion by using the public.get_user_role() security definer function
DROP POLICY IF EXISTS "Super Admins can manage all equity transactions" ON public.equity_transactions;
CREATE POLICY "Super Admins can manage all equity transactions"
  ON public.equity_transactions FOR ALL
  TO authenticated
  USING (
    public.get_user_role() = 'super_admin'
  )
  WITH CHECK (
    public.get_user_role() = 'super_admin'
  );

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_equity_date ON public.equity_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_equity_type ON public.equity_transactions(type);
