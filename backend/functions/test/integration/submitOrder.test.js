// Integration tests against the Firestore emulator. Not run by `npm test`
// (that only runs the dependency-free unit suite) — run these with:
//   npm run test:emulator
// which starts the emulator and points the Admin SDK at it via
// FIRESTORE_EMULATOR_HOST. Requires the Firebase Emulator Suite (Java 11+).
const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const admin = require("firebase-admin");
const { submitOrder } = require("../../src/submitOrder");
const { OrderValidationError } = require("../../src/validateOrder");

if (!admin.apps.length) {
  admin.initializeApp({ projectId: "demo-plasma-landing" });
}
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const baseInput = () => ({
  packageId: "plasma-complete",
  quantity: 1,
  fullName: "سارة أحمد",
  phone: "0791234567",
  governorate: "amman",
  areaAddress: "الدوار السابع، شارع الملكة رانيا",
  notes: "",
  language: "ar",
});

async function clearCollections() {
  for (const name of ["orders", "customers", "counters"]) {
    const snap = await db.collection(name).get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
  }
}

test.beforeEach(clearCollections);

test("creates an order and returns a human-readable order number", async () => {
  const result = await submitOrder({ db, FieldValue, input: baseInput(), idempotencyKey: randomUUID() });
  assert.equal(result.total, 30);
  assert.equal(result.deliveryFee, 0);
  assert.match(result.orderNumber, /^PLM-\d{6}$/);
  assert.equal(result.replay, false);
});

test("duo package total is 20 JOD end to end", async () => {
  const result = await submitOrder({
    db, FieldValue, input: { ...baseInput(), packageId: "plasma-duo" }, idempotencyKey: randomUUID(),
  });
  assert.equal(result.total, 20);
});

test("double-click / retry with the same idempotency key returns the same order, no duplicate", async () => {
  const key = randomUUID();
  const first = await submitOrder({ db, FieldValue, input: baseInput(), idempotencyKey: key });
  const second = await submitOrder({ db, FieldValue, input: baseInput(), idempotencyKey: key });
  assert.equal(first.orderNumber, second.orderNumber);
  assert.equal(second.replay, true);
  const ordersSnap = await db.collection("orders").get();
  assert.equal(ordersSnap.size, 1);
});

test("a repeat customer (same phone) updates totals instead of creating a duplicate customer", async () => {
  await submitOrder({ db, FieldValue, input: baseInput(), idempotencyKey: randomUUID() });
  await submitOrder({ db, FieldValue, input: { ...baseInput(), quantity: 2 }, idempotencyKey: randomUUID() });

  const customersSnap = await db.collection("customers").get();
  assert.equal(customersSnap.size, 1);
  const customer = customersSnap.docs[0].data();
  assert.equal(customer.totalOrders, 2);
  assert.equal(customer.totalValue, 30 + 60);
  assert.deepEqual(customer.interests, ["plasma-complete"]);
});

test("ordering both packages accumulates both interests without duplicates", async () => {
  await submitOrder({ db, FieldValue, input: baseInput(), idempotencyKey: randomUUID() });
  await submitOrder({ db, FieldValue, input: { ...baseInput(), packageId: "plasma-duo" }, idempotencyKey: randomUUID() });
  await submitOrder({ db, FieldValue, input: baseInput(), idempotencyKey: randomUUID() });

  const customersSnap = await db.collection("customers").get();
  const customer = customersSnap.docs[0].data();
  assert.deepEqual(customer.interests.sort(), ["plasma-complete", "plasma-duo"]);
  assert.equal(customer.totalOrders, 3);
});

test("rejects a manipulated price/total before ever touching Firestore", async () => {
  await assert.rejects(
    submitOrder({
      db, FieldValue,
      input: { ...baseInput(), unitPrice: 1, total: 1 },
      idempotencyKey: randomUUID(),
    }),
    OrderValidationError
  );
  const ordersSnap = await db.collection("orders").get();
  assert.equal(ordersSnap.size, 0);
});

test("stores deliveryIncluded: true and deliveryFee: 0 on the persisted order", async () => {
  const key = randomUUID();
  await submitOrder({ db, FieldValue, input: baseInput(), idempotencyKey: key });
  const doc = await db.collection("orders").doc(key).get();
  assert.equal(doc.data().deliveryIncluded, true);
  assert.equal(doc.data().deliveryFee, 0);
});
