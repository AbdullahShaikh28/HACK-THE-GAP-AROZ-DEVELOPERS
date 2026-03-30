-- If you previously added 'survey' to complaints.report_type, revert it.
-- Field surveys live in public.field_surveys (see cei_field_surveys.sql).

alter table public.complaints drop constraint if exists complaints_report_type_check;
alter table public.complaints add constraint complaints_report_type_check
  check (report_type in ('complaint', 'supply_report'));
