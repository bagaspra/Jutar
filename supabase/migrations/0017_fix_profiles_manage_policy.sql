-- Drop the old recursive policy from 0008 that was missed by 0010
DROP POLICY IF EXISTS "Super Admins can manage all profiles" ON profiles;

-- Recreate using the SECURITY DEFINER function to avoid recursion
CREATE POLICY "Super Admins can manage all profiles" ON profiles
  FOR ALL
  TO authenticated
  USING ( public.get_user_role() = 'super_admin' )
  WITH CHECK ( public.get_user_role() = 'super_admin' );
