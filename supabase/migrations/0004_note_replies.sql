-- ============================================================
-- Poema — Replies to margin notes (quiet poet ⇄ reader threads)
--   A note can be answered, but ONLY by the poem's author or the
--   note's original author — so each thread stays a 1:1 exchange.
-- ============================================================

-- Self-referential parent. Top-level note: parent_id IS NULL.
-- Reply: parent_id points at the note being answered.
alter table public.comments
  add column if not exists parent_id uuid
    references public.comments(id) on delete cascade;

create index if not exists comments_parent_idx
  on public.comments(parent_id) where parent_id is not null;

-- Replace the insert policy: anyone signed in may leave a top-level note,
-- but a reply is allowed only from the poem's author or the parent note's author.
drop policy if exists "comments_insert_self" on public.comments;
create policy "comments_insert_self" on public.comments for insert
  to authenticated with check (
    auth.uid() = author_id
    and (
      parent_id is null  -- top-level note: any signed-in reader
      or exists (        -- reply: poet OR the original note's author only
        select 1 from public.comments parent
        where parent.id = parent_id
          and (
            parent.author_id = auth.uid()
            or auth.uid() = (select author_id from public.poems where id = parent.poem_id)
          )
      )
    )
  );
