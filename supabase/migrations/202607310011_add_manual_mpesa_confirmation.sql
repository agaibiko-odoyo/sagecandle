alter table public.mpesa_payments add column if not exists mpesa_reference text;
alter table public.mpesa_payments drop constraint if exists mpesa_payments_mpesa_reference_check;
alter table public.mpesa_payments add constraint mpesa_payments_mpesa_reference_check
  check (mpesa_reference is null or mpesa_reference ~ '^[A-Z0-9]{10}$');
alter table public.mpesa_payments drop constraint if exists mpesa_payments_status_check;
alter table public.mpesa_payments add constraint mpesa_payments_status_check
  check (status in ('initiated', 'awaiting_confirmation', 'pending', 'paid', 'failed'));

alter table public.delivery_orders drop constraint if exists delivery_orders_status_check;
alter table public.delivery_orders add constraint delivery_orders_status_check
  check (status in ('pending', 'awaiting_confirmation', 'awaiting_payment', 'payment_failed', 'confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'));
