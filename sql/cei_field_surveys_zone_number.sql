-- Optional service zone (1–5) for field surveys, aligned with tank_contacts.zone_number.

alter table public.field_surveys
  add column if not exists zone_number smallint;

alter table public.field_surveys
  drop constraint if exists field_surveys_zone_number_check;

alter table public.field_surveys
  add constraint field_surveys_zone_number_check
  check (zone_number is null or (zone_number >= 1 and zone_number <= 5));

comment on column public.field_surveys.zone_number is 'Distribution zone 1–5 for this survey row (e.g. tank 23 area bands).';
