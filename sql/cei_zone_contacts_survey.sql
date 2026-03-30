-- Survey source + optional zone_number (1–5) for zone contacts dashboard.

alter table public.tank_contacts drop constraint if exists tank_contacts_source_check;
alter table public.tank_contacts add constraint tank_contacts_source_check
  check (source in ('complaint', 'profile', 'campaign_import', 'survey'));

alter table public.tank_contacts
  add column if not exists zone_number smallint;

alter table public.tank_contacts drop constraint if exists tank_contacts_zone_number_check;
alter table public.tank_contacts add constraint tank_contacts_zone_number_check
  check (zone_number is null or (zone_number >= 1 and zone_number <= 5));

create or replace view public.v_tank_contacts as
select
  tank_id,
  phone_number,
  max(name) as name,
  min(created_at) as first_seen_at,
  max(zone_number) as zone_number
from public.tank_contacts
group by tank_id, phone_number;
