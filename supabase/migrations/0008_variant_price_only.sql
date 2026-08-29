-- Simplify pricing: only variants have a price now. No more product-level
-- base_price with variants optionally overriding it, which was the source
-- of confusion in the admin panel. Every size must have its own price.
alter table product drop column base_price;
alter table product_variant alter column price set not null;
