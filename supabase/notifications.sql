-- ================================================================
-- Habitloom — Notifications Table
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ================================================================

create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('event', 'todo', 'challenge')),
  title       text not null,
  body        text not null,
  ref_id      uuid,             -- id of the related event/todo/challenge
  ref_date    date,             -- the date it relates to
  read        boolean default false not null,
  created_at  timestamptz default now() not null
);

alter table public.notifications enable row level security;

create policy "Users manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.notifications(user_id, read, created_at desc);
