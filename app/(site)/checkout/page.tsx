import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/checkout");

  const { data: customer } = await supabase.from("customer").select("*").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display mb-10 text-3xl text-ink">Checkout</h1>
      <CheckoutForm
        userId={user.id}
        email={user.email ?? ""}
        initialName={customer?.name ?? ""}
        initialPhone={customer?.phone ?? ""}
        initialAddress={customer?.saved_address ?? ""}
      />
    </div>
  );
}
