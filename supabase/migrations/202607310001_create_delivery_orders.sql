-- Run this file in Supabase Dashboard -> SQL Editor -> New query.
-- It intentionally allows creating orders without authentication, but no browser
-- client can read customer delivery data.

create sequence if not exists public.delivery_order_number_seq start with 100001;

create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.products (id, name, price) values
  ('sunset-nairobi', 'Sunset in Nairobi', 85.00),
  ('savannah-dusk', 'The Savannah Dusk', 88.00),
  ('loomed-horizon', 'Loomed Linen & Amber', 95.00),
  ('bogolan-throw', 'Bogolan Smoked Oud', 98.00),
  ('sculpted-vase', 'Artisan Clay Candle Vessel', 125.00),
  ('royal-triptych', 'Cacao & Spiced Honey Candle', 75.00),
  ('beaded-choker', 'Solid Brass Candle Care Kit', 75.00),
  ('scribe-journal', 'Agadez Amber Travel Tin', 38.00)
on conflict (id) do update set name = excluded.name, price = excluded.price, updated_at = now();

create table if not exists public.delivery_methods (
  id text primary key,
  name text not null,
  cost numeric(12, 2) not null check (cost >= 0),
  is_active boolean not null default true
);

insert into public.delivery_methods (id, name, cost) values
  ('standard', 'Standard Heritage Courier', 15.00),
  ('express', 'Express Boutique Delivery', 45.00)
on conflict (id) do update set name = excluded.name, cost = excluded.cost;

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
alter table public.products enable row level security;
alter table public.delivery_methods enable row level security;

create policy "Public catalogue is readable" on public.products for select using (is_active = true);
create policy "Public delivery methods are readable" on public.delivery_methods for select using (is_active = true);
grant select on public.products, public.delivery_methods to anon, authenticated;

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

  select * into delivery_method from public.delivery_methods
  where id = p_delivery_method_id and is_active = true;

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
