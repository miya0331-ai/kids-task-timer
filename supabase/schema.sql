-- Kids Task Timer schema
-- Run this in Supabase SQL Editor for a new project.

create extension if not exists "pgcrypto";

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  schedule_type text not null default 'daily' check (schedule_type in ('daily','weekday','date')),
  schedule_config jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists routines_family_idx on routines(family_id);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines(id) on delete cascade,
  title text not null,
  emoji text,
  image_url text,
  duration_sec integer not null default 300,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists tasks_routine_idx on tasks(routine_id);

create table if not exists completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  date date not null default (now() at time zone 'Asia/Tokyo')::date,
  completed_at timestamptz not null default now(),
  unique (task_id, date)
);

create index if not exists completions_task_date_idx on completions(task_id, date);

-- Storage bucket for task photos
insert into storage.buckets (id, name, public)
values ('task-images', 'task-images', true)
on conflict (id) do nothing;

-- Public read, public write (dev). Tighten later if needed.
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'task-images-public-read') then
    create policy "task-images-public-read"
      on storage.objects for select
      using (bucket_id = 'task-images');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'task-images-public-write') then
    create policy "task-images-public-write"
      on storage.objects for insert
      with check (bucket_id = 'task-images');
  end if;
end $$;
