-- RLS per PRD/TRD v1.2 section 4.
-- security definer avoids recursive RLS lookups when policies check is_admin.
create function is_admin() returns boolean
language sql security definer stable
set search_path = public
as $$
  select coalesce((select c.is_admin from customer c where c.id = auth.uid()), false);
$$;

alter table category enable row level security;
alter table collection enable row level security;
alter table product enable row level security;
alter table product_collection enable row level security;
alter table product_variant enable row level security;
alter table product_image enable row level security;
alter table customer enable row level security;
alter table wishlist enable row level security;
alter table review enable row level security;
alter table "order" enable row level security;
alter table order_item enable row level security;

-- Catalog tables: public read, admin-only write.
create policy category_public_read on category for select using (true);
create policy category_admin_write on category for all using (is_admin()) with check (is_admin());

create policy collection_public_read on collection for select using (true);
create policy collection_admin_write on collection for all using (is_admin()) with check (is_admin());

create policy product_public_read on product for select using (true);
create policy product_admin_write on product for all using (is_admin()) with check (is_admin());

create policy product_collection_public_read on product_collection for select using (true);
create policy product_collection_admin_write on product_collection for all using (is_admin()) with check (is_admin());

create policy product_variant_public_read on product_variant for select using (true);
create policy product_variant_admin_write on product_variant for all using (is_admin()) with check (is_admin());

create policy product_image_public_read on product_image for select using (true);
create policy product_image_admin_write on product_image for all using (is_admin()) with check (is_admin());

-- Customer: a signed-in user manages their own row; admin manages all.
create policy customer_self_read on customer for select using (id = auth.uid() or is_admin());
create policy customer_self_insert on customer for insert with check (id = auth.uid());
create policy customer_self_update on customer for update using (id = auth.uid() or is_admin()) with check (id = auth.uid() or is_admin());

-- Wishlist: variant-level, owner-only, admin can view all.
create policy wishlist_owner_read on wishlist for select using (customer_id = auth.uid() or is_admin());
create policy wishlist_owner_write on wishlist for insert with check (customer_id = auth.uid());
create policy wishlist_owner_delete on wishlist for delete using (customer_id = auth.uid());

-- Review: owner reads/creates own; only admin can update status (moderation);
-- approved reviews are additionally readable by everyone (product pages).
create policy review_public_read_approved on review for select using (status = 'approved' or customer_id = auth.uid() or is_admin());
create policy review_owner_insert on review for insert with check (customer_id = auth.uid());
create policy review_admin_update on review for update using (is_admin()) with check (is_admin());

-- Order / OrderItem: owner-only by customer_id. Guest orders (customer_id null)
-- are intentionally invisible here — looked up server-side via the service-role
-- client by guest_email instead. Admin sees and manages everything.
create policy order_owner_read on "order" for select using (customer_id = auth.uid() or is_admin());
create policy order_admin_write on "order" for update using (is_admin()) with check (is_admin());

create policy order_item_owner_read on order_item for select using (
  exists (select 1 from "order" o where o.id = order_item.order_id and (o.customer_id = auth.uid() or is_admin()))
);
