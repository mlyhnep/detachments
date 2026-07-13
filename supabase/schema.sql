-- Warhammer 40k Detachment & Disposition app schema
-- Run this once in the Supabase SQL editor (project: cozjhyhnpljclqonjiad).
-- This is a hand-reviewed script, not a CLI-driven migration -- the sibling
-- Warhammer-tracker app applies schema changes the same way. Kept here purely
-- as a diffable record.
--
-- Does NOT touch any existing Warhammer-tracker tables (armies, units,
-- faction_detachments, profiles, etc). All 5 tables below are new.

create table if not exists factions (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table if not exists dispositions (
  id bigint generated always as identity primary key,
  name text not null unique,
  -- Nullable: real 11th-edition flavour/rules text goes in via admin import
  -- or a later seed pass, not fabricated here.
  description text
);

create table if not exists disposition_tips (
  id bigint generated always as identity primary key,
  disposition_id bigint not null references dispositions(id) on delete cascade,
  tip text not null,
  ordering int not null default 0
);

create index if not exists disposition_tips_disposition_id_ordering_idx
  on disposition_tips (disposition_id, ordering);

create table if not exists detachments (
  id bigint generated always as identity primary key,
  faction_id bigint not null references factions(id) on delete restrict,
  name text not null,
  dp_cost int not null,
  tags text[] not null default '{}',
  -- disposition_ids[0] is the primary disposition (drives the scouting
  -- view's mission-lookup rows); remaining entries are informational only.
  disposition_ids bigint[] not null default '{}',
  rule_text text,
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (faction_id, name)
);

create index if not exists detachments_faction_id_idx on detachments (faction_id);
create index if not exists detachments_disposition_ids_gin_idx on detachments using gin (disposition_ids);

create table if not exists matchups (
  id bigint generated always as identity primary key,
  disposition_a_id bigint not null references dispositions(id),
  disposition_b_id bigint not null references dispositions(id),
  mission_name_a text not null,
  mission_name_b text not null,
  -- Nullable: objectives/layout/tips are filled in as that content becomes
  -- available; mission names alone are enough to seed a row.
  objectives_summary text,
  layout_variants text[],
  play_tips text,
  constraint matchups_canonical_pair check (disposition_a_id <= disposition_b_id),
  constraint matchups_layout_variants_count check (layout_variants is null or array_length(layout_variants, 1) = 3),
  unique (disposition_a_id, disposition_b_id)
);

-- Row Level Security: public read on everything, any authenticated user may
-- write. Coarse (no per-admin-email check) to match the tracker's existing
-- single-admin simplicity. Bulk seed scripts use the service-role key and
-- bypass RLS entirely.

alter table factions enable row level security;
alter table dispositions enable row level security;
alter table disposition_tips enable row level security;
alter table detachments enable row level security;
alter table matchups enable row level security;

create policy "public read" on factions for select using (true);
create policy "public read" on dispositions for select using (true);
create policy "public read" on disposition_tips for select using (true);
create policy "public read" on detachments for select using (true);
create policy "public read" on matchups for select using (true);

create policy "authenticated write" on factions for insert with check (auth.uid() is not null);
create policy "authenticated update" on factions for update using (auth.uid() is not null);
create policy "authenticated delete" on factions for delete using (auth.uid() is not null);

create policy "authenticated write" on dispositions for insert with check (auth.uid() is not null);
create policy "authenticated update" on dispositions for update using (auth.uid() is not null);
create policy "authenticated delete" on dispositions for delete using (auth.uid() is not null);

create policy "authenticated write" on disposition_tips for insert with check (auth.uid() is not null);
create policy "authenticated update" on disposition_tips for update using (auth.uid() is not null);
create policy "authenticated delete" on disposition_tips for delete using (auth.uid() is not null);

create policy "authenticated write" on detachments for insert with check (auth.uid() is not null);
create policy "authenticated update" on detachments for update using (auth.uid() is not null);
create policy "authenticated delete" on detachments for delete using (auth.uid() is not null);

create policy "authenticated write" on matchups for insert with check (auth.uid() is not null);
create policy "authenticated update" on matchups for update using (auth.uid() is not null);
create policy "authenticated delete" on matchups for delete using (auth.uid() is not null);
