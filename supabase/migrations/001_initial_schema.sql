create extension if not exists "pgcrypto";

create type public.user_role as enum ('consumer', 'company', 'admin');
create type public.group_status as enum ('draft', 'pending', 'active', 'hidden', 'paused');
create type public.member_status as enum ('active', 'left');
create type public.offer_status as enum ('draft', 'pending', 'active', 'rejected', 'expired', 'cancelled');
create type public.offer_response_status as enum ('pending', 'accepted', 'rejected');
create type public.contract_status as enum ('can_switch_now', 'fixed_term', 'open_ended', 'unknown');
create type public.company_verification_status as enum ('unverified', 'pending_verification', 'verified', 'suspended');
create type public.match_status as enum ('conditional_match', 'threshold_reached', 'confirmed', 'completed', 'expired', 'cancelled', 'failed_threshold');
create type public.commission_model as enum ('per_completed_customer', 'percentage_of_trade', 'fixed_campaign_fee', 'manual_review_required');
create type public.seller_terms_type as enum ('text', 'url', 'document');
create type public.offer_acceptance_status as enum ('accepted', 'auto_improved', 'new_acceptance_required', 'confirmed', 'completed', 'expired', 'cancelled');
create type public.ai_job_status as enum ('queued', 'processing', 'completed', 'failed', 'cancelled', 'skipped_cost_limit', 'skipped_rate_limit');
create type public.ai_risk_level as enum ('low_risk', 'needs_review', 'high_risk');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'consumer',
  display_name text,
  postal_code text,
  country_code text not null default 'FI',
  currency_code text not null default 'EUR',
  locale text not null default 'fi-FI',
  timezone text not null default 'Europe/Helsinki',
  created_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  business_id text not null,
  email text not null,
  contact_email text,
  home_country text not null default 'FI',
  customer_service_contact text,
  verification_status public.company_verification_status not null default 'unverified',
  country_code text not null default 'FI',
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  icon text not null default '•',
  country_code text not null default 'FI',
  active boolean not null default true,
  regulated boolean not null default false,
  blocked boolean not null default false,
  commission_model public.commission_model not null default 'manual_review_required',
  commission_value numeric(12,2),
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid references public.profiles(id) on delete set null,
  category_id uuid not null references public.categories(id),
  name text not null,
  slug text not null unique,
  description text not null,
  terms text[] not null default '{}',
  area text,
  target_count integer,
  status public.group_status not null default 'pending',
  featured boolean not null default false,
  country_code text not null default 'FI',
  currency_code text not null default 'EUR',
  locale text not null default 'fi-FI',
  timezone text not null default 'Europe/Helsinki',
  created_at timestamptz not null default now()
);

create table public.group_followers (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(group_id, profile_id)
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.member_status not null default 'active',
  postal_code text,
  contract_status public.contract_status,
  contract_ends_at date,
  accepted_terms_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(group_id, profile_id)
);

create table public.conditional_commitments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  offer_id uuid,
  offer_version integer,
  max_total_price numeric(12,2),
  max_monthly_price numeric(12,2),
  max_contract_months integer,
  delivery_required boolean not null default false,
  minimum_saving numeric(12,2),
  contract_must_be_ended boolean not null default false,
  accepted_terms_snapshot jsonb not null,
  status public.match_status not null default 'conditional_match',
  accepted_at timestamptz not null default now()
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  status public.offer_status not null default 'pending',
  current_version integer not null default 1,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles(id) on delete set null,
  cancellation_reason text,
  created_at timestamptz not null default now()
);

create table public.offer_versions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  version integer not null,
  product_or_service text not null,
  title text not null,
  description text not null,
  price numeric(12,2) not null,
  mandatory_fees numeric(12,2) not null default 0,
  normal_price numeric(12,2),
  estimated_saving numeric(12,2),
  delivery_price numeric(12,2),
  delivery_method text,
  delivery_time text,
  total_price numeric(12,2) generated always as (price + mandatory_fees + coalesce(delivery_price, 0)) stored,
  minimum_participants integer not null default 1,
  contract_length text,
  vat_status text not null default 'LEGAL_REVIEW_REQUIRED',
  cancellation_terms text,
  return_terms text,
  warranty_terms text,
  category_specific_fields jsonb not null default '{}'::jsonb,
  terms_type public.seller_terms_type not null default 'text',
  terms_text text,
  terms_url text,
  terms_document_reference text,
  terms_version text not null,
  accepted_by_company_id uuid references public.profiles(id) on delete set null,
  accepted_by_company_at timestamptz,
  terms text not null,
  starts_at timestamptz,
  valid_until date,
  company_confirmation_snapshot jsonb not null,
  published_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  unique(offer_id, version)
);

