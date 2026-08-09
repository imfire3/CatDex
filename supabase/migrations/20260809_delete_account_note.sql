-- Account deletion is handled by DELETE /account on the CatDex API
-- (service role): purge storage `cats/{uid}/…` then delete auth.users.
-- Profiles / cats / sightings / analysis cascade via ON DELETE CASCADE.
--
-- Manual verification (SQL Editor, as authenticated user is not enough):
--   select id, email from auth.users where id = '<uid>';
-- After API delete, that row must be gone and storage folder empty.
--
-- This migration is intentionally a no-op marker for ops / docs.
SELECT 1;
