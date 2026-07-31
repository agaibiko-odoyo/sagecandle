-- Allows only the Vercel service role to read order items for authenticated history responses.
-- Browser users remain protected by Row Level Security.

grant select on public.delivery_order_items to service_role;
