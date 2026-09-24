-- Staging-only successor to 006. Do not run against production before review.
-- New campaigns can override the broad category rate without editing accepted historical offers.
alter table public.groups
  add column if not exists commission_model_override public.commission_model,
  add column if not exists commission_value_override numeric(12,3),
  add column if not exists commission_terms_version_override text;
alter table public.groups
  add constraint group_commission_override_pair
  check ((commission_model_override is null and commission_value_override is null and commission_terms_version_override is null)
      or (commission_model_override is not null and commission_value_override is not null and commission_terms_version_override is not null and commission_value_override >= 0));

comment on column public.groups.commission_model_override is 'Admin-approved campaign-specific fee; immutable for already accepted offer versions.';
comment on column public.groups.commission_value_override is 'Percentage or per-completed-sale EUR value. No global EUR cap.';

-- Group pricing is administered, never decided by consumers who create groups.
create or replace function public.guard_group_commission_override()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.commission_model_override is null and new.commission_value_override is null then
    return new;
  end if;
  if tg_op = 'UPDATE'
     and new.commission_model_override is not distinct from old.commission_model_override
     and new.commission_value_override is not distinct from old.commission_value_override
     and new.commission_terms_version_override is not distinct from old.commission_terms_version_override then
    return new;
  end if;
  if current_user in ('postgres', 'service_role') then return new; end if;
  if not exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin') then
    raise exception 'Only verified JOUKKO administrators may set campaign commission terms';
  end if;
  return new;
end $$;
drop trigger if exists trg_guard_group_commission_override on public.groups;
create trigger trg_guard_group_commission_override
before insert or update of commission_model_override, commission_value_override, commission_terms_version_override
on public.groups for each row execute function public.guard_group_commission_override();

-- Freeze the effective campaign or category terms into every NEW offer version.
-- Accepted historical versions are intentionally untouched.
create or replace function public.enforce_category_commission()
returns trigger language plpgsql security invoker set search_path = public as $$
declare
  v_model public.commission_model;
  v_value numeric;
  v_version text;
begin
  select coalesce(g.commission_model_override,c.commission_model),
         coalesce(g.commission_value_override,c.commission_value),
         coalesce(g.commission_terms_version_override,c.commission_terms_version)
    into v_model,v_value,v_version
  from public.offers o
  join public.groups g on g.id=o.group_id
  join public.categories c on c.id=g.category_id
  where o.id=new.offer_id;
  if v_model is null or v_model='manual_review_required' or v_value is null then
    raise exception 'Campaign fee must be approved before creating the offer version';
  end if;
  if new.commission_terms_accepted_by_company_at is null
      or new.commission_terms_version is distinct from v_version
      or new.commission_type is distinct from v_model
      or new.commission_value is distinct from v_value then
    raise exception 'Seller must explicitly accept the current campaign fee and terms';
  end if;
  new.commission_currency := 'EUR';
  return new;
end $$;

-- Never calculate a percentage of a VAT-inclusive price.
-- Completion of a deal requires the verified net sale amount and a manual evidence reference.
alter table public.deals
  add column if not exists verified_net_sale_amount numeric(14,2),
  add column if not exists merchant_verified_at timestamptz,
  add column if not exists merchant_sale_reference text;
alter table public.deals
  add constraint deal_verified_net_nonnegative check(verified_net_sale_amount is null or verified_net_sale_amount >= 0);

create or replace function public.create_commission_for_completed_deal()
returns trigger language plpgsql security invoker set search_path = public as $$
declare v_terms record; v_amount numeric(12,2); v_basis numeric;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    select commission_type,commission_value,commission_currency into v_terms
      from public.offer_versions where id = new.offer_version_id;
    if new.merchant_verified_at is null
       or nullif(trim(coalesce(new.merchant_sale_reference,'')),'') is null then
      raise exception 'Sale verification and non-personal reference required before completion';
    end if;
    if v_terms.commission_type::text in ('percentage_of_trade','recurring_revenue_share')
       and (new.verified_net_sale_amount is null or new.verified_net_sale_amount <= 0
           or (new.accepted_total_price is not null and new.verified_net_sale_amount > new.accepted_total_price)) then
      raise exception 'Admin must verify a realistic positive VAT-exclusive sale amount';
    end if;
    if v_terms.commission_type is not null
       and v_terms.commission_type::text <> 'manual_review_required'
       and coalesce(v_terms.commission_value,0)>0 then
      v_basis := coalesce(new.verified_net_sale_amount,0);
      v_amount := public.calculate_commission_amount(v_terms.commission_type,v_terms.commission_value,v_basis);
      insert into public.commissions(deal_id,offer_id,offer_version_id,company_id,commission_type,commission_value,currency,deal_value,amount,status)
      values(new.id,new.offer_id,new.offer_version_id,new.company_id,v_terms.commission_type,v_terms.commission_value,coalesce(v_terms.commission_currency,'EUR'),v_basis,v_amount,'accrued')
      on conflict(deal_id) do nothing;
    end if;
  end if;
  return new;
end $$;

-- Default fee schedule for NEW category-level offers on staging.
-- Existing published offers retain their snapshotted fee, never silently repriced.
update public.categories set commission_model='percentage_of_trade',commission_value=3,commission_terms_version='joukko-success-v2-draft'
where slug='koti-energia';
update public.categories set commission_model='percentage_of_trade',commission_value=4,commission_terms_version='joukko-success-v2-draft'
where slug='ostokset';
update public.categories set commission_model='percentage_of_trade',commission_value=4,commission_terms_version='joukko-success-v2-draft'
where slug='liikkuminen';
-- Do not authorize regulated travel products by updating its existing test fees.

-- Keep these security-invoker API views in sync with the new fee fields.
-- Existing view columns stay in their previous order; new fields are appended.
create or replace view public.group_cards with (security_invoker=true) as
select g.id,g.founder_id,g.category_id,g.name,g.slug,g.description,g.terms,g.area,g.target_count,
       g.status,g.featured,g.country_code,g.currency_code,g.locale,g.timezone,g.created_at,
       g.group_type,g.want_summary,g.detail_note,g.brand,g.model,g.model_code,g.required_features,
       g.member_count,g.follower_count,g.committed_count,g.ready_now_count,g.offer_count,
       g.new_members_24h,g.new_members_7d,
       c.name as category_name,c.slug as category_slug,c.icon as category_icon,
       null::text as next_tier_label,
       g.commission_model_override,g.commission_value_override,g.commission_terms_version_override
from public.groups g join public.categories c on c.id=g.category_id;

create or replace view public.category_participation_counts with (security_invoker=true) as
select c.id,c.name,c.slug,c.parent_id,c.icon,c.country_code,c.active,c.regulated,c.sort_order,
       c.created_at,
       coalesce(sum(g.member_count) filter(where g.status='active'::public.group_status),0::bigint)::integer as participation_count,
       c.commission_model,c.commission_value,c.commission_terms_version
from public.categories c
left join public.groups g on g.category_id=c.id
where c.active=true
group by c.id;
