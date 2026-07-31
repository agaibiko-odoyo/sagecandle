-- A short-lived, opaque token lets a guest check payment status without exposing
-- an order ID, address, phone number, or M-Pesa checkout reference to the browser.
create table if not exists public.order_access_tokens (
  order_id uuid primary key references public.delivery_orders(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.order_access_tokens enable row level security;
grant select, insert, delete on public.order_access_tokens to service_role;
