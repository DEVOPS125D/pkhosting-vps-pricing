# PKHosting Audit & Engineering Trade-offs

## 1. Six Observations on Live `https://www.pkhosting.com` Pricing Section

1. **Currency Switcher Selector (Header / Pricing Bar):**
   - **Consequence:** Switching currencies on the live site triggers a page reload or WHMCS session re-query rather than updating prices instantaneously in-place, creating latency and resetting scroll context while comparing plans across PKR and USD.
2. **Billing Cycle Selector / Multi-Year Default Term:**
   - **Consequence:** Displaying longer multi-year promotional rates upfront lowers the advertised starting price, but buyers expecting monthly or 12-month billing only encounter the higher short-term rate or large upfront multi-year invoice later in checkout.
3. **Pricing Card CTA Buttons & Visual Hierarchy:**
   - **Consequence:** Plan cards share similar visual weight and dense specification lists, making it harder on a quick scan to identify which tier offers the best price-to-performance balance for typical production workloads.
4. **Feature Comparison Grid on Narrow Viewports (360px):**
   - **Consequence:** Multi-column plan comparisons either collapse into long vertical stacks—forcing mobile users to scroll repeatedly back up to check which tier they are reading—or risk page-level horizontal overflow without an isolated scroll container.
5. **External Assets, Fonts & Third-Party Scripts:**
   - **Consequence:** Relying on external stylesheets, icon fonts, chat widgets, and remote logo URLs increases HTTP request count and payload size, slowing initial paint on Pakistani mobile networks and breaking UI elements offline.
6. **Footer Payment Methods Strip (8 Payment Logos):**
   - **Consequence:** Listing eight payment gateways—including international or niche options alongside local rails—adds visual clutter and creates ambiguity for Pakistani VPS buyers who primarily rely on local bank transfers and mobile wallets.

---

## 2. Engineering Trade-offs

### A. State Persistence (`localStorage` vs. URL Query Params / Cookies)
- **Choice Made:** Persisted selected billing period (`monthly` / `annually`) and currency (`PKR` / `USD` / `GBP`) in `window.localStorage` wrapped inside `try/catch` blocks.
- **Why `localStorage`:** Keeps URLs clean (`index.html`), requires zero server headers (works offline over `file://`), and survives full page reloads seamlessly.
- **Trade-off Accepted:** Unlike URL query parameters (`?billing=annually&currency=USD`), `localStorage` state cannot be shared via a copied link to another device, and strict browser privacy settings on `file://` origins can block storage access—which is why `try/catch` safely falls back to in-memory defaults (`Monthly` + `PKR`) without throwing console errors.

### B. Payment Methods Selection (Keeping 4 out of PKHosting's 8)
PKHosting's live site lists eight payment methods to cover legacy and international shared-hosting customers. For a **Pakistani VPS buyer**, I narrowed the footer to **4 high-trust, locally actionable methods** rendered with self-contained inline SVGs:
1. **Raast / IBFT Bank Transfer (Kept):** Zero-fee, instant 24/7 interbank settlement in Pakistan; preferred by agencies and businesses paying larger annual VPS invoices (Rs 24,000–Rs 195,000).
2. **JazzCash (Kept):** Essential mobile wallet coverage for solo developers and freelancers paying monthly Starter or Growth plans without a credit card.
3. **Easypaisa (Kept):** Second dominant Pakistani mobile wallet, ensuring broad wallet coverage across Pakistan.
4. **Visa / Mastercard (Kept):** Supports Pakistani bank debit/credit cards (with e-commerce session enabled) as well as overseas Pakistani founders paying in USD or GBP.

**Dropped Methods & Why:**
- **PayPal:** Not officially supported for Pakistani domestic accounts; displaying it misleads local buyers and causes checkout drop-offs.
- **Skrill / Payoneer / Perfect Money / Crypto:** High FX conversion friction, regulatory uncertainty in Pakistan, or declining relevance compared to instant Raast/IBFT and local wallets. Removing these four reduces footer clutter and builds immediate local trust.