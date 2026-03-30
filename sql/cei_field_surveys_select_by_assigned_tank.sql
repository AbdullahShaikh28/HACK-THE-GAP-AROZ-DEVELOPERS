-- Authenticated users only see field_surveys for their profile's assigned tank
-- (includes public supply reports where submitted_by is null).

drop policy if exists "authenticated_select_field_surveys" on public.field_surveys;

create policy "authenticated_select_field_surveys"
  on public.field_surveys for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.tank_id is not null
        and p.tank_id = field_surveys.tank_id
    )
  );
