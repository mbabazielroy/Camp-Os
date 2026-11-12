-- Minimal stand-in for the parts of Supabase that supabase/schema.sql relies on,
-- so the schema and its row level security can be tested on plain Postgres.
-- Not used in production: a real Supabase project already provides all of this.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role;

create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

-- Supabase's auth.uid(): the signed-in user's id from the request JWT.
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

-- Supabase grants table privileges to these roles by default; RLS does the rest.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
