-- Public supply reports use field_surveys (submission_kind = supply_report).
-- Staff dashboard surveys default to field_survey.

alter table public.field_surveys
  add column if not exists notes text,
  add column if not exists image_url text,
  add column if not exists submission_kind text not null default 'field_survey'
    check (submission_kind in ('field_survey', 'supply_report')),
  add column if not exists report_channel text
    check (report_channel is null or report_channel in ('web', 'whatsapp'));

drop policy if exists "anon_insert_field_surveys" on public.field_surveys;
create policy "anon_insert_field_surveys"
  on public.field_surveys for insert
  to anon
  with check (true);
