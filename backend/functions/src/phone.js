// Normalizes Jordanian mobile numbers to +9627XXXXXXXX.
// Accepts local (07XXXXXXXX), international (+9627XXXXXXXX / 9627XXXXXXXX)
// and 00-prefixed input, with any spaces/dashes stripped first.
function normalizeJordanianPhone(raw) {
  if (typeof raw !== "string") return null;
  let digits = raw.trim().replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = "+" + digits.slice(2);

  if (digits.startsWith("+962")) digits = digits.slice(4);
  else if (digits.startsWith("962")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  else if (digits.startsWith("+")) return null;

  // Local subscriber number: 7[7-9]XXXXXXX (9 digits total)
  if (!/^7[789]\d{7}$/.test(digits)) return null;
  return "+962" + digits;
}

module.exports = { normalizeJordanianPhone };
