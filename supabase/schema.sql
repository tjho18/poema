-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Poems table
create table if not exists poems (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text not null,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- Row Level Security
alter table poems enable row level security;

-- Public can read all poems
create policy "Public read" on poems
  for select using (true);

-- Authenticated users (admin) can insert, update, delete
create policy "Auth insert" on poems
  for insert to authenticated with check (true);

create policy "Auth update" on poems
  for update to authenticated using (true) with check (true);

create policy "Auth delete" on poems
  for delete to authenticated using (true);
