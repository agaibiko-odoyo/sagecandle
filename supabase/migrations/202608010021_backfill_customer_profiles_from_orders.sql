-- Creates saved profiles from each customer's most recent signed-in order.
-- Guest orders have no user_id and are intentionally not linked to an account.

insert into public.customer_profiles (
  user_id, first_name, last_name, email, phone, address, city, postal_code, delivery_notes, updated_at
)
select
  latest.user_id,
  split_part(latest.customer_name, ' ', 1),
  nullif(trim(substr(latest.customer_name, length(split_part(latest.customer_name, ' ', 1)) + 1)), ''),
  latest.customer_email,
  latest.customer_phone,
  latest.address,
  latest.city,
  latest.postal_code,
  latest.delivery_notes,
  latest.created_at
from (
  select distinct on (user_id) *
  from public.delivery_orders
  where user_id is not null
  order by user_id, created_at desc
) as latest
on conflict (user_id) do nothing;
