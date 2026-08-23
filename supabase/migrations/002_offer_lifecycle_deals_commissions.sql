do $$
begin
  if not exists (select 1 from pg_type where typname = 'deal_status' and typnamespace = 'public'::regnamespace) then
    create type public.deal_status as enum (
      'accepted',
      'contact_shared',
      'checkout_sent',
      'checkout_started',
      'order_confirmed',
      'fulfillment_pending',
      'fulfillment_in_progress',
      'completed',
      'cancelled',
      'refunded',
      'disputed'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'fulfillment_start_type' and typnamespace = 'public'::regnamespace) then
    create type public.fulfillment_start_type as enum (
      'immediately_after_acceptance',
      'after_offer_closes',
      'fixed_date',
      'date_range',
      'company_schedules_with_customer'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'commission_model' and typnamespace = 'public'::regnamespace) then
    create type public.commission_model as enum (
      'per_completed_customer',
      'percentage_of_trade',
      'fixed_campaign_fee',
      'manual_review_required'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'commission_status' and typnamespace = 'public'::regnamespace) then
    create type public.commission_status as enum (
      'pending',
      'accrued',
      'invoiced',
      'paid',
      'failed',
      'credited',
      'void'
    );
  end if;
end $$;

alter type public.offer_status add value if not exists 'published';
alter type public.offer_status add value if not exists 'closed_to_new';
alter type public.offer_status add value if not exists 'fulfillment';
alter type public.offer_status add value if not exists 'completed';
alter type public.offer_status add value if not exists 'cancelled_exception';
alter type public.offer_status add value if not exists 'archived';

alter table public.groups
  add column if not exists group_type text not null default 'open',
  add column if not exists want_summary text,
  add column if not exists detail_note text,
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists model_code text;

alter table public.offers
  add column if not exists closes_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists max_acceptances integer,
  add column if not exists stock_limit integer,
  add column if not exists unlimited_until_close boolean not null default false,
  add column if not exists exception_requested_at timestamptz,
  add column if not exists exception_reason text,
  add column if not exists exception_document_reference text,
  add column if not exists exception_admin_status text,
  add column if not exists archived_at timestamptz;

alter table public.offer_versions
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists model_code text,
  add column if not exists product_image_url text,
  add column if not exists availability text,
  add column if not exists product_price numeric(12,2),
  add column if not exists shipping_price numeric(12,2),
  add column if not exists requirement_match text,
  add column if not exists category_match text,
  add column if not exists comparison_fields jsonb not null default '{}'::jsonb,
  add column if not exists public_company_name text,
  add column if not exists public_company_business_id text,
  add column if not exists public_company_contact text,
  add column if not exists public_company_country text,
  add column if not exists public_company_verification_status text,
  add column if not exists accepted_by_company_id uuid references public.profiles(id) on delete set null,
  add column if not exists company_confirmation_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists fulfillment_start_type public.fulfillment_start_type not null default 'after_offer_closes',
  add column if not exists fulfillment_start_date date,
  add column if not exists fulfillment_end_date date,
  add column if not exists delivery_days_min integer,
  add column if not exists delivery_days_max integer,
  add column if not exists fulfillment_note text,
  add column if not exists max_acceptances integer,
  add column if not exists stock_limit integer,
  add column if not exists unlimited_until_close boolean not null default false,
  add column if not exists commission_type public.commission_model not null default 'manual_review_required',
  add column if not exists commission_value numeric(12,4),
  add column if not exists commission_currency text not null default 'EUR',
  add column if not exists commission_terms_version text not null default 'LEGAL_REVIEW_REQUIRED',
  add column if not exists commission_terms_accepted_by_company_at timestamptz;

