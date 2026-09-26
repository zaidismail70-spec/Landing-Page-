const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { submitOrder } = require("./src/submitOrder");
const { OrderValidationError } = require("./src/validateOrder");
const { syncOrderToErp, shouldRetry, MAX_ATTEMPTS } = require("./src/erpSync");

admin.initializeApp();
// Co-located with the Firestore database (me-central1, Doha) to minimize read/write latency.
setGlobalOptions({ region: "me-central1", maxInstances: 10 });

const APP_CHECK_ENFORCED = process.env.APP_CHECK_ENFORCED === "true";

// Betolla ERP's order-intake webhook (a separate Firebase project — Next.js + Supabase). Secrets,
// never plain env vars, and never referenced from any client-side code. ERP_SYNC_HMAC_SECRET is
// the shared HMAC key the ERP's ORDERS_WEBHOOK_SECRET verifies against (functions/src/erpSync.js
// signs; betolla-erp/lib/hmac.ts verifies) — same value, independent names on each side.
const ERP_SYNC_URL = defineSecret("ERP_SYNC_URL");
const ERP_SYNC_HMAC_SECRET = defineSecret("ERP_SYNC_HMAC_SECRET");

// Attempts the ERP sync and writes the result back onto the order doc. Never throws — a failed
// sync leaves the order queued for retryErpSync below; the customer's own checkout already
// succeeded (the Firestore write) regardless of whether this succeeds.
async function attemptErpSync({ FieldValue, orderRef, order, idempotencyKey }) {
  const result = await syncOrderToErp({
    order,
    idempotencyKey,
    webhookUrl: ERP_SYNC_URL.value(),
    webhookSecret: ERP_SYNC_HMAC_SECRET.value(),
  });
  const now = FieldValue.serverTimestamp();
  if (result.synced) {
    await orderRef.update({
      integrationStatus: "synced",
      erpOrderId: result.erpOrderId || null,
      erpOrderNumber: result.erpOrderNumber,
      syncedAt: now,
      lastSyncError: null,
    });
    return { synced: true, erpOrderNumber: result.erpOrderNumber };
  }
  const attempts = (order.syncAttempts || 0) + 1;
  await orderRef.update({
    integrationStatus: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
    syncAttempts: attempts,
    lastSyncError: result.error,
    erpLastAttemptAt: now,
  });
  return { synced: false, error: result.error };
}

exports.submitOrder = onCall(
  { enforceAppCheck: APP_CHECK_ENFORCED, secrets: [ERP_SYNC_URL, ERP_SYNC_HMAC_SECRET] },
  async (request) => {
    const idempotencyKey = request.data && request.data.idempotencyKey;
    const db = admin.firestore();
    try {
      const result = await submitOrder({
        db,
        FieldValue: admin.firestore.FieldValue,
        input: request.data,
        idempotencyKey,
      });

      let erpOrderNumber = result.orderData ? result.orderData.erpOrderNumber : null;
      if (!(result.orderData && result.orderData.integrationStatus === "synced")) {
        const orderRef = db.collection("orders").doc(result.orderId);
        const syncResult = await attemptErpSync({
          FieldValue: admin.firestore.FieldValue,
          orderRef,
          order: result.orderData,
          idempotencyKey: result.orderId, // orders are keyed by the same idempotency key
        });
        if (syncResult.synced) erpOrderNumber = syncResult.erpOrderNumber;
      }

      // Only the safe subset the browser needs — never customer records, and never the ERP's own
      // order number (the customer only ever sees this app's own order number; see script.js).
      return {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        total: result.total,
        deliveryIncluded: result.deliveryIncluded,
        deliveryFee: result.deliveryFee,
      };
    } catch (err) {
      if (err instanceof OrderValidationError) {
        throw new HttpsError("invalid-argument", err.code, { messageAr: err.messageAr, messageEn: err.messageEn });
      }
      console.error("submitOrder failed", err);
      throw new HttpsError("internal", "order-save-failed", {
        messageAr: "تعذر حفظ الطلب، الرجاء المحاولة مرة أخرى.",
        messageEn: "We couldn't save your order, please try again.",
      });
    }
  }
);

// Sweeps orders whose ERP sync is still pending (the synchronous attempt in submitOrder failed —
// the ERP was briefly unreachable, redeploying, etc.) and retries them. Safe to run as often as
// needed: the ERP's own idempotency key (the same one used for the Firestore doc) guarantees a
// retried sync never creates a duplicate order there.
exports.retryErpSync = onSchedule(
  { schedule: "every 10 minutes", secrets: [ERP_SYNC_URL, ERP_SYNC_HMAC_SECRET] },
  async () => {
    const db = admin.firestore();
    const pendingSnap = await db.collection("orders").where("integrationStatus", "==", "pending").limit(50).get();
    for (const doc of pendingSnap.docs) {
      const order = doc.data();
      if (!shouldRetry(order)) continue;
      try {
        await attemptErpSync({
          FieldValue: admin.firestore.FieldValue,
          orderRef: doc.ref,
          order,
          idempotencyKey: doc.id,
        });
      } catch (err) {
        console.error(`retryErpSync failed for order ${doc.id}`, err);
      }
    }
  }
);
