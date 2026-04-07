-- ============================================================
-- JAR Intelligence — Initial Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Profiles table
-- Created when a user submits an access request (before authentication).
-- approved is set to true manually by an admin in the Supabase dashboard.
create table if not exists profiles (
  id          uuid        primary key default gen_random_uuid(),
  email       text        unique not null,
  full_name   text,
  agency      text,
  role        text,
  approved    boolean     not null default false,
  created_at  timestamptz not null default now()
);

-- Usage logs table
-- Written by server-side API routes using the service role key.
create table if not exists usage_logs (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references profiles(id) on delete set null,
  tool        text        not null,
  created_at  timestamptz not null default now()
);

-- ── Row Level Security ─────────────────────────────────────
-- The service role key (used in API routes) bypasses RLS by default.
-- These policies apply to the anon and authenticated roles only.

alter table profiles   enable row level security;
alter table usage_logs enable row level security;

-- Authenticated users can read only their own profile (matched by email in JWT)
create policy "users_read_own_profile"
  on profiles
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = email);

-- Authenticated users can read only their own usage logs
create policy "users_read_own_logs"
  on usage_logs
  for select
  to authenticated
  using (
    user_id = (
      select id from profiles
      where email = (auth.jwt() ->> 'email')
      limit 1
    )
  );

-- No anon inserts — access requests go through the service-role API route.
