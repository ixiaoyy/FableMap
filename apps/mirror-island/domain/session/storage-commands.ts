import { BuildingServiceSystem } from "../building/BuildingServiceSystem.ts";
import { CraftingSystem } from "../crafting/CraftingSystem.ts";
import { InventorySystem } from "../inventory/InventorySystem.ts";
import { ITEM_ID, getItemDefinition } from "../items/definitions.ts";
import { UpgradeSystem } from "../progression/UpgradeSystem.ts";
import { ShippingSystem } from "../shipping/ShippingSystem.ts";
import type { GameState } from "../state/game-state.ts";
import { ContainerSystem } from "../storage/ContainerSystem.ts";
import { WorldDropSystem } from "../world/WorldDropSystem.ts";
import { WorldObjectSystem } from "../world/WorldObjectSystem.ts";
import { WorldOccupancySystem } from "../world/WorldOccupancySystem.ts";
import type { NpcSpawnDefinition, WorldCatalog } from "../world/regions.ts";
import type { ActionFeedback, GameCommand, StorageCommand } from "./commands.ts";

const STORAGE_COMMAND_TYPES = new Set<string>([
  "move-inventory", "sort-inventory", "rotate-hotbar-row", "craft-item", "buy-backpack-upgrade", "place-world-object",
  "transfer-container-item", "move-container-item", "add-to-existing-stacks", "sort-container", "set-chest-color",
  "recover-empty-chest", "push-chest", "collect-world-drop", "ship-item", "reclaim-last-shipment",
  "build-shipping-bin", "move-farm-building", "demolish-farm-building", "dismiss-day-settlement", "retry-storage-save",
]);

/** Narrows the closed new command family before the session enters its candidate-save transaction. */
export function isStorageCommand(command: GameCommand): command is StorageCommand {
  return STORAGE_COMMAND_TYPES.has(command.type);
}

export class StorageCommandSystem {
  private readonly crafting: CraftingSystem;
  private readonly upgrades: UpgradeSystem;
  private readonly containers: ContainerSystem;
  private readonly objects: WorldObjectSystem;
  private readonly drops: WorldDropSystem;
  private readonly shipping: ShippingSystem;
  private readonly building: BuildingServiceSystem;
  private readonly occupancy: WorldOccupancySystem;

  /** Composes narrow rule owners; this coordinator never saves or publishes the supplied isolated candidate. */
  constructor(private readonly catalog: WorldCatalog, private readonly inventory: InventorySystem) {
    this.crafting = new CraftingSystem(inventory);
    this.upgrades = new UpgradeSystem(inventory);
    this.containers = new ContainerSystem(inventory);
    this.objects = new WorldObjectSystem(inventory, catalog);
    this.drops = new WorldDropSystem(inventory);
    this.shipping = new ShippingSystem(inventory);
    this.building = new BuildingServiceSystem(inventory, catalog);
    this.occupancy = new WorldOccupancySystem(catalog);
  }

  /** Reports whether a current stable object ID is reachable without performing an open or mutation. */
  canInteract(state: GameState, objectId: string): boolean { return this.objects.interact(state, objectId) === "opened"; }

  /** Projects exact carpenter availability from the same runtime NPC positions used by gameplay. */
  buildingServiceAvailable(state: GameState, npcs: readonly NpcSpawnDefinition[], interactionId: string): boolean {
    return this.building.serviceAvailable(state, npcs, interactionId);
  }

  /** Projects a placement candidate into a small UI result; full occupancy and side effects stay in domain owners. */
  placementPreview(state: GameState, npcs: readonly NpcSpawnDefinition[], kind: "chest" | "shipping-bin", column: number, row: number, ignoreId?: string) {
    const regionId = kind === "shipping-bin" ? "farm" : state.player.regionId;
    if (kind === "chest" && Math.hypot(state.player.x - (column * 16 + 8), state.player.y - (row * 16 + 8)) > 48) {
      return { valid: false, message: "走近一些，再选择摆放位置。" };
    }
    const result = this.occupancy.placement(state, kind, regionId, column, row, ignoreId, npcs);
    const message = result.status === "blocked" ? "此处有阻挡，或不允许摆放。"
      : result.status === "clear-on-place" ? "可以建造；此处的空耕地将被清除。"
      : result.status === "relocate-on-place" ? `可以建造；会先把伙伴移到安全处${result.clearFarmTileIds.length ? "，并清除空耕地" : ""}。`
      : "可以摆放。";
    return { valid: result.allowed, message };
  }

