-- =========================================================
-- Fix for "Database error saving new user" in Supabase Auth
-- Run this in your Supabase SQL Editor:
-- =========================================================

-- 1. Add insert policy on profiles table for auth trigger and new signups
DROP POLICY IF EXISTS "Allow insert for new users" ON public.profiles;
CREATE POLICY "Allow insert for new users"
ON public.profiles FOR INSERT
WITH CHECK (true);

-- 2. Update handle_new_user function with explicit schema and search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, university_email, role, department)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'University Member'),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Department of Computer Science')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

-- 3. Ensure trigger is properly attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
