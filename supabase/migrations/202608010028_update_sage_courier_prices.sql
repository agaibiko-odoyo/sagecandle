update public.delivery_methods
set
  name = case id
    when 'standard' then 'Sage Standard Courier'
    when 'express' then 'Sage Express Courier'
    else name
  end,
  cost = case id
    when 'standard' then 100.00
    when 'express' then 150.00
    else cost
  end
where id in ('standard', 'express');
