-- Keep the server-side catalogue price and name in sync with the storefront.
update public.products
set name = 'Mini Cute Cube Candle', price = 950.00, updated_at = now()
where id = 'bogolan-throw';
