# Avi Elixir — Product Requirements Document (PRD)
**Ecommerce Website — Version 1.2** | Status: Draft v1.2, confirmed scope incl. homepage design reference | Date: August 26, 2026

## 1. Overview & Purpose

Avi Elixir is an affordable fragrance brand serving teenagers through young adults across Nigeria, with a strong emphasis on students and campus fragrance needs. This document defines the product scope for Avi Elixir's ecommerce website: a fully custom-built online store that lets customers browse, discover, and purchase fragrances, and lets Avi Elixir manage its catalog, orders, and customers from a dedicated admin area.

The site must feel premium, welcoming, inclusive, and trustworthy — communicating quality and customer-first service — while keeping the shopping experience simple, uncluttered, and affordable-by-design. This PRD reflects decisions confirmed directly with the client through structured discovery; open items that remain genuinely undecided are called out explicitly in Section 11 rather than assumed.

## 2. Business Goals

Confirmed business goals for the website:

- Sell fragrance products online and make purchasing easier for current customers.
- Reach new customers, particularly students and campus customers.
- Present Avi Elixir professionally, showcase products better, and build trust.
- Increase sales and repeat purchases.
- Establish one central place for customers to browse the full catalog.
- Communicate customer-first service — the brand respects, honours, and prioritizes customers' needs and experience.

### 2.1 Success Metrics

Success will be assessed through the following (exact numeric targets not yet set — to be defined once the site has launch traffic data):

| Metric | What it measures |
|---|---|
| Sales revenue | Total ₦ value of completed orders |
| Conversion rate | Site visitors who complete a purchase |
| Repeat purchase rate | Customers who order more than once |
| Account creation rate | Visitors who register a customer account |
| Wishlist saves | Products saved to favourites — a proxy for discovery/engagement |
| Review submissions | Customer reviews submitted — a proxy for post-purchase engagement |

Note: newsletter sign-up was considered during discovery but newsletter functionality is confirmed out of scope for v1 (Section 10), so it is not tracked as a metric here.

## 3. Target Users

### 3.1 Primary Audience

- Teenagers through young adults, broadly — with a strong emphasis on students and campus fragrance needs (confirmed: not campus-exclusive, but campus is the core emphasis).
- Diverse cultural backgrounds and all genders.
- Price-conscious shoppers who still want a premium-feeling product and experience.
- Nigeria-based customers only for v1 (nationwide delivery; see Section 4).

### 3.2 Core User Needs

- Quickly find a fragrance within their price range.
- Understand scent options, sizes, and how to use the product.
- Feel confident the brand is legitimate and customer-focused.
- Enjoy a polished, non-intimidating shopping experience, primarily on mobile.

## 4. Market & Product Positioning

- **Launch market:** Nigeria only, with nationwide delivery. International/regional expansion is not in scope for v1.
- **Currency:** Nigerian Naira (₦) only — no multi-currency support.
- **Product sourcing:** Avi Elixir resells fragrances sourced from the market; it does not manufacture perfumes. Product copy should describe items honestly (name, scent notes, usage) without implying official designer licensing unless that is genuinely true of a given item.
- **Pricing philosophy:** Affordability should be visible through clear, final ₦ pricing and tasteful value messaging — not discount-heavy visual language that would undercut the luxury positioning. Prices shown are final, all-inclusive amounts (no separate tax line at checkout).
- **Age restriction:** None required. Fragrance/perfume sales do not require age verification in Nigeria (unlike alcohol or tobacco), so no age gate or self-declaration checkbox is included (confirmed).

## 5. Product Catalog

### 5.1 Categories

Confirmed catalog categories:

- Perfume
- Body mist
- Perfume oil
- Body spray
- Roll-on
- Pocket perfume
- Atomizer

### 5.2 Catalog Scale & Content

The catalog has no fixed product-count cap — it supports however many products Avi Elixir uploads through the admin panel. All product photos, names, and descriptive content are confirmed ready; the client will upload everything herself via admin, so no content production is required as part of this engagement. Products referenced during discovery (Better Mora, Monsieur, Choco Musk, Vanilla Crush, Motonogras, Pocket Perfume, Kaly, 24k) are illustrative examples only, not required launch SKUs — full attributes for any of them will be entered directly by the client via admin.

### 5.3 Required Product Data Fields

