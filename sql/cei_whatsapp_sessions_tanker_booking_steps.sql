-- WhatsApp tanker booking flow steps:
-- booking intent -> awaiting_tanker_tank -> awaiting_tanker_booking_datetime -> completed

alter table public.whatsapp_sessions
  drop constraint if exists whatsapp_sessions_step_check;

alter table public.whatsapp_sessions
  add constraint whatsapp_sessions_step_check
  check (
    step in (
      'awaiting_language',
      'awaiting_area',
      'awaiting_tank',
      'awaiting_complaint',
      'awaiting_tanker_tank',
      'awaiting_tanker_booking_datetime',
      'completed'
    )
  );

comment on column public.whatsapp_sessions.step is
  'Flow: language -> tank/complaint OR tanker booking (awaiting_tanker_tank -> awaiting_tanker_booking_datetime) -> completed.';
