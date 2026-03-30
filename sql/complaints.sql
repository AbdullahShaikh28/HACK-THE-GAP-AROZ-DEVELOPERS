create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('imaged', 'imaged', true)
on conflict (id) do update set public = true;

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_number text not null,
  tank_id integer not null references public.water_tanks(id) on delete restrict,
  issue text not null,
  arrival_time time,
  duration_minutes integer,
  pressure_level text check (pressure_level in ('low', 'medium', 'high')),
  report_channel text not null default 'web' check (report_channel in ('web', 'whatsapp')),
  source_phone text,
  whatsapp_message_sid text,
  report_type text not null default 'complaint' check (report_type in ('complaint', 'supply_report')),
  image_url text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'rejected')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

alter table public.complaints
  add column if not exists priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  add column if not exists arrival_time time,
  add column if not exists duration_minutes integer,
  add column if not exists pressure_level text check (pressure_level in ('low', 'medium', 'high')),
  add column if not exists report_channel text not null default 'web' check (report_channel in ('web', 'whatsapp')),
  add column if not exists source_phone text,
  add column if not exists whatsapp_message_sid text,
  add column if not exists report_type text not null default 'complaint' check (report_type in ('complaint', 'supply_report'));

alter table public.complaints enable row level security;
alter table public.complaints disable row level security;

drop policy if exists "anyone_can_insert_complaints" on public.complaints;
drop policy if exists "authenticated_can_view_complaints" on public.complaints;

drop policy if exists "public_read_images_bucket" on storage.objects;
create policy "public_read_images_bucket"
  on storage.objects
  for select
  to public
  using (bucket_id = 'imaged');

drop policy if exists "anyone_upload_images_bucket" on storage.objects;
create policy "anyone_upload_images_bucket"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'imaged');
