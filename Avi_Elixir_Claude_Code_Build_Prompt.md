# Avi Elixir — Build Prompt for Claude Code

**Purpose of this file:** paste this into Claude Code as the project brief when scaffolding/building the Avi Elixir ecommerce site. It condenses the confirmed PRD v1.2 and TRD v1.2 into a single actionable spec. Everything here reflects decisions already confirmed with the client — do not silently re-decide any of it; if something genuinely isn't covered below, ask before assuming.

---

## 1. Project Summary

Build a fully custom ecommerce website for **Avi Elixir**, an affordable fragrance brand for teens–young adults in Nigeria, with a strong campus/student emphasis. The site sells perfumes/body mists/etc. sourced and resold by Avi Elixir (not manufactured in-house). It must feel premium, warm, and uncluttered — not a generic template look — while staying simple to shop on mobile.

Non-negotiables carried through every decision below: **mobile-first**, **NGN-only pricing**, **manual delivery-fee coordination outside the checkout charge**, **guest checkout allowed**, **single admin account**, **final-sale (no returns) policy**.

---

## 2. Tech Stack (confirmed — build with exactly this)

- **Frontend:** Next.js (React), mobile-first responsive layout
- **Database/Backend:** Supabase (PostgreSQL), with Row-Level Security (RLS) enabled on all customer-facing tables
- **Auth:** Supabase Auth — email + password only. No social login, no OTP, **no email verification requirement** (instant access after signup)
- **File/image storage:** Supabase Storage (product images)
- **Hosting:** Vercel — deploy to a Vercel-provided subdomain (no custom domain yet; leave DNS flexible for one to be attached later)
- **Payments:** Paystack — enable **cards, bank transfer, and USSD** channels; NGN only
- **Transactional email:** Resend, using its default/shared sending domain (client does not own a custom domain yet) — send order-confirmation emails
- **Analytics:** Google Analytics 4 (basic page-view + ecommerce events: view_item, add_to_cart, purchase)
- **Customer support:** a WhatsApp click-to-chat button (`https://wa.me/<number>` link) — no backend integration, just a styled link/button

Do not introduce a different framework, a headless CMS, a different database, or a different payment provider without checking first — these are all client-confirmed.

---

## 3. Design System

**Palette (confirmed, replaces an earlier black-and-gold direction):**
- Background surfaces: soft mauve / rose / blush tones (lighter neutral sections), with a deeper mauve for contrast bands (e.g. the collections showcase)
- Accent color: gold — used for buttons, dividers, small labels
- Text: black / near-black for body copy and headings (check contrast carefully against the lighter blush backgrounds — this is a real accessibility risk with this palette)

**Typography:**
- A serif display face for headlines and product names
- A clean sans-serif for body copy, navigation, and UI text
- Letter-spaced uppercase for nav items and small "eyebrow" labels (e.g. "FEATURED SCENTS")

**Overall tone:** generous whitespace, restrained motion, clear hierarchy. Avoid dense grids, heavy discount banners, or visual clutter — the brand is premium and affordability is communicated through clean pricing, not discount-style visuals.

Implement palette/type as design tokens (CSS custom properties or a Tailwind theme extension) rather than hardcoding colors per component.

---

## 4. Database Schema (Supabase / Postgres)

