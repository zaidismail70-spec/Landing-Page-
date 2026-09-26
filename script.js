import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";

// --- Firebase setup ---------------------------------------------------
// This config is the public Firebase web app identifier (safe to ship in
// client code by design) — it is not a secret, and it does not grant any
// database access on its own. All reads/writes go through the submitOrder
// Cloud Function; Firestore itself denies direct client access (see
// firestore.rules).
const firebaseConfig = {
  apiKey: "AIzaSyDuxygzt5D6mCkGfjll95BAEe-0DGjjtBc",
  authDomain: "landing-page-6baab.firebaseapp.com",
  projectId: "landing-page-6baab",
  storageBucket: "landing-page-6baab.firebasestorage.app",
  messagingSenderId: "716159636268",
  appId: "1:716159636268:web:cbeb05d02371459d1b5289",
  measurementId: "G-7TDF3285JF",
};
const firebaseApp = initializeApp(firebaseConfig);
const functionsInstance = getFunctions(firebaseApp);
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  connectFunctionsEmulator(functionsInstance, "localhost", 5001);
}
const submitOrderFn = httpsCallable(functionsInstance, "submitOrder");

// --- App Check (intentionally disabled until registered in console) ---
// 1. Firebase Console → Build → App Check → Apps → register the web app
//    (appId 1:716159636268:web:cbeb05d02371459d1b5289) → provider: reCAPTCHA v3
//    → copy the site key.
// 2. Paste the site key below and uncomment this block.
// 3. Leave the Cloud Function's APP_CHECK_ENFORCED unset (or "false") and the
//    console enforcement toggle on "Unenforced" until you've confirmed real
//    production traffic is passing tokens — only then switch both to enforced.
// import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check.js";
// initializeAppCheck(firebaseApp, { provider: new ReCaptchaV3Provider("PASTE_SITE_KEY_HERE"), isTokenAutoRefreshEnabled: true });

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// --- Content -----------------------------------------------------------
const content = {
  ar: {
    pageTitle: "بلازما للعناية بالشعر | Betolla",
    metaDescription: "روتين بلازما الكامل لشعر أنعم وأقوى. اختاري البكج وأكملي طلبك مباشرة من الموقع.",
    orderNow: "اطلبي الآن",
    heroHeadline: "روتين بلازما الكامل لشعر أنعم وأقوى",
    heroSub: "منتجات بلازما الأربعة في بكج واحد، بسعر واحد يشمل التوصيل.",
    pickPackage: "اختاري البكج",
    bestValue: "الأكثر توفيرًا",
    completeName: "بكج بلازما الكامل",
    completeIncludes: "شامبو، بلسم، ماسك، سيروم",
    duoName: "بكج بلازما الثنائي",
    duoIncludes: "شامبو، بلسم",
    jod: "د.أ",
    deliveryIncluded: "شامل التوصيل",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف",
    phonePlaceholder: "07XXXXXXXX",
    governorate: "المحافظة",
    chooseGovernorate: "اختاري",
    area: "المنطقة والعنوان",
    quantity: "الكمية",
    notes: "ملاحظات",
    optional: "(اختياري)",
    summaryTitle: "ملخص الطلب",
    total: "الإجمالي",
    submitOrder: "تأكيد الطلب",
    submitOrderSaving: "جارٍ الحفظ...",
    privacyNote: "باستكمال الطلب، سيتم استخدام بياناتك لتأكيد الطلب والتوصيل فقط.",
    errorRequired: "يرجى تعبئة جميع الحقول المطلوبة.",
    errorName: "الرجاء إدخال الاسم الكامل.",
    errorPhone: "رقم هاتف أردني غير صحيح، مثال: 07XXXXXXXX.",
    errorGovernorate: "الرجاء اختيار المحافظة.",
    errorArea: "الرجاء إدخال المنطقة والعنوان.",
    genericError: "تعذر حفظ الطلب، الرجاء المحاولة مرة أخرى.",
    orderConfirmed: "تم استلام طلبك بنجاح",
    orderNumberLabel: "رقم طلبك:",
    successContactNote: "سنتواصل معك قريبًا لتأكيد الطلب.",
    langLabel: "EN",
  },
  en: {
    pageTitle: "PLASMA Hair Care | Betolla",
    metaDescription: "Your complete PLASMA routine for softer, stronger hair. Choose a set and complete your order right on the site.",
    orderNow: "Order now",
    heroHeadline: "Your complete PLASMA routine for softer, stronger hair",
    heroSub: "All four PLASMA products in one set, at one price that includes delivery.",
    pickPackage: "Choose your set",
    bestValue: "Best value",
    completeName: "PLASMA Complete Package",
    completeIncludes: "Shampoo, conditioner, mask, serum",
    duoName: "PLASMA Duo Package",
    duoIncludes: "Shampoo, conditioner",
    jod: "JOD",
    deliveryIncluded: "Delivery included",
    fullName: "Full name",
    phone: "Phone number",
    phonePlaceholder: "07XXXXXXXX",
    governorate: "Governorate",
    chooseGovernorate: "Choose",
    area: "Area & detailed address",
    quantity: "Quantity",
    notes: "Notes",
    optional: "(optional)",
    summaryTitle: "Order summary",
    total: "Total",
    submitOrder: "Confirm order",
    submitOrderSaving: "Saving...",
    privacyNote: "By completing the order, your information will be used only to confirm and deliver your order.",
    errorRequired: "Please fill in all required fields.",
    errorName: "Please enter your full name.",
    errorPhone: "Invalid Jordanian phone number, e.g. 07XXXXXXXX.",
    errorGovernorate: "Please choose a governorate.",
    errorArea: "Please enter your area and address.",
    genericError: "We couldn't save your order, please try again.",
    orderConfirmed: "Your order has been received successfully.",
    orderNumberLabel: "Order number:",
    successContactNote: "We will contact you shortly to confirm your order.",
    langLabel: "ع",
  },
};

