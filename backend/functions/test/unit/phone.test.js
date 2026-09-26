const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeJordanianPhone } = require("../../src/phone");

test("normalizes local 07XXXXXXXX format", () => {
  assert.equal(normalizeJordanianPhone("0791234567"), "+962791234567");
});

test("normalizes international +9627XXXXXXXX format", () => {
  assert.equal(normalizeJordanianPhone("+962791234567"), "+962791234567");
});

test("normalizes 00-prefixed international format", () => {
  assert.equal(normalizeJordanianPhone("00962791234567"), "+962791234567");
});

test("strips spaces and dashes", () => {
  assert.equal(normalizeJordanianPhone("079-123 4567"), "+962791234567");
});

test("accepts all three mobile network prefixes (77/78/79)", () => {
  assert.equal(normalizeJordanianPhone("0771234567"), "+962771234567");
  assert.equal(normalizeJordanianPhone("0781234567"), "+962781234567");
  assert.equal(normalizeJordanianPhone("0791234567"), "+962791234567");
});

test("rejects a non-Jordanian mobile prefix", () => {
  assert.equal(normalizeJordanianPhone("0761234567"), null);
});

test("rejects too-short numbers", () => {
  assert.equal(normalizeJordanianPhone("07912345"), null);
});

test("rejects too-long numbers", () => {
  assert.equal(normalizeJordanianPhone("079123456789"), null);
});

test("rejects landline-style numbers", () => {
  assert.equal(normalizeJordanianPhone("064123456"), null);
});

test("rejects non-string input", () => {
  assert.equal(normalizeJordanianPhone(962791234567), null);
  assert.equal(normalizeJordanianPhone(undefined), null);
  assert.equal(normalizeJordanianPhone(null), null);
});

test("rejects empty/garbage input", () => {
  assert.equal(normalizeJordanianPhone(""), null);
  assert.equal(normalizeJordanianPhone("not a phone"), null);
});
