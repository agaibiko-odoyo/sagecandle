-- The notification API verifies the session, then performs subscription
-- management in that user's database context. No user can read or alter
-- another user's push endpoint.
create policy "users manage own push subscriptions"
  on public.push_subscriptions
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
