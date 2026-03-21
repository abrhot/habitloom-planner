-- ================================================================
-- Habitloom — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ================================================================

-- Enable UUID extension (already enabled by default in Supabase)
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────────
-- PROFILES
-- Extends Supabase auth.users with display name
-- ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────────
-- CHALLENGES
-- ────────────────────────────────────────────────────────────────
create table if not exists public.challenges (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  color       text not null default '#6366f1',
  created_at  timestamptz default now() not null,
  archived_at timestamptz
);

alter table public.challenges enable row level security;

create policy "Users manage own challenges"
  on public.challenges for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.challenges(user_id);

-- ────────────────────────────────────────────────────────────────
-- CHALLENGE LOGS
-- One row per day a challenge is marked done
-- ────────────────────────────────────────────────────────────────
create table if not exists public.challenge_logs (
  id           uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  date         date not null,
  created_at   timestamptz default now() not null,
  unique(challenge_id, date)
);

alter table public.challenge_logs enable row level security;

create policy "Users manage own challenge logs"
  on public.challenge_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.challenge_logs(challenge_id);
create index on public.challenge_logs(user_id, date);

-- ────────────────────────────────────────────────────────────────
-- TODOS
-- ────────────────────────────────────────────────────────────────
create table if not exists public.todos (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  date        date not null,
  text        text not null,
  completed   boolean default false not null,
  time        text,
  priority    text check (priority in ('low', 'medium', 'high')) default 'medium',
  created_at  timestamptz default now() not null
);

alter table public.todos enable row level security;

create policy "Users manage own todos"
  on public.todos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.todos(user_id, date);

-- ────────────────────────────────────────────────────────────────
-- EVENTS
-- ────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  date        date not null,
  time        text,
  note        text,
  color       text default '#334155',
  created_at  timestamptz default now() not null
);

alter table public.events enable row level security;

create policy "Users manage own events"
  on public.events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.events(user_id, date);
