create table if not exists public.tank_contacts (
  id bigserial primary key,
  tank_id integer not null references public.water_tanks(id) on delete cascade,
  name text,
  phone_number text not null,
  source text not null default 'complaint' check (source in ('complaint', 'profile', 'campaign_import')),
  created_at timestamptz not null default now(),
  unique (tank_id, phone_number)
);

insert into public.tank_contacts (tank_id, name, phone_number, source)
select
  c.tank_id,
  c.name,
  c.phone_number,
  'complaint'
from public.complaints c
where c.phone_number is not null
on conflict (tank_id, phone_number) do update set
  name = excluded.name;

insert into public.tank_contacts (tank_id, name, phone_number, source)
select
  p.tank_id,
  p.full_name,
  p.phone_number,
  'profile'
from public.profiles p
where p.tank_id is not null and p.phone_number is not null
on conflict (tank_id, phone_number) do update set
  name = excluded.name;

create or replace view public.v_tank_contacts as
select
  tank_id,
  phone_number,
  max(name) as name,
  min(created_at) as first_seen_at
from public.tank_contacts
group by tank_id, phone_number;
