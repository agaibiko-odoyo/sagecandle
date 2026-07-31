-- Existing historical rows remain intact; all new/updated delivery orders must
-- have usable contact details.
alter table public.delivery_orders
  add constraint delivery_orders_customer_email_required
  check (customer_email is not null and char_length(customer_email) between 3 and 320)
  not valid;

alter table public.delivery_orders
  add constraint delivery_orders_customer_phone_required
  check (customer_phone is not null and char_length(customer_phone) between 6 and 40)
  not valid;
