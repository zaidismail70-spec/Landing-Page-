// Firestore Security Rules tests. Not run automatically — these need the
// Firebase Emulator Suite (Java 11+) and @firebase/rules-unit-testing:
//   npm install --no-save @firebase/rules-unit-testing
//   firebase emulators:exec --only firestore "node --test test/firestore.rules.test.js"
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { initializeTestEnvironment, assertFails, assertSucceeds } = require("@firebase/rules-unit-testing");

let testEnv;

test.before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-plasma-landing",
    firestore: {
      rules: fs.readFileSync(path.join(__dirname, "..", "firestore.rules"), "utf8"),
    },
  });
});

test.after(async () => {
  if (testEnv) await testEnv.cleanup();
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();
});

test("anonymous client cannot read the customers collection", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(db.collection("customers").doc("962791234567").get());
});

test("anonymous client cannot read the orders collection", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(db.collection("orders").doc("some-order").get());
});

test("anonymous client cannot list orders", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(db.collection("orders").get());
});

test("anonymous client cannot write a customer record", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(db.collection("customers").doc("962791234567").set({ fullName: "test" }));
});

test("anonymous client cannot write an order record (e.g. to fake a free order)", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(
    db.collection("orders").doc("fake-order").set({ packageId: "plasma-complete", total: 0, deliveryFee: 0 })
  );
});

test("an authenticated (but non-admin) client is still denied", async () => {
  const db = testEnv.authenticatedContext("some-user-uid").firestore();
  await assertFails(db.collection("orders").get());
  await assertFails(db.collection("customers").doc("962791234567").get());
});

test("Admin SDK access (used by the Cloud Function) bypasses rules and succeeds", async () => {
  const adminDb = testEnv.withSecurityRulesDisabled((ctx) => ctx.firestore());
  await assertSucceeds(adminDb.collection("orders").doc("admin-check").set({ status: "new" }));
});