  /** Applies one reviewed intent to a disposable candidate; success is only published after the session saves it. */
  apply(state: GameState, npcs: readonly NpcSpawnDefinition[], command: StorageCommand): ActionFeedback {
    let result: string;
    switch (command.type) {
      case "move-inventory": result = this.inventory.transfer(state.inventory, command.sourceIndex, state.inventory, command.targetIndex, command.amount) ? "changed" : "invalid-transfer"; break;
      case "sort-inventory": result = this.inventory.sort(state.inventory) ? "changed" : "unchanged"; break;
      case "rotate-hotbar-row": result = this.inventory.rotateHotbarRow(state.inventory, command.direction) ? "changed" : "unchanged"; break;
      case "craft-item": result = this.crafting.craft(state, command.recipeId, command.quantity, command.targetIndex); break;
      case "buy-backpack-upgrade": result = this.upgrades.upgradeBackpack(state, this.catalog, command.interactionId); break;
      case "place-world-object": result = this.objects.placeChest(state, command.inventoryIndex, state.player.regionId, command.column, command.row, npcs); break;
      case "transfer-container-item": {
        if (command.direction !== "to-chest" && command.direction !== "from-chest") return storageFeedback("invalid-transfer");
        result = this.containers.transfer(state, command.objectId,
          command.direction === "to-chest" ? "deposit" : "withdraw", command.sourceIndex, command.targetIndex, command.amount);
        break;
      }
      case "move-container-item": {
        const chest = state.worldObjects.find((object) => object.id === command.objectId && object.kind === "chest");
        result = chest?.kind === "chest" && this.canInteract(state, chest.id)
          ? this.inventory.transfer(chest.slots, command.sourceIndex, chest.slots, command.targetIndex, command.amount) ? "changed" : "invalid-transfer"
          : "missing-chest";
        break;
      }
      case "add-to-existing-stacks": result = this.containers.addToExistingStacks(state, command.objectId); break;
      case "sort-container": result = this.containers.sort(state, command.objectId); break;
      case "set-chest-color": result = this.containers.setColor(state, command.objectId, command.colorId); break;
      case "recover-empty-chest": {
        if (command.itemId !== "" && (getItemDefinition(command.itemId)?.category !== "tool" || this.inventory.quantity(state.inventory, command.itemId) < 1)) return storageFeedback("missing-item");
        result = this.objects.recoverChest(state, command.objectId); break;
      }
      case "push-chest": {
        if (![ITEM_ID.axe, ITEM_ID.pickaxe, ITEM_ID.hoe].some((itemId) => itemId === command.itemId)
          || command.itemId === "" || this.inventory.quantity(state.inventory, command.itemId) < 1) return storageFeedback("wrong-tool");
        result = this.objects.pushChest(state, command.objectId, "player", command.facing, npcs); break;
      }
      case "collect-world-drop": result = this.drops.collect(state, command.dropId); break;
      case "ship-item":
      case "reclaim-last-shipment": {
        const bin = state.worldObjects.find((object) => object.id === command.objectId && object.kind === "shipping-bin");
        if (!bin || !this.canInteract(state, bin.id)) return storageFeedback("too-far");
        result = command.type === "ship-item" ? this.shipping.deposit(state, command.sourceIndex, command.quantity) : this.shipping.reclaim(state);
        if (result === "shipped") {
          const shipment = state.shippingQueue.at(-1)!;
          return { tone: "success", code: "storage-shipped", message: `已投入 ${shipment.quantity} 份${getItemDefinition(shipment.itemId)!.name}，睡觉后结算。` };
        }
        break;
      }
      case "build-shipping-bin": result = this.building.build(state, npcs, command.interactionId, command.column, command.row); break;
      case "move-farm-building": result = this.building.move(state, npcs, command.interactionId, command.objectId, command.column, command.row); break;
      case "demolish-farm-building": result = this.building.demolish(state, npcs, command.interactionId, command.objectId); break;
      case "dismiss-day-settlement": state.unacknowledgedShippingReport = null; result = "report-acknowledged"; break;
      case "retry-storage-save": return storageFeedback("unchanged");
    }
    return storageFeedback(result, command.type);
  }
}

/** Maps closed rule outcomes to player-facing feedback, preserving error results without committing a candidate. */
function storageFeedback(result: string, commandType?: string): ActionFeedback {
  const success: Readonly<Record<string, string>> = {
    changed: commandType === "rotate-hotbar-row" ? "已切换快捷栏。" : "整理好了。",
    success: "制作完成，物品已放入背包。", "upgraded-backpack": "背包已扩容。",
    placed: "储物箱放好了。", recovered: "已收回空箱。", pushed: "箱子已移开，物品仍在里面。",
    collected: "已拾取物品。", shipped: "已投入出货箱，睡觉后结算。", reclaimed: "已取回最后一笔投入。",
    built: "出货箱建好了。", moved: "出货箱已移动。", demolished: "已拆除出货箱。", "report-acknowledged": "新的一天开始了。",
  };
  const errors: Readonly<Record<string, string>> = {
    "invalid-transfer": "目标格无法完整接收所选物品。", "invalid-slot": "请选择一个有效物品格。", unchanged: "当前无需更改。",
    "inventory-full": "背包放不下，请先留出位置。", "target-full": "目标格放不下制作产物，材料尚未消耗。",
    "requirements-not-met": "制作材料不足。", "unknown-recipe": "尚未掌握这个配方。", "invalid-quantity": "请选择有效制作数量。",
    "not-shippable": "这件物品不能出货。", empty: "没有可以取回的投入。", "not-empty": "非空箱不能回收，可以用斧、镐或锄移动。",
    "wrong-tool": "请用斧、镐或锄移动非空箱。", "missing-item": "所需物品已不在背包中。",
    blocked: "这个位置有阻挡，操作尚未执行。", "too-far": "走近目标再操作。", "last-shipping-bin": "农场至少需要保留一个出货箱。",
    "service-unavailable": "墨子现在不在柜台提供服务。", "insufficient-gold": "金币不足。", "insufficient-wood": "木材不足。",
    "backpack-upgrade-unavailable": "请到种子店的背包陈列前购买。", "backpack-already-upgraded": "背包已扩展到最大容量。",
    "backpack-upgrade-insufficient-gold": "金币不足，先积攒下一档背包费用。", "invalid-color": "请选择有效箱子颜色。",
  };
  const message = success[result];
  return { tone: message ? "success" : "error", code: `storage-${result}`, message: message ?? errors[result] ?? "目标已变化，请重新选择。" };
}
