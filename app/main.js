// DOMESTIC — client logic. Renders the waterfall, the simulator and the
// household switcher from app/data.js, using the pure math in app/core.js.
// The page ships prerendered for the 4-member household; this script only
// re-renders when the visitor switches household or moves a simulator slider.

import { HOUSEHOLDS, MONTH_LABEL } from "./data.js";
import {
  sumAmounts,
  formatRp,
  formatPct,
  formatOneDecimal,
  zeroBased,
  sinkingMonthly,
  sinkingProgress,
  runwayMonths,
  simulate,
  waterfallShares,
  projectEmergency,
} from "./core.js";

const CATEGORY_COLORS = [
  "#1d4d3b", "#2e7d5b", "#4c9a6d", "#7fb069",
  "#b98a1d", "#c96f3f", "#d9a441", "#8a9a5b",
  "#3d6b8e", "#6d4c7d",
];

const MONTHS_SHORT = ["Des", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov"];

let currentMembers = 4;
let scenario = 1;
let factors = { makan: 1, transport: 1, hiburan: 1 };

function $(id) {
  return document.getElementById(id);
}

function household() {
  return HOUSEHOLDS[currentMembers];
}

// ---- hero stats ----
function renderStats() {
  const h = household();
  const income = sumAmounts(h.income);
  const zb = zeroBased(income, h.categories);
  const essential = h.categories
    .filter((c) => c.id !== "hiburan" && c.id !== "pakaian")
    .reduce((t, c) => t + c.amount, 0);
  const runway = runwayMonths(h.emergency.balance, essential);
  $("stat-income").textContent = formatRp(income);
  $("stat-allocated").textContent = formatRp(zb.allocated);
  $("stat-remainder").textContent = formatRp(zb.remainder);
  $("stat-remainder-sub").textContent =
    zb.remainder === 0 ? "Zero-based: semua rupiah punya tugas" : "Sisa belum dialokasikan";
  $("stat-emergency").textContent = formatRp(h.emergency.balance);
  $("stat-runway").textContent = formatOneDecimal(runway) + " bulan";
  $("who").textContent = h.name + " — " + h.tagline;
  document.querySelectorAll(".switcher button").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.members) === currentMembers));
  });
  document.querySelectorAll(".house").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.members) === currentMembers));
  });
}

// ---- sinking fund ----
function renderSinking() {
  const h = household();
  const grid = $("sink-grid");
  grid.innerHTML = "";
  let savedTotal = 0;
  let monthlyTotal = 0;
  for (const fund of h.sinking) {
    const monthly = sinkingMonthly(fund.annual);
    const pct = sinkingProgress(fund.saved, fund.annual);
    savedTotal += fund.saved;
    monthlyTotal += monthly;
    const card = document.createElement("article");
    card.className = "sink";
    card.innerHTML =
      '<div class="name"></div>' +
      '<div class="row"><span>Sisihkan / bulan</span><b></b></div>' +
      '<div class="row"><span>Target tahunan</span><b></b></div>' +
      '<div class="bar"><i></i></div>' +
      '<div class="pct"></div>';
    card.querySelector(".name").textContent = fund.label;
    const bs = card.querySelectorAll(".row b");
    bs[0].textContent = formatRp(monthly);
    bs[1].textContent = formatRp(fund.annual);
    card.querySelector(".bar i").style.width = pct + "%";
    card.querySelector(".pct").textContent =
      "Terkumpul " + formatRp(fund.saved) + " dari " + formatRp(fund.annual) + " (" + formatPct(pct) + ")";
    grid.appendChild(card);
  }
  $("sink-total-month").textContent = formatRp(monthlyTotal);
  $("sink-total-saved").textContent = formatRp(savedTotal);
}

// ---- budget table ----
function renderTable() {
  const h = household();
  const income = sumAmounts(h.income);
  const body = $("budget-body");
  body.innerHTML = "";
  for (const cat of h.categories) {
    const share = (cat.amount / income) * 100;
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.innerHTML = "";
    const strong = document.createElement("strong");
    strong.textContent = cat.label;
    const note = document.createElement("span");
    note.className = "note";
    note.textContent = cat.note;
    name.appendChild(strong);
    name.appendChild(note);
    const amount = document.createElement("td");
    amount.className = "num";
    amount.textContent = formatRp(cat.amount);
    const pct = document.createElement("td");
    pct.className = "num hide-phone";
    pct.textContent = formatPct(share);
    const bar = document.createElement("td");
    bar.className = "bar-cell hide-phone";
    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("i");
    fill.style.width = share + "%";
    if (cat.id === "sinking" || cat.id === "darurat") fill.className = "warn";
    track.appendChild(fill);
    bar.appendChild(track);
    tr.append(name, amount, pct, bar);
    body.appendChild(tr);
  }
  const zb = zeroBased(income, h.categories);
  $("budget-total").textContent = formatRp(zb.allocated);
  $("budget-income").textContent = formatRp(income);
  $("budget-remainder").textContent = formatRp(zb.remainder);
}

