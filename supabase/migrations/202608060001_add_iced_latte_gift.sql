-- Adds the Iced Latte candle to the catalogue as a coming-soon product.
-- It remains inactive, so it cannot be included in any order until launched.
insert into public.products (id, name, price, is_active, image_path)
values ('iced-latte', 'Iced Latte', 0.00, false, 'icedlatte.jpeg')
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  is_active = excluded.is_active,
  image_path = excluded.image_path,
  updated_at = now();
