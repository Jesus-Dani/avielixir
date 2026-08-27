# Avi Elixir — Technical Requirements Document (TRD)
**Ecommerce Website — Version 1.2** | Companion document: Avi Elixir PRD v1.2 | Date: August 26, 2026

## 1. Purpose & Relationship to the PRD

This TRD translates the confirmed product scope in the Avi Elixir PRD into a technical architecture, data model, and implementation plan. It covers the stack, integrations, data structures, and workflows needed to deliver the features defined in the PRD — it does not redefine product scope. Where a technical decision was not explicitly confirmed by the client, this document states the assumed default clearly and flags it in Section 17 rather than presenting it as locked.

## 2. Architecture Overview

The site is a fully custom-built web application — not a template or no-code platform (confirmed). It uses Supabase as the backend (database, authentication, and file storage) and Vercel for hosting (both confirmed). Next.js is the assumed frontend framework: it is the natural fit for a Supabase + Vercel stack and matches the developer's established pattern on prior builds; this should be confirmed at implementation kickoff but does not change any decision in the PRD.

At a high level, the request flow is:

- Browser (mobile-first) → Next.js app hosted on Vercel, rendering catalog, product, cart, and account pages.
- Next.js app ↔ Supabase (Postgres database + Auth + Storage) for all product, customer, order, and review data, and for image storage.
- Checkout → Paystack (hosted payment flow: cards, bank transfer, USSD) → webhook/callback confirms payment back to the app.
- Order confirmation and status-change emails → transactional email provider (Section 12).
- Support → WhatsApp click-to-chat link (wa.me), no backend integration required.
- Site usage → Google Analytics 4 (Section 13).

## 3. Technology Stack Summary

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | Next.js (React) | Assumed default; matches Supabase + Vercel and prior project pattern — confirm at kickoff |
| Hosting | Vercel | Launches on a Vercel subdomain; custom domain addable later, confirmed no domain owned yet |
| Database | Supabase (PostgreSQL) | Managed Postgres with Row-Level Security (RLS) |
| Authentication | Supabase Auth | Email + password only, confirmed; no email verification required; guest checkout supported |
| File / image storage | Supabase Storage | Product images uploaded via admin |
| Payments | Paystack | Cards, bank transfer, USSD; NGN only, confirmed |
| Transactional email | Recommended: Resend | Must work without the client owning a custom domain (confirmed requirement) — see Section 12 |
| Analytics | Google Analytics 4 | Confirmed: lowest-effort fit requested |
| Customer support | WhatsApp click-to-chat (wa.me link) | Confirmed channel; no backend integration |

## 4. Data Model

Core entities required to support the confirmed feature set. Field lists are the minimum needed — implementation may add technical columns (timestamps, soft-delete flags, etc.) as needed.

### 4.1 Category

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| name | text | One of the 7 confirmed categories |
| slug | text | URL-friendly identifier |

### 4.2 Collection (new in v1.2)

A scent-family taxonomy (e.g. Floral, Woody & Warm, Fresh & Fruity), confirmed as a second browsing structure parallel to Category — see PRD Section 5.4. A Product can belong to a Category and a Collection at the same time.

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| name | text | e.g. Floral, Woody & Warm, Fresh & Fruity |
| slug | text | URL-friendly identifier |
| image_url | text | Cover image for the homepage collections showcase (PRD 7.3) |

**ProductCollection** (join table): `product_id` (FK → Product), `collection_id` (FK → Collection) — many-to-many, since a product could reasonably sit in more than one scent family.

### 4.3 Product

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| category_id | FK → Category | |
| name | text | |
| scent_notes | text | Confirmed required product-page field |
| usage_instructions | text | Confirmed required product-page field |
| base_price | numeric (₦) | Final, all-inclusive price; overridable per variant |
| status | enum: active / hidden | Lets admin unpublish without deleting |
| is_featured | boolean | Powers homepage "featured products" curation |
| created_at / updated_at | timestamp | |

### 4.4 ProductVariant (size)

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| product_id | FK → Product | |
| size_label | text | e.g. 39ml, 50ml, 100ml |
| price | numeric (₦) | Nullable — falls back to Product.base_price if not overridden |
| stock_quantity | integer | Automatic deduction on sale (Section 9) |

### 4.5 ProductImage

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| product_id | FK → Product | |
| url | text | Supabase Storage object URL |
| sort_order | integer | Controls display order on the product page |

