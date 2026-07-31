-- Run this migration if 202607310001_create_delivery_orders.sql was already run.
-- RLS policy controls which rows are visible; this grant lets the public web role
-- use that policy to read the active catalogue and delivery methods.

grant select on public.products, public.delivery_methods to anon, authenticated;
