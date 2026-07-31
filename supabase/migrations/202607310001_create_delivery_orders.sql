-- Run this file in Supabase Dashboard -> SQL Editor -> New query.
-- It intentionally allows creating orders without authentication, but no browser
-- client can read customer delivery data.

create sequence if not exists public.delivery_order_number_seq start with 100001;

create table if not exists public.delivery_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('SC-' || nextval('public.delivery_order_number_seq')::text),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_email text check (customer_email is null or char_length(customer_email) between 3 and 320),
  customer_phone text check (customer_phone is null or char_length(customer_phone) between 6 and 40),
  address text not null check (char_length(address) between 5 and 500),
  city text not null check (char_length(city) between 2 and 120),
  postal_code text,
  delivery_notes text check (char_length(delivery_notes) <= 1000),
  delivery_method text not null,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  shipping_cost numeric(12, 2) not null check (shipping_cost >= 0),
  total numeric(12, 2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.delivery_orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0 and quantity <= 100),
  unit_price numeric(12, 2) not null check (unit_price >= 0)
);

alter table public.delivery_orders enable row level security;
alter table public.delivery_order_items enable row level security;

-- No select policies: delivery details stay private. Orders are created only
-- through the function below, which validates and inserts them atomically.
create or replace function public.create_delivery_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address text,
  p_city text,
  p_postal_code text,
  p_delivery_notes text,
  p_delivery_method text,
  p_subtotal numeric,
  p_shipping_cost numeric,
  p_items jsonb
)
returns table (id uuid, order_number text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order public.delivery_orders;
  calculated_total numeric(12, 2);
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order must contain at least one item';
  end if;

  select coalesce(sum((item->>'unit_price')::numeric * (item->>'quantity')::integer), 0)
  into calculated_total
  from jsonb_array_elements(p_items) as item;

  if calculated_total <> p_subtotal then
    raise exception 'Order subtotal does not match its items';
  end if;

  insert into public.delivery_orders (
    customer_name, customer_email, customer_phone, address, city, postal_code,
    delivery_notes, delivery_method, subtotal, shipping_cost, total
  ) values (
    trim(p_customer_name), nullif(lower(trim(p_customer_email)), ''), nullif(trim(p_customer_phone), ''),
    trim(p_address), trim(p_city), nullif(trim(p_postal_code), ''),
    nullif(trim(p_delivery_notes), ''), trim(p_delivery_method), p_subtotal,
    p_shipping_cost, p_subtotal + p_shipping_cost
  ) returning * into new_order;

  insert into public.delivery_order_items (order_id, product_id, product_name, quantity, unit_price)
  select new_order.id, item->>'product_id', item->>'product_name',
    (item->>'quantity')::integer, (item->>'unit_price')::numeric
  from jsonb_array_elements(p_items) as item;

  return query select new_order.id, new_order.order_number, new_order.created_at;
end;
$$;

revoke all on function public.create_delivery_order(text, text, text, text, text, text, text, text, numeric, numeric, jsonb) from public;
grant execute on function public.create_delivery_order(text, text, text, text, text, text, text, text, numeric, numeric, jsonb) to anon, authenticated;
