import { Category, Method, Objective, Transaction } from "./api";

export const METHOD_ORDER: Method[] = ["efectivo", "transferencia", "tarjeta de débito", "tarjeta de crédito"];

const MESES_LARGOS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Un mes se identifica como "AAAA-MM", el mismo prefijo que tienen las fechas ISO de las transacciones. */
export type MonthKey = string;

export function currentMonthKey(): MonthKey {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(key: MonthKey, delta: number): MonthKey {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key: MonthKey): string {
  const [y, m] = key.split("-").map(Number);
  return `${MESES_LARGOS[m - 1]} ${y}`;
}

export type Summary = {
  /** Saldo acumulado de todo el historial (no depende del mes elegido). */
  balance: number;
  /** Saldo acumulado por medio de pago. */
  byMethod: Record<Method, number>;
  /** Ingresos del mes, sin contar retiros de metas. */
  income: number;
  /** Gastos del mes, sin contar plata apartada en metas. */
  expense: number;
  /** Apartado neto en metas durante el mes (apartados menos retiros). Puede ser negativo. */
  savingsNet: number;
  /** Cantidad de movimientos del mes (incluye los de ahorro). */
  monthCount: number;
};

const signed = (t: Transaction) => (t.transaction_type === "ingreso" ? t.amount : -t.amount);

/**
 * Calcula todo lo que muestra el Dashboard a partir de la lista de transacciones.
 *
 * Decisión de diseño: los movimientos de categoría "ahorro" (apartar o retirar de una meta) no
 * cuentan como gasto ni como ingreso del mes — apartar plata no es gastarla —, se agrupan
 * aparte en `savingsNet`. El saldo, en cambio, sí los incluye: apartar baja el disponible.
 */
export function computeSummary(transactions: Transaction[], month: MonthKey): Summary {
  const byMethod = Object.fromEntries(METHOD_ORDER.map((m) => [m, 0])) as Record<Method, number>;
  let balance = 0;
  let income = 0;
  let expense = 0;
  let savingsNet = 0;
  let monthCount = 0;

  for (const t of transactions) {
    balance += signed(t);
    byMethod[t.method] = (byMethod[t.method] ?? 0) + signed(t);

    if (t.date.slice(0, 7) !== month) continue;
    monthCount += 1;

    if (t.category === "ahorro") {
      savingsNet += t.transaction_type === "gasto" ? t.amount : -t.amount;
    } else if (t.transaction_type === "ingreso") {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  }

  return { balance, byMethod, income, expense, savingsNet, monthCount };
}

export type CategoryTotal = {
  category: Category;
  total: number;
  /** Fracción (0–1) del gasto total del mes que representa esta categoría. */
  share: number;
};

/**
 * Gasto del mes agrupado por categoría, de mayor a menor. Excluye "ahorro": apartar plata
 * en una meta no es gastarla (ver `computeSummary`).
 */
export function categoryBreakdown(transactions: Transaction[], month: MonthKey): CategoryTotal[] {
  const totals = new Map<Category, number>();
  let sum = 0;

  for (const t of transactions) {
    if (t.transaction_type !== "gasto" || t.category === "ahorro" || t.date.slice(0, 7) !== month) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
    sum += t.amount;
  }

  return [...totals.entries()]
    .map(([category, total]) => ({ category, total, share: sum > 0 ? total / sum : 0 }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Las metas que conviene destacar en el Dashboard (máximo `limit`): primero las que tienen
 * monto objetivo y ya están en camino, de la más avanzada a la menos; luego los apartados
 * abiertos con más plata; y por último las ya logradas.
 */
export function featuredObjectives(objectives: Objective[], limit = 3): Objective[] {
  const ratio = (o: Objective) => (o.target_amount ? o.saved_amount / o.target_amount : 0);
  const inProgress = objectives.filter((o) => o.target_amount && ratio(o) < 1).sort((a, b) => ratio(b) - ratio(a));
  const open = objectives.filter((o) => !o.target_amount).sort((a, b) => b.saved_amount - a.saved_amount);
  const done = objectives.filter((o) => o.target_amount && ratio(o) >= 1);
  return [...inProgress, ...open, ...done].slice(0, limit);
}
