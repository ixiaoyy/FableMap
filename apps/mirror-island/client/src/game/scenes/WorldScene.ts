import Phaser from "phaser";
import { WORLD_HEIGHT_PIXELS, WORLD_WIDTH_PIXELS } from "../../../../shared/constants/simulation.ts";
import { sendMoveIntent } from "../../network/world-connection.ts";
import { subscribeWorldProjection, type PlayerProjection, type WorldProjection } from "../../stores/world-store.ts";

interface PlayerView {
  readonly container: Phaser.GameObjects.Container;
  readonly body: Phaser.GameObjects.Arc;
  readonly label: Phaser.GameObjects.Text;
}

export class WorldScene extends Phaser.Scene {
  private readonly playerViews = new Map<string, PlayerView>();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private stopProjection?: () => void;
  private previousXAxis: -1 | 0 | 1 = 0;
  private previousYAxis: -1 | 0 | 1 = 0;
  private lastInputSentAt = 0;

  constructor() {
    super("World");
  }

  /** Creates the code-drawn world surface, input bindings and typed projection subscription. */
  create(): void {
    this.drawWorld();
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable.");
    this.cursors = keyboard.createCursorKeys();
    this.movementKeys = keyboard.addKeys("W,A,S,D") as Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
    this.stopProjection = subscribeWorldProjection((projection) => this.renderProjection(projection));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopProjection?.());
  }

  /** Converts keyboard state into digital intent only when the axes change. */
  override update(time: number): void {
    const xAxis = toAxis(
      Number(this.cursors.right.isDown || this.movementKeys.D.isDown)
      - Number(this.cursors.left.isDown || this.movementKeys.A.isDown),
    );
    const yAxis = toAxis(
      Number(this.cursors.down.isDown || this.movementKeys.S.isDown)
      - Number(this.cursors.up.isDown || this.movementKeys.W.isDown),
    );
    const axesChanged = xAxis !== this.previousXAxis || yAxis !== this.previousYAxis;
    if (!axesChanged && time - this.lastInputSentAt < 250) return;
    this.previousXAxis = xAxis;
    this.previousYAxis = yAxis;
    this.lastInputSentAt = time;
    sendMoveIntent(xAxis, yAxis);
  }

  /** Draws a restrained alien field grid without introducing unreviewed image assets. */
  private drawWorld(): void {
    this.cameras.main.setBackgroundColor("#0b1714");
    const graphics = this.add.graphics();
    graphics.fillStyle(0x183228, 1).fillRect(0, 0, WORLD_WIDTH_PIXELS, WORLD_HEIGHT_PIXELS);
    graphics.lineStyle(1, 0x345a46, 0.28);
    for (let coordinate = 0; coordinate <= WORLD_WIDTH_PIXELS; coordinate += 32) {
      graphics.lineBetween(coordinate, 0, coordinate, WORLD_HEIGHT_PIXELS);
      graphics.lineBetween(0, coordinate, WORLD_WIDTH_PIXELS, coordinate);
    }
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH_PIXELS, WORLD_HEIGHT_PIXELS);
  }

  /** Creates, moves and removes player views from a complete authoritative projection. */
  private renderProjection(projection: WorldProjection): void {
    const activeIds = new Set(projection.players.map((player) => player.sessionId));
    for (const [sessionId, view] of this.playerViews) {
      if (!activeIds.has(sessionId)) {
        view.container.destroy(true);
        this.playerViews.delete(sessionId);
      }
    }
    for (const player of projection.players) {
      const view = this.playerViews.get(player.sessionId) ?? this.createPlayerView(player, projection.selfSessionId);
      view.container.setPosition(player.x, player.y);
    }
  }

  /** Creates one ephemeral player marker and stores it under the Colyseus session ID. */
  private createPlayerView(player: PlayerProjection, selfSessionId: string): PlayerView {
    const isSelf = player.sessionId === selfSessionId;
    const body = this.add.circle(0, 0, 8, isSelf ? 0xb8ff62 : 0xffb65a, 1).setStrokeStyle(2, 0x07100d, 1);
    const label = this.add.text(0, -17, isSelf ? "YOU" : "SIGNAL", {
      color: isSelf ? "#dfffad" : "#ffd6a1",
      fontFamily: "monospace",
      fontSize: "8px",
    }).setOrigin(0.5);
    const container = this.add.container(player.x, player.y, [body, label]);
    const view = { container, body, label };
    this.playerViews.set(player.sessionId, view);
    return view;
  }
}

/** Converts one signed integer difference into the exact network axis union. */
function toAxis(value: number): -1 | 0 | 1 {
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}
