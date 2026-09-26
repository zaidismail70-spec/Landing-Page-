# Betolla PLASMA Landing Page

A focused, mobile-first, bilingual (Arabic/English) checkout page for Betolla's
PLASMA hair-care sets. A customer picks one of two packages, fills a short
delivery form, and confirms — no WhatsApp redirect. The order is saved
durably in Firestore and synced automatically to Betolla ERP.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full data-flow
diagram, field-by-field mapping, and security boundaries.

## Directory structure

```
frontend/            static site — this is what Firebase Hosting serves
  index.html
  css/styles.css
  js/script.js
  assets/             product photos, logo, favicons
  robots.txt
backend/
  functions/          Firebase Cloud Functions (Node 20)
    index.js            submitOrder (callable) + retryErpSync (scheduled)
    src/
      catalog.js          hardcoded package prices, governorates
      phone.js            Jordanian phone normalization
      validateOrder.js    server-side validation, never trusts the browser
      submitOrder.js      Firestore transaction (order + customer + outbox)
      erpSync.js          HMAC-signed sync to Betolla ERP, retry-eligibility
    test/
      unit/               dependency-free (`npm test`)
      integration/        needs the Firestore emulator (Java)
scripts/              private admin tooling — never deployed, never public
  export-csv.js         orders/customers → CSV (UTF-8 BOM), run locally only
tests/
  firestore.rules.test.js   needs the Firestore emulator (Java)
docs/
  ARCHITECTURE.md
firebase.json, .firebaserc, firestore.rules, firestore.indexes.json
```

`frontend/` and `backend/functions/` are independently deployable units of
the *same* Firebase project (`landing-page-6baab`) — Hosting serves the
former, Cloud Functions run the latter. They are not separate apps.

## Local setup (Windows PowerShell)

Required tools:

| Tool | Version used in development | Check |
|---|---|---|
| Node.js | 20+ (functions run on the Node 20 Cloud Functions runtime) | `node --version` |
| Firebase CLI | 15+ | `firebase --version` |
| Java | 11+ (Firestore emulator only — not needed for the static preview or unit tests) | `java -version` |
| Supabase CLI | only needed if you work on the ERP side directly | `supabase --version` |

```powershell
# Install Cloud Functions dependencies
cd backend\functions
npm install
cd ..\..
```

### Local preview (frontend only, no backend)

The frontend is plain HTML/CSS/JS with no build step. Serve `frontend/` with
any static file server, e.g.:

```powershell
npx http-server frontend -p 8080
```

Then open `http://localhost:8080/?lang=ar` or `?lang=en`. With no deployed
Cloud Function, package selection/pricing/validation all work; submitting the
form will show the bilingual "couldn't save" error (expected — there's no
`submitOrder` to call locally without the emulator below).

### Full local preview (frontend + Cloud Functions emulator)

```powershell
firebase emulators:start --only functions,firestore,hosting
```

This serves `frontend/` on the Hosting emulator port and runs `submitOrder`/
`retryErpSync` against the Firestore emulator. `js/script.js` already detects
`localhost`/`127.0.0.1` and points the Functions SDK at the emulator
automatically — no code change needed to switch between local and
production.

## Tests

```powershell
# Unit tests (no Java, no emulator, no network — fast)
cd backend\functions
npm run test:unit

# Integration tests against the Firestore emulator (needs Java 11+)
npm run test:emulator

# Firestore security-rules tests (needs Java 11+ and @firebase/rules-unit-testing)
cd ..\..
npm install --no-save @firebase/rules-unit-testing
firebase emulators:exec --only firestore "node --test tests/firestore.rules.test.js"
```

Browser/responsive verification (360/375/390/412/768/1440px, both languages)
was done with Playwright driving a locally installed Chrome — see the commit
history for the exact script; it isn't checked into this repo as it's a
one-off verification tool, not a maintained suite.

## Pricing and delivery

Hardcoded server-side in `backend/functions/src/catalog.js` — the browser's
displayed price is never trusted:

| Package | Old price | Checkout price | Delivery |
|---|---|---|---|
| بكج بلازما الكامل / PLASMA Complete | 40 JOD | **30 JOD** | included, `deliveryFee: 0` |
| بكج بلازما الثنائي / PLASMA Duo | 25 JOD | **20 JOD** | included, `deliveryFee: 0` |

Total = checkout price × quantity. There is no separate delivery line item
anywhere (UI, Firestore, or the ERP order) — it never existed as 3 JOD and
must not be reintroduced.

## Checkout flow

1. Customer selects a package (one tap, obvious selected state) and a
   quantity, fills name/phone/governorate/address/notes.
2. Client-side validation mirrors the server's (for instant feedback), but
   the server re-validates everything independently.
3. `submitOrder` (Cloud Function): re-validates, recomputes the total from
   the catalog, writes the order + customer to Firestore in one transaction,
   then attempts the ERP sync inline (best-effort, see below).
