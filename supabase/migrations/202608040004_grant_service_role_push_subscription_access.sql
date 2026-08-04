-- Delivery workers use Supabase's service_role. It bypasses RLS, but still
-- needs explicit table privileges on tables created by this project.
grant select, insert, update, delete on public.push_subscriptions to service_role;
