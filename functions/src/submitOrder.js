const { validateOrder, OrderValidationError } = require("./validateOrder");

const ORDER_NUMBER_PREFIX = "PLM";

function formatOrderNumber(seq) {
  return `${ORDER_NUMBER_PREFIX}-${String(seq).padStart(6, "0")}`;
}

function customerIdFromPhone(normalizedPhone) {
  return normalizedPhone.replace(/^\+/, "");
}

// Core order-submission logic, isolated from the onCall wrapper so it can be
// unit/integration tested without deploying or invoking through the SDK.
// `db` is a Firestore instance (production or emulator), `FieldValue` is
// admin.firestore.FieldValue.
async function submitOrder({ db, FieldValue, input, idempotencyKey }) {
  if (typeof idempotencyKey !== "string" || idempotencyKey.length < 8 || idempotencyKey.length > 128) {
    throw new OrderValidationError("invalid-idempotency-key", "طلب غير صالح، حاولي مرة أخرى.", "Invalid request, please try again.");
  }

  const validated = validateOrder(input);
  const customerId = customerIdFromPhone(validated.normalizedPhone);

  const orderRef = db.collection("orders").doc(idempotencyKey);
  const customerRef = db.collection("customers").doc(customerId);
  const counterRef = db.collection("counters").doc("orders");

  const result = await db.runTransaction(async (txn) => {
    const existingOrderSnap = await txn.get(orderRef);
    if (existingOrderSnap.exists) {
      const existing = existingOrderSnap.data();
      return {
        orderId: existingOrderSnap.id,
        orderNumber: existing.orderNumber,
        total: existing.total,
        deliveryIncluded: true,
        deliveryFee: 0,
        replay: true,
      };
    }

    const [counterSnap, customerSnap] = await Promise.all([txn.get(counterRef), txn.get(customerRef)]);

    const nextSeq = (counterSnap.exists ? counterSnap.data().count : 0) + 1;
    const orderNumber = formatOrderNumber(nextSeq);
    const now = FieldValue.serverTimestamp();

    txn.set(orderRef, {
      orderId: idempotencyKey,
      orderNumber,
      customerId,
      fullName: validated.fullName,
      normalizedPhone: validated.normalizedPhone,
      governorate: validated.governorate,
      areaAddress: validated.areaAddress,
      packageId: validated.packageId,
      packageNameAr: validated.packageNameAr,
      packageNameEn: validated.packageNameEn,
      includedProducts: validated.includedProducts,
      quantity: validated.quantity,
      unitPrice: validated.unitPrice,
      oldUnitPrice: validated.oldUnitPrice,
      deliveryIncluded: true,
      deliveryFee: 0,
      total: validated.total,
      notes: validated.notes,
      language: validated.language,
      source: "plasma-landing-page",
      status: "new",
      createdAt: now,
      idempotencyKey,
    });

    txn.set(counterRef, { count: nextSeq }, { merge: true });

    const customerExists = customerSnap.exists;
    const priorTotalOrders = customerExists ? customerSnap.data().totalOrders || 0 : 0;
    const priorTotalValue = customerExists ? customerSnap.data().totalValue || 0 : 0;
    const priorInterests = customerExists ? customerSnap.data().interests || [] : [];
    const interests = priorInterests.includes(validated.packageId)
      ? priorInterests
      : [...priorInterests, validated.packageId];

    txn.set(
      customerRef,
      {
        customerId,
        fullName: validated.fullName,
        normalizedPhone: validated.normalizedPhone,
        governorate: validated.governorate,
        areaAddress: validated.areaAddress,
        interests,
        preferredLanguage: validated.language,
        firstOrderAt: customerExists ? customerSnap.data().firstOrderAt : now,
        lastOrderAt: now,
        totalOrders: priorTotalOrders + 1,
        totalValue: priorTotalValue + validated.total,
        createdAt: customerExists ? customerSnap.data().createdAt : now,
        updatedAt: now,
      },
      { merge: true }
    );

    return {
      orderId: idempotencyKey,
      orderNumber,
      total: validated.total,
      deliveryIncluded: true,
      deliveryFee: 0,
      replay: false,
    };
  });

  return result;
}

module.exports = { submitOrder, formatOrderNumber, customerIdFromPhone };
