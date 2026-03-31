-- Human-readable reverse-geocoded address at capture time (Nominatim display_name).
-- Run this in the Supabase SQL editor on each environment. If you still see
-- "Could not find the 'capture_address' column ... in the schema cache", wait a minute
-- or use Dashboard → Settings → API → Reload schema (or restart the project).

alter table public.complaints
  add column if not exists capture_address text;

comment on column public.complaints.capture_address is 'OSM/Nominatim display_name for photo_latitude/photo_longitude when known.';

alter table public.field_surveys
  add column if not exists capture_address text;

comment on column public.field_surveys.capture_address is 'OSM/Nominatim display_name for photo_latitude/photo_longitude when known.';
