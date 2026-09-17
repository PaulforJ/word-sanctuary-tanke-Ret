-- ============================================================
-- New Member Retention — Supabase schema
-- Run this whole file once in your Supabase project's SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- Roles: 'coordinator' can add/edit members. 'volunteer' can view
-- everything and complete tasks/journey steps, but cannot add members.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'volunteer' check (role in ('coordinator', 'volunteer')),
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  first_visit_date date not null default current_date,
  area text,
  denomination_background text,
  heard_about_us text,
  contact_preference text default 'whatsapp' check (contact_preference in ('whatsapp', 'call', 'email', 'sms')),
  prayer_request text,
  interests text,
  stage text not null default 'new' check (stage in ('new', 'contacted', 'engaged', 'at_risk', 'dropped')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.journey_steps (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  step_name text not null check (step_name in ('day0', 'day7', 'day30')),
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'done')),
  completed_at timestamptz
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  description text not null,
  assigned_to text,
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create the Day 0 / Day 7 / Day 30 journey steps whenever
-- a new member is added, so nobody has to remember to do it by hand.
create or replace function public.create_default_journey_steps()
returns trigger as $$
begin
  insert into public.journey_steps (member_id, step_name, due_date)
  values
    (new.id, 'day0', new.first_visit_date),
    (new.id, 'day7', new.first_visit_date + interval '7 days'),
    (new.id, 'day30', new.first_visit_date + interval '30 days');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_create_journey_steps on public.members;
create trigger trg_create_journey_steps
  after insert on public.members
  for each row execute function public.create_default_journey_steps();

-- Keep a profile row in sync whenever a new auth user is created.
-- New users default to 'volunteer'; promote someone to 'coordinator'
-- manually afterwards (see README).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, display_name)
  values (new.id, 'volunteer', new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.journey_steps enable row level security;
alter table public.tasks enable row level security;

-- Any logged-in volunteer/coordinator can read profiles (needed to
-- check their own role in the app).
create policy "profiles readable by authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

-- Everyone logged in can view members, journey steps and tasks.
create policy "members readable by authenticated" on public.members
  for select using (auth.role() = 'authenticated');
create policy "journey readable by authenticated" on public.journey_steps
  for select using (auth.role() = 'authenticated');
create policy "tasks readable by authenticated" on public.tasks
  for select using (auth.role() = 'authenticated');

-- Only coordinators can add or edit members.
create policy "coordinators can insert members" on public.members
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'coordinator')
  );
create policy "coordinators can update members" on public.members
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'coordinator')
  );

-- Any logged-in user can update journey steps and tasks (mark done)
-- and add new tasks — this is the day-to-day volunteer work.
create policy "authenticated can update journey" on public.journey_steps
  for update using (auth.role() = 'authenticated');
create policy "authenticated can insert tasks" on public.tasks
  for insert with check (auth.role() = 'authenticated');
create policy "authenticated can update tasks" on public.tasks
  for update using (auth.role() = 'authenticated');
