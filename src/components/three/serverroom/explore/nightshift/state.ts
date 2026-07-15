/**
 * MOKSA.CLOUD (SHIFT MALAM) — mutable fast-lane state for the hidden horror
 * mode. Same pattern as explore/store.ts's `player`/`input` singletons: the
 * frame loop mutates freely, React reads via the explore store's `night*`
 * fields (this module must stay three-free so the eager store can import it).
 *
 * Lore: MOKSA.CLOUD "preserves" ancestors digitally; while an archive is
 * stored, its arwah cannot moksa. The night operator's job is to DELETE —
 * a digital ngaben, one rack at a time — while Bu Dewi Kirana objects.
 */

export interface ArsipDef {
  id: `arsip:${string}`;
  label: string;
  x: number;
  z: number;
}

/** Seven archives across all three zones — the purge route IS the map tour. */
export const ARSIP_RACKS: ArsipDef[] = [
  { id: "arsip:penari", label: "ARSIP 001 — PENARI, 1963", x: -1.5, z: -3 },
  { id: "arsip:pemangku", label: "ARSIP 014 — PEMANGKU, 1977", x: 1.4, z: -20 },
  { id: "arsip:pantai", label: "ARSIP 098 — ANAK PANTAI, 1998", x: -1.5, z: -33 },
  { id: "arsip:ibu", label: "ARSIP 121 — IBU, 2004", x: 5, z: -12.4 },
  { id: "arsip:penenun", label: "ARSIP 133 — PENENUN, 2009", x: 12, z: -12.4 },
  { id: "arsip:nelayan", label: "ARSIP 152 — NELAYAN, 2015", x: 13, z: -21 },
  { id: "arsip:operator", label: "ARSIP 166 — OPERATOR SHIFT TIGA", x: 21, z: -14.5 },
];

export const RITUAL_MS = 3000; // hold-still duration per purge
export const RITUAL_MOVE_TOL = 0.35; // drift past this cancels the ritual

/** Kirana rests deep in CORE; the ghost haunts the far end of Aisle-A. */
export const KIRANA_SPAWN = { x: 20.5, z: -22.5 };
export const GHOST_SPAWN = { x: -1.2, z: -26 };

export const night = {
  /** Headlamp state — the VHS ghost is drawn to light. L toggles. */
  lamp: true,
  /** Ghost contact forces the lamp dark until this epoch (ms). */
  lampLockUntil: 0,
  kirana: { x: KIRANA_SPAWN.x, z: KIRANA_SPAWN.z, yaw: 0 },
  ghost: { x: GHOST_SPAWN.x, z: GHOST_SPAWN.z, fade: 0 },
  /** Where the active ritual was started (movement-cancel anchor). */
  purgeAnchor: { x: 0, z: 0 },
};

export function resetNight() {
  night.lamp = true;
  night.lampLockUntil = 0;
  night.kirana = { x: KIRANA_SPAWN.x, z: KIRANA_SPAWN.z, yaw: 0 };
  night.ghost = { x: GHOST_SPAWN.x, z: GHOST_SPAWN.z, fade: 0 };
}

export function lampIsOn(now: number): boolean {
  return night.lamp && now >= night.lampLockUntil;
}
