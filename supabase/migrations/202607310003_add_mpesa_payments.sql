create table if not exists public.mpesa_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.delivery_orders(id) on delete cascade,
  phone_number text not null,
  amount numeric(12, 2) not null check (amount > 0),
  merchant_request_id text,
  checkout_request_id text unique,
  status text not null default 'initiated' check (status in ('initiated', 'pending', 'paid', 'failed')),
  result_code integer,
  result_description text,
  mpesa_receipt_number text,
  callback_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mpesa_payments enable row level security;

alter table public.delivery_orders drop constraint if exists delivery_orders_status_check;
alter table public.delivery_orders add constraint delivery_orders_status_check
  check (status in ('pending', 'awaiting_payment', 'payment_failed', 'confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'));
