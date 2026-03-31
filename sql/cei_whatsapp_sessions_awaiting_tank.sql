-- WhatsApp: tank must be chosen from list before complaint text (step awaiting_tank).

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
      'completed'
    )
  );

comment on column public.whatsapp_sessions.step is
  'Flow: language → tank list (awaiting_tank) → complaint text (awaiting_complaint) → completed.';
