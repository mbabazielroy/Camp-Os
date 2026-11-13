-- Row level security tests for supabase/schema.sql.
-- Two camps (A and B) plus a staff member of camp A. Each block runs as one
-- signed-in user (role "authenticated" + their user id in the JWT claim) and
-- raises an exception if a camp can see or change another camp's data, or if
-- staff can do something only directors may do.

-- ---------------------------------------------------------------- fixtures
-- Director A and director B sign up (the trigger creates a camp for each).
insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'dir-a@example.com', '{"camp_name":"Camp A","full_name":"Dir A"}'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'dir-b@example.com', '{"camp_name":"Camp B","full_name":"Dir B"}');

-- Director A invites a staff member, who then signs up and joins camp A.
insert into public.camp_invites (camp_id, email, role)
select camp_id, 'staff-a@example.com', 'staff' from public.profiles
where id = 'aaaaaaaa-0000-0000-0000-000000000001';
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000002', 'staff-a@example.com');

-- One camper in camp B that camp A must never see.
insert into public.campers (camp_id, first_name, last_name)
select camp_id, 'Bea', 'Private' from public.profiles
where id = 'bbbbbbbb-0000-0000-0000-000000000001';

create table public._ids as
select
  (select camp_id from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001') as camp_a,
  (select camp_id from public.profiles where id = 'bbbbbbbb-0000-0000-0000-000000000001') as camp_b;
grant select on public._ids to authenticated, anon;

-- Signup trigger sanity checks.
do $$
begin
  if (select count(*) from public.camps) <> 2 then
    raise exception 'expected 2 camps after two director signups';
  end if;
  if (select role from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000002') <> 'staff'
     or (select camp_id from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000002')
        <> (select camp_a from public._ids) then
    raise exception 'invited staff member did not join camp A as staff';
  end if;
end $$;

-- ------------------------------------------------- director A: isolation
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$
declare n int;
begin
  if (select count(*) from public.camps) <> 1 then
    raise exception 'director A can see a camp other than their own';
  end if;
  if exists (select 1 from public.campers where first_name = 'Bea') then
    raise exception 'director A can read camp B campers';
  end if;
  if (select count(*) from public.profiles) <> 2 then
    raise exception 'director A should see exactly the 2 profiles in camp A';
  end if;

  -- Writing into their own camp works.
  insert into public.campers (camp_id, first_name, last_name)
  values ((select camp_a from public._ids), 'Al', 'Ok');

  -- Writing into camp B is rejected.
  begin
    insert into public.campers (camp_id, first_name, last_name)
    values ((select camp_b from public._ids), 'Evil', 'Insert');
    raise exception 'director A inserted a camper into camp B';
  exception when insufficient_privilege then null;
  end;

  -- Updating or deleting camp B rows touches nothing.
  update public.campers set notes = 'hacked' where first_name = 'Bea';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'director A updated a camp B camper'; end if;

  update public.camps set name = 'hacked' where id = (select camp_b from public._ids);
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'director A renamed camp B'; end if;

  -- Moving a row from camp A into camp B is rejected.
  begin
    update public.campers set camp_id = (select camp_b from public._ids) where first_name = 'Al';
    raise exception 'director A moved a camper into camp B';
  exception when insufficient_privilege then null;
  end;
end $$;
commit;

-- ------------------------------------- staff A: no self-promotion or hopping
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000002';
do $$
declare n int;
begin
  -- Staff can still edit their own display name.
  update public.profiles set full_name = 'Staff A'
  where id = 'aaaaaaaa-0000-0000-0000-000000000002';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'staff could not update their own full_name'; end if;

  -- Staff cannot promote themselves to director.
  begin
    update public.profiles set role = 'director'
    where id = 'aaaaaaaa-0000-0000-0000-000000000002';
  exception when insufficient_privilege then null;
  end;

  -- Staff cannot move themselves into another camp.
  begin
    update public.profiles set camp_id = (select camp_b from public._ids)
    where id = 'aaaaaaaa-0000-0000-0000-000000000002';
  exception when insufficient_privilege then null;
  end;

  -- Staff cannot invite people (directors only), least of all as director.
  begin
    insert into public.camp_invites (camp_id, email, role)
    values ((select camp_a from public._ids), 'friend@example.com', 'director');
    raise exception 'staff created an invite';
  exception when insufficient_privilege then null;
  end;

  -- Staff cannot rename the camp.
  update public.camps set name = 'renamed by staff';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'staff renamed the camp'; end if;
end $$;
commit;

-- Checked as the superuser, after the attempts above.
do $$
begin
  if (select role from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000002') <> 'staff' then
    raise exception 'staff promoted themselves to director';
  end if;
  if (select camp_id from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000002')
     <> (select camp_a from public._ids) then
    raise exception 'staff moved themselves into another camp';
  end if;
end $$;

-- ------------------------------------------------------------ billing (M1)
-- Signup starts a 30-day trial.
do $$
begin
  if (select subscription_status from public.camps where id = (select camp_a from public._ids)) <> 'trialing' then
    raise exception 'new camp should start in trialing';
  end if;
  if (select trial_ends_at from public.camps where id = (select camp_a from public._ids))
     not between now() + interval '29 days 23 hours' and now() + interval '30 days 1 hour' then
    raise exception 'handle_new_user should set trial_ends_at to signup + 30 days';
  end if;
end $$;

-- Director A: can read billing, can't write it (only the service role can).
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$
declare n int;
begin
  if (select subscription_status from public.camps) is distinct from 'trialing' then
    raise exception 'director A cannot read their camp subscription_status';
  end if;
  perform trial_ends_at, stripe_customer_id, stripe_subscription_id from public.camps;

  -- Renaming the camp still works.
  update public.camps set name = 'Camp A renamed' where id = (select camp_a from public._ids);
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'director A could not rename their own camp'; end if;

  begin
    update public.camps set subscription_status = 'active'
    where id = (select camp_a from public._ids);
    raise exception 'director A set their own subscription_status';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.camps set trial_ends_at = now() + interval '10 years'
    where id = (select camp_a from public._ids);
    raise exception 'director A extended their own trial';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.camps set stripe_customer_id = 'cus_stolen', stripe_subscription_id = 'sub_stolen'
    where id = (select camp_a from public._ids);
    raise exception 'director A set their own Stripe ids';
  exception when insufficient_privilege then null;
  end;

  -- Nor can they mark camp B as paid, or create a camp of their own.
  begin
    update public.camps set subscription_status = 'canceled'
    where id = (select camp_b from public._ids);
    raise exception 'director A changed camp B billing';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.camps (name, owner_id, subscription_status)
    values ('Free camp', 'aaaaaaaa-0000-0000-0000-000000000001', 'active');
    raise exception 'director A inserted a camp';
  exception when insufficient_privilege then null;
  end;
end $$;
commit;

-- Staff A: can read their camp's billing status, can't change it.
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000002';
do $$
begin
  if (select subscription_status from public.camps) is distinct from 'trialing' then
    raise exception 'staff A cannot read their camp subscription_status';
  end if;
  begin
    update public.camps set subscription_status = 'active';
    raise exception 'staff A set the camp subscription_status';
  exception when insufficient_privilege then null;
  end;
end $$;
commit;

-- Director B can't see camp A's billing columns.
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000001';
do $$
begin
  if exists (select 1 from public.camps where id = (select camp_a from public._ids)) then
    raise exception 'director B can read camp A billing';
  end if;
end $$;
commit;

-- The service role (Stripe webhook) can write billing columns.
begin;
set local role service_role;
do $$
declare n int;
begin
  update public.camps
  set subscription_status = 'active', stripe_customer_id = 'cus_B', stripe_subscription_id = 'sub_B'
  where id = (select camp_b from public._ids);
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'service role could not update camp billing'; end if;
end $$;
commit;

-- Checked as the superuser, after the attempts above.
do $$
begin
  if (select subscription_status from public.camps where id = (select camp_a from public._ids)) <> 'trialing'
     or (select stripe_customer_id from public.camps where id = (select camp_a from public._ids)) is not null then
    raise exception 'camp A billing changed without the service role';
  end if;
  if (select subscription_status from public.camps where id = (select camp_b from public._ids)) <> 'active' then
    raise exception 'service role update to camp B billing did not stick';
  end if;
  if (select name from public.camps where id = (select camp_a from public._ids)) <> 'Camp A renamed' then
    raise exception 'director rename did not stick';
  end if;
end $$;

-- ----------------------------------------------- signed-out visitor (anon)
begin;
set local role anon;
do $$
begin
  if (select count(*) from public.camps) + (select count(*) from public.campers)
     + (select count(*) from public.profiles) + (select count(*) from public.guardians)
     + (select count(*) from public.email_drafts) + (select count(*) from public.gmail_accounts) <> 0 then
    raise exception 'signed-out visitor can read camp data';
  end if;
end $$;
commit;
