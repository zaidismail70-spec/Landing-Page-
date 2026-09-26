const test = require("node:test");
const assert = require("node:assert/strict");
const { validateOrder, OrderValidationError } = require("../../src/validateOrder");

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

test("complete package x1 totals exactly 30 JOD, delivery included, fee 0", () => {
  const out = validateOrder(baseInput());
  assert.equal(out.total, 30);
  assert.equal(out.deliveryFee, 0);
  assert.equal(out.deliveryIncluded, true);
});

test("duo package x1 totals exactly 20 JOD", () => {
  const out = validateOrder({ ...baseInput(), packageId: "plasma-duo" });
  assert.equal(out.total, 20);
  assert.equal(out.deliveryFee, 0);
});

test("complete package x2 totals exactly 60 JOD (no extra delivery)", () => {
  const out = validateOrder({ ...baseInput(), quantity: 2 });
  assert.equal(out.total, 60);
});

test("duo package x2 totals exactly 40 JOD (no extra delivery)", () => {
  const out = validateOrder({ ...baseInput(), packageId: "plasma-duo", quantity: 2 });
  assert.equal(out.total, 40);
});

test("never adds the old 3 JOD delivery charge regardless of quantity", () => {
  for (const packageId of ["plasma-complete", "plasma-duo"]) {
    for (const quantity of [1, 2, 3, 10]) {
      const out = validateOrder({ ...baseInput(), packageId, quantity });
      const expected = (packageId === "plasma-complete" ? 30 : 20) * quantity;
      assert.equal(out.total, expected, `${packageId} x${quantity}`);
      assert.equal(out.deliveryFee, 0);
    }
  }
});

test("rejects an unknown package id", () => {
  assert.throws(() => validateOrder({ ...baseInput(), packageId: "plasma-mega" }), OrderValidationError);
});

test("rejects an empty package selection", () => {
  assert.throws(() => validateOrder({ ...baseInput(), packageId: "" }), OrderValidationError);
  assert.throws(() => validateOrder({ ...baseInput(), packageId: undefined }), OrderValidationError);
});

test("ignores a client-supplied price/total and recomputes from the catalog", () => {
  const out = validateOrder({ ...baseInput(), unitPrice: 1, total: 1, price: 1 });
  assert.equal(out.total, 30);
  assert.equal(out.unitPrice, 30);
});

test("ignores a client-supplied deliveryFee and forces it to 0", () => {
  const out = validateOrder({ ...baseInput(), deliveryFee: 3, deliveryIncluded: false });
  assert.equal(out.deliveryFee, 0);
  assert.equal(out.deliveryIncluded, true);
});

test("rejects invalid quantity: zero, negative, non-integer, over the limit", () => {
  for (const quantity of [0, -1, 1.5, 11, "abc", null, undefined]) {
    assert.throws(() => validateOrder({ ...baseInput(), quantity }), OrderValidationError, `quantity=${quantity}`);
  }
});

test("rejects missing full name", () => {
  assert.throws(() => validateOrder({ ...baseInput(), fullName: "" }), OrderValidationError);
  assert.throws(() => validateOrder({ ...baseInput(), fullName: "   " }), OrderValidationError);
});

test("rejects an invalid Jordanian phone", () => {
  assert.throws(() => validateOrder({ ...baseInput(), phone: "123" }), OrderValidationError);
});

test("rejects missing/unknown governorate", () => {
  assert.throws(() => validateOrder({ ...baseInput(), governorate: "" }), OrderValidationError);
  assert.throws(() => validateOrder({ ...baseInput(), governorate: "Cairo" }), OrderValidationError);
});

test("accepts governorate case-insensitively", () => {
  const out = validateOrder({ ...baseInput(), governorate: "AMMAN" });
  assert.equal(out.governorate, "amman");
});

test("attaches the Arabic governorate label for the ERP sync, regardless of storefront language", () => {
  assert.equal(validateOrder({ ...baseInput(), governorate: "amman" }).governorateLabelAr, "عمّان");
  assert.equal(validateOrder({ ...baseInput(), governorate: "aqaba", language: "en" }).governorateLabelAr, "العقبة");
});

test("rejects missing area/address", () => {
  assert.throws(() => validateOrder({ ...baseInput(), areaAddress: "" }), OrderValidationError);
});

test("truncates overly long name/address/notes instead of failing", () => {
  const out = validateOrder({
    ...baseInput(),
    fullName: "a".repeat(500),
    areaAddress: "b".repeat(500),
    notes: "c".repeat(500),
  });
  assert.ok(out.fullName.length <= 80);
  assert.ok(out.areaAddress.length <= 200);
  assert.ok(out.notes.length <= 300);
});

test("notes are optional", () => {
  const out = validateOrder({ ...baseInput(), notes: undefined });
  assert.equal(out.notes, "");
});

test("defaults language to ar for anything other than 'en'", () => {
  assert.equal(validateOrder({ ...baseInput(), language: "fr" }).language, "ar");
  assert.equal(validateOrder({ ...baseInput(), language: "en" }).language, "en");
  assert.equal(validateOrder({ ...baseInput(), language: undefined }).language, "ar");
});

test("rejects completely empty/garbage input", () => {
  assert.throws(() => validateOrder(null), OrderValidationError);
  assert.throws(() => validateOrder(undefined), OrderValidationError);
  assert.throws(() => validateOrder("not an object"), OrderValidationError);
});

test("includedProducts and names come from the server catalog, never the client", () => {
  const out = validateOrder({ ...baseInput(), includedProducts: ["fake"], packageNameAr: "fake", packageNameEn: "fake" });
  assert.deepEqual(out.includedProducts, ["shampoo", "conditioner", "mask", "serum"]);
  assert.equal(out.packageNameAr, "بكج بلازما الكامل");
  assert.equal(out.packageNameEn, "PLASMA Complete Package");
});