4. On success, the page shows the confirmation in place — no redirect:

   > تم استلام طلبك بنجاح
   > رقم طلبك: PLM-000042
   > سنتواصل معك قريبًا لتأكيد الطلب.

   (English: "Your order has been received successfully. / Order number:
   PLM-000042 / We will contact you shortly to confirm your order.")

## Firestore outbox and ERP retry behavior

Every order document (`orders/{idempotencyKey}`) carries its own ERP-sync
outbox:

| Field | Meaning |
|---|---|
| `integrationStatus` | `pending` \| `synced` \| `failed` |
| `externalOrderId` | this app's own correlation id (= the idempotency key) |
| `erpOrderId` / `erpOrderNumber` | filled in once the ERP confirms |
| `syncAttempts` | incremented on every retry |
| `lastSyncError` | the ERP's (or network's) last error message |
| `syncedAt` | server timestamp of the successful sync |

If the inline sync attempt in `submitOrder` fails (ERP briefly unreachable, a
redeploy, a timeout), the order stays `pending` — the customer's own
checkout has already succeeded (Firestore write). The scheduled function
`retryErpSync` runs every 10 minutes, retries anything still `pending` (up to
8 attempts, after which it's marked `failed` for manual follow-up), and never
creates a duplicate — see [Idempotency](docs/ARCHITECTURE.md#idempotency-and-retries).

## Excel/CSV export

`scripts/export-csv.js` is a private, local-only admin tool (never deployed,
never reachable from the public site):

```powershell
cd scripts
npm install
node export-csv.js --collection=orders --key=C:\path\to\serviceAccountKey.json
node export-csv.js --collection=customers --key=C:\path\to\serviceAccountKey.json --from=2026-01-01 --to=2026-01-31
```

Output is UTF-8 with a BOM so Arabic text opens correctly in Excel. Never
commit the service-account key or any exported CSV (both are covered by
`.gitignore`).

Landing-page orders also flow into the **ERP's own** existing finance/CSV
exports automatically — no separate export was built there. They're tagged
`source: "landing_page"` in the ERP's `orders` table, so they're
distinguishable from rep-entered or WhatsApp-derived orders in every report.

## Secrets (names only — values are never in this repo)

| Secret | Where it lives | Purpose |
|---|---|---|
| `ERP_SYNC_URL` | Firebase Secret Manager (this project) | the ERP's order-webhook URL |
| `ERP_SYNC_HMAC_SECRET` | Firebase Secret Manager (this project) | HMAC key for signing requests to the ERP |
| `ORDERS_WEBHOOK_SECRET` | the ERP's own hosting secrets (same value as above) | HMAC key the ERP verifies incoming requests against |
| `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` | the ERP repo only | never touched or referenced from this repo |
| App Check reCAPTCHA v3 site key | not yet registered | see the commented-out block in `frontend/js/script.js` |

## Deployment

**Classic Firebase Hosting + Cloud Functions only.** Firebase App Hosting
must never be created or used for this project — Hosting must serve
`frontend/` as a plain static site.

```powershell
firebase deploy --only hosting,functions,firestore:rules,firestore:indexes --project landing-page-6baab
```

Before deploying, set the two Functions secrets once (values are prompted
interactively, never passed as CLI arguments or printed):

```powershell
firebase functions:secrets:set ERP_SYNC_URL --project landing-page-6baab
firebase functions:secrets:set ERP_SYNC_HMAC_SECRET --project landing-page-6baab
```

Confirm after deploying:
- `https://landing-page-6baab.web.app/` shows the real landing page (not a
  directory listing, not a Firebase default page, not an App Hosting
  backend).
- `?lang=ar` and `?lang=en` both work.
- The submit button calls the deployed Cloud Function, not `localhost`.

### Netlify

This repository's `netlify.toml` is **stale/unused** — Firebase Hosting is
the only real production target. It publishes from the repository root
(`publish = "."`), which no longer matches this repo's layout
(`frontend/`). It was intentionally left unmodified rather than "fixed",
since Netlify is not live for this project; if that ever changes, update
`netlify.toml`'s `publish` path to `frontend` before relying on it again.

## Troubleshooting

- **"WhatsApp didn't open" / any WhatsApp-related behavior** — there is none
  left in the checkout flow by design. If you see it, you're looking at a
  stale deploy or a cached page; the footer's WhatsApp *contact* icon is
  unrelated and intentional.
- **Submit always fails locally** — expected without the emulator or a
  deployed Cloud Function; see "Local preview" above.
- **iOS zoom on tapping a field** — check `frontend/css/styles.css` inputs
  are still `font-size: 16px`; iOS auto-zooms below that.
- **Firestore emulator tests won't run** — needs a real Java 11+ install;
  there is no workaround, and the pure unit tests (`npm run test:unit`) don't
  need it.
- **ERP order never shows an `erpOrderNumber`** — check `integrationStatus`
  on the Firestore order doc. `pending` means `retryErpSync` hasn't
  succeeded yet (check `lastSyncError`); `failed` means it exhausted 8
  attempts and needs manual attention.
