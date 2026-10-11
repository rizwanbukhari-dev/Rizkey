-- =====================================================================
-- RIZKEY SUPABASE DATABASE SCHEMA
-- =====================================================================
-- Run this script in the Supabase SQL Editor to enable optional cloud sync.

-- 1. Create user profiles table
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  settings jsonb default '{}'::jsonb,
  results jsonb default '[]'::jsonb,
  lessons jsonb default '{}'::jsonb,
  achievements text[] default '{}',
  streak jsonb default '{"currentStreak": 0, "longestStreak": 0, "lastPracticeDate": ""}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.user_profiles enable row level security;

-- 3. Policy: Users can select only their own records
create policy "Users can view own profile"
  on public.user_profiles
  for select
  using (auth.uid() = user_id);

-- 4. Policy: Users can insert their own record
create policy "Users can insert own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = user_id);

-- 5. Policy: Users can update only their own record
create policy "Users can update own profile"
  on public.user_profiles
  for update
  using (auth.uid() = user_id);

-- 6. Trigger to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger on_user_profiles_updated
  before update on public.user_profiles
  for each row execute function public.handle_updated_at();

-- 7. Trigger to automatically create a profile entry when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
