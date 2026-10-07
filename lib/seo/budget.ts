export const WARN_LEVELS = [0.5, 0.75, 0.9, 1] as const;
export const monthKey = (d: Date) => d.toISOString().slice(0, 7);

export type BudgetState = {
  cap: number;
  spent: number;
  reserved: number;
  used: number; // spent + reserved
  ratio: number | null; // null when no budget is configured
  warning: 0 | 0.5 | 0.75 | 0.9 | 1;
};
/** A cap of 0 means "no AI spending allowed", never "unlimited". */
export function budgetState(cap: number, spent: number, reserved: number): BudgetState {
  const used = spent + reserved;
  const ratio = cap > 0 ? used / cap : null;
  const warning = ratio === null ? (used > 0 ? 1 : 0) : ([...WARN_LEVELS].reverse().find((w) => ratio >= w) ?? 0);
  return { cap, spent, reserved, used, ratio, warning };
}
export function canReserve(state: BudgetState, estimatedUsd: number) {
  return state.cap > 0 && estimatedUsd >= 0 && state.used + estimatedUsd <= state.cap + 1e-9;
}
