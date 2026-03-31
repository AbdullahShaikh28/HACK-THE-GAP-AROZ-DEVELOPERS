-- Public "Scheduled" tab: tanks flagged for supply / valve schedule visibility.
alter table public.water_tanks
  add column if not exists scheduled boolean not null default false;

comment on column public.water_tanks.scheduled is
  'When true, tank appears under the Scheduled tab on the public tanks page.';

-- Demo: Town Hall tank (id 23) has field survey and valve scheduling data.
update public.water_tanks set scheduled = true where id = 23;
