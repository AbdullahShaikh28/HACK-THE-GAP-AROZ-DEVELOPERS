create table if not exists public.tank_areas (
  id bigserial primary key,
  tank_id integer not null references public.water_tanks(id) on delete cascade,
  area_name text not null,
  eta_minutes integer not null check (eta_minutes >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  pressure_level text not null check (pressure_level in ('low', 'medium', 'high')),
  priority_rank integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_tank_areas_tank_id_rank
  on public.tank_areas (tank_id, priority_rank);

insert into public.tank_areas (tank_id, area_name, eta_minutes, duration_minutes, pressure_level, priority_rank)
select
  wt.id,
  concat(regexp_replace(wt.area_address, ',.*$', ''), ' Zone ', gs.i) as area_name,
  (gs.i * 15) as eta_minutes,
  case when gs.i in (1, 2) then 45 when gs.i in (3, 4) then 35 else 25 end as duration_minutes,
  case when gs.i in (1, 2) then 'high' when gs.i in (3, 4) then 'medium' else 'low' end as pressure_level,
  gs.i as priority_rank
from public.water_tanks wt
cross join generate_series(1, 6) as gs(i)
where not exists (
  select 1 from public.tank_areas ta where ta.tank_id = wt.id
);