// ---- waterfall / sankey-lite ----
function renderWaterfall() {
  const h = household();
  const income = sumAmounts(h.income);
  const shares = waterfallShares(income, h.categories);
  const box = $("waterfall");
  box.innerHTML = "";
  const W = 1120;
  const H = 330;
  const leftX = 8;
  const leftW = 30;
  const rightX = 700;
  const rightW = 26;
  const top = 14;
  const height = 280;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Aliran dana: pemasukan mengalir ke sepuluh kategori anggaran");
  let y = top;
  const segments = [];
  for (const s of shares) {
    const segH = (s.share / 100) * height;
    segments.push({ ...s, y, h: segH });
    y += segH;
  }
  // Left income bar, split into the same segments.
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", leftX);
    rect.setAttribute("y", s.y);
    rect.setAttribute("width", leftW);
    rect.setAttribute("height", Math.max(s.h, 0.5));
    rect.setAttribute("fill", CATEGORY_COLORS[i % CATEGORY_COLORS.length]);
    svg.appendChild(rect);
  }
  // Ribbons from the income bar to the category bars.
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const x1 = leftX + leftW;
    const x2 = rightX;
    const y1a = s.y;
    const y1b = s.y + s.h;
    const y2a = s.y;
    const y2b = s.y + s.h;
    const mx = (x1 + x2) / 2;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M " + x1 + " " + y1a +
      " C " + mx + " " + y1a + ", " + mx + " " + y2a + ", " + x2 + " " + y2a +
      " L " + x2 + " " + y2b +
      " C " + mx + " " + y2b + ", " + mx + " " + y1b + ", " + x1 + " " + y1b + " Z",
    );
    path.setAttribute("fill", CATEGORY_COLORS[i % CATEGORY_COLORS.length]);
    path.setAttribute("opacity", "0.45");
    svg.appendChild(path);
  }
  // Right category bars + labels (labels never overlap: at least 15 px apart).
  let lastLabelY = -100;
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", rightX);
    rect.setAttribute("y", s.y);
    rect.setAttribute("width", rightW);
    rect.setAttribute("height", Math.max(s.h, 0.5));
    rect.setAttribute("fill", CATEGORY_COLORS[i % CATEGORY_COLORS.length]);
    svg.appendChild(rect);
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", rightX + rightW + 10);
    const labelY = Math.max(s.y + Math.max(s.h / 2, 6) + 4, lastLabelY + 15);
    lastLabelY = labelY;
    label.setAttribute("y", labelY);
    label.setAttribute("font-size", "13");
    label.setAttribute("fill", "#22312b");
    label.textContent = s.label + " — " + formatRp(s.amount) + " (" + formatPct(s.share) + ")";
    svg.appendChild(label);
  }
  // Income label.
  const incomeLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  incomeLabel.setAttribute("x", leftX);
  incomeLabel.setAttribute("y", top + height + 22);
  incomeLabel.setAttribute("font-size", "14");
  incomeLabel.setAttribute("font-weight", "700");
  incomeLabel.setAttribute("fill", "#1d4d3b");
  incomeLabel.textContent = "Pemasukan " + formatRp(income);
  svg.appendChild(incomeLabel);
  box.appendChild(svg);
}

// ---- simulator ----
function currentFactors() {
  return { makan: factors.makan, transport: factors.transport, hiburan: factors.hiburan, income: scenario };
}

