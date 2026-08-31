-- Complete the staging business flow without enabling payments or production.
alter table public.categories
  add column if not exists commission_terms_version text not null default 'eko-category-v1';

alter table public.groups
  add column if not exists selected_offer_id uuid references public.offers(id) on delete set null,
  add column if not exists competition_status text not null default 'open',
  add column if not exists competition_closed_at timestamptz;

alter table public.notifications
  add column if not exists notification_type text not null default 'general',
  add column if not exists action_path text;

revoke all on table public.notifications from anon, authenticated;
grant select, update on table public.notifications to authenticated;

drop policy if exists "users can read own notifications" on public.notifications;
create policy "users can read own notifications" on public.notifications
  for select to authenticated
  using ((select auth.uid()) = profile_id);

drop policy if exists "users can mark own notifications read" on public.notifications;
create policy "users can mark own notifications read" on public.notifications
  for update to authenticated
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

create index if not exists notifications_profile_created_idx
  on public.notifications(profile_id, created_at desc);

-- The category owns the fee. A submitted offer may only copy that exact fee and
-- must contain a timestamped acceptance of the same terms version.
create or replace function public.enforce_category_commission()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_model public.commission_model;
  v_value numeric;
  v_version text;
begin
  select c.commission_model, c.commission_value, c.commission_terms_version
    into v_model, v_value, v_version
  from public.offers o
  join public.groups g on g.id = o.group_id
  join public.categories c on c.id = g.category_id
  where o.id = new.offer_id;

  if v_model = 'manual_review_required' or v_value is null then
    raise exception 'Category commission must be configured before an offer can be published';
  end if;
  if new.commission_terms_accepted_by_company_at is null then
    raise exception 'Company must accept the category commission before publishing';
  end if;

  new.commission_type := v_model;
  new.commission_value := v_value;
  new.commission_currency := 'EUR';
  new.commission_terms_version := v_version;
  return new;
end
$$;

drop trigger if exists trg_enforce_category_commission on public.offer_versions;
create trigger trg_enforce_category_commission
before insert or update of commission_type, commission_value, commission_terms_version
on public.offer_versions
for each row execute function public.enforce_category_commission();

-- Once the first acceptance exists, commercial and fulfillment fields are immutable.
create or replace function public.prevent_locked_offer_version_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.locked_at is not null and (
    new.product_or_service is distinct from old.product_or_service or
    new.price is distinct from old.price or
    new.mandatory_fees is distinct from old.mandatory_fees or
    new.delivery_price is distinct from old.delivery_price or
    new.contract_length is distinct from old.contract_length or
    new.terms_version is distinct from old.terms_version or
    new.valid_until is distinct from old.valid_until or
    new.commission_type is distinct from old.commission_type or
    new.commission_value is distinct from old.commission_value
  ) then
    raise exception 'Accepted offer version is locked; publish a new version instead';
  end if;
  return new;
end
$$;

drop trigger if exists trg_prevent_locked_offer_version_change on public.offer_versions;
create trigger trg_prevent_locked_offer_version_change
before update on public.offer_versions
for each row execute function public.prevent_locked_offer_version_change();

create or replace function public.notify_joukko_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_name text;
begin
  if tg_table_name = 'group_members' and tg_op = 'INSERT' then
    select name into v_group_name from public.groups where id = new.group_id;
    insert into public.notifications(profile_id, notification_type, title, body, action_path)
    values (new.profile_id, 'group_joined', 'Olet mukana Joukossa',
      format('Liityit Joukkoon %s. Tämä ei vielä ole ostositoumus.', coalesce(v_group_name, 'JOUKKO')),
      '/joukot/' || new.group_id::text);
  elsif tg_table_name = 'offer_acceptances' and tg_op = 'INSERT' then
    insert into public.notifications(profile_id, notification_type, title, body, action_path)
    values (new.profile_id, 'offer_accepted', 'Tarjous hyväksytty',
      format('Hyväksyntäsi on tallennettu hintaan %s €. Saat erillisen tilaus- tai sopimusvahvistuksen kilpailun päättyessä.', new.current_price),
      '/minun');
  elsif tg_table_name = 'deals' and tg_op = 'UPDATE' and new.status = 'order_confirmed' and old.status is distinct from new.status then
    insert into public.notifications(profile_id, notification_type, title, body, action_path)
    values (new.user_id, 'order_confirmation', 'Tilaus- tai sopimusvahvistus',
      format('Voittava tarjous on vahvistettu. Kokonaishinta %s €. Myyjä vastaa toimituksesta ja sopimuksesta.', new.accepted_total_price),
      '/minun');
  end if;
  return new;
end
$$;

revoke all on function public.notify_joukko_events() from public, anon, authenticated;
drop trigger if exists trg_notify_group_joined on public.group_members;
create trigger trg_notify_group_joined after insert on public.group_members
for each row execute function public.notify_joukko_events();
drop trigger if exists trg_notify_offer_accepted on public.offer_acceptances;
create trigger trg_notify_offer_accepted after insert on public.offer_acceptances
for each row execute function public.notify_joukko_events();
drop trigger if exists trg_notify_order_confirmed on public.deals;
create trigger trg_notify_order_confirmed after update of status on public.deals
for each row execute function public.notify_joukko_events();

-- Admin-only atomic competition close. It locks every version, selects one
-- winner, confirms its deals, cancels losing deals, and emits confirmations.
create or replace function public.finalize_offer_competition(p_group_id uuid, p_winning_offer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin') then
    raise exception 'Admin role required';
  end if;
  if not exists (select 1 from public.offers where id = p_winning_offer_id and group_id = p_group_id and status in ('active', 'published')) then
    raise exception 'Winning offer must be active and belong to the group';
  end if;

  update public.groups
  set selected_offer_id = p_winning_offer_id, competition_status = 'finalized', competition_closed_at = now()
  where id = p_group_id and competition_status = 'open';
  if not found then raise exception 'Competition is already closed or missing'; end if;

  update public.offer_versions ov set locked_at = coalesce(ov.locked_at, now())
  from public.offers o where ov.offer_id = o.id and o.group_id = p_group_id;
  update public.offers set status = case when id = p_winning_offer_id then 'fulfillment'::public.offer_status else 'closed_to_new'::public.offer_status end,
    closed_at = now() where group_id = p_group_id;
  update public.deals set status = case when offer_id = p_winning_offer_id then 'order_confirmed'::public.deal_status else 'cancelled'::public.deal_status end,
    updated_at = now() where group_id = p_group_id and status in ('accepted', 'contact_shared');
end
$$;

revoke all on function public.finalize_offer_competition(uuid, uuid) from public, anon;
grant execute on function public.finalize_offer_competition(uuid, uuid) to authenticated;

