alter type public.commission_model add value if not exists 'cpa_per_completed_customer';
alter type public.commission_model add value if not exists 'recurring_revenue_share';
alter type public.commission_model add value if not exists 'zero_percent_pilot';

alter table public.companies
  add column if not exists commission_agreement_status text not null default 'pending_admin_review',
  add column if not exists commission_agreement_accepted_at timestamptz,
  add column if not exists billing_setup_status text not null default 'not_ready',
  add column if not exists billing_setup_ready_at timestamptz,
  add column if not exists admin_review_status text not null default 'pending',
  add column if not exists admin_review_note text;

comment on column public.companies.commission_agreement_status is 'accepted required before publishing offers and before company can access deal customer data.';
comment on column public.companies.billing_setup_status is 'ready required before publishing offers and before company can access deal customer data. Live Stripe remains off unless separately approved.';
comment on column public.companies.admin_review_status is 'Heidi/admin review gate for verification, commission model, and billing setup.';

create or replace function public.has_company_deal_for_consent(
  p_offer_version_id uuid,
  p_profile_id uuid,
  p_company_id uuid,
  p_consent_version text
) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.deals d
    join public.companies c on c.id = d.company_id
    where d.offer_version_id = p_offer_version_id
      and d.user_id = p_profile_id
      and d.company_id = p_company_id
      and d.data_sharing_consent_version = p_consent_version
      and c.owner_id = auth.uid()
      and c.verification_status = 'verified'
      and c.commission_agreement_status = 'accepted'
      and c.billing_setup_status = 'ready'
  );
$$;

revoke all on function public.has_company_deal_for_consent(uuid, uuid, uuid, text) from public, anon, authenticated;

drop policy if exists "company owners can read consented own offer deals" on public.deals;
create policy "company owners can read consented own offer deals" on public.deals
  for select using (
    exists (
      select 1 from public.companies c
      where c.id = deals.company_id
        and c.owner_id = auth.uid()
        and c.verification_status = 'verified'
        and c.commission_agreement_status = 'accepted'
        and c.billing_setup_status = 'ready'
    )
    and public.has_data_sharing_consent(deals.offer_version_id, deals.user_id, deals.company_id, deals.data_sharing_consent_version)
  );

drop policy if exists "company owners can create offers" on public.offers;
create policy "company owners can create offers" on public.offers
  for insert with check (
    exists (
      select 1 from public.companies c
      where c.id = offers.company_id
        and c.owner_id = auth.uid()
        and c.verification_status = 'verified'
        and c.commission_agreement_status = 'accepted'
        and c.billing_setup_status = 'ready'
    )
  );

create or replace function public.calculate_commission_amount(
  p_type public.commission_model,
  p_value numeric,
  p_deal_value numeric
) returns numeric
language sql
immutable
as $$
  select case
    when p_type::text = 'percentage_of_trade' then round(coalesce(p_deal_value, 0) * coalesce(p_value, 0) / 100, 2)
    when p_type::text = 'recurring_revenue_share' then round(coalesce(p_deal_value, 0) * coalesce(p_value, 0) / 100, 2)
    when p_type::text = 'per_completed_customer' then coalesce(p_value, 0)
    when p_type::text = 'cpa_per_completed_customer' then coalesce(p_value, 0)
    when p_type::text = 'fixed_campaign_fee' then coalesce(p_value, 0)
    when p_type::text = 'zero_percent_pilot' then 0
    else 0
  end;
$$;