| Field | Required | Notes |
|---|---|---|
| Product images | Yes | Multiple images per product |
| Product name | Yes | |
| Category | Yes | One of the 7 confirmed categories |
| Price (₦) | Yes | Final, all-inclusive price |
| Size / variant | Yes, where applicable | Most products have size variations (e.g. 39ml, 50ml, 100ml) |
| Scent notes | Yes | Free-text description of the fragrance |
| Usage instructions | Yes | How to use the product |
| Stock / availability status | Yes | Auto-tracked quantity, see Section 9 |
| Quantity selector | Yes | At add-to-cart |

### 5.4 Collections (Scent-Family Browsing)

In addition to the 7 functional categories above, products are also tagged with a Collection — a scent-family grouping (e.g. Floral, Woody & Warm, Fresh & Fruity) confirmed as a second, parallel browsing structure shown in the homepage design reference (Section 7.3). A product can belong to a category and a collection at the same time (e.g. "Perfume" + "Floral"), and customers can browse either by category or by collection. Collections are managed by admin (create/edit/assign products) alongside the existing catalog management capabilities in Section 9.

## 6. Customer Experience & Functional Scope

The confirmed end-to-end customer journey and required capabilities:

| Journey stage | Required capability |
|---|---|
| Browse | Home, category pages, Collections, product listing, search and filtering (by category and price). |
| Product selection | Product detail page with images, price, size selection, scent notes, usage instructions, stock status, quantity selector. |
| Purchase | Cart, checkout via Paystack (cards, bank transfer, USSD), order confirmation. Delivery fee is NOT collected at checkout — see 6.1. |
| Returning customer | Account sign-in (email + password), order history, saved wishlist, saved address. |
| Retention & discovery | Wishlist/favourites, related/recommended products on product pages, customer reviews. |
| Support | WhatsApp click-to-chat button; shipping/delivery info page; clear returns policy page. |

### 6.1 Delivery Fee Handling (Confirmed Process)

Delivery pricing is decided manually rather than calculated automatically. At checkout, the customer pays only the product total online via Paystack. Avi Elixir then contacts the customer separately (call, WhatsApp, or bank transfer) to arrange and collect the delivery fee. This is an operational process outside the software itself — the PRD calls it out so the checkout flow, shipping info page, and order confirmation messaging can set the right expectation with customers up front.

### 6.2 Accounts, Wishlist & Reviews

- Guest checkout is allowed — creating an account is optional, not required to purchase (confirmed). Customers who buy as a guest are identified by their order confirmation email; an account can still be created separately for order history, wishlist, and reviews.
- New accounts get instant access after signup — no email verification link required (confirmed, prioritizing low signup friction).
- Customers can create an account and sign in using email and password.
- The account saves the customer's delivery address and contact details, pre-filling them at future checkouts for faster reorder (confirmed) — one saved address per account for v1.
- Customers can save products to a wishlist/favourites list — saved at the specific size/variant level (e.g. "Better Mora — 100ml"), not just the product (confirmed).
- Customers can submit product reviews, but only for products they have actually purchased (verified-purchase requirement, confirmed) — an account is needed to submit a review even if the original purchase was made as a guest. Reviews are held for admin approval before appearing publicly (moderation queue).
- Customers can view their order history.
- Newsletter sign-up is confirmed not required for v1.

### 6.3 Returns & Fulfillment

- **Returns/refunds:** Final sale — no returns or refunds, consistent with standard practice for opened fragrance products. This policy must be stated clearly on a dedicated policy page.
- **Order cancellation:** No self-service cancellation button (confirmed). A customer who wants to cancel an order before it ships contacts support via the WhatsApp channel already confirmed; admin cancels manually if appropriate.
- **Order status:** Updated manually by admin (e.g. Processing → Shipped → Delivered); no courier tracking API integration. Customers see current status on their order history page.
- **Out-of-stock products:** Remain visible in the catalog, clearly marked "Out of stock," with purchasing disabled for that size (confirmed) — rather than being hidden. This keeps discovery and wishlist interest intact for sold-out items.

### 6.4 Reference Benchmark

"Shop With Mercy" was raised during discovery as a directional benchmark. It is confirmed to apply only as a general look-and-feel/UX quality bar (polish, professionalism) — no specific pages, features, or interactions from that site are adopted into this scope.

## 7. Brand & UI/UX Direction

### 7.1 Desired Brand Perception

