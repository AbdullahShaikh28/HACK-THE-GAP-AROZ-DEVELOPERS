create table if not exists public.whatsapp_sessions (
  phone_number text primary key,
  tank_id integer not null references public.water_tanks(id) on delete cascade,
  selected_area_id bigint references public.tank_areas(id) on delete set null,
  step text not null default 'awaiting_area' check (step in ('awaiting_area', 'awaiting_complaint', 'completed')),
  last_inbound_message_sid text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_whatsapp_sessions_tank_id
  on public.whatsapp_sessions (tank_id);
