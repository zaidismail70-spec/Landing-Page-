// Authoritative package catalog. The browser is never trusted with prices —
// every total is recomputed here on the server.
const CATALOG = {
  "plasma-complete": {
    unitPrice: 30,
    oldUnitPrice: 40,
    nameAr: "بكج بلازما الكامل",
    nameEn: "PLASMA Complete Package",
    includedProducts: ["shampoo", "conditioner", "mask", "serum"],
  },
  "plasma-duo": {
    unitPrice: 20,
    oldUnitPrice: 25,
    nameAr: "بكج بلازما الثنائي",
    nameEn: "PLASMA Duo Package",
    includedProducts: ["shampoo", "conditioner"],
  },
};

const GOVERNORATES = [
  "amman", "zarqa", "irbid", "balqa", "madaba", "jerash",
  "ajloun", "mafraq", "karak", "tafilah", "maan", "aqaba",
];

// The ERP's internal records and staff UI are Arabic-first; the order sent there always carries
// the Arabic governorate label regardless of which language the customer used at checkout.
const GOVERNORATE_LABELS_AR = {
  amman: "عمّان", zarqa: "الزرقاء", irbid: "إربد", balqa: "البلقاء",
  madaba: "مادبا", jerash: "جرش", ajloun: "عجلون", mafraq: "المفرق",
  karak: "الكرك", tafilah: "الطفيلة", maan: "معان", aqaba: "العقبة",
};

const MAX_QUANTITY = 10;
const MAX_NAME_LENGTH = 80;
const MAX_ADDRESS_LENGTH = 200;
const MAX_NOTES_LENGTH = 300;

module.exports = { CATALOG, GOVERNORATES, GOVERNORATE_LABELS_AR, MAX_QUANTITY, MAX_NAME_LENGTH, MAX_ADDRESS_LENGTH, MAX_NOTES_LENGTH };