Premium, welcoming, exciting, confident, comfortable, inspired, exclusive, and trustworthy. Luxury, elegant, soft, and sophisticated. Clean and spacious — explicitly not crowded.

### 7.2 Confirmed Brand Direction

- Existing logo is preserved as-is.
- Approved visual palette: soft mauve / rose / blush tones with gold accents, and black for body text (confirmed — supersedes the earlier black-and-gold direction, per the approved homepage reference mockup in Section 7.3).
- Typography: clean, simple, and approachable — not overly formal or severe. The homepage reference pairs a serif display face (headlines, product names) with a clean sans-serif for body/nav text, and uses letter-spaced all-caps for labels (nav items, eyebrow text like "FEATURED SCENTS").
- Design should stay spacious and uncluttered while keeping the luxury, elegant, sophisticated tone.
- Mobile-first: the site is designed and built for the mobile experience first, then adapted to desktop, reflecting how this audience actually shops.

### 7.3 Homepage Design Reference (Confirmed)

A homepage mockup was reviewed and its structure is locked in as the official homepage blueprint (confirmed). The exact wording/copy shown in the mockup is illustrative, not final — final copy is written separately — but the section order, layout, and content types below are confirmed:

- Header: logo left; primary nav center (Home, Shop, Collections, About, Contact); search and cart icons right.
- Hero: full-width rotating banner with a short tagline, a one-line supporting sentence, and a primary call-to-action button (e.g. "Explore Collections"); includes a slide-position indicator for the rotation.
- Featured Scents / Bestsellers: a 4-up product grid pulling from admin-flagged featured products, each showing image, name, format (e.g. "Eau de Parfum"), and price.
- Collections showcase: a 3-tile (or more) visual grid linking into the scent-family Collections described in Section 5.4, each tile showing a representative image and collection name.
- Brand story / essence block: a single image paired with a short brand-values passage and a link through to the About page.
- Footer: logo and one-line tagline; nav columns (Shop, Collections, About, Help, Follow Us); legal links (Privacy Policy, Terms & Conditions); copyright line.

Confirmed exclusion: the reference mockup includes a "Join the Elixir List" email-capture block (a hero-adjacent banner plus a footer subscribe field). Per the earlier confirmed decision that newsletter functionality is out of scope for v1, this block is dropped entirely when the homepage is built — it is not replaced with a substitute section.

### 7.4 Design Principles

- Generous whitespace, refined typography, premium product imagery, restrained motion, clear visual hierarchy.
- Avoid dense grids, excessive promotions, visual clutter, or flashy treatment.
- Make affordability visible without undermining luxury positioning — clear pricing and tasteful value messaging rather than discount-heavy visuals.

## 8. Content & Page Requirements

Confirmed site map for v1:

- Home — brand promise, featured products, collections showcase, value proposition (per the confirmed homepage structure in Section 7.3).
- Shop / Catalog — category browsing, search, and filtering.
- Collections — scent-family browsing (Section 5.4), linked from the main nav and the homepage collections showcase.
- Product Detail Page.
- About Avi Elixir — origin, mission, customer-first positioning, campus/student focus.
- Cart.
- Checkout.
- Customer Account — profile, order history, wishlist.
- Contact / Support — WhatsApp click-to-chat button as the primary channel.
- Shipping & Delivery Information — including the manual delivery-fee process described in 6.1.
- Returns Policy — final sale.
- Privacy Policy.
- Terms of Service.
- Cookie notice banner — a site-wide component rather than a standalone page.

Confirmed messaging themes: quality fragrances at affordable prices; inclusive service for diverse customers; a premium, beautiful experience; confidence that customers' needs and experience are valued.

Content readiness: all product photos and copy are confirmed ready — the client will upload everything herself via the admin panel. No separate content-production workstream is included in this scope.

## 9. Admin & Operational Requirements

A single admin/owner account is confirmed as sufficient for v1 (no multi-staff roles/permissions). The admin area must let authorized staff:

- Create and edit products, categories, collections, prices, images, size variants, scent notes, usage instructions, and stock status.
- Manage orders and manually update fulfillment status.
- View customer records.
- View each customer's lifetime purchase value.
- Review and approve or reject customer-submitted reviews before they go live.
- Update site content, featured products, and promotions.

## 10. Out of Scope for v1

The following were explicitly considered during discovery and confirmed as not part of this build:

