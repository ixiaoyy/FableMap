import EasyStar from "easystarjs";
import type {
  CollisionGrid,
  WorldPoint,
} from "./regions.ts";

interface GridPoint {
  readonly x: number;
  readonly y: number;
}

/** Finds one synchronous four-direction route while treating supplied transient world points as blocked tiles. */
export function findNpcPath(
  collision: CollisionGrid,
  start: WorldPoint,
  end: WorldPoint,
  avoidedPoints: readonly WorldPoint[] = [],
): readonly WorldPoint[] | null {
  const startTile = worldToTile(collision, start);
  const endTile = worldToTile(collision, end);
  const finder = new EasyStar.js();
  finder.enableSync();
  finder.disableDiagonals();
  finder.setGrid(toPathfinderGrid(collision));
  finder.setAcceptableTiles(0);
  for (const point of avoidedPoints) {
    const tile = worldToTile(collision, point);
    finder.avoidAdditionalPoint(tile.x, tile.y);
  }
  let gridPath: readonly GridPoint[] | null | undefined;
  finder.findPath(startTile.x, startTile.y, endTile.x, endTile.y, (path) => {
    gridPath = path;
  });
  finder.calculate();
  if (gridPath === undefined) throw new Error("NPC pathfinder did not complete synchronously.");
  if (gridPath === null) return null;
  if (gridPath.length === 0) return distinctPoints([start, end]);
  const tileCenters = simplifyGridPath(gridPath).map((point) => tileCenter(collision, point));
  return distinctPoints([start, ...tileCenters, end]);
}

/** Converts the flat immutable Collision grid to EasyStar's mutable row-major numeric grid. */
function toPathfinderGrid(collision: CollisionGrid): number[][] {
  return Array.from({ length: collision.rows }, (_, row) => (
    Array.from({ length: collision.columns }, (_, column) => (
      collision.blocked[row * collision.columns + column] ? 1 : 0
    ))
  ));
}

/** Resolves one in-bounds world point to its owning Collision tile. */
function worldToTile(collision: CollisionGrid, point: WorldPoint): GridPoint {
  const x = Math.floor(point.x / collision.tileWidth);
  const y = Math.floor(point.y / collision.tileHeight);
  if (x < 0 || y < 0 || x >= collision.columns || y >= collision.rows) {
    throw new Error("NPC path endpoint is outside the Collision grid.");
  }
  return { x, y };
}

/** Converts one Collision tile index to its exact world-space center. */
function tileCenter(collision: CollisionGrid, point: GridPoint): WorldPoint {
  return {
    x: point.x * collision.tileWidth + collision.tileWidth / 2,
    y: point.y * collision.tileHeight + collision.tileHeight / 2,
  };
}

/** Removes only collinear grid nodes while retaining every direction change and both endpoints. */
function simplifyGridPath(path: readonly GridPoint[]): readonly GridPoint[] {
  if (path.length <= 2) return path;
  const result: GridPoint[] = [path[0]!];
  for (let index = 1; index < path.length - 1; index += 1) {
    const previous = path[index - 1]!;
    const current = path[index]!;
    const next = path[index + 1]!;
    const incomingX = current.x - previous.x;
    const incomingY = current.y - previous.y;
    const outgoingX = next.x - current.x;
    const outgoingY = next.y - current.y;
    if (incomingX !== outgoingX || incomingY !== outgoingY) result.push(current);
  }
  result.push(path[path.length - 1]!);
  return result;
}

/** Drops consecutive duplicate world points without changing route order. */
function distinctPoints(points: readonly WorldPoint[]): readonly WorldPoint[] {
  const result: WorldPoint[] = [];
  for (const point of points) {
    const previous = result[result.length - 1];
    if (!previous || previous.x !== point.x || previous.y !== point.y) result.push({ ...point });
  }
  return result;
}
