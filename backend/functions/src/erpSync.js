// Syncs a confirmed landing-page order to Betolla ERP (a separate system: Next.js + Supabase,
// see betolla-erp/app/api/orders/webhook). Never fails the customer's checkout: Firestore is
// this app's own source of truth, ERP sync is best-effort with a background retry queue.
const crypto = require("node:crypto");

const MAX_ATTEMPTS = 8;
const TIMEOUT_MS = 8000;

// The ERP's own catalog validation is authoritative there too — this just needs to name the
// right package; the ERP recomputes/re-validates everything server-side, same as this app does
// for the browser.
function buildErpPayload(order) {
  return {
    packageId: order.packageId,
    quantity: order.quantity,
    fullName: order.fullName,
    phone: order.normalizedPhone,
    city: order.governorateLabelAr,
    address: order.areaAddress,
    notes: order.notes,
    language: order.language,
  };
}

// Same scheme the ERP verifies (betolla-erp/lib/hmac.ts): "t=<unix-ms>,v1=<hex hmac-sha256(secret,
// "<t>.<rawBody>")>". Signing the exact raw body string (not a re-serialization of the object)
// matters — the ERP verifies against these exact bytes.
function signRequest(secret, rawBody, timestamp = Date.now()) {
  const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

// `fetchImpl` is injectable for tests; production uses the Node 20 runtime's global fetch.
async function syncOrderToErp({ order, idempotencyKey, webhookUrl, webhookSecret, fetchImpl = fetch, timeoutMs = TIMEOUT_MS }) {
  if (!webhookUrl || !webhookSecret) {
    return { synced: false, error: "erp-sync-not-configured" };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const rawBody = JSON.stringify(buildErpPayload(order));
    const res = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Erp-Signature": signRequest(webhookSecret, rawBody),
        "Idempotency-Key": idempotencyKey,
      },
      body: rawBody,
      signal: controller.signal,
    });
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      // fall through with data=null; handled below
    }
    if (!res.ok || !data || data.success !== true) {
      const message = (data && data.error) || `HTTP ${res.status}`;
      return { synced: false, error: message };
    }
    return { synced: true, erpOrderId: data.orderId, erpOrderNumber: data.orderNumber, erpTotal: data.total };
  } catch (err) {
    return { synced: false, error: err && err.message ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

function shouldRetry(order) {
  if (!order) return false;
  if (order.integrationStatus === "synced") return false;
  return (order.syncAttempts || 0) < MAX_ATTEMPTS;
}

module.exports = { buildErpPayload, signRequest, syncOrderToErp, shouldRetry, MAX_ATTEMPTS };
