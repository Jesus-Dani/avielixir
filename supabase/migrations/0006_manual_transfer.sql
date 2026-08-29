-- Manual bank-transfer checkout: customers upload a payment receipt,
-- admin verifies it against the account before marking the order paid.
alter table "order" add column receipt_url text;

-- Private bucket: receipts are proof-of-payment documents, not public assets.
insert into storage.buckets (id, name, public)
values ('order-receipts', 'order-receipts', false)
on conflict (id) do nothing;

-- Customers upload/read only under their own uid-prefixed folder.
-- Admin reads via the service-role client (bypasses RLS), so no admin policy needed here.
create policy order_receipts_owner_insert on storage.objects
  for insert with check (bucket_id = 'order-receipts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy order_receipts_owner_read on storage.objects
  for select using (bucket_id = 'order-receipts' and (storage.foldername(name))[1] = auth.uid()::text);
