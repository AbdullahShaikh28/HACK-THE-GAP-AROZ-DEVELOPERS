-- Photo GPS, distance-to-tank check, and optional Ollama vision labels for complaints and field_surveys.

alter table public.complaints
  add column if not exists photo_latitude double precision,
  add column if not exists photo_longitude double precision,
  add column if not exists photo_location_accuracy_m double precision,
  add column if not exists distance_to_tank_m double precision,
  add column if not exists location_check_status text
    check (location_check_status is null or location_check_status in ('pass', 'fail', 'unavailable')),
  add column if not exists ai_issue_label text,
  add column if not exists ai_issue_raw jsonb,
  add column if not exists ai_analyzed_at timestamptz;

comment on column public.complaints.photo_latitude is 'WGS84 latitude from device GPS or EXIF at capture time.';
comment on column public.complaints.photo_longitude is 'WGS84 longitude from device GPS or EXIF at capture time.';
comment on column public.complaints.distance_to_tank_m is 'Haversine distance from photo point to selected water_tanks centroid.';
comment on column public.complaints.location_check_status is 'pass: within PHOTO_MAX_DISTANCE_M; fail: outside; unavailable: no coords.';
comment on column public.complaints.ai_issue_label is 'Suggested issue label from local Ollama vision model (if configured).';

alter table public.field_surveys
  add column if not exists photo_latitude double precision,
  add column if not exists photo_longitude double precision,
  add column if not exists photo_location_accuracy_m double precision,
  add column if not exists distance_to_tank_m double precision,
  add column if not exists location_check_status text
    check (location_check_status is null or location_check_status in ('pass', 'fail', 'unavailable')),
  add column if not exists ai_issue_label text,
  add column if not exists ai_issue_raw jsonb,
  add column if not exists ai_analyzed_at timestamptz;

comment on column public.field_surveys.photo_latitude is 'WGS84 latitude from device GPS or EXIF at capture time.';
comment on column public.field_surveys.distance_to_tank_m is 'Haversine distance from photo point to selected water_tanks centroid.';
comment on column public.field_surveys.location_check_status is 'pass: within PHOTO_MAX_DISTANCE_M; fail: outside; unavailable: no coords.';
