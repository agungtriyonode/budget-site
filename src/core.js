// DOMESTIC — pure budget math for the household budget site.
// No Date, no Math.random, no Intl: every result is a pure function of its
// inputs, so the same inputs always give the same figures, in the generator
// (main.ts validation) and in the browser (app/core.js mirrors this file).
// All money is integer rupiah (the smallest unit); nothing here uses decimals.

export function sumAmounts(items) {
  let total = 0;
  for (const item of items) total += item.amount;
  return total;
}

// Format integer rupiah with dot thousands separators, e.g. 14700000 -> "Rp 14.700.000".
// Negative values keep the minus in front: -2940000 -> "-Rp 2.940.000".
export function formatRp(n) {
  const negative = n < 0;
  let digits = String(negative ? -n : n);
  let grouped = "";
  while (digits.length > 3) {
    grouped = "." + digits.slice(-3) + grouped;
    digits = digits.slice(0, -3);
  }
  grouped = digits + grouped;
  return (negative ? "-" : "") + "Rp " + grouped;
}

// One decimal percent with a comma decimal separator, e.g. 21.8 -> "21,8%".
export function formatPct(value) {
  const rounded = Math.round(value * 10) / 10;
  const whole = Math.floor(rounded);
  const frac = Math.round((rounded - whole) * 10);
  return whole + "," + frac + "%";
}

// Zero-based budget: income minus every allocated category. A healthy
// zero-based budget allocates everything, so remainder is exactly 0.
export function zeroBased(income, categories) {
  const allocated = sumAmounts(categories);
  return { allocated, remainder: income - allocated };
}

// A sinking fund turns a known yearly cost into a monthly set-aside.
export function sinkingMonthly(annual) {
  return Math.floor(annual / 12);
}

// Progress of one sinking fund toward its yearly target, 0..100.
export function sinkingProgress(saved, annual) {
  if (annual <= 0) return 0;
  const pct = (saved / annual) * 100;
  if (pct < 0) return 0;
  if (pct > 100) return 100;
  return Math.round(pct * 10) / 10;
}

// Essentials are everything except fun (hiburan) and clothing (pakaian):
// the spending a household cannot switch off in a bad month.
export function essentialMonthly(categories) {
  let total = 0;
  for (const cat of categories) {
    if (cat.id === "hiburan" || cat.id === "pakaian") continue;
    total += cat.amount;
  }
  return total;
}

// How many months the emergency balance covers essential spending.
// One decimal, e.g. 2.9.
export function runwayMonths(emergencyBalance, essential) {
  if (essential <= 0) return 0;
  return Math.round((emergencyBalance / essential) * 10) / 10;
}

// What-if simulation: scale three flexible categories and the income, then
// recompute the month-end forecast. `factors` holds multipliers such as
// { makan: 1.1, transport: 1, hiburan: 0.5, income: 0.8 }.
export function simulate(household, factors) {
  const income = Math.round(sumAmounts(household.income) * factors.income);
  const categories = household.categories.map((cat) => {
    const factor = factors[cat.id] === undefined ? 1 : factors[cat.id];
    return { ...cat, amount: Math.round(cat.amount * factor) };
  });
  const allocated = sumAmounts(categories);
  const remainder = income - allocated;
  const essential = essentialMonthly(categories);
  const runway = runwayMonths(household.emergency.balance, essential);
  return { income, categories, allocated, remainder, essential, runway };
}

// Waterfall segments: each category's share of income, in percent.
export function waterfallShares(income, categories) {
  return categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    amount: cat.amount,
    share: income > 0 ? (cat.amount / income) * 100 : 0,
  }));
}

// Twelve-month projection of the emergency balance when the simulated
// month-end remainder repeats every month. Never drops below zero.
export function projectEmergency(balance, monthlyRemainder, months) {
  const out = [];
  let current = balance;
  for (let i = 0; i < months; i++) {
    current += monthlyRemainder;
    if (current < 0) current = 0;
    out.push(current);
  }
  return out;
}