create table public.offer_price_tiers (
  id uuid primary key default gen_random_uuid(),
  offer_version_id uuid not null references public.offer_versions(id) on delete cascade,
  min_acceptances integer not null,
  price numeric(12,2) not null,
  label text not null,
  threshold_reached_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.offer_responses (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  offer_version_id uuid not null references public.offer_versions(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.offer_response_status not null default 'pending',
  accepted_snapshot jsonb,
  created_at timestamptz not null default now(),
  unique(offer_version_id, profile_id)
);

create table public.offer_acceptances (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  offer_version_id uuid not null references public.offer_versions(id) on delete restrict,
  company_id uuid not null references public.companies(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  accepted_at timestamptz not null default now(),
  accepted_price numeric(12,2) not null,
  current_price numeric(12,2) not null,
  maximum_accepted_price numeric(12,2),
  terms_version text not null,
  acceptance_snapshot jsonb not null,
  allow_improved_offer_auto_apply boolean not null default true,
  status public.offer_acceptance_status not null default 'accepted',
  unique(offer_version_id, profile_id)
);

create table public.trade_outcomes (
  id uuid primary key default gen_random_uuid(),
  offer_response_id uuid references public.offer_responses(id) on delete set null,
  offer_acceptance_id uuid references public.offer_acceptances(id) on delete set null,
  offer_id uuid references public.offers(id) on delete set null,
  consumer_id uuid references public.profiles(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  final_price numeric(12,2),
  trade_value numeric(12,2),
  platform_commission numeric(12,2),
  commission_amount numeric(12,2),
  commission_status text not null default 'not_invoiced',
  seller_confirmation boolean not null default false,
  consumer_confirmation boolean,
  status public.match_status not null default 'confirmed',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  version text not null,
  title text not null,
  effective_date date,
  updated_at timestamptz not null default now(),
  content jsonb not null,
  unique(slug, version)
);

create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid not null references public.legal_documents(id) on delete restrict,
  accepted_at timestamptz not null default now(),
  acceptance_context text not null,
  unique(profile_id, document_id, acceptance_context)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.blocked_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  reason text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.ai_settings (
  id boolean primary key default true,
  enabled boolean not null default false,
  provider text not null default 'mock',
  model text not null default 'mock-v1',
  max_requests_per_day integer not null default 100,
  max_requests_per_user_hour integer not null default 10,
  max_cost_per_day numeric(12,4) not null default 0,
  max_cost_per_month numeric(12,4) not null default 0,
  duplicate_detection boolean not null default true,
  offer_analysis boolean not null default true,
  terms_analysis boolean not null default true,
  categorization boolean not null default true,
  commercial_opportunity_detection boolean not null default true,
  moderation boolean not null default true,
  summaries boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint singleton_ai_settings check (id)
);

create table public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  entity_type text not null,
  entity_id uuid,
  provider text not null default 'mock',
  model text not null default 'mock-v1',
  prompt_version text not null,
  input_hash text not null,
  status public.ai_job_status not null default 'queued',
  retry_count integer not null default 0,
  max_retries integer not null default 3,
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  error text
);

create table public.ai_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.ai_jobs(id) on delete cascade,
  action_type text not null,
  risk_level public.ai_risk_level not null default 'low_risk',
  confidence numeric(4,3),
  result jsonb not null,
  user_visible_effect text,
  created_at timestamptz not null default now()
);

create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  provider text not null,
  model text not null,
  input_hash text not null,
  result_status text not null,
  processing_time_ms integer,
  token_usage integer,
  estimated_cost numeric(12,6),
  error text,
  created_at timestamptz not null default now()
);

create table public.ai_flags (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  risk_level public.ai_risk_level not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create view public.category_participation_counts as
select
  c.*,
  count(gm.id)::integer as participation_count
from public.categories c
left join public.groups g on g.category_id = c.id and g.status = 'active'
left join public.group_members gm on gm.group_id = g.id and gm.status = 'active'
group by c.id;

create view public.group_cards as
select
  g.*,
  c.name as category_name,
  c.slug as category_slug,
  c.icon as category_icon,
  count(distinct gf.id)::integer as follower_count,
  count(distinct gm.id)::integer as member_count,
  count(distinct cc.id)::integer as committed_count,
  count(distinct case when gm.contract_status = 'can_switch_now' or gm.contract_status is null then gm.id end)::integer as ready_now_count,
  count(distinct o.id)::integer as offer_count,
  null::text as next_tier_label
from public.groups g
join public.categories c on c.id = g.category_id
left join public.group_followers gf on gf.group_id = g.id
left join public.group_members gm on gm.group_id = g.id and gm.status = 'active'
left join public.conditional_commitments cc on cc.group_id = g.id and cc.status in ('conditional_match', 'threshold_reached', 'confirmed')
left join public.offers o on o.group_id = g.id and o.status = 'active'
group by g.id, c.name, c.slug, c.icon;

create view public.offer_cards as
select
  o.*,
  ov.version,
  ov.title,
  ov.description,
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
  c.name as company_name,
  c.business_id as company_business_id,
  coalesce(c.customer_service_contact, c.contact_email, c.email) as company_contact,
  c.home_country as company_country,
  c.verification_status as company_verification_status,
  coalesce(jsonb_agg(jsonb_build_object('min_acceptances', opt.min_acceptances, 'price', opt.price, 'label', opt.label)) filter (where opt.id is not null), '[]'::jsonb) as tiers
from public.offers o
join public.companies c on c.id = o.company_id
join public.offer_versions ov on ov.offer_id = o.id and ov.version = o.current_version
left join public.offer_price_tiers opt on opt.offer_version_id = ov.id
group by o.id, ov.id, c.name, c.business_id, c.customer_service_contact, c.contact_email, c.email, c.home_country, c.verification_status;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.categories enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_followers enable row level security;
alter table public.conditional_commitments enable row level security;
alter table public.offers enable row level security;
alter table public.offer_versions enable row level security;
alter table public.offer_price_tiers enable row level security;
alter table public.offer_responses enable row level security;
alter table public.offer_acceptances enable row level security;
alter table public.trade_outcomes enable row level security;
alter table public.notifications enable row level security;
alter table public.legal_documents enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.audit_events enable row level security;
alter table public.reports enable row level security;
alter table public.blocked_terms enable row level security;
alter table public.ai_settings enable row level security;
alter table public.ai_jobs enable row level security;
alter table public.ai_results enable row level security;
alter table public.ai_usage enable row level security;
alter table public.ai_flags enable row level security;

create policy "public can read active categories" on public.categories for select using (active = true);
create policy "public can read active groups" on public.groups for select using (status = 'active');
create policy "public can read active offers" on public.offers for select using (status = 'active');
create policy "public can read active offer versions" on public.offer_versions for select using (exists (select 1 from public.offers o where o.id = offer_id and o.status = 'active'));
create policy "public can read offer tiers for active offers" on public.offer_price_tiers for select using (exists (select 1 from public.offer_versions ov join public.offers o on o.id = ov.offer_id where ov.id = offer_version_id and o.status = 'active'));
create policy "public can read legal documents" on public.legal_documents for select using (true);

create policy "users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "users can read own memberships" on public.group_members for select using (auth.uid() = profile_id);
create policy "users can join groups" on public.group_members for insert with check (auth.uid() = profile_id);
create policy "users can follow groups" on public.group_followers for insert with check (auth.uid() = profile_id);
create policy "users can read own follows" on public.group_followers for select using (auth.uid() = profile_id);
create policy "users can create own conditional commitments" on public.conditional_commitments for insert with check (auth.uid() = profile_id);
create policy "users can read own conditional commitments" on public.conditional_commitments for select using (auth.uid() = profile_id);
create policy "users can read own responses" on public.offer_responses for select using (auth.uid() = profile_id);
create policy "users can respond to offers" on public.offer_responses for insert with check (auth.uid() = profile_id);
create policy "users can update own responses" on public.offer_responses for update using (auth.uid() = profile_id);
create policy "users can accept offers" on public.offer_acceptances for insert with check (auth.uid() = profile_id);
create policy "users can read own offer acceptances" on public.offer_acceptances for select using (auth.uid() = profile_id);
create policy "users can create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "users can record own legal acceptances" on public.legal_acceptances for insert with check (auth.uid() = profile_id);
create policy "users can read own legal acceptances" on public.legal_acceptances for select using (auth.uid() = profile_id);

create policy "company owners can read own companies" on public.companies for select using (auth.uid() = owner_id);
create policy "company owners can update own companies" on public.companies for update using (auth.uid() = owner_id);
create policy "company owners can create company" on public.companies for insert with check (auth.uid() = owner_id);
create policy "company owners can create offers" on public.offers for insert with check (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid()));
create policy "company owners can update own offers" on public.offers for update using (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid()));
create policy "company owners can create offer versions" on public.offer_versions for insert with check (exists (select 1 from public.offers o join public.companies c on c.id = o.company_id where o.id = offer_id and c.owner_id = auth.uid()));
create policy "company owners can create offer tiers" on public.offer_price_tiers for insert with check (exists (select 1 from public.offer_versions ov join public.offers o on o.id = ov.offer_id join public.companies c on c.id = o.company_id where ov.id = offer_version_id and c.owner_id = auth.uid()));

create policy "admins can manage profiles" on public.profiles for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage companies" on public.companies for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage categories" on public.categories for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage groups" on public.groups for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage offers" on public.offers for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage offer versions" on public.offer_versions for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage offer tiers" on public.offer_price_tiers for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage legal documents" on public.legal_documents for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can read legal acceptances" on public.legal_acceptances for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage trade outcomes" on public.trade_outcomes for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can read audit" on public.audit_events for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage reports" on public.reports for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage blocked terms" on public.blocked_terms for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage ai settings" on public.ai_settings for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage ai jobs" on public.ai_jobs for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can read ai results" on public.ai_results for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can read ai usage" on public.ai_usage for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins can manage ai flags" on public.ai_flags for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
