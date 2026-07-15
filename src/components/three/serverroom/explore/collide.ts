import { PLAYER_RADIUS, type WallRect } from "./layout";

/**
 * Circle-vs-AABB slide resolution, one axis at a time: try the x move, veto
 * it if the expanded rect swallows the point, then try z. Cheap (≤ ~25 rects)
 * and can't tunnel at walk speeds since dt-step < wall thickness.
 */

function blocked(x: number, z: number, rects: WallRect[]): boolean {
  for (const r of rects) {
    if (
      x > r.xMin - PLAYER_RADIUS &&
      x < r.xMax + PLAYER_RADIUS &&
      z > r.zMin - PLAYER_RADIUS &&
      z < r.zMax + PLAYER_RADIUS
    ) {
      return true;
    }
  }
  return false;
}

/** Returns the final position after sliding along whatever walls were hit. */
export function slideMove(
  x: number,
  z: number,
  dx: number,
  dz: number,
  rects: WallRect[],
): { x: number; z: number } {
  let nx = x + dx;
  if (blocked(nx, z, rects)) nx = x;
  let nz = z + dz;
  if (blocked(nx, nz, rects)) nz = z;
  return { x: nx, z: nz };
}