// Mirrors functions/src/catalog.js — the server always recalculates the
// authoritative total, this is only for instant display before submission.
const PACKAGES = {
  "plasma-complete": {
    unitPrice: 30,
    oldUnitPrice: 40,
    image: "assets/plasma-complete-1080.webp",
  },
  "plasma-duo": {
    unitPrice: 20,
    oldUnitPrice: 25,
    image: "assets/plasma-duo-1080.webp",
  },
};

// Mirrors functions/src/catalog.js GOVERNORATES.
const GOVERNORATES = [
  { value: "amman", ar: "عمّان", en: "Amman" },
  { value: "zarqa", ar: "الزرقاء", en: "Zarqa" },
  { value: "irbid", ar: "إربد", en: "Irbid" },
  { value: "balqa", ar: "البلقاء", en: "Balqa" },
  { value: "madaba", ar: "مادبا", en: "Madaba" },
  { value: "jerash", ar: "جرش", en: "Jerash" },
  { value: "ajloun", ar: "عجلون", en: "Ajloun" },
  { value: "mafraq", ar: "المفرق", en: "Mafraq" },
  { value: "karak", ar: "الكرك", en: "Karak" },
  { value: "tafilah", ar: "الطفيلة", en: "Tafilah" },
  { value: "maan", ar: "معان", en: "Ma'an" },
  { value: "aqaba", ar: "العقبة", en: "Aqaba" },
];

function detectInitialLanguage() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl === "ar" || fromUrl === "en") return fromUrl;
  try {
    const stored = localStorage.getItem("betolla-lang");
    if (stored === "ar" || stored === "en") return stored;
  } catch (e) {}
  return "ar";
}

let lang = detectInitialLanguage();
let selectedPackage = "plasma-complete";
let quantity = 1;
let submitting = false;
let idempotencyKey = crypto.randomUUID();

// --- Governorate select --------------------------------------------------
function buildGovernorateOptions() {
  const select = $("#governorate");
  const currentValue = select.value;
  select.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = content[lang].chooseGovernorate;
  select.append(placeholder);
  GOVERNORATES.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g.value;
    opt.textContent = g[lang];
    select.append(opt);
  });
  if (currentValue) select.value = currentValue;
}

// --- Package selector -----------------------------------------------------
function renderPackages() {
  $$(".package-card").forEach((card) => {
    const key = card.dataset.package;
    const isSelected = key === selectedPackage;
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-checked", String(isSelected));
  });
}

function selectPackage(key) {
  if (!PACKAGES[key]) return;
  selectedPackage = key;
  renderPackages();
  updateSummary();
}

$$(".package-card").forEach((card) => {
  card.addEventListener("click", () => selectPackage(card.dataset.package));
  card.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const keys = Object.keys(PACKAGES);
    const i = keys.indexOf(selectedPackage);
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = keys[(i + dir + keys.length) % keys.length];
    selectPackage(next);
    $(`.package-card[data-package="${next}"]`).focus();
  });
});

// --- Quantity stepper -------------------------------------------------
const quantityInput = $("#quantity");
function setQuantity(next) {
  quantity = Math.max(1, Math.min(10, Math.round(next) || 1));
  quantityInput.value = quantity;
  updateSummary();
}
$$('[data-qty]').forEach((btn) => {
  btn.addEventListener("click", () => setQuantity(quantity + (btn.dataset.qty === "plus" ? 1 : -1)));
});
quantityInput.addEventListener("change", () => setQuantity(Number(quantityInput.value)));

// --- Order summary ------------------------------------------------------
function updateSummary() {
  const pkg = PACKAGES[selectedPackage];
  const name = selectedPackage === "plasma-complete" ? content[lang].completeName : content[lang].duoName;
  $("#summaryPackageName").textContent = name;
  $("#summaryQty").textContent = `× ${quantity}`;
  $("#summaryTotal").textContent = `${pkg.unitPrice * quantity} ${content[lang].jod}`;
  const img = $("#packageImage");
  img.src = pkg.image;
  img.alt = name;
}

