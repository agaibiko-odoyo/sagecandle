-- Shared public product image paths. Run this in Supabase SQL Editor so the
-- storefront and the backoffice can both read the same catalogue media.
alter table public.products
  add column if not exists image_path text;

update public.products
set image_path = case id
  when 'sunset-nairobi' then 'vanilla.jpeg'
  when 'loomed-horizon' then 'caramel.jpeg'
  when 'savannah-dusk' then 'bubblegum.jpeg'
  when 'bogolan-throw' then 'cubecandles.jpeg'
  when 'royal-triptych' then 'blueberry.jpeg'
  when 'sculpted-vase' then 'img11.jpeg'
  when 'beaded-choker' then 'img13.jpeg'
  when 'scribe-journal' then 'img7.jpeg'
  else image_path
end;
