-- Names used for new checkout orders. Existing order records retain the method
-- name captured when they were placed.
update public.delivery_methods
set name = case id
  when 'standard' then 'Sage Standard Courier'
  when 'express' then 'Sage Express Courier'
  else name
end
where id in ('standard', 'express');
