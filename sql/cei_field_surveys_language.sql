-- Preferred language for a field_survey row (matches chat: en, hi, mr, ur).

alter table public.field_surveys
  add column if not exists language text;

alter table public.field_surveys
  drop constraint if exists field_surveys_language_check;

alter table public.field_surveys
  add constraint field_surveys_language_check
  check (language is null or language in ('en', 'hi', 'mr', 'ur'));

comment on column public.field_surveys.language is 'Form/chat language: en, hi, mr, ur';
