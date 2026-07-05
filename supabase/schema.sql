-- CampFlow Admin - database schema (v2: camp workspaces)
-- Run this once in the Supabase SQL editor (or via the CLI) for a new project.
--
-- Data model: every director/staff member belongs to exactly one camp
-- (their workspace). All records are scoped to camp_id, and row level
-- security only lets members of a camp see that camp's data.
--
-- Signup flow: a trigger creates a profile for every new auth user. If a
-- pending invite exists for their email they join that camp as staff;
-- otherwise a fresh camp is created and they become its director.

create extension if not exists "pgcrypto";

-- Keep updated_at accurate automatically on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- camps: one row per camp workspace
-- ---------------------------------------------------------------------------
create table if not exists public.camps (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Camp',
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- profiles: one row per user, links them to their camp
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  camp_id uuid references public.camps (id) on delete set null,
  role text not null default 'director' check (role in ('director', 'staff')),
  created_at timestamptz not null default now()
);

-- Helper: the camp the current user belongs to. Security definer so RLS
-- policies can call it without recursing into profiles' own policies.
create or replace function public.user_camp_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select camp_id from public.profiles where id = auth.uid();
$$;

alter table public.camps enable row level security;

create policy "Members can view their camp" on public.camps
  for select using (id = public.user_camp_id());
create policy "Directors can update their camp" on public.camps
  for update using (
    id = public.user_camp_id()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'director'
    )
  );

alter table public.profiles enable row level security;

create policy "Users can view profiles in their camp" on public.profiles
  for select using (id = auth.uid() or camp_id = public.user_camp_id());
create policy "Users can update their own profile" on public.profiles
  for update using (id = auth.uid());
create policy "Users can insert their own profile" on public.profiles
  for insert with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- camp_invites: email invites so staff can join an existing camp
-- ---------------------------------------------------------------------------
create table if not exists public.camp_invites (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references public.camps (id) on delete cascade,
  email text not null,
  role text not null default 'staff' check (role in ('director', 'staff')),
  invited_by uuid references auth.users (id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (camp_id, email)
);

alter table public.camp_invites enable row level security;

create policy "Members manage their camp invites" on public.camp_invites
  for all using (camp_id = public.user_camp_id())
  with check (camp_id = public.user_camp_id());

create index if not exists camp_invites_email_idx on public.camp_invites (lower(email));

-- Auto-provision on signup: join an invited camp, or create a new one.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  invite record;
  new_camp_id uuid;
begin
  select * into invite
  from public.camp_invites
  where lower(email) = lower(new.email) and accepted_at is null
  order by created_at asc
  limit 1;

  if invite.id is not null then
    insert into public.profiles (id, full_name, camp_id, role)
    values (new.id, new.raw_user_meta_data ->> 'full_name', invite.camp_id, invite.role)
    on conflict (id) do nothing;

    update public.camp_invites set accepted_at = now() where id = invite.id;
  else
    insert into public.camps (name, owner_id)
    values (coalesce(nullif(new.raw_user_meta_data ->> 'camp_name', ''), 'My Camp'), new.id)
    returning id into new_camp_id;

    insert into public.profiles (id, full_name, camp_id, role)
    values (new.id, new.raw_user_meta_data ->> 'full_name', new_camp_id, 'director')
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- tasks: the camp's to-dos / reminders
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references public.camps (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  title text not null,
  description text,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'done')),
  source_email_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Members manage their camp tasks" on public.tasks
  for all using (camp_id = public.user_camp_id())
  with check (camp_id = public.user_camp_id());

create index if not exists tasks_camp_id_idx on public.tasks (camp_id);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- knowledge_base: camp rules, pickup times, packing lists, policies
-- ---------------------------------------------------------------------------
create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references public.camps (id) on delete cascade,
  category text not null default 'other' check (
    category in ('rules', 'pickup_times', 'packing_list', 'policy', 'other')
  ),
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.knowledge_base enable row level security;

create policy "Members manage their camp knowledge base" on public.knowledge_base
  for all using (camp_id = public.user_camp_id())
  with check (camp_id = public.user_camp_id());

create index if not exists knowledge_base_camp_id_idx on public.knowledge_base (camp_id);

