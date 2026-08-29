# Avi Elixir

Ecommerce site for Avi Elixir, built with Next.js (App Router) and Supabase.
See `Avi_Elixir_Claude_Code_Build_Prompt.md`, `Avi_Elixir_PRD.md`, and `Avi_Elixir_TRD.md` for the full spec.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Supabase (Postgres, Auth, Storage) — RLS enabled on every customer-facing table
- Manual bank transfer + WhatsApp for checkout (Paystack is built but on hold — see below)
- Resend (order confirmation emails)
- Google Analytics 4
- Zustand (client-side cart, persisted to localStorage)

## Checkout flow (manual bank transfer)

Paystack is on hold. Checkout currently works like this:

1. Checkout requires a signed-in account (no more guest checkout) — name/phone/address
   prefill from the customer's saved details.
2. The checkout page shows the bank transfer details (`NEXT_PUBLIC_BANK_*` env vars)
   and the exact amount to send.
3. The customer uploads a screenshot of their transfer receipt (stored in the private
   `order-receipts` Storage bucket) and submits — this creates the `Order` in
   `pending_payment` with `receipt_url` pointing at that upload.
4. The confirmation page shows a "Message Us on WhatsApp" button with a prefilled
   message (items, quantities, sizes, total, address). **WhatsApp's `wa.me` links can't
   attach an image** — there's no such API — so the message asks the customer to also
   attach the receipt screenshot manually in the chat. The receipt is already saved to
   their order either way, so admin can verify it from `/admin/orders/[id]` even if the
   customer never re-sends it on WhatsApp.
5. Admin reviews the receipt against the bank account in `/admin/orders/[id]` and sets
   the order to "paid" — this calls the same atomic `complete_order_payment` function
   used by the old Paystack webhook, so stock still decrements exactly once.

To re-enable Paystack later: swap the manual-transfer block in
`components/cart/CheckoutForm.tsx` / `app/api/checkout/route.ts` back to calling
`lib/paystack.ts`'s `initializeTransaction`, and re-enable guest checkout if wanted.
The webhook route (`app/api/paystack/webhook`) and `lib/paystack.ts` were left in place
untouched for this.

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
   in filename order (0001 → 0006), then `supabase/seed.sql` for sample catalog data.
   (Alternatively, if you have the Supabase CLI linked with your project's DB
   password: `supabase link --project-ref <ref>` then `supabase db push`.)
5. **Turn off email confirmation**: Authentication → Providers → Email → disable
   "Confirm email". This is a dashboard-only setting; the app already assumes
   instant access after a shopper signs up (shopper accounts are separate from admin
   access — they're for wishlist, order history, and reviews).

### 3. Bank transfer details

Set `NEXT_PUBLIC_BANK_NAME`, `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER`, and
`NEXT_PUBLIC_BANK_ACCOUNT_NAME` — these are shown at checkout and in the WhatsApp
message. (Paystack env vars are still in `.env.example` but unused while it's on hold.)

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
used in confirmation emails).

## Business rules baked into the code (see the build prompt for the full list)

- Checkout charges the product subtotal only — delivery fee is never collected here;
  it's arranged by phone/WhatsApp after payment.
- Checkout requires a signed-in account (current manual-transfer flow only — guest
  checkout was intentionally dropped so receipts can be tied to a customer).
- No email-confirmation gate (paired with the Supabase dashboard toggle above).
- Reviews require a paid order containing the product, checked server-side in
  `app/api/reviews/route.ts`, and always land in a `pending` moderation queue.
- Wishlist is per `product_variant_id`, not per product.
- Out-of-stock variants stay visible and wishlistable; only "add to cart" is disabled.
- No customer-facing order cancellation — only `/admin/orders/[id]`.
- Stock decrements atomically inside the `complete_order_payment` Postgres function
  (`supabase/migrations/0003_functions.sql`), called when admin marks an order "paid".
- No tax/VAT anywhere; no returns workflow (`/returns` is a static policy page).
