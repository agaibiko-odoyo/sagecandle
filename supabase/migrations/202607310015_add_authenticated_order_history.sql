-- Run in Supabase Dashboard -> SQL Editor after the earlier delivery-order migrations.
-- Guest orders retain a null user_id; signed-in orders are linked to auth.users.

alter table public.delivery_orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists delivery_orders_user_id_created_at_idx
  on public.delivery_orders (user_id, created_at desc);

create or replace function public.create_delivery_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address text,
  p_city text,
  p_postal_code text,
  p_delivery_notes text,
  p_delivery_method_id text,
  p_items jsonb,
  p_user_id uuid default null
)
returns table (id uuid, order_number text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order public.delivery_orders;
  delivery_method public.delivery_methods;
  item_count integer;
  priced_item_count integer;
  calculated_subtotal numeric(12, 2);
  calculated_total numeric(12, 2);
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order must contain at least one item';
  end if;

  select * into delivery_method from public.delivery_methods where id = p_delivery_method_id and is_active = true;
  if not found then raise exception 'The selected delivery method is unavailable'; end if;

  select jsonb_array_length(p_items) into item_count;
  with requested as (
    select item->>'product_id' as product_id, (item->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items) as item
  ), priced as (
    select requested.product_id, requested.quantity, products.price
    from requested join public.products on products.id = requested.product_id and products.is_active = true
  ) select count(*), coalesce(sum(price * quantity), 0) into priced_item_count, calculated_subtotal from priced;

  if priced_item_count <> item_count then raise exception 'One or more products are unavailable'; end if;
  calculated_total := calculated_subtotal + delivery_method.cost;

  insert into public.delivery_orders (
    user_id, customer_name, customer_email, customer_phone, address, city, postal_code,
    delivery_notes, delivery_method, subtotal, shipping_cost, total
  ) values (
    p_user_id, trim(p_customer_name), nullif(lower(trim(p_customer_email)), ''), nullif(trim(p_customer_phone), ''),
    trim(p_address), trim(p_city), nullif(trim(p_postal_code), ''), nullif(trim(p_delivery_notes), ''),
    delivery_method.name, calculated_subtotal, delivery_method.cost, calculated_total
  ) returning * into new_order;

  insert into public.delivery_order_items (order_id, product_id, product_name, quantity, unit_price)
  select new_order.id, products.id, products.name, (item->>'quantity')::integer, products.price
  from jsonb_array_elements(p_items) as item
  join public.products on products.id = item->>'product_id' and products.is_active = true;

  return query select new_order.id, new_order.order_number, new_order.created_at;
end;
$$;

revoke all on function public.create_delivery_order(text, text, text, text, text, text, text, text, jsonb, uuid) from public;
grant execute on function public.create_delivery_order(text, text, text, text, text, text, text, text, jsonb, uuid) to service_role;

drop policy if exists "Users can read their own orders" on public.delivery_orders;
create policy "Users can read their own orders" on public.delivery_orders
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "Users can read their own order items" on public.delivery_order_items;
create policy "Users can read their own order items" on public.delivery_order_items
  for select to authenticated using (
    exists (select 1 from public.delivery_orders where delivery_orders.id = delivery_order_items.order_id and delivery_orders.user_id = auth.uid())
  );
