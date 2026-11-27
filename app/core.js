// DOMESTIC — pure budget math, browser copy.
// Mirrors src/core.js (same functions, same results): the generator validates
// the prerendered page with src/core.js, the browser recomputes live with
// this file. No Date, no Math.random, no Intl. Money is integer rupiah.

export function sumAmounts(items) {
  let total = 0;
  for (const item of items) total += item.amount;
  return total;
}

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

export function formatPct(value) {
  const rounded = Math.round(value * 10) / 10;
  const whole = Math.floor(rounded);
  const frac = Math.round((rounded - whole) * 10);
  return whole + "," + frac + "%";
}

export function zeroBased(income, categories) {
  const allocated = sumAmounts(categories);
  return { allocated, remainder: income - allocated };
}

export function sinkingMonthly(annual) {
  return Math.floor(annual / 12);
}

export function sinkingProgress(saved, annual) {
  if (annual <= 0) return 0;
  const pct = (saved / annual) * 100;
  if (pct < 0) return 0;
  if (pct > 100) return 100;
  return Math.round(pct * 10) / 10;
}

export function essentialMonthly(categories) {
  let total = 0;
  for (const cat of categories) {
    if (cat.id === "hiburan" || cat.id === "pakaian") continue;
    total += cat.amount;
  }
  return total;
}

export function runwayMonths(emergencyBalance, essential) {
  if (essential <= 0) return 0;
  return Math.round((emergencyBalance / essential) * 10) / 10;
}

// One decimal with a comma separator, e.g. 2.95 -> "3,0".
export function formatOneDecimal(value) {
  const rounded = Math.round(value * 10) / 10;
  const whole = Math.floor(rounded);
  const frac = Math.round((rounded - whole) * 10);
  return whole + "," + frac;
}

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

export function waterfallShares(income, categories) {
  return categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    amount: cat.amount,
    share: income > 0 ? (cat.amount / income) * 100 : 0,
  }));
}

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
