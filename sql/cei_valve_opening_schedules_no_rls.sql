-- Backend-owned valve schedule storage (no RLS in this migration).
-- Frontend must only read/display rows created by backend processes.

create table if not exists public.valve_opening_schedules (
  id bigserial primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  tank_id integer not null references public.water_tanks(id) on delete cascade,
  zone_number integer
    check (zone_number is null or (zone_number >= 1 and zone_number <= 5)),
  created_source text not null default 'backend_ai'
    check (created_source in ('backend_ai', 'backend_manual')),
  schedule_date date not null,
  open_at time not null,
  duration_minutes integer not null check (duration_minutes between 1 and 360),
  timezone text not null default 'Asia/Kolkata',
  status text not null default 'scheduled'
    check (status in ('scheduled', 'opened', 'completed', 'cancelled')),
  ai_payload jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_valve_sched_owner_status_date
  on public.valve_opening_schedules (owner_user_id, status, schedule_date, open_at);

create index if not exists idx_valve_sched_tank_status_date
  on public.valve_opening_schedules (tank_id, status, schedule_date, open_at);

drop index if exists uq_valve_sched_slot_active;
create unique index if not exists uq_valve_sched_slot_active
  on public.valve_opening_schedules (
    owner_user_id,
    tank_id,
    coalesce(zone_number, 0),
    schedule_date,
    open_at
  )
  where status in ('scheduled', 'opened');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_valve_sched_updated_at on public.valve_opening_schedules;
create trigger trg_valve_sched_updated_at
before update on public.valve_opening_schedules
for each row execute procedure public.set_updated_at();

create or replace view public.v_home_scheduled_tanks as
with upcoming as (
  select
    s.*,
    (s.schedule_date::timestamp + s.open_at) as scheduled_start_local
  from public.valve_opening_schedules s
  where s.status = 'scheduled'
    and (s.schedule_date::timestamp + s.open_at) >= now()::timestamp
    and s.created_source in ('backend_ai', 'backend_manual')
),
nearest as (
  select distinct on (owner_user_id, tank_id)
    owner_user_id,
    tank_id,
    id as schedule_id,
    schedule_date,
    open_at,
    duration_minutes,
    timezone,
    scheduled_start_local,
    ai_payload,
    notes,
    created_at
  from upcoming
  order by owner_user_id, tank_id, scheduled_start_local asc
)
select
  n.owner_user_id,
  n.tank_id,
  wt.name as tank_name,
  wt.type as tank_type,
  wt.ward,
  wt.area_address,
  n.schedule_id,
  n.schedule_date,
  n.open_at,
  n.duration_minutes,
  n.timezone,
  n.scheduled_start_local,
  n.ai_payload,
  n.notes,
  n.created_at
from nearest n
join public.water_tanks wt on wt.id = n.tank_id
order by n.owner_user_id, n.scheduled_start_local asc;
