-- 1. REMOVE REDUNDANT TRIGGER
-- This trigger is now causing failures (Database Error: 500) during staff registration
-- because we handle profile creation explicitly in account-actions.ts using the Admin Client.
-- Removing this trigger prevents transaction rollbacks in auth.users.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. REMOVE TRIGGER FUNCTION
-- Clean up the function to keep the public schema uncluttered
DROP FUNCTION IF EXISTS public.handle_new_user();
