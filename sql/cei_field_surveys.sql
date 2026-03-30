-- Field survey responses (separate from complaints).

create table if not exists public.field_surveys (
  id uuid primary key default gen_random_uuid(),
  tank_id integer not null references public.water_tanks(id) on delete restrict,
  submitted_by uuid references auth.users(id) on delete set null,
  respondent_name text not null,
  phone_number text not null,
  survey_date date,
  arrival_time time,
  duration_minutes integer,
  pressure_level text not null check (pressure_level in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

create index if not exists idx_field_surveys_tank_id on public.field_surveys (tank_id);
create index if not exists idx_field_surveys_created_at on public.field_surveys (created_at desc);

alter table public.field_surveys enable row level security;

drop policy if exists "authenticated_insert_field_surveys" on public.field_surveys;
create policy "authenticated_insert_field_surveys"
  on public.field_surveys for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated_select_field_surveys" on public.field_surveys;
create policy "authenticated_select_field_surveys"
  on public.field_surveys for select
  to authenticated
  using (true);

alter table public.field_surveys add column if not exists survey_date date;