function renderSimulator() {
  const h = household();
  const sim = simulate(h, currentFactors());
  $("sim-income").textContent = formatRp(sim.income);
  $("sim-spending").textContent = formatRp(sim.allocated);
  const rem = $("sim-remainder");
  rem.textContent = formatRp(sim.remainder);
  rem.className = "v " + (sim.remainder < 0 ? "neg" : "pos");
  $("sim-runway").textContent = formatOneDecimal(sim.runway) + " bulan";
  const status = $("sim-status");
  if (sim.remainder < 0) {
    status.textContent = "Defisit " + formatRp(-sim.remainder) + " / bulan — dana darurat terkuras";
    status.classList.add("bad");
  } else if (sim.remainder === 0) {
    status.textContent = "Seimbang — zero-based, semua rupiah punya tugas";
    status.classList.remove("bad");
  } else {
    status.textContent = "Surplus " + formatRp(sim.remainder) + " / bulan — masuk dana darurat";
    status.classList.remove("bad");
  }
  // Twelve-month projection of the emergency balance.
  const projection = projectEmergency(h.emergency.balance, sim.remainder, 12);
  const box = $("projection");
  box.innerHTML = "";
  const max = Math.max(...projection, h.emergency.balance, 1);
  for (let i = 0; i < 12; i++) {
    const col = document.createElement("div");
    col.className = "col";
    const bar = document.createElement("i");
    // Pixel height (not %): the column's height is content-driven, so a %
    // height would collapse. 96 px leaves room for the month label below.
    bar.style.height = Math.max((projection[i] / max) * 96, 2) + "px";
    if (sim.remainder < 0) bar.style.background = "#a63a2e";
    const lab = document.createElement("span");
    lab.textContent = MONTHS_SHORT[i];
    col.appendChild(bar);
    col.appendChild(lab);
    col.title = MONTH_LABEL + " + " + (i + 1) + " bln: " + formatRp(projection[i]);
    box.appendChild(col);
  }
  $("proj-note").textContent =
    "Saldo dana darurat 12 bulan ke depan bila sisa akhir bulan ini berulang. " +
    "Sekarang " + formatRp(h.emergency.balance) + ", bulan ke-12: " + formatRp(projection[11]) + ".";
}

function renderAll() {
  renderStats();
  renderSinking();
  renderTable();
  renderWaterfall();
  renderSimulator();
}

function bindSimulator() {
  document.querySelectorAll(".scenarios button").forEach((btn) => {
    btn.addEventListener("click", () => {
      scenario = Number(btn.dataset.scenario);
      document.querySelectorAll(".scenarios button").forEach((b) => {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      renderSimulator();
    });
  });
  const sliders = [
    ["sl-makan", "makan", "out-makan"],
    ["sl-transport", "transport", "out-transport"],
    ["sl-hiburan", "hiburan", "out-hiburan"],
  ];
  for (const [inputId, key, outId] of sliders) {
    const input = $(inputId);
    input.addEventListener("input", () => {
      factors[key] = Number(input.value) / 100;
      $(outId).textContent = input.value + "%";
      renderSimulator();
    });
  }
}

function bindHouseholds() {
  document.querySelectorAll("[data-members]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentMembers = Number(btn.dataset.members);
      // Reset the simulator to the baseline when the household changes.
      scenario = 1;
      factors = { makan: 1, transport: 1, hiburan: 1 };
      document.querySelectorAll(".scenarios button").forEach((b) => {
        b.setAttribute("aria-pressed", String(Number(b.dataset.scenario) === 1));
      });
      for (const [inputId, key, outId] of [
        ["sl-makan", "makan", "out-makan"],
        ["sl-transport", "transport", "out-transport"],
        ["sl-hiburan", "hiburan", "out-hiburan"],
      ]) {
        $(inputId).value = 100;
        $(outId).textContent = "100%";
      }
      renderAll();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function bindActions() {
  $("btn-print").addEventListener("click", () => window.print());
  $("btn-export").addEventListener("click", () => {
    const h = household();
    const payload = {
      site: "DOMESTIC — anggaran rumah tangga",
      month: MONTH_LABEL,
      household: h.name,
      members: h.members,
      income: h.income,
      categories: h.categories,
      sinking: h.sinking,
      emergency: h.emergency,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "domestic-anggaran-" + h.members + "-anggota.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Deep-link a simulation, e.g. ?scenario=0.8&makan=115&hiburan=60 — so a
// shared link (or a screenshot) can open the simulator in a chosen state.
function applyDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const scn = Number(params.get("scenario"));
  if (scn === 0.8 || scn === 1 || scn === 1.1) {
    scenario = scn;
    document.querySelectorAll(".scenarios button").forEach((b) => {
      b.setAttribute("aria-pressed", String(Number(b.dataset.scenario) === scn));
    });
  }
  for (const [param, key, inputId, outId] of [
    ["makan", "makan", "sl-makan", "out-makan"],
    ["transport", "transport", "sl-transport", "out-transport"],
    ["hiburan", "hiburan", "sl-hiburan", "out-hiburan"],
  ]) {
    if (!params.has(param)) continue;
    const value = Number(params.get(param));
    if (Number.isFinite(value) && value >= 0 && value <= 150) {
      factors[key] = value / 100;
      $(inputId).value = value;
      $(outId).textContent = value + "%";
    }
  }
}

bindSimulator();
bindHouseholds();
bindActions();
applyDeepLink();
renderWaterfall();
renderSimulator();
