export interface WorldPoint {
  readonly x: number;
  readonly y: number;
}

export interface WorldRect extends WorldPoint {
  readonly width: number;
  readonly height: number;
}

export interface CollisionGrid {
  readonly columns: number;
  readonly rows: number;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly blocked: readonly boolean[];
}

export interface ExitDefinition extends WorldRect {
  readonly id: string;
  readonly targetRegionId: string;
  readonly targetSpawnId: string;
}

export interface ResourceSpawnDefinition extends WorldPoint {
  readonly entityId: string;
  readonly regionId: string;
  readonly kind: "tree" | "stone";
}

export interface InteractionDefinition extends WorldRect {
  readonly entityId: string;
  readonly regionId: string;
  readonly kind: "farm-plot" | "door" | "bed";
}

export interface NpcSpawnDefinition extends WorldPoint {
  readonly entityId: string;
  readonly regionId: string;
  readonly npcId: string;
  readonly dialogueId: string;
  readonly interactionType: "shop" | "dialogue";
}

export interface RegionDefinition {
  readonly id: string;
  readonly mapKey: string;
  readonly displayName: string;
  readonly defaultSpawnId: string;
  readonly isStartRegion: boolean;
  readonly widthPixels: number;
  readonly heightPixels: number;
  readonly collision: CollisionGrid;
  readonly spawns: Readonly<Record<string, WorldPoint>>;
  readonly exits: readonly ExitDefinition[];
  readonly resources: readonly ResourceSpawnDefinition[];
  readonly interactions: readonly InteractionDefinition[];
  readonly npcs: readonly NpcSpawnDefinition[];
}

export class WorldCatalog {
  private readonly regions = new Map<string, RegionDefinition>();
  private readonly resources = new Map<string, ResourceSpawnDefinition>();
  private readonly interactions = new Map<string, InteractionDefinition>();
  private readonly npcs = new Map<string, NpcSpawnDefinition>();
  readonly startRegionId: string;

  /** Builds a validated immutable lookup catalog from decoded region definitions. */
  constructor(definitions: readonly RegionDefinition[]) {
    if (definitions.length === 0) throw new Error("World catalog requires at least one region.");
    for (const definition of definitions) this.registerRegion(definition);
    const startRegions = definitions.filter((definition) => definition.isStartRegion);
    if (startRegions.length !== 1) throw new Error("World catalog requires exactly one start region.");
    this.startRegionId = startRegions[0]!.id;
    this.validateExitTargets();
  }

  /** Returns one region or throws when a save or command references an unknown ID. */
  requireRegion(regionId: string): RegionDefinition {
    const region = this.regions.get(regionId);
    if (!region) throw new Error(`Unknown region: ${regionId}.`);
    return region;
  }

  /** Returns the reviewed default spawn for one region. */
  requireDefaultSpawn(regionId: string): WorldPoint {
    const region = this.requireRegion(regionId);
    return this.requireSpawn(regionId, region.defaultSpawnId);
  }

  /** Returns one named spawn within its owning region. */
  requireSpawn(regionId: string, spawnId: string): WorldPoint {
    const spawn = this.requireRegion(regionId).spawns[spawnId];
    if (!spawn) throw new Error(`Unknown spawn ${spawnId} in region ${regionId}.`);
    return spawn;
  }

  /** Returns one stable resource spawn or null when the ID is not part of the world catalog. */
  resource(entityId: string): ResourceSpawnDefinition | null {
    return this.resources.get(entityId) ?? null;
  }

  /** Returns one stable interaction spawn or null when the ID is not part of the world catalog. */
  interaction(entityId: string): InteractionDefinition | null {
    return this.interactions.get(entityId) ?? null;
  }

  /** Returns one stable NPC spawn or null when the ID is not part of the world catalog. */
  npc(entityId: string): NpcSpawnDefinition | null {
    return this.npcs.get(entityId) ?? null;
  }

  /** Returns the exit containing one world-space point, or null outside all exits. */
  exitAt(regionId: string, x: number, y: number): ExitDefinition | null {
    return this.requireRegion(regionId).exits.find((exit) => (
      x >= exit.x
      && y >= exit.y
      && x <= exit.x + exit.width
      && y <= exit.y + exit.height
    )) ?? null;
  }

  /** Reports whether a player hitbox centered at the point overlaps blocked or out-of-bounds tiles. */
  isBlocked(regionId: string, x: number, y: number, halfWidth = 5, halfHeight = 4): boolean {
    const region = this.requireRegion(regionId);
    const samples = [
      [x - halfWidth, y - halfHeight],
      [x + halfWidth, y - halfHeight],
      [x - halfWidth, y + halfHeight],
      [x + halfWidth, y + halfHeight],
    ] as const;
    return samples.some(([sampleX, sampleY]) => this.isBlockedPoint(region, sampleX, sampleY))
      || this.overlapsNpcFeet(region, x, y, halfWidth, halfHeight);
  }

  /** Returns all region definitions in deterministic insertion order for Phaser preload and rendering. */
  allRegions(): readonly RegionDefinition[] {
    return Array.from(this.regions.values());
  }

