-- The storefront must display backend prices for Coming Soon products too.
-- This exposes only catalogue ID, price, and availability; it exposes no
-- customer, order, or delivery data.
create or replace function public.get_storefront_catalogue()
returns table (id text, price numeric, is_active boolean)
language sql
security definer
set search_path = public
as $$
  select p.id, p.price, p.is_active
  from public.products as p;
$$;

revoke all on function public.get_storefront_catalogue() from public;
grant execute on function public.get_storefront_catalogue() to anon, authenticated;

update public.products
set price = 1499.00, updated_at = now()
where id = 'sculpted-vase';
