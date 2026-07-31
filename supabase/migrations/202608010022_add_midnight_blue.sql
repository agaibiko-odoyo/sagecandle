-- Replaces Quiet Woods with the purchasable Midnight Blue candle.

insert into public.products (id, name, price, is_active)
values ('royal-triptych', 'Midnight Blue', 1699.00, true)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  is_active = excluded.is_active,
  updated_at = now();