drop trigger if exists knowledge_base_set_updated_at on public.knowledge_base;
create trigger knowledge_base_set_updated_at
  before update on public.knowledge_base
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- guardians: parent / guardian contact records
-- ---------------------------------------------------------------------------
create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references public.camps (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  relationship text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.guardians enable row level security;

create policy "Members manage their camp guardians" on public.guardians
  for all using (camp_id = public.user_camp_id())
  with check (camp_id = public.user_camp_id());

create index if not exists guardians_camp_id_idx on public.guardians (camp_id);

drop trigger if exists guardians_set_updated_at on public.guardians;
create trigger guardians_set_updated_at
  before update on public.guardians
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- campers: basic camper records, optionally linked to a guardian
-- ---------------------------------------------------------------------------
create table if not exists public.campers (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references public.camps (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  cabin text,
  age int,
  guardian_id uuid references public.guardians (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campers enable row level security;

create policy "Members manage their camp campers" on public.campers
  for all using (camp_id = public.user_camp_id())
  with check (camp_id = public.user_camp_id());

create index if not exists campers_camp_id_idx on public.campers (camp_id);
create index if not exists campers_guardian_id_idx on public.campers (guardian_id);

drop trigger if exists campers_set_updated_at on public.campers;
create trigger campers_set_updated_at
  before update on public.campers
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- staff: basic staff records
-- ---------------------------------------------------------------------------
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references public.camps (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  role text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff enable row level security;

create policy "Members manage their camp staff" on public.staff
  for all using (camp_id = public.user_camp_id())
  with check (camp_id = public.user_camp_id());

create index if not exists staff_camp_id_idx on public.staff (camp_id);

drop trigger if exists staff_set_updated_at on public.staff;
create trigger staff_set_updated_at
  before update on public.staff
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- email_drafts: pasted or Gmail-synced emails, AI triage, and drafted replies.
-- The AI never sends anything - status only ever moves from pending to
-- approved/dismissed by a human in the UI. Approving a Gmail-sourced email
-- saves the reply into the Gmail *drafts* folder, never the outbox.
-- ---------------------------------------------------------------------------
create table if not exists public.email_drafts (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references public.camps (id) on delete cascade,
  original_email text not null,
  sender_name text,
  sender_email text,
  subject text,
  source text not null default 'manual' check (source in ('manual', 'gmail')),
  gmail_message_id text,
  gmail_thread_id text,
  category text check (
    category in ('pickup', 'medical', 'behavior', 'billing', 'logistics', 'general', 'other')
  ),
  urgency text check (urgency in ('low', 'medium', 'high', 'urgent')),
  ai_summary text,
  ai_draft text,
  edited_draft text,
  suggested_task_title text,
  suggested_task_due date,
  suggested_task_accepted boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (camp_id, gmail_message_id)
);

alter table public.email_drafts enable row level security;

create policy "Members manage their camp email drafts" on public.email_drafts
  for all using (camp_id = public.user_camp_id())
  with check (camp_id = public.user_camp_id());

create index if not exists email_drafts_camp_id_idx on public.email_drafts (camp_id);
create index if not exists email_drafts_status_idx on public.email_drafts (status);

drop trigger if exists email_drafts_set_updated_at on public.email_drafts;
create trigger email_drafts_set_updated_at
  before update on public.email_drafts
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- gmail_accounts: one connected Gmail inbox per camp.
-- Tokens are only ever used server-side (route handlers / server actions);
-- they are visible to camp members through the API, which is acceptable for
-- a small trusted team but should move to a service-role-only table if the
-- app ever opens to untrusted members.
-- ---------------------------------------------------------------------------
create table if not exists public.gmail_accounts (
  camp_id uuid primary key references public.camps (id) on delete cascade,
  email text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  connected_by uuid references auth.users (id) on delete set null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gmail_accounts enable row level security;

create policy "Members manage their camp gmail account" on public.gmail_accounts
  for all using (camp_id = public.user_camp_id())
  with check (camp_id = public.user_camp_id());

drop trigger if exists gmail_accounts_set_updated_at on public.gmail_accounts;
create trigger gmail_accounts_set_updated_at
  before update on public.gmail_accounts
  for each row execute procedure public.set_updated_at();
