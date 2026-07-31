-- The reference is normalized to uppercase by the server; the unique index also
-- protects against simultaneous duplicate submissions.
create unique index if not exists mpesa_payments_unique_reference
  on public.mpesa_payments (mpesa_reference)
  where mpesa_reference is not null;
