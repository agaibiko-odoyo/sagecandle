-- Aligns database-calculated delivery charges with the storefront.
update public.delivery_methods
set cost = case id
  when 'standard' then 150.00
  when 'express' then 250.00
  else cost
end
where id in ('standard', 'express');
