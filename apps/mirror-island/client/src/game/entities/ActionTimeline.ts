import type Phaser from "phaser";

export type ActionPhase = "idle" | "windup" | "impact" | "recovery";

export interface ActionTimelineConfig {
  readonly windupMs: number;
  readonly impactMs: number;
  readonly recoveryMs: number;
  readonly onWindup: () => void;
  readonly onImpact: () => void;
  readonly onRecovery?: () => void;
  readonly onComplete?: () => void;
}

export class ActionTimeline {
  private phase: ActionPhase = "idle";
  private readonly timers: Phaser.Time.TimerEvent[] = [];

  /** Creates one scene-clock action sequencer whose impact callback can mutate gameplay exactly once. */
  constructor(private readonly scene: Phaser.Scene) {}

  /** Reports whether windup, impact or recovery currently owns player interaction input. */
  isBusy(): boolean {
    return this.phase !== "idle";
  }

  /** Starts one closed action sequence and returns false when another action still owns the timeline. */
  play(config: ActionTimelineConfig): boolean {
    if (this.isBusy()) return false;
    validateDuration(config.windupMs);
    validateDuration(config.impactMs);
    validateDuration(config.recoveryMs);
    this.phase = "windup";
    config.onWindup();
    this.schedule(config.windupMs, () => {
      this.phase = "impact";
      config.onImpact();
      this.schedule(config.impactMs, () => {
        this.phase = "recovery";
        config.onRecovery?.();
        this.schedule(config.recoveryMs, () => {
          this.phase = "idle";
          config.onComplete?.();
        });
      });
    });
    return true;
  }

  /** Cancels pending scene-clock events and returns the sequencer to idle during region teardown. */
  cancel(): void {
    for (const timer of this.timers.splice(0)) timer.remove(false);
    this.phase = "idle";
  }

  /** Registers one owned scene timer and removes it from bookkeeping after execution. */
  private schedule(delayMs: number, callback: () => void): void {
    const timer = this.scene.time.delayedCall(delayMs, () => {
      const index = this.timers.indexOf(timer);
      if (index >= 0) this.timers.splice(index, 1);
      callback();
    });
    this.timers.push(timer);
  }
}

/** Requires one finite non-negative action phase duration. */
function validateDuration(value: number): void {
  if (!Number.isFinite(value) || value < 0) throw new Error("Action duration is invalid.");
}
