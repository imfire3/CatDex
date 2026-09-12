-- CatDex: auto-confirm e-mail on signup + backfill existing users.
-- Run in Supabase SQL Editor if you cannot (yet) disable "Confirm email"
-- in Authentication → Providers → Email.
--
-- Prefer the dashboard toggle (stops confirmation e-mails / rate limits).
-- This migration makes login work for users that were created unconfirmed.

CREATE OR REPLACE FUNCTION public.handle_auto_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auto_confirm();

UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;
