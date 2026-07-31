-- Saved contact and delivery defaults for signed-in customers only.

create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  city text,
  postal_code text,
  delivery_notes text,
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.customer_profiles;
create policy "Users can read their own profile" on public.customer_profiles
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "Users can insert their own profile" on public.customer_profiles;
create policy "Users can insert their own profile" on public.customer_profiles
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users can update their own profile" on public.customer_profiles;
create policy "Users can update their own profile" on public.customer_profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
