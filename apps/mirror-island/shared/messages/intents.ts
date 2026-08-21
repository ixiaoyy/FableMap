export const CLIENT_MESSAGE = {
  move: "move",
} as const;

export interface MoveIntent {
  readonly sequence: number;
  readonly xAxis: -1 | 0 | 1;
  readonly yAxis: -1 | 0 | 1;
}

/** Decodes one untrusted movement payload into bounded input axes and a monotonic sequence. */
export function decodeMoveIntent(value: unknown): MoveIntent | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;
  if (!Number.isSafeInteger(candidate.sequence) || Number(candidate.sequence) < 0) return null;
  if (!isInputAxis(candidate.xAxis) || !isInputAxis(candidate.yAxis)) return null;
  return {
    sequence: Number(candidate.sequence),
    xAxis: candidate.xAxis,
    yAxis: candidate.yAxis,
  };
}

/** Reports whether one unknown value is a legal digital movement axis. */
function isInputAxis(value: unknown): value is -1 | 0 | 1 {
  return value === -1 || value === 0 || value === 1;
}
