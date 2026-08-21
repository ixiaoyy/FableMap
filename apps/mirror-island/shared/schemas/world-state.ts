import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import { WORLD_ID } from "../constants/simulation.ts";

export type FarmPhase = "untilled" | "tilled" | "growing" | "mature";

export class InventorySlotState extends Schema {
  @type("string")
  itemId = "";

  @type("uint16")
  quantity = 0;
}

export class PlayerState extends Schema {
  @type("number")
  x = 256;

  @type("number")
  y = 256;

  @type([InventorySlotState])
  inventory = new ArraySchema<InventorySlotState>();
}

export class ResourceNodeState extends Schema {
  @type("string")
  kind = "tree";

  @type("number")
  x = 0;

  @type("number")
  y = 0;

  @type("boolean")
  available = true;

  @type("uint32")
  revision = 1;
}

export class FarmTileState extends Schema {
  @type("number")
  x = 0;

  @type("number")
  y = 0;

  @type("string")
  phase: FarmPhase = "untilled";

  @type("string")
  cropId = "";

  @type("uint8")
  growthStage = 0;

  @type("boolean")
  watered = false;

  @type("number")
  readyAt = 0;
}

export class WorldState extends Schema {
  @type("string")
  worldId = WORLD_ID;

  @type({ map: PlayerState })
  players = new MapSchema<PlayerState>();

  @type({ map: ResourceNodeState })
  resources = new MapSchema<ResourceNodeState>();

  @type({ map: FarmTileState })
  farmTiles = new MapSchema<FarmTileState>();
}
