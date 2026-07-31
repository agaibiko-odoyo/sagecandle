-- Keep the earliest record for each reference. Repeated references remain as
-- payment rows for audit purposes, but their duplicate code is cleared so no
-- future order can reuse it.
with ranked_references as (
  select id,
    row_number() over (partition by mpesa_reference order by created_at asc, id asc) as reference_rank
  from public.mpesa_payments
  where mpesa_reference is not null
)
update public.mpesa_payments as payment
set mpesa_reference = null,
    result_description = coalesce(payment.result_description || ' ', '') || 'Duplicate M-Pesa reference cleared during fraud-protection setup.',
    updated_at = now()
from ranked_references
where payment.id = ranked_references.id
  and ranked_references.reference_rank > 1;

create unique index if not exists mpesa_payments_unique_reference
  on public.mpesa_payments (mpesa_reference)
  where mpesa_reference is not null;
