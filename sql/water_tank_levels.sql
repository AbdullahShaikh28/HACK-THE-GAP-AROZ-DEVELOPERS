alter table public.water_tanks
  add column if not exists capacity_used_lakh_liters numeric(10,2),
  add column if not exists capacity_available_lakh_liters numeric(10,2);

update public.water_tanks
set
  capacity_used_lakh_liters = coalesce(capacity_used_lakh_liters, 0),
  capacity_available_lakh_liters = coalesce(capacity_available_lakh_liters, capacity_lakh_liters);
