alter table public.profiles
  add column if not exists phone_number text,
  add column if not exists tank_id integer references public.water_tanks(id) on delete set null;

alter table public.profiles enable row level security;

drop policy if exists "users_select_own_profile" on public.profiles;
create policy "users_select_own_profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "users_insert_own_profile" on public.profiles;
create policy "users_insert_own_profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "users_update_own_profile" on public.profiles;
create policy "users_update_own_profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    phone_number,
    tank_id
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone_number',
    nullif(new.raw_user_meta_data ->> 'tank_id', '')::integer
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    phone_number = excluded.phone_number,
    tank_id = excluded.tank_id,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
