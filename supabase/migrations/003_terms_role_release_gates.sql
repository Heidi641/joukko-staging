alter table public.profiles
  add column if not exists buyer_company_name text,
  add column if not exists buyer_business_id text,
  add column if not exists terms_version text,
  add column if not exists privacy_version text,
  add column if not exists ai_notice_version text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists privacy_accepted_at timestamptz,
  add column if not exists ai_notice_accepted_at timestamptz,
  add column if not exists marketing_consent boolean not null default false;

comment on column public.profiles.buyer_company_name is 'Optional buyer-side company name. Does not activate seller/company authorization.';
comment on column public.profiles.buyer_business_id is 'Optional buyer-side business identifier. Does not activate seller/company authorization.';
comment on column public.profiles.terms_version is 'Registration terms version accepted by the user.';
comment on column public.profiles.privacy_version is 'Registration privacy notice version accepted by the user.';
comment on column public.profiles.ai_notice_version is 'Registration AI notice version accepted by the user.';
