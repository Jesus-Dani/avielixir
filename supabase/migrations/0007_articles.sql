-- Written blog/journal posts, manageable from the admin panel.
create table article (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  cover_image_url text,
  excerpt text,
  content text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_article_status on article(status, published_at desc);

alter table article enable row level security;

-- Public read only for published posts. All writes go through the admin
-- panel's service-role client, so no write policy is needed here.
create policy article_public_read on article for select using (status = 'published');
