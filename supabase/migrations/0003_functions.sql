-- Atomically finalizes payment: guards against double-processing and oversold
-- stock under concurrent checkouts. Called only from the Paystack webhook via
-- the service-role client (SECURITY DEFINER so it can run even if invoked
-- under a non-admin session, though in practice only the webhook calls it).
create function complete_order_payment(p_order_id uuid, p_reference text)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_status text;
  v_item record;
  v_updated integer;
begin
  select status into v_status from "order" where id = p_order_id for update;

  if v_status is null then
    raise exception 'order % not found', p_order_id;
  end if;

  -- Idempotent: webhook retries or duplicate deliveries are a no-op.
  if v_status <> 'pending_payment' then
    return;
  end if;

  for v_item in
    select product_variant_id, quantity from order_item where order_id = p_order_id
  loop
    update product_variant
    set stock_quantity = stock_quantity - v_item.quantity
    where id = v_item.product_variant_id
      and stock_quantity >= v_item.quantity;

    get diagnostics v_updated = row_count;

    if v_updated = 0 then
      raise exception 'insufficient stock for variant %', v_item.product_variant_id;
    end if;
  end loop;

  update "order"
  set status = 'paid', paystack_reference = p_reference
  where id = p_order_id;
end;
$$;
