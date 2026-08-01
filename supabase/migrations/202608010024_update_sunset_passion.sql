-- Keeps the server catalogue aligned with the coming-soon Sunset Passion card.
update public.products
set
  name = 'Sunset Passion',
  is_active = false,
  image_path = 'sweetpassion.jpeg',
  updated_at = now()
where id = 'sculpted-vase';
