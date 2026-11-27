// DOMESTIC — program penyerahan (Node 22, pustaka standar saja).
// Menyalin app/ dan screenshots/ dari repo ini ke /output, lalu menulis
// /output/dossier.json dengan pustaka make.fun yang divendor di
// vendor/makefun-frontend.ts (jangan diubah: penilai membangun ulang dossier
// dengan salinan yang sama dan membandingkan byte demi byte).
//
// Sebelum menyalin, program ini memvalidasi halaman yang di-prerender:
// angka-angka di app/index.html harus sama persis dengan yang dihitung
// src/core.js dari src/data.js untuk rumah tangga contoh 4 anggota, supaya
// angka di HTML awal tidak pernah meleset dari data. Validasi gagal =
// build gagal, dengan pesan yang menyebut angka mana yang salah.
//
// Di luar kontainer penilai, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";
import { HOUSEHOLDS } from "./src/data.js";
import { sumAmounts, formatRp, zeroBased, sinkingMonthly } from "./src/core.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Validasi prerender: halaman harus memuat angka yang dihitung dari data.
const demo = HOUSEHOLDS[4];
const income = sumAmounts(demo.income);
const zb = zeroBased(income, demo.categories);
if (zb.remainder !== 0) {
  throw new Error("anggaran demo tidak zero-based: sisa " + zb.remainder);
}
const html = readFileSync(join(here, "app", "index.html"), "utf8");
const expected = [formatRp(income), formatRp(zb.allocated)];
for (const cat of demo.categories) expected.push(formatRp(cat.amount));
for (const fund of demo.sinking) expected.push(formatRp(sinkingMonthly(fund.annual)), formatRp(fund.saved));
expected.push(formatRp(demo.emergency.balance));
const sinkingTotal = demo.sinking.reduce((t, f) => t + sinkingMonthly(f.annual), 0);
const sinkingCat = demo.categories.find((c) => c.id === "sinking");
if (sinkingTotal !== sinkingCat.amount) {
  throw new Error("total sinking fund bulanan tidak sama dengan kategori sinking fund");
}
for (const text of expected) {
  if (!html.includes(text)) {
    throw new Error("app/index.html tidak memuat angka prerender yang diharapkan: " + text);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

// Batas penilai (reference/gate.json): hanya text_max_bytes yang membentuk
// byte dossier; sisanya menolak entri yang juga ditolak penilai (lebih dari
// 4 screenshot atau satu di atas 256 KiB; app/ di atas 993 file+direktori
// atau 16 MiB — app/ dihitung bersama batas 1000 entri /output).
writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
