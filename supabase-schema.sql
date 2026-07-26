-- Run this once in your Supabase project → SQL Editor.
-- Creates every table the site's front-end and admin panel expect.

create table if not exists site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb
);

create table if not exists services (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  sort_order int default 0
);

create table if not exists projects (
  id bigint generated always as identity primary key,
  title text not null,
  location text,
  land_area text,
  built_area text,
  structure_system text,
  concept text,
  challenges text,
  solutions text,
  cover_image text,
  gallery jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists blog_posts (
  id bigint generated always as identity primary key,
  title text not null,
  body text,
  cover_image text,
  created_at timestamptz default now()
);

create table if not exists blog_comments (
  id bigint generated always as identity primary key,
  post_id bigint references blog_posts(id) on delete cascade,
  username text not null,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists page_views (
  id bigint generated always as identity primary key,
  path text,
  created_at timestamptz default now()
);

-- Enable Row Level Security + open read access, restricted writes.
-- NOTE: because the admin panel uses the public "anon" key (there is no
-- real server-side admin session), the policies below allow the anon key
-- to write too. That matches the brief but means anyone with the anon key
-- (visible in script.js) can write to these tables directly via the API,
-- not just through your admin panel. If that risk matters to you, move to
-- Supabase Auth so writes require a signed-in admin session instead.

alter table site_content enable row level security;
alter table services enable row level security;
alter table projects enable row level security;
alter table blog_posts enable row level security;
alter table blog_comments enable row level security;
alter table page_views enable row level security;

create policy "public read" on site_content for select using (true);
create policy "public write" on site_content for all using (true) with check (true);

create policy "public read" on services for select using (true);
create policy "public write" on services for all using (true) with check (true);

create policy "public read" on projects for select using (true);
create policy "public write" on projects for all using (true) with check (true);

create policy "public read" on blog_posts for select using (true);
create policy "public write" on blog_posts for all using (true) with check (true);

create policy "public read" on blog_comments for select using (true);
create policy "public insert" on blog_comments for insert with check (true);

create policy "public insert" on page_views for insert with check (true);
create policy "public read" on page_views for select using (true);
