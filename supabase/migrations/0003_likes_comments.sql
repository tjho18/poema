-- ============================================================
-- Poema — Likes + Margin notes (comments)
--   likes:    quiet appreciation; count visible ONLY to the poet
--   comments: short "margin notes" beneath a poem, public read
-- ============================================================

-- ─── LIKES ───────────────────────────────────────────────────
-- A reader can see their OWN like (to know if they've liked a poem).
-- The poem's author can see ALL likes on their poem (to count them).
-- No one else can read like rows → counts stay private to the poet.
create table if not exists public.likes (
  user_id    uuid not null references auth.users(id)   on delete cascade,
  poem_id    uuid not null references public.poems(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, poem_id)
);

create index if not exists likes_poem_idx on public.likes(poem_id);

alter table public.likes enable row level security;

drop policy if exists "likes_read_own_or_poet" on public.likes;
create policy "likes_read_own_or_poet" on public.likes for select
  to authenticated using (
    auth.uid() = user_id
    or auth.uid() = (select author_id from public.poems where id = poem_id)
  );

drop policy if exists "likes_insert_self" on public.likes;
create policy "likes_insert_self" on public.likes for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "likes_delete_self" on public.likes;
create policy "likes_delete_self" on public.likes for delete
  to authenticated using (auth.uid() = user_id);

-- ─── COMMENTS (margin notes) ─────────────────────────────────
-- author_id references profiles(id) so PostgREST can embed the
-- author's username/display_name in a single select.
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  poem_id    uuid not null references public.poems(id)    on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null check (char_length(trim(body)) between 1 and 280),
  created_at timestamptz not null default now()
);

create index if not exists comments_poem_idx on public.comments(poem_id, created_at);

alter table public.comments enable row level security;

-- Read a comment if you can read its poem (published-and-due, or you own it).
drop policy if exists "comments_read" on public.comments;
create policy "comments_read" on public.comments for select
  to anon, authenticated using (
    exists (
      select 1 from public.poems p
      where p.id = poem_id
        and (
          (p.status = 'published' and coalesce(p.published_at, p.created_at) <= now())
          or p.author_id = auth.uid()
        )
    )
  );

-- Any signed-in user can leave a note as themselves.
drop policy if exists "comments_insert_self" on public.comments;
create policy "comments_insert_self" on public.comments for insert
  to authenticated with check (auth.uid() = author_id);

-- A note can be removed by its author OR by the poem's author (moderation).
drop policy if exists "comments_delete_own_or_poet" on public.comments;
create policy "comments_delete_own_or_poet" on public.comments for delete
  to authenticated using (
    auth.uid() = author_id
    or auth.uid() = (select author_id from public.poems where id = poem_id)
  );
