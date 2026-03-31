-- Add complaints.language (no RLS). Run in Supabase SQL Editor if PostgREST reports missing column.

alter table public.complaints
  add column if not exists language text;

alter table public.complaints
  drop constraint if exists complaints_language_check;

alter table public.complaints
  add constraint complaints_language_check
  check (language is null or language in ('en', 'hi', 'mr', 'ur'));

comment on column public.complaints.language is 'Public complaint form language: en, hi, mr, ur';
