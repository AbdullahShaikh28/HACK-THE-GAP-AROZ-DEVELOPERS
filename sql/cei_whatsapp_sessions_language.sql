-- Language selection + extended step for WhatsApp flow

alter table public.whatsapp_sessions
  add column if not exists language text;

alter table public.whatsapp_sessions
  drop constraint if exists whatsapp_sessions_step_check;

alter table public.whatsapp_sessions
  add constraint whatsapp_sessions_step_check
  check (step in ('awaiting_language', 'awaiting_area', 'awaiting_complaint', 'completed'));

comment on column public.whatsapp_sessions.language is 'User chat language: hi, mr, ur, en';

-- Legacy rows: default language so area/complaint flows are not forced back to language selection
update public.whatsapp_sessions
set language = 'en'
where language is null;

-- Sub-area (1–6) step removed from WhatsApp; go straight to complaint after tank list
update public.whatsapp_sessions
set step = 'awaiting_complaint', selected_area_id = null
where step = 'awaiting_area';
