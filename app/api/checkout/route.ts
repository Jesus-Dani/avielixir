import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction } from "@/lib/paystack";
import { effectivePrice } from "@/lib/types";

interface CheckoutLine {
  variantId: string;
  quantity: number;
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    email,
    name,
    phone,
    address,
    deliveryPhoneNote,
    lines,
  }: { email: string; name?: string; phone?: string; address?: string; deliveryPhoneNote?: string; lines: CheckoutLine[] } = body;

  if (!lines?.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "An email address is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  // Re-price and re-check stock server-side — never trust client-supplied prices.
  const variantIds = lines.map((l) => l.variantId);
  const { data: variants, error: variantError } = await admin
    .from("product_variant")
    .select("id, price, stock_quantity, product:product_id(base_price)")
    .in("id", variantIds);

  if (variantError || !variants) {
    return NextResponse.json({ error: "Could not verify cart items." }, { status: 500 });
  }

  let subtotal = 0;
  const orderItems: { product_variant_id: string; quantity: number; unit_price: number }[] = [];

  for (const line of lines) {
    const variant = variants.find((v) => v.id === line.variantId);
    if (!variant) {
      return NextResponse.json({ error: "One of the items in your cart is no longer available." }, { status: 400 });
    }
    if (variant.stock_quantity < line.quantity) {
      return NextResponse.json({ error: "One of the items in your cart is out of stock." }, { status: 400 });
    }
    const product = Array.isArray(variant.product) ? variant.product[0] : variant.product;
    const unitPrice = effectivePrice({ base_price: product?.base_price ?? 0 }, { price: variant.price });
    subtotal += unitPrice * line.quantity;
    orderItems.push({ product_variant_id: variant.id, quantity: line.quantity, unit_price: unitPrice });
  }

  if (user) {
    await admin
      .from("customer")
      .update({ name: name ?? undefined, phone: phone ?? undefined, saved_address: address ?? undefined })
      .eq("id", user.id);
  }

  const { data: order, error: orderError } = await admin
    .from("order")
    .insert({
      customer_id: user?.id ?? null,
      guest_email: user ? null : email,
      subtotal,
      delivery_phone_note: deliveryPhoneNote ?? phone ?? null,
      status: "pending_payment",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create your order." }, { status: 500 });
  }

  const { error: itemsError } = await admin
    .from("order_item")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    return NextResponse.json({ error: "Could not save your order items." }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const paystack = await initializeTransaction({
      email: user?.email ?? email,
      amountKobo: Math.round(subtotal * 100),
      reference: order.id,
      callbackUrl: `${siteUrl}/checkout/success/${order.id}`,
    });
    return NextResponse.json({ authorizationUrl: paystack.data.authorization_url, orderId: order.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment initialization failed." },
      { status: 502 }
    );
  }
}
