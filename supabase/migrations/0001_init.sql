-- Avi Elixir schema — tables per PRD/TRD v1.2 section 4.
create extension if not exists "pgcrypto";

create table category (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table collection (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default now()
);

create table product (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references category(id) on delete restrict,
  name text not null,
  slug text not null unique,
  scent_notes text,
  usage_instructions text,
  base_price numeric(12,2) not null check (base_price >= 0),
  status text not null default 'active' check (status in ('active', 'hidden')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_collection (
  product_id uuid not null references product(id) on delete cascade,
  collection_id uuid not null references collection(id) on delete cascade,
  primary key (product_id, collection_id)
);

create table product_variant (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references product(id) on delete cascade,
  size_label text not null,
  price numeric(12,2) check (price is null or price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  created_at timestamptz not null default now()
);

create table product_image (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references product(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

-- Extends auth.users. id is shared 1:1 with the Supabase auth user.
create table customer (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  saved_address text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table wishlist (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer(id) on delete cascade,
  product_variant_id uuid not null references product_variant(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_variant_id)
);

create table review (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references product(id) on delete cascade,
  customer_id uuid not null references customer(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table "order" (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customer(id) on delete set null,
  guest_email text,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  paystack_reference text unique,
  delivery_fee numeric(12,2),
  delivery_phone_note text,
  created_at timestamptz not null default now(),
  constraint order_customer_or_guest check (customer_id is not null or guest_email is not null)
);

create table order_item (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references "order"(id) on delete cascade,
  product_variant_id uuid not null references product_variant(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0)
);

create index idx_product_category on product(category_id);
create index idx_product_variant_product on product_variant(product_id);
create index idx_product_image_product on product_image(product_id);
create index idx_review_product on review(product_id);
create index idx_order_customer on "order"(customer_id);
create index idx_order_item_order on order_item(order_id);
create index idx_wishlist_customer on wishlist(customer_id);