### 4.6 Customer

Extends the Supabase Auth user with app-specific profile fields. Account creation requires no email verification step — confirmed instant access after signup.

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK, = auth.users.id) | |
| name | text | |
| phone | text | Useful for delivery-fee coordination (PRD 6.1) |
| saved_address | text / structured (line, city, state) | One saved address per account for v1 (confirmed) — pre-fills checkout |
| is_admin | boolean | Flags the single confirmed admin account |
| lifetime_value | computed | Sum of paid Order totals — displayed in admin (PRD Section 9) |

### 4.7 Wishlist

Saves at the specific size/variant level, not just the product (confirmed).

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| customer_id | FK → Customer | |
| product_variant_id | FK → ProductVariant | Specific size, not just the parent product |
| created_at | timestamp | |

### 4.8 Review

Confirmed: only verified purchasers of a product may review it, in addition to admin moderation.

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| product_id | FK → Product | |
| customer_id | FK → Customer | Review submission requires an account, even if the original purchase was made as a guest |
| rating | integer 1–5 | |
| comment | text | |
| status | enum: pending / approved / rejected | Confirmed: admin must approve before publishing |
| created_at | timestamp | |

Eligibility check: before accepting a submission, the system verifies a Paid-or-later Order (matched by this Customer's id, or by the Customer's email against a guest order) containing this product. Guest purchasers must create an account before they can review, using the same email their order was placed under.

### 4.9 Order & OrderItem

Guest checkout is confirmed as allowed — customer_id is nullable, with a guest_email captured instead when no account exists.

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| customer_id | FK → Customer, nullable | Null for guest checkouts (confirmed guest checkout is allowed) |
| guest_email | text, nullable | Required when customer_id is null — used to look up the order and to gate review eligibility later if an account is created |
| status | enum: pending_payment / paid / processing / shipped / delivered / cancelled | Admin-updated manually (PRD 6.3); no customer self-service cancellation (confirmed) |
| subtotal | numeric (₦) | Product total only — excludes delivery fee (PRD 6.1) |
| paystack_reference | text | Payment verification reference |
| delivery_fee | numeric (₦), nullable | Recorded for bookkeeping only; not charged through checkout |
| delivery_phone_note | text, optional | Contact info for post-order delivery coordination |
| created_at | timestamp | |

OrderItem: id, order_id (FK), product_variant_id (FK), quantity, unit_price — one row per line item in the order.

## 5. Frontend Design System & Homepage Structure (new in v1.2)

A homepage mockup was reviewed and confirmed as the locked structural reference for the homepage build (PRD Section 7.3). Its section layout is confirmed; its exact copy is illustrative only.

### 5.1 Design Tokens

Revised palette (PRD v1.2 — replaces the earlier black-and-gold direction): a light, soft base of mauve/rose/blush tones, with gold used for accents (buttons, dividers, small labels) and black/near-black for body text and primary headings. Implementation should define these as CSS custom properties / a Tailwind theme extension so they're applied consistently rather than hard-coded per component.

- Background surfaces: blush/rose-tinted neutrals (light sections) and a deeper mauve (contrast sections, e.g. the collections showcase band).
- Accent: gold, for buttons, small dividers, and label text (e.g. "FEATURED SCENTS").
- Text: black/near-black for body copy and headings, for contrast against the lighter backgrounds.
- Typography: a serif display face for headlines and product names, paired with a clean sans-serif for body/nav/UI text; letter-spaced uppercase for nav items and eyebrow labels.

### 5.2 Homepage Component Structure

Confirmed section order and content sources for the homepage:

| Section | Content source / behavior |
|---|---|
| Header | Logo; nav (Home, Shop, Collections, About, Contact); search; cart icon with item count |
| Hero | Rotating banner (tagline, short supporting copy, CTA button); slide-position indicator |
| Featured Scents | 4-up grid pulling Product records where is_featured = true, ordered by admin |
| Collections showcase | Grid of Collection records (Section 4.2), each linking to its filtered product listing |
| Brand story | Single image + short copy block, linking to the About page |
| Footer | Nav columns (Shop, Collections, About, Help, Follow Us); legal links; copyright |

