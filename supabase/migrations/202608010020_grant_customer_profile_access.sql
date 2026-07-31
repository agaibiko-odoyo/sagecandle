-- The profile policies in migration 018 limit authenticated users to their own row.
-- These grants allow those policies to be evaluated by the signed-in browser.

grant select, insert, update on public.customer_profiles to authenticated;
grant select, insert, update on public.customer_profiles to service_role;
