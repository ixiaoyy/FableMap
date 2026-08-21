import { MapSchema, Schema, type } from "@colyseus/schema";
import { WORLD_ID } from "../constants/simulation.ts";

export class PlayerState extends Schema {
  @type("number")
  x = 256;

  @type("number")
  y = 256;
}

export class WorldState extends Schema {
  @type("string")
  worldId = WORLD_ID;

  @type({ map: PlayerState })
  players = new MapSchema<PlayerState>();
}
