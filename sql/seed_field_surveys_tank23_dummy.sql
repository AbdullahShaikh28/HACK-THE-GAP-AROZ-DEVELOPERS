-- Dummy field_surveys for tank_id = 23 with zone_number rotating 1–5 (~550 rows).
-- Prerequisites: water_tanks includes id 23; run cei_field_surveys*.sql and cei_field_surveys_zone_number.sql.
-- Run in Supabase SQL Editor as a privileged role (bypasses RLS).

insert into public.field_surveys (
  tank_id,
  respondent_name,
  phone_number,
  survey_date,
  arrival_time,
  duration_minutes,
  pressure_level,
  notes,
  image_url,
  submission_kind,
  report_channel,
  language,
  zone_number,
  created_at
)
select
  23,
  'Dummy respondent ' || s.n::text,
  '+9198765' || lpad((s.n % 50000)::text, 5, '0'),
  (current_date - ((s.n * 3) % 180))::date,
  (
    lpad((6 + (s.n % 12))::text, 2, '0')
    || ':'
    || lpad(((s.n * 7) % 60)::text, 2, '0')
    || ':00'
  )::time,
  15 + (s.n % 90),
  (array['low', 'medium', 'high']::text[])[1 + ((s.n - 1) % 3)],
  'Seeded survey — tank 23, zone '
    || ((((s.n - 1) % 5) + 1))::text
    || ', record '
    || s.n::text,
  null,
  case when s.n % 8 = 0 then 'supply_report' else 'field_survey' end,
  'web',
  (array['en', 'hi', 'mr', 'ur']::text[])[1 + ((s.n - 1) % 4)],
  (((s.n - 1) % 5) + 1)::smallint,
  timezone('utc', now())
    - (s.n * interval '97 minutes')
    - ((s.n % 23) * interval '1 day')
from generate_series(1, 550) as s (n);