create table if not exists public.data_sharing_consents (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  offer_version_id uuid not null references public.offer_versions(id) on delete restrict,
  company_id uuid not null references public.companies(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  consent_version text not null,
  purpose text not null,
  data_categories text[] not null,
  accepted_at timestamptz not null default now(),
  unique(offer_version_id, profile_id, consent_version)
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  offer_acceptance_id uuid not null unique references public.offer_acceptances(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  company_id uuid not null references public.companies(id) on delete restrict,
  group_id uuid not null references public.groups(id) on delete restrict,
  offer_id uuid not null references public.offers(id) on delete restrict,
  offer_version_id uuid not null references public.offer_versions(id) on delete restrict,
  accepted_total_price numeric(12,2) not null,
  accepted_terms_version text not null,
  accepted_fulfillment_terms jsonb not null,
  data_sharing_consent_version text not null,
  checkout_url text,
  redemption_url text,
  referral_code text,
  status public.deal_status not null default 'accepted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.deals
  add column if not exists user_id uuid references public.profiles(id) on delete restrict,
  add column if not exists group_id uuid references public.groups(id) on delete restrict,
  add column if not exists offer_version_id uuid references public.offer_versions(id) on delete restrict,
  add column if not exists accepted_total_price numeric(12,2),
  add column if not exists accepted_terms_version text,
  add column if not exists accepted_fulfillment_terms jsonb not null default '{}'::jsonb,
  add column if not exists data_sharing_consent_version text,
  add column if not exists checkout_url text,
  add column if not exists redemption_url text,
  add column if not exists referral_code text,
  add column if not exists updated_at timestamptz not null default now();

update public.deals set user_id = coalesce(user_id, consumer_id), accepted_total_price = coalesce(accepted_total_price, final_price) where user_id is null or accepted_total_price is null;
create unique index if not exists deals_offer_acceptance_id_unique on public.deals(offer_acceptance_id);

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null unique references public.deals(id) on delete restrict,
  offer_id uuid not null references public.offers(id) on delete restrict,
  offer_version_id uuid not null references public.offer_versions(id) on delete restrict,
  company_id uuid not null references public.companies(id) on delete restrict,
  commission_type public.commission_model not null,
  commission_value numeric(12,4) not null,
  currency text not null default 'EUR',
  deal_value numeric(12,2) not null,
  amount numeric(12,2) not null,
  status public.commission_status not null default 'accrued',
  stripe_invoice_id text,
  billing_batch_id uuid,
  created_at timestamptz not null default now(),
  credited_at timestamptz
);

alter table public.commissions
  add column if not exists offer_id uuid references public.offers(id) on delete restrict,
  add column if not exists offer_version_id uuid references public.offer_versions(id) on delete restrict,
  add column if not exists commission_type public.commission_model,
  add column if not exists commission_value numeric(12,4),
  add column if not exists currency text not null default 'EUR',
  add column if not exists deal_value numeric(12,2),
  add column if not exists stripe_invoice_id text,
  add column if not exists billing_batch_id uuid,
  add column if not exists credited_at timestamptz;

create unique index if not exists commissions_deal_id_unique on public.commissions(deal_id);

create table if not exists public.commission_batches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  period_start date,
  period_end date,
  currency text not null default 'EUR',
  amount numeric(12,2) not null default 0,
  status public.commission_status not null default 'pending',
  stripe_invoice_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.offer_exception_requests (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete restrict,
  company_id uuid not null references public.companies(id) on delete restrict,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  reason_type text not null,
  description text not null,
  document_reference text,
  impact_on_accepted text not null,
  status text not null default 'pending_admin_review',
  legal_note text not null default 'LEGAL_REVIEW_REQUIRED',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null
);

alter table public.data_sharing_consents enable row level security;
alter table public.deals enable row level security;
alter table public.commissions enable row level security;
alter table public.commission_batches enable row level security;
alter table public.offer_exception_requests enable row level security;

revoke insert, update, delete, truncate, references, trigger on public.commissions from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.commission_batches from anon, authenticated;
revoke update, delete, truncate, references, trigger on public.deals from anon, authenticated;
revoke update, delete, truncate, references, trigger on public.data_sharing_consents from anon, authenticated;

grant select on public.deals to authenticated;
grant select, insert on public.data_sharing_consents to authenticated;
grant select on public.commissions to authenticated;
grant select on public.commission_batches to authenticated;

create or replace function public.has_data_sharing_consent(
  p_offer_version_id uuid,
  p_profile_id uuid,
  p_company_id uuid,
  p_consent_version text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.data_sharing_consents dsc
    where dsc.offer_version_id = p_offer_version_id
      and dsc.profile_id = p_profile_id
      and dsc.company_id = p_company_id
      and dsc.consent_version = p_consent_version
  )
$$;

create or replace function public.has_company_deal_for_consent(
  p_offer_version_id uuid,
  p_profile_id uuid,
  p_company_id uuid,
  p_consent_version text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.deals d
    where d.offer_version_id = p_offer_version_id
      and d.user_id = p_profile_id
      and d.company_id = p_company_id
      and d.data_sharing_consent_version = p_consent_version
  )
$$;

revoke all on function public.has_data_sharing_consent(uuid, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.has_company_deal_for_consent(uuid, uuid, uuid, text) from public, anon, authenticated;

create policy "users can read own data sharing consents" on public.data_sharing_consents
  for select using (auth.uid() = profile_id);
create policy "users can create own data sharing consents" on public.data_sharing_consents
  for insert with check (auth.uid() = profile_id);
create policy "company owners can read consents for own deals" on public.data_sharing_consents
  for select using (
    exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())
    and public.has_company_deal_for_consent(data_sharing_consents.offer_version_id, data_sharing_consents.profile_id, data_sharing_consents.company_id, data_sharing_consents.consent_version)
  );

create policy "users can read own deals" on public.deals
  for select using (auth.uid() = user_id);
create policy "company owners can read consented own offer deals" on public.deals
  for select using (
    exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())
    and public.has_data_sharing_consent(deals.offer_version_id, deals.user_id, deals.company_id, deals.data_sharing_consent_version)
  );

create policy "company owners can read own commissions" on public.commissions
  for select using (exists (
    select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid()
  ));
create policy "company owners can read own commission batches" on public.commission_batches
  for select using (exists (
    select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid()
  ));
create policy "company owners can create exception requests" on public.offer_exception_requests
  for insert with check (exists (
    select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid()
  ));
create policy "company owners can read own exception requests" on public.offer_exception_requests
  for select using (exists (
    select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid()
  ));

create policy "admins can manage data sharing consents" on public.data_sharing_consents
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage deals" on public.deals
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage commissions" on public.commissions
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage commission batches" on public.commission_batches
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage exception requests" on public.offer_exception_requests
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create or replace function public.calculate_commission_amount(
  p_type public.commission_model,
  p_value numeric,
  p_deal_value numeric
)
returns numeric
language sql
stable
as $$
  select case
    when p_type = 'percentage_of_trade' then round(coalesce(p_deal_value, 0) * coalesce(p_value, 0) / 100, 2)
    when p_type in ('per_completed_customer', 'fixed_campaign_fee') then round(coalesce(p_value, 0), 2)
    else 0
  end
$$;

create or replace function public.create_deal_for_acceptance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_fulfillment jsonb;
  v_consent_version text := 'data-sharing-v1';
begin
  if (select auth.uid()) is distinct from new.profile_id then
    raise exception 'deal creation requires the accepting user';
  end if;

  if new.acceptance_snapshot->>'data_sharing_consent_version' is distinct from v_consent_version then
    raise exception 'data sharing consent is required before creating a deal';
  end if;

  select o.group_id into v_group_id
  from public.offers o
  where o.id = new.offer_id;

  select jsonb_build_object(
    'fulfillment_start_type', ov.fulfillment_start_type,
    'fulfillment_start_date', ov.fulfillment_start_date,
    'fulfillment_end_date', ov.fulfillment_end_date,
    'delivery_days_min', ov.delivery_days_min,
    'delivery_days_max', ov.delivery_days_max,
    'fulfillment_note', ov.fulfillment_note,
    'delivery_time', ov.delivery_time,
    'LEGAL_REVIEW_REQUIRED', true
  ) into v_fulfillment
  from public.offer_versions ov
  where ov.id = new.offer_version_id;

  insert into public.data_sharing_consents (
    offer_id,
    offer_version_id,
    company_id,
    profile_id,
    consent_version,
    purpose,
    data_categories
  ) values (
    new.offer_id,
    new.offer_version_id,
    new.company_id,
    new.profile_id,
    v_consent_version,
    'Kaupan tai sopimuksen toteuttaminen tarjoavan yrityksen kanssa',
    array['nimi tai tilitunniste', 'yhteystieto', 'toimituksen tai sopimuksen toteuttamiseen tarvittavat tiedot']
  ) on conflict do nothing;

  insert into public.deals (
    offer_acceptance_id,
    user_id,
    company_id,
    group_id,
    offer_id,
    offer_version_id,
    accepted_total_price,
    accepted_terms_version,
    accepted_fulfillment_terms,
    data_sharing_consent_version,
    status
  ) values (
    new.id,
    new.profile_id,
    new.company_id,
    v_group_id,
    new.offer_id,
    new.offer_version_id,
    new.current_price,
    new.terms_version,
    coalesce(v_fulfillment, '{}'::jsonb),
    v_consent_version,
    'accepted'
  ) on conflict (offer_acceptance_id) do update
    set accepted_total_price = excluded.accepted_total_price,
        accepted_terms_version = excluded.accepted_terms_version,
        accepted_fulfillment_terms = excluded.accepted_fulfillment_terms,
        updated_at = now();

  update public.offer_versions
  set locked_at = coalesce(locked_at, now())
  where id = new.offer_version_id;

  return new;
end
$$;

revoke all on function public.create_deal_for_acceptance() from public, anon, authenticated;

drop trigger if exists trg_create_deal_for_acceptance on public.offer_acceptances;
create trigger trg_create_deal_for_acceptance
after insert or update on public.offer_acceptances
for each row execute function public.create_deal_for_acceptance();

create or replace function public.create_commission_for_completed_deal()
returns trigger
language plpgsql
security invoker
as $$
declare
  v_terms record;
  v_amount numeric(12,2);
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    select commission_type, commission_value, commission_currency
    into v_terms
    from public.offer_versions
    where id = new.offer_version_id;

    if v_terms.commission_type <> 'manual_review_required' and coalesce(v_terms.commission_value, 0) > 0 then
      v_amount := public.calculate_commission_amount(v_terms.commission_type, v_terms.commission_value, new.accepted_total_price);

      insert into public.commissions (
        deal_id,
        offer_id,
        offer_version_id,
        company_id,
        commission_type,
        commission_value,
        currency,
        deal_value,
        amount,
        status
      ) values (
        new.id,
        new.offer_id,
        new.offer_version_id,
        new.company_id,
        v_terms.commission_type,
        v_terms.commission_value,
        coalesce(v_terms.commission_currency, 'EUR'),
        new.accepted_total_price,
        v_amount,
        'accrued'
      ) on conflict (deal_id) do nothing;
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists trg_create_commission_for_completed_deal on public.deals;
create trigger trg_create_commission_for_completed_deal
after update on public.deals
for each row execute function public.create_commission_for_completed_deal();

create or replace view public.offer_cards as
select
  o.*,
  ov.id as offer_version_id,
  ov.version,
  ov.title,
  ov.description,
  ov.brand,
  ov.model,
  ov.model_code,
  ov.product_image_url,
  ov.availability,
  ov.requirement_match,
  ov.category_match,
  ov.comparison_fields,
  ov.price,
  ov.normal_price,
  ov.estimated_saving,
  ov.delivery_price,
  ov.delivery_method,
  ov.delivery_time,
  ov.total_price,
  ov.minimum_participants,
  ov.contract_length,
  ov.vat_status,
  ov.terms_type,
  ov.terms_text,
  ov.terms_url,
  ov.terms_document_reference,
  ov.terms_version,
  ov.accepted_by_company_at,
  ov.terms,
  ov.starts_at,
  ov.valid_until,
  ov.locked_at,
  ov.published_at,
  ov.fulfillment_start_type,
  ov.fulfillment_start_date,
  ov.fulfillment_end_date,
  ov.delivery_days_min,
  ov.delivery_days_max,
  ov.fulfillment_note,
  ov.max_acceptances,
  ov.stock_limit,
  ov.unlimited_until_close,
  ov.commission_type,
  ov.commission_value,
  ov.commission_currency,
  ov.commission_terms_version,
  ov.commission_terms_accepted_by_company_at,
  c.name as company_name,
  null::text as company_business_id,
  null::text as company_contact,
  c.home_country as company_country,
  c.verification_status as company_verification_status,
  count(distinct oa.id)::integer as accepted_count,
  0::integer as deal_count,
  coalesce(jsonb_agg(jsonb_build_object('min_acceptances', opt.min_acceptances, 'price', opt.price, 'label', opt.label)) filter (where opt.id is not null), '[]'::jsonb) as tiers
from public.offers o
join public.companies c on c.id = o.company_id
join public.offer_versions ov on ov.offer_id = o.id and ov.version = o.current_version
left join public.offer_price_tiers opt on opt.offer_version_id = ov.id
left join public.offer_acceptances oa on oa.offer_version_id = ov.id
group by o.id, ov.id, c.name, c.home_country, c.verification_status;
