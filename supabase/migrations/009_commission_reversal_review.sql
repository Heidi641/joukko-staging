-- Staging: do not invoice refunded/disputed/cancelled deals blindly.
alter table public.commissions
  add column if not exists refund_review_required boolean not null default false,
  add column if not exists refund_review_reason text;
create or replace function public.flag_reversed_deal_commission()
returns trigger language plpgsql security invoker set search_path=public as $$
begin
  if new.status in ('cancelled','refunded','disputed')
     and new.status is distinct from old.status then
    update public.commissions
    set status=case when status in ('accrued','pending') then 'void'
                    else status end,
        refund_review_required=case when status in ('invoiced','paid','credited') then true
                                   else false end,
        refund_review_reason=case when status in ('invoiced','paid','credited')
                        then 'Manual credit/refund assessment needed after ' || new.status::text
                        else null end
    where deal_id=new.id;
  end if;
  return new;
end $$;
drop trigger if exists trg_flag_reversed_deal_commission on public.deals;
create trigger trg_flag_reversed_deal_commission
after update of status on public.deals for each row execute function public.flag_reversed_deal_commission();
