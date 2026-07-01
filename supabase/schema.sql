-- CampFlow Admin - database schema
-- Run this once in the Supabase SQL editor (or via the CLI) for a new project.
-- Every table is scoped to the authenticated user (the camp director) via user_id
-- and protected with row level security, so each director only ever sees their own data.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per director, created automatically on signup
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  camp_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are editable by owner" on public.profiles
  for update using (auth.uid() = id);
create policy "Profiles are insertable by owner" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- tasks: director's to-dos / reminders
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Tasks are managed by owner" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

-- ---------------------------------------------------------------------------
-- knowledge_base: camp rules, pickup times, packing lists, policies
-- ---------------------------------------------------------------------------
create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null default 'other' check (
    category in ('rules', 'pickup_times', 'packing_list', 'policy', 'other')
  ),
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.knowledge_base enable row level security;

create policy "Knowledge base is managed by owner" on public.knowledge_base
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists knowledge_base_user_id_idx on public.knowledge_base (user_id);

-- ---------------------------------------------------------------------------
-- guardians: parent / guardian contact records
-- ---------------------------------------------------------------------------
create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
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

create policy "Guardians are managed by owner" on public.guardians
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists guardians_user_id_idx on public.guardians (user_id);

-- ---------------------------------------------------------------------------
-- campers: basic camper records, optionally linked to a guardian
-- ---------------------------------------------------------------------------
create table if not exists public.campers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
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

create policy "Campers are managed by owner" on public.campers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists campers_user_id_idx on public.campers (user_id);
create index if not exists campers_guardian_id_idx on public.campers (guardian_id);

-- ---------------------------------------------------------------------------
-- staff: basic staff records
-- ---------------------------------------------------------------------------
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
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

create policy "Staff are managed by owner" on public.staff
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists staff_user_id_idx on public.staff (user_id);

-- ---------------------------------------------------------------------------
-- email_drafts: pasted-in emails, AI categorization, and AI-drafted replies.
-- The AI never sends anything - status only ever moves from pending to
-- approved/dismissed by a human in the UI.
-- ---------------------------------------------------------------------------
create table if not exists public.email_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  original_email text not null,
  sender_name text,
  sender_email text,
  category text check (
    category in ('pickup', 'medical', 'behavior', 'billing', 'logistics', 'general', 'other')
  ),
  urgency text check (urgency in ('low', 'medium', 'high', 'urgent')),
  ai_summary text,
  ai_draft text,
  edited_draft text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_drafts enable row level security;

create policy "Email drafts are managed by owner" on public.email_drafts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists email_drafts_user_id_idx on public.email_drafts (user_id);
create index if not exists email_drafts_status_idx on public.email_drafts (status);
