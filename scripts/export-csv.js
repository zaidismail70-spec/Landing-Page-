#!/usr/bin/env node
/**
 * Private local admin export tool. NOT exposed on the public site.
 *
 * Usage (run locally by an authorized administrator only):
 *   1. In Firebase Console: Project settings → Service accounts →
 *      Generate new private key. Save the JSON file somewhere OUTSIDE the
 *      repo (or in this repo's root — it's already covered by .gitignore
 *      patterns "serviceAccountKey*.json" / "*-firebase-adminsdk-*.json").
 *   2. Run:
 *      node scripts/export-csv.js --collection=orders --key=/path/to/serviceAccountKey.json
 *      node scripts/export-csv.js --collection=customers --key=/path/to/serviceAccountKey.json
 *
 * Options:
 *   --collection=orders|customers   (required)
 *   --key=<path>                    path to the service account JSON
 *                                    (or set GOOGLE_APPLICATION_CREDENTIALS)
 *   --from=YYYY-MM-DD               optional, filters createdAt/lastOrderAt >=
 *   --to=YYYY-MM-DD                 optional, filters createdAt/lastOrderAt <=
 *   --status=new|confirmed|...      optional, orders only, filters status field
 *   --out=<path>                    output CSV path (default: ./exports/<collection>-<timestamp>.csv)
 *
 * Never commit the service account file or any exported CSV — both are
 * covered by .gitignore, and CSVs may contain customer names/phones/addresses.
 */
const fs = require("node:fs");
const path = require("node:path");

function parseArgs(argv) {
  const args = {};
  for (const raw of argv.slice(2)) {
    const match = raw.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

function toCsvValue(value) {
  if (value === null || value === undefined) return "";
  let str;
  if (value && typeof value.toDate === "function") str = value.toDate().toISOString();
  else if (Array.isArray(value)) str = value.join("; ");
  else str = String(value);
  if (/[",\n]/.test(str)) str = '"' + str.replace(/"/g, '""') + '"';
  return str;
}

function toCsv(rows, columns) {
  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((col) => toCsvValue(row[col])).join(","));
  return [header, ...lines].join("\r\n");
}

const ORDER_COLUMNS = [
  "orderId", "orderNumber", "customerId", "fullName", "normalizedPhone",
  "governorate", "areaAddress", "packageId", "packageNameAr", "packageNameEn",
  "includedProducts", "quantity", "unitPrice", "oldUnitPrice",
  "deliveryIncluded", "deliveryFee", "total", "notes", "language",
  "source", "status", "createdAt", "idempotencyKey",
];

const CUSTOMER_COLUMNS = [
  "customerId", "fullName", "normalizedPhone", "governorate", "areaAddress",
  "interests", "preferredLanguage", "firstOrderAt", "lastOrderAt",
  "totalOrders", "totalValue", "createdAt", "updatedAt",
];

async function main() {
  const args = parseArgs(process.argv);
  const collection = args.collection;
  if (collection !== "orders" && collection !== "customers") {
    console.error('Usage: node scripts/export-csv.js --collection=orders|customers [--key=path] [--from=YYYY-MM-DD] [--to=YYYY-MM-DD] [--status=...] [--out=path]');
    process.exit(1);
  }

  if (args.key) process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(args.key);
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error("No service account provided. Pass --key=/path/to/serviceAccountKey.json or set GOOGLE_APPLICATION_CREDENTIALS.");
    process.exit(1);
  }

  const admin = require("firebase-admin");
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
  const db = admin.firestore();

  const dateField = collection === "orders" ? "createdAt" : "lastOrderAt";
  let query = db.collection(collection);
  if (args.from) query = query.where(dateField, ">=", new Date(args.from));
  if (args.to) query = query.where(dateField, "<=", new Date(args.to + "T23:59:59"));
  if (args.status && collection === "orders") query = query.where("status", "==", args.status);

  const snap = await query.get();
  const rows = snap.docs.map((doc) => doc.data());

  const columns = collection === "orders" ? ORDER_COLUMNS : CUSTOMER_COLUMNS;
  const csv = toCsv(rows, columns);

  const outDir = path.resolve(__dirname, "..", "exports");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = args.out
    ? path.resolve(args.out)
    : path.join(outDir, `${collection}-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`);

  // UTF-8 BOM so Excel renders Arabic text correctly instead of mojibake.
  fs.writeFileSync(outPath, "﻿" + csv, "utf8");
  console.log(`Exported ${rows.length} ${collection} row(s) to ${outPath}`);
}

main().catch((err) => {
  console.error("Export failed:", err.message);
  process.exit(1);
});
