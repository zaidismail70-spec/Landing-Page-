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

## Before/after comparison (hero)

An accessible, draggable before/after comparison sits in the hero, below the
headline — `frontend/js/script.js`'s `initCompareSlider()`, styled by the
`.ba-*` rules in `frontend/css/styles.css`. Mouse drag, touch drag, and
arrow-key operation are all supported (Pointer Events cover mouse+touch in
one implementation); `Home`/`End` always jump to the minimum/maximum value,
and `ArrowLeft`/`ArrowRight` move the handle in the direction they visually
point (which means decreasing the value for `ArrowRight` in RTL — the
WAI-ARIA APG slider pattern). Labels are pinned to each panel's own logical
reveal side (`inset-inline-start`/`end`), not centered on the frame, so they
never end up on top of each other regardless of direction or handle
position.

**Missing assets:** the two panels currently render as clean placeholder
gradients, not photos — no approved before/after images exist in this
repository. Before relying on this section for real marketing, supply:
1. **Before** — curly/frizzy/less-managed hair
2. **After** — smoother, healthy-looking hair, the *same model* as (1)

Drop both into `frontend/assets/`, then in `frontend/index.html` replace the
`.ba-after`/`.ba-before` `<div>` backgrounds with `<img>` tags pointing at
them (keep the existing `.ba-tag` label spans as children).

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
`source: "plasma-landing-page"` in the ERP's `orders` table (status `draft`
until a rep reviews and confirms — see below), so they're distinguishable
from rep-entered or WhatsApp-derived orders in every report.

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

**Firebase Hosting is the only production target — Netlify is not
production.** That said, Netlify is still an **actively connected**
integration on this repo (it builds a deploy preview for every PR); its
`netlify.toml` publishes from the repository root (`publish = "."`), which
no longer matches this repo's layout (`frontend/`) since the reorganization,
so its preview builds are likely serving a stale/empty result now.
`netlify.toml` was intentionally left unmodified per instructions (never
touch Netlify config) rather than "fixed" — if Netlify previews are ever
needed again, update `netlify.toml`'s `publish` path to `frontend` first.

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
- **Local preview command not found (`http-server`, `python`, etc.)** — any
  static file server works; e.g. `npx http-server frontend -p 8080` needs
  only Node (already required), no Python install.
- **Port already in use** — pick a different `-p` port for the static
  server, or for the emulator suite pass `--only functions,firestore,hosting`
  with the ports already set in `firebase.json`'s `emulators` block.
- **Firebase CLI login/auth errors** — `firebase login --reauth`; confirm
  `firebase use landing-page-6baab` afterward.
- **"Firestore database does not exist"** — a brand-new Firebase project has
  no Firestore database until one is created once, by hand, in the Console
  (Build → Firestore Database → Create database) — this is a permanent
  location choice, never automated. This project's is `me-central1`.
- **Functions region mismatch (calls silently 404)** — the Cloud Functions
  SDK defaults to `us-central1`. This project's functions are deployed to
  `me-central1`; `frontend/js/script.js`'s `getFunctions(firebaseApp, "me-central1")`
  call must match `backend/functions/index.js`'s `setGlobalOptions({ region: ... })`
  exactly, or every `submitOrder` call fails to resolve.
- **Missing secret metadata** — `firebase functions:secrets:get <NAME>
  --project landing-page-6baab` shows version/state only, never the value;
  if it 404s, the secret was never set (`firebase functions:secrets:set
  <NAME> --project landing-page-6baab`).
- **Callable function CORS/region errors in the browser console** — almost
  always the region mismatch above, not a real CORS misconfiguration; check
  the region first before touching CORS settings.
- **ERP rejects with "invalid or expired signature"** — either the shared
  secret differs between `ERP_SYNC_HMAC_SECRET` (this project) and
  `ORDERS_WEBHOOK_SECRET` (the ERP project) — they must hold the *same*
  value — or the two systems' clocks disagree by more than 5 minutes (the
  HMAC signature includes a timestamp and rejects anything outside that
  window).
- **ERP temporarily unavailable** — by design this never loses the order:
  it's already durably saved in Firestore before the ERP is ever contacted.
  `integrationStatus` stays `pending` and `retryErpSync` (every 10 minutes)
  retries automatically; no customer-visible impact.
- **Idempotent retry looks like nothing happened** — that's correct. A
  repeated `submitOrder` call (or ERP sync retry) with the same idempotency
  key returns the *original* order/result rather than creating a new one; if
  you need a genuinely new order, the client must generate a new key.
- **GitHub push protection / PR ruleset blocks a merge or direct push** — this
  repo's ruleset requires an approving review from someone other than the
  last pusher; check `gh api repos/<owner>/<repo>/rules/branches/main` for
  the exact active rule, and either submit a review from a different GitHub
  identity or have the repo owner merge directly.
- **Mobile browser shows an old cached version** — Hosting deploys are
  immediate, but mobile browsers (especially iOS Safari) can hold onto a
  cached page aggressively; hard-refresh or clear the site's cache, or
  append a cache-busting query string while testing.
