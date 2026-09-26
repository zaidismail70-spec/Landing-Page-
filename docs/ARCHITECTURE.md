# Architecture

## Flow

```
Customer's browser (frontend/)
    │  selects a package, fills the form, clicks "Confirm order"
    ▼
Firebase Cloud Function: submitOrder (backend/functions)
    │  1. re-validates every field server-side (never trusts the browser)
    │  2. recomputes the total from the hardcoded catalog (30/20 JOD)
    │  3. writes the order + customer to Firestore in one transaction
    │     (this is the durable record — the checkout has now succeeded)
    ▼
Firestore: orders/{idempotencyKey}, customers/{normalizedPhone}
    │  order doc also carries the ERP sync outbox fields (integrationStatus, ...)
    ▼
submitOrder attempts the ERP sync inline, best-effort, HMAC-signed
    │  (if this fails, the order is already saved — nothing is lost)
    ▼
Betolla ERP: POST /api/orders/webhook (a separate Firebase project, Next.js + Supabase)
    │  1. verifies the HMAC signature + timestamp freshness
    │  2. rate-limits by client IP and in total
    │  3. re-validates every field again (never trusts the caller)
    │  4. calls business_create_order (existing RPC, unchanged) directly via the
    │     service-role Supabase client — no new migration was needed
    ▼
Supabase Postgres: customers, orders, order_items, inventory, inventory_movements
```

If the ERP call fails or times out, `submitOrder` still returns success to the
customer (Firestore already has the order). A scheduled function
(`retryErpSync`, every 10 minutes) sweeps orders with
`integrationStatus: "pending"` and retries them, using the same idempotency
key each time — the ERP's own `Idempotency-Key` check means a retry can never
create a duplicate order or customer there.

## Field mapping

| Landing page form | Firestore `orders/{id}` | ERP webhook payload | ERP (`business_create_order` / Postgres) |
|---|---|---|---|
| selected package | `packageId`, `packageNameAr/En`, `unitPrice`, `oldUnitPrice`, `includedProducts` | `packageId` | `items[0].name` (exact catalog name, migration 037), `items[0].price` |
| quantity | `quantity` | `quantity` | `items[0].qty` |
| full name | `fullName` | `fullName` | `customer_name` |
| phone | `normalizedPhone` (+9627XXXXXXXX) | `phone` | `customer_phone` (re-normalized to local 07XXXXXXXX) |
| governorate | `governorate` (slug), `governorateLabelAr` | `city` (always Arabic label) | `city` / `delivery_city` |
| area/address | `areaAddress` | `address` | `address` / `delivery_address` |
| notes | `notes` | `notes` | `installment_notes` / `orders.notes` |
| language | `language` | `language` | *(display-only, not persisted)* |
| — | `total`, `deliveryIncluded: true`, `deliveryFee: 0` | `total_amount` implied by package+qty | `total_amount`, `deliveryFee` forced to 0 server-side |
| — | `source: "plasma-landing-page"` | *(implicit — this endpoint only)* | `source: "plasma-landing-page"`, `status: "draft"` (no inventory deducted until a rep reviews and confirms it) |
| — | `idempotencyKey`, `externalOrderId` (same value) | `Idempotency-Key` header | `business_requests.request_key` (dedup key) |
| — | `integrationStatus`, `erpOrderId`, `erpOrderNumber`, `syncAttempts`, `lastSyncError`, `syncedAt` | *(response)* `orderId`, `orderNumber`, `total` | `orders.id` (db_id), `orders.order_number` (`BET-2026-00042`) |

The customer only ever sees the Landing Page's own `orderNumber` (e.g.
`PLM-000042`) — never the ERP's internal order number. "We will contact you
shortly" reflects that a human confirms the order afterward; the ERP number
exists for staff/reporting, not the customer-facing success message.

## Idempotency and retries

- The browser generates one `idempotencyKey` (a UUID) per checkout attempt and
  reuses it across retries (a failed submit, a slow connection) until a
  successful save.
- Firestore: the order document ID **is** the idempotency key
  (`orders/{idempotencyKey}`). A repeated `submitOrder` call with the same key
  returns the existing order instead of writing a second one.
- ERP: the same key is sent as `Idempotency-Key`, which becomes
  `business_create_order`'s `p_key`. The ERP's own `business_requests` table
  already deduplicates on `(operation, actor_id, request_key)` — this endpoint
  reuses that existing, already-tested mechanism rather than adding a second,
  parallel one.

## Security boundaries

- **Browser → Cloud Function**: Firebase's own callable-function transport
  (HTTPS + Firebase App SDK). App Check is wired in but left unenforced until
  a reCAPTCHA v3 site key is registered (see root README).
- **Browser → Firestore**: never allowed. `firestore.rules` is default-deny;
  every read/write goes through the Admin SDK inside Cloud Functions.
- **Cloud Function → ERP**: HMAC-SHA256 over `"<timestamp>.<raw body>"`
  (`backend/functions/src/erpSync.js` signs, `betolla-erp/lib/hmac.ts`
  verifies), header `X-Erp-Signature: t=<unix-ms>,v1=<hex>`. A signature older
  or newer than 5 minutes is rejected even if otherwise valid. The ERP also
  rate-limits this endpoint by client IP and in total.
- **ERP → Supabase**: the Next.js route uses the Supabase **service-role**
  key, held only in that project's server-side secret (never sent to a
  browser, never in this repository).
- **Secrets, never committed, never logged**: `ERP_SYNC_URL`,
  `ERP_SYNC_HMAC_SECRET` (this repo, Firebase Secret Manager);
  `ORDERS_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` (the ERP repo, its own
  hosting secrets).

## Why no new ERP migration

`business_create_order` already accepts everything this integration needs
(customer dedup by phone via `reuse_phone`, arbitrary `items[]` with an
explicit price, a `source` tag, idempotency via `p_key`). The two PLASMA
bundle products the landing page sells already exist in the product catalog
(migration `037_plasma_package_bundles.sql`). Reusing this exact RPC — the
same one every other order-creation path in the ERP calls — was preferred
over inventing a parallel code path or schema.
