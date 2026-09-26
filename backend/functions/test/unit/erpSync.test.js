const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { buildErpPayload, signRequest, syncOrderToErp, shouldRetry, MAX_ATTEMPTS } = require("../../src/erpSync");

const order = () => ({
  packageId: "plasma-complete",
  quantity: 1,
  fullName: "سارة أحمد",
  normalizedPhone: "+962791234567",
  governorateLabelAr: "عمّان",
  areaAddress: "الدوار السابع",
  notes: "",
  language: "ar",
  integrationStatus: "pending",
  syncAttempts: 0,
});

test("buildErpPayload maps the stored order to the ERP webhook's expected fields", () => {
  const payload = buildErpPayload(order());
  assert.deepEqual(payload, {
    packageId: "plasma-complete",
    quantity: 1,
    fullName: "سارة أحمد",
    phone: "+962791234567",
    city: "عمّان",
    address: "الدوار السابع",
    notes: "",
    language: "ar",
  });
});

test("signRequest produces a header the ERP's own HMAC scheme can verify (t=<ms>,v1=<hex>)", () => {
  const secret = "shared-secret";
  const rawBody = JSON.stringify({ a: 1 });
  const ts = 1234567890000;
  const header = signRequest(secret, rawBody, ts);
  assert.equal(header, `t=${ts},v1=${crypto.createHmac("sha256", secret).update(`${ts}.${rawBody}`).digest("hex")}`);
});

test("signRequest changes the signature if the body changes", () => {
  const secret = "shared-secret";
  const ts = 1234567890000;
  const sig1 = signRequest(secret, JSON.stringify({ a: 1 }), ts);
  const sig2 = signRequest(secret, JSON.stringify({ a: 2 }), ts);
  assert.notEqual(sig1, sig2);
});

test("shouldRetry is true for a pending order under the attempt limit", () => {
  assert.equal(shouldRetry(order()), true);
});

test("shouldRetry is false once already synced", () => {
  assert.equal(shouldRetry({ ...order(), integrationStatus: "synced" }), false);
});

test("shouldRetry is false once the attempt limit is reached", () => {
  assert.equal(shouldRetry({ ...order(), syncAttempts: MAX_ATTEMPTS }), false);
});

test("syncOrderToErp signs the request and returns synced:true on a successful response", async () => {
  let capturedHeaders;
  const fetchImpl = async (url, opts) => {
    capturedHeaders = opts.headers;
    return { ok: true, status: 201, json: async () => ({ success: true, orderId: "uuid-1", orderNumber: "BET-2026-00042", total: 30 }) };
  };
  const result = await syncOrderToErp({ order: order(), idempotencyKey: "k1", webhookUrl: "https://erp.example/api/orders/webhook", webhookSecret: "s", fetchImpl });
  assert.equal(result.synced, true);
  assert.equal(result.erpOrderId, "uuid-1");
  assert.equal(result.erpOrderNumber, "BET-2026-00042");
  assert.match(capturedHeaders["X-Erp-Signature"], /^t=\d+,v1=[0-9a-f]{64}$/);
  assert.equal(capturedHeaders["Idempotency-Key"], "k1");
});

test("syncOrderToErp returns synced:false with the ERP's error message on a rejected order", async () => {
  const fetchImpl = async () => ({ ok: false, status: 400, json: async () => ({ success: false, error: "الكمية غير صحيحة." }) });
  const result = await syncOrderToErp({ order: order(), idempotencyKey: "k1", webhookUrl: "https://erp.example/api/orders/webhook", webhookSecret: "s", fetchImpl });
  assert.equal(result.synced, false);
  assert.equal(result.error, "الكمية غير صحيحة.");
});

test("syncOrderToErp returns synced:false (never throws) on a network failure", async () => {
  const fetchImpl = async () => { throw new Error("network down"); };
  const result = await syncOrderToErp({ order: order(), idempotencyKey: "k1", webhookUrl: "https://erp.example/api/orders/webhook", webhookSecret: "s", fetchImpl });
  assert.equal(result.synced, false);
  assert.equal(result.error, "network down");
});

test("syncOrderToErp refuses to call out with missing configuration instead of throwing", async () => {
  const result = await syncOrderToErp({ order: order(), idempotencyKey: "k1", webhookUrl: "", webhookSecret: "" });
  assert.equal(result.synced, false);
  assert.equal(result.error, "erp-sync-not-configured");
});
