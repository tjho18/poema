-- ============================================================
-- Poema — Social features migration
-- Collections, respond-to-poem, daily prompts, audio,
-- social profile links, tip jar, algorithmic read signals
-- ============================================================

-- ─── profiles: social links + tip url ───────────────────────
alter table public.profiles
  add column if not exists social_links jsonb not null default '{}'::jsonb,
  add column if not exists tip_url      text;

-- ─── poems: new columns ──────────────────────────────────────
alter table public.poems
  add column if not exists responding_to_poem_id uuid
    references public.poems(id) on delete set null,
  add column if not exists form      text,        -- haiku / sonnet / free verse / etc.
  add column if not exists audio_url text,        -- optional poet voice recording
  add column if not exists prompt_id uuid;        -- FK added after prompts table created

create index if not exists poems_responding_idx
  on public.poems(responding_to_poem_id) where responding_to_poem_id is not null;

-- ─── daily prompts ────────────────────────────────────────────
create table if not exists public.prompts (
  id         uuid primary key default gen_random_uuid(),
  date       date unique not null,
  text       text        not null,
  created_at timestamptz not null default now()
);

alter table public.prompts enable row level security;

create policy "prompts_read" on public.prompts for select
  to anon, authenticated using (true);

-- Admins can manage prompts (service-role key only)
create policy "prompts_admin" on public.prompts for all
  to service_role using (true) with check (true);

-- Now add the FK from poems.prompt_id → prompts.id
do $$ begin
  alter table public.poems
    add constraint poems_prompt_fk
      foreign key (prompt_id) references public.prompts(id) on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists poems_prompt_idx
  on public.poems(prompt_id) where prompt_id is not null;

-- ─── reader collections (Pinterest-style saved boards) ────────
create table if not exists public.reader_collections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists rc_user_idx on public.reader_collections(user_id);

alter table public.reader_collections enable row level security;

create policy "rc_read" on public.reader_collections for select
  to anon, authenticated
  using (is_public = true or auth.uid() = user_id);

create policy "rc_cud_own" on public.reader_collections for all
  to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── reader collection poems (join) ───────────────────────────
create table if not exists public.reader_collection_poems (
  collection_id uuid not null references public.reader_collections(id) on delete cascade,
  poem_id       uuid not null references public.poems(id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (collection_id, poem_id)
);

create index if not exists rcp_poem_idx on public.reader_collection_poems(poem_id);

alter table public.reader_collection_poems enable row level security;

create policy "rcp_read" on public.reader_collection_poems for select
  to anon, authenticated
  using (exists (
    select 1 from public.reader_collections rc
    where rc.id = collection_id
      and (rc.is_public = true or rc.user_id = auth.uid())
  ));

create policy "rcp_cud_own" on public.reader_collection_poems for all
  to authenticated
  using (exists (
    select 1 from public.reader_collections rc
    where rc.id = collection_id and rc.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.reader_collections rc
    where rc.id = collection_id and rc.user_id = auth.uid()
  ));

-- ─── reads — private algorithm signals ────────────────────────
create table if not exists public.reads (
  id          uuid primary key default gen_random_uuid(),
  poem_id     uuid not null references public.poems(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  duration_ms int  not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists reads_poem_idx on public.reads(poem_id);
create index if not exists reads_user_idx on public.reads(user_id) where user_id is not null;

alter table public.reads enable row level security;

-- Anyone can record a read; no one can read others' reads
create policy "reads_insert_auth" on public.reads for insert
  to authenticated with check (auth.uid() = user_id);
create policy "reads_insert_anon" on public.reads for insert
  to anon with check (user_id is null);

-- ─── seed 3 weeks of prompts ──────────────────────────────────
insert into public.prompts (date, text) values
  (current_date - 13, 'something you''ve been avoiding saying'),
  (current_date - 12, 'a colour and what it holds'),
  (current_date - 11, 'the weight of a door'),
  (current_date - 10, 'what water remembers'),
  (current_date -  9, 'a letter you never sent'),
  (current_date -  8, 'the last light of an ordinary day'),
  (current_date -  7, 'hands'),
  (current_date -  6, 'the smell of rain on concrete'),
  (current_date -  5, 'a place that no longer exists'),
  (current_date -  4, 'silence between two people'),
  (current_date -  3, 'something small that saved you'),
  (current_date -  2, 'a childhood object'),
  (current_date -  1, 'the first word you forgot'),
  (current_date,      'a threshold'),
  (current_date +  1, 'what the fog conceals'),
  (current_date +  2, 'a sound you''d keep forever'),
  (current_date +  3, 'the thing left in a drawer'),
  (current_date +  4, 'the language your body speaks'),
  (current_date +  5, 'something borrowed, never returned'),
  (current_date +  6, 'a word in another language with no translation'),
  (current_date +  7, 'the moment before sleep')
on conflict (date) do nothing;

-- ─── refresh public_poems view to include new columns ─────────
-- NOTE: Run this after all column additions are committed.
create or replace view public.public_poems as
  select
    p.id,
    p.title,
    p.content,
    p.tags,
    p.author_id,
    p.slug,
    p.status,
    p.published_at,
    p.scheduled_for,
    p.collection_id,
    p.collection_position,
    p.created_at,
    p.updated_at,
    p.responding_to_poem_id,
    p.form,
    p.audio_url,
    p.prompt_id,
    pr.username     as author_username,
    pr.display_name as author_display_name,
    pr.avatar_url   as author_avatar_url
  from  public.poems    p
  join  public.profiles pr on p.author_id = pr.id
  where p.status = 'published'
    and coalesce(p.published_at, p.created_at) <= now();

-- Note: Create Supabase Storage bucket "poem-audio" (public, 10 MB limit) in the dashboard.
