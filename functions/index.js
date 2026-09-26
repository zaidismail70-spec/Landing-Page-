const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { submitOrder } = require("./src/submitOrder");
const { OrderValidationError } = require("./src/validateOrder");

admin.initializeApp();
setGlobalOptions({ region: "us-central1", maxInstances: 10 });

const APP_CHECK_ENFORCED = process.env.APP_CHECK_ENFORCED === "true";

exports.submitOrder = onCall({ enforceAppCheck: APP_CHECK_ENFORCED }, async (request) => {
  const idempotencyKey = request.data && request.data.idempotencyKey;
  try {
    const result = await submitOrder({
      db: admin.firestore(),
      FieldValue: admin.firestore.FieldValue,
      input: request.data,
      idempotencyKey,
    });
    // Only the safe subset the browser needs — never customer records.
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
});
