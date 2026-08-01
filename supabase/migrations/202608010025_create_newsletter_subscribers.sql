-- Newsletter emails are private and can only be written by the server endpoint.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  subscribed_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

grant insert on public.newsletter_subscribers to service_role;
