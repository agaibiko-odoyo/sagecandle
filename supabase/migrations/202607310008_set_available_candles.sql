-- Only the three launched candles may be bought or submitted in an order.
update public.products
set name = case id
  when 'sunset-nairobi' then 'Ivory Vanilla'
  when 'savannah-dusk' then 'Sweet Reverie'
  when 'loomed-horizon' then 'Golden Caramel'
  else name
end,
is_active = id in ('sunset-nairobi', 'savannah-dusk', 'loomed-horizon'),
updated_at = now();
