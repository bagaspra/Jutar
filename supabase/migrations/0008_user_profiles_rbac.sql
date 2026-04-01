-- 1. Create Role Enum to strictly enforce allowed roles
CREATE TYPE user_role AS ENUM ('super_admin', 'inventory_admin', 'cashier');

-- 2. Create the Profiles table linking to auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role user_role DEFAULT 'cashier'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Define Policies
-- Profiles are viewable by everyone in the system (needed for UI role badges)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Only Super Admins can insert/update/delete profiles
-- (Note: Service Role Key bypasses RLS, so this policy is mostly defensive)
CREATE POLICY "Super Admins can manage all profiles" ON profiles
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'::user_role
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'::user_role
  );

-- Users can update their own name/details (but NOT their role)
CREATE POLICY "Users can update their own details" ON profiles
  FOR UPDATE USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Prevent users from elevating their own role during update
CREATE OR REPLACE FUNCTION protect_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If the updater is not a super_admin, prevent role changes
  IF (SELECT role FROM profiles WHERE id = auth.uid()) != 'super_admin'::user_role THEN
    IF NEW.role != OLD.role THEN
      RAISE EXCEPTION 'Unauthorized role escalation attempt.';
    END IF;
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_role_escalation();

-- 5. Auto-Create Profile Trigger
-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    -- Default to cashier, unless metadata explicitly requests a role (controlled via service key action)
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'cashier'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Clean up trigger: Remove profile when user is deleted (already handled by ON DELETE CASCADE, but good measure)
-- (auth.users CASCADE handles this automatically via the foreign key constraint)

-- 7. (Optional/Development) Auto-Promote first user
-- If you want your existing account to automatically become a super_admin, 
-- you can run this manually after the migration:
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';
