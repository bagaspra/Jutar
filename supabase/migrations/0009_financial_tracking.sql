-- 0. Create Utility Function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Update raw_materials table to include unit cost
ALTER TABLE raw_materials 
ADD COLUMN unit_cost NUMERIC(15, 2) DEFAULT 0 NOT NULL;

-- 2. Create operational_expenses table
CREATE TABLE operational_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE DEFAULT CURRENT_DATE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE operational_expenses ENABLE ROW LEVEL SECURITY;

-- 4. Define RLS Policies for operational_expenses
-- Only Super Admins can manage expenses
CREATE POLICY "Super Admins can manage all expenses" ON operational_expenses
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'::user_role
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'::user_role
  );

-- 5. Add trigger for updated_at
CREATE TRIGGER on_expense_update
  BEFORE UPDATE ON operational_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