// --- Language switching ---------------------------------------------------
function setLanguage(next) {
  lang = next;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  $("#langToggle").textContent = content[lang].langLabel;
  $$('[data-i18n]').forEach((el) => {
    const v = content[lang][el.dataset.i18n];
    if (v !== undefined) el.textContent = v;
  });
  $$('[data-i18n-placeholder]').forEach((el) => {
    const v = content[lang][el.dataset.i18nPlaceholder];
    if (v !== undefined) el.placeholder = v;
  });
  document.title = content[lang].pageTitle;
  const desc = content[lang].metaDescription;
  ["metaDescription", "ogTitle", "ogDescription", "twitterTitle", "twitterDescription"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === "ogTitle" || id === "twitterTitle") el.setAttribute("content", content[lang].pageTitle);
    else el.setAttribute("content", desc);
  });
  try {
    localStorage.setItem("betolla-lang", lang);
  } catch (e) {}
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(null, "", url);
  buildGovernorateOptions();
  updateSummary();
  clearFieldErrors();
}
$("#langToggle").addEventListener("click", () => setLanguage(lang === "ar" ? "en" : "ar"));

// --- Form validation -----------------------------------------------------
function normalizeJordanianPhone(raw) {
  if (typeof raw !== "string") return null;
  let digits = raw.trim().replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = "+" + digits.slice(2);
  if (digits.startsWith("+962")) digits = digits.slice(4);
  else if (digits.startsWith("962")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  else if (digits.startsWith("+")) return null;
  if (!/^7[789]\d{7}$/.test(digits)) return null;
  return "+962" + digits;
}

function clearFieldErrors() {
  $$(".field-error").forEach((el) => (el.textContent = ""));
  $("#formStatus").textContent = "";
  $("#formStatus").className = "form-status full";
}

function setFieldError(name, message) {
  const el = $(`[data-error-for="${name}"]`);
  if (el) el.textContent = message;
}

function validateForm() {
  clearFieldErrors();
  const f = $("#orderForm");
  const errors = [];
  const name = f.name.value.trim();
  const phone = f.phone.value.trim();
  const governorate = f.governorate.value;
  const area = f.area.value.trim();

  if (!name) {
    setFieldError("name", content[lang].errorName);
    errors.push("name");
  }
  if (!normalizeJordanianPhone(phone)) {
    setFieldError("phone", content[lang].errorPhone);
    errors.push("phone");
  }
  if (!governorate) {
    setFieldError("governorate", content[lang].errorGovernorate);
    errors.push("governorate");
  }
  if (!area) {
    setFieldError("area", content[lang].errorArea);
    errors.push("area");
  }
  return errors;
}

// --- Submit -----------------------------------------------------------
function setButtonLoading(isLoading) {
  const btn = $("#submitBtn");
  btn.disabled = isLoading;
  $("#submitBtnLabel").textContent = isLoading ? content[lang].submitOrderSaving : content[lang].submitOrder;
}

function showStatus(message, kind) {
  const el = $("#formStatus");
  el.textContent = message;
  el.className = "form-status full" + (kind ? " " + kind : "");
}

function showSuccess(order) {
  $("#submitBtn").hidden = true;
  $("#privacyNote").hidden = true;
  $("#successOrderNumber").textContent = order.orderNumber;
  $("#successPanel").hidden = false;
  $$("#orderForm input, #orderForm select, #orderForm textarea, #orderForm button[data-qty]").forEach((el) => (el.disabled = true));
}

$("#orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitting) return;

  const errors = validateForm();
  if (errors.length) {
    showStatus(content[lang].errorRequired, "error");
    return;
  }

  submitting = true;
  setButtonLoading(true);

  const f = $("#orderForm");
  const governorateOption = f.governorate.selectedOptions[0];
  const payload = {
    packageId: selectedPackage,
    quantity,
    fullName: f.name.value.trim(),
    phone: f.phone.value.trim(),
    governorate: f.governorate.value,
    governorateLabel: governorateOption ? governorateOption.textContent : "",
    areaAddress: f.area.value.trim(),
    notes: f.notes.value.trim(),
    language: lang,
  };

  try {
    const res = await submitOrderFn({ ...payload, idempotencyKey });
    showSuccess(res.data);
  } catch (err) {
    const details = err && err.details;
    const message = details ? (lang === "ar" ? details.messageAr : details.messageEn) : content[lang].genericError;
    showStatus(message || content[lang].genericError, "error");
    submitting = false;
    setButtonLoading(false);
  }
});

// --- Init ---------------------------------------------------------------
setLanguage(lang);
renderPackages();
