-- Separate contact provenance for supply reports (tank_contacts upsert).

alter table public.tank_contacts drop constraint if exists tank_contacts_source_check;
alter table public.tank_contacts add constraint tank_contacts_source_check
  check (source in ('complaint', 'profile', 'campaign_import', 'survey', 'supply_report'));
