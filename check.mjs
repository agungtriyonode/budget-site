// DOMESTIC — local verification only (not part of the entry's /output).
// Checks that the browser copies (app/core.js, app/data.js) agree with the
// canonical sources (src/core.js, src/data.js), that every household is
// zero-based, that the prerendered page holds the computed figures, and that
// no app/ file references the network. Run: node check.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { HOUSEHOLDS as SRC_HOUSEHOLDS } from "./src/data.js";
import { HOUSEHOLDS as APP_HOUSEHOLDS } from "./app/data.js";
import * as SRC from "./src/core.js";
import * as APP from "./app/core.js";

const here = fileURLToPath(new URL(".", import.meta.url));
let failures = 0;
function check(name, ok) {
  console.log((ok ? "PASS" : "FAIL") + " " + name);
  if (!ok) failures++;
}

// 1. Browser copies agree with canonical sources.
check(
  "app/data.js deep-equals src/data.js",
  JSON.stringify(APP_HOUSEHOLDS) === JSON.stringify(SRC_HOUSEHOLDS),
);
for (const key of ["2", "3", "4"]) {
  const h = SRC_HOUSEHOLDS[key];
  const income = SRC.sumAmounts(h.income);
  check("household " + key + " zero-based", SRC.zeroBased(income, h.categories).remainder === 0);
  check(
    "household " + key + " sinking monthly matches category",
    h.sinking.reduce((t, f) => t + SRC.sinkingMonthly(f.annual), 0) ===
      h.categories.find((c) => c.id === "sinking").amount,
  );
  check(
    "household " + key + " core functions agree src/app",
    SRC.formatRp(income) === APP.formatRp(income) &&
      SRC.runwayMonths(h.emergency.balance, SRC.essentialMonthly(h.categories)) ===
        APP.runwayMonths(h.emergency.balance, APP.essentialMonthly(h.categories)),
  );
  const sim = SRC.simulate(h, { makan: 1.1, transport: 1, hiburan: 0.5, income: 0.8 });
  const simApp = APP.simulate(h, { makan: 1.1, transport: 1, hiburan: 0.5, income: 0.8 });
  check("household " + key + " simulate agrees src/app", JSON.stringify(sim) === JSON.stringify(simApp));
}

// 2. Prerendered page holds the computed figures for household 4.
const html = readFileSync(join(here, "app", "index.html"), "utf8");
const demo = SRC_HOUSEHOLDS[4];
const income4 = SRC.sumAmounts(demo.income);
const wanted = [SRC.formatRp(income4)];
for (const cat of demo.categories) wanted.push(SRC.formatRp(cat.amount));
for (const fund of demo.sinking) {
  wanted.push(SRC.formatRp(SRC.sinkingMonthly(fund.annual)), SRC.formatRp(fund.saved));
}
wanted.push(SRC.formatRp(demo.emergency.balance));
check(
  "index.html holds all computed figures",
  wanted.every((text) => html.includes(text)),
);
check("index.html under 1 MiB", Buffer.byteLength(html, "utf8") <= 1048576);

// 3. No network references in app/.
const appFiles = readdirSync(join(here, "app"));
let networkRefs = [];
for (const file of appFiles) {
  const text = readFileSync(join(here, "app", file), "utf8");
  const hits = text.match(/(src|href)\s*=\s*["']https?:|url\(\s*["']?https?:|@import\s+["']https?:/g);
  if (hits) networkRefs.push(file + ": " + hits.join(", "));
}
check("app/ has no network references", networkRefs.length === 0);
if (networkRefs.length) console.log(networkRefs.join("\n"));

// 4. Screenshots present and within limits (when taken).
const shotsDir = join(here, "screenshots");
let shots = [];
try {
  shots = readdirSync(shotsDir).filter((f) => !f.startsWith("."));
} catch {
  shots = [];
}
check("3-4 screenshots present", shots.length >= 3 && shots.length <= 4);
for (const shot of shots) {
  const size = statSync(join(shotsDir, shot)).size;
  check("screenshot " + shot + " <= 256 KiB (" + size + " B)", size <= 262144);
}

if (failures > 0) {
  console.log(failures + " check(s) FAILED");
  process.exit(1);
}
console.log("all checks passed");
