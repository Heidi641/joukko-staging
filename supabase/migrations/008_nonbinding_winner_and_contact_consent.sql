-- Staging-safe no-auto-order flow. Final purchase contract belongs to the
-- identified business seller, NOT the JOUKKO platform.
-- GDPR: a company sees personal deal/consent data only after its offer wins.
create or replace function public.finalize_offer_competition(p_group_id uuid, p_winning_offer_id uuid)
returns void language plpgsql security invoker set search_path=public as $$
begin
  if not exists (select 1 from public.profiles where id=(select auth.uid()) and role='admin') then
    raise exception 'Admin role required';
  end if;
  if not exists (select 1 from public.offers
     where id=p_winning_offer_id and group_id=p_group_id and status in ('active','published')) then
    raise exception 'Winning offer must be active and belong to the group';
  end if;
  update public.groups set
      selected_offer_id=p_winning_offer_id,
      competition_status='finalized',
      competition_closed_at=now()
    where id=p_group_id and competition_status='open';
  if not found then raise exception 'Competition already closed or missing'; end if;

  update public.offer_versions ov set locked_at=coalesce(ov.locked_at,now())
    from public.offers o where ov.offer_id=o.id and o.group_id=p_group_id;
  update public.offers
    set status=case when id=p_winning_offer_id then 'fulfillment'::public.offer_status
                    else 'closed_to_new'::public.offer_status end,
        closed_at=now()
    where group_id=p_group_id;

  -- Selecting a company is NOT an order confirmation. The seller must obtain
  -- the customer's separate final contract and later provide evidence.
  update public.deals
     set status=case when offer_id=p_winning_offer_id then 'contact_shared'::public.deal_status
                     else 'cancelled'::public.deal_status end,
         updated_at=now()
   where group_id=p_group_id and status='accepted';


end $$;
revoke all on function public.finalize_offer_competition(uuid,uuid) from public,anon;
grant execute on function public.finalize_offer_competition(uuid,uuid) to authenticated;

-- Pre-winner interest is visible to the customer and trusted JOUKKO admins,
-- never to an individual advertiser or losing supplier.
drop policy if exists "company owners can read consented own offer deals" on public.deals;
create policy "company owners can read consented own offer deals" on public.deals
for select to authenticated using (
  status in ('contact_shared','order_confirmed','fulfillment_pending','fulfillment_in_progress','completed')
  and exists (
    select 1 from public.companies c
    join public.groups g on g.selected_offer_id=deals.offer_id and g.id=deals.group_id
    where c.id=deals.company_id and c.owner_id=(select auth.uid())
      and c.verification_status='verified'
      and c.commission_agreement_status='accepted'
      and c.billing_setup_status='ready'
  )
  and public.has_data_sharing_consent(
    deals.offer_version_id,deals.user_id,deals.company_id,deals.data_sharing_consent_version
  )
);

drop policy if exists "company owners can read consents for own deals" on public.data_sharing_consents;
create policy "company owners can read consents for own deals"
on public.data_sharing_consents for select to authenticated using (
  exists (
    select 1 from public.deals d
    join public.groups g on g.id=d.group_id and g.selected_offer_id=d.offer_id
    join public.companies c on c.id=d.company_id
    where d.data_sharing_consent_id=data_sharing_consents.id
      and d.company_id=data_sharing_consents.company_id
      and d.status in ('contact_shared','order_confirmed','fulfillment_pending','fulfillment_in_progress','completed')
      and c.owner_id=(select auth.uid())
      and c.verification_status='verified'
      and c.commission_agreement_status='accepted'
      and c.billing_setup_status='ready'
  )
);

-- Notifications come from the existing RLS-safe trigger rather than giving
-- ordinary admins broad direct INSERT rights to all notifications.
create or replace function public.notify_joukko_events()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_group_name text;
begin
  if tg_table_name='group_members' and tg_op='INSERT' then
    select name into v_group_name from public.groups where id=new.group_id;
    insert into public.notifications(profile_id,notification_type,title,body,action_path)
    values(new.profile_id,'group_joined','Olet mukana Joukossa',
      format('Liityit Joukkoon %s. Tämä ei ole ostositoumus.',coalesce(v_group_name,'JOUKKO')),
      '/joukot/' || new.group_id::text);
  elsif tg_table_name='offer_acceptances' and tg_op='INSERT' then
    insert into public.notifications(profile_id,notification_type,title,body,action_path)
    values(new.profile_id,'offer_interest',
      'Ehdollinen kiinnostus tallennettu',
      'Olet ilmoittanut kiinnostuksesi tähän tarjoukseen. Tämä EI ole tilaus- tai sopimusvahvistus.',
      '/minun');
  elsif tg_table_name='deals' and tg_op='UPDATE' and old.status is distinct from new.status then
    if new.status='contact_shared' then
      insert into public.notifications(profile_id,notification_type,title,body,action_path)
      values(new.user_id,'winning_offer',
        'Joukon valittu tarjous',
        'Valitun myyjän yhteydenotto voi alkaa. Tämä EI ole tilaus: vahvista mahdollinen kauppa itse suoraan myyjälle.',
        '/minun');
    elsif new.status='cancelled' and old.status='accepted' then
      insert into public.notifications(profile_id,notification_type,title,body,action_path)
      values(new.user_id,'offer_not_selected',
        'Valitsemaasi tarjousta ei valittu',
        'Tästä ehdollisesta kiinnostuksesta ei syntynyt ostovelvoitetta.',
        '/minun');
    elsif new.status='order_confirmed' then
      insert into public.notifications(profile_id,notification_type,title,body,action_path)
      values(new.user_id,'seller_contract',
        'Myyjän ilmoittama sopimus',
        'Myyjä on ilmoittanut sopimuksesta; tarkista aina myyjän varsinainen sopimusvahvistus suoraan myyjältä.',
        '/minun');
    end if;
  end if;
  return new;
end $$;
revoke all on function public.notify_joukko_events() from public,anon,authenticated;
