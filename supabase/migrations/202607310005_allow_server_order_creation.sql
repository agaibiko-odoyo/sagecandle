-- The Vercel payment route uses Supabase's server/secret role to create the
-- delivery order before it initiates an M-Pesa STK Push.
grant execute on function public.create_delivery_order(text, text, text, text, text, text, text, text, jsonb) to service_role;