Confirmed exclusion: the reference mockup's "Join the Elixir List" email-capture block (hero-adjacent banner + footer subscribe field) is not built — newsletter capture remains out of scope for v1 (PRD Section 10). No substitute section replaces it; the footer simply omits that field.

## 6. Authentication & Authorization

- Customer sign-up/sign-in via Supabase Auth using email + password (confirmed — no social login, no OTP for v1).
- No email verification step is required — Supabase Auth is configured to grant instant access after signup rather than requiring a confirmation-link click (confirmed).
- Guest checkout is confirmed as allowed: a customer can complete a purchase without an account. Account creation remains available separately for anyone who wants order history, wishlist, or to submit a review.
- A single admin account is confirmed for v1 — flagged via Customer.is_admin rather than a full roles/permissions system. Admin-only routes and Supabase RLS policies check this flag.
- Row-Level Security: customers can read/write only their own orders, wishlist entries, and reviews; product/category data is publicly readable; write access to Product, ProductVariant, ProductImage, Category, and Order status is restricted to the admin flag. Guest orders are matched by guest_email rather than a customer row.

## 7. Payments — Paystack Integration

Confirmed checkout flow:

1. Customer reviews cart and proceeds to checkout, entering contact and delivery-address details.
2. Checkout charges the product subtotal only, in ₦, via Paystack — cards, bank transfer, and USSD channels enabled (confirmed).
3. Paystack payment is initiated (hosted checkout or inline popup) and verified server-side via Paystack's webhook/callback before the order is marked paid.
4. On verified payment: an Order record is created with status "paid", stock is decremented (Section 9), and an order-confirmation email is sent (Section 12).
5. Delivery fee is deliberately excluded from this charge — it is negotiated and collected separately by Avi Elixir after the order is placed (PRD 6.1). The order confirmation and account order-history page should clearly state that delivery cost will be communicated separately.

Prices are displayed and charged as final, all-inclusive ₦ amounts — no separate VAT line is calculated or shown (confirmed).

## 8. Order & Fulfillment Workflow

Confirmed: manual status updates by admin, no courier tracking API integration.

Order status progression: Pending Payment → Paid → Processing → Shipped → Delivered, with Cancelled available at any pre-Delivered stage. Admin transitions status manually from the admin order list/detail view; the customer's Order History page reflects the current status. An optional free-text tracking-number field can be filled in by admin if a courier provides one, without requiring an API integration.

No self-service cancellation: there is deliberately no customer-facing "Cancel order" control (confirmed). A customer who wants to cancel before shipment contacts support via the WhatsApp channel already confirmed in the PRD, and admin sets the order to Cancelled manually if appropriate.

## 9. Inventory Management

Confirmed: automatic stock deduction with quantity counts (not a simple in/out-of-stock toggle).

- Each ProductVariant carries a stock_quantity.
- On verified payment, stock_quantity is decremented by the ordered amount inside a database transaction, to prevent overselling under concurrent orders.
- A variant that reaches stock_quantity 0 stays visible in the catalog and on its product page, clearly labeled "Out of stock," with add-to-cart disabled for that size (confirmed) — sold-out items are not hidden from browsing or wishlisting.
- No minimum/low-stock alerting was requested; this can be added later as a lightweight admin dashboard indicator if useful.

## 10. Reviews Workflow

- Customer submits a rating (1–5) and comment on a product.
- Review is created with status "pending" — not publicly visible.
- Admin sees a moderation queue in the admin panel and approves or rejects each review (confirmed requirement).
- Only "approved" reviews display on the product page and count toward any average-rating display.

## 11. Admin Panel — Technical Requirements

Single authenticated admin user for v1 (confirmed — no multi-staff roles). Required admin capabilities:

- Full CRUD on Category, Collection, Product, ProductVariant (sizes/prices/stock), and ProductImage (upload to Supabase Storage).
- Orders list and detail view, with manual status update control.
- Customer list, including each customer's computed lifetime purchase value (sum of paid order totals).
- Review moderation queue — approve or reject pending reviews.
- Toggle for "featured" products, to curate the homepage.

Not required for v1 (confirmed out of scope): multiple staff accounts/permission levels, discount/gift-card/loyalty management, newsletter subscriber management.

## 12. Email & Notifications

The client needs a transactional email provider that does not require her to already own a custom domain (confirmed requirement). Resend is recommended: it can send from a shared/default sending domain at low volume without domain verification, and can be upgraded to a verified custom domain later — once one exists — without changing the integration. Supabase's built-in auth email is not recommended for production order confirmations, as it is rate-limited and intended for testing only.

