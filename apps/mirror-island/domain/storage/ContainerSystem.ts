import { InventorySystem, type InventoryStackExpectation, type InventoryTransferAmount } from "../inventory/InventorySystem.ts";
import { getItemDefinition } from "../items/definitions.ts";
import type { GameState } from "../state/game-state.ts";
import { isChestColorId, type ChestWorldObject } from "../world/world-object-state.ts";

export type ContainerResult = "changed" | "unchanged" | "missing-chest" | "too-far" | "invalid-transfer" | "invalid-color";

export class ContainerSystem {
  /** Reuses the inventory owner for every stack operation; storage adds only reachability and container identity. */
  constructor(private readonly inventory: InventorySystem) {}

  /** Transfers the selected complete intent in either direction; invalid expectations or capacity leave both owners unchanged. */
  transfer(state: GameState, objectId: string, direction: "deposit" | "withdraw", sourceIndex: number,
    destinationIndex: number, amount: InventoryTransferAmount = "stack", expected?: InventoryStackExpectation): ContainerResult {
    const chest = this.chest(state, objectId);
    if (typeof chest === "string") return chest;
    if (direction !== "deposit" && direction !== "withdraw") return "invalid-transfer";
    const source = direction === "deposit" ? state.inventory : chest.slots;
    const destination = direction === "deposit" ? chest.slots : state.inventory;
    return this.inventory.transfer(source, sourceIndex, destination, destinationIndex, amount, expected) ? "changed" : "invalid-transfer";
  }

  /** Adds only to already-present matching chest stacks on cloned arrays, then publishes both arrays together. */
  addToExistingStacks(state: GameState, objectId: string): ContainerResult {
    const chest = this.chest(state, objectId);
    if (typeof chest === "string") return chest;
    const from = state.inventory.map((slot) => ({ ...slot }));
    const to = chest.slots.map((slot) => ({ ...slot }));
    let changed = false;
    for (let sourceIndex = 0; sourceIndex < from.length; sourceIndex += 1) {
      const source = from[sourceIndex]!;
      const item = getItemDefinition(source.itemId);
      if (!item) continue;
      for (let targetIndex = 0; targetIndex < to.length; targetIndex += 1) {
        const target = to[targetIndex]!;
        if (target.itemId !== source.itemId || source.quantity === 0) continue;
        const quantity = Math.min(source.quantity, item.maxStack - target.quantity);
        if (quantity < 1) continue;
        if (!this.inventory.addAt(to, targetIndex, item.id, quantity) || !this.inventory.consumeAt(from, sourceIndex, quantity)) {
          throw new Error("Validated existing-stack transfer could not be applied.");
        }
        changed = true;
      }
    }
    if (!changed) return "unchanged";
    this.inventory.restore(state.inventory, from);
    this.inventory.restore(chest.slots, to);
    return "changed";
  }

  /** Sorts the chest with the shared stable catalog order, including tools because only backpack tool slots are pinned. */
  sort(state: GameState, objectId: string): ContainerResult {
    const chest = this.chest(state, objectId);
    if (typeof chest === "string") return chest;
    return this.inventory.sort(chest.slots, false) ? "changed" : "unchanged";
  }

  /** Applies one free persistent color from the closed default-plus-twenty palette. */
  setColor(state: GameState, objectId: string, colorId: unknown): ContainerResult {
    const chest = this.chest(state, objectId);
    if (typeof chest === "string") return chest;
    if (!isChestColorId(colorId)) return "invalid-color";
    if (chest.colorId === colorId) return "unchanged";
    chest.colorId = colorId;
    return "changed";
  }

  /** Resolves one nearby chest; moving the player away invalidates an already-open client panel safely. */
  private chest(state: GameState, id: string): ChestWorldObject | "missing-chest" | "too-far" {
    const object = state.worldObjects.find((candidate) => candidate.id === id);
    if (!object || object.kind !== "chest" || object.regionId !== state.player.regionId) return "missing-chest";
    if (Math.hypot(state.player.x - (object.column * 16 + 8), state.player.y - (object.row * 16 + 8)) > 48) return "too-far";
    return object;
  }
}