Build these tables (add technical columns like `created_at`/`updated_at` as needed beyond what's listed):

```
Category
  id uuid PK
  name text                  -- one of: Perfume, Body Mist, Perfume Oil, Body Spray, Roll-on, Pocket Perfume, Atomizer
  slug text

Collection                   -- scent-family taxonomy, separate from Category
  id uuid PK
  name text                  -- e.g. Floral, Woody & Warm, Fresh & Fruity
  slug text
  image_url text              -- cover image for homepage collections showcase

ProductCollection             -- many-to-many join
  product_id uuid FK -> Product
  collection_id uuid FK -> Collection

Product
  id uuid PK
  category_id uuid FK -> Category
  name text
  scent_notes text
  usage_instructions text
  base_price numeric          -- NGN, final/all-inclusive, no separate tax
  status text                 -- 'active' | 'hidden'
  is_featured boolean         -- drives homepage "Featured Scents" grid
  created_at timestamp
  updated_at timestamp

ProductVariant                -- size options
  id uuid PK
  product_id uuid FK -> Product
  size_label text             -- e.g. "39ml", "50ml", "100ml"
  price numeric nullable      -- overrides Product.base_price if set
  stock_quantity integer      -- auto-decremented on sale; 0 = "Out of stock" (stays visible, purchase disabled)

ProductImage
  id uuid PK
  product_id uuid FK -> Product
  url text
  sort_order integer

Customer                      -- extends Supabase Auth user
  id uuid PK  (= auth.users.id)
  name text
  phone text
  saved_address text          -- one saved address per account for v1, pre-fills checkout
  is_admin boolean            -- flags the single admin account (no multi-role system)
  -- lifetime_value: computed (sum of paid Order.subtotal for this customer), not stored

Wishlist
  id uuid PK
  customer_id uuid FK -> Customer
  product_variant_id uuid FK -> ProductVariant   -- saved at SIZE level, not product level
  created_at timestamp

Review
  id uuid PK
  product_id uuid FK -> Product
  customer_id uuid FK -> Customer   -- review requires an account even for guest purchasers
  rating integer                    -- 1-5
  comment text
  status text                       -- 'pending' | 'approved' | 'rejected'
  created_at timestamp
  -- eligibility: only allow submission if a Paid+ order (by customer_id, or by matching
  -- email against a guest order) contains this product

Order
  id uuid PK
  customer_id uuid FK -> Customer, nullable   -- null for guest checkout
  guest_email text nullable                   -- required when customer_id is null
  status text            -- 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal numeric       -- product total ONLY, excludes delivery fee
  paystack_reference text
  delivery_fee numeric nullable   -- bookkeeping only; NOT charged through checkout
  delivery_phone_note text nullable
  created_at timestamp

OrderItem
  id uuid PK
  order_id uuid FK -> Order
  product_variant_id uuid FK -> ProductVariant
  quantity integer
  unit_price numeric
```

**RLS policies:**
- Product, Category, Collection, ProductVariant, ProductImage: public read; write restricted to `is_admin = true`
- Order, OrderItem, Wishlist, Review: a customer can read/write only their own rows (`customer_id = auth.uid()`); admin can read/write all
- Guest orders (no `customer_id`) are looked up server-side by `guest_email`, not exposed via general RLS read access

---

## 5. Site Map

- Home
- Shop / Catalog (category browsing + search + filter by category/price)
- Collections (scent-family browsing — Floral, Woody & Warm, Fresh & Fruity, etc.)
- Product Detail Page
- Cart
- Checkout
- Customer Account (profile, saved address, order history, wishlist)
- About Avi Elixir
- Contact / Support (WhatsApp button)
- Shipping & Delivery Info
- Returns Policy (final sale)
- Privacy Policy
- Terms of Service
- Cookie notice banner (site-wide component, not a page)
- Admin panel (separate authenticated area — see Section 8)

---

## 6. Homepage — Confirmed Structure

Build the homepage in exactly this section order (content sources noted; **copy/headlines are illustrative, write your own on-brand copy — the structure is what's locked**):

1. **Header** — logo (left), nav center (Home, Shop, Collections, About, Contact), search icon + cart icon (right, cart shows item count)
2. **Hero** — full-width rotating banner: short tagline, one-line supporting sentence, primary CTA button (e.g. links to Collections), slide-position indicator
3. **Featured Scents** — 4-up grid of products where `is_featured = true`, each card showing image, name, format/category label, price
4. **Collections showcase** — grid of Collection tiles (3+), each with a cover image and name, linking to that collection's filtered product listing
5. **Brand story / essence** — one image + a short brand-values passage, linking to the About page
6. **Footer** — nav columns (Shop, Collections, About, Help, Follow Us), legal links (Privacy Policy, Terms & Conditions), copyright line

**Do NOT build:** an email/newsletter signup block anywhere on the homepage or footer. Newsletter capture is explicitly out of scope — omit it entirely rather than substituting something else in its place.

---

## 7. Core Business Rules (the easy-to-get-wrong parts)

Read this section carefully — these are the rules most likely to be implemented "the obvious ecommerce way" instead of the way actually confirmed for this client:

1. **Checkout charges products only.** Paystack collects the product subtotal (₦) — never a delivery fee. After payment, the order confirmation and the customer's order-history view should clearly state that Avi Elixir will contact them separately (call/WhatsApp/bank transfer) to arrange delivery cost. Do not build any shipping-rate calculator.
2. **Guest checkout is allowed.** Do not force account creation to complete a purchase. Guest orders are tracked via `guest_email`. Account creation remains available as a separate, optional flow (needed for wishlist, order history, and reviews).
3. **No email verification.** Supabase Auth should be configured so new accounts get instant access after signup — do not require clicking a confirmation link.
4. **Reviews require a verified purchase.** Before showing the review form / accepting a submission, check that the customer has a paid order (by account or by matching guest email) containing that product. Even then, reviews go into a `pending` moderation queue — never auto-publish.
5. **Wishlist is per size/variant**, not per product. "Save to wishlist" should operate on the specific `ProductVariant` the customer is viewing/selected, not the parent product.
6. **Out-of-stock stays visible.** When `stock_quantity` hits 0 for a variant, do not hide the product — keep it browsable and wishlistable, just disable add-to-cart for that size and show an "Out of stock" label.
7. **No customer-facing cancel button.** There is deliberately no self-service order cancellation. If you're tempted to add one for "completeness," don't — direct customers to the WhatsApp support link instead; admin cancels manually if needed.
8. **Stock deducts automatically and atomically.** On verified payment, decrement `stock_quantity` inside a DB transaction (not just optimistically in app code) to avoid overselling under concurrent checkouts.
9. **No VAT/tax line.** Prices shown and charged are final, all-inclusive ₦ amounts. Do not add tax calculation logic.
10. **Final sale — no returns/refunds workflow.** Don't build a returns request flow; just present the policy clearly on its own page.

---

## 8. Admin Panel — Requirements

Single authenticated admin account (`is_admin = true` on Customer) — no multi-role/staff permission system. The admin area needs:

- Full CRUD on Category, Collection, Product (incl. `is_featured` toggle), ProductVariant (sizes/prices/stock), ProductImage (upload to Supabase Storage)
- Orders: list + detail view, with a manual status-update control (Pending Payment → Paid → Processing → Shipped → Delivered, plus Cancelled)
- Customers: list view showing each customer's **lifetime purchase value** (sum of their paid order subtotals)
- Reviews: a moderation queue to approve or reject pending reviews

Do **not** build: multi-staff roles/permissions, discount/coupon/gift-card management, newsletter subscriber management, or a returns/refunds processing flow.

---

## 9. Integrations Checklist

- [ ] Supabase project created; schema above migrated; RLS policies applied
- [ ] Supabase Auth configured for email+password, email confirmation disabled
- [ ] Supabase Storage bucket for product images, with appropriate access policy
- [ ] Paystack test + live keys; checkout initiates a charge for `Order.subtotal` only; webhook verifies payment and flips status to `paid`
- [ ] Resend account connected (shared/default sending domain to start); order-confirmation email template built
- [ ] Google Analytics 4 property + basic ecommerce event tracking wired in
- [ ] WhatsApp business number confirmed with client, used in the `wa.me` support link
- [ ] Vercel project deployed to its default subdomain; env vars set for all of the above

---

## 10. Non-Functional Requirements

- **Mobile-first**: design and test the mobile experience as primary; adapt up to desktop
- **Accessibility**: best-effort only — semantic HTML, alt text on all product images, keyboard-navigable UI, sufficient color contrast (pay particular attention here given the light blush palette). No formal WCAG audit required.
- **Performance**: standard Next.js practices — optimized images, code-splitting, server rendering or ISR for catalog/product pages
- **Privacy**: a basic Privacy Policy page and a cookie-consent banner; lightweight NDPR-awareness, not a full compliance program
- **Security**: HTTPS via Vercel, Supabase RLS enforced everywhere, no card data ever touches Avi Elixir's own servers (Paystack handles it)

---

## 11. Explicitly Out of Scope — do not build these

- Newsletter signup / marketing emails
- Discount codes, gift cards, loyalty/rewards program
- Returns/refunds request workflow
- Automated shipping-cost calculator or courier tracking API integration
- Multi-staff admin roles/permissions
- Multi-currency or international payments
- Social login or OTP/passwordless auth
- Customer self-service order cancellation
- Email-verification gating at signup
- Any features copied from "Shop With Mercy" beyond a general quality/polish bar

---

## 12. Suggested Build Order

1. **Scaffold**: Next.js app on Vercel, Supabase project + schema + RLS, basic auth (signup/login, no email verification)
2. **Catalog core**: Category/Collection/Product/ProductVariant/ProductImage models + admin CRUD for all of them
3. **Browse & discover**: Shop page, Collections page, search/filter, Product Detail Page (images, size selector, scent notes, usage instructions, stock status, related products)
4. **Cart & checkout**: cart state, checkout form, Paystack integration (subtotal only), order creation + webhook verification, stock decrement, order-confirmation email
5. **Account features**: sign-in/sign-up, saved address, order history, wishlist (variant-level), review submission (verified-purchase gated) + moderation queue
6. **Admin panel**: orders management, customer list with lifetime value, review moderation, featured-product toggle
7. **Homepage & brand polish**: build the confirmed homepage structure (Section 6), apply the design tokens (Section 3) sitewide, write on-brand copy
8. **Static/legal pages**: About, Contact (WhatsApp button), Shipping & Delivery Info, Returns Policy, Privacy Policy, Terms of Service, cookie banner
9. **Integrations pass**: GA4 events, Resend email polish, final accessibility/contrast/mobile QA pass

---

*Source: Avi Elixir PRD v1.2 and TRD v1.2 (confirmed via structured client discovery). If anything here seems to conflict with a stated requirement, or a decision is needed that isn't covered above, stop and ask rather than assuming.*
