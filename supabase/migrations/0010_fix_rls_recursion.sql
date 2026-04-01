-- 1. Create the Security Definer function to break recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM profiles WHERE id = auth.uid();
$$;

-- 2. Clean up faulty policies on operational_expenses
DROP POLICY IF EXISTS "Super Admins can manage all expenses" ON operational_expenses;

-- 3. Recreate operational_expenses policy using the safe function
CREATE POLICY "Super Admins can manage all expenses" ON operational_expenses
  FOR ALL
  TO authenticated
  USING ( public.get_user_role() = 'super_admin' )
  WITH CHECK ( public.get_user_role() = 'super_admin' );

-- 4. Fix potential recursion on the profiles table itself
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Only super_admin can update roles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own non-role data" ON profiles;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Only super_admin can update roles" ON profiles
  FOR UPDATE
  USING ( public.get_user_role() = 'super_admin' )
  WITH CHECK ( public.get_user_role() = 'super_admin' );

CREATE POLICY "Users can update their own non-role data" ON profiles
  FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );
