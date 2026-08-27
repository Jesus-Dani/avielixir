# Avi Elixir

Ecommerce site for Avi Elixir, built with Next.js (App Router), Supabase, and Paystack.
See `Avi_Elixir_Claude_Code_Build_Prompt.md`, `Avi_Elixir_PRD.md`, and `Avi_Elixir_TRD.md` for the full spec.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Supabase (Postgres, Auth, Storage) — RLS enabled on every customer-facing table
- Paystack (cards, bank transfer, USSD — NGN only)
- Resend (order confirmation emails)
- Google Analytics 4
- Zustand (client-side cart, persisted to localStorage)

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

The app builds and runs with no keys set — pages render, and anything that needs a
real backend (auth, catalog data, checkout) will simply show empty/error states until
you connect the services below.

### 1. Admin password

Set `ADMIN_PASSWORD` to whatever you want the admin panel's password to be. This is
not a Supabase account, not tied to any customer, and has no separate username; the
admin panel at `/admin` (which is a fully separate area, no shop header/footer) is
gated entirely by this one password.

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and the **publishable key** (Project Settings → API) into
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Copy the **secret key** (same page, "Secret keys") into `SUPABASE_SECRET_KEY`.
   Never expose this key to the browser — it's used server-only, for the admin panel
   (all admin reads/writes bypass RLS via this key, gated by the password above
   instead) and the Paystack webhook.
4. Run the migrations, in order, against your project. Easiest path: open the
   Supabase dashboard's **SQL Editor** and paste/run each file in `supabase/migrations/`
   in filename order (0001 → 0005), then `supabase/seed.sql` for sample catalog data.
   (Alternatively, if you have the Supabase CLI linked with your project's DB
   password: `supabase link --project-ref <ref>` then `supabase db push`.)
5. **Turn off email confirmation**: Authentication → Providers → Email → disable
   "Confirm email". This is a dashboard-only setting; the app already assumes
   instant access after a shopper signs up (shopper accounts are separate from admin
   access — they're for wishlist, order history, and reviews).

### 3. Paystack

1. Create an account at [paystack.com](https://paystack.com).
2. Copy the **public key** and **secret key** (Settings → API Keys & Webhooks) into
   `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` / `PAYSTACK_SECRET_KEY`. Start with test keys.
3. Add a webhook pointing to `https://<your-domain>/api/paystack/webhook`, listening
   for `charge.success`. This is what confirms payment, decrements stock, and marks
   orders paid — checkout will hang at "pending payment" without it.

### 4. Resend

1. Create an account at [resend.com](https://resend.com), copy an API key into
   `RESEND_API_KEY`.
2. Until you verify a custom domain, `RESEND_FROM_EMAIL` must stay on Resend's shared
   sending domain (e.g. `onboarding@resend.dev`).

### 5. Google Analytics 4

Create a GA4 property, copy the Measurement ID (starts with `G-`) into `NEXT_PUBLIC_GA_ID`.

### 6. WhatsApp

Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to the business number in international format,
digits only (e.g. `2348012345678`). This powers the floating WhatsApp button and the
Contact page — it's a plain `wa.me` link, no API integration.

### 7. Deploy

Push to GitHub, import into Vercel, and set all of the env vars above in the Vercel
project settings (including `NEXT_PUBLIC_SITE_URL` set to your Vercel URL — this is
used in Paystack's callback URL and in confirmation emails).

## Business rules baked into the code (see the build prompt for the full list)

- Checkout charges the product subtotal only — delivery fee is never collected here;
  it's arranged by phone/WhatsApp after payment (`lib/paystack.ts`, `app/api/checkout`).
- Guest checkout is fully supported (`guest_email` on `order`); accounts are optional.
- No email-confirmation gate (paired with the Supabase dashboard toggle above).
- Reviews require a paid order containing the product, checked server-side in
  `app/api/reviews/route.ts`, and always land in a `pending` moderation queue.
- Wishlist is per `product_variant_id`, not per product.
- Out-of-stock variants stay visible and wishlistable; only "add to cart" is disabled.
- No customer-facing order cancellation — only `/admin/orders/[id]`.
- Stock decrements atomically inside the `complete_order_payment` Postgres function
  (`supabase/migrations/0003_functions.sql`), called only from the Paystack webhook.
- No tax/VAT anywhere; no returns workflow (`/returns` is a static policy page).
