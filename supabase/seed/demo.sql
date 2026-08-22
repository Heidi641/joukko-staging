-- Kehityksen demodata. Älä aja tuotantoon.
insert into public.categories (name, slug, icon, country_code, active, regulated, sort_order) values
('Koti & energia', 'koti-energia', '⚡', 'FI', true, true, 1),
('Raha', 'raha', '🏦', 'FI', true, true, 2),
('Sopimukset', 'sopimukset', '📱', 'FI', true, true, 3),
('Liikkuminen', 'liikkuminen', '🚗', 'FI', true, false, 4),
('Ostokset', 'ostokset', '🛒', 'FI', true, false, 5),
('Matkat', 'matkat', '🏨', 'FI', true, true, 6)
on conflict (slug) do nothing;

insert into public.groups (category_id, name, slug, description, terms, area, target_count, status, featured)
select id, 'Halvempi sähkösopimus', 'halvempi-sahkosopimus', 'Kuluttajat etsivät vertailukelpoista sähkösopimusta ilman automaattista sopimuksen vaihtoa.', array['Ei automaattista sopimuksen vaihtoa', 'Yrityksille näytetään vain aggregoitu tieto'], 'Suomi', 1000, 'active', true
from public.categories where slug = 'koti-energia'
on conflict (slug) do nothing;