Required transactional emails: order confirmation (post-payment), covering both account holders and guest checkouts via guest_email. Order status-change notifications (e.g. "shipped") are a low-cost addition worth including given manual status updates are already part of the admin workflow. Marketing/newsletter email is confirmed out of scope.

## 13. Analytics, Tracking & SEO

Confirmed: recommend the lowest-effort fit. Google Analytics 4 is recommended as the baseline — free, standard, sufficient for tracking traffic, product views, add-to-cart, and purchase conversion events.

Basic on-page SEO is included as standard practice (not separately confirmed as in/out of scope, but low-cost within a Next.js build): descriptive page titles/meta descriptions, semantic HTML, an XML sitemap, and a robots.txt file. No dedicated SEO tooling or campaign is budgeted.

## 14. Hosting, Environments & Deployment

- Hosting: Vercel (confirmed). Launches on a Vercel-provided subdomain (e.g. avi-elixir.vercel.app); a custom domain can be attached later via Vercel's domain settings with no application changes required (confirmed: no domain owned yet).
- Environments: local development, Vercel preview deployments per branch/pull request, and a single production environment.
- Database: a single Supabase project is assumed for v1 given the confirmed lack of a fixed timeline/budget signal; separating development and production Supabase projects is a reasonable future hardening step, not required to launch.

## 15. Non-Functional Requirements

- **Mobile-first:** confirmed primary design/build target is mobile; desktop is adapted from the mobile experience.
- **Accessibility:** confirmed best-effort only — semantic HTML, image alt text, keyboard navigability, and adequate color contrast against the mauve/rose/blush + gold palette (revised in PRD v1.2 — text and interactive elements need sufficient contrast against the lighter blush backgrounds, more so than the original black-and-gold direction). No formal WCAG certification is required.
- **Performance:** no explicit target was set; standard Next.js practices apply (image optimization, code-splitting, server rendering or incremental static regeneration for catalog/product pages) to keep mobile load times fast.
- **Privacy & cookies:** confirmed a basic privacy policy page plus a cookie-consent banner, with lightweight awareness of Nigeria's NDPR — not a full compliance program (no DPO designation or formal registration in scope).
- **Security:** HTTPS by default via Vercel; Supabase Row-Level Security enforces data access rules; card and bank-transfer payment data is handled entirely by Paystack's hosted flow — no card data is stored on Avi Elixir's own servers.

## 16. Third-Party Integrations Summary

| Integration | Purpose | Setup owner |
|---|---|---|
| Supabase | Database, auth, file storage | Developer (Daniella) |
| Vercel | Hosting and deployment | Developer (Daniella) |
| Paystack | Payment processing (cards, bank transfer, USSD) | Client — merchant account & verification; Developer — integration |
| Resend (recommended) | Transactional email | Developer (Daniella) |
| Google Analytics 4 | Site/traffic analytics | Developer (Daniella) |
| WhatsApp (wa.me link) | Customer support contact | Client — provides business WhatsApp number |

## 17. Assumptions & Open Technical Decisions

Flagged rather than assumed, consistent with the PRD's approach to unresolved items:

- Frontend framework: Next.js is the assumed default given the confirmed Supabase + Vercel stack; final confirmation recommended at implementation kickoff.
- Domain name: not yet registered — launching on a Vercel subdomain; revisit hosting/DNS setup once a domain is purchased.
- Email provider: Resend is recommended to satisfy the "no custom domain required" constraint; can be swapped if the client has a specific preference.
- Supabase project topology: single project assumed for v1; separate dev/prod projects are a future hardening option, not a launch requirement.
- Launch date: none was set — build proceeds iteratively rather than against a fixed deadline.
- Regulatory/compliance research (e.g. NAFDAC applicability to cosmetic/fragrance resale, business registration) is outside this document's technical scope and should be handled by the client separately (see PRD Section 11).
- Collection-to-product relationship: modeled as many-to-many (Section 4.2) since a product could plausibly sit in more than one scent family; if the client intends collections to be mutually exclusive per product, this can be simplified to a single nullable collection_id on Product.
- Exact final homepage copy (headlines, taglines, product names shown in the reference mockup) is illustrative only — real copy is written separately from the confirmed structure.
