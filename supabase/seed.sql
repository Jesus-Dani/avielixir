-- Sample catalog data so the storefront isn't empty in dev.
-- Image URLs are placeholders (placehold.co) — replace via the admin panel
-- once real product photography is uploaded to Supabase Storage.

insert into category (name, slug) values
  ('Perfume', 'perfume'),
  ('Body Mist', 'body-mist'),
  ('Perfume Oil', 'perfume-oil'),
  ('Body Spray', 'body-spray'),
  ('Roll-on', 'roll-on'),
  ('Pocket Perfume', 'pocket-perfume'),
  ('Atomizer', 'atomizer');

insert into collection (name, slug, image_url) values
  ('Floral', 'floral', '/images/collections/floral.jpg'),
  ('Woody & Warm', 'woody-warm', '/images/collections/woody-warm.jpg'),
  ('Fresh & Fruity', 'fresh-fruity', '/images/collections/fresh-fruity.jpg');

with p as (
  insert into product (category_id, name, slug, scent_notes, usage_instructions, is_featured)
  select id, 'Rose Noir', 'rose-noir', 'Rose, dark berries, musk', 'Spray on pulse points after showering for longest wear.', true
  from category where slug = 'perfume'
  returning id
)
insert into product_variant (product_id, size_label, price, stock_quantity)
select id, size_label, price, stock from p, (values ('39ml', 48000, 25), ('50ml', 58000, 15)) as v(size_label, price, stock);

with p as (
  insert into product (category_id, name, slug, scent_notes, usage_instructions, is_featured)
  select id, 'Lilac Amber', 'lilac-amber', 'Lilac, amber, sandalwood', 'Apply to wrists and neck; reapply midday for lasting scent.', true
  from category where slug = 'perfume'
  returning id
)
insert into product_variant (product_id, size_label, price, stock_quantity)
select id, size_label, price, stock from p, (values ('39ml', 48000, 20), ('50ml', 58000, 10)) as v(size_label, price, stock);

with p as (
  insert into product (category_id, name, slug, scent_notes, usage_instructions, is_featured)
  select id, 'Oud Reve', 'oud-reve', 'Oud, saffron, warm spice', 'A little goes a long way, one spray per pulse point.', true
  from category where slug = 'perfume'
  returning id
)
insert into product_variant (product_id, size_label, price, stock_quantity)
select id, size_label, price, stock from p, (values ('39ml', 52000, 0), ('50ml', 62000, 8)) as v(size_label, price, stock);

with p as (
  insert into product (category_id, name, slug, scent_notes, usage_instructions, is_featured)
  select id, 'Velvet Bloom', 'velvet-bloom', 'Peony, vanilla, soft musk', 'Spray from a distance of 15cm onto skin or clothing.', true
  from category where slug = 'perfume'
  returning id
)
insert into product_variant (product_id, size_label, price, stock_quantity)
select id, size_label, price, stock from p, (values ('39ml', 46000, 30), ('50ml', 56000, 12)) as v(size_label, price, stock);

with p as (
  insert into product (category_id, name, slug, scent_notes, usage_instructions, is_featured)
  select id, 'Citrus Mist', 'citrus-mist', 'Bergamot, grapefruit, white tea', 'Shake well, mist over body from arm''s length.', false
  from category where slug = 'body-mist'
  returning id
)
insert into product_variant (product_id, size_label, price, stock_quantity)
select id, size_label, price, stock from p, (values ('100ml', 15000, 40)) as v(size_label, price, stock);

with p as (
  insert into product (category_id, name, slug, scent_notes, usage_instructions, is_featured)
  select id, 'Jasmine Roll', 'jasmine-roll', 'Jasmine, white musk', 'Roll onto wrists and neck as needed throughout the day.', false
  from category where slug = 'roll-on'
  returning id
)
insert into product_variant (product_id, size_label, price, stock_quantity)
select id, size_label, price, stock from p, (values ('10ml', 9000, 35)) as v(size_label, price, stock);

insert into product_image (product_id, url, sort_order)
select id, 'https://placehold.co/700x700/f3e6e0/1c1512.png?text=' || replace(name, ' ', '+'), 0 from product;

insert into product_collection (product_id, collection_id)
select p.id, c.id from product p, collection c
where (p.slug in ('rose-noir', 'velvet-bloom', 'jasmine-roll') and c.slug = 'floral')
   or (p.slug in ('oud-reve') and c.slug = 'woody-warm')
   or (p.slug in ('lilac-amber', 'citrus-mist') and c.slug = 'fresh-fruity');
