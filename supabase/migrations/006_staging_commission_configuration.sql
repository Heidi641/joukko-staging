-- Align the older staging schema with the repository schema and configure the
-- exact category success fees shown to companies before offer submission.
alter table public.categories
  add column if not exists commission_model public.commission_model not null default 'manual_review_required',
  add column if not exists commission_value numeric(12,2);

update public.categories set commission_model = 'percentage_of_trade', commission_value = 2.50, commission_terms_version = 'eko-category-v1'
where slug = 'koti-energia';
update public.categories set commission_model = 'percentage_of_trade', commission_value = 5.00, commission_terms_version = 'eko-category-v1'
where slug = 'ostokset';
update public.categories set commission_model = 'cpa_per_completed_customer', commission_value = 8.00, commission_terms_version = 'eko-category-v1'
where slug = 'matkat';
update public.categories set commission_model = 'percentage_of_trade', commission_value = 4.00, commission_terms_version = 'eko-category-v1'
where slug = 'liikkuminen';

-- The function already performs an explicit server-side admin check and all
-- affected tables have admin RLS policies, so run with caller privileges.
alter function public.finalize_offer_competition(uuid, uuid) security invoker;

-- Keep the pre-existing equivalent read policy instead of evaluating two.
drop policy if exists "users can read own notifications" on public.notifications;

-- The existing staging table had RLS enabled but no policy.
drop policy if exists "admins can manage exception requests" on public.offer_exception_requests;
create policy "admins can manage exception requests" on public.offer_exception_requests
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

alter function public.calculate_commission_amount(public.commission_model, numeric, numeric) set search_path = public;
alter function public.create_commission_for_completed_deal() set search_path = public;

create index if not exists groups_selected_offer_id_idx on public.groups(selected_offer_id);

