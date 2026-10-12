-- Tanker requests table for dashboard tanker module.
-- Run this in Supabase SQL editor before using /dashboard/tankers.

create extension if not exists pgcrypto;

create table if not exists public.tanker_requests (
  id uuid primary key default gen_random_uuid(),
  tank_id integer not null references public.water_tanks(id) on delete cascade,
  requester_name text not null,
  vehicle_number text not null,
  phone_number text not null,
  address text not null,
  supply_date date not null,
  supply_time time not null,
  payment_status text not null check (payment_status in ('received', 'cod', 'online')),
  source text not null default 'dashboard',
  created_at timestamptz not null default now()
);

alter table if exists public.tanker_requests
  add column if not exists vehicle_number text;

alter table if exists public.tanker_requests
  add column if not exists source text;

create index if not exists tanker_requests_tank_id_idx
  on public.tanker_requests (tank_id);

create index if not exists tanker_requests_created_at_idx
  on public.tanker_requests (created_at desc);
