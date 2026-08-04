-- RLS policies decide which rows an authenticated customer can manage; this
-- grant permits the authenticated database role to reach the table at all.
grant select, insert, update, delete on public.push_subscriptions to authenticated;
