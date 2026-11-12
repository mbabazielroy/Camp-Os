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
