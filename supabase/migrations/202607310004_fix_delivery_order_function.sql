-- Replaces the order-creation function with qualified column references.
-- This fixes PostgreSQL's "column reference id is ambiguous" error.

create or replace function public.create_delivery_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address text,
  p_city text,
  p_postal_code text,
  p_delivery_notes text,
  p_delivery_method_id text,
  p_items jsonb
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

  select dm.* into delivery_method
  from public.delivery_methods as dm
  where dm.id = p_delivery_method_id and dm.is_active = true;

  if not found then
    raise exception 'The selected delivery method is unavailable';
  end if;

  select jsonb_array_length(p_items) into item_count;

  with requested as (
    select item->>'product_id' as product_id, (item->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items) as item
  ), priced as (
    select requested.product_id, requested.quantity, products.price
    from requested join public.products on products.id = requested.product_id and products.is_active = true
  )
  select count(*), coalesce(sum(price * quantity), 0)
  into priced_item_count, calculated_subtotal
  from priced;

  if priced_item_count <> item_count then
    raise exception 'One or more products are unavailable';
  end if;

  calculated_total := calculated_subtotal + delivery_method.cost;

  insert into public.delivery_orders (
    customer_name, customer_email, customer_phone, address, city, postal_code,
    delivery_notes, delivery_method, subtotal, shipping_cost, total
  ) values (
    trim(p_customer_name), nullif(lower(trim(p_customer_email)), ''), nullif(trim(p_customer_phone), ''),
    trim(p_address), trim(p_city), nullif(trim(p_postal_code), ''),
    nullif(trim(p_delivery_notes), ''), delivery_method.name, calculated_subtotal,
    delivery_method.cost, calculated_total
  ) returning * into new_order;

  insert into public.delivery_order_items (order_id, product_id, product_name, quantity, unit_price)
  select new_order.id, products.id, products.name, (item->>'quantity')::integer, products.price
  from jsonb_array_elements(p_items) as item
  join public.products on products.id = item->>'product_id' and products.is_active = true;

  return query select new_order.id, new_order.order_number, new_order.created_at;
end;
$$;

revoke all on function public.create_delivery_order(text, text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.create_delivery_order(text, text, text, text, text, text, text, text, jsonb) to anon, authenticated;
