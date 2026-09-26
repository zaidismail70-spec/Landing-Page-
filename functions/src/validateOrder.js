const { CATALOG, GOVERNORATES, MAX_QUANTITY, MAX_NAME_LENGTH, MAX_ADDRESS_LENGTH, MAX_NOTES_LENGTH } = require("./catalog");
const { normalizeJordanianPhone } = require("./phone");

class OrderValidationError extends Error {
  constructor(code, messageAr, messageEn) {
    super(code);
    this.code = code;
    this.messageAr = messageAr;
    this.messageEn = messageEn;
  }
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

// Validates raw client input, recalculates the total from the authoritative
// catalog, and returns a sanitized order ready to persist. Never trusts any
// price, total, or delivery value the client sends.
function validateOrder(input) {
  if (!input || typeof input !== "object") {
    throw new OrderValidationError("invalid-input", "بيانات الطلب غير صالحة.", "Invalid order data.");
  }

  const packageId = input.packageId;
  if (!packageId || !CATALOG[packageId]) {
    throw new OrderValidationError("unknown-package", "الرجاء اختيار بكج صحيح.", "Please choose a valid package.");
  }
  const pkg = CATALOG[packageId];

  const quantity = Number(input.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new OrderValidationError("invalid-quantity", "الكمية غير صحيحة.", "Invalid quantity.");
  }

  const fullName = cleanText(input.fullName, MAX_NAME_LENGTH);
  if (!fullName) {
    throw new OrderValidationError("missing-name", "الرجاء إدخال الاسم الكامل.", "Please enter your full name.");
  }

  const normalizedPhone = normalizeJordanianPhone(input.phone);
  if (!normalizedPhone) {
    throw new OrderValidationError("invalid-phone", "رقم هاتف أردني غير صحيح.", "Invalid Jordanian phone number.");
  }

  const governorate = typeof input.governorate === "string" ? input.governorate.trim().toLowerCase() : "";
  if (!GOVERNORATES.includes(governorate)) {
    throw new OrderValidationError("invalid-governorate", "الرجاء اختيار المحافظة.", "Please choose a governorate.");
  }

  const areaAddress = cleanText(input.areaAddress, MAX_ADDRESS_LENGTH);
  if (!areaAddress) {
    throw new OrderValidationError("missing-address", "الرجاء إدخال المنطقة والعنوان.", "Please enter your area and address.");
  }

  const notes = cleanText(input.notes, MAX_NOTES_LENGTH);

  const language = input.language === "en" ? "en" : "ar";

  const total = pkg.unitPrice * quantity;

  return {
    packageId,
    packageNameAr: pkg.nameAr,
    packageNameEn: pkg.nameEn,
    includedProducts: pkg.includedProducts,
    quantity,
    unitPrice: pkg.unitPrice,
    oldUnitPrice: pkg.oldUnitPrice,
    total,
    deliveryFee: 0,
    deliveryIncluded: true,
    fullName,
    normalizedPhone,
    governorate,
    areaAddress,
    notes,
    language,
  };
}

module.exports = { validateOrder, OrderValidationError };
