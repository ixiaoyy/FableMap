export type DayEndReason = "slept" | "passed-out";

export interface DaySettlementSnapshot {
  readonly phase: "idle" | "saving" | "failed";
  readonly reason: DayEndReason | null;
  readonly goldLost: number;
  readonly nextStamina: number;
}

export const IDLE_DAY_SETTLEMENT: DaySettlementSnapshot = {
  phase: "idle",
  reason: null,
  goldLost: 0,
  nextStamina: 0,
};
