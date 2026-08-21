export const CLIENT_MESSAGE = {
  move: "move",
  interact: "interact",
  craft: "craft",
  farm: "farm",
} as const;

export const SERVER_MESSAGE = {
  feedback: "feedback",
} as const;

export interface MoveIntent {
  readonly sequence: number;
  readonly xAxis: -1 | 0 | 1;
  readonly yAxis: -1 | 0 | 1;
}

export interface InteractIntent {
  readonly targetId: string;
}

export interface CraftIntent {
  readonly recipeId: string;
}

export interface FarmIntent {
  readonly tileId: string;
  readonly action: "primary";
}

export interface ActionFeedback {
  readonly tone: "success" | "error";
  readonly code: string;
  readonly message: string;
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

/** Decodes one target interaction payload while rejecting unbounded or unsafe identifiers. */
export function decodeInteractIntent(value: unknown): InteractIntent | null {
  const candidate = recordFrom(value);
  return candidate && isStableId(candidate.targetId)
    ? { targetId: candidate.targetId }
    : null;
}

/** Decodes one recipe request without accepting client-provided costs or outputs. */
export function decodeCraftIntent(value: unknown): CraftIntent | null {
  const candidate = recordFrom(value);
  return candidate && isStableId(candidate.recipeId)
    ? { recipeId: candidate.recipeId }
    : null;
}

/** Decodes the single primary farm interaction while keeping state transitions server-owned. */
export function decodeFarmIntent(value: unknown): FarmIntent | null {
  const candidate = recordFrom(value);
  return candidate && isStableId(candidate.tileId) && candidate.action === "primary"
    ? { tileId: candidate.tileId, action: "primary" }
    : null;
}

/** Reports whether one unknown value is a legal digital movement axis. */
function isInputAxis(value: unknown): value is -1 | 0 | 1 {
  return value === -1 || value === 0 || value === 1;
}

/** Narrows one unknown message payload to a plain record boundary. */
function recordFrom(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

/** Accepts only bounded lowercase gameplay identifiers owned by shared definitions. */
function isStableId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9-]{1,64}$/u.test(value);
}