- Newsletter sign-up and marketing emails.
- Discount/coupon codes, gift cards, and any loyalty or rewards program.
- Returns/refunds workflow (final sale policy applies instead).
- Automated shipping-cost calculation or courier tracking API integration.
- Multi-staff admin roles/permissions (single admin account only).
- Multi-currency or international payment support.
- Social/passwordless login (email + password only).
- Customer self-service order cancellation.
- Email-verification gating at signup.
- Specific features copied from the "Shop With Mercy" reference site.

Any of these can be scoped into a later phase if priorities change.

## 11. Assumptions, Constraints & Open Items

These items were raised during discovery and are deliberately not locked — they are flagged here rather than assumed, per the client's request:

- Domain name: not yet registered. The site will launch on a Vercel-provided subdomain; a custom domain can be added later without rebuilding the site.
- Brand assets on Google Drive: exist and will be provided/referenced during design and development; not reviewed as part of this PRD.
- Launch date: no fixed timeline was set — the build proceeds iteratively.
- Delivery-fee consistency: because delivery pricing is decided manually per order (Section 6.1), the client should maintain her own reference for typical delivery costs by location to keep pricing consistent — this is a business process, not a software feature.
- Regulatory/legal: business registration and any Nigerian regulatory requirements applicable to selling cosmetic/fragrance products (e.g. NAFDAC applicability), consumer protection, and allergen disclosure were not confirmed during discovery and should be verified by the client independently of this technical build.
- Paystack merchant account setup and business verification is an operational prerequisite outside this document's scope.

## 12. Appendix — Confirmed Decision Log

| Topic | Confirmed decision |
|---|---|
| Launch market / delivery | Nigeria only, nationwide delivery |
| Audience scope | Teens–young adults broadly, strong campus emphasis (not campus-exclusive) |
| Product sourcing | Market-sourced perfumes, resold (not manufactured); no designer-license claims implied |
| Platform approach | Fully custom build (not a template); Supabase database, Vercel hosting |
| Kaly / 24k catalog entries | Examples only, not built into launch catalog — client uploads all products via admin |
| Delivery pricing | Decided manually, communicated to customer after checkout (not calculated in-app) |
| Order tracking | Manual admin status updates; no courier API |
| Discounts / gift cards / loyalty | None for v1 |
| Shop With Mercy reference | General UX/quality benchmark only, no specific features adopted |
| Returns / refunds | Final sale — no returns/refunds |
| Customer auth | Email + password via Supabase Auth |
| Transactional email | Provider that doesn't require a custom domain (see TRD) |
| Analytics | Recommend lowest-effort fit (see TRD: GA4) |
| Support channel | WhatsApp click-to-chat button |
| Domain | Vercel subdomain at launch; custom domain deferred |
| Mobile priority | Mobile-first |
| Inventory tracking | Automatic stock deduction with quantity counts |
| Admin access | Single admin/owner account for v1 |
| Accessibility target | Best-effort, no formal WCAG certification |
| Catalog size / timeline | Unlimited catalog size; no fixed launch date |
| Content readiness | All product content ready; client uploads via admin |
| Payment channels | Paystack — cards, bank transfer, USSD |
| Review moderation | Admin approval required before a review is published |
| Privacy / cookies | Basic privacy policy + cookie notice banner (lightweight NDPR-aware) |
| Related products | Included on product detail pages |
| Pricing / tax display | Final, all-inclusive price shown; no separate VAT line |
| Ongoing maintenance | Daniella continues as the developer post-launch |
| Guest checkout | Allowed — account is optional, not required to purchase |
| Review eligibility | Only verified purchasers of a product can review it |
| Out-of-stock display | Stays visible in catalog, marked "Out of stock," purchase disabled |
| Saved address | Account saves delivery address/contact for faster reorder |
| Wishlist granularity | Saved at the specific size/variant level |
| Age restriction | None required for fragrance purchases |
| Order cancellation | No self-service cancellation — customer contacts support (WhatsApp) |
| Email verification | Not required — instant access after signup |
| Visual palette (revised) | Mauve/rose/blush with gold accents — replaces the earlier black-and-gold direction, per the homepage reference mockup |
| Homepage structure | Locked to the reference mockup's section layout (Section 7.3); copy is illustrative, not final; newsletter block dropped |
| Collections taxonomy | Added as a second, parallel browsing structure (scent-family) alongside the 7 confirmed categories |
