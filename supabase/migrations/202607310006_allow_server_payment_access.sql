-- Allows the Vercel server role to read the authoritative order total and to
-- create/update M-Pesa payment records. Browser roles remain protected by RLS.
grant select, update on public.delivery_orders to service_role;
grant select, insert, update on public.mpesa_payments to service_role;
