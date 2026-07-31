-- Makes status a controlled list in Supabase Table Editor and aligns old values.
-- No orders are deleted.

do $$ begin
  create type public.delivery_order_status as enum (
    'awaiting_confirmation',
    'order_confirmed',
    'departed_store',
    'out_for_delivery',
    'delivered_successfully'
  );
exception when duplicate_object then null;
end $$;

alter table public.delivery_orders drop constraint if exists delivery_orders_status_check;
alter table public.delivery_orders alter column status drop default;
alter table public.delivery_orders alter column status type public.delivery_order_status using (
  case status::text
    when 'order_confirmed' then 'order_confirmed'
    when 'confirmed' then 'order_confirmed'
    when 'departed_store' then 'departed_store'
    when 'preparing' then 'departed_store'
    when 'shipped' then 'departed_store'
    when 'out_for_delivery' then 'out_for_delivery'
    when 'delivered_successfully' then 'delivered_successfully'
    when 'delivered' then 'delivered_successfully'
    else 'awaiting_confirmation'
  end
)::public.delivery_order_status;
alter table public.delivery_orders alter column status set default 'awaiting_confirmation'::public.delivery_order_status;
