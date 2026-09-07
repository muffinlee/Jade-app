-- Run this in your Supabase SQL editor (Dashboard → SQL → New Query)

-- 1. Profiles table (extends Supabase auth.users)
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  role          text not null check (role in ('student','teacher','school')),
  access_level  text not null default 'free' check (access_level in ('free','full')),
  xp            integer not null default 0,
  completed_weeks integer[] not null default '{}',
  quiz_passes   integer not null default 0,
  cash          numeric not null default 100000,
  holdings      jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. Access codes (for schools giving students full access)
create table public.access_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  school_name text not null,
  active      boolean not null default true,
  uses_limit  integer,
  uses_count  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- 3. Row-level security
alter table public.profiles enable row level security;
alter table public.access_codes enable row level security;

-- Users can read/update their own profile
create policy "Own profile" on public.profiles
  for all using (auth.uid() = id);

-- Teachers/schools can read all student profiles
create policy "Teachers read students" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('teacher','school')
    )
  );

-- Access codes readable by anyone (validation done server-side)
create policy "Read codes" on public.access_codes
  for select using (true);

-- 4. Insert a sample access code for testing
insert into public.access_codes (code, school_name, uses_limit)
values ('JADE2025', 'Demo School', 100);

-- 5. Function to auto-create profile on signup (optional — we also do it client-side)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, first_name, last_name, role, access_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'User'),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'access_level', 'free')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