  /** Registers one region and all globally stable entity IDs without accepting duplicates. */
  private registerRegion(definition: RegionDefinition): void {
    assertStableId(definition.id, "Region ID");
    if (this.regions.has(definition.id)) throw new Error(`Duplicate region ID: ${definition.id}.`);
    if (!definition.spawns[definition.defaultSpawnId]) {
      throw new Error(`Default spawn is missing in region ${definition.id}.`);
    }
    this.validateRegionBounds(definition);
    const exitIds = new Set<string>();
    for (const exit of definition.exits) {
      assertStableId(exit.id, "Exit ID");
      if (exitIds.has(exit.id)) throw new Error(`Duplicate exit ID in region ${definition.id}: ${exit.id}.`);
      exitIds.add(exit.id);
    }
    this.regions.set(definition.id, definition);
    const defaultSpawn = definition.spawns[definition.defaultSpawnId]!;
    if (this.isBlocked(definition.id, defaultSpawn.x, defaultSpawn.y)) {
      throw new Error(`Default spawn is blocked in region ${definition.id}.`);
    }
    for (const resource of definition.resources) this.registerEntity(this.resources, resource.entityId, resource);
    for (const interaction of definition.interactions) {
      this.registerEntity(this.interactions, interaction.entityId, interaction);
    }
    for (const npc of definition.npcs) this.registerEntity(this.npcs, npc.entityId, npc);
  }

  /** Adds one globally stable entity ID to its typed index and rejects cross-region duplicates. */
  private registerEntity<T>(index: Map<string, T>, entityId: string, value: T): void {
    assertStableId(entityId, "Entity ID");
    if (this.resources.has(entityId) || this.interactions.has(entityId) || this.npcs.has(entityId)) {
      throw new Error(`Duplicate world entity ID: ${entityId}.`);
    }
    index.set(entityId, value);
  }

  /** Verifies every exit points to a decoded region and named spawn before gameplay begins. */
  private validateExitTargets(): void {
    for (const region of this.regions.values()) {
      for (const exit of region.exits) this.requireSpawn(exit.targetRegionId, exit.targetSpawnId);
    }
  }

  /** Verifies decoded collision dimensions and every Tiled-owned point or rectangle stays in its region. */
  private validateRegionBounds(region: RegionDefinition): void {
    const grid = region.collision;
    if (
      grid.columns * grid.tileWidth !== region.widthPixels
      || grid.rows * grid.tileHeight !== region.heightPixels
      || grid.blocked.length !== grid.columns * grid.rows
    ) {
      throw new Error(`Collision grid dimensions are invalid in region ${region.id}.`);
    }
    for (const [spawnId, point] of Object.entries(region.spawns)) {
      assertStableId(spawnId, "Spawn ID");
      this.assertPointInside(region, point, `Spawn ${spawnId}`);
    }
    for (const resource of region.resources) this.assertPointInside(region, resource, `Resource ${resource.entityId}`);
    for (const npc of region.npcs) this.assertPointInside(region, npc, `NPC ${npc.entityId}`);
    for (const exit of region.exits) this.assertRectInside(region, exit, `Exit ${exit.id}`);
    for (const interaction of region.interactions) {
      this.assertRectInside(region, interaction, `Interaction ${interaction.entityId}`);
    }
  }

  /** Requires one catalog point to remain inside the finite pixel boundary. */
  private assertPointInside(region: RegionDefinition, point: WorldPoint, label: string): void {
    if (point.x < 0 || point.y < 0 || point.x >= region.widthPixels || point.y >= region.heightPixels) {
      throw new Error(`${label} is outside region ${region.id}.`);
    }
  }

  /** Requires one catalog rectangle to be positive and fully contained in its finite region. */
  private assertRectInside(region: RegionDefinition, rect: WorldRect, label: string): void {
    if (
      rect.width <= 0
      || rect.height <= 0
      || rect.x < 0
      || rect.y < 0
      || rect.x + rect.width > region.widthPixels
      || rect.y + rect.height > region.heightPixels
    ) {
      throw new Error(`${label} is outside region ${region.id}.`);
    }
  }

  /** Tests one player foot box against fixed dialogue-NPC feet without trapping legacy shop positions. */
  private overlapsNpcFeet(
    region: RegionDefinition,
    x: number,
    y: number,
    halfWidth: number,
    halfHeight: number,
  ): boolean {
    const npcHalfWidth = 5;
    const npcHalfHeight = 3;
    return region.npcs.some((npc) => (
      npc.interactionType === "dialogue"
      && Math.abs(x - npc.x) < halfWidth + npcHalfWidth
      && Math.abs(y - npc.y) < halfHeight + npcHalfHeight
    ));
  }

  /** Tests one world-space point against the finite collision grid and region boundary. */
  private isBlockedPoint(region: RegionDefinition, x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= region.widthPixels || y >= region.heightPixels) return true;
    const column = Math.floor(x / region.collision.tileWidth);
    const row = Math.floor(y / region.collision.tileHeight);
    return region.collision.blocked[row * region.collision.columns + column] ?? true;
  }
}

/** Requires one lowercase, URL-safe stable identifier for persisted world references. */
export function assertStableId(value: string, label: string): void {
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/u.test(value)) throw new Error(`${label} is invalid.`);
}
